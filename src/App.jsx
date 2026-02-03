import Background from './components/Background'
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

        <button className="cta-button">
          Enter Trumanclaw
        </button>
      </main>
    </div>
  )
}

export default App
