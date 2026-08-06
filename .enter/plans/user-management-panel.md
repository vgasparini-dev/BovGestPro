# Aprimorar Índices Zootécnicos + continuar aprimoramentos — BoviGest PRO

## Contexto
O app já calcula métricas isoladas em pontos diferentes (GMD só dentro de Confinamento, "Resumo do Rebanho" no Dashboard só mostra contagens simples). Não existe hoje uma visão consolidada dos **índices zootécnicos** (os indicadores que um gestor de fazenda realmente acompanha: taxa de prenhez, taxa de natalidade, GMD do rebanho, cobertura vacinal, mortalidade, desfrute etc.). O pedido é aprimorar esses índices e continuar polindo o site.

## O que será feito

### 1. Nova página "Índices Zootécnicos" (núcleo do pedido)
Página dedicada, acessível pela sidebar, com os índices agrupados por área — cada um com valor calculado a partir dos dados reais (`AppData`), fórmula/explicação curta e um selo de status (Bom / Regular / Atenção) baseado em faixas de referência usuais em pecuária de corte:

- **Reprodutivo**: Taxa de Prenhez (`reproducao` Prenhe+Gestação / total), Taxa de Natalidade (nascimentos no ano / fêmeas do rebanho)
- **Produtivo**: GMD Médio do Rebanho (via `pesagens`, usando novo campo `dataAnterior`), GMD Médio do Confinamento (reaproveitando o cálculo já existente em `ConfinamentoView`), Produtividade Leiteira (L/dia média), Peso Médio por Lote (mini-tabela)
- **Sanitário / Geral**: Cobertura Vacinal (brincos únicos vacinados / total de animais), Taxa de Mortalidade, Taxa de Desfrute (vendidos / rebanho), Relação Macho:Fêmea (informativo, sem selo)

Aviso no rodapé da página: "valores de referência aproximados, ajuste conforme sua categoria animal".

### 2. Utilitário compartilhado `src/lib/zootecnia.ts` (evita duplicar lógica)
Centraliza os cálculos hoje só existentes dentro de `ConfinamentoView.tsx` (`diasConfinado`, `gmd`) e adiciona as novas fórmulas (`gmdPesagem`, `calcularIndices`, `classificar`). `ConfinamentoView.tsx` passa a importar as funções daqui em vez de tê-las duplicadas.

### 3. Pequeno ajuste de modelo para GMD real do rebanho
`Pesagem` ganha campo opcional `dataAnterior?: string`. Sem isso não dá pra calcular um GMD real (só existe `pesoAnterior`, sem a data da pesagem anterior). Dados demo em `src/data/demo.ts` recebem esse campo (intervalo de ~30 dias antes de cada pesagem).

### 4. Dashboard: teaser dos índices
Dentro do card "Resumo do Rebanho" (Row 3), adicionar 2 linhas com os índices mais importantes (Taxa de Prenhez, GMD Médio do Rebanho) e um link "Ver índices completos →" que navega para a nova página. Isso exige um novo prop `onNavigateIndices` passado de `BoviGest.tsx` para `Dashboard.tsx`.

### 5. Polimentos gerais adicionais
- Reduzir levemente o tamanho da fonte dos valores dos KPI cards do Dashboard (`text-2xl` → `text-xl`) para não apertar valores longos como "R$ 13.250,00" na grade de 6 colunas.
- Persistir a preferência de sidebar colapsada/expandida em `localStorage`, para não resetar a cada reload.

## Arquivos afetados
- `src/lib/zootecnia.ts` — **novo**, funções puras de cálculo
- `src/types.ts` — campo opcional `dataAnterior` em `Pesagem`
- `src/data/demo.ts` — adicionar `dataAnterior` nas pesagens demo
- `src/views/ConfinamentoView.tsx` — usar funções de `zootecnia.ts` em vez de duplicá-las
- `src/views/IndicesZootecnicosView.tsx` — **novo**, página completa de índices
- `src/components/Sidebar.tsx` — novo item "Índices Zootécnicos" (ícone `Gauge`), logo após Dashboard
- `src/pages/BoviGest.tsx` — roteia a nova view, passa `onNavigateIndices` ao Dashboard, persiste `sidebarCollapsed` no `localStorage`
- `src/views/Dashboard.tsx` — teaser de índices no card "Resumo do Rebanho" + ajuste de tamanho de fonte dos KPIs

## Implementation checklist
- [ ] Criar `src/lib/zootecnia.ts` com `diasEntre`, `diasConfinado`, `gmdConfinamento`, `gmdPesagem`, `classificar(valor, faixaBoa, faixaRegular, invertido?)`, e `calcularIndices(data: AppData)` retornando todos os valores numéricos usados pela nova página e pelo Dashboard
- [ ] Adicionar `dataAnterior?: string` a `Pesagem` em `src/types.ts`
- [ ] Preencher `dataAnterior` nas 4 pesagens demo em `src/data/demo.ts` (usar `daysAgo(n+30)` relativo à data de cada pesagem)
- [ ] Atualizar `ConfinamentoView.tsx` para importar `diasConfinado`/`gmdConfinamento` de `zootecnia.ts`, removendo as funções locais duplicadas
- [ ] Criar `IndicesZootecnicosView.tsx` com 3 seções (Reprodutivo, Produtivo, Sanitário/Geral), cards com valor + fórmula curta + selo de status colorido, e mini-tabela de peso médio por lote
- [ ] Adicionar `'indices'` ao union `ViewKey` e um item de navegação (ícone `Gauge`) em `Sidebar.tsx`, logo abaixo de "Dashboard"
- [ ] Registrar o case `'indices'` no `renderView()` de `BoviGest.tsx`, renderizando `IndicesZootecnicosView`
- [ ] Adicionar prop `onNavigateIndices` em `Dashboard.tsx`, passado de `BoviGest.tsx` como `() => setCurrentView('indices')`
- [ ] Adicionar ao card "Resumo do Rebanho" do Dashboard 2 linhas (Taxa de Prenhez, GMD Médio do Rebanho) calculadas via `calcularIndices` + botão/link "Ver índices completos"
- [ ] Ajustar `text-2xl` → `text-xl` no valor dos `KpiCard` do Dashboard
- [ ] Persistir `sidebarCollapsed` no `localStorage` (ler no `useState` inicial, gravar no `onToggle`) em `BoviGest.tsx`

## Verification checklist
- [ ] `pnpm lint` sem erros/avisos novos
- [ ] Screenshot da nova página "Índices Zootécnicos": as 3 seções renderizam com valores numéricos coerentes (não `NaN`/`Infinity`) e selos coloridos corretos
- [ ] Screenshot do Dashboard: novo teaser de índices aparece no card "Resumo do Rebanho" e o link navega corretamente para a página de índices
- [ ] Screenshot do Confinamento: GMD e dias confinados continuam idênticos a antes da refatoração (mesma fórmula, agora importada)
- [ ] Colapsar a sidebar, recarregar a página (`website_screenshot` após reload) e confirmar que o estado colapsado persiste
- [ ] Console do navegador sem novos erros após as mudanças
