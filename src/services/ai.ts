import type { Persona } from "../types/persona";

// Groq API endpoint
const GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";

export const streamChatResponse = async (
  persona: Persona,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  onChunk: (text: string) => void,
  onComplete: () => void | Promise<void>,
  onError: (error: Error) => void,
): Promise<void> => {
  return streamGroqResponse(persona, messages, onChunk, onComplete, onError);
};

// Groq API (Recommended - Fast and free)
async function streamGroqResponse(
  persona: Persona,
  messages: Array<{ role: "user" | "assistant"; content: string }>,
  onChunk: (text: string) => void,
  onComplete: () => void | Promise<void>,
  onError: (error: Error) => void,
): Promise<void> {
  const apiKey = import.meta.env.VITE_GROQ_API_KEY || import.meta.env.VITE_OPENAI_API_KEY;

  if (!apiKey) {
    onError(new Error("Groq API key not configured. Get a free API key at https://console.groq.com and set VITE_GROQ_API_KEY in your .env file."));
    return;
  }

  // Create system prompt based on persona
  const systemPrompt = `You are ${persona.name}. ${persona.birthdate ? `Born on ${persona.birthdate}.` : ""} ${
    persona.livedPlace ? `Lived in ${persona.livedPlace}.` : ""
  } ${
    persona.details ? `About you: ${persona.details}` : ""
  }. Respond as this persona would, staying true to their character, knowledge, and speaking style. Use Japanese and English appropriately based on the context.`;

  try {
    const response = await fetch(GROQ_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile", // Latest stable model
        messages: [{ role: "system", content: systemPrompt }, ...messages],
        stream: true,
      }),
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: { message: "Unknown error" } }));
      onError(new Error(error.error?.message || `Groq API error: ${response.status} ${response.statusText}`));
      return;
    }

    await processOpenAIStream(response, onChunk, onComplete, onError);
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Network error"));
  }
}

// Process OpenAI-compatible streaming response (Groq)
async function processOpenAIStream(
  response: Response,
  onChunk: (text: string) => void,
  onComplete: () => void | Promise<void>,
  onError: (error: Error) => void,
): Promise<void> {
  const reader = response.body?.getReader();
  const decoder = new TextDecoder();

  if (!reader) {
    onError(new Error("No response body"));
    return;
  }

  let buffer = "";

  try {
    while (true) {
      const { done, value } = await reader.read();
      if (done) break;

      buffer += decoder.decode(value, { stream: true });
      console.log("first", buffer);
      const lines = buffer.split("\n");
      buffer = lines.pop() || "";

      for (const line of lines) {
        if (line.startsWith("data: ")) {
          const data = line.slice(6);
          if (data === "[DONE]") {
            await onComplete();
            return;
          }

          try {
            const json = JSON.parse(data);
            const content = json.choices?.[0]?.delta?.content;
            if (content) {
              onChunk(content);
            }
          } catch (e) {
            // Ignore parse errors for incomplete chunks
          }
        }
      }
    }
    await onComplete();
  } catch (error) {
    onError(error instanceof Error ? error : new Error("Streaming error"));
  }
}
