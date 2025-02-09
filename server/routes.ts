import type { Express } from "express";
import { createServer } from "http";
import { storage } from "./storage";
import { insertContactSchema, insertSettingsSchema } from "@shared/schema";

export function registerRoutes(app: Express) {
  const httpServer = createServer(app);

  // Contacts API
  app.get("/api/contacts", async (_req, res) => {
    const contacts = await storage.getContacts();
    res.json(contacts);
  });

  app.post("/api/contacts", async (req, res) => {
    const parsed = insertContactSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid contact data" });
    }
    const contact = await storage.createContact(parsed.data);
    res.json(contact);
  });

  app.delete("/api/contacts/:id", async (req, res) => {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      return res.status(400).json({ message: "Invalid contact ID" });
    }
    await storage.deleteContact(id);
    res.status(204).end();
  });

  // Settings API
  app.get("/api/settings/:address", async (req, res) => {
    const settings = await storage.getSettings(req.params.address);
    if (!settings) {
      return res.status(404).json({ message: "Settings not found" });
    }
    res.json(settings);
  });

  app.put("/api/settings", async (req, res) => {
    const parsed = insertSettingsSchema.safeParse(req.body);
    if (!parsed.success) {
      return res.status(400).json({ message: "Invalid settings data" });
    }
    const settings = await storage.upsertSettings(parsed.data);
    res.json(settings);
  });

  return httpServer;
}
