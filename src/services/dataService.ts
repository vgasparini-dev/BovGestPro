import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type {
  Animal, Financeiro, Confinamento, AppUser,
  Pesagem, Vacinacao, Nascimento, RegistroLeite, Insumo, Lote, Reproducao, Pasto,
} from '@/types';

// Loosen the client's table typing at this boundary so the service depends on
// our own row shapes (below) instead of the framework-regenerated Database type.
const db = supabase as unknown as SupabaseClient;

// ── DB row shapes (snake_case) ─────────────────────────────────────
type AnimalRow = {
  id: string;
  brinco: string | null;
  nome: string | null;
  raca: string | null;
  sexo: string | null;
  data_nasc: string | null;
  peso: number | null;
  lote: string | null;
  status: string | null;
  observacao: string | null;
};

type FinanceiroRow = {
  id: string;
  tipo: string | null;
  categoria: string | null;
  descricao: string | null;
  valor: number | null;
  data: string | null;
  status: string | null;
};

type ConfinamentoRow = {
  id: string;
  brinco: string | null;
  curral: string | null;
  data_entrada: string | null;
  peso_entrada: number | null;
  peso_atual: number | null;
  data_ultima_pesagem: string | null;
  dieta: string | null;
  custo_diario: number | null;
  previsao_saida: string | null;
  status: string | null;
  observacao: string | null;
};

type ProfileRow = {
  id: string;
  farm_id: string;
  nome: string | null;
  email: string | null;
  role: string | null;
  status: string | null;
  criado_em: string | null;
  ultimo_acesso: string | null;
};

type PesagemRow = {
  id: string;
  brinco: string | null;
  peso_atual: number | null;
  peso_anterior: number | null;
  data_anterior: string | null;
  data: string | null;
  observacao: string | null;
};

type VacinacaoRow = {
  id: string;
  vacina: string | null;
  lote: string | null;
  brincos: string[] | null;
  data_aplicacao: string | null;
  data_liberacao: string | null;
  veterinario: string | null;
  observacao: string | null;
};

type NascimentoRow = {
  id: string;
  brinco_bezerro: string | null;
  brinco_matriz: string | null;
  brinco_pai: string | null;
  data: string | null;
  peso: number | null;
  sexo: string | null;
  observacao: string | null;
};

type LeiteRow = {
  id: string;
  data: string | null;
  quantidade: number | null;
  turno: string | null;
  responsavel: string | null;
};

type InsumoRow = {
  id: string;
  nome: string | null;
  categoria: string | null;
  quantidade: number | null;
  unidade: string | null;
  estoque_minimo: number | null;
  fornecedor: string | null;
  validade: string | null;
  custo: number | null;
};

type LoteRow = {
  id: string;
  nome: string | null;
  descricao: string | null;
  pasto: string | null;
};

type ReproducaoRow = {
  id: string;
  brinco: string | null;
  status: string | null;
  data_cobertura: string | null;
  data_previsto_parto: string | null;
  pai: string | null;
  observacao: string | null;
};

type PastoRow = {
  id: string;
  nome: string | null;
  area_hectares: number | null;
  capacidade_animais: number | null;
  observacao: string | null;
};

// ── mappers (DB snake_case → app camelCase) ─────────────────────────
function ptDate(iso?: string | null): string | undefined {
  if (!iso) return undefined;
  const d = new Date(iso);
  return Number.isNaN(d.getTime()) ? undefined : d.toLocaleDateString('pt-BR');
}

function mapAnimal(r: AnimalRow): Animal {
  return {
    id: r.id,
    brinco: r.brinco ?? '',
    nome: r.nome ?? undefined,
    raca: r.raca ?? '',
    sexo: r.sexo === 'F' ? 'F' : 'M',
    dataNasc: r.data_nasc ?? '',
    peso: Number(r.peso ?? 0),
    lote: r.lote ?? '',
    status: (r.status as Animal['status']) ?? 'Ativo',
    observacao: r.observacao ?? undefined,
  };
}

