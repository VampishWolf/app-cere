import { NextApiRequest, NextApiResponse } from "next";
import { mongodb } from "../../utils/mongodb";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
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
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
