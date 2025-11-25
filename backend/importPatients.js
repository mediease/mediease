import fs from "fs";
import csv from "csv-parser";
import { MongoClient } from "mongodb";

// 🔥 IMPORTANT: put your real MongoDB Atlas URL here
const uri = "mongodb+srv://admin:8KVGB3xzXuCazHFa@cluster0.ikpxi.mongodb.net/mediease";

const client = new MongoClient(uri);

// 🔥 random PHN generator (always unique)
function generateRandomPHN() {
  const randomHex = Math.random().toString(16).substring(2, 8).toUpperCase();
  return "PH-" + randomHex;
}

async function ensureUniquePHN(collection) {
  while (true) {
    const phn = generateRandomPHN();
    const exists = await collection.findOne({ phn });
    if (!exists) return phn;
  }
}

async function loadCSV(filePath) {
  return new Promise((resolve, reject) => {
    const results = [];
    fs.createReadStream(filePath)
      .pipe(csv())
      .on("data", (data) => results.push(data))
      .on("end", () => resolve(results))
      .on("error", reject);
  });
}

async function convertToFHIR(row, collection) {
  const now = new Date();

  // 🔥 Generate unique PHN always
  const phn = await ensureUniquePHN(collection);

  return {
    resourceType: "Patient",
    phn,
    nic: row.SSN || "",
    firstName: row.FIRST || "",
    lastName: row.LAST || "",
    gender: row.GENDER || "",
    birthDate: row.BIRTHDATE || "",
    contactNumber: "",
    address: row.ADDRESS || "",
    guardianNIC: "",
    guardianName: "",
    height: 0,
    weight: 0,
    bloodPressure: "",
    sugarLevel: 0,

    resource: {
      resourceType: "Patient",
      identifier: [
        { system: "urn:hospital:patient:phn", value: phn },
        { system: "urn:hospital:patient:nic", value: row.SSN || "" }
      ],
      name: [
        {
          use: "official",
          family: row.LAST || "",
          given: [row.FIRST || ""]
        }
      ],
      gender: row.GENDER || "",
      birthDate: row.BIRTHDATE || "",
      address: [
        {
          use: "home",
          text: `${row.ADDRESS}, ${row.CITY}, ${row.STATE}`,
          type: "physical"
        }
      ],
      telecom: [],
      contact: [],
      extension: []
    },

    createdAt: now,
    updatedAt: now,
    __v: 0
  };
}

async function run() {
  try {
    await client.connect();

    const db = client.db("mediease");
    const collection = db.collection("fhirpatients");

    const rows = await loadCSV("./mnt/data/patients.csv");

    console.log(`Processing ${rows.length} patients...`);

    const patients = [];

    for (const row of rows) {
      const p = await convertToFHIR(row, collection);
      patients.push(p);
    }

    await collection.insertMany(patients);

    console.log("✅ Successfully imported patients with unique random PHNs!");
  } catch (error) {
    console.error("❌ Import error:", error);
  } finally {
    await client.close();
  }
}

run();
