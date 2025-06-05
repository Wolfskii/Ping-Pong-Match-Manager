import React from 'react'
import { Link } from 'react-router-dom'
import { useTranslation } from 'react-i18next'

const Home: React.FC = () => {
  const { t } = useTranslation()
  return (
    <div>
      <h1>{t('welcome')}</h1>
      <p>{t('organize')}</p>
      <Link to='/create'>{t('create')}</Link>
      <Link to='/overview'>{t('view')}</Link>
    </div>
  )
}

export default Home
