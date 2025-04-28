import { Schema, model } from "mongoose";

const FacebookAuthSchema = new Schema(
    {
      user: {
        type: Schema.Types.ObjectId,
        ref: "User",
        required: [true, "User reference is required"],
      },
      facebookId: {
        type: String,
        unique: true,
        required: [true, "Facebook ID is required"],
      },
      facebookAccessToken: {
        type: String,
        required: [true, "Facebook access token is required"],
        select: false, // Hide it by default
      },
      facebookTokenExpiry: {
        type: Date,
        required: [true, "Facebook token expiry date is required"],
      },
      pages: [
        {
          pageId: { type: String, required: true },
          pageName: { type: String, required: true },
          pageAccessToken: { type: String, required: true },
          tasks: [{ type: String }],
        },
      ],
    },
    { timestamps: true }
  );
  

const FacebookAuth = model("FacebookAuth", FacebookAuthSchema);
export default FacebookAuth;
