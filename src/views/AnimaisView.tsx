import { useState } from 'react';
import { Plus, Search, Edit, Trash2, Beef, X, AlertTriangle } from 'lucide-react';
import type { Animal } from '../types';

type Props = { animals: Animal[]; onSave: (a: Animal, isNew: boolean) => void; onDelete: (id: number) => void; };

const RACAS = ['Nelore', 'Angus', 'Girolando', 'Brahman', 'Guzera', 'Tabapuã', 'Simental', 'Hereford', 'Mestiço', 'Outro'];

function Modal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'; initial: Partial<Animal>; onClose: () => void; onSave: (a: Partial<Animal>) => void;
}) {
  const [form, setForm] = useState<Partial<Animal>>(initial);
  const set = (k: keyof Animal, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="font-black text-foreground flex items-center gap-2"><Beef size={16} className="text-primary" />{mode === 'create' ? 'Novo Animal' : 'Editar Animal'}</h2>
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
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Nome</label>
              <input value={form.nome || ''} onChange={e => set('nome', e.target.value)} placeholder="Opcional"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Raça *</label>
              <select required value={form.raca || ''} onChange={e => set('raca', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option value="">Selecione</option>
                {RACAS.map(r => <option key={r}>{r}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Sexo *</label>
              <select required value={form.sexo || ''} onChange={e => set('sexo', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option value="">Selecione</option>
                <option value="F">Fêmea</option>
                <option value="M">Macho</option>
              </select>
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data de Nascimento</label>
              <input type="date" value={form.dataNasc || ''} onChange={e => set('dataNasc', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Peso (kg)</label>
              <input type="number" value={form.peso || ''} onChange={e => set('peso', Number(e.target.value))} placeholder="0"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Lote</label>
              <input value={form.lote || ''} onChange={e => set('lote', e.target.value)} placeholder="Lote A"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Status</label>
              <select value={form.status || 'Ativo'} onChange={e => set('status', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option>Ativo</option><option>Vendido</option><option>Morto</option>
              </select>
            </div>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">
              {mode === 'create' ? 'Cadastrar' : 'Salvar'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function AnimaisView({ animals, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterSexo, setFilterSexo] = useState('Todos');
  const [filterStatus, setFilterStatus] = useState('Ativo');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Animal | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Animal | null>(null);

  const filtered = animals.filter(a => {
    const q = search.toLowerCase();
    return (
      (a.brinco.toLowerCase().includes(q) || (a.nome || '').toLowerCase().includes(q) || a.raca.toLowerCase().includes(q)) &&
      (filterSexo === 'Todos' || a.sexo === filterSexo) &&
      (filterStatus === 'Todos' || a.status === filterStatus)
    );
  });

  const handleSave = (form: Partial<Animal>) => {
    const isNew = modalMode === 'create';
    const a: Animal = { id: editing?.id ?? Date.now(), brinco: form.brinco!, raca: form.raca!, sexo: form.sexo as 'M' | 'F', dataNasc: form.dataNasc || '', peso: form.peso || 0, lote: form.lote || '', status: (form.status as Animal['status']) || 'Ativo', nome: form.nome };
    onSave(a, isNew);
    setModalMode(null); setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Beef size={22} className="text-primary" /> Animais</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{animals.filter(a => a.status === 'Ativo').length} animais ativos</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Cadastrar Animal
        </button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Brinco, nome ou raça..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
        <select value={filterSexo} onChange={e => setFilterSexo(e.target.value)}
          className="px-3 py-2.5 bg-card border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
          <option>Todos</option><option value="F">Fêmeas</option><option value="M">Machos</option>
        </select>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-card border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
          <option>Todos</option><option>Ativo</option><option>Vendido</option><option>Morto</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground"><Beef size={32} className="mx-auto mb-3 opacity-30" /><p className="font-bold text-sm">Nenhum animal encontrado.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Brinco', 'Nome', 'Raça', 'Sexo', 'Dt. Nasc.', 'Peso', 'Lote', 'Status', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 8 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(a => (
                  <tr key={a.id} className="hover:bg-muted/20 transition-colors">
                    <td className="px-5 py-3.5 font-black text-sm text-primary">{a.brinco}</td>
                    <td className="px-5 py-3.5 text-sm font-medium text-foreground">{a.nome || '—'}</td>
                    <td className="px-5 py-3.5 text-sm text-muted-foreground">{a.raca}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${a.sexo === 'F' ? 'bg-pink-100 text-pink-700' : 'bg-blue-100 text-blue-700'}`}>{a.sexo === 'F' ? 'Fêmea' : 'Macho'}</span>
                    </td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{a.dataNasc ? new Date(a.dataNasc).toLocaleDateString('pt-BR') : '—'}</td>
                    <td className="px-5 py-3.5 font-bold text-sm text-foreground">{a.peso} kg</td>
                    <td className="px-5 py-3.5 text-xs text-muted-foreground">{a.lote || '—'}</td>
                    <td className="px-5 py-3.5">
                      <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${a.status === 'Ativo' ? 'bg-green-100 text-green-700' : a.status === 'Vendido' ? 'bg-amber-100 text-amber-700' : 'bg-muted text-muted-foreground'}`}>{a.status}</span>
                    </td>
                    <td className="px-5 py-3.5 text-right">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setEditing(a); setModalMode('edit'); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={13} /></button>
                        <button onClick={() => setDeleteTarget(a)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {animals.length} animais</div>
      </div>

      {modalMode && <Modal mode={modalMode} initial={editing || {}} onClose={() => { setModalMode(null); setEditing(null); }} onSave={handleSave} />}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl p-7 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} className="text-destructive" /></div>
            <h2 className="font-black text-lg text-foreground mb-1">Remover Animal</h2>
            <p className="text-muted-foreground text-sm mb-6">Remover <span className="font-black text-foreground">{deleteTarget.brinco}</span>?</p>
            <div className="flex gap-3">
              <button onClick={() => setDeleteTarget(null)} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors">Cancelar</button>
              <button onClick={() => { onDelete(deleteTarget.id); setDeleteTarget(null); }} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-destructive text-destructive-foreground hover:bg-destructive/90 transition-colors flex items-center justify-center gap-2"><Trash2 size={14} /> Remover</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
