import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Syringe, X, ShieldAlert } from 'lucide-react';
import type { Vacinacao } from '../types';
import { Badge } from '@/components/ui/badge';
import StatCard from '@/components/StatCard';
import EmptyState from '@/components/EmptyState';
import ConfirmDeleteDialog from '@/components/ConfirmDeleteDialog';

type Props = { vacinacoes: Vacinacao[]; onSave: (v: Vacinacao, isNew: boolean) => void; onDelete: (id: string) => void; };

const VACINAS = ['Febre Aftosa', 'Brucelose', 'Raiva', 'Carbúnculo', 'Leptospirose', 'IBR/BVD', 'Clostridioses', 'Outra'];

function parseBrincos(text: string): string[] {
  return text.split(/[\n,;]+/).map(s => s.trim()).filter(Boolean);
}

function Modal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'; initial: Partial<Vacinacao>; onClose: () => void; onSave: (v: Partial<Vacinacao>) => void;
}) {
  const [form, setForm] = useState<Partial<Vacinacao>>(initial);
  const [brincosText, setBrincosText] = useState((initial.brincos || []).join(', '));
  const set = (k: keyof Vacinacao, v: string) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 sticky top-0">
          <h2 className="font-black text-foreground flex items-center gap-2"><Syringe size={16} className="text-primary" />{mode === 'create' ? 'Nova Vacinação' : 'Editar Vacinação'}</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave({ ...form, brincos: parseBrincos(brincosText) }); }} className="p-6 space-y-4">
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Vacina *</label>
              <select required value={form.vacina || ''} onChange={e => set('vacina', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option value="">Selecione</option>
                {VACINAS.map(v => <option key={v}>{v}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Lote *</label>
              <input required value={form.lote || ''} onChange={e => set('lote', e.target.value)} placeholder="Lote A"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Brincos Vacinados</label>
            <textarea value={brincosText} onChange={e => setBrincosText(e.target.value)} rows={2} placeholder="A001, A002, A003 (separados por vírgula)"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground resize-none" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data de Aplicação *</label>
              <input required type="date" value={form.dataAplicacao || ''} onChange={e => set('dataAplicacao', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data de Liberação</label>
              <input type="date" value={form.dataLiberacao || ''} onChange={e => set('dataLiberacao', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Veterinário</label>
            <input value={form.veterinario || ''} onChange={e => set('veterinario', e.target.value)} placeholder="Responsável pela aplicação"
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

export default function VacinacaoView({ vacinacoes, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Vacinacao | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Vacinacao | null>(null);

  const hoje = new Date();
  const emCarencia = (v: Vacinacao) => !!(v.dataLiberacao && new Date(v.dataLiberacao) > hoje);

  const filtered = vacinacoes.filter(v => {
    const q = search.toLowerCase();
    return v.vacina.toLowerCase().includes(q) || v.lote.toLowerCase().includes(q);
  });

  const carenciaCount = vacinacoes.filter(emCarencia).length;
  const animaisVacinados = new Set(vacinacoes.flatMap(v => v.brincos)).size;
  const vacinasDistintas = new Set(vacinacoes.map(v => v.vacina)).size;

  const handleSave = (form: Partial<Vacinacao>) => {
    const isNew = modalMode === 'create';
    const v: Vacinacao = {
      id: editing?.id ?? crypto.randomUUID(),
      vacina: form.vacina!,
      lote: form.lote!,
      brincos: form.brincos ?? [],
      dataAplicacao: form.dataAplicacao || '',
      dataLiberacao: form.dataLiberacao || undefined,
      veterinario: form.veterinario || undefined,
      observacao: form.observacao || undefined,
    };
    onSave(v, isNew);
    setModalMode(null); setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Syringe size={22} className="text-primary" /> Vacinação</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{vacinacoes.length} aplicações registradas</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Nova Vacinação
        </button>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        <StatCard variant="inline" icon={Syringe} label="Aplicações" value={vacinacoes.length} tone="primary" />
        <StatCard variant="inline" icon={ShieldAlert} label="Em Carência" value={carenciaCount} tone="warning" />
        <StatCard variant="inline" icon={Syringe} label="Animais Vacinados" value={animaisVacinados} tone="info" />
        <StatCard variant="inline" icon={Syringe} label="Vacinas Distintas" value={vacinasDistintas} tone="purple" />
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Vacina ou lote..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <EmptyState icon={Syringe} title="Nenhuma vacinação encontrada." />
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Vacina', 'Lote', 'Animais', 'Aplicação', 'Liberação', 'Status', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(v => (
                  <tr key={v.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-black text-sm text-primary">{v.vacina}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{v.lote}</td>
                    <td className="px-5 py-3.5 text-sm font-bold text-foreground">{v.brincos.length}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{v.dataAplicacao ? new Date(v.dataAplicacao).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{v.dataLiberacao ? new Date(v.dataLiberacao).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-5 py-3.5">
                      <Badge variant={emCarencia(v) ? 'warning' : 'success'}>{emCarencia(v) ? 'Em carência' : 'Liberado'}</Badge>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(v); setModalMode('edit'); }} className="p-2 text-info hover:bg-info-soft rounded-lg transition-colors"><Edit size={13} /></button>
                        <button onClick={() => setDeleteTarget(v)} className="p-2 text-destructive hover:bg-destructive-soft rounded-lg transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {vacinacoes.length} vacinações</div>
      </div>

      {modalMode && <Modal mode={modalMode} initial={editing || {}} onClose={() => { setModalMode(null); setEditing(null); }} onSave={handleSave} />}
      <ConfirmDeleteDialog
        open={!!deleteTarget}
        title="Remover Vacinação"
        description={<>Remover a vacinação <span className="font-black text-foreground">{deleteTarget?.vacina}</span> do lote <span className="font-black text-foreground">{deleteTarget?.lote}</span>?</>}
        onCancel={() => setDeleteTarget(null)}
        onConfirm={() => { if (deleteTarget) onDelete(deleteTarget.id); setDeleteTarget(null); }}
      />
    </div>
  );
}
