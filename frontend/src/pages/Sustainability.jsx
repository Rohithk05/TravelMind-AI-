import { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { Leaf, Award, Zap, Train, Plane, Car, MapPin, RefreshCw, Loader2 } from 'lucide-react';
import { RadialBarChart, RadialBar, Legend, ResponsiveContainer, Tooltip, Cell } from 'recharts';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './Sustainability.css';

export default function Sustainability() {
    const { activeTrip } = useTrip();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [insight, setInsight] = useState(null);

    const fetchEcoIntel = async () => {
        if (!activeTrip) return;
        setLoading(true);
        try {
            const response = await fetch(config.endpoints.ai.insight, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination: activeTrip.destination,
                    category: 'sustainability'
                })
            });
            const data = await response.json();
            if (data.insight) {
                setInsight(data.insight);
            }
        } catch (error) {
            console.error("Failed to fetch eco intel:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchEcoIntel();
    }, [activeTrip?.destination]);

    if (!activeTrip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Leaf size={64} className="text-emerald-300 mb-4" />
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">No Destination Tracked</h2>
                <button className="btn btn-primary mt-6" onClick={() => navigate('/')}>Return to Hub</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                        <Leaf size={32} className="animate-pulse" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-slate-900">Scanning Ecosystem</h2>
                <p className="text-slate-500 animate-pulse tracking-wide font-medium">Calculating carbon indices for {activeTrip.destination}...</p>
            </div>
        );
    }

    const { footprint_data = [], eco_swaps = [], local_eco_status = "" } = insight || {};
    const totalFootprint = footprint_data.reduce((sum, item) => sum + (item.value || 0), 0);

    return (
        <div className="sus-page fade-in max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-100 text-emerald-700 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border border-emerald-200">Eco Radar</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Sustainability Monitor</h1>
                    <p className="text-slate-500 flex items-center gap-2 font-medium">
                        <MapPin size={16} className="text-emerald-500" />
                        Impact analysis for <span className="font-bold text-slate-800">{activeTrip.destination}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchEcoIntel} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                        <RefreshCw size={20} />
                    </button>
                    <div className="px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl flex items-center gap-3 font-bold text-xs border border-slate-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-bounce"></div>
                        LIVE PLANETARY API ACTIVE
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* Footprint Chart */}
                <div className="lg:col-span-12 grid grid-cols-1 md:grid-cols-3 gap-8">
                    <div className="card text-center p-8 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[40px] flex flex-col justify-between">
                        <div>
                            <h3 className="font-black text-xl text-slate-900 mb-2">Impact Score</h3>
                            <p className="text-[10px] text-slate-700 font-bold uppercase tracking-widest mb-6">Total Trip Emission</p>

                            <div className="relative inline-block mb-6">
                                <h4 className="text-5xl font-black text-emerald-700">{totalFootprint}</h4>
                                <span className="text-[10px] font-black text-slate-800 uppercase">kg CO2e</span>
                            </div>
                        </div>

                        <div className="bg-emerald-50 p-6 rounded-3xl border border-emerald-100 text-left relative overflow-hidden group">
                            <div className="absolute top-0 right-0 p-8 bg-emerald-200/50 rounded-full blur-2xl -mr-4 -mt-4 group-hover:bg-emerald-300/50 transition-all"></div>
                            <p className="text-emerald-800 font-bold text-sm relative z-10 leading-relaxed italic">
                                "{local_eco_status}"
                            </p>
                        </div>
                    </div>

                    <div className="md:col-span-2 card p-8 bg-white border border-slate-100 shadow-2xl shadow-slate-200/50 rounded-[40px]">
                        <h3 className="font-black text-slate-900 text-xl mb-8 flex items-center gap-2">
                            < Award className="text-emerald-500" /> Emission Analytics
                        </h3>
                        <div style={{ height: 300 }}>
                            <ResponsiveContainer width="100%" height="100%">
                                <RadialBarChart
                                    innerRadius="30%"
                                    outerRadius="100%"
                                    barSize={25}
                                    data={footprint_data}
                                    startAngle={90}
                                    endAngle={-270}
                                >
                                    <RadialBar
                                        minAngle={15}
                                        label={{ position: 'insideStart', fill: '#0f172a', fontSize: 10, fontWeight: 'bold' }}
                                        background
                                        clockWise={true}
                                        dataKey="value"
                                    />
                                    <Legend iconSize={12} layout="vertical" verticalAlign="middle" align="right" />
                                    <Tooltip contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 10px 15px -3px rgba(0,0,0,0.1)', fontWeight: 'bold' }} />
                                </RadialBarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>
                </div>

                {/* Eco Swaps */}
                <div className="lg:col-span-12 card p-10 bg-white border border-slate-100 rounded-[40px] shadow-2xl relative overflow-hidden">
                    <div className="absolute -top-20 -left-20 w-80 h-80 bg-emerald-50 rounded-full blur-[120px] opacity-20"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-10 flex items-center gap-3 text-slate-900">
                            <Zap className="text-emerald-500" /> Smart Planetary Swaps
                        </h3>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                            {eco_swaps.map((swap, idx) => (
                                <div key={idx} className="flex flex-col gap-6 p-8 bg-slate-50 rounded-3xl border border-slate-100 group hover:bg-white transition-all shadow-sm">
                                    <div className="flex items-center justify-between">
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black text-rose-600 uppercase mb-1">Standard Option</span>
                                            <h4 className="font-black text-slate-600 line-through text-base">{swap.original}</h4>
                                        </div>
                                        <div className="p-3 bg-slate-100 rounded-2xl group-hover:scale-110 transition-transform">
                                            <RefreshCw size={24} className="text-emerald-500" />
                                        </div>
                                        <div className="flex flex-col items-end">
                                            <span className="text-[10px] font-black text-emerald-800 uppercase mb-1">Eco-Alternative</span>
                                            <h4 className="font-black text-slate-900 text-base">{swap.swap}</h4>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-center pt-6 border-t border-slate-100">
                                        <div className="flex items-center gap-2">
                                            <Leaf size={14} className="text-emerald-500" />
                                            <span className="text-xs font-black text-emerald-600">{swap.co2_saved}kg Saved</span>
                                        </div>
                                        <button className="px-5 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest transition-all shadow-lg">
                                            Optimize Now • {swap.financial_save}
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
