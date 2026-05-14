// All individual scenes. Each receives { go, showToast, setNoteVisible, restart }
const { useState, useEffect, useRef } = React;

// Resource lookup with dev-mode fallback to the assets/ folder.
// When bundled by super_inline_html, window.__resources[id] is a blob URL.
const A = (id, fallback) => (window.__resources && window.__resources[id]) || fallback;

function PhotoFrame({ src, caption }) {
  return (
    <div style={{
      position: "relative",
      borderRadius: 8,
      overflow: "hidden",
      boxShadow: "0 14px 30px rgba(31,24,20,0.22)",
      border: "1px solid rgba(31,24,20,0.15)",
      background: "#1a1612",
    }}>
      <img src={src} alt={caption} style={{ width: "100%", display: "block" }} />
      {caption && (
        <div style={{
          position: "absolute",
          left: 10, bottom: 10,
          background: "rgba(20,16,12,0.78)",
          color: "#f1e8d4",
          fontFamily: "'JetBrains Mono', monospace",
          fontSize: 10,
          letterSpacing: "0.15em",
          padding: "5px 9px",
          borderRadius: 3,
          backdropFilter: "blur(2px)",
        }}>{caption}</div>
      )}
    </div>
  );
}

function Arrow({ onClick, label = "继续" }) {
  return (
    <button className="arrow" onClick={onClick} aria-label={label}>
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
        <path d="M5 12h14M13 5l7 7-7 7" />
      </svg>
    </button>
  );
}

function Choices({ items, onPick }) {
  const [shakeIdx, setShake] = useState(-1);
  return (
    <div className="choices">
      {items.map((it, i) => (
        <button
          key={i}
          className={"choice" + (shakeIdx === i ? " shake" : "")}
          onClick={() => {
            if (it.fake) {
              setShake(i);
              setTimeout(() => setShake(-1), 600);
              onPick(it, i);
            } else {
              onPick(it, i);
            }
          }}
        >
          {it.label}
        </button>
      ))}
    </div>
  );
}

// ---- Scene 1: title ----
function TitleScene({ go }) {
  return (
    <div className="scene-inner" style={{ textAlign: "center" }}>
      <div className="eyebrow">第 〇 幕 · OFFER</div>
      <div className="title">2023 年，<br/>你收到了一封 offer。</div>
      <div className="mono" style={{ marginTop: 8 }}>—— 一段两年长的回忆 ——</div>
      <Arrow onClick={() => go("envelope")} />
    </div>
  );
}

// ---- Envelope opening ----
function EnvelopeScene({ go }) {
  const [open, setOpen] = useState(false);
  return (
    <div className="scene-inner" style={{ textAlign: "center" }}>
      <div className="eyebrow">2023.12 · 来信一封</div>
      <div className="env-wrap" onClick={() => !open && setOpen(true)}>
        <div className={"env" + (open ? " open" : "")}>
          <div className="env-body"></div>
          <div className="env-letter"></div>
          <div className="env-flap"></div>
          <div className="env-seal">启</div>
        </div>
      </div>
      {!open ? (
        <div className="env-tap-hint">点击信封 · 启封</div>
      ) : (
        <Arrow onClick={() => go("letter")} />
      )}
    </div>
  );
}

// ---- Letter content ----
function LetterScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="letter-paper">
        <h3 style={{ marginTop: 18 }}>尊敬的杨尚儒先生：</h3>
        <p>经过严格的面试与综合评估，我们非常高兴地通知您，您已被 <b>北京思特奇信息技术股份有限公司</b> 录用，担任 <b>大数据工程师</b> 一职。</p>
        <p>期待您的加入，共同推动数字化转型的伟大事业。</p>
        <p style={{ color: "var(--muted)", fontSize: 13 }}>请于 2023 年 12 月 32 日前确认是否接受本 offer。</p>
        <div className="letter-stamp">人事<br/>专用章</div>
      </div>
      <Arrow onClick={() => go("realize")} />
    </div>
  );
}

