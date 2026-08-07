import { type FC } from 'react';
import {
  LayoutDashboard, Beef, HeartPulse, Leaf, Syringe,
  Scale, Baby, Droplets, DollarSign, Package, Grid3X3,
  Users, Settings, ChevronLeft, ChevronRight, Menu, X, LogOut,
  Warehouse, Gauge,
} from 'lucide-react';

export type ViewKey =
  | 'dashboard' | 'indices' | 'animais' | 'reproducao' | 'pasto'
  | 'vacinacao' | 'pesagem' | 'nascimentos' | 'leite'
  | 'financeiro' | 'insumos' | 'lotes' | 'confinamento' | 'usuarios' | 'configuracoes';

type NavItem = {
  key: ViewKey;
  label: string;
  icon: FC<{ size?: number; className?: string }>;
  section?: string;
};

const NAV: NavItem[] = [
  { key: 'dashboard',    label: 'Dashboard',       icon: LayoutDashboard, section: 'PRINCIPAL' },
  { key: 'indices',      label: 'Índices Zootécnicos', icon: Gauge },
  { key: 'animais',      label: 'Animais',          icon: Beef,            section: 'REBANHO' },
  { key: 'lotes',        label: 'Lotes',            icon: Grid3X3 },
  { key: 'confinamento', label: 'Confinamento',     icon: Warehouse },
  { key: 'reproducao',   label: 'Reprodução',       icon: HeartPulse,      section: 'SAÚDE' },
  { key: 'vacinacao',    label: 'Vacinação',        icon: Syringe },
  { key: 'pesagem',      label: 'Pesagem',          icon: Scale },
  { key: 'nascimentos',  label: 'Nascimentos',      icon: Baby },
  { key: 'leite',        label: 'Leite',            icon: Droplets,        section: 'PRODUÇÃO' },
  { key: 'pasto',        label: 'Pasto',            icon: Leaf },
  { key: 'financeiro',   label: 'Financeiro',       icon: DollarSign,      section: 'GESTÃO' },
  { key: 'insumos',      label: 'Insumos',          icon: Package },
  { key: 'usuarios',     label: 'Usuários',         icon: Users },
  { key: 'configuracoes', label: 'Configurações',   icon: Settings },
];

type Props = {
  current: ViewKey;
  onChange: (v: ViewKey) => void;
  collapsed: boolean;
  onToggle: () => void;
  adminName: string;
  adminEmail: string;
  onLogout: () => void;
  mobileOpen: boolean;
  onMobileClose: () => void;
};

export default function Sidebar({
  current, onChange, collapsed, onToggle,
  adminName, adminEmail, onLogout, mobileOpen, onMobileClose,
}: Props) {
  const nav = (
    <div className="flex flex-col h-full">
      {/* Brand */}
      <div className={`flex items-center gap-3 px-4 py-5 border-b border-white/10 shrink-0`}>
        <div className="w-8 h-8 bg-primary rounded-xl flex items-center justify-center shrink-0">
          <Beef size={16} className="text-primary-foreground" />
        </div>
        {!collapsed && (
          <div className="flex-1 min-w-0">
            <p className="font-black text-sm text-white leading-none">BoviGest</p>
            <p className="text-xs font-bold mt-0.5 text-primary-mid">PRO</p>
          </div>
        )}
        <button
          onClick={onToggle}
          className="hidden lg:flex w-7 h-7 rounded-lg items-center justify-center text-white/40 hover:text-white hover:bg-white/10 transition-colors shrink-0"
        >
          {collapsed ? <ChevronRight size={14} /> : <ChevronLeft size={14} />}
        </button>
        <button onClick={onMobileClose} className="lg:hidden text-white/60 hover:text-white">
          <X size={18} />
        </button>
      </div>

      {/* Nav items */}
      <nav className="flex-1 overflow-y-auto py-3 scrollbar-thin space-y-0.5 px-2">
        {NAV.map((item) => {
          const isActive = current === item.key;
          const Icon = item.icon;
          return (
            <div key={item.key}>
              {item.section && !collapsed && (
                <p className="sidebar-muted text-[10px] font-black uppercase tracking-widest px-2 pt-4 pb-1 leading-none">
                  {item.section}
                </p>
              )}
              {item.section && collapsed && <div className="my-1 mx-2 h-px bg-white/10" />}
              <button
                onClick={() => { onChange(item.key); onMobileClose(); }}
                className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg transition-all text-left group
                  ${isActive
                    ? 'sidebar-active text-white font-bold'
                    : 'sidebar-muted sidebar-hover font-medium hover:text-white'
                  }`}
                title={collapsed ? item.label : undefined}
              >
                <Icon size={18} className={`shrink-0 ${isActive ? 'text-white' : ''}`} />
                {!collapsed && (
                  <span className="text-sm truncate flex-1">{item.label}</span>
                )}
                {isActive && !collapsed && (
                  <span className="ml-auto w-1.5 h-1.5 rounded-full bg-success shrink-0" />
                )}
              </button>
            </div>
          );
        })}
      </nav>

      {/* User footer */}
      <div className={`px-2 py-3 border-t border-white/10 shrink-0`}>
        <div className={`flex items-center gap-3 px-2 py-2 rounded-lg ${collapsed ? 'justify-center' : ''}`}>
          <div className="w-8 h-8 rounded-full bg-primary/30 flex items-center justify-center text-white font-black text-sm shrink-0">
            {(adminName || 'A')[0].toUpperCase()}
          </div>
          {!collapsed && (
            <div className="flex-1 min-w-0">
              <p className="text-xs font-bold text-white truncate">{adminName || 'Administrador'}</p>
              <p className="text-[10px] sidebar-muted truncate">{adminEmail}</p>
            </div>
          )}
          {!collapsed && (
            <button onClick={onLogout} className="text-white/30 hover:text-destructive transition-colors shrink-0" title="Sair">
              <LogOut size={14} />
            </button>
          )}
        </div>
        {collapsed && (
          <button onClick={onLogout} className="w-full mt-1 flex justify-center text-white/30 hover:text-destructive transition-colors py-1" title="Sair">
            <LogOut size={14} />
          </button>
        )}
      </div>
    </div>
  );

  return (
    <>
      {/* Desktop sidebar */}
      <aside
        className="hidden lg:flex flex-col fixed left-0 top-0 bottom-0 sidebar-bg z-40 transition-all duration-200"
        style={{ width: collapsed ? 'var(--sidebar-collapsed)' : 'var(--sidebar-width)' }}
      >
        {nav}
      </aside>

      {/* Mobile overlay */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-50 flex">
          <div
            className="absolute inset-0 bg-black/50 backdrop-blur-sm"
            onClick={onMobileClose}
          />
          <aside className="relative w-72 sidebar-bg h-full shadow-2xl z-10">
            {nav}
          </aside>
        </div>
      )}
    </>
  );
}

export { NAV };

export function MobileMenuButton({ onClick }: { onClick: () => void }) {
  return (
    <button onClick={onClick} className="lg:hidden p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted transition-colors">
      <Menu size={20} />
    </button>
  );
}
