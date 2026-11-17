/* Демо-данные для показа. Даты считаются от сегодняшнего дня, чтобы прототип всегда выглядел живым.
   Клиенты и цифры выдуманы. */
window.Demo = (function () {
  "use strict";
  const pad = (n) => String(n).padStart(2, "0");
  function at(now, dd, t) {
    const [h, m] = t.split(":").map(Number);
    const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dd, h, m);
    if (dd === 0 && d > now && !t.endsWith("!")) d.setTime(now.getTime() - 20 * 6e4);
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
  }
  function make(now) {
    const A = (dd, t) => at(now, dd, t);
    const N = (dd, t, text) => { const [h, m] = t.split(":").map(Number); const d = new Date(now.getFullYear(), now.getMonth(), now.getDate() + dd, h, m); return { at: `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(h)}:${pad(m)}`, text }; };
    const reels = [
      { id: "r1", title: "Семейная ипотека с 1 октября: что изменилось", word: "ипотека", guide: "g-ipoteka", link: "https://www.instagram.com/reel/demo1/", date: A(-14, "19:00"), views: 18400, comments: 214, sent: 168, on: true, img: "img/reel-1.jpg", reply: "Отправила гайд в директ" },
      { id: "r2", title: "Три ошибки при покупке новостройки", word: "ошибки", guide: "g-buy", link: "https://www.instagram.com/reel/demo2/", date: A(-21, "19:00"), views: 9700, comments: 131, sent: 96, on: true, img: "img/reel-2.jpg", reply: "Отправила гайд в директ" },
      { id: "r3", title: "Закрытые предложения месяца", word: "скидка", guide: "g-ipoteka", link: "https://www.instagram.com/reel/demo3/", date: A(-7, "19:00"), views: 7200, comments: 88, sent: 73, on: true, img: "img/reel-3.jpg", reply: "Отправила гайд в директ" },
      { id: "r4", title: "Студия для сдачи: считаю доходность", word: "инвест", guide: "g-invest", link: "https://www.instagram.com/reel/demo4/", date: A(-3, "19:00"), views: 3900, comments: 46, sent: 39, on: true, img: "img/reel-4.jpg", reply: "Отправила гайд в директ" },
      { id: "r5", title: "Рассрочка или ипотека: что выгоднее", word: "рассрочка", guide: "g-ipoteka", link: "", date: N(2, "19:00").at, views: 0, comments: 0, sent: 0, on: true, img: "img/reel-5.jpg", reply: "Отправила гайд в директ", soon: true },
    ];
    const guides = [
      { id: "g-ipoteka", title: "Ипотечные программы", sub: "Актуально на ноябрь 2026", pages: 8, sent: 241, upd: A(0, "08:00"), cover: "img/g-ipoteka.jpg", file: false, ready: true },
      { id: "g-buy", title: "Как купить новостройку и не переплатить", sub: "Чек-лист", pages: 7, sent: 96, upd: A(-21, "12:00"), cover: "img/g-buy.jpg", file: false, ready: true },
      { id: "g-invest", title: "Инвестиции в новостройки: три стратегии", sub: "Для инвесторов", pages: 9, sent: 39, upd: A(-3, "12:00"), cover: "img/g-invest.jpg", file: false, ready: true },
      { id: "g-trade", title: "Как продать старую квартиру и купить новую", sub: "Черновик", pages: 0, sent: 0, upd: A(-1, "12:00"), cover: "img/g-trade.jpg", file: false, ready: false },
    ];
    // g: f — она, m — он, p — пара
    const raw = [
      ["Анна Морозова", "f", "+7 915 204-18-73", "anna_mrz", "ig", "r1", "new", "prokshino", "2-комнатная", 14e6, "Семейная ипотека", "Один ребёнок, 3 года. Первый взнос есть, около 3 млн.", [0, "09:42"], N(0, "12:00", "Позвонить и познакомиться")],
      ["Дмитрий Соколов", "m", "+7 926 331-50-02", "dsokolov", "tg", "", "new", "zilart", "1-комнатная", 12e6, "Рыночная ипотека", "", [0, "08:15"], N(0, "13:30", "Позвонить и познакомиться")],
      ["Ольга и Павел Кравец", "p", "+7 903 718-44-61", "", "quiz", "", "new", "skandinaviya", "3-комнатная", 15e6, "Семейная ипотека", "Двое детей. В подборе отметили школу рядом.", [-1, "21:30"], N(0, "16:00", "Позвонить и познакомиться")],
      ["Артём Борисов", "m", "+7 977 640-12-35", "a_borisov", "tg", "", "new", "bereg", "1-комнатная", 9e6, "IT-ипотека", "Работает в аккредитованной IT-компании. В Москве IT-ипотека не действует, смотрим Подмосковье.", [-1, "18:05"], N(1, "11:00", "Позвонить и познакомиться")],
      ["Ирина Белова", "f", "+7 916 925-37-80", "irina_belova", "ig", "r2", "work", "kvartal-mons", "Студия", 11e6, "100 % оплата", "Покупает для сдачи в аренду. Важен срок сдачи дома.", [-3, "19:20"], N(0, "15:00", "Отправить подборку из трёх ЖК")],
      ["Галина Сергеева", "f", "+7 985 117-03-29", "", "ig", "r4", "work", "shagal", "Студия", 13e6, "100 % оплата", "Вторая квартира, под аренду.", [-2, "10:12"], N(1, "12:00", "Посчитать доходность по двум ЖК")],
      ["Сергей Литвинов", "m", "+7 925 402-66-14", "", "form", "", "work", "dmitrovskoe-nebo", "2-комнатная", 18e6, "Рыночная ипотека", "", [-5, "14:48"], N(1, "10:00", "Отправить расчёт платежа")],
      ["Марина Ефимова", "f", "+7 909 553-21-07", "marina_ef", "ig", "r1", "call", "yuzhnye-sady", "2-комнатная", 10e6, "Семейная ипотека", "Ждёт одобрения в банке. Ребёнку 5 лет.", [-12, "20:31"], N(0, "17:30", "Созвониться по одобрению")],
      ["Алексей Гусев", "m", "+7 903 280-90-45", "", "ref", "", "call", "upside-towers", "3-комнатная", 45e6, "100 % оплата", "Пришёл от Татьяны Киселёвой.", [-8, "12:00"], N(2, "18:00", "Обсудить закрытые лоты")],
      ["Наталья Орлова", "f", "+7 916 701-48-52", "n_orlova", "tg", "", "meet", "shagal", "2-комнатная", 22e6, "Рассрочка", "", [-15, "11:40"], N(1, "14:00", "Показ в ЖК Shagal")],
      ["Константин и Юлия Зайцевы", "p", "+7 926 845-13-90", "zaitsevy", "ig", "r3", "meet", "foriver", "2-комнатная", 19e6, "Семейная ипотека", "Взнос 50 % после продажи старой квартиры — ставка до 6 %.", [-7, "22:14"], N(0, "19:00", "Встреча в офисе продаж")],
      ["Елена Фомина", "f", "+7 977 302-75-18", "", "quiz", "", "book", "luchi", "1-комнатная", 11.5e6, "Семейная ипотека", "", [-20, "16:22"], N(4, "12:00", "Подписать ДДУ")],
      ["Виктор Наумов", "m", "+7 915 660-02-93", "v_naumov", "ig", "r1", "book", "sydney-city", "2-комнатная", 38e6, "Рыночная ипотека", "Бронь действует неделю.", [-13, "09:05"], N(2, "11:00", "Получить решение банка")],
      ["Татьяна Киселёва", "f", "+7 903 118-27-64", "", "ref", "", "deal", "bereg", "2-комнатная", 9.8e6, "Семейная ипотека", "Сделка закрыта. Порекомендовала Алексея Гусева.", [-28, "13:00"], null],
      ["Роман Данилов", "m", "+7 925 994-50-31", "", "form", "", "deal", "dom-a", "2-комнатная", 31e6, "100 % оплата", "Сделка закрыта.", [-33, "17:45"], null],
      ["Ксения Полякова", "f", "+7 909 274-81-66", "", "ig", "r2", "lost", "kvartal-mons", "1-комнатная", 12e6, "Рыночная ипотека", "", [-19, "21:10"], null],
    ];
    const ORDER = ["new", "work", "call", "meet", "book", "deal"], NAMES = { new: "Новая", work: "В работе", call: "Звонок", meet: "Встреча", book: "Бронь", deal: "Сделка" };
    const leads = raw.map((r, i) => {
      const [name, g, ph, tgu, src, reel, stage, zhk, rooms, budget, pay, note, [dd, t], next] = r;
      const created = A(dd, t), v = (f, m, p) => (g === "f" ? f : g === "p" ? p : m), rr = reels.find((x) => x.id === reel);
      const hist = [];
      if (rr) { hist.push({ at: created, text: `${v("Написала", "Написал", "Написали")} «${rr.word}» под роликом «${rr.title}»` }); hist.push({ at: created, text: `Бот прислал гайд «${guides.find((x) => x.id === rr.guide).title}»` }); hist.push({ at: created, text: `${v("Оставила", "Оставил", "Оставили")} телефон в боте` }); }
      else hist.push({ at: created, text: { tg: `${v("Пришла", "Пришёл", "Пришли")} из Telegram-канала`, quiz: `${v("Прошла", "Прошёл", "Прошли")} подбор квартиры на сайте`, form: `${v("Оставила", "Оставил", "Оставили")} заявку на сайте`, ref: "Контакт передан по рекомендации", ig: "Написали в Instagram" }[src] });
      const idx = ORDER.indexOf(stage);
      for (let k = 1; k <= idx; k++) { const day = Math.min(dd + k * 2, -1 - (idx - k)); hist.push({ at: A(day, `${10 + ((k * 3 + i) % 8)}:${pad((i * 7 + k * 13) % 60)}`), text: "Этап: " + NAMES[ORDER[k]] }); }
      if (stage === "lost") hist.push({ at: A(dd + 6, "15:20"), text: "Отказ: купила вторичку" });
      return { id: "d" + (i + 1), name, ph, tgu, src, reel, stage, zhk, zhkText: "", rooms, budget, pay, at: created, next, notes: note ? [{ at: created, text: note }] : [], hist, lost: stage === "lost" ? { reason: "Купил в другом месте", text: "Купила вторичку" } : null };
    });
    const sends = [
      [0, "10:47", "@marina.koval", "g-ipoteka", "Telegram", "ипотека", ""], [0, "10:20", "@sasha_dmitriev", "g-invest", "Telegram", "инвест", ""],
      [0, "09:42", "Анна Морозова", "g-ipoteka", "Telegram", "ипотека", "d1"], [0, "08:15", "Дмитрий Соколов", "g-ipoteka", "Telegram", "", "d2"],
      [-1, "23:18", "@lena_vershinina", "g-ipoteka", "Почта", "скидка", ""], [-1, "21:30", "Ольга и Павел Кравец", "g-ipoteka", "Почта", "", "d3"], [-1, "20:05", "@k.romanov", "g-buy", "Telegram", "ошибки", ""],
    ].map(([dd, t, who, guide, via, word, lead]) => ({ at: A(dd, t), who, guide, via, word, lead }));
    return { v: 1, demo: true, leads, reels, guides, sends };
  }
  return { make };
})();
