import mysql from "mysql2/promise"

// Debug environment variables
console.log("🔍 Database Environment Variables:")
console.log("DB_HOST:", process.env.DB_HOST || "NOT SET")
console.log("DB_USER:", process.env.DB_USER || "NOT SET")
console.log("DB_NAME:", process.env.DB_NAME || "NOT SET")
console.log("DB_PORT:", process.env.DB_PORT || "NOT SET")

// Database connection configuration with multiple connection options
const dbConfig = {
  host: process.env.DB_HOST || "144.172.89.77",
  user: process.env.DB_USER || "pes_user",
  password: process.env.DB_PASSWORD || "@Root_root",
  database: process.env.DB_NAME || "pes_tournament_db",
  port: Number.parseInt(process.env.DB_PORT || "3306"),
  ssl: false,
  connectionLimit: 5,
  waitForConnections: true,
  queueLimit: 0,
  acquireTimeout: 15000,
  timeout: 15000,
  reconnect: true,
  connectTimeout: 15000,
}

// console.log("🔧 Final Database Config:")
// console.log("Host:", dbConfig.host)
// console.log("User:", dbConfig.user)
// console.log("Database:", dbConfig.database)
// console.log("Port:", dbConfig.port)

// Create connection pool with error handling
let pool: mysql.Pool | null = null
let connectionStatus = "disconnected"

// Only create pool if we're not in build mode
const isBuildTime = process.env.NODE_ENV === "production" && !process.env.VERCEL_URL && !process.env.RUNTIME_ENV

if (!isBuildTime) {
  try {
    pool = mysql.createPool(dbConfig)
    console.log("✅ Database pool created successfully")

    // Test initial connection
    testConnection().then((connected) => {
      connectionStatus = connected ? "connected" : "failed"
    })
  } catch (error) {
    console.error("❌ Failed to create database pool:", error)
    connectionStatus = "failed"
  }
} else {
  console.log("⚠️ Skipping database pool creation during build")
  connectionStatus = "build-time"
}

// Test database connection with better error handling and retry logic
export async function testConnection(retries = 3): Promise<boolean> {
  if (isBuildTime) {
    console.log("⚠️ Skipping database test during build time")
    return false
  }

  if (!pool) {
    console.log("⚠️ Database pool not available")
    return false
  }

  for (let attempt = 1; attempt <= retries; attempt++) {
    try {
      console.log(`🔄 Database connection attempt ${attempt}/${retries}`)
      const connection = await pool.getConnection()
      await connection.ping()
      connection.release()
      console.log("✅ Database connected successfully")
      connectionStatus = "connected"
      return true
    } catch (error) {
      console.error(`❌ Database connection attempt ${attempt} failed:`, error)

      if (attempt === retries) {
        connectionStatus = "failed"
        console.error("❌ All database connection attempts failed")

        // Log specific error details
        if (error instanceof Error) {
          if (error.message.includes("ECONNREFUSED")) {
            console.error("🚫 Connection refused - Database server may be down or firewall blocking")
          } else if (error.message.includes("ETIMEDOUT")) {
            console.error("⏰ Connection timeout - Network or server issues")
          } else if (error.message.includes("ENOTFOUND")) {
            console.error("🔍 Host not found - Check database host address")
          } else if (error.message.includes("Access denied")) {
            console.error("🔐 Access denied - Check database credentials")
          } else if (error.message.includes("ER_HOST_NOT_PRIVILEGED")) {
            console.error("🚫 Host not allowed - MySQL user needs permission for external connections")
            console.error("💡 Fix: Grant privileges to user from '%' or specific Vercel IPs")
          }
        }
      } else {
        // Wait before retry
        await new Promise((resolve) => setTimeout(resolve, 2000))
      }
    }
  }

  return false
}

// Get connection status
export function getConnectionStatus() {
  return connectionStatus
}

// Add connection check helper with better error messages
function ensureConnection() {
  if (isBuildTime) {
    throw new Error("Database operations not available during build time")
  }
  if (!pool) {
    throw new Error("Database connection pool not available")
  }
  if (connectionStatus === "failed") {
    throw new Error("Database connection failed - server may be unreachable or host not allowed")
  }
}

