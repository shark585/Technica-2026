import type { CSSProperties, ReactElement } from "react";

export const creatureCss = `
  @keyframes wag {
    from { transform: rotate(calc(var(--a, 8) * -1deg)); }
    to { transform: rotate(calc(var(--a, 8) * 1deg)); }
  }
  .wag { animation: wag var(--d, 1.4s) ease-in-out infinite alternate; }
  @keyframes pulse {
    0%, 100% { transform: scale(1, 1); }
    50% { transform: scale(1.06, 0.88); }
  }
  .pulse { animation: pulse 3s ease-in-out infinite; }
  @keyframes drift {
    from { transform: translateX(-3px); }
    to { transform: translateX(3px); }
  }
  .drift { animation: drift var(--d, 2.4s) ease-in-out infinite alternate; }
`;

// Rotation animation around a point (x, y) with amplitude a (deg) and period d (s)
const wag = (x: number, y: number, a = 8, d = 1.4): CSSProperties =>
  ({ transformOrigin: `${x}px ${y}px`, "--a": a, "--d": `${d}s` }) as CSSProperties;

function Seagull() {
  return (
    <svg viewBox="0 0 200 100" width="100%">
      <defs>
        <linearGradient id="gl-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="1" stopColor="#c9d3da" />
        </linearGradient>
        <linearGradient id="gl-wing" x1="1" y1="0" x2="0" y2="0">
          <stop offset="0" stopColor="#d3dae0" />
          <stop offset="0.65" stopColor="#8e9aa6" />
          <stop offset="1" stopColor="#25282c" />
        </linearGradient>
      </defs>
      <path d="M36 55 L8 50 L10 62 L36 60Z" fill="#f4f6f8" />
      <path d="M10 51 L8 50 L10 62 L14 61Z" fill="#2b2f33" />
      <path d="M34 56 C52 46 100 44 138 52 C150 55 158 58 160 62 C150 67 120 69 90 67 C62 65 42 62 34 56Z" fill="url(#gl-body)" />
      <circle cx="152" cy="54" r="10" fill="#fff" />
      <path d="M160 52 L181 56 L160 59Z" fill="#f2b705" />
      <circle cx="172" cy="57" r="1.6" fill="#d62828" />
      <circle cx="155" cy="51" r="1.9" fill="#111" />
      <g className="wag" style={wag(95, 54, 14, 0.9)}>
        <path d="M95 54 C92 30 70 12 28 8 C22 8 12 10 4 16 C30 20 52 34 66 56Z" fill="url(#gl-wing)" />
      </g>
    </svg>
  );
}

function Fish() {
  return (
    <svg viewBox="0 0 200 100" width="100%">
      <defs>
        <linearGradient id="fs-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f5873" />
          <stop offset="0.45" stopColor="#7fa3b8" />
          <stop offset="0.6" stopColor="#d5e1e8" />
          <stop offset="1" stopColor="#f6f9fb" />
        </linearGradient>
      </defs>
      <g className="wag" style={wag(34, 50, 9, 0.7)}>
        <path d="M36 50 L6 28 C13 42 13 58 6 72Z" fill="#3c6682" />
      </g>
      <path d="M100 31 L116 12 C122 20 128 26 132 32Z" fill="#2f5873" />
      <path d="M104 68 L96 84 L122 69Z" fill="#9fb8c9" />
      <path d="M175 50 C160 36 120 26 80 32 C55 36 40 44 32 50 C40 56 55 64 80 68 C120 74 160 64 175 50Z" fill="url(#fs-body)" />
      <path d="M62 36 C80 38 100 36 120 34 M70 42 C90 44 110 42 130 40" stroke="#1d3a4f" strokeWidth="2" opacity="0.35" fill="none" />
      <path d="M45 50 C80 47 120 45 152 49" stroke="#fff" strokeWidth="1" opacity="0.4" fill="none" />
      <path d="M140 56 C132 62 126 66 122 68 C130 68 138 64 144 60Z" fill="#7fa3b8" />
      <path d="M142 37 C137 46 137 56 142 63" stroke="#4a6f86" strokeWidth="2" fill="none" />
      <circle cx="158" cy="46" r="5.5" fill="#e8eef1" />
      <circle cx="158" cy="46" r="3.6" fill="#0b1115" />
      <circle cx="159.2" cy="44.8" r="1" fill="#fff" />
    </svg>
  );
}

