export const translations = {
  en: {
    flag: "🇬🇧",
    setupScreen: {
      title: "Game Score Counter",
      subtitle: "Set up your game to get started",
      numberOfPlayers: "Number of Players",
      playerNames: "Player Names",
      playerPlaceholder: "Player",
      dualScoring: "Dual Scoring Mode",
      dualScoringDesc: "Track both scores and predictions (e.g., for Wizard)",
      startGame: "Start Game",
    },
    gameScreen: {
      round: "Round",
      players: "players",
      addPlayer: "Add Player Mid-Game",
      playerName: "Player Name",
      enterName: "Enter name",
      startingScore: "Starting Score",
      mustBeZero: "(Must be 0)",
      reference: "Reference: Worst player has {worst} pts, Average is {avg} pts",
      finishGame: "Finish Game",
      currentStandings: "Current Standings",
      completeFirstRound: "Complete the first round to see the graph",
      enterScores: "Enter Scores for Round",
      score: "Score",
      prediction: "Prediction",
      previousRound: "Previous Round",
      saveNextRound: "Save & Next Round",
      joinedGame: "{name} joined the game!",
      roundSaved: "Round {round} scores saved!",
      enterPlayerName: "Please enter a player name",
    },
    resultsScreen: {
      wins: "{name} Wins!",
      finalScore: "Final Score: {score} points",
      inRounds: "in {rounds} rounds",
      gameAnalysis: "Game Analysis",
      readyForAnalysis: "Ready for some entertaining commentary on the game?",
      generateAnalysis: "Generate Analysis",
      channeling: "Channeling {theme}...",
      theme: "Theme: {theme}",
      startNewGame: "Start New Game",
    },
  },
  es: {
    flag: "🇪🇸",
    setupScreen: {
      title: "Contador de Puntuación",
      subtitle: "Configura tu juego para empezar",
      numberOfPlayers: "Número de Jugadores",
      playerNames: "Nombres de Jugadores",
      playerPlaceholder: "Jugador",
      dualScoring: "Modo de Puntuación Dual",
      dualScoringDesc: "Rastrea puntuaciones y predicciones (ej., para Wizard)",
      startGame: "Comenzar Juego",
    },
    gameScreen: {
      round: "Ronda",
      players: "jugadores",
      addPlayer: "Añadir Jugador",
      playerName: "Nombre del Jugador",
      enterName: "Introduce el nombre",
      startingScore: "Puntuación Inicial",
      mustBeZero: "(Debe ser 0)",
      reference: "Referencia: Peor jugador tiene {worst} pts, Promedio es {avg} pts",
      finishGame: "Terminar Juego",
      currentStandings: "Clasificación Actual",
      completeFirstRound: "Completa la primera ronda para ver el gráfico",
      enterScores: "Introduce Puntuaciones para Ronda",
      score: "Puntuación",
      prediction: "Predicción",
      previousRound: "Ronda Anterior",
      saveNextRound: "Guardar y Siguiente Ronda",
      joinedGame: "¡{name} se unió al juego!",
      roundSaved: "¡Puntuaciones de la ronda {round} guardadas!",
      enterPlayerName: "Por favor introduce un nombre de jugador",
    },
    resultsScreen: {
      wins: "¡{name} Gana!",
      finalScore: "Puntuación Final: {score} puntos",
      inRounds: "en {rounds} rondas",
      gameAnalysis: "Análisis del Juego",
      readyForAnalysis: "¿Listo para un comentario entretenido sobre el juego?",
      generateAnalysis: "Generar Análisis",
      channeling: "Canalizando {theme}...",
      theme: "Tema: {theme}",
      startNewGame: "Comenzar Nuevo Juego",
    },
  },
  de: {
    flag: "🇩🇪",
    setupScreen: {
      title: "Spielpunktzähler",
      subtitle: "Richte dein Spiel ein, um zu beginnen",
      numberOfPlayers: "Anzahl der Spieler",
      playerNames: "Spielernamen",
      playerPlaceholder: "Spieler",
      dualScoring: "Dualer Punktemodus",
      dualScoringDesc: "Verfolge Punkte und Vorhersagen (z.B. für Wizard)",
      startGame: "Spiel Starten",
    },
    gameScreen: {
      round: "Runde",
      players: "Spieler",
      addPlayer: "Spieler Hinzufügen",
      playerName: "Spielername",
      enterName: "Namen eingeben",
      startingScore: "Startpunktzahl",
      mustBeZero: "(Muss 0 sein)",
      reference: "Referenz: Schlechtester Spieler hat {worst} Pkt., Durchschnitt ist {avg} Pkt.",
      finishGame: "Spiel Beenden",
      currentStandings: "Aktuelle Rangliste",
      completeFirstRound: "Schließe die erste Runde ab, um das Diagramm zu sehen",
      enterScores: "Punkte für Runde eingeben",
      score: "Punkte",
      prediction: "Vorhersage",
      previousRound: "Vorherige Runde",
      saveNextRound: "Speichern & Nächste Runde",
      joinedGame: "{name} ist dem Spiel beigetreten!",
      roundSaved: "Punktzahlen der Runde {round} gespeichert!",
      enterPlayerName: "Bitte gib einen Spielernamen ein",
    },
    resultsScreen: {
      wins: "{name} Gewinnt!",
      finalScore: "Endpunktzahl: {score} Punkte",
      inRounds: "in {rounds} Runden",
      gameAnalysis: "Spielanalyse",
      readyForAnalysis: "Bereit für einen unterhaltsamen Kommentar zum Spiel?",
      generateAnalysis: "Analyse Generieren",
      channeling: "{theme} wird kanalisiert...",
      theme: "Thema: {theme}",
      startNewGame: "Neues Spiel Starten",
    },
  },
};

export type Language = keyof typeof translations;
export type TranslationKey = typeof translations.en;

export const getTranslation = (lang: Language, key: string): string => {
  const keys = key.split('.');
  let value: any = translations[lang];
  
  for (const k of keys) {
    value = value?.[k];
  }
  
  return value || key;
};

export const formatTranslation = (template: string, values: Record<string, string | number>): string => {
  return template.replace(/\{(\w+)\}/g, (match, key) => String(values[key] || match));
};
