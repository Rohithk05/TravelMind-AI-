import { Outlet, useNavigate } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import { Bell, Search } from 'lucide-react';
import './Layout.css';

export default function MainLayout() {
    const navigate = useNavigate();

    return (
        <div className="app-shell">
            {/* 1. Left Sidebar */}
            <div className="sidebar-container">
                <Sidebar />
            </div>

            {/* 2. Main Wrapper (Header + Page) */}
            <main className="main-wrapper">

                {/* 2.1 Top Navigation Header */}
                <header className="app-header">
                    <div className="header-left">
                        <div className="header-search">
                            <Search size={18} />
                            <input
                                type="text"
                                placeholder="Search destinations, trips, or guides..."
                            />
                        </div>
                    </div>

                    <div className="header-right">
                        <button className="header-icon-btn">
                            <Bell size={20} />
                            <span className="notification-dot"></span>
                        </button>
                        <button className="btn btn-primary" onClick={() => navigate('/plan')}>
                            + New Trip
                        </button>
                    </div>
                </header>

                {/* 2.2 Scrollable Page Content */}
                <div className="page-container">
                    <Outlet />
                </div>
            </main>
        </div>
    );
}
