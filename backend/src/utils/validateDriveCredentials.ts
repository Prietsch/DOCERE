import dotenv from "dotenv";
import fs from "fs";
import { google } from "googleapis";
import path from "path";

// Load environment variables from .env file
dotenv.config();

// Attempt to load environment-specific configuration
if (process.env.NODE_ENV === "production") {
  dotenv.config({ path: ".env.production" });
}

async function validateGoogleDriveCredentials() {
  console.log("Validating Google Drive credentials...");

  const keyFilePath = path.join(__dirname, "../../credentials.json");

  // Check if credentials file exists
  if (!fs.existsSync(keyFilePath)) {
    console.error(`❌ Credentials file not found: ${keyFilePath}`);
    return false;
  }

  // Check for folder IDs in environment variables
  const videoFolderId = process.env.GOOGLE_DRIVE_FOLDER_ID;
  const docsFolderId = process.env.GOOGLE_DRIVE_FOLDER_DOCS;

  if (!videoFolderId) {
    console.error("❌ GOOGLE_DRIVE_FOLDER_ID environment variable is not set!");
    return false;
  }

  if (!docsFolderId) {
    console.error(
      "❌ GOOGLE_DRIVE_FOLDER_DOCS environment variable is not set!"
    );
    return false;
  }

  try {
    // Initialize Google Drive client
    const auth = new google.auth.GoogleAuth({
      keyFile: keyFilePath,
      scopes: ["https://www.googleapis.com/auth/drive"],
    });

    const drive = google.drive({
      version: "v3",
      auth,
    });
    // Try to access video folder
    console.log(`Checking access to video folder (ID: ${videoFolderId})...`);
    try {
      const videoFolder = await drive.files.get({ fileId: videoFolderId });
      console.log(
        `✅ Successfully accessed video folder: ${videoFolder.data.name}`
      );
    } catch (error: any) {
      console.error(`❌ Failed to access video folder: ${error.message}`);
      console.log("Make sure:");
      console.log(" - The folder ID is correct");
      console.log(" - The service account has access to this folder");
      console.log(" - The folder exists");
      return false;
    }

    // Try to access docs folder
    console.log(`Checking access to docs folder (ID: ${docsFolderId})...`);
    try {
      const docsFolder = await drive.files.get({ fileId: docsFolderId });
      console.log(
        `✅ Successfully accessed docs folder: ${docsFolder.data.name}`
      );
    } catch (error: any) {
      console.error(`❌ Failed to access docs folder: ${error.message}`);
      console.log("Make sure:");
      console.log(" - The folder ID is correct");
      console.log(" - The service account has access to this folder");
      console.log(" - The folder exists");
      return false;
    }

    console.log(
      "✅ Google Drive credentials and folder access validated successfully!"
    );
    return true;
  } catch (error: any) {
    console.error(
      `❌ Failed to validate Google Drive credentials: ${error.message}`
    );
    return false;
  }
}

// Execute the validation if run directly
if (require.main === module) {
  validateGoogleDriveCredentials()
    .then((valid) => {
      if (!valid) {
        console.log(
          "❌ Google Drive validation failed. Check the errors above."
        );
        process.exit(1);
      } else {
        console.log("✓ All validations passed!");
      }
    })
    .catch((error) => {
      console.error("An unexpected error occurred:", error);
      process.exit(1);
    });
}

export { validateGoogleDriveCredentials };
