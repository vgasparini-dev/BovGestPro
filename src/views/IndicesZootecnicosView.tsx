import {
  Gauge, HeartPulse, Baby, TrendingUp, Warehouse, Droplets,
  Syringe, Skull, ArrowRightLeft, Users2, Info, Scale,
} from 'lucide-react';
import type { AppData } from '../types';
import { calcularIndices, classificar, type Nivel } from '../lib/zootecnia';

type Props = { data: AppData };

const NIVEL_STYLE: Record<Nivel, { label: string; bg: string; text: string; dot: string }> = {
  bom:      { label: 'Bom',      bg: 'bg-green-100', text: 'text-green-700', dot: 'bg-green-500' },
  regular:  { label: 'Regular',  bg: 'bg-amber-100', text: 'text-amber-700', dot: 'bg-amber-500' },
  atencao:  { label: 'Atenção',  bg: 'bg-red-100',   text: 'text-red-700',   dot: 'bg-red-500' },
};

function NivelBadge({ nivel }: { nivel: Nivel }) {
  const s = NIVEL_STYLE[nivel];
  return (
    <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-black ${s.bg} ${s.text}`}>
      <span className={`w-1.5 h-1.5 rounded-full ${s.dot}`} />{s.label}
    </span>
  );
}

function IndiceCard({ icon: Icon, label, valor, formula, nivel, color }: {
  icon: typeof Gauge; label: string; valor: string; formula: string; nivel?: Nivel; color: string;
}) {
  return (
    <div className="bg-card rounded-2xl border border-border p-5 shadow-sm card-hover">
      <div className="flex items-start justify-between mb-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${color}`}>
          <Icon size={18} />
        </div>
        {nivel && <NivelBadge nivel={nivel} />}
      </div>
      <p className="text-2xl font-black text-foreground">{valor}</p>
      <p className="text-xs font-bold text-muted-foreground uppercase tracking-wide mt-1">{label}</p>
      <p className="text-[11px] text-muted-foreground mt-2 leading-snug">{formula}</p>
    </div>
  );
}

function SectionTitle({ title, icon: Icon }: { title: string; icon: typeof Gauge }) {
  return (
    <div className="flex items-center gap-2 mt-2">
      <Icon size={16} className="text-primary" />
      <h2 className="font-black text-sm text-foreground uppercase tracking-wide">{title}</h2>
    </div>
  );
}

