// Read-only Julmat list — GitHub Pages friendly (no build step).
// Data lives in data.json.

const DATA_URL = "./data.json";
function $(id){ return document.getElementById(id); }

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

function buildFamilyFilter(families){
  const sel = $("filterFamily");
  sel.innerHTML = `<option value="__all__">Alla</option>`;
  for(const f of families){
    const opt = document.createElement("option");
    opt.value = f;
    opt.textContent = f;
    sel.appendChild(opt);
  }
}

function buildCategoryFilter(items){
  const sel = $("filterCategory");
  const cats = [...new Set(items.map(i => i.category))].sort((a,b)=>a.localeCompare(b,"sv"));
  sel.innerHTML = `<option value="__all__">Alla</option>`;
  for(const c of cats){
    const opt = document.createElement("option");
    opt.value = c;
    opt.textContent = c;
    sel.appendChild(opt);
  }
}

function matchFilters(item, q, family, category){
  const hay = `${item.name} ${item.category} ${item.family} ${item.notes}`.toLowerCase();
  if(q && !hay.includes(q)) return false;
  if(family !== "__all__" && item.family !== family) return false;
  if(category !== "__all__" && item.category !== category) return false;
  return true;
}

function render({ families, items }){
  const q = $("search").value.trim().toLowerCase();
  const famFilter = $("filterFamily").value;
  const catFilter = $("filterCategory").value;

  const visibleItems = items.filter(it => matchFilters(it, q, famFilter, catFilter));

  const root = $("families");
  root.innerHTML = "";

  const famsToShow = famFilter === "__all__" ? families : [famFilter];

  for(const family of famsToShow){
    const famVisible = visibleItems.filter(i => i.family === family);

    if(q || catFilter !== "__all__"){
      if(famVisible.length === 0) continue;
    }

    const details = document.createElement("details");
    details.className = "family";
    details.open = true;

    const summary = document.createElement("summary");
    const title = document.createElement("div");
    title.className = "family-title";
    title.innerHTML = `<strong>${family}</strong><div class="muted small">${famVisible.length} rätter i vyn</div>`;
    summary.appendChild(title);

    const itemsWrap = document.createElement("div");
    itemsWrap.className = "items";

    const famSorted = [...famVisible].sort((a,b) => {
      const c = a.category.localeCompare(b.category, "sv");
      if(c !== 0) return c;
      return a.name.localeCompare(b.name, "sv");
    });

    for(const it of famSorted){
      const row = document.createElement("div");
      row.className = "tr";

      const left = document.createElement("div");
      left.className = "name";
      left.textContent = it.name;

      const cat = document.createElement("div");
      cat.className = "cat";
      cat.textContent = it.category + (it.notes ? ` · ${it.notes}` : "");

      row.appendChild(left);
      row.appendChild(cat);
      itemsWrap.appendChild(row);
    }

    details.appendChild(summary);
    details.appendChild(itemsWrap);
    root.appendChild(details);
  }

  if(root.childElementCount === 0){
    const empty = document.createElement("div");
    empty.style.margin = "18px 0";
    empty.style.padding = "16px";
    empty.style.border = "1px solid rgba(255,255,255,.12)";
    empty.style.borderRadius = "16px";
    empty.style.background = "rgba(255,255,255,.05)";
    empty.innerHTML = `<strong>Inget matchar filtret.</strong><p class="muted">Testa att rensa sök/familj/kategori.</p>`;
    root.appendChild(empty);
  }
}

function wireControls(data){
  const rerender = () => render(data);
  $("search").addEventListener("input", rerender);
  $("filterFamily").addEventListener("change", rerender);
  $("filterCategory").addEventListener("change", rerender);

  $("expandAll").addEventListener("click", () => {
    document.querySelectorAll("details.family").forEach(d => d.open = true);
  });
  $("collapseAll").addEventListener("click", () => {
    document.querySelectorAll("details.family").forEach(d => d.open = false);
  });
}

(async function main(){
  const loading = $("loading");
  try{
    const raw = await loadData();
    const data = normalizeData(raw);

    buildFamilyFilter(data.families);
    buildCategoryFilter(data.items);

    loading.remove();
    render(data);
    wireControls(data);
  }catch(err){
    loading.textContent = "Kunde inte ladda listan. Kontrollera att data.json finns.";
    console.error(err);
  }
})();