// Enhanced connection wrapper with retry logic
async function withConnection<T>(operation: (connection: mysql.PoolConnection) => Promise<T>): Promise<T> {
  ensureConnection()

  let connection: mysql.PoolConnection | null = null
  let lastError: Error | null = null

  // Try to get connection with retries
  for (let attempt = 1; attempt <= 3; attempt++) {
    try {
      connection = await pool!.getConnection()
      break
    } catch (error) {
      lastError = error as Error
      console.error(`Failed to get database connection (attempt ${attempt}/3):`, error)

      if (attempt < 3) {
        await new Promise((resolve) => setTimeout(resolve, 1000))
      }
    }
  }

  if (!connection) {
    throw new Error(`Failed to get database connection after 3 attempts: ${lastError?.message}`)
  }

  try {
    return await operation(connection)
  } finally {
    connection.release()
  }
}

// User management functions with enhanced error handling
export async function createUser(userData: {
  email: string
  password_hash: string
  name: string
  phone: string
  gamertag: string
  role: "player" | "organizer" | "manager" | "admin"
}) {
  return withConnection(async (connection) => {
    const [result] = await connection.execute(
      `INSERT INTO users (email, password_hash, name, phone, gamertag, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userData.email, userData.password_hash, userData.name, userData.phone, userData.gamertag, userData.role],
    )

    const insertResult = result as mysql.ResultSetHeader

    // Create default settings for the new user
    await connection.execute(`INSERT INTO user_settings (user_id) VALUES (?)`, [insertResult.insertId])

    // Get the created user
    const [users] = await connection.execute(
      "SELECT id, email, name, phone, gamertag, role, created_at FROM users WHERE id = ?",
      [insertResult.insertId],
    )

    return (users as any[])[0]
  })
}

export async function getUserByEmail(email: string) {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute("SELECT * FROM users WHERE email = ? AND is_active = 1", [email])
    return (rows as any[])[0] || null
  })
}

export async function getUserByGamertag(gamertag: string) {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute("SELECT * FROM users WHERE gamertag = ? AND is_active = 1", [gamertag])
    return (rows as any[])[0] || null
  })
}

export async function getUserById(id: number) {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      "SELECT id, email, name, phone, gamertag, role, profile_image, created_at FROM users WHERE id = ? AND is_active = 1",
      [id],
    )
    return (rows as any[])[0] || null
  })
}

// User Settings Management
export async function getUserSettings(userId: number) {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT 
        email_tournaments, email_matches, email_marketing,
        sms_tournaments, sms_matches, push_notifications,
        language, timezone, theme, currency,
        profile_visibility, show_stats, show_earnings, allow_friend_requests
       FROM user_settings 
       WHERE user_id = ?`,
      [userId],
    )

    const settings = (rows as any[])[0]

    if (!settings) {
      // Create default settings if none exist
      await connection.execute(`INSERT INTO user_settings (user_id) VALUES (?)`, [userId])

      // Return default settings
      return {
        notifications: {
          email_tournaments: true,
          email_matches: true,
          email_marketing: false,
          sms_tournaments: true,
          sms_matches: false,
          push_notifications: false,
        },
        preferences: {
          language: "en",
          timezone: "Africa/Nairobi",
          theme: "system",
          currency: "KES",
        },
        privacy: {
          profile_visibility: "public",
          show_stats: true,
          show_earnings: false,
          allow_friend_requests: true,
        },
      }
    }

    return {
      notifications: {
        email_tournaments: Boolean(settings.email_tournaments),
        email_matches: Boolean(settings.email_matches),
        email_marketing: Boolean(settings.email_marketing),
        sms_tournaments: Boolean(settings.sms_tournaments),
        sms_matches: Boolean(settings.sms_matches),
        push_notifications: Boolean(settings.push_notifications),
      },
      preferences: {
        language: settings.language,
        timezone: settings.timezone,
        theme: settings.theme,
        currency: settings.currency,
      },
      privacy: {
        profile_visibility: settings.profile_visibility,
        show_stats: Boolean(settings.show_stats),
        show_earnings: Boolean(settings.show_earnings),
        allow_friend_requests: Boolean(settings.allow_friend_requests),
      },
    }
  })
}

