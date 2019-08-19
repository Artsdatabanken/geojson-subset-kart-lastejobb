#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { io, log } = require("lastejobb");
const pjson = require("./package");

log.info(pjson.name + " v" + pjson.version + ": " + pjson.description);

let kildekart = "polygon_med_undertyper.4326.geojson";
if (process.argv.length > 1) kildekart = process.argv[2];
log.info("Kildekart: " + kildekart);
if (!fs.existsSync(kildekart))
  return log.error("Mangler kildefil " + kildekart);
let levels = 99;
if (process.argv.length > 2) levels = parseInt(process.argv[2]);

walkSync("./", levels);

function walkSync(dir, level) {
  lagSubkart(dir);
  if (level === 0) return;
  let files = fs.readdirSync(dir);
  files.forEach(function(file) {
    const sub = path.join(dir, file);
    if (fs.statSync(sub).isDirectory()) {
      filelist = walkSync(sub + "/", level - 1);
    }
  });
}

function lagSubkart(dir) {
  const metapath = path.join(dir, "metadata.json");
  if (!fs.existsSync(metapath))
    return log.warn("Mangler metadata.json i " + metapath);
  const meta = io.readJson(metapath);
  log.info("Leser " + metapath);
  const subkart = io.readJson(kildekart);
  const allFeatures = subkart.features;
  subkart.features = [];
  allFeatures.forEach(f => {
    const code = finnKode(meta, f.properties.code);
    if (code) {
      f.properties.code = code;
      subkart.features.push(f);
    }
  });
  if (subkart.features.length <= 0) log.warn("Tomt kart for " + dir);
  const kartpath = path.join(dir + "polygon.4326.geojson");
  log.info("Skriver " + kartpath);
  fs.writeFileSync(kartpath, JSON.stringify(subkart));
}

function finnKode(meta, code) {
  if (!code)
    throw new Error("Required property code is missing in " + kildekart);
  for (var barn of meta.barn)
    if (code.indexOf(barn.kode) === 0) return barn.kode;
  if (code.indexOf(meta.kode) === 0) return meta.kode;
  return null;
}
