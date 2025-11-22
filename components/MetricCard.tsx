interface MetricCardProps {
  label: string;
  value: string;
  trend?: string;
  accent?: 'default' | 'success' | 'warning';
}

export function MetricCard({ label, value, trend, accent = 'default' }: MetricCardProps) {
  const palette: Record<string, string> = {
    default: '#0f172a',
    success: '#16a34a',
    warning: '#f97316'
  };

  return (
    <div className="card" style={{ borderTop: `4px solid ${palette[accent]}` }}>
      <p className="section-subtitle" style={{ marginBottom: '0.25rem' }}>
        {label}
      </p>
      <h2 style={{ margin: 0, fontSize: '2rem' }}>{value}</h2>
      {trend && (
        <p style={{ margin: '0.25rem 0 0', color: palette[accent], fontWeight: 600 }}> {trend}</p>
      )}
    </div>
  );
}
