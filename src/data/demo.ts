import type { AppData } from '../types';

// ── Helpers de data relativa ───────────────────────────────────────────────
// Garante que os dados demo sempre pareçam "recentes", independente de
// quando o app for aberto (evita cards "do mês" zerados por datas fixas).
function toISO(d: Date) {
  return d.toISOString().slice(0, 10);
}
function daysAgo(n: number) {
  const d = new Date();
  d.setDate(d.getDate() - n);
  return toISO(d);
}
function thisMonth(day: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth());
  d.setDate(Math.min(day, 28));
  return toISO(d);
}
function lastMonth(day: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - 1);
  d.setDate(Math.min(day, 28));
  return toISO(d);
}
function monthsAgoDate(n: number) {
  const d = new Date();
  d.setDate(1);
  d.setMonth(d.getMonth() - n);
  return toISO(d);
}
function futureDate(n: number) {
  const d = new Date();
  d.setDate(d.getDate() + n);
  return toISO(d);
}
export const demoData: AppData = {
  usuarios: [],
  animais: [],
  pesagens: [
    { id: 1, brinco: 'A001', pesoAtual: 420, pesoAnterior: 395, data: daysAgo(18), dataAnterior: daysAgo(48) },
    { id: 2, brinco: 'A002', pesoAtual: 580, pesoAnterior: 560, data: daysAgo(17), dataAnterior: daysAgo(47) },
    { id: 3, brinco: 'A003', pesoAtual: 390, pesoAnterior: 375, data: daysAgo(16), dataAnterior: daysAgo(46) },
    { id: 4, brinco: 'A005', pesoAtual: 450, pesoAnterior: 430, data: daysAgo(4), dataAnterior: daysAgo(34) },
  ],
  vacinacoes: [
    { id: 1, vacina: 'Febre Aftosa', lote: 'FA-2024-01', brincos: ['A001', 'A002', 'A003'], dataAplicacao: daysAgo(45), dataLiberacao: daysAgo(30) },
    { id: 2, vacina: 'Brucelose', lote: 'BR-2024-02', brincos: ['A004', 'A005'], dataAplicacao: daysAgo(10), dataLiberacao: futureDate(5), veterinario: 'Dr. João Vet' },
    { id: 3, vacina: 'Raiva', lote: 'RB-2024-03', brincos: ['A001', 'A006', 'A007', 'A008'], dataAplicacao: daysAgo(2) },
  ],
  nascimentos: [
    { id: 1, brincoBezerro: 'B001', brincoMatriz: 'A001', brincoPai: 'A002', data: daysAgo(60), peso: 32, sexo: 'F' },
    { id: 2, brincoBezerro: 'B002', brincoMatriz: 'A003', data: daysAgo(30), peso: 28, sexo: 'M' },
    { id: 3, brincoBezerro: 'B003', brincoMatriz: 'A005', brincoPai: 'A008', data: daysAgo(6), peso: 35, sexo: 'F' },
  ],
  leite: [
    { id: 1, data: thisMonth(1), quantidade: 120, turno: 'Manhã' },
    { id: 2, data: thisMonth(1), quantidade: 85, turno: 'Tarde' },
    { id: 3, data: thisMonth(2), quantidade: 118, turno: 'Manhã' },
    { id: 4, data: thisMonth(2), quantidade: 90, turno: 'Tarde' },
    { id: 5, data: daysAgo(0), quantidade: 115, turno: 'Manhã' },
    { id: 6, data: lastMonth(28), quantidade: 110, turno: 'Manhã' },
    { id: 7, data: lastMonth(28), quantidade: 82, turno: 'Tarde' },
  ],
  financeiro: [],
  insumos: [
    { id: 1, nome: 'Ração Concentrada Bovinos', categoria: 'Alimentação', quantidade: 500, unidade: 'kg', estoqueMinimo: 1000, fornecedor: 'Nutral Rações', custo: 2.8 },
    { id: 2, nome: 'Ivermectina 1%', categoria: 'Medicamentos', quantidade: 50, unidade: 'ml', estoqueMinimo: 100, validade: futureDate(240), custo: 45 },
    { id: 3, nome: 'Vacina Febre Aftosa', categoria: 'Vacinas', quantidade: 200, unidade: 'doses', estoqueMinimo: 50, validade: futureDate(120) },
    { id: 4, nome: 'Sal Mineral', categoria: 'Alimentação', quantidade: 250, unidade: 'kg', estoqueMinimo: 200, custo: 3.5 },
    { id: 5, nome: 'Diesel S10', categoria: 'Combustível', quantidade: 300, unidade: 'L', estoqueMinimo: 400, fornecedor: 'Posto Central' },
    { id: 6, nome: 'Seringa Descartável', categoria: 'Equipamentos', quantidade: 30, unidade: 'un', estoqueMinimo: 50 },
  ],
  lotes: [
    { id: 1, nome: 'Lote A', descricao: 'Vacas em lactação', quantidadeAnimais: 3, pasto: 'Pasto Norte' },
    { id: 2, nome: 'Lote B', descricao: 'Touros reprodutores', quantidadeAnimais: 3, pasto: 'Pasto Sul' },
    { id: 3, nome: 'Lote C', descricao: 'Animais jovens', quantidadeAnimais: 2, pasto: 'Pasto Leste' },
  ],
  calendario: (() => {
    const nomesMes = ['Janeiro', 'Fevereiro', 'Março', 'Abril', 'Maio', 'Junho', 'Julho', 'Agosto', 'Setembro', 'Outubro', 'Novembro', 'Dezembro'];
    const hoje = new Date();
    const mAtual = nomesMes[hoje.getMonth()];
    const mProx1 = nomesMes[(hoje.getMonth() + 1) % 12];
    const mProx2 = nomesMes[(hoje.getMonth() + 2) % 12];
    const mProx3 = nomesMes[(hoje.getMonth() + 3) % 12];
    return [
      { id: 1, doenca: 'Febre Aftosa', mes: mAtual, publico: 'Todo o rebanho', obrigatorio: true },
      { id: 2, doenca: 'Brucelose', mes: mProx1, publico: 'Fêmeas 3–8 meses', obrigatorio: true },
      { id: 3, doenca: 'Raiva', mes: mProx1, publico: 'Todo o rebanho', obrigatorio: false },
      { id: 4, doenca: 'Carbúnculo', mes: mProx2, publico: 'Bovinos acima de 6 meses', obrigatorio: false },
      { id: 5, doenca: 'Leptospirose', mes: mProx2, publico: 'Reprodutores', obrigatorio: false },
      { id: 6, doenca: 'IBR/BVD', mes: mProx3, publico: 'Fêmeas em reprodução', obrigatorio: false },
    ];
  })(),
  reproducao: [
    { id: 1, brinco: 'A001', status: 'Prenhe', dataCobertura: monthsAgoDate(3), dataPrevistoParto: futureDate(180), pai: 'A002' },
    { id: 2, brinco: 'A003', status: 'Em cio', observacao: 'Monitorar' },
    { id: 3, brinco: 'A005', status: 'Vazia', observacao: 'Aguardando avaliação veterinária' },
    { id: 4, brinco: 'A007', status: 'Gestação', dataCobertura: monthsAgoDate(2), dataPrevistoParto: futureDate(210) },
  ],
  confinamento: [],
};
