import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useTranslation } from 'react-i18next'
import { useTournament } from '../context/TournamentContext'

interface Participant {
  id: string
  name: string
  team?: string
}

const TournamentCreation: React.FC = () => {
  const { t } = useTranslation()
  const navigate = useNavigate()
  const { setTournament } = useTournament()
  const [name, setName] = useState('')
  const [mode, setMode] = useState<'single' | 'duo' | 'round-robin'>('single')
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipant, setNewParticipant] = useState('')
  const [randomizeTeams, setRandomizeTeams] = useState(false)
  const [teams, setTeams] = useState<{ [key: string]: string[] }>({})
  const [teamMember1, setTeamMember1] = useState('')
  const [teamMember2, setTeamMember2] = useState('')

  const handleAddParticipant = () => {
    if (newParticipant.trim()) {
      const participant: Participant = {
        id: `participant-${Date.now()}`,
        name: newParticipant.trim()
      }
      setParticipants([...participants, participant])
      setNewParticipant('')
    }
  }

  const handleRemoveParticipant = (id: string) => {
    setParticipants(participants.filter((p) => p.id !== id))
    // Also remove from teams if in duo mode
    if (mode === 'duo') {
      const newTeams = { ...teams }
      Object.keys(newTeams).forEach((teamId) => {
        newTeams[teamId] = newTeams[teamId].filter((pId) => pId !== id)
      })
      setTeams(newTeams)
    }
  }

  const handleCreateTeam = () => {
    if (mode === 'duo' && teamMember1 && teamMember2) {
      // Prevent duplicate names or empty names
      if (teamMember1.trim() === teamMember2.trim() || !teamMember1.trim() || !teamMember2.trim()) return
      // Prevent adding a player already in a team
      const allTeamMembers = Object.values(teams)
        .flat()
        .map((id) => {
          const p = participants.find((pp) => pp.id === id)
          return p ? p.name : ''
        })
      if (allTeamMembers.includes(teamMember1.trim()) || allTeamMembers.includes(teamMember2.trim())) return

      // Create new participants for the team members
      const member1: Participant = {
        id: `participant-${teamMember1.trim().toLowerCase().replace(/\s+/g, '-')}`,
        name: teamMember1.trim()
      }
      const member2: Participant = {
        id: `participant-${teamMember2.trim().toLowerCase().replace(/\s+/g, '-')}`,
        name: teamMember2.trim()
      }

      // Add both participants if not already present
      setParticipants((prev) => {
        const names = prev.map((p) => p.name)
        return [...prev, ...(names.includes(member1.name) ? [] : [member1]), ...(names.includes(member2.name) ? [] : [member2])]
      })

      // Create the team
      const teamId = `team-${Date.now()}`
      setTeams({
        ...teams,
        [teamId]: [member1.id, member2.id]
      })

      // Clear the input fields
      setTeamMember1('')
      setTeamMember2('')
    }
  }

  const handleRemoveTeam = (teamId: string) => {
    const newTeams = { ...teams }
    // Remove team members from participants as well
    const memberIds = newTeams[teamId] || []
    delete newTeams[teamId]
    setTeams(newTeams)
    setParticipants((prev) => prev.filter((p) => !memberIds.includes(p.id)))
  }

  const handleCreateTournament = () => {
    if (name.trim() && (mode !== 'duo' || randomizeTeams || Object.keys(teams).length >= 2)) {
      const tournamentId = `tournament-${Date.now()}`
      let tournamentParticipants: Participant[] = []
      if (mode === 'duo' && !randomizeTeams) {
        // Build participants from teams, assign team property
        tournamentParticipants = Object.entries(teams).flatMap(
          ([teamId, memberIds]) =>
            memberIds
              .map((memberId) => {
                const p = participants.find((pp) => pp.id === memberId)
                return p ? { ...p, team: teamId } : null
              })
              .filter(Boolean) as Participant[]
        )
      } else {
        tournamentParticipants = participants
      }
      setTournament({
        id: tournamentId,
        name: name.trim(),
        mode,
        participants: tournamentParticipants,
        matches: [],
        currentRound: 1,
        status: 'pending'
      })
      navigate(`/tournament/${tournamentId}`)
    }
  }

  const availableParticipants = participants.filter((p) => !Object.values(teams).flat().includes(p.id))

  return (
    <div className='container'>
      <h1>{t('createTournament')}</h1>
      <div>
        <label>{t('tournamentName')}:</label>
        <input type='text' value={name} onChange={(e) => setName(e.target.value)} />
      </div>
      <div>
        <label>{t('tournamentMode')}:</label>
        <select value={mode} onChange={(e) => setMode(e.target.value as 'single' | 'duo' | 'round-robin')}>
          <option value='single'>{t('single')}</option>
          <option value='duo'>{t('duo')}</option>
          <option value='round-robin'>{t('roundRobin')}</option>
        </select>
      </div>

      {mode === 'duo' && (
        <div>
          <label>
            <input type='radio' checked={!randomizeTeams} onChange={() => setRandomizeTeams(false)} />
            {t('manualTeams')}
          </label>
          <label>
            <input type='radio' checked={randomizeTeams} onChange={() => setRandomizeTeams(true)} />
            {t('randomizeTeams')}
          </label>
        </div>
      )}

      {mode === 'duo' && randomizeTeams && (
        <div>
          <h2>{t('participants')}</h2>
          <div>
            <input type='text' value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} placeholder={t('participantName')} />
            <button onClick={handleAddParticipant}>{t('addParticipant')}</button>
          </div>
          <ul>
            {participants.map((participant) => (
              <li key={participant.id}>
                {participant.name}
                <button onClick={() => handleRemoveParticipant(participant.id)}>{t('remove')}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      {mode === 'duo' && !randomizeTeams && (
        <div>
          <h2>{t('createTeam')}</h2>
          <div style={{ display: 'flex', gap: '10px', alignItems: 'center' }}>
            <input type='text' value={teamMember1} onChange={(e) => setTeamMember1(e.target.value)} placeholder={t('firstTeamMember')} />
            <input type='text' value={teamMember2} onChange={(e) => setTeamMember2(e.target.value)} placeholder={t('secondTeamMember')} />
            <button onClick={handleCreateTeam} disabled={!teamMember1 || !teamMember2}>
              {t('createTeam')}
            </button>
          </div>
          <h3>{t('teams')}</h3>
          <ul>
            {Object.entries(teams).map(([teamId, memberIds], idx) => {
              const memberNames = memberIds
                .map((memberId) => {
                  const member = participants.find((p) => p.id === memberId)
                  return member ? member.name : ''
                })
                .filter(Boolean)
              return (
                <li key={teamId}>
                  {memberNames.join(' & ')} (team {idx + 1})<button onClick={() => handleRemoveTeam(teamId)}>{t('remove')}</button>
                </li>
              )
            })}
          </ul>
        </div>
      )}

      {mode !== 'duo' && (
        <div>
          <h2>{t('participants')}</h2>
          <div>
            <input type='text' value={newParticipant} onChange={(e) => setNewParticipant(e.target.value)} placeholder={t('participantName')} />
            <button onClick={handleAddParticipant}>{t('addParticipant')}</button>
          </div>
          <ul>
            {participants.map((participant) => (
              <li key={participant.id}>
                {participant.name}
                <button onClick={() => handleRemoveParticipant(participant.id)}>{t('remove')}</button>
              </li>
            ))}
          </ul>
        </div>
      )}

      <button onClick={handleCreateTournament} disabled={!name.trim() || (mode === 'duo' && !randomizeTeams && Object.keys(teams).length < 2) || (mode !== 'duo' && participants.length < 2) || (mode === 'duo' && randomizeTeams && participants.length < 2)}>
        {t('createTournament')}
      </button>
    </div>
  )
}

export default TournamentCreation
