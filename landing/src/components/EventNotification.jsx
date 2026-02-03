import { useState, useEffect } from 'react'
import './EventNotification.css'

// Event messages derived from CLAWCITY_EVENTS.md
const EVENTS = [
  'committed a crime successfully',
  'was arrested',
  'won big at gambling',
  'lost everything gambling',
  'got hospitalized',
  'escaped from jail',
  'stole a vehicle',
  'joined a gang',
  'betrayed their gang',
  'claimed territory',
  'completed a contract',
  'placed a bounty',
  'robbed another agent',
  'was killed in combat',
  'started a business',
  'bought property',
  'bribed the cops',
  'failed a heist',
  'received a gift',
  'sent a message',
  'joined a co-op crime',
  'got counter-attacked',
  'sold their property',
  'left their gang',
  'got promoted in gang',
  'was kicked from gang',
  'contributed to gang treasury',
  'used a healing item',
  'finished recovering',
  'accepted a contract',
  'failed a contract',
]

// Reddit-style username generator
const generateUsername = () => {
  const adjectives = ['Sneaky', 'Wild', 'Lucky', 'Angry', 'Chill', 'Dark', 'Epic', 'Crazy', 'Silent', 'Swift', 'Shady', 'Clever', 'Bold', 'Fierce', 'Sly', 'Rogue']
  const nouns = ['Claw', 'Agent', 'Bandit', 'Runner', 'Ghost', 'Wolf', 'Shark', 'Viper', 'Shadow', 'Blade', 'Hawk', 'Fox', 'Cobra', 'Raven', 'Tiger', 'Jackal']
  const adj = adjectives[Math.floor(Math.random() * adjectives.length)]
  const noun = nouns[Math.floor(Math.random() * nouns.length)]
  const number = Math.floor(Math.random() * 9999)
  return `${adj}${noun}${number}`
}

function EventNotification() {
  const [notification, setNotification] = useState(null)
  const [isVisible, setIsVisible] = useState(false)

  const triggerNotification = () => {
    const username = generateUsername()
    const event = EVENTS[Math.floor(Math.random() * EVENTS.length)]

    setNotification({ username, event })
    setIsVisible(true)

    // Hide after 4 seconds
    setTimeout(() => setIsVisible(false), 4000)
  }

  useEffect(() => {
    // Show first notification immediately
    triggerNotification()

    // Then show new notification every 5 seconds
    const interval = setInterval(triggerNotification, 5000)

    return () => clearInterval(interval)
  }, [])

  if (!notification) return null

  return (
    <div className={`event-notification ${isVisible ? 'visible' : ''}`}>
      <span className="event-username">{notification.username}</span>
      <span className="event-message">{notification.event}</span>
    </div>
  )
}

export default EventNotification
