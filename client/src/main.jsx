
import React from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import Layout from './components/Layout';
import Home from './pages/Home';
import Auth from './pages/Auth';
import HospitalPortal from './pages/HospitalPortal';
import Admin from './pages/Admin';
import './styles.css';

function Guard({ roles, children }) {
    const { user, loading } = useAuth();

    if (loading) {
        return <div className="loading-screen">Loading AarogyaLink…</div>;
    }

    if (!user) return <Navigate to="/login" replace />;

    if (!roles.includes(user.role)) {
        return <Navigate to="/" replace />;
    }

    return children;
}

function App() {
    return (
        <AuthProvider>
            <BrowserRouter>
                <Layout>
                    <Routes>
                        <Route path="/" element={<Home />} />
                        <Route path="/login" element={<Auth mode="login" />} />
                        <Route path="/register" element={<Auth mode="register" />} />
                        <Route
                            path="/hospital"
                            element={
                                <Guard roles={['hospital']}>
                                    <HospitalPortal />
                                </Guard>
                            }
                        />
                        <Route
                            path="/admin"
                            element={
                                <Guard roles={['admin']}>
                                    <Admin />
                                </Guard>
                            }
                        />
                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </Layout>
            </BrowserRouter>
        </AuthProvider>
    );
}

createRoot(document.getElementById('root')).render(
    <React.StrictMode>
        <App />
    </React.StrictMode>
);
