import { useState } from 'react';
import { useTrip } from '../context/TripContext';
import {
    Plus, Calendar, MapPin, DollarSign, ShieldCheck, Leaf,
    LayoutGrid, List
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Dashboard.css';

/* Components */
const StatCard = ({ label, value, subtext, icon: Icon, color }) => (
    <div className="metric-card">
        <div>
            <p className="metric-label">{label}</p>
            <h3 className="metric-value">{value}</h3>
            {subtext && <p className="text-sm mt-1 text-brand font-medium">{subtext}</p>}
        </div>
        <div className={`metric-icon ${color}`}>
            <Icon size={24} />
        </div>
    </div>
);

const TripCard = ({ trip, isActive, onClick }) => (
    <div
        onClick={onClick}
        className={`card cursor-pointer transition-all ${isActive ? 'active-trip-card' : ''}`}
        style={{ padding: 0, overflow: 'hidden', position: 'relative', border: isActive ? '2px solid var(--brand-500)' : '1px solid var(--border)' }}
    >
        <div style={{ height: '180px', position: 'relative' }}>
            <img
                src={trip.cover_image}
                alt={trip.destination}
                style={{ width: '100%', height: '100%', objectFit: 'cover' }}
            />
            <div style={{ position: 'absolute', bottom: 0, left: 0, padding: '1rem', background: 'linear-gradient(to top, rgba(255,255,255,0.9), transparent)', width: '100%' }}>
                <h3 style={{ color: 'var(--primary-900)', fontSize: '1.25rem', fontWeight: '700' }}>{trip.destination}</h3>
                <p style={{ color: 'var(--primary-700)', fontSize: '0.8rem', display: 'flex', alignItems: 'center', gap: '4px' }}>
                    <Calendar size={12} /> {trip.duration_days} Days
                </p>
            </div>
            {isActive && <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'var(--brand-500)', color: 'white', fontSize: '0.6rem', fontWeight: 'bold', padding: '4px 8px', borderRadius: '4px', textTransform: 'uppercase' }}>Active</div>}
        </div>
        <div style={{ padding: '1rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', color: 'var(--primary-500)', fontWeight: '500' }}>
                <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><DollarSign size={14} /> {trip.budget?.total || 0}</span>
                <span style={{ display: 'flex', gap: '4px', alignItems: 'center' }}><ShieldCheck size={14} style={{ color: 'var(--success)' }} /> {trip.safety_score || '-'}</span>
            </div>
        </div>
    </div>
);

