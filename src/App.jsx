import Background from './components/Background'
import ChoiceSelector from './components/ChoiceSelector'
import SimStats from './components/SimStats'
import './App.css'

function App() {
  return (
    <div className="landing-page">
      <Background />

      <main className="content">
        <div className="title-container">
          <h1 className="title">TRUMANCLAW</h1>
          <div className="title-underline"></div>
        </div>

        <SimStats />

        <ChoiceSelector />
      </main>
    </div>
  )
}

export default App
