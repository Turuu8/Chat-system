export interface Persona {
  id: string;
  name: string;
  birthdate?: string;
  livedPlace?: string;
  details?: string;
  gender?: string;
  createdAt: number;
}

export interface ChatMessage {
  id: string;
  personaId: string;
  role: "user" | "assistant";
  content: string;
  timestamp: number;
}
