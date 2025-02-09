import { contacts, settings, type Contact, type InsertContact, type Settings, type InsertSettings } from "@shared/schema";

export interface IStorage {
  // Contacts
  getContacts(): Promise<Contact[]>;
  createContact(contact: InsertContact): Promise<Contact>;
  deleteContact(id: number): Promise<void>;
  
  // Settings
  getSettings(address: string): Promise<Settings | undefined>;
  upsertSettings(settings: InsertSettings): Promise<Settings>;
}

export class MemStorage implements IStorage {
  private contacts: Map<number, Contact>;
  private settings: Map<string, Settings>;
  private currentContactId: number;
  private currentSettingsId: number;

  constructor() {
    this.contacts = new Map();
    this.settings = new Map();
    this.currentContactId = 1;
    this.currentSettingsId = 1;
  }

  async getContacts(): Promise<Contact[]> {
    return Array.from(this.contacts.values());
  }

  async createContact(contact: InsertContact): Promise<Contact> {
    const id = this.currentContactId++;
    const newContact: Contact = {
      ...contact,
      id,
      createdAt: new Date()
    };
    this.contacts.set(id, newContact);
    return newContact;
  }

  async deleteContact(id: number): Promise<void> {
    this.contacts.delete(id);
  }

  async getSettings(address: string): Promise<Settings | undefined> {
    return Array.from(this.settings.values()).find(s => s.address === address);
  }

  async upsertSettings(insertSettings: InsertSettings): Promise<Settings> {
    const existing = await this.getSettings(insertSettings.address);
    if (existing) {
      const updated = { ...existing, ...insertSettings };
      this.settings.set(existing.id, updated);
      return updated;
    }

    const id = this.currentSettingsId++;
    const settings: Settings = { ...insertSettings, id };
    this.settings.set(id, settings);
    return settings;
  }
}

export const storage = new MemStorage();
