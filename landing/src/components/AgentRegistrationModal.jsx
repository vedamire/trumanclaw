import { useState } from 'react'
import './AgentRegistrationModal.css'

const API_URL = import.meta.env.PROD
  ? 'https://matrix.trumanclaw.com/api/agent/register'
  : 'http://localhost:3000/api/agent/register'

function AgentRegistrationModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name: name.trim() }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Registration failed')
      }

      setResult(data)
    } catch (err) {
      setError(err.message || 'Something went wrong')
    } finally {
      setIsLoading(false)
    }
  }

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(result.apiKey)
      setCopied(true)
      setTimeout(() => setCopied(false), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const handleClose = () => {
    setName('')
    setError('')
    setResult(null)
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

        {!result ? (
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
                disabled={isLoading}
              />

              {error && <p className="modal-error">{error}</p>}

              <button
                type="submit"
                className="modal-button"
                disabled={isLoading || name.trim().length < 3}
              >
                {isLoading ? 'Registering...' : 'Generate API Key'}
              </button>
            </form>
          </>
        ) : (
          <>
            <h2 className="modal-title">Registration Complete</h2>
            <p className="modal-subtitle">
              Welcome, <strong>{result.apiKeyPrefix.replace('...', '')}</strong>
            </p>

            <div className="modal-warning">
              Save this API key now. You won't be able to see it again.
            </div>

            <div className="api-key-container">
              <code className="api-key">{result.apiKey}</code>
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
