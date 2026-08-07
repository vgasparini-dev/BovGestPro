import { useState, useEffect, useCallback } from 'react';
import { Bell } from 'lucide-react';
import { toast } from 'sonner';
import Sidebar, { type ViewKey } from '../components/Sidebar';
import { MobileMenuButton } from '../components/Sidebar';
import Dashboard from '../views/Dashboard';
import AnimaisView from '../views/AnimaisView';
import FinanceiroView from '../views/FinanceiroView';
import UserManagementView from '../views/UserManagementView';
import ConfinamentoView from '../views/ConfinamentoView';
import IndicesZootecnicosView from '../views/IndicesZootecnicosView';
import PesagemView from '../views/PesagemView';
import ReproducaoView from '../views/ReproducaoView';
import VacinacaoView from '../views/VacinacaoView';
import NascimentosView from '../views/NascimentosView';
import LeiteView from '../views/LeiteView';
import InsumosView from '../views/InsumosView';
import LotesView from '../views/LotesView';
import PastoView from '../views/PastoView';
import ConfiguracoesView from '../views/ConfiguracoesView';
import { demoData } from '../data/demo';
import type {
  AppData, CloudStatus, Animal, Financeiro, AppUser, Confinamento,
  Pesagem, Vacinacao, Nascimento, RegistroLeite, Insumo, Lote, Reproducao, Pasto,
} from '../types';
import { supabase } from '../integrations/supabase/client';
import { useAuth } from '../hooks/useAuth';
import {
  fetchAnimais, upsertAnimal, deleteAnimal,
  fetchFinanceiro, upsertFinanceiro, deleteFinanceiro,
  fetchConfinamento, upsertConfinamento, deleteConfinamento,
  fetchProfiles,
  fetchPesagens, upsertPesagem, deletePesagem,
  fetchVacinacoes, upsertVacinacao, deleteVacinacao,
  fetchNascimentos, upsertNascimento, deleteNascimento,
  fetchLeite, upsertLeite, deleteLeite,
  fetchInsumos, upsertInsumo, deleteInsumo,
  fetchLotes, upsertLote, deleteLote,
  fetchReproducao, upsertReproducao, deleteReproducao,
  fetchPastos, upsertPasto, deletePasto,
  updateProfileNome,
} from '../services/dataService';

const SIDEBAR_COLLAPSED_KEY = 'bovigest_sidebar_collapsed';

