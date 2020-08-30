#!/usr/bin/env node
const fs = require("fs");
const path = require("path");
const { io, log } = require("lastejobb");
//const pjson = require("./package");
const readline = require('readline');

//log.info(pjson.name + " v" + pjson.version + ": " + pjson.description);

let kildekart = "polygon_med_undertyper.4326.geojson";
let rootPath = './'
if (process.argv.length > 2) kildekart = process.argv[2];
if (process.argv.length > 3) rootPath = process.argv[3];

log.info("Kildekart: " + kildekart);
if (!fs.existsSync(kildekart))
  return log.error("Mangler kildefil " + kildekart);
let levels = 99;
if (process.argv.length > 3) levels = parseInt(process.argv[3]) || 99;
log.info("Nesting levels: " + levels);

lagSubkart(path.resolve(rootPath));

function makeMap(meta, targetDir) {
  const readInterface = readline.createInterface({
    input: fs.createReadStream(kildekart)
  });

  var subkart = {
    "name": "polygons",
    "title": meta.tittel.nb,
    "created": new Date(),
    "type": "FeatureCollection",
    features: []
  }
  readInterface.on('line', function (line) {
    if (line.length <= 0) return
    const feature = JSON.parse(line)
    const props = feature.properties
    let koder = props.kode || props.koder;
    if (!Array.isArray(koder)) koder = [koder];
    let kode = finnKode(meta, koder);
    if (!kode) return;

    props.kode = kode.split("-").pop();
    subkart.features.push(feature);
  });

  readInterface.on('close', function () {
    if (subkart.features.length <= 0) return log.warn("Tomt kart for " + targetDir);
    const kartpath = path.join(targetDir, "polygon_no_dissolve.4326.geojson");
    log.info("Skriver " + kartpath);
    fs.writeFileSync(kartpath, JSON.stringify(subkart));
  });
}

function lagSubkart(dir) {
  const metapath = path.join(dir, "metadata.json");
  if (!fs.existsSync(metapath))
    return log.warn("Mangler metadata.json i " + metapath);
  const meta = io.readJson(metapath);
  makeMap(meta, dir)
}

function finnKode(meta, kartkoder) {
  if (!kartkoder)
    throw new Error("Required property code is missing in " + kildekart);
  for (var kode of kartkoder) {
    for (var barn of meta.barn)
      if (kode.indexOf(barn.kode) === 0)
        return barn.kode;
    if (meta.barn.length <= 0 && kode.indexOf(meta.kode) === 0) {
      return meta.kode;
    }
  }
}