// ---- Realize / pre-choice ----
function RealizeScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">你的内心</div>
      <div className="body">
        <p>你知道这家公司。上市企业，做运营商大数据的老牌玩家。</p>
        <p>大数据工程师 —— 这也是你一直想做的方向。Hadoop、Spark、数据湖……你脑子里已经开始构想自己写 pipeline 的样子了。</p>
        <p>你觉得这是一个不错的起点。</p>
      </div>
      <Arrow onClick={() => go("choiceOffer")} />
    </div>
  );
}

function ChoiceOfferScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="title" style={{ fontSize: 22 }}>要接受这份 offer 吗？</div>
      <Choices
        items={[
          { label: "接受" },
          { label: "同意" },
        ]}
        onPick={() => go("revealJob")}
      />
    </div>
  );
}

function RevealJobScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">入职以后</div>
      <div className="body">
        <p>你的实际工作内容是：</p>
        <p style={{ fontFamily: "JetBrains Mono, monospace", fontSize: 14, color: "var(--ink)", background: "rgba(31,24,20,0.05)", padding: "12px 14px", borderRadius: 6, lineHeight: 1.9 }}>
          → 重启集群<br/>
          → 导表<br/>
          → 写台账<br/>
          → 替甲方填写安全检查材料
        </p>
        <p>更糟糕的是，你的工作性质是国企的第三方驻场 —— 俗称 <b>外包</b>。</p>
      </div>
      <Arrow onClick={() => go("searchHeinu")} />
    </div>
  );
}

function SearchHeinuScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">微信 · 搜索 · 黑奴</div>
      <img
        src={A("wechatHeinu", "assets/wechat-heinu.png")}
        alt="微信搜索黑奴的聊天记录截图"
        style={{
          width: "100%",
          borderRadius: 10,
          boxShadow: "0 14px 30px rgba(31,24,20,0.2)",
          border: "1px solid rgba(31,24,20,0.12)",
          display: "block",
        }}
      />
      <div className="body">
        <p>恭喜你成为了「黑奴」。</p>
        <p>你的外号替你记住了你的努力。微信聊天记录把甲方罪恶的嘴脸一一记录在案。</p>
      </div>
      <Arrow onClick={() => go("hr")} />
    </div>
  );
}

// ---- Act 0.5 HR ----
function HRScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">第 〇 · 五 幕 · 入职</div>
      <div className="body" style={{ color: "var(--muted)", fontStyle: "italic", marginBottom: 0 }}>
        <p>可惜，当时的你并不知道这一切。你激动地加上了 HR 的联系方式。</p>
      </div>
      <div className="chat">
        <div className="chat-header">HR · 小芳</div>
        <div className="bubble-row">
          <div className="av">芳</div>
          <div className="bubble">恭喜杨先生通过面试！🎉</div>
        </div>
        <div className="bubble-row">
          <div className="av">芳</div>
          <div className="bubble">什么时候能来办理入职呀？越快越好哦~</div>
        </div>
        <div className="bubble-row">
          <div className="av">芳</div>
          <div className="bubble">这边是急招的~</div>
        </div>
        <div className="bubble-row me">
          <div className="av me">我</div>
          <div className="bubble me">好的，下周一可以</div>
        </div>
      </div>
      <div className="body">
        <p>消息回得很快，恭喜之余不忘催你尽快入职。你突然想起，JD 上确实写着「急招」二字。</p>
        <p>这在业内很常见，不过你还是暗暗吐槽 —— 从海投简历到拿 offer，前后不到一周。</p>
        <p style={{ color: "var(--muted)", fontStyle: "italic" }}>「在这种节奏的公司，虽然会很辛苦，但应该能获得很多成长吧。」</p>
      </div>
      <Arrow onClick={() => go("choiceOnboard")} />
    </div>
  );
}

function ChoiceOnboardScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="title" style={{ fontSize: 22 }}>要去办理入职吗？</div>
      <Choices
        items={[
          { label: "办理入职" },
          { label: "开心地办理入职" },
        ]}
        onPick={() => go("revealRmrf")}
      />
    </div>
  );
}

function RevealRmrfScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">入职第一天</div>
      <div className="body">
        <p>你了解到了「急招」的真正原因。</p>
      </div>
      <div className="term">
        <div><span className="prompt">prev@prod:~$</span> rm -rf  /ods /temp</div>
        <div style={{ color: "#a89c84" }}># 注意中间那个空格 —— 万恶之源。</div>
        <div className="danger">↳ 已删除 200TB · 甲方数据库根目录</div>
        <div style={{ color: "#a89c84" }}># 你的前任，已不在群里。</div>
        <div><span className="prompt">you@prod:~$</span> <span className="blink">_</span></div>
      </div>
      <div className="body">
        <p>你还没来得及熟悉新同事的名字，就已经跟着数据团队没日没夜地加班 <b>恢复数据</b>。</p>
        <p>说是「恢复」，其实就是把表导来导去，重跑脚本。</p>
        <p>你不懂那些业务逻辑，你只是一个人形 <span className="crontab-tag">crontab</span>。</p>
        <p>你隐隐觉得哪里不对，但又说不上来。毕竟，这才是第一天。</p>
      </div>
      <Arrow onClick={() => go("act1")} />
    </div>
  );
}

// ---- Act 1: 驻场 ----
function Act1Scene({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">第 一 幕 · 驻场</div>
      <div className="title">
        你终于把数据恢复得差不多了，<br/>开始正常下班。
      </div>
      <div className="body">
        <p>这让领导觉得你最近工作不够饱和，决定让你 —— 在轻松的工作之余，顺便给甲方提供 <b>情绪价值</b>。</p>
      </div>
      <Choices
        items={[
          { label: "接受" },
          { label: "辞职", fake: "rejected1" },
        ]}
        onPick={(it) => {
          if (it.fake) {
            // shake then accept
            setTimeout(() => go("act1Photo", { rejected: "rejected1" }), 700);
          } else {
            go("act1Photo");
          }
        }}
      />
    </div>
  );
}

function Act1PhotoScene({ go, rejected }) {
  return (
    <div className="scene-inner">
      {rejected && <RejectedToastInline reason="提交辞职申请。HR 笑了。" />}
      <PhotoFrame src={A("act1Cubicle", "assets/act1-cubicle.png")} caption="甲方办公区 · 你的新工位" />
      <div className="body">
        <p>于是你终于有了一个有空调的工位 —— 在 <b>甲方</b>。</p>
      </div>
      <Arrow onClick={() => go("act2")} />
    </div>
  );
}

// Small inline rejection note (when user picked 辞职)
function RejectedToastInline({ reason }) {
  return (
    <div style={{
      background: "rgba(139,58,46,0.08)",
      border: "1px dashed rgba(139,58,46,0.35)",
      borderRadius: 8,
      padding: "10px 14px",
      fontFamily: "Noto Sans SC, sans-serif",
      fontSize: 12,
      color: "var(--seal)",
      textAlign: "center",
      letterSpacing: "0.1em",
    }}>
      你点击了「辞职」。{reason}
    </div>
  );
}

// ---- Act 2: 外卖 ----
function Act2Scene({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">第 二 幕 · 外卖</div>
      <div className="title">同事们饿了。</div>
      <div className="chat">
        <div className="chat-header">李鹭</div>
        <div className="bubble-row">
          <div className="av" style={{ padding: 0, overflow: "hidden" }}>
            <img src={A("liluAvatar", "assets/lilu-avatar.png")} alt="李鹭" style={{ width: "100%", height: "100%", objectFit: "cover" }} />
          </div>
          <div className="bubble">哥哥<br/>帮我拿一下外卖可以吗 🥺<br/>反正是顺路的~</div>
        </div>
      </div>
      <Choices
        items={[
          { label: "接受" },
          { label: "辞职", fake: "rejected2" },
        ]}
        onPick={(it) => {
          if (it.fake) setTimeout(() => go("act2Photo", { rejected: "rejected2" }), 700);
          else go("act2Photo");
        }}
      />
    </div>
  );
}

