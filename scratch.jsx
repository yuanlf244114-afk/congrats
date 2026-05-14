// Scratch card component
function ScratchCard({ onScratchedEnough, amount, label }) {
  const wrapRef = React.useRef(null);
  const canvasRef = React.useRef(null);
  const [done, setDone] = React.useState(false);
  const drawing = React.useRef(false);

  React.useEffect(() => {
    const canvas = canvasRef.current;
    const wrap = wrapRef.current;
    if (!canvas || !wrap) return;
    const dpr = window.devicePixelRatio || 1;
    const rect = wrap.getBoundingClientRect();
    canvas.width = rect.width * dpr;
    canvas.height = rect.height * dpr;
    canvas.style.width = rect.width + "px";
    canvas.style.height = rect.height + "px";
    const ctx = canvas.getContext("2d");
    ctx.scale(dpr, dpr);
    // metallic foil
    const g = ctx.createLinearGradient(0, 0, rect.width, rect.height);
    g.addColorStop(0, "#8a8478");
    g.addColorStop(0.5, "#c5b896");
    g.addColorStop(1, "#6e6657");
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, rect.width, rect.height);
    ctx.fillStyle = "rgba(31,24,20,0.55)";
    ctx.font = "600 14px 'Noto Sans SC', sans-serif";
    ctx.textAlign = "center";
    ctx.fillText("刮开此处", rect.width / 2, rect.height / 2 - 4);
    ctx.font = "10px 'JetBrains Mono', monospace";
    ctx.fillStyle = "rgba(31,24,20,0.45)";
    ctx.fillText("SCRATCH HERE", rect.width / 2, rect.height / 2 + 14);
    ctx.globalCompositeOperation = "destination-out";
  }, []);

  const erase = (clientX, clientY) => {
    const canvas = canvasRef.current;
    const rect = canvas.getBoundingClientRect();
    const x = clientX - rect.left;
    const y = clientY - rect.top;
    const ctx = canvas.getContext("2d");
    ctx.beginPath();
    ctx.arc(x, y, 28, 0, Math.PI * 2);
    ctx.fill();
  };

  const checkProgress = () => {
    const canvas = canvasRef.current;
    const ctx = canvas.getContext("2d");
    const w = canvas.width, h = canvas.height;
    // Sample only the central region (60% × 60% in the middle).
    const cx = Math.floor(w * 0.2);
    const cy = Math.floor(h * 0.2);
    const cw = Math.floor(w * 0.6);
    const ch = Math.floor(h * 0.6);
    const sample = ctx.getImageData(cx, cy, cw, ch).data;
    let cleared = 0, total = 0;
    for (let i = 3; i < sample.length; i += 4 * 16) {
      total++;
      if (sample[i] < 30) cleared++;
    }
    if (cleared / total > 0.55 && !done) {
      setDone(true);
      // Wipe the entire foil so the prize is fully revealed.
      ctx.clearRect(0, 0, w, h);
      onScratchedEnough && onScratchedEnough();
    }
  };

  const start = (e) => {
    drawing.current = true;
    move(e);
  };
  const end = () => {
    if (drawing.current) checkProgress();
    drawing.current = false;
  };
  const move = (e) => {
    if (!drawing.current) return;
    e.preventDefault();
    const t = e.touches ? e.touches[0] : e;
    erase(t.clientX, t.clientY);
    // Probe progress live so the user doesn't need to lift the finger.
    if (!done) checkProgress();
  };

  return (
    <div>
      <div className="scratch-wrap" ref={wrapRef}>
        <div className="scratch-prize">
          <div className="big">{amount}</div>
          <div className="lab">{label}</div>
        </div>
        <canvas
          ref={canvasRef}
          className="scratch-canvas"
          onMouseDown={start}
          onMouseMove={move}
          onMouseUp={end}
          onMouseLeave={end}
          onTouchStart={start}
          onTouchMove={move}
          onTouchEnd={end}
        />
      </div>
      <div className="scratch-hint">用手指/鼠标刮开</div>
    </div>
  );
}

window.ScratchCard = ScratchCard;
