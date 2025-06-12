import { pgTable, text, serial, integer, boolean, timestamp, real } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
});

export const glucoseReadings = pgTable("glucose_readings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  level: real("level").notNull(), // glucose level in mmol/L
  measuredAt: timestamp("measured_at").notNull(),
  measurementType: text("measurement_type").notNull(), // before_meal, after_meal, bedtime, etc.
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medicines = pgTable("medicines", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  name: text("name").notNull(),
  dosage: text("dosage").notNull(),
  frequency: text("frequency").notNull(), // daily, twice_daily, three_times_daily
  timeSlots: text("time_slots").array(), // array of time strings like ["08:00", "20:00"]
  isActive: boolean("is_active").default(true).notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const medicineRecords = pgTable("medicine_records", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  medicineId: integer("medicine_id").notNull(),
  takenAt: timestamp("taken_at").notNull(),
  wasOnTime: boolean("was_on_time").default(true).notNull(),
  notes: text("notes"),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const foodEntries = pgTable("food_entries", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  foodName: text("food_name").notNull(),
  portion: text("portion").notNull(),
  carbohydrates: real("carbohydrates").notNull(), // in grams
  calories: integer("calories"),
  mealType: text("meal_type").notNull(), // breakfast, lunch, dinner, snack
  consumedAt: timestamp("consumed_at").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const userSettings = pgTable("user_settings", {
  id: serial("id").primaryKey(),
  userId: integer("user_id").notNull(),
  theme: text("theme").default("light").notNull(),
  language: text("language").default("bn").notNull(),
  glucoseUnit: text("glucose_unit").default("mmol/L").notNull(),
  targetGlucoseRange: text("target_glucose_range").default("4.0-7.0").notNull(),
  reminderEnabled: boolean("reminder_enabled").default(true).notNull(),
  updatedAt: timestamp("updated_at").defaultNow().notNull(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).pick({
  username: true,
  password: true,
});

export const insertGlucoseReadingSchema = createInsertSchema(glucoseReadings).omit({
  id: true,
  createdAt: true,
});

export const insertMedicineSchema = createInsertSchema(medicines).omit({
  id: true,
  createdAt: true,
});

export const insertMedicineRecordSchema = createInsertSchema(medicineRecords).omit({
  id: true,
  createdAt: true,
});

export const insertFoodEntrySchema = createInsertSchema(foodEntries).omit({
  id: true,
  createdAt: true,
});

export const insertUserSettingsSchema = createInsertSchema(userSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type GlucoseReading = typeof glucoseReadings.$inferSelect;
export type InsertGlucoseReading = z.infer<typeof insertGlucoseReadingSchema>;

export type Medicine = typeof medicines.$inferSelect;
export type InsertMedicine = z.infer<typeof insertMedicineSchema>;

export type MedicineRecord = typeof medicineRecords.$inferSelect;
export type InsertMedicineRecord = z.infer<typeof insertMedicineRecordSchema>;

export type FoodEntry = typeof foodEntries.$inferSelect;
export type InsertFoodEntry = z.infer<typeof insertFoodEntrySchema>;

export type UserSettings = typeof userSettings.$inferSelect;
export type InsertUserSettings = z.infer<typeof insertUserSettingsSchema>;
