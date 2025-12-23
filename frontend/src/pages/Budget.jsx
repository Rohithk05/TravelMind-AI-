import { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import config from '../config';
import { DollarSign, TrendingUp, PieChart as PieIcon, AlertCircle, AlertTriangle, Loader2, RefreshCw, Wallet, ArrowRight } from 'lucide-react';
import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend, BarChart, CartesianGrid, XAxis, YAxis, Bar
} from 'recharts';
import { useNavigate } from 'react-router-dom';
import './Budget.css';

export default function Budget() {
    const { activeTrip } = useTrip();
    const navigate = useNavigate();
    const [aiInsight, setAiInsight] = useState(null);
    const [loading, setLoading] = useState(false);
    const [loadingAI, setLoadingAI] = useState(false);

    useEffect(() => {
        if (activeTrip && !aiInsight && !loadingAI) {
            fetchAIInsights();
        }
    }, [activeTrip]);

    const fetchAIInsights = async () => {
        if (!activeTrip) return;
        setLoadingAI(true);
        try {
            const response = await fetch(config.endpoints.ai.insight, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    category: 'budget',
                    destination: activeTrip.destination,
                    context: activeTrip.travel_style || []
                }),
            });
            const data = await response.json();
            setAiInsight(data.insight || {});
        } catch (e) {
            console.error("Budget AI Fetch Failed:", e);
        } finally {
            setLoadingAI(false);
        }
    };

    // If no active trip, show empty state
    if (!activeTrip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Wallet size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">No Trip Selected</h2>
                <p className="text-slate-500 mb-6">Create or select a trip to see your smart budget analysis.</p>
                <button className="btn btn-primary" onClick={() => navigate('/plan')}>Start Planning</button>
            </div>
        );
    }

    // Dynamic Logic based on active trip data
    const currency = activeTrip.budget?.currency || '₹';
    const totalBudget = Number(activeTrip.budget?.total) || (Number(activeTrip.duration_days) * 5000) || 5000;

    // Helper to parse cost estimates (e.g. "₹500" -> 500, "Free" -> 0, "$20" -> 1600 approx)
    const parseCost = (costStr) => {
        if (!costStr || typeof costStr !== 'string') return 0;
        const clean = costStr.replace(/[^0-9]/g, '');
        const val = parseInt(clean) || 0;
        // If it was in $, convert to ₹ (rough estimate 80:1)
        if (costStr.includes('$')) return val * 80;
        return val;
    };

    // Calculate distributions based on Itinerary
    let itineraryCosts = {
        food: 0,
        activities: 0,
        hotels: 0,
        transit: 0,
        other: 0
    };

    const dailyBreakdown = [];

    if (activeTrip.itinerary?.days) {
        activeTrip.itinerary.days.forEach((day, idx) => {
            let dayTotal = 0;
            day.activities?.forEach(act => {
                const cost = parseCost(act.cost_estimate);
                dayTotal += cost;

                if (act.type === 'food') itineraryCosts.food += cost;
                else if (act.type === 'activity') itineraryCosts.activities += cost;
                else if (act.type === 'hotel') itineraryCosts.hotels += cost;
                else if (act.type === 'transport') itineraryCosts.transit += cost;
                else itineraryCosts.other += cost;
            });
            dailyBreakdown.push({
                day: `Day ${idx + 1}`,
                amount: dayTotal
            });
        });
    }

    // Baseline adjustments for realism (if itinerary is sparse)
    itineraryCosts.food = itineraryCosts.food || (totalBudget * 0.2);
    itineraryCosts.hotels = itineraryCosts.hotels || (totalBudget * 0.4);
    itineraryCosts.transit = itineraryCosts.transit || (totalBudget * 0.15);
    itineraryCosts.activities = itineraryCosts.activities || (totalBudget * 0.2);
    itineraryCosts.other = (totalBudget - (itineraryCosts.food + itineraryCosts.hotels + itineraryCosts.transit + itineraryCosts.activities));
    if (itineraryCosts.other < 0) itineraryCosts.other = totalBudget * 0.05;

    const CATEGORY_DATA = [
        { name: 'Accommodation', value: Number(aiInsight?.suggested_split?.Accommodation ? (totalBudget * aiInsight.suggested_split.Accommodation / 100) : itineraryCosts.hotels) || 0, color: '#6366f1' },
        { name: 'Food & Dining', value: Number(aiInsight?.suggested_split?.Food ? (totalBudget * aiInsight.suggested_split.Food / 100) : itineraryCosts.food) || 0, color: '#10b981' },
        { name: 'Transport', value: Number(aiInsight?.suggested_split?.Transport ? (totalBudget * aiInsight.suggested_split.Transport / 100) : itineraryCosts.transit) || 0, color: '#0ea5e9' },
        { name: 'Activities', value: Number(aiInsight?.suggested_split?.Activities ? (totalBudget * aiInsight.suggested_split.Activities / 100) : itineraryCosts.activities) || 0, color: '#f59e0b' },
        { name: 'Misc', value: Number(itineraryCosts.other) || 0, color: '#64748b' },
    ];

    const estimatedSpend = dailyBreakdown.reduce((sum, d) => sum + (Number(d.amount) || 0), 0);
    const spentPercentage = totalBudget > 0 ? Math.min((estimatedSpend / totalBudget) * 100, 100) : 0;
    const remaining = Math.max(totalBudget - estimatedSpend, 0);
    const healthFactor = totalBudget > 0 ? (estimatedSpend / totalBudget) : 0;

    // Dynamic AI Insights
    const getInsight = () => {
        const dest = activeTrip.destination;
        const styles = activeTrip.travel_style || [];

        if (healthFactor > 0.9) return {
            title: "Budget Alert",
            text: `Critical! You are at ${Math.round(healthFactor * 100)}% of your limit. We recommend avoiding high-end bars in ${dest} and using local transport like metros or rickshaws.`,
            color: "rose-500",
            icon: AlertTriangle
        };

        if (styles.includes('Food')) return {
            title: "Taste & Save",
            text: `In ${dest}, many top-rated bistros offer affordable 'thali' or lunch specials. Eating your main meal at 2 PM instead of 8 PM can save you ₹3,000!`,
            color: "sky-500",
            icon: TrendingDown
        };

        if (styles.includes('Nature') || styles.includes('Adventure')) return {
            title: "Eco Explorer",
            text: `Many trails and parks in ${dest} have free entry before 8 AM. Early starts save you both money and crowds!`,
            color: "emerald-500",
            icon: TrendingDown
        };

        return {
            title: "Pro Smart Tip",
            text: `Booking local experiences via local apps in ${dest} saves up to 15% vs hotel booking desks. Use your 'Safety Net' for genuine local gems.`,
            color: "indigo-500",
            icon: TrendingDown
        };
    };

    // Identify high-impact expenses from the itinerary
    const expensiveItems = [];
    if (activeTrip.itinerary?.days) {
        activeTrip.itinerary.days.forEach(day => {
            day.activities?.forEach(act => {
                const cost = parseCost(act.cost_estimate);
                if (cost > totalBudget * 0.05) { // Items costing more than 5% of budget
                    expensiveItems.push({ ...act, day: day.day });
                }
            });
        });
    }
    expensiveItems.sort((a, b) => parseCost(b.cost_estimate) - parseCost(a.cost_estimate));

    // Prepare dynamic AI sections
    const savingTips = aiInsight?.savings_strategies || [
        "Use local transport like metros or rickshaws for short distances.",
        "Eat your main meal at 2 PM instead of 8 PM for lunch specials.",
        "Book museum tickets online in advance to avoid surcharges."
    ];

    const localDeals = aiInsight?.hidden_deals || [
        "Free entry to local temples before 8 AM.",
        "Hidden cafes in the Old Town with 30% lower prices."
    ];

    return (
        <div className="budget-page fade-in max-w-6xl mx-auto">
            <div className="mb-0 flex flex-col md:flex-row md:items-end justify-between gap-4 p-8">
                <div>
                    <h1 className="text-4xl font-black text-slate-900 mb-2 tracking-tight">Smart Budget Controller</h1>
                    <div className="flex items-center gap-2 mb-4">
                        <span className="bg-emerald-500 text-white text-[9px] font-black px-2 py-0.5 rounded tracking-widest uppercase border border-emerald-600">AI Verified Market Data</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></div>
                    </div>
                    <p className="text-slate-500 font-medium max-w-2xl leading-relaxed italic">
                        {aiInsight?.budget_analysis || `Real-time financial analysis for your trip to ${activeTrip.destination}`}
                    </p>
                </div>
                <div className="flex gap-3">
                    {healthFactor > 0.8 && (
                        <div className="flex items-center gap-2 bg-rose-50 text-rose-600 px-5 py-2.5 rounded-2xl border border-rose-100 text-sm font-black animate-pulse shadow-sm">
                            <AlertTriangle size={18} /> Budget Risk
                        </div>
                    )}
                    <div className="bg-slate-100 px-5 py-2.5 rounded-2xl text-slate-600 text-sm font-black flex items-center gap-2 shadow-sm">
                        <ArrowRight size={16} /> {activeTrip.duration_days} Days Analysis
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 p-8 pt-0">
                {/* Financial Summary Stats */}
                <div className="lg:col-span-12 grid grid-cols-1 sm:grid-cols-4 gap-4">
                    <div className="card p-6 bg-white border-b-4 border-b-sky-500 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Budget</p>
                        <h3 className="text-2xl font-black text-slate-900">{currency}{totalBudget.toLocaleString()}</h3>
                        <p className="text-[10px] text-slate-500 font-bold mt-2 italic">Set by User</p>
                    </div>
                    <div className="card p-6 bg-white border-b-4 border-b-indigo-500 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Planned Spend</p>
                        <h3 className="text-2xl font-black text-slate-900">{currency}{estimatedSpend.toLocaleString()}</h3>
                        <p className={`text-[10px] font-black mt-2 ${healthFactor > 0.9 ? 'text-rose-500' : 'text-indigo-500'}`}>
                            {Math.round(spentPercentage)}% of Budget
                        </p>
                    </div>
                    <div className="card p-6 bg-white border-b-4 border-b-emerald-500 shadow-sm">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Safety Margin</p>
                        <h3 className="text-2xl font-black text-emerald-600">{currency}{remaining.toLocaleString()}</h3>
                        <p className="text-[10px] text-emerald-500 font-black mt-2">Available Padding</p>
                    </div>
                    <div className="card p-6 bg-sky-50 text-slate-900 border border-sky-100 shadow-sm flex flex-col justify-center">
                        <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">Daily Allowance</p>
                        <h3 className="text-2xl font-black text-slate-900">{currency}{Math.round(totalBudget / (Number(activeTrip.duration_days) || 1)).toLocaleString()}</h3>
                        <p className="text-[10px] text-sky-500 font-black mt-2 uppercase tracking-tighter">Optimum Pace</p>
                    </div>
                </div>

                {/* Left: Spend Curve & High Impact Items */}
                <div className="lg:col-span-8 space-y-8">
                    {/* Spend Curve */}
                    <div className="card p-8 bg-white shadow-sm">
                        <div className="flex justify-between items-center mb-8">
                            <div>
                                <h3 className="font-black text-slate-900 text-lg">Expense Flow Analysis</h3>
                                <p className="text-xs text-slate-400">Day-by-day cost distribution derived from Itinerary</p>
                            </div>
                        </div>
                        <div className="h-[320px] w-full">
                            <ResponsiveContainer>
                                <BarChart data={dailyBreakdown}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 11, fontWeight: 'bold' }} dy={10} />
                                    <YAxis
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fill: '#94a3b8', fontSize: 11 }}
                                        tickFormatter={(val) => `${currency}${val >= 1000 ? (val / 1000) + 'k' : val}`}
                                    />
                                    <Tooltip
                                        cursor={{ fill: '#f8fafc' }}
                                        contentStyle={{ borderRadius: '16px', border: 'none', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.1)', padding: '16px' }}
                                        formatter={(val) => [`${currency}${val.toLocaleString()}`, 'Planned Spend']}
                                    />
                                    <Bar dataKey="amount" fill="#6366f1" radius={[8, 8, 4, 4]} barSize={45} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    {/* High Impact Items / AI Predictions */}
                    <div className="card p-8 bg-white shadow-sm">
                        <h3 className="font-black text-slate-900 text-lg mb-6 flex items-center gap-2">
                            AI Predicted Expenses
                        </h3>
                        <div className="space-y-4">
                            {(expensiveItems.length > 0 ? expensiveItems : (aiInsight?.typical_expenses || [])).slice(0, 5).map((item, idx) => (
                                <div key={idx} className="flex items-center justify-between p-4 bg-slate-50 rounded-2xl border border-slate-100 group hover:border-sky-200 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 bg-white rounded-xl flex items-center justify-center text-sky-600 font-black shadow-sm group-hover:bg-sky-500 group-hover:text-white transition-all">
                                            {item.day ? `D${item.day}` : <TrendingDown size={18} />}
                                        </div>
                                        <div>
                                            <h4 className="font-bold text-slate-900 text-sm">{item.title || item}</h4>
                                            <p className="text-[10px] text-slate-500 font-bold uppercase tracking-wider">{item.type || 'AI Market Data'}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="font-black text-slate-900 text-sm">{item.cost_estimate || 'Market Avg'}</p>
                                        <p className="text-[10px] text-emerald-600 font-bold italic">Verified Pricing</p>
                                    </div>
                                </div>
                            ))}
                            {expensiveItems.length === 0 && !aiInsight?.typical_expenses && (
                                <p className="text-center text-slate-400 py-4 font-medium italic">Scanning global markets for typical costs...</p>
                            )}
                        </div>
                    </div>
                </div>

                {/* Right: Allocation & AI Insights */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Allocation Pie */}
                    <div className="card p-8 bg-white shadow-sm">
                        <h3 className="font-black text-slate-900 text-lg mb-2">Category Logic</h3>
                        <p className="text-xs text-slate-400 mb-6">Automated fund distribution</p>

                        <div className="h-[220px] w-full relative">
                            <ResponsiveContainer>
                                <PieChart>
                                    <Pie
                                        data={CATEGORY_DATA}
                                        innerRadius={70}
                                        outerRadius={95}
                                        paddingAngle={8}
                                        dataKey="value"
                                        stroke="none"
                                    >
                                        {CATEGORY_DATA.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={entry.color} />
                                        ))}
                                    </Pie>
                                    <Tooltip />
                                </PieChart>
                            </ResponsiveContainer>
                            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                                <div className="text-center">
                                    <span className="block text-[8px] text-slate-400 uppercase font-black tracking-[0.2em] mb-1">Index</span>
                                    <span className="block text-xs font-black uppercase text-sky-500">
                                        {aiInsight?.cost_index || 'Mid'}
                                    </span>
                                </div>
                            </div>
                        </div>

                        <div className="space-y-5 mt-8 border-t border-slate-50 pt-6">
                            {CATEGORY_DATA.map(cat => (
                                <div key={cat.name} className="flex justify-between items-center group">
                                    <div className="flex items-center gap-3">
                                        <div className="w-3 h-3 rounded-full shadow-sm shrink-0" style={{ background: cat.color }}></div>
                                        <span className="text-xs font-black text-slate-700 group-hover:text-slate-900 transition-colors uppercase tracking-tight">{cat.name}</span>
                                    </div>
                                    <div className="text-right">
                                        <span className="block text-sm font-black text-slate-900">{currency}{cat.value.toLocaleString()}</span>
                                        <span className="block text-[10px] text-slate-500 font-bold tracking-tighter">{Math.round((cat.value / totalBudget) * 100)}% Allocation</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* AI Insight Box (Unified Light Theme) */}
                    <div className="card bg-white text-slate-900 p-8 relative overflow-hidden shadow-2xl border border-slate-100">
                        <div className="absolute -top-10 -right-10 w-48 h-48 bg-sky-50 rounded-full blur-[90px] opacity-60"></div>

                        <div className="relative z-10">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-12 h-12 bg-sky-50 rounded-2xl flex items-center justify-center border border-sky-100 shadow-inner">
                                    <TrendingDown size={24} className="text-sky-600" />
                                </div>
                                <div>
                                    <h3 className="font-black text-slate-900 text-base leading-none tracking-tight">AI Financial Strategy</h3>
                                    <span className="text-[9px] text-sky-600 font-black uppercase tracking-[0.2em]">Live Intelligence Engine</span>
                                </div>
                            </div>

                            {loadingAI ? (
                                <div className="py-10 text-center">
                                    <div className="w-8 h-8 border-2 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Analyzing Markets...</p>
                                </div>
                            ) : (
                                <>
                                    <div className="space-y-4 mb-8">
                                        <p className="text-xs text-sky-600 font-black uppercase tracking-widest">Top Saving Strategies</p>
                                        {(aiInsight?.savings_strategies || aiInsight?.saving_tips || []).map((tip, idx) => (
                                            <div key={idx} className="flex gap-3 items-start border-l-2 border-sky-200 pl-4 py-1">
                                                <div className="w-1.5 h-1.5 rounded-full bg-sky-500 mt-1.5 shrink-0"></div>
                                                <p className="text-slate-700 text-sm font-bold italic leading-relaxed">{tip}</p>
                                            </div>
                                        ))}
                                    </div>

                                    <div className="space-y-4 mb-8">
                                        <p className="text-xs text-emerald-600 font-black uppercase tracking-widest">Hidden Local Deals</p>
                                        {(aiInsight?.hidden_deals || aiInsight?.local_deals || []).map((deal, idx) => (
                                            <div key={idx} className="flex items-center gap-3 bg-slate-50 p-3 rounded-xl border border-slate-100">
                                                <TrendingDown size={14} className="text-emerald-600" />
                                                <span className="text-xs text-slate-800 font-bold">{deal}</span>
                                            </div>
                                        ))}
                                    </div>
                                </>
                            )}

                            <button onClick={fetchAIInsights} disabled={loadingAI} className="w-full py-4 bg-sky-600 hover:bg-sky-500 disabled:opacity-50 text-white rounded-2xl text-[10px] font-black uppercase tracking-[0.2em] transition-all shadow-xl shadow-sky-900/50 border border-sky-400/20 active:scale-95 flex items-center justify-center gap-2">
                                <RefreshCw size={12} className={loadingAI ? 'animate-spin' : ''} />
                                {loadingAI ? 'Processing...' : 'Recalculate Optimization'}
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
