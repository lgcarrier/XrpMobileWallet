import { pgTable, text, serial, timestamp, jsonb } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

export const contacts = pgTable("contacts", {
  id: serial("id").primaryKey(),
  name: text("name").notNull(),
  address: text("address").notNull(),
  createdAt: timestamp("created_at").defaultNow().notNull(),
});

export const settings = pgTable("settings", {
  id: serial("id").primaryKey(),
  address: text("address").notNull().unique(),
  preferences: jsonb("preferences").notNull().$type<{
    networkType: "mainnet" | "testnet";
    currency: string;
    theme: "light" | "dark" | "system";
  }>(),
});

export const insertContactSchema = createInsertSchema(contacts).omit({ 
  id: true,
  createdAt: true 
});

export const insertSettingsSchema = createInsertSchema(settings).omit({ 
  id: true 
});

export type Contact = typeof contacts.$inferSelect;
export type InsertContact = z.infer<typeof insertContactSchema>;
export type Settings = typeof settings.$inferSelect;
export type InsertSettings = z.infer<typeof insertSettingsSchema>;
