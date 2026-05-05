import React, { useState, useEffect, useRef } from "react";
import { Analytics } from '@vercel/analytics/react';

/* ================= CONFIG ================= */
const W = window.innerWidth;
const H = window.innerHeight;

const DAMAGE = 20;

/* ================= IMAGENS (ONLINE) ================= */
const MAP =
  "https://images.unsplash.com/photo-1500530855697-b586d89ba3ee"; // mapa

const ENEMY =
  "https://cdn-icons-png.flaticon.com/512/9131/9131529.png";

const CROSSHAIR =
  "https://cdn-icons-png.flaticon.com/512/545/545705.png";

const WEAPON =
  "https://cdn-icons-png.flaticon.com/512/1046/1046784.png";

/* ================= APP ================= */
export default function REDPL_STRIKE() {
  const [screen, setScreen] = useState("splash");
  const [score, setScore] = useState(0);
  const [shots, setShots] = useState(0);
  const [hits, setHits] = useState(0);
  const [flash, setFlash] = useState(false);

  const enemies = useRef([]);
  const vel = useRef([]);
  const aim = useRef({ x: W / 2, y: H / 2 });
  const drag = useRef(false);

  /* ================= SPLASH ================= */
  useEffect(() => {
    setTimeout(() => setScreen("menu"), 2000);
  }, []);

  /* ================= ENEMIES ================= */
  const spawnEnemies = () => {
    let e = [],
      v = [];

    for (let i = 0; i < 6; i++) {
      e.push({ x: Math.random() * W, y: Math.random() * H, hp: 100 });
      v.push({ x: (Math.random() - 0.5) * 2, y: (Math.random() - 0.5) * 2 });
    }

    enemies.current = e;
    vel.current = v;
  };

  const startGame = () => {
    spawnEnemies();
    setScore(0);
    setShots(0);
    setHits(0);
    setScreen("game");
  };

  /* ================= LOOP ================= */
  useEffect(() => {
    if (screen !== "game") return;

    let frame;

    const loop = () => {
      const e = enemies.current;
      const v = vel.current;

      for (let i = 0; i < e.length; i++) {
        let nx = e[i].x + v[i].x;
        let ny = e[i].y + v[i].y;

        if (nx < 0 || nx > W) v[i].x *= -1;
        if (ny < 0 || ny > H) v[i].y *= -1;

        e[i].x = nx;
        e[i].y = ny;
      }

      enemies.current = e;
      frame = requestAnimationFrame(loop);
    };

    frame = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(frame);
  }, [screen]);

  /* ================= SHOOT ================= */
  const shoot = () => {
    setShots((s) => s + 1);

    setFlash(true);
    setTimeout(() => setFlash(false), 50);

    const ax = aim.current.x;
    const ay = aim.current.y;

    enemies.current = enemies.current.map((e) => {
      const d = Math.hypot(ax - e.x, ay - e.y);

      if (d < 70) {
        setHits((h) => h + 1);

        let hp = e.hp - DAMAGE;

        if (hp <= 0) {
          setScore((s) => s + 1);
          return { x: Math.random() * W, y: Math.random() * H, hp: 100 };
        }

        return { ...e, hp };
      }

      return e;
    });
  };

  const acc = shots ? Math.round((hits / shots) * 100) : 0;

  /* ================= SPLASH ================= */
  if (screen === "splash") {
    return (
      <>
        <div style={styles.center}>
          <h1>REDPL STRIKE</h1>
          <p>Loading...</p>
        </div>
        <Analytics />
      </>
    );
  }

  /* ================= MENU ================= */
  if (screen === "menu") {
    return (
      <>
        <div style={styles.menu}>
          <h1>REDPL STRIKE</h1>
          <button style={styles.btn} onClick={startGame}>
            PLAY
          </button>
        </div>
        <Analytics />
      </>
    );
  }

  /* ================= GAME ================= */
  return (
    <>
      <div
        style={{
          ...styles.game,
          backgroundImage: `url(${MAP})`,
        }}
        onMouseDown={() => (drag.current = true)}
        onMouseUp={() => (drag.current = false)}
        onMouseMove={(e) => {
          if (!drag.current) return;
          aim.current = { x: e.clientX, y: e.clientY };
        }}
        onTouchMove={(e) => {
          const t = e.touches[0];
          aim.current = { x: t.clientX, y: t.clientY };
        }}
      >
        {/* FLASH */}
        {flash && <div style={styles.flash} />}

        {/* HUD */}
        <div style={styles.hud}>
          <p>🎯 {score}</p>
          <p>⚡ {acc}%</p>
        </div>

        {/* ENEMIES */}
        {enemies.current.map((e, i) => (
          <img
            key={i}
            src={ENEMY}
            style={{
              position: "absolute",
              left: e.x,
              top: e.y,
              width: 60,
              filter: "drop-shadow(0 0 6px red)",
            }}
            alt="Enemy"
          />
        ))}

        {/* CROSSHAIR */}
        <img
          src={CROSSHAIR}
          style={{
            position: "absolute",
            left: aim.current.x - 20,
            top: aim.current.y - 20,
            width: 40,
            pointerEvents: "none",
          }}
          alt="Crosshair"
        />

        {/* WEAPON */}
        <img
          src={WEAPON}
          style={{
            position: "absolute",
            bottom: 10,
            left: 10,
            width: 120,
          }}
          alt="Weapon"
        />

        {/* FIRE */}
        <button style={styles.fire} onClick={shoot}>
          FIRE
        </button>
      </div>
      <Analytics />
    </>
  );
}

/* ================= STYLES ================= */
const styles = {
  center: {
    width: "100vw",
    height: "100vh",
    background: "black",
    color: "white",
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  },
  menu: {
    width: "100vw",
    height: "100vh",
    background: "black",
    color: "white",
    display: "flex",
    flexDirection: "column",
    justifyContent: "center",
    alignItems: "center",
  },
  game: {
    width: "100vw",
    height: "100vh",
    backgroundSize: "cover",
    overflow: "hidden",
    touchAction: "none",
  },
  hud: {
    position: "absolute",
    top: 10,
    left: 10,
    color: "white",
    background: "rgba(0,0,0,0.5)",
    padding: 10,
    borderRadius: 10,
  },
  btn: {
    padding: 15,
    background: "red",
    color: "white",
    border: "none",
    marginTop: 20,
  },
  fire: {
    position: "absolute",
    bottom: 30,
    right: 30,
    width: 90,
    height: 90,
    borderRadius: "50%",
    background: "red",
    color: "white",
  },
  flash: {
    position: "absolute",
    width: "100%",
    height: "100%",
    background: "rgba(255,255,255,0.1)",
  },
};
