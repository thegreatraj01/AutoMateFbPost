// models/FacebookAuth.model.js
import { Schema, model } from "mongoose";

const FacebookAuthSchema = new Schema(
    {
        user: {
            type: Schema.Types.ObjectId,
            ref: "User",
            required: true,
            unique: true
        },
        facebookId: {
            type: String,
            required: true,
            unique: true
        },
        accessToken: {
            type: String,
            required: true,
            select: false // Important for security
        },
        tokenExpiry: {
            type: Date,
            required: true
        },
        signedRequest: {
            type: String,
            select: false
        },
        pages: [
            {
                pageId: {
                    type: String,
                    required: true
                },
                pageName: {
                    type: String,
                    required: true
                },
                pageAccessToken: {
                    type: String,
                    required: true,
                    select: false
                },
                expiresAt: {
                    type: Date,
                    required: true
                },
                category: String,
                permissions: [String]
            }
        ]
    },
    { timestamps: true }
);

// Index for faster queries
FacebookAuthSchema.index({ facebookId: 1 });
FacebookAuthSchema.index({ tokenExpiry: 1 });

export const FacebookAuth = model("FacebookAuth", FacebookAuthSchema);