import mongoose from "mongoose";

// Define the Listing schema
const listingSchema = new mongoose.Schema(
  {
    contractAddress: {
      type: String,
      required: true,
    },
    tokenId: {
      type: String,
      required: true,
    },
    nonce: {
      type: String,
      required: true,
      unique: true,
    },
    fileUrl: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    chain: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

// Define the Listing model
export default mongoose.models.Listing ||
  mongoose.model("Listing", listingSchema);
