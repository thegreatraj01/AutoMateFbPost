// models/Batch.js
import mongoose from 'mongoose';

const batchSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  prompts: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Prompt'
  }],
  images: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Image'
  }],
  name: {
    type: String
  },
  isDraft: {
    type: Boolean,
    default: true
  }
}, { timestamps: true });

export const Batch = mongoose.model('Batch', batchSchema);
