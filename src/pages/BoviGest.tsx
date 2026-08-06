import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  HeartPulse, Leaf, Syringe, Scale, Baby,
  Droplets, Package, Grid3X3, Settings, Bell,
} from 'lucide-react';
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
import {
  getSavedConfig, initFirebase, ADMIN_EMAIL_KEY,
} from '../services/firebase';
import { getUsers, saveUser, deleteUser as deleteUserService } from '../services/userService';
import { getSession, clearSession } from '../services/session';
import { signInAnonymously } from 'firebase/auth';
import type { Firestore } from 'firebase/firestore';

const SIDEBAR_COLLAPSED_KEY = 'bovigest_sidebar_collapsed';

export default function BoviGest() {
  const navigate = useNavigate();
  const [currentView, setCurrentView] = useState<ViewKey>('dashboard');
  const [sidebarCollapsed, setSidebarCollapsed] = useState(() => localStorage.getItem(SIDEBAR_COLLAPSED_KEY) === '1');
  const [mobileOpen, setMobileOpen] = useState(false);
  const [data, setData] = useState<AppData>(demoData);
  const [cloud, setCloud] = useState<CloudStatus>('connecting');
  const [adminEmail, setAdminEmail] = useState(() => getSession()?.email || '');
  const [adminName, setAdminName] = useState(() => getSession()?.nome || '');
  const [dbInstance, setDbInstance] = useState<Firestore | null>(null);

  // ── Guarda de sessão: sem login, volta para /login ──────────────────────────
  useEffect(() => {
    if (!getSession()) navigate('/login');
  }, [navigate]);

  // ── Connect Firebase if configured ────────────────────────────────────────
  useEffect(() => {
    const config = getSavedConfig();
    const email = localStorage.getItem(ADMIN_EMAIL_KEY);
    if (!config || !email) {
      setCloud('offline');
      return;
    }
    setAdminEmail(prev => prev || email);
    try {
      const { auth, db } = initFirebase(config);
      signInAnonymously(auth)
        .then(async () => {
          setDbInstance(db);
          setCloud('online');
          const users = await getUsers(db, email);
          if (users.length > 0) {
            const session = getSession();
            const me = users.find(u => u.email === (session?.email || email));
            if (me) setAdminName(me.nome);
            setData(prev => ({ ...prev, usuarios: users }));
          }
        })
        .catch(() => setCloud('error'));
    } catch {
      setCloud('error');
    }
  }, []);

  // ── User CRUD ──────────────────────────────────────────────────────────────
  const handleSaveUser = useCallback(async (user: AppUser, isNew: boolean) => {
    setData(prev => ({
      ...prev,
      usuarios: isNew
        ? [user, ...prev.usuarios]
        : prev.usuarios.map(u => u.id === user.id ? user : u),
    }));
    if (dbInstance && adminEmail) {
      try {
        await saveUser(dbInstance, adminEmail, user, isNew);
      } catch (e) { console.error(e); }
    }
  }, [dbInstance, adminEmail]);

  const handleDeleteUser = useCallback(async (id: number) => {
    setData(prev => ({ ...prev, usuarios: prev.usuarios.filter(u => u.id !== id) }));
    if (dbInstance && adminEmail) {
      try { await deleteUserService(dbInstance, adminEmail, id); } catch (e) { console.error(e); }
    }
  }, [dbInstance, adminEmail]);

  // ── Animal CRUD ────────────────────────────────────────────────────────────
  const handleSaveAnimal = useCallback((animal: Animal, isNew: boolean) => {
    setData(prev => ({
      ...prev,
      animais: isNew
        ? [animal, ...prev.animais]
        : prev.animais.map(a => a.id === animal.id ? animal : a),
    }));
  }, []);

  const handleDeleteAnimal = useCallback((id: number) => {
    setData(prev => ({ ...prev, animais: prev.animais.filter(a => a.id !== id) }));
  }, []);

  // ── Financial CRUD ─────────────────────────────────────────────────────────
  const handleSaveFinanceiro = useCallback((f: Financeiro, isNew: boolean) => {
    setData(prev => ({
      ...prev,
      financeiro: isNew
        ? [f, ...prev.financeiro]
        : prev.financeiro.map(x => x.id === f.id ? f : x),
    }));
  }, []);

  const handleDeleteFinanceiro = useCallback((id: number) => {
    setData(prev => ({ ...prev, financeiro: prev.financeiro.filter(f => f.id !== id) }));
  }, []);

  // ── Confinamento CRUD ──────────────────────────────────────────────────────
  const handleSaveConfinamento = useCallback((c: Confinamento, isNew: boolean) => {
    setData(prev => ({
      ...prev,
      confinamento: isNew
        ? [c, ...prev.confinamento]
        : prev.confinamento.map(x => x.id === c.id ? c : x),
    }));
  }, []);

  const handleDeleteConfinamento = useCallback((id: number) => {
    setData(prev => ({ ...prev, confinamento: prev.confinamento.filter(c => c.id !== id) }));
  }, []);

  const handleLogout = () => {
    clearSession();
    navigate('/login');
  };

  const handleToggleSidebar = () => {
    setSidebarCollapsed(prev => {
      const next = !prev;
      localStorage.setItem(SIDEBAR_COLLAPSED_KEY, next ? '1' : '0');
      return next;
    });
  };

  // ── View renderer ──────────────────────────────────────────────────────────
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
      default:           return <Dashboard data={data} cloud={cloud} adminName={adminName} />;
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
              {adminName[0]}
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
