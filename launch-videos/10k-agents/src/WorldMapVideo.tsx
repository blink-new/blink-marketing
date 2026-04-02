import {
  AbsoluteFill,
  Easing,
  Freeze,
  interpolate,
  OffthreadVideo,
  spring,
  staticFile,
  useCurrentFrame,
  useVideoConfig,
} from "remotion";
import { ComposableMap, Geographies, Geography, Graticule, Sphere } from "react-simple-maps";
import { geoOrthographic } from "d3-geo";
import { brand } from "./brand";
import { AGENTS } from "./agents";

// ─── Canvas split ─────────────────────────────────────────────────────────────
const CANVAS_W = 1920;
const CANVAS_H = 1080;
const TEXT_W = Math.round((CANVAS_W * 2) / 5); // 768px
const MAP_W = CANVAS_W - TEXT_W; // 1152px

// ─── Freeze / hold ────────────────────────────────────────────────────────────
const FREEZE_AT_FRAME = 212;

// ─── Text panel timing (mirrors TenKAgentsVideo) ─────────────────────────────
const COUNTER_START = 47;
const COUNTER_END = 180;
const CLAW_DELAY = 50;
const WORD_STAGGER = 22;
const SENTENCE_DELAY = 110;

// ─── Globe config ─────────────────────────────────────────────────────────────
const GLOBE_SCALE = 470;
// Globe spins from Asia-Pacific view → Americas, then holds still
const GLOBE_SPIN_START =  80; // centre lon at frame 0  (Asia-Pacific)
const GLOBE_SPIN_END   = -30; // centre lon at GLOBE_SETTLE (Atlantic — shows Americas + Africa)
const GLOBE_SETTLE     = 155; // longer spin — 2.6 s of rotation

// ─── Pin animation — cards fill up WHILE globe rotates ───────────────────────
const PIN_APPEAR_START = 5;
const PIN_STAGGER = 1.2; // one new pin every 1.2 frames → ~155 pins over ~186 frames

const GEO_URL = staticFile("countries-110m.json");

// ─── Pin definitions [longitude, latitude] ────────────────────────────────────
interface Pin {
  city: string;
  coords: [number, number];
  agentIdx: number;
  cardLeft: boolean;
  cardDown: boolean;
}

