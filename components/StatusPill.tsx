interface StatusPillProps {
  text: string;
  variant?: 'success' | 'danger' | 'pending' | 'info';
}

export function StatusPill({ text, variant = 'info' }: StatusPillProps) {
  return <span className={`status-pill ${variant}`}>{text}</span>;
}