export default function BoviGest() {
  const { profile, signOut, refreshProfile } = useAuth();
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
        const [
          animais, financeiro, confinamento, usuarios,
          pesagens, vacinacoes, nascimentos, leite,
          insumos, lotes, reproducao, pastos,
        ] = await Promise.all([
          fetchAnimais(),
          fetchFinanceiro(),
          fetchConfinamento(),
          fetchProfiles(),
          fetchPesagens(),
          fetchVacinacoes(),
          fetchNascimentos(),
          fetchLeite(),
          fetchInsumos(),
          fetchLotes(),
          fetchReproducao(),
          fetchPastos(),
        ]);
        if (!active) return;
        setData((prev) => ({
          ...prev,
          animais, financeiro, confinamento, usuarios,
          pesagens, vacinacoes, nascimentos, leite,
          insumos, lotes, reproducao, pastos,
        }));
        setCloud('online');
      } catch (e) {
        console.error(e);
        if (active) setCloud('error');
      }
    };

    const reloadTable = async (table: string) => {
      try {
        const apply = <K extends keyof AppData>(key: K, rows: AppData[K]) => {
          if (active) setData((p) => ({ ...p, [key]: rows }));
        };
        switch (table) {
          case 'animais':      apply('animais', await fetchAnimais()); break;
          case 'financeiro':   apply('financeiro', await fetchFinanceiro()); break;
          case 'confinamento': apply('confinamento', await fetchConfinamento()); break;
          case 'pesagens':     apply('pesagens', await fetchPesagens()); break;
          case 'vacinacoes':   apply('vacinacoes', await fetchVacinacoes()); break;
          case 'nascimentos':  apply('nascimentos', await fetchNascimentos()); break;
          case 'leite':        apply('leite', await fetchLeite()); break;
          case 'insumos':      apply('insumos', await fetchInsumos()); break;
          case 'lotes':        apply('lotes', await fetchLotes()); break;
          case 'reproducao':   apply('reproducao', await fetchReproducao()); break;
          case 'pastos':       apply('pastos', await fetchPastos()); break;
        }
      } catch (e) {
        console.error(e);
      }
    };

    loadAll();

    const realtimeTables = [
      'animais', 'financeiro', 'confinamento', 'pesagens', 'vacinacoes',
      'nascimentos', 'leite', 'insumos', 'lotes', 'reproducao', 'pastos',
    ] as const;
    let channel = supabase.channel('bovigest-business');
    for (const t of realtimeTables) {
      channel = channel.on('postgres_changes', { event: '*', schema: 'public', table: t }, () => reloadTable(t));
    }
    channel.subscribe();

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

  // ── Generic CRUD factory (optimistic + rollback via refetch) ─────────
  const makeCrud = <K extends keyof AppData, T extends { id: string }>(
    key: K, upsert: (item: T) => Promise<unknown>, remove: (id: string) => Promise<void>, refetch: () => Promise<T[]>, label: string,
  ) => ({
    save: async (item: T, isNew: boolean) => {
      setData((prev) => ({
        ...prev,
        [key]: isNew
          ? [item, ...(prev[key] as unknown as T[])]
          : (prev[key] as unknown as T[]).map((x) => (x.id === item.id ? item : x)),
      }));
      try {
        await upsert(item);
      } catch (e) {
        console.error(e);
        toast.error(`Erro ao salvar ${label}.`);
        const rows = await refetch();
        setData((prev) => ({ ...prev, [key]: rows }));
      }
    },
    remove: async (id: string) => {
      setData((prev) => ({ ...prev, [key]: (prev[key] as unknown as T[]).filter((x) => x.id !== id) }));
      try {
        await remove(id);
      } catch (e) {
        console.error(e);
        toast.error(`Erro ao remover ${label}.`);
        const rows = await refetch();
        setData((prev) => ({ ...prev, [key]: rows }));
      }
    },
  });

  const pesagemCrud = useCallback(makeCrud<'pesagens', Pesagem>('pesagens', upsertPesagem, deletePesagem, fetchPesagens, 'a pesagem'), []);
  const vacinacaoCrud = useCallback(makeCrud<'vacinacoes', Vacinacao>('vacinacoes', upsertVacinacao, deleteVacinacao, fetchVacinacoes, 'a vacinação'), []);
  const nascimentoCrud = useCallback(makeCrud<'nascimentos', Nascimento>('nascimentos', upsertNascimento, deleteNascimento, fetchNascimentos, 'o nascimento'), []);
  const leiteCrud = useCallback(makeCrud<'leite', RegistroLeite>('leite', upsertLeite, deleteLeite, fetchLeite, 'a produção de leite'), []);
  const insumoCrud = useCallback(makeCrud<'insumos', Insumo>('insumos', upsertInsumo, deleteInsumo, fetchInsumos, 'o insumo'), []);
  const loteCrud = useCallback(makeCrud<'lotes', Lote>('lotes', upsertLote, deleteLote, fetchLotes, 'o lote'), []);
  const reproducaoCrud = useCallback(makeCrud<'reproducao', Reproducao>('reproducao', upsertReproducao, deleteReproducao, fetchReproducao, 'o registro reprodutivo'), []);
  const pastoCrud = useCallback(makeCrud<'pastos', Pasto>('pastos', upsertPasto, deletePasto, fetchPastos, 'o pasto'), []);

  // ── Perfil: salvar próprio nome ───────────────────────────────────────
  const handleSaveNome = useCallback(async (nome: string) => {
    if (!profile?.id) return;
    try {
      await updateProfileNome(profile.id, nome);
      await refreshProfile();
      toast.success('Nome atualizado.');
    } catch (e) {
      console.error(e);
      toast.error('Não foi possível atualizar o nome.');
    }
  }, [profile?.id, refreshProfile]);

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
      case 'reproducao':
        return <ReproducaoView reproducao={data.reproducao} onSave={reproducaoCrud.save} onDelete={reproducaoCrud.remove} />;
      case 'pasto':
        return <PastoView pastos={data.pastos} onSave={pastoCrud.save} onDelete={pastoCrud.remove} />;
      case 'vacinacao':
        return <VacinacaoView vacinacoes={data.vacinacoes} onSave={vacinacaoCrud.save} onDelete={vacinacaoCrud.remove} />;
      case 'pesagem':
        return <PesagemView pesagens={data.pesagens} onSave={pesagemCrud.save} onDelete={pesagemCrud.remove} />;
      case 'nascimentos':
        return <NascimentosView nascimentos={data.nascimentos} onSave={nascimentoCrud.save} onDelete={nascimentoCrud.remove} />;
      case 'leite':
        return <LeiteView leite={data.leite} onSave={leiteCrud.save} onDelete={leiteCrud.remove} />;
      case 'insumos':
        return <InsumosView insumos={data.insumos} onSave={insumoCrud.save} onDelete={insumoCrud.remove} />;
      case 'lotes':
        return <LotesView lotes={data.lotes} animais={data.animais} onSave={loteCrud.save} onDelete={loteCrud.remove} />;
      case 'configuracoes':
        return <ConfiguracoesView profile={profile} cloud={cloud} onSaveNome={handleSaveNome} onLogout={handleLogout} />;
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
