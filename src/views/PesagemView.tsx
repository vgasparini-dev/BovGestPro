import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Scale, X, TrendingUp } from 'lucide-react';
import type { Pesagem } from '../types';
import { gmdPesagem } from '../lib/zootecnia';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

type Props = { pesagens: Pesagem[]; onSave: (p: Pesagem, isNew: boolean) => void; onDelete: (id: string) => void; };

function Modal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'; initial: Partial<Pesagem>; onClose: () => void; onSave: (p: Partial<Pesagem>) => void;
}) {
  const [form, setForm] = useState<Partial<Pesagem>>({ data: new Date().toISOString().slice(0, 10), ...initial });
  const set = (k: keyof Pesagem, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 sticky top-0">
          <h2 className="font-black text-foreground flex items-center gap-2"><Scale size={16} className="text-primary" />{mode === 'create' ? 'Nova Pesagem' : 'Editar Pesagem'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Brinco *</label>
              <input required value={form.brinco || ''} onChange={e => set('brinco', e.target.value)} placeholder="A001"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Peso Atual (kg) *</label>
              <input required type="number" step="0.1" value={form.pesoAtual ?? ''} onChange={e => set('pesoAtual', Number(e.target.value))} placeholder="0"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Peso Anterior (kg)</label>
              <input type="number" step="0.1" value={form.pesoAnterior ?? ''} onChange={e => set('pesoAnterior', Number(e.target.value))} placeholder="Opcional"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data Anterior</label>
              <input type="date" value={form.dataAnterior || ''} onChange={e => set('dataAnterior', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data da Pesagem *</label>
            <input required type="date" value={form.data || ''} onChange={e => set('data', e.target.value)}
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

export default function PesagemView({ pesagens, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Pesagem | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Pesagem | null>(null);

  const filtered = pesagens.filter(p => {
    const q = search.toLowerCase();
    return p.brinco.toLowerCase().includes(q);
  });

  const gmds = pesagens.map(gmdPesagem).filter((v): v is number => v != null);
  const gmdMedio = gmds.length ? gmds.reduce((s, v) => s + v, 0) / gmds.length : 0;
  const pesoMedio = pesagens.length ? pesagens.reduce((s, p) => s + p.pesoAtual, 0) / pesagens.length : 0;

  const handleSave = (form: Partial<Pesagem>) => {
    const isNew = modalMode === 'create';
    const p: Pesagem = {
      id: editing?.id ?? crypto.randomUUID(),
      brinco: form.brinco!,
      pesoAtual: Number(form.pesoAtual) || 0,
      pesoAnterior: form.pesoAnterior != null && form.pesoAnterior !== 0 ? Number(form.pesoAnterior) : undefined,
      dataAnterior: form.dataAnterior || undefined,
      data: form.data || '',
      observacao: form.observacao || undefined,
    };
    onSave(p, isNew);
    setModalMode(null); setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Scale size={22} className="text-primary" /> Pesagem</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{pesagens.length} registros</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Nova Pesagem
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4">
        <StatCard variant="inline" icon={Scale} label="Pesagens" value={pesagens.length} tone="warning" />
        <StatCard variant="inline" icon={Scale} label="Peso Médio Atual" value={`${pesoMedio.toFixed(0)}kg`} tone="primary" />
        <StatCard variant="inline" icon={TrendingUp} label="GMD Médio" value={`${gmdMedio.toFixed(2)}kg/d`} tone="success" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Brinco..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Scale} title="Nenhuma pesagem encontrada." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Brinco', 'Peso Atual', 'Peso Anterior', 'Data Anterior', 'Data', 'GMD', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(p => {
                  const g = gmdPesagem(p);
                  return (
                    <tr key={p.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-black text-sm text-primary">{p.brinco}</td>
                      <td className="px-5 py-3.5 font-bold text-sm text-foreground">{p.pesoAtual} kg</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{p.pesoAnterior != null ? `${p.pesoAnterior} kg` : '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{p.dataAnterior ? new Date(p.dataAnterior).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{p.data ? new Date(p.data).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-5 py-3.5">{g != null ? <Badge variant={g >= 1 ? 'success' : g > 0 ? 'warning' : 'danger'}>{g.toFixed(2)}kg/d</Badge> : <span className="text-xs text-muted-foreground">—</span>}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditing(p); setModalMode('edit'); }} className="p-2 text-info hover:bg-info-soft rounded-lg transition-colors"><Edit size={13} /></button>
                          <button onClick={() => setDeleteTarget(p)} className="p-2 text-destructive hover:bg-destructive-soft rounded-lg transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {pesagens.length} pesagens</div>
      </div>

      {modalMode && <Modal mode={modalMode} initial={editing || {}} onClose={() => { setModalMode(null); setEditing(null); }} onSave={handleSave} />}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Remover Pesagem"
        description={<>Remover pesagem do brinco <span className="font-black text-foreground">{deleteTarget?.brinco}</span>?</>}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
      />
    </div>
  );
}
