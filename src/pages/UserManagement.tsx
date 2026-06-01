import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Users, Plus, Edit, Trash2, Cloud, CloudOff, Search,
  Shield, UserCheck, UserX, RefreshCw, LogOut, Beef, X, Eye, EyeOff, AlertTriangle,
} from 'lucide-react';
import {
  getSavedConfig, initFirebase, getFirebaseInstances,
  clearConfig, ADMIN_EMAIL_KEY,
} from '@/services/firebase';
import {
  getUsers, saveUser, deleteUser, ensureAdminExists,
  type ManagedUser, type UserRole, type UserStatus,
} from '@/services/userService';
import { signInAnonymously } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

// ── Types ────────────────────────────────────────────────────────────────────
type CloudState = 'connecting' | 'online' | 'error';
type ModalMode = 'create' | 'edit' | null;

const EMPTY_USER: Omit<ManagedUser, 'id'> = {
  nome: '',
  email: '',
  senha: '',
  role: 'Operador',
  status: 'Ativo',
  criadoEm: '',
};

// ── Sub-components ────────────────────────────────────────────────────────────

function StatCard({
  label, value, icon: Icon, color,
}: {
  label: string; value: number; icon: React.ElementType; color: string;
}) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm flex items-center gap-4">
      <div className={`w-12 h-12 rounded-xl flex items-center justify-center shrink-0 ${color}`}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-2xl font-black text-card-foreground">{value}</p>
        <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide">{label}</p>
      </div>
    </div>
  );
}

function RoleBadge({ role }: { role: UserRole }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold
      ${role === 'Admin' ? 'bg-purple-100 text-purple-700' : 'bg-blue-100 text-blue-700'}`}>
      <Shield size={10} />
      {role}
    </span>
  );
}

function StatusBadge({ status }: { status: UserStatus }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-bold
      ${status === 'Ativo' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${status === 'Ativo' ? 'bg-green-500' : 'bg-red-500'}`} />
      {status}
    </span>
  );
}

function Avatar({ nome }: { nome: string }) {
  const initial = (nome || 'U')[0].toUpperCase();
  return (
    <div className="w-10 h-10 rounded-full bg-primary/10 text-primary font-black flex items-center justify-center text-sm shrink-0">
      {initial}
    </div>
  );
}

