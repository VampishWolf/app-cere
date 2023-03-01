import { NextApiRequest, NextApiResponse } from "next";
import { mongodb } from "../../utils/mongodb";
import Listing from "../../models/listing";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log(req);
  if (req.method === "GET") {
    try {
      // Connect to MongoDB
      const db = await mongodb();

      const listings = await db.collection("listings").find().toArray();
      // Return the listings
      res.status(200).json(listings);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  } else if (req.method === "POST") {
    const body = JSON.parse(req.body);
    const { contractAddress, fileUrl, nonce, tokenId, price, chain } = body;

    if (!contractAddress || !tokenId || !nonce || !fileUrl || !price || !chain) {
      res.status(400).json({ message: "Missing required fields." });
      return;
    }
    try {
      // Connect to MongoDB
      await mongodb();

      // Create a new listing
      const listing = new Listing({
        contractAddress,
        fileUrl,
        nonce,
        tokenId,
        price,
        chain,
      });

      // Save the listing to MongoDB
      await listing.save();

      // Return the saved listing
      res.status(201).json(listing);
    } catch (error) {
      console.error(error);
      res.status(500).json({ message: "Internal server error." });
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
