import Hospital from '../models/Hospital.js';
const cleanResources = r => {
    const out = {};
    for (const key of ['general', 'icu', 'ventilators', 'oxygen']) {
        const total = Number(r?.[key]?.total ?? 0), available = Number(r?.[key]?.available ?? 0);
        if (!Number.isFinite(total) || !Number.isFinite(available) || total < 0 || available < 0 || available > total) throw new Error(`Invalid ${key} capacity: available must be between 0 and total`);
        out[key] = { total, available };
    } return out;
};
export async function listHospitals(req, res) {
    try {
        const { q = '', city = '', resource = '', availableOnly = 'false' } = req.query;
        const filter = { status: 'approved' };
        if (city) filter.city = { $regex: city, $options: 'i' };
        if (q) filter.$or = ['name', 'city', 'area', 'address']
            .map(k => ({ [k]: { $regex: q, $options: 'i' } }));
        let rows = await Hospital
            .find(filter)
            .select('-owner')
            .sort({ lastUpdated: -1 })
            .lean();
        if (resource && ['general', 'icu', 'ventilators', 'oxygen'].includes(resource))
            rows = rows.filter(h => h.resources?.[resource]?.available > 0);
        if (availableOnly === 'true')
            rows = rows.filter(h => Object.values(h.resources || {}).some(x => x.available > 0));
        res.json(rows);
    } catch (e) {
        res.status(500).json({ message: 'Unable to load hospitals' });
    }
}
export async function myHospital(req, res) {
    const h = await Hospital.findOne({ owner: req.user._id }); res.json(h);
}
export async function createHospital(req, res) {
    try {
        if (await Hospital.findOne({ owner: req.user._id }))
            return res.status(409).json({ message: 'You already submitted a hospital profile' });
        const data = { ...req.body, resources: cleanResources(req.body.resources || {}), owner: req.user._id, status: 'pending', lastUpdated: new Date() }; const h = await Hospital.create(data); res.status(201).json(h);
    } catch (e) {
        res.status(400).json({ message: e.message || 'Could not submit hospital' });
    }
}
export async function updateHospital(req, res) {
    try {
        const h = await Hospital.findOne({ owner: req.user._id });
        if (!h) return res.status(404).json({ message: 'Hospital profile not found' });
        const allowed = ['name', 'address', 'city', 'area', 'phone', 'emergencyContact', 'location'];
        for (const k of allowed) if (req.body[k] !== undefined) h[k] = req.body[k];
        if (req.body.resources) h.resources = cleanResources(req.body.resources); h.lastUpdated = new Date();
        await h.save();
        res.json(h);
    } catch (e) {
        res.status(400).json({
            message: e.message || 'Could not update hospital'
        });
    }
}
export async function adminHospitals(req, res) {
    const rows = await Hospital.find().populate('owner', 'name email').sort({ createdAt: -1 });
    res.json(rows);
}
export async function setHospitalStatus(req, res) {
    const { status } = req.body; if (!['approved', 'rejected', 'inactive'].includes(status))
        return res.status(400).json({
            message: 'Invalid status'
        });
    const h = await Hospital.findByIdAndUpdate(req.params.id, { status }, { new: true }).populate('owner', 'name email');
    if (!h) return res.status(404).json({ message: 'Hospital not found' });
    res.json(h);
}
export async function dashboard(req, res) {
    const hospitals = await Hospital.find({ status: 'approved' }).lean();
    const byCity = {};
    for (const h of hospitals) {
        const c = h.city || 'Unknown';
        if (!byCity[c]) byCity[c] = {
            city: c,
            hospitals: 0,
            general: 0,
            icu: 0,
            ventilators: 0,
            oxygen: 0
        };
        byCity[c].hospitals++;
        for (const k of ['general', 'icu', 'ventilators', 'oxygen'])
            byCity[c][k] += h.resources?.[k]?.available || 0;
    } res.json({
        totalHospitals: hospitals.length,
        byCity: Object.values(byCity)
    });
}
