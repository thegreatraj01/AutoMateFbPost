// models/Page.js
import mongoose from 'mongoose';

const pageSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  pageId: {
    type: String,
    required: true
  },
  pageName: {
    type: String,
    required: true
  },
  accessToken: {
    type: String,
    required: true
  }
}, { timestamps: true });

export const Page = mongoose.model('Page', pageSchema);
