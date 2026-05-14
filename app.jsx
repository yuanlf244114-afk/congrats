// Main app, scene routing, celebration, fireworks, note easter egg
const S = window.Scenes;
const E = React.createElement;

// ---- Audio controller ----
const Audio = (() => {
  let main, finale, muted = false, started = false, current = null;
  const get = () => {
    main = main || document.getElementById("audio-main");
    finale = finale || document.getElementById("audio-finale");
    if (main) main.volume = 0.5;
    if (finale) finale.volume = 0.6;
    return { main, finale };
  };
  const fade = (el, to, ms = 600) => {
    if (!el) return;
    const from = el.volume;
    const start = performance.now();
    const step = (t) => {
      const k = Math.min(1, (t - start) / ms);
      el.volume = from + (to - from) * k;
      if (k < 1) requestAnimationFrame(step);
      else if (to === 0) el.pause();
    };
    requestAnimationFrame(step);
  };
  const playTrack = (which) => {
    const { main, finale } = get();
    if (!main || !finale) return;
    if (current === which) return;
    current = which;
    if (muted) return;
    if (which === "main") {
      fade(finale, 0, 400);
      main.volume = 0;
      main.play().then(() => fade(main, 0.5, 800)).catch(()=>{});
    } else if (which === "finale") {
      fade(main, 0, 600);
      finale.currentTime = 0;
      finale.volume = 0;
      finale.play().then(() => fade(finale, 0.6, 1200)).catch(()=>{});
    } else if (which === "none") {
      // Silence both tracks (page 18: 什么都不放)
      fade(main, 0, 600);
      fade(finale, 0, 600);
    }
  };
  const start = () => {
    if (started) return;
    started = true;
    playTrack(current || "main");
  };
  const setMuted = (m) => {
    muted = m;
    const { main, finale } = get();
    [main, finale].forEach(a => { if (a) a.muted = m; });
    if (!m && started && current) playTrack(current);
  };
  const isMuted = () => muted;
  return { start, playTrack, setMuted, isMuted };
})();

// Bootstrap audio on first interaction (autoplay policy)
function bootstrapAudio() {
  const kick = () => {
    Audio.start();
    window.removeEventListener("pointerdown", kick);
    window.removeEventListener("keydown", kick);
    window.removeEventListener("touchstart", kick);
  };
  window.addEventListener("pointerdown", kick, { once: true });
  window.addEventListener("keydown", kick, { once: true });
  window.addEventListener("touchstart", kick, { once: true });
}
bootstrapAudio();

// Mute toggle wiring
(function setupMuteBtn() {
  const wire = () => {
    const btn = document.getElementById("mute-btn");
    if (!btn) { requestAnimationFrame(wire); return; }
    const on = document.getElementById("mute-icon-on");
    const off = document.getElementById("mute-icon-off");
    btn.addEventListener("click", () => {
      const next = !Audio.isMuted();
      Audio.setMuted(next);
      on.style.display = next ? "none" : "";
      off.style.display = next ? "" : "none";
    });
  };
  wire();
})();

const SCENE_ORDER = [
  "title", "envelope", "letter", "realize",
  "choiceOffer", "revealJob", "searchHeinu",
  "hr", "choiceOnboard", "revealRmrf",
  "act1", "act1Photo",
  "act2", "act2Photo",
  "act3", "act3Photo",
  "finalIntro", "finalNews", "celebrate",
];

// Which scenes can show the easter-egg note (acts 1-3 narrative beats)
const NOTE_SCENES = new Set(["act1", "act1Photo", "act2", "act2Photo", "act3", "act3Photo"]);

