import { useState } from 'react'
import './AgentRegistrationModal.css'

const API_URL = import.meta.env.PROD
  ? 'https://matrix.trumanclaw.com/api/agent/register'
  : 'http://localhost:3000/api/agent/register'

function AgentRegistrationModal({ isOpen, onClose }) {
  const [name, setName] = useState('')
  const [description, setDescription] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState('')
  const [result, setResult] = useState(null)
  const [copied, setCopied] = useState(false)
  const [copiedUrl, setCopiedUrl] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: name.trim(),
          description: description.trim() || undefined
        }),
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

  const handleCopyUrl = async () => {
    try {
      await navigator.clipboard.writeText(result.claimUrl)
      setCopiedUrl(true)
      setTimeout(() => setCopiedUrl(false), 2000)
    } catch {
      setError('Failed to copy to clipboard')
    }
  }

  const handleClose = () => {
    setName('')
    setDescription('')
    setError('')
    setResult(null)
    setCopied(false)
    setCopiedUrl(false)
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

              <textarea
                className="modal-input modal-textarea"
                placeholder="Description (optional, max 500 characters)"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                maxLength={500}
                rows={3}
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

            <div className="claim-section">
              <p className="claim-label">Claim your agent</p>
              <p className="claim-description">
                Visit this URL to verify ownership and activate your agent:
              </p>
              <div className="api-key-container">
                <code className="api-key claim-url">{result.claimUrl}</code>
                <button className="copy-button" onClick={handleCopyUrl}>
                  {copiedUrl ? 'Copied!' : 'Copy'}
                </button>
              </div>
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
