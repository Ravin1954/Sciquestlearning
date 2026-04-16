interface StepIndicatorProps {
  currentStep: 1 | 2
  role?: 'student' | 'instructor'
}

export default function StepIndicator({ currentStep, role }: StepIndicatorProps) {
  const steps = [
    { number: 1, label: 'Create Account' },
    { number: 2, label: role === 'instructor' ? 'Instructor Profile' : 'Your Profile' },
  ]

  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '0', marginBottom: '1.5rem' }}>
      {steps.map((step, i) => (
        <div key={step.number} style={{ display: 'flex', alignItems: 'center' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
            <div style={{
              width: '28px',
              height: '28px',
              borderRadius: '50%',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '0.8rem',
              fontWeight: 700,
              backgroundColor: currentStep === step.number ? '#00C2A8' : currentStep > step.number ? '#E0F7F4' : '#C5D5E4',
              color: currentStep === step.number ? '#0B1A2E' : currentStep > step.number ? '#00A896' : '#5a7a96',
              border: currentStep > step.number ? '2px solid #00C2A8' : 'none',
            }}>
              {currentStep > step.number ? '✓' : step.number}
            </div>
            <span style={{
              fontSize: '0.8rem',
              fontWeight: currentStep === step.number ? 600 : 400,
              color: currentStep === step.number ? '#0B1A2E' : '#5a7a96',
            }}>
              {step.label}
            </span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ width: '40px', height: '2px', backgroundColor: currentStep > 1 ? '#00A896' : '#C5D5E4', margin: '0 0.75rem' }} />
          )}
        </div>
      ))}
    </div>
  )
}
