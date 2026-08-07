# BovGest PRO — Versão Final: concluir todas as abas "Em breve"

## Contexto

O BovGest tem 9 abas ainda marcadas como **"Em breve"** no `Sidebar.tsx`, que renderizam o placeholder `ComingSoon`. O usuário quer a **versão final**: substituir cada placeholder por funcionalidade real (CRUD conectado ao backend).

**Bom:** a camada de backend e serviço **já está 100% pronta** para todas as entidades — não é preciso criar tabelas nem serviços:
- `supabase/migrations/migration_20260807_033644000` já cria as 8 tabelas (`pesagens`, `vacinacoes`, `nascimentos`, `leite`, `insumos`, `lotes`, `reproducao`, `pastos`) com RLS por `farm_id` e Realtime.
- `src/services/dataService.ts` já tem `fetch/upsert/delete` para **todas** as entidades + mappers snake_case→camelCase.
- `src/types.ts` já define todos os tipos.
- `src/lib/zootecnia.ts` já tem os cálculos (`gmdPesagem`, `diasEntre`, `calcularIndices`, etc.).
- A view **Pesagem** (`src/views/PesagemView.tsx`) já está totalmente construída — só não está conectada no `BoviGest.tsx`.

**O que falta:** construir 7 views novas, 1 view de configurações, conectar tudo no `BoviGest.tsx` (load inicial + Realtime + handlers CRUD + `renderView`), remover os flags `soon` do `Sidebar`, e excluir o `ComingSoon.tsx` (código morto).

Todas as views seguirão **exatamente** o padrão já estabelecido em `ConfinamentoView.tsx` / `AnimaisView.tsx` / `PesagemView.tsx`: header com título+ícone+botão "Novo", grade de `StatCard variant="inline"`, barra de busca/filtros, tabela em `bg-card` com `EmptyState`/`ConfirmDeleteDialog`, e modal de create/edit reutilizável.

## Abordagem

### 1. `src/pages/BoviGest.tsx` — núcleo de dados e CRUD
- **Imports:** adicionar os 8 fetch/upsert/delete do `dataService` (`fetchPesagens/upsertPesagem/deletePesagem`, e igual para `vacinacoes`, `nascimentos`, `leite`, `insumos`, `lotes`, `reproducao`, `pastos`); importar as 8 views novas + `PesagemView`.
- **`loadAll`:** estender o `Promise.all` para buscar também `pesagens, vacinacoes, nascimentos, leite, insumos, lotes, reproducao, pastos` e popular o `data`.
- **Realtime:** estender `reloadTable` para cobrir todas as 8 tabelas novas e inscrever cada uma no canal `bovigest-business`.
- **Handlers CRUD:** criar 16 handlers no padrão dos existentes (optimistic update + `upsertX` + rollback via `fetchX` em caso de erro + `toast`): `handleSavePesagem/deletePesagem`, `handleSaveVacinacao/...`, `handleSaveNascimento/...`, `handleSaveLeite/...`, `handleSaveInsumo/...`, `handleSaveLote/...`, `handleSaveReproducao/...`, `handleSavePasto/...`.
- **`renderView`:** trocar cada `ComingSoon` pela view real correspondente, passando dados + `onSave` + `onDelete`. Para `LotesView` passar também `data.animais` (para calcular contagem por lote).
- **Remover** o import de `ComingSoon` e os ícones não usados de `lucide-react`.

### 2. Views novas (em `src/views/`)
Cada uma com: `Props { itens: T[]; onSave: (item, isNew) => void; onDelete: (id) => void }`, modal `create/edit` interno, `StatCard`/`Badge`/`EmptyState`/`ConfirmDeleteDialog`, busca e tabela responsiva.

- **`ReproducaoView.tsx`** — `Reproducao`. Stats: matrizes total / Prenhes(+Gestação) / Vazias / Em cio + taxa de prenhez%. Filtro por status. Badges: Prenhe=pink, Gestação=pink, Em cio=warning, Vazia=muted. Colunas: Brinco, Status, Cobertura, Parto previsto, Pai.
- **`VacinacaoView.tsx`** — `Vacinacao`. Campo `brincos[]` vira textarea (um brinco por linha/vírgula) → `split` no save. Stats: aplicações / em carência (`dataLiberacao` > hoje) / animais vacinados (soma de `brincos.length`) / vacinas distintas. Badge de carência: "Em carência" (warning) se `dataLiberacao` no futuro, "Liberado" (success) caso contrário.
- **`NascimentosView.tsx`** — `Nascimento`. Stats: total / no mês / machos / fêmeas / peso médio. Colunas: Bezerro, Matriz, Pai, Data, Peso, Sexo (badge).
- **`LeiteView.tsx`** — `RegistroLeite`. Stats: total do mês (L) / média diária / melhor dia / registros. Mini gráfico de barras verticais (produção por dia, últimos 14 dias) usando `div` + `width` relativo (sem lib extra). Badge turno: Manhã=warning, Tarde=info, Noite=indigo.
- **`InsumosView.tsx`** — `Insumo`. Stats: itens / estoque crítico (`quantidade <= estoqueMinimo`) / valor total (`custo*quantidade`) / categorias. Badge de status: "Crítico" (danger) quando `<= estoqueMinimo`, "OK" (success) caso contrário. Destaque visual na linha crítica.
- **`LotesView.tsx`** — `Lote` + prop `animais`. Conta animais por lote (`animais.filter(a => a.lote === lote.nome).length`). Stats: lotes / animais alocados / lotes sem animais / com pasto. Colunas: Nome, Descrição, Pasto, Animais.
- **`PastoView.tsx`** — `Pasto`. Stats: pastos / área total (ha) / capacidade total / ocupação média. Colunas: Nome, Área, Capacidade, Observação.
- **`ConfiguracoesView.tsx`** — página de configurações (não-CRUD). Props: `profile`, `onLogout`, `onSavedNome`. Seções:
  - **Perfil:** editar próprio nome (input + salvar → `updateProfileNome(id, nome)` do `dataService` + `refreshProfile` do `useAuth`); mostra email, papel (role) e status (somente leitura).
  - **Sistema:** status da nuvem (passado via prop `cloud`), versão "BoviGest PRO v1.0".
  - **Conta:** botão "Sair da conta" (`onLogout`).
  - Usa `useState` local para o campo nome + `toast` de confirmação.

