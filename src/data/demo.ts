import type { AppData } from '../types';

// Os dados de produção vêm do Enter Cloud (banco) — o `demoData` só serve de
// estado inicial vazio antes do primeiro fetch. Única exceção: `calendario`,
// que é conteúdo informativo estático do Dashboard (sem tela própria).
export const demoData: AppData = {
  usuarios: [],
  animais: [],
  pesagens: [],
  vacinacoes: [],
  nascimentos: [],
  leite: [],
  financeiro: [],
  insumos: [],
  lotes: [],
  pastos: [],
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
  reproducao: [],
  confinamento: [],
};
