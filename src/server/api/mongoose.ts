import mongoose from "mongoose";

const dbConnect = async () => {
  await mongoose.connect(import.meta.env.VITE_MONGO_URI);
};

dbConnect().catch((err) => console.log(err));

export default dbConnect;
