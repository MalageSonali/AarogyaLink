import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import User from '../models/User.js';
import Hospital from '../models/Hospital.js';
const tokenFor = id => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '7d' });
export async function register(req, res) {
    try {
        const { name, email, password, role = 'public' } = req.body;
        if (!name || !email || !password)
            return res.status(400).json({
                message: 'Name, email and password are required'
            });
        if (password.length < 8)
            return res.status(400).json({
                message: 'Password must contain at least 8 characters'
            });
        if (!['public', 'hospital'].includes(role))
            return res.status(400).json({
                message: 'Invalid registration role'
            });
        if (await User.findOne({ email }))
            return res.status(409).json({
                message: 'An account with this email already exists'
            });
        const user = await User.create({
            name, email, password: await bcrypt.hash(password, 12), role
        });
        res.status(201).json({
            token: tokenFor(user._id),
            user: { id: user._id, name: user.name, email: user.email, role: user.role }
        });
    } catch (e) {
        res.status(500).json({
            message: 'Could not create account'
        });
    }
}
export async function login(req, res) {
    try {
        const user = await User.findOne({ email: req.body.email });
        if (!user || !(await bcrypt.compare(req.body.password || '', user.password)))
            return res.status(401).json({
                message: 'Invalid email or password'
            });
        res.json({
            token: tokenFor(user._id),
            user: {
                id: user._id,
                name: user.name,
                email: user.email,
                role: user.role
            }
        });
    } catch (e) {
        res.status(500).json({
            message: 'Could not sign in'
        });
    }
}
export async function me(req, res) {
    const hospital = req.user.role === 'hospital' ?
        await Hospital.findOne({ owner: req.user._id }) :
        null; res.json({ user: req.user, hospital });
}
