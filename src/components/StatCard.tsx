export type StatTone =
  | 'primary' | 'success' | 'warning' | 'danger' | 'info'
  | 'pink' | 'purple' | 'cyan' | 'teal' | 'indigo' | 'orange' | 'muted';

const TONE_CLASSES: Record<StatTone, string> = {
  primary: 'bg-primary/10 text-primary',
  success: 'bg-success-soft text-success-fg',
  warning: 'bg-warning-soft text-warning-fg',
  danger: 'bg-destructive-soft text-destructive-soft-fg',
  info: 'bg-info-soft text-info-fg',
  pink: 'bg-chip-pink-soft text-chip-pink-fg',
  purple: 'bg-chip-purple-soft text-chip-purple-fg',
  cyan: 'bg-chip-cyan-soft text-chip-cyan-fg',
  teal: 'bg-chip-teal-soft text-chip-teal-fg',
  indigo: 'bg-chip-indigo-soft text-chip-indigo-fg',
  orange: 'bg-chip-orange-soft text-chip-orange-fg',
  muted: 'bg-muted text-muted-foreground',
};

type IconType = React.ComponentType<{ size?: number; className?: string }>;

type Props = {
  icon: IconType;
  label: string;
  value: string | number;
  sub?: string;
  tone?: StatTone;
  /** Compact = inline icon+value row (used in stat grids); default = stacked KPI card. */
  variant?: 'stacked' | 'inline';
};

export default function StatCard({ icon: Icon, label, value, sub, tone = 'primary', variant = 'stacked' }: Props) {
  const toneClass = TONE_CLASSES[tone];

  if (variant === 'inline') {
    return (
      <div className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${toneClass}`}>
          <Icon size={18} />
        </div>
        <div className="min-w-0">
          <p className="text-lg font-black text-foreground truncate">{value}</p>
          <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide truncate">{label}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-card rounded-2xl border border-border p-5 card-hover shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${toneClass}`}>
        <Icon size={20} />
      </div>
      <p className="text-lg sm:text-xl font-black text-foreground leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground font-medium mt-0.5">{sub}</p>}
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}
