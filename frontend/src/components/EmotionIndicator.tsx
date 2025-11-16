import React from 'react'
import './EmotionIndicator.css'

interface EmotionIndicatorProps {
  emotion: {
    label: string
    valence: number
    arousal: number
  }
}

const EmotionIndicator: React.FC<EmotionIndicatorProps> = ({ emotion }) => {
  const getEmotionColor = (label: string) => {
    const labelLower = label.toLowerCase()
    if (labelLower.includes('happy') || labelLower.includes('joy')) {
      return '#28a745'
    } else if (labelLower.includes('sad') || labelLower.includes('sorrow')) {
      return '#6c757d'
    } else if (labelLower.includes('angry') || labelLower.includes('anger')) {
      return '#dc3545'
    } else if (labelLower.includes('confused') || labelLower.includes('confusion')) {
      return '#ffc107'
    } else if (labelLower.includes('surprised') || labelLower.includes('surprise')) {
      return '#17a2b8'
    }
    return '#007bff'
  }

  return (
    <div className="emotion-indicator" role="status" aria-live="polite">
      <div className="emotion-header">Emotion Detected</div>
      <div
        className="emotion-label"
        style={{ color: getEmotionColor(emotion.label) }}
      >
        {emotion.label}
      </div>
      <div className="emotion-metrics">
        <div className="emotion-metric">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
            <span className="emotion-metric-label">Valence:</span>
            <span className="emotion-metric-value">{emotion.valence.toFixed(2)}</span>
          </div>
          <div className="emotion-bar">
            <div 
              className="emotion-bar-fill" 
              style={{ width: `${((emotion.valence + 1) / 2) * 100}%` }}
            />
          </div>
        </div>
        <div className="emotion-metric">
          <div style={{ display: 'flex', justifyContent: 'space-between', width: '100%', marginBottom: '4px' }}>
            <span className="emotion-metric-label">Arousal:</span>
            <span className="emotion-metric-value">{emotion.arousal.toFixed(2)}</span>
          </div>
          <div className="emotion-bar">
            <div 
              className="emotion-bar-fill" 
              style={{ width: `${((emotion.arousal + 1) / 2) * 100}%` }}
            />
          </div>
        </div>
      </div>
    </div>
  )
}

export default EmotionIndicator

