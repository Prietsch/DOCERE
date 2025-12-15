"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateGoogleDriveCredentials = void 0;
const dotenv_1 = __importDefault(require("dotenv"));
const fs_1 = __importDefault(require("fs"));
const googleapis_1 = require("googleapis");
const path_1 = __importDefault(require("path"));
// Load environment variables from .env file
dotenv_1.default.config();
// Attempt to load environment-specific configuration
if (process.env.NODE_ENV === "production") {
    dotenv_1.default.config({ path: ".env.production" });
}
function validateGoogleDriveCredentials() {
    return __awaiter(this, void 0, void 0, function* () {
        console.log("Validating Google Drive credentials...");
        const keyFilePath = path_1.default.join(__dirname, "../../credentials.json");
        // Check if credentials file exists
        if (!fs_1.default.existsSync(keyFilePath)) {
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
            console.error("❌ GOOGLE_DRIVE_FOLDER_DOCS environment variable is not set!");
            return false;
        }
        try {
            // Initialize Google Drive client
            const auth = new googleapis_1.google.auth.GoogleAuth({
                keyFile: keyFilePath,
                scopes: ["https://www.googleapis.com/auth/drive"],
            });
            const drive = googleapis_1.google.drive({
                version: "v3",
                auth,
            });
            // Try to access video folder
            console.log(`Checking access to video folder (ID: ${videoFolderId})...`);
            try {
                const videoFolder = yield drive.files.get({ fileId: videoFolderId });
                console.log(`✅ Successfully accessed video folder: ${videoFolder.data.name}`);
            }
            catch (error) {
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
                const docsFolder = yield drive.files.get({ fileId: docsFolderId });
                console.log(`✅ Successfully accessed docs folder: ${docsFolder.data.name}`);
            }
            catch (error) {
                console.error(`❌ Failed to access docs folder: ${error.message}`);
                console.log("Make sure:");
                console.log(" - The folder ID is correct");
                console.log(" - The service account has access to this folder");
                console.log(" - The folder exists");
                return false;
            }
            console.log("✅ Google Drive credentials and folder access validated successfully!");
            return true;
        }
        catch (error) {
            console.error(`❌ Failed to validate Google Drive credentials: ${error.message}`);
            return false;
        }
    });
}
exports.validateGoogleDriveCredentials = validateGoogleDriveCredentials;
// Execute the validation if run directly
if (require.main === module) {
    validateGoogleDriveCredentials()
        .then((valid) => {
        if (!valid) {
            console.log("❌ Google Drive validation failed. Check the errors above.");
            process.exit(1);
        }
        else {
            console.log("✓ All validations passed!");
        }
    })
        .catch((error) => {
        console.error("An unexpected error occurred:", error);
        process.exit(1);
    });
}