### 3. `src/components/Sidebar.tsx`
- Remover `soon: true` de todos os itens (`lotes`, `reproducao`, `vacinacao`, `pesagem`, `nascimentos`, `leite`, `pasto`, `insumos`, `configuracoes`). O badge "Em breve" some automaticamente.

### 4. Limpeza
- Excluir `src/views/ComingSoon.tsx` (código morto após a troca).

## Arquivos envolvidos
- **Modificar:** `src/pages/BoviGest.tsx`, `src/components/Sidebar.tsx`
- **Criar:** `src/views/ReproducaoView.tsx`, `src/views/VacinacaoView.tsx`, `src/views/NascimentosView.tsx`, `src/views/LeiteView.tsx`, `src/views/InsumosView.tsx`, `src/views/LotesView.tsx`, `src/views/PastoView.tsx`, `src/views/ConfiguracoesView.tsx`
- **Excluir:** `src/views/ComingSoon.tsx`
- **Reutilizar (já existem):** `PesagemView.tsx`, `StatCard`, `EmptyState`, `ConfirmDeleteDialog`, `Badge`, `lib/zootecnia.ts`, todos os serviços do `dataService.ts`, `updateProfileNome`/`refreshProfile`.

## Implementation checklist
- [ ] `BoviGest.tsx`: importar as 8 views novas + `PesagemView` e os fetch/upsert/delete de todas as entidades
- [ ] `BoviGest.tsx`: estender `loadAll` para buscar `pesagens, vacinacoes, nascimentos, leite, insumos, lotes, reproducao, pastos`
- [ ] `BoviGest.tsx`: estender `reloadTable` + subscrições Realtime para as 8 tabelas novas
- [ ] `BoviGest.tsx`: criar 16 handlers CRUD (save/delete) no padrão optimistic+rollback para pesagem, vacinação, nascimento, leite, insumo, lote, reprodução, pasto
- [ ] `BoviGest.tsx`: trocar todos os `<ComingSoon .../>` pelas views reais em `renderView`, passando dados+handlers (e `animais` para Lotes; `profile`/`cloud`/`onLogout` para Configurações)
- [ ] `BoviGest.tsx`: remover import de `ComingSoon` e ícones não usados
- [ ] `ReproducaoView.tsx`: header + 4 StatCards + filtro de status + tabela + modal + delete dialog
- [ ] `VacinacaoView.tsx`: textarea de brincos→array, stats com carência, badge de carência/liberado, modal + delete
- [ ] `NascimentosView.tsx`: stats (total/mês/machos/fêmeas/peso médio) + tabela + modal + delete
- [ ] `LeiteView.tsx`: stats + mini gráfico de barras (14 dias) + badge de turno + modal + delete
- [ ] `InsumosView.tsx`: stats com estoque crítico + badge crítico/OK + linha destacada + modal + delete
- [ ] `LotesView.tsx`: contagem de animais por lote via prop `animais` + stats + tabela + modal + delete
- [ ] `PastoView.tsx`: stats (área/capacidade/ocupação) + tabela + modal + delete
- [ ] `ConfiguracoesView.tsx`: seção Perfil (editar nome via `updateProfileNome` + `refreshProfile`), Sistema (cloud + versão), Conta (logout)
- [ ] `Sidebar.tsx`: remover `soon: true` dos 9 itens
- [ ] Excluir `src/views/ComingSoon.tsx`
- [ ] Build/lint sem erros

## Verification checklist
- [ ] **Positivo — CRUD:** em cada aba nova (Reprodução, Vacinação, Nascimentos, Leite, Insumos, Lotes, Pasto, Pesagem), criar um registro → aparece na tabela; editar → atualiza; remover → some. Persiste após recarregar a página (dados no banco).
- [ ] **Positivo — Realtime:** com a aplicação aberta em duas abas, criar um registro em uma → aparece na outra sem refresh.
- [ ] **Positivo — Pesagem:** aba Pesagem exibe a view real (não o placeholder), com GMD calculado por `gmdPesagem`.
- [ ] **Positivo — Configurações:** editar o próprio nome e salvar → nome atualiza no header/sidebar e persiste; botão "Sair" desloga.
- [ ] **Positivo — Dashboard:** com dados reais carregados, os cards/alertas do Dashboard (leite do mês, prenhes, estoque crítico de insumos, atividades recentes de pesagem/vacinação/nascimento) passam a refletir dados reais.
- [ ] **Negativo/default:** cada view com lista vazia mostra `EmptyState` apropriado; busca sem resultados mostra "Nenhum ... encontrado".
- [ ] **Fronteira — Insumos crítico:** insumo com `quantidade <= estoqueMinimo` marca badge "Crítico" e dispara alerta no Dashboard + sino do header.
- [ ] **Fronteira — Vacinação carência:** vacinação com `dataLiberacao` futura → badge "Em carência"; data passada → "Liberado".
- [ ] **Sidebar:** nenhum item exibe mais o selo "Em breve".
- [ ] **Build:** `pnpm run build` (executado pelo framework ao fim do turno) conclui sem erros de TS/lint.
