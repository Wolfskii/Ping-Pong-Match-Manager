import React from 'react'
import { useTranslation } from 'react-i18next'

const OverviewDiagram: React.FC = () => {
  const { t } = useTranslation()

  return (
    <div className='container'>
      <h1>{t('tournamentOverviewDiagram')}</h1>
      <p>{t('visualRepresentation')}</p>
      {/* Placeholder for diagram visualization */}
    </div>
  )
}

export default OverviewDiagram
