import WebSocket from "ws";

export class Room {
  public clients: Set<WebSocket> = new Set();

  constructor(public readonly id: string) {}

  addClient(ws: WebSocket) {
    this.clients.add(ws);
  }

  removeClient(ws: WebSocket) {
    this.clients.delete(ws);
  }

  getMembers(): string[] {
    const members: string[] = [];
    this.clients.forEach(ws => {
      if ((ws as any).username) members.push((ws as any).username);
    });
    return members;
  }

  broadcast(data: any) {
    const payload = JSON.stringify(data);
    this.clients.forEach(client => {
      if (client.readyState === WebSocket.OPEN) client.send(payload);
    });
  }
}