const CLOWN_BODY = "M175 52 C170 30 122 22 82 30 C58 35 44 45 40 52 C44 59 58 69 82 74 C122 82 170 74 175 52Z";

function Clownfish() {
  return (
    <svg viewBox="0 0 200 100" width="100%">
      <defs>
        <radialGradient id="cf-body" cx="0.6" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#ff9a3c" />
          <stop offset="1" stopColor="#e2561a" />
        </radialGradient>
        <clipPath id="cf-clip">
          <path d={CLOWN_BODY} />
        </clipPath>
      </defs>
      <g className="wag" style={wag(44, 52, 10, 0.6)}>
        <path d="M44 52 C28 34 14 36 10 52 C14 68 28 70 44 52Z" fill="#f06a1e" stroke="#111" strokeWidth="2.5" />
      </g>
      <path d="M84 30 C94 6 132 8 142 28 C122 26 102 26 84 30Z" fill="#f06a1e" stroke="#111" strokeWidth="2.5" />
      <path d="M100 74 C102 90 118 92 126 78 C116 78 108 76 100 74Z" fill="#f06a1e" stroke="#111" strokeWidth="2.5" />
      <path d={CLOWN_BODY} fill="url(#cf-body)" />
      <g clipPath="url(#cf-clip)">
        <rect x="130" y="0" width="13" height="100" fill="#fff" stroke="#111" strokeWidth="2.5" />
        <rect x="86" y="0" width="12" height="100" fill="#fff" stroke="#111" strokeWidth="2.5" />
        <rect x="52" y="0" width="7" height="100" fill="#fff" stroke="#111" strokeWidth="2.5" />
      </g>
      <path d={CLOWN_BODY} fill="none" stroke="#111" strokeWidth="2.5" />
      <path d="M142 58 C134 66 128 70 124 72 C134 72 142 68 148 62Z" fill="#f06a1e" stroke="#111" strokeWidth="2" />
      <circle cx="160" cy="46" r="5.5" fill="#ffd166" />
      <circle cx="160" cy="46" r="3.2" fill="#111" />
      <circle cx="161" cy="45" r="0.9" fill="#fff" />
    </svg>
  );
}

function Turtle() {
  return (
    <svg viewBox="0 0 210 120" width="100%">
      <defs>
        <radialGradient id="tt-shell" cx="0.45" cy="0.2" r="0.9">
          <stop offset="0" stopColor="#a58a4f" />
          <stop offset="0.6" stopColor="#6b5a2e" />
          <stop offset="1" stopColor="#3f3a1c" />
        </radialGradient>
        <linearGradient id="tt-skin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8aa05a" />
          <stop offset="1" stopColor="#5d7036" />
        </linearGradient>
      </defs>
      <g className="wag" style={wag(50, 72, 8, 1.8)}>
        <path d="M56 74 C46 90 34 98 18 98 C32 86 38 76 44 68Z" fill="url(#tt-skin)" />
      </g>
      <path d="M156 68 C166 56 188 56 196 66 C198 72 190 78 176 78 C168 78 160 76 156 74Z" fill="url(#tt-skin)" />
      <circle cx="184" cy="64" r="2.4" fill="#111" />
      <path d="M196 68 C190 71 182 72 176 71" stroke="#3d4a22" strokeWidth="1.5" fill="none" />
      <path d="M44 74 C80 88 128 88 160 74 L160 78 C128 94 80 94 44 78Z" fill="#d8cfa0" />
      <path d="M40 74 C38 34 140 26 162 70 C132 82 70 84 40 74Z" fill="url(#tt-shell)" />
      <path d="M62 52 L92 42 L126 46 L146 62 M92 42 L90 68 M126 46 L118 74 M62 52 L64 72 M90 68 L118 74 M64 72 L90 68 M146 62 L118 74" stroke="#2b2610" strokeWidth="2" opacity="0.55" fill="none" />
      <ellipse cx="95" cy="44" rx="28" ry="6" fill="#fff" opacity="0.12" />
      <g className="wag" style={wag(126, 74, 14, 1.8)}>
        <path d="M118 74 C128 96 150 110 180 114 C168 98 152 84 142 70Z" fill="url(#tt-skin)" />
      </g>
    </svg>
  );
}

