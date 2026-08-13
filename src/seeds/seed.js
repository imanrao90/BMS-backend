import dotenv from "dotenv";
import mongoose from "mongoose";
import { connectDB } from "../config/db.js";
import { seedPermissions } from "../modules/permissions/permission.seed.js";
import { seedRoles } from "../modules/roles/role.seed.js";

dotenv.config();

const runSeeds = async () => {
  try {
    await connectDB();

    await seedPermissions();
    await seedRoles()

    console.log("All seeds completed successfully.");

    await mongoose.connection.close();
    process.exit(0);
  } catch (error) {
    console.error("Seeding failed:", error);

    await mongoose.connection.close();
    process.exit(1);
  }
};

runSeeds();