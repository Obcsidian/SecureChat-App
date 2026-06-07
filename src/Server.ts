import { WebSocketServer } from "ws";
import express from "express";
import path from "node:path";
import fs from "fs";
import ts from "typescript";
import { RoomManager } from "./Server/RoomManager.js";

const app = express();
const PORT = 3000;
const roomManager = new RoomManager();

app.use(express.static(path.join(process.cwd(), "src/Client")));

app.get("/", (req, res) => {
  res.sendFile(path.join(process.cwd(), "src/Client/index.html"));
});

app.get("/Client.js", (req, res) => {
  const tsPath = path.join(process.cwd(), "src/Client/Client.ts");
  const tsCode = fs.readFileSync(tsPath, "utf-8");
  const jsCode = ts.transpileModule(tsCode, {
    compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
  }).outputText;
  res.setHeader("Content-Type", "application/javascript");
  res.send(jsCode);
});

const server = app.listen(PORT, () => console.log(`Server running at http://localhost:${PORT}`));

const wss = new WebSocketServer({ server });

wss.on("connection", ws => {
  ws.on("message", data => {
    let msg;
    try { msg = JSON.parse(data.toString()); } catch { return; }

    switch (msg.type) {
      case "JOIN":
        roomManager.joinRoom(msg.room, ws, msg.username);
        ws.send(JSON.stringify({ type: "JOIN_SUCCESS", room: msg.room, username: msg.username }));
        roomManager.broadcast(msg.room, { type: "JOIN", username: msg.username, members: roomManager.getRoom(msg.room)?.getMembers() || [] });
        break;
      case "MESSAGE":
        roomManager.broadcast(msg.room, { type: "MESSAGE", username: msg.username, message: msg.message });
        break;
      case "LEAVE":
        roomManager.leaveRoom(msg.room, ws, msg.username);
        roomManager.broadcast(msg.room, { type: "LEAVE", username: msg.username, members: roomManager.getRoom(msg.room)?.getMembers() || [] });
        break;
    }
  });
});