function Dolphin() {
  return (
    <svg viewBox="0 0 240 120" width="100%" overflow="visible">
      <defs>
        <linearGradient id="dp-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#1f3a52" />
          <stop offset="0.38" stopColor="#4f7391" />
          <stop offset="0.6" stopColor="#a9bfce" />
          <stop offset="1" stopColor="#f0f5f8" />
        </linearGradient>
        <linearGradient id="dp-fin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#2f4d68" />
          <stop offset="1" stopColor="#7d9bb2" />
        </linearGradient>
      </defs>

      {/* Whole dolphin tilted up, as if leaping */}
      <g transform="rotate(-10 120 70)">
        {/* Flukes */}
        <g className="wag" style={wag(40, 70, 10, 0.8)}>
          <path
            d="M42 66 C28 62 16 56 6 48 C14 58 16 66 12 72 C16 78 14 86 6 94 C18 88 30 80 42 74Z"
            fill="url(#dp-fin)"
          />
        </g>

        {/* Dorsal fin */}
        <path d="M114 42 C122 22 140 14 156 12 C151 22 151 32 156 42Z" fill="url(#dp-fin)" />

        {/* Body */}
        <path
          d="M38 68 C66 56 94 44 116 40 C128 38 140 38 152 40 C170 40 188 42 200 46 C206 47 210 50 212 52 L234 56 C236 58 234 61 230 61 L208 62 C192 80 160 94 124 94 C88 94 58 84 38 72Z"
          fill="url(#dp-body)"
        />

        {/* Wet sheen along the back */}
        <path d="M68 62 C98 50 140 46 184 48" stroke="#fff" strokeWidth="3" strokeLinecap="round" opacity="0.25" fill="none" />
        <path d="M150 52 C170 52 186 54 198 58" stroke="#fff" strokeWidth="2" strokeLinecap="round" opacity="0.18" fill="none" />

        {/* Pectoral flipper */}
        <g className="wag" style={wag(152, 72, 12, 1.1)}>
          <path d="M152 72 C144 90 132 100 116 106 C134 104 150 96 162 80Z" fill="url(#dp-fin)" />
        </g>

        {/* Mouth line and eye */}
        <path d="M232 59 C222 61 214 61 206 57" stroke="#1c2d3b" strokeWidth="1.6" strokeLinecap="round" fill="none" />
        <circle cx="200" cy="51" r="3.4" fill="#06090c" />
        <circle cx="201" cy="50" r="1" fill="#fff" />
      </g>

      {/* Water droplets flung off the tail */}
      {[[8, 104, 3], [22, 112, 2.2], [2, 94, 2.4], [28, 102, 1.8], [14, 116, 1.6]].map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#cfeaf5" opacity="0.8" />
      ))}
    </svg>
  );
}

