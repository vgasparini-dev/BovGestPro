import { useState } from 'react';
import {
  Users, Plus, Edit, Trash2, Search, Shield, UserCheck,
  UserX, Eye, EyeOff, AlertTriangle, X, CheckCircle2,
  Crown, Stethoscope, Clock
} from 'lucide-react';
import type { AppUser, UserRole, UserStatus } from '../types';

type Props = {
  users: AppUser[];
  onSave: (u: AppUser, isNew: boolean) => void;
  onDelete: (id: number) => void;
  adminEmail: string;
};

const ROLE_META: Record<UserRole, { label: string; bg: string; text: string; icon: typeof Shield }> = {
  Admin:      { label: 'Admin',      bg: 'bg-purple-100', text: 'text-purple-700', icon: Crown },
  Operador:   { label: 'Operador',   bg: 'bg-blue-100',   text: 'text-blue-700',   icon: UserCheck },
  Veterinario:{ label: 'Veterinário',bg: 'bg-teal-100',   text: 'text-teal-700',   icon: Stethoscope },
};

function RoleBadge({ role }: { role: UserRole }) {
  const m = ROLE_META[role];
  const Icon = m.icon;
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold ${m.bg} ${m.text}`}>
      <Icon size={10} />{m.label}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold
      ${status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-muted text-muted-foreground'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Ativo' ? 'bg-green-500' : 'bg-muted-foreground'}`} />
      {status}
    </span>
  );
}

function UserAvatar({ nome, size = 'md' }: { nome: string; size?: 'sm' | 'md' }) {
  const colors = ['bg-purple-100 text-purple-700', 'bg-blue-100 text-blue-700', 'bg-pink-100 text-pink-700', 'bg-amber-100 text-amber-700', 'bg-teal-100 text-teal-700'];
  const idx = nome.charCodeAt(0) % colors.length;
  const cls = size === 'sm' ? 'w-8 h-8 text-xs' : 'w-10 h-10 text-sm';
  return (
    <div className={`${cls} ${colors[idx]} rounded-full flex items-center justify-center font-black shrink-0`}>
      {(nome || 'U')[0].toUpperCase()}
    </div>
  );
}

type FormData = Omit<AppUser, 'id'> & { id?: number };

