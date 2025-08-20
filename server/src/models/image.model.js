// models/Image.js
import mongoose from 'mongoose';

const imageSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    prompt: {
        type: String,
        required: true,
        maxlength: 2000
    },
    negative_prompt: {
        type: String,
        maxlength: 1000
    },
    imageUrl: {
        type: String,
        required: true
    },
    provider: {
        type: String,
        enum: ['freepik'],
        default: 'freepik',
        // required: true
    },
    model: {
        type: String,
        enum: ['classic-fast', 'flux-dev', 'imagen3', 'mystic'],
        required: true
    },
    parameters: {
        type: mongoose.Schema.Types.Mixed  // Flexible object for any parameters
    },
    has_nsfw: {
        type: Boolean,
        default: false
    },
    isDeleted: {
        type: Boolean,
        default: false,
        select: false
    }
}, { 
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Index for better query performance
imageSchema.index({ user: 1, createdAt: -1 });
imageSchema.index({ provider: 1, model: 1 });

const Image = mongoose.model('Image', imageSchema);
export default Image;
