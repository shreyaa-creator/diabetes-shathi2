import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { insertGlucoseReadingSchema, insertMedicineSchema, insertMedicineRecordSchema, insertFoodEntrySchema } from "@shared/schema";

export async function registerRoutes(app: Express): Promise<Server> {
  const DEMO_USER_ID = 1; // Using demo user for LocalStorage-only app

  // Glucose readings endpoints
  app.get("/api/glucose-readings", async (req, res) => {
    try {
      const limit = req.query.limit ? parseInt(req.query.limit as string) : undefined;
      const readings = await storage.getGlucoseReadings(DEMO_USER_ID, limit);
      res.json(readings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch glucose readings" });
    }
  });

  app.post("/api/glucose-readings", async (req, res) => {
    try {
      const data = insertGlucoseReadingSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const reading = await storage.createGlucoseReading(data);
      res.json(reading);
    } catch (error) {
      res.status(400).json({ message: "Invalid glucose reading data" });
    }
  });

  app.put("/api/glucose-readings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const reading = await storage.updateGlucoseReading(id, updates);
      if (!reading) {
        return res.status(404).json({ message: "Glucose reading not found" });
      }
      res.json(reading);
    } catch (error) {
      res.status(400).json({ message: "Failed to update glucose reading" });
    }
  });

  app.delete("/api/glucose-readings/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteGlucoseReading(id);
      if (!deleted) {
        return res.status(404).json({ message: "Glucose reading not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete glucose reading" });
    }
  });

  // Medicine endpoints
  app.get("/api/medicines", async (req, res) => {
    try {
      const medicines = await storage.getMedicines(DEMO_USER_ID);
      res.json(medicines);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medicines" });
    }
  });

  app.post("/api/medicines", async (req, res) => {
    try {
      const data = insertMedicineSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const medicine = await storage.createMedicine(data);
      res.json(medicine);
    } catch (error) {
      res.status(400).json({ message: "Invalid medicine data" });
    }
  });

  app.put("/api/medicines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const medicine = await storage.updateMedicine(id, updates);
      if (!medicine) {
        return res.status(404).json({ message: "Medicine not found" });
      }
      res.json(medicine);
    } catch (error) {
      res.status(400).json({ message: "Failed to update medicine" });
    }
  });

  app.delete("/api/medicines/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteMedicine(id);
      if (!deleted) {
        return res.status(404).json({ message: "Medicine not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete medicine" });
    }
  });

  // Medicine records endpoints
  app.get("/api/medicine-records", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const records = await storage.getMedicineRecords(DEMO_USER_ID, date);
      res.json(records);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch medicine records" });
    }
  });

  app.post("/api/medicine-records", async (req, res) => {
    try {
      const data = insertMedicineRecordSchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const record = await storage.createMedicineRecord(data);
      res.json(record);
    } catch (error) {
      res.status(400).json({ message: "Invalid medicine record data" });
    }
  });

  // Food entries endpoints
  app.get("/api/food-entries", async (req, res) => {
    try {
      const date = req.query.date ? new Date(req.query.date as string) : undefined;
      const entries = await storage.getFoodEntries(DEMO_USER_ID, date);
      res.json(entries);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch food entries" });
    }
  });

  app.post("/api/food-entries", async (req, res) => {
    try {
      const data = insertFoodEntrySchema.parse({
        ...req.body,
        userId: DEMO_USER_ID,
      });
      const entry = await storage.createFoodEntry(data);
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Invalid food entry data" });
    }
  });

  app.put("/api/food-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const updates = req.body;
      const entry = await storage.updateFoodEntry(id, updates);
      if (!entry) {
        return res.status(404).json({ message: "Food entry not found" });
      }
      res.json(entry);
    } catch (error) {
      res.status(400).json({ message: "Failed to update food entry" });
    }
  });

  app.delete("/api/food-entries/:id", async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const deleted = await storage.deleteFoodEntry(id);
      if (!deleted) {
        return res.status(404).json({ message: "Food entry not found" });
      }
      res.json({ success: true });
    } catch (error) {
      res.status(400).json({ message: "Failed to delete food entry" });
    }
  });

  // User settings endpoints
  app.get("/api/user-settings", async (req, res) => {
    try {
      const settings = await storage.getUserSettings(DEMO_USER_ID);
      res.json(settings);
    } catch (error) {
      res.status(500).json({ message: "Failed to fetch user settings" });
    }
  });

  app.put("/api/user-settings", async (req, res) => {
    try {
      const updates = req.body;
      const settings = await storage.updateUserSettings(DEMO_USER_ID, updates);
      res.json(settings);
    } catch (error) {
      res.status(400).json({ message: "Failed to update user settings" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}
