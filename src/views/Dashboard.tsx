import { useMemo } from 'react';
import {
  Beef, DollarSign, Droplets, HeartPulse, Scale, Baby,
  AlertTriangle, CheckCircle2, ShieldAlert, CalendarDays,
  PackagePlus, Activity, Cloud, CloudOff, Loader2,
  TrendingUp, TrendingDown, Users, Package, Gauge, ArrowRight,
} from 'lucide-react';
import type { AppData, CloudStatus } from '../types';
import { calcularIndices } from '../lib/zootecnia';

type Props = { data: AppData; cloud: CloudStatus; adminName: string; onNavigateIndices: () => void };

function KpiCard({ icon: Icon, label, value, sub, color }: {
  icon: typeof Beef; label: string; value: string | number; sub?: string; color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 card-hover shadow-sm">
      <div className={`w-11 h-11 rounded-xl flex items-center justify-center mb-4 ${color}`}>
        <Icon size={20} />
      </div>
      <p className="text-lg sm:text-xl font-black text-foreground leading-tight">{value}</p>
      {sub && <p className="text-xs text-muted-foreground font-medium mt-0.5">{sub}</p>}
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
    </div>
  );
}

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

export default function Dashboard({ data, cloud, adminName, onNavigateIndices }: Props) {
  const hoje = useMemo(() => new Date(), []);
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();

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
      ...data.pesagens.slice(-3).map(p => ({ tipo: 'pesagem', desc: `Pesagem: Brinco ${p.brinco} → ${p.pesoAtual} kg`, data: p.data, cor: 'bg-orange-100 text-orange-600' })),
      ...data.vacinacoes.slice(-3).map(v => ({ tipo: 'vacina', desc: `Vacinação: ${v.vacina} — Lote ${v.lote}`, data: v.dataAplicacao, cor: 'bg-blue-100 text-blue-600' })),
      ...data.nascimentos.slice(-3).map(n => ({ tipo: 'nasc', desc: `Nascimento: Bezerro ${n.brincoBezerro} (Matriz: ${n.brincoMatriz})`, data: n.data, cor: 'bg-pink-100 text-pink-600' })),
    ].filter(x => x.data).sort((a, b) => new Date(b.data).getTime() - new Date(a.data).getTime()).slice(0, 5);

    return { totalAnimais, femeas, machos, prenhes, leiteMes, pesoMedio, receitas, despesas, saldoMes, maxBar, carencia, vacProximas, insumoCrit, totalAlertas, recentes, finMes };
  }, [data, mesAtual, anoAtual, hoje]);

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
        <div className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-bold border
          ${cloud === 'online' ? 'bg-green-50 text-green-700 border-green-200'
          : cloud === 'error' ? 'bg-red-50 text-red-700 border-red-200'
          : cloud === 'connecting' ? 'bg-muted text-muted-foreground border-border'
          : 'bg-amber-50 text-amber-700 border-amber-200'}`}>
          {cloud === 'online' ? <><Cloud size={12} /> Firebase online</>
          : cloud === 'error' ? <><CloudOff size={12} /> Sem ligação</>
          : cloud === 'connecting' ? <><Loader2 size={12} className="animate-spin" /> Conectando...</>
          : <><CloudOff size={12} /> Modo Demo</>}
        </div>
      </div>

      {/* KPIs */}
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-4">
        <KpiCard icon={Beef} label="Cabeças" value={stats.totalAnimais} color="bg-primary/10 text-primary" />
        <KpiCard icon={DollarSign} label="Saldo do Mês" value={formatCurrency(stats.saldoMes)} sub={stats.saldoMes >= 0 ? 'positivo' : 'negativo'} color={`${stats.saldoMes >= 0 ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`} />
        <KpiCard icon={Droplets} label="Leite do Mês" value={`${stats.leiteMes}L`} color="bg-cyan-100 text-cyan-700" />
        <KpiCard icon={HeartPulse} label="Prenhes" value={stats.prenhes} color="bg-pink-100 text-pink-700" />
        <KpiCard icon={Scale} label="Peso Médio" value={`${stats.pesoMedio}kg`} color="bg-amber-100 text-amber-700" />
        <KpiCard icon={Users} label="Usuários" value={data.usuarios.filter(u => u.status === 'Ativo').length} sub="ativos" color="bg-purple-100 text-purple-700" />
      </div>

      {/* Row 2 — Alertas + Financeiro */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Alertas */}
        <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
          <div className="flex items-center justify-between px-5 py-3.5 border-b border-border bg-amber-50/60">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-600" />
              <h3 className="font-black text-sm text-foreground">Alertas</h3>
              {stats.totalAlertas > 0 && (
                <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{stats.totalAlertas}</span>
              )}
            </div>
          </div>
          <div className="divide-y divide-border max-h-60 overflow-y-auto scrollbar-thin">
            {stats.totalAlertas === 0 ? (
              <div className="px-5 py-8 text-center text-muted-foreground">
                <CheckCircle2 size={28} className="mx-auto mb-2 text-primary" />
                <p className="font-bold text-sm">Nenhum alerta ativo</p>
              </div>
            ) : null}
            {stats.carencia.map((v, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-orange-50/40 transition-colors">
                <div className="w-7 h-7 bg-orange-100 rounded-lg flex items-center justify-center shrink-0"><ShieldAlert size={13} className="text-orange-600" /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-xs">Em carência: Lote {v.lote}</p><p className="text-[11px] text-muted-foreground">Liberação: {v.dataLiberacao}</p></div>
                <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">Carência</span>
              </div>
            ))}
            {stats.vacProximas.map((c, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-blue-50/40 transition-colors">
                <div className="w-7 h-7 bg-blue-100 rounded-lg flex items-center justify-center shrink-0"><CalendarDays size={13} className="text-blue-600" /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-xs">Vacina: {c.doenca}</p><p className="text-[11px] text-muted-foreground">{c.mes} — {c.publico}</p></div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${c.obrigatorio ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{c.obrigatorio ? 'Obrig.' : 'Recom.'}</span>
              </div>
            ))}
            {stats.insumoCrit.map((ins, i) => (
              <div key={i} className="flex items-center gap-3 px-5 py-3 hover:bg-red-50/40 transition-colors">
                <div className="w-7 h-7 bg-red-100 rounded-lg flex items-center justify-center shrink-0"><PackagePlus size={13} className="text-red-600" /></div>
                <div className="flex-1 min-w-0"><p className="font-bold text-xs">Estoque crítico: {ins.nome}</p><p className="text-[11px] text-muted-foreground">{ins.quantidade} {ins.unidade} (mín: {ins.estoqueMinimo})</p></div>
                <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">Crítico</span>
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
              <div className="bg-green-50 rounded-xl p-3 text-center">
                <TrendingUp size={14} className="text-green-600 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Receitas</p>
                <p className="text-sm font-black text-green-700 mt-0.5">{formatCurrency(stats.receitas)}</p>
              </div>
              <div className="bg-red-50 rounded-xl p-3 text-center">
                <TrendingDown size={14} className="text-red-600 mx-auto mb-1" />
                <p className="text-[11px] font-bold text-muted-foreground uppercase">Despesas</p>
                <p className="text-sm font-black text-red-700 mt-0.5">{formatCurrency(stats.despesas)}</p>
              </div>
              <div className={`rounded-xl p-3 text-center ${stats.saldoMes >= 0 ? 'bg-primary/90' : 'bg-red-800'}`}>
                <p className="text-[11px] font-bold text-white/60 uppercase">Saldo</p>
                <p className="text-sm font-black text-white mt-0.5">{formatCurrency(stats.saldoMes)}</p>
              </div>
            </div>
            <div className="space-y-2">
              <div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                  <span>Receitas</span><span>{formatCurrency(stats.receitas)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div className="h-full bg-green-500 rounded-full transition-all" style={{ width: `${(stats.receitas / stats.maxBar) * 100}%` }} />
                </div>
              </div>
              <div>
                <div className="flex justify-between text-xs font-bold text-muted-foreground mb-1">
                  <span>Despesas</span><span>{formatCurrency(stats.despesas)}</span>
                </div>
                <div className="w-full h-2 bg-muted rounded-full">
                  <div className="h-full bg-red-500 rounded-full transition-all" style={{ width: `${(stats.despesas / stats.maxBar) * 100}%` }} />
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
              <div className="px-5 py-8 text-center text-muted-foreground">
                <Activity size={24} className="mx-auto mb-2 opacity-30" />
                <p className="font-bold text-xs">Nenhuma atividade ainda</p>
              </div>
            ) : stats.recentes.map((a, i) => (
              <div key={i} className="flex items-start gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className={`w-7 h-7 ${a.cor} rounded-lg flex items-center justify-center shrink-0 text-xs font-black`}>
                  {a.tipo === 'pesagem' ? 'P' : a.tipo === 'vacina' ? 'V' : 'N'}
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
              <div className="px-5 py-8 text-center text-muted-foreground">
                <CalendarDays size={24} className="mx-auto mb-2 opacity-30" />
                <p className="font-bold text-xs">Sem eventos cadastrados</p>
              </div>
            ) : data.calendario.slice(0, 6).map((c) => (
              <div key={c.id} className="flex items-center gap-3 px-5 py-3 hover:bg-muted/30 transition-colors">
                <div className="w-9 h-9 bg-primary/10 rounded-lg flex items-center justify-center shrink-0">
                  <span className="text-[9px] font-black text-primary uppercase">{(c.mes || '').slice(0, 3)}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <p className="font-bold text-xs text-foreground truncate">{c.doenca}</p>
                  <p className="text-[11px] text-muted-foreground truncate">{c.publico}</p>
                </div>
                <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${c.obrigatorio ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>{c.obrigatorio ? 'Obrig.' : 'Recom.'}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Resumo do Rebanho + Status */}
        <div className="space-y-4">
          <div className={`rounded-2xl border p-4 shadow-sm transition-colors
            ${cloud === 'online' ? 'bg-green-50 border-green-200'
            : cloud === 'error' ? 'bg-red-50 border-red-200'
            : cloud === 'connecting' ? 'bg-muted border-border'
            : 'bg-amber-50 border-amber-200'}`}>
            <div className="flex items-center gap-3">
              {cloud === 'online' ? <Cloud size={18} className="text-green-700 shrink-0" />
              : cloud === 'error' ? <CloudOff size={18} className="text-red-600 shrink-0" />
              : cloud === 'connecting' ? <Loader2 size={18} className="text-muted-foreground animate-spin shrink-0" />
              : <CloudOff size={18} className="text-amber-600 shrink-0" />}
              <div className="flex-1 min-w-0">
                <p className="font-black text-xs text-foreground">
                  {cloud === 'online' ? 'Firebase Sincronizado'
                  : cloud === 'error' ? 'Sem Sincronização'
                  : cloud === 'connecting' ? 'Conectando...'
                  : 'Modo Demo'}
                </p>
                <p className="text-[11px] text-muted-foreground">
                  {cloud === 'online' ? 'Dados em tempo real'
                  : cloud === 'error' ? 'Verifique a internet'
                  : cloud === 'connecting' ? 'Aguarde...'
                  : 'Firebase não configurado'}
                </p>
              </div>
              <div className={`w-2 h-2 rounded-full shrink-0 ${cloud === 'online' ? 'bg-green-500 animate-pulse' : cloud === 'error' ? 'bg-red-500' : cloud === 'connecting' ? 'bg-muted-foreground' : 'bg-amber-500'}`} />
            </div>
          </div>

          <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-3">Resumo do Rebanho</p>
            <div className="space-y-2">
              {[
                { label: 'Total de animais', val: stats.totalAnimais, icon: Beef, color: 'text-primary' },
                { label: 'Fêmeas', val: stats.femeas, icon: HeartPulse, color: 'text-pink-600' },
                { label: 'Machos', val: stats.machos, icon: Beef, color: 'text-blue-600' },
                { label: 'Pesagens', val: data.pesagens.length, icon: Scale, color: 'text-amber-600' },
                { label: 'Nascimentos', val: data.nascimentos.length, icon: Baby, color: 'text-green-600' },
                { label: 'Insumos', val: data.insumos.length, icon: Package, color: 'text-purple-600' },
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
                  <HeartPulse size={12} className="text-pink-600" />
                  <span className="text-xs font-medium text-muted-foreground">Taxa de Prenhez</span>
                </div>
                <span className="text-sm font-black text-pink-600">{indices.taxaPrenhez.toFixed(1)}%</span>
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <TrendingUp size={12} className="text-green-600" />
                  <span className="text-xs font-medium text-muted-foreground">GMD Médio do Rebanho</span>
                </div>
                <span className="text-sm font-black text-green-600">{indices.gmdRebanho.toFixed(2)}kg/d</span>
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
