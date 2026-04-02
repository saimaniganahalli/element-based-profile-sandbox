"use client";

import { useState, useRef, useCallback, useMemo, useEffect } from "react";
import {
  StudentProfile,
  getAllObservedElements,
  Year,
  Semester,
} from "@/data/profile";
import {
  SKILL_RECIPES,
  findSurpriseCapability,
  findCapabilityForSkills,
  CAPABILITY_RECIPES,
} from "@/data/skills";

// ─── Types ──────────────────────────────────────────────────────────────────────

interface ElementEntity {
  id: string;
  element: string;
  subjects: string[];
  capabilities: string[];
  firstSeen: { year: Year; semester: Semester };
  x: number;
  y: number;
  rotation: number;
}

// Snapshot of a skill stack saved at the moment two stacks merge.
// Used to restore skill stacks when a capability stack is broken apart.
interface SkillStackSnapshot {
  id: string;
  brickIds: string[];
  skillName: string | null;
  skillColor: string | null;
  skillDescription: string | null;
}

interface BrickStack {
  id: string;
  brickIds: string[]; // ordered bottom → top
  x: number;
  y: number;
  skillName: string | null;
  skillColor: string | null;
  skillDescription: string | null;
  capabilityName: string | null;
  capabilityColor: string | null;
  capabilityDescription: string | null;
  isSurprise: boolean;
  justFormed: boolean;
  // Set when two skill stacks merge into a capability stack.
  // Break-apart restores these rather than scattering raw elements.
  mergedFrom?: [SkillStackSnapshot, SkillStackSnapshot];
}

interface PendingScratchie {
  stackId: string;
  position: { x: number; y: number };
  name: string;
  color: string;
  description: string;
  type: "skill" | "capability";
}

type TabId = "elements" | "skills" | "capabilities";

// ─── Constants ──────────────────────────────────────────────────────────────────

const BRICK_W = 124;
const BRICK_H = 40;
const BRICK_DEPTH = 5; // 3D shadow slab height
const STACK_OVERLAP = 10;
const SNAP_RADIUS = 80;

const BRICK_COLOR = "#C4A882";
const BRICK_COLOR_DARK = "#8B6B5A";

const SEMESTERS: { year: Year; semester: Semester; label: string }[] = [
  { year: 10, semester: 1, label: "Y10 S1" },
  { year: 10, semester: 2, label: "Y10 S2" },
  { year: 11, semester: 1, label: "Y11 S1" },
  { year: 11, semester: 2, label: "Y11 S2" },
  { year: 12, semester: 1, label: "Y12 S1" },
  { year: 12, semester: 2, label: "Y12 S2" },
];

function semesterIndex(y: Year, s: Semester) {
  return (y - 10) * 2 + (s - 1);
}

function stackHeight(count: number) {
  return count * (BRICK_H - STACK_OVERLAP) + STACK_OVERLAP + BRICK_DEPTH;
}

// ─── Colour helpers ──────────────────────────────────────────────────────────────

function lighten(hex: string, amount: number): string {
  const clean = hex.replace("#", "").slice(0, 6);
  if (clean.length < 6) return hex;
  const n = parseInt(clean, 16);
  const r = Math.min(255, Math.max(0, ((n >> 16) & 0xff) + Math.round(amount * 255)));
  const g = Math.min(255, Math.max(0, ((n >> 8) & 0xff) + Math.round(amount * 255)));
  const b = Math.min(255, Math.max(0, (n & 0xff) + Math.round(amount * 255)));
  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
}

// ─── Web Audio ──────────────────────────────────────────────────────────────────
// Synthesised sounds — no external files needed.
// AudioContext is created lazily on first user gesture to satisfy browser policy.

let _actx: AudioContext | null = null;

function getACtx(): AudioContext | null {
  try {
    if (!_actx) _actx = new AudioContext();
    if (_actx.state === "suspended") void _actx.resume();
    return _actx;
  } catch {
    return null;
  }
}

function synthNote(
  freq: number,
  endFreq: number,
  dur: number,
  vol: number,
  type: OscillatorType = "sine"
) {
  const ctx = getACtx();
  if (!ctx) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  osc.type = type;
  osc.connect(gain);
  gain.connect(ctx.destination);
  osc.frequency.setValueAtTime(freq, ctx.currentTime);
  osc.frequency.exponentialRampToValueAtTime(Math.max(endFreq, 1), ctx.currentTime + dur);
  gain.gain.setValueAtTime(vol, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + dur);
  osc.start(ctx.currentTime);
  osc.stop(ctx.currentTime + dur + 0.01);
}

function playPickup() {
  synthNote(600, 360, 0.07, 0.12, "sine");
}

function playSnap() {
  synthNote(320, 110, 0.13, 0.28, "triangle");
  // brief overtone click
  setTimeout(() => synthNote(900, 400, 0.04, 0.09, "sine"), 15);
}

function playBreak() {
  synthNote(180, 520, 0.1, 0.14, "sawtooth");
  setTimeout(() => synthNote(500, 220, 0.07, 0.07, "sine"), 20);
}

// ─── Scatter initializer (single call to avoid double-random positions) ──────────

function scatterInit(profile: StudentProfile): {
  elements: ElementEntity[];
  positions: Record<string, { x: number; y: number; rotation: number }>;
} {
  const observed = getAllObservedElements(profile);
  const cols = 5;
  const W = 680;
  const H = 420;
  const elements = observed.map((el, i) => {
    const col = i % cols;
    const row = Math.floor(i / cols);
    const rows = Math.ceil(observed.length / cols);
    const cw = W / cols;
    const ch = H / Math.max(rows, 1);
    return {
      id: `el-${i}-${el.element.replace(/\s+/g, "_")}`,
      element: el.element,
      subjects: el.subjects,
      capabilities: el.capabilities,
      firstSeen: el.firstSeen,
      x: Math.max(16, Math.min(30 + col * cw + (Math.random() - 0.5) * cw * 0.28, W - BRICK_W - 16)),
      y: Math.max(16, Math.min(30 + row * ch + (Math.random() - 0.5) * ch * 0.22, H - BRICK_H - BRICK_DEPTH - 16)),
      rotation: (Math.random() - 0.5) * 14,
    };
  });
  const positions: Record<string, { x: number; y: number; rotation: number }> = {};
  elements.forEach((e) => {
    positions[e.id] = { x: e.x, y: e.y, rotation: e.rotation };
  });
  return { elements, positions };
}

// ─── Brick3D ─────────────────────────────────────────────────────────────────────
// Physical LEGO-style block with:
//  - shadow slab (3D bottom edge) — only shown for free bricks or bottom of stack
//  - top face with subtle gradient
//  - 3 studs extruding above the face
//  - face lifts when dragging (translateY) revealing more shadow

