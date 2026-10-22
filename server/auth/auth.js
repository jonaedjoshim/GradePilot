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

  const googleClientId = process.env.GOOGLE_CLIENT_ID;
  const googleClientSecret = process.env.GOOGLE_CLIENT_SECRET;

  const baseURL = process.env.BETTER_AUTH_URL;

  if (!baseURL) {
    throw new Error("BETTER_AUTH_URL is not configured");
  }

  if (!process.env.BETTER_AUTH_SECRET) {
    throw new Error("BETTER_AUTH_SECRET is not configured");
  }

  const auth = betterAuth({
    appName: "GradePilot",

    baseURL,

    secret: process.env.BETTER_AUTH_SECRET,

    database: mongodbAdapter(database),

    emailAndPassword: {
      enabled: true,
      minPasswordLength: 8,
    },

    socialProviders: {
      ...(googleClientId && googleClientSecret
        ? {
            google: {
              clientId: googleClientId,
              clientSecret: googleClientSecret,
            },
          }
        : {}),
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
