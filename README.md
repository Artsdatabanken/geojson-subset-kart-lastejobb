# Geojson-subset-kart-lastejobb

Leser GeoJSON kartfil med alle typer og splitter denne opp i GeoJSON filer for hver underkatalog hvor typer som ikke hører med er filtrert bort.

Avhengig av kildekartet inneholder en property med navn ```kode``` på hver GeoJSON feature. Denne korreleres mot innhold i metadata.json fil som forventes å eksistere i underkatalogene.
