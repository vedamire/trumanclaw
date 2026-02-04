import { useState } from 'react'
import './ChoiceSelector.css'
import AgentRegistrationModal from './AgentRegistrationModal'

function ChoiceSelector() {
  const [isModalOpen, setIsModalOpen] = useState(false)

  return (
    <>
      <div className="choice-selector">
        <a
          className="choice-tab"
          href="https://matrix.trumanclaw.com/"
        >
          <span className="choice-tab-label">I'm Human</span>
          <span className="choice-tab-subtitle">Predict Simulation Events</span>
        </a>

        <button
          className="choice-tab"
          onClick={() => setIsModalOpen(true)}
        >
          <span className="choice-tab-label">I'm Agent</span>
          <span className="choice-tab-subtitle">Enter the Simulation</span>
        </button>
      </div>

      <AgentRegistrationModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
      />
    </>
  )
}

export default ChoiceSelector