const PINS: Pin[] = [
  // ── North America ──────────────────────────────────────────────────────────
  { city: "New York",        coords: [ -74.0,  40.7], agentIdx:  0, cardLeft: false, cardDown: false },
  { city: "Los Angeles",     coords: [-118.2,  34.0], agentIdx:  1, cardLeft: false, cardDown: false },
  { city: "Chicago",         coords: [ -87.6,  41.9], agentIdx:  2, cardLeft: false, cardDown: false },
  { city: "Toronto",         coords: [ -79.4,  43.7], agentIdx:  3, cardLeft: false, cardDown: true  },
  { city: "Mexico City",     coords: [ -99.1,  19.4], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Miami",           coords: [ -80.2,  25.8], agentIdx:  5, cardLeft: false, cardDown: false },
  { city: "Seattle",         coords: [-122.3,  47.6], agentIdx:  6, cardLeft: false, cardDown: true  },
  { city: "Houston",         coords: [ -95.4,  29.8], agentIdx:  7, cardLeft: false, cardDown: false },
  { city: "Atlanta",         coords: [ -84.4,  33.7], agentIdx:  8, cardLeft: false, cardDown: false },
  { city: "Montreal",        coords: [ -73.6,  45.5], agentIdx:  9, cardLeft: false, cardDown: true  },
  { city: "San Francisco",   coords: [-122.4,  37.8], agentIdx: 10, cardLeft: false, cardDown: false },
  { city: "Boston",          coords: [ -71.1,  42.4], agentIdx: 11, cardLeft: false, cardDown: false },
  { city: "Dallas",          coords: [ -96.8,  32.8], agentIdx:  0, cardLeft: false, cardDown: false },
  { city: "Vancouver",       coords: [-123.1,  49.3], agentIdx:  1, cardLeft: false, cardDown: true  },
  { city: "Denver",          coords: [-104.9,  39.7], agentIdx:  2, cardLeft: false, cardDown: false },
  { city: "Phoenix",         coords: [-112.1,  33.4], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Minneapolis",     coords: [ -93.3,  44.9], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Detroit",         coords: [ -83.0,  42.3], agentIdx:  5, cardLeft: false, cardDown: false },
  { city: "Calgary",         coords: [-114.1,  51.0], agentIdx:  6, cardLeft: false, cardDown: true  },
  { city: "Guadalajara",     coords: [-103.3,  20.7], agentIdx:  7, cardLeft: false, cardDown: false },
  { city: "Portland",        coords: [-122.7,  45.5], agentIdx:  8, cardLeft: false, cardDown: false },
  { city: "Las Vegas",       coords: [-115.1,  36.2], agentIdx:  9, cardLeft: false, cardDown: false },
  { city: "Nashville",       coords: [ -86.8,  36.2], agentIdx: 10, cardLeft: false, cardDown: false },
  { city: "Austin",          coords: [ -97.7,  30.3], agentIdx: 11, cardLeft: false, cardDown: false },
  { city: "Philadelphia",    coords: [ -75.2,  40.0], agentIdx:  0, cardLeft: false, cardDown: false },
  { city: "Washington DC",   coords: [ -77.0,  38.9], agentIdx:  1, cardLeft: false, cardDown: false },
  { city: "Charlotte",       coords: [ -80.8,  35.2], agentIdx:  2, cardLeft: false, cardDown: false },
  { city: "San Diego",       coords: [-117.2,  32.7], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Ottawa",          coords: [ -75.7,  45.4], agentIdx:  4, cardLeft: false, cardDown: true  },
  { city: "Edmonton",        coords: [-113.5,  53.5], agentIdx:  5, cardLeft: false, cardDown: true  },
  { city: "Winnipeg",        coords: [ -97.1,  49.9], agentIdx:  6, cardLeft: false, cardDown: false },
  { city: "Monterrey",       coords: [-100.3,  25.7], agentIdx:  7, cardLeft: false, cardDown: false },
  { city: "Havana",          coords: [ -82.4,  23.1], agentIdx:  8, cardLeft: false, cardDown: false },
  // ── Central America & Caribbean ────────────────────────────────────────────
  { city: "Panama City",     coords: [ -79.5,   9.0], agentIdx:  9, cardLeft: false, cardDown: false },
  { city: "San José",        coords: [ -84.1,   9.9], agentIdx: 10, cardLeft: false, cardDown: false },
  { city: "Guatemala City",  coords: [ -90.5,  14.6], agentIdx: 11, cardLeft: false, cardDown: false },
  // ── South America ──────────────────────────────────────────────────────────
  { city: "São Paulo",       coords: [ -46.6, -23.5], agentIdx:  0, cardLeft: false, cardDown: false },
  { city: "Buenos Aires",    coords: [ -58.4, -34.6], agentIdx:  1, cardLeft: false, cardDown: false },
  { city: "Bogota",          coords: [ -74.1,   4.7], agentIdx:  2, cardLeft: false, cardDown: false },
  { city: "Lima",            coords: [ -77.0, -12.0], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Santiago",        coords: [ -70.6, -33.5], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Rio de Janeiro",  coords: [ -43.2, -22.9], agentIdx:  5, cardLeft: false, cardDown: false },
  { city: "Caracas",         coords: [ -66.9,  10.5], agentIdx:  6, cardLeft: false, cardDown: false },
  { city: "Quito",           coords: [ -78.5,  -0.2], agentIdx:  7, cardLeft: false, cardDown: false },
  { city: "Montevideo",      coords: [ -56.2, -34.9], agentIdx:  8, cardLeft: false, cardDown: false },
  { city: "Medellín",        coords: [ -75.6,   6.2], agentIdx:  9, cardLeft: false, cardDown: false },
  { city: "Belo Horizonte",  coords: [ -43.9, -19.9], agentIdx: 10, cardLeft: false, cardDown: false },
  { city: "Fortaleza",       coords: [ -38.5,  -3.7], agentIdx: 11, cardLeft: false, cardDown: false },
  { city: "Recife",          coords: [ -34.9,  -8.1], agentIdx:  0, cardLeft: false, cardDown: false },
  { city: "Manaus",          coords: [ -60.0,  -3.1], agentIdx:  1, cardLeft: false, cardDown: false },
  { city: "La Paz",          coords: [ -68.1, -16.5], agentIdx:  2, cardLeft: false, cardDown: false },
  { city: "Asunción",        coords: [ -57.6, -25.3], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Guayaquil",       coords: [ -79.9,  -2.2], agentIdx:  4, cardLeft: false, cardDown: false },
  // ── Europe ─────────────────────────────────────────────────────────────────
  { city: "London",          coords: [  -0.1,  51.5], agentIdx:  8, cardLeft: false, cardDown: true  },
  { city: "Paris",           coords: [   2.3,  48.9], agentIdx:  9, cardLeft: false, cardDown: true  },
  { city: "Berlin",          coords: [  13.4,  52.5], agentIdx: 10, cardLeft: false, cardDown: true  },
  { city: "Madrid",          coords: [  -3.7,  40.4], agentIdx: 11, cardLeft: false, cardDown: false },
  { city: "Amsterdam",       coords: [   4.9,  52.4], agentIdx:  0, cardLeft: false, cardDown: true  },
  { city: "Stockholm",       coords: [  18.1,  59.3], agentIdx:  1, cardLeft: false, cardDown: true  },
  { city: "Warsaw",          coords: [  21.0,  52.2], agentIdx:  2, cardLeft: false, cardDown: true  },
  { city: "Rome",            coords: [  12.5,  41.9], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Istanbul",        coords: [  28.9,  41.0], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Zurich",          coords: [   8.5,  47.4], agentIdx:  5, cardLeft: false, cardDown: true  },
  { city: "Vienna",          coords: [  16.4,  48.2], agentIdx:  6, cardLeft: false, cardDown: true  },
  { city: "Oslo",            coords: [  10.7,  59.9], agentIdx:  7, cardLeft: false, cardDown: true  },
  { city: "Brussels",        coords: [   4.4,  50.8], agentIdx:  8, cardLeft: false, cardDown: true  },
  { city: "Athens",          coords: [  23.7,  38.0], agentIdx:  9, cardLeft: false, cardDown: false },
  { city: "Helsinki",        coords: [  24.9,  60.2], agentIdx: 10, cardLeft: false, cardDown: true  },
  { city: "Lisbon",          coords: [  -9.1,  38.7], agentIdx: 11, cardLeft: false, cardDown: false },
  { city: "Prague",          coords: [  14.5,  50.1], agentIdx:  0, cardLeft: false, cardDown: true  },
  { city: "Kyiv",            coords: [  30.5,  50.5], agentIdx:  1, cardLeft: false, cardDown: true  },
  { city: "Bucharest",       coords: [  26.1,  44.4], agentIdx:  2, cardLeft: false, cardDown: false },
  { city: "Budapest",        coords: [  19.0,  47.5], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Barcelona",       coords: [   2.2,  41.4], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Munich",          coords: [  11.6,  48.1], agentIdx:  5, cardLeft: false, cardDown: true  },
  { city: "Copenhagen",      coords: [  12.6,  55.7], agentIdx:  6, cardLeft: false, cardDown: true  },
  { city: "Dublin",          coords: [  -6.3,  53.3], agentIdx:  7, cardLeft: false, cardDown: true  },
  { city: "Milan",           coords: [   9.2,  45.5], agentIdx:  8, cardLeft: false, cardDown: false },
  // ── Africa ─────────────────────────────────────────────────────────────────
  { city: "Lagos",           coords: [   3.4,   6.5], agentIdx:  9, cardLeft: false, cardDown: false },
  { city: "Cairo",           coords: [  31.2,  30.0], agentIdx: 10, cardLeft: false, cardDown: false },
  { city: "Nairobi",         coords: [  36.8,  -1.3], agentIdx: 11, cardLeft: false, cardDown: false },
  { city: "Johannesburg",    coords: [  28.0, -26.2], agentIdx:  0, cardLeft: false, cardDown: false },
  { city: "Casablanca",      coords: [  -7.6,  33.6], agentIdx:  1, cardLeft: false, cardDown: false },
  { city: "Accra",           coords: [  -0.2,   5.6], agentIdx:  2, cardLeft: false, cardDown: false },
  { city: "Addis Ababa",     coords: [  38.7,   9.0], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Kinshasa",        coords: [  15.3,  -4.3], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Dar es Salaam",   coords: [  39.3,  -6.8], agentIdx:  5, cardLeft: false, cardDown: false },
  { city: "Dakar",           coords: [ -17.4,  14.7], agentIdx:  6, cardLeft: false, cardDown: false },
  { city: "Kampala",         coords: [  32.6,   0.3], agentIdx:  7, cardLeft: false, cardDown: false },
  { city: "Abidjan",         coords: [  -4.0,   5.3], agentIdx:  8, cardLeft: false, cardDown: false },
  { city: "Khartoum",        coords: [  32.5,  15.6], agentIdx:  9, cardLeft: false, cardDown: false },
  { city: "Tunis",           coords: [  10.2,  36.8], agentIdx: 10, cardLeft: false, cardDown: false },
  { city: "Algiers",         coords: [   3.1,  36.7], agentIdx: 11, cardLeft: false, cardDown: false },
  { city: "Luanda",          coords: [  13.2,  -8.8], agentIdx:  0, cardLeft: false, cardDown: false },
  { city: "Maputo",          coords: [  32.6, -25.9], agentIdx:  1, cardLeft: false, cardDown: false },
  { city: "Antananarivo",    coords: [  47.5, -18.9], agentIdx:  2, cardLeft: false, cardDown: false },
  // ── Middle East ────────────────────────────────────────────────────────────
  { city: "Dubai",           coords: [  55.3,  25.2], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Riyadh",          coords: [  46.7,  24.7], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Tel Aviv",        coords: [  34.8,  32.1], agentIdx:  5, cardLeft: false, cardDown: false },
  { city: "Tehran",          coords: [  51.4,  35.7], agentIdx:  6, cardLeft: false, cardDown: false },
  { city: "Baghdad",         coords: [  44.4,  33.3], agentIdx:  7, cardLeft: false, cardDown: false },
  { city: "Amman",           coords: [  35.9,  31.9], agentIdx:  8, cardLeft: false, cardDown: false },
  { city: "Muscat",          coords: [  58.6,  23.6], agentIdx:  9, cardLeft: false, cardDown: false },
  { city: "Doha",            coords: [  51.5,  25.3], agentIdx: 10, cardLeft: false, cardDown: false },
  // ── Central & South Asia ───────────────────────────────────────────────────
  { city: "Mumbai",          coords: [  72.9,  19.1], agentIdx: 11, cardLeft: false, cardDown: false },
  { city: "Delhi",           coords: [  77.2,  28.6], agentIdx:  0, cardLeft: false, cardDown: false },
  { city: "Bangalore",       coords: [  77.6,  12.9], agentIdx:  1, cardLeft: false, cardDown: false },
  { city: "Karachi",         coords: [  67.0,  24.9], agentIdx:  2, cardLeft: false, cardDown: false },
  { city: "Dhaka",           coords: [  90.4,  23.7], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Lahore",          coords: [  74.3,  31.5], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Colombo",         coords: [  79.9,   6.9], agentIdx:  5, cardLeft: false, cardDown: false },
  { city: "Almaty",          coords: [  76.9,  43.2], agentIdx:  6, cardLeft: false, cardDown: false },
  { city: "Hyderabad",       coords: [  78.5,  17.4], agentIdx:  7, cardLeft: false, cardDown: false },
  { city: "Chennai",         coords: [  80.3,  13.1], agentIdx:  8, cardLeft: false, cardDown: false },
  { city: "Kolkata",         coords: [  88.4,  22.6], agentIdx:  9, cardLeft: false, cardDown: false },
  { city: "Islamabad",       coords: [  73.1,  33.7], agentIdx: 10, cardLeft: false, cardDown: true  },
  { city: "Tashkent",        coords: [  69.3,  41.3], agentIdx: 11, cardLeft: false, cardDown: false },
  // ── Russia & Central Eurasia ───────────────────────────────────────────────
  { city: "Moscow",          coords: [  37.6,  55.8], agentIdx:  0, cardLeft: false, cardDown: true  },
  { city: "St. Petersburg",  coords: [  30.3,  59.9], agentIdx:  1, cardLeft: false, cardDown: true  },
  { city: "Novosibirsk",     coords: [  82.9,  55.0], agentIdx:  2, cardLeft: false, cardDown: false },
  // ── Southeast & East Asia ──────────────────────────────────────────────────
  { city: "Bangkok",         coords: [ 100.5,  13.8], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Singapore",       coords: [ 103.8,   1.4], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Ho Chi Minh",     coords: [ 106.7,  10.8], agentIdx:  5, cardLeft: true,  cardDown: false },
  { city: "Jakarta",         coords: [ 106.8,  -6.2], agentIdx:  6, cardLeft: true,  cardDown: false },
  { city: "Manila",          coords: [ 121.0,  14.6], agentIdx:  7, cardLeft: true,  cardDown: false },
  { city: "Beijing",         coords: [ 116.4,  39.9], agentIdx:  8, cardLeft: true,  cardDown: true  },
  { city: "Shanghai",        coords: [ 121.5,  31.2], agentIdx:  9, cardLeft: true,  cardDown: false },
  { city: "Seoul",           coords: [ 127.0,  37.6], agentIdx: 10, cardLeft: true,  cardDown: true  },
  { city: "Tokyo",           coords: [ 139.7,  35.7], agentIdx: 11, cardLeft: true,  cardDown: false },
  { city: "Osaka",           coords: [ 135.5,  34.7], agentIdx:  0, cardLeft: true,  cardDown: false },
  { city: "Taipei",          coords: [ 121.6,  25.0], agentIdx:  1, cardLeft: true,  cardDown: false },
  { city: "Kuala Lumpur",    coords: [ 101.7,   3.1], agentIdx:  2, cardLeft: false, cardDown: false },
  { city: "Hanoi",           coords: [ 105.8,  21.0], agentIdx:  3, cardLeft: false, cardDown: false },
  { city: "Yangon",          coords: [  96.2,  16.8], agentIdx:  4, cardLeft: false, cardDown: false },
  { city: "Guangzhou",       coords: [ 113.3,  23.1], agentIdx:  5, cardLeft: true,  cardDown: false },
  { city: "Shenzhen",        coords: [ 114.1,  22.5], agentIdx:  6, cardLeft: true,  cardDown: false },
  { city: "Chengdu",         coords: [ 104.1,  30.7], agentIdx:  7, cardLeft: false, cardDown: false },
  { city: "Hong Kong",       coords: [ 114.2,  22.3], agentIdx:  8, cardLeft: true,  cardDown: false },
  { city: "Phnom Penh",      coords: [ 104.9,  11.6], agentIdx:  9, cardLeft: false, cardDown: false },
  // ── Oceania ────────────────────────────────────────────────────────────────
  { city: "Sydney",          coords: [ 151.2, -33.9], agentIdx: 10, cardLeft: true,  cardDown: false },
  { city: "Melbourne",       coords: [ 144.9, -37.8], agentIdx: 11, cardLeft: true,  cardDown: false },
  { city: "Auckland",        coords: [ 174.8, -36.9], agentIdx:  0, cardLeft: true,  cardDown: false },
  { city: "Brisbane",        coords: [ 153.0, -27.5], agentIdx:  1, cardLeft: true,  cardDown: false },
  { city: "Perth",           coords: [ 115.9, -31.9], agentIdx:  2, cardLeft: false, cardDown: false },
];

// ─── Left panel — identical to TenKAgentsVideo ───────────────────────────────
const TextPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  const wordSpring = (localFrame: number) =>
    spring({
      fps,
      frame: Math.max(0, localFrame),
      config: { stiffness: 700, damping: 32, mass: 0.8 },
      durationInFrames: 14,
      to: 1,
    });

  const rawCount = interpolate(frame, [COUNTER_START, COUNTER_END], [0, 10000], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });
  const displayCount = Math.round(rawCount).toLocaleString();

  const counterPop = wordSpring(frame - COUNTER_START);
  const counterY = interpolate(counterPop, [0, 1], [36, 0]);
  const counterOpacity = interpolate(counterPop, [0, 1], [0, 1]);
  const counterScale = interpolate(counterPop, [0, 1], [0.72, 1]);

  const HEADLINE_WORDS = ["Claw", "Agents"];

  const sentencePop = wordSpring(frame - SENTENCE_DELAY);
  const sentenceY = interpolate(sentencePop, [0, 1], [28, 0]);
  const sentenceOpacity = interpolate(sentencePop, [0, 1], [0, 1]);

  const textStyle: React.CSSProperties = {
    fontFamily: brand.fonts.heading,
    letterSpacing: "-0.06em",
    color: "#ffffff",
    textAlign: "left" as const,
  };

  const videoTime = Math.min(frame / fps, FREEZE_AT_FRAME / fps);

  return (
    <AbsoluteFill style={{ overflow: "hidden" }}>
      <OffthreadVideo
        src={staticFile("9256342-hd_1920_1080_24fps.mp4")}
        time={videoTime}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          filter: "hue-rotate(-65deg) saturate(1.6) brightness(0.6)",
        }}
      />
      {/* Forces any grey/neutral tones to adopt the blue hue */}
      <div
        style={{
          position: "absolute",
          inset: 0,
          background: "#1e3a8a",
          mixBlendMode: "color",
          opacity: 0.75,
          pointerEvents: "none",
        }}
      />
      <AbsoluteFill
        style={{
          display: "flex",
          flexDirection: "column",
          alignItems: "flex-start",
          justifyContent: "center",
          paddingLeft: 64,
          paddingRight: 32,
          gap: 0,
        }}
      >
        <div
          style={{
            ...textStyle,
            fontSize: 148,
            fontWeight: 700,
            lineHeight: 1,
            opacity: counterOpacity,
            transform: `translateY(${counterY}px) scale(${counterScale})`,
            transformOrigin: "left bottom",
          }}
        >
          {displayCount}
        </div>

        <div
          style={{
            display: "flex",
            flexDirection: "row",
            alignItems: "baseline",
            gap: 18,
            marginTop: 4,
          }}
        >
          {HEADLINE_WORDS.map((word, i) => {
            const pop = wordSpring(frame - CLAW_DELAY - i * WORD_STAGGER);
            const y = interpolate(pop, [0, 1], [36, 0]);
            const opacity = interpolate(pop, [0, 1], [0, 1]);
            const scale = interpolate(pop, [0, 1], [0.72, 1]);
            return (
              <div
                key={word}
                style={{
                  ...textStyle,
                  fontSize: 110,
                  fontWeight: 700,
                  lineHeight: 1.05,
                  opacity,
                  transform: `translateY(${y}px) scale(${scale})`,
                  transformOrigin: "left bottom",
                }}
              >
                {word}
              </div>
            );
          })}
        </div>

        <div
          style={{
            ...textStyle,
            fontSize: 45,
            fontWeight: 500,
            lineHeight: 1.3,
            color: "rgba(255,255,255,0.85)",
            marginTop: 28,
            opacity: sentenceOpacity,
            transform: `translateY(${sentenceY}px)`,
          }}
        >
          now live on Blink.new
        </div>
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ─── Globe right panel ────────────────────────────────────────────────────────
const CARD_W_PX = 132;
const CARD_H_PX = 54;

const WorldMapPanel: React.FC = () => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();

  // Spin from Asia-Pacific to Americas in first GLOBE_SETTLE frames, then hold
  const rotateLon = interpolate(frame, [0, GLOBE_SETTLE], [GLOBE_SPIN_START, GLOBE_SPIN_END], {
    extrapolateLeft: "clamp",
    extrapolateRight: "clamp",
    easing: Easing.out(Easing.cubic),
  });

  // Build the same projection react-simple-maps uses internally.
  // This lets us compute exact pixel coords for every pin each frame,
  // so HTML cards track the globe surface perfectly.
  const projection = geoOrthographic()
    .scale(GLOBE_SCALE)
    .translate([MAP_W / 2, CANVAS_H / 2])
    .rotate([-rotateLon, -8, 0]);

  // Pre-project all pins. geoOrthographic returns null for back-hemisphere points.
  const projected = PINS.map((pin) => projection(pin.coords));

  return (
    <AbsoluteFill style={{ background: "#e8f4fb", overflow: "hidden" }}>

      {/* ── SVG layer: globe base + dots/lines ──────────────────────────────── */}
      <ComposableMap
        width={MAP_W}
        height={CANVAS_H}
        projection="geoOrthographic"
        projectionConfig={{ scale: GLOBE_SCALE, rotate: [-rotateLon, -8, 0] }}
        style={{ width: "100%", height: "100%", position: "absolute", top: 0, left: 0 }}
      >
        {/* Ocean */}
        <Sphere id="rsm-sphere" fill="#c5e3f5" stroke="#6eb0d8" strokeWidth={2} />
        {/* Grid */}
        <Graticule stroke="#a0cce8" strokeWidth={0.5} />
        {/* Land */}
        <Geographies geography={GEO_URL}>
          {({ geographies }) =>
            geographies.map((geo) => (
              <Geography
                key={geo.rsmKey}
                geography={geo}
                fill="#ddeef8"
                stroke="#85b4d0"
                strokeWidth={0.5}
                style={{
                  default: { outline: "none" },
                  hover:   { outline: "none" },
                  pressed: { outline: "none" },
                }}
              />
            ))
          }
        </Geographies>

        {/* Dots + connecting lines rendered directly in SVG coordinate space */}
        {PINS.map((pin, i) => {
          const pos = projected[i];
          if (!pos) return null; // back hemisphere — naturally hidden

          const appearFrame = PIN_APPEAR_START + i * PIN_STAGGER;
          const localFrame  = frame - appearFrame;
          if (localFrame < 0) return null;

          // Only block pop-in near the limb during the first 10 frames of a pin's life.
          // After that, keep it visible as long as d3-geo says it's on the front hemisphere.
          if (localFrame < 10) {
            const toRad = (d: number) => (d * Math.PI) / 180;
            const [pLon, pLat] = pin.coords;
            const a = Math.sin(toRad((pLat - 8) / 2)) ** 2
              + Math.cos(toRad(8)) * Math.cos(toRad(pLat))
              * Math.sin(toRad((pLon - rotateLon) / 2)) ** 2;
            const angDist = 2 * Math.asin(Math.sqrt(a)) * (180 / Math.PI);
            if (angDist > 72) return null;
          }

          const [x, y] = pos;

          const pinSpring = spring({ fps, frame: localFrame, config: { stiffness: 480, damping: 28 }, durationInFrames: 20, to: 1 });
          const opacity   = interpolate(pinSpring, [0, 1], [0, 1]);
          const dotScale  = interpolate(pinSpring, [0, 1], [0, 1]);
          const pulse     = (Math.sin((frame / 60) * Math.PI * 2.5) + 1) / 2;
          const ringR     = interpolate(pulse, [0, 1], [4, 10]);
          const ringOpacity = interpolate(pulse, [0, 1], [0.5, 0]);

          // Card offset direction: auto-flip near right/top edges
          const goLeft = x > MAP_W * 0.68;
          const goDown = y < CANVAS_H * 0.18;
          const lineDX = goLeft ? -13 : 13;
          const lineDY = goDown ?  13 : -13;

          return (
            <g key={pin.city} transform={`translate(${x},${y})`} opacity={opacity}>
              <line x1={0} y1={0} x2={lineDX} y2={lineDY} stroke="#16a34a" strokeWidth={0.8} opacity={0.5} />
              <circle r={ringR} fill="none" stroke="#22c55e" strokeWidth={1} opacity={ringOpacity} />
              <circle r={3.5} fill="#22c55e" transform={`scale(${dotScale})`} />
            </g>
          );
        })}
      </ComposableMap>

      {/* ── HTML card overlay: positioned from the same projection ─────────── */}
      <div style={{ position: "absolute", inset: 0, pointerEvents: "none" }}>
        {PINS.map((pin, i) => {
          const pos = projected[i];
          if (!pos) return null; // back hemisphere

          const appearFrame = PIN_APPEAR_START + i * PIN_STAGGER;
          const localFrame  = frame - appearFrame;
          if (localFrame < 0) return null;

          // Same pop-in guard: only block limb cards during first 10 frames
          if (localFrame < 10) {
            const toRad = (d: number) => (d * Math.PI) / 180;
            const [pLon, pLat] = pin.coords;
            const a = Math.sin(toRad((pLat - 8) / 2)) ** 2
              + Math.cos(toRad(8)) * Math.cos(toRad(pLat))
              * Math.sin(toRad((pLon - rotateLon) / 2)) ** 2;
            const angDist = 2 * Math.asin(Math.sqrt(a)) * (180 / Math.PI);
            if (angDist > 72) return null;
          }

          const [x, y] = pos;

          const pinSpring = spring({ fps, frame: localFrame, config: { stiffness: 480, damping: 28 }, durationInFrames: 20, to: 1 });
          const opacity   = interpolate(pinSpring, [0, 1], [0, 1]);
          const cardScale = interpolate(pinSpring, [0, 1], [0.5, 1]);
          const goLeft = x > MAP_W * 0.68;
          const goDown = y < CANVAS_H * 0.18;
          const cardX  = goLeft ? x - CARD_W_PX - 16 : x + 16;
          const cardY  = goDown ? y + 16 : y - CARD_H_PX - 16;

          const agent  = AGENTS[pin.agentIdx % AGENTS.length];

          return (
            <div
              key={pin.city}
              style={{
                position: "absolute",
                left: cardX,
                top: cardY,
                width: CARD_W_PX,
                height: CARD_H_PX,
                opacity,
                transform: `scale(${cardScale})`,
                transformOrigin: goLeft ? "right center" : "left center",
                background: "#ffffff",
                borderRadius: 7,
                padding: "6px 8px",
                display: "flex",
                flexDirection: "column",
                gap: 4,
                boxSizing: "border-box",
                fontFamily: brand.fonts.body,
                letterSpacing: "-0.04em",
                border: "1px solid #d1e9f5",
                boxShadow: "0 2px 8px rgba(0,80,160,0.12)",
              }}
            >
              <div style={{ display: "flex", alignItems: "center", gap: 5 }}>
                <img
                  src={staticFile(`avatars/${agent.avatar}`)}
                  style={{ width: 20, height: 20, borderRadius: "50%", objectFit: "cover", flexShrink: 0 }}
                />
                <span style={{ fontSize: 9.5, fontWeight: 700, color: "#0f172a", lineHeight: 1.2, overflow: "hidden", textOverflow: "ellipsis", whiteSpace: "nowrap" }}>
                  {agent.name}
                </span>
              </div>
              <div style={{ display: "flex", alignItems: "center", gap: 4 }}>
                <div style={{ width: 5, height: 5, borderRadius: "50%", background: "#22c55e", flexShrink: 0 }} />
                <span style={{ fontSize: 8, color: "#16a34a", fontWeight: 500 }}>Running</span>
                <span style={{ fontSize: 7.5, color: "#64748b", marginLeft: 2 }}>· {pin.city}</span>
              </div>
            </div>
          );
        })}
      </div>
    </AbsoluteFill>
  );
};

// ─── Shared layout ────────────────────────────────────────────────────────────
const WorldMapLayout: React.FC = () => (
  <AbsoluteFill style={{ flexDirection: "row" }}>
    <div
      style={{
        width: TEXT_W,
        height: CANVAS_H,
        flexShrink: 0,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <TextPanel />
    </div>
    <div
      style={{
        width: MAP_W,
        height: CANVAS_H,
        position: "relative",
        overflow: "hidden",
      }}
    >
      <WorldMapPanel />
    </div>
  </AbsoluteFill>
);

// ─── Composition export ───────────────────────────────────────────────────────
export const WorldMapVideo: React.FC = () => {
  const frame = useCurrentFrame();
  return (
    <Freeze frame={Math.min(frame, FREEZE_AT_FRAME)}>
      <WorldMapLayout />
    </Freeze>
  );
};
