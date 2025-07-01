import { z } from "zod"

// User registration schema
export const registerSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  name: z.string().min(2, "Name must be at least 2 characters"),
  phone: z.string().regex(/^(\+254|0)[17]\d{8}$/, "Invalid Kenyan phone number"),
  gamertag: z
    .string()
    .min(3, "Gamertag must be at least 3 characters")
    .max(20, "Gamertag must be less than 20 characters"),
  role: z.enum(["player", "organizer"], {
    errorMap: () => ({ message: "Role must be either 'player' or 'organizer'" }),
  }),
})

// User login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
})

// Tournament creation schema
export const tournamentSchema = z.object({
  name: z.string().min(3, "Tournament name must be at least 3 characters"),
  description: z.string().optional(),
  format: z.enum(["single_elimination", "double_elimination", "round_robin", "swiss"], {
    errorMap: () => ({ message: "Invalid tournament format" }),
  }),
  max_players: z.number().min(4, "Minimum 4 players required").max(128, "Maximum 128 players allowed"),
  entry_fee: z.number().min(0, "Entry fee cannot be negative"),
  registration_deadline: z.string().datetime("Invalid registration deadline"),
  start_date: z.string().datetime("Invalid start date"),
  rules: z.string().optional(),
  require_screenshots: z.boolean().default(true),
  allow_disputes: z.boolean().default(true),
})

// Match result submission schema
export const matchResultSchema = z.object({
  tournament_id: z.number().positive("Invalid tournament ID"),
  player1_score: z.number().min(0, "Score cannot be negative"),
  player2_score: z.number().min(0, "Score cannot be negative"),
  screenshot: z.string().url("Invalid screenshot URL").optional(),
  notes: z.string().optional(),
})

// M-Pesa payment schema
export const mpesaPaymentSchema = z.object({
  phone_number: z.string().regex(/^254[17]\d{8}$/, "Invalid phone number format"),
  amount: z.number().positive("Amount must be positive"),
  tournament_id: z.number().positive("Invalid tournament ID"),
})
