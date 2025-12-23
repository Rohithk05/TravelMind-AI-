import { createContext, useState, useContext, useEffect } from 'react';

const TripContext = createContext();

export const useTrip = () => {
    const context = useContext(TripContext);
    if (!context) {
        throw new Error('useTrip must be used within a TripProvider');
    }
    return context;
};

const MOCK_TRIPS = [];

export const TripProvider = ({ children }) => {
    // Load from local storage or use mock
    const [trips, setTrips] = useState([]);
    const [activeTripId, setActiveTripId] = useState(null);

    const activeTrip = trips.find(t => t.id === activeTripId) || null;

    const addTrip = (newTrip) => {
        const trip = {
            ...newTrip,
            id: Date.now().toString(),
            budget: newTrip.budget || { total: 0, spent: 0, currency: '₹' },
            safety_score: 8.0, // Default for new trips until AI analyzes
            eco_score: 5.0,
            cover_image: newTrip.cover_image || `https://source.unsplash.com/1600x900/?${newTrip.destination},travel`
        };
        setTrips([...trips, trip]);
        setActiveTripId(trip.id);
    };

    const deleteTrip = (id) => {
        const newTrips = trips.filter(t => t.id !== id);
        setTrips(newTrips);
        if (activeTripId === id && newTrips.length > 0) {
            setActiveTripId(newTrips[0].id);
        } else if (newTrips.length === 0) {
            setActiveTripId(null);
        }
    };

    const updateTrip = (id, data) => {
        setTrips(trips.map(t => t.id === id ? { ...t, ...data } : t));
    };

    return (
        <TripContext.Provider value={{
            trips,
            activeTrip,
            setActiveTripId,
            addTrip,
            deleteTrip,
            updateTrip
        }}>
            {children}
        </TripContext.Provider>
    );
};
