import React, { createContext, useContext, useState, ReactNode } from 'react'

interface Participant {
  id: string
  name: string
  team?: string // For duo mode
}

interface Match {
  id: string
  round: number
  team1: Participant
  team2: Participant
  score: { team1: number; team2: number }
  status: 'pending' | 'in_progress' | 'completed'
  title?: string
}

interface Tournament {
  id: string
  name: string
  mode: 'single' | 'duo' | 'round-robin'
  participants: Participant[]
  matches: Match[]
  currentRound: number
  status: 'pending' | 'in_progress' | 'completed'
}

interface TournamentContextType {
  tournament: Tournament | null
  setTournament: (tournament: Tournament) => void
  addParticipant: (participant: Participant) => void
  updateMatchScore: (matchId: string, score: { team1: number; team2: number }) => void
  generateMatches: () => void
  nextRound: () => void
}

const TournamentContext = createContext<TournamentContextType | undefined>(undefined)

export const TournamentProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  // Load from sessionStorage if present
  const [tournament, setTournamentState] = useState<Tournament | null>(() => {
    const saved = sessionStorage.getItem('tournament')
    return saved ? JSON.parse(saved) : null
  })

  // Save to sessionStorage on change
  React.useEffect(() => {
    if (tournament) {
      sessionStorage.setItem('tournament', JSON.stringify(tournament))
    } else {
      sessionStorage.removeItem('tournament')
    }
  }, [tournament])

  // Wrapper to clear sessionStorage when creating a new tournament
  const setTournament = (t: Tournament | null) => {
    if (t === null) {
      sessionStorage.removeItem('tournament')
    }
    setTournamentState(t)
  }

  const addParticipant = (participant: Participant) => {
    if (!tournament) return
    setTournament({
      ...tournament,
      participants: [...tournament.participants, participant]
    })
  }

  const updateMatchScore = (matchId: string, score: { team1: number; team2: number }) => {
    if (!tournament) return
    setTournament({
      ...tournament,
      matches: tournament.matches.map((match) => (match.id === matchId ? { ...match, score, status: 'completed' } : match))
    })
  }

  const generateRoundRobinSchedule = (participants: Participant[]): Match[] => {
    const n = participants.length
    if (n < 2) return []

    // Create a copy of participants array
    const schedule = [...participants]
    const matches: Match[] = []
    const rounds = n % 2 === 0 ? n - 1 : n

    // Generate rounds
    for (let round = 0; round < rounds; round++) {
      // For each round, create matches between participants
      for (let i = 0; i < Math.floor(n / 2); i++) {
        const team1 = schedule[i]
        const team2 = schedule[n - 1 - i]

        // Skip if it's the same team or if one team is undefined (bye)
        if (team1 && team2 && team1.id !== team2.id) {
          matches.push({
            id: `match-${round + 1}-${i}`,
            round: round + 1,
            team1,
            team2,
            score: { team1: 0, team2: 0 },
            status: 'pending'
          })
        }
      }

      // Rotate the schedule (keep first participant fixed, rotate others)
      schedule.splice(1, 0, schedule.pop()!)
    }

    // Shuffle matches within each round to avoid consecutive games for the same player
    const roundsMap = new Map<number, Match[]>()
    matches.forEach((match) => {
      const roundMatches = roundsMap.get(match.round) || []
      roundMatches.push(match)
      roundsMap.set(match.round, roundMatches)
    })

    const shuffledMatches: Match[] = []
    roundsMap.forEach((roundMatches) => {
      // Shuffle matches within the round
      const shuffledRound = [...roundMatches]
      for (let i = shuffledRound.length - 1; i > 0; i--) {
        const randomIndex = Math.floor(Math.random() * (i + 1))
        const temp = shuffledRound[i]
        shuffledRound[i] = shuffledRound[randomIndex]
        shuffledRound[randomIndex] = temp
      }
      shuffledMatches.push(...shuffledRound)
    })

    return shuffledMatches
  }

  const getMatchTitle = (round: number, totalRounds: number, matchIndex: number, totalMatches: number, isBronze = false): string => {
    if (isBronze) return 'Bronze Match'
    if (totalRounds === 1) return 'Final'
    if (totalRounds === 2) return round === totalRounds ? 'Final' : 'Semifinal'
    if (totalRounds === 3) {
      if (round === totalRounds) return 'Final'
      if (round === totalRounds - 1) return 'Semifinal'
      return 'Quarterfinal'
    }
    // For more rounds, use 1/16, 1/8, etc.
    const roundNames = {
      16: '1/16 Final',
      8: 'Quarterfinal',
      4: 'Semifinal',
      2: 'Final'
    }
    const teamsThisRound = totalMatches * 2
    return roundNames[teamsThisRound as keyof typeof roundNames] || `Round ${round}`
  }

  const generateMatches = () => {
    if (!tournament) return
    let matches: Match[] = []
    const participants = [...tournament.participants]
    if (tournament.mode === 'single') {
      const totalRounds = Math.ceil(Math.log2(participants.length))
      for (let i = 0; i < participants.length; i += 2) {
        if (i + 1 < participants.length) {
          matches.push({
            id: `match-${tournament.currentRound}-${i / 2}`,
            round: tournament.currentRound,
            team1: participants[i],
            team2: participants[i + 1],
            score: { team1: 0, team2: 0 },
            status: 'pending' as const,
            title: getMatchTitle(tournament.currentRound, totalRounds, i / 2, participants.length / 2)
          })
        }
      }
    } else if (tournament.mode === 'duo') {
      // Group participants by team
      const teamsArr = Object.values(
        participants.reduce((acc, p) => {
          if (p.team) {
            if (!acc[p.team]) acc[p.team] = []
            acc[p.team].push(p.name)
          }
          return acc
        }, {} as { [teamId: string]: string[] })
      ).map((names, idx) => ({
        id: `team-${idx + 1}`,
        name: names.join(' & ')
      }))
      const totalRounds = Math.ceil(Math.log2(teamsArr.length))
      for (let i = 0; i < teamsArr.length; i += 2) {
        if (i + 1 < teamsArr.length) {
          matches.push({
            id: `match-${tournament.currentRound}-${i / 2}`,
            round: tournament.currentRound,
            team1: teamsArr[i],
            team2: teamsArr[i + 1],
            score: { team1: 0, team2: 0 },
            status: 'pending' as const,
            title: getMatchTitle(tournament.currentRound, totalRounds, i / 2, teamsArr.length / 2)
          })
        }
      }
    } else if (tournament.mode === 'round-robin') {
      matches = generateRoundRobinSchedule(participants)
    }
    setTournament({
      ...tournament,
      matches,
      status: 'in_progress'
    })
  }

  const nextRound = () => {
    if (!tournament) return
    if (tournament.mode === 'single') {
      const currentMatches = tournament.matches.filter((m) => m.round === tournament.currentRound)
      const winners: Participant[] = []
      const losers: Participant[] = []
      currentMatches.forEach((match) => {
        if (match.score.team1 > match.score.team2) {
          winners.push(match.team1)
          losers.push(match.team2)
        } else if (match.score.team2 > match.score.team1) {
          winners.push(match.team2)
          losers.push(match.team1)
        }
      })
      // If only 2 winners, it's the final
      if (winners.length === 2) {
        // If a final already exists and is completed, stop
        const finals = tournament.matches.filter((m) => m.title === 'Final')
        if (finals.length > 0 && finals.every((m) => m.status === 'completed')) {
          setTournament({
            ...tournament,
            status: 'completed'
          })
          return
        }
        const finalMatch = {
          id: `final-${Date.now()}`,
          round: tournament.currentRound + 1,
          team1: winners[0],
          team2: winners[1],
          score: { team1: 0, team2: 0 },
          status: 'pending' as const,
          title: 'Final'
        }
        // Bronze match for losers
        let bronzeMatch = null
        if (losers.length === 2) {
          bronzeMatch = {
            id: `bronze-${Date.now()}`,
            round: tournament.currentRound + 1,
            team1: losers[0],
            team2: losers[1],
            score: { team1: 0, team2: 0 },
            status: 'pending' as const,
            title: 'Bronze Match'
          }
        }
        setTournament({
          ...tournament,
          matches: [...tournament.matches, finalMatch, ...(bronzeMatch ? [bronzeMatch] : [])],
          currentRound: tournament.currentRound + 1
        })
      } else if (winners.length > 2) {
        // If this is the last round (finals just played), stop
        const finals = tournament.matches.filter((m) => m.title === 'Final')
        if (finals.length > 0 && finals.every((m) => m.status === 'completed')) {
          setTournament({
            ...tournament,
            status: 'completed'
          })
          return
        }
        // Next elimination round
        const totalRounds = Math.ceil(Math.log2(tournament.participants.length))
        const nextMatches = []
        for (let i = 0; i < winners.length; i += 2) {
          if (i + 1 < winners.length) {
            nextMatches.push({
              id: `match-${tournament.currentRound + 1}-${i / 2}`,
              round: tournament.currentRound + 1,
              team1: winners[i],
              team2: winners[i + 1],
              score: { team1: 0, team2: 0 },
              status: 'pending' as const,
              title: getMatchTitle(tournament.currentRound + 1, totalRounds, i / 2, winners.length / 2)
            })
          }
        }
        setTournament({
          ...tournament,
          matches: [...tournament.matches, ...nextMatches],
          currentRound: tournament.currentRound + 1
        })
      } else {
        // Tournament complete
        setTournament({
          ...tournament,
          status: 'completed'
        })
      }
    } else if (tournament.mode === 'duo') {
      // Get all teams
      const teamMap: { [teamId: string]: { id: string; name: string } } = {}
      tournament.participants.forEach((p) => {
        if (p.team) {
          if (!teamMap[p.team]) teamMap[p.team] = { id: p.team, name: '' }
          teamMap[p.team].name += (teamMap[p.team].name ? ' & ' : '') + p.name
        }
      })
      const teamsArr = Object.values(teamMap)
      // Get winners from current round
      const currentMatches = tournament.matches.filter((m) => m.round === tournament.currentRound)
      const winners: { id: string; name: string }[] = []
      const losers: { id: string; name: string }[] = []
      currentMatches.forEach((match) => {
        if (match.score.team1 > match.score.team2) {
          winners.push(match.team1 as any)
          losers.push(match.team2 as any)
        } else if (match.score.team2 > match.score.team1) {
          winners.push(match.team2 as any)
          losers.push(match.team1 as any)
        }
      })
      // If only 2 winners, it's the final
      if (winners.length === 2) {
        const finals = tournament.matches.filter((m) => m.title === 'Final')
        if (finals.length > 0 && finals.every((m) => m.status === 'completed')) {
          setTournament({
            ...tournament,
            status: 'completed'
          })
          return
        }
        const finalMatch = {
          id: `final-${Date.now()}`,
          round: tournament.currentRound + 1,
          team1: winners[0],
          team2: winners[1],
          score: { team1: 0, team2: 0 },
          status: 'pending' as const,
          title: 'Final'
        }
        // Bronze match for losers
        let bronzeMatch = null
        if (losers.length === 2) {
          bronzeMatch = {
            id: `bronze-${Date.now()}`,
            round: tournament.currentRound + 1,
            team1: losers[0],
            team2: losers[1],
            score: { team1: 0, team2: 0 },
            status: 'pending' as const,
            title: 'Bronze Match'
          }
        }
        setTournament({
          ...tournament,
          matches: [...tournament.matches, finalMatch, ...(bronzeMatch ? [bronzeMatch] : [])],
          currentRound: tournament.currentRound + 1
        })
      } else if (winners.length > 2) {
        const finals = tournament.matches.filter((m) => m.title === 'Final')
        if (finals.length > 0 && finals.every((m) => m.status === 'completed')) {
          setTournament({
            ...tournament,
            status: 'completed'
          })
          return
        }
        const totalRounds = Math.ceil(Math.log2(teamsArr.length))
        const nextMatches = []
        for (let i = 0; i < winners.length; i += 2) {
          if (i + 1 < winners.length) {
            nextMatches.push({
              id: `match-${tournament.currentRound + 1}-${i / 2}`,
              round: tournament.currentRound + 1,
              team1: winners[i],
              team2: winners[i + 1],
              score: { team1: 0, team2: 0 },
              status: 'pending' as const,
              title: getMatchTitle(tournament.currentRound + 1, totalRounds, i / 2, winners.length / 2)
            })
          }
        }
        setTournament({
          ...tournament,
          matches: [...tournament.matches, ...nextMatches],
          currentRound: tournament.currentRound + 1
        })
      } else {
        setTournament({
          ...tournament,
          status: 'completed'
        })
      }
    } else if (tournament.mode === 'round-robin') {
      // do nothing
    }
  }

  return <TournamentContext.Provider value={{ tournament, setTournament, addParticipant, updateMatchScore, generateMatches, nextRound }}>{children}</TournamentContext.Provider>
}

export const useTournament = () => {
  const context = useContext(TournamentContext)
  if (!context) {
    throw new Error('useTournament must be used within a TournamentProvider')
  }
  return context
}