export async function updateUserSettings(
  userId: number,
  settings: {
    notifications: {
      email_tournaments: boolean
      email_matches: boolean
      email_marketing: boolean
      sms_tournaments: boolean
      sms_matches: boolean
      push_notifications: boolean
    }
    preferences: {
      language: string
      timezone: string
      theme: string
      currency: string
    }
    privacy: {
      profile_visibility: string
      show_stats: boolean
      show_earnings: boolean
      allow_friend_requests: boolean
    }
  },
) {
  return withConnection(async (connection) => {
    await connection.execute(
      `UPDATE user_settings SET
        email_tournaments = ?, email_matches = ?, email_marketing = ?,
        sms_tournaments = ?, sms_matches = ?, push_notifications = ?,
        language = ?, timezone = ?, theme = ?, currency = ?,
        profile_visibility = ?, show_stats = ?, show_earnings = ?, allow_friend_requests = ?,
        updated_at = CURRENT_TIMESTAMP
       WHERE user_id = ?`,
      [
        settings.notifications.email_tournaments,
        settings.notifications.email_matches,
        settings.notifications.email_marketing,
        settings.notifications.sms_tournaments,
        settings.notifications.sms_matches,
        settings.notifications.push_notifications,
        settings.preferences.language,
        settings.preferences.timezone,
        settings.preferences.theme,
        settings.preferences.currency,
        settings.privacy.profile_visibility,
        settings.privacy.show_stats,
        settings.privacy.show_earnings,
        settings.privacy.allow_friend_requests,
        userId,
      ],
    )

    return true
  })
}

// Password Reset Token Management
export async function createPasswordResetToken(userId: number, token: string, expiresAt: Date) {
  return withConnection(async (connection) => {
    // Invalidate any existing tokens for this user
    await connection.execute(`UPDATE password_reset_tokens SET used = TRUE WHERE user_id = ? AND used = FALSE`, [
      userId,
    ])

    // Create new token
    const [result] = await connection.execute(
      `INSERT INTO password_reset_tokens (user_id, token, expires_at) VALUES (?, ?, ?)`,
      [userId, token, expiresAt],
    )

    return (result as mysql.ResultSetHeader).insertId
  })
}

export async function validatePasswordResetToken(token: string) {
  return withConnection(async (connection) => {
    const [rows] = await connection.execute(
      `SELECT prt.*, u.email, u.id as user_id 
       FROM password_reset_tokens prt
       JOIN users u ON prt.user_id = u.id
       WHERE prt.token = ? AND prt.used = FALSE AND prt.expires_at > NOW()`,
      [token],
    )

    return (rows as any[])[0] || null
  })
}

export async function usePasswordResetToken(token: string) {
  return withConnection(async (connection) => {
    await connection.execute(`UPDATE password_reset_tokens SET used = TRUE WHERE token = ?`, [token])
  })
}

// Update user password
export async function updateUserPassword(userId: number, passwordHash: string) {
  return withConnection(async (connection) => {
    await connection.execute(`UPDATE users SET password_hash = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?`, [
      passwordHash,
      userId,
    ])
  })
}

// Update user profile
export async function updateUserProfile(
  userId: number,
  profileData: {
    name?: string
    phone?: string
    gamertag?: string
    profile_image?: string
  },
) {
  return withConnection(async (connection) => {
    const updateFields: string[] = []
    const updateValues: any[] = []

    if (profileData.name !== undefined) {
      updateFields.push("name = ?")
      updateValues.push(profileData.name)
    }
    if (profileData.phone !== undefined) {
      updateFields.push("phone = ?")
      updateValues.push(profileData.phone)
    }
    if (profileData.gamertag !== undefined) {
      updateFields.push("gamertag = ?")
      updateValues.push(profileData.gamertag)
    }
    if (profileData.profile_image !== undefined) {
      updateFields.push("profile_image = ?")
      updateValues.push(profileData.profile_image)
    }

    if (updateFields.length === 0) {
      throw new Error("No fields to update")
    }

    updateFields.push("updated_at = CURRENT_TIMESTAMP")
    updateValues.push(userId)

    await connection.execute(`UPDATE users SET ${updateFields.join(", ")} WHERE id = ?`, updateValues)

    // Return updated user
    return getUserById(userId)
  })
}

