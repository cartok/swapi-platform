# Device Context

## Themen / Entscheidungen

### Warum sollten die Breakpoints in einem allgemeinen Datenformat (JSON/YAML) definiert werden?

> Weil man dadurch den SSR Server besser vom Frontend trennen kann. In production könnte das etwas anderes als der Node Server sein/werden.

### Über vanilla-extract vs PostCSS im Kontext der CSS Media Queries

Vorweg: Warum überhaupt die Generierung?

> Weil die Breakpoints zumindest in der JS Nutzung über den `DeviceService` typesafe sein sollten.
> Weil die Breakpoints nicht an zwei Stellen (CSS & JS) definiert werden sollten

#### vanilla-extract

##### Pro

- CSS & JS wäre beides typesafe
- Kein extra Tooling nötig, aber bringt ja wiederum Tooling mit (siehe Kontra)

##### Kontra

- `ng update|(add)`: Man müsste für die Intergration auf Angular version updates via Angular CLI verzichten, siehe: https://angular.dev/ecosystem/custom-build-pipeline#what-are-the-options
- Extra `<component>.css.ts` files, sofern man die Struktur nicht brechen will, indem man den CSS-in-JS code über die Component Classes in `<component>.ts` packt. Daraus ergibt sich so ein workflow: Man bearbeitet, nachdem man die styles in `<component>.ts` importiert hat `<component>.css.ts` idr. parallel mit `<component>.css` und dann `<component>.html`. Spricht dafür CSS komplett auszutauschen.
- Bietet mehr Optionen.
  - Andere Entwickler könnten damit CSS und CSS-in-JS definieren
  - Andere Entwickler könnten Media Queries in CSS und CSS-in-JS definieren
- Ich bin mir ohne weiteres nicht sicher, ob es da nicht zu Spezifitäts-Problemen kommen kann wenn man die CSS-in-JS generierten CSS Klassen zusammen mit Angular standard CSS Klassen verwendet. Könnte man aber vermutlich lösen. Spricht dafür CSS komplett auszutauschen.

#### PostCSS

##### Pro

- `ng update|(add)`: Ginge grundlegend ohne ejecting (@analogjs/vite-plugin-angular)
  - Wenn auch ohne automatischen rebuild bei Änderungen an der Breakpoint-Basis-Datei, wäre aber total ausreichend.
- Styles wären, wie gehabt, möglichst nah beieinander

##### Kontra

- Zumindets in VSCode gibt es kein gescheites PostCSS Plugin. Man muss bei den media queries auf auto-completion verzichten und unknown @-rule per project settings.json erlauben.
- Zumindest per default (ggf. gibts Lösungen, Scripten könnte man es ohne viel Aufwand extern von Linting-Tools. Vermutlich könnte man auch stylelint verwenden oder ähnliches, ist aber wiederum mehr tooling, würde aber wiederum auch mehr optionen bieten wie z. B. automatische sortierung von CSS Properties) gibt es in CSS kein Linting bzgl. vorhandener properties (variablen). D. h. dass zum Beispiel nach dem Entfernen eines Breakpoints kein Linter warnt, wenn man noch den alten verwendet.
- Die media query tokens kann man nicht mit anderen Queries kombinieren. Das heist man müsste tokens für alle möglichen media queries als karthesisches Produkt generieren, was insane ist. Aktuell habe ich nur width & height generiert. Da wäre es sogar allgemein besser auf das custom-media plugin zu verzichten, wodurch PostCSS ganz raus kann, auch wenn man dann nicht mehr single source of truth bzgl. der breakpoints hat. Hier muss definitv was geändert werden. Entweder ein anderer Präprozessor oder CSS-in-JS.

### Ermitteln des Device Contexts

#### Low-entropy headers

Werden direkt mitgesended, sofern nicht blockiert.
https://wicg.github.io/client-hints-infrastructure/#low-entropy-hint-table

**Auswahl:**

- `Sec-CH-UA-Mobile`: `?1|?0`
  Bezieht sich auf den Formfaktor des Geräts, nicht auf Browser Eigenschaften, unterscheidet aber nicht zwischen Mobile und Tablet, daher kann ?0 auch Tablet sein.

