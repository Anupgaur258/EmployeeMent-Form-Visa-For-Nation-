import { google } from 'googleapis';
import fs from 'fs';
import path from 'path';
import { Readable } from 'stream';

// Ensure local uploads directory exists as fallback
const LOCAL_UPLOADS_DIR = path.resolve('uploads');
if (!fs.existsSync(LOCAL_UPLOADS_DIR)) {
  fs.mkdirSync(LOCAL_UPLOADS_DIR, { recursive: true });
}

/**
 * Initialize Google Drive Client using Service Account or OAuth2
 */
const getDriveClient = () => {
  const serviceEmail = process.env.GOOGLE_SERVICE_ACCOUNT_EMAIL;
  let privateKey = process.env.GOOGLE_PRIVATE_KEY;

  if (serviceEmail && privateKey) {
    try {
      // Fix potential formatting issues with newlines in private key
      privateKey = privateKey.replace(/\\n/g, '\n');

      const auth = new google.auth.JWT(
        serviceEmail,
        null,
        privateKey,
        ['https://www.googleapis.com/auth/drive.file', 'https://www.googleapis.com/auth/drive']
      );
      return google.drive({ version: 'v3', auth });
    } catch (err) {
      console.warn('[Google Drive] Service Account Init Error:', err.message);
    }
  }

  const clientId = process.env.GOOGLE_CLIENT_ID;
  const clientSecret = process.env.GOOGLE_CLIENT_SECRET;
  const refreshToken = process.env.GOOGLE_REFRESH_TOKEN;

  if (clientId && clientSecret && refreshToken) {
    try {
      const oauth2Client = new google.auth.OAuth2(clientId, clientSecret);
      oauth2Client.setCredentials({ refresh_token: refreshToken });
      return google.drive({ version: 'v3', auth: oauth2Client });
    } catch (err) {
      console.warn('[Google Drive] OAuth2 Init Error:', err.message);
    }
  }

  return null;
};

/**
 * Convert Buffer to Readable Stream for Google Drive API
 */
const bufferToStream = (buffer) => {
  const stream = new Readable();
  stream.push(buffer);
  stream.push(null);
  return stream;
};

/**
 * Upload a file to Google Drive (with local fallback if not configured)
 * @param {Object} file - Multer file object
 * @param {String} applicantName - Candidate's name for file naming prefix
 * @param {String} fieldName - Form field name (e.g. photo, updatedCv, etc.)
 * @returns {Promise<Object>} file metadata with webViewLink & webContentLink
 */
export const uploadFileToDrive = async (file, applicantName = 'Applicant', fieldName = 'doc') => {
  if (!file) return null;

  const drive = getDriveClient();
  const folderId = process.env.GOOGLE_DRIVE_FOLDER_ID;

  // Clean filename
  const cleanApplicant = applicantName.replace(/[^a-zA-Z0-9_-]/g, '_');
  const ext = path.extname(file.originalname);
  const safeFilename = `${cleanApplicant}_${fieldName}_${Date.now()}${ext}`;

  if (drive && folderId) {
    try {
      const fileMetadata = {
        name: safeFilename,
        parents: [folderId]
      };

      const media = {
        mimeType: file.mimetype,
        body: file.buffer ? bufferToStream(file.buffer) : fs.createReadStream(file.path)
      };

      const response = await drive.files.create({
        requestBody: fileMetadata,
        media: media,
        fields: 'id, name, webViewLink, webContentLink, size'
      });

      const fileId = response.data.id;

      // Make file viewable by anyone with the link
      try {
        await drive.permissions.create({
          fileId: fileId,
          requestBody: {
            role: 'reader',
            type: 'anyone'
          }
        });
      } catch (permError) {
        console.warn(`[Google Drive] Permission set warning for ${fileId}:`, permError.message);
      }

      console.log(`[Google Drive] File uploaded successfully: ${safeFilename} (${fileId})`);

      return {
        fileId: fileId,
        fileName: safeFilename,
        originalName: file.originalname,
        mimeType: file.mimetype,
        size: file.size,
        webViewLink: response.data.webViewLink || `https://drive.google.com/file/d/${fileId}/view`,
        webContentLink: response.data.webContentLink || `https://drive.google.com/uc?id=${fileId}&export=download`,
        storageType: 'gdrive'
      };
    } catch (uploadError) {
      console.error(`[Google Drive] Upload failed for ${file.originalname}:`, uploadError.message);
      console.info('[Google Drive] Falling back to local storage for this file.');
    }
  } else {
    if (!drive) {
      console.info('[Google Drive] Credentials not set in .env. Storing file in local uploads directory.');
    } else if (!folderId) {
      console.info('[Google Drive] GOOGLE_DRIVE_FOLDER_ID not set in .env. Storing file in local uploads directory.');
    }
  }

  // Fallback: Store locally
  try {
    const localFilePath = path.join(LOCAL_UPLOADS_DIR, safeFilename);
    if (file.buffer) {
      fs.writeFileSync(localFilePath, file.buffer);
    } else if (file.path) {
      fs.copyFileSync(file.path, localFilePath);
    }

    const hostUrl = process.env.BACKEND_PUBLIC_URL || `http://localhost:${process.env.PORT || 5000}`;
    const fileUrl = `${hostUrl}/uploads/${safeFilename}`;

    return {
      fileId: `local_${Date.now()}`,
      fileName: safeFilename,
      originalName: file.originalname,
      mimeType: file.mimetype,
      size: file.size,
      webViewLink: fileUrl,
      webContentLink: fileUrl,
      storageType: 'local'
    };
  } catch (localError) {
    console.error(`[Storage] Failed to save locally:`, localError.message);
    throw new Error(`Failed to save file ${file.originalname}: ${localError.message}`);
  }
};

/**
 * Delete a file from Google Drive (if fileId exists and is from Drive)
 */
export const deleteFileFromDrive = async (fileId) => {
  if (!fileId || fileId.startsWith('local_')) return;
  const drive = getDriveClient();
  if (!drive) return;

  try {
    await drive.files.delete({ fileId });
    console.log(`[Google Drive] Deleted file: ${fileId}`);
  } catch (err) {
    console.warn(`[Google Drive] Failed to delete file ${fileId}:`, err.message);
  }
};
