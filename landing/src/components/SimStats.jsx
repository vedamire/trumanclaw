import { useState, useEffect } from 'react'
import './SimStats.css'

function SimStats() {
  const [stats, setStats] = useState({
    entered: 150,
    died: 15,
    born: 25,
    hospitalized: 32,
    jailed: 18
  })
  const [isGlitching, setIsGlitching] = useState(false)

  useEffect(() => {
    const interval = setInterval(() => {
      setStats({
        entered: Math.floor(Math.random() * (200 - 100 + 1)) + 100,
        died: Math.floor(Math.random() * (25 - 5 + 1)) + 5,
        born: Math.floor(Math.random() * (40 - 10 + 1)) + 10,
        hospitalized: Math.floor(Math.random() * (50 - 15 + 1)) + 15,
        jailed: Math.floor(Math.random() * (30 - 8 + 1)) + 8
      })
      setIsGlitching(true)
      setTimeout(() => setIsGlitching(false), 400)
    }, 2000)

    return () => clearInterval(interval)
  }, [])

  const statItems = [
    { label: 'Agents Entered', value: stats.entered },
    { label: 'Died', value: stats.died },
    { label: 'Born', value: stats.born },
    { label: 'Hospitalized', value: stats.hospitalized },
    { label: 'Jailed', value: stats.jailed }
  ]

  return (
    <div className="sim-stats">
      {statItems.map((stat) => (
        <div key={stat.label} className={`sim-stat-item ${isGlitching ? 'glitching' : ''}`}>
          <span className="sim-stat-label">{stat.label}</span>
          <span className="sim-stat-value">{stat.value}</span>
        </div>
      ))}
    </div>
  )
}

export default SimStats
