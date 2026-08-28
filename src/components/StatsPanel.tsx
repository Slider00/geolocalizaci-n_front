"use client";

import React from "react";
import { BarChart3, AlertCircle, Sparkles, PackageCheck, X, MapPin } from "lucide-react";
import { EarthquakeEvent, VictimReport } from "../data/mockData";

interface StatsPanelProps {
  events: EarthquakeEvent[];
  selectedEvent: EarthquakeEvent | null;
  reports: VictimReport[];
  setSelectedEventId: (id: string | null) => void;
  selectedReportId: string | null;
  setSelectedReportId: (id: string | null) => void;
}

export default function StatsPanel({
  events,
  selectedEvent,
  reports,
  setSelectedEventId,
  selectedReportId,
  setSelectedReportId
}: StatsPanelProps) {
  
  // Cálculos para estadísticas globales
  const totalReportsCount = reports.length;
  const pendingReportsCount = reports.filter(r => r.status === 'pending').length;
  const inProgressReportsCount = reports.filter(r => r.status === 'in_progress').length;
  const resolvedReportsCount = reports.filter(r => r.status === 'resolved').length;

  // Calcula las necesidades de suministros globalmente (acumulando dinámicamente los sismos filtrados)
  const needSumMap: Record<string, { requested: number; delivered: number }> = {
    "Carpas/Refugio": { requested: 0, delivered: 0 },
    "Agua Potable": { requested: 0, delivered: 0 },
    "Alimentos": { requested: 0, delivered: 0 },
    "Kits de Aseo": { requested: 0, delivered: 0 },
    "Atención Médica": { requested: 0, delivered: 0 }
  };

  events.forEach(event => {
    (event.needs || []).forEach(need => {
      if (needSumMap[need.type]) {
        needSumMap[need.type].requested += need.requested || 0;
        needSumMap[need.type].delivered += need.delivered || 0;
      }
    });
  });

  const globalNeeds = [
    { type: "Carpas/Refugio", requested: needSumMap["Carpas/Refugio"].requested, delivered: needSumMap["Carpas/Refugio"].delivered, color: "bg-red-500", svgColor: "#ef4444" },
    { type: "Agua Potable", requested: needSumMap["Agua Potable"].requested, delivered: needSumMap["Agua Potable"].delivered, color: "bg-blue-500", svgColor: "#3b82f6" },
    { type: "Alimentos", requested: needSumMap["Alimentos"].requested, delivered: needSumMap["Alimentos"].delivered, color: "bg-amber-500", svgColor: "#f59e0b" },
    { type: "Kits de Aseo", requested: needSumMap["Kits de Aseo"].requested, delivered: needSumMap["Kits de Aseo"].delivered, color: "bg-teal-500", svgColor: "#14b8a6" },
    { type: "Atención Médica", requested: needSumMap["Atención Médica"].requested, delivered: needSumMap["Atención Médica"].delivered, color: "bg-purple-500", svgColor: "#a855f7" }
  ].filter(n => n.requested > 0);

  // Estadísticas específicas del sismo seleccionado
  const event = selectedEvent;

  // Filtra reportes asociados a este sismo específico
  const associatedReports = event ? reports.filter(r => r.earthquakeId === event.id) : [];

  return (
    <section className="w-full lg:w-96 border-l border-zinc-800 bg-zinc-950 flex flex-col h-full overflow-y-auto p-4 gap-6 select-none">
      
      {event ? (
        // Vista de Estadísticas Específicas del Sismo
        <div className="space-y-6 animate-fadeIn">
          
          {/* Información de la cabecera */}
          <div className="flex justify-between items-start gap-4">
            <div>
              <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">
                <AlertCircle className="h-3.5 w-3.5 text-red-500" />
                Detalles de Emergencia
              </div>
              <h3 className="text-lg font-bold text-white leading-snug">
                {event.title}
              </h3>
              <p className="text-xs text-zinc-400 mt-1">
                Epicentro registrado en la región de {event.region}.
              </p>
            </div>
            <button
              onClick={() => setSelectedEventId(null)}
              className="p-1 rounded bg-zinc-900 border border-zinc-800 text-zinc-400 hover:text-white hover:bg-zinc-800 transition cursor-pointer shrink-0"
              title="Cerrar detalle de sismo"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          {/* Cuadrícula de Métricas Rápidas */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Magnitud</span>
              <p className="text-xl font-bold text-red-400 mt-0.5">Mw {event.magnitude.toFixed(1)}</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3">
              <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider">Profundidad</span>
              <p className="text-xl font-bold text-zinc-300 mt-0.5">{event.depth} km</p>
            </div>
            <div className="bg-zinc-900/50 border border-zinc-800 rounded-lg p-3 col-span-2 flex justify-between items-center">
              <div>
                <span className="text-[10px] text-zinc-500 font-semibold uppercase tracking-wider block">Viviendas Afectadas</span>
                <p className="text-xl font-bold text-amber-500 mt-0.5">{(event.affectedHouses || 0).toLocaleString()}</p>
              </div>
              <div className="h-9 w-9 rounded bg-amber-950/40 border border-amber-900/35 flex items-center justify-center text-amber-500">
                🏠
              </div>
            </div>
          </div>

          {/* Estado de Afectados / Distribución proporcional con barras personalizadas */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-lg p-4 space-y-3.5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex justify-between">
              <span>Estado de Afectados</span>
              <span className="text-zinc-200">Total: {event.affectedCount.toLocaleString()}</span>
            </h4>
            
            {/* Barra visual de segmentos múltiples */}
            <div className="h-2.5 w-full rounded-full bg-zinc-800 overflow-hidden flex">
              <div 
                style={{ width: `${(event.victimsStatus.critical / event.affectedCount) * 100}%` }}
                className="h-full bg-red-500"
              />
              <div 
                style={{ width: `${(event.victimsStatus.minor / event.affectedCount) * 100}%` }}
                className="h-full bg-amber-500"
              />
              <div 
                style={{ width: `${(event.victimsStatus.safe / event.affectedCount) * 100}%` }}
                className="h-full bg-emerald-500"
              />
            </div>

            {/* Leyenda con porcentajes */}
            <div className="space-y-1.5 text-xs">
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-red-500"></span>
                  Grave/Crítico
                </span>
                <span className="font-semibold text-zinc-200">
                  {event.victimsStatus.critical} ({((event.victimsStatus.critical / event.affectedCount) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-amber-500"></span>
                  Lesiones Leves
                </span>
                <span className="font-semibold text-zinc-200">
                  {event.victimsStatus.minor} ({((event.victimsStatus.minor / event.affectedCount) * 100).toFixed(1)}%)
                </span>
              </div>
              <div className="flex items-center justify-between">
                <span className="flex items-center gap-1.5 text-zinc-400">
                  <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                  Fuera de Peligro
                </span>
                <span className="font-semibold text-zinc-200">
                  {event.victimsStatus.safe} ({((event.victimsStatus.safe / event.affectedCount) * 100).toFixed(1)}%)
                </span>
              </div>
            </div>
          </div>

          {/* Seguimiento de Ayuda Humanitaria */}
          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider flex items-center gap-1.5">
              <PackageCheck className="h-4 w-4 text-emerald-500" />
              Suministros Humanitarios
            </h4>

            <div className="space-y-3">
              {event.needs.map((need, idx) => {
                const percent = (need.delivered / need.requested) * 100;
                return (
                  <div key={idx} className="bg-zinc-900/30 border border-zinc-800/50 rounded-lg p-3 space-y-2">
                    <div className="flex justify-between items-center text-xs">
                      <span className="font-medium text-zinc-300">{need.type}</span>
                      <span className="text-zinc-400 font-semibold">
                        {need.delivered.toLocaleString()} / {need.requested.toLocaleString()} <span className="text-[10px] text-zinc-500">{need.unit}</span>
                      </span>
                    </div>

                    <div className="w-full bg-zinc-800 rounded-full h-1.5 overflow-hidden">
                      <div 
                        style={{ width: `${percent}%` }}
                        className="h-full bg-emerald-500 rounded-full transition-all duration-550"
                      />
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          <div className="space-y-3">
            <h4 className="text-xs font-bold text-zinc-450 uppercase tracking-wider flex items-center gap-1">
              <MapPin className="h-4 w-4 text-zinc-500" />
              Reportes en Zona ({associatedReports.length})
            </h4>

            {associatedReports.length === 0 ? (
              <p className="text-xs text-zinc-500 italic py-2">
                No hay reportes de ayuda vinculados directamente a esta zona.
              </p>
            ) : (
              <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
                {associatedReports.map((report) => {
                  const isSelected = selectedReportId === report.id;
                  return (
                    <div
                      key={report.id}
                      onClick={() => setSelectedReportId(isSelected ? null : report.id)}
                      className={`p-2.5 rounded-lg border text-left text-xs transition duration-200 cursor-pointer ${
                        isSelected
                          ? "bg-zinc-900 border-zinc-500 shadow-md"
                          : "bg-zinc-900/20 border-zinc-850 hover:border-zinc-750 hover:bg-zinc-900/40"
                      }`}
                    >
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-zinc-200">{report.locationName}</span>
                        <div className="flex gap-1.5">
                          <span className="font-bold text-[9px] text-zinc-400 bg-zinc-800 px-1.5 py-0.5 rounded shrink-0">
                            👤 {report.affectedPeople}
                          </span>
                          {(report.affectedHouses || 0) > 0 && (
                            <span className="font-bold text-[9px] text-amber-500/85 bg-amber-950/40 border border-amber-900/30 px-1.5 py-0.5 rounded shrink-0">
                              🏠 {report.affectedHouses}
                            </span>
                          )}
                        </div>
                      </div>
                      <p className="text-[11px] text-zinc-400 line-clamp-2 leading-relaxed">
                        {report.description}
                      </p>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>
      ) : (
        // Analíticas Globales del Portal
        <div className="space-y-6">
          
          <div>
            <div className="flex items-center gap-2 text-zinc-500 text-xs font-semibold uppercase tracking-wider mb-1">
              <BarChart3 className="h-3.5 w-3.5 text-blue-400" />
              Consolidado Nacional
            </div>
            <h3 className="text-lg font-bold text-white">
              Ayuda Humanitaria
            </h3>
            <p className="text-xs text-zinc-400 mt-1">
              Estadísticas consolidadas de necesidades reportadas y entregadas en Colombia.
            </p>
          </div>

          {/* Tarjetas de resumen de reportes ciudadanos */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-lg p-4 space-y-3.5">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Resumen de Reportes Ciudadanos
            </h4>
            <div className="grid grid-cols-3 gap-2 text-center">
              <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
                <span className="text-[10px] text-red-400 block font-semibold">Pendientes</span>
                <span className="text-lg font-bold text-white mt-1 block">{pendingReportsCount}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
                <span className="text-[10px] text-amber-400 block font-semibold">En Proceso</span>
                <span className="text-lg font-bold text-white mt-1 block">{inProgressReportsCount}</span>
              </div>
              <div className="bg-zinc-950 border border-zinc-800 rounded p-2">
                <span className="text-[10px] text-emerald-400 block font-semibold">Atendidos</span>
                <span className="text-lg font-bold text-white mt-1 block">{resolvedReportsCount}</span>
              </div>
            </div>
          </div>

          {/* Gráfica de Recursos Personalizada en SVG */}
          <div className="bg-zinc-900/40 border border-zinc-850 rounded-lg p-4 space-y-4">
            <h4 className="text-xs font-bold text-zinc-400 uppercase tracking-wider">
              Solicitud de Ayuda vs Despliegue
            </h4>

            {/* Gráfica de Barras Personalizada en SVG */}
            <div className="w-full">
              <svg viewBox="0 0 300 160" className="w-full h-auto">
                {/* Líneas horizontales */}
                <line x1="40" y1="20" x2="280" y2="20" stroke="#27272a" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="60" x2="280" y2="60" stroke="#27272a" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="100" x2="280" y2="100" stroke="#27272a" strokeWidth="1" strokeDasharray="3,3" />
                <line x1="40" y1="130" x2="280" y2="130" stroke="#3f3f46" strokeWidth="1" />

                {/* Etiquetas del eje Y */}
                <text x="32" y="24" fill="#71717a" fontSize="8" textAnchor="end">100%</text>
                <text x="32" y="64" fill="#71717a" fontSize="8" textAnchor="end">50%</text>
                <text x="32" y="104" fill="#71717a" fontSize="8" textAnchor="end">20%</text>
                <text x="32" y="134" fill="#71717a" fontSize="8" textAnchor="end">0%</text>

                {/* Renderizado de las barras de la gráfica */}
                {globalNeeds.map((need, idx) => {
                  const x = 55 + idx * 55;
                  const ratio = need.delivered / need.requested;
                  const barHeight = ratio * 100; // altura máxima es 100px
                  const y = 130 - barHeight;

                  return (
                    <g key={idx}>
                      {/* Barra de fondo para ayuda solicitada */}
                      <rect 
                        x={x} 
                        y="30" 
                        width="18" 
                        height="100" 
                        rx="2"
                        fill="#1f1f23" 
                      />
                      
                      {/* Barra frontal para ayuda entregada */}
                      <rect 
                        x={x} 
                        y={y} 
                        width="18" 
                        height={barHeight} 
                        rx="2"
                        fill={need.svgColor} 
                        className="transition-all duration-1000"
                      />

                      {/* Porcentaje emergente (tooltip) */}
                      <text 
                        x={x + 9} 
                        y={y - 4} 
                        fill="#e4e4e7" 
                        fontSize="8" 
                        fontWeight="bold"
                        textAnchor="middle"
                      >
                        {(ratio * 100).toFixed(0)}%
                      </text>
                    </g>
                  );
                })}
              </svg>
            </div>

            {/* Leyenda de la Gráfica */}
            <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 pt-2 border-t border-zinc-800 text-[10px]">
              {globalNeeds.map((need, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <span className={`h-2.5 w-2.5 rounded ${need.color}`} />
                  <span className="text-zinc-400 truncate">{need.type}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Consejo Informativo Rápido */}
          <div className="rounded-lg border border-blue-900/30 bg-blue-950/10 p-3.5 flex items-start gap-2.5">
            <Sparkles className="h-4 w-4 text-blue-400 shrink-0 mt-0.5" />
            <div className="text-xs text-blue-300">
              <h5 className="font-semibold text-blue-200 mb-0.5">Tip de Navegación</h5>
              Puedes hacer doble clic en cualquier punto del mapa para abrir el formulario de reporte de damnificados con esas coordenadas pre-cargadas automáticamente.
            </div>
          </div>

        </div>
      )}

    </section>
  );
}
