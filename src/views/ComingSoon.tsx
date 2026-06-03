import type { FC } from 'react';
import { Construction } from 'lucide-react';

type Props = { title: string; icon: FC<{ size?: number; className?: string }>; description?: string };

export default function ComingSoon({ title, icon: Icon, description }: Props) {
  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] fade-in">
      <div className="text-center max-w-sm">
        <div className="w-20 h-20 bg-primary/10 rounded-3xl flex items-center justify-center mx-auto mb-6">
          <Icon size={36} className="text-primary" />
        </div>
        <h1 className="text-2xl font-black text-foreground mb-2">{title}</h1>
        <p className="text-muted-foreground font-medium mb-6">
          {description || 'Esta seção está em desenvolvimento e será disponibilizada em breve.'}
        </p>
        <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground text-xs font-bold px-4 py-2 rounded-full">
          <Construction size={13} />Em desenvolvimento
        </div>
      </div>
    </div>
  );
}
