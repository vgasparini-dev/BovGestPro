# Concluir os módulos "Em breve" (Reprodução, Vacinação, Pesagem, Nascimentos, Leite, Pasto, Insumos, Lotes, Configurações)

## Contexto
9 itens do menu hoje caem na tela genérica `ComingSoon` ("Em desenvolvimento"). Os
tipos de dados de 7 deles já existem em `src/types.ts` (vindos do mock original):
`Pesagem`, `Vacinacao`, `Nascimento`, `RegistroLeite`, `Insumo`, `Lote`, `Reproducao`.
Vamos implementar os 9 seguindo **exatamente o padrão já em produção** em
Animais/Financeiro/Confinamento:
- 1 tabela por módulo no Enter Cloud, com RLS por `farm_id` (reaproveitando
  `public.get_my_farm_id()`) e Realtime habilitado.
- Funções de `fetch`/`upsert`/`delete` + mapper snake_case↔camelCase em
  `src/services/dataService.ts`.
- 1 view por módulo com o mesmo layout: busca/filtro, tabela, modal de
  criar/editar, `ConfirmDeleteDialog`, `EmptyState`, `Badge`/`StatCard` do
  design system (nada de cor crua).
- Wiring em `src/pages/BoviGest.tsx` (fetch inicial + assinatura Realtime +
  handlers otimistas, igual aos 3 módulos existentes) e remoção da entrada em
  `ComingSoon`/flag `soon` no `Sidebar.tsx`.

**Duas exceções ao padrão 1-para-1:**
- **Pasto**: não existe tipo hoje (só `Lote.pasto`, um texto livre). Criamos uma
  entidade nova e mínima `Pasto` (nome, área em ha, capacidade de animais,
  observação) — um cadastro simples de apoio, no mesmo padrão das demais.
- **Configurações**: não é uma lista de dados, vira uma página "Meu Perfil"
  (editar nome próprio + trocar senha), reaproveitando a tabela `profiles` e
  `supabase.auth.updateUser` — sem nova tabela.

**Ajuste de tipos:** `Pesagem`, `Vacinacao`, `Nascimento`, `RegistroLeite`,
`Insumo`, `Lote`, `Reproducao` trocam `id: number` → `id: string` (uuid),
mesma migração já feita para `Animal`/`Financeiro`/`Confinamento`. O campo
`Lote.quantidadeAnimais` deixa de ser persistido (fica calculado ao vivo a
partir de `data.animais` na tela de Lotes, evitando contagem desatualizada).

`demo.ts` zera os arrays desses 7 módulos (mesma decisão já tomada para
animais/financeiro/confinamento) — só `calendario` continua estático
(é conteúdo informativo do Dashboard, sem tela própria).

## Modelo de dados (novas tabelas, todas com o padrão de RLS já usado)
Para cada tabela: `id uuid PK default gen_random_uuid()`, `farm_id uuid not null
default public.get_my_farm_id()`, colunas de negócio, `created_at timestamptz
default now()`, RLS (`select/insert/update/delete` por `farm_id =
get_my_farm_id()`), Realtime habilitado.

- `pesagens`: brinco, peso_atual, peso_anterior, data_anterior, data, observacao
- `vacinacoes`: vacina, lote, brincos (text[]), data_aplicacao, data_liberacao, veterinario, observacao
- `nascimentos`: brinco_bezerro, brinco_matriz, brinco_pai, data, peso, sexo, observacao
- `leite`: data, quantidade, turno, responsavel
- `insumos`: nome, categoria, quantidade, unidade, estoque_minimo, fornecedor, validade, custo
- `lotes`: nome, descricao, pasto (sem `quantidade_animais` — calculado no front)
- `reproducao`: brinco, status, data_cobertura, data_previsto_parto, pai, observacao
- `pastos` (nova): nome, area_hectares, capacidade_animais, observacao

`profiles` (já existe) não muda de schema; "Configurações" só usa update.

## Arquivos principais
- `supabase/migrations/...` — 1 migração com as 8 tabelas + RLS + Realtime
- `src/types.ts` — ids para `string`, novo tipo `Pasto`, `AppData.pastos`, remove `Lote.quantidadeAnimais`
- `src/data/demo.ts` — zera os 7 arrays migrados, mantém `calendario`
- `src/services/dataService.ts` — 8 blocos fetch/upsert/delete + mappers (mesmo padrão do arquivo atual)
- `src/views/PesagemView.tsx`, `VacinacaoView.tsx`, `NascimentosView.tsx`, `LeiteView.tsx`, `InsumosView.tsx`, `LotesView.tsx`, `ReproducaoView.tsx`, `PastoView.tsx` (novas, no padrão de `AnimaisView.tsx`/`ConfinamentoView.tsx`)
- `src/views/ConfiguracoesView.tsx` (nova, formulário de perfil)
- `src/pages/BoviGest.tsx` — fetch inicial + Realtime + handlers para os 9 módulos; remove `ComingSoon`
- `src/components/Sidebar.tsx` — remove `soon: true` dos 9 itens
- `src/views/ComingSoon.tsx` — apagado (fica sem uso)

## Verification checklist
- [ ] Todas as 8 novas tabelas aparecem com RLS habilitada e as 4 policies corretas em `supabase_get_table_schema`
- [ ] Criar/editar/excluir um registro em cada um dos 9 módulos persiste após F5
- [ ] Menu lateral não exibe mais nenhuma tag "Em breve"
- [ ] Dashboard e Índices Zootécnicos continuam funcionando (mesma forma de `AppData`, agora vinda do banco)
- [ ] Trocar a própria senha em Configurações e logar novamente com a senha nova funciona
- [ ] Build/lint sem erros