function Shark() {
  const body =
    "M34 58 C62 54 92 44 114 38 C120 28 126 14 136 4 C140 16 146 28 152 37 C180 38 214 48 238 62 C246 64 252 68 252 72 C244 76 232 80 214 84 C190 96 150 100 118 94 C86 90 56 78 34 68Z";
  // Open mouth along the underside of the snout
  const mouth = "M250 73 C240 75 228 77 216 79 C226 81 240 77.5 250 73Z";
  const teethX = [243, 237, 231, 225, 219];
  const toothY = (x: number) => 73 + ((250 - x) * 6) / 34; // follows the upper jaw edge
  return (
    <svg viewBox="0 0 260 120" width="100%" overflow="visible">
      <defs>
        <linearGradient id="sk-back" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#323f4a" />
          <stop offset="1" stopColor="#74838f" />
        </linearGradient>
        <linearGradient id="sk-fin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#3a4752" />
          <stop offset="1" stopColor="#6a7883" />
        </linearGradient>
        <clipPath id="sk-clip">
          <path d={body} />
        </clipPath>
      </defs>

      {/* Tail */}
      <g className="wag" style={wag(46, 62, 9, 1)}>
        <path d="M46 58 C36 44 24 24 6 4 C24 8 40 20 46 34 C50 42 52 50 52 58Z" fill="url(#sk-fin)" />
        <path d="M46 66 C38 78 30 92 18 108 C34 102 46 94 52 84 C54 78 54 72 52 66Z" fill="url(#sk-fin)" />
      </g>

      {/* Lower fins */}
      <path d="M104 92 C98 100 92 104 84 106 C92 100 96 94 98 90Z" fill="url(#sk-fin)" />
      <path d="M62 80 C58 86 54 88 48 90 C52 86 54 82 56 78Z" fill="url(#sk-fin)" />

      {/* Body: dark back, white belly with a jagged countershading line */}
      <path d={body} fill="url(#sk-back)" />
      <g clipPath="url(#sk-clip)">
        <path
          d="M30 70 C48 76 60 66 82 72 C96 76 104 68 124 72 C142 76 156 64 178 69 C196 73 212 66 232 68 C242 69 250 68 256 70 L256 110 L30 110Z"
          fill="#f3f6f8"
        />
        <path d="M70 52 C100 42 140 40 190 46" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" opacity="0.14" fill="none" />

        {/* Mouth and teeth: everything here is clipped to the body, so nothing can stick out */}
        <path d={mouth} fill="#3a0f14" />
        {teethX.map((x) => (
          <path key={x} d={`M${x} ${toothY(x)} l2.5 3 l2.5 -3Z`} fill="#fff" />
        ))}
      </g>

      {/* Scars and gill slits */}
      <path d="M130 52 L146 58 M134 48 L148 53" stroke="#d7dde1" strokeWidth="1.3" strokeLinecap="round" opacity="0.4" />
      {[0, 6, 12, 18, 24].map((dx) => (
        <path key={dx} d={`M${170 + dx} 54 C${168 + dx} 62 ${168 + dx} 70 ${171 + dx} 77`} stroke="#222d36" strokeWidth="1.8" fill="none" opacity="0.7" />
      ))}

      {/* Pectoral fin */}
      <g className="wag" style={wag(166, 74, 8, 1.6)}>
        <path d="M170 72 C160 92 140 108 112 116 C132 104 144 92 150 76Z" fill="url(#sk-fin)" />
      </g>

      {/* Jaw line */}
      <path d="M250 73 C240 75 228 77 216 79" stroke="#1e1313" strokeWidth="1.4" strokeLinecap="round" fill="none" />

      {/* Cold black eye and nostril */}
      <circle cx="226" cy="62" r="4.2" fill="#161b20" />
      <circle cx="226" cy="62" r="3" fill="#020304" />
      <circle cx="227.2" cy="60.8" r="0.9" fill="#fff" opacity="0.8" />
      <circle cx="243" cy="62" r="1.2" fill="#1c252d" />
    </svg>
  );
}

