// Julmat checklist — GitHub Pages friendly (no build step).
// Data lives in data.json. Status (bockar) lives in localStorage.

const STORAGE_KEY = "julmat_status_v1";
const DATA_URL = "./data.json";

function uidFor(item){
  // Stable ID per item (family + category + name) — good enough for a checklist.
  return `${item.family}__${item.category}__${item.name}`.toLowerCase();
}

function loadStatus(){
  try{
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : {};
  }catch{
    return {};
  }
}

function saveStatus(status){
  localStorage.setItem(STORAGE_KEY, JSON.stringify(status));
}

function pct(done, total){
  if(!total) return 0;
  return Math.round((done / total) * 100);
}

function computeStats(items, status){
  const total = items.length;
  const done = items.filter(it => {
    const s = status[uidFor(it)];
    return s?.bought && s?.cooked;
  }).length;

  return { total, done };
}

function familyStats(items, status, family){
  const famItems = items.filter(i => i.family === family);
  const total = famItems.length;
  const bought = famItems.filter(it => status[uidFor(it)]?.bought).length;
  const cooked = famItems.filter(it => status[uidFor(it)]?.cooked).length;
  const done = famItems.filter(it => status[uidFor(it)]?.bought && status[uidFor(it)]?.cooked).length;
  return { total, bought, cooked, done };
}

function $(id){ return document.getElementById(id); }

function toast(msg){
  // super light "toast" via alert-like but non-blocking
  const el = document.createElement("div");
  el.textContent = msg;
  el.style.position = "fixed";
  el.style.left = "50%";
  el.style.bottom = "18px";
  el.style.transform = "translateX(-50%)";
  el.style.padding = "10px 12px";
  el.style.borderRadius = "12px";
  el.style.border = "1px solid rgba(255,255,255,.16)";
  el.style.background = "rgba(0,0,0,.55)";
  el.style.backdropFilter = "blur(10px)";
  el.style.color = "#fff";
  el.style.zIndex = "999";
  el.style.maxWidth = "92vw";
  el.style.boxShadow = "0 10px 30px rgba(0,0,0,.35)";
  document.body.appendChild(el);
  setTimeout(() => { el.remove(); }, 1600);
}

async function loadData(){
  const res = await fetch(DATA_URL, { cache: "no-store" });
  if(!res.ok) throw new Error(`Kunde inte läsa ${DATA_URL}`);
  return await res.json();
}

function normalizeData(data){
  const families = data.families ?? [];
  const items = (data.items ?? []).map(i => ({
    family: i.family,
    category: i.category ?? "Övrigt",
    name: i.name,
    notes: i.notes ?? "",
  }));
  return { families, items };
}

function buildFilters(families){
  const sel = $("filterFamily");
  sel.innerHTML = `<option value="__all__">Alla</option>`;
  for(const f of families){
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    sel.appendChild(opt);
  }
}

function matchFilters(item, q, family, status, s){
  const hay = `${item.name} ${item.category} ${item.family} ${item.notes}`.toLowerCase();
  if(q && !hay.includes(q)) return false;
  if(family !== "__all__" && item.family !== family) return false;

  const bought = !!s?.bought;
  const cooked = !!s?.cooked;
  const done = bought && cooked;

  if(status === "__all__") return true;
  if(status === "missing") return !done;
  if(status === "bought") return bought;
  if(status === "cooked") return cooked;
  if(status === "done") return done;
  return true;
}

