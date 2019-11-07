# Geojson-subset-kart-lastejobb

Leser GeoJSON kartfil med alle typer og splitter denne opp i GeoJSON filer for hver underkatalog hvor typer som ikke hører med er filtrert bort.

Avhengig av kildekartet inneholder en property med navn `kode` på hver GeoJSON feature. Denne korreleres mot innhold i metadata.json fil som forventes å eksistere i underkatalogene.

## Avhengigheter i nåværende katalog

- polygon_med_undertyper.4326.geojson - Kartfil med geometri for undernivåene
- metadata.json - i hver underkatalog

## Bruk

```
cd katalog
npx geojson-subset-kart-lastejobb
```

## Resultat

Gir en `polygon.4326.geojson` kartfil i hver underkatalog med de geometrier som hører til denne katalogen.

## Dissolve

ogr2ogr polygon.4326.geojson polygon_no_dissolve.4326.geojson -dialect sqlite -sql "SELECT ST_Union(geometry), kode FROM myr GROUP BY kode"
