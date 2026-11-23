
import { createContext, useContext, useEffect, useState } from 'react';
import api from '../services/api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
    const [user, setUser] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (localStorage.getItem('aarogya_token')) {
            api.get('/auth/me')
                .then(r => setUser(r.data.user))
                .catch(() => localStorage.removeItem('aarogya_token'))
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    const signIn = async (email, password) => {
        const { data } = await api.post('/auth/login', { email, password });
        localStorage.setItem('aarogya_token', data.token);
        setUser(data.user);
        return data.user;
    };

    const signUp = async (payload) => {
        const { data } = await api.post('/auth/register', payload);
        localStorage.setItem('aarogya_token', data.token);
        setUser(data.user);
        return data.user;
    };

    const signOut = () => {
        localStorage.removeItem('aarogya_token');
        setUser(null);
    };

    return (
        <AuthContext.Provider value={{ user, loading, signIn, signUp, signOut }}>
            {children}
        </AuthContext.Provider>
    );
}

export const useAuth = () => useContext(AuthContext);
