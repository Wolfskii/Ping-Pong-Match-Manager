import i18n from 'i18next'
import { initReactI18next } from 'react-i18next'
import LanguageDetector from 'i18next-browser-languagedetector'

const resources = {
  en: {
    translation: {
      welcome: 'Welcome to Ping Pong Match Manager',
      organize: 'Organize and manage your table tennis tournaments with ease!',
      create: 'Create New Tournament',
      view: 'View Existing Tournaments',
      tournamentName: 'Tournament Name:',
      tournamentMode: 'Tournament Mode:',
      numberOfParticipants: 'Number of Participants:',
      single: 'Single',
      duo: 'Duo',
      roundRobin: 'Round-Robin',
      createTournament: 'Create Tournament',
      settings: 'Settings',
      language: 'Language:',
      theme: 'Theme:',
      light: 'Light',
      dark: 'Dark',
      english: 'English',
      swedish: 'Swedish',
      tournamentOverview: 'Tournament Overview',
      tournamentId: 'Tournament ID',
      currentRound: 'Current Round',
      displayCurrentRoundMatches: 'Display current round matches here.',
      matches: 'Matches',
      score: 'Score',
      matchDetail: 'Match Detail',
      matchId: 'Match ID',
      team1Score: 'Team 1 Score',
      team2Score: 'Team 2 Score',
      saveScore: 'Save Score',
      tournamentOverviewDiagram: 'Tournament Overview Diagram',
      visualRepresentation: 'Visual representation of the tournament bracket or round-robin grid will go here.'
    }
  },
  sv: {
    translation: {
      welcome: 'Välkommen till Ping Pong Match Manager',
      organize: 'Organisera och hantera dina bordtennisturneringar enkelt!',
      create: 'Skapa ny turnering',
      view: 'Visa befintliga turneringar',
      tournamentName: 'Turneringsnamn:',
      tournamentMode: 'Turneringsläge:',
      numberOfParticipants: 'Antal deltagare:',
      single: 'Singel',
      duo: 'Dubbel',
      roundRobin: 'Alla möter alla',
      createTournament: 'Skapa turnering',
      settings: 'Inställningar',
      language: 'Språk:',
      theme: 'Tema:',
      light: 'Ljust',
      dark: 'Mörkt',
      english: 'Engelska',
      swedish: 'Svenska',
      tournamentOverview: 'Turneringsöversikt',
      tournamentId: 'Turnerings-ID',
      currentRound: 'Nuvarande runda',
      displayCurrentRoundMatches: 'Visa nuvarande rundas matcher här.',
      matches: 'Matcher',
      score: 'Poäng',
      matchDetail: 'Matchdetaljer',
      matchId: 'Match-ID',
      team1Score: 'Lag 1 Poäng',
      team2Score: 'Lag 2 Poäng',
      saveScore: 'Spara Poäng',
      tournamentOverviewDiagram: 'Turneringsöversiktsdiagram',
      visualRepresentation: 'Visuell representation av turneringsbracket eller round-robin-grid kommer att visas här.'
    }
  }
}

i18n
  .use(LanguageDetector)
  .use(initReactI18next)
  .init({
    resources,
    fallbackLng: 'en',
    interpolation: {
      escapeValue: false
    }
  })

export default i18n
