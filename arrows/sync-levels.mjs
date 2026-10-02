import fs from "fs";

const APP_JSON =
  "D:/00. Own Work (Android)/Work with Usama/2. TripleEdge Studio/arrow-game/app/src/main/assets/levels.json";
const PLAY_HTML =
  "d:/00. Own Work (Android)/Work with Usama/2. TripleEdge Studio/1. tripleedge-studio-website/web2/arrows/play.html";

const app = JSON.parse(fs.readFileSync(APP_JSON, "utf8"));
let html = fs.readFileSync(PLAY_HTML, "utf8");

const marker = "const LEVEL_PACK=";
const start = html.indexOf(marker);
if (start < 0) throw new Error("LEVEL_PACK not found");

const after = start + marker.length;
const end = html.indexOf("\nfunction random(seed)", after);
if (end < 0) throw new Error("LEVEL_PACK end not found");

let packJson = html.slice(after, end).trim();
if (packJson.endsWith(";")) packJson = packJson.slice(0, -1);
const oldPack = JSON.parse(packJson);

function packFromApp(level) {
  const arrows = level.arrows.map((a) => ({
    cells: a.cells,
    d: a.d,
    id: a.id,
  }));
  const out = { n: level.n, arrows };
  if (level.metrics) {
    out.metrics = level.metrics;
  }
  return out;
}

const newPack = app.levels.map(packFromApp);

function arrowsKey(level) {
  return JSON.stringify(
    level.arrows.map((a) => ({ cells: a.cells, d: a.d, id: a.id }))
  );
}

let mismatches = 0;
for (let i = 0; i < app.levels.length; i++) {
  if (
    app.levels[i].n !== oldPack[i]?.n ||
    arrowsKey(app.levels[i]) !== arrowsKey(oldPack[i] || { arrows: [] })
  ) {
    mismatches++;
  }
}

const newJson = JSON.stringify(newPack);
html =
  html.slice(0, after) + newJson + html.slice(end);
fs.writeFileSync(PLAY_HTML, html);

console.log(
  JSON.stringify({
    levels: newPack.length,
    mismatchesBeforeSync: mismatches,
    synced: mismatches > 0,
  })
);
