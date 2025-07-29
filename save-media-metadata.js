import admin from 'firebase-admin';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: process.env.FIREBASE_PROJECT_ID,
      privateKey: process.env.FIREBASE_PRIVATE_KEY.replace(/\\n/g, '\n'),
      clientEmail: process.env.FIREBASE_CLIENT_EMAIL,
    }),
  });
}

const db = admin.firestore();

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    res.status(405).json({ message: 'Method not allowed' });
    return;
  }

  const { mediaId, altText, caption, userId, mediaUrl, imageUrl } = req.body;

  if (!mediaId || !userId || (!mediaUrl && !imageUrl)) {
    return res.status(400).json({
      message: 'Missing required fields: mediaId, userId, and either mediaUrl or imageUrl',
    });
  }

  try {
    const mediaRef = db.collection('media').doc(mediaId);

    await mediaRef.set(
      {
        userId,
        mediaUrl: mediaUrl || imageUrl,
        altText: altText || '',
        caption: caption || '',
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );

    res.status(200).json({ message: 'Media metadata saved successfully!', mediaId });
  } catch (error) {
    console.error('Error saving media metadata to Firestore:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
}
