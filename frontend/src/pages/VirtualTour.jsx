import { useState, useEffect } from 'react';
import { useTrip } from '../context/TripContext';
import config from '../config';
import { Camera, Play, Heart, Share2, Info, Loader } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import ReactPlayer from 'react-player';
import './VirtualTour.css';

export default function VirtualTour() {
    const { activeTrip } = useTrip();
    const navigate = useNavigate();
    const [activeVideo, setActiveVideo] = useState(null);
    const [videos, setVideos] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (activeTrip?.destination) {
            fetchVideos(activeTrip.destination);
        }
    }, [activeTrip]);

    const fetchVideos = async (destination) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(config.endpoints.media.videos, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ query: `${destination} travel guide 4k` })
            });
            const data = await response.json();
            if (data.videos && data.videos.length > 0) {
                setVideos(data.videos);
            } else {
                setVideos([]); // Handle empty results
            }
        } catch (err) {
            console.error("Failed to fetch videos:", err);
            setError("Unable to load videos. Please try again later.");
        } finally {
            setLoading(false);
        }
    };

    if (!activeTrip) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] text-center p-8">
                <Camera size={64} className="text-slate-300 mb-4" />
                <h2 className="text-2xl font-bold text-slate-800">No Destination Selected</h2>
                <p className="text-slate-500 mb-6">Select a trip to explore virtual tours.</p>
                <button className="btn btn-primary" onClick={() => navigate('/')}>Go to Hub</button>
            </div>
        );
    }

    const destination = activeTrip.destination;

    return (
        <div className="virtual-tour-page fade-in">
            <div className="mb-8 flex justify-between items-end">
                <div>
                    <h1 className="text-3xl font-extrabold text-slate-900 mb-2">Immersive Tours</h1>
                    <p className="text-slate-500">
                        Experience <span className="font-bold text-slate-800">{destination}</span> before you arrive.
                        AI-curated 4K content.
                    </p>
                </div>
            </div>

            {activeVideo ? (
                <div className="video-player-container mb-8 fade-in">
                    <div className="aspect-video w-full bg-black rounded-2xl overflow-hidden shadow-2xl relative group">
                        <ReactPlayer
                            url={`https://www.youtube.com/watch?v=${activeVideo.id}`}
                            width="100%"
                            height="100%"
                            controls={true}
                            playing={true}
                            config={{
                                youtube: {
                                    playerVars: { showinfo: 1 }
                                }
                            }}
                        />
                        <button
                            onClick={() => setActiveVideo(null)}
                            className="absolute top-4 right-4 bg-black/50 text-white px-4 py-2 rounded-full text-sm font-bold backdrop-blur hover:bg-black/70 transition-all"
                        >
                            Close Player
                        </button>
                    </div>
                    <div className="mt-4 flex justify-between items-start">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-xs font-bold bg-brand text-white px-2 py-0.5 rounded">NOW PLAYING</span>
                                <h2 className="text-2xl font-bold text-slate-800">{activeVideo.title}</h2>
                            </div>
                            <p className="text-slate-500 text-sm">{activeVideo.channel}</p>
                            <p className="text-slate-600 text-sm mt-2 line-clamp-2 max-w-2xl">{activeVideo.description}</p>
                        </div>
                        <div className="flex gap-2">
                            <button className="btn btn-ghost"><Heart size={20} /> Save</button>
                            <button className="btn btn-ghost"><Share2 size={20} /> Share</button>
                        </div>
                    </div>
                </div>
            ) : (
                <>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20">
                            <Loader size={40} className="animate-spin text-brand mb-4" />
                            <p className="text-slate-500 font-medium">Curating 4K tours for {destination}...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20">
                            <p className="text-red-500 font-bold mb-2">Connection Error</p>
                            <p className="text-slate-500">{error}</p>
                            <div className="mt-4 p-4 bg-slate-50 inline-block rounded-lg text-xs text-slate-400 font-mono">
                                Backend might be restarting. Check console.
                            </div>
                        </div>
                    ) : videos.length === 0 ? (
                        <div className="text-center py-20">
                            <p className="text-slate-500">No tours found for this destination.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {videos.map(video => (
                                <div
                                    key={video.id}
                                    className="group cursor-pointer card p-0 overflow-hidden border-0 shadow-md hover:shadow-xl transition-all"
                                    onClick={() => setActiveVideo(video)}
                                >
                                    <div className="relative aspect-video overflow-hidden bg-slate-100">
                                        <img
                                            src={video.thumbnail}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            alt={video.title}
                                        />
                                        <div className="absolute inset-0 bg-black/20 group-hover:bg-black/40 transition-colors flex items-center justify-center">
                                            <div className="w-14 h-14 bg-white/20 backdrop-blur rounded-full flex items-center justify-center border border-white/50 group-hover:scale-110 transition-transform">
                                                <Play size={24} className="text-white fill-white" />
                                            </div>
                                        </div>
                                    </div>
                                    <div className="p-4">
                                        <h3 className="font-bold text-lg text-slate-800 leading-tight mb-1 group-hover:text-brand transition-colors line-clamp-2">
                                            {video.title}
                                        </h3>
                                        <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mb-2">{video.channel}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </>
            )}
        </div>
    );
}
