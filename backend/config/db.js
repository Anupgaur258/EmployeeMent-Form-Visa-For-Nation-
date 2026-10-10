import mongoose from 'mongoose';
import { processPendingSubmissions } from '../services/syncService.js';

// Disable query buffering so disconnected queries fail fast with real error
// instead of hanging for 10 seconds and hiding the true connection status
mongoose.set('bufferCommands', false);

let isConnecting = false;
let retryTimeout = null;

/**
 * Safely mask connection string password for logs
 */
const getMaskedUri = (uri) => {
  if (!uri) return 'undefined';
  return uri.replace(/:([^:@]+)@/, ':****@');
};

/**
 * Check if MongoDB connection is fully open and active
 */
export const isDBConnected = () => {
  return mongoose.connection.readyState === 1;
};

/**
 * Connect to MongoDB Atlas with robust error handling and reconnection
 */
export const connectDB = async () => {
  if (isDBConnected() || isConnecting) {
    return;
  }

  isConnecting = true;
  const connUri = process.env.MONGODB_URI;

  if (!connUri) {
    console.error('[MongoDB Error] MONGODB_URI is not defined in environment variables.');
    isConnecting = false;
    return;
  }

  const maskedUri = getMaskedUri(connUri);

  try {
    const conn = await mongoose.connect(connUri, {
      serverSelectionTimeoutMS: 5000,
      connectTimeoutMS: 10000,
      socketTimeoutMS: 45000,
      family: 4 // Prefer IPv4 to avoid Windows dual-stack IPv6 DNS resolution issues
    });

    console.log(`====================================================`);
    console.log(`✅ [MongoDB] Connected successfully to Atlas!`);
    console.log(`📍 Cluster Host: ${conn.connection.host}`);
    console.log(`📁 Database Name: ${conn.connection.name}`);
    console.log(`====================================================`);

    isConnecting = false;

    // Trigger background sync for any pending submissions
    processPendingSubmissions().catch((err) => {
      console.warn('[Sync Service] Initial sync error:', err.message);
    });
  } catch (error) {
    isConnecting = false;
    console.error(`\n❌ [MongoDB Connection Error] Failed to connect to Atlas (${maskedUri}):`);
    console.error(`   Details: ${error.message}`);
    console.warn(`👉 [MongoDB Action] Ensure your IP or 0.0.0.0/0 is active in MongoDB Atlas Network Access.`);
    console.warn(`🔄 [MongoDB] Reconnection scheduled in 6 seconds...\n`);

    if (retryTimeout) clearTimeout(retryTimeout);
    retryTimeout = setTimeout(() => {
      connectDB();
    }, 6000);
  }
};

// Event listeners for ongoing connection lifecycle
mongoose.connection.on('disconnected', () => {
  console.warn('[MongoDB] Disconnected from Atlas. Attempting reconnection...');
  if (!isConnecting) {
    if (retryTimeout) clearTimeout(retryTimeout);
    retryTimeout = setTimeout(() => {
      connectDB();
    }, 5000);
  }
});

mongoose.connection.on('error', (err) => {
  console.error('[MongoDB] Runtime connection error:', err.message);
});

mongoose.connection.on('reconnected', () => {
  console.log('✅ [MongoDB] Reconnected to Atlas cluster.');
  processPendingSubmissions().catch(() => {});
});

// Graceful process exit
process.on('SIGINT', async () => {
  if (isDBConnected()) {
    await mongoose.connection.close();
    console.log('[MongoDB] Connection closed on process termination.');
  }
  process.exit(0);
});
