import { MoveCarAlongRoute } from "./car";

// -------------------------------------------------------------------------------------------
// SOCKET
// -------------------------------------------------------------------------------------------

let socket = undefined;
let statusTextButton = document.querySelector("#connectButton");

function connect_socket() {
  socket = new WebSocket("ws://192.168.4.1:80/connect-websocket");
  console.log(socket);

  socket.addEventListener("open", (event) => {
    statusTextButton.textContent = "Connected";
  });

  socket.addEventListener("close", (event) => {
    socket = undefined;
    statusTextButton.textContent = "Connect";
  });

  socket.addEventListener("message", (event) => {
    message = event.data;
    console.log("message received from pico: \n", message);

    if (message == "Crossed intersection") {
      MoveCarAlongRoute();
    } else if (message == "Puck received") {
      AddScore(100);
      scoreCounterTextComponent.textContent = `Score: ${scoreCount}`;
    } else if (message == "Finished route") {
      EndTimer();
      UpdateScore(Math.ceil((180 - TimeDiff() / 1000) * 3));
    } else if (message == "First intersection") {
      StartTimer();
    }
  });

  socket.addEventListener("error", (event) => {
    socket = undefined;
    statusTextButton.textContent = "Connect";
  });
}

const socketButton = document.querySelector("#connectButton");
socketButton.addEventListener("mousedown", () => {
  connect_socket();
});

// -------------------------------------------------------------------------------------------
// STOP BUTTON
// -------------------------------------------------------------------------------------------

const stopButton = document.querySelector("#stopButton");
stopButton.addEventListener("mousedown", () => {
  SendDir("STOP");
});

// -------------------------------------------------------------------------------------------
// TURN SPEED
// -------------------------------------------------------------------------------------------

const updateSpeedInTurnButton = document.querySelector("#submitSpeedInTurn");
const lSpeedInput = document.querySelector("#lSpeedInTurn");
const rSpeedInput = document.querySelector("#rSpeedInTurn");

lSpeedInput.defaultValue = localStorage.getItem("lSpeedValue");
rSpeedInput.defaultValue = localStorage.getItem("rSpeedValue");

updateSpeedInTurnButton.addEventListener("mousedown", () => {
  const lSpeedValue = lSpeedInput.value;
  const rSpeedValue = rSpeedInput.value;

  localStorage.setItem("lSpeedValue", lSpeedValue);
  localStorage.setItem("rSpeedValue", rSpeedValue);

  SendDir(`TurnSpeed:${lSpeedValue}:${rSpeedValue}`);
});

// -------------------------------------------------------------------------------------------
// SCORE
// -------------------------------------------------------------------------------------------

let scoreCount = 0;
let scoreCounterTextComponent = document.querySelector("#scoreCounter");

function AddScore(addScore) {
  if (addScore === -1) {
    scoreCount = 0;
  } else {
    scoreCount += addScore;
  }
  scoreCounterTextComponent.textContent = `Score: ${scoreCount}`;
}

// -------------------------------------------------------------------------------------------
// TIMER
// -------------------------------------------------------------------------------------------

const timerText = document.querySelector("#timer");
let intervalTimer;
let remainingTime = 300;

let startTime = 0;
let endTime = 0;

function StartTimer() {
  startTime = Date.now();
  remainingTime = 300;
  intervalTimer = setInterval(UpdateTimer, 1000);
}

function EndTimer() {
  endTime = Date.now();
  clearInterval(intervalTimer);
}

function TimeDiff() {
  return endTime - startTime;
}

function UpdateTimer() {
  remainingTime -= 1;
  const s = remainingTime % 60;
  const m = Math.floor(remainingTime / 60);
  if (s < 10) {
    timerText.textContent = `Time: ${m}:0${s}`;
  } else {
    timerText.textContent = `Time: ${m}:${s}`;
  }
}

// -------------------------------------------------------------------------------------------
// TIMER
// -------------------------------------------------------------------------------------------

function SendDir(dir) {
  if (socket != undefined) {
    console.log(dir);
    socket.send(dir);
  } else {
    console.log("Not connected to the PICO");
  }
}

export { AddScore, SendDir };
