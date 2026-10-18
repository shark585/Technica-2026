"use client";

import { useEffect, useState, type ReactNode } from "react";
import data from "./database.json";
import { Art, creatureCss } from "./creatures";

// "Did you figure it out?" box on the results screen. Edit these three.
const FIGURE_TEXT = "Although it may seem that things are regressing in the world today, the truth is that our awareness has been the primary thing that increased. Just because we are more aware of events doesn't mean that more of them are happening. Actually, most things are getting better. So at the end of the day, be optimistic and understand that awareness is the key to a better world. Huge thanks to Gapminder for the data and inspiration. You can learn more by clicking the link below.";
const FIGURE_LINK_URL = "https://www.youtube.com/watch?v=Sm5xF-UYgdg"; // e.g. "https://www.gapminder.org"
const FIGURE_LINK_LABEL = "Learn more"; // the clickable text

type Row = {
  language: string;
  short_title: string;
  published_version_of_question: string;
  human_wrong_percentage: number;
  option_a: string;
  option_a_correctness: number;
  option_b: string;
  option_b_correctness: number;
  option_c: string;
  option_c_correctness: number;
};

type Option = { text: string; correct: boolean };
type Quiz = {
  title: string;
  text: string;
  wrongPct: number;
  options: Option[];
  rivalPick: number; // index of the option the rival guesses
};

type Mode = "normal" | "daily";
type Save = {
  best: number; // deepest level ever reached
  played: number;
  discovered: string[]; // creature art keys
  daily: { date: string; score: number } | null;
};

const COUNT = 10;
const DEPTH_PER = 20; // meters gained per correct answer
const SKY_VH = 35; // how much of the first screen is sky
const RIVAL_NAME = "Sterling"; // change the rival's name here

// Put an image in public/creatures/ (transparent PNG works best) and set its path here.
// Leave it undefined to use the drawn starfish.
const RIVAL_IMG: string | undefined = undefined; // e.g. "/creatures/rival.png"

function RivalArt() {
  return RIVAL_IMG ? (
    <img src={RIVAL_IMG} alt={RIVAL_NAME} style={{ width: "100%", height: "auto", display: "block" }} />
  ) : (
    <Art name="starfish" />
  );
}

// ---------- Progress: zones, ranks, saving ----------

// Game zones (not real ocean depths): `min` is the level where the zone starts.
const ZONES = [
  { min: 0, name: "Sunlight Zone", blurb: "Warm, bright and full of life." },
  { min: 3, name: "Twilight Zone", blurb: "The light is fading fast." },
  { min: 6, name: "Midnight Zone", blurb: "No sunlight reaches this far." },
  { min: 9, name: "The Abyss", blurb: "Crushing dark. Few have been here." },
];
const zoneFor = (level: number) => [...ZONES].reverse().find((z) => level >= z.min)!;

const RANKS = [
  { min: 0, title: "Beach Wader", icon: "🏖️" },
  { min: 1, title: "Snorkeler", icon: "🤿" },
  { min: 3, title: "Scuba Diver", icon: "🐠" },
  { min: 5, title: "Deep Diver", icon: "🦈" },
  { min: 7, title: "Abyss Explorer", icon: "🦑" },
  { min: 10, title: "Master of the Deep", icon: "👑" },
];
const rankFor = (level: number) => [...RANKS].reverse().find((r) => level >= r.min)!;

const STORAGE_KEY = "ocean-quiz-save-v1";
const EMPTY_SAVE: Save = { best: 0, played: 0, discovered: [], daily: null };

function loadSave(): Save {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return EMPTY_SAVE;
    const p = JSON.parse(raw);
    return {
      best: Number(p.best) || 0,
      played: Number(p.played) || 0,
      discovered: Array.isArray(p.discovered)
        ? p.discovered.filter((x: unknown) => typeof x === "string")
        : [],
      daily:
        p.daily && typeof p.daily.date === "string"
          ? { date: p.daily.date, score: Number(p.daily.score) || 0 }
          : null,
    };
  } catch {
    return EMPTY_SAVE;
  }
}

function writeSave(s: Save) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch {
    /* storage unavailable (private mode, quota): the game still works, it just won't remember */
  }
}

