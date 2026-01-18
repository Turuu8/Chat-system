import { useState, useEffect, useRef, type KeyboardEvent } from "react";
import type { ChatMessage, Persona } from "../types/persona";
import { streamChatResponse } from "../services/ai";
import { chatDB } from "../services/db";

export const Chat = ({ persona }: { persona: Persona }) => {
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const streamingTextRef = useRef<string>("");

  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [isStreaming, setIsStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState("");

  useEffect(() => {
    loadMessages();
  }, [persona.id]);

  useEffect(() => {
    scrollToBottom();
  }, [messages, streamingText]);

  const loadMessages = async () => {
    const loaded = await chatDB.getByPersonaId(persona.id);
    setMessages(loaded.sort((a, b) => a.timestamp - b.timestamp));
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const handleSend = async () => {
    if (!input.trim() || isStreaming) return;

    const userMessage: ChatMessage = {
      id: crypto.randomUUID(),
      personaId: persona.id,
      role: "user",
      content: input.trim(),
      timestamp: Date.now(),
    };

    setMessages((prev) => [...prev, userMessage]);
    await chatDB.add(userMessage);
    setInput("");
    setIsStreaming(true);
    streamingTextRef.current = "";
    setStreamingText("");

    const chatHistory = messages.map((m) => ({
      role: m.role,
      content: m.content,
    }));

    await streamChatResponse(
      persona,
      [...chatHistory, { role: "user", content: userMessage.content }],
      (chunk) => {
        streamingTextRef.current += chunk;
        setStreamingText(streamingTextRef.current);
      },
      async () => {
        const finalText = streamingTextRef.current;
        const assistantMessage: ChatMessage = {
          id: crypto.randomUUID(),
          personaId: persona.id,
          role: "assistant",
          content: finalText,
          timestamp: Date.now(),
        };
        await chatDB.add(assistantMessage);
        setMessages((prev) => [...prev, assistantMessage]);
        streamingTextRef.current = "";
        setStreamingText("");
        setIsStreaming(false);
      },
      (error) => {
        console.error("AI error:", error);
        alert(`Error: ${error.message}`);
        setIsStreaming(false);
        streamingTextRef.current = "";
        setStreamingText("");
      },
    );
  };

  const handleKeyPress = (e: KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <div className="bg-white rounded-lg shadow-sm fl-c h-[calc(100vh-200px)] max-h-[800px] mx-auto md:h-[calc(100vh-150px)]">
      <div className="p-6 border-b border-gray-200">
        <h2 className="m-0 mb-2 text-gray-800">Chat with {persona.name}</h2>
        {persona.details && <p className="m-0 text-gray-600 text-sm">{persona.details}</p>}
      </div>
      <div className="flex-1 overflow-y-auto p-4 fl-c gap-4">
        {/* <<<--- Messages --->>> */}
        {messages.map((message) => (
          <div key={message.id} className={`flex max-w-[70%] md:max-w-[85%] ${message.role === "user" ? "self-end" : "self-start"}`}>
            <div className={`px-4 py-3 rounded-xl break-words ${message.role === "user" ? "bg-primary text-white" : "bg-gray-200 text-gray-800"}`}>
              {message.content}
            </div>
          </div>
        ))}
        {/* <<<--- Streaming Text --->>> */}
        {isStreaming && streamingText && (
          <div className="flex max-w-[70%] md:max-w-[85%] self-start">
            <div className="px-4 py-3 rounded-xl break-words bg-gray-100 border border-dashed border-gray-300 text-gray-800">{streamingText}</div>
          </div>
        )}
        {isStreaming && !streamingText && (
          <div className="flex max-w-[70%] md:max-w-[85%] self-start">
            <div className="px-4 py-3 rounded-xl break-words bg-gray-100 border border-dashed border-gray-300 text-gray-800">Thinking...</div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>
      {/* <<<--- Input Area --->>> */}
      <div className="p-4 border-t border-gray-200 flex gap-4 items-end">
        <textarea
          className="flex-1 px-3 py-3 border border-gray-300 rounded-md text-base font-sans resize-none focus:border-primary focus:outline-none"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyPress={handleKeyPress}
          placeholder="Type your message..."
          rows={2}
          disabled={isStreaming}
        />
        <button
          onClick={handleSend}
          disabled={isStreaming || !input.trim()}
          className="bg-primary hover:bg-primary/80 disabled:opacity-50 disabled:cursor-not-allowed text-white border-none px-6 py-3 rounded-md text-base transition-colors"
        >
          Send
        </button>
      </div>
    </div>
  );
};
