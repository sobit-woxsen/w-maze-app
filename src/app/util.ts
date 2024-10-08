function seededRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

export function generateMaze(x: number, y: number, seed: number) {
  // Establish variables and starting grid
  const totalCells = x * y;
  const maze: number[][][] = [];
  const unvisited: boolean[][] = [];

  for (let i = 0; i < y; i++) {
    maze[i] = [];
    unvisited[i] = [];
    for (let j = 0; j < x; j++) {
      maze[i][j] = [0, 0, 0, 0];
      unvisited[i][j] = true;
    }
  }

  // Set a random position to start from
  let currentCell: [number, number] = [
    Math.floor(seededRandom(seed) * y),
    Math.floor(seededRandom(seed + 1) * x),
  ];

  const path: [number, number][] = [currentCell];
  unvisited[currentCell[0]][currentCell[1]] = false;
  let visited = 1;

  // Loop through all available cell positions
  while (visited < totalCells) {
    // Determine neighboring cells
    const pot: [number, number, number, number][] = [
      [currentCell[0] - 1, currentCell[1], 0, 2],
      [currentCell[0], currentCell[1] + 1, 1, 3],
      [currentCell[0] + 1, currentCell[1], 2, 0],
      [currentCell[0], currentCell[1] - 1, 3, 1],
    ];
    const neighbors: [number, number, number, number][] = [];

    // Determine if each neighboring cell is in game grid, and whether it has already been checked
    for (let l = 0; l < 4; l++) {
      if (
        pot[l][0] > -1 &&
        pot[l][0] < y &&
        pot[l][1] > -1 &&
        pot[l][1] < x &&
        unvisited[pot[l][0]][pot[l][1]]
      ) {
        neighbors.push(pot[l]);
      }
    }

    // If at least one active neighboring cell has been found
    if (neighbors.length) {
      // Choose one of the neighbors at random
      // const next = neighbors[Math.floor(Math.random() * neighbors.length)];

      const next =
        neighbors[Math.floor(seededRandom(seed + visited) * neighbors.length)];

      // Remove the wall between the current cell and the chosen neighboring cell
      maze[currentCell[0]][currentCell[1]][next[2]] = 1;
      maze[next[0]][next[1]][next[3]] = 1;

      // Mark the neighbor as visited, and set it as the current cell
      unvisited[next[0]][next[1]] = false;
      visited++;
      currentCell = [next[0], next[1]];
      path.push(currentCell);
    }
    // Otherwise go back up a step and keep going
    else {
      const prevCell = path.pop();
      if (prevCell) {
        currentCell = prevCell;
      }
    }
  }
  return maze;
}
export function solve(
  maze: number[][],
  startX = 0,
  startY = 0,
  endX = maze.length - 1,
  endY = maze[0].length - 1
): [number, number][] {
  const visited: boolean[][] = [];
  // Mark all cells as unvisited:
  for (let x = 0; x < maze.length; x++) {
    visited[x] = [];
    for (let y = 0; y < maze[x].length; y++) {
      visited[x][y] = false;
    }
  }

  const solution: [number, number][] = [];
  let currentX = startX;
  let currentY = startY;
  let options: [number, number][] = [];

  while (currentX !== endX || currentY !== endY) {
    visited[currentX][currentY] = true;
    options = getOptions(currentX, currentY, maze, visited);

    if (options.length === 0) {
      const lastPosition = solution.pop();
      if (lastPosition) {
        [currentX, currentY] = lastPosition;
      } else {
        // Handle the case when solution is empty
        break;
      }
    } else {
      solution.push([currentX, currentY]);
      [currentX, currentY] = options[0];
    }
  }

  solution.push([currentX, currentY]);

  return solution;
}
/*
 * Gets all of the cells we can possibly go to next.
 */
function getOptions(
  x: number,
  y: number,
  maze: number[][],
  visited: boolean[][]
) {
  const options: [number, number][] = [];
  const cell = maze[x][y];
  const rows = maze.length;
  const cols = maze[0].length;

  // can go south
  if (x + 1 < rows && !visited[x + 1][y] && cell === 1) {
    options.push([x + 1, y]);
  }

  // can go east
  if (y + 1 < cols && !visited[x][y + 1] && cell === 1) {
    options.push([x, y + 1]);
  }

  // can go west
  if (y - 1 >= 0 && !visited[x][y - 1] && cell === 1) {
    options.push([x, y - 1]);
  }

  // can go north
  if (x - 1 >= 0 && !visited[x - 1][y] && cell === 1) {
    options.push([x - 1, y]);
  }

  return options;
}
export function calculateShortestPath(maze: number[][]): number[][] {
  const rows = maze.length;
  const cols = maze[0].length;
  const queue: [number, number, number[][]][] = [[0, 0, [[0, 0]]]];
  const visited = new Set<string>();

  const directions = [
    [0, 1],
    [1, 0],
    [0, -1],
    [-1, 0],
  ];

  while (queue.length > 0) {
    const [row, col, path] = queue.shift()!;
    console.log(`Checking position: ${row}, ${col}`);

    if (row === rows - 1 && col === cols - 1) {
      console.log("End reached!");
      return path;
    }

    const key = `${row},${col}`;
    if (visited.has(key)) continue;
    visited.add(key);

    for (let i = 0; i < 4; i++) {
      const newRow = row + directions[i][0];
      const newCol = col + directions[i][1];
      if (
        newRow >= 0 &&
        newRow < rows &&
        newCol >= 0 &&
        newCol < cols &&
        maze[newRow][newCol] === 1
      ) {
        queue.push([newRow, newCol, [...path, [newRow, newCol]]]);
      }
    }
  }

  return [];
}
