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

//Turn Speed
const updateSpeedInTurnButton = document.querySelector("#submitSpeedInTurn");
const lSpeedTurnInput = document.querySelector("#lSpeedInTurn");
const rSpeedTurnInput = document.querySelector("#rSpeedInTurn");

lSpeedTurnInput.defaultValue = localStorage.getItem("lSpeedTurnValue");
rSpeedTurnInput.defaultValue = localStorage.getItem("rSpeedTurnValue");

updateSpeedInTurnButton.addEventListener("mousedown", () => {
  const lSpeedTurnValue = lSpeedTurnInput.value;
  const rSpeedTurnValue = rSpeedTurnInput.value;

  localStorage.setItem("lSpeedTurnValue", lSpeedTurnValue);
  localStorage.setItem("rSpeedTurnValue", rSpeedTurnValue);

  console.log("TurnSpeedValue", lSpeedTurnValue, rSpeedTurnValue);
  SendDir(`TurnSpeed:${lSpeedTurnValue}:${rSpeedTurnValue}`);
});

// Half Speed
const updateHalfSpeedButton = document.querySelector("#submitHalfSpeed");
const lSpeedHalfInput = document.querySelector("#lSpeedHalf");
const rSpeedHalfInput = document.querySelector("#rSpeedHalf");

lSpeedHalfInput.defaultValue = localStorage.getItem("lSpeedHalfValue");
rSpeedHalfInput.defaultValue = localStorage.getItem("rSpeedHalfValue");

updateHalfSpeedButton.addEventListener("mousedown", () => {
  const lSpeedHalfValue = lSpeedHalfInput.value;
  const rSpeedHalfValue = rSpeedHalfInput.value;

  localStorage.setItem("lSpeedHalfValue", lSpeedHalfValue);
  localStorage.setItem("rSpeedHalfValue", rSpeedHalfValue);

  console.log("HalfSpeedValue", lSpeedHalfValue, rSpeedHalfValue);
  SendDir(`HalfSpeed:${lSpeedHalfValue}:${rSpeedHalfValue}`);
});

// Manual Route
const startRouteButton = document.querySelector("#submitRouteInput");
const startRouteInput = document.querySelector("#routeInput");
startRouteInput.defaultValue = localStorage.getItem("startRouteInput");

startRouteButton.addEventListener("mousedown", () => {
  const startRouteInputValue = startRouteInput.value;
  let valid = true;
  for (let c of startRouteInputValue) {
    if (!(c == "f" || c == "s" || c == "r" || c == "l" || c == "b")) {
      valid = false;
    }
  }
  if (valid) {
    localStorage.setItem("startRouteInput", startRouteInput.value);
    console.log("correct");
  }
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