export default function IndicesZootecnicosView({ data }: Props) {
  const idx = calcularIndices(data);

  return (
    <div className="space-y-6 fade-in">
      <div>
        <h1 className="text-2xl font-black text-foreground flex items-center gap-2"><Gauge size={22} className="text-primary" /> Índices Zootécnicos</h1>
        <p className="text-muted-foreground text-sm font-medium mt-0.5">Indicadores de desempenho do rebanho calculados a partir dos seus dados</p>
      </div>

      {/* Reprodutivo */}
      <div className="space-y-3">
        <SectionTitle title="Reprodutivo" icon={HeartPulse} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <IndiceCard
            icon={HeartPulse} label="Taxa de Prenhez" valor={`${idx.taxaPrenhez.toFixed(1)}%`}
            formula="Fêmeas prenhes ou em gestação ÷ total em acompanhamento reprodutivo"
            nivel={classificar(idx.taxaPrenhez, 85, 70)} color="bg-pink-100 text-pink-700"
          />
          <IndiceCard
            icon={Baby} label="Taxa de Natalidade" valor={`${idx.taxaNatalidade.toFixed(1)}%`}
            formula="Nascimentos no ano ÷ fêmeas do rebanho"
            nivel={classificar(idx.taxaNatalidade, 80, 60)} color="bg-rose-100 text-rose-700"
          />
          <IndiceCard
            icon={Users2} label="Relação Macho:Fêmea" valor={`1:${(1 / (idx.relacaoMachoFemea || 1)).toFixed(1)}`}
            formula="Nº de machos para cada fêmea do rebanho (informativo)"
            color="bg-blue-100 text-blue-700"
          />
          <IndiceCard
            icon={ArrowRightLeft} label="Taxa de Desfrute" valor={`${idx.taxaDesfrute.toFixed(1)}%`}
            formula="Animais vendidos (rebanho + confinamento) ÷ total do rebanho"
            nivel={classificar(idx.taxaDesfrute, 20, 10)} color="bg-indigo-100 text-indigo-700"
          />
        </div>
      </div>

      {/* Produtivo */}
      <div className="space-y-3">
        <SectionTitle title="Produtivo" icon={TrendingUp} />
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          <IndiceCard
            icon={TrendingUp} label="GMD Médio do Rebanho" valor={`${idx.gmdRebanho.toFixed(2)}kg/dia`}
            formula="Ganho médio diário calculado a partir das pesagens registradas"
            nivel={classificar(idx.gmdRebanho, 0.6, 0.3)} color="bg-green-100 text-green-700"
          />
          <IndiceCard
            icon={Warehouse} label="GMD Médio do Confinamento" valor={`${idx.gmdConfinamentoMedio.toFixed(2)}kg/dia`}
            formula="Ganho médio diário dos animais atualmente em confinamento"
            nivel={classificar(idx.gmdConfinamentoMedio, 1.2, 0.8)} color="bg-teal-100 text-teal-700"
          />
          <IndiceCard
            icon={Droplets} label="Produtividade Leiteira" valor={`${idx.produtividadeLeiteira.toFixed(0)}L/dia`}
            formula="Média de litros produzidos por dia com registro de ordenha"
            color="bg-cyan-100 text-cyan-700"
          />
          <IndiceCard
            icon={Scale} label="Peso Médio do Rebanho" valor={`${data.animais.length ? Math.round(data.animais.reduce((s, a) => s + a.peso, 0) / data.animais.length) : 0}kg`}
            formula="Peso médio de todos os animais ativos cadastrados"
            color="bg-amber-100 text-amber-700"
          />
        </div>
      </div>

      {/* Sanitário / Geral */}
      <div className="space-y-3">
        <SectionTitle title="Sanitário" icon={Syringe} />
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <IndiceCard
            icon={Syringe} label="Cobertura Vacinal" valor={`${idx.coberturaVacinal.toFixed(1)}%`}
            formula="Animais com pelo menos 1 vacinação registrada ÷ total do rebanho"
            nivel={classificar(idx.coberturaVacinal, 90, 70)} color="bg-blue-100 text-blue-700"
          />
          <IndiceCard
            icon={Skull} label="Taxa de Mortalidade" valor={`${idx.taxaMortalidade.toFixed(1)}%`}
            formula="Animais com status 'Morto' ÷ total histórico do rebanho"
            nivel={classificar(idx.taxaMortalidade, 2, 5, true)} color="bg-red-100 text-red-700"
          />
        </div>
      </div>

      {/* Peso médio por lote */}
      <div className="bg-card rounded-2xl border border-border shadow-sm overflow-hidden">
        <div className="flex items-center gap-2 px-5 py-3.5 border-b border-border bg-muted/30">
          <Scale size={16} className="text-primary" />
          <h3 className="font-black text-sm text-foreground">Peso Médio por Lote</h3>
        </div>
        <div className="divide-y divide-border">
          {idx.pesoMedioPorLote.length === 0 ? (
            <p className="px-5 py-6 text-center text-sm text-muted-foreground font-medium">Nenhum lote cadastrado.</p>
          ) : idx.pesoMedioPorLote.map(l => (
            <div key={l.lote} className="flex items-center gap-4 px-5 py-3.5">
              <div className="w-28 shrink-0">
                <p className="font-bold text-sm text-foreground">{l.lote}</p>
                <p className="text-[11px] text-muted-foreground">{l.qtd} animais</p>
              </div>
              <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
                <div className="h-full bg-primary rounded-full transition-all" style={{ width: `${Math.min(100, (l.pesoMedio / 700) * 100)}%` }} />
              </div>
              <span className="font-black text-sm text-foreground w-16 text-right shrink-0">{l.pesoMedio.toFixed(0)}kg</span>
            </div>
          ))}
        </div>
      </div>

      <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/40 rounded-xl px-4 py-3">
        <Info size={14} className="shrink-0 mt-0.5" />
        <p>Faixas de referência (Bom/Regular/Atenção) são aproximações usuais para pecuária de corte — ajuste conforme a categoria e finalidade do seu rebanho.</p>
      </div>
    </div>
  );
}
