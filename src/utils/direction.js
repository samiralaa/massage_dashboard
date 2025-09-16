export const initializeDirection = () => {
  const savedDirection = localStorage.getItem('direction') || 'ltr'
  const savedLang = localStorage.getItem('lang') || 'en'
  
  document.documentElement.dir = savedDirection
  document.documentElement.lang = savedLang
  
  // Ensure direction and language are in sync
  if (savedDirection === 'rtl' && savedLang !== 'ar') {
    localStorage.setItem('lang', 'ar')
    return 'ar'
  } else if (savedDirection === 'ltr' && savedLang !== 'en') {
    localStorage.setItem('lang', 'en')
    return 'en'
  }
  return savedLang
}

export const setDirection = (direction) => {
  const newDirection = direction || 'ltr'
  const newLang = newDirection === 'rtl' ? 'ar' : 'en'
  
  document.documentElement.dir = newDirection
  document.documentElement.lang = newLang
  localStorage.setItem('direction', newDirection)
  localStorage.setItem('lang', newLang)
  
  return newLang
} 