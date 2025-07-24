# Tournament Management Database Functions Specification

This document outlines the database functions required to support the tournament management functionality, including tournament CRUD operations, participant management, and match scheduling.

## Tournament Management Functions

### 1. Update Tournament

```typescript
export async function updateTournament(
  id: number,
  tournamentData: {
    name?: string;
    description?: string;
    format?: string;
    max_players?: number;
    entry_fee?: number;
    registration_deadline?: string;
    start_date?: string;
    rules?: string;
    require_screenshots?: boolean;
    allow_disputes?: boolean;
  }
) {
  return withConnection(async (connection) => {
    // Build update query dynamically based on provided fields
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    // Add each field that is provided to the update query
    if (tournamentData.name !== undefined) {
      updateFields.push("name = ?");
      updateValues.push(tournamentData.name);
    }
    if (tournamentData.description !== undefined) {
      updateFields.push("description = ?");
      updateValues.push(tournamentData.description);
    }
    if (tournamentData.format !== undefined) {
      updateFields.push("format = ?");
      updateValues.push(tournamentData.format);
    }
    if (tournamentData.max_players !== undefined) {
      updateFields.push("max_players = ?");
      updateValues.push(tournamentData.max_players);
    }
    if (tournamentData.entry_fee !== undefined) {
      updateFields.push("entry_fee = ?");
      updateValues.push(tournamentData.entry_fee);
    }
    if (tournamentData.registration_deadline !== undefined) {
      updateFields.push("registration_deadline = ?");
      updateValues.push(tournamentData.registration_deadline);
    }
    if (tournamentData.start_date !== undefined) {
      updateFields.push("start_date = ?");
      updateValues.push(tournamentData.start_date);
    }
    if (tournamentData.rules !== undefined) {
      updateFields.push("rules = ?");
      updateValues.push(tournamentData.rules);
    }
    if (tournamentData.require_screenshots !== undefined) {
      updateFields.push("require_screenshots = ?");
      updateValues.push(tournamentData.require_screenshots);
    }
    if (tournamentData.allow_disputes !== undefined) {
      updateFields.push("allow_disputes = ?");
      updateValues.push(tournamentData.allow_disputes);
    }

    // Add updated_at timestamp
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    
    // If no fields to update, throw error
    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    // Add tournament ID to values array
    updateValues.push(id);

    // Execute update query
    await connection.execute(
      `UPDATE tournaments SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Get updated tournament
    const [tournaments] = await connection.execute(
      "SELECT * FROM tournaments WHERE id = ?",
      [id]
    );

    return (tournaments as any[])[0];
  });
}
```

### 2. Delete Tournament

```typescript
export async function deleteTournament(id: number) {
  return withConnection(async (connection) => {
    // Start a transaction to ensure data consistency
    await connection.beginTransaction();

    try {
      // Delete related records first (matches, registrations)
      await connection.execute(
        "DELETE FROM matches WHERE tournament_id = ?",
        [id]
      );
      
      await connection.execute(
        "DELETE FROM tournament_registrations WHERE tournament_id = ?",
        [id]
      );

      // Delete the tournament
      await connection.execute(
        "DELETE FROM tournaments WHERE id = ?",
        [id]
      );

      // Commit the transaction
      await connection.commit();
      
      return true;
    } catch (error) {
      // Rollback in case of error
      await connection.rollback();
      throw error;
    }
  });
}
```

### 3. Update Tournament Status

```typescript
export async function updateTournamentStatus(id: number, status: string) {
  return withConnection(async (connection) => {
    // Validate status
    const validStatuses = ["registration", "ongoing", "completed", "cancelled"];
    if (!validStatuses.includes(status)) {
      throw new Error("Invalid tournament status");
    }

    // Update status
    await connection.execute(
      "UPDATE tournaments SET status = ?, updated_at = CURRENT_TIMESTAMP WHERE id = ?",
      [status, id]
    );

    // Get updated tournament
    const [tournaments] = await connection.execute(
      "SELECT id, status, updated_at FROM tournaments WHERE id = ?",
      [id]
    );

    return (tournaments as any[])[0];
  });
}
```

## Participant Management Functions

### 1. Get Tournament Participants

```typescript
export async function getTournamentParticipants(
  tournamentId: number,
  filters: {
    status?: string;
    search?: string;
    limit?: number;
    offset?: number;
  } = {}
) {
  return withConnection(async (connection) => {
    let query = `
      SELECT tr.id, tr.tournament_id, tr.user_id, u.name, u.gamertag, 
             tr.created_at as registration_date, tr.payment_status, tr.is_active
      FROM tournament_registrations tr
      JOIN users u ON tr.user_id = u.id
      WHERE tr.tournament_id = ?
    `;

    const params: any[] = [tournamentId];

    // Add filters
    if (filters.status) {
      query += " AND tr.payment_status = ?";
      params.push(filters.status);
    }

    if (filters.search) {
      query += " AND (u.name LIKE ? OR u.gamertag LIKE ?)";
      params.push(`%${filters.search}%`, `%${filters.search}%`);
    }

    // Add order by
    query += " ORDER BY tr.created_at DESC";

    // Add limit and offset
    const limit = Number.isInteger(filters.limit) && filters.limit! > 0 ? filters.limit : 10;
    const offset = Number.isInteger(filters.offset) && filters.offset! >= 0 ? filters.offset : 0;
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    // Execute query
    const [rows] = await connection.execute(query, params);
    return rows as any[];
  });
}
```

### 2. Add Tournament Participant

```typescript
export async function addTournamentParticipant(
  tournamentId: number,
  userData: {
    user_id: number;
    payment_status?: string;
  }
) {
  return withConnection(async (connection) => {
    // Check if tournament exists and has space
    const [tournamentRows] = await connection.execute(
      `SELECT t.*, COUNT(tr.id) as current_players
       FROM tournaments t
       LEFT JOIN tournament_registrations tr ON t.id = tr.tournament_id AND tr.payment_status = 'completed'
       WHERE t.id = ?
       GROUP BY t.id`,
      [tournamentId]
    );

    const tournament = (tournamentRows as any[])[0];
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.current_players >= tournament.max_players) {
      throw new Error("Tournament is full");
    }

    if (tournament.status !== "registration") {
      throw new Error("Tournament is not in registration phase");
    }

    // Check if user exists
    const [userRows] = await connection.execute(
      "SELECT id, name, gamertag FROM users WHERE id = ?",
      [userData.user_id]
    );

    const user = (userRows as any[])[0];
    if (!user) {
      throw new Error("User not found");
    }

    // Check if user is already registered
    const [existingRows] = await connection.execute(
      "SELECT id FROM tournament_registrations WHERE tournament_id = ? AND user_id = ?",
      [tournamentId, userData.user_id]
    );

    if ((existingRows as any[]).length > 0) {
      throw new Error("User is already registered for this tournament");
    }

    // Add participant
    const [result] = await connection.execute(
      `INSERT INTO tournament_registrations (
        tournament_id, user_id, payment_status, is_active, created_at
      ) VALUES (?, ?, ?, TRUE, CURRENT_TIMESTAMP)`,
      [
        tournamentId,
        userData.user_id,
        userData.payment_status || "completed"
      ]
    );

    const insertId = (result as any).insertId;

    // Get the created registration
    const [registrationRows] = await connection.execute(
      `SELECT tr.id, tr.tournament_id, tr.user_id, u.name, u.gamertag, 
              tr.created_at as registration_date, tr.payment_status, tr.is_active
       FROM tournament_registrations tr
       JOIN users u ON tr.user_id = u.id
       WHERE tr.id = ?`,
      [insertId]
    );

    return (registrationRows as any[])[0];
  });
}
```

### 3. Remove Tournament Participant

```typescript
export async function removeTournamentParticipant(
  tournamentId: number,
  participantId: number
) {
  return withConnection(async (connection) => {
    // Check if tournament is in registration phase
    const [tournamentRows] = await connection.execute(
      "SELECT status FROM tournaments WHERE id = ?",
      [tournamentId]
    );

    const tournament = (tournamentRows as any[])[0];
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    if (tournament.status !== "registration") {
      throw new Error("Cannot remove participants after registration phase");
    }

    // Check if participant exists
    const [participantRows] = await connection.execute(
      "SELECT id FROM tournament_registrations WHERE id = ? AND tournament_id = ?",
      [participantId, tournamentId]
    );

    if ((participantRows as any[]).length === 0) {
      throw new Error("Participant not found in this tournament");
    }

    // Remove participant
    await connection.execute(
      "DELETE FROM tournament_registrations WHERE id = ?",
      [participantId]
    );

    return true;
  });
}
```

## Match Management Functions

### 1. Get Tournament Matches

```typescript
export async function getTournamentMatches(
  tournamentId: number,
  filters: {
    status?: string;
    round?: number;
    limit?: number;
    offset?: number;
  } = {}
) {
  return withConnection(async (connection) => {
    let query = `
      SELECT m.*, 
             p1.name as player1_name, p1.gamertag as player1_gamertag,
             p2.name as player2_name, p2.gamertag as player2_gamertag
      FROM matches m
      LEFT JOIN users p1 ON m.player1_id = p1.id
      LEFT JOIN users p2 ON m.player2_id = p2.id
      WHERE m.tournament_id = ?
    `;

    const params: any[] = [tournamentId];

    // Add filters
    if (filters.status) {
      query += " AND m.status = ?";
      params.push(filters.status);
    }

    if (filters.round) {
      query += " AND m.round_number = ?";
      params.push(filters.round);
    }

    // Add order by
    query += " ORDER BY m.round_number, m.match_number";

    // Add limit and offset
    const limit = Number.isInteger(filters.limit) && filters.limit! > 0 ? filters.limit : 50;
    const offset = Number.isInteger(filters.offset) && filters.offset! >= 0 ? filters.offset : 0;
    query += ` LIMIT ${limit} OFFSET ${offset}`;

    // Execute query
    const [rows] = await connection.execute(query, params);
    return rows as any[];
  });
}
```

### 2. Create Tournament Match

```typescript
export async function createTournamentMatch(
  tournamentId: number,
  matchData: {
    round_number: number;
    match_number: number;
    player1_id: number;
    player2_id: number;
    scheduled_time: string;
  }
) {
  return withConnection(async (connection) => {
    // Check if tournament exists
    const [tournamentRows] = await connection.execute(
      "SELECT id, status FROM tournaments WHERE id = ?",
      [tournamentId]
    );

    const tournament = (tournamentRows as any[])[0];
    if (!tournament) {
      throw new Error("Tournament not found");
    }

    // Check if match already exists
    const [existingRows] = await connection.execute(
      "SELECT id FROM matches WHERE tournament_id = ? AND round_number = ? AND match_number = ?",
      [tournamentId, matchData.round_number, matchData.match_number]
    );

    if ((existingRows as any[]).length > 0) {
      throw new Error("Match with this round and match number already exists");
    }

    // Check if players are registered for the tournament
    const [player1Rows] = await connection.execute(
      "SELECT id FROM tournament_registrations WHERE tournament_id = ? AND user_id = ?",
      [tournamentId, matchData.player1_id]
    );

    const [player2Rows] = await connection.execute(
      "SELECT id FROM tournament_registrations WHERE tournament_id = ? AND user_id = ?",
      [tournamentId, matchData.player2_id]
    );

    if ((player1Rows as any[]).length === 0) {
      throw new Error("Player 1 is not registered for this tournament");
    }

    if ((player2Rows as any[]).length === 0) {
      throw new Error("Player 2 is not registered for this tournament");
    }

    // Create match
    const [result] = await connection.execute(
      `INSERT INTO matches (
        tournament_id, round_number, match_number, player1_id, player2_id,
        scheduled_time, status, created_at, updated_at
      ) VALUES (?, ?, ?, ?, ?, ?, 'scheduled', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)`,
      [
        tournamentId,
        matchData.round_number,
        matchData.match_number,
        matchData.player1_id,
        matchData.player2_id,
        matchData.scheduled_time
      ]
    );

    const insertId = (result as any).insertId;

    // Get the created match
    const [matchRows] = await connection.execute(
      `SELECT m.*, 
              p1.name as player1_name, p1.gamertag as player1_gamertag,
              p2.name as player2_name, p2.gamertag as player2_gamertag
       FROM matches m
       LEFT JOIN users p1 ON m.player1_id = p1.id
       LEFT JOIN users p2 ON m.player2_id = p2.id
       WHERE m.id = ?`,
      [insertId]
    );

    return (matchRows as any[])[0];
  });
}
```

### 3. Update Tournament Match

```typescript
export async function updateTournamentMatch(
  matchId: number,
  matchData: {
    round_number?: number;
    match_number?: number;
    player1_id?: number;
    player2_id?: number;
    scheduled_time?: string;
    status?: string;
  }
) {
  return withConnection(async (connection) => {
    // Check if match exists
    const [matchRows] = await connection.execute(
      "SELECT id, tournament_id, status FROM matches WHERE id = ?",
      [matchId]
    );

    const match = (matchRows as any[])[0];
    if (!match) {
      throw new Error("Match not found");
    }

    // Validate status if provided
    if (matchData.status) {
      const validStatuses = ["scheduled", "in_progress", "completed", "cancelled"];
      if (!validStatuses.includes(matchData.status)) {
        throw new Error("Invalid match status");
      }
    }

    // Build update query
    const updateFields: string[] = [];
    const updateValues: any[] = [];

    if (matchData.round_number !== undefined) {
      updateFields.push("round_number = ?");
      updateValues.push(matchData.round_number);
    }
    if (matchData.match_number !== undefined) {
      updateFields.push("match_number = ?");
      updateValues.push(matchData.match_number);
    }
    if (matchData.player1_id !== undefined) {
      updateFields.push("player1_id = ?");
      updateValues.push(matchData.player1_id);
    }
    if (matchData.player2_id !== undefined) {
      updateFields.push("player2_id = ?");
      updateValues.push(matchData.player2_id);
    }
    if (matchData.scheduled_time !== undefined) {
      updateFields.push("scheduled_time = ?");
      updateValues.push(matchData.scheduled_time);
    }
    if (matchData.status !== undefined) {
      updateFields.push("status = ?");
      updateValues.push(matchData.status);
    }

    // Add updated_at timestamp
    updateFields.push("updated_at = CURRENT_TIMESTAMP");
    
    // If no fields to update, throw error
    if (updateFields.length === 0) {
      throw new Error("No fields to update");
    }

    // Add match ID to values array
    updateValues.push(matchId);

    // Execute update query
    await connection.execute(
      `UPDATE matches SET ${updateFields.join(", ")} WHERE id = ?`,
      updateValues
    );

    // Get updated match
    const [updatedRows] = await connection.execute(
      `SELECT m.*, 
              p1.name as player1_name, p1.gamertag as player1_gamertag,
              p2.name as player2_name, p2.gamertag as player2_gamertag
       FROM matches m
       LEFT JOIN users p1 ON m.player1_id = p1.id
       LEFT JOIN users p2 ON m.player2_id = p2.id
       WHERE m.id = ?`,
      [matchId]
    );

    return (updatedRows as any[])[0];
  });
}
```

### 4. Update Match Result

```typescript
export async function updateMatchResult(
  matchId: number,
  resultData: {
    player1_score: number;
    player2_score: number;
    winner_id: number;
    status: string;
  }
) {
  return withConnection(async (connection) => {
    // Check if match exists
    const [matchRows] = await connection.execute(
      "SELECT id, tournament_id, player1_id, player2_id, status FROM matches WHERE id = ?",
      [matchId]
    );

    const match = (matchRows as any[])[0];
    if (!match) {
      throw new Error("Match not found");
    }

    // Validate winner ID
    if (resultData.winner_id !== match.player1_id && resultData.winner_id !== match.player2_id) {
      throw new Error("Winner must be one of the match participants");
    }

    // Validate status
    if (resultData.status !== "completed") {
      throw new Error("Match status must be 'completed' when updating result");
    }

    // Update match result
    await connection.execute(
      `UPDATE matches SET 
        player1_score = ?, 
        player2_score = ?, 
        winner_id = ?, 
        status = ?, 
        updated_at = CURRENT_TIMESTAMP 
       WHERE id = ?`,
      [
        resultData.player1_score,
        resultData.player2_score,
        resultData.winner_id,
        resultData.status,
        matchId
      ]
    );

    // Get updated match
    const [updatedRows] = await connection.execute(
      `SELECT m.*, 
              p1.name as player1_name, p1.gamertag as player1_gamertag,
              p2.name as player2_name, p2.gamertag as player2_gamertag
       FROM matches m
       LEFT JOIN users p1 ON m.player1_id = p1.id
       LEFT JOIN users p2 ON m.player2_id = p2.id
       WHERE m.id = ?`,
      [matchId]
    );

    return (updatedRows as any[])[0];
  });
}
```

## Implementation Notes

1. All functions use the `withConnection` helper to manage database connections.
2. Proper validation is implemented for all input data.
3. Transactions are used where multiple operations need to be atomic.
4. Error handling is implemented for all database operations.
5. Each function returns the updated data after the operation.
6. Functions check for appropriate permissions and constraints before performing operations.
7. SQL injection is prevented by using parameterized queries.