function Act2PhotoScene({ go, rejected }) {
  return (
    <div className="scene-inner">
      {rejected && <RejectedToastInline reason="同事没听见。" />}
      <PhotoFrame src={A("act2Takeout", "assets/act2-takeout.png")} caption="「顺路」×6 · 手提充实" />
      <div className="body">
        <p>「顺路」拿了 <b>6 袋</b> 外卖。</p>
        <p>你不是外卖员，但你拥有外卖员的一切素质。</p>
      </div>
      <Arrow onClick={() => go("act3")} />
    </div>
  );
}

// ---- Act 3: 表白 ----
function Act3Scene({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">第 三 幕 · 表白</div>
      <div className="title">某魏姓同事让你下班别走。</div>
      <div className="body">
        <p>他说，有 <b>重要的事情</b> 要跟你说。</p>
        <p>他的表情看起来有点扭捏。</p>
      </div>
      <Choices
        items={[
          { label: "接受" },
          { label: "辞职", fake: "rejected3" },
        ]}
        onPick={(it) => {
          if (it.fake) setTimeout(() => go("act3Photo", { rejected: "rejected3" }), 700);
          else go("act3Photo");
        }}
      />
    </div>
  );
}

function Act3PhotoScene({ go, rejected }) {
  return (
    <div className="scene-inner">
      {rejected && <RejectedToastInline reason="他锁了车门。" />}
      <PhotoFrame src={A("act3Parking", "assets/act3-parking.png")} caption="停车场 · 不能独自行走的下班" />
      <div className="body">
        <p>他向你深情表白，称你是他这辈子 <b>唯一的真爱</b>。</p>
        <p>你拒绝了。</p>
        <p>但这不重要 —— 他单方面宣布了你们的恋情。</p>
        <p style={{ color: "var(--muted)" }}>从此，你失去了在公司独自行走的权利。</p>
      </div>
      <Arrow onClick={() => go("finalIntro")} />
    </div>
  );
}

// ---- Easter egg: lottery ----
function LotteryIntro({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">彩 蛋 · 下 班 路 上</div>
      <div className="title" style={{ fontSize: 22 }}>
        你忘记了家里的产业，<br/>路过彩票店，<br/>突发奇想买了一张刮刮乐。
      </div>
      <Choices items={[{ label: "刮开" }]} onPick={() => go("lotteryScratch")} />
    </div>
  );
}

function LotteryScratch({ go }) {
  const [revealed, setRevealed] = useState(false);
  return (
    <div className="scene-inner" style={{ textAlign: "center" }}>
      <div className="eyebrow">中 国 福 利 彩 票 · 刮 刮 乐</div>
      <ScratchCard
        amount={revealed ? "5,000,000" : "5,000,000"}
        label={"中 奖 金 额 / RMB"}
        onScratchedEnough={() => setRevealed(true)}
      />
      {revealed && (
        <>
          <div className="body" style={{ textAlign: "left" }}>
            <p>你愣住了。</p>
            <p><b>五百万。</b></p>
            <p>你不敢相信自己的眼睛，怀疑自己加班出幻觉了。你又确认了一遍。</p>
          </div>
          <Arrow onClick={() => go("lotteryReveal2")} />
        </>
      )}
    </div>
  );
}

function LotteryReveal2({ go }) {
  return (
    <div className="scene-inner" style={{ textAlign: "center" }}>
      <div className="eyebrow">再 看 一 眼</div>
      <div className="ph" style={{ aspectRatio: "1.5/1", width: "min(86%, 320px)", margin: "8px auto", background: "radial-gradient(circle at 30% 30%, #fff6da 0, #f0deaa 60%, #d8b96a 100%)", color: "var(--seal)" }}>
        <div className="ph-label" style={{ background: "transparent", padding: 0 }}>
          <div style={{ fontFamily: "Ma Shan Zheng, serif", fontSize: 44, lineHeight: 1.1, color: "var(--seal)" }}>50,000,000</div>
          <div style={{ fontFamily: "Noto Sans SC, sans-serif", fontSize: 12, marginTop: 6, letterSpacing: "0.3em", color: "var(--ink-2)" }}>中 奖 金 额 / RMB</div>
        </div>
      </div>
      <div className="body" style={{ textAlign: "left" }}>
        <p>你确实看错了。<br/>你少看了一个 <b>零</b>。</p>
        <p>不是五百万，是 <b>五千万</b>。</p>
        <p>你的手在发抖。</p>
      </div>
      <Arrow onClick={() => go("lotteryHandshake")} />
    </div>
  );
}

