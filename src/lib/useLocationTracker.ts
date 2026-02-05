import { useState, useEffect } from 'react';

export interface GuardLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    lastSeen: number;
    status: 'active' | 'break' | 'emergency';
}

const STORAGE_KEY = 'cia_guard_locations';

export const useLocationTracker = (guardId?: string, guardName?: string) => {
    const [allLocations, setAllLocations] = useState<Record<string, GuardLocation>>({});

    // Effect to update THIS guard's location
    useEffect(() => {
        if (!guardId || !guardName) return;

        // Simulator: if we don't have real GPS, we move slightly around a center
        const centerLat = -33.4489; // Default Santiago (can change to Temuco or wherever)
        const centerLng = -70.6483;

        let currentLat = centerLat + (Math.random() - 0.5) * 0.01;
        let currentLng = centerLng + (Math.random() - 0.5) * 0.01;

        const updateLocation = () => {
            // Simulate a small movement
            currentLat += (Math.random() - 0.5) * 0.0002;
            currentLng += (Math.random() - 0.5) * 0.0002;

            const stored = localStorage.getItem(STORAGE_KEY);
            const locations: Record<string, GuardLocation> = stored ? JSON.parse(stored) : {};

            locations[guardId] = {
                id: guardId,
                name: guardName,
                lat: currentLat,
                lng: currentLng,
                lastSeen: Date.now(),
                status: 'active'
            };

            localStorage.setItem(STORAGE_KEY, JSON.stringify(locations));
            window.dispatchEvent(new Event('storage-location-update'));
        };

        // Initial update
        updateLocation();

        // Continuous update every 5 seconds
        const interval = setInterval(updateLocation, 5000);

        return () => clearInterval(interval);
    }, [guardId, guardName]);

    // Effect to READ all locations (for Control panel)
    useEffect(() => {
        const loadLocations = () => {
            const stored = localStorage.getItem(STORAGE_KEY);
            if (stored) {
                try {
                    setAllLocations(JSON.parse(stored));
                } catch (e) {
                    console.error("Failed to parse locations", e);
                }
            }
        };

        loadLocations();

        const handleUpdate = () => loadLocations();
        window.addEventListener('storage-location-update', handleUpdate);
        window.addEventListener('storage', handleUpdate); // Cross-tab

        return () => {
            window.removeEventListener('storage-location-update', handleUpdate);
            window.removeEventListener('storage', handleUpdate);
        };
    }, []);

    return { allLocations };
};
