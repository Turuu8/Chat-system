import type { ChatMessage, Persona } from "../types/persona";
import type { IDBPDatabase } from "idb";
import { openDB } from "idb";

const DB_NAME = "persona-chat-db";
const DB_VERSION = 1;

export const initDB = async (): Promise<IDBPDatabase> => {
  return openDB(DB_NAME, DB_VERSION, {
    upgrade(db) {
      if (!db.objectStoreNames.contains("personas")) {
        const personaStore = db.createObjectStore("personas", { keyPath: "id" });
        personaStore.createIndex("by-name", "name");
      }

      if (!db.objectStoreNames.contains("chats")) {
        const chatStore = db.createObjectStore("chats", { keyPath: "id" });
        chatStore.createIndex("by-persona-id", "personaId");
        chatStore.createIndex("by-timestamp", "timestamp");
      }
    },
  });
};

// <<<--- Persona Database --->>>
export const personaDB = {
  async getAll(): Promise<Persona[]> {
    const db = await initDB();
    return db.getAll("personas");
  },

  async get(id: string): Promise<Persona | undefined> {
    const db = await initDB();
    return db.get("personas", id);
  },

  async add(persona: Persona): Promise<void> {
    const db = await initDB();
    await db.add("personas", persona);
  },

  async delete(id: string): Promise<void> {
    const db = await initDB();
    await db.delete("personas", id);
  },
};

// <<<--- Chat Database --->>>
export const chatDB = {
  async getByPersonaId(personaId: string): Promise<ChatMessage[]> {
    const db = await initDB();
    const index = db.transaction("chats").store.index("by-persona-id");
    return index.getAll(personaId);
  },

  async add(message: ChatMessage): Promise<void> {
    const db = await initDB();
    await db.add("chats", message);
  },

  async deleteByPersonaId(personaId: string): Promise<void> {
    const db = await initDB();
    const tx = db.transaction("chats", "readwrite");
    const index = tx.store.index("by-persona-id");
    const messages = await index.getAll(personaId);
    await Promise.all(messages.map((msg) => tx.store.delete(msg.id)));
    await tx.done;
  },
};
