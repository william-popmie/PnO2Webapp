const TIMESTRAIGHT = 3;
const TIMETURN = 4;

const ACCEPT = 'accept';
const ABANDON = 'abandon';
const CONTINUE = 'continue';

function initiate_board(nbRows, nbCols) {
    if (nbCols < 1 || nbRows < 1) {
        return null;
    }
    const field = new Array(nbRows).fill(null).map(() => new Array(nbCols).fill(' '));
    return field;
}

function putGreen(board, x, y) {
    if (x < board.length && x >= 0 && y < board[0].length && y >= 0) {
        board[x][y] = "G";
    }
    return board;
}

function putRed(board, x, y) {
    if (x < board[0].length && x >= 0 && y < board.length && y >= 0) {
        board[x][y] = "R";
    }
    return board;
}

function getGreens(board) {
    const greens = new Set();
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] === 'G') {
                greens.add([i, j]);
            }
        }
    }
    return greens;
}

function getReds(board) {
    const reds = new Set();
    for (let i = 0; i < board.length; i++) {
        for (let j = 0; j < board[0].length; j++) {
            if (board[i][j] === 'R') {
                reds.add([i, j]);
            }
        }
    }
    return reds;
}

function getLegalNeighbours(board, pos) {
    const y = pos[0];
    const x = pos[1];
    const newPos = new Set();
    if (x + 1 < board[0].length) {
        if (board[y][x + 1] !== 'R') {
            newPos.add([y, x + 1]);
        }
    }
    if (y + 1 < board.length) {
        if (board[y + 1][x] !== 'R') {
            newPos.add([y + 1, x]);
        }
    }
    if (x - 1 >= 0) {
        if (board[y][x - 1] !== 'R') {
            newPos.add([y, x - 1]);
        }
    }
    if (y - 1 >= 0) {
        if (board[y - 1][x] !== 'R') {
            newPos.add([y - 1, x]);
        }
    }
    return newPos;
}

function calculateTime(route) {
    if (route.length < 2) {
        return 0;
    }
    let rotation = [route[1][0] - route[0][0], route[1][1] - route[0][1]];
    let totalTime = 0;
    for (let i = 1; i < route.length; i++) {
        const newRotation = [route[i][0] - route[i - 1][0], route[i][1] - route[i - 1][1]];
        if (newRotation[0] === rotation[0] && newRotation[1] === rotation[1]) {
            // No turn needed
        } else if (newRotation[0] * -1 === rotation[0]) {
            totalTime += TIMETURN * 2;
        } else {
            totalTime += TIMETURN;
        }
        totalTime += TIMESTRAIGHT;
        rotation = newRotation;
    }
    return totalTime;
}

function makeInstructionfile(route, board) {
    let fileContent = '';
    for (const pos of route) {
        const pick = board[pos[0]][pos[1]] === 'G' ? 'True' : 'False';
        fileContent += `${pos[0]}, ${pos[1]}, ${pick}\n`;
    }
    // Write fileContent to a file named 'instructions.txt'
}

function fastestRoute(board, start, finish) {
    const routes = [];
    const minTime = [60];
    function backtrack(start, route = []) {
        route.push(start);

        if (start[0] === finish[0] && start[1] === finish[1]) {
            if (calculateTime(route) < minTime[0]) {
                routes.unshift([...route]);
                minTime[0] = calculateTime(route);
            }
        }

        for (const pos of getLegalNeighbours(board, start)) {
            if (!route.find(([r, c]) => r === pos[0] && c === pos[1]) && board[pos[0]][pos[1]] !== 'R' && calculateTime(route) < minTime[0]) {
                backtrack(pos, [...route]);
            }
        }
    }
    backtrack(start);
    return routes[0];
}

function collect(board, start, finish) {
    const greens = [...getGreens(board)];
    const roads = {};

    function backtrack(start, endpoints, road = [], totalTime = 0) {
        if (!endpoints.length) {
            const lastRoute = fastestRoute(board, start, finish);
            roads[totalTime + calculateTime(lastRoute)] = road.concat(lastRoute);
        }

        for (let i = 0; i < endpoints.length; i++) {
            const point = endpoints[i];
            const extraRoute = fastestRoute(board, start, point);
            backtrack(point, endpoints.slice(0, i).concat(endpoints.slice(i + 1)), road.concat(extraRoute.slice(0, -1)), totalTime + calculateTime(extraRoute));
        }
    }

    backtrack(start, greens);
    

    const minTime = Math.min(...Object.keys(roads).map(Number));
    return roads[minTime];
}

function changeOutput(path) {
    let way = 'route:';
    let startOrientation = [path[1][0] - path[0][0], path[1][1] - path[0][1]];
    for (let i = 1; i < path.length; i++) {
        const newRotation = [path[i][0] - path[i - 1][0], path[i][1] - path[i - 1][1]];
        if (newRotation[0] !== startOrientation[0] || newRotation[1] !== startOrientation[1]) {
            const rotation = [(-1) ** startOrientation[0] * (startOrientation[0] + newRotation[0]), startOrientation[1] + newRotation[1]];
            if (rotation[0] === rotation[1] && rotation[0] === 0) {
                way += "LL";
            } else if (rotation[0] === rotation[1]) {
                way += "R";
            } else if (rotation[0] * (-1) === rotation[1]) {
                way += "L";
            }
        }
        way += 'F'
        startOrientation = newRotation
    }
    return way
}

let board = initiate_board(5,6)
board = putGreen(board, 0, 1)
board = putGreen(board, 4, 3)
board = putGreen(board, 2, 5)
board = putGreen(board, 3, 1)

board = putRed(board, 2, 1)
board = putRed(board, 4, 2)
board = putRed(board, 1, 5)
board = putRed(board, 0, 3)
for (row in board){
    console.log(board[row])}
console.log(collect(board, [0, 0], [0, 0]))