function Brick3D({
  label,
  color,
  isDragging = false,
  showDepth = true,
  width = BRICK_W,
}: {
  label: string;
  color: string;
  isDragging?: boolean;
  showDepth?: boolean;
  width?: number;
}) {
  const darker = lighten(color, -0.18);
  const faceTop = lighten(color, 0.1);
  const liftY = isDragging ? -5 : 0;
  const containerH = BRICK_H + (showDepth ? BRICK_DEPTH : 0);

  return (
    <div style={{ width, height: containerH, position: "relative" }}>
      {/* Shadow slab — stays at natural position while face lifts */}
      {showDepth && (
        <div
          style={{
            position: "absolute",
            left: 0,
            top: BRICK_DEPTH,
            width,
            height: BRICK_H,
            borderRadius: 6,
            backgroundColor: darker,
          }}
        />
      )}

      {/* Studs — sit above the face, inside the outer container */}
      <div
        style={{
          position: "absolute",
          top: liftY - 5,
          left: "50%",
          transform: "translateX(-50%)",
          display: "flex",
          gap: 8,
          zIndex: 4,
          pointerEvents: "none",
        }}
      >
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            style={{
              width: 10,
              height: 6,
              borderRadius: "3px 3px 2px 2px",
              background: `linear-gradient(180deg, ${faceTop} 0%, ${color} 100%)`,
              boxShadow: `0 -1px 0 ${faceTop}`,
            }}
          />
        ))}
      </div>

      {/* Face */}
      <div
        style={{
          position: "absolute",
          left: 0,
          top: liftY,
          width,
          height: BRICK_H,
          borderRadius: 6,
          background: `linear-gradient(175deg, ${faceTop} 0%, ${color} 55%)`,
          transition: isDragging ? "none" : "top 0.1s",
          zIndex: 2,
          overflow: "hidden",
        }}
      >
        {/* Inner top highlight */}
        <div
          style={{
            position: "absolute",
            top: 1,
            left: 5,
            right: 5,
            height: 2,
            borderRadius: 2,
            background: "rgba(255,255,255,0.18)",
          }}
        />
        {/* Label */}
        <div
          style={{
            position: "absolute",
            inset: 0,
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            padding: "0 8px",
          }}
        >
          <span
            style={{
              fontSize: 10.5,
              fontWeight: 500,
              color: "rgba(255,255,255,0.93)",
              textAlign: "center",
              lineHeight: 1.25,
              userSelect: "none",
            }}
          >
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

// ─── Scratchie ──────────────────────────────────────────────────────────────────

function ScratchieCard({
  item,
  onRevealed,
  onStartOver,
}: {
  item: PendingScratchie;
  onRevealed: () => void;
  onStartOver: () => void;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const scratching = useRef(false);
  const area = useRef(0);
  const [revealed, setRevealed] = useState(false);
  const W = 240;
  const H = 136;

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d")!;
    const g = ctx.createLinearGradient(0, 0, W, H);
    g.addColorStop(0, "#C8C8C8");
    g.addColorStop(0.4, "#EBEBEB");
    g.addColorStop(0.6, "#EBEBEB");
    g.addColorStop(1, "#C8C8C8");
    ctx.fillStyle = g;
    ctx.beginPath();
    ctx.roundRect(0, 0, W, H, 14);
    ctx.fill();
    for (let i = 0; i < 280; i++) {
      ctx.fillStyle = `rgba(255,255,255,${Math.random() * 0.35})`;
      ctx.fillRect(Math.random() * W, Math.random() * H, 1.5, 1.5);
    }
    ctx.fillStyle = "#B0B0B0";
    ctx.font = "500 13px system-ui";
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText("Scratch to reveal", W / 2, H / 2 - 9);
    ctx.font = "400 11px system-ui";
    ctx.fillStyle = "#C0C0C0";
    ctx.fillText("Something has formed…", W / 2, H / 2 + 10);
  }, []);

  const onScratch = useCallback(
    (e: React.PointerEvent) => {
      if (!scratching.current || revealed) return;
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d")!;
      const r = canvas.getBoundingClientRect();
      const x = e.clientX - r.left;
      const y = e.clientY - r.top;
      ctx.globalCompositeOperation = "destination-out";
      ctx.beginPath();
      ctx.arc(x, y, 22, 0, Math.PI * 2);
      ctx.fill();
      area.current += Math.PI * 22 * 22;
      if (area.current / (W * H) > 0.38) {
        setRevealed(true);
        setTimeout(onRevealed, 1000);
      }
    },
    [revealed, onRevealed]
  );

  return (
    <div
      className="scratchie-card absolute z-50 rounded-2xl overflow-hidden shadow-2xl"
      style={{ left: item.position.x - W / 2, top: item.position.y - H / 2, width: W, height: H }}
    >
      <div
        className="absolute inset-0 flex flex-col items-center justify-center text-center p-4 rounded-2xl"
        style={{ backgroundColor: item.color }}
      >
        <span className="text-white/50 text-[9px] uppercase tracking-widest mb-1">
          {item.type === "skill" ? "Skill discovered" : (
            <span className="text-amber-200">✦ Surprise Capability</span>
          )}
        </span>
        <h3 className="text-white text-xl font-bold mb-1">{item.name}</h3>
        <p className="text-white/70 text-[10px] leading-snug max-w-[190px]">{item.description}</p>
        {revealed && (
          <button
            onClick={onStartOver}
            className="mt-3 text-[10px] text-white/50 underline cursor-pointer hover:text-white/80"
          >
            Start over
          </button>
        )}
      </div>
      {!revealed && (
        <canvas
          ref={canvasRef}
          width={W}
          height={H}
          className="absolute inset-0 z-10 rounded-2xl"
          style={{ touchAction: "none", cursor: "crosshair" }}
          onPointerDown={() => { scratching.current = true; }}
          onPointerMove={onScratch}
          onPointerUp={() => { scratching.current = false; }}
          onPointerLeave={() => { scratching.current = false; }}
        />
      )}
    </div>
  );
}

// ─── Stack detail popover ────────────────────────────────────────────────────────

