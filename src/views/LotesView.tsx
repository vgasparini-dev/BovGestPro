import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Grid3X3, X, Beef } from 'lucide-react';
import type { Lote, Animal } from '../types';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

type Props = { lotes: Lote[]; animais: Animal[]; onSave: (l: Lote, isNew: boolean) => void; onDelete: (id: string) => void; };

function Modal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'; initial: Partial<Lote>; onClose: () => void; onSave: (l: Partial<Lote>) => void;
}) {
  const [form, setForm] = useState<Partial<Lote>>(initial);
  const set = (k: keyof Lote, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 sticky top-0">
          <h2 className="font-black text-foreground flex items-center gap-2"><Grid3X3 size={16} className="text-primary" />{mode === 'create' ? 'Novo Lote' : 'Editar Lote'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Nome do Lote *</label>
            <input required value={form.nome || ''} onChange={e => set('nome', e.target.value)} placeholder="Ex.: Lote A"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Pasto</label>
            <input value={form.pasto || ''} onChange={e => set('pasto', e.target.value)} placeholder="Ex.: Pasto Norte"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Descrição</label>
            <textarea value={form.descricao || ''} onChange={e => set('descricao', e.target.value)} rows={2} placeholder="Opcional"
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

export default function LotesView({ lotes, animais, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Lote | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Lote | null>(null);

  const countPorLote = (nome: string) => animais.filter(a => a.lote === nome).length;

  const filtered = lotes.filter(l => {
    const q = search.toLowerCase();
    return l.nome.toLowerCase().includes(q) || (l.pasto || '').toLowerCase().includes(q) || (l.descricao || '').toLowerCase().includes(q);
  });

  const alocados = lotes.reduce((s, l) => s + countPorLote(l.nome), 0);
  const semAnimais = lotes.filter(l => countPorLote(l.nome) === 0).length;
  const comPasto = lotes.filter(l => l.pasto).length;

  const handleSave = (form: Partial<Lote>) => {
    const isNew = modalMode === 'create';
    const l: Lote = {
      id: editing?.id ?? crypto.randomUUID(),
      nome: form.nome!,
      descricao: form.descricao || undefined,
      pasto: form.pasto || undefined,
    };
    onSave(l, isNew);
    setModalMode(null); setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Grid3X3 size={22} className="text-primary" /> Lotes</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{lotes.length} lotes cadastrados</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Novo Lote
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard variant="inline" icon={Grid3X3} label="Lotes" value={lotes.length} tone="primary" />
        <StatCard variant="inline" icon={Beef} label="Animais Alocados" value={alocados} tone="info" />
        <StatCard variant="inline" icon={Grid3X3} label="Lotes Vazios" value={semAnimais} tone="warning" />
        <StatCard variant="inline" icon={Grid3X3} label="Com Pasto" value={comPasto} tone="success" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nome, pasto ou descrição..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Grid3X3} title="Nenhum lote encontrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Nome', 'Descrição', 'Pasto', 'Animais', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 4 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(l => (
                  <tr key={l.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-black text-sm text-primary">{l.nome}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{l.descricao || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{l.pasto || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className="inline-flex items-center gap-1.5 font-black text-sm text-foreground"><Beef size={13} className="text-muted-foreground" />{countPorLote(l.nome)}</span>
                    </td>
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
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {lotes.length} lotes</div>
      </div>

      {modalMode && <Modal mode={modalMode} initial={editing || {}} onClose={() => { setModalMode(null); setEditing(null); }} onSave={handleSave} />}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Remover Lote"
        description={<>Remover o lote <span className="font-black text-foreground">{deleteTarget?.nome}</span>?</>}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
      />
    </div>
  );
}
