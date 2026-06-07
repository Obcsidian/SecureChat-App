import { WebSocket } from "ws";
import { Room } from "./Room.js";

export class RoomManager {
  private rooms = new Map<string, Room>();
  private socketRoomMap = new Map<WebSocket, string>();

  createRoom(roomId: string): Room {
    const room = new Room(roomId);
    this.rooms.set(roomId, room);
    return room;
  }

  joinRoom(roomId: string, ws: WebSocket, username: string) {
    const existingRoom = this.socketRoomMap.get(ws);
    if (existingRoom && existingRoom !== roomId) this.leaveRoom(existingRoom, ws, username);

    let room = this.rooms.get(roomId);
    if (!room) room = this.createRoom(roomId);

    (ws as any).username = username;
    room.addClient(ws);
    this.socketRoomMap.set(ws, roomId);
  }

  leaveRoom(roomId: string, ws: WebSocket, username: string) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.removeClient(ws);
    this.socketRoomMap.delete(ws);
    if (room.clients.size === 0) this.rooms.delete(roomId);
  }

  getRoom(roomId: string) {
    return this.rooms.get(roomId);
  }

  broadcast(roomId: string, data: any) {
    const room = this.rooms.get(roomId);
    if (!room) return;
    room.broadcast(data);
  }
}