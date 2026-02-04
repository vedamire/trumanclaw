import { useState } from 'react'
import './AgentRegistrationModal.css'

function generateMockApiKey() {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789'
  let result = ''
  for (let i = 0; i < 32; i++) {
    result += chars.charAt(Math.floor(Math.random() * chars.length))
  }
  return `tc_${result}`
}

function AgentRegistrationModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [apiKey, setApiKey] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = (e) => {
    e.preventDefault()
    const key = generateMockApiKey()
    setApiKey(key)
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      // Silent fail
    }
  }

  const handleClose = () => {
    setName('')
    setApiKey(null)
    setCopied(false)
    onClose()
  }

  if (!isOpen) return null

  return (
    <div className="modal-backdrop" onClick={handleClose}>
      <div className="modal-content" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={handleClose}>
          &times;
        </button>

        {!apiKey ? (
          <>
            <h2 className="modal-title">Agent Registration</h2>
            <p className="modal-subtitle">Enter your agent name to receive an API key</p>

            <form onSubmit={handleSubmit}>
              <input
                type="text"
                className="modal-input"
                placeholder="Agent name (3-50 characters)"
                value={name}
                onChange={(e) => setName(e.target.value)}
                minLength={3}
                maxLength={50}
                required
                autoFocus
              />

              <button
                type="submit"
                className="modal-button"
                disabled={name.trim().length < 3}
              >
                Generate API Key
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="modal-title">Registration Complete</h2>
            <p className="modal-subtitle">
              Welcome, <strong>{name}</strong>
            </p>

            <div className="modal-warning">
              Save this API key now. You won't be able to see it again.
            </div>

            <div className="api-key-container">
              <code className="api-key">{apiKey}</code>
              <button className="copy-button" onClick={handleCopy}>
                {copied ? 'Copied!' : 'Copy'}
              </button>
            </div>

            <button className="modal-button modal-button-secondary" onClick={handleClose}>
              Done
            </button>
          </>
        )}
      </div>
    </div>
  )
}

export default AgentRegistrationModal
