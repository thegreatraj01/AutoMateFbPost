// models/Image.js
import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prompt: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Prompt'
    },
    imageUrl: {
        type: String,
        required: true
    },
    base64: {
        type: String
    },
    isDeleted: {
        type: Boolean,
        default: false
    }
}, { timestamps: true });

export const Image = mongoose.model('Image', imageSchema);
