import type { SupabaseClient } from '@supabase/supabase-js';
import { supabase } from '@/integrations/supabase/client';
import type { Animal, Financeiro, Confinamento, AppUser } from '@/types';

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
