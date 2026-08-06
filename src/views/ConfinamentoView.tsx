import { useState } from 'react';
import {
  Plus, Search, Edit, Trash2, Warehouse, X, AlertTriangle,
  TrendingUp, Scale, DollarSign, CalendarClock,
} from 'lucide-react';
import type { Confinamento } from '../types';
import { diasConfinado, gmdConfinamento } from '../lib/zootecnia';

type Props = { confinamento: Confinamento[]; onSave: (c: Confinamento, isNew: boolean) => void; onDelete: (id: number) => void; };

const DIETAS = ['Alto Grão', 'Silagem + Concentrado', 'Volumoso + Concentrado', 'Pasto + Suplementação', 'Outro'];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function StatusBadge({ status }: { status: Confinamento['status'] }) {
  const map = {
    'Em confinamento': 'bg-blue-100 text-blue-700',
    'Finalizado': 'bg-green-100 text-green-700',
    'Vendido': 'bg-amber-100 text-amber-700',
  };
  return <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${map[status]}`}>{status}</span>;
}

function Modal({ mode, initial, onClose, onSave }: {
  mode: 'create' | 'edit'; initial: Partial<Confinamento>; onClose: () => void; onSave: (c: Partial<Confinamento>) => void;
}) {
  const [form, setForm] = useState<Partial<Confinamento>>(initial);
  const set = (k: keyof Confinamento, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden max-h-[90vh] overflow-y-auto scrollbar-thin">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30 sticky top-0">
          <h2 className="font-black text-foreground flex items-center gap-2"><Warehouse size={16} className="text-primary" />{mode === 'create' ? 'Novo Lançamento de Confinamento' : 'Editar Confinamento'}</h2>
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
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Curral / Baia *</label>
              <input required value={form.curral || ''} onChange={e => set('curral', e.target.value)} placeholder="Curral 1"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data de Entrada *</label>
              <input required type="date" value={form.dataEntrada || ''} onChange={e => set('dataEntrada', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Previsão de Saída</label>
              <input type="date" value={form.previsaoSaida || ''} onChange={e => set('previsaoSaida', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Peso de Entrada (kg) *</label>
              <input required type="number" value={form.pesoEntrada || ''} onChange={e => set('pesoEntrada', Number(e.target.value))} placeholder="0"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Peso Atual (kg) *</label>
              <input required type="number" value={form.pesoAtual || ''} onChange={e => set('pesoAtual', Number(e.target.value))} placeholder="0"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Dieta</label>
              <select value={form.dieta || ''} onChange={e => set('dieta', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
                <option value="">Selecione</option>
                {DIETAS.map(d => <option key={d}>{d}</option>)}
              </select>
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Custo Diário (R$/cab)</label>
              <input type="number" step="0.01" value={form.custoDiario || ''} onChange={e => set('custoDiario', Number(e.target.value))} placeholder="0,00"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Status</label>
            <select value={form.status || 'Em confinamento'} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
              <option>Em confinamento</option><option>Finalizado</option><option>Vendido</option>
            </select>
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

export default function ConfinamentoView({ confinamento, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterStatus, setFilterStatus] = useState('Em confinamento');
  const [modalMode, setModalMode] = useState<'create' | 'edit' | null>(null);
  const [editing, setEditing] = useState<Confinamento | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<Confinamento | null>(null);

  const filtered = confinamento.filter(c => {
    const q = search.toLowerCase();
    return (c.brinco.toLowerCase().includes(q) || c.curral.toLowerCase().includes(q)) &&
      (filterStatus === 'Todos' || c.status === filterStatus);
  });

  const ativos = confinamento.filter(c => c.status === 'Em confinamento');
  const pesoMedioEntrada = ativos.length ? ativos.reduce((s, c) => s + c.pesoEntrada, 0) / ativos.length : 0;
  const gmdMedio = ativos.length ? ativos.reduce((s, c) => s + gmdConfinamento(c), 0) / ativos.length : 0;
  const custoDiarioTotal = ativos.reduce((s, c) => s + c.custoDiario, 0);

  const handleSave = (form: Partial<Confinamento>) => {
    const isNew = modalMode === 'create';
    const c: Confinamento = {
      id: editing?.id ?? Date.now(),
      brinco: form.brinco!,
      curral: form.curral!,
      dataEntrada: form.dataEntrada || '',
      pesoEntrada: Number(form.pesoEntrada) || 0,
      pesoAtual: Number(form.pesoAtual) || 0,
      dataUltimaPesagem: form.dataUltimaPesagem,
      dieta: form.dieta || '',
      custoDiario: Number(form.custoDiario) || 0,
      previsaoSaida: form.previsaoSaida,
      status: (form.status as Confinamento['status']) || 'Em confinamento',
      observacao: form.observacao,
    };
    onSave(c, isNew);
    setModalMode(null); setEditing(null);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Warehouse size={22} className="text-primary" /> Confinamento</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{ativos.length} animais em confinamento</p>
        </div>
        <button onClick={() => { setEditing(null); setModalMode('create'); }}
          className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Novo Lançamento
        </button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
        {[
          { label: 'Em confinamento', val: ativos.length, icon: Warehouse, color: 'bg-primary/10 text-primary' },
          { label: 'Peso Médio Entrada', val: `${pesoMedioEntrada.toFixed(0)}kg`, icon: Scale, color: 'bg-amber-100 text-amber-700' },
          { label: 'GMD Médio', val: `${gmdMedio.toFixed(2)}kg/dia`, icon: TrendingUp, color: 'bg-green-100 text-green-700' },
          { label: 'Custo Diário Total', val: formatCurrency(custoDiarioTotal), icon: DollarSign, color: 'bg-purple-100 text-purple-700' },
        ].map(s => (
          <div key={s.label} className="bg-card rounded-2xl border border-border p-4 shadow-sm flex items-center gap-3">
            <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${s.color}`}>
              <s.icon size={18} />
            </div>
            <div className="min-w-0">
              <p className="text-lg font-black text-foreground truncate">{s.val}</p>
              <p className="text-[11px] font-bold text-muted-foreground uppercase tracking-wide truncate">{s.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Brinco ou curral..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
        <select value={filterStatus} onChange={e => setFilterStatus(e.target.value)}
          className="px-3 py-2.5 bg-card border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
          <option>Todos</option><option>Em confinamento</option><option>Finalizado</option><option>Vendido</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        {filtered.length === 0 ? (
          <div className="py-16 text-center text-muted-foreground"><Warehouse size={32} className="mx-auto mb-3 opacity-30" /><p className="font-bold text-sm">Nenhum lançamento encontrado.</p></div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full">
              <thead className="bg-muted/50 border-b border-border">
                <tr>{['Brinco', 'Curral', 'Dias', 'Entrada→Atual', 'GMD', 'Custo/dia', 'Status', 'Previsão Saída', ''].map((h, i) => (
                  <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 8 ? 'text-right' : 'text-left'}`}>{h}</th>
                ))}</tr>
              </thead>
              <tbody className="divide-y divide-border">
                {filtered.map(c => {
                  const dias = diasConfinado(c);
                  const g = gmdConfinamento(c);
                  return (
                    <tr key={c.id} className="hover:bg-muted/20 transition-colors">
                      <td className="px-5 py-3.5 font-black text-sm text-primary">{c.brinco}</td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground">{c.curral}</td>
                      <td className="px-5 py-3.5 text-xs font-bold text-foreground whitespace-nowrap">
                        <div className="flex items-center gap-1"><CalendarClock size={11} className="text-muted-foreground" />{dias}d</div>
                      </td>
                      <td className="px-5 py-3.5 text-sm font-medium text-foreground whitespace-nowrap">{c.pesoEntrada}kg → <span className="font-black">{c.pesoAtual}kg</span></td>
                      <td className="px-5 py-3.5">
                        <span className={`font-black text-sm ${g >= 1 ? 'text-green-700' : g > 0 ? 'text-amber-700' : 'text-red-700'}`}>{g.toFixed(2)}kg/d</span>
                      </td>
                      <td className="px-5 py-3.5 text-sm text-muted-foreground whitespace-nowrap">{formatCurrency(c.custoDiario)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={c.status} /></td>
                      <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{c.previsaoSaida ? new Date(c.previsaoSaida).toLocaleDateString('pt-BR') : '—'}</td>
                      <td className="px-5 py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button onClick={() => { setEditing(c); setModalMode('edit'); }} className="p-2 text-blue-500 hover:bg-blue-50 rounded-lg transition-colors"><Edit size={13} /></button>
                          <button onClick={() => setDeleteTarget(c)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {confinamento.length} lançamentos</div>
      </div>

      {modalMode && <Modal mode={modalMode} initial={editing || { status: 'Em confinamento' }} onClose={() => { setModalMode(null); setEditing(null); }} onSave={handleSave} />}
      {deleteTarget && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-card w-full max-w-sm rounded-2xl border border-border shadow-2xl p-7 text-center">
            <div className="w-12 h-12 bg-destructive/10 rounded-full flex items-center justify-center mx-auto mb-4"><AlertTriangle size={24} className="text-destructive" /></div>
            <h2 className="font-black text-lg text-foreground mb-1">Remover Lançamento</h2>
            <p className="text-muted-foreground text-sm mb-6">Remover animal <span className="font-black text-foreground">{deleteTarget.brinco}</span> do confinamento?</p>
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
