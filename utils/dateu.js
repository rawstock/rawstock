const dayLastWeek = (days = -7) => {
  const dayOfLastWeek = new Date()
  dayOfLastWeek.setDate(dayOfLastWeek.getDate() + days)
  return dayOfLastWeek
}

const lastTddate = () => {
  const now = new Date()
  const dayOfWeek = now.getDay()
  if (dayOfWeek === 0) {
    return dayLastWeek(-2)
  } else {
    return dayLastWeek(-1)
  }
}

const formatDate = (date, splitChar) => {
  let month = date.getMonth() + 1
  let day = date.getDate()
  if (month < 10) {
    month = `0${month}`
  }
  if (day < 10) {
    day = `0${day}`
  }
  return `${date.getFullYear()}${splitChar || ''}${month}${splitChar || ''}${day}`
}

module.exports = {
  lastTddate,
  formatDate
}