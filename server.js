require('dotenv').config(); // Load environment variables from .env file

// --- Debugging Environment Variables ---
console.log('\n--- Debugging Environment Variables ---');
console.log('FIREBASE_PROJECT_ID:', process.env.FIREBASE_PROJECT_ID);
console.log('FIREBASE_CLIENT_EMAIL:', process.env.FIREBASE_CLIENT_EMAIL);
const pk = process.env.FIREBASE_PRIVATE_KEY;
if (pk) {
  console.log('FIREBASE_PRIVATE_KEY (start):', pk.substring(0, 50) + '...');
  console.log('FIREBASE_PRIVATE_KEY (end):', '...' + pk.substring(pk.length - 50));
} else {
  console.log('FIREBASE_PRIVATE_KEY: Not found or empty');
}
console.log('-------------------------------------\n');


const express = require('express');
const cors = require('cors');
const admin = require('firebase-admin');

const app = express();
const PORT = process.env.PORT || 8082;

// --- ADD THIS NEW MIDDLEWARE HERE ---
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] Incoming Request: ${req.method} ${req.url}`);
  next(); // Pass the request to the next middleware/route handler
});

// Initialize Firebase Admin SDK
try {
  if (!admin.apps.length) {
    admin.initializeApp({
      credential: admin.credential.cert({
        projectId: process.env.FIREBASE_PROJECT_ID,
        privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
        clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
      }),
    });
    console.log('Firebase Admin SDK initialized successfully.');

    // --- NEW TEMPORARY DIRECT FIREBASE WRITE TEST START ---
    const dbTest = admin.firestore(); // Get Firestore instance for this test
    const testDocRef = dbTest.collection('admin_sdk_test_writes').doc('server_start_test');
    testDocRef.set({
      message: 'This document was written directly by the Admin SDK on server start.',
      timestamp: admin.firestore.FieldValue.serverTimestamp(),
      uniqueId: Math.random().toString(36).substring(7) // A simple unique ID for each test
    }).then(() => {
      console.log('*** Admin SDK direct test write SUCCESS. Check Firestore "admin_sdk_test_writes" collection. ***');
    }).catch((error) => {
      console.error('*** Admin SDK direct test write FAILED:', error);
      console.error('This error is critical and indicates a deeper problem with Firestore access.');
    });
    // --- NEW TEMPORARY DIRECT FIREBASE WRITE TEST END ---

  }
} catch (error) {
  console.error('Firebase Admin SDK initialization error:', error);
}


const db = admin.firestore();

// Middleware (these are already correctly placed)
app.use(cors({ origin: '*' }));
app.use(express.json());

// --- API Endpoint: Save Media Metadata ---

// Middleware
app.use(cors({ origin: '*' }));
app.use(express.json());

// --- API Endpoint: Save Media Metadata ---
app.post('/api/save-media-metadata', async (req, res) => {
  // Add these console.logs right at the start of the route handler
  console.log('--- Received POST request to /api/save-media-metadata ---');
  console.log('Request Headers:', req.headers); // Log all request headers
  console.log('Request Body (raw):', req.body); // Log the raw body as Express sees it BEFORE destructuring

  const { mediaId, altText, caption, userId, mediaUrl, imageUrl } = req.body; // This is line 65

  if (!mediaId || !userId || (!mediaUrl && !imageUrl)) {
    return res.status(400).json({ message: 'Missing required fields: mediaId, userId, and either mediaUrl or imageUrl' });
  }

  try {
    const mediaRef = db.collection('media').doc(mediaId);

    await mediaRef.set({
      userId: userId,
      mediaUrl: mediaUrl || imageUrl,
      altText: altText || '',
      caption: caption || '',
      createdAt: admin.firestore.FieldValue.serverTimestamp(),
      updatedAt: admin.firestore.FieldValue.serverTimestamp(),
    }, { merge: true });

    res.status(200).json({ message: 'Media metadata saved successfully!', mediaId: mediaId });

  } catch (error) {
    console.error("Error saving media metadata to Firestore:", error);
    res.status(500).json({ message: "Internal Server Error", error: error.message });
  }
});

app.get('/', (req, res) => {
  res.send('AltLens Backend API is running!');
});

app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});
