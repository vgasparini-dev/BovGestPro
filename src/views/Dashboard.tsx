import { useMemo } from 'react';
import {
  Beef, DollarSign, Droplets, HeartPulse, Scale, Baby,
  AlertTriangle, CheckCircle2, ShieldAlert, CalendarDays,
  PackagePlus, Activity, Cloud, CloudOff, Loader2,
  TrendingUp, TrendingDown, Users, Package, Gauge, ArrowRight,
} from 'lucide-react';
import type { AppData, CloudStatus } from '../types';
import { calcularIndices } from '../lib/zootecnia';
import StatCard from '../components/StatCard';
import EmptyState from '../components/EmptyState';

type Props = { data: AppData; cloud: CloudStatus; adminName: string; onNavigateIndices: () => void };

function SectionHeader({ title, icon: Icon }: { title: string; icon: typeof Beef }) {
  return (
    <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
      <Icon size={16} className="text-primary" />
      <h3 className="font-black text-sm text-foreground">{title}</h3>
    </div>
  );
}

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

const CLOUD_META: Record<CloudStatus, { label: string; sub: string; badgeClass: string; panelClass: string; iconClass: string; dotClass: string; Icon: typeof Cloud }> = {
  online:     { label: 'Nuvem Sincronizada', sub: 'Dados em tempo real', badgeClass: 'bg-success-soft text-success-fg border-success-fg/20', panelClass: 'bg-success-soft border-success-fg/20', iconClass: 'text-success-fg', dotClass: 'bg-success animate-pulse', Icon: Cloud },
  error:      { label: 'Sem Sincronização', sub: 'Verifique a internet', badgeClass: 'bg-destructive-soft text-destructive-soft-fg border-destructive-soft-fg/20', panelClass: 'bg-destructive-soft border-destructive-soft-fg/20', iconClass: 'text-destructive-soft-fg', dotClass: 'bg-destructive', Icon: CloudOff },
  connecting: { label: 'Conectando...', sub: 'Aguarde...', badgeClass: 'bg-muted text-muted-foreground border-border', panelClass: 'bg-muted border-border', iconClass: 'text-muted-foreground animate-spin', dotClass: 'bg-muted-foreground', Icon: Loader2 },
};

