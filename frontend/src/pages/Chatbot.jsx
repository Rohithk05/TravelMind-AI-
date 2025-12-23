import { useState, useRef, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import config from '../config';
import { Send, Bot, User, Loader2, Sparkles } from 'lucide-react';
import './Chatbot.css';

export default function Chatbot() {
    const { activeTrip } = useTrip();
    const [messages, setMessages] = useState([
        {
            role: 'assistant',
            content: activeTrip
                ? `Hey! I'm your AI travel companion for ${activeTrip.destination}. Ask me anything about your trip!`
                : "Hey! I'm your AI travel companion. Start planning a trip to unlock personalized assistance!"
        }
    ]);
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages]);

    // Update welcome message if trip changes
    useEffect(() => {
        if (activeTrip && messages.length === 1 && messages[0].content.includes("Start planning a trip")) {
            setMessages([{
                role: 'assistant',
                content: `Welcome back! Ready to continue planning for **${activeTrip.destination}**? Ask me about food, safety, or local customs.`
            }]);
        }
    }, [activeTrip]);

    const sendMessage = async () => {
        if (!input.trim() || loading) return;

        const userMessage = input.trim();
        setMessages(prev => [...prev, { role: 'user', content: userMessage }]);
        setInput('');
        setLoading(true);

        try {
            const contextString = activeTrip
                ? `Destination: ${activeTrip.destination}. Duration: ${activeTrip.duration_days} days. Budget: ${activeTrip.budget.total}. Style: ${activeTrip.travel_style.join(', ')}.`
                : "General Travel Advice mode.";

            const response = await fetch(config.endpoints.ai.chat, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    message: userMessage,
                    context: contextString
                }),
            });

            const data = await response.json();

            // Format response
            const aiMessage = { role: 'assistant', content: data.response || "I'm having trouble connecting to the travel grid right now. Try again?" };
            setMessages(prev => [...prev, aiMessage]);

        } catch (error) {
            console.error(error);
            setMessages(prev => [...prev, { role: 'assistant', content: "Offline Mode: Unable to reach the Intelligence Engine. Please check your connection." }]);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="chatbot-page fade-in h-[calc(100vh-140px)] flex flex-col max-w-5xl mx-auto border border-slate-200 rounded-2xl bg-white shadow-sm overflow-hidden">
            {/* Header */}
            <div className="p-4 border-b border-slate-100 bg-slate-50 flex justify-between items-center">
                <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-indigo-600 flex items-center justify-center shadow-lg shadow-indigo-200">
                        <Bot size={20} className="text-white" />
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-800">AI Travel Companion</h2>
                        <p className="text-xs text-slate-500 flex items-center gap-1">
                            <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse block"></span>
                            Online • {activeTrip ? `Context: ${activeTrip.destination}` : 'No Context'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-6 bg-slate-50/50">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex gap-4 ${msg.role === 'user' ? 'flex-row-reverse' : ''}`}>
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${msg.role === 'user' ? 'bg-slate-200' : 'bg-indigo-100 text-indigo-600'}`}>
                            {msg.role === 'user' ? <User size={16} /> : <Sparkles size={16} />}
                        </div>
                        <div className={`max-w-[80%] p-4 rounded-2xl text-sm leading-relaxed shadow-sm ${msg.role === 'user'
                            ? 'bg-slate-900 text-white rounded-tr-none'
                            : 'bg-white border border-slate-100 text-slate-700 rounded-tl-none'
                            }`}>
                            {/* Simple Markdown-ish bolding */}
                            {msg.content.split('**').map((part, i) =>
                                i % 2 === 1 ? <strong key={i}>{part}</strong> : part
                            )}
                        </div>
                    </div>
                ))}

                {loading && (
                    <div className="flex gap-4">
                        <div className="w-8 h-8 rounded-full bg-indigo-100 text-indigo-600 flex items-center justify-center shrink-0">
                            <Sparkles size={16} />
                        </div>
                        <div className="bg-white border border-slate-100 p-4 rounded-2xl rounded-tl-none shadow-sm flex items-center gap-2">
                            <Loader2 size={16} className="animate-spin text-indigo-500" />
                            <span className="text-xs font-bold text-slate-400">Thinking...</span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white border-t border-slate-100">
                <div className="relative">
                    <input
                        type="text"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyPress={(e) => e.key === 'Enter' && sendMessage()}
                        placeholder={activeTrip ? `Ask about ${activeTrip.destination}...` : "Select a trip to start..."}
                        className="w-full pl-5 pr-14 py-4 bg-slate-50 border border-slate-200 rounded-xl focus:bg-white focus:border-indigo-500 transition-all font-medium text-slate-700"
                        disabled={!activeTrip && messages.length < 2} // Soft disable if no trip
                    />
                    <button
                        onClick={sendMessage}
                        disabled={!input.trim() || loading}
                        className="absolute right-2 top-2 p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                    >
                        <Send size={20} />
                    </button>
                </div>
            </div>
        </div>
    );
}
