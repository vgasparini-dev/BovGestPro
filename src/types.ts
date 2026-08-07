// ─────────────────────────────────────────────────────────────
// BoviGest PRO — Core Types
// ─────────────────────────────────────────────────────────────

export type UserRole = 'Admin' | 'Operador' | 'Veterinario';
export type UserStatus = 'Ativo' | 'Inativo';
export type CloudStatus = 'connecting' | 'online' | 'error';

export type AppUser = {
  id: string;
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
  id: string;
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
  id: string;
  brinco: string;
  pesoAtual: number;
  pesoAnterior?: number;
  dataAnterior?: string;
  data: string;
  observacao?: string;
};

export type Vacinacao = {
  id: string;
  vacina: string;
  lote: string;
  brincos: string[];
  dataAplicacao: string;
  dataLiberacao?: string;
  veterinario?: string;
  observacao?: string;
};

export type Nascimento = {
  id: string;
  brincoBezerro: string;
  brincoMatriz: string;
  brincoPai?: string;
  data: string;
  peso?: number;
  sexo: 'M' | 'F';
  observacao?: string;
};

export type RegistroLeite = {
  id: string;
  data: string;
  quantidade: number;
  turno: 'Manhã' | 'Tarde' | 'Noite';
  responsavel?: string;
};

export type Financeiro = {
  id: string;
  tipo: 'receita' | 'despesa';
  categoria: string;
  descricao: string;
  valor: number;
  data: string;
  status: 'pago' | 'pendente';
};

export type Insumo = {
  id: string;
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
  id: string;
  nome: string;
  descricao?: string;
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
  id: string;
  brinco: string;
  status: 'Prenhe' | 'Vazia' | 'Em cio' | 'Gestação';
  dataCobertura?: string;
  dataPrevistoParto?: string;
  pai?: string;
  observacao?: string;
};

export type Pasto = {
  id: string;
  nome: string;
  areaHectares?: number;
  capacidadeAnimais?: number;
  observacao?: string;
};

export type Confinamento = {
  id: string;
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
  pastos: Pasto[];
  calendario: CalendarioEvento[];
  reproducao: Reproducao[];
  confinamento: Confinamento[];
};
