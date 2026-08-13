import Role from "./roles.model.js";
import Permission from "../../modules/permissions/permissions.model.js"
import { ROLES } from "../../constants/roles.js";
import { ROLE_PERMISSIONS } from "../../constants/rolePermissions.js";

const ROLE_METADATA = {
  [ROLES.SUPER_ADMIN]: {
    name: "Super Admin",
    description: "System administrator with full system access.",
    isSystem: true,
    isDefault: false,
  },

  [ROLES.OWNER]: {
    name: "Owner",
    description: "Business owner with full access to the business.",
    isSystem: true,
    isDefault: true,
  },

  [ROLES.MANAGER]: {
    name: "Manager",
    description: "Manager with operational access to the business.",
    isSystem: true,
    isDefault: false,
  },

  [ROLES.RECEPTIONIST]: {
    name: "Receptionist",
    description: "Receptionist responsible for bookings and customer operations.",
    isSystem: true,
    isDefault: false,
  },

  [ROLES.STAFF]: {
    name: "Staff",
    description: "Staff member with limited operational access.",
    isSystem: true,
    isDefault: false,
  },
};

export const seedRoles = async () => {
  try {
    const permissions = await Permission.find({
      slug: {
        $in: Object.values(ROLE_PERMISSIONS).flat(),
      },
      isActive: true,
    }).select("_id slug");

    const permissionMap = new Map(
      permissions.map((permission) => [
        permission.slug,
        permission._id,
      ])
    );

    for (const roleSlug of Object.values(ROLES)) {
      const permissionSlugs = ROLE_PERMISSIONS[roleSlug] || [];

      const permissionIds = permissionSlugs.map((slug) => {
        const permissionId = permissionMap.get(slug);

        if (!permissionId) {
          throw new Error(
            `Permission not found for role "${roleSlug}": ${slug}`
          );
        }

        return permissionId;
      });

      const metadata = ROLE_METADATA[roleSlug];

      await Role.findOneAndUpdate(
        {
          business: null,
          slug: roleSlug,
        },
        {
          $set: {
            name: metadata.name,
            description: metadata.description,
            permissions: permissionIds,
            isSystem: metadata.isSystem,
            isDefault: metadata.isDefault,
            isActive: true,
            deletedAt: null,
            deletedBy: null,
            isDeleted: false,
          },
        },
        {
          upsert: true,
          new: true,
          setDefaultsOnInsert: true,
        }
      );
    }

    console.log("Roles seeded successfully.");
  } catch (error) {
    console.error("Role seeding failed:", error);
    throw error;
  }
};