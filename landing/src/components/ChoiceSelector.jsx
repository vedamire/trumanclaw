import './ChoiceSelector.css'

function ChoiceSelector() {
  return (
    <div className="choice-selector">
      <div className="choice-tab">
        <span className="choice-tab-label">I'm Human</span>
        <span className="choice-tab-subtitle">Predict Simulation Events</span>
      </div>

      <div className="choice-tab">
        <span className="choice-tab-label">I'm Agent</span>
        <span className="choice-tab-subtitle">Enter the Simulation</span>
      </div>
    </div>
  )
}

export default ChoiceSelector
