import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Baby, X } from 'lucide-react';
import type { Nascimento } from '../types';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

type Props = { nascimentos: Nascimento[]; onSave: (n: Nascimento, isNew: boolean) => void; onDelete: (id: string) => void; };

function Modal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'; initial: Partial<Nascimento>; onClose: () => void; onSave: (n: Partial<Nascimento>) => void;
}) {
  const [form, setForm] = useState<Partial<Nascimento>>({ data: new Date().toISOString().slice(0, 10), sexo: 'M', ...initial });
  const set = (k: keyof Nascimento, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 sticky top-0">
          <h2 className="font-black text-foreground flex items-center gap-2"><Baby size={16} className="text-primary" />{mode === 'create' ? 'Novo Nascimento' : 'Editar Nascimento'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Brinco do Bezerro *</label>
              <input required value={form.brincoBezerro || ''} onChange={e => set('brincoBezerro', e.target.value)} placeholder="B001"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Brinco da Matriz *</label>
              <input required value={form.brincoMatriz || ''} onChange={e => set('brincoMatriz', e.target.value)} placeholder="A001"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Brinco do Pai</label>
              <input value={form.brincoPai || ''} onChange={e => set('brincoPai', e.target.value)} placeholder="T001"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data *</label>
              <input required type="date" value={form.data || ''} onChange={e => set('data', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Peso ao Nascer (kg)</label>
              <input type="number" step="0.1" value={form.peso ?? ''} onChange={e => set('peso', Number(e.target.value))} placeholder="0"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Sexo *</label>
              <select required value={form.sexo || 'M'} onChange={e => set('sexo', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option value="M">Macho</option>
                <option value="F">Fêmea</option>
              </select>
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Observação</label>
            <textarea value={form.observacao || ''} onChange={e => set('observacao', e.target.value)} rows={2} placeholder="Opcional"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground resize-none" />
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

export default function NascimentosView({ nascimentos, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Nascimento | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Nascimento | null>(null);

  const filtered = nascimentos.filter(n => {
    const q = search.toLowerCase();
    return n.brincoBezerro.toLowerCase().includes(q) || n.brincoMatriz.toLowerCase().includes(q);
  });

  const hoje = new Date();
  const mesAtual = hoje.getMonth();
  const anoAtual = hoje.getFullYear();
  const noMes = nascimentos.filter(n => { const d = new Date(n.data); return d.getMonth() === mesAtual && d.getFullYear() === anoAtual; }).length;
  const machos = nascimentos.filter(n => n.sexo === 'M').length;
  const femeas = nascimentos.filter(n => n.sexo === 'F').length;
  const comPeso = nascimentos.filter(n => n.peso != null && n.peso > 0);
  const pesoMedio = comPeso.length ? comPeso.reduce((s, n) => s + (n.peso ?? 0), 0) / comPeso.length : 0;

  const handleSave = (form: Partial<Nascimento>) => {
    const isNew = modalMode === 'create';
    const n: Nascimento = {
      id: editing?.id ?? crypto.randomUUID(),
      brincoBezerro: form.brincoBezerro!,
      brincoMatriz: form.brincoMatriz!,
      brincoPai: form.brincoPai || undefined,
      data: form.data || '',
      peso: form.peso != null && form.peso !== 0 ? Number(form.peso) : undefined,
      sexo: (form.sexo as 'M' | 'F') || 'M',
      observacao: form.observacao || undefined,
    };
    onSave(n, isNew);
    setModalMode(null); setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Baby size={22} className="text-primary" /> Nascimentos</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{nascimentos.length} registros</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Novo Nascimento
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-4">
        <StatCard variant="inline" icon={Baby} label="Total" value={nascimentos.length} tone="primary" />
        <StatCard variant="inline" icon={Baby} label="Neste Mês" value={noMes} tone="success" />
        <StatCard variant="inline" icon={Baby} label="Machos" value={machos} tone="info" />
        <StatCard variant="inline" icon={Baby} label="Fêmeas" value={femeas} tone="pink" />
        <StatCard variant="inline" icon={Baby} label="Peso Médio" value={`${pesoMedio.toFixed(1)}kg`} tone="warning" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Bezerro ou matriz..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Baby} title="Nenhum nascimento encontrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Bezerro', 'Matriz', 'Pai', 'Data', 'Peso', 'Sexo', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(n => (
                  <tr key={n.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-black text-sm text-primary">{n.brincoBezerro}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{n.brincoMatriz}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{n.brincoPai || '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{n.data ? new Date(n.data).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-foreground">{n.peso != null ? `${n.peso} kg` : '—'}</td>
                    <td className="px-5 py-3.5"><Badge variant={n.sexo === 'F' ? 'pink' : 'info'}>{n.sexo === 'F' ? 'Fêmea' : 'Macho'}</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(n); setModalMode('edit'); }} className="p-2 text-info hover:bg-info-soft rounded-lg transition-colors"><Edit size={13} /></button>
                        <button onClick={() => setDeleteTarget(n)} className="p-2 text-destructive hover:bg-destructive-soft rounded-lg transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {nascimentos.length} nascimentos</div>
      </div>

      {modalMode && <Modal mode={modalMode} initial={editing || {}} onClose={() => { setModalMode(null); setEditing(null); }} onSave={handleSave} />}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Remover Nascimento"
        description={<>Remover o nascimento do bezerro <span className="font-black text-foreground">{deleteTarget?.brincoBezerro}</span>?</>}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
      />
    </div>
  );
}
