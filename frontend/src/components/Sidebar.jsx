import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
    LayoutGrid, Map, Wallet, Users, ShieldCheck, Leaf,
    Star, Camera, MessageSquare, Settings, LogOut
} from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import './Sidebar.css';

const navItems = [
    { path: '/', label: 'My Hub', icon: LayoutGrid },
    { path: '/plan', label: 'Plan Trip', icon: Map },
    { path: '/budget', label: 'Smart Budget', icon: Wallet },
    { path: '/crowd', label: 'Safety Radar', icon: Users },
    { path: '/safety', label: 'Risk Intel', icon: ShieldCheck },
    { path: '/sustainability', label: 'Eco-Travel', icon: Leaf },
    { path: '/reviews', label: 'Reviews', icon: Star },
    { path: '/virtual-tour', label: 'Virtual Tours', icon: Camera },
    { path: '/chat', label: 'AI Companion', icon: MessageSquare },
];

export default function Sidebar() {
    const location = useLocation();
    const navigate = useNavigate();
    const { user, logout } = useAuth();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    // Get initials for avatar
    const getInitials = (name) => {
        if (!name) return 'U';
        return name.split(' ').map(n => n[0]).join('').toUpperCase();
    };

    return (
        <>
            {/* Header */}
            <div className="brand-header">
                <div className="brand-logo-icon">
                    <Map size={18} className="text-white" />
                </div>
                <div>
                    <span className="brand-name">TravelMind</span>
                    <span className="brand-badge">PRO</span>
                </div>
            </div>

            {/* Nav */}
            <nav className="sidebar-nav">
                <div className="sidebar-label">Core Modules</div>
                {navItems.map((item) => {
                    const Icon = item.icon;
                    const isActive = location.pathname === item.path;
                    return (
                        <Link
                            key={item.path}
                            to={item.path}
                            className={`nav-link ${isActive ? 'active' : ''}`}
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Footer */}
            <div className="sidebar-footer">
                <div className="user-profile">
                    <img
                        src={`https://ui-avatars.com/api/?name=${encodeURIComponent(user?.full_name || 'User')}&background=0ea5e9&color=fff`}
                        alt="Profile"
                        className="user-avatar"
                    />
                    <div className="user-info">
                        <p className="user-name">{user?.full_name || 'User'}</p>
                        <p className="user-role">{user?.email || 'user@example.com'}</p>
                    </div>
                    <button
                        onClick={handleLogout}
                        className="logout-btn"
                        title="Logout"
                    >
                        <LogOut size={16} className="text-slate-400 hover:text-rose-500 transition-colors cursor-pointer" />
                    </button>
                </div>
            </div>
        </>
    );
}
