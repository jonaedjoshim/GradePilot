import dns from "node:dns";
import { MongoClient } from "mongodb";

const databaseName = process.env.MONGODB_DB_NAME || "gradepilot";

const globalForMongo = globalThis;

function configureDns() {
  if (globalForMongo.gradepilotDnsConfigured) {
    return;
  }

  dns.setServers(["8.8.8.8", "1.1.1.1"]);

  globalForMongo.gradepilotDnsConfigured = true;
}

function createMongoClient() {
  const uri = process.env.MONGODB_URI;

  if (!uri) {
    throw new Error("MONGODB_URI is not configured");
  }

  configureDns();

  return new MongoClient(uri, {
    maxPoolSize: 5,
    minPoolSize: 0,
    maxIdleTimeMS: 30000,
    serverSelectionTimeoutMS: 10000,
  });
}

export async function getMongoClient() {
  if (!globalForMongo.gradepilotMongoPromise) {
    try {
      const client = createMongoClient();

      globalForMongo.gradepilotMongoPromise = client
        .connect()
        .catch((error) => {
          globalForMongo.gradepilotMongoPromise = null;
          throw error;
        });
    } catch (error) {
      globalForMongo.gradepilotMongoPromise = null;
      throw error;
    }
  }

  return globalForMongo.gradepilotMongoPromise;
}

export async function getDatabase() {
  const client = await getMongoClient();

  return client.db(databaseName);
}
