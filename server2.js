//Firebase
const admin = require('firebase-admin');
const serviceAccount = require('./firebaseServiceAccount.json');

admin.initializeApp({
    credential: admin.credential.cert(serviceAccount),
    databaseURL: 'https://chat-app2-4d4e8-default-rtdb.firebaseio.com',
})

const db = admin.firestore();
const messagesCollection = db.collection('messages');

app.get('/messages', async (req, res) => {
    const snapshot = await messagesCollection.orderBy('timestamp').get();
    const messages = snapshot.docs.map( doc => ({ id: doc.id, ...doc.data() }));
    res.json(messages);
})

app.post('/messages', async (req, res) => {
    const newMessage = req.body;
    newMessage.timestamp = admin.firestore.FieldValue.serverTimestamp();

    const docRef = await messagesCollection.add(newMessage);
    res.json({ id: docRef.id, ...newMessage });
});


io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('sendMessage', async (data) => {
        data.timestamp = admin.firestore.FieldValue.serverTimestamp();
        const docRef = await messagesCollection.add(data);
        const newMessage = { id: docRef.id, ...data };

        io.emit('receiveMessage', newMessage); 
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});