function StackPopover({
  stack,
  elements,
  onDismiss,
  onDissolve,
  onAddToProfile,
  inProfile,
}: {
  stack: BrickStack;
  elements: ElementEntity[];
  onDismiss: () => void;
  onDissolve: () => void;
  onAddToProfile: () => void;
  inProfile: boolean;
}) {
  const name = stack.capabilityName || stack.skillName;
  const color = stack.capabilityColor || stack.skillColor || BRICK_COLOR;
  const desc = stack.capabilityDescription || stack.skillDescription;
  const brickNames = stack.brickIds.map(
    (id) => elements.find((e) => e.id === id)?.element ?? id
  );
  return (
    <>
      <div className="fixed inset-0 z-40" onClick={onDismiss} />
      <div
        className="absolute z-50 discover-enter"
        style={{ left: stack.x + BRICK_W + 12, top: stack.y - 20 }}
      >
        <div className="bg-surface rounded-xl shadow-xl border border-border p-4 w-60">
          {name ? (
            <>
              <h4 className="text-sm font-bold mb-1 flex items-center gap-1" style={{ color }}>
                {stack.isSurprise && <span className="text-amber-400">★</span>}
                {name}
              </h4>
              {desc && (
                <p className="text-[11px] text-foreground/60 leading-relaxed mb-3">{desc}</p>
              )}
            </>
          ) : (
            <p className="text-[11px] text-muted mb-2">
              {brickNames.length} element{brickNames.length !== 1 ? "s" : ""} combined
            </p>
          )}
          <div className="flex flex-wrap gap-1 mb-3">
            {brickNames.map((n, i) => (
              <span
                key={`${n}-${i}`}
                className="text-[9px] px-2 py-0.5 rounded-full bg-foreground/5 text-foreground/50"
              >
                {n}
              </span>
            ))}
          </div>
          <div className="flex gap-2">
            {name && (
              <button
                onClick={onAddToProfile}
                className={`text-[11px] px-3 py-1.5 rounded-full border transition-all cursor-pointer flex-1 ${
                  inProfile
                    ? "text-white border-transparent"
                    : "border-border text-muted hover:text-foreground"
                }`}
                style={inProfile ? { backgroundColor: color } : undefined}
              >
                {inProfile ? "In Profile" : "+ Profile"}
              </button>
            )}
            <button
              onClick={onDissolve}
              className="text-[11px] px-3 py-1.5 rounded-full border border-border text-muted hover:text-red-400 cursor-pointer transition-colors flex-1"
            >
              {stack.mergedFrom ? "Separate skills" : "Break apart"}
            </button>
          </div>
        </div>
      </div>
    </>
  );
}

// ─── New Elements Modal ──────────────────────────────────────────────────────────

