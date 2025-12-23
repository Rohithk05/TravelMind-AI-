import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { Mail, Lock, User, ArrowRight, Sparkles, Shield } from 'lucide-react';
import './Auth.css';

export default function Register() {
    const { register } = useAuth();
    const navigate = useNavigate();
    const [formData, setFormData] = useState({
        fullName: '',
        email: '',
        password: '',
        confirmPassword: ''
    });
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (formData.password !== formData.confirmPassword) {
            setError('Passwords do not match');
            return;
        }

        if (formData.password.length < 6) {
            setError('Password must be at least 6 characters');
            return;
        }

        setLoading(true);

        const result = await register(formData.email, formData.password, formData.fullName);

        if (result.success) {
            if (result.message) {
                // Show success message instead of navigating
                setError(''); // Clear any errors
                alert(result.message); // Simple alert for now
                navigate('/login');
            } else {
                navigate('/');
            }
        } else {
            setError(result.error || 'Registration failed. Please try again.');
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
                            <h2>Create Account</h2>
                            <p>Join TravelMind and start planning smarter</p>
                        </div>

                        <form onSubmit={handleSubmit} className="auth-form">
                            {error && (
                                <div className="auth-error">
                                    <Shield size={16} />
                                    <span>{error}</span>
                                </div>
                            )}

                            <div className="form-group">
                                <label htmlFor="fullName">Full Name</label>
                                <div className="input-wrapper">
                                    <User size={18} className="input-icon" />
                                    <input
                                        id="fullName"
                                        type="text"
                                        placeholder="John Doe"
                                        value={formData.fullName}
                                        onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

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
                                        placeholder="At least 6 characters"
                                        value={formData.password}
                                        onChange={(e) => setFormData({ ...formData, password: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>

                            <div className="form-group">
                                <label htmlFor="confirmPassword">Confirm Password</label>
                                <div className="input-wrapper">
                                    <Lock size={18} className="input-icon" />
                                    <input
                                        id="confirmPassword"
                                        type="password"
                                        placeholder="Re-enter your password"
                                        value={formData.confirmPassword}
                                        onChange={(e) => setFormData({ ...formData, confirmPassword: e.target.value })}
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
                                    <span>Creating Account...</span>
                                ) : (
                                    <>
                                        <span>Create Account</span>
                                        <ArrowRight size={18} />
                                    </>
                                )}
                            </button>
                        </form>

                        <div className="auth-footer">
                            <p>Already have an account? <a href="/login">Sign in</a></p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
