"use client";

import React, { useState, useEffect } from "react";
import { AlertTriangle, Database } from "lucide-react";
import Header from "../components/Header";
import Sidebar from "../components/Sidebar";
import StatsPanel from "../components/StatsPanel";
import ReportForm from "../components/ReportForm";
import dynamic from "next/dynamic";
import { EarthquakeEvent, VictimReport } from "../data/mockData";

// Carga dinámica del componente Map para evitar errores de compilación con SSR de Next.js
const MapInstance = dynamic(() => import("../components/Map"), {
  ssr: false,
  loading: () => (
    <div className="flex-1 w-full h-full bg-zinc-950 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-10 w-10 border-2 border-zinc-800 border-t-red-500"></div>
        <span className="text-xs text-zinc-500 font-medium">Cargando visor cartográfico...</span>
      </div>
    </div>
  )
});

export default function DashboardPage() {
  // URLs de la API del Servidor Backend
  const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000";

  // Estados globales de colecciones
  const [events, setEvents] = useState<EarthquakeEvent[]>([]);
  const [reports, setReports] = useState<VictimReport[]>([]);

  // Estados de carga y error de red
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados de selección activa
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);

  // Estados de filtros
  const [searchText, setSearchText] = useState("");
  const [minMagnitude, setMinMagnitude] = useState(3.0);
  const [selectedStatuses, setSelectedStatuses] = useState<VictimReport["status"][]>([
    "pending",
    "in_progress",
    "resolved"
  ]);

  // Retorna la fecha de hoy en formato AAAA-MM-DD
  const getTodayDateString = () => {
    const d = new Date();
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Estados del Formulario de Reportes y Toasts
  const [isReportFormOpen, setIsReportFormOpen] = useState(false);
  const [clickedCoords, setClickedCoords] = useState<{ lat: number; lng: number } | null>(null);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Estados de filtro por rango de fechas inicializados para el día de hoy
  const [startDate, setStartDate] = useState<string>(getTodayDateString());
  const [endDate, setEndDate] = useState<string>(getTodayDateString());

  // Descarga todos los datos desde el backend
  const fetchData = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const [resEvents, resReports] = await Promise.all([
        fetch(`${API_URL}/api/earthquakes`),
        fetch(`${API_URL}/api/reports`)
      ]);
      
      if (!resEvents.ok || !resReports.ok) {
        throw new Error("Servidor API devolvió un código de error.");
      }
      
      const dataEvents = await resEvents.json();
      const dataReports = await resReports.json();
      
      setEvents(dataEvents);
      setReports(dataReports);
    } catch (err) {
      console.error(err);
      setError("No se pudo establecer conexión con el backend de mapas. ¿Está corriendo el servidor en el puerto 4000?");
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, [API_URL]);

  // Manejador del Sembrador de la Base de Datos
  const handleSeedDatabase = async () => {
    try {
      setIsLoading(true);
      setError(null);
      
      const res = await fetch(`${API_URL}/api/earthquakes/seed`, {
        method: "POST"
      });

      if (!res.ok) {
        throw new Error("No se pudo sembrar la base de datos.");
      }

      await fetchData(); // Recarga los sismos

      setToastMessage("¡Base de datos sembrada con datos de sismos en Colombia!");
      setTimeout(() => setToastMessage(null), 4500);
    } catch (err) {
      console.error(err);
      setError("Error de red al intentar sembrar datos en MongoDB.");
      setIsLoading(false);
    }
  };

  // Manejadores de Filtros
  const toggleStatus = (status: 'pending' | 'in_progress' | 'resolved') => {
    setSelectedStatuses((prev) =>
      prev.includes(status) ? prev.filter((s) => s !== status) : [...prev, status]
    );
  };

  const handleClearFilters = () => {
    setSearchText("");
    setMinMagnitude(3.0);
    setStartDate("");
    setEndDate("");
    setSelectedStatuses(["pending", "in_progress", "resolved"]);
  };

  // Manejador de envíos para publicar datos en Express + MongoDB
  const handleAddReport = async (newReportData: Omit<VictimReport, "id" | "date">) => {
    try {
      const response = await fetch(`${API_URL}/api/reports`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify(newReportData)
      });

      if (!response.ok) {
        throw new Error("No se pudo registrar el reporte.");
      }

      await fetchData(); // Recarga reportes y sismos consolidados
      setToastMessage("¡Reporte de ayuda enviado con éxito a la defensa civil!");
      setTimeout(() => setToastMessage(null), 4500);
    } catch (error) {
      console.error(error);
      alert("No se pudo conectar al servidor Express para guardar el reporte.");
    }
  };

  // Captura el doble clic en el mapa
  const handleMapDoubleClick = (latlng: { lat: number; lng: number }) => {
    setClickedCoords(latlng);
    setIsReportFormOpen(true);
  };

  // Retorna la fecha local en formato AAAA-MM-DD
  const getLocalDateString = (isoString: string) => {
    const d = new Date(isoString);
    const year = d.getFullYear();
    const month = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  };

  // Filtra Sismos y Reportes en memoria RAM
  const filteredEvents = events.filter((e) => {
    const matchesMag = e.magnitude >= minMagnitude;
    const matchesSearch =
      searchText === "" ||
      e.title.toLowerCase().includes(searchText.toLowerCase()) ||
      e.region.toLowerCase().includes(searchText.toLowerCase());

    const eventDateStr = getLocalDateString(e.date);
    const matchesStartDate = !startDate ? true : eventDateStr >= startDate;
    const matchesEndDate = !endDate ? true : eventDateStr <= endDate;

    return matchesMag && matchesSearch && matchesStartDate && matchesEndDate;
  });

  const filteredReports = reports.filter((r) => {
    const matchesStatus = selectedStatuses.includes(r.status);
    const matchesSearch =
      searchText === "" ||
      r.locationName.toLowerCase().includes(searchText.toLowerCase()) ||
      r.reporterName.toLowerCase().includes(searchText.toLowerCase()) ||
      r.description.toLowerCase().includes(searchText.toLowerCase());

    const reportDateStr = getLocalDateString(r.date);
    const matchesStartDate = !startDate ? true : reportDateStr >= startDate;
    const matchesEndDate = !endDate ? true : reportDateStr <= endDate;

    return matchesStatus && matchesSearch && matchesStartDate && matchesEndDate;
  });

  const activeSelectedEvent = events.find((e) => e.id === selectedEventId) || null;

  return (
    <div className="flex flex-col h-screen w-screen bg-zinc-950 overflow-hidden text-zinc-100 font-sans">
      
      {/* 1. Cabecera Banner */}
      <Header events={filteredEvents} reports={filteredReports} />

      {/* Pantalla de Carga */}
      {isLoading && (
        <div className="absolute inset-0 z-[9999] bg-zinc-950/80 backdrop-blur-md flex items-center justify-center">
          <div className="flex flex-col items-center gap-3">
            <div className="animate-spin rounded-full h-12 w-12 border-2 border-zinc-800 border-t-red-500"></div>
            <span className="text-sm font-semibold tracking-wider animate-pulse text-zinc-300">Conectando a base de datos...</span>
          </div>
        </div>
      )}

      {/* Pantalla de error de conexión a la base de datos */}
      {error && !isLoading && (
        <div className="absolute inset-0 z-[9999] bg-zinc-950/95 flex items-center justify-center p-6 text-center select-none">
          <div className="max-w-md glass-panel p-6 rounded-xl border-red-900/30 bg-red-950/5 space-y-4 shadow-2xl">
            <AlertTriangle className="h-12 w-12 text-red-500 mx-auto animate-bounce" />
            <h3 className="text-lg font-bold text-white">Servidor Desconectado</h3>
            <p className="text-xs text-zinc-400 leading-relaxed">
              {error}
            </p>
            <div className="pt-2 flex flex-col gap-2">
              <button
                onClick={fetchData}
                className="w-full bg-zinc-900 hover:bg-zinc-850 border border-zinc-800 py-2.5 rounded font-semibold text-xs transition cursor-pointer text-zinc-200"
              >
                Reintentar Conexión
              </button>
              <button
                onClick={handleSeedDatabase}
                className="w-full flex items-center justify-center gap-2 rounded bg-red-900/20 hover:bg-red-900/35 border border-red-800/50 py-2.5 text-sm font-semibold text-red-400 transition cursor-pointer"
              >
                <Database className="h-4 w-4" />
                Sembrar Base de Datos Local
              </button>
            </div>
          </div>
        </div>
      )}

      {/* 2. Cuadrícula de Trabajo */}
      <div className="flex flex-col lg:flex-row flex-1 overflow-hidden">
        
        {/* Barra Lateral Izquierda */}
        <Sidebar
          events={filteredEvents}
          reports={filteredReports}
          selectedEventId={selectedEventId}
          setSelectedEventId={setSelectedEventId}
          selectedReportId={selectedReportId}
          setSelectedReportId={setSelectedReportId}
          minMagnitude={minMagnitude}
          setMinMagnitude={setMinMagnitude}
          searchText={searchText}
          setSearchText={setSearchText}
          selectedStatuses={selectedStatuses}
          toggleStatus={toggleStatus}
          onOpenReportForm={() => {
            setClickedCoords(null);
            setIsReportFormOpen(true);
          }}
          onClearFilters={handleClearFilters}
          startDate={startDate}
          setStartDate={setStartDate}
          endDate={endDate}
          setEndDate={setEndDate}
        />

        {/* Espacio de Trabajo Central del Mapa */}
        <div className="flex-1 relative h-[50vh] lg:h-full">
          {/* Banner de sembrado si la base de datos tiene 0 registros */}
          {events.length === 0 && reports.length === 0 && !isLoading && !error && (
            <div className="absolute top-16 left-1/2 -translate-x-1/2 z-[400] glass-panel bg-zinc-950/90 border border-red-950/80 px-4 py-3 rounded-xl shadow-xl flex items-center gap-4 text-xs">
              <span className="text-zinc-300">📭 Base de datos vacía. ¿Quieres sembrar datos de prueba de Colombia?</span>
              <button 
                onClick={handleSeedDatabase}
                className="bg-red-600 hover:bg-red-700 text-white font-bold px-3 py-1.5 rounded transition cursor-pointer"
              >
                Sembrar Datos
              </button>
            </div>
          )}

          <MapInstance
            events={filteredEvents}
            reports={filteredReports}
            selectedEventId={selectedEventId}
            selectedReportId={selectedReportId}
            setSelectedEventId={setSelectedEventId}
            setSelectedReportId={setSelectedReportId}
            onMapDoubleClick={handleMapDoubleClick}
          />
        </div>

        {/* Barra Lateral Derecha de Estadísticas */}
        <StatsPanel
          events={filteredEvents}
          selectedEvent={activeSelectedEvent}
          reports={filteredReports}
          setSelectedEventId={setSelectedEventId}
          selectedReportId={selectedReportId}
          setSelectedReportId={setSelectedReportId}
        />

      </div>

      {/* 3. Modal Desplizable de Formulario */}
      <ReportForm
        isOpen={isReportFormOpen}
        onClose={() => setIsReportFormOpen(false)}
        onSubmit={handleAddReport}
        clickedCoords={clickedCoords}
      />

      {/* 4. Notificación Emergente Interactiva (Toast) */}
      {toastMessage && (
        <div className="fixed top-5 right-5 z-[9999] glass-panel bg-emerald-950/85 border border-emerald-500/50 px-4 py-3.5 rounded-lg shadow-xl shadow-black/40 flex items-center gap-3 animate-fadeIn">
          <div className="h-2 w-2 rounded-full bg-emerald-400 animate-ping"></div>
          <span className="text-xs font-semibold text-emerald-200">
            {toastMessage}
          </span>
        </div>
      )}

    </div>
  );
}
