import { MapPin, Phone, Clock, Navigation, Hospital } from 'lucide-react';
const resources = [
    ['general', 'General beds'],
    ['icu', 'ICU beds'],
    ['ventilators', 'Ventilators'],
    ['oxygen', 'Oxygen cylinders']
];
function status(x) {
    if (!x?.total || x.available <= 0)
        return 'red';
    const p = x.available / x.total * 100; return p > 30 ? 'green' : 'yellow'
}
function label(s) {
    return s === 'green' ? 'Available' : s === 'yellow' ? 'Limited' : 'Full'
}
export default function HospitalCard({ hospital: h }) {
    return <article className="hospital-card">
        <div className="hospital-card-top">
            <div className="hospital-icon">
                <Hospital size={22} />
            </div>
            <div className="hospital-title">
                <h3>{h.name}</h3>
                <p><MapPin size={14} />{h.area ? h.area + ', ' : ''}{h.city}</p>
            </div>
            <span className="verified">
                <span /> Verified
            </span>
        </div>
        <p className="hospital-address">{h.address}</p>
        <div className="resource-grid">
            {
                resources.map(([key, title]) => {
                    const item = h.resources?.[key] || { total: 0, available: 0 }, s = status(item);
                    return
                    <div className="resource" key={key}>
                        <span className="resource-name">{title}</span>
                        <strong>{item.available}<small> / {item.total}</small></strong>
                        <span className={`status ${s}`}><i />{label(s)}</span>
                    </div>
                })
            }
        </div>
        <div className="card-bottom">
            <span className="updated">
                <Clock size={13} />
                Updated {h.lastUpdated ? new Date(h.lastUpdated).toLocaleString() : '—'}
            </span>
            <div className="card-actions">
                <a className="btn btn-soft btn-sm" href={`tel:${h.phone}`}>
                    <Phone size={14} /> Call
                </a>
                <a className="btn btn-primary btn-sm" target="_blank" rel="noreferrer" href={`https://www.google.com/maps/dir/?api=1&destination=${h.location.lat},${h.location.lng}`}>
                    <Navigation size={14} /> Directions
                </a>
            </div>
        </div>
    </article>
}
