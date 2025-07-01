import { z } from "zod"

export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one lowercase letter, one uppercase letter, and one number",
    ),
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name must be less than 100 characters"),
  phone: z
    .string()
    .regex(/^(\+254|0)[17]\d{8}$/, "Invalid Kenyan phone number format")
    .transform((phone) => {
      // Normalize phone number to start with +254
      if (phone.startsWith("0")) {
        return "+254" + phone.substring(1)
      }
      return phone
    }),
  gamertag: z
    .string()
    .min(3, "Gamertag must be at least 3 characters")
    .max(20, "Gamertag must be less than 20 characters")
    .regex(/^[a-zA-Z0-9_-]+$/, "Gamertag can only contain letters, numbers, underscores, and hyphens"),
  role: z.enum(["player", "organizer"], {
    errorMap: () => ({ message: "Role must be either 'player' or 'organizer'" }),
  }),
})

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

export const tournamentSchema = z.object({
  name: z
    .string()
    .min(3, "Tournament name must be at least 3 characters")
    .max(100, "Tournament name must be less than 100 characters"),
  description: z.string().max(500, "Description must be less than 500 characters").optional(),
  format: z.enum(["single_elimination", "double_elimination", "round_robin", "swiss"], {
    errorMap: () => ({ message: "Invalid tournament format" }),
  }),
  max_players: z
    .number()
    .int()
    .min(4, "Tournament must have at least 4 players")
    .max(128, "Tournament cannot have more than 128 players"),
  entry_fee: z.number().min(0, "Entry fee cannot be negative").max(10000, "Entry fee cannot exceed 10,000 KES"),
  registration_deadline: z.string().datetime("Invalid registration deadline format"),
  start_date: z.string().datetime("Invalid start date format"),
  rules: z.string().max(1000, "Rules must be less than 1000 characters").optional(),
  require_screenshots: z.boolean().default(true),
  allow_disputes: z.boolean().default(true),
})

export const matchResultSchema = z.object({
  match_id: z.number().int().positive("Invalid match ID"),
  winner_id: z.number().int().positive("Invalid winner ID"),
  loser_id: z.number().int().positive("Invalid loser ID"),
  winner_score: z.number().int().min(0, "Winner score cannot be negative"),
  loser_score: z.number().int().min(0, "Loser score cannot be negative"),
  screenshot_url: z.string().url("Invalid screenshot URL").optional(),
  notes: z.string().max(500, "Notes must be less than 500 characters").optional(),
})

export type RegisterInput = z.infer<typeof registerSchema>
export type LoginInput = z.infer<typeof loginSchema>
export type TournamentInput = z.infer<typeof tournamentSchema>
export type MatchResultInput = z.infer<typeof matchResultSchema>
