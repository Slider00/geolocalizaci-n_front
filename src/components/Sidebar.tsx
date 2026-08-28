"use client";

import React from "react";
import { Search, Flame, MapPin, PlusCircle, Calendar, ShieldAlert, AlertTriangle } from "lucide-react";
import { EarthquakeEvent, VictimReport } from "../data/mockData";

interface SidebarProps {
  events: EarthquakeEvent[];
  reports: VictimReport[];
  selectedEventId: string | null;
  setSelectedEventId: (id: string | null) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
  minMagnitude: number;
  setMinMagnitude: (val: number) => void;
  searchText: string;
  setSearchText: (text: string) => void;
  selectedStatuses: ('pending' | 'in_progress' | 'resolved')[];
  toggleStatus: (status: 'pending' | 'in_progress' | 'resolved') => void;
  onOpenReportForm: () => void;
  onClearFilters: () => void;
  startDate: string;
  setStartDate: (date: string) => void;
  endDate: string;
  setEndDate: (date: string) => void;
}

export default function Sidebar({
  events,
  reports,
  selectedEventId,
  setSelectedEventId,
  selectedReportId,
  setSelectedReportId,
  minMagnitude,
  setMinMagnitude,
  searchText,
  setSearchText,
  selectedStatuses,
  toggleStatus,
  onOpenReportForm,
  onClearFilters,
  startDate,
  setStartDate,
  endDate,
  setEndDate
}: SidebarProps) {
  
  const [activeTab, setActiveTab] = React.useState<'sismos' | 'reportes'>('sismos');
  const [isMounted, setIsMounted] = React.useState(false);
  
  React.useEffect(() => {
    setIsMounted(true);
  }, []);

  // Format Date ISO helper
  const formatDate = (dateStr: string) => {
    if (!isMounted) return "";
    const d = new Date(dateStr);
    return d.toLocaleDateString("es-CO", {
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit"
    });
  };

  return (
    <aside className="w-full lg:w-96 border-r border-zinc-800 bg-zinc-950 flex flex-col h-full overflow-hidden">
      
      {/* Búsqueda y Acción Global */}
      <div className="p-4 border-b border-zinc-800 flex flex-col gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Buscar por municipio o departamento..."
            value={searchText}
            onChange={(e) => setSearchText(e.target.value)}
            className="w-full rounded-md bg-zinc-900 border border-zinc-800 py-2 pl-10 pr-4 text-sm text-white placeholder-zinc-500 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500"
          />
        </div>
        
        <button
          onClick={onOpenReportForm}
          className="w-full flex items-center justify-center gap-2 rounded-md bg-red-600 hover:bg-red-700 py-2 text-sm font-semibold text-white transition shadow-lg shadow-red-900/10 cursor-pointer"
        >
          <PlusCircle className="h-4 w-4" />
          Reportar Damnificados / Daño
        </button>
      </div>

      {/* Filtros Dinámicos */}
      <div className="p-4 border-b border-zinc-800 space-y-4 bg-zinc-900/30">
        <div>
          <div className="flex justify-between items-center mb-1.5">
            <label className="text-xs font-semibold text-zinc-400 uppercase tracking-wider">
              Magnitud Mínima:
            </label>
            <span className="text-sm font-bold text-red-500 bg-red-950/50 border border-red-900/55 px-1.5 py-0.2 rounded">
              Mw {minMagnitude.toFixed(1)}
            </span>
          </div>
          <input
            type="range"
            min="3.0"
            max="8.0"
            step="0.1"
            value={minMagnitude}
            onChange={(e) => setMinMagnitude(parseFloat(e.target.value))}
            className="w-full h-1.5 bg-zinc-800 rounded-lg appearance-none cursor-pointer accent-red-500"
          />
        </div>

        <div>
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block mb-2">
            Estado de Ayuda:
          </span>
          <div className="flex flex-wrap gap-2">
            {(["pending", "in_progress", "resolved"] as const).map((status) => {
              const isActive = selectedStatuses.includes(status);
              const label =
                status === "pending"
                  ? "Pendiente"
                  : status === "in_progress"
                  ? "En Proceso"
                  : "Atendido";
              
              const badgeColors =
                status === "pending"
                  ? "border-red-900 text-red-400 bg-red-950/20"
                  : status === "in_progress"
                  ? "border-amber-900 text-amber-400 bg-amber-950/20"
                  : "border-emerald-900 text-emerald-400 bg-emerald-950/20";

              return (
                <button
                  key={status}
                  onClick={() => toggleStatus(status)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition cursor-pointer ${
                    isActive
                      ? `${badgeColors} ring-1 ring-offset-1 ring-offset-zinc-950 ring-zinc-700`
                      : "border-zinc-800 text-zinc-500 bg-zinc-900 hover:text-zinc-400"
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Entradas del Filtro de Fechas */}
        <div className="space-y-1.5 pt-1">
          <span className="text-xs font-semibold text-zinc-400 uppercase tracking-wider block">
            Rango de Fechas:
          </span>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-[10px] text-zinc-500 font-medium mb-1">Desde</p>
              <input
                type="date"
                value={startDate}
                onChange={(e) => setStartDate(e.target.value)}
                className="w-full text-xs rounded bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 select-none"
              />
            </div>
            <div>
              <p className="text-[10px] text-zinc-500 font-medium mb-1">Hasta</p>
              <input
                type="date"
                value={endDate}
                onChange={(e) => setEndDate(e.target.value)}
                className="w-full text-xs rounded bg-zinc-900 border border-zinc-800 p-1.5 text-zinc-300 focus:outline-none focus:ring-1 focus:ring-red-500 focus:border-red-500 select-none"
              />
            </div>
          </div>
        </div>
      </div>

      {/* Interfaz Seleccionadora de Pestañas */}
      <div className="flex border-b border-zinc-900 bg-zinc-950">
        <button
          onClick={() => setActiveTab("sismos")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer border-b-2 ${
            activeTab === "sismos"
              ? "border-red-500 text-white bg-zinc-900/30"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <Flame className="h-4 w-4" />
          Sismos ({events.length})
        </button>
        <button
          onClick={() => setActiveTab("reportes")}
          className={`flex-1 flex items-center justify-center gap-2 py-3 text-xs font-bold uppercase tracking-wider transition cursor-pointer border-b-2 ${
            activeTab === "reportes"
              ? "border-red-500 text-white bg-zinc-900/30"
              : "border-transparent text-zinc-500 hover:text-zinc-300"
          }`}
        >
          <MapPin className="h-4 w-4" />
          Reportes ({reports.length})
        </button>
      </div>

      {/* Tabbed Lists (Scrollable) */}
      <div className="flex-1 overflow-y-auto divide-y divide-zinc-900">
        
        {/* TAB 1: Sismos Recientes */}
        {activeTab === "sismos" && (
          <div className="p-4 space-y-3">
            {events.length === 0 ? (
              <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-zinc-850 bg-zinc-900/10">
                <AlertTriangle className="h-6 w-6 text-zinc-600" />
                <div>
                  <p className="text-sm font-semibold text-zinc-400">Sin sismos coincidentes</p>
                  <p className="text-xs text-zinc-500 mt-1">Ajusta los filtros o limpia la búsqueda.</p>
                </div>
                <button
                  onClick={onClearFilters}
                  className="mt-1 text-xs font-semibold text-red-500 hover:text-red-400 underline cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="space-y-2.5 animate-fadeIn">
                {events.map((event) => {
                  const isSelected = selectedEventId === event.id;
                  return (
                    <div
                      key={event.id}
                      onClick={() => {
                        setSelectedEventId(isSelected ? null : event.id);
                        setSelectedReportId(null);
                      }}
                      className={`p-3 rounded-lg border text-left transition duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-red-950/20 border-red-700/80 shadow-md shadow-red-950/10"
                          : "bg-zinc-900/40 border-zinc-850 hover:border-zinc-750 hover:bg-zinc-900/60"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1">
                        <h4 className="font-semibold text-sm text-zinc-100 leading-tight">
                          {event.title}
                        </h4>
                        <span className={`text-[10px] font-bold px-1.5 py-0.5 rounded leading-none ${
                          event.magnitude >= 6.0 
                            ? "bg-red-500/20 text-red-400 border border-red-500/30" 
                            : "bg-amber-500/20 text-amber-400 border border-amber-500/30"
                        }`}>
                          M {event.magnitude.toFixed(1)}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 mt-2.5 text-[11px] text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="h-3.5 w-3.5 text-zinc-500" />
                          {formatDate(event.date)}
                        </span>
                        <span>
                          Prof: {event.depth} km
                        </span>
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-red-950/80 text-xs text-red-200 space-y-1">
                          <div className="grid grid-cols-2 gap-y-1">
                            <span>Población Afectada:</span>
                            <span className="font-bold text-right">{event.affectedCount.toLocaleString()}</span>
                            <span>Viviendas Afectadas:</span>
                            <span className="font-bold text-right text-amber-400">{(event.affectedHouses || 0).toLocaleString()}</span>
                            <span>Críticos/Graves:</span>
                            <span className="font-bold text-right text-red-400">{event.victimsStatus.critical}</span>
                            <span>Región:</span>
                            <span className="font-bold text-right">{event.region}</span>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA 2: Reportes Ciudadanos */}
        {activeTab === "reportes" && (
          <div className="p-4 space-y-3">
            {reports.length === 0 ? (
              <div className="py-8 px-4 text-center flex flex-col items-center justify-center gap-2.5 rounded-lg border border-dashed border-zinc-850 bg-zinc-900/10">
                <ShieldAlert className="h-6 w-6 text-zinc-600" />
                <div>
                  <p className="text-sm font-semibold text-zinc-400">Sin reportes registrados</p>
                  <p className="text-xs text-zinc-500 mt-1">No hay reportes de ayuda que coincidan.</p>
                </div>
                <button
                  onClick={onClearFilters}
                  className="mt-1 text-xs font-semibold text-red-500 hover:text-red-400 underline cursor-pointer"
                >
                  Restablecer Filtros
                </button>
              </div>
            ) : (
              <div className="space-y-2 animate-fadeIn">
                {reports.map((report) => {
                  const isSelected = selectedReportId === report.id;
                  
                  const statusBadge =
                    report.status === "pending"
                      ? "bg-red-500/10 text-red-400 border-red-500/20"
                      : report.status === "in_progress"
                      ? "bg-amber-500/10 text-amber-400 border-amber-500/20"
                      : "bg-emerald-500/10 text-emerald-400 border-emerald-500/20";
                  
                  const statusLabel =
                    report.status === "pending"
                      ? "Pendiente"
                      : report.status === "in_progress"
                      ? "En Proceso"
                      : "Atendido";

                  return (
                    <div
                      key={report.id}
                      onClick={() => {
                        setSelectedReportId(isSelected ? null : report.id);
                        setSelectedEventId(null);
                      }}
                      className={`p-3 rounded-lg border text-left transition duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 border-zinc-650 shadow-lg"
                          : "bg-zinc-900/30 border-zinc-850 hover:border-zinc-755 hover:bg-zinc-900/50"
                      }`}
                    >
                      <div className="flex justify-between items-start mb-1.5 gap-2">
                        <span className="font-semibold text-xs text-zinc-200 truncate max-w-[150px] flex items-center gap-1">
                          <MapPin className="h-3 w-3 text-zinc-500" />
                          {report.locationName}
                        </span>
                        <span className={`text-[9px] font-semibold px-2 py-0.5 rounded-full border leading-none ${statusBadge}`}>
                          {statusLabel}
                        </span>
                      </div>

                      <p className="text-xs text-zinc-400 line-clamp-2 mb-2">
                        {report.description}
                      </p>

                      <div className="flex items-center justify-between text-[10px] text-zinc-500 pt-2 border-t border-zinc-900">
                        <span>Reporta: {report.reporterName}</span>
                        <div className="flex gap-2">
                          <span className="font-bold text-zinc-300">
                            👤 {report.affectedPeople} damn.
                          </span>
                          {(report.affectedHouses || 0) > 0 && (
                            <span className="font-bold text-amber-500">
                              🏠 {report.affectedHouses} viv.
                            </span>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="mt-2.5 pt-2 border-t border-zinc-850 text-xs text-zinc-300 space-y-1 bg-zinc-950/30 p-2 rounded">
                          <p className="text-[11px] text-zinc-400"><span className="text-zinc-500">Fecha:</span> {formatDate(report.date)}</p>
                          {report.phone && (
                            <p className="text-[11px] text-zinc-400"><span className="text-zinc-500">Contacto:</span> {report.phone}</p>
                          )}
                          <div className="flex flex-wrap gap-1 mt-2">
                            {report.needs.map((need, i) => (
                              <span key={i} className="text-[9px] bg-zinc-900 border border-zinc-800 px-1.5 py-0.5 rounded text-zinc-300 font-medium">
                                {need}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </div>
    </aside>
  );
}
