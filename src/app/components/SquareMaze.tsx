"use client";

import { useState, useMemo, useEffect } from "react";
import { calculateShortestPath, generateMaze, solve } from "@/app/util";
import CircularMaze from "./CircularMaze";

export default function Maze() {
  const [gameId, setGameId] = useState(1);
  const [status, setStatus] = useState("playing");

  const [currentTime, setCurrentTime] = useState(0);
  const [startTime, setStartTime] = useState(null);
  const [endTime, setEndTime] = useState(null);
  const [score, setScore] = useState(null);

  const [userPath, setUserPath] = useState(new Set());

  const [size, setSize] = useState(14);

  const [userPosition, setUserPosition] = useState([0, 0]);

  const [mazeType, setMazeType] = useState("Maze 1");

  const maze = useMemo(() => generateMaze(size, size, 12345), [size, gameId]);

  const [showShortestPath, setShowShortestPath] = useState(false);

  const solution = useMemo(() => {
    const s = new Set();
    const solutionPath = solve(maze, userPosition[0], userPosition[1]);
    console.log("SOLUUTION PATH ", solutionPath);
    solutionPath.forEach((path) => {
      const [x, y] = path;
      s.add(String(x) + "-" + String(y));
    });
    return s;
  }, [size, userPosition[0], userPosition[1], gameId]);

  const formatTime = (timeInSeconds) => {
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}`;
  };

  const startTimer = () => {
    setStartTime(Date.now());
    setEndTime(null);
    setScore(null);
  };

  useEffect(() => {
    const lastRowIndex = maze.length - 1;
    const lastColIndex = maze[0].length - 1;
    if (userPosition[0] === lastRowIndex && userPosition[1] === lastColIndex) {
      setStatus("won");
      setEndTime(Date.now());
      const timeInSeconds = (Date.now() - startTime) / 1000;
      const calculatedScore = calculateScore(mazeType, timeInSeconds);
      setScore(calculatedScore);
    }
  }, [userPosition[0], userPosition[1], maze, mazeType, startTime]);

  useEffect(() => {
    let interval;
    if (status === "playing" && startTime) {
      interval = setInterval(() => {
        setCurrentTime((Date.now() - startTime) / 1000);
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [status, startTime]);

  const makeClassName = (i, j) => {
    if (maze[i][j] === null) return "hidden";

    const rows = maze.length;
    const cols = maze[0].length;
    let arr = [];
    if (maze[i][j][0] === 0) {
      arr.push("topWall");
    }
    if (maze[i][j][1] === 0) {
      arr.push("rightWall");
    }
    if (maze[i][j][2] === 0) {
      arr.push("bottomWall");
    }
    if (maze[i][j][3] === 0) {
      arr.push("leftWall");
    }
    if (i === rows - 1 && j === cols - 1) {
      arr.push("destination");
    }
    if (i === userPosition[0] && j === userPosition[1]) {
      arr.push("currentPosition");
    }

    if (i === userPosition[0] && j === userPosition[1]) {
      arr.push("currentPosition");
    }

    const key = `${i}-${j}`;
    for (let item of userPath) {
      if (item.startsWith(key)) {
        const count = parseInt(item.split(":")[1]);
        arr.push(`userPath-${Math.min(count, 3)}`);
        break;
      }
    }

    if (showShortestPath && solution.has(String(i) + "-" + String(j))) {
      arr.push("shortestPath");
    }

    return arr.join(" ");
  };

  const handleMove = (e) => {
    e.preventDefault();
    if (status !== "playing") {
      return;
    }
    const key = e.code;

    const [i, j] = userPosition;
    let newPosition = [...userPosition];

    if ((key === "ArrowUp" || key === "KeyW") && maze[i][j][0] === 1) {
      // setUserPosition([i - 1, j]);
      newPosition = [i - 1, j];
    }
    if ((key === "ArrowRight" || key === "KeyD") && maze[i][j][1] === 1) {
      // setUserPosition([i, j + 1]);
      newPosition = [i, j + 1];
    }
    if ((key === "ArrowDown" || key === "KeyS") && maze[i][j][2] === 1) {
      // setUserPosition([i + 1, j]);
      newPosition = [i + 1, j];
    }
    if ((key === "ArrowLeft" || key === "KeyA") && maze[i][j][3] === 1) {
      // setUserPosition([i, j - 1]);
      newPosition = [i, j - 1];
    }

    if (newPosition[0] !== i || newPosition[1] !== j) {
      setUserPosition(newPosition);
      setUserPath((prevPath) => {
        const newPath = new Set(prevPath);
        const key = `${newPosition[0]}-${newPosition[1]}`;
        let count = 1;
        for (let item of prevPath) {
          if (item.startsWith(key)) {
            count = parseInt(item.split(":")[1]) + 1;
            newPath.delete(item);
            break;
          }
        }
        newPath.add(`${key}:${count}`);
        return newPath;
      });
    }
  };

  const calculateScore = (mazeType, timeInSeconds) => {
    switch (mazeType) {
      case "Maze 1":
        if (timeInSeconds <= 30) return 3;
        if (timeInSeconds <= 45) return 2;
        if (timeInSeconds <= 60) return 1;
        return 0;
      case "Maze 2":
        if (timeInSeconds <= 60) return 3;
        if (timeInSeconds <= 90) return 2;
        if (timeInSeconds <= 105) return 1;
        return 0;
      case "Maze 3":
        if (timeInSeconds <= 90) return 3;
        if (timeInSeconds <= 105) return 2;
        if (timeInSeconds <= 120) return 1;
        return 0;
      case "Maze 4":
        if (timeInSeconds <= 105) return 3;
        if (timeInSeconds <= 120) return 2;
        if (timeInSeconds <= 150) return 1;
        return 0;
      default:
        return 0;
    }
  };

  const shortestPath = useMemo(() => {
    const path = calculateShortestPath(maze);
    return new Set(path.map(([x, y]) => `${x}-${y}`));
  }, [maze]);

  console.log("SHRTEST PATH ", shortestPath);

  return (
    <div className="App" onKeyDown={handleMove} tabIndex={-1}>
      <div className="flex justify-between gap-5">
        <button
          onClick={() => {
            setMazeType("Maze 1");
            setSize(14);
            setUserPosition([0, 0]);
            setStatus("playing");
            setGameId(gameId + 1);
            setUserPath(new Set());
            startTimer();
          }}
          className="w-['200px'] h-['20px] bg-slate-200 p-3 hover:bg-slate-300"
        >
          Maze 1
        </button>
        <button
          onClick={() => {
            setMazeType("Maze 2");
            setSize(19);
            setUserPosition([0, 0]);
            setStatus("playing");
            setGameId(gameId + 1);
            setUserPath(new Set());
            startTimer();
          }}
          className="w-['200px'] h-['20px] bg-slate-200 p-3 hover:bg-slate-300"
        >
          Maze 2
        </button>
        <button
          onClick={() => {
            setMazeType("Maze 3");
            setSize(20);
            setUserPosition([0, 0]);
            setStatus("playing");
            setGameId(gameId + 1);
            setUserPath(new Set());
            startTimer();
          }}
          className="w-['200px'] h-['20px] bg-slate-200 p-3 hover:bg-slate-300"
        >
          Maze 3
        </button>
        <button
          onClick={() => {
            setMazeType("Maze 4");
            setSize(32);
            setUserPosition([0, 0]);
            setStatus("playing");
            setGameId(gameId + 1);
            setUserPath(new Set());
            startTimer();
          }}
          className="w-['200px'] h-['20px] bg-slate-200 p-3 hover:bg-slate-300"
        >
          Maze 4
        </button>
      </div>

      <div className="timer">Time: {formatTime(currentTime)}</div>

      <p>use WSAD or Arrow Keys to move</p>

      {mazeType === "Maze 1" ? (
        <table className="mt-[15px] border-collapse">
          <tbody>
            {maze.map((row, i) => (
              <tr key={`row-${i}`}>
                {row.map((cell, j) => (
                  <td
                    key={`cell-${i}-${j}`}
                    className={`h-[20px] w-[20px] ${makeClassName(i, j)}`}
                  >
                    <div />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {mazeType === "Maze 2" ? (
        <table className="mt-[15px] border-collapse">
          <tbody>
            {maze.map((row, i) => (
              <tr key={`row-${i}`}>
                {row.map((cell, j) => (
                  <td
                    key={`cell-${i}-${j}`}
                    className={`h-[20px] w-[20px] ${makeClassName(i, j)}`}
                  >
                    <div />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {/* {mazeType === "Maze 3" ? (
        <table className="mt-[15px] border-collapse">
          <tbody>
            {maze.map((row, i) => (
              <tr key={`row-${i}`}>
                {row.map((cell, j) => (
                  <td
                    key={`cell-${i}-${j}`}
                    className={`h-[20px] w-[20px] ${makeClassName(i, j)}`}
                  >
                    <div />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null} */}

      {mazeType === "Maze 3" ? <CircularMaze /> : null}

      {mazeType === "Maze 4" ? (
        <table className="mt-[15px] border-collapse">
          <tbody>
            {maze.map((row, i) => (
              <tr key={`row-${i}`}>
                {row.map((cell, j) => (
                  <td
                    key={`cell-${i}-${j}`}
                    className={`h-[20px] w-[20px] ${makeClassName(i, j)}`}
                  >
                    <div />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      ) : null}

      {status !== "playing" && (
        <div className="info">
          <p>Your scored: {score}</p>
        </div>
      )}
    </div>
  );
}
