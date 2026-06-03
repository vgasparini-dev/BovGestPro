import { useState } from 'react';
import { DollarSign, Plus, TrendingUp, TrendingDown, Search, X, Trash2 } from 'lucide-react';
import type { Financeiro } from '../types';

type Props = { financeiro: Financeiro[]; onSave: (f: Financeiro, isNew: boolean) => void; onDelete: (id: number) => void; };

const CATS_RECEITA = ['Venda de Animais', 'Venda de Leite', 'Arrendamento', 'Subsídio', 'Outro'];
const CATS_DESPESA = ['Alimentação', 'Veterinário', 'Medicamentos', 'Manutenção', 'Combustível', 'Mão de Obra', 'Impostos', 'Outro'];

function formatCurrency(v: number) {
  return v.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function Modal({ initial, onClose, onSave }: { initial: Partial<Financeiro>; onClose: () => void; onSave: (f: Partial<Financeiro>) => void; }) {
  const [form, setForm] = useState<Partial<Financeiro>>({ tipo: 'receita', status: 'pago', ...initial });
  const set = (k: keyof Financeiro, v: string | number) => setForm(p => ({ ...p, [k]: v }));
  const cats = form.tipo === 'receita' ? CATS_RECEITA : CATS_DESPESA;
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-card w-full max-w-md rounded-2xl border border-border shadow-2xl overflow-hidden">
        <div className="flex items-center justify-between px-6 py-4 border-b border-border bg-muted/30">
          <h2 className="font-black text-foreground flex items-center gap-2"><DollarSign size={16} className="text-primary" />Lançamento Financeiro</h2>
          <button onClick={onClose} className="text-muted-foreground hover:text-foreground p-1 rounded-lg hover:bg-muted transition-colors"><X size={16} /></button>
        </div>
        <form onSubmit={e => { e.preventDefault(); onSave(form); }} className="p-6 space-y-4">
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Tipo *</label>
            <div className="flex gap-2">
              {(['receita', 'despesa'] as const).map(t => (
                <button key={t} type="button" onClick={() => set('tipo', t)}
                  className={`flex-1 py-2 rounded-xl font-bold text-sm border transition-colors ${form.tipo === t ? t === 'receita' ? 'bg-green-600 text-white border-green-600' : 'bg-red-600 text-white border-red-600' : 'border-border text-muted-foreground hover:bg-muted'}`}>
                  {t === 'receita' ? 'Receita' : 'Despesa'}
                </button>
              ))}
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Categoria *</label>
            <select required value={form.categoria || ''} onChange={e => set('categoria', e.target.value)}
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
              <option value="">Selecione</option>
              {cats.map(c => <option key={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Descrição *</label>
            <input required value={form.descricao || ''} onChange={e => set('descricao', e.target.value)} placeholder="Descrição do lançamento"
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Valor (R$) *</label>
              <input required type="number" step="0.01" value={form.valor || ''} onChange={e => set('valor', Number(e.target.value))} placeholder="0,00"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
            <div>
              <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Data *</label>
              <input required type="date" value={form.data || ''} onChange={e => set('data', e.target.value)}
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
            </div>
          </div>
          <div>
            <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase">Status</label>
            <select value={form.status || 'pago'} onChange={e => set('status', e.target.value)}
              className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
              <option value="pago">Pago</option><option value="pendente">Pendente</option>
            </select>
          </div>
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-muted text-foreground border border-border hover:bg-muted/70 transition-colors">Cancelar</button>
            <button type="submit" className="flex-1 py-2.5 rounded-xl font-bold text-sm bg-primary text-primary-foreground hover:bg-primary/90 shadow-sm transition-colors">Salvar</button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default function FinanceiroView({ financeiro, onSave, onDelete }: Props) {
  const [search, setSearch] = useState('');
  const [filterTipo, setFilterTipo] = useState('Todos');
  const [modalOpen, setModalOpen] = useState(false);

  const filtered = financeiro.filter(f => {
    const q = search.toLowerCase();
    return (f.descricao.toLowerCase().includes(q) || f.categoria.toLowerCase().includes(q)) &&
      (filterTipo === 'Todos' || f.tipo === filterTipo);
  });

  const totalReceitas = financeiro.filter(f => f.tipo === 'receita' && f.status === 'pago').reduce((s, f) => s + f.valor, 0);
  const totalDespesas = financeiro.filter(f => f.tipo === 'despesa' && f.status === 'pago').reduce((s, f) => s + f.valor, 0);
  const saldo = totalReceitas - totalDespesas;

  const handleSave = (form: Partial<Financeiro>) => {
    const f: Financeiro = { id: Date.now(), tipo: form.tipo as 'receita' | 'despesa', categoria: form.categoria!, descricao: form.descricao!, valor: Number(form.valor), data: form.data!, status: (form.status as 'pago' | 'pendente') || 'pago' };
    onSave(f, true);
    setModalOpen(false);
  };

  return (
    <div className="space-y-6 fade-in">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><DollarSign size={22} className="text-primary" /> Financeiro</h1>
          <p className="text-muted-foreground text-sm font-medium mt-0.5">{financeiro.length} lançamentos</p>
        </div>
        <button onClick={() => setModalOpen(true)} className="inline-flex items-center gap-2 bg-primary text-primary-foreground font-bold px-5 py-2.5 rounded-xl shadow-sm hover:bg-primary/90 transition-colors text-sm">
          <Plus size={16} /> Novo Lançamento
        </button>
      </div>

      <div className="grid grid-cols-3 gap-4">
        <div className="bg-card rounded-2xl border border-green-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><TrendingUp size={16} className="text-green-600" /><span className="text-xs font-bold text-muted-foreground uppercase">Receitas (pagas)</span></div>
          <p className="text-xl font-black text-green-700">{formatCurrency(totalReceitas)}</p>
        </div>
        <div className="bg-card rounded-2xl border border-red-200 p-5 shadow-sm">
          <div className="flex items-center gap-2 mb-2"><TrendingDown size={16} className="text-red-600" /><span className="text-xs font-bold text-muted-foreground uppercase">Despesas (pagas)</span></div>
          <p className="text-xl font-black text-red-700">{formatCurrency(totalDespesas)}</p>
        </div>
        <div className={`rounded-2xl p-5 shadow-sm ${saldo >= 0 ? 'bg-primary/90' : 'bg-red-800'}`}>
          <p className="text-xs font-bold text-white/60 uppercase mb-2">Saldo Geral</p>
          <p className="text-xl font-black text-white">{formatCurrency(saldo)}</p>
        </div>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-xs">
          <Search size={15} className="absolute left-3 top-3 text-muted-foreground" />
          <input value={search} onChange={e => setSearch(e.target.value)} placeholder="Pesquisar..."
            className="w-full pl-9 pr-4 py-2.5 bg-card border border-input rounded-xl text-sm font-medium outline-none focus:ring-2 focus:ring-primary text-foreground" />
        </div>
        <select value={filterTipo} onChange={e => setFilterTipo(e.target.value)}
          className="px-3 py-2.5 bg-card border border-input rounded-xl text-sm font-bold outline-none focus:ring-2 focus:ring-primary text-foreground appearance-none">
          <option>Todos</option><option value="receita">Receitas</option><option value="despesa">Despesas</option>
        </select>
      </div>

      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full">
            <thead className="bg-muted/50 border-b border-border">
              <tr>{['Tipo', 'Categoria', 'Descrição', 'Valor', 'Data', 'Status', ''].map((h, i) => (
                <th key={i} className={`px-5 py-3.5 text-[11px] font-black uppercase tracking-wider text-muted-foreground whitespace-nowrap ${i === 6 ? 'text-right' : 'text-left'}`}>{h}</th>
              ))}</tr>
            </thead>
            <tbody className="divide-y divide-border">
              {filtered.map(f => (
                <tr key={f.id} className="hover:bg-muted/20 transition-colors">
                  <td className="px-5 py-3.5">
                    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-bold ${f.tipo === 'receita' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                      {f.tipo === 'receita' ? <TrendingUp size={10} /> : <TrendingDown size={10} />}
                      {f.tipo === 'receita' ? 'Receita' : 'Despesa'}
                    </span>
                  </td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground font-medium">{f.categoria}</td>
                  <td className="px-5 py-3.5 text-sm font-medium text-foreground">{f.descricao}</td>
                  <td className="px-5 py-3.5 font-black text-sm text-foreground">{formatCurrency(f.valor)}</td>
                  <td className="px-5 py-3.5 text-xs text-muted-foreground whitespace-nowrap">{new Date(f.data).toLocaleDateString('pt-BR')}</td>
                  <td className="px-5 py-3.5">
                    <span className={`px-2 py-0.5 rounded-full text-[11px] font-bold ${f.status === 'pago' ? 'bg-green-100 text-green-700' : 'bg-amber-100 text-amber-700'}`}>{f.status === 'pago' ? 'Pago' : 'Pendente'}</span>
                  </td>
                  <td className="px-5 py-3.5 text-right">
                    <button onClick={() => onDelete(f.id)} className="p-2 text-red-500 hover:bg-red-50 rounded-lg transition-colors"><Trash2 size={13} /></button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="px-5 py-3 border-t border-border bg-muted/20 text-xs font-bold text-muted-foreground">{filtered.length} de {financeiro.length} lançamentos</div>
      </div>

      {modalOpen && <Modal initial={{}} onClose={() => setModalOpen(false)} onSave={handleSave} />}
    </div>
  );
}
