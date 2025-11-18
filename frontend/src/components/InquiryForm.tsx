import React, { useState } from 'react'
import { apiService } from '../services/apiService'
import './InquiryForm.css'

interface InquiryFormProps {
  onSuccess?: (callSid: string) => void
}

export const InquiryForm: React.FC<InquiryFormProps> = ({ onSuccess }) => {
  const [inquiryType, setInquiryType] = useState<'ca' | 'salon' | null>(null)
  const [name, setName] = useState('')
  const [phoneNumber, setPhoneNumber] = useState('')
  const [inquiryDetails, setInquiryDetails] = useState('')
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setIsSubmitting(true)

    if (!inquiryType) {
      setError('Please select an inquiry type')
      setIsSubmitting(false)
      return
    }

    if (!phoneNumber.trim()) {
      setError('Phone number is required')
      setIsSubmitting(false)
      return
    }

    if (!inquiryDetails.trim()) {
      setError('Please provide inquiry details')
      setIsSubmitting(false)
      return
    }

    try {
      const response = await apiService.submitInquiry({
        inquiryType,
        phoneNumber: phoneNumber.trim(),
        name: name.trim() || undefined,
        inquiryDetails: inquiryDetails.trim(),
      })

      setSuccess(true)
      if (onSuccess) {
        onSuccess(response.callSid)
      }

      // Reset form after 3 seconds
      setTimeout(() => {
        setInquiryType(null)
        setName('')
        setPhoneNumber('')
        setInquiryDetails('')
        setSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Error submitting inquiry:', err)
      setError(err.response?.data?.message || 'Failed to submit inquiry. Please try again.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (success) {
    return (
      <div className="inquiry-form success-message">
        <div className="success-icon">✓</div>
        <h2>Call Initiated!</h2>
        <p>Our AI agent is calling you now. Please answer your phone.</p>
        <p className="sub-text">You'll receive a call from our number shortly.</p>
      </div>
    )
  }

  return (
    <div className="inquiry-form">
      <h2>Get Started</h2>
      <p className="form-subtitle">Submit your inquiry and our AI agent will call you</p>

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>What are you inquiring about? *</label>
          <div className="inquiry-type-buttons">
            <button
              type="button"
              className={`inquiry-type-btn ${inquiryType === 'ca' ? 'active' : ''}`}
              onClick={() => setInquiryType('ca')}
            >
              <span className="icon">📊</span>
              <span className="label">Chartered Accountancy</span>
              <span className="sub-label">Business registration, taxes, compliance</span>
            </button>
            <button
              type="button"
              className={`inquiry-type-btn ${inquiryType === 'salon' ? 'active' : ''}`}
              onClick={() => setInquiryType('salon')}
            >
              <span className="icon">💇</span>
              <span className="label">Salon Appointment</span>
              <span className="sub-label">Book your appointment</span>
            </button>
          </div>
        </div>

        <div className="form-group">
          <label htmlFor="name">Your Name (Optional)</label>
          <input
            type="text"
            id="name"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="John Doe"
            disabled={isSubmitting}
          />
        </div>

        <div className="form-group">
          <label htmlFor="phone">Phone Number *</label>
          <input
            type="tel"
            id="phone"
            value={phoneNumber}
            onChange={(e) => setPhoneNumber(e.target.value)}
            placeholder="+1234567890"
            required
            disabled={isSubmitting}
          />
          <small>Include country code (e.g., +1 for US, +91 for India)</small>
        </div>

        <div className="form-group">
          <label htmlFor="details">Inquiry Details *</label>
          <textarea
            id="details"
            value={inquiryDetails}
            onChange={(e) => setInquiryDetails(e.target.value)}
            placeholder="Tell us about your inquiry. What do you need help with?"
            rows={4}
            required
            disabled={isSubmitting}
          />
        </div>

        {error && (
          <div className="error-message">
            {error}
          </div>
        )}

        <button
          type="submit"
          className="submit-btn"
          disabled={isSubmitting || !inquiryType || !phoneNumber.trim() || !inquiryDetails.trim()}
        >
          {isSubmitting ? 'Initiating Call...' : 'Submit & Receive Call'}
        </button>

        <p className="form-footer">
          By submitting, you agree to receive a call from our AI agent. 
          The call will begin shortly after submission.
        </p>
      </form>
    </div>
  )
}