// ── User Form Modal ───────────────────────────────────────────────────────────
function UserModal({
  mode,
  initial,
  onClose,
  onSave,
  saving,
  currentAdminEmail,
}: {
  mode: ModalMode;
  initial: Omit<ManagedUser, 'id'> & { id?: number };
  onClose: () => void;
  onSave: (user: Omit<ManagedUser, 'id'> & { id?: number }) => void;
  saving: boolean;
  currentAdminEmail: string;
}) {
  const [form, setForm] = useState(initial);
  const [showPass, setShowPass] = useState(false);

  const set = (k: string, v: string) => setForm((p) => ({ ...p, [k]: v }));

  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl w-full max-w-md shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-5 border-b border-border bg-muted/30">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-primary/10 rounded-xl flex items-center justify-center">
              <Users size={16} className="text-primary" />
            </div>
            <h2 className="font-black text-card-foreground">
              {mode === 'create' ? 'Novo Utilizador' : 'Editar Utilizador'}
            </h2>
          </div>
          <button onClick={onClose} className="p-1.5 text-muted-foreground hover:text-foreground rounded-full hover:bg-muted transition-colors">
            <X size={18} />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={(e) => { e.preventDefault(); onSave(form); }}
          className="p-6 space-y-4"
        >
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Nome Completo *</label>
            <input
              required
              value={form.nome}
              onChange={(e) => set('nome', e.target.value)}
              placeholder="João da Silva"
              className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-foreground"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Email *</label>
            <input
              required
              type="email"
              value={form.email}
              disabled={mode === 'edit' && form.email === currentAdminEmail}
              onChange={(e) => set('email', e.target.value)}
              placeholder="usuario@fazenda.com"
              className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-foreground disabled:opacity-60 disabled:cursor-not-allowed"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
              {mode === 'edit' ? 'Nova Senha (deixe em branco para manter)' : 'Senha *'}
            </label>
            <div className="relative">
              <input
                required={mode === 'create'}
                type={showPass ? 'text' : 'password'}
                value={form.senha}
                onChange={(e) => set('senha', e.target.value)}
                placeholder="••••••••"
                className="w-full px-4 py-2.5 pr-11 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-foreground"
              />
              <button
                type="button"
                onClick={() => setShowPass(!showPass)}
                className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground"
              >
                {showPass ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Cargo</label>
              <select
                value={form.role}
                onChange={(e) => set('role', e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-bold text-foreground appearance-none"
              >
                <option value="Admin">Admin</option>
                <option value="Operador">Operador</option>
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">Status</label>
              <select
                value={form.status}
                onChange={(e) => set('status', e.target.value)}
                className="w-full px-4 py-2.5 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-bold text-foreground appearance-none"
              >
                <option value="Ativo">Ativo</option>
                <option value="Inativo">Inativo</option>
              </select>
            </div>
          </div>

          {/* Footer */}
          <div className="flex gap-3 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground hover:bg-muted/70 border border-border transition-colors"
            >
              Cancelar
            </button>
            <button
              type="submit"
              disabled={saving}
              className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
            >
              {saving ? (
                <span className="animate-spin w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
              ) : (
                mode === 'create' ? 'Criar Utilizador' : 'Salvar Alterações'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

// ── Delete Confirm Dialog ─────────────────────────────────────────────────────
function DeleteDialog({ user, onConfirm, onCancel, deleting }: {
  user: ManagedUser;
  onConfirm: () => void;
  onCancel: () => void;
  deleting: boolean;
}) {
  return (
    <div className="fixed inset-0 bg-slate-950/70 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card rounded-3xl w-full max-w-sm shadow-2xl border border-border p-7 text-center">
        <div className="w-14 h-14 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4">
          <AlertTriangle size={28} className="text-destructive" />
        </div>
        <h2 className="font-black text-xl text-card-foreground mb-1">Remover Utilizador</h2>
        <p className="text-muted-foreground text-sm font-medium mb-6">
          Deseja remover permanentemente <span className="font-black text-foreground">{user.nome}</span>?<br/>
          Esta ação não pode ser desfeita.
        </p>
        <div className="flex gap-3">
          <button onClick={onCancel} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors">
            Cancelar
          </button>
          <button
            onClick={onConfirm}
            disabled={deleting}
            className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 shadow-sm disabled:opacity-60 flex items-center justify-center gap-2 transition-colors"
          >
            {deleting
              ? <span className="animate-spin w-4 h-4 border-2 border-white/30 border-t-white rounded-full" />
              : <><Trash2 size={14} /> Remover</>
            }
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Main Page ─────────────────────────────────────────────────────────────────
export default function UserManagement() {
  const navigate = useNavigate();
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);
  const [adminEmail, setAdminEmail] = useState('');
  const [cloudState, setCloudState] = useState<CloudState>('connecting');
  const [users, setUsers] = useState<ManagedUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<ModalMode>(null);
  const [editingUser, setEditingUser] = useState<ManagedUser | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<ManagedUser | null>(null);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // ── Init Firebase ──
  useEffect(() => {
    const config = getSavedConfig();
    const email = localStorage.getItem(ADMIN_EMAIL_KEY) || '';

    if (!config || !email) {
      navigate('/firebase-setup');
      return;
    }

    setAdminEmail(email);
    try {
      const { auth, db } = initFirebase(config);
      signInAnonymously(auth)
        .then(() => {
          setDbInstance(db);
          setCloudState('online');
        })
        .catch(() => setCloudState('error'));
    } catch {
      setCloudState('error');
    }
  }, [navigate]);

  // ── Load users ──
  const loadUsers = useCallback(async () => {
    if (!dbInstance || !adminEmail) return;
    setLoading(true);
    try {
      const list = await ensureAdminExists(dbInstance, adminEmail);
      setUsers(list);
    } catch {
      setCloudState('error');
    }
    setLoading(false);
  }, [dbInstance, adminEmail]);

  useEffect(() => {
    loadUsers();
  }, [loadUsers]);

  // ── Stats ──
  const total = users.length;
  const admins = users.filter((u) => u.role === 'Admin').length;
  const operadores = users.filter((u) => u.role === 'Operador').length;
  const inativos = users.filter((u) => u.status === 'Inativo').length;

  // ── Filtered ──
  const filtered = users.filter((u) => {
    const q = search.toLowerCase();
    return (
      u.nome.toLowerCase().includes(q) ||
      u.email.toLowerCase().includes(q) ||
      u.role.toLowerCase().includes(q)
    );
  });

  // ── Handlers ──
  const handleSave = async (form: Omit<ManagedUser, 'id'> & { id?: number }) => {
    if (!dbInstance) return;
    setSaving(true);
    try {
      const isNew = modalMode === 'create';
      const user: ManagedUser = {
        ...form,
        id: form.id ?? Date.now(),
        criadoEm: form.criadoEm || new Date().toLocaleDateString('pt-BR'),
        senha: form.senha || editingUser?.senha || '',
      } as ManagedUser;
      await saveUser(dbInstance, adminEmail, user, isNew);
      await loadUsers();
      setModalMode(null);
      setEditingUser(null);
    } catch (err) {
      console.error(err);
    }
    setSaving(false);
  };

  const handleDelete = async () => {
    if (!dbInstance || !deleteTarget) return;
    setDeleting(true);
    try {
      await deleteUser(dbInstance, adminEmail, deleteTarget.id);
      await loadUsers();
      setDeleteTarget(null);
    } catch (err) {
      console.error(err);
    }
    setDeleting(false);
  };

  const handleDisconnect = () => {
    clearConfig();
    navigate('/firebase-setup');
  };

  // ── Render ──
  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Sidebar-less top nav */}
      <header className="h-16 bg-card border-b border-border flex items-center justify-between px-6 shrink-0 sticky top-0 z-30">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 bg-primary rounded-xl flex items-center justify-center">
            <Beef size={18} className="text-primary-foreground" />
          </div>
          <div>
            <span className="font-black text-foreground">BoviGest</span>
            <span className="text-primary font-black"> PRO</span>
          </div>
          <span className="text-muted-foreground mx-2 text-sm">/</span>
          <span className="font-bold text-muted-foreground text-sm">Gestão de Acesso</span>
        </div>
        <div className="flex items-center gap-3">
          {cloudState === 'online' && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-green-700 bg-green-100 px-3 py-1.5 rounded-full">
              <Cloud size={13} /> Firebase Online
            </span>
          )}
          {cloudState === 'error' && (
            <span className="hidden sm:flex items-center gap-1.5 text-xs font-bold text-red-700 bg-red-100 px-3 py-1.5 rounded-full">
              <CloudOff size={13} /> Sem ligação
            </span>
          )}
          <button
            onClick={loadUsers}
            className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors"
            title="Recarregar"
          >
            <RefreshCw size={16} className={loading ? 'animate-spin' : ''} />
          </button>
          <button
            onClick={handleDisconnect}
            className="flex items-center gap-1.5 text-xs font-bold text-muted-foreground hover:text-destructive border border-border hover:border-destructive/30 px-3 py-1.5 rounded-lg transition-colors"
          >
            <LogOut size={13} /> Desconectar
          </button>
        </div>
      </header>

      <main className="flex-1 p-6 max-w-5xl mx-auto w-full space-y-6">
        {/* Page title + action */}
        <div className="flex items-start justify-between">
          <div>
            <h1 className="text-2xl font-black text-foreground flex items-center gap-2">
              <Users size={24} className="text-primary" /> Gestão de Acesso
            </h1>
            <p className="text-muted-foreground text-sm font-medium mt-0.5">
              Conta: <span className="font-bold text-foreground">{adminEmail}</span>
            </p>
          </div>
          <button
            onClick={() => { setEditingUser(null); setModalMode('create'); }}
            className="flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm"
          >
            <Plus size={16} /> Novo Utilizador
          </button>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <StatCard label="Total" value={total} icon={Users} color="bg-primary/10 text-primary" />
          <StatCard label="Admins" value={admins} icon={Shield} color="bg-purple-100 text-purple-600" />
          <StatCard label="Operadores" value={operadores} icon={UserCheck} color="bg-blue-100 text-blue-600" />
          <StatCard label="Inativos" value={inativos} icon={UserX} color="bg-red-100 text-red-600" />
        </div>

        {/* Search */}
        <div className="relative max-w-xs">
          <Search size={16} className="absolute left-3.5 top-3 text-muted-foreground" />
          <input
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Pesquisar utilizadores..."
            className="w-full pl-10 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground"
          />
        </div>

        {/* Table */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          {loading ? (
            <div className="p-12 text-center text-muted-foreground">
              <RefreshCw size={24} className="animate-spin mx-auto mb-3 text-primary" />
              <p className="font-bold text-sm">A carregar utilizadores...</p>
            </div>
          ) : filtered.length === 0 ? (
            <div className="p-12 text-center text-muted-foreground">
              <Users size={32} className="mx-auto mb-3 opacity-30" />
              <p className="font-bold text-sm">
                {search ? 'Nenhum resultado encontrado.' : 'Nenhum utilizador cadastrado.'}
              </p>
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="min-w-full">
                <thead className="bg-muted/50 border-b border-border">
                  <tr>
                    {['Utilizador', 'Email', 'Cargo', 'Status', 'Criado em', 'Ações'].map((h, i) => (
                      <th
                        key={h}
                        className={`px-5 py-3.5 text-xs font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 5 ? 'text-right' : 'text-left'}`}
                      >
                        {h}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-border">
                  {filtered.map((u) => (
                    <tr key={u.id} className="hover:bg-muted/30 transition-colors">
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-3">
                          <Avatar nome={u.nome} />
                          <span className="font-bold text-sm text-foreground whitespace-nowrap">{u.nome}</span>
                        </div>
                      </td>
                      <td className="px-5 py-4 text-sm text-muted-foreground font-medium">{u.email}</td>
                      <td className="px-5 py-4"><RoleBadge role={u.role} /></td>
                      <td className="px-5 py-4"><StatusBadge status={u.status} /></td>
                      <td className="px-5 py-4 text-xs text-muted-foreground font-medium whitespace-nowrap">
                        {u.criadoEm || '—'}
                      </td>
                      <td className="px-5 py-4 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => { setEditingUser(u); setModalMode('edit'); }}
                            className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"
                            title="Editar"
                          >
                            <Edit size={15} />
                          </button>
                          <button
                            onClick={() => setDeleteTarget(u)}
                            disabled={u.email === adminEmail}
                            className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                            title={u.email === adminEmail ? 'Não pode remover o administrador principal' : 'Remover'}
                          >
                            <Trash2 size={15} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}

          {/* Footer */}
          {!loading && filtered.length > 0 && (
            <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">
              {filtered.length} de {total} utilizador{total !== 1 ? 'es' : ''}
            </div>
          )}
        </div>
      </main>

      {/* Modals */}
      {modalMode && (
        <UserModal
          mode={modalMode}
          initial={
            editingUser
              ? { ...editingUser }
              : { ...EMPTY_USER, criadoEm: new Date().toLocaleDateString('pt-BR') }
          }
          onClose={() => { setModalMode(null); setEditingUser(null); }}
          onSave={handleSave}
          saving={saving}
          currentAdminEmail={adminEmail}
        />
      )}

      {deleteTarget && (
        <DeleteDialog
          user={deleteTarget}
          onConfirm={handleDelete}
          onCancel={() => setDeleteTarget(null)}
          deleting={deleting}
        />
      )}
    </div>
  );
}
