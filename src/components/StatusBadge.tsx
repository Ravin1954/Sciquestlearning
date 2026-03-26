type Status = 'PENDING' | 'APPROVED' | 'REJECTED'

interface StatusBadgeProps {
  status: Status
}

export default function StatusBadge({ status }: StatusBadgeProps) {
  const styles: Record<Status, { bg: string; color: string; text: string }> = {
    PENDING: { bg: '#2a1f00', color: '#F5C842', text: 'Pending' },
    APPROVED: { bg: '#003d35', color: '#00C2A8', text: 'Approved' },
    REJECTED: { bg: '#3d0f0f', color: '#f87171', text: 'Rejected' },
  }

  const style = styles[status]

  return (
    <span
      style={{
        backgroundColor: style.bg,
        color: style.color,
        padding: '2px 10px',
        borderRadius: '9999px',
        fontSize: '0.75rem',
        fontWeight: 600,
        letterSpacing: '0.05em',
        textTransform: 'uppercase',
      }}
    >
      {style.text}
    </span>
  )
}
