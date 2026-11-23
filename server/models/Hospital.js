import mongoose from 'mongoose';
const count = { type: Number, default: 0, min: 0 };
const hospitalSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true
  },
  address: {
    type: String,
    required: true
  },
  city: {
    type: String,
    required: true,
    index: true
  },
  area: {
    type: String,
    default: ''
  },
  phone: {
    type: String,
    required: true
  },
  emergencyContact: {
    type: String,
    default: ''
  },
  location: {
    lat: {
      type: Number,
      required: true
    },
    lng: {
      type: Number,
      required: true
    }
  },
  resources: {
    general: {
      total: count,
      available: count
    },
    icu: {
      total: count,
      available: count
    },
    ventilators: {
      total: count,
      available: count
    },
    oxygen: {
      total: count,
      available: count
    }
  },
  status: {
    type: String,
    enum: ['pending', 'approved', 'rejected', 'inactive'],
    default: 'pending',
    index: true
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  lastUpdated: {
    type: Date,
    default: Date.now
  }
}, { timestamps: true });
hospitalSchema.index({ name: 'text', city: 'text', area: 'text', address: 'text' });
export default mongoose.model('Hospital', hospitalSchema);
