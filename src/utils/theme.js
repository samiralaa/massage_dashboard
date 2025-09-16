export const setTheme = (theme = 'light') => {
  document.documentElement.setAttribute('data-theme', theme)
  localStorage.setItem('theme', theme)
}

export const setDirection = (direction = 'ltr') => {
  document.documentElement.dir = direction
  localStorage.setItem('direction', direction)
  
  // Update language based on direction
  const lang = direction === 'rtl' ? 'ar' : 'en'
  localStorage.setItem('lang', lang)
  return lang
}

export const initializeTheme = () => {
  const savedTheme = localStorage.getItem('theme') || 'light'
  const savedDirection = localStorage.getItem('direction') || 'ltr'
  
  setTheme(savedTheme)
  setDirection(savedDirection)
  
  return {
    theme: savedTheme,
    direction: savedDirection,
    lang: savedDirection === 'rtl' ? 'ar' : 'en'
  }
} 