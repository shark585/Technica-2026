"use client";
import { Art, creatureCss } from "./creatures";
import { useEffect, useState, type ReactNode } from "react";
import data from "./database.json";

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
type Quiz = { title: string; text: string; wrongPct: number; options: Option[] };

const COUNT = 10;
const DEPTH_PER = 20; // meters gained per correct answer
const SKY_VH = 35; // how much of the first screen is sky

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

// Floating particles ("marine snow"), generated deterministically so server and client match
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
  .btn:hover { background: #023e8a; }
  .btn-ghost {
    color: #0077b6;
    background: transparent;
    border: 2px solid #0077b6;
  }
  .btn-ghost:hover { color: #fff; background: #0077b6; }
  .rules {
    margin: 16px 0 24px;
    padding-left: 22px;
    line-height: 1.7;
    text-align: left;
  }
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
  }  ${creatureCss}
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
`;

function Shell({ children, depth }: { children: ReactNode; depth: number }) {
  const waterTop = `calc(${SKY_VH}vh + 30px)`;
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
          {/* Sun */}
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
          {/* Clouds */}
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

        {/* Rolling waves at the surface (back wave, then front wave) */}
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

      {/* Bubbles (appear once you're underwater) */}
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
        {depth === 0 ? "Surface" : `Depth: ${depth * DEPTH_PER} m`}
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
        Questions from Gapminder data
      </div>
    </div>
  );
}

function shuffle<T>(array: T[]): T[] {
  const copy = [...array];
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

function toQuiz(row: Row): Quiz {
  const options: Option[] = [
    { text: row.option_a, correct: row.option_a_correctness === 1 },
    { text: row.option_b, correct: row.option_b_correctness === 1 },
    { text: row.option_c, correct: row.option_c_correctness === 1 },
  ].filter((o) => o.text);

  return {
    title: row.short_title,
    text: row.published_version_of_question,
    wrongPct: row.human_wrong_percentage,
    options: shuffle(options),
  };
}

export default function Page() {
  const [started, setStarted] = useState(false);
  const [quizzes, setQuizzes] = useState<Quiz[]>([]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<number | null>(null);
  const [score, setScore] = useState(0); // also the current depth level

  const start = () => {
    const rows = (data as unknown as Row[]).filter(
      (r) => r.language === "en-US" && r.published_version_of_question
    );
    setQuizzes(shuffle(rows).slice(0, COUNT).map(toQuiz));
    setIndex(0);
    setPicked(null);
    setScore(0);
  };

  useEffect(() => {
    start();
  }, []);

  if (quizzes.length === 0) {
    return (
      <Shell depth={0}>
        <p>
          <span className="wave">🌊</span> Loading...
        </p>
      </Shell>
    );
  }

  // Title screen
  if (!started) {
    return (
      <Shell depth={0}>
        <div style={{ textAlign: "center" }}>
          <div className="wave" style={{ fontSize: 64 }}>
            🐋
          </div>
          <h1 style={{ margin: "8px 0 0", fontSize: 36 }}>Ocean Quiz</h1>
          <p style={{ opacity: 0.7, marginTop: 4 }}>How deep can you go?</p>
        </div>

        <h3 style={{ marginTop: 24, marginBottom: 0 }}>How to play</h3>
        <ol className="rules">
          <li>You start at the surface and get {COUNT} random questions.</li>
          <li>Pick an answer. It locks in right away, and the correct one lights up green.</li>
          <li>Answer correctly and you dive {DEPTH_PER} m deeper.</li>
          <li>Answer wrong and you stay at your current depth, then move on to the next question.</li>
          <li>The deeper you go, the darker it gets and the stranger the creatures you&apos;ll meet.</li>
          <li>After each answer, you&apos;ll see how many people usually get it wrong.</li>
          <li>When the questions run out, you&apos;ll see how deep you got.</li>
        </ol>

        <div style={{ textAlign: "center" }}>
          <button
            className="btn"
            style={{ fontSize: 18, padding: "14px 32px" }}
            onClick={() => {
              start();
              setStarted(true);
            }}
          >
            Start diving
          </button>
        </div>
      </Shell>
    );
  }

  // Results screen
  if (index >= quizzes.length) {
    const finalCreature = CREATURES.find((c) => c.level === score);
    return (
      <Shell depth={score}>
        <h1>
          <span className="wave">{score === 0 ? "🏖️" : "🐠"}</span> You reached{" "}
          {score === 0 ? "…the surface" : `${score * DEPTH_PER} m`}
        </h1>
        <p>
          You got {score} of {quizzes.length} right.
          {finalCreature && score > 0 && ` Deepest creature spotted: ${finalCreature.e} ${finalCreature.name}.`}
        </p>
        <button className="btn" onClick={start}>
          Dive in again
        </button>{" "}
        <button
          className="btn btn-ghost"
          onClick={() => {
            start();
            setStarted(false);
          }}
        >
          Title screen
        </button>
      </Shell>
    );
  }

  const quiz = quizzes[index];
  const answered = picked !== null;

  const choose = (i: number) => {
    if (answered) return;
    setPicked(i);
    if (quiz.options[i].correct) setScore((s) => s + 1); // correct = descend
  };

  const next = () => {
    setPicked(null);
    setIndex((i) => i + 1);
  };

  const colorFor = (i: number) => {
    if (!answered) return undefined;
    if (quiz.options[i].correct) return "#b7f0d8"; // seafoam
    if (i === picked) return "#ffc9c2"; // coral
    return undefined;
  };

  const wasRight = answered && quiz.options[picked].correct;
  const spotted = CREATURES.find((c) => c.level === score);

  return (
    <Shell depth={score}>
      <div style={{ height: 8, background: "#caf0f8", borderRadius: 999, overflow: "hidden" }}>
        <div
          style={{
            width: `${(index / quizzes.length) * 100}%`,
            height: "100%",
            background: "linear-gradient(90deg, #00b4d8, #0077b6)",
            transition: "width 0.3s",
          }}
        />
      </div>

      <p style={{ marginTop: 16, opacity: 0.7 }}>
        <span className="wave">🌊</span> Question {index + 1} of {quizzes.length}
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
            {o.text}
          </button>
        ))}
      </div>

      {answered && (
        <div style={{ marginTop: 16 }}>
          <p>
            {wasRight
              ? `Correct! 🐬 Diving to ${score * DEPTH_PER} m.${
                  spotted ? ` You spot a ${spotted.e} ${spotted.name}!` : ""
                }`
              : `Not quite. 🦀 You stay at ${score === 0 ? "the surface" : `${score * DEPTH_PER} m`}.`}{" "}
            {quiz.wrongPct}% of people get this one wrong.
          </p>
          <button className="btn" onClick={next}>
            {index + 1 === quizzes.length ? "See results" : "Next"}
          </button>
        </div>
      )}
    </Shell>
  );
}