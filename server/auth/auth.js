import { betterAuth } from "better-auth";
import { mongodbAdapter } from "better-auth/adapters/mongodb";
import { getDatabase } from "../db/mongodb.js";

let authInstance = null;
let authPromise = null;

export async function getAuth() {
  if (authInstance) {
    return authInstance;
  }

  if (!authPromise) {
    authPromise = createAuth().catch((error) => {
      authPromise = null;
      throw error;
    });
  }

  return authPromise;
}

async function createAuth() {
  const database = await getDatabase();

  const auth = betterAuth({
    database: mongodbAdapter(database),

    emailAndPassword: {
      enabled: true,
    },

    session: {
      expiresIn: 60 * 60 * 24 * 7,
      updateAge: 60 * 60 * 24,
    },

    advanced: {
      cookiePrefix: "gradepilot",
    },
  });

  authInstance = auth;

  return auth;
}
