app.post('/api/save-user', async (req, res) => {
  const { userId, email } = req.body;
  if (!userId || !email) {
    return res.status(400).json({ message: 'Missing userId or email' });
  }
  try {
    const userRef = db.collection('users').doc(userId);
    await userRef.set(
      {
        email,
        createdAt: admin.firestore.FieldValue.serverTimestamp(),
        updatedAt: admin.firestore.FieldValue.serverTimestamp(),
      },
      { merge: true }
    );
    res.status(200).json({ message: 'User saved successfully!', userId });
  } catch (error) {
    console.error('Error saving user:', error);
    res.status(500).json({ message: 'Internal Server Error', error: error.message });
  }
});

app.post('/api/save-preferences', async (req, res) => {
  const { userId, preferences } = req.body;
  if (!userId || !preferences) {
    return res.status(400).json({ message: 'Missing userId or preferences' });
  }
  try {
    const userRef = admin.firestore().collection('users').doc(userId);
    await userRef.set({ preferences }, { merge: true });
    res.status(200).json({ message: 'Preferences saved!' });
  } catch (error) {
    res.status(500).json({ message: 'Error saving preferences', error: error.message });
  }
});
export default app;
export const config = {
  api: {
    bodyParser: {
      sizeLimit: '10mb',
    },
  },
};