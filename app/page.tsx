"use client";

import React, { useEffect, useRef, useState } from "react";
import { useWindowSize } from "react-use";
import confetti from "canvas-confetti";

const ROCKET_WIDTH = 50;
const ROCKET_HEIGHT = 80;
const SCROLL_SPEED = 2;
const GAME_OVER_DELAY = 200;

export default function JumperGame() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [gameStarted, setGameStarted] = useState(false);
  const [gameOver, setGameOver] = useState(false);
  const [score, setScore] = useState(0);
  const [highScore, setHighScore] = useState(0);
  const rocketPositionRef = useRef(0);
  const lastScrollTimeRef = useRef(0);
  const animationFrameRef = useRef(0);
  const { width, height } = useWindowSize();

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rocket = new Image();
    rocket.src =
      "https://hebbkx1anhila5yf.public.blob.vercel-storage.com/image-6L6MToIx8nXAZ0mYKsYdls64NMq2wE.png";

    const drawRocket = () => {
      if (!ctx) return;
      ctx.drawImage(
        rocket,
        width / 2 - ROCKET_WIDTH / 2,
        height - ROCKET_HEIGHT - rocketPositionRef.current,
        ROCKET_WIDTH,
        ROCKET_HEIGHT
      );
    };

    const drawBackground = () => {
      if (!ctx) return;
      ctx.fillStyle = "#87CEEB"; // Sky blue
      ctx.fillRect(0, 0, width, height);

      // Draw some simple clouds
      ctx.fillStyle = "white";
      for (let i = 0; i < 5; i++) {
        const x = Math.random() * width;
        const y = Math.random() * height;
        const size = Math.random() * 50 + 20;

        // Draw multiple overlapping circles to form a cloud
        ctx.beginPath();
        ctx.arc(x, y, size, 0, Math.PI * 2);
        ctx.arc(x + size * 0.6, y, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x - size * 0.6, y, size * 0.8, 0, Math.PI * 2);
        ctx.arc(x + size * 0.3, y - size * 0.5, size * 0.7, 0, Math.PI * 2);
        ctx.arc(x - size * 0.3, y - size * 0.5, size * 0.7, 0, Math.PI * 2);
        ctx.fill();
      }
    };

    const gameLoop = () => {
      if (!ctx) return;

      ctx.clearRect(0, 0, width, height);
      drawBackground();
      drawRocket();

      if (gameStarted && !gameOver) {
        const currentTime = Date.now();
        if (currentTime - lastScrollTimeRef.current > GAME_OVER_DELAY) {
          endGame();
        } else {
          // Only increment score every 5 frames to slow it down
          setScore((prevScore) => {
            const newScore = prevScore + 0.2;
            // Update high score if the new score is higher
            if (newScore > highScore) {
              setHighScore(Math.floor(newScore));
            }
            return newScore;
          });
          animationFrameRef.current = requestAnimationFrame(gameLoop);
        }
      }
    };

    const endGame = () => {
      setGameOver(true);
      cancelAnimationFrame(animationFrameRef.current);
    };

    gameLoop();

    return () => {
      cancelAnimationFrame(animationFrameRef.current);
    };
  }, [width, height, gameStarted, gameOver, highScore]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      rocketPositionRef.current = 0;
    }

    if (gameOver) return;

    rocketPositionRef.current += SCROLL_SPEED;
    lastScrollTimeRef.current = Date.now();
  };

  const isMobile = /iPhone|iPad|Android/i.test(navigator.userAgent);

  const handleButtonClick = () => {
    if (!gameStarted) {
      setGameStarted(true);
      setGameOver(false);
      setScore(0);
      rocketPositionRef.current = 0;
    }

    if (gameOver) return;

    rocketPositionRef.current += SCROLL_SPEED;
    lastScrollTimeRef.current = Date.now();
  };

  useEffect(() => {
    if (gameOver && Math.floor(score) === highScore) {
      confetti({
        particleCount: 100,
        spread: 70,
        origin: { y: 0.6 },
      });
    }
  }, [gameOver, score, highScore]);

  return (
    <div
      className="relative w-full h-screen overflow-hidden"
      onWheel={handleWheel}
    >
      <canvas ref={canvasRef} className="absolute inset-0" />
      {!gameStarted && (
        <div className="absolute inset-0 flex items-center justify-center">
          {isMobile ? (
            <h1 className="text-4xl font-bold text-black bg-black bg-opacity-25 rounded-lg p-4 text-center">
              Tap the button to start flying!
            </h1>
          ) : (
            <h1 className="text-4xl font-bold text-black bg-black bg-opacity-25 rounded-lg p-4 text-center">
              Scroll to start flying!
            </h1>
          )}
        </div>
      )}
      {gameOver && (
        <div className="absolute inset-0 flex flex-col items-center justify-center bg-black bg-opacity-50">
          <h2 className="text-4xl font-bold text-black rounded-lg p-4 mb-4">
            Game Over!
          </h2>
          <p className="text-2xl text-black rounded-lg p-4 mb-2">
            Score: {Math.floor(score)}
          </p>
          <p className="text-2xl text-black rounded-lg p-4 mb-4">
            High Score: {highScore}
          </p>
          {Math.floor(score) === highScore && (
            <div className="text-3xl font-bold text-white bg-black bg-opacity-25 rounded-lg p-4 mb-4 text-center">
              <p>🎉🎉🎉🎉</p>
              You have a new high score!
              <p>🎉🎉🎉🎉</p>
            </div>
          )}
          <button
            className="px-4 py-2 text-lg font-semibold text-black bg-blue-500 rounded hover:bg-blue-600"
            onClick={() => {
              setGameStarted(false);
              setGameOver(false);
            }}
          >
            Play Again
          </button>
        </div>
      )}
      <div className="absolute top-4 left-4 text-xl font-semibold text-black bg-black bg-opacity-15 rounded-lg p-2">
        Score: {Math.floor(score)}
      </div>
      <div className="absolute top-4 right-4 text-xl font-semibold text-black bg-black bg-opacity-15 rounded-lg p-2">
        High Score: {highScore}
      </div>
      {isMobile && (
        <button
          className="absolute bottom-4 right-4 p-4 bg-black bg-opacity-15 text-black rounded-lg shadow-lg"
          onClick={handleButtonClick}
        >
          ↑
        </button>
      )}
    </div>
  );
}