// Dashboard statistics functions
export async function getUserStats(userId: number) {
  return withConnection(async (connection) => {
    // Get user's tournament participation stats
    const [tournamentStats] = await connection.execute(
      `SELECT 
        COUNT(DISTINCT tr.tournament_id) as tournaments_joined,
        COUNT(DISTINCT CASE WHEN t.status = 'ongoing' THEN tr.tournament_id END) as active_tournaments,
        COALESCE(SUM(tr.entry_fee), 0) as total_spent
       FROM tournament_registrations tr
       LEFT JOIN tournaments t ON tr.tournament_id = t.id
       WHERE tr.player_id = ? AND tr.payment_status = 'completed'`,
      [userId],
    )

    // Get user's match stats
    const [matchStats] = await connection.execute(
      `SELECT 
        COUNT(*) as total_matches,
        COUNT(CASE WHEN winner_id = ? THEN 1 END) as wins,
        COUNT(CASE WHEN (player1_id = ? OR player2_id = ?) AND winner_id IS NOT NULL THEN 1 END) as completed_matches
       FROM matches 
       WHERE (player1_id = ? OR player2_id = ?) AND status = 'completed'`,
      [userId, userId, userId, userId, userId],
    )

    // Get user's earnings
    const [earnings] = await connection.execute(
      `SELECT COALESCE(SUM(amount), 0) as total_earnings
       FROM payouts 
       WHERE user_id = ? AND status = 'completed'`,
      [userId],
    )

    const tournamentData = (tournamentStats as any[])[0]
    const matchData = (matchStats as any[])[0]
    const earningsData = (earnings as any[])[0]

    const winRate =
      matchData.completed_matches > 0 ? Math.round((matchData.wins / matchData.completed_matches) * 100) : 0

    return {
      tournaments_joined: tournamentData.tournaments_joined || 0,
      active_tournaments: tournamentData.active_tournaments || 0,
      total_spent: tournamentData.total_spent || 0,
      total_matches: matchData.total_matches || 0,
      wins: matchData.wins || 0,
      win_rate: winRate,
      total_earnings: earningsData.total_earnings || 0,
    }
  })
}

export async function getOrganizerStats(userId: number) {
  return withConnection(async (connection) => {
    // Get organizer's tournament stats
    const [tournamentStats] = await connection.execute(
      `SELECT 
        COUNT(*) as total_tournaments,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as active_tournaments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tournaments,
        COALESCE(SUM(entry_fee * max_players), 0) as potential_revenue
       FROM tournaments 
       WHERE organizer_id = ?`,
      [userId],
    )

    // Get total participants across all tournaments
    const [participantStats] = await connection.execute(
      `SELECT COUNT(DISTINCT tr.user_id) as total_participants
       FROM tournaments t
       LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id
       WHERE t.organizer_id = ? AND tr.payment_status = 'completed'`,
      [userId],
    )

    // Get actual revenue
    const [revenueStats] = await connection.execute(
      `SELECT COALESCE(SUM(tr.entry_fee), 0) as actual_revenue
       FROM tournaments t
       LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id
       WHERE t.organizer_id = ? AND tr.payment_status = 'completed'`,
      [userId],
    )

    const tournamentData = (tournamentStats as any[])[0]
    const participantData = (participantStats as any[])[0]
    const revenueData = (revenueStats as any[])[0]

    return {
      total_tournaments: tournamentData.total_tournaments || 0,
      active_tournaments: tournamentData.active_tournaments || 0,
      completed_tournaments: tournamentData.completed_tournaments || 0,
      total_participants: participantData.total_participants || 0,
      actual_revenue: revenueData.actual_revenue || 0,
      potential_revenue: tournamentData.potential_revenue || 0,
    }
  })
}

