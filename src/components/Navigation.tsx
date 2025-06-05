import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Navigation: React.FC = () => {
  const { t } = useTranslation()

  return (
    <nav className='navigation'>
      <ul>
        <li>
          <Link to='/'>{t('home')}</Link>
        </li>
        <li>
          <Link to='/create'>{t('createTournament')}</Link>
        </li>
        <li>
          <Link to='/overview'>{t('tournamentOverviewDiagram')}</Link>
        </li>
        <li>
          <Link to='/settings'>{t('settings')}</Link>
        </li>
      </ul>
    </nav>
  )
}

export default Navigation
