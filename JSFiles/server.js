import { MoveCarAlongRoute } from "./car";

let socket = undefined;
let statusTextComponent = document.querySelector("#connectionStatus");

function connect_socket() {
  socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");
  console.log(socket);

  socket.addEventListener("open", (event) => {
    statusTextComponent.textContent = "Status: Connected";
  });

  socket.addEventListener("close", (event) => {
    socket = undefined;
    statusTextComponent.textContent = "Status: Disconnected";
  });

  socket.addEventListener("message", (event) => {
    console.log("message received from pico: \n", event.data);
    if (event.data == "CROSSED JUST NOW") {
      MoveCarAlongRoute();
    }
  });

  socket.addEventListener("error", (event) => {
    socket = undefined;
    statusTextComponent.textContent = "Status: Disconnected";
  });
}

const socketButton = document.querySelector("#connectButton");
socketButton.addEventListener("mousedown", () => {
  connect_socket();
});

export function SendDir(dir) {
  if (socket != undefined) {
    console.log(dir);
    socket.send(dir);
  } else {
    console.log("Not connected to the PICO");
  }
}