function render({ families, items }, status){
  const q = $("search").value.trim().toLowerCase();
  const famFilter = $("filterFamily").value;
  const statusFilter = $("filterStatus").value;

  // filter view
  const visibleItems = items.filter(it => matchFilters(it, q, famFilter, statusFilter, status[uidFor(it)]));

  // KPIs on *all items* (not only filtered) — feels more useful.
  const { total, done } = computeStats(items, status);
  $("kpiTotal").textContent = String(total);
  $("kpiDone").textContent = String(done);
  $("totalBar").style.width = `${pct(done, total)}%`;

  const root = $("families");
  root.innerHTML = "";

  // If family filter is active, only show that family section.
  const famsToShow = famFilter === "__all__" ? families : [famFilter];

  for(const family of famsToShow){
    const famVisible = visibleItems.filter(i => i.family === family);
    const stats = familyStats(items, status, family);

    // Skip empty sections when searching/filtering
    if(q || statusFilter !== "__all__"){
      if(famVisible.length === 0) continue;
    }

    const details = document.createElement("details");
    details.className = "family";
    details.open = true;

    const summary = document.createElement("summary");
    const title = document.createElement("div");
    title.className = "family-title";
    title.innerHTML = `<strong>${family}</strong><div class="muted small">${stats.done}/${stats.total} klara · ${stats.bought} handlade · ${stats.cooked} lagade</div>`;

    const pills = document.createElement("div");
    pills.className = "pills";

    const p1 = document.createElement("div");
    p1.className = "pill done";
    p1.textContent = `${pct(stats.done, stats.total)}% klart`;

    const p2 = document.createElement("div");
    p2.className = "pill warn";
    p2.textContent = `${famVisible.length} i vyn`;

    pills.appendChild(p1);
    pills.appendChild(p2);

    summary.appendChild(title);
    summary.appendChild(pills);

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "items";

    // sort by category then name for consistency
    const famSorted = [...famVisible].sort((a,b) => {
      const c = a.category.localeCompare(b.category, "sv");
      if(c !== 0) return c;
      return a.name.localeCompare(b.name, "sv");
    });

    for(const it of famSorted){
      const id = uidFor(it);
      const s = status[id] ?? { bought:false, cooked:false };

      const row = document.createElement("div");
      row.className = "tr";

      const left = document.createElement("div");
      left.className = "name";
      left.textContent = it.name;

      const cat = document.createElement("div");
      cat.className = "cat";
      cat.textContent = it.category + (it.notes ? ` · ${it.notes}` : "");

      const bought = document.createElement("label");
      bought.className = "check bought";
      bought.innerHTML = `<input type="checkbox" ${s.bought ? "checked" : ""} /> <span>Handlad</span>`;

      const cooked = document.createElement("label");
      cooked.className = "check cooked";
      cooked.innerHTML = `<input type="checkbox" ${s.cooked ? "checked" : ""} /> <span>Lagad</span>`;

      // events
      bought.querySelector("input").addEventListener("change", (e) => {
        const val = e.target.checked;
        status[id] = { ...(status[id] ?? {}), bought: val, cooked: status[id]?.cooked ?? false };
        saveStatus(status);
        render({ families, items }, status);
      });

      cooked.querySelector("input").addEventListener("change", (e) => {
        const val = e.target.checked;
        status[id] = { ...(status[id] ?? {}), cooked: val, bought: status[id]?.bought ?? false };
        saveStatus(status);
        render({ families, items }, status);
      });

      row.appendChild(left);
      row.appendChild(cat);
      row.appendChild(bought);
      row.appendChild(cooked);

      itemsWrap.appendChild(row);
    }

    details.appendChild(summary);
    details.appendChild(itemsWrap);
    root.appendChild(details);
  }

  if(root.childElementCount === 0){
    const empty = document.createElement("div");
    empty.className = "card";
    empty.innerHTML = `<strong>Inget matchar filtret.</strong><p class="muted">Testa att rensa sök/familj/status.</p>`;
    root.appendChild(empty);
  }
}

function wireGlobalControls(data, status){
  const rerender = () => render(data, status);

  $("search").addEventListener("input", rerender);
  $("filterFamily").addEventListener("change", rerender);
  $("filterStatus").addEventListener("change", rerender);

  $("expandAll").addEventListener("click", () => {
    document.querySelectorAll("details.family").forEach(d => d.open = true);
  });

  $("collapseAll").addEventListener("click", () => {
    document.querySelectorAll("details.family").forEach(d => d.open = false);
  });

  $("reset").addEventListener("click", () => {
    if(!confirm("Nollställa alla bockar? (Listan påverkas inte)")) return;
    localStorage.removeItem(STORAGE_KEY);
    status = loadStatus();
    toast("Nollställt!");
    render(data, status);
    // rewire export/import to new status reference:
    setupIO(data, status);
  });

  setupIO(data, status);
}

function setupIO(data, status){
  const exportBtn = $("exportState");
  const copyBtn = $("copyState");
  const pasteBtn = $("pasteState");
  const importInput = $("importState");

  exportBtn.onclick = () => {
    const payload = { version: 1, createdAt: new Date().toISOString(), status };
    const blob = new Blob([JSON.stringify(payload, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "julmat-status.json";
    document.body.appendChild(a);
    a.click();
    a.remove();
    URL.revokeObjectURL(url);
    toast("Exporterade status.");
  };

  copyBtn.onclick = async () => {
    const payload = { version: 1, createdAt: new Date().toISOString(), status };
    await navigator.clipboard.writeText(JSON.stringify(payload));
    toast("Kopierat!");
  };

  pasteBtn.onclick = async () => {
    const txt = await navigator.clipboard.readText();
    try{
      const payload = JSON.parse(txt);
      if(!payload?.status || typeof payload.status !== "object") throw new Error("Fel format");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.status));
      toast("Importerad (från klippbord).");
      render(data, loadStatus());
    }catch{
      alert("Kunde inte klistra in. Kontrollera att du kopierat JSON från exporten.");
    }
  };

  importInput.onchange = async (e) => {
    const file = e.target.files?.[0];
    if(!file) return;
    try{
      const txt = await file.text();
      const payload = JSON.parse(txt);
      if(!payload?.status || typeof payload.status !== "object") throw new Error("Fel format");
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload.status));
      toast("Importerad status.");
      render(data, loadStatus());
    }catch{
      alert("Kunde inte importera filen. Kontrollera att den är en export från appen.");
    }finally{
      // allow re-import same file
      importInput.value = "";
    }
  };
}

(async function main(){
  const loading = $("loading");
  try{
    const raw = await loadData();
    const data = normalizeData(raw);
    const status = loadStatus();

    buildFilters(data.families);
    loading.remove();

    render(data, status);
    wireGlobalControls(data, status);
  }catch(err){
    loading.textContent = "Kunde inte ladda listan. Kontrollera att data.json finns.";
    console.error(err);
  }
})();
