import React from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTournament } from '../context/TournamentContext'

const TournamentOverview: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tournament, generateMatches, nextRound } = useTournament()

  if (!tournament) {
    return <div className='container'>{t('tournamentNotFound')}</div>
  }

  const handleStartTournament = () => {
    generateMatches()
  }

  // Find matches for the current round
  const currentRoundMatches = tournament.matches.filter((m) => m.round === tournament.currentRound)
  const allCurrentRoundCompleted = currentRoundMatches.length > 0 && currentRoundMatches.every((m) => m.status === 'completed')
  const tournamentNotFinished = tournament.status !== 'completed'

  return (
    <div className='container'>
      <h1>{t('tournamentOverview')}</h1>
      <p>
        {t('tournamentId')}: {id}
      </p>
      <p>
        {t('tournamentName')}: {tournament.name}
      </p>
      <p>
        {t('tournamentMode')}: {t(tournament.mode)}
      </p>
      <p>
        {t('numberOfParticipants')}: {tournament.participants.length}
      </p>
      <p>
        {t('currentRound')}: {tournament.currentRound}
      </p>

      <div>
        <h2>{t('participants')}</h2>
        {tournament.mode === 'duo' ? (
          <ul>
            {(() => {
              // Group participants by team
              const teamsMap: { [teamId: string]: string[] } = {}
              tournament.participants.forEach((p) => {
                if (p.team) {
                  if (!teamsMap[p.team]) teamsMap[p.team] = []
                  teamsMap[p.team].push(p.name)
                }
              })
              return Object.values(teamsMap).map((names, idx) => (
                <li key={idx}>
                  {names.join(' & ')} (team {idx + 1})
                </li>
              ))
            })()}
          </ul>
        ) : (
          <ul>
            {tournament.participants.map((participant) => (
              <li key={participant.id}>{participant.name}</li>
            ))}
          </ul>
        )}
      </div>

      {tournament.status === 'pending' && <button onClick={handleStartTournament}>{t('startTournament')}</button>}

      {tournament.matches.length > 0 && (
        <div>
          <h2>{t('matches')}</h2>
          <ul>
            {tournament.matches.map((match) => (
              <li key={match.id}>
                {match.team1.name} vs {match.team2.name} - {t('score')}: {match.score.team1} - {match.score.team2}
                <button onClick={() => navigate(`/match/${match.id}`)}>{t('enterScore')}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Show Next Round button if all matches in current round are completed and tournament is not finished */}
      {allCurrentRoundCompleted && tournamentNotFinished && (
        <button onClick={nextRound} style={{ marginTop: 20 }}>
          {t('nextRound')}
        </button>
      )}
    </div>
  )
}

export default TournamentOverview
