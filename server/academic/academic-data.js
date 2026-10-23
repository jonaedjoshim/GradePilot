import { getDatabase } from "../db/mongodb.js";

const COLLECTION_NAME = "academic_records";

let indexPromise = null;

async function getAcademicCollection() {
  const database = await getDatabase();
  const collection = database.collection(COLLECTION_NAME);

  if (!indexPromise) {
    indexPromise = collection
      .createIndex(
        { userId: 1 },
        {
          unique: true,
          name: "academic_user_unique",
        },
      )
      .catch((error) => {
        indexPromise = null;
        throw error;
      });
  }

  await indexPromise;

  return collection;
}

export async function getAcademicRecord(userId) {
  const collection = await getAcademicCollection();

  return collection.findOne(
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
  const collection = await getAcademicCollection();

  const now = new Date();

  try {
    const result = await collection.updateOne(
      { userId },
      {
        $setOnInsert: {
          userId,
          data: academicData,
          revision: 1,
          createdAt: now,
          updatedAt: now,
        },
      },
      {
        upsert: true,
      },
    );

    return {
      created: result.upsertedCount === 1,
      conflict: result.upsertedCount !== 1,
    };
  } catch (error) {
    if (error.code === 11000) {
      return {
        created: false,
        conflict: true,
      };
    }

    throw error;
  }
}

export async function updateAcademicRecord(
  userId,
  academicData,
  expectedRevision,
) {
  const collection = await getAcademicCollection();

  const result = await collection.updateOne(
    {
      userId,
      revision: expectedRevision,
    },
    {
      $set: {
        data: academicData,
        updatedAt: new Date(),
      },
      $inc: {
        revision: 1,
      },
    },
  );

  return {
    updated: result.matchedCount === 1,
    conflict: result.matchedCount !== 1,
  };
}