export async function getAdminStats() {
  return withConnection(async (connection) => {
    // Get platform-wide stats
    const [userStats] = await connection.execute(
      `SELECT 
        COUNT(*) as total_users,
        COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_users,
        COUNT(CASE WHEN role = 'player' THEN 1 END) as total_players,
        COUNT(CASE WHEN role = 'organizer' THEN 1 END) as total_organizers
       FROM users`,
    )

    const [tournamentStats] = await connection.execute(
      `SELECT 
        COUNT(*) as total_tournaments,
        COUNT(CASE WHEN status = 'ongoing' THEN 1 END) as active_tournaments,
        COUNT(CASE WHEN status = 'completed' THEN 1 END) as completed_tournaments
       FROM tournaments`,
    )

    const [revenueStats] = await connection.execute(
      `SELECT 
        COALESCE(SUM(entry_fee), 0) as total_revenue,
        COALESCE(SUM(CASE WHEN MONTH(created_at) = MONTH(CURRENT_DATE()) THEN entry_fee ELSE 0 END), 0) as monthly_revenue
       FROM tournament_registrations 
       WHERE payment_status = 'completed'`,
    )

    const [disputeStats] = await connection.execute(
      `SELECT COUNT(*) as pending_disputes
       FROM disputes 
       WHERE status = 'pending'`,
    )

    const userData = (userStats as any[])[0]
    const tournamentData = (tournamentStats as any[])[0]
    const revenueData = (revenueStats as any[])[0]
    const disputeData = (disputeStats as any[])[0]

    return {
      total_users: userData.total_users || 0,
      active_users: userData.active_users || 0,
      total_players: userData.total_players || 0,
      total_organizers: userData.total_organizers || 0,
      total_tournaments: tournamentData.total_tournaments || 0,
      active_tournaments: tournamentData.active_tournaments || 0,
      completed_tournaments: tournamentData.completed_tournaments || 0,
      total_revenue: revenueData.total_revenue || 0,
      monthly_revenue: revenueData.monthly_revenue || 0,
      pending_disputes: disputeData.pending_disputes || 0,
    }
  })
}

// Get recent activity for dashboard
export async function getRecentActivity(userId: number, role: string, limit = 10) {
  return withConnection(async (connection) => {
    let query = ""
    let params: any[] = []

    if (role === "admin") {
      // Admin sees all platform activity
      query = `
        SELECT 'user_registration' as type, u.name as description, u.created_at as timestamp
        FROM users u
        WHERE u.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION ALL
        SELECT 'tournament_created' as type, CONCAT('Tournament "', t.name, '" created') as description, t.created_at as timestamp
        FROM tournaments t
        WHERE t.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        UNION ALL
        SELECT 'payment_processed' as type, CONCAT('Payment of KSh ', tr.entry_fee, ' processed') as description, tr.created_at as timestamp
        FROM tournament_registrations tr
        WHERE tr.payment_status = 'completed' AND tr.created_at >= DATE_SUB(NOW(), INTERVAL 7 DAY)
        ORDER BY timestamp DESC
        LIMIT ?
      `
      params = [limit]
    } else if (role === "organizer") {
      // Organizer sees their tournament activity // --- ORGANIZER (fixed user_id → player_id) ---
      query = `
        SELECT 'tournament_registration' AS type,
               CONCAT(u.name, ' joined "', t.name, '"') AS description,
               tr.created_at AS timestamp
        FROM   tournament_registrations tr
        JOIN   tournaments t ON tr.tournament_id = t.id
        JOIN   users u       ON tr.player_id = u.id
        WHERE  t.organizer_id = ? AND tr.payment_status = 'completed'
        UNION ALL
        SELECT 'match_completed' AS type,
               CONCAT('Match completed in "', t.name, '"') AS description,
               m.updated_at AS timestamp
        FROM   matches m
        JOIN   tournaments t ON m.tournament_id = t.id
        WHERE  t.organizer_id = ? AND m.status = 'completed'
        ORDER BY timestamp DESC
        LIMIT ?
      `
      params = [userId, userId, limit]
    } else {
      // Player sees their activity
      query = `
        SELECT * FROM (
          SELECT 'tournament_joined' as type,
                 CONCAT('Joined "', t.name, '"') as description,
                 tr.created_at as timestamp
          FROM tournament_registrations tr
          JOIN tournaments t ON tr.tournament_id = t.id
          WHERE tr.player_id = ? AND tr.payment_status = 'completed'

          UNION ALL

          SELECT 'match_result' as type, 
                 CASE WHEN m.winner_id = ? THEN 'Won match' ELSE 'Lost match' END as description,
                 m.updated_at as timestamp
          FROM matches m
          WHERE (m.player1_id = ? OR m.player2_id = ?) AND m.status = 'completed'
        ) AS combined
        ORDER BY timestamp DESC
        LIMIT ?
      `

      params = [userId, userId, userId, userId, limit]
      console.log("Params:", params)
    }

    const [rows] = await connection.execute(query, params)
    console.log("Params:", params)
    // Should look like: [23, 23, 23, 23, 5]
    return rows as any[]
  })
}