#### High-entropy headers

Kann der Server bei Antwort per Accept-CH Header anfragen und werden dann beim nächsten Request mitgesendet, sofern nicht blockiert.

**Auswahl:**

- `Sec-CH-Form-Factors`: "Desktop", "Automotive", "Mobile", "Tablet", "XR", "EInk", "Watch"
  Keine Breite Unterstüztung, aber sofern unterstüzt kann man es vor allem für die Evaluierung, ob es Tablet ist hinzunehmen.
- `Sec-CH-Viewport-Width`
- `Sec-CH-Viewport-Height`

#### Fallbacks

Client-side detection mit minimalem payload und redirect nach POST /device-cookie via 303.

- `Sec-CH-UA-Mobile`: `(pointer: fine) AND (hover: hover)`
- `Sec-CH-Viewport-Width`: `window.innerWidth`
- `Sec-CH-Viewport-Height`: `window.innerHeight`

#### General Additions

| pointer | hover | Gerätetyp        |
| ------- | ----- | ---------------- |
| fine    | hover | Desktop / Laptop |
| coarse  | none  | Smartphone       |
| coarse  | hover | selten (Hybrid)  |

**Eventually usable Media Queries:**

- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/height
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/width
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/aspect-ratio
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/orientation
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/resolution
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/pointer
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/any-pointer
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/display-mode
- https://developer.mozilla.org/en-US/docs/Web/CSS/Reference/At-rules/@media/hover

### SSG, SSR, CSR Variant Page Routing

Entscheidung: Per prefix routes.

---

#### TODOs

- Grundlegend
  - Taskfile:
    - code generation als deps
    - code generation caching
    - symlinks + cli autocompletion
  - vanilla-extract-css refactoring
  - Vite build Optimierungen einbauen, anhand alter angular.json

---

- CSR für Github Pages
  - Non-SSR device context defaults überprüfen
- Unit Tests fixen

---

- Fallback Mechanimsus abschließen
  - Grundlegend die device init page incl. redirect umsetzen
  - Cookie und header daten vereinen
  - Fallback Logik die über die device init seite entscheidet sollte gut und togglebar sein

---

- Touch/Hover Geschichte abschließen / bereinigen oder erstmal entfernen
  - Sollte für touch prüfung js touchpoints check hinzugenommen werden?
    ```js
    const hasTouch = 'ontouchstart' in window || navigator.maxTouchPoints > 0 || navigator.msMaxTouchPoints > 0
    ```

---

- Eventuelle Verbesserungen:
  - Wenn alle Header initial bereits vorhanden sind, könnte man theoretisch URL Rewrite statt HTTP redirect verweden um den Redirect zu sparen. Ist dann aber nach wie vor das Thema, dass man dann die Dokumente, falls sauber möglich über Header unterscheidbar machen müsste und wenn das implementiert ist, könnte man auch vollständig auf die HTTP Redirection verzichten.
  - Noch mal gegen prüfen ob man das nicht doch incl. SSG auch ohne URL parameter robust lösen kann, dann könnte man URL rewrite statt redirect verwenden und / sich den redirect sparen und hätte eine saubere URL. Caching muss passen.
  - Ggf. die Express module etwas umgestalten, gucken wie das idr. gemacht wird.
  - Der Mix aus den unfertigen Schemas und der Definition der Breakpoints hier, ist nicht gut. Idee war ja grundlegend von der Architektur her mal zu gucken wie es aussehen würde möglichst Server- und Sprach-neutral die Schnittmenge an Informationen zu definieren die auf beiden Seiten gebraucht werden. Auch der Workaround mit dem d.ts File für den Cookie Validator gefällt mir nicht.

---

- Outsiders:
  - Taskfile oder ähnliches verwenden statt npm scripts, allein wegen der code generation
  - `NgOptimizedImage` nutzen
  - Eventuell schlechte Architektur von `app-image-grid-item`: Könnte <img> rein geben, dann kann ich dessen loading hier direkt steuern. Alternativ gucken wie und ob ich durch reiche vs abstrahiere (evtl. unnötige Komplexität).
