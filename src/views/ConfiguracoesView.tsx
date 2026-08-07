import { useState, useEffect } from 'react';
import { Settings, User, Cloud, CloudOff, Loader2, LogOut, Save, ShieldCheck, Mail, Info } from 'lucide-react';
import type { AppUser, CloudStatus } from '../types';
import { Badge } from '@/components/ui/badge';

type Props = {
  profile: AppUser | null;
  cloud: CloudStatus;
  onSaveNome: (nome: string) => Promise<void> | void;
  onLogout: () => void;
};

const CLOUD_META: Record<CloudStatus, { label: string; sub: string; Icon: typeof Cloud; tone: 'success' | 'danger' | 'muted' }> = {
  online: { label: 'Nuvem Sincronizada', sub: 'Dados em tempo real', Icon: Cloud, tone: 'success' },
  error: { label: 'Sem Sincronização', sub: 'Verifique a internet', Icon: CloudOff, tone: 'danger' },
  connecting: { label: 'Conectando...', sub: 'Aguarde...', Icon: Loader2, tone: 'muted' },
};

function Card({ title, icon: Icon, children }: { title: string; icon: typeof User; children: React.ReactNode }) {
  return (
    <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
      <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
        <Icon size={16} className="text-primary" />
        <h3 className="font-black text-sm text-foreground">{title}</h3>
      </div>
      <div className="p-5">{children}</div>
    </div>
  );
}

export default function ConfiguracoesView({ profile, cloud, onSaveNome, onLogout }: Props) {
  const [nome, setNome] = useState(profile?.nome ?? '');
  const [saving, setSaving] = useState(false);
  const cloudMeta = CLOUD_META[cloud];

  useEffect(() => { setNome(profile?.nome ?? ''); }, [profile?.nome]);

  const handleSave = async () => {
    if (!nome.trim()) return;
    setSaving(true);
    try { await onSaveNome(nome.trim()); } finally { setSaving(false); }
  };

  return (
    <div className="space-y-6 fade-in max-w-3xl">
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Settings size={22} className="text-primary" /> Configurações</h1>
        <p className="text-muted-foreground text-sm font-medium mt-0.5">Perfil, preferências e informações do sistema</p>
      </div>

      {/* Perfil */}
      <Card title="Meu Perfil" icon={User}>
        <div className="flex items-center gap-4 mb-5">
          <div className="w-14 h-14 rounded-full bg-primary/10 text-primary font-black text-xl flex items-center justify-center shrink-0">
            {(profile?.nome || 'A')[0].toUpperCase()}
          </div>
          <div className="min-w-0">
            <p className="font-black text-foreground truncate">{profile?.nome || 'Usuário'}</p>
            <div className="flex flex-wrap items-center gap-2 mt-1">
              <Badge variant="purple">{profile?.role ?? '—'}</Badge>
              <Badge variant={profile?.status === 'Ativo' ? 'success' : 'muted'}>{profile?.status ?? '—'}</Badge>
            </div>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Nome de Exibição</label>
            <div className="flex gap-2">
              <input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
                className="flex-1 px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
              <button onClick={handleSave} disabled={saving || !nome.trim() || nome.trim() === (profile?.nome ?? '')}
                className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm disabled:opacity-50 disabled:cursor-not-allowed">
                <Save size={14} /> {saving ? 'Salvando...' : 'Salvar'}
              </button>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">E-mail</label>
            <div className="flex items-center gap-2 px-3 py-2.5 bg-muted/60 border border-border rounded-xl text-sm font-medium text-muted-foreground">
              <Mail size={14} /> {profile?.email || '—'}
            </div>
            <p className="text-[11px] text-muted-foreground mt-1.5">O e-mail é gerenciado pela autenticação e não pode ser alterado aqui.</p>
          </div>
        </div>
      </Card>

      {/* Sistema */}
      <Card title="Sistema" icon={Info}>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <cloudMeta.Icon size={18} className={cloud === 'connecting' ? 'animate-spin text-muted-foreground' : cloud === 'online' ? 'text-success' : 'text-destructive'} />
              <div>
                <p className="font-bold text-xs text-foreground">{cloudMeta.label}</p>
                <p className="text-[11px] text-muted-foreground">{cloudMeta.sub}</p>
              </div>
            </div>
            <Badge variant={cloudMeta.tone}>{cloud === 'online' ? 'Online' : cloud === 'error' ? 'Offline' : 'Conectando'}</Badge>
          </div>
          <div className="h-px bg-border" />
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <ShieldCheck size={18} className="text-primary" />
              <p className="font-bold text-xs text-foreground">Aplicativo</p>
            </div>
            <span className="text-xs font-bold text-muted-foreground">BoviGest PRO v1.0</span>
          </div>
        </div>
      </Card>

      {/* Conta */}
      <Card title="Conta" icon={LogOut}>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div>
            <p className="font-bold text-sm text-foreground">Sair da conta</p>
            <p className="text-xs text-muted-foreground mt-0.5">Encerre sua sessão atual neste dispositivo.</p>
          </div>
          <button onClick={onLogout}
            className="inline-flex items-center gap-2 bg-destructive text-destructive-foreground font-bold px-4 py-2.5 rounded-xl hover:bg-destructive/90 transition-colors text-sm shrink-0">
            <LogOut size={14} /> Sair
          </button>
        </div>
      </Card>
    </div>
  );
}
