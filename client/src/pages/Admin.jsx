import { useEffect, useState } from 'react';
import { Activity, Building2, Check, Clock, Hospital, Power, RefreshCw, X } from 'lucide-react';
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts';
import api from '../services/api';

export default function Admin() {
    const [hospitals, setHospitals] = useState([]), [stats, setStats] = useState({ totalHospitals: 0, byCity: [] }), [error, setError] = useState(''), [busy, setBusy] = useState('');
    const load = () => Promise.all([api.get('/hospitals/admin/all'), api.get('/hospitals/admin/dashboard')]).then(([a, b]) => {
        setHospitals(a.data);
        setStats(b.data)
    })
        .catch(() => setError('Unable to load admin data. Check your account permissions.'));
    useEffect(() => { load() }, []);
    const change = async (id, status) => {
        setBusy(id); setError(''); try { await api.patch(`/hospitals/admin/${id}/status`, { status }); await load() } catch (e) { setError(e.response?.data?.message || 'Could not update hospital status') } finally { setBusy('') }
    };
    const pending = hospitals.filter(h => h.status === 'pending').length;
    return <div className="admin-page">
        <div className="portal-heading">
            <span className="eyebrow dark">PLATFORM CONTROL</span>
            <h1>Admin dashboard</h1>
            <p>Review hospital applications and monitor reported resource availability.</p>
        </div>{error && <div className="alert">{error}</div>}
        <div className="stat-cards">
            <div className="stat-card">
                <span className="stat-icon"><Hospital /></span>
                <span>Approved hospitals</span>
                <strong>{stats.totalHospitals}</strong>
            </div>
            <div className="stat-card">
                <span className="stat-icon amber"><Clock /></span>
                <span>Awaiting review</span>
                <strong>{pending}</strong>
            </div>
            <div className="stat-card">
                <span className="stat-icon blue"><Building2 /></span>
                <span>Total registrations</span>
                <strong>{hospitals.length}</strong>
            </div>
        </div>
        <section className="admin-panel">
            <div className="panel-heading">
                <div>
                    <h2>Resource availability by city</h2>
                    <p>Currently available units across approved hospitals</p>
                </div>
                <button className="icon-btn" onClick={load} title="Refresh"><RefreshCw size={17} />
                </button>
            </div>
            <div className="chart-wrap">
                {stats.byCity.length ?
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={stats.byCity} margin={{ top: 10, right: 10, left: 0, bottom: 5 }}>
                            <CartesianGrid strokeDasharray="3 3" vertical={false} />
                            <XAxis dataKey="city" tick={{ fontSize: 12 }} />
                            <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
                            <Tooltip />
                            <Bar dataKey="general" name="General beds" fill="#139b70" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="icu" name="ICU beds" fill="#3979c6" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="oxygen" name="Oxygen cylinders" fill="#e5a33a" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer> :
                    <div className="empty-chart">No approved hospital data yet.</div>
                }
            </div>
        </section>
        <section className="admin-panel">
            <div className="panel-heading">
                <div>
                    <h2>Hospital registrations</h2>
                    <p>Approve new listings or deactivate outdated records.</p>
                </div>
            </div>
            <div className="table-scroll">
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>HOSPITAL</th>
                            <th>CONTACT</th>
                            <th>STATUS</th>
                            <th>ACTIONS</th>
                        </tr>
                    </thead>
                    <tbody>{hospitals.map(h => <tr key={h._id}>
                        <td><b>{h.name}</b><small>{h.area ? h.area + ', ' : ''}{h.city}</small></td>
                        <td>{h.phone}<small>{h.owner?.email}</small></td>
                        <td><span className={`pill ${h.status}`}>{h.status}</span></td>
                        <td><div className="table-actions">{h.status !== 'approved' && <button disabled={busy === h._id} className="action-approve" onClick={() => change(h._id, 'approved')}><Check size={14} /> Approve</button>}{h.status !== 'inactive' && <button disabled={busy === h._id} className="action-disable" onClick={() => change(h._id, 'inactive')}><Power size={14} /> Deactivate</button>}{h.status === 'inactive' && <button disabled={busy === h._id} className="action-approve" onClick={() => change(h._id, 'approved')}><Check size={14} /> Reactivate</button>}</div></td>
                    </tr>)
                    }
                    </tbody>
                </table>
                {!hospitals.length && <div className="empty-chart">No hospital registrations yet.</div>}
            </div>
        </section>
    </div>
}
