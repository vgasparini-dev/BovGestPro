// ─────────────────────────────────────────────────────────────
// BoviGest PRO — Core Types
// ─────────────────────────────────────────────────────────────

export type UserRole = 'Admin' | 'Operador' | 'Veterinario';
export type UserStatus = 'Ativo' | 'Inativo';
export type CloudStatus = 'online' | 'offline' | 'error' | 'connecting';

export type AppUser = {
  id: number;
  nome: string;
  email: string;
  senha: string;
  role: UserRole;
  status: UserStatus;
  criadoEm: string;
  ultimoAcesso?: string;
  avatar?: string;
};

export type Animal = {
  id: number;
  brinco: string;
  nome?: string;
  raca: string;
  sexo: 'M' | 'F';
  dataNasc: string;
  peso: number;
  lote: string;
  status: 'Ativo' | 'Vendido' | 'Morto';
  observacao?: string;
};

export type Pesagem = {
  id: number;
  brinco: string;
  pesoAtual: number;
  pesoAnterior?: number;
  data: string;
  observacao?: string;
};

export type Vacinacao = {
  id: number;
  vacina: string;
  lote: string;
  brincos: string[];
  dataAplicacao: string;
  dataLiberacao?: string;
  veterinario?: string;
  observacao?: string;
};

export type Nascimento = {
  id: number;
  brincoBezerro: string;
  brincoMatriz: string;
  brincoPai?: string;
  data: string;
  peso?: number;
  sexo: 'M' | 'F';
  observacao?: string;
};

export type RegistroLeite = {
  id: number;
  data: string;
  quantidade: number;
  turno: 'Manhã' | 'Tarde' | 'Noite';
  responsavel?: string;
};

export type Financeiro = {
  id: number;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  status: 'pago' | 'pendente';
};

export type Insumo = {
  id: number;
  nome: string;
  categoria: string;
  quantidade: number;
  unidade: string;
  estoqueMinimo: number;
  fornecedor?: string;
  validade?: string;
  custo?: number;
};

export type Lote = {
  id: number;
  nome: string;
  descricao?: string;
  quantidadeAnimais: number;
  pasto?: string;
};

export type CalendarioEvento = {
  id: number;
  doenca: string;
  mes: string;
  publico: string;
  obrigatorio: boolean;
  observacao?: string;
};

export type Reproducao = {
  id: number;
  brinco: string;
  status: 'Prenhe' | 'Vazia' | 'Em cio' | 'Gestação';
  dataCobertura?: string;
  dataPrevistoParto?: string;
  pai?: string;
  observacao?: string;
};

export type Confinamento = {
  id: number;
  brinco: string;
  curral: string;
  dataEntrada: string;
  pesoEntrada: number;
  pesoAtual: number;
  dataUltimaPesagem?: string;
  dieta: string;
  custoDiario: number;
  previsaoSaida?: string;
  status: 'Em confinamento' | 'Finalizado' | 'Vendido';
  observacao?: string;
};

export type AppData = {
  usuarios: AppUser[];
  animais: Animal[];
  pesagens: Pesagem[];
  vacinacoes: Vacinacao[];
  nascimentos: Nascimento[];
  leite: RegistroLeite[];
  financeiro: Financeiro[];
  insumos: Insumo[];
  lotes: Lote[];
  calendario: CalendarioEvento[];
  reproducao: Reproducao[];
  confinamento: Confinamento[];
};
