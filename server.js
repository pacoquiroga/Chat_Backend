const express = require('express');
const mongoose = require('mongoose');
const http = require('http');
const { Server } = require('socket.io');
const cors = require('cors');

// Configuración de MongoDB
mongoose.connect('mongodb://localhost:27017/chat_app2', {
    useNewUrlParser: true,
    useUnifiedTopology: true,
});

const db = mongoose.connection;
db.on('error', console.error.bind(console, 'Error al conectar a MongoDB'));
db.once('open', () => {
    console.log('Conectado a MongoDB');
});

// Modelo de mensajes
const messageSchema = new mongoose.Schema({
    username: String,
    message: String,
    timestamp: { type: Date, default: Date.now },
});

const Message = mongoose.model('Message', messageSchema);

// Configuración del servidor express
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
    cors: {
        origin: '*',
        methods: ['GET', 'POST'],
    },
});
app.use(cors());
app.use(express.json());

// Rutas endpoints
app.get('/messages', async (req, res) => {
    const messages = await Message.find().sort({ timestamp: 1 });
    res.json(messages);
});

app.post('messages', async (req, res) => {
    const newMessage = new Message(req.body);
    await newMessage.save();
    res.json(newMessage);
})

// WebSocket: Socket.IO
io.on('connection', (socket) => {
    console.log('Usuario conectado');

    socket.on('sendMessage', async (data) => {
        const newMessage = new Message(data);
        await newMessage.save();
        io.emit('receiveMessage', data); // Enviar el mensaje a todos los clientes conectados
    });

    socket.on('disconnect', () => {
        console.log('Usuario desconectado');
    });
});

// Iniciar servidor por el puerto
server.listen(3000, () => {
    console.log('Servidor corriendo en http://localhost:3000');
});
