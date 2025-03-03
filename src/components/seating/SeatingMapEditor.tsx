"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/Button";

interface Seat {
  id: string;
  row: number;
  column: number;
  label: string;
  category: string;
  price: number;
  available: boolean;
}

interface Section {
  id: string;
  name: string;
  color: string;
  price: number;
}

interface SeatingMapEditorProps {
  initialMap?: {
    name: string;
    sections: Section[];
    seats: Seat[];
    rows: number;
    columns: number;
  };
  onSave: (mapData: any) => void;
  readOnly?: boolean;
}

export function SeatingMapEditor({
  initialMap,
  onSave,
  readOnly = false,
}: SeatingMapEditorProps) {
  const [mapName, setMapName] = useState<string>(
    initialMap?.name || "Nuevo mapa de asientos"
  );
  const [rows, setRows] = useState<number>(initialMap?.rows || 10);
  const [columns, setColumns] = useState<number>(initialMap?.columns || 15);
  const [sections, setSections] = useState<Section[]>(
    initialMap?.sections || [
      { id: "standard", name: "Estándar", color: "#90cdf4", price: 15 },
      { id: "premium", name: "Premium", color: "#f6ad55", price: 25 },
      { id: "vip", name: "VIP", color: "#f687b3", price: 40 },
    ]
  );
  const [activeSection, setActiveSection] = useState<string>("standard");
  const [seats, setSeats] = useState<Seat[]>(initialMap?.seats || []);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);

  // Inicializar asientos si no hay iniciales
  useEffect(() => {
    if (seats.length === 0) {
      const initialSeats: Seat[] = [];
      for (let r = 0; r < rows; r++) {
        for (let c = 0; c < columns; c++) {
          const rowLabel = String.fromCharCode(65 + r);
          initialSeats.push({
            id: `${rowLabel}${c + 1}`,
            row: r,
            column: c,
            label: `${rowLabel}${c + 1}`,
            category: "standard",
            price: 15,
            available: true,
          });
        }
      }
      setSeats(initialSeats);
    }
  }, []);

  const handleSeatClick = (seat: Seat) => {
    if (readOnly) return;

    if (selectedSeats.includes(seat.id)) {
      setSelectedSeats(selectedSeats.filter((id) => id !== seat.id));
    } else {
      setSelectedSeats([...selectedSeats, seat.id]);
    }
  };

  const applySection = () => {
    if (selectedSeats.length === 0) return;

    const section = sections.find((s) => s.id === activeSection);
    if (!section) return;

    const updatedSeats = seats.map((seat) => {
      if (selectedSeats.includes(seat.id)) {
        return {
          ...seat,
          category: activeSection,
          price: section.price,
        };
      }
      return seat;
    });

    setSeats(updatedSeats);
    setSelectedSeats([]);
  };

  const toggleAvailability = () => {
    if (selectedSeats.length === 0) return;

    const updatedSeats = seats.map((seat) => {
      if (selectedSeats.includes(seat.id)) {
        return {
          ...seat,
          available: !seat.available,
        };
      }
      return seat;
    });

    setSeats(updatedSeats);
    setSelectedSeats([]);
  };

  const handleSectionChange = (
    sectionId: string,
    field: keyof Section,
    value: string | number
  ) => {
    setSections(
      sections.map((section) =>
        section.id === sectionId ? { ...section, [field]: value } : section
      )
    );

    // Actualizar precios de asientos si el precio de la sección cambia
    if (field === "price") {
      setSeats(
        seats.map((seat) =>
          seat.category === sectionId
            ? { ...seat, price: value as number }
            : seat
        )
      );
    }
  };

  const updateDimensions = () => {
    // Implementación para ajustar las dimensiones del mapa (más compleja)
    // Para simplificar, solo actualizaremos las filas y columnas sin cambiar los asientos existentes
    // En una implementación real, se deberían añadir o eliminar asientos según corresponda

    // Este es un enfoque simplificado
    const updatedSeats: Seat[] = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < columns; c++) {
        const rowLabel = String.fromCharCode(65 + r);
        const existingSeat = seats.find(
          (seat) => seat.row === r && seat.column === c
        );

        if (existingSeat) {
          updatedSeats.push(existingSeat);
        } else {
          updatedSeats.push({
            id: `${rowLabel}${c + 1}`,
            row: r,
            column: c,
            label: `${rowLabel}${c + 1}`,
            category: "standard",
            price: 15,
            available: true,
          });
        }
      }
    }
    setSeats(updatedSeats);
  };

  const saveMap = () => {
    const mapData = {
      name: mapName,
      rows,
      columns,
      sections,
      seats,
    };
    onSave(mapData);
  };

  return (
    <div className="bg-white shadow-md rounded-lg p-6">
      <div className="mb-6">
        {!readOnly && (
          <input
            type="text"
            value={mapName}
            onChange={(e) => setMapName(e.target.value)}
            className="text-2xl font-bold mb-4 border-b border-gray-200 pb-2 w-full focus:outline-none focus:border-blue-500"
            placeholder="Nombre del mapa"
          />
        )}
        {readOnly && <h2 className="text-2xl font-bold mb-4">{mapName}</h2>}
      </div>

      {!readOnly && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3">Dimensiones</h3>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Filas
                </label>
                <input
                  type="number"
                  min="1"
                  max="26"
                  value={rows}
                  onChange={(e) => setRows(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Columnas
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={columns}
                  onChange={(e) => setColumns(parseInt(e.target.value) || 1)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md"
                />
              </div>
            </div>
            <Button
              variant="secondary"
              className="mt-3 w-full"
              onClick={updateDimensions}
            >
              Actualizar dimensiones
            </Button>
          </div>

          <div className="bg-gray-50 p-4 rounded-md">
            <h3 className="text-lg font-medium mb-3">Secciones</h3>
            <div className="space-y-3">
              {sections.map((section) => (
                <div
                  key={section.id}
                  className={`flex items-center space-x-2 p-2 rounded cursor-pointer ${
                    activeSection === section.id ? "bg-gray-200" : ""
                  }`}
                  onClick={() => setActiveSection(section.id)}
                >
                  <div
                    className="w-4 h-4 rounded-full"
                    style={{ backgroundColor: section.color }}
                  ></div>
                  <input
                    type="text"
                    value={section.name}
                    onChange={(e) =>
                      handleSectionChange(section.id, "name", e.target.value)
                    }
                    className="flex-1 border-none bg-transparent focus:outline-none text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <input
                    type="number"
                    value={section.price}
                    onChange={(e) =>
                      handleSectionChange(
                        section.id,
                        "price",
                        parseInt(e.target.value) || 0
                      )
                    }
                    className="w-16 text-right border border-gray-300 rounded px-1 py-0.5 text-sm"
                    onClick={(e) => e.stopPropagation()}
                  />
                  <span className="text-gray-600 text-sm">€</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

      {!readOnly && (
        <div className="mb-6 flex space-x-4">
          <Button variant="primary" onClick={applySection}>
            Aplicar sección seleccionada
          </Button>
          <Button variant="outline" onClick={toggleAvailability}>
            Alternar disponibilidad
          </Button>
          <Button variant="secondary" onClick={() => setSelectedSeats([])}>
            Desseleccionar todo
          </Button>
        </div>
      )}

      <div className="overflow-x-auto pb-4">
        <div
          className="grid gap-1"
          style={{
            gridTemplateColumns: `repeat(${columns}, minmax(30px, 1fr))`,
            width: `max-content`,
            minWidth: "100%",
          }}
        >
          {/* Etiquetas de columna */}
          <div className="col-span-full text-center mb-2">
            <div className="inline-block w-full">
              <div className="flex justify-center">
                <div className="w-10"></div>
                <div className="flex-1 flex justify-around">
                  {Array.from({ length: columns }).map((_, index) => (
                    <div
                      key={index}
                      className="text-sm font-medium text-gray-600"
                    >
                      {index + 1}
                    </div>
                  ))}
                </div>
                <div className="w-10"></div>
              </div>
            </div>
          </div>

          {/* Asientos */}
          {Array.from({ length: rows }).map((_, rowIndex) => (
            <div
              key={rowIndex}
              className="col-span-full flex items-center mb-1"
            >
              <div className="w-10 text-center font-medium">
                {String.fromCharCode(65 + rowIndex)}
              </div>
              <div
                className="flex-1 grid gap-1"
                style={{ gridTemplateColumns: `repeat(${columns}, 1fr)` }}
              >
                {seats
                  .filter((seat) => seat.row === rowIndex)
                  .sort((a, b) => a.column - b.column)
                  .map((seat) => {
                    const section = sections.find(
                      (s) => s.id === seat.category
                    );
                    return (
                      <div
                        key={seat.id}
                        className={`
                          seat flex items-center justify-center cursor-pointer
                          h-8 w-8 rounded text-xs font-medium transition-all
                          ${!seat.available ? "bg-gray-300 text-gray-500" : ""}
                          ${
                            selectedSeats.includes(seat.id)
                              ? "ring-2 ring-blue-500"
                              : ""
                          }
                        `}
                        style={{
                          backgroundColor: seat.available
                            ? section?.color || "#e5e7eb"
                            : "#d1d5db",
                        }}
                        onClick={() => handleSeatClick(seat)}
                        title={`${seat.label} - ${
                          section?.name || "Estándar"
                        } - ${seat.price}€`}
                      >
                        {seat.column + 1}
                      </div>
                    );
                  })}
              </div>
              <div className="w-10 text-center font-medium">
                {String.fromCharCode(65 + rowIndex)}
              </div>
            </div>
          ))}

          {/* Escenario */}
          <div className="col-span-full mt-4 bg-gray-800 text-white py-2 text-center rounded">
            ESCENARIO
          </div>
        </div>
      </div>

      {!readOnly && (
        <div className="mt-6 flex justify-end">
          <Button variant="primary" onClick={saveMap}>
            Guardar mapa
          </Button>
        </div>
      )}

      {/* Leyenda */}
      <div className="mt-6 border-t pt-4">
        <h3 className="text-lg font-medium mb-2">Leyenda</h3>
        <div className="flex flex-wrap gap-4">
          {sections.map((section) => (
            <div key={section.id} className="flex items-center space-x-2">
              <div
                className="w-4 h-4 rounded-full"
                style={{ backgroundColor: section.color }}
              ></div>
              <span>
                {section.name} - {section.price}€
              </span>
            </div>
          ))}
          <div className="flex items-center space-x-2">
            <div className="w-4 h-4 rounded-full bg-gray-300"></div>
            <span>No disponible</span>
          </div>
        </div>
      </div>
    </div>
  );
}