function Octopus() {
  const arms = [
    "M46 88 C26 108 16 128 30 148 C34 154 42 152 40 146",
    "M58 94 C48 118 44 138 54 154",
    "M69 96 C66 120 64 140 72 158",
    "M80 97 C82 122 84 142 80 160",
    "M91 96 C98 120 100 140 94 158",
    "M102 94 C112 118 116 138 108 154",
    "M112 91 C128 112 138 130 130 150",
    "M118 86 C140 102 154 120 144 140 C140 146 132 142 136 138",
  ];
  const spots: [number, number, number][] = [[58, 30, 3], [74, 22, 2], [96, 28, 3], [108, 42, 2], [50, 50, 2.5], [88, 40, 2]];
  return (
    <svg viewBox="0 0 170 165" width="100%">
      <defs>
        <radialGradient id="oc-body" cx="0.4" cy="0.3" r="0.9">
          <stop offset="0" stopColor="#e8704f" />
          <stop offset="1" stopColor="#8f2a1a" />
        </radialGradient>
      </defs>
      {arms.map((d, i) => (
        <g key={i} className="wag" style={{ ...wag(80, 92, 3 + (i % 3) * 1.5, 1.6 + i * 0.15), animationDelay: `${-i * 0.2}s` }}>
          <path d={d} stroke="#a8321f" strokeWidth="12" strokeLinecap="round" fill="none" />
          <path d={d} stroke="#d9694a" strokeWidth="6" strokeLinecap="round" opacity="0.6" fill="none" />
          <path d={d} stroke="#f6c3ae" strokeWidth="3" strokeLinecap="round" strokeDasharray="0.1 7" fill="none" />
        </g>
      ))}
      <ellipse cx="80" cy="52" rx="40" ry="44" fill="url(#oc-body)" />
      {spots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#f08a6b" opacity="0.5" />
      ))}
      {[62, 98].map((x) => (
        <g key={x}>
          <ellipse cx={x} cy="70" rx="10" ry="9" fill="#f2d27a" stroke="#6b1d12" strokeWidth="2" />
          <ellipse cx={x} cy="70" rx="6.5" ry="2.4" fill="#111" />
        </g>
      ))}
    </svg>
  );
}

function Squid() {
  const arms = [
    "M170 41 C184 34 192 32 202 34",
    "M171 43 C186 40 196 40 206 42",
    "M171 47 C186 50 196 52 206 50",
    "M170 49 C184 56 192 60 202 58",
  ];
  const spots: [number, number][] = [[40, 40], [62, 36], [84, 34], [106, 38], [52, 52], [78, 55], [100, 52], [124, 46]];
  return (
    <svg viewBox="0 0 230 90" width="100%">
      <defs>
        <linearGradient id="sq-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#b9544f" />
          <stop offset="1" stopColor="#f1c9be" />
        </linearGradient>
      </defs>
      <path d="M10 45 C14 26 30 16 52 28 C38 33 24 39 10 45Z" fill="#c4736c" />
      <path d="M10 45 C14 64 30 74 52 62 C38 57 24 51 10 45Z" fill="#c4736c" />
      <path d="M8 45 C36 24 96 24 142 38 L142 54 C96 68 36 66 8 45Z" fill="url(#sq-body)" />
      {spots.map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.7" fill="#8e2f2f" opacity="0.7" />
      ))}
      <g className="drift">
        {arms.map((d, i) => (
          <path key={i} d={d} stroke="#b95a55" strokeWidth="3.4" strokeLinecap="round" fill="none" />
        ))}
        <path d="M170 44 C190 28 208 48 226 38" stroke="#b95a55" strokeWidth="2.4" strokeLinecap="round" fill="none" />
        <ellipse cx="226" cy="38" rx="3.5" ry="2.4" fill="#b95a55" />
      </g>
      <path d="M138 36 C156 34 168 40 172 45 C168 50 156 56 138 54Z" fill="#a8453f" />
      <circle cx="156" cy="45" r="8" fill="#0b0e14" stroke="#d9b25a" strokeWidth="2" />
      <circle cx="158.5" cy="42.5" r="2" fill="#fff" opacity="0.85" />
    </svg>
  );
}

