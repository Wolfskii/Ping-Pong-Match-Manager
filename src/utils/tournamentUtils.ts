export const generateBracket = (participants: number, mode: string) => {
  // Placeholder logic for generating a tournament bracket
  return Array.from({ length: participants }, (_, i) => ({
    id: i + 1,
    team1: `Team ${i + 1}`,
    team2: `Team ${participants - i}`,
    score: { team1: 0, team2: 0 }
  }))
}

export const generateRoundRobin = (participants: number) => {
  // Placeholder logic for generating a round-robin grid
  return Array.from({ length: participants }, (_, i) => ({
    id: i + 1,
    team: `Team ${i + 1}`,
    matches: Array.from({ length: participants - 1 }, (_, j) => ({
      opponent: `Team ${((i + j + 1) % participants) + 1}`,
      score: 0
    }))
  }))
}
