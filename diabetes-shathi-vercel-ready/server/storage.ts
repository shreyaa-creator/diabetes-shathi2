import { 
  users, 
  glucoseReadings, 
  medicines, 
  medicineRecords, 
  foodEntries, 
  userSettings,
  type User, 
  type InsertUser,
  type GlucoseReading,
  type InsertGlucoseReading,
  type Medicine,
  type InsertMedicine,
  type MedicineRecord,
  type InsertMedicineRecord,
  type FoodEntry,
  type InsertFoodEntry,
  type UserSettings,
  type InsertUserSettings
} from "@shared/schema";

export interface IStorage {
  // User methods
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;

  // Glucose reading methods
  getGlucoseReadings(userId: number, limit?: number): Promise<GlucoseReading[]>;
  createGlucoseReading(reading: InsertGlucoseReading): Promise<GlucoseReading>;
  updateGlucoseReading(id: number, reading: Partial<GlucoseReading>): Promise<GlucoseReading | undefined>;
  deleteGlucoseReading(id: number): Promise<boolean>;

  // Medicine methods
  getMedicines(userId: number): Promise<Medicine[]>;
  createMedicine(medicine: InsertMedicine): Promise<Medicine>;
  updateMedicine(id: number, medicine: Partial<Medicine>): Promise<Medicine | undefined>;
  deleteMedicine(id: number): Promise<boolean>;

  // Medicine record methods
  getMedicineRecords(userId: number, date?: Date): Promise<MedicineRecord[]>;
  createMedicineRecord(record: InsertMedicineRecord): Promise<MedicineRecord>;

  // Food entry methods
  getFoodEntries(userId: number, date?: Date): Promise<FoodEntry[]>;
  createFoodEntry(entry: InsertFoodEntry): Promise<FoodEntry>;
  updateFoodEntry(id: number, entry: Partial<FoodEntry>): Promise<FoodEntry | undefined>;
  deleteFoodEntry(id: number): Promise<boolean>;

  // User settings methods
  getUserSettings(userId: number): Promise<UserSettings | undefined>;
  updateUserSettings(userId: number, settings: Partial<UserSettings>): Promise<UserSettings>;
}

export class MemStorage implements IStorage {
  private users: Map<number, User>;
  private glucoseReadings: Map<number, GlucoseReading>;
  private medicines: Map<number, Medicine>;
  private medicineRecords: Map<number, MedicineRecord>;
  private foodEntries: Map<number, FoodEntry>;
  private userSettings: Map<number, UserSettings>;
  private currentId: number;

  constructor() {
    this.users = new Map();
    this.glucoseReadings = new Map();
    this.medicines = new Map();
    this.medicineRecords = new Map();
    this.foodEntries = new Map();
    this.userSettings = new Map();
    this.currentId = 1;

    // Create a default user for demo purposes
    this.createUser({ username: "demo", password: "demo" });
  }

  private getNextId(): number {
    return this.currentId++;
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    return this.users.get(id);
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    return Array.from(this.users.values()).find(
      (user) => user.username === username,
    );
  }

  async createUser(insertUser: InsertUser): Promise<User> {
    const id = this.getNextId();
    const user: User = { ...insertUser, id };
    this.users.set(id, user);

    // Create default settings for new user
    await this.updateUserSettings(id, {
      userId: id,
      theme: "light",
      language: "bn",
      glucoseUnit: "mmol/L",
      targetGlucoseRange: "4.0-7.0",
      reminderEnabled: true,
    });

    return user;
  }

  // Glucose reading methods
  async getGlucoseReadings(userId: number, limit?: number): Promise<GlucoseReading[]> {
    const readings = Array.from(this.glucoseReadings.values())
      .filter(reading => reading.userId === userId)
      .sort((a, b) => new Date(b.measuredAt).getTime() - new Date(a.measuredAt).getTime());
    
    return limit ? readings.slice(0, limit) : readings;
  }

  async createGlucoseReading(insertReading: InsertGlucoseReading): Promise<GlucoseReading> {
    const id = this.getNextId();
    const reading: GlucoseReading = {
      ...insertReading,
      id,
      createdAt: new Date(),
    };
    this.glucoseReadings.set(id, reading);
    return reading;
  }

  async updateGlucoseReading(id: number, updates: Partial<GlucoseReading>): Promise<GlucoseReading | undefined> {
    const reading = this.glucoseReadings.get(id);
    if (!reading) return undefined;

    const updated = { ...reading, ...updates };
    this.glucoseReadings.set(id, updated);
    return updated;
  }

