import React, { useEffect } from 'react'
import { useTranslation } from 'react-i18next'
import { useTheme } from '../context/ThemeContext'

const Settings: React.FC = () => {
  const { t, i18n } = useTranslation()
  const { theme, setTheme } = useTheme()

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme)
  }, [theme])

  const handleLanguageChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const language = event.target.value
    i18n.changeLanguage(language)
  }

  const handleThemeChange = (event: React.ChangeEvent<HTMLSelectElement>) => {
    const newTheme = event.target.value
    setTheme(newTheme)
  }

  return (
    <div className='container'>
      <h1>{t('settings')}</h1>
      <div>
        <label>{t('language')}</label>
        <select value={i18n.language} onChange={handleLanguageChange}>
          <option value='en'>{t('english')}</option>
          <option value='sv'>{t('swedish')}</option>
        </select>
      </div>
      <div>
        <label>{t('theme')}</label>
        <select value={theme} onChange={handleThemeChange}>
          <option value='light'>{t('light')}</option>
          <option value='dark'>{t('dark')}</option>
        </select>
      </div>
    </div>
  )
}

export default Settings
