/* CRM Екатерины: состояние и действия. Данные читает и пишет только Store (js/store.js),
   внешний вид рисует UI (js/ui.js). */
(function () {
  "use strict";
  const STAGES = [
    { id: "new", name: "Новая" }, { id: "work", name: "В работе" }, { id: "call", name: "Звонок" },
    { id: "meet", name: "Встреча" }, { id: "book", name: "Бронь" }, { id: "deal", name: "Сделка" }, { id: "lost", name: "Отказ" },
  ];
  const SRC = { ig: "Instagram", tg: "Telegram-канал", form: "Сайт, форма", quiz: "Сайт, подбор", ref: "Рекомендация", call: "Звонок", other: "Другое" };
  const SRC_IC = { ig: "ig", tg: "tg", form: "globe", quiz: "quiz", ref: "ref", call: "phone", other: "chat" };
  const LOST = ["Купил в другом месте", "Не подошла цена", "Передумал покупать", "Не выходит на связь", "Другое"];
  const ROOMS = ["Студия", "1-комнатная", "2-комнатная", "3-комнатная", "4 комнаты и больше"];
  const PAY = ["Семейная ипотека", "IT-ипотека", "Рыночная ипотека", "Военная ипотека", "100 % оплата", "Рассрочка", "Пока не решил"];
  const QUICK = ["Позвонить", "Отправить подборку", "Встреча в офисе продаж", "Показ в ЖК", "Получить решение банка", "Подписать ДДУ"];
  const ZHK = {}; (window.ZHK_LIST || []).forEach((z) => (ZHK[z.id] = z));
  const PH = ["img/reel-1.jpg", "img/reel-2.jpg", "img/reel-3.jpg", "img/reel-4.jpg", "img/reel-5.jpg", "img/reel-6.jpg"];

  /* ---------- помощники ---------- */
  const esc = (s) => String(s == null ? "" : s).replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]));
  const pad = (n) => String(n).padStart(2, "0");
  const MON = ["января", "февраля", "марта", "апреля", "мая", "июня", "июля", "августа", "сентября", "октября", "ноября", "декабря"];
  const WD = ["воскресенье", "понедельник", "вторник", "среда", "четверг", "пятница", "суббота"];
  const now = () => new Date();
  const iso = (d) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  const pd = (s) => { const m = String(s).match(/(\d+)-(\d+)-(\d+)[T ](\d+):(\d+)/); return m ? new Date(+m[1], m[2] - 1, +m[3], +m[4], +m[5]) : new Date(NaN); };
  const dayDiff = (d) => { const n = now(); return Math.round((new Date(d.getFullYear(), d.getMonth(), d.getDate()) - new Date(n.getFullYear(), n.getMonth(), n.getDate())) / 864e5); };
  const hm = (d) => pad(d.getHours()) + ":" + pad(d.getMinutes());
  function day(s) { const d = pd(s), k = dayDiff(d); return k === 0 ? "сегодня" : k === 1 ? "завтра" : k === -1 ? "вчера" : d.getDate() + " " + MON[d.getMonth()] + (d.getFullYear() !== now().getFullYear() ? " " + d.getFullYear() : ""); }
  const when = (s) => day(s) + ", " + hm(pd(s));
  function money(v) { if (!v) return "бюджет не указан"; const m = v / 1e6; return (Number.isInteger(m) ? m : m.toFixed(1).replace(".", ",")) + " млн ₽"; }
  const num = (v) => String(v || 0).replace(/\B(?=(\d{3})+(?!\d))/g, " ");
  const initials = (n) => n.split(/\s+/).filter((w) => w && w !== "и").slice(0, 2).map((w) => w[0].toUpperCase()).join("");
  const uid = (p) => p + Date.now().toString(36) + Math.random().toString(36).slice(2, 6);
  const digits = (s) => String(s || "").replace(/\D/g, "");
  function normPhone(s) { let d = digits(s); if (d.length === 10) d = "7" + d; if (d.length === 11 && d[0] === "8") d = "7" + d.slice(1); return d.length === 11 ? `+${d[0]} ${d.slice(1, 4)} ${d.slice(4, 7)}-${d.slice(7, 9)}-${d.slice(9)}` : ""; }
  const stageName = (id) => (STAGES.find((s) => s.id === id) || {}).name || "";
  const zhkName = (l) => (l.zhk && ZHK[l.zhk] ? ZHK[l.zhk].name : l.zhkText || "ЖК не выбран");
  const zhkImg = (l) => (l.zhk && ZHK[l.zhk] ? `img/zhk/${l.zhk}.webp` : "img/flat.jpg");
  const late = (l) => !!(l.next && pd(l.next.at) < now());
  const plural = (n, a, b, c) => { const m = n % 10, h = n % 100; return m === 1 && h !== 11 ? a : m >= 2 && m <= 4 && (h < 12 || h > 14) ? b : c; };

  const IC = {
    ig: '<rect x="3" y="3" width="18" height="18" rx="5"/><circle cx="12" cy="12" r="4"/><circle cx="17.5" cy="6.5" r=".6" fill="currentColor"/>',
    tg: '<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/><path d="m9 13 8-6"/>',
    globe: '<circle cx="12" cy="12" r="9"/><path d="M3 12h18M12 3c3 3.5 3 14.5 0 18M12 3c-3 3.5-3 14.5 0 18"/>',
    quiz: '<path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1 1 2-2M3.5 12l1 1 2-2M3.5 18l1 1 2-2"/>',
    ref: '<circle cx="9" cy="8" r="3.2"/><path d="M3 20c.6-3.4 3-5.4 6-5.4s5.4 2 6 5.4"/><path d="M16 4.6a3.2 3.2 0 0 1 0 6.4M18 14.8c1.7.7 2.7 2.5 3 5.2"/>',
    phone: '<path d="M5 4h4l2 5-2.5 1.5a11 11 0 0 0 5 5L15 13l5 2v4a2 2 0 0 1-2 2A16 16 0 0 1 3 6a2 2 0 0 1 2-2"/>',
    send: '<path d="M21 4 3 11l6 2 2 6 3-4 5 4z"/>',
    board: '<rect x="3" y="4" width="5" height="16" rx="1.5"/><rect x="10" y="4" width="5" height="11" rx="1.5"/><rect x="17" y="4" width="4" height="7" rx="1.5"/>',
    film: '<rect x="5" y="2.5" width="14" height="19" rx="3"/><path d="m10 9 5 3-5 3z"/>',
    book: '<path d="M4 5a2 2 0 0 1 2-2h13v16H6a2 2 0 0 0-2 2z"/><path d="M4 21V5M8 7h7"/>',
    chart: '<path d="M4 20V10M10 20V4M16 20v-7M21 20H3"/>',
    gear: '<circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.7 1.7 0 0 0-1.8-.3 1.7 1.7 0 0 0-1 1.5V21a2 2 0 1 1-4 0v-.1a1.7 1.7 0 0 0-1.1-1.5 1.7 1.7 0 0 0-1.8.3l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.7 1.7 0 0 0 .3-1.8 1.7 1.7 0 0 0-1.5-1H3a2 2 0 1 1 0-4h.1a1.7 1.7 0 0 0 1.5-1.1 1.7 1.7 0 0 0-.3-1.8l-.1-.1a2 2 0 1 1 2.8-2.8l.1.1a1.7 1.7 0 0 0 1.8.3H9a1.7 1.7 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.1a1.7 1.7 0 0 0 1 1.5 1.7 1.7 0 0 0 1.8-.3l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.7 1.7 0 0 0-.3 1.8V9a1.7 1.7 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.1a1.7 1.7 0 0 0-1.5 1z"/>',
    search: '<circle cx="11" cy="11" r="6.5"/><path d="m20 20-4-4"/>',
    plus: '<path d="M12 5v14M5 12h14"/>', x: '<path d="M6 6l12 12M18 6 6 18"/>', back: '<path d="M15 5l-7 7 7 7"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>', clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>',
    cal: '<rect x="3.5" y="5" width="17" height="15" rx="2.5"/><path d="M3.5 10h17M8 3v4M16 3v4"/>',
    pdf: '<path d="M6 3h8l5 5v13H6z"/><path d="M14 3v5h5"/>', upload: '<path d="M12 16V4M7 9l5-5 5 5M4 20h16"/>',
    download: '<path d="M12 4v12M7 11l5 5 5-5M4 20h16"/>', eye: '<path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12z"/><circle cx="12" cy="12" r="3"/>',
    chat: '<path d="M4 5h16v11H9l-5 4z"/>', edit: '<path d="M4 20h4L19 9l-4-4L4 16z"/><path d="m13.5 6.5 4 4"/>',
    trash: '<path d="M4 7h16M10 11v6M14 11v6M6 7l1 13h10l1-13M9 7V4h6v3"/>', refresh: '<path d="M20 11a8 8 0 1 0-2.3 5.7M20 4v7h-7"/>',
    link: '<path d="M10 14a4 4 0 0 0 5.7 0l3-3a4 4 0 0 0-5.7-5.7l-1 1"/><path d="M14 10a4 4 0 0 0-5.7 0l-3 3a4 4 0 0 0 5.7 5.7l1-1"/>',
  };
  const ic = (n, cls) => `<svg class="ic ${cls || ""}" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">${IC[n] || ""}</svg>`;

  /* ---------- приложение ---------- */
  function App(root) {
    this.root = root;
    let db = Store.load();
    if (!db || !db.leads) { db = Demo.make(now()); Store.init(db); }
    this.db = db;
    this.urls = {};
    let tab = "leads"; try { tab = sessionStorage.getItem("crm-tab") || "leads"; } catch (e) {}
    this.s = { tab, open: null, q: "", stage: "all", period: 30, modal: null, err: "", toast: "", editNext: null, showLost: false, psearch: false };
    this.mode = this.calcMode();
    this.bind(); this.render(); this.loadFiles();
  }
  const P = App.prototype;
  P.calcMode = function () { return window.innerWidth >= 1000 ? "desk" : "phone"; };
  P.lead = function (id) { return this.db.leads.find((l) => l.id === id); };
  P.reel = function (id) { return this.db.reels.find((r) => r.id === id); };
  P.guide = function (id) { return this.db.guides.find((g) => g.id === id); };
  P.match = function (l) {
    const q = this.s.q.trim().toLowerCase(); if (!q) return true;
    const qd = digits(q);
    return (l.name + " " + zhkName(l) + " " + (l.tgu || "")).toLowerCase().includes(q) || (qd.length >= 3 && digits(l.ph).includes(qd));
  };
  P.byStage = function (st) { return this.db.leads.filter((l) => l.stage === st && this.match(l)).sort((a, b) => (a.next ? pd(a.next.at) : 9e15) - (b.next ? pd(b.next.at) : 9e15)); };
  P.today = function () { return this.db.leads.filter((l) => l.next && l.stage !== "lost" && dayDiff(pd(l.next.at)) <= 0).sort((a, b) => pd(a.next.at) - pd(b.next.at)); };
  P.hist = function (l, text) { l.hist.push({ at: iso(now()), text }); };
  P.save = function (kind, obj) { if (!Store.put(kind, obj)) this.say("Не получилось сохранить: в памяти браузера нет места"); };

  P.render = function () {
    const keep = {};
    this.root.querySelectorAll("[data-scroll]").forEach((el) => (keep[el.dataset.scroll] = [el.scrollTop, el.scrollLeft]));
    const a = document.activeElement, f = a && this.root.contains(a) && a.dataset.keepfocus, caret = f ? a.selectionStart : 0;
    // всё, что напечатано в открытом окне или форме шага, переживает перерисовку
    const typed = {}, mkey = JSON.stringify(this.s.modal) + "|" + this.s.editNext;
    if (mkey === this._mkey) this.root.querySelectorAll(".modal [name], [data-nextform] [name]").forEach((el) => { if (el.type !== "file") typed[el.closest("form") ? (el.closest("form").attributes[1] || {}).name + el.name : el.name] = el.type === "radio" ? (el.checked ? el.value : typed[el.name]) : el.value; });
    this.root.className = "app v1 " + this.mode;
    const files = mkey === this._mkey ? [...this.root.querySelectorAll(".modal input[type=file]")].map((el) => el.files) : [];
    this.root.innerHTML = UI.render(this) + (this.s.modal ? UI.modal(this) : "") + (this.s.toast ? `<div class="toast" role="status">${esc(this.s.toast)}</div>` : "");
    if (mkey === this._mkey) {
      this.root.querySelectorAll(".modal [name], [data-nextform] [name]").forEach((el) => { const k = (el.closest("form") ? (el.closest("form").attributes[1] || {}).name : "") + el.name; if (!(k in typed) || el.type === "file") return; if (el.type === "radio") el.checked = el.value === typed[k]; else el.value = typed[k]; });
      this.root.querySelectorAll(".modal input[type=file]").forEach((el, i) => { if (files[i] && files[i].length) { try { el.files = files[i]; const n = this.root.querySelector(".f-filename"); if (n) n.textContent = files[i][0].name; } catch (e) {} } });
      const src = this.root.querySelector(".modal [name=src]"), fr = this.root.querySelector(".f-reel"); if (src && fr) fr.hidden = src.value !== "ig";
      const zk = this.root.querySelector(".modal [name=zhk]"), zt = this.root.querySelector(".f-zhktext"); if (zk && zt) zt.hidden = zk.value !== "_other";
    }
    this._mkey = mkey;
    this.root.querySelectorAll("[data-scroll]").forEach((el) => { const k = keep[el.dataset.scroll]; if (k) { el.scrollTop = k[0]; el.scrollLeft = k[1]; } });
    if (f) { const el = this.root.querySelector(`[data-keepfocus="${f}"]`); if (el) { el.focus(); try { el.setSelectionRange(caret, caret); } catch (e) {} } }
    const af = this.root.querySelector("[data-autofocus]"); if (af && !f && this.mode === "desk") af.focus();
  };
  P.say = function (t) {
    this.s.toast = t; this.render(); clearTimeout(this._tt);
    this._tt = setTimeout(() => { this.s.toast = ""; const el = this.root.querySelector(".toast"); if (el) el.remove(); }, 2800);
  };

  P.setStage = function (id, st) {
    const l = this.lead(id); if (!l || l.stage === st) return;
    if (st === "lost") { this.s.modal = { kind: "lost", id }; this.render(); return; }
    l.stage = st; l.lost = null; this.hist(l, "Этап: " + stageName(st));
    if (st === "deal") l.next = null;
    this.save("leads", l); this.say(`${l.name}: этап «${stageName(st)}»`);
  };

  P.formData = function (sel) { const f = this.root.querySelector(sel); const o = {}; if (!f) return o; new FormData(f).forEach((v, k) => (o[k] = typeof v === "string" ? v.trim() : v)); return o; };

  P.act = function (a, arg, el) {
    const s = this.s, db = this.db;
    switch (a) {
      case "tab": s.tab = arg; s.open = null; s.modal = null; s.editNext = null; try { sessionStorage.setItem("crm-tab", arg); } catch (e) {} break;
      case "open": s.open = arg; s.editNext = null; if (s.tab !== "leads") s.tab = "leads"; break;
      case "close": s.open = null; s.editNext = null; break;
      case "stage": this.setStage(s.open, arg); return;
      case "filter": s.stage = arg; break;
      case "period": s.period = +arg; break;
      case "lostcol": s.showLost = !s.showLost; break;
      case "psearch": s.psearch = !s.psearch; if (!s.psearch) s.q = ""; break;
      /* следующий шаг */
      case "done": { const l = this.lead(arg); this.hist(l, "Сделано: " + l.next.text); l.next = null; this.save("leads", l); s.editNext = l.id; this.say("Отмечено. Что дальше?"); return; }
      case "later": { const l = this.lead(arg), d = pd(l.next.at); const t = new Date(now()); t.setDate(t.getDate() + 1); t.setHours(d.getHours(), d.getMinutes()); l.next.at = iso(t); this.hist(l, "Перенесено на " + when(l.next.at)); this.save("leads", l); this.say("Перенесено на завтра"); return; }
      case "next-edit": s.editNext = arg; break;
      case "next-cancel": s.editNext = null; break;
      case "quick": { const i = this.root.querySelector("[data-nextform] [name=text]"); if (i) { i.value = arg; i.focus(); } return; }
      case "next-save": {
        const f = this.formData("[data-nextform]"), l = this.lead(arg);
        if (!f.text) { this.say("Напишите, что нужно сделать"); return; }
        if (!f.date || !f.time) { this.say("Укажите дату и время"); return; }
        l.next = { at: `${f.date}T${f.time}`, text: f.text }; this.hist(l, "Следующий шаг: " + f.text + ", " + when(l.next.at));
        s.editNext = null; this.save("leads", l); this.say("Следующий шаг сохранён"); return;
      }
      /* заметки */
      case "note": { const ta = this.root.querySelector("[data-note]"), t = ta && ta.value.trim(); if (!t) { this.say("Напишите заметку"); return; } const l = this.lead(arg); l.notes.unshift({ at: iso(now()), text: t }); this.save("leads", l); this.say("Заметка сохранена"); return; }
      case "note-del": { const l = this.lead(s.open); l.notes.splice(+arg, 1); this.save("leads", l); this.say("Заметка удалена"); return; }
      /* клиент: создать, изменить, отказ, удалить */
      case "lead-new": s.modal = { kind: "lead" }; s.err = ""; break;
      case "lead-edit": s.modal = { kind: "lead", id: arg }; s.err = ""; break;
      case "lead-save": return this.saveLead();
      case "lead-del": s.modal = { kind: "confirm", text: `Удалить клиента «${this.lead(arg).name}»? Заметки и история удалятся тоже.`, yes: "lead-del-yes", arg }; break;
      case "lead-del-yes": db.leads = db.leads.filter((l) => l.id !== arg); Store.remove("leads", arg); s.modal = null; s.open = null; this.say("Клиент удалён"); return;
      case "lost-save": {
        const f = this.formData("[data-lostform]"), l = this.lead(s.modal.id);
        l.stage = "lost"; l.next = null; l.lost = { reason: f.reason || "Другое", text: f.text || "" };
        this.hist(l, "Отказ: " + (f.text || f.reason || "без причины")); s.modal = null; this.save("leads", l); this.say(`${l.name}: отказ`); return;
      }
      case "modal-close": s.modal = null; s.err = ""; break;
      /* ролики */
      case "reel-new": s.modal = { kind: "reel" }; s.err = ""; break;
      case "reel-edit": s.modal = { kind: "reel", id: arg }; s.err = ""; break;
      case "reel-save": return this.saveReel();
      case "reel-toggle": { const r = this.reel(arg); r.on = !r.on; this.save("reels", r); this.say(r.on ? `Бот снова отвечает на «${r.word}»` : `Бот больше не отвечает на «${r.word}»`); return; }
      case "reel-del": s.modal = { kind: "confirm", text: `Удалить ролик «${this.reel(arg).title}»? Бот перестанет отвечать на «${this.reel(arg).word}». Клиенты останутся.`, yes: "reel-del-yes", arg }; break;
      case "reel-del-yes": db.reels = db.reels.filter((r) => r.id !== arg); Store.remove("reels", arg); s.modal = null; this.say("Ролик удалён"); return;
      /* гайды */
      case "guide-new": s.modal = { kind: "guide" }; s.err = ""; break;
      case "guide-edit": s.modal = { kind: "guide", id: arg }; s.err = ""; break;
      case "guide-save": this.saveGuide(); return;
      case "guide-nofile": this.say("Файл ещё не загружен. Нажмите «Изменить» и выберите PDF"); return;
      case "guide-del": { const g = this.guide(arg), used = db.reels.filter((r) => r.guide === arg).length; s.modal = { kind: "confirm", text: used ? `Гайд «${g.title}» присылают ${used} ${plural(used, "ролик", "ролика", "роликов")}. Сначала выберите для них другой гайд.` : `Удалить гайд «${g.title}»?`, yes: used ? "" : "guide-del-yes", arg }; break; }
      case "guide-del-yes": db.guides = db.guides.filter((g) => g.id !== arg); Store.remove("guides", arg); Store.delFile(arg).catch(() => {}); s.modal = null; this.say("Гайд удалён"); return;
      /* настройки */
      case "export": this.exportCSV(); return;
      case "demo": s.modal = { kind: "confirm", text: "Вернуть демо-данные? Всё, что вы добавили на этом устройстве, удалится.", yes: "demo-yes" }; break;
      case "demo-yes": this.db = Demo.make(now()); Store.init(this.db); Store.clearFiles().catch(() => {}); this.urls = {}; s.modal = null; s.open = null; this.say("Демо-данные вернулись"); return;
      case "wipe": s.modal = { kind: "confirm", text: "Удалить всех клиентов и ролики и начать с чистого листа? Гайды останутся. Отменить это нельзя.", yes: "wipe-yes" }; break;
      case "wipe-yes": this.db = { v: 1, demo: false, leads: [], reels: [], guides: this.db.guides.map((g) => Object.assign(g, { sent: 0 })), sends: [] }; Store.init(this.db); s.modal = null; s.open = null; this.say("Готово, можно добавлять первых клиентов"); return;
      case "openlead": s.tab = "leads"; s.open = arg; s.modal = null; break;
      default: return;
    }
    this.render();
  };

  P.saveLead = function () {
    const f = this.formData("[data-leadform]"), s = this.s, id = s.modal.id, db = this.db;
    const ph = normPhone(f.ph);
    if (!f.name) { s.err = "Напишите имя клиента"; return this.render(); }
    if (!ph) { s.err = "Проверьте телефон: нужно 10 цифр после +7"; return this.render(); }
    const dup = db.leads.find((l) => l.id !== id && digits(l.ph) === digits(ph));
    if (dup) { s.err = `Этот номер уже есть у клиента «${dup.name}»`; s.dup = dup.id; return this.render(); }
    const budget = Math.round(parseFloat(String(f.budget || "").replace(",", ".")) * 1e6) || 0;
    const zhk = f.zhk && f.zhk !== "_other" ? f.zhk : "";
    const base = { name: f.name, ph, tgu: (f.tgu || "").replace(/^@/, "").replace(/^https?:\/\/t\.me\//, ""), src: f.src, reel: f.src === "ig" ? f.reel || "" : "", zhk, zhkText: zhk ? "" : f.zhkText || "", rooms: f.rooms, budget, pay: f.pay };
    let l;
    if (id) { l = Object.assign(this.lead(id), base); this.hist(l, "Данные клиента изменены"); this.say("Изменения сохранены"); }
    else {
      l = Object.assign({ id: uid("l"), stage: "new", at: iso(now()), next: null, notes: [], hist: [], lost: null }, base);
      this.hist(l, `Клиент добавлен вручную, источник: ${SRC[l.src]}`);
      if (f.note) l.notes.push({ at: iso(now()), text: f.note });
      if (f.ntext && f.ndate && f.ntime) l.next = { at: `${f.ndate}T${f.ntime}`, text: f.ntext };
      s.open = l.id; s.tab = "leads"; s.stage = "all";
      this.say("Клиент добавлен: " + l.name);
    }
    s.modal = null; s.err = ""; s.dup = null; this.save("leads", l); this.render();
  };
  P.saveReel = function () {
    const f = this.formData("[data-reelform]"), s = this.s, id = s.modal.id;
    const word = (f.word || "").toLowerCase().replace(/[«»"']/g, "");
    if (f.link && !/instagram\.com\/(reel|reels|p)\//.test(f.link)) { s.err = "Ссылка должна вести на рилс в Instagram"; return this.render(); }
    if (!word) { s.err = "Напишите кодовое слово"; return this.render(); }
    if (/\s/.test(word)) { s.err = "Кодовое слово — одно слово, без пробелов"; return this.render(); }
    if (!f.guide) { s.err = "Выберите гайд. Если его нет — загрузите в разделе «Гайды»"; return this.render(); }
    let r;
    if (id) { r = Object.assign(this.reel(id), { title: f.title || this.reel(id).title, word, guide: f.guide, link: f.link, reply: f.reply }); this.say("Ролик сохранён"); }
    else {
      r = { id: uid("r"), title: f.title || "Ролик без названия", word, guide: f.guide, link: f.link, reply: f.reply || "Отправила гайд в директ", date: iso(now()), views: 0, comments: 0, sent: 0, on: true, img: PH[this.db.reels.length % PH.length], fresh: true };
      this.say(`Готово: на «${word}» бот пришлёт «${this.guide(f.guide).title}»`);
    }
    s.modal = null; s.err = ""; this.save("reels", r); this.render();
  };
  P.saveGuide = async function () {
    const s = this.s, id = s.modal.id, f = this.formData("[data-guideform]"), input = this.root.querySelector("[data-guideform] [type=file]"), file = input && input.files[0];
    if (!f.title) { s.err = "Напишите название гайда"; return this.render(); }
    if (!id && !file) { s.err = "Выберите PDF-файл гайда"; return this.render(); }
    if (file && !/pdf$/i.test(file.type || file.name)) { s.err = "Нужен файл в формате PDF"; return this.render(); }
    const g = id ? this.guide(id) : { id: uid("g"), sent: 0, pages: 0, cover: PH[(this.db.guides.length + 2) % PH.length], file: false, ready: true };
    Object.assign(g, { title: f.title, sub: f.sub || "", upd: iso(now()) });
    if (file) {
      try { await Store.putFile(g.id, file); g.file = true; g.fileName = file.name; g.size = file.size; g.ready = true; if (this.urls[g.id]) URL.revokeObjectURL(this.urls[g.id]); this.urls[g.id] = URL.createObjectURL(new Blob([file], { type: "application/pdf" })); }
      catch (e) { s.err = "Не получилось сохранить файл в памяти браузера. Если это частный режим Safari, откройте CRM в обычном окне"; return this.render(); }
    }
    s.modal = null; s.err = ""; this.save("guides", g); this.say(id ? "Гайд сохранён" : "Гайд загружен: " + g.title);
  };
  P.loadFiles = async function () {
    for (const g of this.db.guides.filter((x) => x.file && !this.urls[x.id])) { try { const b = await Store.getFile(g.id); if (b) this.urls[g.id] = URL.createObjectURL(b); } catch (e) {} }
    this.render();
  };
  P.exportCSV = function () {
    const head = ["Имя", "Телефон", "Telegram", "Этап", "Источник", "Ролик", "Кодовое слово", "ЖК", "Квартира", "Бюджет, ₽", "Оплата", "Заявка", "Следующий шаг", "Когда", "Заметки"];
    const q = (v) => '"' + String(v == null ? "" : v).replace(/"/g, '""') + '"';
    const rows = this.db.leads.map((l) => { const r = l.reel && this.reel(l.reel); return [l.name, l.ph, l.tgu ? "@" + l.tgu : "", stageName(l.stage), SRC[l.src], r ? r.title : "", r ? r.word : "", zhkName(l), l.rooms, l.budget || "", l.pay, when(l.at), l.next ? l.next.text : "", l.next ? when(l.next.at) : "", l.notes.map((n) => n.text).join(" / ")]; });
    const csv = "﻿" + [head].concat(rows).map((r) => r.map(q).join(";")).join("\r\n");
    const a = document.createElement("a"); a.href = URL.createObjectURL(new Blob([csv], { type: "text/csv;charset=utf-8" }));
    const d = now(); a.download = `Клиенты ${pad(d.getDate())}.${pad(d.getMonth() + 1)}.${d.getFullYear()}.csv`; document.body.appendChild(a); a.click(); a.remove();
    this.say("Таблица скачана: " + plural(this.db.leads.length, "", "", "") + this.db.leads.length + " " + plural(this.db.leads.length, "клиент", "клиента", "клиентов"));
  };

  P.bind = function () {
    const R = this.root;
    R.addEventListener("click", (e) => {
      const el = e.target.closest("[data-act]"); if (!el || !R.contains(el)) return;
      if (el.tagName === "A" && el.getAttribute("href") && el.getAttribute("href") !== "#") return;
      e.preventDefault(); this.act(el.dataset.act, el.dataset.arg, el);
    });
    R.addEventListener("input", (e) => { if (e.target.matches("[data-q]")) { this.s.q = e.target.value; this.render(); } });
    R.addEventListener("change", (e) => {
      if (e.target.name === "src") { const r = R.querySelector(".f-reel"); if (r) r.hidden = e.target.value !== "ig"; }
      if (e.target.name === "zhk") { const r = R.querySelector(".f-zhktext"); if (r) r.hidden = e.target.value !== "_other"; }
      if (e.target.type === "file") { const n = R.querySelector(".f-filename"); if (n) n.textContent = e.target.files[0] ? e.target.files[0].name : "Файл не выбран"; }
    });
    R.addEventListener("submit", (e) => { e.preventDefault(); const b = e.target.querySelector("[data-submit]"); if (b) b.click(); });
    R.addEventListener("keydown", (e) => {
      if (e.key === "Escape") { if (this.s.modal) { this.s.modal = null; this.render(); } else if (this.s.open && this.mode === "desk") { this.s.open = null; this.render(); } }
      if (e.key === "Enter" && e.target.matches("[data-act]") && !/^(BUTTON|A|INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName)) { e.preventDefault(); e.target.click(); }
    });
    R.addEventListener("dragstart", (e) => { const c = e.target.closest("[data-drag]"); if (!c) return; e.dataTransfer.setData("text/plain", c.dataset.drag); e.dataTransfer.effectAllowed = "move"; c.classList.add("is-drag"); });
    R.addEventListener("dragend", (e) => { const c = e.target.closest("[data-drag]"); if (c) c.classList.remove("is-drag"); R.querySelectorAll(".is-over").forEach((x) => x.classList.remove("is-over")); });
    R.addEventListener("dragover", (e) => { const col = e.target.closest("[data-col]"); if (!col) return; e.preventDefault(); R.querySelectorAll(".is-over").forEach((x) => x !== col && x.classList.remove("is-over")); col.classList.add("is-over"); });
    R.addEventListener("drop", (e) => { const col = e.target.closest("[data-col]"); if (!col) return; e.preventDefault(); this.setStage(e.dataTransfer.getData("text/plain"), col.dataset.col); });
    window.addEventListener("resize", () => { const m = this.calcMode(); if (m !== this.mode) { this.mode = m; this.render(); } });
    setInterval(() => { if (!this.s.modal && !this.s.editNext && !this.root.contains(document.activeElement)) this.render(); }, 60000);
  };

  P.stats = function () {
    const p = this.s.period, from = new Date(now().getTime() - p * 864e5), L = this.db.leads.filter((l) => pd(l.at) >= from);
    const order = STAGES.map((s) => s.id), reached = (st) => L.filter((l) => l.stage !== "lost" && order.indexOf(l.stage) >= order.indexOf(st)).length;
    const keys = Object.keys(SRC).filter((k) => this.db.leads.some((l) => l.src === k) || ["ig", "tg", "form", "quiz", "ref"].includes(k));
    const days = []; for (let i = 13; i >= 0; i--) { const d = new Date(now().getFullYear(), now().getMonth(), now().getDate() - i); days.push({ d, n: this.db.leads.filter((l) => dayDiff(pd(l.at)) === -i).length }); }
    const sent = this.db.reels.reduce((a, r) => a + (pd(r.date) >= from ? r.sent : Math.round(r.sent * Math.min(1, p / 30))), 0);
    return { total: L.length, sent, meet: reached("meet"), deal: reached("deal"), lost: L.filter((l) => l.stage === "lost").length,
      funnel: order.filter((x) => x !== "lost").map((st) => ({ st, n: reached(st) })), bySrc: keys.map((k) => ({ k, n: L.filter((l) => l.src === k).length })), days };
  };

  window.CRM = { App, STAGES, SRC, SRC_IC, LOST, ROOMS, PAY, QUICK, ZHK, esc, pad, iso, pd, now, dayDiff, hm, day, when, money, num, initials, stageName, zhkName, zhkImg, late, plural, ic, MON, WD };
})();
