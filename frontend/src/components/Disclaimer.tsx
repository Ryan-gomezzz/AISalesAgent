import React from 'react'
import './Disclaimer.css'

const Disclaimer: React.FC = () => {
  return (
    <div className="disclaimer" role="alert" aria-live="polite">
      <strong>Disclaimer:</strong> This assistant does not provide legal or financial advice.
      For regulated advice, please consult a qualified professional.
    </div>
  )
}

export default Disclaimer

