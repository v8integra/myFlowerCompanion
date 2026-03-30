import AsyncStorage from "@react-native-async-storage/async-storage";
import React, { createContext, useCallback, useContext, useEffect, useState } from "react";

export interface Garden {
  id: string;
  name: string;
  plantIds: string[];
  zone: number | null;
  includeHerbs: boolean;
  includeVegetables: boolean;
  createdAt: string;
}

interface GardenContextType {
  gardens: Garden[];
  isLoading: boolean;
  createGarden: (name?: string) => Garden;
  updateGarden: (id: string, updates: Partial<Omit<Garden, "id" | "createdAt">>) => void;
  deleteGarden: (id: string) => void;
  resetGarden: (id: string) => void;
  addPlantToGarden: (gardenId: string, plantId: string) => void;
  removePlantFromGarden: (gardenId: string, plantId: string) => void;
  globalZone: number | null;
  setGlobalZone: (zone: number | null) => void;
}

const GardenContext = createContext<GardenContextType | null>(null);
const STORAGE_KEY = "@myflowercompanion_gardens_v2";
const ZONE_KEY = "@myflowercompanion_zone";

function generateId(): string {
  return Date.now().toString() + Math.random().toString(36).substr(2, 9);
}

export function GardenProvider({ children }: { children: React.ReactNode }) {
  const [gardens, setGardens] = useState<Garden[]>([]);
  const [globalZone, setGlobalZoneState] = useState<number | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    (async () => {
      try {
        const [gardenData, zoneData] = await Promise.all([
          AsyncStorage.getItem(STORAGE_KEY),
          AsyncStorage.getItem(ZONE_KEY),
        ]);
        if (gardenData) setGardens(JSON.parse(gardenData));
        if (zoneData) setGlobalZoneState(parseInt(zoneData, 10));
      } catch {}
      setIsLoading(false);
    })();
  }, []);

  const save = useCallback(async (updated: Garden[]) => {
    setGardens(updated);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
    } catch {}
  }, []);

  const setGlobalZone = useCallback(async (zone: number | null) => {
    setGlobalZoneState(zone);
    // Sync the new zone to all existing gardens
    setGardens(prev => {
      const updated = prev.map(g => ({ ...g, zone }));
      AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(updated)).catch(() => {});
      return updated;
    });
    try {
      if (zone !== null) {
        await AsyncStorage.setItem(ZONE_KEY, zone.toString());
      } else {
        await AsyncStorage.removeItem(ZONE_KEY);
      }
    } catch {}
  }, []);

  const createGarden = useCallback((name?: string): Garden => {
    const count = gardens.length + 1;
    const garden: Garden = {
      id: generateId(),
      name: name || `Garden ${count}`,
      plantIds: [],
      zone: globalZone,
      includeHerbs: false,
      includeVegetables: false,
      createdAt: new Date().toISOString(),
    };
    const updated = [...gardens, garden];
    save(updated);
    return garden;
  }, [gardens, globalZone, save]);

  const updateGarden = useCallback((id: string, updates: Partial<Omit<Garden, "id" | "createdAt">>) => {
    const updated = gardens.map(g => g.id === id ? { ...g, ...updates } : g);
    save(updated);
  }, [gardens, save]);

  const deleteGarden = useCallback((id: string) => {
    save(gardens.filter(g => g.id !== id));
  }, [gardens, save]);

  const resetGarden = useCallback((id: string) => {
    const updated = gardens.map(g => g.id === id ? { ...g, plantIds: [] } : g);
    save(updated);
  }, [gardens, save]);

  const addPlantToGarden = useCallback((gardenId: string, plantId: string) => {
    const updated = gardens.map(g =>
      g.id === gardenId && !g.plantIds.includes(plantId)
        ? { ...g, plantIds: [...g.plantIds, plantId] }
        : g
    );
    save(updated);
  }, [gardens, save]);

  const removePlantFromGarden = useCallback((gardenId: string, plantId: string) => {
    const updated = gardens.map(g =>
      g.id === gardenId
        ? { ...g, plantIds: g.plantIds.filter(id => id !== plantId) }
        : g
    );
    save(updated);
  }, [gardens, save]);

  return (
    <GardenContext.Provider value={{
      gardens, isLoading, createGarden, updateGarden, deleteGarden,
      resetGarden, addPlantToGarden, removePlantFromGarden,
      globalZone, setGlobalZone,
    }}>
      {children}
    </GardenContext.Provider>
  );
}

export function useGarden() {
  const ctx = useContext(GardenContext);
  if (!ctx) throw new Error("useGarden must be used within GardenProvider");
  return ctx;
}
