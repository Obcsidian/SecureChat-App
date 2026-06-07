const ws = new WebSocket(`ws://${window.location.host}`);

const usernameInput = document.getElementById("username") as HTMLInputElement;
const roomInput = document.getElementById("room") as HTMLInputElement;
const msgInput = document.getElementById("msg") as HTMLInputElement;

const joinBtn = document.getElementById("joinBtn")!;
const genBtn = document.getElementById("genBtn")!;
const leaveBtn = document.getElementById("leaveBtn")!;
const sendBtn = document.getElementById("sendBtn")!;

const joinScreen = document.getElementById("joinScreen")!;
const chatScreen = document.getElementById("chatScreen")!;

const messages = document.getElementById("messages")!;
const members = document.getElementById("members")!;
const memberCount = document.getElementById("memberCount")!;
const conn = document.getElementById("conn")!;
const meta = document.getElementById("meta")!;

let currentRoom = "";
let username = "";

function showChat() {
  joinScreen.classList.add("hidden");
  chatScreen.classList.remove("hidden");
}

function showJoin() {
  chatScreen.classList.add("hidden");
  joinScreen.classList.remove("hidden");
}

ws.onopen = () => {
  conn.textContent = "● CONNECTED";
  conn.style.color = "#00ff41";
};

ws.onclose = () => {
  conn.textContent = "● DISCONNECTED";
  conn.style.color = "#ff3b3b";
};

ws.onmessage = (event) => {
  let data;
  try {
    data = JSON.parse(event.data);
  } catch {
    return;
  }

  if (data.type === "JOIN_SUCCESS") {
    currentRoom = data.room;
    username = data.username;
    meta.textContent = `Room: ${currentRoom} | User: ${username}`;
    showChat();
  }

  if (data.type === "MESSAGE") {
    const div = document.createElement("div");
    div.textContent = `${data.username}: ${data.message}`;
    messages.appendChild(div);
    messages.scrollTop = messages.scrollHeight;
  }

  if (data.type === "JOIN" || data.type === "LEAVE") {
    members.innerHTML = "";
    (data.members || []).forEach((m: string) => {
      const d = document.createElement("div");
      d.textContent = m;
      members.appendChild(d);
    });

    memberCount.textContent = `${data.members.length} ONLINE`;
  }
};

joinBtn.onclick = () => {
  const u = usernameInput.value.trim();
  const r = roomInput.value.trim();

  if (!u) return alert("Username required");
  if (!r) return alert("Room ID required");

  ws.send(JSON.stringify({ type: "JOIN", room: r, username: u }));
};

genBtn.onclick = () => {
  roomInput.value = Math.random().toString(36).substring(2, 10).toUpperCase();
};

sendBtn.onclick = () => {
  const msg = msgInput.value.trim();
  if (!msg) return;

  ws.send(JSON.stringify({ type: "MESSAGE", room: currentRoom, username, message: msg }));
  msgInput.value = "";
};

msgInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") sendBtn.click();
});

leaveBtn.onclick = () => {
  ws.send(JSON.stringify({ type: "LEAVE", room: currentRoom, username }));
  currentRoom = "";
  username = "";
  showJoin();
};