import { PersonaForm } from "./components/PersonaForm";
import { PersonaList } from "./components/PersonaList";
import { BackButton } from "./components/BackButton";
import type { Persona } from "./types/persona";
import { useState, useEffect } from "react";
import { personaDB } from "./services/db";
import { Chat } from "./components/Chat";

type View = "list" | "form" | "chat";

function App() {
  const [personas, setPersonas] = useState<Persona[]>([]);
  const [selectedPersona, setSelectedPersona] = useState<Persona | null>(null);
  const [view, setView] = useState<View>("list");

  useEffect(() => {
    loadPersonas();
  }, []);

  const loadPersonas = async () => {
    const loaded = await personaDB.getAll();
    setPersonas(loaded);
  };

  const handleCreatePersona = () => {
    setView("form");
  };

  const handleSelectPersona = (persona: Persona) => {
    setSelectedPersona(persona);
    setView("chat");
  };

  const handleBackToList = () => {
    setView("list");
    setSelectedPersona(null);
  };

  const handleSavePersona = () => {
    loadPersonas();
    setView("list");
  };

  return (
    <div className="min-h-screen fl-c bg-gray-100">
      <header className="bg-white px-8 py-4 shadow-sm border-b border-gray-200">
        <h1 className="m-0 text-2xl text-gray-800">Persona Chat</h1>
      </header>
      <main className="flex-1 p-8 max-w-5xl w-full mx-auto md:p-4">
        {/* <<<--- Personas List --->>> */}
        {view === "list" && (
          <div className="fl-c gap-8">
            <PersonaList personas={personas} onSelect={handleSelectPersona} onRefresh={loadPersonas} />
            <button
              className="bg-primary hover:bg-primary/80 text-white border-none px-6 py-3 text-base rounded-md self-start transition-colors"
              onClick={handleCreatePersona}
            >
              + Create New Persona
            </button>
          </div>
        )}
        {/* <<<--- Persona Create --->>> */}
        {view === "form" && (
          <div>
            <BackButton onClick={handleBackToList} />
            <PersonaForm onSave={handleSavePersona} onCancel={handleBackToList} />
          </div>
        )}
        {/* <<<--- Persona Chat --->>> */}
        {view === "chat" && selectedPersona && (
          <div>
            <BackButton onClick={handleBackToList} />
            <Chat persona={selectedPersona} />
          </div>
        )}
      </main>
    </div>
  );
}

export default App;
