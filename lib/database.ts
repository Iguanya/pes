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

console.log("🔧 Final Database Config:")
console.log("Host:", dbConfig.host)
console.log("User:", dbConfig.user)
console.log("Database:", dbConfig.database)
console.log("Port:", dbConfig.port)

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
  role: "player" | "organizer"
}) {
  return withConnection(async (connection) => {
    const [result] = await connection.execute(
      `INSERT INTO users (email, password_hash, name, phone, gamertag, role) 
       VALUES (?, ?, ?, ?, ?, ?)`,
      [userData.email, userData.password_hash, userData.name, userData.phone, userData.gamertag, userData.role],
    )

    const insertResult = result as mysql.ResultSetHeader

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

// Tournament management functions with enhanced error handling
export async function getTournaments(
  filters: {
    status?: string
    format?: string
    search?: string
    limit?: number
    offset?: number
  } = {},
) {
  return withConnection(async (connection) => {
    let query = `
      SELECT t.*, u.name as organizer_name,
             COUNT(tr.id) as current_players
      FROM tournaments t
      LEFT JOIN users u ON t.organizer_id = u.id
      LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id 
                                            AND tr.payment_status = 'completed'
      WHERE t.status != 'cancelled'
    `

    const params: any[] = []

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
process.on("SIGINT", async () => {
  if (pool && typeof pool.end === "function") {
    console.log("🔄 Closing database pool...")
    await pool.end()
    console.log("✅ Database pool closed")
  }
  process.exit(0)
})

export default pool
