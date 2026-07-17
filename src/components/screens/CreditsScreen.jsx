"use client"
import { motion, AnimatePresence } from "framer-motion"
import { RotateCcw } from "lucide-react"
import { useEffect, useState, useMemo, useRef } from "react"

// ─── DATA ─────────────────────────────────────────────────────
const credits = [
  { role: "The Birthday Princess 👑",       name: "ASHI", highlight: true },
  { role: "Graphic Artist 🎨",              name: "KD" },
  { role: "Location 🌸",                    name: "Right in your heart" },
  { role: "Dedicated to 🎀",                name: "Making you smile today" },
  { role: "Final Sparkle ✨",               name: "Happy Birthday, Ashi – keep shining forever" }
]


const PARTICLES = [
  { emoji: "💖", x: 5,  delay: 0,   size: 18 },
  { emoji: "🌸", x: 15, delay: 1.2, size: 14 },
  { emoji: "✨", x: 25, delay: 0.5, size: 16 },
  { emoji: "🎀", x: 35, delay: 2,   size: 20 },
  { emoji: "💕", x: 45, delay: 0.8, size: 14 },
  { emoji: "⭐", x: 55, delay: 1.5, size: 18 },
  { emoji: "🌺", x: 65, delay: 0.3, size: 16 },
  { emoji: "💫", x: 75, delay: 1.8, size: 20 },
  { emoji: "🎵", x: 85, delay: 0.7, size: 14 },
  { emoji: "🌷", x: 93, delay: 1,   size: 18 },
]

const STARS = Array.from({ length: 30 }, (_, i) => ({
  id: i,
  w: (i * 7 % 25) / 10 + 1,
  left: (i * 13 + 7) % 100,
  top:  (i * 17 + 3) % 100,
  dur:  2 + (i % 5) * 0.6,
  dly:  (i * 11) % 50 / 10,
}))

// ─── STAGES ──────────────────────────────────────────────────
// 0 = movie scroll credits
// 1 = poem typewriter
// 2 = "I'm Yours" quote
// 3 = THE END

// ─── HELPERS ──────────────────────────────────────────────────
function useWindowHeight() {
  const [h, setH] = useState(800)
  useEffect(() => {
    setH(window.innerHeight)
    const fn = () => setH(window.innerHeight)
    window.addEventListener("resize", fn)
    return () => window.removeEventListener("resize", fn)
  }, [])
  return h
}

function FloatingParticle({ delay, x, size, emoji, windowHeight }) {
  const drift = useMemo(() => (x % 7) * 10 - 30, [x])
  return (
    <motion.div
      className="absolute pointer-events-none select-none z-0"
      style={{ left: `${x}%`, bottom: -40, fontSize: size }}
      animate={{ y: [0, -(windowHeight + 100)], x: [0, drift], opacity: [0, 1, 1, 0] }}
      transition={{ duration: 7 + delay, delay, repeat: Infinity, ease: "easeOut" }}
    >
      {emoji}
    </motion.div>
  )
}

function ShootingStar({ delay, top }) {
  return (
    <motion.div className="absolute pointer-events-none z-0"
      style={{
        top: `${top}%`, left: "-10%", width: 100, height: 2,
        background: "linear-gradient(90deg, transparent, rgba(255,255,255,0.7), white)",
        borderRadius: 999,
      }}
      animate={{ x: ["0vw", "120vw"], opacity: [0, 1, 0] }}
      transition={{ duration: 1.1, delay, repeat: Infinity, repeatDelay: 9, ease: "easeIn" }}
    />
  )
}

