import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Droplets, X } from 'lucide-react';
import type { RegistroLeite } from '../types';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

type Props = { leite: RegistroLeite[]; onSave: (l: RegistroLeite, isNew: boolean) => void; onDelete: (id: string) => void; };

const TURNOS: RegistroLeite['turno'][] = ['Manhã', 'Tarde', 'Noite'];
const TURNO_VARIANT: Record<RegistroLeite['turno'], 'warning' | 'info' | 'indigo'> = {
  'Manhã': 'warning', 'Tarde': 'info', 'Noite': 'indigo',
};

function Modal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'; initial: Partial<RegistroLeite>; onClose: () => void; onSave: (l: Partial<RegistroLeite>) => void;
}) {
  const [form, setForm] = useState<Partial<RegistroLeite>>({ data: new Date().toISOString().slice(0, 10), turno: 'Manhã', ...initial });
  const set = (k: keyof RegistroLeite, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 sticky top-0">
          <h2 className="font-black text-foreground flex items-center gap-2"><Droplets size={16} className="text-primary" />{mode === 'create' ? 'Novo Registro de Leite' : 'Editar Registro'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data *</label>
              <input required type="date" value={form.data || ''} onChange={e => set('data', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Quantidade (L) *</label>
              <input required type="number" step="0.1" value={form.quantidade ?? ''} onChange={e => set('quantidade', Number(e.target.value))} placeholder="0"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Turno *</label>
              <select required value={form.turno || 'Manhã'} onChange={e => set('turno', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                {TURNOS.map(t => <option key={t}>{t}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Responsável</label>
              <input value={form.responsavel || ''} onChange={e => set('responsavel', e.target.value)} placeholder="Opcional"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">{mode === 'create' ? 'Cadastrar' : 'Salvar'}</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function LeiteView({ leite, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<RegistroLeite | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<RegistroLeite | null>(null);

  const filtered = leite.filter(l => {
    const q = search.toLowerCase();
    return (l.responsavel || '').toLowerCase().includes(q) || l.data.includes(q);
  });

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const doMes = leite.filter(l => { const d = new Date(l.data); return d.getMonth() === mesAtual && d.getFullYear() === anoAtual; });
  const totalMes = doMes.reduce((s, l) => s + l.quantidade, 0);

  const porDia = new Map<string, number>();
  leite.forEach(l => { porDia.set(l.data, (porDia.get(l.data) ?? 0) + l.quantidade); });
  const diasComProducao = porDia.size;
  const mediaDiaria = diasComProducao ? [...porDia.values()].reduce((s, v) => s + v, 0) / diasComProducao : 0;
  const melhorDia = Math.max(0, ...porDia.values());

  // Gráfico: produção dos últimos 14 dias
  const chart: { label: string; total: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date(); d.setDate(d.getDate() - i);
    const iso = d.toISOString().slice(0, 10);
    chart.push({ label: d.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }), total: porDia.get(iso) ?? 0 });
  }
  const maxChart = Math.max(1, ...chart.map(c => c.total));

  const handleSave = (form: Partial<RegistroLeite>) => {
    const isNew = modalMode === 'create';
    const l: RegistroLeite = {
      id: editing?.id ?? crypto.randomUUID(),
      data: form.data || '',
      quantidade: Number(form.quantidade) || 0,
      turno: (form.turno as RegistroLeite['turno']) || 'Manhã',
      responsavel: form.responsavel || undefined,
    };
    onSave(l, isNew);
    setModalMode(null); setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Droplets size={22} className="text-primary" /> Leite</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{leite.length} registros de produção</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Novo Registro
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard variant="inline" icon={Droplets} label="Total do Mês" value={`${totalMes.toFixed(0)}L`} tone="cyan" />
        <StatCard variant="inline" icon={Droplets} label="Média Diária" value={`${mediaDiaria.toFixed(1)}L`} tone="primary" />
        <StatCard variant="inline" icon={Droplets} label="Melhor Dia" value={`${melhorDia.toFixed(0)}L`} tone="success" />
        <StatCard variant="inline" icon={Droplets} label="Registros" value={leite.length} tone="purple" />
      </div>

      {/* Mini gráfico de produção */}
      <div className="bg-card rounded-2xl border border-border shadow-sm p-5">
        <p className="text-[11px] font-black uppercase tracking-widest text-muted-foreground mb-4">Produção — Últimos 14 dias</p>
        <div className="flex items-end gap-1.5 h-32">
          {chart.map((c, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1 min-w-0">
              <span className="text-[10px] font-black text-foreground">{c.total > 0 ? c.total.toFixed(0) : ''}</span>
              <div className={`w-full rounded-t-md transition-all ${c.total > 0 ? 'bg-primary/80' : 'bg-muted'}`} style={{ height: `${(c.total / maxChart) * 100}%` }} title={`${c.label}: ${c.total.toFixed(1)}L`} />
              <span className="text-[9px] text-muted-foreground truncate w-full text-center">{c.label}</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Data ou responsável..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Droplets} title="Nenhum registro de leite encontrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Data', 'Quantidade', 'Turno', 'Responsável', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{l.data ? new Date(l.data).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-5 py-3.5 font-black text-sm text-primary">{l.quantidade} L</td>
                    <td className="px-5 py-3.5"><Badge variant={TURNO_VARIANT[l.turno]}>{l.turno}</Badge></td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{l.responsavel || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(l); setModalMode('edit'); }} className="p-2 text-info hover:bg-info-soft rounded-lg transition-colors"><Edit size={13} /></button>
                        <button onClick={() => setDeleteTarget(l)} className="p-2 text-destructive hover:bg-destructive-soft rounded-lg transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {leite.length} registros</div>
      </div>

      {modalMode && <Modal mode={modalMode} initial={editing || {}} onClose={() => { setModalMode(null); setEditing(null); }} onSave={handleSave} />}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Remover Registro"
        description={<>Remover o registro de <span className="font-black text-foreground">{deleteTarget?.quantidade}L</span> de {deleteTarget?.data ? new Date(deleteTarget.data).toLocaleDateString('pt-BR') : ''}?</>}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
      />
    </div>
  );
}
