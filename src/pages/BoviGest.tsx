import { useState, useEffect, useCallback } from 'react';
import {
  HeartPulse, Leaf, Syringe, Scale, Baby,
  Droplets, Package, Grid3X3, Settings, Bell,
} from 'lucide-react';
import { toast } from 'sonner';
import Sidebar, { type ViewKey } from '../components/Sidebar';
import { MobileMenuButton } from '../components/Sidebar';
import Dashboard from '../views/Dashboard';
import AnimaisView from '../views/AnimaisView';
import FinanceiroView from '../views/FinanceiroView';
import UserManagementView from '../views/UserManagementView';
import ConfinamentoView from '../views/ConfinamentoView';
import IndicesZootecnicosView from '../views/IndicesZootecnicosView';
import ComingSoon from '../views/ComingSoon';
import { demoData } from '../data/demo';
import type { AppData, CloudStatus, Animal, Financeiro, AppUser, Confinamento } from '../types';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import {
  fetchAnimais, upsertAnimal, deleteAnimal,
  fetchFinanceiro, upsertFinanceiro, deleteFinanceiro,
  fetchConfinamento, upsertConfinamento, deleteConfinamento,
  fetchProfiles,
} from '../services/dataService';

const SIDEBAR_COLLAPSED_KEY = 'bovigest_sidebar_collapsed';

