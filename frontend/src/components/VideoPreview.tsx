import React from 'react'
import './VideoPreview.css'

interface VideoPreviewProps {
  videoRef: React.RefObject<HTMLVideoElement>
  isEnabled: boolean
  onToggle: () => void
}

const VideoPreview: React.FC<VideoPreviewProps> = ({ videoRef, isEnabled, onToggle }) => {
  return (
    <div className="video-preview">
      <div className="video-container">
        {isEnabled ? (
          <video
            ref={videoRef}
            autoPlay
            playsInline
            muted
            className="video-element"
            aria-label="Video preview"
          />
        ) : (
          <div className="video-placeholder" aria-label="Video disabled">
            <span>Video Off</span>
          </div>
        )}
      </div>
      <button
        onClick={onToggle}
        className={`video-toggle ${isEnabled ? 'enabled' : 'disabled'}`}
        aria-label={isEnabled ? 'Disable video' : 'Enable video'}
        aria-pressed={isEnabled}
      >
        {isEnabled ? 'Stop Video' : 'Start Video'}
      </button>
    </div>
  )
}

export default VideoPreview

