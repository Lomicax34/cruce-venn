// Enlaces públicos y nombres exactos de las columnas de respuestas de esta encuesta.
// Como la web es estática, cualquier visitante puede ver estos valores en el código.
export const APP_CONFIG = Object.freeze({
  surveyUrl: "https://forms.gle/wrs3bLzy7Y641iAr9",
  sheetUrl: "https://docs.google.com/spreadsheets/d/13bQfnV_uOvJjr9wJHUzfjW5ZwElKl7PpvCnjZcjus2w/export?format=csv&gid=134010556",
  refreshIntervalMs: 15000,
  sets: [
    { column: "¿Juegas Voleyball?", label: "Voleibol" },
    { column: "¿Juegas Futboll?", label: "Fútbol" },
    { column: "¿Juegas Basketball?", label: "Básquet" }
  ]
});