import { useEffect, useState } from 'react';
import { Activity, CheckCircle2, Clock, Hospital as HospitalIcon, Save } from 'lucide-react';
import api from '../services/api';
const empty = { name: '', address: '', city: '', area: '', phone: '', emergencyContact: '', location: { lat: 19.076, lng: 72.8777 }, resources: { general: { total: 0, available: 0 }, icu: { total: 0, available: 0 }, ventilators: { total: 0, available: 0 }, oxygen: { total: 0, available: 0 } } };
const keys = [
    ['general', 'General beds'],
    ['icu', 'ICU beds'],
    ['ventilators', 'Ventilators'],
    ['oxygen', 'Oxygen cylinders']
];
export default function HospitalPortal() {
    const [data, setData] = useState(empty),
        [status, setStatus] = useState('new'),
        [busy, setBusy] = useState(false),
        [message, setMessage] = useState(''),
        [error, setError] = useState('');

    useEffect(() => {
        api.get('/hospitals/mine')
            .then(r => {
                if (r.data) {
                    setData(r.data); setStatus(r.data.status)
                }
            }).catch(e => {
                if (e.response?.status !== 404)
                    setError('Unable to load hospital profile')
            })
    }, []);
    const update = (k, v) => setData(d => ({ ...d, [k]: v }));
    const resource = (key, field, value) => setData(d => ({ ...d, resources: { ...d.resources, [key]: { ...d.resources[key], [field]: Number(value) } } }));
    const submit = async e => {
        e.preventDefault(); setBusy(true); setMessage(''); setError(''); try { const r = status === 'new' ? await api.post('/hospitals', data) : await api.put('/hospitals/mine', data); setData(r.data); setStatus(r.data.status); setMessage(status === 'new' ? 'Hospital submitted for admin approval.' : 'Hospital details and availability updated.') } catch (e) { setError(e.response?.data?.message || 'Could not save changes') }
        finally { setBusy(false) }
    };
    return <div className="portal-page">
        <div className="portal-heading">
            <span className="eyebrow dark">HOSPITAL PARTNER PORTAL</span>
            <h1>Manage your hospital</h1>
            <p>Keep your facility information and resource availability up to date.</p>
        </div>
        {status !== 'new' &&
            <div className={`approval-banner ${status}`}>
                <span>{status === 'approved' ? <CheckCircle2 /> : <Clock />}</span>
                <div><b>{status === 'approved' ? 'Your hospital is approved' : `Application ${status}`}</b>
                    <p>{status === 'approved' ? 'Your hospital is visible in the public directory.' : status === 'pending' ? 'Your profile is awaiting administrator review.' : `Please contact the AarogyaLink administrator for assistance.`}</p>
                </div>
            </div>}
        {message && <div className="success-alert">{message}</div>}
        {error && <div className="alert">{error}</div>}
        <form className="portal-form" onSubmit={submit}>
            <section className="form-section">
                <div className="form-section-title">
                    <HospitalIcon />
                    <div>
                        <h2>Hospital information</h2>
                        <p>Contact details and location shown to the public.</p>
                    </div>
                </div>
                <div className="form-grid">
                    <label className="wide">Hospital name
                        <input required value={data.name} onChange={e => update('name', e.target.value)} placeholder="e.g. City Care Hospital" />
                    </label>
                    <label className="wide">Full address
                        <input required value={data.address} onChange={e => update('address', e.target.value)} placeholder="Street, landmark, locality" />
                    </label>
                    <label>City
                        <input required value={data.city} onChange={e => update('city', e.target.value)} placeholder="City" />
                    </label>
                    <label>Area / locality
                        <input value={data.area} onChange={e => update('area', e.target.value)} placeholder="Area" />
                    </label>
                    <label>Hospital phone
                        <input required value={data.phone} onChange={e => update('phone', e.target.value)} placeholder="+91…" />
                    </label>
                    <label>Emergency contact
                        <input value={data.emergencyContact} onChange={e => update('emergencyContact', e.target.value)} placeholder="Emergency number" />
                    </label>
                    <label>Latitude
                        <input type="number" step="any" required value={data.location.lat} onChange={e => update('location', { ...data.location, lat: Number(e.target.value) })} />
                    </label>
                    <label>Longitude
                        <input type="number" step="any" required value={data.location.lng} onChange={e => update('location', { ...data.location, lng: Number(e.target.value) })} />
                    </label>
                </div>
                <p className="field-hint">Enter the hospital's map coordinates. You can find them by right-clicking its location in Google Maps.
                </p>
            </section>
            <section className="form-section">
                <div className="form-section-title">
                    <Activity />
                    <div>
                        <h2>Resource availability</h2>
                        <p>Enter total capacity and currently available units.</p>
                    </div>
                </div>
                <div className="capacity-table">
                    <div className="capacity-head">
                        <span>RESOURCE</span>
                        <span>TOTAL CAPACITY</span>
                        <span>AVAILABLE NOW</span>
                    </div>{keys.map(([key, label]) =>
                        <div className="capacity-row" key={key}>
                            <b>{label}</b>
                            <input aria-label={`${label} total`} type="number" min="0" value={data.resources[key].total}
                                onChange={e => resource(key, 'total', e.target.value)} />
                            <input
                                aria-label={`${label} available`}
                                type="number"
                                min="0"
                                max={data.resources[key].total}
                                value={data.resources[key].available}
                                onChange={e => resource(key, 'available', e.target.value)}
                            />
                        </div>)}
                </div>
                <p className="field-hint">Available units cannot exceed total capacity. Please update promptly when availability changes.</p>
            </section>
            <div className="form-submit">
                <span>
                    <Clock size={14} />
                    Last saved: {data.lastUpdated ? new Date(data.lastUpdated).toLocaleString() : 'Not submitted yet'}</span>
                <button className="btn btn-primary" disabled={busy}>
                    <Save size={16} />
                    {busy ? 'Saving…' : status === 'new' ? 'Submit for approval' : 'Save updates'}
                </button>
            </div>
        </form>
    </div>
}
