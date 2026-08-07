import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Package, X, AlertTriangle } from 'lucide-react';
import type { Insumo } from '../types';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

type Props = { insumos: Insumo[]; onSave: (i: Insumo, isNew: boolean) => void; onDelete: (id: string) => void; };

const CATEGORIAS = ['Ração', 'Suplemento', 'Medicamento', 'Vacina', 'Combustível', 'Ferramenta', 'Limpeza', 'Outro'];
const UNIDADES = ['kg', 'g', 'L', 'mL', 'saco', 'un', 'cx', 'frasco'];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Modal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'; initial: Partial<Insumo>; onClose: () => void; onSave: (i: Partial<Insumo>) => void;
}) {
  const [form, setForm] = useState<Partial<Insumo>>(initial);
  const set = (k: keyof Insumo, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 sticky top-0">
          <h2 className="font-black text-foreground flex items-center gap-2"><Package size={16} className="text-primary" />{mode === 'create' ? 'Novo Insumo' : 'Editar Insumo'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Nome *</label>
            <input required value={form.nome || ''} onChange={e => set('nome', e.target.value)} placeholder="Ex.: Ração de corte"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Categoria *</label>
              <select required value={form.categoria || ''} onChange={e => set('categoria', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option value="">Selecione</option>
                {CATEGORIAS.map(c => <option key={c}>{c}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Unidade *</label>
              <select required value={form.unidade || ''} onChange={e => set('unidade', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option value="">Selecione</option>
                {UNIDADES.map(u => <option key={u}>{u}</option>)}
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Quantidade *</label>
              <input required type="number" step="0.01" value={form.quantidade ?? ''} onChange={e => set('quantidade', Number(e.target.value))} placeholder="0"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Estoque Mínimo *</label>
              <input required type="number" step="0.01" value={form.estoqueMinimo ?? ''} onChange={e => set('estoqueMinimo', Number(e.target.value))} placeholder="0"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Fornecedor</label>
              <input value={form.fornecedor || ''} onChange={e => set('fornecedor', e.target.value)} placeholder="Opcional"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Validade</label>
              <input type="date" value={form.validade || ''} onChange={e => set('validade', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Custo Unitário (R$)</label>
            <input type="number" step="0.01" value={form.custo ?? ''} onChange={e => set('custo', Number(e.target.value))} placeholder="0,00"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
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

export default function InsumosView({ insumos, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterCategoria, setFilterCategoria] = useState('Todas');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Insumo | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Insumo | null>(null);

  const critico = (i: Insumo) => Number(i.quantidade) <= Number(i.estoqueMinimo);

  const filtered = insumos.filter(i => {
    const q = search.toLowerCase();
    return (i.nome.toLowerCase().includes(q) || i.categoria.toLowerCase().includes(q)) &&
      (filterCategoria === 'Todas' || i.categoria === filterCategoria);
  });

  const criticos = insumos.filter(critico).length;
  const valorTotal = insumos.reduce((s, i) => s + (Number(i.custo ?? 0) * Number(i.quantidade)), 0);
  const categorias = new Set(insumos.map(i => i.categoria)).size;

  const handleSave = (form: Partial<Insumo>) => {
    const isNew = modalMode === 'create';
    const i: Insumo = {
      id: editing?.id ?? crypto.randomUUID(),
      nome: form.nome!,
      categoria: form.categoria!,
      quantidade: Number(form.quantidade) || 0,
      unidade: form.unidade!,
      estoqueMinimo: Number(form.estoqueMinimo) || 0,
      fornecedor: form.fornecedor || undefined,
      validade: form.validade || undefined,
      custo: form.custo != null && form.custo !== 0 ? Number(form.custo) : undefined,
    };
    onSave(i, isNew);
    setModalMode(null); setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Package size={22} className="text-primary" /> Insumos</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{insumos.length} itens em estoque</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Novo Insumo
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard variant="inline" icon={Package} label="Itens" value={insumos.length} tone="primary" />
        <StatCard variant="inline" icon={AlertTriangle} label="Estoque Crítico" value={criticos} tone="danger" />
        <StatCard variant="inline" icon={Package} label="Valor em Estoque" value={formatCurrency(valorTotal)} tone="success" />
        <StatCard variant="inline" icon={Package} label="Categorias" value={categorias} tone="purple" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Nome ou categoria..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
        <select value={filterCategoria} onChange={e => setFilterCategoria(e.target.value)}
          className="px-3 py-2.5 bg-card border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
          <option>Todas</option>{CATEGORIAS.map(c => <option key={c}>{c}</option>)}
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Package} title="Nenhum insumo encontrado." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Nome', 'Categoria', 'Quantidade', 'Mínimo', 'Custo Un.', 'Status', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(i => (
                  <tr key={i.id} className={`transition-colors ${critico(i) ? 'bg-destructive-soft/30 hover:bg-destructive-soft/50' : 'hover:bg-muted/20'}`}>
                    <td className="px-5 py-3.5 font-black text-sm text-foreground">{i.nome}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground font-medium">{i.categoria}</td>
                    <td className="px-5 py-3.5 font-bold text-sm text-foreground whitespace-nowrap">{i.quantidade} {i.unidade}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{i.estoqueMinimo} {i.unidade}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{i.custo != null ? formatCurrency(i.custo) : '—'}</td>
                    <td className="px-5 py-3.5"><Badge variant={critico(i) ? 'danger' : 'success'}>{critico(i) ? 'Crítico' : 'OK'}</Badge></td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(i); setModalMode('edit'); }} className="p-2 text-info hover:bg-info-soft rounded-lg transition-colors"><Edit size={13} /></button>
                        <button onClick={() => setDeleteTarget(i)} className="p-2 text-destructive hover:bg-destructive-soft rounded-lg transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {insumos.length} insumos</div>
      </div>

      {modalMode && <Modal mode={modalMode} initial={editing || {}} onClose={() => { setModalMode(null); setEditing(null); }} onSave={handleSave} />}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Remover Insumo"
        description={<>Remover o insumo <span className="font-black text-foreground">{deleteTarget?.nome}</span>?</>}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
      />
    </div>
  );
}
