import type { Persona } from "../types/persona";
import { personaDB } from "../services/db";
import type { MouseEvent } from "react";

interface PersonaListProps {
  personas: Persona[];
  onSelect: (persona: Persona) => void;
  onRefresh: () => void;
}

export const PersonaList = ({ personas, onSelect, onRefresh }: PersonaListProps) => {
  const handleDelete = async (id: string, e: MouseEvent) => {
    e.stopPropagation();
    if (confirm("Are you sure you want to delete this persona?")) {
      await personaDB.delete(id);
      onRefresh();
    }
  };

  return (
    <div>
      <h2 className="text-gray-800 mb-4">Personas</h2>
      {personas.length === 0 ? (
        <p className="text-center text-gray-600 py-12 px-6 bg-white rounded-lg">No personas yet. Create one to get started!</p>
      ) : (
        <ul className="list-none p-0 m-0 grid gap-4 grid-cols-[repeat(auto-fill,minmax(300px,1fr))] md:grid-cols-1">
          {personas.map((persona) => (
            <li
              key={persona.id}
              onClick={() => onSelect(persona)}
              className="bg-white p-6 rounded-lg shadow-sm  transition-all duration-200 fl-between items-start hover:-translate-y-0.5 hover:shadow-md cursor-pointer"
            >
              <div>
                <h3 className="m-0 mb-2 text-gray-800 text-xl">{persona.name}</h3>
                {persona.birthdate && <p className="my-1 text-gray-600 text-sm">Born: {persona.birthdate}</p>}
                {persona.livedPlace && <p className="my-1 text-gray-600 text-sm">Lived: {persona.livedPlace}</p>}
              </div>
              <button
                className="bg-transparent border-none text-red-500 text-2xl  p-0 w-6 h-6 flex items-center justify-center rounded hover:bg-red-50 transition-colors"
                onClick={(e) => handleDelete(persona.id, e)}
                aria-label="Delete persona"
              >
                ×
              </button>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
};