function App() {
  const [scene, setScene] = React.useState("title");
  const [sceneProps, setSceneProps] = React.useState({});
  const [returnTo, setReturnTo] = React.useState(null);
  const [lotteryUsed, setLotteryUsed] = React.useState(false);
  const [toastMsg, setToastMsg] = React.useState("");
  const toastRef = React.useRef(null);

  const showToast = (msg, dur = 1400) => {
    setToastMsg(msg);
    const t = toastRef.current;
    if (!t) return;
    t.classList.add("show");
    clearTimeout(t._t);
    t._t = setTimeout(() => t.classList.remove("show"), dur);
  };

  const go = (next, extraProps = {}) => {
    // Audio routing:
    //  - finalNews (page 18): silence — no track
    //  - celebrate: finale track
    //  - title / everything else: main track
    if (next === "finalNews") Audio.playTrack("none");
    else if (next === "celebrate") Audio.playTrack("finale");
    else if (next === "title") Audio.playTrack("main");
    setScene(next);
    setSceneProps(extraProps);
    // scroll active scene to top
    setTimeout(() => {
      const el = document.querySelector(".scene.active");
      if (el) el.scrollTop = 0;
    }, 50);
  };

  const onNoteClick = () => {
    if (lotteryUsed) return;
    setLotteryUsed(true);
    setReturnTo(scene);
    go("lotteryIntro");
  };

  // update note visibility / progress label
  React.useEffect(() => {
    const note = document.getElementById("note");
    if (note) {
      if (NOTE_SCENES.has(scene) && !lotteryUsed) {
        note.classList.remove("gone");
        note.onclick = onNoteClick;
      } else {
        note.classList.add("gone");
      }
    }
    const prog = document.getElementById("progress");
    if (prog) {
      const idx = SCENE_ORDER.indexOf(scene);
      if (idx >= 0) {
        prog.textContent = String(idx + 1).padStart(2, "0") + " · " + String(SCENE_ORDER.length).padStart(2, "0");
      } else {
        prog.textContent = "彩 · 蛋";
      }
    }
  }, [scene, lotteryUsed]);

  function getNextMain(s) {
    const i = SCENE_ORDER.indexOf(s);
    if (i === -1) return "act2";
    return SCENE_ORDER[Math.min(i + 1, SCENE_ORDER.length - 1)];
  }

  const restart = () => {
    setLotteryUsed(false);
    setReturnTo(null);
    Audio.playTrack("main");
    go("title");
  };

  const map = {
    title: S.TitleScene,
    envelope: S.EnvelopeScene,
    letter: S.LetterScene,
    realize: S.RealizeScene,
    choiceOffer: S.ChoiceOfferScene,
    revealJob: S.RevealJobScene,
    searchHeinu: S.SearchHeinuScene,
    hr: S.HRScene,
    choiceOnboard: S.ChoiceOnboardScene,
    revealRmrf: S.RevealRmrfScene,
    act1: S.Act1Scene,
    act1Photo: S.Act1PhotoScene,
    act2: S.Act2Scene,
    act2Photo: S.Act2PhotoScene,
    act3: S.Act3Scene,
    act3Photo: S.Act3PhotoScene,
    lotteryIntro: S.LotteryIntro,
    lotteryScratch: S.LotteryScratch,
    lotteryReveal2: S.LotteryReveal2,
    lotteryHandshake: S.LotteryHandshake,
    lotteryLost: (p) => E(S.LotteryLost, { ...p, returnTo }),
    finalIntro: S.FinalIntroScene,
    finalNews: S.FinalNewsScene,
  };

  // Celebration scene is special: full takeover
  if (scene === "celebrate") {
    Audio.playTrack("finale");
    return E(Celebration, { restart });
  }

  const Cur = map[scene];

  return (
    <div className="scene active" data-screen-label={"scene-" + scene}>
      {Cur && E(Cur, { go, ...sceneProps })}
    </div>
  );
}

// Sync toast text
function MountToast() {
  return null;
}