function Background({ windowHeight }) {
  return (
    <>
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { w: "min(500px,90vw)", t: "-15%", l: "-10%", bg: "rgba(255,255,255,0.4)",  blur: 40, dur: 6, dly: 0 },
          { w: "min(400px,80vw)", b: "-10%", r: "-8%",  bg: "rgba(180,60,180,0.35)", blur: 50, dur: 8, dly: 2 },
          { w: "min(300px,70vw)", t: "42%",  l: "25%",  bg: "rgba(255,180,230,0.3)", blur: 60, dur: 5, dly: 1 },
        ].map((o, i) => (
          <motion.div key={i} className="absolute rounded-full"
            style={{
              width: o.w, height: o.w, top: o.t, bottom: o.b, left: o.l, right: o.r,
              background: `radial-gradient(circle, ${o.bg} 0%, transparent 70%)`,
              filter: `blur(${o.blur}px)`,
            }}
            animate={{ scale: [1, 1.18, 1], opacity: [0.35, 0.55, 0.35] }}
            transition={{ duration: o.dur, delay: o.dly, repeat: Infinity, ease: "easeInOut" }}
          />
        ))}
      </div>
      {[{delay:0,top:8},{delay:5,top:20},{delay:10,top:5},{delay:15,top:30},{delay:21,top:14}].map((s,i)=>(
        <ShootingStar key={i} {...s} />
      ))}
      {PARTICLES.map((p,i) => <FloatingParticle key={i} {...p} windowHeight={windowHeight} />)}
      {STARS.map(s => (
        <motion.div key={s.id} className="absolute rounded-full pointer-events-none z-0"
          style={{ width: s.w, height: s.w, left: `${s.left}%`, top: `${s.top}%`, background: "rgba(255,255,255,0.85)" }}
          animate={{ opacity: [0.2, 1, 0.2] }}
          transition={{ duration: s.dur, delay: s.dly, repeat: Infinity, ease: "easeInOut" }}
        />
      ))}
    </>
  )
}

// ─── TYPEWRITER HOOK ───────────────────────────────────────────
function useTypewriter(lines, charDelay = 55, lineDelay = 600, startDelay = 300) {
  const [displayed, setDisplayed] = useState([])
  const [done, setDone] = useState(false)

  const lineIdxRef = useRef(0)
  const charIdxRef = useRef(0)
  const timerRef   = useRef(null)
  const startedRef = useRef(false)

  useEffect(() => {
    // Strict Mode fires effect twice — only start once
    if (startedRef.current) return
    startedRef.current = true

    lineIdxRef.current = 0
    charIdxRef.current = 0

    const tick = () => {
      const li = lineIdxRef.current
      const ci = charIdxRef.current

      if (li >= lines.length) {
        setDone(true)
        return
      }

      const line = lines[li]
      const nextCi = ci + 1
      lineIdxRef.current = li
      charIdxRef.current = nextCi
      const partial = line.slice(0, nextCi)

      setDisplayed(prev => {
        if (prev.length > li) {
          const copy = [...prev]
          copy[li] = partial
          return copy
        }
        return [...prev, partial]
      })

      if (nextCi < line.length) {
        timerRef.current = setTimeout(tick, charDelay)
      } else {
        lineIdxRef.current = li + 1
        charIdxRef.current = 0
        timerRef.current = setTimeout(tick, lineDelay)
      }
    }

    timerRef.current = setTimeout(tick, startDelay)

    return () => { clearTimeout(timerRef.current) }
  }, []) // eslint-disable-line

  return { displayed, done }
}