function mapFinanceiro(r: FinanceiroRow): Financeiro {
  return {
    id: r.id,
    tipo: (r.tipo as Financeiro['tipo']) ?? 'despesa',
    categoria: r.categoria ?? '',
    descricao: r.descricao ?? '',
    valor: Number(r.valor ?? 0),
    data: r.data ?? '',
    status: (r.status as Financeiro['status']) ?? 'pendente',
  };
}

function mapConfinamento(r: ConfinamentoRow): Confinamento {
  return {
    id: r.id,
    brinco: r.brinco ?? '',
    curral: r.curral ?? '',
    dataEntrada: r.data_entrada ?? '',
    pesoEntrada: Number(r.peso_entrada ?? 0),
    pesoAtual: Number(r.peso_atual ?? 0),
    dataUltimaPesagem: r.data_ultima_pesagem ?? undefined,
    dieta: r.dieta ?? '',
    custoDiario: Number(r.custo_diario ?? 0),
    previsaoSaida: r.previsao_saida ?? undefined,
    status: (r.status as Confinamento['status']) ?? 'Em confinamento',
    observacao: r.observacao ?? undefined,
  };
}

function mapProfile(r: ProfileRow): AppUser {
  return {
    id: r.id,
    nome: r.nome ?? '',
    email: r.email ?? '',
    senha: '',
    role: (r.role as AppUser['role']) ?? 'Operador',
    status: (r.status as AppUser['status']) ?? 'Ativo',
    criadoEm: ptDate(r.criado_em) ?? '',
    ultimoAcesso: ptDate(r.ultimo_acesso),
  };
}

function mapPesagem(r: PesagemRow): Pesagem {
  return {
    id: r.id,
    brinco: r.brinco ?? '',
    pesoAtual: Number(r.peso_atual ?? 0),
    pesoAnterior: r.peso_anterior != null ? Number(r.peso_anterior) : undefined,
    dataAnterior: r.data_anterior ?? undefined,
    data: r.data ?? '',
    observacao: r.observacao ?? undefined,
  };
}

function mapVacinacao(r: VacinacaoRow): Vacinacao {
  return {
    id: r.id,
    vacina: r.vacina ?? '',
    lote: r.lote ?? '',
    brincos: Array.isArray(r.brincos) ? r.brincos : [],
    dataAplicacao: r.data_aplicacao ?? '',
    dataLiberacao: r.data_liberacao ?? undefined,
    veterinario: r.veterinario ?? undefined,
    observacao: r.observacao ?? undefined,
  };
}

function mapNascimento(r: NascimentoRow): Nascimento {
  return {
    id: r.id,
    brincoBezerro: r.brinco_bezerro ?? '',
    brincoMatriz: r.brinco_matriz ?? '',
    brincoPai: r.brinco_pai ?? undefined,
    data: r.data ?? '',
    peso: r.peso != null ? Number(r.peso) : undefined,
    sexo: r.sexo === 'F' ? 'F' : 'M',
    observacao: r.observacao ?? undefined,
  };
}

function mapLeite(r: LeiteRow): RegistroLeite {
  return {
    id: r.id,
    data: r.data ?? '',
    quantidade: Number(r.quantidade ?? 0),
    turno: (r.turno as RegistroLeite['turno']) ?? 'Manhã',
    responsavel: r.responsavel ?? undefined,
  };
}

function mapInsumo(r: InsumoRow): Insumo {
  return {
    id: r.id,
    nome: r.nome ?? '',
    categoria: r.categoria ?? '',
    quantidade: Number(r.quantidade ?? 0),
    unidade: r.unidade ?? '',
    estoqueMinimo: Number(r.estoque_minimo ?? 0),
    fornecedor: r.fornecedor ?? undefined,
    validade: r.validade ?? undefined,
    custo: r.custo != null ? Number(r.custo) : undefined,
  };
}

function mapLote(r: LoteRow): Lote {
  return {
    id: r.id,
    nome: r.nome ?? '',
    descricao: r.descricao ?? undefined,
    pasto: r.pasto ?? undefined,
  };
}

