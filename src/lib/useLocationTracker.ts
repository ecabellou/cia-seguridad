import { useState, useEffect } from 'react';
import { supabase } from './supabase';

export interface GuardLocation {
    id: string;
    name: string;
    lat: number;
    lng: number;
    lastSeen: number;
    status: 'active' | 'break' | 'emergency';
}

export const useLocationTracker = (guardId?: string, guardName?: string) => {
    const [allLocations, setAllLocations] = useState<Record<string, GuardLocation>>({});

    // 1. UPDATE THIS GUARD'S LOCATION (Pusher)
    useEffect(() => {
        if (!guardId || !guardName) return;

        const updateDatabase = async (lat: number, lng: number) => {
            try {
                const { error } = await supabase
                    .from('guard_locations')
                    .upsert({
                        id: guardId,
                        name: guardName,
                        lat: lat,
                        lng: lng,
                        last_seen: new Date().toISOString(),
                        updated_at: new Date().toISOString()
                    });
                if (error) console.error("Error updating location in Supabase:", error);
            } catch (e) {
                console.error("Critical error updating location:", e);
            }
        };

        // Use REAL GPS if available
        let watchId: number | null = null;
        if ("geolocation" in navigator) {
            watchId = navigator.geolocation.watchPosition(
                (position) => {
                    updateDatabase(position.coords.latitude, position.coords.longitude);
                },
                (error) => {
                    console.warn("GPS Access denied or error:", error.message);
                    // Fallback to simulator if GPS fails
                    startSimulator();
                },
                { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 }
            );
        } else {
            startSimulator();
        }

        // Simulator Fallback
        function startSimulator() {
            const centerLat = -33.4489;
            const centerLng = -70.6483;
            let currentLat = centerLat + (Math.random() - 0.5) * 0.01;
            let currentLng = centerLng + (Math.random() - 0.5) * 0.01;

            const interval = setInterval(() => {
                currentLat += (Math.random() - 0.5) * 0.0002;
                currentLng += (Math.random() - 0.5) * 0.0002;
                updateDatabase(currentLat, currentLng);
            }, 5000);

            return () => clearInterval(interval);
        }

        return () => {
            if (watchId !== null) navigator.geolocation.clearWatch(watchId);
        };
    }, [guardId, guardName]);

    // 2. READ ALL LOCATIONS (Poller - For Control Panel)
    useEffect(() => {
        const fetchAll = async () => {
            // Fetch locations and cross-reference with profiles table (Real DB)
            const { data, error } = await supabase
                .from('guard_locations')
                .select(`
                    *,
                    profiles:id (
                        role,
                        status
                    )
                `);

            if (error) {
                console.error("Error fetching locations:", error);
                return;
            }

            const activeLocations: Record<string, GuardLocation> = {};
            data.forEach((loc: any) => {
                // SOLO mostramos si el perfil existe en la BD real y es guardia o control
                const profile = loc.profiles;
                const isAuthorized = profile && (profile.role === 'guard' || profile.role === 'control');
                const isActive = profile && profile.status === 'active';

                if (isAuthorized && isActive) {
                    activeLocations[loc.id] = {
                        id: loc.id,
                        name: loc.name,
                        lat: loc.lat,
                        lng: loc.lng,
                        status: (loc.status as any) || 'active',
                        lastSeen: new Date(loc.last_seen).getTime()
                    };
                }
            });
            setAllLocations(activeLocations);
        };

        fetchAll();
        const interval = setInterval(fetchAll, 5000); // Poll every 5 seconds

        // Realtime Subscription
        const subscription = supabase
            .channel('guard_locations_changes')
            .on('postgres_changes', { event: '*', schema: 'public', table: 'guard_locations' }, fetchAll)
            .subscribe();

        return () => {
            clearInterval(interval);
            supabase.removeChannel(subscription);
        };
    }, []);

    return { allLocations };
};
