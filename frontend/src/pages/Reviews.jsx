import { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import config from '../config';
import { Star, ThumbsUp, MessageCircle, AlertTriangle, RefreshCw, Loader2, Sparkles } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import './Reviews.css';

export default function Reviews() {
    const { activeTrip } = useTrip();
    const navigate = useNavigate();
    const [insight, setInsight] = useState(null);
    const [loading, setLoading] = useState(false);

    const fetchReviews = async () => {
        if (!activeTrip) return;
        setLoading(true);

        // Extract suggested places from itinerary for precise reviews
        const suggestedPlaces = [];
        activeTrip.itinerary?.days?.forEach(day => {
            day.activities?.forEach(act => {
                if (act.title) suggestedPlaces.push(act.title);
            });
        });

        try {
            const response = await fetch(config.endpoints.ai.insight, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    destination: activeTrip.destination,
                    category: 'reviews',
                    context: suggestedPlaces.slice(0, 10) // Limit to first 10 for prompt efficiency
                })
            });
            const data = await response.json();
            if (data.insight) {
                setInsight(data.insight);
            }
        } catch (error) {
            console.error("Failed to fetch reviews intel:", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (activeTrip?.destination) {
            fetchReviews();
        }
    }, [activeTrip?.destination]);

    if (!activeTrip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Star size={64} className="text-slate-200 mb-4" />
                <h2 className="text-2xl font-black text-slate-800 tracking-tight">No Destination Tracked</h2>
                <button className="btn btn-primary mt-6" onClick={() => navigate('/')}>Return to Hub</button>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center">
                <div className="relative mb-8">
                    <div className="w-24 h-24 border-4 border-indigo-500/20 border-t-indigo-500 rounded-full animate-spin"></div>
                    <div className="absolute inset-0 flex items-center justify-center text-indigo-500">
                        <MessageCircle size={32} className="animate-pulse" />
                    </div>
                </div>
                <h2 className="text-xl font-black text-slate-900">Aggregating Social Intel</h2>
                <p className="text-slate-500 animate-pulse tracking-wide font-medium">Scraping recent reviews and calculating global trust score for {activeTrip.destination}...</p>
            </div>
        );
    }

    const { trust_score = 0, pros = [], cons = [], reviews: reviewsList = [], ai_summary = "" } = insight || {};

    return (
        <div className="reviews-page fade-in max-w-6xl mx-auto p-4 md:p-8">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-2">
                        <span className="bg-indigo-100 text-indigo-700 text-[10px] font-black px-2 py-0.5 rounded tracking-widest uppercase border border-indigo-200">Trust Engine</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse"></div>
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Global Sentiment</h1>
                    <p className="text-slate-500 flex items-center gap-2 font-medium">
                        <Sparkles size={16} className="text-indigo-500" />
                        Live trust analysis for <span className="font-bold text-slate-800">{activeTrip.destination}</span>
                    </p>
                </div>
                <div className="flex gap-2">
                    <button onClick={fetchReviews} className="p-3 bg-white border border-slate-200 rounded-2xl hover:bg-slate-50 transition-colors shadow-sm text-slate-600">
                        <RefreshCw size={20} />
                    </button>
                    <div className="px-6 py-3 bg-slate-100 text-slate-900 rounded-2xl flex items-center gap-3 font-bold text-xs border border-slate-200 shadow-sm">
                        <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_10px_#10b981]"></div>
                        LIVE SENTIMENT STREAMING
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-12">
                <div className="card p-10 flex flex-col items-center justify-center text-center bg-white border-2 border-slate-100 shadow-2xl relative overflow-hidden group rounded-[40px]">
                    <div className="absolute top-0 right-0 p-16 bg-indigo-50 rounded-full blur-[100px] opacity-40 group-hover:opacity-60 transition-opacity"></div>
                    <span className="text-6xl font-black text-slate-900 mb-4 relative z-10">{trust_score}</span>
                    <div className="flex gap-1 mb-4 text-yellow-500 relative z-10">
                        {[1, 2, 3, 4, 5].map(i => (
                            <Star key={i} fill={i <= Math.round(trust_score) ? "currentColor" : "none"} size={22} className={i <= Math.round(trust_score) ? "text-yellow-500" : "text-slate-200"} />
                        ))}
                    </div>
                    <p className="text-xs text-slate-500 font-black uppercase tracking-[0.2em] relative z-10">Global Trust Index</p>
                </div>

                <div className="card p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] flex items-start gap-6 group hover:translate-y-[-4px] transition-all">
                    <div className="p-5 bg-emerald-50 text-emerald-600 rounded-3xl group-hover:bg-emerald-50 transition-all">
                        <ThumbsUp size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-lg mb-2">The Good Vibes</h4>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                            {pros.join(", ") || "Loading pros..."}
                        </p>
                    </div>
                </div>

                <div className="card p-8 bg-white border border-slate-100 shadow-xl shadow-slate-200/50 rounded-[40px] flex items-start gap-6 group hover:translate-y-[-4px] transition-all">
                    <div className="p-5 bg-rose-50 text-rose-600 rounded-3xl group-hover:bg-rose-50 transition-all">
                        <AlertTriangle size={32} />
                    </div>
                    <div>
                        <h4 className="font-black text-slate-900 text-lg mb-2">Common Grievances</h4>
                        <p className="text-sm text-slate-600 font-medium leading-relaxed italic">
                            {cons.join(", ") || "Loading cons..."}
                        </p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                <div className="lg:col-span-8 space-y-4">
                    <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <MessageCircle size={14} /> Verified Traveler Feed
                    </h3>
                    <div className="grid grid-cols-1 gap-6">
                        {reviewsList.map((review, idx) => (
                            <div key={idx} className="card p-8 bg-white border-2 border-slate-50 hover:border-indigo-100 hover:shadow-2xl hover:shadow-indigo-100/50 transition-all rounded-[32px] group">
                                <div className="flex justify-between items-start mb-6">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-900 flex items-center justify-center font-black text-lg group-hover:bg-indigo-50 transition-colors">
                                            {review.author?.[0] || "?"}
                                        </div>
                                        <div>
                                            <h5 className="font-black text-slate-900 leading-tight">{review.author}</h5>
                                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-0.5">{review.date}</p>
                                        </div>
                                    </div>
                                    <div className="flex flex-col items-end gap-1">
                                        <div className="flex gap-0.5 text-yellow-500 mb-1">
                                            {[1, 2, 3, 4, 5].map(i => (
                                                <Star key={i} fill={i <= review.rating ? "currentColor" : "none"} size={12} />
                                            ))}
                                        </div>
                                        <span className={`text-[8px] font-black px-2.5 py-1 rounded-full tracking-widest uppercase shadow-sm ${review.sentiment === 'Positive' ? 'bg-emerald-100 text-emerald-700' : review.sentiment === 'Neutral' ? 'bg-amber-100 text-amber-700' : 'bg-rose-100 text-rose-700'}`}>
                                            {review.sentiment}
                                        </span>
                                    </div>
                                </div>
                                <h4 className="font-black text-slate-800 text-lg mb-3 tracking-tight group-hover:text-indigo-600 transition-colors">{review.title}</h4>
                                <p className="text-slate-600 text-sm leading-relaxed font-medium">"{review.text}"</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="lg:col-span-4">
                    <h3 className="font-black text-slate-400 text-[10px] uppercase tracking-[0.3em] mb-6 flex items-center gap-2">
                        <Sparkles size={14} /> AI Perspective
                    </h3>
                    <div className="card p-8 bg-indigo-50 text-indigo-900 rounded-[40px] shadow-xl border border-indigo-100 relative overflow-hidden sticky top-8">
                        <div className="absolute top-0 right-0 p-16 bg-white rounded-full blur-2xl opacity-60"></div>
                        <div className="relative z-10">
                            <h4 className="font-black text-lg mb-4 flex items-center gap-2 text-indigo-950">
                                Aggregated Summary
                            </h4>
                            <p className="text-indigo-800 text-sm font-medium leading-[1.8] italic mb-8">
                                "{ai_summary}"
                            </p>
                            <div className="p-6 bg-white/60 rounded-3xl border border-indigo-100 backdrop-blur-md shadow-sm">
                                <p className="text-[10px] font-black text-indigo-400 uppercase tracking-widest mb-3">Trending Hot-take</p>
                                <div className="flex items-center gap-4">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-ping"></div>
                                    <span className="text-xs font-black text-indigo-900">Culture & Vibe: Explosive Growth</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
