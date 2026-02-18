# KPI Alerts (Bedingte Formatierung)

Mit **KPI Alerts** können Sie Schwellenwerte für Ihre Kennzahlen definieren, die visuell durch Farben (Grün, Gelb, Rot, Blau) hervorgehoben werden.

## Funktionen

- **Operatoren**: Unterstützt `>`, `<`, `>=`, `<=`, `==`.
- **Mehrere Regeln**: Sie können mehrere Regeln pro KPI definieren. Die erste zutreffende Regel bestimmt die Farbe.
- **Visuelles Feedback**: Die Farbe der Zahl ändert sich sofort, wenn ein Grenzwert erreicht wird.

## Konfiguration
1. Wählen Sie im **Query Builder** den Visualisierungstyp **KPI**.
2. Gehen Sie auf den Reiter **Graph (Settings)**.
3. Klicken Sie auf **"Add Rule"**, um eine neue Bedingung hinzuzufügen.
4. Wählen Sie den Operator, den Wert und die gewünschte Farbe aus.

## Beispiele
- `> 100` -> **Grün** (Ziel erreicht)
- `< 50` -> **Rot** (Achtung erforderlich)
- `== 0` -> **Gelb** (Neutraler Status)
