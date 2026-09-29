import { APP_CONFIG } from "./config.js";

  // Cada máscara identifica una región exclusiva; la máscara 0 cuenta a quienes quedan fuera.
  // Los bits 1, 2 y 4 representan pertenecer a los conjuntos A, B y C, respectivamente.
    const regionDefinitions = [
      { mask: 1, title: "Solo A", label: "Solo {a}", description: "Únicamente en el conjunto A", diagram: 1 },
      { mask: 2, title: "Solo B", label: "Solo {b}", description: "Únicamente en el conjunto B", diagram: 2 },
      { mask: 3, title: "A y B", label: "{a} + {b}", description: "En A y B, pero no en C", diagram: 3 },
      { mask: 5, title: "A y C", label: "{a} + {c}", description: "En A y C, pero no en B", diagram: 4 },
      { mask: 6, title: "B y C", label: "{b} + {c}", description: "En B y C, pero no en A", diagram: 5 },
      { mask: 4, title: "Solo C", label: "Solo {c}", description: "Únicamente en el conjunto C", diagram: 6 },
      { mask: 7, title: "A, B y C", label: "{a} + {b} + {c}", description: "En los tres conjuntos", diagram: 7 },
      { mask: 0, title: "Ningún deporte", label: "Ninguno", description: "No juega ninguno de los tres deportes", diagram: 8 }
    ];
    // Guarda las respuestas actuales y las columnas fijas definidas en config.js.
    const state = { headers: [], rows: [], mapping: [], names: APP_CONFIG.sets.map((set) => set.label), timer: null, loading: false, url: APP_CONFIG.sheetUrl };
    const $ = (id) => document.getElementById(id);

    // Aplica el tema elegido y actualiza el nombre accesible del botón.
    function applyTheme(theme) {
      const isDark = theme === "dark";
      document.documentElement.dataset.theme = isDark ? "dark" : "light";
      $("theme-toggle").setAttribute("aria-pressed", String(isDark));
      $("theme-toggle").setAttribute("aria-label", isDark ? "Activar modo claro" : "Activar modo oscuro");
      $("theme-toggle").title = isDark ? "Activar modo claro" : "Activar modo oscuro";
      $("theme-icon").textContent = isDark ? "☀" : "☾";
    }

    // Recupera la preferencia guardada o usa el tema del sistema la primera vez.
    let savedTheme = null;
    try { savedTheme = localStorage.getItem("cruce-theme"); } catch { /* El tema también funciona sin almacenamiento local. */ }
    applyTheme(savedTheme || (window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light"));

    // Cambia el tema al pulsar el botón y recuerda la elección en este navegador.
    $("theme-toggle").addEventListener("click", () => {
      const nextTheme = document.documentElement.dataset.theme === "dark" ? "light" : "dark";
      applyTheme(nextTheme);
      try { localStorage.setItem("cruce-theme", nextTheme); } catch { /* El cambio visual no depende del almacenamiento. */ }
    });

    // Convierte el CSV en filas y respeta comas y comillas escapadas dentro de las celdas.
    function parseCsv(text) {
      const rows = [];
      let row = [], value = "", quoted = false;
      const input = text.replace(/^\uFEFF/, "");
      for (let index = 0; index < input.length; index += 1) {
        const char = input[index];
        if (char === '"' && quoted && input[index + 1] === '"') { value += '"'; index += 1; }
        else if (char === '"') quoted = !quoted;
        else if (char === "," && !quoted) { row.push(value.trim()); value = ""; }
        else if ((char === "\n" || char === "\r") && !quoted) {
          if (char === "\r" && input[index + 1] === "\n") index += 1;
          row.push(value.trim());
          if (row.some((cell) => cell !== "")) rows.push(row);
          row = []; value = "";
        } else value += char;
      }
      row.push(value.trim());
      if (row.some((cell) => cell !== "")) rows.push(row);
      if (!rows.length) throw new Error("La hoja CSV está vacía.");
      const headers = rows.shift().map((header, index) => header || `Columna ${index + 1}`);
      const data = rows.map((cells) => Object.fromEntries(headers.map((header, index) => [header, cells[index] || ""])));
      return { headers, rows: data };
    }

    // Las respuestas vacías o negativas indican que la persona no pertenece al conjunto.
    function isSelected(value) {
      const answer = String(value ?? "").trim().toLocaleLowerCase("es").normalize("NFD").replace(/[\u0300-\u036f]/g, "");
      if (!answer || /^(no|n|false|0|no aplica|ninguna|ninguno|-|n\/a)$/.test(answer)) return false;
      return true;
    }

    // Actualiza el mensaje y el color para mostrar el estado de la conexión.
    function setSourceStatus(message, kind = "") {
      $("source-status").textContent = message;
      $("status-dot").className = `status-dot ${kind}`;
    }

    // Sustituye A, B y C por los nombres de los conjuntos al mostrar una región.
    function formatRegion(definition) {
      return definition.label.replace("{a}", state.names[0]).replace("{b}", state.names[1]).replace("{c}", state.names[2]);
    }

    // Clasifica cada respuesta en una sola región y actualiza los conteos de la página.
    function render() {
      const counts = new Map(regionDefinitions.map((region) => [region.mask, 0]));
      let members = 0;
      state.rows.forEach((row) => {
        const mask = state.mapping.reduce((value, column, position) => value | (isSelected(row[state.headers[column]]) ? 1 << position : 0), 0);
        counts.set(mask, counts.get(mask) + 1);
        if (mask) members += 1;
      });
      const total = state.rows.length;
      $("response-total").textContent = String(total);
      $("member-total").textContent = String(members);
      const sorted = regionDefinitions.filter((region) => region.mask !== 0).sort((left, right) => counts.get(right.mask) - counts.get(left.mask));
      const top = sorted[0];
      $("top-region").firstChild.textContent = String(counts.get(top.mask));
      $("top-region-name").textContent = formatRegion(top);
      regionDefinitions.forEach((definition, index) => {
        const name = formatRegion(definition);
        $(`diagram-count-${definition.diagram}`).textContent = String(counts.get(definition.mask));
        const row = $("region-list").children[index];
        if (row) {
          row.querySelector(".region-name").textContent = name;
          row.querySelector(".region-count").textContent = String(counts.get(definition.mask));
          row.querySelector(".region-description").textContent = definition.description.replace("A", state.names[0]).replace("B", state.names[1]).replace("C", state.names[2]);
        }
      });
      state.names.forEach((name, index) => {
        $(`diagram-label-${index}`).textContent = name;
        $(`legend-${index}`).textContent = name;
      });
      if (!$("region-list").children.length) {
        regionDefinitions.forEach((definition, index) => {
          const item = document.createElement("div");
          item.className = "region-row";
          item.innerHTML = `<span class="region-index">0${index + 1}</span><span class="region-text"><span class="region-name"></span><span class="region-description"></span></span><span class="region-count"></span>`;
          $("region-list").append(item);
        });
        render();
        return;
      }
    }

    // Carga el CSV y relaciona las tres preguntas de la encuesta con los conjuntos.
    function updateData(csv, sourceName, isLive = false) {
      const parsed = parseCsv(csv);
      const missingColumns = APP_CONFIG.sets.filter((set) => !parsed.headers.includes(set.column));
      if (missingColumns.length) {
        throw new Error(`Faltan columnas en Google Sheets: ${missingColumns.map((set) => set.column).join(", ")}`);
      }
      state.headers = parsed.headers;
      state.rows = parsed.rows;
      state.mapping = APP_CONFIG.sets.map((set) => state.headers.indexOf(set.column));
      state.names = APP_CONFIG.sets.map((set) => set.label);
      render();
      $("last-updated").textContent = `${totalLabel(state.rows.length)} · ${new Date().toLocaleTimeString("es", { hour: "2-digit", minute: "2-digit" })}`;
      setSourceStatus(sourceName, isLive ? "live" : "");
    }

    // Da formato al total de respuestas que acompaña la hora de actualización.
    function totalLabel(total) { return `${total} ${total === 1 ? "RESPUESTA" : "RESPUESTAS"}`; }

    // Convierte el enlace configurado de Google Sheets en su dirección de descarga CSV.
    function asCsvUrl(value) {
      const url = new URL(value);
      const hashGid = new URLSearchParams(url.hash.slice(1)).get("gid");
      if (url.hostname === "docs.google.com" && /\/spreadsheets\/d\/e\/[^/]+\/(?:pubhtml|pub)\/?$/.test(url.pathname)) {
        url.pathname = url.pathname.replace(/\/(?:pubhtml|pub)\/?$/, "/pub");
        if (!url.searchParams.has("gid") && hashGid) url.searchParams.set("gid", hashGid);
        url.searchParams.set("output", "csv");
        return url.toString();
      }
      if (url.hostname === "docs.google.com" && url.pathname.includes("/spreadsheets/d/")) {
        const match = url.pathname.match(/\/spreadsheets\/d\/([^/]+)/);
        if (!match) throw new Error("No encuentro el identificador de la hoja en ese enlace.");
        const gid = url.searchParams.get("gid") || hashGid || "0";
        return `https://docs.google.com/spreadsheets/d/${match[1]}/export?format=csv&gid=${encodeURIComponent(gid)}`;
      }
      return value;
    }

    // Descarga el CSV, valida sus columnas y recalcula los totales.
    async function loadSheet(showConnected = true) {
      if (state.loading) return;
      state.loading = true;
      try {
        const url = asCsvUrl(state.url);
        const separator = url.includes("?") ? "&" : "?";
        const response = await fetch(`${url}${separator}refresh=${Date.now()}`, { cache: "no-store" });
        if (!response.ok) throw new Error(`Google respondió con el código ${response.status}.`);
        const csv = await response.text();
        if (!csv.includes(",") || csv.trimStart().startsWith("<!DOCTYPE")) throw new Error("Google no devolvió datos CSV.");
        updateData(csv, showConnected ? "Google Sheets · actualización cada 15 s" : "Google Sheets · datos actualizados", true);
        try { sessionStorage.setItem("cruce-response-cache", csv); } catch { /* La caché es opcional en la navegación privada. */ }
      } finally {
        state.loading = false;
      }
    }

    // Consulta la hoja cada cierto tiempo y conserva los últimos totales si falla una petición.
    function startPolling() {
      window.clearInterval(state.timer);
      state.timer = window.setInterval(async () => {
        if (!state.url) return;
        try { await loadSheet(false); }
        catch (error) { setSourceStatus(`No se pudo actualizar: ${error.message}`, "error"); }
      }, 15000);
    }

    // Vuelve a consultar la hoja cuando la persona regresa desde la pestaña del formulario.
    window.addEventListener("focus", () => {
      if (state.url) loadSheet(false).catch((error) => setSourceStatus(`No se pudo actualizar: ${error.message}`, "error"));
    });

    // Carga los enlaces y columnas del código; las personas visitantes no pueden cambiarlos.
    async function initialize() {
      $("survey-link").href = APP_CONFIG.surveyUrl;
      try {
        const cachedCsv = sessionStorage.getItem("cruce-response-cache");
        if (cachedCsv) updateData(cachedCsv, "Datos guardados · actualizando", true);
      } catch { /* Sigue con la hoja en línea si el navegador no permite usar la sesión. */ }
      try { await loadSheet(); }
      catch (error) { setSourceStatus(`No se pudo leer la hoja: ${error.message}`, "error"); }
      startPolling();
    }

    initialize().catch((error) => setSourceStatus(error.message, "error"));
