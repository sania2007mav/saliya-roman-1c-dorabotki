async function load() {
  const res = await fetch("./features.json", { cache: "no-store" });
  if (!res.ok) throw new Error("Не удалось загрузить features.json");
  return res.json();
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text != null) node.textContent = text;
  return node;
}

function renderBases(bases) {
  const grid = document.getElementById("bases-grid");
  grid.replaceChildren();
  for (const base of bases) {
    const card = el("article", `base-card ${base.color}`);
    card.append(el("h3", null, base.name));
    card.append(el("p", "aliases", base.aliases.join(" · ")));
    const dl = el("dl", "base-meta");
    const rows = [
      ["Тип", base.type],
      ["Платформа", base.platform],
      ["Расширение", base.extension],
    ];
    for (const [k, v] of rows) {
      dl.append(el("dt", null, k), el("dd", null, v));
    }
    card.append(dl);
    grid.append(card);
  }
}

function renderFeatures(data) {
  const list = document.getElementById("features-list");
  const baseMap = Object.fromEntries(data.bases.map((b) => [b.id, b]));
  list.replaceChildren();

  for (const feature of data.features) {
    const base = baseMap[feature.base];
    const card = el("article", "feature");
    card.dataset.base = feature.base;

    const top = el("div", "feature-top");
    top.append(el("h3", null, feature.title));
    top.append(el("span", "tag", feature.tag));
    top.append(el("span", `base-pill ${base.color}`, base.name));
    card.append(top);

    card.append(el("p", "purpose", feature.purpose));

    const cols = el("div", "cols");
    const done = el("div", "block");
    done.append(el("h4", null, "Что сделано"));
    const ul = el("ul");
    for (const item of feature.done) ul.append(el("li", null, item));
    done.append(ul);

    const how = el("div", "block");
    how.append(el("h4", null, "Как работает"));
    how.append(el("p", "how", feature.how));

    cols.append(done, how);
    card.append(cols);
    list.append(card);
  }
}

function bindFilters() {
  const buttons = [...document.querySelectorAll(".filter")];
  buttons.forEach((btn) => {
    btn.addEventListener("click", () => {
      buttons.forEach((b) => b.classList.toggle("is-active", b === btn));
      const key = btn.dataset.base;
      document.querySelectorAll(".feature").forEach((card) => {
        card.hidden = key !== "all" && card.dataset.base !== key;
      });
    });
  });
}

load()
  .then((data) => {
    document.getElementById("project-title").textContent = data.project.title;
    document.getElementById("project-subtitle").textContent = data.project.subtitle;
    document.getElementById("updated-chip").textContent = `Обновлено ${data.project.updated}`;
    document.title = data.project.title;
    renderBases(data.bases);
    renderFeatures(data);
    bindFilters();
  })
  .catch((err) => {
    document.querySelector(".lede").textContent = String(err);
  });