// ---- Celebration ----
function Celebration({ restart }) {
  React.useEffect(() => {
    const c = document.getElementById("fw");
    if (!c) return;
    const ctx = c.getContext("2d");
    const rect = c.parentElement.getBoundingClientRect();
    const dpr = window.devicePixelRatio || 1;
    c.width = rect.width * dpr;
    c.height = rect.height * dpr;
    c.style.width = rect.width + "px";
    c.style.height = rect.height + "px";
    ctx.scale(dpr, dpr);

    let parts = [];
    let confetti = [];
    let raf;
    let lastFw = 0;

    const COLORS = ["#8b3a2e", "#b8923a", "#5d7b4a", "#c08a3a", "#d4925a", "#e6c068"];

    function launchFirework() {
      const x = rect.width * (0.2 + Math.random() * 0.6);
      const y = rect.height * (0.2 + Math.random() * 0.4);
      const color = COLORS[(Math.random() * COLORS.length) | 0];
      const n = 36 + ((Math.random() * 18) | 0);
      for (let i = 0; i < n; i++) {
        const a = (Math.PI * 2 * i) / n + Math.random() * 0.1;
        const sp = 2 + Math.random() * 3;
        parts.push({
          x, y,
          vx: Math.cos(a) * sp,
          vy: Math.sin(a) * sp,
          life: 1,
          color,
        });
      }
    }
    function spawnConfetti() {
      for (let i = 0; i < 2; i++) {
        confetti.push({
          x: Math.random() * rect.width,
          y: -10,
          vy: 1 + Math.random() * 2,
          vx: (Math.random() - 0.5) * 1.2,
          r: 3 + Math.random() * 3,
          color: COLORS[(Math.random() * COLORS.length) | 0],
          rot: Math.random() * Math.PI,
          vrot: (Math.random() - 0.5) * 0.2,
        });
      }
    }

    function tick(t) {
      ctx.clearRect(0, 0, rect.width, rect.height);
      if (t - lastFw > 700) {
        launchFirework();
        lastFw = t;
      }
      spawnConfetti();

      parts = parts.filter(p => p.life > 0);
      parts.forEach(p => {
        p.x += p.vx;
        p.y += p.vy;
        p.vy += 0.05;
        p.vx *= 0.99;
        p.life -= 0.012;
        ctx.globalAlpha = Math.max(p.life, 0);
        ctx.fillStyle = p.color;
        ctx.beginPath();
        ctx.arc(p.x, p.y, 2.4, 0, Math.PI * 2);
        ctx.fill();
      });
      ctx.globalAlpha = 1;

      confetti = confetti.filter(c => c.y < rect.height + 20);
      confetti.forEach(co => {
        co.x += co.vx;
        co.y += co.vy;
        co.rot += co.vrot;
        ctx.save();
        ctx.translate(co.x, co.y);
        ctx.rotate(co.rot);
        ctx.fillStyle = co.color;
        ctx.fillRect(-co.r, -co.r * 0.4, co.r * 2, co.r * 0.8);
        ctx.restore();
      });

      raf = requestAnimationFrame(tick);
    }
    raf = requestAnimationFrame(tick);
    return () => {
      cancelAnimationFrame(raf);
      // Clear canvas so leftover frames don't linger after restart
      ctx.clearRect(0, 0, rect.width, rect.height);
    };
  }, []);

  return (
    <div className="celebrate">
      <div className="sub">G O O D · L U C K</div>
      <h1>恭 喜 脱 离 苦 海</h1>
      <div className="sub" style={{ letterSpacing: "0.3em", marginTop: 4 }}>2023 — 2025 · 一段两年的回忆</div>

      <div className="blessing" style={{ marginTop: 28 }}>
        <p>你不知道这两年有什么意义。加了多少次班，导了多少张表，填了多少份安全检查材料。不会有人记得，就连你自己也会慢慢忘记。</p>
        <p>集群也不在乎，它只是继续在亚健康状态顽强地运行着。</p>
        <p>但没关系，你决定先回家。</p>
        <p>长春的夏天快到了。或许净月潭的树影、南湖的晚风，和傍晚终于慢下来的天光会告诉你答案，又或许不会。但至少那里没有台账要写。</p>
        <p>至于未来——谁知道呢。也许有一天你在K线图里抓住了一根改变命运的阳线，实现了所有打工人做梦都不敢做的财富自由。到那时候记得回来请大家吃饭，<span style={{ color: "var(--seal)" }}>别让魏姓同事知道你的新地址就行</span>。</p>
      </div>

      <div className="sign">祝前路松弛，钱包膨胀。</div>
      <button className="restart" onClick={restart}>再来一遍 ↻</button>
    </div>
  );
}

const root = ReactDOM.createRoot(document.getElementById("root"));
root.render(<App />);