// Tournament management functions with enhanced error handling
export async function getTournaments(
  filters: {
    status?: string
    format?: string
    search?: string
    limit?: number
    offset?: number
    organizer_id?: number
  } = {},
) {
  return withConnection(async (connection) => {
    let query = `
      SELECT t.*, u.name as organizer_name,
             COUNT(tr.id) as current_players,
             (t.entry_fee * COUNT(tr.id)) as current_prize_pool
      FROM tournaments t
      LEFT JOIN users u ON t.organizer_id = u.id
      LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id 
                                            AND tr.payment_status = 'completed'
      WHERE t.status != 'cancelled'
    `

    const params: any[] = []

    if (filters.organizer_id) {
      query += " AND t.organizer_id = ?"
      params.push(filters.organizer_id)
    }

    if (filters.status && filters.status !== "all") {
      query += " AND t.status = ?"
      params.push(filters.status)
    }

    if (filters.format && filters.format !== "all") {
      query += " AND t.format = ?"
      params.push(filters.format)
    }

    if (filters.search) {
      query += " AND (t.name LIKE ? OR t.description LIKE ?)"
      params.push(`%${filters.search}%`, `%${filters.search}%`)
    }

    query += " GROUP BY t.id, u.name ORDER BY t.created_at DESC"

    if (filters.limit) {
      query += " LIMIT ?"
      params.push(filters.limit)
    }

    if (filters.offset) {
      query += " OFFSET ?"
      params.push(filters.offset)
    }

    const [rows] = await connection.execute(query, params)
    return rows as any[]
  })
}

export async function createTournament(tournamentData: {
  name: string
  description?: string
  organizer_id: number
  format: string
  max_players: number
  entry_fee: number
  registration_deadline: string
  start_date: string
  rules?: string
  require_screenshots?: boolean
  allow_disputes?: boolean
}) {
  return withConnection(async (connection) => {
    const [result] = await connection.execute(
      `INSERT INTO tournaments (
        name, description, organizer_id, format, max_players, entry_fee,
        registration_deadline, start_date, rules, require_screenshots, allow_disputes, status
      ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, 'registration')`,
      [
        tournamentData.name,
        tournamentData.description || "",
        tournamentData.organizer_id,
        tournamentData.format,
        tournamentData.max_players,
        tournamentData.entry_fee,
        tournamentData.registration_deadline,
        tournamentData.start_date,
        tournamentData.rules || "",
        tournamentData.require_screenshots ?? true,
        tournamentData.allow_disputes ?? true,
      ],
    )

    const insertResult = result as mysql.ResultSetHeader

    // Get the created tournament
    const [tournaments] = await connection.execute("SELECT * FROM tournaments WHERE id = ?", [insertResult.insertId])

    return (tournaments as any[])[0]
  })
}

// Close pool when application shuts down
if (typeof process !== "undefined" && process?.on && typeof window === "undefined") {
  process.on("SIGINT", async () => {
    if (pool && typeof pool.end === "function") {
      console.log("🔄 Closing database pool...")
      await pool.end()
      console.log("✅ Database pool closed")
    }
    process.exit(0)
  })
}

export default pool