function mapReproducao(r: ReproducaoRow): Reproducao {
  return {
    id: r.id,
    brinco: r.brinco ?? '',
    status: (r.status as Reproducao['status']) ?? 'Vazia',
    dataCobertura: r.data_cobertura ?? undefined,
    dataPrevistoParto: r.data_previsto_parto ?? undefined,
    pai: r.pai ?? undefined,
    observacao: r.observacao ?? undefined,
  };
}

function mapPasto(r: PastoRow): Pasto {
  return {
    id: r.id,
    nome: r.nome ?? '',
    areaHectares: r.area_hectares != null ? Number(r.area_hectares) : undefined,
    capacidadeAnimais: r.capacidade_animais != null ? Number(r.capacidade_animais) : undefined,
    observacao: r.observacao ?? undefined,
  };
}

// ── Animais ─────────────────────────────────────────────────────────
export async function fetchAnimais(): Promise<Animal[]> {
  const { data, error } = await db.from('animais').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as AnimalRow[]) ?? []).map(mapAnimal);
}

export async function upsertAnimal(a: Animal): Promise<Animal> {
  const payload = {
    id: a.id || undefined,
    brinco: a.brinco,
    nome: a.nome ?? null,
    raca: a.raca,
    sexo: a.sexo,
    data_nasc: a.dataNasc ?? null,
    peso: a.peso,
    lote: a.lote,
    status: a.status,
    observacao: a.observacao ?? null,
  };
  const { data, error } = await db.from('animais').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar o animal.');
  return mapAnimal(data as unknown as AnimalRow);
}

export async function deleteAnimal(id: string): Promise<void> {
  const { error } = await db.from('animais').delete().eq('id', id);
  if (error) throw error;
}

// ── Financeiro ──────────────────────────────────────────────────────
export async function fetchFinanceiro(): Promise<Financeiro[]> {
  const { data, error } = await db.from('financeiro').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as FinanceiroRow[]) ?? []).map(mapFinanceiro);
}

export async function upsertFinanceiro(f: Financeiro): Promise<Financeiro> {
  const payload = {
    id: f.id || undefined,
    tipo: f.tipo,
    categoria: f.categoria,
    descricao: f.descricao,
    valor: f.valor,
    data: f.data ?? null,
    status: f.status,
  };
  const { data, error } = await db.from('financeiro').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar o lançamento.');
  return mapFinanceiro(data as unknown as FinanceiroRow);
}

export async function deleteFinanceiro(id: string): Promise<void> {
  const { error } = await db.from('financeiro').delete().eq('id', id);
  if (error) throw error;
}

// ── Confinamento ────────────────────────────────────────────────────
export async function fetchConfinamento(): Promise<Confinamento[]> {
  const { data, error } = await db.from('confinamento').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as ConfinamentoRow[]) ?? []).map(mapConfinamento);
}

export async function upsertConfinamento(c: Confinamento): Promise<Confinamento> {
  const payload = {
    id: c.id || undefined,
    brinco: c.brinco,
    curral: c.curral,
    data_entrada: c.dataEntrada ?? null,
    peso_entrada: c.pesoEntrada,
    peso_atual: c.pesoAtual,
    data_ultima_pesagem: c.dataUltimaPesagem ?? null,
    dieta: c.dieta,
    custo_diario: c.custoDiario,
    previsao_saida: c.previsaoSaida ?? null,
    status: c.status,
    observacao: c.observacao ?? null,
  };
  const { data, error } = await db.from('confinamento').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar o confinamento.');
  return mapConfinamento(data as unknown as ConfinamentoRow);
}

export async function deleteConfinamento(id: string): Promise<void> {
  const { error } = await db.from('confinamento').delete().eq('id', id);
  if (error) throw error;
}

