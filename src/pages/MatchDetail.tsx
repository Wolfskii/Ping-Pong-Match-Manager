import React, { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTournament } from '../context/TournamentContext'

const MatchDetail: React.FC = () => {
  const { t } = useTranslation()
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { tournament, updateMatchScore } = useTournament()
  const [score, setScore] = useState({ team1: 0, team2: 0 })

  const match = tournament?.matches.find((m) => m.id === id)

  const handleScoreChange = (team: 'team1' | 'team2', value: number) => {
    setScore((prev) => ({ ...prev, [team]: value }))
  }

  const handleSave = () => {
    if (!id || !match) return
    updateMatchScore(id, score)
    navigate(`/tournament/${tournament?.id}`)
  }

  if (!match) {
    return <div className='container'>{t('matchNotFound')}</div>
  }

  return (
    <div className='container'>
      <h1>{t('matchDetail')}</h1>
      <p>
        {t('matchId')}: {id}
      </p>
      <p>
        {t('tournamentName')}: {tournament?.name}
      </p>
      <div>
        <label>{match.team1.name}</label>
        <input type='number' value={score.team1} onChange={(e) => handleScoreChange('team1', Number(e.target.value))} />
      </div>
      <div>
        <label>{match.team2.name}</label>
        <input type='number' value={score.team2} onChange={(e) => handleScoreChange('team2', Number(e.target.value))} />
      </div>
      <button onClick={handleSave}>{t('saveScore')}</button>
    </div>
  )
}

export default MatchDetail