export default function Dashboard() {
    const { trips, activeTrip, setActiveTripId } = useTrip();
    const navigate = useNavigate();
    const [view, setView] = useState('overview');

    if (!activeTrip) {
        return (
            <div style={{ minHeight: '60vh', display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', textAlign: 'center' }} className="fade-in">
                <div style={{ width: '80px', height: '80px', borderRadius: '50%', background: 'var(--brand-50)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '1.5rem' }}>
                    <MapPin size={40} className="text-brand" />
                </div>
                <h2 style={{ fontSize: '2rem', fontWeight: '800', color: 'var(--primary-900)', marginBottom: '0.5rem' }}>Welcome to TravelMind</h2>
                <p style={{ color: 'var(--primary-500)', marginBottom: '2rem', maxWidth: '400px' }}>Your AI-powered travel intelligence hub. Select a destination or create a new trip to get started.</p>
                <button className="btn btn-primary" onClick={() => navigate('/plan')}>
                    <Plus size={20} /> Create New Trip
                </button>
            </div>
        );
    }

    return (
        <div className="fade-in">
            {/* Header / Context Switcher */}
            <div className="header-row">
                <div className="page-title">
                    <p className="page-subtitle">My Travel Hub</p>
                    <h1>Overview: <span className="text-brand">{activeTrip.destination}</span></h1>
                </div>

                <div className="view-toggle">
                    <button
                        className={`toggle-btn ${view === 'overview' ? 'active' : ''}`}
                        onClick={() => setView('overview')}
                    >
                        <LayoutGrid size={16} /> Dashboard
                    </button>
                    <button
                        className={`toggle-btn ${view === 'list' ? 'active' : ''}`}
                        onClick={() => setView('list')}
                    >
                        <List size={16} /> All Trips
                    </button>
                </div>
            </div>

            {view === 'overview' ? (
                <div className="dashboard-grid">
                    {/* Main Stats Column (8 cols) */}
                    <div className="col-main">
                        <div className="metrics-row">
                            {(() => {
                                const currency = activeTrip.budget?.currency || '₹';
                                const total = activeTrip.budget?.total || (activeTrip.duration_days * 5000);

                                // Simple estimate logic mirroring Budget page for consistency
                                const parseCost = (str) => {
                                    if (!str || typeof str !== 'string') return 0;
                                    const val = parseInt(str.replace(/[^0-9]/g, '')) || 0;
                                    return str.includes('$') ? val * 80 : val;
                                };

                                const estTotal = activeTrip.itinerary?.days?.reduce((sum, day) =>
                                    sum + (day.activities?.reduce((dSum, act) => dSum + parseCost(act.cost_estimate), 0) || 0)
                                    , 0) || total * 0.4;

                                const usedPct = Math.min(Math.round((estTotal / total) * 100), 100);

                                return (
                                    <StatCard
                                        label="Total Plan Cost"
                                        value={`${currency}${total.toLocaleString()}`}
                                        subtext={`${usedPct}% Estimated Usage`}
                                        icon={LayoutGrid}
                                        color="blue"
                                    />
                                );
                            })()}
                            <StatCard
                                label="Safety Rating"
                                value={`${activeTrip.safety_score}/100`}
                                subtext="Contextual Score"
                                icon={ShieldCheck}
                                color="green"
                            />
                        </div>

                        {/* Intel Card */}
                        <div className="intel-card">
                            <div className="intel-glow"></div>
                            <div style={{ position: 'relative', zIndex: 10 }}>
                                <h2 style={{ fontSize: '1.5rem', marginBottom: '0.5rem' }}>AI Intel Report</h2>
                                <p style={{ color: 'rgba(255,255,255,0.7)', marginBottom: '1.5rem', maxWidth: '500px' }}>
                                    New insights available for your {activeTrip.destination} trip.
                                    Crowd levels are expected to drop by 15% this weekend.
                                </p>
                                <div style={{ display: 'flex', gap: '1rem' }}>
                                    <button onClick={() => navigate('/crowd')} className="btn" style={{ background: 'rgba(255,255,255,0.1)', color: 'white', border: '1px solid rgba(255,255,255,0.2)' }}>
                                        Check Crowd Radar
                                    </button>
                                    <button onClick={() => navigate('/plan')} className="btn" style={{ background: 'var(--brand-500)', color: 'white', border: 'none' }}>
                                        Update Itinerary
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Side Column (4 cols) */}
                    <div className="col-side">
                        <div className="card" style={{ height: '100%' }}>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <h3 style={{ fontSize: '1rem' }}>Your Trips</h3>
                                <span style={{ background: 'var(--background)', fontSize: '0.75rem', fontWeight: 'bold', padding: '2px 8px', borderRadius: '10px' }}>{trips.length}</span>
                            </div>

                            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                                {trips.slice(0, 3).map(trip => (
                                    <div
                                        key={trip.id}
                                        onClick={() => setActiveTripId(trip.id)}
                                        style={{
                                            padding: '0.75rem',
                                            borderRadius: 'var(--radius-md)',
                                            border: activeTrip.id === trip.id ? '1px solid var(--brand-500)' : '1px solid transparent',
                                            background: activeTrip.id === trip.id ? 'var(--brand-50)' : 'transparent',
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: '1rem',
                                            transition: 'background 0.2s'
                                        }}
                                    >
                                        <img src={trip.cover_image} style={{ width: '40px', height: '40px', borderRadius: '8px', objectFit: 'cover' }} alt="" />
                                        <div style={{ flex: 1, overflow: 'hidden' }}>
                                            <h4 style={{ fontSize: '0.9rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{trip.destination}</h4>
                                            <p style={{ fontSize: '0.75rem', color: 'var(--primary-500)' }}>{trip.duration_days} Days</p>
                                        </div>
                                    </div>
                                ))}
                                <button
                                    onClick={() => { setActiveTripId(null); navigate('/plan'); }}
                                    className="btn btn-ghost"
                                    style={{ width: '100%', border: '1px dashed var(--border)', justifyContent: 'center' }}
                                >
                                    + Plan New Trip
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            ) : (
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '2rem' }}>
                    {trips.map(trip => (
                        <TripCard
                            key={trip.id}
                            trip={trip}
                            isActive={activeTrip.id === trip.id}
                            onClick={() => { setActiveTripId(trip.id); setView('overview'); }}
                        />
                    ))}
                    <button
                        onClick={() => navigate('/plan')}
                        style={{
                            minHeight: '300px',
                            borderRadius: 'var(--radius-lg)',
                            border: '2px dashed var(--border)',
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '1rem',
                            background: 'transparent',
                            color: 'var(--primary-500)',
                            cursor: 'pointer'
                        }}
                    >
                        <div style={{ padding: '1rem', borderRadius: '50%', background: 'var(--background)' }}>
                            <Plus size={32} />
                        </div>
                        <span style={{ fontWeight: '700' }}>Create New Trip</span>
                    </button>
                </div>
            )}
        </div>
    );
}
