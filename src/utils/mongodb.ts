import mongoose, { ConnectOptions } from "mongoose";

// Define the MongoDB connection URI
const MONGODB_URI =
  "mongodb+srv://cere_test_user:GKlLHTqwV3QNhWCJ@cere.xrnxlib.mongodb.net/?retryWrites=true&w=majority";

// Connect to the MongoDB instance
async function mongodb() {
  try {
    await mongoose.connect(MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    } as ConnectOptions);
    console.log("Connected to MongoDB");
    return mongoose.connection;
  } catch (error) {
    console.error("Failed to connect to MongoDB:", error);
    throw error;
  }
}

export { mongodb };
