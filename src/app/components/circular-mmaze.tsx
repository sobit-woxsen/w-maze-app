"use client";

import React, { useState, useEffect, useCallback } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const MAZE_SIZE = 400;
const RING_COUNT = 8;
const SECTOR_COUNT = 36;
const CENTER_SPACE = 2; // Number of rings to leave empty in the center

type Cell = {
  ring: number;
  sector: number;
  walls: {
    inner: boolean;
    outer: boolean;
    clockwise: boolean;
    counterClockwise: boolean;
  };
  visits: number;
};

type Point = {
  ring: number;
  sector: number;
};

function seededRandom(seed: number) {
  let x = Math.sin(seed++) * 10000;
  return x - Math.floor(x);
}

function generateCircularMaze(
  rings: number,
  sectors: number,
  seed: number
): Cell[][] {
  const maze: Cell[][] = [];
  const unvisited: boolean[][] = [];

  // Initialize maze and unvisited cells
  for (let ring = 0; ring < rings; ring++) {
    maze[ring] = [];
    unvisited[ring] = [];
    for (let sector = 0; sector < sectors; sector++) {
      maze[ring][sector] = {
        ring,
        sector,
        walls: {
          inner: true,
          outer: true,
          clockwise: true,
          counterClockwise: true,
        },
        visits: 0,
      };
      unvisited[ring][sector] = true;
    }
  }

  // Start from a random cell on the outermost ring
  let currentCell: Point = {
    ring: rings - 1,
    sector: Math.floor(seededRandom(seed) * sectors),
  };

  const stack: Point[] = [currentCell];
  unvisited[currentCell.ring][currentCell.sector] = false;

  while (stack.length > 0) {
    const neighbors: Point[] = [];

    // Check neighboring cells
    const directions = [
      { ring: -1, sector: 0, wall: "inner" },
      { ring: 1, sector: 0, wall: "outer" },
      { ring: 0, sector: 1, wall: "clockwise" },
      { ring: 0, sector: -1, wall: "counterClockwise" },
    ];

    for (const dir of directions) {
      const newRing = currentCell.ring + dir.ring;
      const newSector = (currentCell.sector + dir.sector + sectors) % sectors;

      if (
        newRing >= CENTER_SPACE &&
        newRing < rings &&
        unvisited[newRing][newSector]
      ) {
        neighbors.push({ ring: newRing, sector: newSector });
      }
    }

    if (neighbors.length > 0) {
      const nextCell =
        neighbors[
          Math.floor(seededRandom(seed + stack.length) * neighbors.length)
        ];

      // Remove walls between current cell and chosen neighbor
      if (nextCell.ring < currentCell.ring) {
        maze[currentCell.ring][currentCell.sector].walls.inner = false;
        maze[nextCell.ring][nextCell.sector].walls.outer = false;
      } else if (nextCell.ring > currentCell.ring) {
        maze[currentCell.ring][currentCell.sector].walls.outer = false;
        maze[nextCell.ring][nextCell.sector].walls.inner = false;
      } else if (
        nextCell.sector > currentCell.sector ||
        (nextCell.sector === 0 && currentCell.sector === sectors - 1)
      ) {
        maze[currentCell.ring][currentCell.sector].walls.clockwise = false;
        maze[nextCell.ring][nextCell.sector].walls.counterClockwise = false;
      } else {
        maze[currentCell.ring][currentCell.sector].walls.counterClockwise =
          false;
        maze[nextCell.ring][nextCell.sector].walls.clockwise = false;
      }

      unvisited[nextCell.ring][nextCell.sector] = false;
      stack.push(nextCell);
      currentCell = nextCell;
    } else {
      currentCell = stack.pop()!;
    }
  }

  // Ensure there's at least one path to the center
  const centerEntrance = Math.floor(seededRandom(seed + 1000) * sectors);
  maze[CENTER_SPACE][centerEntrance].walls.inner = false;

  return maze;
}