function LotteryHandshake({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">不 知 道 谁 走 漏 了 风 声</div>
      <PhotoFrame src={A("lotteryHandshake", "assets/lottery-handshake.png")} caption="甲方领导 · 握手 · 不肯松开" />
      <div className="body">
        <p>消息不知道怎么传到了甲方。</p>
        <p>领导亲自下楼迎接你，握着你的手不肯松开，说一直很看好你的能力和潜力 —— </p>
        <p>并 <b>诚挚邀请你投资</b> 他的一个内部项目。</p>
        <p style={{ background: "rgba(184,146,58,0.12)", padding: "10px 14px", borderRadius: 6, color: "var(--ink)" }}>
          🤝 保本 · 年化 <b>30%</b>
        </p>
      </div>
      <Choices
        items={[
          { label: "投资" },
          { label: "辞职" },
        ]}
        onPick={(it, i) => go(i === 0 ? "lotteryLost" : "celebrate")}
      />
    </div>
  );
}

function LotteryLost({ go, returnTo }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">三 个 月 后</div>
      <div className="reveal-line">你的 5000 万没了。</div>
      <div className="body">
        <p>年化 30%，本金归零，用时 <b>三个月</b>。</p>
        <p>你又回到了工位上，假装什么都没发生过。</p>
      </div>
      <Arrow onClick={() => go(returnTo || "act2")} />
    </div>
  );
}

// ---- Final ----
function FinalIntroScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="eyebrow">最 终 幕</div>
      <div className="title">
        你已经习惯了这一切。<br/>
        <span style={{ color: "var(--muted)", fontWeight: 400 }}>你觉得生活虽然苦，但也不是不能忍。</span>
      </div>
      <div className="body">
        <p>直到有一天 ——</p>
      </div>
      <Arrow onClick={() => go("finalNews")} />
    </div>
  );
}

function FinalNewsScene({ go }) {
  return (
    <div className="scene-inner">
      <div className="news">
        <div className="news-head">
          <span className="news-tag">快讯</span>
          <span>2026.11.07 · 14:22</span>
        </div>
        <h4>工信部与 SpaceX 签署战略合作协议</h4>
        <div className="news-body">
          <p>Starlink 将全面接管中国通信基础设施，三大运营商于年底前完成历史使命。</p>
          <div className="news-quote">「我们的征途是星辰，没有大海。」<br/>—— 工信部发言人</div>
        </div>
      </div>
      <div className="body">
        <p>甲方没了。</p>
        <p>没有任何一家运营商打败了对手 —— 你听说最后的赢家是一个 <b>姓马的外国人</b>。</p>
        <p>总之，你失去了 <b>最后的利用价值</b>。</p>
        <p style={{ color: "var(--seal)", fontWeight: 500 }}>但换个角度想 —— 你自由了。</p>
      </div>
      <Arrow onClick={() => go("celebrate")} />
    </div>
  );
}

window.Scenes = {
  TitleScene, EnvelopeScene, LetterScene, RealizeScene,
  ChoiceOfferScene, RevealJobScene, SearchHeinuScene,
  HRScene, ChoiceOnboardScene, RevealRmrfScene,
  Act1Scene, Act1PhotoScene,
  Act2Scene, Act2PhotoScene,
  Act3Scene, Act3PhotoScene,
  LotteryIntro, LotteryScratch, LotteryReveal2, LotteryHandshake, LotteryLost,
  FinalIntroScene, FinalNewsScene,
};
