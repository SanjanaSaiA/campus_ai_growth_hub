import React, { useEffect, useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import "./styles.css";

const TARGET = 500;
const CHANNEL_TARGETS = {
  "Campus Ambassador": 200,
  "Institutional Partnership": 100,
  "Student Club": 75,
  "Referral": 125,
};

const seedPartners = [
  { id: "p1", name: "Sanjana", college: "ABC Engineering College", role: "Campus Ambassador", code: "ABC-SANJANA-27", channel: "Campus Ambassador", registrations: 42 },
  { id: "p2", name: "Rahul", college: "XYZ Institute of Technology", role: "Campus Ambassador", code: "XYZ-RAHUL-27", channel: "Campus Ambassador", registrations: 35 },
  { id: "p3", name: "Priya", college: "DEF College of Engineering", role: "Student Club Lead", code: "DEF-PRIYA-27", channel: "Student Club", registrations: 31 },
  { id: "p4", name: "Arjun", college: "GHI University", role: "TPO / Faculty", code: "GHI-ARJUN-27", channel: "Institutional Partnership", registrations: 27 },
  { id: "p5", name: "Kavya", college: "JKL Institute", role: "Campus Ambassador", code: "JKL-KAVYA-27", channel: "Campus Ambassador", registrations: 24 }
];

const seedStudents = [
  ["Aarav", "aarav@example.com", "ABC Engineering College", "CSE", "2027", "ABC-SANJANA-27"],
  ["Meera", "meera@example.com", "XYZ Institute of Technology", "IT", "2027", "XYZ-RAHUL-27"],
  ["Ishaan", "ishaan@example.com", "DEF College of Engineering", "AI / Data Science", "2027", "DEF-PRIYA-27"],
  ["Ananya", "ananya@example.com", "GHI University", "ECE", "2027", "GHI-ARJUN-27"],
  ["Vikram", "vikram@example.com", "JKL Institute", "CSE", "2027", "JKL-KAVYA-27"]
];

const colleges = [
  "ABC Engineering College",
  "XYZ Institute of Technology",
  "DEF College of Engineering",
  "GHI University",
  "JKL Institute",
  "MNO College",
  "PQR Institute of Technology",
  "STU Engineering College",
  "VWX University",
  "YZA College of Engineering"
];

function makeSeedStudents() {
  const rows = [];
  for (let i = 0; i < 280; i++) {
    const college = colleges[i % colleges.length];
    const partner = seedPartners[i % seedPartners.length];
    const branches = ["CSE", "IT", "AI / Data Science", "ECE"];
    rows.push({
      id: `seed-${i + 1}`,
      name: `Student ${i + 1}`,
      email: `student${i + 1}@demo.com`,
      phone: `90000${String(i + 1).padStart(5, "0")}`,
      college,
      branch: branches[i % branches.length],
      year: "2027",
      referralCode: partner.code,
      partnerId: partner.id,
      channel: i % 4 === 0 ? "Referral" : partner.channel,
      createdAt: new Date(Date.now() - (i % 7) * 86400000 - (i % 8) * 3600000).toISOString()
    });
  }
  return rows;
}

function getInitialData() {
  const stored = localStorage.getItem("campus_ai_growth_hub");
  if (stored) {
    try { return JSON.parse(stored); } catch {}
  }
  return { partners: seedPartners, students: makeSeedStudents() };
}

function slugCode(name, college) {
  const a = name.replace(/[^a-zA-Z0-9]/g, "").slice(0, 10).toUpperCase() || "PARTNER";
  const b = college.replace(/[^a-zA-Z0-9]/g, "").slice(0, 6).toUpperCase() || "CAMPUS";
  return `${b}-${a}-27`;
}

function App() {
  const [data, setData] = useState(getInitialData);
  const [view, setView] = useState(window.location.pathname || "/");
  const [refCode, setRefCode] = useState(new URLSearchParams(window.location.search).get("ref") || "");
  const [notice, setNotice] = useState("");
  const [pageChanging, setPageChanging] = useState(false);

  useEffect(() => {
    localStorage.setItem("campus_ai_growth_hub", JSON.stringify(data));
  }, [data]);

  useEffect(() => {
    const onPop = () => {
      setView(window.location.pathname || "/");
      setRefCode(new URLSearchParams(window.location.search).get("ref") || "");
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, []);

  const navigate = (path) => {
    setPageChanging(true);
    window.setTimeout(() => {
      window.history.pushState({}, "", path);
      setView(path);
      setRefCode(new URLSearchParams(window.location.search).get("ref") || "");
      window.scrollTo({ top: 0, behavior: "smooth" });
      window.setTimeout(() => setPageChanging(false), 80);
    }, 180);
  };

  const students = data.students;
  const partners = data.partners;
  const total = students.length;
  const channelCounts = useMemo(() => {
    const out = Object.fromEntries(Object.keys(CHANNEL_TARGETS).map(k => [k, 0]));
    students.forEach(s => out[s.channel] = (out[s.channel] || 0) + 1);
    return out;
  }, [students]);

  const registerStudent = (student) => {
    const email = student.email.trim().toLowerCase();
    const phone = student.phone.trim();
    if (students.some(s => s.email.toLowerCase() === email || (phone && s.phone === phone))) {
      return { ok: false, message: "You are already registered for this workshop." };
    }

    const partner = partners.find(p => p.code === student.referralCode);
    const channel = partner ? partner.channel : "Referral";
    const newStudent = {
      ...student,
      id: `student-${Date.now()}`,
      partnerId: partner?.id || "",
      channel,
      createdAt: new Date().toISOString()
    };

    setData(prev => ({ ...prev, students: [...prev.students, newStudent] }));
    return { ok: true, student: newStudent, partner };
  };

  const addPartner = (form) => {
    const codeBase = slugCode(form.name, form.college);
    let code = codeBase;
    let n = 2;
    while (partners.some(p => p.code === code)) code = `${codeBase}-${n++}`;
    const partner = {
      id: `p-${Date.now()}`,
      ...form,
      code,
      channel: form.role === "TPO / Faculty" ? "Institutional Partnership" :
                form.role === "Student Club Lead" ? "Student Club" : "Campus Ambassador",
      registrations: 0
    };
    setData(prev => ({ ...prev, partners: [...prev.partners, partner] }));
    return partner;
  };

  const copyText = async (text) => {
    try {
      await navigator.clipboard.writeText(text);
      setNotice("Copied to clipboard ✓");
      setTimeout(() => setNotice(""), 1800);
    } catch {
      setNotice("Copy failed — select and copy the text.");
      setTimeout(() => setNotice(""), 2200);
    }
  };

  const partnerForRef = partners.find(p => p.code === refCode);

  return (
    <div className="app">
      {notice && <div className="toast">{notice}</div>}
      {pageChanging && <div className="route-wipe" aria-hidden="true"></div>}
      <Header navigate={navigate} view={view} />

      {view === "/" && <Landing navigate={navigate} />}
      {view === "/register" && <Register navigate={navigate} refCode={refCode} partner={partnerForRef} onRegister={registerStudent} />}
      {view === "/confirmation" && <Confirmation navigate={navigate} />}
      {view === "/partner" && <PartnerOnboard navigate={navigate} onAddPartner={addPartner} />}
      {view === "/partner-kit" && <PartnerKit navigate={navigate} partner={partners[partners.length - 1]} copyText={copyText} />}
      {view === "/leaderboard" && <Leaderboard students={students} partners={partners} />}
      {view === "/dashboard" && <Dashboard students={students} partners={partners} channelCounts={channelCounts} navigate={navigate} />}
      {view === "/automation" && <Automation />}
      {view === "/about" && <About />}
    </div>
  );
}

function Header({ navigate, view }) {
  return (
    <header className="nav">
      <button className="brand" onClick={() => navigate("/")}>
        <span className="brand-mark">✦</span>
        <span>Campus AI Growth Hub</span>
      </button>
      <nav>
        <button className={view === "/" ? "active" : ""} onClick={() => navigate("/")}>Workshop</button>
        <button onClick={() => navigate("/leaderboard")}>Campus AI League</button>
        <button onClick={() => navigate("/partner")}>Partner With Us</button>
        <button className="nav-cta" onClick={() => navigate("/register")}>Register Free</button>
      </nav>
    </header>
  );
}

function Landing({ navigate }) {
  return (
    <main>
      <section className="hero hero-v2">
        <div className="hero-copy">
          <div className="eyebrow">🔥 FREE AI WORKSHOP • LIVE HANDS-ON BUILD • WIN CASH PRIZES — TOTAL POOL ₹2,000</div>
          <h1>60 minutes. One <span>AI project.</span> Zero excuses.</h1>
          <p className="hero-lead">
            Interviewers don't care about your course list — they want to see <strong>what you built.</strong>{" "}
            Join 500+ engineering students building their first AI project live.
            No slides. No theory. Just build, ship, and showcase.
          </p>
          <div className="hero-hook">
            <span>⚡ Build a real AI project</span><span>💰 Win cash prizes — ₹2,000 pool</span><span>🏆 Top your campus leaderboard</span>
          </div>
          <div className="hero-actions">
            <button className="primary-btn big magnetic pulse-glow" onClick={() => navigate("/register")}>🚀 Grab My Free Seat Now <span>→</span></button>
            <button className="ghost-btn big" onClick={() => document.getElementById("prizes")?.scrollIntoView({behavior:"smooth"})}>See Cash Prizes ↓</button>
          </div>
          <div className="trust-row"><span>✓ 100% Free</span><span>✓ No prerequisites</span><span>✓ Seats filling fast</span></div>
          <div className="micro-proof">
            <span className="avatars"><i>AI</i><i>ML</i><i>🚀</i></span>
            <span><strong>280+ students already registered</strong><br/><small>Limited spots. Once it's full, registration closes.</small></span>
          </div>
        </div>

        <div className="hero-card hero-card-v2">
          <div className="live-pill"><i></i> LIVE BUILD SESSION</div>
          <div className="hero-mini-title">What you walk out with</div>
          <div className="project-preview">
            <div className="preview-top"><span>YOUR AI PROJECT</span><b>LIVE</b></div>
            <div className="code-line short"></div><div className="code-line"></div><div className="code-line medium"></div><div className="code-line tiny"></div>
            <div className="result-card"><div className="result-icon">AI</div><div><small>WORKING PROTOTYPE</small><strong>A project you built. Not downloaded.</strong></div><span>↗</span></div>
          </div>
          <div className="hero-card-caption"><small>INTERVIEW GAME-CHANGER</small><strong>"I built an AI project in 60 minutes."</strong><span>That's your new answer.</span></div>
          <div className="hero-card-bottom"><span>60 MIN</span><span>₹0 FEE</span><span>💰 CASH PRIZES</span></div>
        </div>
      </section>

      <section className="social-proof-band">
        <div><strong>₹2,000</strong><span>total cash prize pool</span></div>
        <div><strong>60 min</strong><span>to build something real</span></div>
        <div><strong>100%</strong><span>free — zero catches</span></div>
        <div><strong>500+</strong><span>students joining</span></div>
      </section>

      <section className="section conversion-section" id="experience">
        <div className="section-heading">
          <div className="eyebrow">STILL THINKING? HERE'S WHY YOU CAN'T MISS THIS</div>
          <h2>Your resume has courses. Interviewers want projects.</h2>
          <p>This is your fastest path from "I'm still learning" to "Let me show you what I built."</p>
        </div>
        <div className="conversion-grid">
          <div className="conversion-card featured"><div className="big-number">01</div><div className="feature-icon">⚡</div><h3>Build a real AI project — in 60 minutes flat</h3><p>No theory dumps. No 12-hour courses. You'll write code, train a model, and have a working project before your coffee gets cold.</p><span>Your friends watch tutorials. You ship projects.</span></div>
          <div className="conversion-card"><div className="big-number">02</div><div className="feature-icon">🎯</div><h3>Walk into interviews with proof, not promises</h3><p>"What have you built?" — the question that separates selected candidates from rejected ones. After this workshop, you'll have a real answer.</p><span>Build it. Explain it. Get the job.</span></div>
          <div className="conversion-card"><div className="big-number">03</div><div className="feature-icon">💰</div><h3>Refer friends. Win real cash prizes.</h3><p>Top ambassadors & referral squads win cash from our ₹2,000 prize pool. Share your link, get your friends in, climb the leaderboard, and get paid.</p><span>More referrals = more money. Simple.</span></div>
        </div>
      </section>

      <section className="prizes-section" id="prizes">
        <div className="prizes-inner">
          <div className="section-heading center">
            <div className="eyebrow">💰 REAL CASH. REAL WINNERS. NO LOTTERY.</div>
            <h2>₹2,000 total cash prize pool.</h2>
            <p>Refer your friends. The students with the most successful referrals win real money — not coupons, not swag, <strong>actual cash.</strong></p>
          </div>

          {/* Category heading: Ambassadors */}
          <div className="prize-category-label">🏅 TOP CAMPUS AMBASSADORS</div>
          <div className="prizes-grid prizes-grid-5">
            <div className="prize-card gold">
              <div className="prize-rank">🥇</div>
              <div className="prize-place">1st Ambassador</div>
              <div className="prize-amount">₹300</div>
              <div className="prize-label">CASH PRIZE</div>
              <p>Highest verified referrals among ambassadors wins the top spot.</p>
            </div>
            <div className="prize-card silver">
              <div className="prize-rank">🥈</div>
              <div className="prize-place">2nd Ambassador</div>
              <div className="prize-amount">₹300</div>
              <div className="prize-label">CASH PRIZE</div>
              <p>Second-highest referrals. Close to the top — and still getting paid.</p>
            </div>
            <div className="prize-card bronze">
              <div className="prize-rank">🥉</div>
              <div className="prize-place">3rd Ambassador</div>
              <div className="prize-amount">₹300</div>
              <div className="prize-label">CASH PRIZE</div>
              <p>Third place still takes home cash. Every referral counts.</p>
            </div>
            <div className="prize-card steel">
              <div className="prize-rank">4️⃣</div>
              <div className="prize-place">4th Ambassador</div>
              <div className="prize-amount">₹100</div>
              <div className="prize-label">CASH PRIZE</div>
              <p>Almost at the podium — still rewarded for your hustle.</p>
            </div>
            <div className="prize-card steel">
              <div className="prize-rank">5️⃣</div>
              <div className="prize-place">5th Ambassador</div>
              <div className="prize-amount">₹100</div>
              <div className="prize-label">CASH PRIZE</div>
              <p>Top 5 is still winning. Keep referring and climb up.</p>
            </div>
          </div>

          {/* Category heading: Referral Squads */}
          <div className="prize-category-label" style={{marginTop:"40px"}}>👥 TOP REFERRAL SQUADS</div>
          <div className="prizes-grid prizes-grid-3">
            <div className="prize-card gold">
              <div className="prize-rank">🥇</div>
              <div className="prize-place">1st Squad</div>
              <div className="prize-amount">₹300</div>
              <div className="prize-label">CASH PRIZE</div>
              <p>The squad with the most combined referrals takes the crown.</p>
            </div>
            <div className="prize-card silver">
              <div className="prize-rank">🥈</div>
              <div className="prize-place">2nd Squad</div>
              <div className="prize-amount">₹300</div>
              <div className="prize-label">CASH PRIZE</div>
              <p>Second squad. Real cash. Your team's effort pays off.</p>
            </div>
            <div className="prize-card bronze">
              <div className="prize-rank">🥉</div>
              <div className="prize-place">3rd Squad</div>
              <div className="prize-amount">₹300</div>
              <div className="prize-label">CASH PRIZE</div>
              <p>Bronze squad still banks cash. Keep your crew motivated.</p>
            </div>
          </div>

          <div className="prizes-total-badge">
            🏆 Total Prize Pool: <strong>₹2,000</strong> &nbsp;|&nbsp; 8 winners &nbsp;|&nbsp; Pure cash, no strings
          </div>

          <div className="prizes-how">
            <div className="eyebrow">HOW TO WIN — IT'S STUPIDLY SIMPLE</div>
            <div className="prizes-steps">
              <div><span>01</span><strong>Register for free</strong><small>Takes 30 seconds. You get a unique referral link instantly.</small></div>
              <div><span>02</span><strong>Share everywhere</strong><small>WhatsApp groups, Instagram stories, class groups — go wild.</small></div>
              <div><span>03</span><strong>Watch your rank climb</strong><small>Every friend who registers = 1 point on the live leaderboard.</small></div>
              <div><span>04</span><strong>Collect your cash</strong><small>Top ambassadors & squads get real cash after the campaign. No strings.</small></div>
            </div>
          </div>
          <div className="prizes-cta">
            <button className="primary-btn big pulse-glow" onClick={() => navigate("/register")}>Register Now & Start Earning →</button>
            <span className="prizes-note">💡 Every friend who registers through your link = 1 referral point toward cash prizes</span>
          </div>
        </div>
      </section>

      <section className="dark-section dark-v2">
        <div>
          <div className="eyebrow light">THE 60-MINUTE EXPERIENCE</div>
          <h2>Blank screen → working AI project.</h2>
          <p className="dark-lead">No overthinking. No setup headaches. Just follow along and build.</p>
        </div>
        <div className="steps">
          <Step n="01" title="Register (30 sec)" text="Grab your free seat. Get your referral link." />
          <Step n="02" title="Show up with a laptop" text="That's literally all you need. We handle the rest." />
          <Step n="03" title="Build live (60 min)" text="Follow the guided AI workflow. Write code. Ship a project." />
          <Step n="04" title="Flex & earn" text="Showcase your project. Refer friends. Win cash." />
        </div>
      </section>

      <section className="reward-section">
        <div className="reward-copy">
          <div className="eyebrow">🏆 CAMPUS AI LEAGUE — LIVE LEADERBOARD</div>
          <h2>Your college vs. everyone else. Who's winning?</h2>
          <p>Every referral pushes your college up the leaderboard. Top campuses get <strong>bragging rights + recognition.</strong> Top ambassadors & referral squads win <strong>real cash prizes from a ₹2,000 pool.</strong></p>
        </div>
        <div className="reward-card">
          <div className="reward-icon">💰</div>
          <div><small>CASH PRIZE POOL</small><h3>₹2,000 across 8 winners — ambassadors & squads.</h3><p>🏅 Top 3 Ambassadors: ₹300 each • 👥 Top 3 Squads: ₹300 each • 4th & 5th Ambassadors: ₹100 each. Pure cash. Paid after campaign ends.</p></div>
          <div className="reward-tiers"><span><b>🏅 ₹300</b><small>Top 3 Ambassadors</small></span><span><b>👥 ₹300</b><small>Top 3 Squads</small></span></div>
          <em>Winners announced after campaign. Only verified, unique registrations count.</em>
        </div>
      </section>

      <section className="section urgency urgency-v2">
        <div className="urgency-card">
          <div>
            <div className="eyebrow">⏰ SEATS ARE LIMITED. THIS ISN'T MARKETING TALK.</div>
            <h2>500 seats. 280+ already taken. Don't be the one who "meant to register."</h2>
            <p>Your placement interview won't wait. Your resume won't fix itself. 60 minutes is all it takes to have a real project. Plus, the earlier you register, the more time you have to refer friends and win cash.</p>
          </div>
          <button className="primary-btn big pulse-glow" onClick={() => navigate("/register")}>🚀 Register Free — Before It's Full →</button>
        </div>
      </section>

      <section className="section partner-callout partner-v2">
        <div><div className="eyebrow">FOR CAMPUS AMBASSADORS & STUDENT CLUBS</div><h2>Be the one who brought AI to your campus.</h2><p>Get a unique referral link, ready-to-share WhatsApp messages, and a live leaderboard. Top campus partners are eligible for cash prizes too.</p></div>
        <button className="ghost-btn" onClick={() => navigate("/partner")}>Become a Campus Partner & Earn →</button>
      </section>
    </main>
  );
}

function Feature({icon,title,text}) {
  return <div className="feature-card"><div className="feature-icon">{icon}</div><h3>{title}</h3><p>{text}</p></div>;
}
function Step({n,title,text}) {
  return <div className="step"><span>{n}</span><div><h3>{title}</h3><p>{text}</p></div></div>;
}

function Register({ navigate, refCode, partner, onRegister }) {
  const [form, setForm] = useState({
    name:"", email:"", phone:"", college:"", branch:"CSE", year:"2027", referralCode:refCode || ""
  });
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (refCode) setForm(f => ({...f, referralCode: refCode}));
  }, [refCode]);

  const submit = (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");
    setSubmitting(true);
    window.setTimeout(() => {
      const result = onRegister(form);
      if (!result.ok) {
        setSubmitting(false);
        setError(result.message);
        return;
      }
      sessionStorage.setItem("lastRegistration", JSON.stringify(result.student));
      navigate("/confirmation");
    }, 700);
  };

  return (
    <main className="registration-page">
      <div className="registration-glow glow-one"></div>
      <div className="registration-glow glow-two"></div>
      <div className="registration-shell">
        <div className="registration-top">
          <div className="eyebrow">🔥 FREE WORKSHOP · LIMITED SEATS · CASH PRIZES</div>
          <h1>Register in 30 seconds.<br/><span>Start winning cash.</span></h1>
          <p>Build your first AI project in 60 minutes. Refer friends to win from our ₹2,000 cash prize pool. Seats are filling fast — don't miss out.</p>
          {partner && <div className="ref-badge">✨ Invited by <strong>{partner.name}</strong> · {partner.college}</div>}
        </div>

        <div className="registration-layout">
          <div className="registration-benefits">
            <div className="benefit-title">What you get — for ₹0</div>
            <div className="benefit-item"><span>01</span><div><strong>Build a real AI project in 60 min</strong><small>Hands-on. Not another boring lecture.</small></div></div>
            <div className="benefit-item"><span>02</span><div><strong>A project story for interviews</strong><small>"What have you built?" — now you have an answer.</small></div></div>
            <div className="benefit-item"><span>03</span><div><strong>💰 Win cash from ₹2,000 pool</strong><small>Top ambassadors & squads win real money. Start sharing.</small></div></div>
            <div className="benefit-item"><span>04</span><div><strong>🏆 Campus AI League rank</strong><small>Compete with other colleges. Top campuses get recognized.</small></div></div>
            <div className="mini-quote">"Stop collecting courses. Start collecting projects — and cash prizes."</div>
          </div>

          <form className="form-card registration-card" onSubmit={submit}>
            <div className="registration-card-head">
              <div><span className="step-dot">1</span><div><strong>Grab your free seat</strong><small>Takes less than 30 seconds</small></div></div>
              <span className="free-pill">₹0</span>
            </div>

            <label>Full name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Sanjana Sai" /></label>
            <div className="two-col">
              <label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" /></label>
              <label>Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="10-digit number" /></label>
            </div>
            <label>College<input required value={form.college} onChange={e=>setForm({...form,college:e.target.value})} placeholder="Your engineering college" /></label>
            <div className="two-col">
              <label>Branch<select value={form.branch} onChange={e=>setForm({...form,branch:e.target.value})}><option>CSE</option><option>IT</option><option>AI / Data Science</option><option>ECE</option><option>EEE</option><option>Other</option></select></label>
              <label>Graduation year<select value={form.year} onChange={e=>setForm({...form,year:e.target.value})}><option>2027</option><option>2026</option><option>Other</option></select></label>
            </div>
            <label>Referral code <span className="optional">(optional)</span><input value={form.referralCode} onChange={e=>setForm({...form,referralCode:e.target.value})} placeholder="From your friend's link" /></label>
            {error && <div className="error-box shake">⚠ {error}</div>}
            <button className={`primary-btn full submit-btn ${submitting ? "loading" : ""}`} type="submit" disabled={submitting}>
              {submitting ? <><span className="spinner"></span> Securing your seat...</> : <>🚀 Register Free & Get My Referral Link <span>→</span></>}
            </button>
            <div className="secure-note">✓ Free forever &nbsp; • &nbsp; ✓ No payment ever &nbsp; • &nbsp; ✓ Cash prizes for top referrers</div>
          </form>
        </div>
      </div>
    </main>
  );
}

function Confirmation({navigate}) {
  const student = JSON.parse(sessionStorage.getItem("lastRegistration") || "null");
  const link = `${window.location.origin}/register?ref=${encodeURIComponent(student?.referralCode || "")}`;
  const addCalendar = () => {
    const start = new Date(Date.now() + 3*86400000);
    const end = new Date(start.getTime() + 60*60000);
    const fmt = d => d.toISOString().replace(/[-:]/g,"").replace(/\.\d{3}Z$/,"Z");
    const ics = `BEGIN:VCALENDAR\nVERSION:2.0\nBEGIN:VEVENT\nDTSTART:${fmt(start)}\nDTEND:${fmt(end)}\nSUMMARY:Build Your First AI Project in 60 Minutes\nDESCRIPTION:Free hands-on AI workshop.\nEND:VEVENT\nEND:VCALENDAR`;
    const blob = new Blob([ics], {type:"text/calendar"});
    const a = document.createElement("a"); a.href = URL.createObjectURL(blob); a.download="ai-workshop.ics"; a.click();
  };

  return (
    <main className="confirmation-page-v2">
      {/* Confetti burst */}
      <div className="confetti" aria-hidden="true">
        {Array.from({length: 36}, (_, i) => <i key={i} style={{"--i":i}}></i>)}
      </div>

      {/* Top success orbit */}
      <div className="success-orbit-v2">
        <div className="success-ring"></div>
        <div className="success-check pop">✓</div>
      </div>

      {/* Big congratulations headline */}
      <div className="congrats-eyebrow">🎉 REGISTRATION SUCCESSFUL</div>
      <h1 className="congrats-title">Congratulations!<br/><span>You're officially in! 🚀</span></h1>
      <p className="congrats-lead">
        Your seat for <strong>Build Your First AI Project in 60 Minutes</strong> is confirmed.<br/>
        Now it's time to <strong>start referring your friends</strong> and climb to the top!
      </p>

      {/* Student details */}
      {student && <div className="confirmation-grid congrats-grid">
        <div><small>NAME</small><strong>{student.name}</strong></div>
        <div><small>COLLEGE</small><strong>{student.college}</strong></div>
        <div><small>BRANCH</small><strong>{student.branch}</strong></div>
        <div><small>STATUS</small><strong className="confirmed-text">✓ Confirmed</strong></div>
      </div>}

      {/* === REFERRAL MOTIVATION SECTION === */}
      <div className="congrats-referral-section">
        <div className="referral-headline-row">
          <div className="referral-fire">🔥</div>
          <div>
            <h2>Now start referring your friends!</h2>
            <p>Every friend who registers through your link = <strong>1 point on the leaderboard</strong></p>
          </div>
        </div>

        {/* Prize tiers */}
        <div className="congrats-prize-row">
          <div className="congrats-prize gold">
            <div className="prize-emoji">🏅</div>
            <div className="prize-pos">Top 3 Ambassadors</div>
            <div className="prize-cash">₹300</div>
            <div className="prize-tag">EACH · CASH PRIZE</div>
          </div>
          <div className="congrats-prize silver">
            <div className="prize-emoji">👥</div>
            <div className="prize-pos">Top 3 Squads</div>
            <div className="prize-cash">₹300</div>
            <div className="prize-tag">EACH · CASH PRIZE</div>
          </div>
          <div className="congrats-prize bronze">
            <div className="prize-emoji">🎯</div>
            <div className="prize-pos">4th & 5th Ambassadors</div>
            <div className="prize-cash">₹100</div>
            <div className="prize-tag">EACH · CASH PRIZE</div>
          </div>
        </div>

        {/* Leaderboard CTA */}
        <div className="leaderboard-cta-banner">
          <div className="lb-icon">🏆</div>
          <div>
            <strong>Become Top 3 on the Leaderboard &amp; Win Cash!</strong>
            <small>Share your referral link, get your friends to register, and watch your rank climb in real time. Total pool: ₹2,000.</small>
          </div>
          <button className="primary-btn pulse-glow" onClick={() => navigate("/leaderboard")}>View Leaderboard →</button>
        </div>
      </div>

      {/* Referral link share card */}
      <div className="share-card congrats-share">
        <div className="eyebrow">💰 YOUR REFERRAL LINK — SHARE NOW</div>
        <h2>Every share = a step closer to cash prizes!</h2>
        <p>Copy your unique link below and blast it everywhere — WhatsApp groups, Instagram stories, college chats!</p>
        <code>{link}</code>
        <div className="share-buttons">
          <button className="primary-btn" onClick={() => navigator.clipboard?.writeText(link)}>📋 Copy My Link</button>
          <a className="whatsapp-btn" href={`https://wa.me/?text=${encodeURIComponent(`🚀 Build your first AI project in 60 minutes — completely FREE! Plus win cash prizes from a ₹2,000 pool by referring friends!\n\nRegister here: ${link}`)}`} target="_blank" rel="noreferrer">💬 Share on WhatsApp ↗</a>
        </div>
      </div>

      {/* Calendar + back */}
      <div className="confirm-actions" style={{marginTop:"20px"}}>
        <button className="ghost-btn" onClick={addCalendar}>📅 Add to Calendar</button>
        <button className="text-btn" onClick={() => navigate("/")}>← Back to workshop</button>
      </div>
    </main>
  );
}

function PartnerOnboard({navigate,onAddPartner}) {
  const [form,setForm] = useState({name:"",college:"",role:"Campus Ambassador",email:"",phone:""});
  const submit = e => { e.preventDefault(); const p=onAddPartner(form); sessionStorage.setItem("lastPartner",JSON.stringify(p)); navigate("/partner-kit"); };
  return (
    <main className="partner-onboard-page">
      <div className="partner-onboard-bg" aria-hidden="true">
        <div className="partner-orb orb-1"></div>
        <div className="partner-orb orb-2"></div>
      </div>
      <div className="partner-onboard-shell">
        {/* Top hero text — full width, centered */}
        <div className="partner-onboard-hero">
          <div className="eyebrow">✦ CAMPUS PARTNER PROGRAM</div>
          <h1>Bring your college <span>along.</span></h1>
          <p>Create a unique referral identity and get a ready-to-share campaign kit in seconds.<br/>Top partners are eligible for <strong>real cash prizes up to ₹5,000.</strong></p>
          <div className="partner-chips">
            <span>🔗 Unique referral code</span>
            <span>📲 Share-ready WhatsApp copy</span>
            <span>📊 Measurable registrations</span>
            <span>💰 Cash prizes for top partners</span>
          </div>
        </div>

        {/* Centered form */}
        <form className="partner-onboard-form" onSubmit={submit}>
          <div className="partner-form-head-inner">
            <div className="step-dot">✦</div>
            <div>
              <strong>Create your growth kit</strong>
              <small>Takes less than 60 seconds</small>
            </div>
            <span className="free-pill">FREE</span>
          </div>

          <label>Your Name<input required value={form.name} onChange={e=>setForm({...form,name:e.target.value})} placeholder="e.g. Sanjana Sai" /></label>
          <label>College / Institution<input required value={form.college} onChange={e=>setForm({...form,college:e.target.value})} placeholder="e.g. ABC Engineering College" /></label>
          <label>Your Role<select value={form.role} onChange={e=>setForm({...form,role:e.target.value})}>
            <option>Campus Ambassador</option>
            <option>TPO / Faculty</option>
            <option>Student Club Lead</option>
            <option>Placement Coordinator</option>
            <option>Student Representative</option>
          </select></label>
          <div className="two-col">
            <label>Email<input required type="email" value={form.email} onChange={e=>setForm({...form,email:e.target.value})} placeholder="you@example.com" /></label>
            <label>Phone<input required value={form.phone} onChange={e=>setForm({...form,phone:e.target.value})} placeholder="10-digit number" /></label>
          </div>
          <button className="primary-btn full pulse-glow partner-submit-btn" type="submit">🚀 Create My Growth Kit →</button>
          <div className="secure-note">✓ Free forever &nbsp;•&nbsp; ✓ Instant referral kit &nbsp;•&nbsp; ✓ Cash prizes for top referrers</div>
        </form>

        {/* Bottom 3-step process */}
        <div className="partner-how-it-works">
          <div className="eyebrow" style={{textAlign:"center",marginBottom:"18px"}}>HOW IT WORKS</div>
          <div className="partner-steps-row">
            <div><span>01</span><strong>Register as partner</strong><small>Fill in your details and get your unique referral identity instantly.</small></div>
            <div className="step-arrow">→</div>
            <div><span>02</span><strong>Share your link</strong><small>Use the ready-made WhatsApp messages to share with your college network.</small></div>
            <div className="step-arrow">→</div>
            <div><span>03</span><strong>Climb &amp; win cash</strong><small>Every verified registration counts. Top 3 partners win real cash prizes.</small></div>
          </div>
        </div>
      </div>
    </main>
  );
}

function PartnerKit({navigate, copyText}) {
  const partner = JSON.parse(sessionStorage.getItem("lastPartner") || "null");
  if (!partner) return <main className="empty-page"><h1>Create a partner profile first.</h1><button className="primary-btn" onClick={()=>navigate("/partner")}>Go to Partner Onboarding</button></main>;
  const link = `${window.location.origin}/register?ref=${encodeURIComponent(partner.code)}`;
  const english = `🚀 Build Your First AI Project in 60 Minutes!\n\nI'm ${partner.name} from ${partner.college}.\n\nJoin this free hands-on AI workshop and build your first AI project in just 60 minutes.\n\n🎯 Build something you can showcase\n🕐 60 minutes\n🆓 Free\n💰 Win cash prizes from a ₹2,000 pool!\n\nRegister here:\n${link}`;
  const telugu = `🚀 60 minutes lo mee first AI project build cheyyandi!\n\nNenu ${partner.name}, ${partner.college} nundi.\n\nFree AI workshop lo join ayi, mee first AI project ni 60 minutes lo build cheyyandi.\n\n🕐 Just 60 minutes\n🆓 Completely free\n💰 Cash prizes — total pool ₹2,000!\n\nRegister:\n${link}`;
  const whatsapp = `https://wa.me/?text=${encodeURIComponent(english)}`;
  return (
    <main className="kit-page">
      <div className="kit-header"><div><div className="eyebrow">YOUR CAMPUS GROWTH KIT</div><h1>Ready to share.</h1><p>One link. One message. Every registration is measurable.</p></div><div className="code-big">{partner.code}</div></div>
      <div className="kit-grid">
        <div className="kit-info"><small>PARTNER</small><strong>{partner.name}</strong><small>COLLEGE</small><strong>{partner.college}</strong><small>ROLE</small><strong>{partner.role}</strong><small>REFERRAL LINK</small><code>{link}</code><button className="ghost-btn" onClick={()=>copyText(link)}>Copy Link</button></div>
        <MessageCard title="English WhatsApp message" text={english} copy={()=>copyText(english)} />
        <MessageCard title="Telugu-English WhatsApp message" text={telugu} copy={()=>copyText(telugu)} />
      </div>
      <div className="kit-actions"><button className="primary-btn" onClick={()=>copyText(english)}>Copy English</button><button className="primary-btn" onClick={()=>copyText(telugu)}>Copy Telugu-English</button><a className="whatsapp-btn" href={whatsapp} target="_blank" rel="noreferrer">Share on WhatsApp ↗</a></div>
      <button className="text-btn" onClick={()=>navigate("/leaderboard")}>View Campus AI League →</button>
    </main>
  );
}

function MessageCard({title,text,copy}) {
  return <div className="message-card"><div className="message-top"><strong>{title}</strong><button onClick={copy}>Copy</button></div><pre>{text}</pre></div>;
}

function Leaderboard({students,partners}) {
  const rows = useMemo(() => {
    const map = {};
    students.forEach(s => { map[s.college] = (map[s.college] || 0) + 1; });
    return Object.entries(map).sort((a,b)=>b[1]-a[1]).map(([college,count],i)=>({rank:i+1,college,count}));
  },[students]);
  return <main className="page-shell"><div className="page-title"><div><div className="eyebrow">CAMPUS AI LEAGUE</div><h1>Which college is leading the growth race?</h1><p>Only verified, deduplicated registrations count.</p></div><div className="league-badge">🏆 500-seat challenge</div></div><div className="leader-card"><div className="table-head"><span>Rank</span><span>College</span><span>Verified registrations</span><span>Progress</span></div>{rows.slice(0,10).map((r,i)=><div className={`table-row ${i<3?"top":""}`} key={r.college}><span className="rank">{i===0?"🥇":i===1?"🥈":i===2?"🥉":r.rank}</span><strong>{r.college}</strong><span>{r.count}</span><div className="mini-progress"><i style={{width:`${Math.min(r.count/100*100,100)}%`}}></i></div></div>)}</div><section className="partner-ranking"><div className="section-heading left"><div className="eyebrow">PARTNER LEADERBOARD</div><h2>Top campus partners</h2></div><div className="partner-grid">{partners.slice().sort((a,b)=>b.registrations-a.registrations).map((p,i)=><div className="partner-row" key={p.id}><span>{i+1}</span><strong>{p.name}</strong><small>{p.college}</small><b>{p.registrations}</b></div>)}</div></section></main>;
}

function Dashboard({students,partners,channelCounts,navigate}) {
  const total=students.length;
  const activeColleges=new Set(students.map(s=>s.college)).size;
  const today=new Date().toDateString();
  const todayCount=students.filter(s=>new Date(s.createdAt).toDateString()===today).length;
  const refCount=channelCounts["Referral"] || 0;
  const pct=Math.min(total/TARGET*100,100);
  return <main className="dashboard">
    <div className="dash-top"><div><div className="eyebrow">7-DAY GROWTH CAMPAIGN · SIMULATION MODE</div><h1>Turn campus partners into a measurable growth loop.</h1><p>Track referral registrations, campus performance and the 500-registration target.</p></div><div className="target-card"><small>REGISTRATION TARGET</small><strong>{total}<em>/ {TARGET}</em></strong><div className="progress"><i style={{width:`${pct}%`}}></i></div><span>{pct.toFixed(1)}% of target</span></div></div>
    <div className="kpi-grid"><KPI label="Verified registrations" value={total} note={`toward ${TARGET} target`} /><KPI label="Active partners" value={partners.length} note="created in this prototype" /><KPI label="Today" value={todayCount} note="new registrations" /><KPI label="Referral registrations" value={refCount} note="student-to-student loop" /></div>
    <div className="dash-grid"><div className="panel"><div className="panel-head"><h2>Channel plan</h2><span>7 days</span></div>{Object.entries(CHANNEL_TARGETS).map(([k,target])=><div className="channel" key={k}><div><span>{k}</span><b>{channelCounts[k] || 0} / {target}</b></div><div className="progress"><i style={{width:`${Math.min((channelCounts[k]||0)/target*100,100)}%`}}></i></div></div>)}</div><div className="panel"><div className="panel-head"><h2>Operating rules</h2><span className="live">Live</span></div><ul className="rules"><li><b>Day 2:</b> if cumulative registrations are below 80, reactivate inactive ambassadors and recruit 10 more.</li><li><b>Day 4:</b> if a channel is below 60% of pace, move reserve effort to the channel ahead.</li><li><b>Attribution:</b> each valid registration gets one primary referral source.</li></ul><button className="text-btn" onClick={()=>navigate("/automation")}>View engagement automation →</button></div></div>
    <div className="panel pace"><div className="panel-head"><h2>7-day registration pace</h2><span>Plan</span></div><div className="bars">{[30,50,80,100,90,80,70].map((v,i)=><div className="bar-col" key={i}><div className="bar" style={{height:`${v}%`}}></div><span>D{i+1}</span><small>{v}</small></div>)}</div></div>
  </main>;
}
function KPI({label,value,note}) { return <div className="kpi"><span>{label}</span><strong>{value}</strong><small>{note}</small></div>; }

function Automation() {
  return <main className="page-shell"><div className="page-title"><div><div className="eyebrow">ENGAGEMENT AUTOMATION</div><h1>Keep the seat from becoming a no-show.</h1><p>Prototype of the planned reminder sequence. Real WhatsApp API automation is not claimed.</p></div></div><div className="timeline">{[["T+0","Registration confirmation","Send confirmation + calendar invite immediately."],["T-24","Setup checklist","Remind students to keep their laptop and internet ready."],["T-15","Starting now","Send the workshop joining link and a short \u201cstarting now\u201d message."]].map(([time,title,text])=><div className="timeline-item" key={time}><div className="time">{time}</div><div className="dot"></div><div className="timeline-card"><h2>{title}</h2><p>{text}</p></div></div>)}</div></main>;
}

function About() {
  return <main className="page-shell"><div className="page-title"><div><div className="eyebrow">ABOUT THE ASSET</div><h1>One growth system, not another landing page.</h1><p>The student page is the entry point. The core asset is the referral engine and tracker.</p></div></div><div className="about-grid"><div><h2>Partner → Share → Register → Attribute → Compete</h2><p>Every partner gets a unique referral identity and a ready-to-share localized campaign kit. Every valid student registration is attributed to a primary source. The Campus AI League turns those registrations into a visible growth loop.</p></div><div className="quote">"I did not want to build another landing page because a landing page does not solve the distribution bottleneck."</div></div></main>;
}

function Footer(){ return null; }

createRoot(document.getElementById("root")).render(<App />);