export default function CircularMaze() {
  const [maze, setMaze] = useState<Cell[][]>([]);
  const [playerPos, setPlayerPos] = useState<Point>({
    ring: RING_COUNT - 1,
    sector: 0,
  });
  const [gameWon, setGameWon] = useState(false);

  useEffect(() => {
    const seed = Math.floor(Math.random() * 1000000);
    const newMaze = generateCircularMaze(RING_COUNT, SECTOR_COUNT, seed);
    setMaze(newMaze);

    // Set player starting position
    const startSector = Math.floor(Math.random() * SECTOR_COUNT);
    setPlayerPos({ ring: RING_COUNT - 1, sector: startSector });

    // Mark the starting position as visited
    newMaze[RING_COUNT - 1][startSector].visits = 1;
  }, []);

  const movePlayer = useCallback(
    (direction: "in" | "out" | "clockwise" | "counterClockwise") => {
      setPlayerPos((prevPos) => {
        let newPos = { ...prevPos };

        switch (direction) {
          case "in":
            if (
              prevPos.ring > 0 &&
              (!maze[prevPos.ring][prevPos.sector].walls.inner ||
                prevPos.ring <= CENTER_SPACE)
            ) {
              newPos.ring--;
            }
            break;
          case "out":
            if (
              prevPos.ring < RING_COUNT - 1 &&
              (!maze[prevPos.ring][prevPos.sector].walls.outer ||
                prevPos.ring < CENTER_SPACE)
            ) {
              newPos.ring++;
            }
            break;
          case "clockwise":
            if (
              !maze[prevPos.ring][prevPos.sector].walls.clockwise ||
              prevPos.ring < CENTER_SPACE
            ) {
              newPos.sector = (prevPos.sector + 1) % SECTOR_COUNT;
            }
            break;
          case "counterClockwise":
            if (
              !maze[prevPos.ring][prevPos.sector].walls.counterClockwise ||
              prevPos.ring < CENTER_SPACE
            ) {
              newPos.sector =
                (prevPos.sector - 1 + SECTOR_COUNT) % SECTOR_COUNT;
            }
            break;
        }

        if (newPos.ring !== prevPos.ring || newPos.sector !== prevPos.sector) {
          setMaze((prevMaze) => {
            const newMaze = [...prevMaze];
            newMaze[newPos.ring][newPos.sector].visits++;
            return newMaze;
          });
        }

        if (newPos.ring === 0) {
          setGameWon(true);
        }

        return newPos;
      });
    },
    [maze]
  );

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameWon) return;

      switch (e.key.toLowerCase()) {
        case "arrowup":
        case "w":
          movePlayer("in");
          break;
        case "arrowdown":
        case "s":
          movePlayer("out");
          break;
        case "arrowleft":
        case "a":
          movePlayer("counterClockwise");
          break;
        case "arrowright":
        case "d":
          movePlayer("clockwise");
          break;
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [gameWon, movePlayer]);

  const renderMaze = useCallback(() => {
    if (maze.length === 0) return null;

    const cellSize = MAZE_SIZE / (RING_COUNT * 2);

    return (
      <svg
        width={MAZE_SIZE}
        height={MAZE_SIZE}
        viewBox={`0 0 ${MAZE_SIZE} ${MAZE_SIZE}`}
      >
        <circle
          cx={MAZE_SIZE / 2}
          cy={MAZE_SIZE / 2}
          r={MAZE_SIZE / 2}
          fill="white"
          stroke="black"
          strokeWidth="2"
        />
        {maze.map((ring, ringIndex) =>
          ring.map((cell, sectorIndex) => {
            if (ringIndex < CENTER_SPACE) return null;
            const innerRadius = cell.ring * cellSize;
            const outerRadius = (cell.ring + 1) * cellSize;
            const startAngle = (sectorIndex / SECTOR_COUNT) * 2 * Math.PI;
            const endAngle = ((sectorIndex + 1) / SECTOR_COUNT) * 2 * Math.PI;

            const innerStartX =
              MAZE_SIZE / 2 + innerRadius * Math.cos(startAngle);
            const innerStartY =
              MAZE_SIZE / 2 + innerRadius * Math.sin(startAngle);
            const outerStartX =
              MAZE_SIZE / 2 + outerRadius * Math.cos(startAngle);
            const outerStartY =
              MAZE_SIZE / 2 + outerRadius * Math.sin(startAngle);
            const innerEndX = MAZE_SIZE / 2 + innerRadius * Math.cos(endAngle);
            const innerEndY = MAZE_SIZE / 2 + innerRadius * Math.sin(endAngle);
            const outerEndX = MAZE_SIZE / 2 + outerRadius * Math.cos(endAngle);
            const outerEndY = MAZE_SIZE / 2 + outerRadius * Math.sin(endAngle);

            const visitColor =
              cell.visits > 0
                ? `rgba(0, 200, 0, ${Math.min(cell.visits * 0.2, 1)})`
                : "white";

            return (
              <g key={`${ringIndex}-${sectorIndex}`}>
                <path
                  d={`M ${innerStartX} ${innerStartY} 
                      A ${innerRadius} ${innerRadius} 0 0 1 ${innerEndX} ${innerEndY} 
                      L ${outerEndX} ${outerEndY} 
                      A ${outerRadius} ${outerRadius} 0 0 0 ${outerStartX} ${outerStartY} 
                      Z`}
                  fill={visitColor}
                  stroke="none"
                />
                {cell.walls.outer && (
                  <path
                    d={`M ${outerStartX} ${outerStartY} A ${outerRadius} ${outerRadius} 0 0 1 ${outerEndX} ${outerEndY}`}
                    stroke="black"
                    strokeWidth="2"
                    fill="none"
                  />
                )}
                {cell.walls.clockwise && (
                  <line
                    x1={innerEndX}
                    y1={innerEndY}
                    x2={outerEndX}
                    y2={outerEndY}
                    stroke="black"
                    strokeWidth="1"
                  />
                )}
              </g>
            );
          })
        )}
        <circle
          cx={
            MAZE_SIZE / 2 +
            (playerPos.ring + 0.5) *
              cellSize *
              Math.cos(((playerPos.sector + 0.5) * 2 * Math.PI) / SECTOR_COUNT)
          }
          cy={
            MAZE_SIZE / 2 +
            (playerPos.ring + 0.5) *
              cellSize *
              Math.sin(((playerPos.sector + 0.5) * 2 * Math.PI) / SECTOR_COUNT)
          }
          r={cellSize / 3}
          fill="blue"
        />
        <circle cx={MAZE_SIZE / 2} cy={MAZE_SIZE / 2} r={cellSize} fill="red" />
      </svg>
    );
  }, [maze, playerPos]);

  return (
    <Card className="w-full max-w-xl mx-auto p-10">
      <CardContent>
        <div className="flex flex-col items-center space-y-4">
          <div className="border border-gray-300 rounded-full overflow-hidden">
            {renderMaze()}
          </div>
          {gameWon && (
            <div className="text-green-600 font-bold text-xl">
              Congratulations! You've reached the center!
            </div>
          )}
          <p className="text-sm text-gray-600">
            Use arrow keys or WASD to move. Reach the red circle in the center
            to win!
          </p>
        </div>
      </CardContent>
    </Card>
  );
}