function Jellyfish() {
  const tents = [
    "M24 70 C18 100 30 124 22 162",
    "M36 74 C32 104 42 126 34 160",
    "M48 76 C46 106 54 128 48 164",
    "M60 76 C60 108 66 130 60 168",
    "M72 76 C74 106 68 128 74 164",
    "M84 74 C88 104 78 126 86 160",
    "M96 72 C102 100 92 124 100 162",
    "M104 68 C112 96 104 120 110 156",
  ];
  return (
    <svg viewBox="0 0 120 170" width="100%" overflow="visible">
      <defs>
        <radialGradient id="jf-bell" cx="0.5" cy="0.35" r="0.75">
          <stop offset="0" stopColor="#ffc2f0" stopOpacity="0.85" />
          <stop offset="1" stopColor="#8f6bff" stopOpacity="0.4" />
        </radialGradient>
      </defs>
      {tents.map((d, i) => (
        <g key={i} className="wag" style={{ ...wag(60, 74, 4 + (i % 3) * 2, 1.8 + i * 0.2), animationDelay: `${-i * 0.3}s` }}>
          <path d={d} stroke="#ffc9f4" strokeWidth="1.6" strokeLinecap="round" opacity="0.7" fill="none" />
        </g>
      ))}
      <g className="wag" style={wag(60, 74, 5, 2)}>
        <path d="M48 72 C42 92 56 104 46 126 M60 74 C56 96 68 108 60 134 M72 72 C80 92 66 106 76 124" stroke="#ffd9f6" strokeWidth="6" strokeLinecap="round" opacity="0.55" fill="none" />
      </g>
      <g className="pulse" style={{ transformOrigin: "60px 6px" }}>
        <path d="M8 72 C6 22 36 4 60 4 C84 4 114 22 112 72 C102 64 92 76 82 68 C72 76 62 66 52 74 C42 66 32 76 22 68 C16 72 12 74 8 72Z" fill="url(#jf-bell)" stroke="#ffe6ff" strokeOpacity="0.7" strokeWidth="1.5" />
        <path d="M60 8 C50 30 40 50 28 68 M60 8 C58 30 56 50 52 70 M60 8 C62 30 64 50 68 70 M60 8 C70 30 80 50 92 68" stroke="#fff" strokeWidth="1" opacity="0.28" fill="none" />
        <path d="M42 46 C44 30 76 30 78 46 C70 40 50 40 42 46Z" fill="#fff0a0" opacity="0.7" />
      </g>
    </svg>
  );
}

function Pufferfish() {
  const r2 = (n: number) => Math.round(n * 100) / 100; // round so server and client match

    const spines = Array.from({ length: 30 }, (_, i) => {
    const a = (i / 30) * Math.PI * 2;
    if (Math.abs(a) < 0.3 || Math.abs(a - Math.PI * 2) < 0.3) return null; // clear the mouth
    const x1 = r2(82 + 56 * Math.cos(a)), y1 = r2(66 + 48 * Math.sin(a));
    const x2 = r2(82 + 63 * Math.cos(a)), y2 = r2(66 + 55 * Math.sin(a));
    return <line key={i} x1={x1} y1={y1} x2={x2} y2={y2} stroke="#c8b47e" strokeWidth="1.6" strokeLinecap="round" />;
    });
  const spots: [number, number, number][] = [[50, 38, 3], [66, 28, 2.5], [84, 24, 3], [100, 30, 2.5], [112, 40, 2], [60, 50, 2], [92, 42, 2.5], [76, 40, 2]];
  return (
    <svg viewBox="0 0 170 130" width="100%">
      <defs>
        <linearGradient id="pf-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#8f7340" />
          <stop offset="0.5" stopColor="#c4a868" />
          <stop offset="0.62" stopColor="#f1e6c4" />
          <stop offset="1" stopColor="#fbf6e6" />
        </linearGradient>
      </defs>
      <g className="wag" style={wag(30, 66, 12, 0.6)}>
        <path d="M30 66 C18 54 8 50 4 54 C8 62 8 70 4 78 C8 82 18 78 30 66Z" fill="#b49a62" />
      </g>
      {spines}
      <path d="M54 24 C60 12 70 12 74 20 C68 22 60 26 54 24Z" fill="#b49a62" />
      <ellipse cx="82" cy="66" rx="56" ry="48" fill="url(#pf-body)" />
      {spots.map(([x, y, r], i) => (
        <circle key={i} cx={x} cy={y} r={r} fill="#4a3a1c" opacity="0.55" />
      ))}
      <g className="wag" style={wag(92, 76, 16, 0.5)}>
        <path d="M92 76 C84 70 76 76 74 86 C84 88 92 84 96 78Z" fill="#e6d296" opacity="0.85" />
      </g>
      <path d="M134 68 C142 65 144 73 136 75Z" fill="#7a4a3a" />
      <circle cx="116" cy="52" r="8.5" fill="#fff" stroke="#3c3020" strokeWidth="1.5" />
      <circle cx="117" cy="52" r="5.5" fill="#5a9a62" />
      <circle cx="117.5" cy="52" r="3" fill="#000" />
      <circle cx="119" cy="50" r="1.2" fill="#fff" />
    </svg>
  );
}

