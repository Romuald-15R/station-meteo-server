const express = require("express");
const WebSocket = require("ws");
const http = require("http");

const app = express();
app.use(express.json());

// Server HTTP + WebSocket
const server = http.createServer(app);
const wss = new WebSocket.Server({ server });

console.log("Serveur Node.js démarré");

// Stockage clients Qt
let clients = [];

wss.on("connection", ws => {
    console.log("Client Qt connecté");
    clients.push(ws);

    ws.on("close", () => {
        clients = clients.filter(c => c !== ws);
        console.log("Client Qt déconnecté");
    });
});

// Route handraisana data avy amin'ny Wokwi
app.post("/data", (req, res) => {
    const temp = req.body.temperature;
    const hum = req.body.humidity;

    const data = {
        temperature: temp,
        humidity: hum,
        etatTemp: temp < 18 ? "FROID" : temp <= 30 ? "NORMAL" : "CHAUD",
        etatHum: hum < 40 ? "BASSE" : hum <= 70 ? "NORMALE" : "ELEVEE",
        time: new Date().toLocaleTimeString()
    };

    console.log("Data Wokwi:", data);

    // Alefa amin'ny Qt clients
    clients.forEach(client => client.send(JSON.stringify(data)));

    res.send("OK");
});

// Render dia mametraka port ao amin'ny environment variable PORT
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => console.log(`Server HTTP + WebSocket écoutant sur port ${PORT}`));