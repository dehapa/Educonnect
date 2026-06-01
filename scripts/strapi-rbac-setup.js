'use strict';

/**
 * This script contains the logic to bootstrap Strapi roles for the Edu-employment project.
 * You should integrate this logic into your Strapi backend's `src/index.js` inside the `bootstrap` method.
 * 
 * Strapi Community Edition allows creating custom roles programmatically.
 */

const ROLES_TO_CREATE = [
  {
    name: 'Super Admin',
    description: 'Full access to all features, billing, and settings.',
    type: 'super_admin'
  },
  {
    name: 'Regional Admin',
    description: 'Manage institutions, staff, and verification within a specific region.',
    type: 'regional_admin'
  },
  {
    name: 'Institution Admin',
    description: 'Manage their own institution profile, enroll students/teachers, post jobs.',
    type: 'institution_admin'
  },
  {
    name: 'Staff',
    description: 'Data entry, verify listings, basic edits.',
    type: 'staff'
  },
  {
    name: 'Employer Admin',
    description: 'Post and manage job listings.',
    type: 'employer_admin'
  },
  {
    name: 'Student',
    description: 'View jobs, apply to jobs, maintain profile.',
    type: 'student'
  },
  {
    name: 'Teacher',
    description: 'Maintain profile, connect with institutions.',
    type: 'teacher'
  }
];

module.exports = async ({ strapi }) => {
  // Use the Users & Permissions plugin's role service
  const roleService = strapi.plugin('users-permissions').service('role');
  
  if (!roleService) {
    strapi.log.warn('Users & Permissions plugin not found. Skipping RBAC bootstrap.');
    return;
  }

  strapi.log.info('Bootstrapping Strapi RBAC roles...');

  for (const roleDef of ROLES_TO_CREATE) {
    try {
      // Check if role already exists
      const existingRoles = await strapi.entityService.findMany('plugin::users-permissions.role', {
        filters: { type: roleDef.type }
      });

      if (existingRoles.length === 0) {
        // Create the role
        await roleService.createRole({
          name: roleDef.name,
          description: roleDef.description,
          type: roleDef.type,
          permissions: {} // Default empty permissions, can be customized via Admin UI or here
        });
        strapi.log.info(`Created role: ${roleDef.name}`);
      } else {
        strapi.log.info(`Role ${roleDef.name} already exists.`);
      }
    } catch (error) {
      strapi.log.error(`Failed to create role ${roleDef.name}:`, error);
    }
  }

  strapi.log.info('Strapi RBAC bootstrap complete.');
};
