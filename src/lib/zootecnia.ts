// ─────────────────────────────────────────────────────────────
// BoviGest PRO — Cálculos Zootécnicos
// Funções puras reutilizadas pela tela de Confinamento, pelo
// Dashboard e pela tela de Índices Zootécnicos.
// ─────────────────────────────────────────────────────────────
import type { AppData, Confinamento, Pesagem } from '../types';

export type Nivel = 'bom' | 'regular' | 'atencao';

export function diasEntre(inicioISO: string, fimISO?: string): number {
  const inicio = new Date(inicioISO).getTime();
  const fim = fimISO ? new Date(fimISO).getTime() : Date.now();
  return Math.max(1, Math.round((fim - inicio) / 86400000));
}

export function diasConfinado(c: Confinamento): number {
  const fim = c.status === 'Em confinamento' ? undefined : (c.dataUltimaPesagem || c.dataEntrada);
  return diasEntre(c.dataEntrada, fim);
}

export function gmdConfinamento(c: Confinamento): number {
  const dias = diasConfinado(c);
  return (c.pesoAtual - c.pesoEntrada) / dias;
}

/** GMD de uma pesagem individual — requer o campo opcional `dataAnterior`. */
export function gmdPesagem(p: Pesagem): number | null {
  if (!p.dataAnterior || p.pesoAnterior == null) return null;
  const dias = diasEntre(p.dataAnterior, p.data);
  return (p.pesoAtual - p.pesoAnterior) / dias;
}

/** Classifica um valor em bom/regular/atenção a partir de dois limiares.
 * Por padrão, "maior é melhor". Use `invertido: true` quando "menor é melhor"
 * (ex.: taxa de mortalidade). */
export function classificar(valor: number, limiteBom: number, limiteRegular: number, invertido = false): Nivel {
  if (invertido) {
    if (valor <= limiteBom) return 'bom';
    if (valor <= limiteRegular) return 'regular';
    return 'atencao';
  }
  if (valor >= limiteBom) return 'bom';
  if (valor >= limiteRegular) return 'regular';
  return 'atencao';
}

export type IndicesZootecnicos = {
  taxaPrenhez: number;
  taxaNatalidade: number;
  gmdRebanho: number;
  gmdConfinamentoMedio: number;
  produtividadeLeiteira: number;
  coberturaVacinal: number;
  taxaMortalidade: number;
  taxaDesfrute: number;
  relacaoMachoFemea: number;
  pesoMedioPorLote: { lote: string; pesoMedio: number; qtd: number }[];
};

export function calcularIndices(data: AppData): IndicesZootecnicos {
  const anoAtual = new Date().getFullYear();

  // Reprodutivo
  const totalReproducao = data.reproducao.length;
  const prenhes = data.reproducao.filter(r => r.status === 'Prenhe' || r.status === 'Gestação').length;
  const taxaPrenhez = totalReproducao > 0 ? (prenhes / totalReproducao) * 100 : 0;

  const femeasRebanho = data.animais.filter(a => a.sexo === 'F').length;
  const nascimentosAno = data.nascimentos.filter(n => new Date(n.data).getFullYear() === anoAtual).length;
  const taxaNatalidade = femeasRebanho > 0 ? (nascimentosAno / femeasRebanho) * 100 : 0;

  // Produtivo
  const gmdsPesagem = data.pesagens.map(gmdPesagem).filter((v): v is number => v != null);
  const gmdRebanho = gmdsPesagem.length > 0 ? gmdsPesagem.reduce((s, v) => s + v, 0) / gmdsPesagem.length : 0;

  const emConfinamento = data.confinamento.filter(c => c.status === 'Em confinamento');
  const gmdConfinamentoMedio = emConfinamento.length > 0
    ? emConfinamento.reduce((s, c) => s + gmdConfinamento(c), 0) / emConfinamento.length
    : 0;

  const diasComLeite = new Set(data.leite.map(l => l.data)).size;
  const totalLeite = data.leite.reduce((s, l) => s + l.quantidade, 0);
  const produtividadeLeiteira = diasComLeite > 0 ? totalLeite / diasComLeite : 0;

  const pesoMedioPorLote = data.lotes.map(lote => {
    const animaisDoLote = data.animais.filter(a => a.lote === lote.nome);
    const pesoMedio = animaisDoLote.length > 0
      ? animaisDoLote.reduce((s, a) => s + a.peso, 0) / animaisDoLote.length
      : 0;
    return { lote: lote.nome, pesoMedio, qtd: animaisDoLote.length };
  });

  // Sanitário / Geral
  const brincosVacinados = new Set(data.vacinacoes.flatMap(v => v.brincos));
  const coberturaVacinal = data.animais.length > 0 ? (brincosVacinados.size / data.animais.length) * 100 : 0;

  const mortos = data.animais.filter(a => a.status === 'Morto').length;
  const totalHistorico = data.animais.length;
  const taxaMortalidade = totalHistorico > 0 ? (mortos / totalHistorico) * 100 : 0;

  const vendidosRebanho = data.animais.filter(a => a.status === 'Vendido').length;
  const vendidosConfinamento = data.confinamento.filter(c => c.status === 'Vendido').length;
  const taxaDesfrute = data.animais.length > 0 ? ((vendidosRebanho + vendidosConfinamento) / data.animais.length) * 100 : 0;

  const machos = data.animais.filter(a => a.sexo === 'M').length;
  const relacaoMachoFemea = femeasRebanho > 0 ? machos / femeasRebanho : 0;

  return {
    taxaPrenhez, taxaNatalidade, gmdRebanho, gmdConfinamentoMedio,
    produtividadeLeiteira, coberturaVacinal, taxaMortalidade, taxaDesfrute,
    relacaoMachoFemea, pesoMedioPorLote,
  };
}
