#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { io, log } = require("lastejobb");
const pjson = require("./package");

log.info(pjson.name + " v" + pjson.version + ": " + pjson.description);

let kildekart = "polygon_med_undertyper.4326.geojson";
if (process.argv.length > 2) kildekart = process.argv[2];
log.info("Kildekart: " + kildekart);
if (!fs.existsSync(kildekart))
  return log.error("Mangler kildefil " + kildekart);
let levels = 99;
if (process.argv.length > 3) levels = parseInt(process.argv[3]);
log.info("Nesting levels: " + levels);

const subkart = io.readJson(kildekart);
const features = subkart.features;

walkSync("./", levels);

function walkSync(dir, level) {
  log.info(dir);
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
  subkart.features = [];
  features.forEach(f => {
    let koder = f.properties.kode || f.properties.koder;
    if (!Array.isArray(koder)) koder = [koder];
    let kode = finnKode(meta, koder);
    if (!kode) return;

    const f2 = JSON.parse(JSON.stringify(f));
    const props = f2.properties;
    props.kode = kode.split("-").pop();
    subkart.features.push(f2);
  });
  if (subkart.features.length <= 0) return log.warn("Tomt kart for " + dir);

  const kartpath = path.join(dir + "polygon_no_dissolve.4326.geojson");
  log.info("Skriver " + kartpath);
  fs.writeFileSync(kartpath, JSON.stringify(subkart));
}

function finnKode(meta, kartkoder) {
  if (!kartkoder)
    throw new Error("Required property code is missing in " + kildekart);
  for (var kode of kartkoder) {
    for (var barn of meta.barn) {
      if (kode.indexOf(barn.kode) === 0) return barn.kode;
    }
    if (meta.barn.length <= 0 && kode.indexOf(meta.kode) === 0)
      return meta.kode;
  }
  return null;
}
