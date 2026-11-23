import { useEffect, useMemo, useState } from 'react';
import { Activity, ArrowDown, LocateFixed, Map, Search, ShieldCheck, SlidersHorizontal, HeartPulse } from 'lucide-react';
import api from '../services/api';
import HospitalCard from '../components/HospitalCard';
import HospitalMap from '../components/HospitalMap';
export default function Home() {
    const [hospitals, setHospitals] = useState([]),
        [q, setQ] = useState(''),
        [resource, setResource] = useState(''),
        [city, setCity] = useState(''),
        [near, setNear] = useState(false),
        [coords, setCoords] = useState(null),
        [view, setView] = useState('list'),
        [loading, setLoading] = useState(true),
        [error, setError] = useState('');

    useEffect(() => {
        const load = () => api.get('/hospitals').then(r => setHospitals(r.data)).catch(() => setError('Could not connect to the server. Please check that the backend is running.')).finally(() => setLoading(false)); load(); const timer = setInterval(load, 30000); return () => clearInterval(timer)
    }, []);
    const cities = useMemo(() => [...new Set(hospitals.map(h => h.city)
        .filter(Boolean))].sort(), [hospitals]);
    const filtered = useMemo(() => hospitals
        .filter(h => (!q || [h.name, h.city, h.area, h.address]
            .some(v => v?.toLowerCase()
                .includes(q.toLowerCase()))) && (!city || h.city === city) && (!resource || h.resources?.[resource]?.available > 0)), [hospitals, q, city, resource]);
    const nearMe = () => {
        if (!navigator.geolocation) {
            setError('Location is not supported by this browser.');
            return
        }
        navigator.geolocation.getCurrentPosition(p => {
            setCoords({ lat: p.coords.latitude, lng: p.coords.longitude });
            setNear(true);
            setView('list')
        }, () => setError('Location permission was not granted. You can search by city or area instead.'))
    };
    const sorted = useMemo(() => {
        if (!coords) return filtered;
        const km = (p) => {
            const rad = x => x * Math.PI / 180, dLat = rad(p.lat - coords.lat), dLng = rad(p.lng - coords.lng), a = Math.sin(dLat / 2) ** 2 + Math.cos(rad(coords.lat)) * Math.cos(rad(p.lat)) * Math.sin(dLng / 2) ** 2; return 6371 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
        }; return [...filtered].sort((a, b) => km(a.location) - km(b.location))
    }, [filtered, coords]);
    return <>
        <section className="hero">
            <div className="hero-inner">

                <div className="hero-copy">
                    <span className="eyebrow">
                        <span /> HOSPITAL RESOURCE DIRECTORY</span>
                    <h1>Find the care you need.<br /><em>When it matters most.</em></h1>
                    <p>Explore hospital bed and oxygen availability around you. Search verified hospital updates and contact providers directly.</p>
                    <div className="hero-trust">
                        <span><ShieldCheck size={16} />
                            Hospital-reviewed listings
                        </span>
                        <span>
                            <Activity size={16} />
                            Availability updates
                        </span>
                    </div>
                </div>

                <div className="hero-art">
                    <div className="hero-orbit orbit-one" />
                    <div className="hero-orbit orbit-two" />
                    <div className="hero-cross"><HeartPulse size={72} />
                    </div><div className="floating-note note-top">
                        <span className="pulse-dot" />
                        Hospital updates
                    </div>
                    <div className="floating-note note-bottom">
                        <Map size={17} /> Care, closer to you
                    </div>
                </div>

            </div>
        </section>
        <section className="search-section">
            <div className="search-panel">
                <div className="search-heading">
                    <div>
                        <span className="eyebrow dark">SEARCH HOSPITALS</span>
                        <h2>What are you looking for?</h2>
                    </div>
                    <span className="live-tag"><i /> Directory updates</span>
                </div>
                <div className="search-controls">
                    <label className="search-input"><Search size={19} />
                        <input value={q} onChange={e => setQ(e.target.value)} placeholder="Hospital name, city or area" />
                    </label>
                    <select value={city} onChange={e => setCity(e.target.value)}>
                        <option value="">All cities</option>
                        {cities.map(c => <option key={c}>{c}</option>)}
                    </select>
                    <select value={resource} onChange={e => setResource(e.target.value)}>
                        <option value="">All resources</option>
                        <option value="general">General beds</option>
                        <option value="icu">ICU beds</option>
                        <option value="ventilators">Ventilators</option>
                        <option value="oxygen">Oxygen cylinders</option>
                    </select>
                    <button className="btn btn-primary search-btn" onClick={() => {
                        setNear(false);
                        setCoords(null)
                    }}>
                        <Search size={17} /> Search
                    </button>
                </div>
                <button className="near-btn" onClick={nearMe}>
                    <LocateFixed size={15} /> Use my current location
                </button>
            </div>
        </section>
        <section className="results-section">
            <div className="results-head">
                <div>
                    <span className="eyebrow dark">HOSPITAL DIRECTORY</span>
                    <h2>Hospitals near you</h2>
                    <p>{near && coords ? 'Sorted by approximate distance from your location' : `${sorted.length} ${sorted.length === 1 ? 'hospital' : 'hospitals'} matching your search`}</p>
                </div>
                <div className="view-toggle">
                    <button className={view === 'list' ? 'active' : ''} onClick={() => setView('list')}><SlidersHorizontal size={15} />
                        List
                    </button>
                    <button className={view === 'map' ? 'active' : ''} onClick={() => setView('map')}>
                        <Map size={15} /> Map
                    </button>
                </div>
            </div>
            {error && <div className="alert">{error}</div>}
            {loading ? <div className="empty-state">Loading hospital directory…</div> :
                view === 'map' ? <HospitalMap hospitals={sorted} /> :
                    sorted.length ? <div className="hospital-list">{sorted.map(h => <HospitalCard key={h._id} hospital={h} />)}
                    </div> :
                        <div className="empty-state">
                            <div className="empty-icon"><Search size={25} />
                            </div>
                            <h3>No hospitals found</h3>
                            <p>Try another city, area or resource filter. Approved hospital listings will appear here.</p>
                            <button className="btn btn-outline" onClick={() => { setQ(''); setCity(''); setResource(''); setCoords(null); setNear(false) }}>Clear filters
                            </button>
                        </div>}
        </section>
        <section className="status-note">
            <div className="status-note-icon">
                <Activity size={22} />
            </div>
            <div>
                <b>Understand availability at a glance</b>
                <p>
                    <span className="legend green" /> Plenty available
                    <span className="legend yellow" /> Limited availability
                    <span className="legend red" /> Currently full
                </p>
            </div>
            <small>Status is based on the latest hospital-submitted counts. Call to confirm.</small>
        </section>
    </>
}
