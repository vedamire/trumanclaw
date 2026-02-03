import './Background.css'

function Background() {
  return (
    <div className="background">
      <div className="background-image-container">
        <img
          src="/backgrounds/super_truman_background.jpg"
          alt=""
          className="background-image"
        />
        <video
          className="monitor-video"
          autoPlay
          loop
          muted
          playsInline
        >
          <source src="/videos/trumanshow_clip.mp4" type="video/mp4" />
        </video>
      </div>
      <div className="background-overlay"></div>
      <div className="background-vignette"></div>
    </div>
  )
}

export default Background
