import { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import config from '../config';
import {
    BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, Cell, CartesianGrid
} from 'recharts';
import { Users, TrendingUp, AlertCircle, MapPin, Clock, Loader2, RefreshCw, Zap, AlertTriangle } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Crowd.css';

export default function Crowd() {
    const { activeTrip } = useTrip();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [insight, setInsight] = useState(null);
    const [selectedAttraction, setSelectedAttraction] = useState('');

    const fetchCrowdData = async () => {
        if (!activeTrip) return;
        setLoading(true);
        try {
            const response = await fetch(config.endpoints.ai.insight, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination: activeTrip.destination,
                    category: 'crowd'
                })
            });
            const data = await response.json();
            if (data.insight) {
                setInsight(data.insight);
                if (data.insight.major_spots?.length > 0) {
                    setSelectedAttraction(data.insight.major_spots[0].name);
                }
            }
        } catch (error) {
            console.error("Failed to fetch crowd intel:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchCrowdData();
    }, [activeTrip?.destination]);

    if (!activeTrip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Users size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">No Active Trip</h2>
                <p className="text-slate-500 mb-6">Select a trip to view crowd intelligence.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Hub</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-sky-500">
                        <Zap size={32} className="animate-pulse" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Syncing Live Signals</h2>
                <p className="text-slate-500 animate-pulse">Scanning social heatmaps and traffic data for {activeTrip.destination}...</p>
            </div>
        );
    }

    const { hourly_forecast = [], major_spots = [], advice = "" } = insight || {};

    return (
        <div className="crowd-page fade-in max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-sky-100 text-sky-700 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border border-sky-200">AI Radar</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Crowd Intelligence</h1>
                    <p className="text-slate-500 flex items-center gap-2 font-medium">
                        <MapPin size={16} className="text-sky-500" />
                        Live monitoring for <span className="font-bold text-slate-800">{activeTrip.destination}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchCrowdIntel} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                        <RefreshCw size={20} />
                    </button>
                    <div className="px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl flex items-center gap-3 font-bold text-xs border border-slate-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.8)]"></div>
                        LIVE UPDATES ACTIVE
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Main Forecast */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="card p-8 bg-white shadow-xl shadow-slate-200/50 border border-slate-100">
                        <div className="flex justify-between items-center mb-10">
                            <div>
                                <h3 className="font-black text-xl text-slate-900">{selectedAttraction || 'Density Forecast'}</h3>
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] mt-1">Hourly Human-Density Map</p>
                            </div>
                            <div className="flex gap-1">
                                {[1, 2, 3].map(i => <div key={i} className="w-1 h-3 bg-sky-200 rounded-full"></div>)}
                            </div>
                        </div>

                        <div style={{ height: 350 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={hourly_forecast}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="time" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11 }} />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                                    />
                                    <Bar
                                        dataKey="density"
                                        fill="#0ea5e9"
                                        radius={[10, 10, 4, 4]}
                                        barSize={45}
                                    />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>

                        <div className="mt-10 flex items-start gap-4 p-6 bg-sky-50 text-slate-900 rounded-3xl relative overflow-hidden group border border-sky-100 shadow-sm">
                            <div className="absolute top-0 right-0 p-12 bg-sky-200 rounded-full blur-[80px] opacity-20"></div>
                            <div className="relative z-10 p-2 bg-sky-100 rounded-xl">
                                <AlertTriangle className="text-sky-600" size={24} />
                            </div>
                            <div className="relative z-10">
                                <h4 className="font-black text-sm uppercase tracking-widest text-sky-800 mb-1">AI Recommendation</h4>
                                <p className="text-slate-800 text-sm font-medium leading-relaxed italic">
                                    "{advice}"
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Major Spots Sidebar */}
                <div className="lg:col-span-4 space-y-4">
                    <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.25em] mb-4 flex items-center gap-2">
                        <Users size={12} /> Strategic Hotspots
                    </h3>
                    <div className="space-y-3">
                        {major_spots.map((attr, idx) => (
                            <div
                                key={idx}
                                onClick={() => setSelectedAttraction(attr.name)}
                                className={`p-6 rounded-3xl border-2 transition-all group cursor-pointer ${selectedAttraction === attr.name ? 'bg-white border-sky-500 shadow-2xl shadow-sky-100' : 'bg-white border-slate-50 shadow-sm hover:border-slate-200 hover:shadow-md'}`}
                            >
                                <div className="flex justify-between items-start mb-4">
                                    <div>
                                        <h4 className="font-black text-slate-900 text-base leading-tight group-hover:text-sky-600 transition-colors">{attr.name}</h4>
                                        <p className="text-[10px] text-slate-600 font-bold uppercase mt-1 tracking-widest">Est. Wait: {attr.wait_time}</p>
                                    </div>
                                    <span className={`text-[9px] font-black px-3 py-1.5 rounded-full tracking-wider uppercase ${attr.status === 'High' ? 'bg-rose-100 text-rose-600' : attr.status === 'Moderate' ? 'bg-amber-100 text-amber-600' : 'bg-emerald-100 text-emerald-600'}`}>
                                        {attr.status}
                                    </span>
                                </div>
                                <div className="w-full bg-slate-100 h-2 rounded-full overflow-hidden mb-1 shadow-inner">
                                    <div className={`h-full rounded-full transition-all duration-1000 ${attr.status === 'High' ? 'bg-rose-500' : attr.status === 'Moderate' ? 'bg-amber-500' : 'bg-emerald-500'}`} style={{ width: `${attr.density}%` }}></div>
                                </div>
                                <div className="flex justify-between text-[8px] font-black text-slate-400 uppercase tracking-tighter">
                                    <span>Quiet</span>
                                    <span>Peak</span>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="p-6 bg-gradient-to-br from-indigo-500 to-sky-600 rounded-3xl text-white shadow-xl relative overflow-hidden">
                        <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-2xl"></div>
                        <h4 className="font-black text-sm mb-2 relative z-10 text-white/90">Smart Rescheduling</h4>
                        <p className="text-[11px] font-medium leading-relaxed mb-4 text-white/80">Want an AI-optimized schedule to skip all queues?</p>
                        <button className="w-full py-3 bg-white text-sky-600 rounded-2xl text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-lg active:scale-95">
                            Re-Optimize Plan
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
