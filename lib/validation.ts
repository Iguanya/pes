import { z } from "zod"

// User registration schema
export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long"),
  email: z.string().email("Invalid email address").toLowerCase(),
  phone: z.string().regex(/^(\+254|254|0)?[17]\d{8}$/, "Invalid Kenyan phone number"),
  gamertag: z
    .string()
    .min(3, "Gamertag must be at least 3 characters")
    .max(20, "Gamertag too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Gamertag can only contain letters, numbers, underscores, and hyphens"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase, uppercase, and number"),
  role: z.enum(["player", "organizer"]).default("player"),
})

// User login schema
export const loginSchema = z.object({
  email: z.string().email("Invalid email address").toLowerCase(),
  password: z.string().min(1, "Password is required"),
})

// Tournament creation schema
export const tournamentSchema = z.object({
  name: z.string().min(3, "Tournament name must be at least 3 characters").max(100, "Name too long"),
  description: z.string().max(1000, "Description too long").optional(),
  format: z.enum(["single-elimination", "double-elimination", "round-robin", "swiss"]),
  max_players: z.number().min(4, "Minimum 4 players").max(128, "Maximum 128 players"),
  entry_fee: z.number().min(0, "Entry fee cannot be negative").max(10000, "Entry fee too high"),
  registration_deadline: z.string().datetime("Invalid registration deadline"),
  start_date: z.string().datetime("Invalid start date"),
  rules: z.string().max(2000, "Rules too long").optional(),
  require_screenshots: z.boolean().default(true),
  allow_disputes: z.boolean().default(true),
})

// Match result schema
export const matchResultSchema = z.object({
  tournament_id: z.number().positive("Invalid tournament ID"),
  player1_id: z.number().positive("Invalid player 1 ID"),
  player2_id: z.number().positive("Invalid player 2 ID"),
  winner_id: z.number().positive("Invalid winner ID"),
  player1_score: z.number().min(0, "Score cannot be negative"),
  player2_score: z.number().min(0, "Score cannot be negative"),
  screenshot_url: z.string().url("Invalid screenshot URL").optional(),
  notes: z.string().max(500, "Notes too long").optional(),
})

// User profile update schema
export const profileUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").optional(),
  phone: z
    .string()
    .regex(/^(\+254|254|0)?[17]\d{8}$/, "Invalid Kenyan phone number")
    .optional(),
  gamertag: z
    .string()
    .min(3, "Gamertag must be at least 3 characters")
    .max(20, "Gamertag too long")
    .regex(/^[a-zA-Z0-9_-]+$/, "Gamertag can only contain letters, numbers, underscores, and hyphens")
    .optional(),
  profile_image: z.string().url("Invalid profile image URL").optional(),
})

// Admin user management schema
export const adminUserUpdateSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(100, "Name too long").optional(),
  email: z.string().email("Invalid email address").toLowerCase().optional(),
  phone: z
    .string()
    .regex(/^(\+254|254|0)?[17]\d{8}$/, "Invalid Kenyan phone number")
    .optional(),
  role: z.enum(["player", "organizer", "manager", "admin"]).optional(),
  is_active: z.boolean().optional(),
})

// Password change schema
export const passwordChangeSchema = z
  .object({
    current_password: z.string().min(1, "Current password is required"),
    new_password: z
      .string()
      .min(8, "Password must be at least 8 characters")
      .regex(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/, "Password must contain at least one lowercase, uppercase, and number"),
    confirm_password: z.string().min(1, "Password confirmation is required"),
  })
  .refine((data) => data.new_password === data.confirm_password, {
    message: "Passwords don't match",
    path: ["confirm_password"],
  })