export default function BoviGest() {
  const { profile, signOut } = useAuth();
  const [currentView, setCurrentView] = useState<ViewKey>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState<AppData>(demoData);
  const [cloud, setCloud] = useState<CloudStatus>('connecting');

  // ── Load persisted data + subscribe to Realtime ──────────────────────
  useEffect(() => {
    let active = true;
    setCloud('connecting');

    const loadAll = async () => {
      try {
        const [animais, financeiro, confinamento, usuarios] = await Promise.all([
          fetchAnimais(),
          fetchFinanceiro(),
          fetchConfinamento(),
          fetchProfiles(),
        ]);
        if (!active) return;
        setData((prev) => ({ ...prev, animais, financeiro, confinamento, usuarios }));
        setCloud('online');
      } catch (e) {
        console.error(e);
        if (active) setCloud('error');
      }
    };

    const reloadTable = async (table: 'animais' | 'financeiro' | 'confinamento') => {
      try {
        if (table === 'animais') {
          const r = await fetchAnimais();
          if (active) setData((p) => ({ ...p, animais: r }));
        } else if (table === 'financeiro') {
          const r = await fetchFinanceiro();
          if (active) setData((p) => ({ ...p, financeiro: r }));
        } else {
          const r = await fetchConfinamento();
          if (active) setData((p) => ({ ...p, confinamento: r }));
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadAll();

    const channel = supabase
      .channel('bovigest-business')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'animais' }, () => reloadTable('animais'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'financeiro' }, () => reloadTable('financeiro'))
      .on('postgres_changes', { event: '*', schema: 'public', table: 'confinamento' }, () => reloadTable('confinamento'))
      .subscribe();

    return () => {
      active = false;
      supabase.removeChannel(channel);
    };
  }, []);

  // ── Update last access on mount (best-effort) ───────────────────────
  useEffect(() => {
    if (!profile?.id) return;
    supabase
      .from('profiles')
      .update({ ultimo_acesso: new Date().toISOString() })
      .eq('id', profile.id)
      .then(({ error }) => { if (error) console.error(error); });
  }, [profile?.id]);

  // ── User CRUD (via backend function) ─────────────────────────────────
  const handleSaveUser = useCallback(async (user: AppUser, isNew: boolean) => {
    try {
      const { error } = await supabase.functions.invoke('manage-team-user', {
        body: {
          action: isNew ? 'create' : 'update',
          id: user.id,
          nome: user.nome,
          email: user.email,
          senha: user.senha,
          role: user.role,
          status: user.status,
        },
      });
      if (error) throw error;
      const usuarios = await fetchProfiles();
      setData((prev) => ({ ...prev, usuarios }));
      toast.success(isNew ? 'Usuário criado.' : 'Usuário atualizado.');
    } catch (e) {
      console.error(e);
      toast.error('Não foi possível salvar o usuário.');
    }
  }, []);

  const handleDeleteUser = useCallback(async (id: string) => {
    try {
      const { error } = await supabase.functions.invoke('manage-team-user', {
        body: { action: 'delete', id },
      });
      if (error) throw error;
      const usuarios = await fetchProfiles();
      setData((prev) => ({ ...prev, usuarios }));
      toast.success('Usuário removido.');
    } catch (e) {
      console.error(e);
      toast.error('Não foi possível remover o usuário.');
    }
  }, []);

  // ── Animal CRUD ──────────────────────────────────────────────────────
  const handleSaveAnimal = useCallback(async (animal: Animal, isNew: boolean) => {
    setData((prev) => ({
      ...prev,
      animais: isNew ? [animal, ...prev.animais] : prev.animais.map((a) => (a.id === animal.id ? animal : a)),
    }));
    try {
      await upsertAnimal(animal);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar o animal.');
      const animais = await fetchAnimais();
      setData((prev) => ({ ...prev, animais }));
    }
  }, []);

  const handleDeleteAnimal = useCallback(async (id: string) => {
    setData((prev) => ({ ...prev, animais: prev.animais.filter((a) => a.id !== id) }));
    try {
      await deleteAnimal(id);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao remover o animal.');
      const animais = await fetchAnimais();
      setData((prev) => ({ ...prev, animais }));
    }
  }, []);

  // ── Financial CRUD ──────────────────────────────────────────────────
  const handleSaveFinanceiro = useCallback(async (f: Financeiro, isNew: boolean) => {
    setData((prev) => ({
      ...prev,
      financeiro: isNew ? [f, ...prev.financeiro] : prev.financeiro.map((x) => (x.id === f.id ? f : x)),
    }));
    try {
      await upsertFinanceiro(f);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar o lançamento.');
      const financeiro = await fetchFinanceiro();
      setData((prev) => ({ ...prev, financeiro }));
    }
  }, []);

  const handleDeleteFinanceiro = useCallback(async (id: string) => {
    setData((prev) => ({ ...prev, financeiro: prev.financeiro.filter((f) => f.id !== id) }));
    try {
      await deleteFinanceiro(id);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao remover o lançamento.');
      const financeiro = await fetchFinanceiro();
      setData((prev) => ({ ...prev, financeiro }));
    }
  }, []);

  // ── Confinamento CRUD ────────────────────────────────────────────────
  const handleSaveConfinamento = useCallback(async (c: Confinamento, isNew: boolean) => {
    setData((prev) => ({
      ...prev,
      confinamento: isNew ? [c, ...prev.confinamento] : prev.confinamento.map((x) => (x.id === c.id ? c : x)),
    }));
    try {
      await upsertConfinamento(c);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao salvar o confinamento.');
      const confinamento = await fetchConfinamento();
      setData((prev) => ({ ...prev, confinamento }));
    }
  }, []);

  const handleDeleteConfinamento = useCallback(async (id: string) => {
    setData((prev) => ({ ...prev, confinamento: prev.confinamento.filter((c) => c.id !== id) }));
    try {
      await deleteConfinamento(id);
    } catch (e) {
      console.error(e);
      toast.error('Erro ao remover o confinamento.');
      const confinamento = await fetchConfinamento();
      setData((prev) => ({ ...prev, confinamento }));
    }
  }, []);

  const handleLogout = async () => {
    await signOut();
    // ProtectedRoute redirects to /login once the session clears.
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed((prev) => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      return next;
    });
  };

  const adminName = profile?.nome ?? '';
  const adminEmail = profile?.email ?? '';

  // ── View renderer ──────────────────────────────────────────────────
  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard data={data} cloud={cloud} adminName={adminName} onNavigateIndices={() => setCurrentView('indices')} />;
      case 'indices':
        return <IndicesZootecnicosView data={data} />;
      case 'animais':
        return <AnimaisView animals={data.animais} onSave={handleSaveAnimal} onDelete={handleDeleteAnimal} />;
      case 'financeiro':
        return <FinanceiroView financeiro={data.financeiro} onSave={handleSaveFinanceiro} onDelete={handleDeleteFinanceiro} />;
      case 'usuarios':
        return <UserManagementView users={data.usuarios} onSave={handleSaveUser} onDelete={handleDeleteUser} adminEmail={adminEmail} />;
      case 'confinamento':
        return <ConfinamentoView confinamento={data.confinamento} onSave={handleSaveConfinamento} onDelete={handleDeleteConfinamento} />;
      case 'reproducao': return <ComingSoon title="Reprodução" icon={HeartPulse} />;
      case 'pasto':      return <ComingSoon title="Pasto" icon={Leaf} />;
      case 'vacinacao':  return <ComingSoon title="Vacinação" icon={Syringe} />;
      case 'pesagem':    return <ComingSoon title="Pesagem" icon={Scale} />;
      case 'nascimentos':return <ComingSoon title="Nascimentos" icon={Baby} />;
      case 'leite':      return <ComingSoon title="Leite" icon={Droplets} />;
      case 'insumos':    return <ComingSoon title="Insumos" icon={Package} />;
      case 'lotes':      return <ComingSoon title="Lotes" icon={Grid3X3} />;
      case 'configuracoes': return <ComingSoon title="Configurações" icon={Settings} />;
      default:           return <Dashboard data={data} cloud={cloud} adminName={adminName} onNavigateIndices={() => setCurrentView('indices')} />;
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Sidebar
        current={currentView}
        onChange={setCurrentView}
        collapsed={sidebarCollapsed}
        onToggle={handleToggleSidebar}
        adminName={adminName}
        adminEmail={adminEmail}
        onLogout={handleLogout}
        mobileOpen={mobileOpen}
        onMobileClose={() => setMobileOpen(false)}
      />

      {/* Main area shifts right of sidebar on desktop */}
      <div
        className={`flex flex-col min-h-screen transition-all duration-200 ${sidebarCollapsed ? 'lg:ml-14' : 'lg:ml-60'}`}
      >
        {/* Top Header */}
        <header className="h-15 sticky top-0 z-20 bg-card border-b border-border flex items-center justify-between px-6 shrink-0" style={{ height: 'var(--header-height)' }}>
          <div className="flex items-center gap-3">
            <MobileMenuButton onClick={() => setMobileOpen(true)} />
            <div>
              <p className="font-black text-sm text-foreground leading-none">BoviGest PRO</p>
              <p className="text-[11px] text-muted-foreground font-medium capitalize">
                {currentView === 'usuarios' ? 'Gestão de Usuários' :
                 currentView === 'configuracoes' ? 'Configurações' :
                 currentView === 'indices' ? 'Índices Zootécnicos' :
                 currentView.charAt(0).toUpperCase() + currentView.slice(1)}
              </p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <button className="p-2 text-muted-foreground hover:text-foreground hover:bg-muted rounded-lg transition-colors relative">
              <Bell size={18} />
              {data.insumos.filter(i => Number(i.quantidade) <= Number(i.estoqueMinimo)).length > 0 && (
                <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-red-500 rounded-full" />
              )}
            </button>
            <div className="w-8 h-8 rounded-full bg-primary/10 text-primary font-black text-sm flex items-center justify-center">
              {adminName[0] ?? 'A'}
            </div>
          </div>
        </header>

        {/* Page content */}
        <main className="flex-1 p-6">
          {renderView()}
        </main>
      </div>
    </div>
  );
}
