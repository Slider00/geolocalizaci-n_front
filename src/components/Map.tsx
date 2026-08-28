"use client";

import React, { useEffect, useRef, useState } from "react";
import L from "leaflet";
import { EarthquakeEvent, VictimReport } from "../data/mockData";

interface MapProps {
  events: EarthquakeEvent[];
  reports: VictimReport[];
  selectedEventId: string | null;
  selectedReportId: string | null;
  setSelectedEventId: (id: string | null) => void;
  setSelectedReportId: (id: string | null) => void;
  onMapDoubleClick: (coords: { lat: number; lng: number }) => void;
}

export default function Map({
  events,
  reports,
  selectedEventId,
  selectedReportId,
  setSelectedEventId,
  setSelectedReportId,
  onMapDoubleClick
}: MapProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<L.Map | null>(null);
  const markersGroupRef = useRef<L.FeatureGroup | null>(null);

  // Mouse coords tracking state
  const [mouseCoords, setMouseCoords] = useState<{ lat: number; lng: number } | null>(null);

  // Initialize Map
  useEffect(() => {
    if (!mapContainerRef.current || mapRef.current) return;

    // Centered in Colombia
    const map = L.map(mapContainerRef.current, {
      center: [4.5709, -74.2973],
      zoom: 6,
      zoomControl: false
    });

    // Dark-matter premium tiles Esri (Keyless)
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Base/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    }).addTo(map);

    // Labels Reference layer on top
    L.tileLayer("https://server.arcgisonline.com/ArcGIS/rest/services/Canvas/World_Dark_Gray_Reference/MapServer/tile/{z}/{y}/{x}", {
      attribution: 'Tiles &copy; Esri &mdash; Esri, DeLorme, NAVTEQ',
      maxZoom: 16
    }).addTo(map);

    // Zoom buttons in a nicer position
    L.control.zoom({ position: "bottomright" }).addTo(map);

    // Layer group for dynamic markers
    const markersGroup = L.featureGroup().addTo(map);
    markersGroupRef.current = markersGroup;
    mapRef.current = map;

    // Double-click handler to trigger report creation
    map.on("dblclick", (e: L.LeafletMouseEvent) => {
      onMapDoubleClick({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    // Mousemove handler to show current coordinates
    map.on("mousemove", (e: L.LeafletMouseEvent) => {
      setMouseCoords({ lat: e.latlng.lat, lng: e.latlng.lng });
    });

    return () => {
      map.remove();
      mapRef.current = null;
    };
  }, [onMapDoubleClick]);

  // Sync Markers and layers with state
  useEffect(() => {
    const map = mapRef.current;
    const markersGroup = markersGroupRef.current;
    if (!map || !markersGroup) return;

    // Clear previous markers
    markersGroup.clearLayers();

    // 1. Draw Earthquake Epicenters
    events.forEach((event) => {
      const isSelected = selectedEventId === event.id;
      
      const size = Math.max(50, Math.round(event.magnitude * 16));
      const color = event.magnitude >= 6.0 ? "#ef4444" : event.magnitude >= 5.0 ? "#f97316" : "#eab308";

      const seismicIcon = L.divIcon({
        className: "bg-transparent",
        html: `
          <div class="seismic-wave-container" style="width: ${size}px; height: ${size}px; color: ${color};">
            <div class="seismic-ring"></div>
            <div class="seismic-ring seismic-ring-delay-1"></div>
            <div class="seismic-ring seismic-ring-delay-2"></div>
            <div class="seismic-core" style="color: ${color};"></div>
            ${isSelected ? `
            <div class="seismic-target-box">
              <div class="seismic-target-corner target-tl"></div>
              <div class="seismic-target-corner target-tr"></div>
              <div class="seismic-target-corner target-bl"></div>
              <div class="seismic-target-corner target-br"></div>
            </div>
            ` : ""}
          </div>
        `,
        iconSize: [size, size],
        iconAnchor: [size / 2, size / 2]
      });

      const marker = L.marker([event.lat, event.lng], { icon: seismicIcon });

      const popupHtml = `
        <div style="font-family: inherit;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #ffffff;">${event.title}</h4>
          <div style="font-size: 11px; color: #a1a1aa; display: flex; flex-direction: column; gap: 2px;">
            <span>Magnitud: <strong style="color: ${color};">Mw ${event.magnitude.toFixed(1)}</strong></span>
            <span>Profundidad: <strong>${event.depth} km</strong></span>
            <span>Afectados: <strong style="color: #e4e4e7;">${event.affectedCount.toLocaleString()}</strong></span>
          </div>
          <div style="margin-top: 8px; font-size: 10px; color: #71717a; border-top: 1px solid #27272a; padding-top: 4px;">
            Haz clic para ver analíticas detalladas.
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        setSelectedEventId(event.id);
        setSelectedReportId(null);
      });

      markersGroup.addLayer(marker);
    });

    // 2. Draw Local Victim Reports
    reports.forEach((report) => {
      const isSelected = selectedReportId === report.id;
      
      const statusColor =
        report.status === "pending"
          ? "#ef4444" // red
          : report.status === "in_progress"
          ? "#f59e0b" // orange
          : "#10b981"; // emerald

      const reportIcon = L.divIcon({
        className: "bg-transparent",
        html: `
          <div class="flex items-center justify-center" style="width: 24px; height: 24px;">
            <div class="relative flex items-center justify-center rounded-full border shadow-md transition-transform" 
                 style="width: ${isSelected ? "20px" : "14px"}; height: ${isSelected ? "20px" : "14px"}; 
                        background-color: ${statusColor}; border-color: #ffffff; 
                        transform: ${isSelected ? "scale(1.2)" : "scale(1)"};">
              <div class="h-1.5 w-1.5 rounded-full bg-white"></div>
              ${isSelected ? `
              <span class="absolute inline-flex h-full w-full rounded-full opacity-40 animate-ping" 
                    style="background-color: ${statusColor};"></span>
              ` : ""}
            </div>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([report.lat, report.lng], { icon: reportIcon });

      const statusText =
        report.status === "pending"
          ? "Pendiente"
          : report.status === "in_progress"
          ? "En Proceso"
          : "Atendido";

      const popupHtml = `
        <div style="font-family: inherit;">
          <h4 style="margin: 0 0 4px 0; font-size: 13px; font-weight: bold; color: #ffffff;">Reporte: ${report.locationName}</h4>
          <p style="margin: 0 0 6px 0; font-size: 11px; color: #d4d4d8; line-height: 1.3;">${report.description}</p>
          <div style="font-size: 11px; color: #a1a1aa; display: flex; flex-direction: column; gap: 2px;">
            <span>Reporta: <strong>${report.reporterName}</strong></span>
            <span>Damnificados: <strong style="color: #f4f4f5;">${report.affectedPeople}</strong></span>
            <span>Estado: <strong style="color: ${statusColor};">${statusText}</strong></span>
          </div>
        </div>
      `;

      marker.bindPopup(popupHtml);

      marker.on("click", () => {
        setSelectedReportId(report.id);
        setSelectedEventId(null);
      });

      markersGroup.addLayer(marker);
    });

  }, [events, reports, selectedEventId, selectedReportId, setSelectedEventId, setSelectedReportId]);

  // Handle flyTo adjustments when selected elements change
  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (selectedEventId) {
      const activeEvent = events.find((e) => e.id === selectedEventId);
      if (activeEvent) {
        map.flyTo([activeEvent.lat, activeEvent.lng], 9, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      }
    } else if (selectedReportId) {
      const activeReport = reports.find((r) => r.id === selectedReportId);
      if (activeReport) {
        map.flyTo([activeReport.lat, activeReport.lng], 12, {
          duration: 1.5,
          easeLinearity: 0.25
        });
      }
    }
  }, [selectedEventId, selectedReportId, events, reports]);

  return (
    <div className="relative flex-1 w-full h-full bg-zinc-950 overflow-hidden dark-map">
      {/* Map Container Element */}
      <div ref={mapContainerRef} className="w-full h-full" />
      
      {/* Double click instruction overlay */}
      <div className="absolute top-4 left-4 z-[400] glass-panel px-3 py-1.5 rounded-lg pointer-events-none text-[10px] text-zinc-300">
        📌 Doble clic en el mapa para reportar una emergencia en esa coordenada.
      </div>

      {/* Legend overlay */}
      <div className="absolute bottom-4 left-4 z-[400] glass-panel p-3 rounded-lg text-xs space-y-2 pointer-events-auto bg-zinc-950/80 border border-zinc-800/80 select-none">
        <h4 className="font-bold text-zinc-300 border-b border-zinc-800/50 pb-1 mb-1.5 uppercase text-[9px] tracking-wider">Leyenda SIG</h4>
        
        <div className="space-y-1.5 text-zinc-400">
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-red-500/20 border border-red-500 inline-block"></span>
            <span>Sismo Fuerte (&ge; 6.0 Mw)</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-3 w-3 rounded-full bg-amber-500/20 border border-amber-500 inline-block"></span>
            <span>Sismo Moderado (&lt; 6.0 Mw)</span>
          </div>
          <div className="h-px bg-zinc-900/50 my-1"></div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#ef4444] border border-white inline-block"></span>
            <span>Reporte Pendiente</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#f59e0b] border border-white inline-block"></span>
            <span>Reporte En Proceso</span>
          </div>
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#10b981] border border-white inline-block"></span>
            <span>Reporte Atendido</span>
          </div>
        </div>
      </div>

      {/* Coordinate tracker */}
      {mouseCoords && (
        <div className="absolute bottom-4 right-4 z-[400] glass-panel px-2.5 py-1 rounded text-[10px] text-zinc-400 font-mono pointer-events-none bg-zinc-950/80 border border-zinc-800/80">
          Lat: {mouseCoords.lat.toFixed(5)} | Lng: {mouseCoords.lng.toFixed(5)}
        </div>
      )}
    </div>
  );
}
