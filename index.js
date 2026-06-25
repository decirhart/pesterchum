const { Client, GatewayIntentBits, Partials } = require("discord.js");
const WebSocket = require("ws");
const express = require("express");
const path = require("path");
const crypto = require("crypto");

const TOKEN = process.env.DISCORD_TOKEN;
const PORT = process.env.PORT || 3001;

const USERS = require("./users.json");

/* =========================================================
   EXPRESS APP
========================================================= */

const app = express();

app.use(express.static(path.join(__dirname, "public")));

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

const server = app.listen(PORT, "0.0.0.0", () => {
    console.log("Server running on", PORT);
});

/* =========================================================
   WEBSOCKET SERVER
========================================================= */

const wss = new WebSocket.Server({ server });

function broadcast(payload) {
    const data = JSON.stringify(payload);

    wss.clients.forEach(client => {
        if (client.readyState === WebSocket.OPEN) {
            client.send(data);
        }
    });
}

wss.on("listening", () => {
    console.log("WebSocket ready");
});

wss.on("error", err => {
    console.error("WS ERROR:", err);
});

/* =========================================================
   DISCORD BOT
========================================================= */

const client = new Client({
    intents: [
        GatewayIntentBits.Guilds,
        GatewayIntentBits.GuildMessages,
        GatewayIntentBits.MessageContent
    ],
    partials: [
        Partials.Channel,
        Partials.Message,
        Partials.User
    ]
});

client.once("ready", () => {

    console.log("Bot online as:", client.user.tag);

    broadcast({
        type: "system",
        event: "ready"
    });

});

/* =========================================================
   DISCORD -> STANDARD MESSAGE PIPELINE
========================================================= */

client.on("messageCreate", msg => {

    // Tupperbox / webhook support (BEST CASE)
if (msg.webhookId || msg.author.bot) {

    handle = msg.author.username; // Tupperbox sets OC name here
    displayName = msg.author.username;

}

// fallback: [OC] message
if (!handle) {
    const match = msg.content.match(/^\[(.+?)\]\s*(.*)$/);

    if (match) {
        handle = match[1];
        msg.content = match[2];
    }
}

    // Ignore bots (including Tupperbox webhooks if desired)
    if (msg.author.bot) return;

    let handle = null;
let displayName = null;
let color = "#ffffff";

   const payload = {
    id: crypto.randomUUID(),
    type: "message",
    room: msg.channel.id,

    handle: handle,
    displayName: displayName,

    color: "#ffffff", // optional for now

    content: msg.content,
    timestamp: msg.createdTimestamp,
    attachments: [...msg.attachments.values()].map(a => a.url)
};

    broadcast(payload);

});

/* =========================================================
   ERROR HANDLING
========================================================= */

client.on("error", err => {
    console.error("Discord client error:", err);
});

process.on("unhandledRejection", err => {
    console.error("Unhandled rejection:", err);
});

/* =========================================================
   LOGIN
========================================================= */

client.login(TOKEN);