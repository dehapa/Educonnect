const admin = require('firebase-admin');

// Initialize Firebase Admin SDK
// You must set GOOGLE_APPLICATION_CREDENTIALS environment variable
// pointing to your service account key JSON file before running this script.
if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.applicationDefault(),
  });
}

/**
 * Valid Roles as defined in the product blueprint:
 * - super_admin
 * - regional_admin
 * - institution_admin
 * - staff
 * - employer_admin
 * - student
 * - teacher
 */
const VALID_ROLES = [
  'super_admin',
  'regional_admin',
  'institution_admin',
  'staff',
  'employer_admin',
  'student',
  'teacher'
];

/**
 * Set custom claims for a user to assign a role.
 * 
 * @param {string} uid - The Firebase Auth UID of the user.
 * @param {string} role - The role to assign.
 * @param {object} additionalClaims - Optional additional claims (e.g., institutionId).
 */
async function setUserRole(uid, role, additionalClaims = {}) {
  try {
    if (!VALID_ROLES.includes(role)) {
      throw new Error(`Invalid role: ${role}. Must be one of ${VALID_ROLES.join(', ')}`);
    }

    const claims = {
      role: role,
      ...additionalClaims
    };

    await admin.auth().setCustomUserClaims(uid, claims);
    console.log(`Successfully set role '${role}' for user ${uid}.`);

    // Verify the claims were set
    const userRecord = await admin.auth().getUser(uid);
    console.log('Current custom claims:', userRecord.customClaims);

  } catch (error) {
    console.error(`Error setting custom claims for user ${uid}:`, error);
  }
}

// Example Usage (can be called via CLI arguments in a real environment):
// node set-custom-claims.js <uid> <role> [institutionId]
if (require.main === module) {
  const args = process.argv.slice(2);
  const uid = args[0];
  const role = args[1];
  const institutionId = args[2];

  if (!uid || !role) {
    console.log('Usage: node set-custom-claims.js <uid> <role> [institutionId]');
    process.exit(1);
  }

  const additionalClaims = institutionId ? { institutionId } : {};
  setUserRole(uid, role, additionalClaims).then(() => process.exit(0));
}

module.exports = { setUserRole };
