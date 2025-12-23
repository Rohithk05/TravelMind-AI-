import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles, Shield } from 'lucide-react';
import './Auth.css';

export default function Login() {
    const { login } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        email: '',
        password: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setLoading(true);

        const result = await login(formData.email, formData.password);

        if (result.success) {
            navigate('/');
        } else {
            setError(result.error || 'Login failed. Please check your credentials.');
        }

        setLoading(false);
    };

    return (
        <div className="auth-page">
            <div className="auth-container fade-in">
                <div className="auth-left">
                    <div className="auth-brand">
                        <div className="brand-icon">
                            <Sparkles size={32} className="text-sky-500" />
                        </div>
                        <h1 className="brand-title">TravelMind AI</h1>
                        <p className="brand-subtitle">Your Intelligent Travel Companion</p>
                    </div>

                    <div className="auth-features">
                        <div className="feature-item">
                            <Shield className="feature-icon" />
                            <div>
                                <h3>AI-Powered Planning</h3>
                                <p>Smart itineraries tailored to your preferences</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <Shield className="feature-icon" />
                            <div>
                                <h3>Real-Time Intelligence</h3>
                                <p>Live safety, crowd, and budget insights</p>
                            </div>
                        </div>
                        <div className="feature-item">
                            <Shield className="feature-icon" />
                            <div>
                                <h3>Secure & Private</h3>
                                <p>Your data is encrypted and protected</p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="auth-right">
                    <div className="auth-form-container">
                        <div className="auth-header">
                            <h2>Welcome Back</h2>
                            <p>Sign in to access your travel dashboard</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {error && (
                                <div className="auth-error">
                                    <Shield size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="email">Email Address</label>
                                <div className="input-wrapper">
                                    <Mail size={18} className="input-icon" />
                                    <input
                                        id="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        value={formData.email}
                                        onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="password">Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        id="password"
                                        type="password"
                                        placeholder="Enter your password"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <button
                                type="submit"
                                className="auth-submit-btn"
                                disabled={loading}
                            >
                                {loading ? (
                                    <span>Signing In...</span>
                                ) : (
                                    <>
                                        <span>Sign In</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Don't have an account? <a href="/register">Create one</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
