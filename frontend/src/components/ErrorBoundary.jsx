import React from 'react';

class ErrorBoundary extends React.Component {
    constructor(props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error) {
        return { hasError: true, error };
    }

    componentDidCatch(error, errorInfo) {
        console.error("ErrorBoundary caught an error", error, errorInfo);
    }

    render() {
        if (this.state.hasError) {
            return (
                <div className="flex flex-col items-center justify-center min-h-screen bg-slate-50 p-8 text-center">
                    <div className="w-20 h-20 bg-rose-100 text-rose-600 rounded-3xl flex items-center justify-center mb-6 shadow-lg">
                        <svg xmlns="http://www.w3.org/2000/svg" width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="m21.73 18-8-14a2 2 0 0 0-3.48 0l-8 14A2 2 0 0 0 4 21h16a2 2 0 0 0 1.73-3Z" /><path d="M12 9v4" /><path d="M12 17h.01" /></svg>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">Intelligence Engine Halted</h1>
                    <p className="text-slate-500 max-w-md mb-8 font-medium leading-relaxed">
                        We encountered a critical error while processing your travel data. This is usually due to unexpected data formats from the AI.
                    </p>
                    <div className="bg-white border border-slate-200 p-6 rounded-2xl text-left mb-8 w-full max-w-xl shadow-sm">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Error Details</p>
                        <code className="text-rose-500 text-sm font-mono break-all">
                            {this.state.error?.toString() || "Unknown Intelligence Failure"}
                        </code>
                    </div>
                    <button
                        onClick={() => window.location.reload()}
                        className="btn bg-slate-900 text-white hover:bg-slate-800 px-8 py-4 rounded-2xl font-bold shadow-xl transition-all active:scale-95"
                    >
                        Re-initialize Engine
                    </button>
                    <p className="mt-8 text-xs text-slate-400 font-bold uppercase tracking-tighter">TravelMind Core Resilience System</p>
                </div>
            );
        }

        return this.props.children;
    }
}

export default ErrorBoundary;