function UserModal({ mode, initial, onClose, onSave, adminEmail }: {
  mode: 'create' | 'edit'; initial: FormData; onClose: () => void;
  onSave: (d: FormData) => void; adminEmail: string;
}) {
  const [form, setForm] = useState<FormData>(initial);
  const [showPass, setShowPass] = useState(false);
  const set = (k: keyof FormData, v: string) => setForm(p => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-lg flex items-center justify-center">
              <Users size={15} className="text-primary" />
            </div>
            <h2 className="font-black text-foreground">{mode === 'create' ? 'Novo Usuário' : 'Editar Usuário'}</h2>
          </div>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors">
            <X size={16} />
          </button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Nome Completo *</label>
            <input required value={form.nome} onChange={e => set('nome', e.target.value)}
              placeholder="Ex: João da Silva"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Email *</label>
            <input required type="email" value={form.email}
              disabled={mode === 'edit' && form.email === adminEmail}
              onChange={e => set('email', e.target.value)} placeholder="usuario@fazenda.com"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground disabled:opacity-60" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
              {mode === 'edit' ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
            </label>
            <div className="relative">
              <input required={mode === 'create'} type={showPass ? 'text' : 'password'}
                value={form.senha} onChange={e => set('senha', e.target.value)} placeholder="••••••••"
                className="w-full px-3 py-2.5 pr-10 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
              <button type="button" onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Cargo</label>
              <select value={form.role} onChange={e => set('role', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option>Admin</option>
                <option>Operador</option>
                <option>Veterinario</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
              <select value={form.status} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option>Ativo</option>
                <option>Inativo</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors">
              Cancelar
            </button>
            <button type="submit"
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
              {mode === 'create' ? 'Criar Usuário' : 'Salvar Alterações'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

function DeleteDialog({ user, onConfirm, onCancel }: {
  user: AppUser; onConfirm: () => void; onCancel: () => void;
}) {
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl p-7 text-center">
        <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={24} className="text-destructive" />
        </div>
        <h2 className="font-black text-lg text-foreground mb-1">Remover Usuário</h2>
        <p className="text-muted-foreground text-sm mb-6">
          Remover <span className="font-black text-foreground">{user.nome}</span>?<br />Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors">Cancelar</button>
          <button onClick={onConfirm} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2">
            <Trash2 size={14} /> Remover
          </button>
        </div>
      </div>
    </div>
  );
}

export default function UserManagementView({ users, onSave, onDelete, adminEmail }: Props) {
  const [search, setSearch] = useState('');
  const [filterRole, setFilterRole] = useState<string>('Todos');
  const [filterStatus, setFilterStatus] = useState<string>('Todos');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<AppUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<AppUser | null>(null);

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchQ = u.nome.toLowerCase().includes(q) || u.email.toLowerCase().includes(q);
    const matchRole = filterRole === 'Todos' || u.role === filterRole;
    const matchStatus = filterStatus === 'Todos' || u.status === filterStatus;
    return matchQ && matchRole && matchStatus;
  });

  const stats = {
    total: users.length,
    admins: users.filter(u => u.role === 'Admin').length,
    ativos: users.filter(u => u.status === 'Ativo').length,
    inativos: users.filter(u => u.status === 'Inativo').length,
  };

  const handleSave = (form: FormData) => {
    const isNew = modalMode === 'create';
    const user: AppUser = {
      id: form.id ?? Date.now(),
      nome: form.nome,
      email: form.email,
      senha: form.senha || editing?.senha || '',
      role: form.role as UserRole,
      status: form.status as UserStatus,
      criadoEm: form.criadoEm || new Date().toLocaleDateString('pt-BR'),
      ultimoAcesso: form.ultimoAcesso,
    };
    onSave(user, isNew);
    setModalMode(null);
    setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
            <Users size={22} className="text-primary" /> Gestão de Usuários
          </h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">Controle de acesso e permissões</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Novo Usuário
        </button>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Total', val: stats.total, icon: Users, color: 'bg-primary/10 text-primary' },
          { label: 'Admins', val: stats.admins, icon: Crown, color: 'bg-purple-100 text-purple-700' },
          { label: 'Ativos', val: stats.ativos, icon: CheckCircle2, color: 'bg-green-100 text-green-700' },
          { label: 'Inativos', val: stats.inativos, icon: UserX, color: 'bg-muted text-muted-foreground' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div>
              <p className="text-xl font-black text-foreground">{s.val}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
        <select value={filterRole} onChange={e => setFilterRole(e.target.value)}
          className="px-3 py-2.5 bg-card border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
          <option>Todos</option><option>Admin</option><option>Operador</option><option>Veterinario</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-card border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
          <option>Todos</option><option>Ativo</option><option>Inativo</option>
        </select>
      </div>

      {/* Table */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground">
            <Users size={32} className="mx-auto mb-3 opacity-30" />
            <p className="font-bold text-sm">{search ? 'Nenhum resultado.' : 'Nenhum usuário cadastrado.'}</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>
                  {['Usuário', 'Email', 'Cargo', 'Status', 'Criado em', 'Último Acesso', ''].map((h, i) => (
                    <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(u => (
                  <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-4">
                      <div className="flex items-center gap-3">
                        <UserAvatar nome={u.nome} />
                        <span className="font-bold text-sm text-foreground whitespace-nowrap">{u.nome}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 text-sm text-muted-foreground font-medium">{u.email}</td>
                    <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                    <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                    <td className="px-5 py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">
                      <div className="flex items-center gap-1"><Clock size={11} />{u.criadoEm || '—'}</div>
                    </td>
                    <td className="px-5 py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">{u.ultimoAcesso || '—'}</td>
                    <td className="px-5 py-4 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(u); setModalMode('edit'); }}
                          className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors" title="Editar">
                          <Edit size={14} />
                        </button>
                        <button onClick={() => setDeleteTarget(u)}
                          disabled={u.email === adminEmail}
                          className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed" title="Remover">
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">
          {filtered.length} de {users.length} usuário{users.length !== 1 ? 's' : ''}
        </div>
      </div>

      {/* Modals */}
      {modalMode && (
        <UserModal
          mode={modalMode}
          initial={editing ? { ...editing } : { nome: '', email: '', senha: '', role: 'Operador', status: 'Ativo', criadoEm: new Date().toLocaleDateString('pt-BR') }}
          onClose={() => { setModalMode(null); setEditing(null); }}
          onSave={handleSave}
          adminEmail={adminEmail}
        />
      )}
      {deleteTarget && (
        <DeleteDialog user={deleteTarget} onConfirm={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }} onCancel={() => setDeleteTarget(null)} />
      )}
    </div>
  );
}
