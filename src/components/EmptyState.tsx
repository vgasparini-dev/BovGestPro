type IconType = React.ComponentType<{ size?: number; className?: string }>;

type Props = {
  icon: IconType;
  title: string;
  description?: string;
  /** 'panel' = tall centered block (page-level), 'row' = compact inline row (lists/tables). */
  variant?: 'panel' | 'row';
};

export default function EmptyState({ icon: Icon, title, description, variant = 'panel' }: Props) {
  if (variant === 'row') {
    return (
      <div className="px-5 py-8 text-center text-muted-foreground">
        <Icon size={24} className="mx-auto mb-2 opacity-30" />
        <p className="font-bold text-xs">{title}</p>
        {description && <p className="text-[11px] mt-0.5">{description}</p>}
      </div>
    );
  }

  return (
    <div className="py-16 text-center text-muted-foreground">
      <Icon size={32} className="mx-auto mb-3 opacity-30" />
      <p className="font-bold text-sm">{title}</p>
      {description && <p className="text-xs mt-1">{description}</p>}
    </div>
  );
}
