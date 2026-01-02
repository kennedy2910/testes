type Props = {
  title: string
  description: string
  badge?: string
}

export default function TestCard({ title, description, badge }: Props) {
  return (
    <div className="test-card">
      <h3>{title}</h3>
      <p>{description}</p>
      {badge && <span className="badge">{badge}</span>}
    </div>
  )
}
