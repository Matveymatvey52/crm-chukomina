/* Внешний вид CRM, вариант «Доска»: меню слева, заявки колонками по этапам, клиент — панелью справа.
   На телефоне: список с этапами вбок, клиент на весь экран, меню внизу. */
window.UI = (function () {
  "use strict";
  const C = window.CRM, { esc, ic, money, num, when, day, hm, pd, iso, now, initials, stageName, zhkName, zhkImg, STAGES, SRC, SRC_IC, ZHK, plural } = C;
  const MAIN = STAGES.filter((s) => s.id !== "lost");
  const TABS = [["leads", "Заявки", "board"], ["reels", "Ролики и слова", "film"], ["guides", "Гайды", "book"], ["stats", "Статистика", "chart"]];
  const SHORT = { tg: "Telegram", form: "Сайт", quiz: "Подбор", ref: "Рекомендация", ig: "Instagram", call: "Звонок", other: "Другое" };
  const short = (r) => String(r || "").replace("-комнатная", "-комн.").replace("4 комнаты и больше", "4+ комн.");
  const tel = (ph) => "tel:" + String(ph).replace(/[^\d+]/g, "");
  // ближайшее «ровное» время не раньше чем через час: 14:10 → 15:30, 14:40 → 16:00
  const soon = () => { const t = new Date(now().getTime() + 3600e3); if (t.getMinutes() > 30) { t.setHours(t.getHours() + 1, 0); } else t.setMinutes(30); return t; };
  const dateIn = (d) => `${d.getFullYear()}-${C.pad(d.getMonth() + 1)}-${C.pad(d.getDate())}`;

  function srcChip(app, l, full) {
    const r = l.reel && app.reel(l.reel);
    return `<span class="src src-${l.src}">${ic(SRC_IC[l.src])}<span>${esc(r ? "«" + r.word + "»" : full ? SRC[l.src] : SHORT[l.src])}</span></span>`;
  }
  function nextLine(l) {
    if (!l.next) return `<span class="nx is-none">${l.stage === "deal" ? ic("check") + "Сделка закрыта" : "Без задачи"}</span>`;
    const lt = C.late(l), td = C.dayDiff(pd(l.next.at)) === 0;
    return `<span class="nx ${lt ? "is-late" : td ? "is-today" : ""}">${ic("clock")}<span>${lt ? "просрочено, " + when(l.next.at) : when(l.next.at)}</span></span>`;
  }

  /* ---------- доска ---------- */
  function card(app, l) {
    return `<article class="kcard" draggable="true" data-drag="${l.id}" data-act="open" data-arg="${l.id}" tabindex="0" aria-label="${esc(l.name)}">
      <div class="kph"><img src="${zhkImg(l)}" alt="" loading="lazy"><span>${esc(zhkName(l))}</span></div>
      <div class="kbody"><h4>${esc(l.name)}</h4><p class="kmeta">${esc(short(l.rooms))}, ${l.budget ? "до " + money(l.budget) : "бюджет не указан"}</p>
        <p class="kpay">${esc(l.pay)}</p><div class="krow">${srcChip(app, l)}</div><div class="kfoot">${nextLine(l)}</div></div></article>`;
  }
  function leadsPage(app) {
    const L = app.db.leads, nNew = L.filter((l) => l.stage === "new").length, lost = L.filter((l) => l.stage === "lost").length, work = L.length - lost - L.filter((l) => l.stage === "deal").length;
    const cols = app.s.showLost ? STAGES : MAIN;
    const empty = !L.length ? `<div class="welcome"><h2>Клиентов пока нет</h2><p>Добавьте первого вручную. Когда подключим бота, заявки из Instagram, Telegram и с сайта будут появляться здесь сами.</p><button class="btn gold" data-act="lead-new">${ic("plus")}Добавить клиента</button></div>` : "";
    return `<div class="pagehead"><div><h1>Заявки</h1><p class="sub">${L.length ? `В работе ${work} ${plural(work, "клиент", "клиента", "клиентов")}, новых ${nNew}, задач на сегодня ${app.today().length}` : "Здесь будут все клиенты по этапам"}</p></div>
      <div class="ph-r"><label class="search">${ic("search")}<input data-q data-keepfocus="q" value="${esc(app.s.q)}" placeholder="Имя, телефон или ЖК" aria-label="Поиск"></label>
      <button class="btn ghost" data-act="lostcol">${app.s.showLost ? "Скрыть отказы" : "Отказы: " + lost}</button><button class="btn gold" data-act="lead-new">${ic("plus")}Клиент</button></div></div>
      ${empty || `<div class="board ${app.s.showLost ? "is-wide" : ""}" data-scroll="board">${cols.map((st) => { const items = app.byStage(st.id);
        return `<section class="col" data-col="${st.id}"><header><h3>${st.name}</h3><span class="cnt">${items.length}</span></header>
          <div class="col-list" data-scroll="col-${st.id}">${items.map((l) => card(app, l)).join("") || `<p class="empty">${app.s.q ? "Никого не нашли" : "Перетащите сюда карточку"}</p>`}</div></section>`; }).join("")}</div>`}`;
  }

  /* ---------- карточка клиента ---------- */
  function nextForm(app, l) {
    const d = l.next ? pd(l.next.at) : soon();
    return `<form class="nform" data-nextform><p class="nform-h">${l.next ? "Изменить следующий шаг" : "Что дальше?"}</p>
      <div class="quick">${C.QUICK.map((q) => `<button type="button" class="qchip" data-act="quick" data-arg="${esc(q)}">${esc(q)}</button>`).join("")}</div>
      <input name="text" value="${esc(l.next ? l.next.text : "")}" placeholder="Что сделать" autocomplete="off" data-autofocus>
      <div class="nrow"><input type="date" name="date" value="${dateIn(d)}" aria-label="Дата"><input type="time" name="time" value="${hm(d)}" aria-label="Время"></div>
      <div class="nbtn"><button type="button" class="btn sm ghost" data-act="next-cancel">Отмена</button><button type="button" class="btn sm" data-submit data-act="next-save" data-arg="${l.id}">Сохранить</button></div></form>`;
  }
  function client(app, l, phone) {
    const z = l.zhk && ZHK[l.zhk], r = l.reel && app.reel(l.reel), cur = STAGES.findIndex((s) => s.id === l.stage);
    const steps = MAIN.map((st, i) => `<button class="step ${l.stage === st.id ? "is-cur" : i < cur && l.stage !== "lost" ? "is-done" : ""}" data-act="stage" data-arg="${st.id}">${st.name}</button>`).join("")
      + `<button class="step lost ${l.stage === "lost" ? "is-cur" : ""}" data-act="stage" data-arg="lost">Отказ</button>`;
    const g = r && app.guide(r.guide);
    const viaLine = `<p class="via via-${l.via || "none"}">${ic(l.via === "mail" ? "mail" : l.via === "tg" ? "tg" : "pdf")}<span>${l.via ? "Гайд получил " + C.VIA[l.via] : "Гайд не получал"}</span></p>`;
    const from = r ? `<div class="from"><img class="from-th" src="${r.img}" alt=""><div><p class="lbl">${ic("ig")} Ролик в Instagram</p><p class="from-t">${esc(r.title)}</p><p class="from-m">Слово <b>«${esc(r.word)}»</b>${g ? `, бот прислал гайд «${esc(g.title)}»` : ""}</p></div></div>`
      : `<div class="from"><span class="src-big src-${l.src}">${ic(SRC_IC[l.src])}</span><div><p class="lbl">Источник</p><p class="from-t">${SRC[l.src]}</p><p class="from-m">Заявка ${when(l.at)}</p></div></div>`;
    let task;
    if (app.s.editNext === l.id) task = nextForm(app, l);
    else if (l.next) task = `<div class="task ${C.late(l) ? "is-late" : ""}"><div class="task-w">${ic("cal")}<div><p class="task-t">${esc(l.next.text)}</p><p class="task-d">${C.late(l) ? "Просрочено: " : ""}${when(l.next.at)}</p></div></div>
        <div class="task-b"><button class="iconbtn sm" data-act="next-edit" data-arg="${l.id}" aria-label="Изменить">${ic("edit")}</button><button class="btn sm ghost" data-act="later" data-arg="${l.id}">На завтра</button><button class="btn sm" data-act="done" data-arg="${l.id}">${ic("check")}Готово</button></div></div>`;
    else task = `<div class="task is-empty"><p>${l.stage === "deal" ? "Сделка закрыта. Через месяц напомните о себе и попросите отзыв." : l.stage === "lost" ? `Отказ: ${esc(l.lost ? l.lost.text || l.lost.reason : "")}` : "Следующего шага нет. Поставьте задачу, чтобы клиент не потерялся."}</p>
        ${l.stage === "lost" ? "" : `<button class="btn sm" data-act="next-edit" data-arg="${l.id}">${ic("plus")}Поставить задачу</button>`}</div>`;
    return `<div class="cl ${phone ? "is-phone" : ""}">
      <header class="cl-h">${phone ? `<button class="iconbtn" data-act="close" aria-label="Назад">${ic("back")}</button>` : ""}
        <span class="ava">${esc(initials(l.name))}</span><div class="cl-n"><h2>${esc(l.name)}</h2><p>${stageName(l.stage)}, заявка ${when(l.at)}</p></div>
        <button class="iconbtn" data-act="lead-edit" data-arg="${l.id}" aria-label="Изменить данные">${ic("edit")}</button>
        ${phone ? "" : `<button class="iconbtn" data-act="close" aria-label="Закрыть">${ic("x")}</button>`}</header>
      <div class="cl-body" data-scroll="client-${l.id}">
        <div class="contacts"><a class="btn" href="${tel(l.ph)}">${ic("phone")}${esc(l.ph)}</a>${l.tgu ? `<a class="btn ghost" href="https://t.me/${encodeURIComponent(l.tgu)}" target="_blank" rel="noopener">${ic("send")}@${esc(l.tgu)}</a>` : `<span class="btn ghost is-off">Telegram не указан</span>`}</div>
        <div class="steps">${steps}</div>
        <section class="blk"><h3>Следующий шаг</h3>${task}</section>
        <section class="blk"><h3>Что ищет</h3>
          <div class="want"><img src="${zhkImg(l)}" alt=""><div><p class="w-n">${z ? "ЖК «" + esc(z.name) + "»" : esc(zhkName(l))}</p><p class="w-m">${z ? esc([z.where, z.metro].filter(Boolean).join(", ")) : "Уточнить у клиента"}</p>${z && z.cls ? `<p class="w-c">${esc(z.cls)}</p>` : ""}</div></div>
          <dl class="facts"><div><dt>Квартира</dt><dd>${esc(l.rooms || "не указана")}</dd></div><div><dt>Бюджет</dt><dd>${l.budget ? "до " + money(l.budget) : "не указан"}</dd></div><div><dt>Оплата</dt><dd>${esc(l.pay || "не указана")}</dd></div></dl></section>
        <section class="blk"><h3>Откуда пришёл клиент</h3>${from}${viaLine}</section>
        <section class="blk"><h3>Заметки</h3>
          <div class="noteform"><textarea data-note rows="2" placeholder="Например: перезвонить после 18:00, ждёт одобрения"></textarea><button class="btn sm" data-act="note" data-arg="${l.id}">Сохранить</button></div>
          ${l.notes.map((n, i) => `<div class="noteitem"><p>${esc(n.text)}</p><span>${when(n.at)}<button class="lnk sm" data-act="note-del" data-arg="${i}">Удалить</button></span></div>`).join("") || `<p class="muted">Заметок пока нет</p>`}</section>
        <section class="blk"><h3>История</h3><ol class="tl">${l.hist.slice().reverse().map((h) => `<li><span>${when(h.at)}</span><p>${esc(h.text)}</p></li>`).join("")}</ol></section>
        <button class="lnk danger" data-act="lead-del" data-arg="${l.id}">${ic("trash")}Удалить клиента</button>
      </div></div>`;
  }

  /* ---------- ролики ---------- */
  function reelCard(app, r) {
    const leads = app.db.leads.filter((l) => l.reel === r.id).length, g = app.guide(r.guide);
    const soon = pd(r.date) > now(), date = soon ? "Выйдет " + day(r.date) : r.fresh ? "Добавлен " + day(r.date) : "Вышел " + day(r.date);
    return `<article class="rcard ${r.on ? "" : "is-off"}">
      <div class="rth"><img src="${r.img}" alt="" loading="lazy">${r.views ? `<span>${ic("eye")}${num(r.views)}</span>` : ""}</div>
      <div class="rbody"><div class="rtop"><p class="rdate">${date}</p><div class="ract"><button class="iconbtn sm" data-act="reel-edit" data-arg="${r.id}" aria-label="Изменить">${ic("edit")}</button><button class="iconbtn sm" data-act="reel-del" data-arg="${r.id}" aria-label="Удалить">${ic("trash")}</button></div></div>
        <h4>${esc(r.title)}</h4>
        <div class="rword"><span class="word">«${esc(r.word)}»</span><span class="rg">${ic("pdf")}${esc(g ? g.title : "гайд удалён")}</span></div>
        ${soon || r.fresh ? `<p class="rwait">${ic("clock")}<span>${soon ? "Бот готов и начнёт отвечать, когда ролик выйдет" : "Цифры появятся, когда подключим бота к Instagram"}</span></p>`
          : `<dl class="rstat"><div><dt>Написали слово</dt><dd>${num(r.comments)}</dd></div><div><dt>Получили гайд</dt><dd>${num(r.sent)}</dd></div><div><dt>Стали клиентами</dt><dd>${leads}</dd></div></dl>`}
        <button class="switch ${r.on ? "is-on" : ""}" data-act="reel-toggle" data-arg="${r.id}" role="switch" aria-checked="${r.on}"><i></i>${r.on ? (soon ? "Бот включён" : "Бот отвечает") : "Бот выключен"}</button></div></article>`;
  }
  function reels(app) {
    return `<div class="pagehead"><div><h1>Ролики и кодовые слова</h1><p class="sub">Человек пишет слово под роликом, бот отвечает и присылает гайд в директ.</p></div><button class="btn gold" data-act="reel-new">${ic("plus")}Добавить ролик</button></div>
      <div class="pagebody" data-scroll="reels">${app.db.reels.length ? `<div class="rgrid">${app.db.reels.map((r) => reelCard(app, r)).join("")}</div>` : `<div class="welcome"><h2>Роликов пока нет</h2><p>Перед публикацией рилса добавьте его сюда: ссылку, кодовое слово и гайд.</p><button class="btn gold" data-act="reel-new">${ic("plus")}Добавить ролик</button></div>`}</div>`;
  }

  /* ---------- гайды ---------- */
  function guideCards(app) {
    return app.db.guides.map((g) => {
      const words = app.db.reels.filter((r) => r.guide === g.id).map((r) => `<span class="word sm">«${esc(r.word)}»</span>`).join("");
      const url = app.urls[g.id];
      const meta = g.file ? `PDF, ${Math.max(1, Math.round((g.size || 0) / 1024))} КБ, обновлён ${day(g.upd)}` : g.ready ? `${g.pages ? g.pages + " страниц, " : ""}обновлён ${day(g.upd)}` : "Черновик, ещё не готов";
      return `<article class="gcard ${g.ready ? "" : "is-draft"}">
        <div class="gcov ${g.id === "g-ipoteka" ? "is-pdf" : ""}"><img src="${g.cover || "img/flat.jpg"}" alt="" loading="lazy">${g.id === "g-ipoteka" ? "" : `<div class="gcov-t"><span>Гайд</span><b>${esc(g.sub || g.title)}</b></div>`}</div>
        <div class="gbody"><h4>${esc(g.title)}</h4><p class="gm">${meta}</p><p class="gs">${g.sent ? `Отправлен ${num(g.sent)} ${plural(g.sent, "раз", "раза", "раз")}` : "Ещё не отправлялся"}</p>
          <div class="gw">${words || `<span class="muted">Не привязан к роликам</span>`}</div>
          <div class="gbtn">${url ? `<a class="btn sm ghost" href="${url}" target="_blank" rel="noopener">${ic("pdf")}Открыть PDF</a>` : `<button class="btn sm ghost" data-act="guide-nofile">${ic("pdf")}Открыть PDF</button>`}
          <button class="iconbtn sm" data-act="guide-edit" data-arg="${g.id}" aria-label="Изменить">${ic("edit")}</button><button class="iconbtn sm" data-act="guide-del" data-arg="${g.id}" aria-label="Удалить">${ic("trash")}</button></div></div></article>`;
    }).join("");
  }
  function sendsTable(app) {
    if (!app.db.sends.length) return "";
    return `<section class="panel sends"><h3>Последние отправки</h3><p class="sub">Кому бот или сайт прислал гайд. Кто оставил телефон, уже есть в заявках.</p>
      <table class="tbl"><thead><tr><th>Когда</th><th>Кто</th><th>Гайд</th><th>Куда</th><th>Слово</th><th>Телефон</th></tr></thead><tbody>
      ${app.db.sends.map((x) => { const g = app.guide(x.guide), l = x.lead && app.lead(x.lead); return `<tr><td>${when(x.at)}</td><td>${esc(x.who)}</td><td>${esc(g ? g.title : "")}</td><td>${x.via}</td><td>${x.word ? `<span class="word sm">«${esc(x.word)}»</span>` : `<span class="muted">сайт или канал</span>`}</td>
      <td>${l ? `<button class="lnk" data-act="openlead" data-arg="${l.id}">Открыть клиента</button>` : `<span class="muted">Не оставил</span>`}</td></tr>`; }).join("")}</tbody></table></section>`;
  }
  function guides(app) {
    return `<div class="pagehead"><div><h1>Гайды</h1><p class="sub">Их бот присылает по кодовому слову, а сайт — на почту после заявки.</p></div><button class="btn gold" data-act="guide-new">${ic("upload")}Загрузить гайд</button></div>
      <div class="pagebody" data-scroll="guides"><div class="ggrid">${guideCards(app)}</div>${sendsTable(app)}</div>`;
  }

  /* ---------- статистика ---------- */
  function statsBody(app) {
    const S = app.stats(), max = Math.max(...S.funnel.map((f) => f.n), 1), smax = Math.max(...S.bySrc.map((x) => x.n), 1), dmax = Math.max(...S.days.map((d) => d.n), 1);
    const rows = app.db.reels.filter((r) => r.views).map((r) => ({ r, n: app.db.leads.filter((l) => l.reel === r.id).length })).sort((a, b) => b.n - a.n || b.r.sent - a.r.sent);
    return `<div class="tiles"><div class="tile"><p>Новых клиентов</p><b>${S.total}</b></div><div class="tile"><p>Получили гайд</p><b>${num(S.sent)}</b></div><div class="tile"><p>Дошли до встречи</p><b>${S.meet}</b></div><div class="tile"><p>Дошли до сделки</p><b>${S.deal}</b></div></div>
      <div class="two"><section class="panel"><h3>Воронка</h3><p class="sub">Сколько клиентов дошло до каждого этапа. Отказов: ${S.lost}.</p>
        ${S.funnel.map((f) => `<div class="bar"><span class="bl">${stageName(f.st)}</span><span class="bt"><i style="width:${(f.n / max) * 100}%"></i></span><b>${f.n}</b></div>`).join("")}</section>
      <section class="panel"><h3>Откуда приходят</h3><p class="sub">Новые клиенты по источникам.</p>
        ${S.bySrc.map((x) => `<div class="bar"><span class="bl"><span class="src src-${x.k}">${ic(SRC_IC[x.k])}<span>${SRC[x.k]}</span></span></span><span class="bt"><i style="width:${(x.n / smax) * 100}%"></i></span><b>${x.n}</b></div>`).join("")}
        <h3 class="h3b">Как получили гайд</h3>${S.byVia.map((x) => `<div class="bar"><span class="bl">${{ tg: "В Telegram", mail: "На почту", "": "Не получали" }[x.k]}</span><span class="bt"><i style="width:${(x.n / Math.max(1, S.total)) * 100}%"></i></span><b>${x.n}</b></div>`).join("")}</section></div>
      ${rows.length ? `<section class="panel"><h3>Какие ролики приводят клиентов</h3><table class="tbl"><thead><tr><th>Ролик</th><th>Слово</th><th>Просмотры</th><th>Написали слово</th><th>Получили гайд</th><th>Стали клиентами</th></tr></thead>
        <tbody>${rows.map(({ r, n }) => `<tr><td><span class="tr-r"><img src="${r.img}" alt="">${esc(r.title)}</span></td><td><span class="word sm">«${esc(r.word)}»</span></td><td>${num(r.views)}</td><td>${num(r.comments)}</td><td>${num(r.sent)}</td><td><b>${n}</b></td></tr>`).join("")}</tbody></table></section>` : ""}
      <section class="panel"><h3>Новые клиенты по дням, две недели</h3><div class="days">${S.days.map((d) => `<div class="day ${C.dayDiff(d.d) === 0 ? "is-today" : ""}"><span class="dv">${d.n || ""}</span><i style="height:${Math.max(4, (d.n / dmax) * 100)}%"></i><span class="dl">${d.d.getDate()}</span></div>`).join("")}</div></section>`;
  }
  const seg = (app, lbl) => `<div class="seg">${[7, 30, 90].map((p) => `<button class="${app.s.period === p ? "is-on" : ""}" data-act="period" data-arg="${p}">${p} ${lbl}</button>`).join("")}</div>`;
  const stats = (app) => `<div class="pagehead"><div><h1>Статистика</h1><p class="sub">Сколько людей пришло, откуда и сколько дошло до сделки.</p></div>${seg(app, "дней")}</div><div class="pagebody" data-scroll="stats">${statsBody(app)}</div>`;

  /* ---------- настройки ---------- */
  function settingsBody(app) {
    return `<section class="panel"><h3>Где хранятся данные</h3><p class="txt">Пока только в этом браузере, на этом устройстве. Телефон и компьютер видят разные данные, а если очистить историю браузера, данные пропадут. Когда перенесём CRM на сервер, данные станут общими для всех устройств.</p></section>
      <section class="panel"><h3>Выгрузить клиентов</h3><p class="txt">Таблица со всеми клиентами: этап, источник, ЖК, бюджет, следующий шаг, заметки. Открывается в Numbers и Excel.</p><button class="btn" data-act="export">${ic("download")}Скачать таблицу</button></section>
      <section class="panel"><h3>Демо-данные</h3><p class="txt">${app.db.demo ? "Сейчас в CRM выдуманные клиенты для показа." : "Сейчас в CRM ваши данные."} Можно вернуть демо-данные или начать с чистого листа.</p>
        <div class="btnrow"><button class="btn ghost" data-act="demo">${ic("refresh")}Вернуть демо-данные</button><button class="btn ghost danger" data-act="wipe">${ic("trash")}Начать с чистого листа</button></div></section>
      <section class="panel"><h3>Как поставить на экран «Домой»</h3><p class="txt">iPhone: откройте CRM в Safari, нажмите «Поделиться» и выберите «На экран „Домой“». CRM откроется отдельным приложением с иконкой.</p></section>
      <p class="ver">Прототип CRM Екатерины Чукоминой, версия от 17 ноября 2026</p>`;
  }
  const settings = (app) => `<div class="pagehead"><div><h1>Настройки</h1><p class="sub">Данные, выгрузка и установка на телефон.</p></div></div><div class="pagebody" data-scroll="settings"><div class="setgrid">${settingsBody(app)}</div></div>`;

  /* ---------- окна ---------- */
  function opt(list, val, map) { return list.map((x) => { const [v, t] = Array.isArray(x) ? x : [x, map ? map[x] : x]; return `<option value="${esc(v)}" ${v === val ? "selected" : ""}>${esc(t)}</option>`; }).join(""); }
  function leadForm(app) {
    const id = app.s.modal.id, l = id ? app.lead(id) : { name: "", ph: "", tgu: "", src: "ig", reel: "", via: "", zhk: "", zhkText: "", rooms: "2-комнатная", budget: 0, pay: "Семейная ипотека" };
    const t = soon();
    const zl = Object.values(ZHK).sort((a, b) => a.name.localeCompare(b.name, "ru"));
    return `<form class="mform" data-leadform><div class="m-h"><h2>${id ? "Изменить клиента" : "Новый клиент"}</h2><button type="button" class="iconbtn" data-act="modal-close" aria-label="Закрыть">${ic("x")}</button></div>
      <div class="m-b" data-scroll="mform">
      <div class="g2"><label class="fld"><span>Имя</span><input name="name" value="${esc(l.name)}" placeholder="Анна Морозова" autocomplete="off" data-autofocus></label>
      <label class="fld"><span>Телефон</span><input name="ph" type="tel" value="${esc(l.ph)}" placeholder="+7 900 000-00-00" autocomplete="off"></label>
      <label class="fld"><span>Telegram</span><input name="tgu" value="${esc(l.tgu ? "@" + l.tgu : "")}" placeholder="@имя, если есть" autocomplete="off"></label>
      <label class="fld"><span>Откуда пришёл</span><select name="src">${opt(Object.keys(C.SRC), l.src, C.SRC)}</select></label>
      <label class="fld f-reel wide" ${l.src === "ig" ? "" : "hidden"}><span>Какой ролик</span><select name="reel"><option value="">Не знаю или директ</option>${opt(app.db.reels.map((r) => [r.id, `«${r.word}», ${r.title}`]), l.reel)}</select></label>
      <label class="fld wide"><span>ЖК</span><select name="zhk"><option value="">Пока не выбрал</option>${opt(zl.map((z) => [z.id, z.name + (z.where ? ", " + z.where : "")]), l.zhk)}<option value="_other" ${!l.zhk && l.zhkText ? "selected" : ""}>Другой ЖК, напишу сам</option></select></label>
      <label class="fld wide f-zhktext" ${!l.zhk && l.zhkText ? "" : "hidden"}><span>Название ЖК</span><input name="zhkText" value="${esc(l.zhkText)}" placeholder="Например: ЖК «Новое Внуково»"></label>
      <label class="fld"><span>Квартира</span><select name="rooms">${opt(C.ROOMS, l.rooms)}</select></label>
      <label class="fld"><span>Бюджет, млн ₽</span><input name="budget" inputmode="decimal" value="${l.budget ? String(l.budget / 1e6).replace(".", ",") : ""}" placeholder="12,5"></label>
      <label class="fld"><span>Оплата</span><select name="pay">${opt(C.PAY, l.pay)}</select></label>
      <label class="fld"><span>Как получил гайд</span><select name="via">${opt([["tg", "В Telegram"], ["mail", "На почту"], ["", "Не получал"]], l.via || "")}</select></label>
      ${id ? "" : `<label class="fld wide"><span>Заметка</span><textarea name="note" rows="2" placeholder="Что важно запомнить"></textarea></label>
      <fieldset class="fset wide"><legend>Первый шаг</legend><input name="ntext" value="Позвонить и познакомиться"><div class="nrow"><input type="date" name="ndate" value="${dateIn(t)}" aria-label="Дата"><input type="time" name="ntime" value="${hm(t)}" aria-label="Время"></div></fieldset>`}
      </div></div>
      ${app.s.err ? `<p class="err" role="alert">${esc(app.s.err)}${app.s.dup ? ` <button type="button" class="lnk" data-act="openlead" data-arg="${app.s.dup}">Открыть</button>` : ""}</p>` : ""}
      <div class="m-f"><button type="button" class="btn ghost" data-act="modal-close">Отмена</button><button type="button" class="btn gold" data-submit data-act="lead-save">${id ? "Сохранить" : "Добавить клиента"}</button></div></form>`;
  }
  function reelForm(app) {
    const id = app.s.modal.id, r = id ? app.reel(id) : { title: "", word: "", link: "", guide: (app.db.guides.find((g) => g.ready) || {}).id, reply: "Отправила гайд в директ" };
    return `<form class="mform" data-reelform><div class="m-h"><h2>${id ? "Изменить ролик" : "Новый ролик"}</h2><button type="button" class="iconbtn" data-act="modal-close" aria-label="Закрыть">${ic("x")}</button></div>
      <div class="m-b"><p class="m-note">Слово работает только под этим роликом. Бот ответит под комментарием и пришлёт гайд в директ.</p>
      <div class="g2"><label class="fld wide"><span>Ссылка на рилс</span><input name="link" value="${esc(r.link)}" placeholder="https://www.instagram.com/reel/…" autocomplete="off" inputmode="url"></label>
      <label class="fld wide"><span>Название для себя</span><input name="title" value="${esc(r.title)}" placeholder="Например: ипотека для IT" data-autofocus></label>
      <label class="fld"><span>Кодовое слово</span><input name="word" value="${esc(r.word)}" placeholder="ипотека" autocomplete="off" autocapitalize="off"></label>
      <label class="fld"><span>Какой гайд прислать</span><select name="guide">${opt(app.db.guides.filter((g) => g.ready).map((g) => [g.id, g.title]), r.guide)}</select></label>
      <label class="fld wide"><span>Ответ под комментарием</span><input name="reply" value="${esc(r.reply)}"></label></div>
      <p class="m-note">Ссылку можно добавить позже, когда ролик выйдет.</p></div>
      ${app.s.err ? `<p class="err" role="alert">${esc(app.s.err)}</p>` : ""}
      <div class="m-f"><button type="button" class="btn ghost" data-act="modal-close">Отмена</button><button type="button" class="btn gold" data-submit data-act="reel-save">Сохранить ролик</button></div></form>`;
  }
  function guideForm(app) {
    const id = app.s.modal.id, g = id ? app.guide(id) : { title: "", sub: "" };
    return `<form class="mform" data-guideform><div class="m-h"><h2>${id ? "Изменить гайд" : "Загрузить гайд"}</h2><button type="button" class="iconbtn" data-act="modal-close" aria-label="Закрыть">${ic("x")}</button></div>
      <div class="m-b"><div class="g2"><label class="fld wide"><span>Название</span><input name="title" value="${esc(g.title)}" placeholder="Ипотечные программы" data-autofocus></label>
      <label class="fld wide"><span>Подпись на обложке</span><input name="sub" value="${esc(g.sub)}" placeholder="Например: актуально на декабрь"></label>
      <label class="fld wide file"><span>PDF-файл</span><input type="file" accept="application/pdf,.pdf"><b class="btn ghost">${ic("upload")}Выбрать файл</b><em class="f-filename">${g.fileName ? esc(g.fileName) : id ? "Файл не загружен" : "Файл не выбран"}</em></label></div>
      <p class="m-note">Файл хранится в браузере на этом устройстве. После переноса на сервер его будет присылать бот.</p></div>
      ${app.s.err ? `<p class="err" role="alert">${esc(app.s.err)}</p>` : ""}
      <div class="m-f"><button type="button" class="btn ghost" data-act="modal-close">Отмена</button><button type="button" class="btn gold" data-submit data-act="guide-save">${id ? "Сохранить" : "Загрузить"}</button></div></form>`;
  }
  function lostForm(app) {
    const l = app.lead(app.s.modal.id);
    return `<form class="mform small" data-lostform><div class="m-h"><h2>Отказ</h2><button type="button" class="iconbtn" data-act="modal-close" aria-label="Закрыть">${ic("x")}</button></div>
      <div class="m-b"><p class="m-note">${esc(l.name)}. Почему клиент отказался? Это попадёт в статистику.</p>
      <div class="radios">${C.LOST.map((r, i) => `<label class="radio"><input type="radio" name="reason" value="${esc(r)}" ${i === 0 ? "checked" : ""}><span>${esc(r)}</span></label>`).join("")}</div>
      <label class="fld"><span>Комментарий</span><input name="text" placeholder="Например: купила вторичку в Химках"></label></div>
      <div class="m-f"><button type="button" class="btn ghost" data-act="modal-close">Отмена</button><button type="button" class="btn danger-fill" data-submit data-act="lost-save">Отметить отказ</button></div></form>`;
  }
  function modal(app) {
    const m = app.s.modal, phone = app.mode === "phone";
    const body = m.kind === "lead" ? leadForm(app) : m.kind === "reel" ? reelForm(app) : m.kind === "guide" ? guideForm(app) : m.kind === "lost" ? lostForm(app)
      : `<div class="mform small"><div class="m-b"><p class="m-q">${esc(m.text)}</p></div><div class="m-f">${m.yes ? `<button class="btn ghost" data-act="modal-close">Отмена</button><button class="btn danger-fill" data-act="${m.yes}" data-arg="${esc(m.arg || "")}">Да, удалить</button>` : `<button class="btn" data-act="modal-close">Понятно</button>`}</div></div>`;
    return `<div class="mscrim" data-act="modal-close"></div><div class="modal ${phone ? "is-sheet" : ""}" role="dialog" aria-modal="true">${body}</div>`;
  }

  /* ---------- раскладка ---------- */
  function desk(app) {
    const t = app.s.tab, l = app.s.open && app.lead(app.s.open), nNew = app.db.leads.filter((x) => x.stage === "new").length, T = app.today(), n = now();
    const body = t === "leads" ? leadsPage(app) : t === "reels" ? reels(app) : t === "guides" ? guides(app) : t === "stats" ? stats(app) : settings(app);
    return `<aside class="side"><img class="side-bg" src="img/side.jpg" alt="">
        <div class="me"><img src="img/kate.jpg" alt=""><div><b>Екатерина Чукомина</b><span>Недвижимость</span></div></div>
        <nav>${TABS.map(([id, nm, i]) => `<button class="nav ${t === id ? "is-on" : ""}" data-act="tab" data-arg="${id}">${ic(i)}<span>${nm}</span>${id === "leads" && nNew ? `<em>${nNew}</em>` : ""}</button>`).join("")}</nav>
        <div class="today"><h3>Сегодня</h3>${T.slice(0, 6).map((x) => `<button class="td ${C.late(x) ? "is-late" : ""}" data-act="openlead" data-arg="${x.id}"><b>${C.dayDiff(pd(x.next.at)) < 0 ? day(x.next.at).replace(/ .*/, "") : hm(pd(x.next.at))}</b><span>${esc(x.name)}<small>${esc(x.next.text)}</small></span></button>`).join("") || `<p class="muted">Задач на сегодня нет</p>`}${T.length > 6 ? `<p class="more">И ещё ${T.length - 6}</p>` : ""}</div>
        <div class="side-f"><button class="nav ${t === "settings" ? "is-on" : ""}" data-act="tab" data-arg="settings">${ic("gear")}<span>Настройки</span></button><p class="date">${C.WD[n.getDay()][0].toUpperCase() + C.WD[n.getDay()].slice(1)}, ${n.getDate()} ${C.MON[n.getMonth()]}</p></div>
      </aside>
      <main class="main">${body}</main>
      ${l && t === "leads" ? `<div class="scrim" data-act="close"></div><aside class="drawer" role="dialog" aria-label="${esc(l.name)}">${client(app, l)}</aside>` : ""}`;
  }
  function pCard(app, l) {
    return `<article class="pcard" data-act="open" data-arg="${l.id}" tabindex="0"><img src="${zhkImg(l)}" alt="" loading="lazy">
      <div><h4>${esc(l.name)}</h4><p class="kmeta">${esc(zhkName(l))}, ${l.budget ? "до " + money(l.budget) : "бюджет не указан"}</p><div class="krow">${srcChip(app, l)}<span class="pst">${stageName(l.stage)}</span></div>${nextLine(l)}</div></article>`;
  }
  function strip(html) { return html.replace(/^[\s\S]*?<div class="pagebody"[^>]*>/, "").replace(/<\/div>\s*$/, ""); }
  function phone(app) {
    const t = app.s.tab, l = app.s.open && app.lead(app.s.open);
    if (l) return client(app, l, true);
    let head, body;
    if (t === "leads") {
      const list = app.db.leads.filter((x) => (app.s.stage === "all" ? x.stage !== "lost" : x.stage === app.s.stage) && app.match(x)).sort((a, b) => (a.next ? pd(a.next.at) : 9e15) - (b.next ? pd(b.next.at) : 9e15));
      const chips = [["all", "Все", app.db.leads.filter((x) => x.stage !== "lost").length]].concat(STAGES.map((s) => [s.id, s.name, app.db.leads.filter((x) => x.stage === s.id).length]));
      head = `<header class="ptop"><h1>Заявки</h1><div class="ptop-b"><button class="iconbtn" data-act="psearch" aria-label="Поиск">${ic(app.s.psearch ? "x" : "search")}</button><button class="iconbtn" data-act="tab" data-arg="settings" aria-label="Настройки">${ic("gear")}</button><button class="iconbtn gold" data-act="lead-new" aria-label="Новый клиент">${ic("plus")}</button></div></header>
        ${app.s.psearch ? `<label class="search p">${ic("search")}<input data-q data-keepfocus="q" value="${esc(app.s.q)}" placeholder="Имя, телефон или ЖК" aria-label="Поиск"></label>` : ""}
        <div class="chips" data-scroll="chips">${chips.map(([id, n, c]) => `<button class="chip ${app.s.stage === id ? "is-on" : ""}" data-act="filter" data-arg="${id}">${n} <em>${c}</em></button>`).join("")}</div>`;
      body = list.map((x) => pCard(app, x)).join("") || (app.db.leads.length ? `<p class="empty">${app.s.q ? "Никого не нашли" : "На этом этапе пока никого"}</p>` : `<div class="welcome"><h2>Клиентов пока нет</h2><p>Нажмите «+» вверху, чтобы добавить первого.</p></div>`);
    } else if (t === "reels") {
      head = `<header class="ptop"><h1>Ролики</h1><button class="iconbtn gold" data-act="reel-new" aria-label="Добавить ролик">${ic("plus")}</button></header>`;
      body = `<p class="hint">Человек пишет слово под роликом, бот присылает гайд в директ.</p>` + (app.db.reels.map((r) => reelCard(app, r)).join("") || `<div class="welcome"><h2>Роликов пока нет</h2><p>Нажмите «+», чтобы добавить первый.</p></div>`);
    } else if (t === "guides") {
      head = `<header class="ptop"><h1>Гайды</h1><button class="iconbtn gold" data-act="guide-new" aria-label="Загрузить гайд">${ic("plus")}</button></header>`;
      body = `<div class="ggrid">${guideCards(app)}</div>${sendsTable(app)}`;
    } else if (t === "stats") {
      head = `<header class="ptop"><h1>Статистика</h1>${seg(app, "дн.")}</header>`; body = statsBody(app);
    } else {
      head = `<header class="ptop"><button class="iconbtn" data-act="tab" data-arg="leads" aria-label="Назад">${ic("back")}</button><h1>Настройки</h1><span></span></header>`; body = settingsBody(app);
    }
    return `${head}<div class="pbody" data-scroll="p-${t}">${body}</div>
      <nav class="tabbar">${TABS.map(([id, n, i]) => `<button class="${t === id ? "is-on" : ""}" data-act="tab" data-arg="${id}">${ic(i)}<span>${id === "reels" ? "Ролики" : n}</span>${id === "leads" && app.db.leads.some((x) => x.stage === "new") ? `<em>${app.db.leads.filter((x) => x.stage === "new").length}</em>` : ""}</button>`).join("")}</nav>`;
  }

  return { render: (app) => (app.mode === "desk" ? desk(app) : phone(app)), modal };
})();
