"use client";

import React from "react";
import { Activity, ShieldAlert, Users, CheckCircle2 } from "lucide-react";
import { EarthquakeEvent, VictimReport } from "../data/mockData";

interface HeaderProps {
  events: EarthquakeEvent[];
  reports: VictimReport[];
}

export default function Header({ events, reports }: HeaderProps) {
  const totalAffected = events.reduce((sum, e) => sum + e.affectedCount, 0) +
    reports.reduce((sum, r) => sum + (r.status !== "resolved" ? r.affectedPeople : 0), 0);
  
  const activeAlerts = events.length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  return (
    <header className="border-b border-zinc-800 bg-zinc-950/80 px-6 py-4 backdrop-blur-md">
      <div className="mx-auto flex max-w-7xl flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        
        {/* Título y Marca */}
        <div className="flex items-center gap-3">
          <div className="relative flex h-10 w-10 items-center justify-center rounded-lg bg-red-950 border border-red-700 text-red-500 shadow-lg shadow-red-950/20">
            <Activity className="h-5 w-5 animate-pulse" />
            <span className="absolute -top-0.5 -right-0.5 flex h-2 w-2">
              <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-red-400 opacity-75"></span>
              <span className="relative inline-flex h-2 w-2 rounded-full bg-red-500"></span>
            </span>
          </div>
          <div>
            <h1 className="text-xl font-bold tracking-tight text-white flex items-center gap-2">
              SIG-Terremotos Colombia
              <span className="inline-flex items-center gap-1 rounded bg-zinc-800 px-1.5 py-0.5 text-[10px] font-medium text-zinc-400 uppercase tracking-widest">
                Monitoreo Activo
              </span>
            </h1>
            <p className="text-xs text-zinc-400">
              Sistema de Información Geográfica de Damnificados y Gestión Logística
            </p>
          </div>
        </div>

        {/* Contadores en Vivo */}
        <div className="flex flex-wrap items-center gap-4 sm:gap-6">
          
          <div className="flex items-center gap-2 rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-1.5">
            <ShieldAlert className="h-4 w-4 text-amber-500" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Sismos Activos</p>
              <p className="text-sm font-semibold text-white">{activeAlerts}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-1.5">
            <Users className="h-4 w-4 text-red-400" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Población Afectada</p>
              <p className="text-sm font-semibold text-white">{totalAffected.toLocaleString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-2 rounded-lg bg-zinc-900/50 border border-zinc-800 px-3 py-1.5">
            <CheckCircle2 className="h-4 w-4 text-emerald-500" />
            <div>
              <p className="text-[10px] uppercase tracking-wider text-zinc-500 font-medium">Reportes Resueltos</p>
              <p className="text-sm font-semibold text-white">{resolvedCount}</p>
            </div>
          </div>

        </div>

      </div>
    </header>
  );
}
