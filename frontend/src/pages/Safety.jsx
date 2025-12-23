import { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import { ShieldCheck, AlertOctagon, Heart, Phone, Info, Zap, RefreshCw, Smartphone, MapPin, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import config from '../config';
import './Safety.css';

export default function Safety() {
    const { activeTrip } = useTrip();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [insight, setInsight] = useState(null);

    const fetchSafetyIntel = async () => {
        if (!activeTrip) return;
        setLoading(true);
        try {
            const response = await fetch(config.endpoints.ai.insight, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination: activeTrip.destination,
                    category: 'safety'
                })
            });
            const data = await response.json();
            if (data.insight) {
                setInsight(data.insight);
            }
        } catch (error) {
            console.error("Failed to fetch safety intel:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchSafetyIntel();
    }, [activeTrip?.destination]);

    if (!activeTrip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <ShieldCheck size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">No Destination Selected</h2>
                <button className="btn btn-primary mt-4" onClick={() => navigate('/')}>Go to Hub</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-emerald-500/20 border-t-emerald-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-emerald-500">
                        <ShieldCheck size={32} className="animate-pulse" />
                    </div>
                </div>
                <h2 className="text-xl font-bold text-slate-800">Assessing Zone Risks</h2>
                <p className="text-slate-500 animate-pulse">Scanning local advisories and security feeds for {activeTrip.destination}...</p>
            </div>
        );
    }

    const { score = 85, status = "Stable", advisories = [], emergency = "112", risks = [] } = insight || {};

    return (
        <div className="safety-page fade-in max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-emerald-600 text-white text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase shadow-lg shadow-emerald-200">Safety Radar</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Security Intel</h1>
                    <p className="text-slate-500 flex items-center gap-2 font-medium">
                        <MapPin size={16} className="text-emerald-500" />
                        Live threat assessment for <span className="font-bold text-slate-800">{activeTrip.destination}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchSafetyIntel} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                        <RefreshCw size={20} />
                    </button>
                    <div className="px-6 py-3 bg-white text-slate-900 rounded-2xl flex items-center gap-3 font-bold text-xs border border-slate-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                        CORE SYSTEMS ACTIVE
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 mb-10">
                {/* Score Card */}
                <div className="md:col-span-4 card p-8 flex flex-col items-center justify-center text-center border-b-4 border-emerald-500 shadow-2xl relative overflow-hidden group">
                    <div className="absolute top-0 right-0 p-12 bg-emerald-500 rounded-full blur-[80px] opacity-10 group-hover:opacity-20 transition-opacity"></div>
                    <div className="relative z-10 w-28 h-28 rounded-full border-[6px] border-emerald-500/20 flex items-center justify-center text-5xl font-black text-emerald-600 mb-6 bg-emerald-50 shadow-inner">
                        {score}
                    </div>
                    <h3 className="text-2xl font-black text-slate-900 mb-2">{status}</h3>
                    <p className="text-slate-500 text-sm font-medium leading-relaxed">
                        Security index is based on regional data and real-time AI analysis.
                    </p>
                </div>

                <div className="md:col-span-8 flex flex-col gap-4">
                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-start gap-6 group hover:translate-y-[-4px] transition-all">
                        <div className="p-4 bg-sky-50 text-sky-600 rounded-2xl group-hover:bg-sky-500 group-hover:text-white transition-all">
                            <ShieldCheck size={28} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 text-lg mb-1">Health & Hygiene</h4>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                                "{advisories[0] || "No critical health alerts active."}"
                            </p>
                        </div>
                    </div>

                    <div className="bg-white p-8 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/50 flex items-start gap-6 group hover:translate-y-[-4px] transition-all">
                        <div className="p-4 bg-rose-50 text-rose-600 rounded-2xl group-hover:bg-rose-500 group-hover:text-white transition-all">
                            <AlertOctagon size={28} />
                        </div>
                        <div>
                            <h4 className="font-black text-slate-900 text-lg mb-1">Local Awareness</h4>
                            <p className="text-slate-500 text-sm font-medium leading-relaxed italic">
                                "{advisories[1] || "Stay vigilant in crowded areas."}"
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 p-4">
                <div className="bg-white text-slate-900 rounded-[40px] p-10 relative overflow-hidden shadow-2xl border border-slate-100">
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-emerald-50 rounded-full blur-[80px] opacity-60"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <div className="p-2 bg-emerald-100 rounded-xl"><Phone size={24} className="text-emerald-600" /></div>
                            Local Emergency
                        </h3>
                        <div className="grid grid-cols-2 gap-6">
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Protocol 1</span>
                                <span className="text-3xl font-black text-slate-900">{emergency}</span>
                                <span className="block text-[9px] text-emerald-600 font-bold mt-1 uppercase">Universal SOS</span>
                            </div>
                            <div className="bg-slate-50 p-6 rounded-2xl border border-slate-100 shadow-sm">
                                <span className="block text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Protocol 2</span>
                                <span className="text-3xl font-black text-slate-900">999/100</span>
                                <span className="block text-[9px] text-sky-600 font-bold mt-1 uppercase">Police Support</span>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="bg-white text-slate-900 rounded-[40px] p-10 relative overflow-hidden shadow-2xl border border-slate-100">
                    <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-rose-50 rounded-full blur-[80px] opacity-40"></div>
                    <div className="relative z-10">
                        <h3 className="text-2xl font-black mb-6 flex items-center gap-3">
                            <div className="p-2 bg-rose-100 rounded-xl"><ShieldAlert size={24} className="text-rose-500" /></div>
                            Potential Scams
                        </h3>
                        <ul className="space-y-4">
                            {risks.map((risk, idx) => (
                                <li key={idx} className="flex gap-3 items-start bg-slate-50 p-4 rounded-2xl border border-slate-100 hover:bg-slate-100 transition-colors shadow-sm">
                                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_#ef4444] shrink-0"></div>
                                    <span className="text-sm font-medium text-slate-600">{risk}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    );
}