// Small seeded random generator so the daily dive is identical for everyone on a given date.
function seededRng(seed: string): () => number {
  let h = 1779033703 ^ seed.length;
  for (let i = 0; i < seed.length; i++) {
    h = Math.imul(h ^ seed.charCodeAt(i), 3432918353);
    h = (h << 13) | (h >>> 19);
  }
  let a = h >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

// ---------- Scene data ----------

// Creatures live inside the tall ocean. `level` is the depth screen they sit on,
// `top` is vh offset within that screen, `left` is horizontal position.
const CREATURES: {
  art: string; e: string; name: string; level: number;
  left: string; top: number; w: number; dur: number; img?: string;
}[] = [
  { art: "seagull", e: "🐦", name: "seagull", level: 0, left: "10%", top: 12, w: 90, dur: 7 },
  { art: "fish", e: "🐟", name: "silver fish", level: 1, left: "6%", top: 28, w: 90, dur: 6 },
  { art: "clownfish", e: "🐠", name: "clownfish", level: 1, left: "86%", top: 62, w: 80, dur: 8 },
  { art: "turtle", e: "🐢", name: "sea turtle", level: 2, left: "80%", top: 30, w: 130, dur: 10 },
  { art: "dolphin", e: "🐬", name: "dolphin", level: 3, left: "4%", top: 55, w: 160, dur: 7 },
  { art: "shark", e: "🦈", name: "shark", level: 4, left: "76%", top: 40, w: 200, dur: 9 },
  { art: "octopus", e: "🐙", name: "octopus", level: 5, left: "6%", top: 55, w: 100, dur: 8 },
  { art: "squid", e: "🦑", name: "squid", level: 6, left: "76%", top: 35, w: 140, dur: 9 },
  { art: "jellyfish", e: "🪼", name: "jellyfish", level: 7, left: "8%", top: 28, w: 80, dur: 6 },
  { art: "pufferfish", e: "🐡", name: "pufferfish", level: 8, left: "82%", top: 55, w: 100, dur: 7 },
  { art: "whale", e: "🐋", name: "humpback whale", level: 9, left: "2%", top: 45, w: 280, dur: 12 },
  { art: "seadragon", e: "🐉", name: "leafy sea dragon", level: 10, left: "74%", top: 38, w: 130, dur: 11 },
];

// Smooth darkness: interpolate between color stops and emit many gradient stops.
const COLOR_STOPS: [number, string][] = [
  [0, "#48cae4"],
  [0.08, "#0096c7"],
  [0.2, "#0077b6"],
  [0.4, "#023e8a"],
  [0.65, "#03045e"],
  [0.85, "#010a2e"],
  [1, "#000814"],
];

function hexToRgb(hex: string): [number, number, number] {
  const n = parseInt(hex.slice(1), 16);
  return [(n >> 16) & 255, (n >> 8) & 255, n & 255];
}

function colorAt(t: number): string {
  for (let i = 1; i < COLOR_STOPS.length; i++) {
    const [t1, c1] = COLOR_STOPS[i];
    const [t0, c0] = COLOR_STOPS[i - 1];
    if (t <= t1) {
      const f = (t - t0) / (t1 - t0);
      const a = hexToRgb(c0);
      const b = hexToRgb(c1);
      const mix = a.map((v, k) => Math.round(v + (b[k] - v) * f));
      return `rgb(${mix[0]}, ${mix[1]}, ${mix[2]})`;
    }
  }
  return COLOR_STOPS[COLOR_STOPS.length - 1][1];
}

const WATER_GRADIENT = `linear-gradient(180deg, ${Array.from({ length: 41 }, (_, i) => {
  const t = i / 40;
  return `${colorAt(t)} ${(t * 100).toFixed(1)}%`;
}).join(", ")})`;

const SURFACE_COLOR = colorAt(0); // front wave matches the top of the water exactly

// Builds a repeating wave outline. `half` = half-wavelength, `n` = number of segments.
const wavePath = (amp: number, half: number, n: number) => {
  let d = `M0 30 Q${half / 2} ${30 - amp} ${half} 30`;
  for (let k = 2; k <= n; k++) d += ` T${half * k} 30`;
  return d;
};

// Light shafts from the surface (left, width in vw, tilt in degrees)
const RAYS = [
  { left: "6%", w: 14, rot: 14, delay: 0, dur: 7 },
  { left: "20%", w: 22, rot: 10, delay: 2, dur: 9 },
  { left: "36%", w: 12, rot: 16, delay: 4, dur: 8 },
  { left: "50%", w: 26, rot: 8, delay: 1, dur: 10 },
  { left: "66%", w: 16, rot: 13, delay: 3, dur: 7.5 },
  { left: "80%", w: 20, rot: 9, delay: 5, dur: 9.5 },
  { left: "92%", w: 12, rot: 15, delay: 2.5, dur: 8.5 },
];

// Floating particles ("marine snow"), deterministic so server and client match
const SNOW = Array.from({ length: 28 }, (_, i) => ({
  left: `${(i * 37) % 100}%`,
  size: 2 + (i % 3),
  dur: 16 + ((i * 7) % 15),
  delay: -((i * 5) % 20),
}));

const CLOUDS = [
  { top: 7, left: "10%", scale: 1, dur: 60 },
  { top: 15, left: "46%", scale: 0.7, dur: 80 },
  { top: 4, left: "68%", scale: 1.2, dur: 70 },
];

const BUBBLES = [
  { left: "8%", size: 10, dur: 9, delay: 0 },
  { left: "18%", size: 16, dur: 12, delay: 3 },
  { left: "30%", size: 8, dur: 8, delay: 6 },
  { left: "44%", size: 14, dur: 11, delay: 1 },
  { left: "58%", size: 10, dur: 10, delay: 5 },
  { left: "70%", size: 18, dur: 13, delay: 2 },
  { left: "82%", size: 9, dur: 9, delay: 7 },
  { left: "92%", size: 13, dur: 12, delay: 4 },
];

const css = `
  .opt {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    padding: 14px 16px;
    text-align: left;
    font-size: 16px;
    color: #03045e;
    background: #e0f7fa;
    border: 2px solid #90e0ef;
    border-radius: 12px;
    cursor: pointer;
    transition: transform 0.15s, background 0.15s;
  }
  .opt:hover:not(:disabled) { transform: translateY(-2px); background: #ade8f4; }
  .opt:disabled { cursor: default; }
  .tag {
    flex-shrink: 0;
    padding: 2px 10px;
    font-size: 12px;
    font-weight: 600;
    color: #fff;
    background: #03045e;
    border-radius: 999px;
    white-space: nowrap;
  }
  .btn {
    padding: 12px 20px;
    font-size: 16px;
    font-weight: 600;
    color: #fff;
    background: #0077b6;
    border: none;
    border-radius: 999px;
    cursor: pointer;
    transition: background 0.15s;
  }
  .btn:hover:not(:disabled) { background: #023e8a; }
  .btn:disabled { opacity: 0.5; cursor: default; }
  .btn-ghost {
    color: #0077b6;
    background: transparent;
    border: 2px solid #0077b6;
  }
  .btn-ghost:hover:not(:disabled) { color: #fff; background: #0077b6; }
  .rules {
    margin: 16px 0 24px;
    padding-left: 22px;
    line-height: 1.7;
    text-align: left;
  }
  .thumb { width: 100%; height: 64px; display: flex; align-items: center; justify-content: center; }
  .thumb svg { width: 100%; height: 100%; }
  .thumb.locked { filter: brightness(0); opacity: 0.22; }
  @keyframes bob {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
  }
  .wave { display: inline-block; animation: bob 2s ease-in-out infinite; }
  @keyframes rise {
    from { transform: translateY(0); }
    to { transform: translateY(-115vh); }
  }
  .bubble {
    position: absolute;
    bottom: -30px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.55);
    background: rgba(255, 255, 255, 0.12);
    animation: rise linear infinite;
  }
  @keyframes swim {
    from { transform: translateX(0) translateY(0); }
    to { transform: translateX(36px) translateY(-10px); }
  }
  .creature {
    position: absolute;
    line-height: 1;
    animation: swim ease-in-out infinite alternate;
  }
  @keyframes wave-scroll { from { transform: translateX(0); } to { transform: translateX(-50%); } }
  .wave-layer { position: absolute; left: 0; height: 100%; width: 200%; animation: wave-scroll linear infinite; }
  @keyframes cloud-drift { from { transform: translateX(-40px); } to { transform: translateX(40px); } }
  .cloud {
    width: 90px; height: 26px; background: #fff; border-radius: 50px; filter: blur(5px); opacity: 0.85;
    box-shadow: 40px -10px 0 6px #fff, 85px 2px 0 -2px #fff, -30px 4px 0 -4px #fff;
    animation: cloud-drift ease-in-out infinite alternate;
  }
  @keyframes ray-pulse { from { opacity: 0.2; } to { opacity: 0.75; } }
  .ray {
    position: absolute; transform-origin: 50% 0;
    background: linear-gradient(180deg, rgba(255, 255, 255, 0.4), rgba(255, 255, 255, 0));
    clip-path: polygon(38% 0, 62% 0, 100% 100%, 0 100%);
    filter: blur(5px);
    animation: ray-pulse ease-in-out infinite alternate;
  }
  @keyframes snow-fall { from { transform: translateY(-4vh); } to { transform: translateY(104vh); } }
  .snow { position: absolute; top: 0; border-radius: 50%; background: rgba(220, 240, 255, 0.75); animation: snow-fall linear infinite; }
  @keyframes zone-banner {
    0% { opacity: 0; transform: translateY(-10px); }
    15%, 80% { opacity: 1; transform: translateY(0); }
    100% { opacity: 0; transform: translateY(0); }
  }
  .zone-banner {
    position: fixed; top: 64px; left: 0; right: 0; z-index: 4; text-align: center;
    pointer-events: none; animation: zone-banner 3.6s ease both;
  }
  ${creatureCss}
`;

function Wave({
  half, segs, amp, fill, dur, dy = 0, crest = false,
}: {
  half: number; segs: number; amp: number; fill: string; dur: number; dy?: number; crest?: boolean;
}) {
  const d = wavePath(amp, half, segs);
  return (
    <div className="wave-layer" style={{ animationDuration: `${dur}s`, top: dy }}>
      <svg viewBox="0 0 1200 60" preserveAspectRatio="none" width="100%" height="100%" style={{ display: "block" }}>
        <path d={`${d} L1200 60 L0 60 Z`} fill={fill} />
        {crest && (
          <path d={d} fill="none" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" vectorEffect="non-scaling-stroke" />
        )}
      </svg>
    </div>
  );
}

function Shell({
  children,
  depth,
  rivalDepth = 0,
}: {
  children: ReactNode;
  depth: number;
  rivalDepth?: number;
}) {
  const waterTop = `calc(${SKY_VH}vh + 30px)`;
  const zone = zoneFor(depth);
  return (
    <div
      style={{
        position: "relative",
        minHeight: "100vh",
        overflow: "hidden",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        fontFamily: "system-ui, sans-serif",
      }}
    >
      <style>{css}</style>

      {/* One tall ocean that slides up as you descend */}
      <div
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: `${(COUNT + 1) * 100}vh`,
          transform: `translateY(-${depth * 100}vh)`,
          transition: "transform 1.6s ease-in-out",
          zIndex: 0,
        }}
      >
        {/* Sky with a hazy horizon */}
        <div
          style={{
            position: "absolute",
            top: 0,
            left: 0,
            right: 0,
            height: waterTop,
            background: "linear-gradient(180deg, #4a9fd1 0%, #8cc8e6 55%, #d6eef5 100%)",
          }}
        >
          <div
            style={{
              position: "absolute",
              top: -60,
              right: "8%",
              width: 300,
              height: 300,
              borderRadius: "50%",
              background:
                "radial-gradient(circle, rgba(255,250,215,0.95) 0%, rgba(255,244,180,0.55) 18%, rgba(255,236,160,0.18) 42%, transparent 68%)",
            }}
          />
          {CLOUDS.map((c, i) => (
            <span
              key={i}
              style={{ position: "absolute", top: `${c.top}vh`, left: c.left, transform: `scale(${c.scale})` }}
            >
              <div className="cloud" style={{ animationDuration: `${c.dur}s` }} />
            </span>
          ))}
        </div>

        {/* Water: smooth gradient from shallow to abyss */}
        <div
          style={{
            position: "absolute",
            top: waterTop,
            left: 0,
            right: 0,
            bottom: 0,
            background: WATER_GRADIENT,
          }}
        />

        {/* Rolling waves at the surface */}
        <div
          style={{
            position: "absolute",
            top: `calc(${SKY_VH}vh - 30px)`,
            left: 0,
            right: 0,
            height: 60,
            overflow: "hidden",
          }}
        >
          <Wave half={100} segs={12} amp={28} fill="#2b9ec4" dur={26} dy={-6} />
          <Wave half={75} segs={16} amp={20} fill={SURFACE_COLOR} dur={16} crest />
        </div>

        {/* Light shafts from the surface */}
        {RAYS.map((r, i) => (
          <div
            key={i}
            className="ray"
            style={{
              top: waterTop,
              left: r.left,
              width: `${r.w}vw`,
              height: "130vh",
              transform: `rotate(${r.rot}deg)`,
              animationDuration: `${r.dur}s`,
              animationDelay: `${-r.delay}s`,
            }}
          />
        ))}

        {/* Sea creatures at their depths */}
        {CREATURES.map((c, i) => {
          const flip = parseFloat(c.left) > 50; // right-side creatures face left
          return (
            <span
              key={i}
              className="creature"
              style={{
                left: c.left,
                top: `${c.level * 100 + c.top}vh`,
                width: `min(${c.w}px, 30vw)`,
                animationDuration: `${c.dur}s`,
                filter:
                  c.level >= 6
                    ? "drop-shadow(0 0 14px rgba(120, 220, 255, 0.75))"
                    : "drop-shadow(0 4px 6px rgba(0, 0, 0, 0.25))",
              }}
            >
              <span style={{ display: "block", transform: flip ? "scaleX(-1)" : undefined }}>
                {c.img ? (
                  <img src={c.img} alt={c.name} style={{ width: "100%", height: "auto", display: "block" }} />
                ) : (
                  <Art name={c.art} />
                )}
              </span>
            </span>
          );
        })}

        {/* The rival, at his own depth */}
        <span
          className="creature"
          style={{
            left: "24%",
            top: `${rivalDepth * 100 + 55}vh`,
            width: "min(72px, 16vw)",
            transition: "top 1.6s ease-in-out",
            animationDuration: "5s",
            filter: "drop-shadow(0 0 10px rgba(255, 190, 170, 0.6))",
          }}
        >
          <RivalArt />
        </span>
      </div>

      {/* Floating particles: denser the deeper you go */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          overflow: "hidden",
          pointerEvents: "none",
          zIndex: 1,
          opacity: Math.min(1, depth / 3),
          transition: "opacity 1.6s",
        }}
      >
        {SNOW.map((s, i) => (
          <span
            key={i}
            className="snow"
            style={{
              left: s.left,
              width: s.size,
              height: s.size,
              animationDuration: `${s.dur}s`,
              animationDelay: `${s.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Bubbles */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          opacity: depth > 0 ? 1 : 0,
          transition: "opacity 1.2s",
        }}
      >
        {BUBBLES.map((b, i) => (
          <span
            key={i}
            className="bubble"
            style={{
              left: b.left,
              width: b.size,
              height: b.size,
              animationDuration: `${b.dur}s`,
              animationDelay: `${b.delay}s`,
            }}
          />
        ))}
      </div>

      {/* Vignette: edges darken as you descend */}
      <div
        style={{
          position: "fixed",
          inset: 0,
          pointerEvents: "none",
          zIndex: 1,
          background: "radial-gradient(ellipse at center, transparent 35%, rgba(0, 5, 20, 0.85) 100%)",
          opacity: depth === 0 ? 0 : 0.2 + (depth / COUNT) * 0.6,
          transition: "opacity 1.6s",
        }}
      />

      {/* Zone banner: the key restarts the animation each time you enter a new zone */}
      {depth > 0 && (
        <div key={zone.name} className="zone-banner" style={{ animationDelay: "1.2s" }}>
          <span
            style={{
              display: "inline-block",
              padding: "8px 22px",
              color: "#fff",
              fontWeight: 700,
              letterSpacing: "0.05em",
              background: "rgba(3, 4, 94, 0.7)",
              borderRadius: 999,
            }}
          >
            {zone.name}
          </span>
          <div
            style={{
              marginTop: 6,
              fontSize: 13,
              color: "#fff",
              textShadow: "0 1px 4px rgba(0, 0, 0, 0.7)",
            }}
          >
            {zone.blurb}
          </div>
        </div>
      )}

      {/* Depth meter */}
      <div
        style={{
          position: "fixed",
          top: 16,
          right: 16,
          zIndex: 3,
          padding: "8px 14px",
          color: "#fff",
          fontWeight: 600,
          background: "rgba(3, 4, 94, 0.65)",
          borderRadius: 999,
        }}
      >
        {depth === 0 ? "Surface" : `${depth * DEPTH_PER} m · ${zone.name.replace(" Zone", "")}`}
      </div>

      <main
        style={{
          position: "relative",
          zIndex: 2,
          width: "100%",
          maxWidth: 600,
          padding: 28,
          color: "#03045e",
          background: "rgba(255, 255, 255, 0.92)",
          borderRadius: 20,
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.3)",
        }}
      >
        {children}
      </main>

      {/* Caption */}
      <div
        style={{
          position: "fixed",
          bottom: 10,
          left: 0,
          right: 0,
          zIndex: 3,
          textAlign: "center",
          fontSize: 13,
          letterSpacing: "0.04em",
          color: "rgba(255, 255, 255, 0.85)",
          textShadow: "0 1px 4px rgba(0, 0, 0, 0.6)",
          pointerEvents: "none",
        }}
      >
        Questions from 2023 Gapminder data
      </div>
    </div>
  );
}

function Scoreboard({ you, rival }: { you: number; rival: number }) {
  const row = (label: ReactNode, value: number, color: string) => (
    <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
      <div style={{ width: 96, fontWeight: 600, display: "flex", alignItems: "center", gap: 6 }}>
        {label}
      </div>
      <div style={{ flex: 1, height: 8, background: "#caf0f8", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            width: `${(value / COUNT) * 100}%`,
            height: "100%",
            background: color,
            transition: "width 0.6s",
          }}
        />
      </div>
      <div style={{ width: 56, textAlign: "right", fontSize: 14 }}>{value * DEPTH_PER} m</div>
    </div>
  );

  return (
    <div style={{ display: "grid", gap: 8 }}>
      {row(<span>🤿 You</span>, you, "linear-gradient(90deg, #00b4d8, #0077b6)")}
      {row(
        <>
          <span style={{ width: 22, display: "inline-block" }}>
            <RivalArt />
          </span>
          <span>{RIVAL_NAME}</span>
        </>,
        rival,
        "linear-gradient(90deg, #f6a08a, #d9573f)"
      )}
    </div>
  );
}

function shuffle<T>(array: T[], rng: () => number = Math.random): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toQuiz(row: Row, rng: () => number = Math.random): Quiz {
  const options: Option[] = [
    { text: row.option_a, correct: row.option_a_correctness === 1 },
    { text: row.option_b, correct: row.option_b_correctness === 1 },
    { text: row.option_c, correct: row.option_c_correctness === 1 },
  ].filter((o) => o.text);

  const shuffled = shuffle(options, rng);

  return {
    title: row.short_title,
    text: row.published_version_of_question,
    wrongPct: row.human_wrong_percentage,
    options: shuffled,
    rivalPick: Math.floor(rng() * shuffled.length), // pure guess
  };
}

export default function Page() {
  const [started, setStarted] = useState(false);
  const [view, setView] = useState<"play" | "guide">("play");
  const [mode, setMode] = useState<Mode>("normal");
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0); // your depth level
  const [rivalScore, setRivalScore] = useState(0); // the rival's depth level

  const [save, setSave] = useState<Save>(EMPTY_SAVE);
  const [loaded, setLoaded] = useState(false);
  const [today, setToday] = useState(""); // set on the client only, to avoid hydration mismatches
  const [newThisRun, setNewThisRun] = useState<string[]>([]);
  const [newBest, setNewBest] = useState(false);

  const start = (m: Mode = "normal") => {
    const rng = m === "daily" ? seededRng(`daily-${today}`) : Math.random;
    const rows = (data as unknown as Row[]).filter(
      (r) => r.language === "en-US" && r.published_version_of_question
    );
    setQuizzes(shuffle(rows, rng).slice(0, COUNT).map((r) => toQuiz(r, rng)));
    setMode(m);
    setIndex(0);
    setPicked(null);
    setScore(0);
    setRivalScore(0);
    setNewThisRun([]);
    setNewBest(false);
  };

  // On mount: read saved progress and today's date (browser only), and prepare a first round
  useEffect(() => {
    setSave(loadSave());
    setLoaded(true);
    setToday(new Date().toLocaleDateString("en-CA")); // YYYY-MM-DD in the player's local time
    start("normal");
  }, []);

  // Save whenever progress changes (only after the first load, so we never overwrite with empty data)
  useEffect(() => {
    if (loaded) writeSave(save);
  }, [save, loaded]);

  // Discover every creature at or above your current depth
  useEffect(() => {
    if (!started || !loaded) return;
    const fresh = CREATURES.filter(
      (c) => c.level <= score && !save.discovered.includes(c.art)
    ).map((c) => c.art);
    if (fresh.length === 0) return;
    setSave((s) => ({
      ...s,
      discovered: [...s.discovered, ...fresh.filter((a) => !s.discovered.includes(a))],
    }));
    setNewThisRun((n) => [...n, ...fresh.filter((a) => !n.includes(a))]);
  }, [started, loaded, score, save.discovered]);

  const finishRun = () => {
    setNewBest(score > save.best);
    setSave((s) => ({
      ...s,
      best: Math.max(s.best, score),
      played: s.played + 1,
      daily: mode === "daily" ? { date: today, score } : s.daily,
    }));
  };

  if (quizzes.length === 0) {
    return (
      <Shell depth={0}>
        <p>
          <span className="wave">🌊</span> Loading...
        </p>
      </Shell>
    );
  }

  const foundCount = CREATURES.filter((c) => save.discovered.includes(c.art)).length;
  const dailyDone = today !== "" && save.daily?.date === today;

  // Field guide
  if (view === "guide") {
    const bestRank = rankFor(save.best);
    return (
      <Shell depth={started ? score : 0} rivalDepth={started ? rivalScore : 0}>
        <h1 style={{ margin: 0 }}>📖 Field guide</h1>
        <p style={{ marginTop: 4, opacity: 0.75 }}>
          {foundCount} of {CREATURES.length} discovered. Dive to a creature&apos;s depth to add it.
        </p>

        <div
          style={{
            display: "flex",
            flexWrap: "wrap",
            gap: "6px 18px",
            margin: "12px 0 16px",
            fontSize: 14,
          }}
        >
          <span>
            <strong>Deepest dive:</strong> {save.best === 0 ? "none yet" : `${save.best * DEPTH_PER} m`}
          </span>
          <span>
            <strong>Dives:</strong> {save.played}
          </span>
          <span>
            <strong>Rank:</strong> {bestRank.icon} {bestRank.title}
          </span>
        </div>

        <div
          style={{
            display: "grid",
            gridTemplateColumns: "repeat(auto-fill, minmax(150px, 1fr))",
            gap: 10,
          }}
        >
          {CREATURES.map((c) => {
            const have = save.discovered.includes(c.art);
            return (
              <div
                key={c.art}
                style={{
                  textAlign: "center",
                  padding: 10,
                  borderRadius: 12,
                  background: have ? "#e0f7fa" : "#eef3f5",
                  border: `2px solid ${have ? "#90e0ef" : "#d5dfe3"}`,
                }}
              >
                <div className={`thumb${have ? "" : " locked"}`}>
                  <Art name={c.art} />
                </div>
                <div style={{ fontWeight: 600, fontSize: 14, marginTop: 6 }}>{have ? c.name : "???"}</div>
                <div style={{ fontSize: 12, opacity: 0.65 }}>
                  {c.level === 0 ? "Surface" : `${c.level * DEPTH_PER} m`}
                </div>
              </div>
            );
          })}
        </div>

        <div style={{ marginTop: 20, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          <button className="btn" onClick={() => setView("play")}>
            Back
          </button>
          <button
            className="btn btn-ghost"
            onClick={() => {
              if (window.confirm("Erase your deepest dive and your field guide?")) setSave(EMPTY_SAVE);
            }}
          >
            Reset progress
          </button>
        </div>
      </Shell>
    );
  }

  // Title screen
  if (!started) {
    const bestRank = rankFor(save.best);
    return (
      <Shell depth={0}>
        <div style={{ textAlign: "center" }}>
          <div style={{ display: "flex", justifyContent: "center", alignItems: "center", gap: 16 }}>
            <span className="wave" style={{ fontSize: 56 }}>
              🐋
            </span>
            <span style={{ fontSize: 22, fontWeight: 700, opacity: 0.6 }}>VS</span>
            <span className="wave" style={{ width: 64, display: "inline-block" }}>
              <RivalArt />
            </span>
          </div>
          <h1 style={{ margin: "8px 0 0", fontSize: 36 }}>Mindfulness Test</h1>
          <p style={{ opacity: 0.7, marginTop: 4 }}>
            How well do you know the world?
            Can you out-think a starfish who just guesses?
          </p>
          {save.played > 0 && (
            <p style={{ marginTop: 8, fontSize: 14 }}>
              {bestRank.icon} <strong>{bestRank.title}</strong> · Deepest dive {save.best * DEPTH_PER} m ·
              Field guide {foundCount}/{CREATURES.length}
            </p>
          )}
        </div>

        <h3 style={{ marginTop: 24, marginBottom: 0 }}>How to play</h3>
        <ol className="rules">
          <li>
            You and {RIVAL_NAME} the starfish race down from the surface through {COUNT} questions.
          </li>
          <li>Pick an answer. It locks in right away, and the correct one lights up green.</li>
          <li>Each correct answer sends you {DEPTH_PER} m deeper. A wrong one keeps you where you are.</li>
          <li>
            {RIVAL_NAME} doesn&apos;t know any of the answers. He guesses every question at random, so
            he only has a 1 in 3 chance each time.
          </li>
          <li>After each answer, you&apos;ll see what {RIVAL_NAME} picked and how many people usually get it wrong.</li>
          <li>
            The deeper you go, the darker it gets. Every creature you reach is saved to your field
            guide, and your deepest dive earns you a rank.
          </li>
          <li>The daily dive gives everyone the same questions once per day.</li>
        </ol>

        <div style={{ display: "grid", gap: 10, justifyItems: "center" }}>
          <button
            className="btn"
            style={{ fontSize: 18, padding: "14px 32px" }}
            onClick={() => {
              start("normal");
              setStarted(true);
            }}
          >
            Start the race
          </button>
          <div style={{ display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
            <button
              className="btn btn-ghost"
              disabled={!today || dailyDone}
              onClick={() => {
                start("daily");
                setStarted(true);
              }}
            >
              📅 Daily dive
            </button>
            <button className="btn btn-ghost" onClick={() => setView("guide")}>
              📖 Field guide ({foundCount}/{CREATURES.length})
            </button>
          </div>
          {dailyDone && save.daily && (
            <p style={{ margin: 0, fontSize: 14, opacity: 0.75 }}>
              Today&apos;s daily dive: {save.daily.score * DEPTH_PER} m. Come back tomorrow for a new one.
            </p>
          )}
        </div>
      </Shell>
    );
  }

  // Results screen
  if (index >= quizzes.length) {
    const won = score > rivalScore;
    const tied = score === rivalScore;
    const verdict = won
      ? `You're smarter than ${RIVAL_NAME}!`
      : tied
      ? `It's a tie with ${RIVAL_NAME}!`
      : `${RIVAL_NAME} beat you!`;
    const detail = won
      ? `You reached ${score * DEPTH_PER} m, and a guessing starfish only made it to ${rivalScore * DEPTH_PER} m.`
      : tied
      ? `Both of you reached ${score * DEPTH_PER} m. A starfish who guesses everything matched your brainpower.`
      : `${RIVAL_NAME} reached ${rivalScore * DEPTH_PER} m by pure guessing, while you got to ${score * DEPTH_PER} m. Rematch?`;

    const rank = rankFor(score);
    const newDiscoveries = CREATURES.filter((c) => newThisRun.includes(c.art));

    return (
      <Shell depth={score} rivalDepth={rivalScore}>
        <div style={{ textAlign: "center" }}>
          {mode === "daily" && <p style={{ margin: 0, opacity: 0.7 }}>📅 Daily dive complete</p>}
          <div style={{ fontSize: 56 }}>{won ? "🏆" : tied ? "🤝" : "🦐"}</div>
          <h1 style={{ margin: "8px 0" }}>{verdict}</h1>
          <p style={{ lineHeight: 1.5 }}>{detail}</p>
        </div>

        <div style={{ margin: "20px 0" }}>
          <Scoreboard you={score} rival={rivalScore} />
        </div>

        <div style={{ textAlign: "center", lineHeight: 1.6 }}>
          <p style={{ margin: 0, fontWeight: 600 }}>
            {rank.icon} Rank for this dive: {rank.title}
          </p>
          {newBest && (
            <p style={{ margin: "4px 0 0", fontWeight: 700, color: "#0a7a4f" }}>🎉 New personal best!</p>
          )}
          {newDiscoveries.length > 0 && (
            <p style={{ margin: "4px 0 0" }}>
              📖 New in your field guide: {newDiscoveries.map((c) => `${c.e} ${c.name}`).join(", ")}
            </p>
          )}
          <p style={{ margin: "8px 0 0", opacity: 0.75 }}>
            You got {score} of {quizzes.length} right. {RIVAL_NAME} got {rivalScore}.
          </p>
        </div>

        <div
          style={{
            marginTop: 20,
            padding: 16,
            color: "#03045e",
            background: "#e0f7fa",
            border: "2px solid #90e0ef",
            borderRadius: 14,
          }}
        >
          <h3 style={{ margin: "0 0 6px" }}>Did you figure it out?</h3>
          <p style={{ margin: 0, lineHeight: 1.5 }}>{FIGURE_TEXT}</p>
          {FIGURE_LINK_URL && (
            <p style={{ margin: "10px 0 0" }}>
              <a
                href={FIGURE_LINK_URL}
                target="_blank"
                rel="noopener noreferrer"
                style={{ color: "#0077b6", fontWeight: 600 }}
              >
                {FIGURE_LINK_LABEL} →
              </a>
            </p>
          )}
        </div>
         <div style={{ marginTop: 16, display: "flex", gap: 10, flexWrap: "wrap", justifyContent: "center" }}>
          {mode === "normal" && (
            <button className="btn" onClick={() => start("normal")}>
              Rematch
            </button>
          )}
          <button
            className="btn btn-ghost"
            onClick={() => {
              start("normal");
              setStarted(false);
            }}
          >
            Title screen
          </button>
          <button className="btn btn-ghost" onClick={() => setView("guide")}>
            📖 Field guide
          </button>
        </div>
      </Shell>
    );
  }

  const quiz = quizzes[index];
  const answered = picked !== null;
  const rivalOption = quiz.options[quiz.rivalPick];

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (quiz.options[i].correct) setScore((s) => s + 1); // correct = you descend
    if (rivalOption.correct) setRivalScore((s) => s + 1); // the rival's guess lands too
  };

  const next = () => {
    setPicked(null);
    if (index + 1 >= quizzes.length) finishRun(); // record best, dives played and the daily result
    setIndex((i) => i + 1);
  };

  const colorFor = (i: number) => {
    if (!answered) return undefined;
    if (quiz.options[i].correct) return "#b7f0d8"; // seafoam
    if (i === picked) return "#ffc9c2"; // coral
    return undefined;
  };

  const wasRight = answered && quiz.options[picked].correct;
  const spotted = CREATURES.filter((c) => c.level === score);
  const spottedText = spotted.map((c) => `${c.e} ${c.name}`).join(" and ");
  const spottedIsNew = spotted.some((c) => newThisRun.includes(c.art));

  return (
    <Shell depth={score} rivalDepth={rivalScore}>
      <Scoreboard you={score} rival={rivalScore} />

      <p style={{ marginTop: 16, opacity: 0.7 }}>
        <span className="wave">🌊</span> {mode === "daily" ? "Daily dive · " : ""}Question {index + 1} of{" "}
        {quizzes.length}
      </p>
      <h2 style={{ margin: "8px 0" }}>{quiz.title}</h2>
      <p style={{ lineHeight: 1.5 }}>{quiz.text}</p>

      <div style={{ display: "grid", gap: 10, marginTop: 16 }}>
        {quiz.options.map((o, i) => (
          <button
            key={i}
            className="opt"
            onClick={() => choose(i)}
            disabled={answered}
            style={{ background: colorFor(i) }}
          >
            <span>{o.text}</span>
            {answered && i === quiz.rivalPick && <span className="tag">⭐ {RIVAL_NAME}&apos;s pick</span>}
          </button>
        ))}
      </div>

      {answered && (
        <div style={{ marginTop: 16 }}>
          <p>
            {wasRight
              ? `Correct! 🐬 Diving to ${score * DEPTH_PER} m.${
                  spotted.length ? ` You spot a ${spottedText}!` : ""
                }${spottedIsNew ? " 📖 New field guide entry!" : ""}`
              : `Not quite. 🦀 You stay at ${score === 0 ? "the surface" : `${score * DEPTH_PER} m`}.`}{" "}
            {quiz.wrongPct}% of people get this one wrong.
          </p>
          <p>
            {RIVAL_NAME} guessed &ldquo;{rivalOption.text}&rdquo;{" "}
            {rivalOption.correct
              ? `and got lucky! He dives to ${rivalScore * DEPTH_PER} m.`
              : "and missed."}
          </p>
          <button className="btn" onClick={next}>
            {index + 1 === quizzes.length ? "See who won" : "Next"}
          </button>
        </div>
      )}
    </Shell>
  );
}