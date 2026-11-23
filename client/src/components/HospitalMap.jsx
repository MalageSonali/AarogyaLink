import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

const marker = L.divIcon({
    className: 'map-pin-wrap',
    html: '<div class="map-pin">✚</div>',
    iconSize: [30, 38],
    iconAnchor: [15, 38]
});
export default function HospitalMap({ hospitals }) {
    const center = hospitals.length ? [hospitals[0].location.lat,
    hospitals[0].location.lng] : [19.076, 72.8777];
    return <div className="map-shell">
        <MapContainer center={center} zoom={hospitals.length ? 11 : 9} scrollWheelZoom className="map">
            <TileLayer attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" />
            {hospitals.map(h => <Marker key={h._id} position={[h.location.lat, h.location.lng]} icon={marker}>
                <Popup>
                    <b>{h.name}</b>
                    <br />
                    {h.city}
                    <br />
                    <a href={`tel:${h.phone}`}>Call hospital</a>
                </Popup>
            </Marker>
            )}
        </MapContainer>
    </div>
}