// ── Profiles ───────────────────────────────────────────────────────
export async function fetchProfiles(): Promise<AppUser[]> {
  const { data, error } = await db.from('profiles').select('*').order('criado_em', { ascending: true });
  if (error) throw error;
  return ((data as unknown as ProfileRow[]) ?? []).map(mapProfile);
}

export async function fetchProfile(id: string): Promise<AppUser | null> {
  const { data, error } = await db.from('profiles').select('*').eq('id', id).maybeSingle();
  if (error || !data) return null;
  return mapProfile(data as unknown as ProfileRow);
}

/** Atualiza apenas o nome do próprio perfil (tabela `profiles`). */
export async function updateProfileNome(id: string, nome: string): Promise<void> {
  const { error } = await db.from('profiles').update({ nome }).eq('id', id);
  if (error) throw error;
}

// ── Pesagens ────────────────────────────────────────────────────────
export async function fetchPesagens(): Promise<Pesagem[]> {
  const { data, error } = await db.from('pesagens').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as PesagemRow[]) ?? []).map(mapPesagem);
}

export async function upsertPesagem(p: Pesagem): Promise<Pesagem> {
  const payload = {
    id: p.id || undefined,
    brinco: p.brinco,
    peso_atual: p.pesoAtual,
    peso_anterior: p.pesoAnterior ?? null,
    data_anterior: p.dataAnterior ?? null,
    data: p.data ?? null,
    observacao: p.observacao ?? null,
  };
  const { data, error } = await db.from('pesagens').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar a pesagem.');
  return mapPesagem(data as unknown as PesagemRow);
}

export async function deletePesagem(id: string): Promise<void> {
  const { error } = await db.from('pesagens').delete().eq('id', id);
  if (error) throw error;
}

// ── Vacinações ───────────────────────────────────────────────────────
export async function fetchVacinacoes(): Promise<Vacinacao[]> {
  const { data, error } = await db.from('vacinacoes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as VacinacaoRow[]) ?? []).map(mapVacinacao);
}

export async function upsertVacinacao(v: Vacinacao): Promise<Vacinacao> {
  const payload = {
    id: v.id || undefined,
    vacina: v.vacina,
    lote: v.lote,
    brincos: v.brincos,
    data_aplicacao: v.dataAplicacao ?? null,
    data_liberacao: v.dataLiberacao ?? null,
    veterinario: v.veterinario ?? null,
    observacao: v.observacao ?? null,
  };
  const { data, error } = await db.from('vacinacoes').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar a vacinação.');
  return mapVacinacao(data as unknown as VacinacaoRow);
}

export async function deleteVacinacao(id: string): Promise<void> {
  const { error } = await db.from('vacinacoes').delete().eq('id', id);
  if (error) throw error;
}

// ── Nascimentos ──────────────────────────────────────────────────────
export async function fetchNascimentos(): Promise<Nascimento[]> {
  const { data, error } = await db.from('nascimentos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as NascimentoRow[]) ?? []).map(mapNascimento);
}

export async function upsertNascimento(n: Nascimento): Promise<Nascimento> {
  const payload = {
    id: n.id || undefined,
    brinco_bezerro: n.brincoBezerro,
    brinco_matriz: n.brincoMatriz,
    brinco_pai: n.brincoPai ?? null,
    data: n.data ?? null,
    peso: n.peso ?? null,
    sexo: n.sexo,
    observacao: n.observacao ?? null,
  };
  const { data, error } = await db.from('nascimentos').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar o nascimento.');
  return mapNascimento(data as unknown as NascimentoRow);
}

export async function deleteNascimento(id: string): Promise<void> {
  const { error } = await db.from('nascimentos').delete().eq('id', id);
  if (error) throw error;
}

// ── Leite ────────────────────────────────────────────────────────────
export async function fetchLeite(): Promise<RegistroLeite[]> {
  const { data, error } = await db.from('leite').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as LeiteRow[]) ?? []).map(mapLeite);
}