// ─── POEM SCREEN ──────────────────────────────────────────────
function PoemScreen({ onDone }) {
  const { displayed, done } = useTypewriter(POEM_LINES, 55, 700, 600)

  useEffect(() => {
    if (done) {
      const t = setTimeout(onDone, 2200)
      return () => clearTimeout(t)
    }
  }, [done, onDone])

  return (
    <motion.div
      key="poem"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
      transition={{ duration: 1 }}
      className="relative z-10 flex flex-col items-center justify-center w-full px-6"
      style={{ minHeight: "100svh" }}
    >
      <div className="w-full max-w-sm rounded-3xl text-center"
        style={{
          padding: "clamp(28px,7vw,44px) clamp(20px,5vw,36px)",
          background: "rgba(255,255,255,0.3)",
          border: "1px solid rgba(255,255,255,0.58)",
          backdropFilter: "blur(20px)",
          WebkitBackdropFilter: "blur(20px)",
        }}
      >
        <motion.p className="mb-5 text-3xl"
          animate={{ scale: [1, 1.2, 1], rotate: [0, 8, -8, 0] }}
          transition={{ duration: 3, repeat: Infinity }}
        >🌸</motion.p>

        <div className="text-left" style={{ minHeight: "7rem" }}>
          {displayed.map((line, i) => (
            <p key={i} className="italic leading-9"
              style={{ color: "rgba(75,0,55,0.9)", fontSize: "clamp(0.9rem,4vw,1.05rem)" }}
            >
              {line}
              {/* blinking cursor on last line being typed */}
              {i === displayed.length - 1 && !done && (
                <motion.span
                  animate={{ opacity: [1, 0] }}
                  transition={{ duration: 0.5, repeat: Infinity }}
                  style={{ borderRight: "2px solid rgba(120,0,90,0.8)", marginLeft: 2 }}
                />
              )}
            </p>
          ))}
        </div>

        {done && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ duration: 0.8 }}>
            <div className="mt-5 h-px w-16 mx-auto" style={{ background: "rgba(180,60,160,0.35)" }} />
            <p className="mt-3 text-xs uppercase tracking-widest" style={{ color: "rgba(110,0,85,0.55)" }}>
              — With love, always 💝
            </p>
          </motion.div>
        )}
      </div>
    </motion.div>
  )
}

// ─── QUOTE SCREEN ─────────────────────────────────────────────
function QuoteScreen({ onDone }) {
  const QUOTE_LINES = [
    "I'm Yours...",
    "Even if You're not mine."
  ]
  
  const { displayed, done } = useTypewriter(QUOTE_LINES, 70, 400, 200)

  useEffect(() => {
    if (done) {
      const t = setTimeout(onDone, 800)
      return () => clearTimeout(t)
    }
  }, [done, onDone])

  return (
    <motion.div
      key="quote"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0, transition: { duration: 0.4, ease: "easeInOut" } }}
      transition={{ duration: 0.4 }}
      className="relative z-10 flex flex-col items-center justify-center w-full px-6 text-center"
      style={{ minHeight: "100svh" }}
    >
      {/* Big faded quote mark */}
      <div className="absolute pointer-events-none select-none font-bold"
        style={{
          fontSize: "clamp(10rem,40vw,18rem)",
          color: "rgba(120,0,90,0.12)",
          top: "50%", left: "50%",
          transform: "translate(-55%, -60%)",
          lineHeight: 1,
          fontFamily: "Georgia, serif",
        }}
      >"</div>

      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="mb-8 h-px w-20 mx-auto"
        style={{ background: "linear-gradient(90deg,transparent,rgba(120,0,100,0.5),transparent)" }}
      />

      <div className="text-center" style={{ minHeight: "5rem" }}>
        {displayed.map((line, i) => (
          <motion.p key={i} 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 1.2 }}
            style={{
              fontSize: i === 0 
                ? "clamp(1.5rem,7vw,2.2rem)"
                : "clamp(1rem,4.5vw,1.35rem)",
              color: i === 0 
                ? "rgba(75,0,55,0.93)" 
                : "rgba(100,0,70,0.72)",
              fontFamily: "Georgia, serif",
              fontStyle: "italic",
              lineHeight: 1.6,
              letterSpacing: "0.02em",
              marginTop: i === 0 ? 0 : 8,
            }}
          >
            {line}
            {/* blinking cursor on last line being typed */}
            {i === displayed.length - 1 && !done && (
              <motion.span
                animate={{ opacity: [1, 0] }}
                transition={{ duration: 0.5, repeat: Infinity }}
                style={{ borderRight: "2px solid rgba(120,0,90,0.8)", marginLeft: 2 }}
              />
            )}
          </motion.p>
        ))}
      </div>

      {/* Radha Rani Image */}
      <motion.div
        initial={{ opacity: 0, scale: 0.7 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 1.5, duration: 0.8, ease: "easeOut" }}
        className="mt-5"
      >
        <motion.img
          src="/gifs/CAT.jpg"
          alt="Radha Rani"
          className="rounded-2xl"
          style={{
            width: "clamp(140px, 45vw, 200px)",
            height: "clamp(140px, 45vw, 200px)",
            objectFit: "cover",
            border: "2px solid rgba(220,120,180,0.5)",
            boxShadow: "0 8px 32px rgba(151,59,136,0.3)",
          }}
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
        />
      </motion.div>

      {/* Radha Rani Blessing */}
      <motion.div
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.8, duration: 0.8, ease: "easeOut" }}
        className="mt-6 px-6 py-3 rounded-2xl"
        style={{
          background: "linear-gradient(135deg, rgba(255,255,255,0.45), rgba(255,200,230,0.35))",
          border: "1px solid rgba(220,120,180,0.4)",
          backdropFilter: "blur(10px)",
        }}
      >
        <motion.p
          animate={{ scale: [1, 1.03, 1] }}
          transition={{ duration: 3, repeat: Infinity, ease: "easeInOut" }}
          style={{
            fontSize: "clamp(1.1rem, 5vw, 1.35rem)",
            fontFamily: "Georgia, serif",
            fontStyle: "italic",
            fontWeight: 600,
            background: "linear-gradient(135deg, #7b0060, #c026a0)",
            WebkitBackgroundClip: "text",
            WebkitTextFillColor: "transparent",
            backgroundClip: "text",
            letterSpacing: "0.06em",
          }}
        >
           Radha Rani bless you 
        </motion.p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 2.5, duration: 0.6, type: "spring", stiffness: 200 }}
        style={{ fontSize: "clamp(2rem,9vw,2.8rem)", marginTop: 24 }}
      >💝</motion.div>

      <motion.div
        initial={{ scaleX: 0 }} animate={{ scaleX: 1 }}
        transition={{ delay: 0.3, duration: 1 }}
        className="mt-8 h-px w-20 mx-auto"
        style={{ background: "linear-gradient(90deg,transparent,rgba(120,0,100,0.5),transparent)" }}
      />
    </motion.div>
  )
}