function NewElementsModal({
  elements,
  onDismiss,
}: {
  elements: ElementEntity[];
  onDismiss: () => void;
}) {
  const ANGLES = [-9, 6, -5, 8];
  const X_OFF = [12, 50, 88, 126];
  const Y_OFF = [18, 36, 14, 32];

  return (
    <div
      className="fixed inset-0 z-[60] flex items-center justify-center"
      style={{ backgroundColor: "rgba(0,0,0,0.28)" }}
      onClick={onDismiss}
    >
      <div
        className="bg-white rounded-2xl shadow-2xl overflow-hidden"
        style={{ width: 340 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="px-8 pt-10 pb-8 flex flex-col items-center gap-0">
          <p className="text-base font-semibold text-foreground text-center">
            You&apos;ve earned some
          </p>
          <p className="text-base font-semibold text-foreground text-center mb-8">
            new elements
          </p>

          {/* Scattered brick previews */}
          <div className="relative w-full mb-8" style={{ height: 80 }}>
            {elements.slice(0, 4).map((el, i) => (
              <div
                key={el.id}
                className="absolute"
                style={{
                  left: X_OFF[i] ?? i * 32,
                  top: Y_OFF[i] ?? 20,
                  transform: `rotate(${ANGLES[i] ?? 0}deg)`,
                  zIndex: i + 1,
                }}
              >
                <Brick3D label={el.element} color={BRICK_COLOR} width={100} />
              </div>
            ))}
          </div>

          {elements.length > 4 && (
            <p className="text-[11px] text-muted mb-4">
              +{elements.length - 4} more on your canvas
            </p>
          )}

          <button
            className="w-full py-2.5 rounded-xl bg-foreground text-white text-sm font-medium cursor-pointer hover:bg-foreground/80 transition-colors"
            onClick={onDismiss}
          >
            Keep building
          </button>
        </div>
      </div>
    </div>
  );
}

// ─── Main ────────────────────────────────────────────────────────────────────────

export function BrickSandbox({ profile }: { profile: StudentProfile }) {
  // Initialise both elements + positions from one scatter call to avoid double-random
  const initRef = useRef(scatterInit(profile));

  const [activeTab, setActiveTab] = useState<TabId>("elements");
  const [elements, setElements] = useState<ElementEntity[]>(() => initRef.current.elements);
  const [freePositions, setFreePositions] = useState<Record<string, { x: number; y: number; rotation: number }>>(() => initRef.current.positions);
  const [stacks, setStacks] = useState<BrickStack[]>([]);
  const [stackedIds, setStackedIds] = useState<Set<string>>(new Set());
  const [draggingId, setDraggingId] = useState<string | null>(null);
  const [draggingType, setDraggingType] = useState<"element" | "stack" | null>(null);
  const [selectedStackId, setSelectedStackId] = useState<string | null>(null);
  const [pendingScratchie, setPendingScratchie] = useState<PendingScratchie | null>(null);
  const [notification, setNotification] = useState<string | null>(null);
  const [profileItems, setProfileItems] = useState<Set<string>>(new Set());
  const [timelineIdx, setTimelineIdx] = useState(
    semesterIndex(profile.currentYear, profile.currentSemester)
  );
  const [newElsModal, setNewElsModal] = useState<ElementEntity[] | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const dragOffset = useRef({ x: 0, y: 0 });
  const discoveredCaps = useRef<Set<string>>(new Set());
  const notifTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);
  const prevTimelineIdxRef = useRef(timelineIdx);
  // Tracks elements that have been dropped without snapping — so we only show the
  // "still finding its moment" message once per element, not on every move.
  const lonelydropsSeen = useRef<Set<string>>(new Set());

  // Refs for fresh state reads inside pointer callbacks — avoids stale closures
  const stacksRef = useRef<BrickStack[]>([]);
  const freePositionsRef = useRef<Record<string, { x: number; y: number; rotation: number }>>({});
  const elementsRef = useRef<ElementEntity[]>([]);

  useEffect(() => { stacksRef.current = stacks; }, [stacks]);
  useEffect(() => { freePositionsRef.current = freePositions; }, [freePositions]);
  useEffect(() => { elementsRef.current = elements; }, [elements]);

  // ── New elements modal on timeline advance ──

  useEffect(() => {
    const prev = prevTimelineIdxRef.current;
    prevTimelineIdxRef.current = timelineIdx;
    if (timelineIdx <= prev) return;
    const newly = elements.filter(
      (e) => {
        const idx = semesterIndex(e.firstSeen.year, e.firstSeen.semester);
        return idx > prev && idx <= timelineIdx;
      }
    );
    if (newly.length > 0) setNewElsModal(newly);
  }, [timelineIdx, elements]);

  // ── Derived ──

  const visibleIds = useMemo(
    () =>
      new Set(
        elements
          .filter((e) => semesterIndex(e.firstSeen.year, e.firstSeen.semester) <= timelineIdx)
          .map((e) => e.id)
      ),
    [elements, timelineIdx]
  );

  const freeElements = useMemo(
    () => elements.filter((e) => !stackedIds.has(e.id) && visibleIds.has(e.id)),
    [elements, stackedIds, visibleIds]
  );

  // ── Notification ──

  const showNotif = useCallback((msg: string) => {
    setNotification(msg);
    if (notifTimeout.current) clearTimeout(notifTimeout.current);
    notifTimeout.current = setTimeout(() => setNotification(null), 3500);
  }, []);

  // ── Element drag ──

  const handleElementPointerDown = useCallback(
    (elId: string, e: React.PointerEvent) => {
      if (pendingScratchie) return;
      e.preventDefault();
      playPickup();
      const container = containerRef.current;
      if (!container) return;
      const pos = freePositions[elId];
      if (!pos) return;
      const rect = container.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left - pos.x,
        y: e.clientY - rect.top - pos.y,
      };
      setDraggingId(elId);
      setDraggingType("element");
      setSelectedStackId(null);

      const onMove = (me: PointerEvent) => {
        const r = container.getBoundingClientRect();
        setFreePositions((prev) => ({
          ...prev,
          [elId]: {
            x: me.clientX - r.left - dragOffset.current.x,
            y: me.clientY - r.top - dragOffset.current.y,
            rotation: 0,
          },
        }));
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        setDraggingId(null);
        setDraggingType(null);
        setTimeout(() => snapElementToStack(elId), 0);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [pendingScratchie, freePositions]
  );

  const snapElementToStack = useCallback(
    (elId: string) => {
      const currentStacks = stacksRef.current;
      const currentPos = freePositionsRef.current;
      const currentEls = elementsRef.current;

      // Guard: already in a stack
      if (currentStacks.some((s) => s.brickIds.includes(elId))) return;

      const pos = currentPos[elId];
      if (!pos) return;

      // Join a nearby existing stack — only if it hasn't been named yet.
      // Named stacks (skill or capability) are crystallised: their identity is set.
      const nearStack = currentStacks.find(
        (s) =>
          !s.skillName &&
          !s.capabilityName &&
          Math.hypot(s.x + BRICK_W / 2 - (pos.x + BRICK_W / 2), s.y - pos.y) < SNAP_RADIUS
      );

      if (nearStack) {
        const newBrickIds = [...nearStack.brickIds, elId];
        const newStacks = currentStacks.map((s) =>
          s.id === nearStack.id ? { ...s, brickIds: newBrickIds } : s
        );
        setStackedIds((prev) => new Set([...prev, elId]));
        setStacks(newStacks);
        playSnap();
        return;
      }

      // Pair with a nearby free element → new 2-brick stack
      const nearEl = currentEls.find(
        (e) =>
          e.id !== elId &&
          !currentStacks.some((s) => s.brickIds.includes(e.id)) &&
          visibleIds.has(e.id) &&
          (() => {
            const ep = currentPos[e.id];
            return ep ? Math.hypot(ep.x - pos.x, ep.y - pos.y) < SNAP_RADIUS : false;
          })()
      );

      if (nearEl) {
        const nearPos = currentPos[nearEl.id];
        if (!nearPos) return;
        const newStack: BrickStack = {
          id: `stack-${Date.now()}`,
          brickIds: [nearEl.id, elId],
          x: nearPos.x,
          y: nearPos.y,
          skillName: null, skillColor: null, skillDescription: null,
          capabilityName: null, capabilityColor: null, capabilityDescription: null,
          isSurprise: false,
          justFormed: false,
        };
        setStackedIds((prev) => new Set([...prev, nearEl.id, elId]));
        setStacks((prev) => [...prev, newStack]);
        playSnap();
        showNotif("A new skill stack has been created!");
        return;
      }

      // No snap found — this element is standing alone for now.
      // Only show the message once per element, so it doesn't repeat on every move.
      if (!lonelydropsSeen.current.has(elId)) {
        lonelydropsSeen.current.add(elId);
        const LONELY_MSGS = [
          "This one's still finding its moment — keep exploring ✦",
          "Not all connections show up at once. More might appear next semester.",
          "Some things take time to click. This element's story isn't over.",
        ];
        showNotif(LONELY_MSGS[lonelydropsSeen.current.size % LONELY_MSGS.length]);
      }
    },
    [visibleIds, showNotif]
  );

  // ── Scratchie revealed → label the stack ──

  const onScratchieRevealed = useCallback(() => {
    if (!pendingScratchie) return;
    const { stackId, name, color, description, type } = pendingScratchie;
    setStacks((prev) =>
      prev.map((s) => {
        if (s.id !== stackId) return s;
        if (type === "skill") {
          return { ...s, skillName: name, skillColor: color, skillDescription: description, justFormed: false };
        }
        return { ...s, capabilityName: name, capabilityColor: color, capabilityDescription: description, justFormed: false };
      })
    );
    showNotif(`"${name}" has formed in your stack`);
    setPendingScratchie(null);
  }, [pendingScratchie, showNotif]);

  // ── Stack drag ──

  const handleStackPointerDown = useCallback(
    (stackId: string, e: React.PointerEvent) => {
      if (pendingScratchie) return;
      e.preventDefault();
      playPickup();
      const container = containerRef.current;
      if (!container) return;
      const stack = stacks.find((s) => s.id === stackId);
      if (!stack) return;
      const rect = container.getBoundingClientRect();
      dragOffset.current = {
        x: e.clientX - rect.left - stack.x,
        y: e.clientY - rect.top - stack.y,
      };
      setDraggingId(stackId);
      setDraggingType("stack");
      setSelectedStackId(null);

      const onMove = (me: PointerEvent) => {
        const r = container.getBoundingClientRect();
        setStacks((prev) =>
          prev.map((s) =>
            s.id === stackId
              ? { ...s, x: me.clientX - r.left - dragOffset.current.x, y: me.clientY - r.top - dragOffset.current.y }
              : s
          )
        );
      };

      const onUp = () => {
        document.removeEventListener("pointermove", onMove);
        document.removeEventListener("pointerup", onUp);
        setDraggingId(null);
        setDraggingType(null);
        setTimeout(() => checkStackMerge(stackId), 0);
      };

      document.addEventListener("pointermove", onMove);
      document.addEventListener("pointerup", onUp);
    },
    [stacks, pendingScratchie]
  );

  const checkStackMerge = useCallback(
    (droppedStackId: string) => {
      setStacks((currentStacks) => {
        const dropped = currentStacks.find((s) => s.id === droppedStackId);
        if (!dropped?.skillName) return currentStacks;

        const nearby = currentStacks.find(
          (s) =>
            s.id !== droppedStackId &&
            s.skillName !== null &&
            !s.capabilityName &&
            Math.hypot(s.x - dropped.x, s.y - dropped.y) < SNAP_RADIUS + 40
        );
        if (!nearby) return currentStacks;

        const combinedSkillNames = [dropped.skillName, nearby.skillName].filter(Boolean) as string[];

        const mergedBricks = [...dropped.brickIds, ...nearby.brickIds];
        const midX = (dropped.x + nearby.x) / 2;
        const midY = (dropped.y + nearby.y) / 2;
        const sh = stackHeight(mergedBricks.length);

        // 1. Surprise capability?
        // Snapshot both skill stacks so we can restore them if the capability is broken apart.
        const snapshot = (s: BrickStack): SkillStackSnapshot => ({
          id: s.id,
          brickIds: s.brickIds,
          skillName: s.skillName,
          skillColor: s.skillColor,
          skillDescription: s.skillDescription,
        });
        const mergedFrom: [SkillStackSnapshot, SkillStackSnapshot] = [
          snapshot(dropped),
          snapshot(nearby),
        ];

        // ── 1. Surprise capability (specific skill pair combos) ──
        const surprise = findSurpriseCapability(combinedSkillNames);
        if (surprise && !discoveredCaps.current.has(surprise.name)) {
          discoveredCaps.current.add(surprise.name);
          const mergedStack: BrickStack = {
            id: `cap-${Date.now()}`,
            brickIds: mergedBricks,
            x: midX, y: midY,
            skillName: null, skillColor: null, skillDescription: null,
            capabilityName: null, capabilityColor: null, capabilityDescription: null,
            isSurprise: true, justFormed: true,
            mergedFrom,
          };
          playSnap();
          setPendingScratchie({
            stackId: mergedStack.id,
            position: { x: midX + BRICK_W / 2, y: midY - sh / 2 },
            name: surprise.name,
            color: surprise.color,
            description: surprise.description,
            type: "capability",
          });
          return currentStacks
            .filter((s) => s.id !== droppedStackId && s.id !== nearby.id)
            .concat(mergedStack);
        }

        // ── 2. SACE capability — skill-recipe-based matching ──
        // Uses CAPABILITY_RECIPES (skill→capability matrix, minMatch=2) for reliable
        // detection regardless of which elements happened to land in each stack.
        const capRecipe = findCapabilityForSkills(combinedSkillNames);
        if (capRecipe && !discoveredCaps.current.has(capRecipe.name)) {
          discoveredCaps.current.add(capRecipe.name);
          const mergedStack: BrickStack = {
            id: `cap-${Date.now()}`,
            brickIds: mergedBricks,
            x: midX, y: midY,
            skillName: null, skillColor: null, skillDescription: null,
            capabilityName: null, capabilityColor: null, capabilityDescription: null,
            isSurprise: false, justFormed: true,
            mergedFrom,
          };
          playSnap();
          setPendingScratchie({
            stackId: mergedStack.id,
            position: { x: midX + BRICK_W / 2, y: midY - sh / 2 },
            name: capRecipe.name,
            color: capRecipe.color,
            description: capRecipe.description,
            type: "capability",
          });
          return currentStacks
            .filter((s) => s.id !== droppedStackId && s.id !== nearby.id)
            .concat(mergedStack);
        }

        // ── 3. Fallback — still snap visually even if capability already discovered ──
        // The student might be exploring or trying a combination they've seen before.
        // Give them the snap + a label showing what the skills form, so it doesn't feel broken.
        const alreadyKnown = capRecipe ?? CAPABILITY_RECIPES.find((r) =>
          combinedSkillNames.every((sn) => r.skills.includes(sn)) ||
          combinedSkillNames.some((sn) => r.skills.includes(sn))
        ) ?? null;

        const mergedStack: BrickStack = {
          id: `merged-${Date.now()}`,
          brickIds: mergedBricks,
          x: midX, y: midY,
          skillName: null, skillColor: null, skillDescription: null,
          // Label with the capability name even if already discovered — student sees what formed
          capabilityName: alreadyKnown ? alreadyKnown.name : null,
          capabilityColor: alreadyKnown ? alreadyKnown.color : null,
          capabilityDescription: alreadyKnown ? alreadyKnown.description : null,
          isSurprise: false, justFormed: false,
          mergedFrom,
        };
        playSnap();
        return currentStacks
          .filter((s) => s.id !== droppedStackId && s.id !== nearby.id)
          .concat(mergedStack);
      });
    },
    [profile.capabilities, elements]
  );

  // ── Dissolve stack ──
  // If the stack was formed by merging two skill stacks, restore those skill stacks.
  // Otherwise scatter all bricks as free elements.

  const dissolveStack = useCallback(
    (stackId: string) => {
      const stack = stacks.find((s) => s.id === stackId);
      if (!stack) return;
      playBreak();
      setSelectedStackId(null);

      if (stack.capabilityName) discoveredCaps.current.delete(stack.capabilityName);

      if (stack.mergedFrom && stack.mergedFrom.length === 2) {
        // ── Restore the two original skill stacks ──
        const [a, b] = stack.mergedFrom;
        // Spread them apart from the merge point
        const restored: BrickStack[] = [
          {
            id: `restored-${Date.now()}-0`,
            brickIds: a.brickIds,
            x: stack.x - BRICK_W - 24,
            y: stack.y,
            skillName: a.skillName,
            skillColor: a.skillColor,
            skillDescription: a.skillDescription,
            capabilityName: null, capabilityColor: null, capabilityDescription: null,
            isSurprise: false, justFormed: false,
          },
          {
            id: `restored-${Date.now()}-1`,
            brickIds: b.brickIds,
            x: stack.x + BRICK_W + 24,
            y: stack.y,
            skillName: b.skillName,
            skillColor: b.skillColor,
            skillDescription: b.skillDescription,
            capabilityName: null, capabilityColor: null, capabilityDescription: null,
            isSurprise: false, justFormed: false,
          },
        ];
        setStacks((prev) => [
          ...prev.filter((s) => s.id !== stackId),
          ...restored,
        ]);
        // stackedIds: all brick IDs stay stacked (they're in the restored skill stacks)
        return;
      }

      // ── Scatter all bricks as free elements ──
      setStackedIds((prev) => {
        const next = new Set(prev);
        stack.brickIds.forEach((id) => next.delete(id));
        return next;
      });
      setFreePositions((prev) => {
        const next = { ...prev };
        stack.brickIds.forEach((id, i) => {
          const angle = (i / stack.brickIds.length) * Math.PI * 2;
          const dist = 60 + Math.random() * 60;
          next[id] = {
            x: stack.x + Math.cos(angle) * dist,
            y: stack.y + Math.sin(angle) * dist,
            rotation: (Math.random() - 0.5) * 16,
          };
        });
        return next;
      });
      setStacks((prev) => prev.filter((s) => s.id !== stackId));
    },
    [stacks]
  );

  // ── Discover — student-initiated scratchie ──
  // Best-match ranking: always produces a discovery regardless of elements stacked.

  const handleDiscover = useCallback((stackId: string) => {
    const stack = stacksRef.current.find((s) => s.id === stackId);
    if (!stack) return;

    const currentEls = elementsRef.current;
    const uniqueNames = new Set(
      stack.brickIds
        .map((bid) => currentEls.find((e) => e.id === bid)?.element ?? "")
        .filter(Boolean)
    );

    const ranked = SKILL_RECIPES
      .map((recipe) => ({
        recipe,
        overlap: recipe.elements.filter((el) => uniqueNames.has(el)).length,
      }))
      .filter((r) => r.overlap > 0)
      .sort((a, b) => b.overlap - a.overlap);

    const best = ranked[0];
    if (!best) return;

    const sh = stackHeight(stack.brickIds.length);
    setPendingScratchie({
      stackId,
      position: { x: stack.x + BRICK_W / 2, y: stack.y - sh / 2 },
      name: best.recipe.name,
      color: best.recipe.color,
      description: best.recipe.description,
      type: "skill",
    });
  }, []);

  // ── Clear all ──

  const clearAll = useCallback(() => {
    const fresh = scatterInit(profile);
    setElements(fresh.elements);
    setFreePositions(fresh.positions);
    setStacks([]);
    setStackedIds(new Set());
    setPendingScratchie(null);
    setSelectedStackId(null);
    setNewElsModal(null);
    discoveredCaps.current.clear();
    lonelydropsSeen.current.clear();
  }, [profile]);

  // ── Tab counts ──

  const formedCaps = stacks.filter((s) => s.capabilityName);

  // Skills: active skill stacks + skills consumed into capability stacks (via mergedFrom)
  const formedSkills = [
    ...stacks.filter((s) => s.skillName).map((s) => ({
      id: s.id,
      skillName: s.skillName!,
      skillColor: s.skillColor!,
      skillDescription: s.skillDescription,
      brickIds: s.brickIds,
      inCapabilityName: null as string | null,
      inCapabilityColor: null as string | null,
    })),
    ...stacks
      .filter((s) => s.mergedFrom)
      .flatMap((s) =>
        s.mergedFrom!
          .filter((snap) => snap.skillName)
          .map((snap) => ({
            id: `${snap.id}-in-cap`,
            skillName: snap.skillName!,
            skillColor: snap.skillColor!,
            skillDescription: snap.skillDescription,
            brickIds: snap.brickIds,
            inCapabilityName: s.capabilityName,
            inCapabilityColor: s.capabilityColor,
          }))
      ),
  ];

  const currentSemLabel = SEMESTERS[timelineIdx]?.label ?? "";

  const TABS: { id: TabId; label: string; count?: number }[] = [
    { id: "elements", label: "Elements", count: elements.length },
    { id: "skills", label: "Skills", count: formedSkills.length || undefined },
    { id: "capabilities", label: "Capabilities", count: formedCaps.length || undefined },
  ];

  // ── Skill duplicate labels ──

  const skillNameCount: Record<string, number> = {};
  formedSkills.forEach((s) => {
    skillNameCount[s.skillName] = (skillNameCount[s.skillName] ?? 0) + 1;
  });
  const toRoman = (n: number) => ["I", "II", "III", "IV", "V"][n - 1] ?? `×${n}`;

  // ────────────────────────────────────────────────────────────────────────────────

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">

      {/* ── Header ── */}
      <header className="flex items-center justify-between px-6 py-3 border-b border-border bg-surface/90 backdrop-blur-sm z-30">
        <div className="flex items-center gap-3">
          <div className="w-7 h-7 rounded-full bg-gradient-to-br from-amber-300/60 to-orange-400/60 flex-shrink-0" />
          <span className="text-sm font-semibold">{profile.name}&apos;s Space</span>
        </div>
        <nav className="flex gap-0 border border-border rounded-lg overflow-hidden">
          {TABS.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`px-5 py-2 text-sm transition-all cursor-pointer border-r border-border last:border-r-0 ${
                activeTab === tab.id
                  ? "bg-foreground text-white font-medium"
                  : "text-muted hover:text-foreground hover:bg-foreground/5"
              }`}
            >
              {tab.label}
              {tab.count !== undefined && (
                <sup className={`ml-1 text-[10px] ${activeTab === tab.id ? "text-white/50" : "text-muted"}`}>
                  {tab.count}
                </sup>
              )}
            </button>
          ))}
        </nav>
        <button className="text-xs text-muted border border-border px-3 py-1.5 rounded-lg hover:bg-surface cursor-pointer transition-colors">
          Safe Exit
        </button>
      </header>

      <div className="flex-1 relative overflow-hidden">

        {/* ═══ ELEMENTS TAB ═══ */}
        {activeTab === "elements" && (
          <div
            ref={containerRef}
            className="absolute inset-0"
            onClick={() => setSelectedStackId(null)}
          >
            {/* ── Free element bricks ── */}
            {freeElements.map((el) => {
              const pos = freePositions[el.id] ?? { x: el.x, y: el.y, rotation: el.rotation };
              const isDrag = draggingId === el.id;

              return (
                <div
                  key={el.id}
                  className="absolute"
                  style={{
                    left: pos.x,
                    top: pos.y,
                    transform: `rotate(${isDrag ? 0 : pos.rotation}deg)`,
                    zIndex: isDrag ? 1000 : 5,
                    cursor: isDrag ? "grabbing" : "grab",
                    filter: isDrag
                      ? "drop-shadow(0 10px 20px rgba(0,0,0,0.22))"
                      : "drop-shadow(0 2px 3px rgba(0,0,0,0.1))",
                    transition: isDrag ? "none" : "left 0.12s, top 0.12s, transform 0.12s, filter 0.12s",
                  }}
                  onPointerDown={(e) => handleElementPointerDown(el.id, e)}
                >
                  <Brick3D
                    label={el.element}
                    color={BRICK_COLOR}
                    isDragging={isDrag}
                    showDepth
                  />
                  {/* Tooltip */}
                  <div
                    className="brick-tooltip absolute left-1/2 -translate-x-1/2 bg-foreground text-white text-[10px] px-3 py-1 rounded-lg whitespace-nowrap shadow-lg z-50 pointer-events-none"
                    style={{ top: -36 }}
                  >
                    {el.subjects.join(", ")}
                  </div>
                </div>
              );
            })}

            {/* ── Stacks ── */}
            {stacks.map((stack) => {
              const sh = stackHeight(stack.brickIds.length);
              const isSelected = selectedStackId === stack.id;
              const isDraggingThis = draggingId === stack.id;
              const labelColor = stack.capabilityColor || stack.skillColor;
              const label = stack.capabilityName || stack.skillName;

              return (
                <div
                  key={stack.id}
                  className="absolute"
                  style={{
                    left: stack.x,
                    top: stack.y - sh,
                    width: BRICK_W,
                    zIndex: isDraggingThis ? 1000 : isSelected ? 50 : 15,
                    filter: isDraggingThis
                      ? "drop-shadow(0 14px 28px rgba(0,0,0,0.24))"
                      : "drop-shadow(0 3px 6px rgba(0,0,0,0.12))",
                    transition: isDraggingThis ? "none" : "left 0.1s, top 0.1s",
                  }}
                >
                  {/* ✦ Discover button — shown when ≥3 bricks, no label yet */}
                  {!label && stack.brickIds.length >= 3 && (
                    <div className="absolute left-0 right-0 flex justify-center pointer-events-auto" style={{ top: -40 }}>
                      <button
                        className="text-[11px] font-semibold px-3 py-1.5 rounded-full text-white shadow-md cursor-pointer transition-transform hover:scale-105 active:scale-95"
                        style={{ backgroundColor: "#1a1a1a" }}
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDiscover(stack.id);
                        }}
                      >
                        ✦ Discover
                      </button>
                    </div>
                  )}

                  {/* Skill / Capability label above stack */}
                  {label && !stack.isSurprise && (
                    <div className="absolute left-0 right-0 flex justify-center" style={{ top: -32 }}>
                      <span
                        className="text-[11px] font-bold px-3 py-1 rounded-full text-white shadow-sm whitespace-nowrap"
                        style={{ backgroundColor: labelColor! }}
                      >
                        {label}
                      </span>
                    </div>
                  )}

                  {/* Surprise capability — star + name, more prominent */}
                  {label && stack.isSurprise && (
                    <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center gap-0.5 pointer-events-none" style={{ top: -56 }}>
                      <span className="text-lg leading-none" style={{ filter: "drop-shadow(0 1px 3px rgba(0,0,0,0.3))" }}>★</span>
                      <span
                        className="text-[11px] font-bold px-3 py-1 rounded-full text-white shadow-md whitespace-nowrap"
                        style={{ backgroundColor: labelColor! }}
                      >
                        {label}
                      </span>
                    </div>
                  )}

                  {/* Drag handle overlay */}
                  <div
                    className="absolute inset-0 z-10"
                    style={{ cursor: isDraggingThis ? "grabbing" : "grab", height: sh }}
                    onPointerDown={(e) => handleStackPointerDown(stack.id, e)}
                    onClick={(e) => {
                      e.stopPropagation();
                      if (!isDraggingThis) {
                        setSelectedStackId((prev) => prev === stack.id ? null : stack.id);
                      }
                    }}
                  />

                  {/* Brick tower — brickIds[0] = bottom (highest yOffset), brickIds[last] = top */}
                  {stack.brickIds.map((bid, i) => {
                    const el = elements.find((e) => e.id === bid);
                    if (!el) return null;
                    const yOffset = (stack.brickIds.length - 1 - i) * (BRICK_H - STACK_OVERLAP);
                    const isBottom = i === 0;
                    // Shade: bottom slightly darker, top slightly lighter
                    const shadeAmount = (i / Math.max(stack.brickIds.length - 1, 1) - 0.5) * 0.12;
                    const brickColor = labelColor
                      ? lighten(labelColor.slice(0, 7), shadeAmount)
                      : BRICK_COLOR;

                    return (
                      <div
                        key={bid}
                        className="absolute"
                        style={{ top: yOffset, width: BRICK_W, zIndex: i + 1 }}
                      >
                        <Brick3D
                          label={el.element}
                          color={brickColor}
                          isDragging={false}
                          showDepth={isBottom}
                        />
                      </div>
                    );
                  })}
                </div>
              );
            })}

            {/* Scratchie overlay */}
            {pendingScratchie && (
              <ScratchieCard
                item={pendingScratchie}
                onRevealed={onScratchieRevealed}
                onStartOver={clearAll}
              />
            )}

            {/* Stack popover */}
            {selectedStackId && (() => {
              const stack = stacks.find((s) => s.id === selectedStackId);
              if (!stack) return null;
              const name = stack.capabilityName || stack.skillName;
              return (
                <StackPopover
                  stack={stack}
                  elements={elements}
                  onDismiss={() => setSelectedStackId(null)}
                  onDissolve={() => dissolveStack(stack.id)}
                  onAddToProfile={() =>
                    name && setProfileItems((prev) => {
                      const next = new Set(prev);
                      next.has(name) ? next.delete(name) : next.add(name);
                      return next;
                    })
                  }
                  inProfile={profileItems.has(stack.capabilityName || stack.skillName || "")}
                />
              );
            })()}

            {/* Timeline + controls */}
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none">
              <div className="pointer-events-auto mx-4 mb-3 bg-surface/95 backdrop-blur-sm rounded-xl border border-border px-4 py-2.5 shadow-sm">
                <div className="flex items-center gap-3">
                  <span className="text-[10px] text-muted uppercase tracking-wider w-12 flex-shrink-0 font-medium">
                    {currentSemLabel}
                  </span>
                  <input
                    type="range"
                    min={0}
                    max={semesterIndex(profile.currentYear, profile.currentSemester)}
                    value={timelineIdx}
                    onChange={(e) => setTimelineIdx(Number(e.target.value))}
                    className="flex-1 accent-amber-600"
                  />
                  <div className="flex gap-2">
                    {SEMESTERS.slice(0, semesterIndex(profile.currentYear, profile.currentSemester) + 1).map((s, i) => {
                      const cnt = elements.filter(
                        (e) => semesterIndex(e.firstSeen.year, e.firstSeen.semester) === i
                      ).length;
                      if (cnt === 0) return null;
                      return (
                        <button
                          key={`${s.year}-${s.semester}`}
                          onClick={() => setTimelineIdx(i)}
                          className={`text-[9px] px-1.5 py-0.5 rounded cursor-pointer transition-colors ${
                            timelineIdx >= i ? "text-foreground font-medium" : "text-muted/40"
                          }`}
                        >
                          {s.label}
                        </button>
                      );
                    })}
                  </div>
                  <div className="w-px h-4 bg-border mx-1" />
                  <button
                    onClick={clearAll}
                    className="text-[10px] text-muted hover:text-foreground px-2.5 py-1 rounded-md hover:bg-foreground/5 cursor-pointer transition-all flex-shrink-0"
                  >
                    Start Over
                  </button>
                </div>
                <div className="mt-1 text-[10px] text-muted/40">
                  {freeElements.length} elements loose · {stacks.length} stack{stacks.length !== 1 ? "s" : ""}
                  {stacks.length === 0 && " · drag elements near each other to start stacking"}
                </div>
              </div>
            </div>

            {/* Toast notification */}
            {notification && (
              <div
                className="absolute left-1/2 -translate-x-1/2 z-30 pointer-events-none"
                style={{ bottom: 80 }}
              >
                <div className="bg-foreground/90 text-white text-xs px-4 py-2 rounded-full shadow-lg backdrop-blur-sm whitespace-nowrap">
                  {notification}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ SKILLS TAB ═══ */}
        {activeTab === "skills" && (
          <div className="absolute inset-0 overflow-auto p-8">
            {formedSkills.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <p className="text-muted text-sm mb-2">No skills yet</p>
                  <p className="text-muted/50 text-xs leading-relaxed">
                    Go to Elements and drag bricks near each other. When 3 or more combine, tap ✦ Discover to reveal a skill.
                  </p>
                  <button
                    onClick={() => setActiveTab("elements")}
                    className="mt-4 text-xs text-foreground border border-border px-4 py-2 rounded-lg hover:bg-surface cursor-pointer"
                  >
                    Go to Elements
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-lg font-semibold mb-1">Skills</h2>
                <p className="text-sm text-muted mb-6">
                  Each skill emerged when you stacked elements together. Drag two named skill stacks together to see what capability they form.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {(() => {
                    const seen: Record<string, number> = {};
                    return formedSkills.map((skill, idx) => {
                      const nm = skill.skillName;
                      seen[nm] = (seen[nm] ?? 0) + 1;
                      const nth = seen[nm];
                      const isDuplicate = skillNameCount[nm] > 1;

                      return (
                        <div
                          key={skill.id}
                          className="rounded-xl border border-border bg-surface overflow-hidden capability-emerge"
                          style={{ animationDelay: `${idx * 80}ms` }}
                        >
                          <div className="h-1.5" style={{ backgroundColor: skill.skillColor }} />
                          <div className="p-5">
                            <div className="flex items-center gap-2 mb-2">
                              <h3 className="text-lg font-bold" style={{ color: skill.skillColor }}>
                                {nm}
                              </h3>
                              {isDuplicate && (
                                <span
                                  className="text-[10px] px-1.5 py-0.5 rounded font-bold text-white leading-none"
                                  style={{ backgroundColor: skill.skillColor }}
                                >
                                  {toRoman(nth)}
                                </span>
                              )}
                            </div>
                            <p className="text-sm text-foreground/70 leading-relaxed mb-3">
                              {skill.skillDescription}
                            </p>
                            <div className="flex flex-wrap gap-1.5 mb-4">
                              {skill.brickIds.map((bid) => {
                                const el = elements.find((e) => e.id === bid);
                                return el ? (
                                  <span
                                    key={bid}
                                    className="text-[10px] px-2.5 py-1 rounded-[4px] font-medium text-white"
                                    style={{ backgroundColor: BRICK_COLOR }}
                                  >
                                    {el.element}
                                  </span>
                                ) : null;
                              })}
                            </div>
                            {skill.inCapabilityName ? (
                              <div
                                className="flex items-center gap-1.5 text-[11px] font-semibold mt-1"
                                style={{ color: skill.inCapabilityColor ?? undefined }}
                              >
                                <span>→</span>
                                <span>{skill.inCapabilityName}</span>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  setProfileItems((prev) => {
                                    const next = new Set(prev);
                                    const key = `${nm}-${skill.id}`;
                                    next.has(key) ? next.delete(key) : next.add(key);
                                    return next;
                                  })
                                }
                                className={`text-[11px] px-3 py-1.5 rounded-full border transition-all cursor-pointer ${
                                  profileItems.has(`${nm}-${skill.id}`)
                                    ? "text-white border-transparent"
                                    : "border-border text-muted hover:text-foreground"
                                }`}
                                style={
                                  profileItems.has(`${nm}-${skill.id}`)
                                    ? { backgroundColor: skill.skillColor }
                                    : undefined
                                }
                              >
                                {profileItems.has(`${nm}-${skill.id}`) ? "In Profile" : "+ Profile"}
                              </button>
                            )}
                          </div>
                        </div>
                      );
                    });
                  })()}
                </div>
              </div>
            )}
          </div>
        )}

        {/* ═══ CAPABILITIES TAB ═══ */}
        {activeTab === "capabilities" && (
          <div className="absolute inset-0 overflow-auto p-8">
            {formedCaps.length === 0 ? (
              <div className="h-full flex items-center justify-center">
                <div className="text-center max-w-xs">
                  <p className="text-muted text-sm mb-2">No capabilities yet</p>
                  <p className="text-muted/50 text-xs leading-relaxed">
                    Form skills on the Elements canvas, then drag two named skill stacks near each other to reveal a SACE capability.
                  </p>
                  <button
                    onClick={() => setActiveTab("elements")}
                    className="mt-4 text-xs text-foreground border border-border px-4 py-2 rounded-lg hover:bg-surface cursor-pointer"
                  >
                    Go to Elements
                  </button>
                </div>
              </div>
            ) : (
              <div className="max-w-3xl mx-auto">
                <h2 className="text-lg font-semibold mb-1">Capabilities</h2>
                <p className="text-sm text-muted mb-6">
                  Capabilities emerge when skills come together.
                </p>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {formedCaps.map((stack, idx) => (
                    <div
                      key={stack.id}
                      className="rounded-xl border border-border bg-surface overflow-hidden capability-emerge"
                      style={{ animationDelay: `${idx * 80}ms` }}
                    >
                      <div className="h-1.5" style={{ backgroundColor: stack.capabilityColor! }} />
                      <div className="p-5">
                        <h3 className="text-lg font-bold mb-2 flex items-center gap-1.5" style={{ color: stack.capabilityColor! }}>
                          {stack.isSurprise && <span className="text-amber-400">★</span>}
                          {stack.capabilityName}
                        </h3>
                        <p className="text-sm text-foreground/70 leading-relaxed mb-3">
                          {stack.capabilityDescription}
                        </p>
                        <div className="flex flex-wrap gap-1.5">
                          {stack.brickIds.map((bid) => {
                            const el = elements.find((e) => e.id === bid);
                            return el ? (
                              <span
                                key={bid}
                                className="text-[10px] px-2.5 py-1 rounded-[4px] font-medium text-white"
                                style={{ backgroundColor: stack.capabilityColor! + "99" }}
                              >
                                {el.element}
                              </span>
                            ) : null;
                          })}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* ── New elements modal ── */}
      {newElsModal && (
        <NewElementsModal elements={newElsModal} onDismiss={() => setNewElsModal(null)} />
      )}
    </div>
  );
}
