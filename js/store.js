/* Хранилище CRM.
   Сейчас данные живут в браузере этого устройства: записи — в localStorage, PDF гайдов — в IndexedDB.
   При переносе на сервер меняется только этот файл: те же функции будут ходить в API сервера. */
window.Store = (function () {
  "use strict";
  const KEY = "crm-ekaterina-v1";
  let db = null;
  function read() { try { const s = localStorage.getItem(KEY); return s ? JSON.parse(s) : null; } catch (e) { return null; } }
  function write() { try { localStorage.setItem(KEY, JSON.stringify(db)); return true; } catch (e) { return false; } }
  return {
    /** Все данные: { leads, reels, guides, sends } или null, если на устройстве пусто. */
    load() { db = read(); return db; },
    /** Записать базу целиком (демо-данные, очистка). */
    init(data) { db = data; return write(); },
    /** Сохранить одну запись: kind — leads | reels | guides. */
    put(kind, obj) { const list = db[kind]; const i = list.findIndex((x) => x.id === obj.id); if (i < 0) list.unshift(obj); else list[i] = obj; return write(); },
    remove(kind, id) { db[kind] = db[kind].filter((x) => x.id !== id); return write(); },
    /* файлы гайдов */
    _idb() { return new Promise((res, rej) => { const r = indexedDB.open("crm-ekaterina-files", 1); r.onupgradeneeded = () => r.result.createObjectStore("f"); r.onsuccess = () => res(r.result); r.onerror = () => rej(r.error); }); },
    // Safari не всегда умеет хранить сам файл, поэтому храним его байты и тип
    async putFile(id, blob) { const buf = await blob.arrayBuffer(), rec = { buf, type: blob.type || "application/pdf", name: blob.name || "" }; const d = await this._idb(); return new Promise((res, rej) => { const t = d.transaction("f", "readwrite"); t.objectStore("f").put(rec, id); t.oncomplete = () => res(true); t.onerror = () => rej(t.error); }); },
    async getFile(id) { const d = await this._idb(); return new Promise((res) => { const r = d.transaction("f").objectStore("f").get(id); r.onsuccess = () => { const v = r.result; res(!v ? null : v instanceof Blob ? v : new Blob([v.buf], { type: v.type })); }; r.onerror = () => res(null); }); },
    async delFile(id) { const d = await this._idb(); return new Promise((res) => { const t = d.transaction("f", "readwrite"); t.objectStore("f").delete(id); t.oncomplete = () => res(true); t.onerror = () => res(false); }); },
    async clearFiles() { const d = await this._idb(); return new Promise((res) => { const t = d.transaction("f", "readwrite"); t.objectStore("f").clear(); t.oncomplete = () => res(true); }); },
  };
})();
