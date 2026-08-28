"use client";

import React, { useState, useEffect } from "react";
import { X, Send, MapPin } from "lucide-react";
import { VictimReport } from "../data/mockData";

interface ReportFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (report: Omit<VictimReport, "id" | "date">) => void;
  clickedCoords: { lat: number; lng: number } | null;
}

export default function ReportForm({
  isOpen,
  onClose,
  onSubmit,
  clickedCoords
}: ReportFormProps) {
  const [reporterName, setReporterName] = useState("");
  const [phone, setPhone] = useState("");
  const [locationName, setLocationName] = useState("");
  const [lat, setLat] = useState("");
  const [lng, setLng] = useState("");
  const [affectedPeople, setAffectedPeople] = useState("5");
  const [affectedHouses, setAffectedHouses] = useState("0");
  const [description, setDescription] = useState("");
  
  const [needs, setNeeds] = useState<VictimReport["needs"]>([]);

  // Update coordinates when map is double-clicked
  useEffect(() => {
    if (clickedCoords) {
      setLat(clickedCoords.lat.toFixed(5));
      setLng(clickedCoords.lng.toFixed(5));
    }
  }, [clickedCoords]);

  const handleNeedToggle = (need: VictimReport["needs"][number]) => {
    setNeeds((prev) =>
      prev.includes(need) ? prev.filter((n) => n !== need) : [...prev, need]
    );
  };

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!reporterName || !locationName || !lat || !lng || !description) {
      alert("Por favor, completa todos los campos requeridos (*)");
      return;
    }

    onSubmit({
      reporterName,
      phone,
      locationName,
      lat: parseFloat(lat),
      lng: parseFloat(lng),
      affectedPeople: parseInt(affectedPeople) || 0,
      affectedHouses: parseInt(affectedHouses) || 0,
      needs: needs as any,
      description,
      status: "pending"
    });

    // Reset Form
    setReporterName("");
    setPhone("");
    setLocationName("");
    setLat("");
    setLng("");
    setAffectedPeople("5");
    setAffectedHouses("0");
    setDescription("");
    setNeeds([]);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      {/* Background click close wrapper */}
      <div className="absolute inset-0 cursor-pointer" onClick={onClose} />
      
      {/* Sidebar Form container */}
      <div className="relative w-full max-w-md h-full bg-zinc-950 border-l border-zinc-800 flex flex-col shadow-2xl p-6 overflow-y-auto">
        
        {/* Header */}
        <div className="flex items-center justify-between pb-4 border-b border-zinc-800">
          <div>
            <h3 className="text-lg font-bold text-white flex items-center gap-2">
              <MapPin className="h-5 w-5 text-red-500" />
              Nuevo Reporte de Damnificados
            </h3>
            <p className="text-xs text-zinc-400">
              Registra información crítica para coordinar rescate y ayuda.
            </p>
          </div>
          <button 
            onClick={onClose}
            className="rounded p-1 text-zinc-500 hover:text-white hover:bg-zinc-900 transition cursor-pointer"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleFormSubmit} className="flex-1 space-y-4 py-4 text-sm">
          
          {/* Reporter info */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Nombre de Reportante *
            </label>
            <input
              type="text"
              required
              value={reporterName}
              onChange={(e) => setReporterName(e.target.value)}
              placeholder="Ej. Juan Pérez / Líder Comunitario"
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Teléfono de Contacto
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              placeholder="Ej. 315 123 4567"
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Location details */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Nombre de Ubicación / Vereda / Barrio *
            </label>
            <input
              type="text"
              required
              value={locationName}
              onChange={(e) => setLocationName(e.target.value)}
              placeholder="Ej. Barrio El Progreso, Comuna 2"
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Coordinates grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Latitud *
              </label>
              <input
                type="number"
                step="any"
                required
                value={lat}
                onChange={(e) => setLat(e.target.value)}
                placeholder="4.5339"
                className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Longitud *
              </label>
              <input
                type="number"
                step="any"
                required
                value={lng}
                onChange={(e) => setLng(e.target.value)}
                placeholder="-75.6811"
                className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>
          <span className="block text-[10px] text-zinc-500">
            * Haz doble clic en el mapa para capturar las coordenadas de forma automática.
          </span>

          {/* Affected grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Personas Afectadas
              </label>
              <input
                type="number"
                min="0"
                value={affectedPeople}
                onChange={(e) => setAffectedPeople(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
            <div className="space-y-1">
              <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
                Viviendas Afectadas
              </label>
              <input
                type="number"
                min="0"
                value={affectedHouses}
                onChange={(e) => setAffectedHouses(e.target.value)}
                className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-white focus:outline-none focus:ring-1 focus:ring-red-500"
              />
            </div>
          </div>

          {/* Needs list */}
          <div className="space-y-2">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Suministros Requeridos
            </label>
            <div className="flex flex-wrap gap-2">
              {(["Alimentos", "Agua Potable", "Carpas/Refugio", "Kits de Aseo", "Atención Médica"] as const).map((need) => {
                const isSelected = needs.includes(need);
                return (
                  <button
                    key={need}
                    type="button"
                    onClick={() => handleNeedToggle(need)}
                    className={`text-xs px-2.5 py-1 rounded transition cursor-pointer border ${
                      isSelected
                        ? "bg-red-500/20 text-red-400 border-red-500/40"
                        : "bg-zinc-900 text-zinc-400 border-zinc-800 hover:border-zinc-700"
                    }`}
                  >
                    {need}
                  </button>
                );
              })}
            </div>
          </div>

          {/* Description */}
          <div className="space-y-1">
            <label className="block text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Descripción de la Afectación *
            </label>
            <textarea
              required
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="Describa los daños estructurales, colapso de vías, estado físico de los damnificados..."
              className="w-full rounded bg-zinc-900 border border-zinc-800 px-3 py-2 text-white placeholder-zinc-600 focus:outline-none focus:ring-1 focus:ring-red-500"
            />
          </div>

          {/* Footer Submit Buttons */}
          <div className="flex items-center gap-3 pt-4 border-t border-zinc-900">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 rounded py-2 font-medium text-zinc-300 transition cursor-pointer"
            >
              Cancelar
            </button>
            <button
              type="submit"
              className="flex-1 flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 rounded py-2 font-semibold text-white transition shadow-lg shadow-red-900/10 cursor-pointer"
            >
              <Send className="h-4 w-4" />
              Enviar Reporte
            </button>
          </div>

        </form>

      </div>
    </div>
  );
}
