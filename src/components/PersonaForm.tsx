import { useState, type FormEvent } from "react";
import type { Persona } from "../types/persona";
import { personaDB } from "../services/db";

export const PersonaForm = ({ onSave, onCancel }: PersonaFormProps) => {
  const [formData, setFormData] = useState<Omit<Persona, "id" | "createdAt">>({
    name: "",
    birthdate: "",
    livedPlace: "",
    details: "",
    gender: "",
  });

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!formData.name.trim()) return;

    const persona: Persona = {
      id: crypto.randomUUID(),
      ...formData,
      createdAt: Date.now(),
    };

    await personaDB.add(persona);

    setFormData({
      name: "",
      birthdate: "",
      livedPlace: "",
      details: "",
      gender: "",
    });
    onSave();
  };

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 rounded-lg shadow-sm max-w-2xl mx-auto">
      <h2 className="mt-0 mb-6 text-gray-800">Create New Persona</h2>
      <div className="mb-6">
        <label htmlFor="name" className="block mb-2 text-gray-800 font-medium">
          Name *
        </label>
        <input
          id="name"
          type="text"
          value={formData.name}
          onChange={(e) => setFormData({ ...formData, name: e.target.value })}
          className="w-full px-3 py-3 border border-gray-300 rounded-md text-base font-sans"
          required
        />
      </div>
      <div className="mb-6">
        <label htmlFor="birthdate" className="block mb-2 text-gray-800 font-medium">
          Birthdate
        </label>
        <input
          id="birthdate"
          type="text"
          value={formData.birthdate}
          onChange={(e) => setFormData({ ...formData, birthdate: e.target.value })}
          placeholder="e.g., 1162 or April 16, 1162"
          className="w-full px-3 py-3 border border-gray-300 rounded-md text-base font-sans"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="livedPlace" className="block mb-2 text-gray-800 font-medium">
          Lived Place
        </label>
        <input
          id="livedPlace"
          type="text"
          value={formData.livedPlace}
          onChange={(e) => setFormData({ ...formData, livedPlace: e.target.value })}
          placeholder="e.g., Current Location"
          className="w-full px-3 py-3 border border-gray-300 rounded-md text-base font-sans"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="gender" className="block mb-2 text-gray-800 font-medium">
          Gender
        </label>
        <input
          id="gender"
          type="text"
          value={formData.gender}
          onChange={(e) => setFormData({ ...formData, gender: e.target.value })}
          placeholder="e.g., Male, Female"
          className="w-full px-3 py-3 border border-gray-300 rounded-md text-base font-sans"
        />
      </div>
      <div className="mb-6">
        <label htmlFor="details" className="block mb-2 text-gray-800 font-medium">
          Details
        </label>
        <textarea
          id="details"
          value={formData.details}
          onChange={(e) => setFormData({ ...formData, details: e.target.value })}
          placeholder="Additional information about this persona..."
          rows={4}
          className="w-full px-3 py-3 border border-gray-300 rounded-md text-base font-sans resize-y"
        />
      </div>
      <div className="flex gap-4 justify-end">
        <button type="submit" className="px-6 py-3 border-none rounded-md text-base bg-primary hover:bg-primary/80 text-white transition-colors">
          Create
        </button>
        {onCancel && (
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-3 border-none rounded-md text-base  bg-gray-200 hover:bg-gray-300 text-gray-800 transition-colors"
          >
            Cancel
          </button>
        )}
      </div>
    </form>
  );
};

interface PersonaFormProps {
  onSave: () => void;
  onCancel?: () => void;
}
