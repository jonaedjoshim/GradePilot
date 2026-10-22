import { getDatabase } from "../db/mongodb.js";

const COLLECTION_NAME = "academic_records";

export async function getAcademicRecord(userId) {
  const database = await getDatabase();

  return database.collection(COLLECTION_NAME).findOne(
    { userId },
    {
      projection: {
        _id: 0,
        userId: 0,
      },
    },
  );
}

export async function createAcademicRecord(userId, academicData) {
  const database = await getDatabase();
  const collection = database.collection(COLLECTION_NAME);

  const existing = await collection.findOne(
    { userId },
    { projection: { _id: 1 } },
  );

  if (existing) {
    return {
      created: false,
      conflict: true,
    };
  }

  const now = new Date();

  const result = await collection.updateOne(
    { userId },
    {
      $setOnInsert: {
        userId,
        data: academicData,
        createdAt: now,
        updatedAt: now,
      },
    },
    { upsert: true },
  );

  return {
    created: result.upsertedCount === 1,
    conflict: result.upsertedCount !== 1,
  };
}

export async function updateAcademicRecord(
  userId,
  academicData,
  expectedUpdatedAt,
) {
  const database = await getDatabase();
  const collection = database.collection(COLLECTION_NAME);

  const result = await collection.updateOne(
    {
      userId,
      updatedAt: new Date(expectedUpdatedAt),
    },
    {
      $set: {
        data: academicData,
        updatedAt: new Date(),
      },
    },
  );

  return {
    updated: result.modifiedCount === 1,
    conflict: result.modifiedCount !== 1,
  };
}
