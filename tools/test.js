// Автотест прототипа в WebKit (движок Safari): node tools/test.js
const { webkit } = require(process.env.HOME + "/Desktop/Клод/ZELDO/исходники/jt/node_modules/playwright-core");
const http = require("http"), fs = require("fs"), path = require("path");
const ROOT = path.resolve(__dirname, ".."), SH = path.join(__dirname, "shots");
const TYPES = { ".html": "text/html; charset=utf-8", ".js": "text/javascript", ".css": "text/css", ".jpg": "image/jpeg", ".png": "image/png", ".webp": "image/webp", ".woff2": "font/woff2", ".webmanifest": "application/manifest+json" };
const srv = http.createServer((q, r) => { let p = decodeURIComponent(q.url.split("?")[0]); if (p.endsWith("/")) p += "index.html"; const f = path.join(ROOT, p); if (!fs.existsSync(f)) { r.writeHead(404); return r.end(); } r.writeHead(200, { "Content-Type": TYPES[path.extname(f)] || "application/octet-stream" }); fs.createReadStream(f).pipe(r); }).listen(0);
const URL0 = `http://127.0.0.1:${srv.address().port}/`;
let fails = 0; const ok = (c, m) => { console.log((c ? "✓ " : "✗ ") + m); if (!c) fails++; };
const PDF = Buffer.from("%PDF-1.4\n1 0 obj<</Type/Catalog/Pages 2 0 R>>endobj 2 0 obj<</Type/Pages/Kids[3 0 R]/Count 1>>endobj 3 0 obj<</Type/Page/Parent 2 0 R/MediaBox[0 0 200 200]>>endobj\ntrailer<</Root 1 0 R>>\n%%EOF");
(async () => {
  const b = await webkit.launch({ executablePath: process.env.HOME + "/Library/Caches/ms-playwright/webkit-2370/pw_run.sh" });
  for (const [mode, vp] of [["desk", { width: 1512, height: 795 }], ["phone", { width: 390, height: 760 }]]) {
    console.log("\n== " + mode);
    const ctx = await b.newContext({ viewport: vp, acceptDownloads: true, hasTouch: mode === "phone", isMobile: false });
    const pg = await ctx.newPage(); const errs = [];
    pg.on("pageerror", (e) => errs.push(e.message)); pg.on("console", (m) => m.type() === "error" && errs.push(m.text()));
    await pg.goto(URL0); await pg.waitForTimeout(800);
    const shot = (n) => pg.screenshot({ path: path.join(SH, `${mode}-${n}.png`) });
    const W = (ms) => pg.waitForTimeout(ms || 250);
    await shot("01-leads");
    ok(await pg.locator(mode === "desk" ? ".kcard" : ".pcard").count() >= 10, "демо-клиенты на месте");
    // новый клиент
    await pg.click(mode === "desk" ? ".pagehead [data-act=lead-new]" : ".ptop [data-act=lead-new]"); await W();
    await shot("02-form");
    await pg.fill("[data-leadform] [name=name]", "Тест Тестов"); await pg.fill("[data-leadform] [name=ph]", "8 (916) 123-45-67");
    await pg.selectOption("[data-leadform] [name=src]", "tg"); ok(await pg.locator(".f-reel").isHidden(), "поле «Какой ролик» скрыто для Telegram");
    await pg.selectOption("[data-leadform] [name=zhk]", "luchi"); await pg.fill("[data-leadform] [name=budget]", "11,5"); await pg.selectOption("[data-leadform] [name=via]", "tg");
    await pg.click("[data-act=lead-save]"); await W(400);
    ok(await pg.locator(".cl-n h2", { hasText: "Тест Тестов" }).count() === 1, "клиент добавлен и открыт");
    ok((await pg.locator(".contacts a").first().getAttribute("href")) === "tel:+79161234567", "телефон приведён к виду +7 и звонит");
    ok(await pg.locator(".via", { hasText: "в Telegram" }).count() === 1, "отмечено, что гайд получен в Telegram");
    await shot("03-client");
    // задача: готово → что дальше
    await pg.click(".task [data-act=done]"); await W();
    ok(await pg.locator("[data-nextform]").count() === 1, "после «Готово» открылся «Что дальше?»");
    await pg.click("[data-act=quick][data-arg='Показ в ЖК']"); await pg.click("[data-act=next-save]"); await W();
    ok(await pg.locator(".task-t", { hasText: "Показ в ЖК" }).count() === 1, "следующий шаг сохранён");
    // этап и отказ
    await pg.click(".steps [data-arg=call]"); await W();
    ok(await pg.locator(".cl-n p", { hasText: "Звонок" }).count() === 1, "этап сменился на «Звонок»");
    await pg.click(".steps [data-arg=lost]"); await W();
    await pg.click(".radio:has-text('Не подошла цена')"); await pg.fill("[data-lostform] [name=text]", "Дорого"); await pg.click("[data-act=lost-save]"); await W();
    ok(await pg.locator(".cl-n p", { hasText: "Отказ" }).count() === 1, "отказ с причиной");
    // заметка
    await pg.fill("[data-note]", "Проверочная заметка"); await pg.click("[data-act=note]"); await W();
    ok(await pg.locator(".noteitem", { hasText: "Проверочная заметка" }).count() === 1, "заметка сохранена");
    await pg.click("[data-act=close]"); await W();
    // повтор номера
    await pg.click(mode === "desk" ? ".pagehead [data-act=lead-new]" : ".ptop [data-act=lead-new]"); await W();
    await pg.fill("[data-leadform] [name=name]", "Дубль"); await pg.fill("[data-leadform] [name=ph]", "+7 915 204-18-73"); await pg.click("[data-act=lead-save]"); await W();
    ok(await pg.locator(".err", { hasText: "Анна Морозова" }).count() === 1, "повторный номер пойман");
    await shot("04-dup");
    await pg.click(".m-f [data-act=modal-close]"); await W();
    // ролик
    await pg.click(`[data-act=tab][data-arg=reels]`); await W();
    await pg.click(mode === "desk" ? ".pagehead [data-act=reel-new]" : ".ptop [data-act=reel-new]"); await W();
    await pg.fill("[data-reelform] [name=word]", "две слова"); await pg.click("[data-act=reel-save]"); await W();
    ok(await pg.locator(".err", { hasText: "одно слово" }).count() === 1, "слово с пробелом не пропускает");
    await pg.fill("[data-reelform] [name=word]", "Проверка"); await pg.fill("[data-reelform] [name=title]", "Тестовый ролик"); await pg.click("[data-act=reel-save]"); await W();
    ok(await pg.locator(".rcard .word", { hasText: "«проверка»" }).count() === 1, "ролик добавлен, слово в нижнем регистре");
    await shot("05-reels");
    // гайд
    await pg.click(`[data-act=tab][data-arg=guides]`); await W();
    await pg.click(mode === "desk" ? ".pagehead [data-act=guide-new]" : ".ptop [data-act=guide-new]"); await W();
    await pg.fill("[data-guideform] [name=title]", "Тестовый гайд");
    // выбор файла: в WebKit setInputFiles для такого поля зависает, кладём файл так же, как это делает окно выбора
    await pg.evaluate((b64) => { const bin = Uint8Array.from(atob(b64), (c) => c.charCodeAt(0)); const dt = new DataTransfer(); dt.items.add(new File([bin], "test.pdf", { type: "application/pdf" }));
      const i = document.querySelector("[data-guideform] input[type=file]"); i.files = dt.files; i.dispatchEvent(new Event("change", { bubbles: true })); }, PDF.toString("base64"));
    ok((await pg.locator(".f-filename").innerText()) === "test.pdf", "имя выбранного файла видно в форме");
    await pg.click("[data-act=guide-save]"); await W(600);
    const href = await pg.locator(".gcard", { hasText: "Тестовый гайд" }).locator("a").first().getAttribute("href").catch(() => null);
    ok(href && href.startsWith("blob:"), "PDF загружен и открывается");
    await shot("06-guides");
    // перезагрузка
    await pg.reload(); await W(900);
    await pg.click(`[data-act=tab][data-arg=guides]`); await W(500);
    const href2 = await pg.locator(".gcard", { hasText: "Тестовый гайд" }).locator("a").first().getAttribute("href").catch(() => null);
    ok(href2 && href2.startsWith("blob:"), "после перезагрузки PDF на месте");
    await pg.click(`[data-act=tab][data-arg=leads]`); await W();
    if (mode === "desk") { await pg.click("[data-act=lostcol]"); await W(); ok(await pg.locator("[data-col=lost] .kcard", { hasText: "Тест Тестов" }).count() === 1, "после перезагрузки клиент на месте, в отказах"); }
    else { await pg.click(".chip[data-arg=lost]"); await W(); ok(await pg.locator(".pcard", { hasText: "Тест Тестов" }).count() === 1, "после перезагрузки клиент на месте, в отказах"); }
    // остальные экраны
    for (const t of ["stats"]) { await pg.click(`[data-act=tab][data-arg=${t}]`); await W(); await shot("07-" + t); }
    if (mode === "desk") await pg.click(".side-f [data-act=tab]"); else { await pg.click(`[data-act=tab][data-arg=leads]`); await W(); await pg.click(".ptop [data-arg=settings]"); }
    await W(); await shot("08-settings");
    const [dl] = await Promise.all([pg.waitForEvent("download", { timeout: 5000 }).catch(() => null), pg.click("[data-act=export]")]);
    ok(dl && /Клиенты .*\.csv/.test(dl.suggestedFilename()), "таблица скачивается: " + (dl ? dl.suggestedFilename() : "нет"));
    if (dl) { const p = await dl.path(); const txt = fs.readFileSync(p, "utf8"); ok(txt.includes("Тест Тестов") && txt.includes("Отказ") && txt.includes("Гайд получил"), "в таблице есть новый клиент и как он получил гайд"); }
    // вид клиента и доска для снимков
    await pg.click(`[data-act=tab][data-arg=leads]`); await W();
    if (mode === "desk") await pg.click("[data-act=lostcol]");
    await pg.click(mode === "desk" ? ".kcard >> nth=0" : ".chip[data-arg=all]"); await W();
    if (mode === "phone") { await pg.click(".pcard >> nth=0"); await W(); }
    await shot("09-client-demo");
    // переполнение по ширине
    const over = await pg.evaluate(() => [...document.querySelectorAll("#app *")].filter((e) => { const r = e.getBoundingClientRect(); return r.width && r.right > innerWidth + 1 && !e.closest(".board,.chips,.tbl,.col-list"); }).slice(0, 5).map((e) => e.className || e.tagName));
    ok(!over.length, "ничего не вылезает за край экрана " + (over.length ? JSON.stringify(over) : ""));
    ok(!errs.length, "ошибок в консоли нет " + (errs.length ? JSON.stringify(errs.slice(0, 3)) : ""));
    await ctx.close();
  }
  await b.close(); srv.close();
  console.log(fails ? `\nНЕ ПРОШЛО: ${fails}` : "\nВсё прошло");
  process.exit(fails ? 1 : 0);
})();
