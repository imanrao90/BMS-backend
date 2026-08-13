import Permission from "./permissions.model.js";
import { PERMISSIONS } from "../../constants/permissions.js";

const permissionSeedData = Object.values(PERMISSIONS).map((slug) => {
  const [module, action] = slug.split(".");

  return {
    name: `${action.charAt(0).toUpperCase() + action.slice(1)} ${
      module.charAt(0).toUpperCase() + module.slice(1)
    }`,
    slug,
    module,
    action,
    isActive: true,
  };
});

export const seedPermissions = async () => {
  try {
    for (const permission of permissionSeedData) {
      await Permission.findOneAndUpdate(
        { slug: permission.slug },
        { $set: permission },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log("Permissions seeded successfully.");
  } catch (error) {
    console.error("Permission seeding failed:", error);
    throw error;
  }
};