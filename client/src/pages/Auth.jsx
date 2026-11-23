import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Activity, ArrowLeft, ArrowRight, LockKeyhole } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
export default function Auth({ mode }) {
    const isRegister = mode === 'register';
    const { signIn, signUp } = useAuth(), nav = useNavigate();
    const [form, setForm] = useState({ name: '', email: '', password: '', role: 'public' }),
        [error, setError] = useState(''),
        [busy, setBusy] = useState(false);
    const change = e => setForm({ ...form, [e.target.name]: e.target.value });
    const submit = async e => {
        e.preventDefault(); setError(''); setBusy(true);
        try {
            const user = isRegister ? await signUp(form) :
                await signIn(form.email, form.password); nav(user.role === 'admin' ? '/admin' : user.role === 'hospital' ? '/hospital' : '/')
        } catch (e) {
            setError(e.response?.data?.message || 'Something went wrong. Please try again.')
        } finally { setBusy(false) }
    };
    return <section className="auth-page"><div className="auth-card"><Link to="/" className="back-link"><ArrowLeft size={15} /> Back to AarogyaLink</Link><div className="auth-mark"><Activity size={27} /></div><span className="eyebrow dark">{isRegister ? 'JOIN AAROGYALINK' : 'WELCOME BACK'}</span><h1>{isRegister ? 'Create your account' : 'Sign in to continue'}</h1><p>{isRegister ? 'Choose how you would like to use AarogyaLink.' : 'Access your hospital portal or administrator dashboard.'}</p><form onSubmit={submit}>{isRegister && <><label>Full name<input name="name" value={form.name} onChange={change} placeholder="Your full name" required /></label><label>Account type<select name="role" value={form.role} onChange={change}><option value="public">Public / Patient</option><option value="hospital">Hospital staff</option></select></label></>}<label>Email address<input type="email" name="email" value={form.email} onChange={change} placeholder="you@example.com" required /></label><label>Password<input type="password" name="password" value={form.password} onChange={change} placeholder={isRegister ? 'At least 8 characters' : 'Your password'} minLength={isRegister ? 8 : undefined} required /></label>{error && <div className="alert">{error}</div>}<button className="btn btn-primary auth-submit" disabled={busy}>{busy ? 'Please wait…' : isRegister ? 'Create account' : 'Sign in'} <ArrowRight size={16} /></button></form><div className="auth-switch">{isRegister ? 'Already have an account?' : 'New to AarogyaLink?'} <Link to={isRegister ? '/login' : '/register'}>{isRegister ? 'Sign in' : 'Create account'}</Link></div><div className="secure-note"><LockKeyhole size={14} /> Your account is protected with encrypted password storage.</div></div></section>
}
