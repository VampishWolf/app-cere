import { NextApiRequest, NextApiResponse } from "next";
import { mongodb } from "../../utils/mongodb";
import Listing from "../../models/listing";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === "DELETE") {
    try {
      const id = req.query.id;
      const { db } = await mongodb();
      // const deletedListing = await db.collection("listings").deleteMany({ tokenId: id });
      const deletedListing = await Listing.findByIdAndDelete(id); // delete the record by id
      res.status(200).json(deletedListing);
    } catch (err) {
      console.error(err);
      res.status(500).send("Internal server error");
    }
  } else {
    res.status(405).json({ message: "Method not allowed." });
  }
}