function Whale() {
  return (
    <svg viewBox="-6 0 306 140" width="100%">
      <defs>
        <linearGradient id="wh-body" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#23323f" />
          <stop offset="0.5" stopColor="#3f5566" />
          <stop offset="0.7" stopColor="#8fa3b3" />
          <stop offset="1" stopColor="#dfe8ee" />
        </linearGradient>
        <linearGradient id="wh-fin" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#40586a" />
          <stop offset="1" stopColor="#e7eef2" />
        </linearGradient>
      </defs>
      <g className="wag" style={wag(34, 58, 6, 2.2)}>
        <path d="M34 55 C22 44 10 36 -4 20 C14 22 28 30 38 42Z M34 63 C22 74 10 82 -4 98 C14 96 28 88 38 76Z" fill="#2c3d4c" />
      </g>
      <path d="M118 34 C124 22 134 22 140 32Z" fill="#33465a" />
      <path d="M292 68 C282 42 242 26 192 26 C150 26 108 34 70 48 C56 52 42 54 32 55 L32 63 C42 65 56 67 70 72 C110 88 160 100 210 98 C252 96 284 86 292 68Z" fill="url(#wh-body)" />
      <path d="M292 68 C262 72 232 72 204 67" stroke="#1a2630" strokeWidth="1.6" fill="none" />
      <path d="M268 78 C252 85 232 88 208 88 M262 82 C246 89 228 92 208 92 M256 85 C242 92 226 95 210 95 M274 74 C256 80 238 82 212 83" stroke="#fff" strokeWidth="1.2" opacity="0.3" fill="none" />
      {[[278, 50], [268, 44], [286, 58], [258, 40]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.8" fill="#9fb2c0" opacity="0.8" />
      ))}
      <circle cx="254" cy="67" r="3.4" fill="#0a0a0a" />
      <circle cx="255" cy="66" r="0.9" fill="#fff" />
      <g className="wag" style={wag(212, 84, 6, 2.6)}>
        <path d="M212 84 C198 112 168 130 126 138 C158 124 184 108 200 90Z" fill="url(#wh-fin)" stroke="#fff" strokeOpacity="0.4" />
      </g>
      {[[150, 60], [164, 66], [140, 70]].map(([x, y], i) => (
        <circle key={i} cx={x} cy={y} r="1.6" fill="#cfd8de" opacity="0.5" />
      ))}
    </svg>
  );
}