export async function upsertLeite(l: RegistroLeite): Promise<RegistroLeite> {
  const payload = {
    id: l.id || undefined,
    data: l.data ?? null,
    quantidade: l.quantidade,
    turno: l.turno,
    responsavel: l.responsavel ?? null,
  };
  const { data, error } = await db.from('leite').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar a produção de leite.');
  return mapLeite(data as unknown as LeiteRow);
}

export async function deleteLeite(id: string): Promise<void> {
  const { error } = await db.from('leite').delete().eq('id', id);
  if (error) throw error;
}

// ── Insumos ──────────────────────────────────────────────────────────
export async function fetchInsumos(): Promise<Insumo[]> {
  const { data, error } = await db.from('insumos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as InsumoRow[]) ?? []).map(mapInsumo);
}

export async function upsertInsumo(i: Insumo): Promise<Insumo> {
  const payload = {
    id: i.id || undefined,
    nome: i.nome,
    categoria: i.categoria,
    quantidade: i.quantidade,
    unidade: i.unidade,
    estoque_minimo: i.estoqueMinimo,
    fornecedor: i.fornecedor ?? null,
    validade: i.validade ?? null,
    custo: i.custo ?? null,
  };
  const { data, error } = await db.from('insumos').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar o insumo.');
  return mapInsumo(data as unknown as InsumoRow);
}

export async function deleteInsumo(id: string): Promise<void> {
  const { error } = await db.from('insumos').delete().eq('id', id);
  if (error) throw error;
}

// ── Lotes ───────────────────────────────────────────────────────────
export async function fetchLotes(): Promise<Lote[]> {
  const { data, error } = await db.from('lotes').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as LoteRow[]) ?? []).map(mapLote);
}

export async function upsertLote(l: Lote): Promise<Lote> {
  const payload = {
    id: l.id || undefined,
    nome: l.nome,
    descricao: l.descricao ?? null,
    pasto: l.pasto ?? null,
  };
  const { data, error } = await db.from('lotes').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar o lote.');
  return mapLote(data as unknown as LoteRow);
}

export async function deleteLote(id: string): Promise<void> {
  const { error } = await db.from('lotes').delete().eq('id', id);
  if (error) throw error;
}

// ── Reprodução ────────────────────────────────────────────────────────
export async function fetchReproducao(): Promise<Reproducao[]> {
  const { data, error } = await db.from('reproducao').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as ReproducaoRow[]) ?? []).map(mapReproducao);
}

export async function upsertReproducao(r: Reproducao): Promise<Reproducao> {
  const payload = {
    id: r.id || undefined,
    brinco: r.brinco,
    status: r.status,
    data_cobertura: r.dataCobertura ?? null,
    data_previsto_parto: r.dataPrevistoParto ?? null,
    pai: r.pai ?? null,
    observacao: r.observacao ?? null,
  };
  const { data, error } = await db.from('reproducao').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar o registro reprodutivo.');
  return mapReproducao(data as unknown as ReproducaoRow);
}

export async function deleteReproducao(id: string): Promise<void> {
  const { error } = await db.from('reproducao').delete().eq('id', id);
  if (error) throw error;
}

// ── Pastos ──────────────────────────────────────────────────────────
export async function fetchPastos(): Promise<Pasto[]> {
  const { data, error } = await db.from('pastos').select('*').order('created_at', { ascending: false });
  if (error) throw error;
  return ((data as unknown as PastoRow[]) ?? []).map(mapPasto);
}

export async function upsertPasto(p: Pasto): Promise<Pasto> {
  const payload = {
    id: p.id || undefined,
    nome: p.nome,
    area_hectares: p.areaHectares ?? null,
    capacidade_animais: p.capacidadeAnimais ?? null,
    observacao: p.observacao ?? null,
  };
  const { data, error } = await db.from('pastos').upsert(payload).select('*').maybeSingle();
  if (error) throw error;
  if (!data) throw new Error('Falha ao salvar o pasto.');
  return mapPasto(data as unknown as PastoRow);
}

export async function deletePasto(id: string): Promise<void> {
  const { error } = await db.from('pastos').delete().eq('id', id);
  if (error) throw error;
}
