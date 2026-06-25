const { Client, GatewayIntentBits, Partials } = require("discord.js");
const WebSocket = require("ws");
const express = require("express");
const path = require("path");
const crypto = require("crypto");
const seenMessages = new Set();

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

const COLOR_MAP = {
    gawdelpusCacodoxy: "#3FB7B7",
    acquiescentConscript: "#7BADEE",
    strawberryJam: "#B76E79"
};

function getColor(username) {
    return COLOR_MAP[username] || "#ffffff";
}

/* =========================================================
   DISCORD -> STANDARD MESSAGE PIPELINE
========================================================= */

client.on("messageCreate", msg => {

    // ONLY TUPPER / WEBHOOK MESSAGES
  const isWebhook = !!msg.webhookId;
const isTupper = msg.author.username?.toLowerCase().includes("tupper") || isWebhook;

if (!isTupper) return;

    // dedupe
    const key = msg.id;
    if (seenMessages.has(key)) return;
    seenMessages.add(key);

    setTimeout(() => seenMessages.delete(key), 60000);

    // identity (webhook = OC name)
    const identity = {
        handle: msg.author.username,
        displayName: msg.author.username,
        color: "#ffffff"
    };

    const payload = {
        id: msg.id,
        type: "message",
        room: msg.channel.id,

        handle: identity.handle,
        displayName: identity.displayName,
        color: getColor(msg.author.username),

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