function SeaDragon() {
  const spine = "M184 44 C150 40 118 52 96 76 C74 100 78 130 108 134 C128 136 134 118 120 114";
  // [x, y, rotation, scale] for fronds along the body
  const leaves: [number, number, number, number][] = [
    [186, 36, -62, 0.8], [178, 40, -72, 1], [160, 42, -88, 1.2], [146, 45, -96, 0.9],
    [134, 49, -104, 1.25], [122, 54, -112, 0.9], [112, 61, -126, 1.2], [102, 70, -142, 1],
    [92, 82, -160, 1.25], [84, 96, -172, 1], [82, 110, 180, 1.2], [86, 123, 168, 1],
    [170, 47, 60, 0.9], [150, 47, 74, 1], [132, 54, 82, 1.1], [116, 64, 96, 0.9],
    [100, 78, 112, 1], [92, 98, 20, 0.9],
  ];
  return (
    <svg viewBox="0 0 240 160" width="100%" overflow="visible">
      <defs>
        <linearGradient id="sd-leaf" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0" stopColor="#d9b53a" />
          <stop offset="0.6" stopColor="#7fa04a" />
          <stop offset="1" stopColor="#4f9a7a" stopOpacity="0.5" />
        </linearGradient>
        <linearGradient id="sd-head" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#e8c45a" />
          <stop offset="1" stopColor="#a8761c" />
        </linearGradient>
      </defs>

      <g style={{ filter: "drop-shadow(0 0 6px rgba(255, 214, 90, 0.55))" }}>
        {/* Fronds */}
        {leaves.map(([x, y, r, s], i) => (
          <g key={i} transform={`translate(${x} ${y}) rotate(${r}) scale(${s})`}>
            <g className="wag" style={{ ...wag(0, 0, 11, 1.3 + (i % 5) * 0.25), animationDelay: `${-i * 0.22}s` }}>
              <path d="M0 0 C8 -14 26 -18 42 -6 C28 5 10 9 0 0Z" fill="url(#sd-leaf)" stroke="#6b5410" strokeOpacity="0.45" strokeWidth="0.8" />
              <path d="M3 0 C16 -4 28 -6 38 -6" stroke="#f3e08a" strokeWidth="0.9" opacity="0.7" fill="none" />
            </g>
          </g>
        ))}

        {/* Banded body */}
        <path d={spine} stroke="#6e4f10" strokeWidth="17" strokeLinecap="round" fill="none" />
        <path d={spine} stroke="#c99a2e" strokeWidth="13" strokeLinecap="round" fill="none" />
        <path d={spine} stroke="#7b4d97" strokeWidth="11" strokeDasharray="2 9" fill="none" opacity="0.6" />
        <path d={spine} stroke="#f0d776" strokeWidth="3" strokeLinecap="round" fill="none" opacity="0.55" transform="translate(-1.5 -3)" />

        {/* Glowing tail tip and body lights */}
        <circle cx="120" cy="114" r="3" fill="#fff3b0" opacity="0.9" />
        {[[150, 41], [128, 49], [108, 63], [90, 84], [84, 108]].map(([x, y], i) => (
          <circle key={i} cx={x} cy={y} r="1.6" fill="#fff6c0" opacity="0.8" />
        ))}

        {/* Head and long snout */}
        <ellipse cx="190" cy="44" rx="13" ry="9" transform="rotate(14 190 44)" fill="url(#sd-head)" />
        <path d="M198 41 L230 48 C233 49 233 53 230 54 L198 52Z" fill="url(#sd-head)" />
        <path d="M200 50 L230 52" stroke="#6e4f10" strokeWidth="1" opacity="0.6" />
        <circle cx="196" cy="42" r="4.8" fill="none" stroke="#f6d873" strokeWidth="1.4" />
        <circle cx="196" cy="42" r="3.2" fill="#2b1a05" />
        <circle cx="197" cy="41" r="0.9" fill="#fff" />
      </g>
    </svg>
  );
}

const ART: Record<string, () => ReactElement> = {
  seagull: Seagull,
  fish: Fish,
  clownfish: Clownfish,
  turtle: Turtle,
  dolphin: Dolphin,
  shark: Shark,
  octopus: Octopus,
  squid: Squid,
  jellyfish: Jellyfish,
  pufferfish: Pufferfish,
  whale: Whale,
  seadragon: SeaDragon,
};

export function Art({ name }: { name: string }) {
  const Component = ART[name];
  return Component ? <Component /> : null;
}