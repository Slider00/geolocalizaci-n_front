import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { VictimReport } from "../data/mockData";

/**
 * Formatea una cadena de fecha a formato legible
 */
const formatDate = (dateStr: string) => {
  try {
    const d = new Date(dateStr);
    return d.toLocaleString("es-CO", {
      dateStyle: "medium",
      timeStyle: "short"
    });
  } catch {
    return dateStr;
  }
};

/**
 * Genera y descarga una Ficha Técnica Individual de un Reporte de Damnificados en PDF
 */
export const generateSingleReportPDF = (report: VictimReport) => {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4"
  });

  const statusText =
    report.status === "pending"
      ? "PENDIENTE"
      : report.status === "in_progress"
      ? "EN PROCESO"
      : "ATENDIDO";

  // Header Banner
  doc.setFillColor(24, 24, 27); // Dark background (zinc-900)
  doc.rect(0, 0, 210, 38, "F");

  // Red Accent Strip
  doc.setFillColor(220, 38, 38); // Red-600
  doc.rect(0, 38, 210, 3, "F");

  // Header Text
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PORTAL GEOGRÁFICO SIG DE SISMOS Y EMERGENCIAS", 14, 16);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(212, 212, 216);
  doc.text("FICHA TÉCNICA OFICIAL DE ATENCIÓN A DAMNIFICADOS", 14, 24);

  doc.setFontSize(9);
  doc.setTextColor(161, 161, 170);
  doc.text(`Fecha de generación: ${new Date().toLocaleString("es-CO")} | ID: ${report.id}`, 14, 31);

  // Status Badge Box
  let badgeColor = [220, 38, 38]; // Red for pending
  if (report.status === "in_progress") badgeColor = [217, 119, 6]; // Amber
  if (report.status === "resolved") badgeColor = [16, 185, 129]; // Emerald

  doc.setFillColor(badgeColor[0], badgeColor[1], badgeColor[2]);
  doc.roundedRect(150, 12, 46, 14, 3, 3, "F");
  doc.setTextColor(255, 255, 255);
  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");
  doc.text(statusText, 173, 21, { align: "center" });

  let currentY = 50;

  // Title Section
  doc.setTextColor(24, 24, 27);
  doc.setFontSize(14);
  doc.setFont("helvetica", "bold");
  doc.text(`Ubicación: ${report.locationName}`, 14, currentY);

  currentY += 8;

  // Metadata Table
  autoTable(doc, {
    startY: currentY,
    theme: "grid",
    headStyles: {
      fillColor: [39, 39, 42],
      textColor: [255, 255, 255],
      fontStyle: "bold"
    },
    body: [
      ["Reportante:", report.reporterName, "Contacto:", report.phone || "No especificado"],
      ["Coordenadas SIG:", `Lat: ${report.lat.toFixed(5)}, Lng: ${report.lng.toFixed(5)}`, "Fecha Reporte:", formatDate(report.date)],
      ["Personas Afectadas:", `${report.affectedPeople} personas`, "Viviendas Afectadas:", `${report.affectedHouses || 0} viviendas`],
      ["Necesidades:", report.needs.join(", ") || "Ninguna registrada", "Estado Sistema:", statusText]
    ],
    styles: { fontSize: 9, cellPadding: 3.5 },
    columnStyles: {
      0: { fontStyle: "bold", cellWidth: 38 },
      1: { cellWidth: 60 },
      2: { fontStyle: "bold", cellWidth: 38 },
      3: { cellWidth: 46 }
    }
  });

  currentY = (doc as any).lastAutoTable.finalY + 10;

  // Description Section
  doc.setFontSize(11);
  doc.setFont("helvetica", "bold");
  doc.setTextColor(24, 24, 27);
  doc.text("Descripción de la Afectación y Evidencia Comunitarias:", 14, currentY);

  currentY += 6;

  doc.setFontSize(9.5);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(51, 51, 51);
  const splitDescription = doc.splitTextToSize(report.description, 180);
  doc.text(splitDescription, 14, currentY);

  currentY += splitDescription.length * 5 + 8;

  // Images Section (if present)
  if (report.images && report.images.length > 0) {
    if (currentY > 230) {
      doc.addPage();
      currentY = 20;
    }

    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(220, 38, 38);
    doc.text(`Fotografías de Evidencia Adjuntas (${report.images.length})`, 14, currentY);

    currentY += 6;

    let imgX = 14;
    const imgWidth = 55;
    const imgHeight = 40;

    report.images.forEach((imgData, index) => {
      try {
        if (imgX + imgWidth > 196) {
          imgX = 14;
          currentY += imgHeight + 6;
        }

        if (currentY + imgHeight > 270) {
          doc.addPage();
          currentY = 20;
          imgX = 14;
        }

        // Render image onto PDF
        doc.addImage(imgData, "JPEG", imgX, currentY, imgWidth, imgHeight);
        doc.setDrawColor(200, 200, 200);
        doc.rect(imgX, currentY, imgWidth, imgHeight);

        imgX += imgWidth + 6;
      } catch (err) {
        console.warn(`No se pudo renderizar la imagen ${index + 1} en el PDF:`, err);
      }
    });

    currentY += imgHeight + 10;
  }

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount} - Documento generado automáticamente por el Portal Geográfico de Sismos y Emergencias`,
      105,
      290,
      { align: "center" }
    );
  }

  const cleanName = report.locationName.replace(/[^a-zA-Z0-9]/g, "_");
  doc.save(`Ficha_Reporte_${cleanName}_${report.id}.pdf`);
};

/**
 * Genera y descarga un Informe Consolidado en PDF con la lista de reportes
 */
export const generateSummaryReportsPDF = (reports: VictimReport[]) => {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4"
  });

  // Header Banner
  doc.setFillColor(24, 24, 27);
  doc.rect(0, 0, 297, 32, "F");

  doc.setFillColor(220, 38, 38);
  doc.rect(0, 32, 297, 2.5, "F");

  doc.setTextColor(255, 255, 255);
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");
  doc.text("PORTAL GEOGRÁFICO SIG DE SISMOS Y EMERGENCIAS", 14, 14);

  doc.setFontSize(11);
  doc.setFont("helvetica", "normal");
  doc.setTextColor(212, 212, 216);
  doc.text("INFORME EJECUTIVO CONSOLIDADO DE REPORTES REGISTRADOS", 14, 22);

  doc.setFontSize(9);
  doc.setTextColor(161, 161, 170);
  doc.text(`Fecha de emisión: ${new Date().toLocaleString("es-CO")} | Total reportes: ${reports.length}`, 14, 28);

  // Summary Metrics Box
  const totalPeople = reports.reduce((acc, r) => acc + (r.affectedPeople || 0), 0);
  const totalHouses = reports.reduce((acc, r) => acc + (r.affectedHouses || 0), 0);
  const pendingCount = reports.filter((r) => r.status === "pending").length;
  const inProgressCount = reports.filter((r) => r.status === "in_progress").length;
  const resolvedCount = reports.filter((r) => r.status === "resolved").length;

  doc.setFillColor(245, 245, 245);
  doc.rect(14, 38, 269, 14, "F");
  doc.setDrawColor(220, 220, 220);
  doc.rect(14, 38, 269, 14, "S");

  doc.setTextColor(30, 30, 30);
  doc.setFontSize(9.5);
  doc.setFont("helvetica", "bold");
  doc.text(
    `Total Damnificados: ${totalPeople} pers.  |  Viviendas Afectadas: ${totalHouses} viv.  |  Pendientes: ${pendingCount}  |  En Proceso: ${inProgressCount}  |  Atendidos: ${resolvedCount}`,
    20,
    47
  );

  // Table Data Preparation
  const tableData = reports.map((r, index) => [
    (index + 1).toString(),
    r.locationName,
    `${r.lat.toFixed(4)}, ${r.lng.toFixed(4)}`,
    r.reporterName + (r.phone ? `\n(${r.phone})` : ""),
    `${r.affectedPeople} pers.\n${r.affectedHouses || 0} viv.`,
    r.needs.join(", ") || "N/A",
    r.status === "pending" ? "Pendiente" : r.status === "in_progress" ? "En Proceso" : "Atendido",
    formatDate(r.date)
  ]);

  autoTable(doc, {
    startY: 56,
    head: [["#", "Ubicación", "Coordenadas", "Reportante", "Afectaciones", "Necesidades", "Estado", "Fecha"]],
    body: tableData,
    theme: "striped",
    headStyles: {
      fillColor: [220, 38, 38],
      textColor: [255, 255, 255],
      fontStyle: "bold",
      fontSize: 9
    },
    styles: { fontSize: 8.5, cellPadding: 3 },
    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 45, fontStyle: "bold" },
      2: { cellWidth: 32 },
      3: { cellWidth: 45 },
      4: { cellWidth: 30 },
      5: { cellWidth: 50 },
      6: { cellWidth: 25, fontStyle: "bold" },
      7: { cellWidth: 32 }
    }
  });

  // Footer
  const pageCount = (doc as any).internal.getNumberOfPages();
  for (let i = 1; i <= pageCount; i++) {
    doc.setPage(i);
    doc.setFontSize(8);
    doc.setTextColor(128, 128, 128);
    doc.text(
      `Página ${i} de ${pageCount} - Portal Geográfico SIG de Sismos y Emergencias`,
      148,
      200,
      { align: "center" }
    );
  }

  doc.save(`Informe_Consolidado_Reportes_${new Date().toISOString().split("T")[0]}.pdf`);
};
