import { Link, NavLink, useNavigate } from 'react-router-dom';
import { Activity, ArrowRight, LogOut, Menu, ShieldCheck, Stethoscope, X } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { useState } from 'react';
export default function Layout({ children }) {
    const { user, signOut } = useAuth(), nav = useNavigate();
    const [open, setOpen] = useState(false);
    const logout = () => {
        signOut();
        nav('/')
    };
    return <>
        <header className="topbar">
            <div className="navwrap">
                <Link to="/" className="brand">
                    <span className="brandmark">
                        <Activity size={21} />
                    </span>
                    <span>
                        Aarogya
                        <span>Link</span>
                        <small>CARE, CONNECTED.</small>
                    </span>
                </Link>
                <button className="mobile-toggle" onClick={() => setOpen(!open)}>
                    {open ? <X /> : <Menu />}
                </button>
                <nav className={open ? 'navlinks show' : 'navlinks'}>
                    <NavLink to="/">Find care</NavLink>
                    {user?.role === 'hospital' && <NavLink to="/hospital">Hospital portal</NavLink>}
                    {user?.role === 'admin' && <NavLink to="/admin">Admin dashboard</NavLink>}
                    {user ?
                        <>
                            <span className="nav-user">
                                Hi, {user.name.split(' ')[0]}
                            </span>
                            <button className="btn btn-outline btn-sm" onClick={logout}>
                                <LogOut size={15} /> Sign out
                            </button>
                        </> :
                        <>
                            <Link to="/login" className="nav-login">Log in</Link>
                            <Link to="/register" className="btn btn-primary btn-sm">
                                Get started <ArrowRight size={15} />
                            </Link>
                        </>}
                </nav>
            </div>
        </header>
        <main>{children}</main>
        <footer>
            <div className="footer-inner">
                <div className="brand footer-brand">
                    <span className="brandmark">
                        <Activity size={20} />
                    </span>
                    <span>
                        Aarogya
                        <span>
                            Link
                        </span>
                        <small>CARE, CONNECTED.</small>
                    </span>
                </div>
                <p>Making hospital resource information easier to find.</p>
                <p className="disclaimer">Availability is self-reported and may change. Always call the hospital to confirm before travelling. In an emergency in India, call 112.</p>
                <span className="copyright">
                    © {new Date().getFullYear()}
                    AarogyaLink · Built for better access to care
                </span>
            </div>
        </footer>
    </>
}