  async deleteGlucoseReading(id: number): Promise<boolean> {
    return this.glucoseReadings.delete(id);
  }

  // Medicine methods
  async getMedicines(userId: number): Promise<Medicine[]> {
    return Array.from(this.medicines.values())
      .filter(medicine => medicine.userId === userId && medicine.isActive);
  }

  async createMedicine(insertMedicine: InsertMedicine): Promise<Medicine> {
    const id = this.getNextId();
    const medicine: Medicine = {
      ...insertMedicine,
      id,
      createdAt: new Date(),
    };
    this.medicines.set(id, medicine);
    return medicine;
  }

  async updateMedicine(id: number, updates: Partial<Medicine>): Promise<Medicine | undefined> {
    const medicine = this.medicines.get(id);
    if (!medicine) return undefined;

    const updated = { ...medicine, ...updates };
    this.medicines.set(id, updated);
    return updated;
  }

  async deleteMedicine(id: number): Promise<boolean> {
    const medicine = this.medicines.get(id);
    if (!medicine) return false;

    const updated = { ...medicine, isActive: false };
    this.medicines.set(id, updated);
    return true;
  }

  // Medicine record methods
  async getMedicineRecords(userId: number, date?: Date): Promise<MedicineRecord[]> {
    let records = Array.from(this.medicineRecords.values())
      .filter(record => record.userId === userId);

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      records = records.filter(record => {
        const takenAt = new Date(record.takenAt);
        return takenAt >= startOfDay && takenAt <= endOfDay;
      });
    }

    return records.sort((a, b) => new Date(b.takenAt).getTime() - new Date(a.takenAt).getTime());
  }

  async createMedicineRecord(insertRecord: InsertMedicineRecord): Promise<MedicineRecord> {
    const id = this.getNextId();
    const record: MedicineRecord = {
      ...insertRecord,
      id,
      createdAt: new Date(),
    };
    this.medicineRecords.set(id, record);
    return record;
  }

  // Food entry methods
  async getFoodEntries(userId: number, date?: Date): Promise<FoodEntry[]> {
    let entries = Array.from(this.foodEntries.values())
      .filter(entry => entry.userId === userId);

    if (date) {
      const startOfDay = new Date(date);
      startOfDay.setHours(0, 0, 0, 0);
      const endOfDay = new Date(date);
      endOfDay.setHours(23, 59, 59, 999);

      entries = entries.filter(entry => {
        const consumedAt = new Date(entry.consumedAt);
        return consumedAt >= startOfDay && consumedAt <= endOfDay;
      });
    }

    return entries.sort((a, b) => new Date(b.consumedAt).getTime() - new Date(a.consumedAt).getTime());
  }

  async createFoodEntry(insertEntry: InsertFoodEntry): Promise<FoodEntry> {
    const id = this.getNextId();
    const entry: FoodEntry = {
      ...insertEntry,
      id,
      createdAt: new Date(),
    };
    this.foodEntries.set(id, entry);
    return entry;
  }

  async updateFoodEntry(id: number, updates: Partial<FoodEntry>): Promise<FoodEntry | undefined> {
    const entry = this.foodEntries.get(id);
    if (!entry) return undefined;

    const updated = { ...entry, ...updates };
    this.foodEntries.set(id, updated);
    return updated;
  }

  async deleteFoodEntry(id: number): Promise<boolean> {
    return this.foodEntries.delete(id);
  }

  // User settings methods
  async getUserSettings(userId: number): Promise<UserSettings | undefined> {
    return Array.from(this.userSettings.values())
      .find(settings => settings.userId === userId);
  }

  async updateUserSettings(userId: number, updates: Partial<UserSettings>): Promise<UserSettings> {
    const existing = await this.getUserSettings(userId);
    const settings: UserSettings = existing 
      ? { ...existing, ...updates, updatedAt: new Date() }
      : {
          id: this.getNextId(),
          userId,
          theme: "light",
          language: "bn",
          glucoseUnit: "mmol/L",
          targetGlucoseRange: "4.0-7.0",
          reminderEnabled: true,
          updatedAt: new Date(),
          ...updates,
        };

    this.userSettings.set(settings.id, settings);
    return settings;
  }
}

export const storage = new MemStorage();
