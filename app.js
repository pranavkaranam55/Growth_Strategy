/* Campus Growth Engine: user interface, storage and demo data.
 * The business rules live in logic.js (window.GE) and are covered by tests/logic.test.js. */
(() => {
  "use strict";
  const C = GE.CONFIG;
  const KEY = "campus-growth-engine.v1";
  const BASE = location.origin + location.pathname;
  const FOCUS = [
    "Set up tracking, onboard ambassadors",
    "Launch outreach",
    "Review early results, test messaging",
    "Improve distribution and referrals",
    "Focus on best channels",
    "Scale successful methods",
    "Final reminder, performance review",
  ];
  const $ = (id) => document.getElementById(id);
  const inr = (n) => "₹" + Math.round(n).toLocaleString("en-IN");
  const linkFor = (code) => `${BASE}#ref-${code}`;
  function el(tag, attrs, ...kids) {
    const n = document.createElement(tag);
    if (attrs) Object.entries(attrs).forEach(([k, v]) => { if (k === "class") n.className = v; else if (k === "text") n.textContent = v; else if (k.startsWith("on")) n.addEventListener(k.slice(2), v); else n.setAttribute(k, v); });
    kids.flat().forEach((k) => { if (k == null) return; n.appendChild(typeof k === "string" || typeof k === "number" ? document.createTextNode(String(k)) : k); });
    return n;
  }
  let toastT;
  function toast(m) { let t = document.querySelector(".toast"); if (!t) { t = el("div", { class: "toast", role: "status" }); document.body.appendChild(t); } t.textContent = m; clearTimeout(toastT); toastT = setTimeout(() => t.remove(), 2600); }
  const fmtTime = (iso) => new Date(iso).toLocaleString(undefined, { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" });
  const maskPhone = (p) => { const d = GE.normalizePhone(p); return d.length === 10 ? d.slice(0, 2) + "••••••" + d.slice(-2) : "—"; };

  // ======================= STORAGE =======================
  let S;
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function load() {
    try { S = JSON.parse(localStorage.getItem(KEY) || "null"); } catch (e) { S = null; }
    if (!S || !S.settings) { S = demoState(); save(); }
  }

  // ======================= DEMO DATA =======================
  function prng(seed) { return () => { seed |= 0; seed = (seed + 0x6D2B79F5) | 0; let t = Math.imul(seed ^ (seed >>> 15), 1 | seed); t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t; return ((t ^ (t >>> 14)) >>> 0) / 4294967296; }; }
  function isoDate(d) { const x = new Date(d); x.setHours(0, 0, 0, 0); return x.toISOString().slice(0, 10); }
  function dayStart(startIso, day) { const d = new Date(startIso + "T00:00:00"); d.setDate(d.getDate() + day - 1); return d; }

  function emptyState(start) {
    return { settings: { campus: "Your Campus", start }, ambassadors: [], regs: [], clicks: {}, messages: [], rewards: {}, notes: {}, seq: 1 };
  }
  function demoState() {
    const today = new Date(); const startD = new Date(today); startD.setDate(startD.getDate() - 4);
    const st = emptyState(isoDate(startD));
    st.settings.campus = "Demo Engineering College";
    const r = prng(2026);
    const day1 = dayStart(st.settings.start, 1); day1.setHours(10, 0, 0, 0);
    const amb = [
      { id: "A1", slot: "A1", name: "Arjun Reddy", dept: "CSE", phone: "9876501234", upi: "arjun@ybl", code: "GE-ARJ7Q" },
      { id: "A2", slot: "A2", name: "Meera Nair", dept: "ECE", phone: "9876502345", upi: "meera@okaxis", code: "GE-MEE3K" },
      { id: "A3", slot: "A3", name: "Faiz Khan", dept: "Mechanical", phone: "9876503456", upi: "faiz@ibl", code: "GE-FAI9P" },
    ];
    amb.forEach((a, i) => { a.joinedAt = new Date(day1.getTime() + i * 1800000).toISOString(); a.milestonesSent = []; a.demo = true; });
    st.ambassadors = amb;
    amb.forEach((a) => {
      pushMsg(st, a, "Onboarding", onboardText(a), a.joinedAt, true);
    });
    const launch = dayStart(st.settings.start, 2); launch.setHours(9, 0, 0, 0);
    amb.forEach((a) => pushMsg(st, a, "Launch kit", `Day 2: launch day! Post the poster and your link in your class and department WhatsApp groups today.\n${linkFor(a.code)}`, launch.toISOString(), true));

    const first = ["Kiran", "Sai", "Divya", "Harsha", "Anusha", "Vamsi", "Lakshmi", "Ravi", "Sravani", "Manoj", "Pavani", "Nikhil", "Bhavya", "Chaitanya", "Swathi", "Rohit", "Sindhu", "Akhil", "Navya", "Karthik", "Deepika", "Varun", "Praveen", "Jahnavi", "Surya", "Harika", "Abhinav", "Mounika", "Gopi", "Ramya", "Siddharth", "Yamini", "Tarun", "Likitha", "Venkat", "Hema", "Ajay", "Pooja", "Charan", "Sahithi"];
    const last = ["K", "R", "P", "S", "M", "V", "N", "T", "B", "G"];
    const branches = ["CSE", "CSE", "IT", "AI & ML", "ECE", "ECE", "EEE", "Civil", "Mechanical"];
    const plan = [["A1", 128], ["A2", 150], ["A3", 74], [null, 18]];
    const now = Date.now();
    const pickTime = () => {
      const x = r(); const day = x < 0.25 ? 2 : x < 0.55 ? 3 : x < 0.85 ? 4 : 5;
      const ds = dayStart(st.settings.start, day).getTime();
      const end = Math.min(ds + 86400000 - 1, now - 300000);
      const startT = ds + 7 * 3600000;
      return new Date(end > startT ? startT + r() * (end - startT) : ds + r() * Math.max(60000, end - ds)).toISOString();
    };
    let n = 0;
    plan.forEach(([aid, count]) => {
      for (let i = 0; i < count; i++) {
        n++;
        st.regs.push({ id: "R" + n, name: `${first[n % first.length]} ${last[n % last.length]}.`, phone: String(7000000000 + n * 7919), branch: branches[Math.floor(r() * branches.length)], finalYear: true, createdAt: pickTime(), ambassadorId: aid, demo: true });
      }
    });
    // A2 must reach exactly 150 by the time of the last of her sign-ups; duplicates and incomplete entries for realism
    const verifiedSoFar = st.regs.slice();
    for (let i = 0; i < 7; i++) {
      const orig = verifiedSoFar[Math.floor(r() * verifiedSoFar.length)];
      n++;
      st.regs.push({ id: "R" + n, name: orig.name, phone: "+91 " + orig.phone, branch: orig.branch, finalYear: true, createdAt: new Date(Date.parse(orig.createdAt) + 3600000).toISOString(), ambassadorId: ["A1", "A2", "A3"][i % 3], demo: true });
    }
    for (let i = 0; i < 4; i++) {
      n++;
      st.regs.push({ id: "R" + n, name: `${first[(n + 3) % first.length]} ${last[(n + 1) % last.length]}.`, phone: String(8100000000 + n * 31), branch: "Other", finalYear: false, createdAt: pickTime(), ambassadorId: ["A1", "A3", null, "A1"][i], demo: true });
    }
    st.seq = n + 1;
    st.clicks = { "GE-ARJ7Q": 520, "GE-MEE3K": 590, "GE-FAI9P": 300 };
    processMilestones(st);
    return st;
  }

  // ======================= DOMAIN HELPERS =======================
  function onboardText(a) {
    const slot = C.ambassadors.find((x) => x.slot === a.slot);
    return `Hi ${a.name.split(" ")[0]}! You're now Ambassador ${a.slot} for "Build Your First AI Project in 60 Minutes".\n\nYour code: ${a.code}\nYour link: ${linkFor(a.code)}\n\nTarget: ${slot.target} verified registrations in 7 days.\nReward: ₹${slot.reward} when you reach your target (paid by UPI after approval).\nOnly unique, final-year students count.`;
  }
  function pushMsg(st, a, type, text, at, demo) {
    st.messages.push({ id: "M" + (st.messages.length + 1) + "-" + Math.random().toString(36).slice(2, 6), to: a.id, toName: a.name, toPhone: a.phone, type, text, at: at || new Date().toISOString(), demo: !!demo });
  }
  // Walk verified registrations in time order and send each milestone message at the moment it was reached.
  function processMilestones(st) {
    const ver = GE.verifiedRegistrations(st.regs);
    st.ambassadors.forEach((a) => {
      const slot = C.ambassadors.find((x) => x.slot === a.slot);
      let count = 0;
      ver.filter((r) => r.ambassadorId === a.id).forEach((r) => {
        count++;
        GE.dueMilestones(count, slot.target, a.milestonesSent).forEach((m) => {
          a.milestonesSent.push(m);
          pushMsg(st, a, m >= slot.target ? "Target reached" : "Milestone", GE.milestoneMessage(a.name.split(" ")[0], m, slot.target, slot.reward), r.createdAt, a.demo && r.demo);
        });
      });
    });
  }
  const verified = () => GE.verifiedRegistrations(S.regs);
  const counts = () => GE.countsByAmbassador(S.regs);
  const today = () => Math.min(Math.max(GE.campaignDay(new Date().toISOString(), S.settings.start + "T00:00:00"), 1), 7);
  const dayOfReg = (r) => GE.campaignDay(r.createdAt, S.settings.start + "T00:00:00");
  function slotInfo(slotId) { return C.ambassadors.find((x) => x.slot === slotId); }
  function ambBySlot(slotId) { return S.ambassadors.find((a) => a.slot === slotId) || null; }
  function cumulativeByDay(list) { const out = []; let c = 0; for (let d = 1; d <= 7; d++) { c += list.filter((r) => dayOfReg(r) === d).length; out.push(c); } return out; }
  function rewardState(a) {
    const s = slotInfo(a.slot); const n = counts()[a.id] || 0;
    const earned = GE.rewardFor(n, s.target, s.reward);
    const rec = S.rewards[a.id];
    return { n, target: s.target, reward: s.reward, earned, status: rec ? rec.status : earned ? "Pending approval" : "Not yet earned" };
  }
  function committed() { return Object.values(S.rewards).filter((x) => x.status === "Approved" || x.status === "Paid").reduce((s, x) => s + x.amount, 0); }

  // ======================= ROUTING =======================
  const VIEWS = ["overview", "ambassadors", "registrations", "whatsapp", "agile", "rewards", "quality", "settings"];
  let joinCode = null;
  function route() {
    const tok = (location.hash || "").replace(/^#/, "");
    const ref = /^ref-([A-Za-z0-9-]+)$/.exec(tok);
    if (ref || tok === "join") { showJoin(ref ? ref[1] : null); return; }
    $("joinPage").classList.add("hidden"); $("console").classList.remove("hidden");
    const v = VIEWS.includes(tok) ? tok : "overview";
    VIEWS.forEach((x) => $("v-" + x).classList.toggle("on", x === v));
    document.querySelectorAll("[data-v]").forEach((a) => a.dataset.v === v ? a.setAttribute("aria-current", "page") : a.removeAttribute("aria-current"));
    render(v);
    window.scrollTo(0, 0);
  }
  window.addEventListener("hashchange", route);
  function render(v) {
    $("campusName").textContent = S.settings.campus;
    ({ overview: renderOverview, ambassadors: renderAmbassadors, registrations: renderRegs, whatsapp: renderOutbox, agile: renderAgile, rewards: renderRewards, quality: renderQuality, settings: renderSettings })[v]();
  }
  const current = () => { const on = document.querySelector(".view.on"); return on ? on.id.slice(2) : "overview"; };
  const rerender = () => { save(); if (!$("console").classList.contains("hidden")) render(current()); };

  // ======================= STUDENT JOIN PAGE =======================
  function showJoin(code) {
    $("console").classList.add("hidden"); $("joinPage").classList.remove("hidden");
    $("joinForm").classList.remove("hidden"); $("joinDone").classList.add("hidden"); $("jErr").classList.add("hidden");
    joinCode = code;
    const ambId = GE.attribute(code, S.ambassadors);
    const a = S.ambassadors.find((x) => x.id === ambId);
    const box = $("joinRef");
    if (a) {
      box.textContent = `👋 Invited by ${a.name.split(" ")[0]}, ${S.settings.campus} ambassador`; box.classList.remove("hidden");
      let seen = false; try { seen = sessionStorage.getItem("ge.opened." + a.code) === "1"; sessionStorage.setItem("ge.opened." + a.code, "1"); } catch (e) {}
      if (!seen) { S.clicks[a.code] = (S.clicks[a.code] || 0) + 1; save(); }
    } else box.classList.add("hidden");
    window.scrollTo(0, 0);
  }
  $("jf").addEventListener("submit", (e) => {
    e.preventDefault();
    const err = $("jErr"); err.classList.add("hidden");
    const fail = (m, f) => { err.textContent = m; err.classList.remove("hidden"); if (f) f.focus(); };
    const name = $("jName").value.trim(), phone = $("jPhone").value, branch = $("jBranch").value, finalYear = $("jFinal").checked;
    if (name.length < 2) return fail("Enter your full name.", $("jName"));
    if (!GE.isValidPhone(phone)) return fail("Enter a valid 10-digit WhatsApp number.", $("jPhone"));
    if (!branch) return fail("Choose your branch.", $("jBranch"));
    if (!finalYear) return fail("This workshop is for final-year students. Tick the box to confirm.", $("jFinal"));
    if (GE.isDuplicate(phone, S.regs)) return fail("This WhatsApp number is already registered. Each student is counted once.", $("jPhone"));
    S.regs.push({ id: "R" + (S.seq++), name, phone: GE.normalizePhone(phone), branch, finalYear: true, createdAt: new Date().toISOString(), ambassadorId: GE.attribute(joinCode, S.ambassadors), demo: false });
    processMilestones(S); save();
    $("jf").reset();
    $("joinForm").classList.add("hidden"); $("joinDone").classList.remove("hidden");
  });

  // ======================= OVERVIEW =======================
  function renderOverview() {
    const ver = verified(); const cnt = counts(); const t = today();
    $("dayBadge").textContent = `Day ${t} of 7 · ${FOCUS[t - 1]}`;
    $("kVer").textContent = ver.length; $("kVerBar").style.width = Math.min(100, (ver.length / C.goal) * 100) + "%";
    const clicks = Object.values(S.clicks).reduce((s, x) => s + x, 0);
    const viaLinks = ver.filter((r) => r.ambassadorId).length;
    $("kConv").textContent = GE.conversionRate(viaLinks, clicks) + "%";
    const planned = C.dayPlan[t - 1]; const diff = ver.length - planned;
    $("kPace").innerHTML = ""; $("kPace").append(el("span", { class: diff >= 0 ? "up" : "down", text: (diff >= 0 ? "+" : "") + diff }));
    $("kPaceFoot").textContent = `vs ${planned} planned by end of Day ${t}`;
    const earned = S.ambassadors.reduce((s, a) => s + rewardState(a).earned, 0);
    $("kRew").textContent = inr(earned);
    const al = $("paceAlert"); al.innerHTML = "";
    if (t >= 3) al.append(el("div", { class: "alert " + (ver.length >= C.dayPlan[2] ? "a-ok" : "a-warn"), text: ver.length >= C.dayPlan[t - 1] ? `On pace: ${ver.length} verified, plan for today is ${planned}.` : `Behind pace by ${planned - ver.length}. Review the Agile board and support the slowest ambassador.` }));

    drawPace(ver);
    const box = $("ovAmb"); box.innerHTML = "";
    const frac = C.dayPlan[t - 1] / C.goal;
    C.ambassadors.forEach((s) => {
      const a = ambBySlot(s.slot); const n = a ? cnt[a.id] || 0 : 0;
      const tr = el("div", { class: "track" }); const fill = el("i"); fill.style.width = Math.min(100, (n / s.target) * 100) + "%"; tr.append(fill);
      const mk = el("span", { class: "marker" }); mk.style.left = `calc(${Math.min(100, frac * 100)}% - 1px)`; tr.append(mk);
      box.append(el("div", { class: "amb-row" },
        el("div", null, el("b", { text: a ? a.name : "Open slot" }), el("span", { class: "small muted", text: `${s.slot} · target ${s.target}` })),
        el("div", null, tr),
        el("div", { class: "num" }, `${n}`, el("span", { class: "small muted", text: ` / ${s.target}` }))));
    });
    const direct = ver.filter((r) => !r.ambassadorId).length;
    const src = S.ambassadors.map((a) => [a.name.split(" ")[0] + " (" + a.slot + ")", cnt[a.id] || 0]).concat([["Direct / unknown code", direct]]);
    bars($("ovSrc"), src);
    const br = {}; ver.forEach((r) => { br[r.branch] = (br[r.branch] || 0) + 1; });
    bars($("ovBranch"), Object.entries(br).sort((x, y) => y[1] - x[1]));
    const m = $("ovMsgs"); m.innerHTML = "";
    [...S.messages].sort((x, y) => y.at.localeCompare(x.at)).slice(0, 4).forEach((x) => m.append(el("div", { style: "padding:7px 0;border-bottom:1px solid var(--line)" }, el("b", { text: `${x.type} → ${x.toName.split(" ")[0]}` }), el("div", { class: "muted clamp2", text: x.text.split("\n")[0] }))));
  }
  function bars(box, entries) {
    box.innerHTML = ""; const max = Math.max(1, ...entries.map((e) => e[1]));
    entries.forEach(([k, v]) => {
      const tr = el("div", { class: "track", style: "height:8px" }); const f = el("i"); f.style.width = (v / max) * 100 + "%"; tr.append(f);
      box.append(el("div", { style: "display:grid;grid-template-columns:1fr auto;gap:4px 10px;margin-bottom:10px;font-size:.86rem" }, el("span", { text: k }), el("b", { text: String(v) }), el("div", { style: "grid-column:1/-1" }, tr)));
    });
  }
  function drawPace(ver) {
    const svg = $("paceChart"); svg.innerHTML = ""; const NS = "http://www.w3.org/2000/svg";
    const W = 640, H = 260, L = 44, R = 16, T = 16, B = 34; const t = today();
    const x = (d) => L + ((d - 1) / 6) * (W - L - R); const y = (v) => T + (1 - v / 520) * (H - T - B);
    const add = (tag, attrs, text) => { const n = document.createElementNS(NS, tag); Object.entries(attrs).forEach(([k, v]) => n.setAttribute(k, v)); if (text != null) n.textContent = text; svg.appendChild(n); return n; };
    const css = getComputedStyle(document.documentElement);
    const line = css.getPropertyValue("--line").trim(), muted = css.getPropertyValue("--muted").trim(), teal = css.getPropertyValue("--teal").trim(), navy = css.getPropertyValue("--navy-2").trim();
    [0, 100, 200, 300, 400, 500].forEach((v) => { add("line", { x1: L, x2: W - R, y1: y(v), y2: y(v), stroke: line }); add("text", { x: L - 8, y: y(v) + 4, "text-anchor": "end", "font-size": 11, fill: muted }, v); });
    for (let d = 1; d <= 7; d++) add("text", { x: x(d), y: H - 10, "text-anchor": "middle", "font-size": 11, fill: d === t ? teal : muted, "font-weight": d === t ? 800 : 500 }, "Day " + d);
    add("polyline", { points: C.dayPlan.map((v, i) => `${x(i + 1)},${y(v)}`).join(" "), fill: "none", stroke: navy, "stroke-width": 2, "stroke-dasharray": "6 5" });
    const cum = cumulativeByDay(ver).slice(0, t);
    add("polyline", { points: cum.map((v, i) => `${x(i + 1)},${y(v)}`).join(" "), fill: "none", stroke: teal, "stroke-width": 3.5, "stroke-linejoin": "round" });
    cum.forEach((v, i) => { add("circle", { cx: x(i + 1), cy: y(v), r: 4.5, fill: teal }); add("text", { x: x(i + 1), y: y(v) - 10, "text-anchor": "middle", "font-size": 11, "font-weight": 800, fill: teal }, v); });
    add("line", { x1: W - 190, x2: W - 166, y1: 22, y2: 22, stroke: teal, "stroke-width": 3.5 }); add("text", { x: W - 160, y: 26, "font-size": 11, fill: muted }, "Actual");
    add("line", { x1: W - 106, x2: W - 82, y1: 22, y2: 22, stroke: navy, "stroke-width": 2, "stroke-dasharray": "6 5" }); add("text", { x: W - 76, y: 26, "font-size": 11, fill: muted }, "Plan");
  }

  // ======================= AMBASSADORS =======================
  function renderAmbassadors() {
    const box = $("ambCards"); box.innerHTML = ""; const cnt = counts();
    C.ambassadors.forEach((s) => {
      const a = ambBySlot(s.slot);
      if (!a) { box.append(onboardCard(s)); return; }
      const n = cnt[a.id] || 0; const clicks = S.clicks[a.code] || 0; const rs = rewardState(a);
      const tr = el("div", { class: "track" }); const f = el("i"); f.style.width = Math.min(100, (n / s.target) * 100) + "%"; tr.append(f);
      const chips = el("div", { class: "chips" }, GE.milestonesFor(s.target).map((m, i) => el("span", { class: "chip" + (a.milestonesSent.includes(m) ? " hit" : ""), text: `${[25, 50, 75, 100][i]}% · ${m}` })));
      const copyBtn = el("button", { class: "btn btn-line btn-sm", type: "button", text: "Copy", onclick: () => copyText(linkFor(a.code)) });
      box.append(el("div", { class: "acard" },
        el("div", { class: "top" }, el("div", null, el("div", { class: "slot", text: `AMBASSADOR ${s.slot} · ${a.dept}` }), el("h3", null, a.name, a.demo ? el("span", { class: "demo", text: "demo" }) : null)),
          el("span", { class: "tag " + (rs.earned ? "t-ok" : "t-info"), text: rs.earned ? "Target reached" : `${Math.round((n / s.target) * 100)}%` })),
        el("div", { class: "big" }, `${n} `, el("small", { text: `/ ${s.target} verified` })), tr, chips,
        el("div", { class: "linkline" }, el("span", { class: "mono", text: a.code + " · " + linkFor(a.code) }), copyBtn),
        el("div", { class: "stats3" },
          el("div", null, el("b", { text: String(clicks) }), el("span", { text: "link opens" })),
          el("div", null, el("b", { text: GE.conversionRate(n, clicks) + "%" }), el("span", { text: "conversion" })),
          el("div", null, el("b", { text: inr(s.reward) }), el("span", { text: rs.status }))),
        el("div", { style: "display:flex;gap:6px;flex-wrap:wrap" },
          el("a", { class: "btn btn-primary btn-sm", href: "#ref-" + a.code, text: "Open sign-up link" }),
          el("a", { class: "btn btn-line btn-sm", href: "#whatsapp", text: "Messages", onclick: () => { waFilter = a.id; } }))));
    });
  }
  function onboardCard(s) {
    const f = { name: el("input", { maxlength: "40", id: "on-n-" + s.slot }), phone: el("input", { inputmode: "tel", maxlength: "16", placeholder: "10-digit WhatsApp number", id: "on-p-" + s.slot }), dept: el("select", { id: "on-d-" + s.slot }), upi: el("input", { placeholder: "name@bank", maxlength: "50", id: "on-u-" + s.slot }) };
    ["", "CSE", "IT", "AI & ML", "ECE", "EEE", "Civil", "Mechanical"].forEach((d) => f.dept.append(el("option", { value: d, text: d || "Choose department" })));
    const err = el("p", { class: "err hidden", role: "alert" });
    const submit = () => {
      err.classList.add("hidden");
      const name = f.name.value.trim(), phone = f.phone.value, dept = f.dept.value, upi = f.upi.value.trim();
      const bad = (m) => { err.textContent = m; err.classList.remove("hidden"); };
      if (name.length < 2) return bad("Enter the ambassador’s name.");
      if (!GE.isValidPhone(phone)) return bad("Enter a valid 10-digit WhatsApp number.");
      if (S.ambassadors.some((a) => GE.normalizePhone(a.phone) === GE.normalizePhone(phone))) return bad("This number is already an ambassador.");
      if (!dept) return bad("Choose a department.");
      if (!/^[a-zA-Z0-9._-]{2,}@[a-zA-Z]{2,}$/.test(upi)) return bad("Enter a UPI ID like name@bank. Never a PIN or OTP.");
      let code; do { code = GE.makeReferralCode(name); } while (S.ambassadors.some((a) => a.code === code));
      const a = { id: s.slot, slot: s.slot, name, dept, phone: GE.normalizePhone(phone), upi, code, joinedAt: new Date().toISOString(), milestonesSent: [], demo: false };
      S.ambassadors.push(a); pushMsg(S, a, "Onboarding", onboardText(a)); processMilestones(S);
      rerender(); toast(`${name.split(" ")[0]} onboarded as ${s.slot} · code ${code}`);
    };
    const lab = (t, k) => el("div", { class: "field" }, el("label", { for: f[k].id, text: t }), f[k]);
    return el("div", { class: "acard" },
      el("div", null, el("div", { class: "slot", text: `AMBASSADOR ${s.slot} · OPEN` }), el("h3", { text: "Onboard an ambassador" }), el("p", { class: "small muted", text: `Target ${s.target} verified registrations · reward ${inr(s.reward)}` })),
      lab("Name", "name"), lab("WhatsApp number", "phone"), lab("Department", "dept"), lab("UPI ID (for the reward)", "upi"), err,
      el("button", { class: "btn btn-primary", type: "button", text: "Create code and send welcome message", onclick: submit }));
  }
  async function copyText(t) { try { await navigator.clipboard.writeText(t); toast("Link copied"); } catch (e) { prompt("Copy this link:", t); } }

  // ======================= REGISTRATIONS =======================
  ["regSearch", "regAmb", "regStatus"].forEach((id) => $(id).addEventListener("input", renderRegs));
  function renderRegs() {
    const sel = $("regAmb"); const keep = sel.value;
    sel.innerHTML = ""; sel.append(el("option", { value: "", text: "All sources" }));
    S.ambassadors.forEach((a) => sel.append(el("option", { value: a.id, text: `${a.slot} · ${a.name}` })));
    sel.append(el("option", { value: "direct", text: "Direct / unknown code" })); sel.value = keep;
    const verIds = new Set(verified().map((r) => r.id));
    const seen = new Set(); const status = {};
    [...S.regs].sort((a, b) => a.createdAt.localeCompare(b.createdAt)).forEach((r) => {
      const p = GE.normalizePhone(r.phone);
      status[r.id] = verIds.has(r.id) ? "Verified" : (GE.isValidPhone(r.phone) && seen.has(p)) ? "Duplicate" : "Incomplete";
      if (GE.isValidPhone(r.phone)) seen.add(p);
    });
    const q = $("regSearch").value.trim().toLowerCase(), fa = $("regAmb").value, fs = $("regStatus").value;
    const rows = [...S.regs].sort((a, b) => b.createdAt.localeCompare(a.createdAt)).filter((r) =>
      (!q || r.name.toLowerCase().includes(q) || r.branch.toLowerCase().includes(q)) &&
      (!fa || (fa === "direct" ? !r.ambassadorId : r.ambassadorId === fa)) && (!fs || status[r.id] === fs));
    const tb = el("tbody");
    rows.slice(0, 200).forEach((r) => {
      const a = S.ambassadors.find((x) => x.id === r.ambassadorId);
      const st = status[r.id];
      tb.append(el("tr", null,
        el("td", null, r.name, r.demo ? el("span", { class: "demo", text: "demo" }) : null),
        el("td", { class: "mono", text: maskPhone(r.phone) }),
        el("td", { text: r.branch }),
        el("td", { text: a ? `${a.slot} · ${a.name.split(" ")[0]}` : "Direct" }),
        el("td", { text: `Day ${dayOfReg(r)} · ${fmtTime(r.createdAt)}` }),
        el("td", null, el("span", { class: "tag " + (st === "Verified" ? "t-ok" : st === "Duplicate" ? "t-bad" : "t-warn"), text: st }))));
    });
    const t = $("regTable"); t.innerHTML = "";
    t.append(el("thead", null, el("tr", null, ["Name", "WhatsApp", "Branch", "Source", "When", "Status"].map((h) => el("th", { text: h })))), tb);
    const v = Object.values(status).filter((x) => x === "Verified").length;
    $("regCount").textContent = `${rows.length} shown${rows.length > 200 ? " (first 200)" : ""} · ${v} verified · ${S.regs.length - v} not counted (duplicate or incomplete)`;
  }

  // ======================= WHATSAPP LOG =======================
  let waFilter = "";
  $("waFilter").addEventListener("change", (e) => { waFilter = e.target.value; renderOutbox(); });
  function renderOutbox() {
    const sel = $("waFilter"); sel.innerHTML = "";
    sel.append(el("option", { value: "", text: "All ambassadors" }));
    S.ambassadors.forEach((a) => sel.append(el("option", { value: a.id, text: `${a.slot} · ${a.name}` })));
    sel.value = waFilter;
    const box = $("outbox"); box.innerHTML = "";
    const list = [...S.messages].filter((m) => !waFilter || m.to === waFilter).sort((a, b) => b.at.localeCompare(a.at));
    if (!list.length) box.append(el("p", { class: "muted", text: "No messages yet. Onboard an ambassador to send the first one." }));
    list.forEach((m) => {
      const tagCls = m.type === "Target reached" || m.type === "Reward paid" ? "t-ok" : m.type === "Milestone" ? "t-info" : m.type === "Reward approved" ? "t-warn" : "t-info";
      box.append(el("div", { class: "msg" },
        el("div", { class: "av", text: m.toName.split(" ").map((x) => x[0]).join("").slice(0, 2) }),
        el("div", null,
          el("div", { class: "meta" }, el("b", { text: m.toName }), el("span", { class: "mono", text: maskPhone(m.toPhone) }), el("span", { class: "tag " + tagCls, text: m.type }), el("span", { text: fmtTime(m.at) }), el("span", { text: "· Simulated send" }), m.demo ? el("span", { class: "demo", text: "demo" }) : null),
          el("div", { class: "body", text: m.text }))));
    });
  }

  // ======================= AGILE BOARD =======================
  let agileDay = null;
  function renderAgile() {
    const t = today(); if (!agileDay) agileDay = t;
    const ver = verified(); const cum = cumulativeByDay(ver);
    const box = $("days"); box.innerHTML = "";
    for (let d = 1; d <= 7; d++) {
      const newN = ver.filter((r) => dayOfReg(r) === d).length; const done = d <= t;
      const st = d > t ? ["Upcoming", "t-info"] : d === t ? ["Today", "t-info"] : cum[d - 1] >= C.dayPlan[d - 1] ? ["On pace", "t-ok"] : ["Behind", "t-bad"];
      const card = el("button", { type: "button", class: "day" + (d === t ? " today" : "") + (d > t ? " future" : ""), style: "text-align:left;cursor:pointer;" + (d === agileDay ? "box-shadow:0 0 0 3px var(--teal-soft)" : ""), onclick: () => { agileDay = d; renderAgile(); } },
        el("div", { style: "display:flex;justify-content:space-between;gap:6px" }, el("span", { class: "dn", text: "DAY " + d }), el("span", { class: "tag " + st[1], text: st[0] })),
        el("div", { class: "focus", text: FOCUS[d - 1] }),
        el("div", { class: "nums" }, el("span", { text: done ? `+${newN} new` : "—" }), el("b", { text: done ? `${cum[d - 1]} / ${C.dayPlan[d - 1]}` : `plan ${C.dayPlan[d - 1]}` })));
      box.append(card);
    }
    const d = agileDay; const notes = S.notes[d] || {};
    $("standupTitle").textContent = `Day ${d} stand-up · ${FOCUS[d - 1]}`;
    $("nPlan").value = notes.plan || ""; $("nExec").value = notes.exec || ""; $("nImp").value = notes.imp || "";
    $("nPlan").placeholder = `e.g. Target ${C.dayPlan[d - 1]} total by tonight. Each ambassador posts in 3 more groups.`;
    $("nExec").placeholder = "e.g. Arjun shared in CSE-3 and Coding Club groups.";
    $("nImp").placeholder = "e.g. Use Meera’s message template for everyone tomorrow.";
    const cnt = counts();
    const dayVer = ver.filter((r) => dayOfReg(r) === d);
    const perAmb = S.ambassadors.map((a) => `${a.name.split(" ")[0]} ${dayVer.filter((r) => r.ambassadorId === a.id).length}`).join(" · ");
    $("nMeas").value = d > t ? "Not started yet." : `+${dayVer.length} verified on Day ${d}\nTotal ${cum[d - 1]} vs plan ${C.dayPlan[d - 1]}\nBy ambassador: ${perAmb || "none"}\nCurrent totals: ${S.ambassadors.map((a) => `${a.slot} ${cnt[a.id] || 0}/${slotInfo(a.slot).target}`).join(", ")}`;
    $("insight").innerHTML = ""; $("insight").append(el("b", { text: "Suggested improvements" }), el("ul", { style: "margin:6px 0 0;padding-left:18px" }, insights().map((x) => el("li", { text: x }))));
    $("savedNote").textContent = "";
  }
  function insights() {
    const t = today(); const ver = verified(); const cnt = counts(); const out = [];
    const frac = C.dayPlan[t - 1] / C.goal;
    const rows = S.ambassadors.map((a) => { const s = slotInfo(a.slot); const n = cnt[a.id] || 0; return { a, s, n, gap: Math.round(s.target * frac) - n, conv: GE.conversionRate(n, S.clicks[a.code] || 0) }; });
    if (!rows.length) return ["Onboard the three ambassadors first. Every registration needs a traceable source."];
    const done = rows.filter((r) => r.n >= r.s.target); const behind = rows.filter((r) => r.gap > 0 && r.n < r.s.target).sort((x, y) => y.gap - x.gap);
    if (done.length && behind.length) out.push(`${done[0].a.name.split(" ")[0]} reached the target. Ask them to share what worked with ${behind[0].a.name.split(" ")[0]} (replicate the winning approach).`);
    if (behind.length) out.push(`${behind[0].a.name.split(" ")[0]} is ${behind[0].gap} behind today’s pace. Give them 2–3 new groups or clubs to post in tomorrow.`);
    const lowConv = rows.filter((r) => (S.clicks[r.a.code] || 0) > 50 && r.conv < 20);
    if (lowConv.length) out.push(`${lowConv[0].a.name.split(" ")[0]}’s link is opened but few register (${lowConv[0].conv}%). Test a shorter message or a clearer poster.`);
    out.push(ver.length >= C.dayPlan[t - 1] ? `Ahead of plan by ${ver.length - C.dayPlan[t - 1]}. Keep the current messages and focus on the best channels.` : `Behind plan by ${C.dayPlan[t - 1] - ver.length}. Send a reminder in the strongest groups this evening.`);
    return out.slice(0, 3);
  }
  let noteT;
  [["nPlan", "plan"], ["nExec", "exec"], ["nImp", "imp"]].forEach(([id, k]) => $(id).addEventListener("input", (e) => {
    S.notes[agileDay] = Object.assign({}, S.notes[agileDay], { [k]: e.target.value });
    clearTimeout(noteT); noteT = setTimeout(() => { save(); $("savedNote").textContent = "Saved"; }, 400);
  }));

  // ======================= REWARDS =======================
  function renderRewards() {
    const t = $("rwTable"); t.innerHTML = "";
    const tb = el("tbody");
    C.ambassadors.forEach((s) => {
      const a = ambBySlot(s.slot);
      if (!a) { tb.append(el("tr", null, el("td", { text: s.slot }), el("td", { class: "muted", text: "Open slot" }), el("td", { class: "r", text: `0 / ${s.target}` }), el("td", { class: "r", text: inr(s.reward) }), el("td", null, el("span", { class: "tag t-info", text: "—" })), el("td"))); return; }
      const rs = rewardState(a);
      const cls = rs.status === "Paid" ? "t-ok" : rs.status === "Approved" ? "t-warn" : rs.status === "Pending approval" ? "t-warn" : "t-info";
      const act = el("td");
      const next = rs.status === "Pending approval" ? "Approved" : rs.status === "Approved" ? "Paid" : null;
      if (next) act.append(el("button", { class: "btn btn-primary btn-sm", type: "button", text: next === "Approved" ? "Approve" : "Mark paid", onclick: () => setStatus(a, rs, next) }));
      tb.append(el("tr", null, el("td", { text: s.slot }), el("td", null, el("b", { text: a.name }), el("div", { class: "small muted mono", text: a.upi })), el("td", { class: "r", text: `${rs.n} / ${s.target}` }), el("td", { class: "r", text: inr(s.reward) }), el("td", null, el("span", { class: "tag " + cls, text: rs.status })), act));
    });
    t.append(el("thead", null, el("tr", null, ["", "Ambassador", "Verified", "Reward", "Status", ""].map((h, i) => el("th", { class: i === 2 || i === 3 ? "r" : "", text: h })))), tb);
    // budget
    const paid = Object.values(S.rewards).filter((x) => x.status === "Paid").reduce((s, x) => s + x.amount, 0);
    const appr = Object.values(S.rewards).filter((x) => x.status === "Approved").reduce((s, x) => s + x.amount, 0);
    const pend = S.ambassadors.reduce((s, a) => { const r = rewardState(a); return s + (r.status === "Pending approval" ? r.earned : 0); }, 0);
    const pool = C.budget - C.reserve; const notYet = pool - paid - appr - pend;
    const css = getComputedStyle(document.documentElement);
    const parts = [[paid, css.getPropertyValue("--green").trim()], [appr, "#E0A23B"], [pend, "#F2CD8A"], [Math.max(0, notYet), css.getPropertyValue("--sky").trim()], [C.reserve, css.getPropertyValue("--navy-2").trim()]];
    const svg = $("budgetBar"); svg.innerHTML = ""; let x = 0;
    parts.forEach(([v, col]) => { const w = (v / C.budget) * 400; if (w <= 0) return; const r = document.createElementNS("http://www.w3.org/2000/svg", "rect"); r.setAttribute("x", x); r.setAttribute("y", 6); r.setAttribute("width", w); r.setAttribute("height", 28); r.setAttribute("fill", col); r.setAttribute("rx", 4); svg.appendChild(r); x += w; });
    const rows = $("budgetRows"); rows.innerHTML = "";
    [["Paid", paid], ["Approved, payment pending", appr], ["Earned, waiting for approval", pend], ["Reward pool not yet earned", Math.max(0, notYet)], ["Reserve: campaign costs and contingency", C.reserve], ["Total budget", C.budget]].forEach(([k, v], i, arr) =>
      rows.append(el("div", { style: `display:flex;justify-content:space-between;padding:6px 0;${i === arr.length - 1 ? "border-top:1px solid var(--line);font-weight:800;margin-top:4px" : ""}` }, el("span", { text: k }), el("b", { text: inr(v) }))));
  }
  function setStatus(a, rs, next) {
    if (next === "Approved" && !GE.canApprove(rs.earned, committed())) { toast("Blocked: approving this would go over the reward budget."); return; }
    S.rewards[a.id] = { status: next, amount: rs.earned, at: new Date().toISOString() };
    pushMsg(S, a, next === "Approved" ? "Reward approved" : "Reward paid", next === "Approved"
      ? `Your reward of ${inr(rs.earned)} is approved. Payment status: Pending transfer to ${a.upi}.`
      : `${inr(rs.earned)} has been sent to ${a.upi}. Payment status: Paid. Thank you for growing the workshop!`);
    rerender(); toast(`${a.name.split(" ")[0]}: ${next}`);
  }

  // ======================= QUALITY =======================
  function renderQuality() {
    const m = /^([a-z0-9-]+)\.github\.io$/i.exec(location.hostname); const repo = location.pathname.split("/").filter(Boolean)[0];
    const al = $("actionsLink");
    if (m && repo) { al.href = `https://github.com/${m[1]}/${repo}/actions`; al.classList.remove("hidden"); } else al.classList.add("hidden");
    const amb = [{ id: "A1", code: "GE-TST1A" }];
    const base = { name: "Test", phone: "9876543210", finalYear: true, createdAt: "2026-01-01T00:00:00Z", ambassadorId: "A1" };
    const cases = [
      ["Same number in another format counts once", () => GE.verifiedRegistrations([base, { ...base, phone: "+91 98765 43210", createdAt: "2026-01-01T01:00:00Z" }]).length === 1],
      ["Not-final-year entries are not counted", () => GE.verifiedRegistrations([{ ...base, finalYear: false }]).length === 0],
      ["Known code is credited, case doesn’t matter", () => GE.attribute("ge-tst1a", amb) === "A1"],
      ["Unknown code is not credited", () => GE.attribute("GE-NOPE1", amb) === null],
      ["Milestones at 25/50/75/100% of 250", () => GE.milestonesFor(250).join() === "63,125,188,250"],
      ["No message between milestones", () => GE.dueMilestones(30, 100, [25]).length === 0],
      ["A milestone is never sent twice", () => GE.dueMilestones(25, 100, [25]).length === 0],
      ["Reward only at the full target", () => GE.rewardFor(249, 250, 800) === 0 && GE.rewardFor(250, 250, 800) === 800],
      ["Planned spend fits ₹2,000", () => GE.plannedSpend() <= C.budget],
      ["Approvals can’t pass the budget", () => GE.canApprove(500, 1300) === false],
      ["Live data: no phone counted twice", () => { const v = verified(); return new Set(v.map((r) => GE.normalizePhone(r.phone))).size === v.length; }],
      ["Live data: each milestone message sent once", () => S.ambassadors.every((a) => new Set(a.milestonesSent).size === a.milestonesSent.length)],
    ];
    const ul = $("checks"); ul.innerHTML = ""; let pass = 0;
    cases.forEach(([name, fn]) => { let ok = false; try { ok = !!fn(); } catch (e) { ok = false; } if (ok) pass++; ul.append(el("li", null, el("span", { text: ok ? "✅" : "❌" }), el("span", { text: name }), el("span", { class: "tag " + (ok ? "t-ok" : "t-bad"), text: ok ? "pass" : "fail" }))); });
    $("selfScore").textContent = `${pass}/${cases.length} passed`;
  }

  // ======================= SETTINGS =======================
  function renderSettings() { $("sCampus").value = S.settings.campus; $("sStart").value = S.settings.start; }
  $("sSave").addEventListener("click", () => {
    const c = $("sCampus").value.trim(); const d = $("sStart").value;
    if (c) S.settings.campus = c; if (/^\d{4}-\d{2}-\d{2}$/.test(d)) S.settings.start = d;
    save(); toast("Settings saved"); render("settings");
  });
  $("sReset").addEventListener("click", () => {
    if (!confirm("Reset everything to the demo data?")) return;
    S = demoState(); save(); agileDay = null; toast("Demo data restored"); location.hash = "#overview";
  });
  $("sFresh").addEventListener("click", () => {
    if (!confirm("Start an empty campaign? All ambassadors, registrations and messages in this browser will be removed.")) return;
    const st = new Date(); S = emptyState(isoDate(st)); S.settings.campus = $("sCampus").value.trim() || "Your Campus";
    save(); agileDay = null; toast("Empty campaign started. Onboard your 3 ambassadors."); location.hash = "#ambassadors";
  });
  $("joinAgain").addEventListener("click", () => showJoin(joinCode));
  $("backToApp").addEventListener("click", () => { location.hash = "#overview"; });

  // ======================= START =======================
  load();
  route();
})();
