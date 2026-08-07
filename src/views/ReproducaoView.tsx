import { useState } from 'react';
import { Plus, Search, Edit, Trash2, HeartPulse, X } from 'lucide-react';
import type { Reproducao } from '../types';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

type Props = { reproducao: Reproducao[]; onSave: (r: Reproducao, isNew: boolean) => void; onDelete: (id: string) => void; };

const STATUS: Reproducao['status'][] = ['Prenhe', 'Gestação', 'Em cio', 'Vazia'];
const STATUS_VARIANT: Record<Reproducao['status'], 'pink' | 'warning' | 'muted'> = {
  Prenhe: 'pink', 'Gestação': 'pink', 'Em cio': 'warning', Vazia: 'muted',
};

function Modal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'; initial: Partial<Reproducao>; onClose: () => void; onSave: (r: Partial<Reproducao>) => void;
}) {
  const [form, setForm] = useState<Partial<Reproducao>>({ status: 'Vazia', ...initial });
  const set = (k: keyof Reproducao, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 sticky top-0">
          <h2 className="font-black text-foreground flex items-center gap-2"><HeartPulse size={16} className="text-primary" />{mode === 'create' ? 'Novo Registro Reprodutivo' : 'Editar Registro'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Brinco (Matriz) *</label>
              <input required value={form.brinco || ''} onChange={e => set('brinco', e.target.value)} placeholder="A001"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Status *</label>
              <select required value={form.status || 'Vazia'} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                {STATUS.map(s => <option key={s}>{s}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data da Cobertura</label>
              <input type="date" value={form.dataCobertura || ''} onChange={e => set('dataCobertura', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Previsão de Parto</label>
              <input type="date" value={form.dataPrevistoParto || ''} onChange={e => set('dataPrevistoParto', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Pai / Touro</label>
            <input value={form.pai || ''} onChange={e => set('pai', e.target.value)} placeholder="Brinco ou nome do touro"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
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

export default function ReproducaoView({ reproducao, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Todos');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Reproducao | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Reproducao | null>(null);

  const filtered = reproducao.filter(r => {
    const q = search.toLowerCase();
    return r.brinco.toLowerCase().includes(q) && (filterStatus === 'Todos' || r.status === filterStatus);
  });

  const prenhes = reproducao.filter(r => r.status === 'Prenhe' || r.status === 'Gestação').length;
  const vazias = reproducao.filter(r => r.status === 'Vazia').length;
  const emCio = reproducao.filter(r => r.status === 'Em cio').length;
  const taxaPrenhez = reproducao.length ? (prenhes / reproducao.length) * 100 : 0;

  const handleSave = (form: Partial<Reproducao>) => {
    const isNew = modalMode === 'create';
    const r: Reproducao = {
      id: editing?.id ?? crypto.randomUUID(),
      brinco: form.brinco!,
      status: (form.status as Reproducao['status']) || 'Vazia',
      dataCobertura: form.dataCobertura || undefined,
      dataPrevistoParto: form.dataPrevistoParto || undefined,
      pai: form.pai || undefined,
      observacao: form.observacao || undefined,
    };
    onSave(r, isNew);
    setModalMode(null); setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><HeartPulse size={22} className="text-primary" /> Reprodução</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{reproducao.length} matrizes em acompanhamento</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Novo Registro
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard variant="inline" icon={HeartPulse} label="Matrizes" value={reproducao.length} tone="primary" />
        <StatCard variant="inline" icon={HeartPulse} label="Prenhes / Gestantes" value={prenhes} tone="pink" />
        <StatCard variant="inline" icon={HeartPulse} label="Em Cio" value={emCio} tone="warning" />
        <StatCard variant="inline" icon={HeartPulse} label="Taxa de Prenhez" value={`${taxaPrenhez.toFixed(0)}%`} tone="success" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Brinco..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-card border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
          <option>Todos</option>{STATUS.map(s => <option key={s}>{s}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={HeartPulse} title="Nenhum registro reprodutivo encontrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Brinco', 'Status', 'Cobertura', 'Previsão de Parto', 'Pai', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 5 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(r => (
                  <tr key={r.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-black text-sm text-primary">{r.brinco}</td>
                    <td className="px-5 py-3.5"><Badge variant={STATUS_VARIANT[r.status]}>{r.status}</Badge></td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{r.dataCobertura ? new Date(r.dataCobertura).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{r.dataPrevistoParto ? new Date(r.dataPrevistoParto).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{r.pai || '—'}</td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(r); setModalMode('edit'); }} className="p-2 text-info hover:bg-info-soft rounded-lg transition-colors"><Edit size={13} /></button>
                        <button onClick={() => setDeleteTarget(r)} className="p-2 text-destructive hover:bg-destructive-soft rounded-lg transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {reproducao.length} registros · {vazias} vazias</div>
      </div>

      {modalMode && <Modal mode={modalMode} initial={editing || {}} onClose={() => { setModalMode(null); setEditing(null); }} onSave={handleSave} />}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Remover Registro"
        description={<>Remover o registro reprodutivo do brinco <span className="font-black text-foreground">{deleteTarget?.brinco}</span>?</>}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
      />
    </div>
  );
}