// ─── THE END SCREEN ───────────────────────────────────────────
function TheEndScreen() {
  const [heartBurst, setHeartBurst] = useState(false)

  return (
    <motion.div
      key="theend"
      initial={{ opacity: 0, scale: 0.88 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="relative z-10 flex flex-col items-center justify-center w-full px-6 text-center"
      style={{ minHeight: "100svh" }}
    >
      {/* Divider */}
      <div className="flex items-center gap-3 mb-8 w-full max-w-xs">
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,transparent,rgba(140,0,120,0.5))" }} />
        <motion.span animate={{ rotate: 360 }}
          transition={{ duration: 8, repeat: Infinity, ease: "linear" }}
          style={{ color: "rgba(140,0,120,0.65)", fontSize: 16 }}
        >✦</motion.span>
        <div className="flex-1 h-px" style={{ background: "linear-gradient(90deg,rgba(140,0,120,0.5),transparent)" }} />
      </div>

      {/* THE END */}
      <motion.h1
        initial={{ opacity: 0, letterSpacing: "0.6em" }}
        animate={{ opacity: 1, letterSpacing: "0.22em" }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="font-bold uppercase"
        style={{
          fontSize: "clamp(2.8rem,14vw,4.5rem)",
          background: "linear-gradient(135deg,#6b0050,#c026a0,#6b0050)",
          WebkitBackgroundClip: "text",
          WebkitTextFillColor: "transparent",
          backgroundClip: "text",
        }}
      >
        THE END
      </motion.h1>

      {/* Heart */}
      <motion.button
        initial={{ opacity: 0, scale: 0 }}
        animate={heartBurst
          ? { scale: [1, 1.8, 0.85, 1.1, 1], opacity: 1 }
          : { opacity: 1, scale: 1 }
        }
        transition={heartBurst
          ? { duration: 0.5 }
          : { delay: 0.6, duration: 0.6, type: "spring", stiffness: 200 }
        }
        onClick={() => setHeartBurst(true)}
        onAnimationComplete={() => setHeartBurst(false)}
        whileTap={{ scale: 0.75 }}
        className="mt-7 mb-5 bg-transparent border-0 cursor-pointer"
        style={{ fontSize: "clamp(2.2rem,10vw,3rem)", touchAction: "manipulation" }}
        aria-label="Heart"
      >💝</motion.button>

      <motion.p
        initial={{ opacity: 0 }} animate={{ opacity: 1 }}
        transition={{ delay: 1, duration: 0.6 }}
        className="text-xs mb-8"
        style={{ color: "rgba(100,0,80,0.42)", letterSpacing: "0.04em" }}
      >
        Made with 💖 especially for you
      </motion.p>

      {/* Replay */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 1.3, duration: 0.6 }}
      >
        <motion.button
          whileHover={{ scale: 1.06, boxShadow: "0 0 28px rgba(180,40,160,0.45)" }}
          whileTap={{ scale: 0.92 }}
          onClick={() => window.location.reload()}
          className="relative overflow-hidden flex items-center gap-2 rounded-full font-semibold uppercase"
          style={{
            background: "linear-gradient(135deg,#b03090,#7b0060)",
            color: "white",
            border: "none",
            cursor: "pointer",
            letterSpacing: "0.12em",
            fontSize: "clamp(0.68rem,3.2vw,0.82rem)",
            padding: "clamp(11px,3vw,14px) clamp(24px,7vw,36px)",
            touchAction: "manipulation",
          }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(105deg,transparent 30%,rgba(255,255,255,0.28) 50%,transparent 70%)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 2.5, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.span animate={{ rotate: [-12, 12, -12] }} transition={{ duration: 1.5, repeat: Infinity }}>
            <RotateCcw size={14} />
          </motion.span>
          Replay Surprise ✨
        </motion.button>
      </motion.div>
    </motion.div>
  )
}

// ─── MAIN ─────────────────────────────────────────────────────
export default function CreditsScreen() {
  const [stage, setStage] = useState(0)
  const windowHeight = useWindowHeight()

  // Credits scroll duration: credits take ~12s to scroll off screen
  // After scroll done → quote
  const SCROLL_DURATION = 7 // seconds — must match animation below

  useEffect(() => {
    if (stage === 0) {
      const t = setTimeout(() => setStage(3), SCROLL_DURATION * 1000)
      return () => clearTimeout(t)
    }
  }, [stage])

  return (
    <div
      className="relative w-full overflow-hidden flex items-center justify-center"
      style={{
        minHeight: "100svh",
        background: "#fff8fc",
        fontFamily: "'Georgia', serif",
      }}
    >
      <Background windowHeight={windowHeight} />

      <AnimatePresence mode="wait">

        {/* ══ STAGE 0 — MOVIE SCROLL CREDITS ══ */}
        {stage === 0 && (
          <motion.div
            key="credits-scroll"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 1, ease: "easeInOut" } }}
            transition={{ duration: 0.1 }}
            className="relative z-10 bg-[#fff8fc] p-4 sm:p-7 rounded-[40px] sm:rounded-[60px] drop-shadow-2xl min-w-48 w-full max-w-100 sm:max-w-110 flex flex-col items-center gap-4 card-glow overflow-hidden"
            style={{ minHeight: "500px" }}
          >
            {/* Top & bottom fade masks */}
            <div className="absolute top-0 left-0 right-0 z-20 pointer-events-none"
              style={{ height: "15%", background: "linear-gradient(to bottom, #fff8fc, transparent)" }}
            />
            <div className="absolute bottom-0 left-0 right-0 z-20 pointer-events-none"
              style={{ height: "20%", background: "linear-gradient(to top, #fff8fc, transparent)" }}
            />

            {/* Scrolling content */}
            <motion.div
              className="absolute left-0 right-0 flex flex-col items-center"
              style={{ top: 0 }}
              initial={{ y: "40vh" }}
              animate={{ y: `-110%` }}
              transition={{
                duration: SCROLL_DURATION,
                ease: "linear",
              }}
            >
              {/* Top spacer so content starts below screen */}
              <div style={{ height: "5vh" }} />

              {/* ── TITLE ── */}
              <div className="text-center mb-16 px-6">
                <p className="text-xs uppercase tracking-[0.45em] mb-3"
                  style={{ color: "rgba(100,0,80,0.65)" }}>
                  A Special Presentation
                </p>
                <h2 className="font-bold uppercase mb-1"
                  style={{
                    fontSize: "clamp(2.2rem,10vw,3.2rem)",
                    background: "linear-gradient(135deg,#7b0060,#c026a0,#7b0060)",
                    WebkitBackgroundClip: "text",
                    WebkitTextFillColor: "transparent",
                    backgroundClip: "text",
                    letterSpacing: "0.18em",
                  }}>
                  Credits
                </h2>
                <div className="mx-auto h-px w-28 mt-3"
                  style={{ background: "linear-gradient(90deg,transparent,rgba(120,0,100,0.45),transparent)" }}
                />
              </div>

              {/* ── CREDIT CARDS ── */}
              <div className="w-full max-w-sm px-5 space-y-5 mb-20">
                {credits.map((item, i) => (
                  <div key={i} className="relative rounded-2xl overflow-hidden"
                    style={{
                      padding: "clamp(12px,3.5vw,18px) clamp(16px,4.5vw,24px)",
                      background: item.highlight
                        ? "linear-gradient(135deg,rgba(255,255,255,0.55),rgba(240,160,230,0.45))"
                        : "rgba(255,255,255,0.22)",
                      border: item.highlight
                        ? "1.5px solid rgba(200,80,180,0.5)"
                        : "1px solid rgba(255,255,255,0.35)",
                      backdropFilter: "blur(12px)",
                      WebkitBackdropFilter: "blur(12px)",
                    }}
                  >
                    {item.highlight && (
                      <motion.div className="absolute inset-0 pointer-events-none"
                        animate={{ opacity: [0.3, 0.6, 0.3] }}
                        transition={{ duration: 2.5, repeat: Infinity }}
                        style={{ background: "linear-gradient(135deg,rgba(255,255,255,0.2),rgba(220,100,200,0.15))" }}
                      />
                    )}
                    <div className="flex justify-between items-center gap-4">
                      <p className="text-xs uppercase tracking-wider"
                        style={{ color: "rgba(100,0,80,0.68)", maxWidth: "52%" }}>
                        {item.role}
                      </p>
                      <p className="font-semibold text-right" style={{
                        color: item.highlight ? "#5a003a" : "rgba(80,0,60,0.9)",
                        fontSize: item.highlight ? "clamp(0.9rem,3.8vw,1.05rem)" : "clamp(0.8rem,3.2vw,0.95rem)",
                        letterSpacing: item.highlight ? "0.08em" : "0.03em",
                      }}>
                        {item.name}
                      </p>
                    </div>
                    {item.highlight && (
                      <motion.span className="absolute top-2 right-2 text-xs pointer-events-none"
                        animate={{ rotate: [0, 12, -12, 0], scale: [1, 1.2, 1] }}
                        transition={{ duration: 3, repeat: Infinity }}
                      >👑</motion.span>
                    )}
                  </div>
                ))}
              </div>

              {/* Bottom spacer after last card */}
              <div style={{ height: "15vh" }} />
            </motion.div>
          </motion.div>
        )}

        {/* ══ STAGE 1 — POEM TYPEWRITER ══ */}
        {stage === 1 && (
          <PoemScreen key="poem" onDone={() => setStage(2)} />
        )}

        {/* ══ STAGE 2 — QUOTE ══ */}
        {stage === 2 && (
          <QuoteScreen key="quote" onDone={() => setStage(3)} />
        )}

        {/* ══ STAGE 3 — THE END ══ */}
        {stage === 3 && (
          <TheEndScreen key="theend" />
        )}

      </AnimatePresence>
    </div>
  )
}
