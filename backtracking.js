let n = 6;
let m = 4;
let board = [
  [0, 0, 0, 0, 1, 1],
  [0, 0, 0, 0, 0, 1],
  [1, 2, 0, 2, 0, 0],
  [0, 2, 1, 2, 1, 0],
];
let t = 100;
let way = [];
let finalWay = [];

function PrintBoard() {
  for (line of board) {
    console.log(line);
  }
}

function Solve(board, green = 6, cnt = 0, road = [], x = 0, y = 0) {
  let isGreen;
  if (board[y][x] == 2 || cnt >= 20) {
    return false;
  } else {
    road.push([x, y]);
    if (board[y][x] == 1) {
      isGreen = true;
      green -= 1;
      board[y][x] = 0;

      if (green == 0) {
        if (cnt < t) {
          way = road;
          t = cnt;

          finalWay = [];
          for (let x of way) {
            finalWay.push(x);
          }
          console.log(t, way);
        }
      }
    } else {
      isGreen = false;
    }
    if (x < n - 1) {
      if (cnt >= 3) {
        if (road[cnt - 3][0] != x + 1 || road[cnt - 3][1] != y) {
          Solve(board, green, cnt + 1, road, x + 1, y);
        }
      } else {
        Solve(board, green, cnt + 1, road, x + 1, y);
      }
    }

    if (y < m - 1) {
      if (cnt >= 3) {
        if (road[cnt - 3][0] != x || road[cnt - 3][1] != y + 1) {
          Solve(board, green, cnt + 1, road, x, y + 1);
        }
      } else {
        Solve(board, green, cnt + 1, road, x, y + 1);
      }
    }

    if (x >= 1) {
      if (cnt >= 3) {
        if (road[cnt - 3][0] != x - 1 || road[cnt - 3][1] != y) {
          Solve(board, green, cnt + 1, road, x - 1, y);
        }
      } else {
        Solve(board, green, cnt + 1, road, x - 1, y);
      }
    }
    if (y >= 1) {
      if (cnt >= 3) {
        if (road[cnt - 3][0] != x || road[cnt - 3][1] != y - 1) {
          Solve(board, green, cnt + 1, road, x, y - 1);
        }
      } else {
        Solve(board, green, cnt + 1, road, x, y - 1);
      }
    }

    road.pop();
    if (isGreen) {
      board[y][x] = 1;
    }
  }
}

export function MainSolve() {
  console.log("Current board: ");
  PrintBoard();
  console.log("Solving board ...");
  Solve(board);
  console.log("Solved board: ");
  console.log(finalWay);

  return finalWay;
}
