import React, { useState } from 'react'
import { InquiryForm } from './components/InquiryForm'
import Disclaimer from './components/Disclaimer'
import './styles/App.css'

const App: React.FC = () => {
  const [callSid, setCallSid] = useState<string | null>(null)
  const handleInquirySuccess = (callSid: string) => {
    setCallSid(callSid)
    console.log('Call initiated:', callSid)
  }

  return (
    <div className="app">
      <Disclaimer />
      <div className="app-container">
        <div className="app-main">
          <InquiryForm onSuccess={handleInquirySuccess} />
          {callSid && (
            <div className="call-status">
              <p>Call ID: {callSid}</p>
              <p className="status-text">Please answer your phone when it rings.</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

export default App
