# Pivot-Tabellen (Mehrdimensionale Analyse)

Mit **Pivot-Tabellen** können Sie große Datenmengen flexibel gruppieren und über verschiedene Dimensionen hinweg analysieren (z. B. Umsatz pro Kunde und pro Jahr).

## Funktionen

- **Zeilengruppierung**: Fügen Sie mehrere Felder hinzu, um Daten hierarchisch in Zeilen zu gruppieren.
- **Spalten**: Verteilen Sie Dimensionen auf die horizontale Achse (z. B. Zeiträume).
- **Kennzahlen (Measures)**: Definieren Sie Berechnungen wie Summe, Anzahl, Durchschnitt, Minimum oder Maximum für Ihre Werte.
- **Sticky Headers**: Die Tabellenköpfe bleiben beim Scrollen fixiert.

## Konfiguration

1. Führen Sie eine Abfrage im **Query Builder** aus.
2. Wählen Sie den Visualisierungstyp **Pivot** aus der Liste der Graphen.
3. Wechseln Sie zum Reiter **Graph (Settings)**:
   - **Pivot Rows**: Wählen Sie ein oder mehrere Felder für die Zeilenbeschriftung.
   - **Pivot Columns**: Wählen Sie Felder für die Spalten (optional).
   - **Measures**: Fügen Sie Wertefelder hinzu und wählen Sie die Aggregationsfunktion (z. B. `Summe` für Beträge).

## Tipps
- Verwenden Sie **Pivot Rows** für die primäre Gruppierung (z. B. `Verkäufer`).
- Verwenden Sie **Pivot Columns** für zeitliche Vergleiche (z. B. `Jahr`).
- Bei mehreren Kennzahlen werden diese automatisch unter den Spaltengruppen verschachtelt.