export default function Dashboard({ data, cloud, adminName, onNavigateIndices }: Props) {
  const hoje = useMemo(() => new Date(), []);
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const cloudMeta = CLOUD_META[cloud];

  const stats = useMemo(() => {
    const totalAnimais = data.animais.length;
    const femeas = data.animais.filter(a => a.sexo === 'F').length;
    const machos = data.animais.filter(a => a.sexo === 'M').length;
    const prenhes = data.reproducao.filter(r => r.status === 'Prenhe' || r.status === 'Gestação').length;
    const leiteMes = data.leite
      .filter(l => { const d = new Date(l.data); return d.getMonth() === mesAtual && d.getFullYear() === anoAtual; })
      .reduce((s, l) => s + l.quantidade, 0);
    const pesoMedio = totalAnimais > 0
      ? Math.round(data.animais.reduce((s, a) => s + a.peso, 0) / totalAnimais)
      : 0;
    const finMes = data.financeiro.filter(f => {
      if (!f.data) return false;
      const d = new Date(f.data);
      return d.getMonth() === mesAtual && d.getFullYear() === anoAtual && f.status === 'pago';
    });
    const receitas = finMes.filter(f => f.tipo === 'receita').reduce((s, f) => s + f.valor, 0);
    const despesas = finMes.filter(f => f.tipo === 'despesa').reduce((s, f) => s + f.valor, 0);
    const saldoMes = receitas - despesas;
    const maxBar = Math.max(receitas, despesas, 1);

    const carencia = data.vacinacoes.filter(v => v.dataLiberacao && new Date(v.dataLiberacao) > hoje);
    const mesesProx = [
      hoje.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()),
      new Date(anoAtual, mesAtual + 1, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()),
    ];
    const vacProximas = data.calendario.filter(c =>
      mesesProx.some(m => c.mes?.includes(m)) || c.mes?.includes('Qualquer')
    );
    const insumoCrit = data.insumos.filter(i => Number(i.quantidade) <= Number(i.estoqueMinimo));
    const totalAlertas = carencia.length + vacProximas.length + insumoCrit.length;

    const recentes = [
      ...data.pesagens.slice(-3).map(p => ({ tipo: 'pesagem' as const, desc: `Pesagem: Brinco ${p.brinco} → ${p.pesoAtual} kg`, data: p.data })),
      ...data.vacinacoes.slice(-3).map(v => ({ tipo: 'vacina' as const, desc: `Vacinação: ${v.vacina} — Lote ${v.lote}`, data: v.dataAplicacao })),
      ...data.nascimentos.slice(-3).map(n => ({ tipo: 'nasc' as const, desc: `Nascimento: Bezerro ${n.brincoBezerro} (Matriz: ${n.brincoMatriz})`, data: n.data })),
    ].filter(x => x.data).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);

    return { totalAnimais, femeas, machos, prenhes, leiteMes, pesoMedio, receitas, despesas, saldoMes, maxBar, carencia, vacProximas, insumoCrit, totalAlertas, recentes, finMes };
  }, [data, mesAtual, anoAtual, hoje]);

  const RECENTE_META = {
    pesagem: { label: 'P', cls: 'bg-chip-orange-soft text-chip-orange-fg' },
    vacina: { label: 'V', cls: 'bg-info-soft text-info-fg' },
    nasc: { label: 'N', cls: 'bg-chip-pink-soft text-chip-pink-fg' },
  } as const;

  const indices = useMemo(() => calcularIndices(data), [data]);

  const mesLabel = hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' });
  const hora = hoje.getHours();
  const greeting = hora < 12 ? 'Bom dia' : hora < 18 ? 'Boa tarde' : 'Boa noite';

  return (
    <div className="space-y-6 fade-in">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-black text-foreground">{greeting}, {adminName.split(' ')[0]}!</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">
            {hoje.toLocaleDateString('pt-BR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
          </p>
        </div>
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border ${cloudMeta.badgeClass}`}>
          <cloudMeta.Icon size={12} className={cloud === 'connecting' ? 'animate-spin' : ''} /> {cloudMeta.label}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <StatCard icon={Beef} label="Cabeças" value={stats.totalAnimais} tone="primary" />
        <StatCard icon={DollarSign} label="Saldo do Mês" value={formatCurrency(stats.saldoMes)} sub={stats.saldoMes >= 0 ? 'positivo' : 'negativo'} tone={stats.saldoMes >= 0 ? 'success' : 'danger'} />
        <StatCard icon={Droplets} label="Leite do Mês" value={`${stats.leiteMes}L`} tone="cyan" />
        <StatCard icon={HeartPulse} label="Prenhes" value={stats.prenhes} tone="pink" />
        <StatCard icon={Scale} label="Peso Médio" value={`${stats.pesoMedio}kg`} tone="warning" />
        <StatCard icon={Users} label="Usuários" value={data.usuarios.filter(u => u.status === 'Ativo').length} sub="ativos" tone="purple" />
      </div>

      {/* Row 2 — Alertas + Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-warning-soft/60">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-warning" />
              <h3 className="font-black text-sm text-foreground">Alertas</h3>
              {stats.totalAlertas > 0 && (
                <span className="w-5 h-5 rounded-full bg-destructive text-destructive-foreground text-[10px] font-black flex items-center justify-center">{stats.totalAlertas}</span>
              )}
            </div>
          </div>
          <div className="divide-y divide-border max-h-60 overflow-y-auto scrollbar-thin">
            {stats.totalAlertas === 0 && (
              <EmptyState variant="row" icon={CheckCircle2} title="Nenhum alerta ativo" />
            )}
            {stats.carencia.map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-chip-orange-soft/40 transition-colors">
                <div className="w-7 h-7 bg-chip-orange-soft rounded-lg flex items-center justify-center shrink-0"><ShieldAlert size={13} className="text-chip-orange-fg" /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-xs">Em carência: Lote {v.lote}</p><p className="text-[11px] text-muted-foreground">Liberação: {v.dataLiberacao}</p></div>
                <span className="bg-chip-orange-soft text-chip-orange-fg text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">Carência</span>
              </div>
            ))}
            {stats.vacProximas.map((c, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-info-soft/40 transition-colors">
                <div className="w-7 h-7 bg-info-soft rounded-lg flex items-center justify-center shrink-0"><CalendarDays size={13} className="text-info-fg" /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-xs">Vacina: {c.doenca}</p><p className="text-[11px] text-muted-foreground">{c.mes} — {c.publico}</p></div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${c.obrigatorio ? 'bg-destructive-soft text-destructive-soft-fg' : 'bg-info-soft text-info-fg'}`}>{c.obrigatorio ? 'Obrig.' : 'Recom.'}</span>
              </div>
            ))}
            {stats.insumoCrit.map((ins, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-destructive-soft/40 transition-colors">
                <div className="w-7 h-7 bg-destructive-soft rounded-lg flex items-center justify-center shrink-0"><PackagePlus size={13} className="text-destructive-soft-fg" /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-xs">Estoque crítico: {ins.nome}</p><p className="text-[11px] text-muted-foreground">{ins.quantidade} {ins.unidade} (mín: {ins.estoqueMinimo})</p></div>
                <span className="bg-destructive-soft text-destructive-soft-fg text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">Crítico</span>
              </div>
            ))}
          </div>
        </div>

        {/* Financeiro do mês */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-primary/5">
            <div className="flex items-center gap-2">
              <DollarSign size={16} className="text-primary" />
              <h3 className="font-black text-sm text-foreground">Financeiro</h3>
            </div>
            <span className="text-xs font-bold text-muted-foreground capitalize">{mesLabel}</span>
          </div>
          <div className="p-5 space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-success-soft rounded-xl p-3 text-center">
                <TrendingUp size={14} className="text-success-fg mx-auto mb-1" />
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Receitas</p>
                <p className="text-sm font-black text-success-fg mt-0.5">{formatCurrency(stats.receitas)}</p>
              </div>
              <div className="bg-destructive-soft rounded-xl p-3 text-center">
                <TrendingDown size={14} className="text-destructive-soft-fg mx-auto mb-1" />
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Despesas</p>
                <p className="text-sm font-black text-destructive-soft-fg mt-0.5">{formatCurrency(stats.despesas)}</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${stats.saldoMes >= 0 ? 'bg-primary/90' : 'bg-destructive'}`}>
                <p className="text-[11px] font-bold text-primary-foreground/70 uppercase">Saldo</p>
                <p className="text-sm font-black text-primary-foreground mt-0.5">{formatCurrency(stats.saldoMes)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                  <span>Receitas</span><span>{formatCurrency(stats.receitas)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div className="h-full bg-success rounded-full transition-all" style={{ width: `${(stats.receitas / stats.maxBar) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                  <span>Despesas</span><span>{formatCurrency(stats.despesas)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div className="h-full bg-destructive rounded-full transition-all" style={{ width: `${(stats.despesas / stats.maxBar) * 100}%` }} />
                </div>
              </div>
            </div>
            {stats.finMes.length === 0 && <p className="text-center text-muted-foreground text-xs font-medium">Nenhum lançamento pago este mês</p>}
          </div>
        </div>
      </div>

      {/* Row 3 — Atividades + Calendário + Resumo */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Atividades recentes */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <SectionHeader title="Atividades Recentes" icon={Activity} />
          <div className="divide-y divide-border max-h-72 overflow-y-auto scrollbar-thin">
            {stats.recentes.length === 0 ? (
              <EmptyState variant="row" icon={Activity} title="Nenhuma atividade ainda" />
            ) : stats.recentes.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className={`w-7 h-7 ${RECENTE_META[a.tipo].cls} rounded-lg flex items-center justify-center shrink-0 text-xs font-black`}>
                  {RECENTE_META[a.tipo].label}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs leading-tight text-foreground">{a.desc}</p>
                  <p className="text-[11px] text-muted-foreground mt-0.5">{new Date(a.data).toLocaleDateString('pt-BR')}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Calendário Sanitário */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <SectionHeader title="Calendário Sanitário" icon={CalendarDays} />
          <div className="divide-y divide-border max-h-72 overflow-y-auto scrollbar-thin">
            {data.calendario.length === 0 ? (
              <EmptyState variant="row" icon={CalendarDays} title="Sem eventos cadastrados" />
            ) : data.calendario.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-black text-primary uppercase">{(c.mes || '').slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">{c.doenca}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{c.publico}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${c.obrigatorio ? 'bg-destructive-soft text-destructive-soft-fg' : 'bg-info-soft text-info-fg'}`}>{c.obrigatorio ? 'Obrig.' : 'Recom.'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo do Rebanho + Status */}
        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 shadow-sm transition-colors ${cloudMeta.panelClass}`}>
            <div className="flex items-center gap-3">
              <cloudMeta.Icon size={18} className={`shrink-0 ${cloudMeta.iconClass}`} />
              <div className="flex-1 min-w-0">
                <p className="font-black text-xs text-foreground">{cloudMeta.label}</p>
                <p className="text-[11px] text-muted-foreground">{cloudMeta.sub}</p>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${cloudMeta.dotClass}`} />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Resumo do Rebanho</p>
            <div className="space-y-2">
              {[
                { label: 'Total de animais', val: stats.totalAnimais, icon: Beef, color: 'text-primary' },
                { label: 'Fêmeas', val: stats.femeas, icon: HeartPulse, color: 'text-chip-pink' },
                { label: 'Machos', val: stats.machos, icon: Beef, color: 'text-info' },
                { label: 'Pesagens', val: data.pesagens.length, icon: Scale, color: 'text-warning' },
                { label: 'Nascimentos', val: data.nascimentos.length, icon: Baby, color: 'text-success' },
                { label: 'Insumos', val: data.insumos.length, icon: Package, color: 'text-chip-purple' },
              ].map((item) => (
                <div key={item.label} className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <item.icon size={12} className={item.color} />
                    <span className="text-xs font-medium text-muted-foreground">{item.label}</span>
                  </div>
                  <span className={`text-sm font-black ${item.color}`}>{item.val}</span>
                </div>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-border space-y-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <HeartPulse size={12} className="text-chip-pink" />
                  <span className="text-xs font-medium text-muted-foreground">Taxa de Prenhez</span>
                </div>
                <span className="text-sm font-black text-chip-pink">{indices.taxaPrenhez.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-success" />
                  <span className="text-xs font-medium text-muted-foreground">GMD Médio do Rebanho</span>
                </div>
                <span className="text-sm font-black text-success">{indices.gmdRebanho.toFixed(2)}kg/d</span>
              </div>
            </div>
            <button onClick={onNavigateIndices}
              className="w-full mt-4 flex items-center justify-center gap-1.5 text-xs font-bold text-primary bg-primary/10 hover:bg-primary/20 transition-colors rounded-lg py-2">
              <Gauge size={13} /> Ver índices completos <ArrowRight size={12} />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
