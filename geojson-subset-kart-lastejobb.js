#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { io, log } = require("lastejobb");
const pjson = require("./package");

const kildekart = "polygon_med_undertyper.4326.geojson";

log.info(pjson.name + " v" + pjson.version + ": " + pjson.description);
if (!fs.existsSync(kildekart))
  return log.error("Mangler kildefil " + kildekart);
walkSync(".");

function walkSync(dir) {
  lagSubkart(dir);
  let files = fs.readdirSync(dir);
  files.forEach(function(file) {
    const sub = path.join(dir, file);
    if (fs.statSync(sub).isDirectory()) {
      filelist = walkSync(sub + "/");
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
    const kode = finnKode(meta, f.kode);
    if (kode) {
      f.kode = kode;
      subkart.features.push(f);
    }
  });
  const kartpath = path.join(dir + "polygon.4326.geojson");
  log.info("Skriver " + kartpath);
  io.writeJson(kartpath, subkart);
}

function finnKode(meta, kode) {
  for (var barn of meta.barn)
    if (kode.indexOf(barn.kode) === 0) return barn.kode;
  if (kode.indexOf(meta.kode) === 0) return meta.kode;
  return null;
}
