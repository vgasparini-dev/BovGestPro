# Correção de bugs e aprimoramentos — BoviGest PRO

## Contexto
Ao examinar o site em execução (screenshots + leitura do código), encontrei 3 bugs concretos que afetam a experiência real do usuário, além de uma inconsistência de terminologia. O usuário pediu para "examinar e corrigir, com os aprimoramentos que achar necessário" sem restringir o escopo — o plano abaixo foca em correções e polimento do que já existe (não inclui construir as 9 telas ainda em "Em desenvolvimento", que ficam como próximo passo caso desejado).

## Bugs encontrados

### 1. Sidebar sobrepõe o conteúdo do Dashboard (crítico)
Em `src/pages/BoviGest.tsx`, o deslocamento do conteúdo principal (para não ficar embaixo da sidebar fixa) é feito injetando uma tag `<style>` dinâmica com media query:
```tsx
<div className="main-area ..." style={{ marginLeft: 0 }}>
  <style>{`@media (min-width: 1024px) { .main-area { margin-left: ${sidebarW}px; } }`}</style>
```
Essa técnica não está sendo aplicada — confirmado via screenshot: a saudação "Bom dia" e o primeiro card de KPI ("Cabeças") ficam escondidos atrás da sidebar (que tem `z-40` e fundo opaco), pois o conteúdo real começa em `margin-left: 0`.

**Correção:** substituir pela abordagem padrão Tailwind, usando classes estáticas condicionadas ao estado `collapsed` (que batem exatamente com as larguras usadas: `56px = ml-14`, `240px = ml-60`):
```tsx
className={`main-area flex flex-col min-h-screen transition-all duration-200 ${sidebarCollapsed ? 'lg:ml-14' : 'lg:ml-60'}`}
```
Remover a tag `<style>` injetada e a lógica de `sidebarW`/`marginLeft` inline.

### 2. Indicador de status Firebase preso em "Conectando..." no modo demo
Em `src/views/Dashboard.tsx`, tanto o badge do cabeçalho quanto o card "Firebase Sincronizado" tratam apenas 3 estados visuais (`online`, `error`, e um "else" genérico com spinner). Como o estado `offline` (sem Firebase configurado / modo demo) cai no "else", o usuário vê um spinner girando **para sempre** dizendo "Conectando...", mesmo quando a intenção foi continuar sem Firebase.

**Correção:** tratar os 4 estados de `CloudStatus` (`online | offline | error | connecting`) explicitamente nos dois locais do Dashboard:
- `online` → verde, ícone `Cloud`, "Firebase Sincronizado / Firebase online"
- `connecting` → neutro, ícone `Loader2` girando, "Conectando..." (transitório)
- `offline` → neutro/âmbar, ícone `CloudOff` (sem animação), "Modo Demo" / "Sem Firebase configurado"
- `error` → vermelho, ícone `CloudOff`, "Sem Sincronização" (mantém como está)

### 3. Dados demo com datas fixas ficam desatualizados
Em `src/data/demo.ts`, as datas de `leite`, `financeiro`, `pesagens`, `vacinacoes` e `nascimentos` são strings fixas (ex.: `'2026-06-01'`). O Dashboard filtra "Financeiro do Mês" e "Leite do Mês" pelo mês/ano atual (`new Date()`), então assim que o calendário avança além de junho/2026 esses cards mostram sempre R$ 0,00 e 0L — o painel parece quebrado sem motivo aparente.

**Correção:** gerar as datas do `demoData` dinamicamente com base em `new Date()` (offsets relativos, ex.: hoje, há 2 dias, há 1 semana, mês passado), garantindo que os cards "do mês atual" sempre mostrem dados plausíveis, independente de quando o demo for aberto. Mantém os mesmos valores/nomes, só troca strings de data fixas por cálculo relativo (função helper `daysAgo(n)` / `thisMonth(day)`).

## Aprimoramento de consistência

### 4. Terminologia inconsistente em Gestão de Usuários
Em `src/views/UserManagementView.tsx`, os textos usam "Utilizador" (português europeu) — "Novo Utilizador", "Editar Utilizador", "Criar Utilizador", "Remover Utilizador", cabeçalho de tabela "Utilizador" — enquanto o resto do app (sidebar, dashboard, cabeçalho da própria página "Gestão de Usuários") usa "Usuário" (português brasileiro, consistente com R$, datas dd/mm/aaaa).

**Correção:** padronizar todas as ocorrências em `UserManagementView.tsx` para "Usuário/Usuários".

## Arquivos a modificar
- `src/pages/BoviGest.tsx` — corrigir margin-left da área principal (bug 1)
- `src/views/Dashboard.tsx` — tratar os 4 estados de `CloudStatus` explicitamente (bug 2)
- `src/data/demo.ts` — datas relativas dinâmicas via helpers (bug 3)
- `src/views/UserManagementView.tsx` — padronizar "Usuário" (item 4)

## Implementation checklist
- [ ] Remover a tag `<style>` injetada e o cálculo `sidebarW` em `BoviGest.tsx`; aplicar `lg:ml-14`/`lg:ml-60` condicionalmente via className
- [ ] Confirmar visualmente (screenshot) que o card "Cabeças" e a saudação aparecem completos, sem sobreposição da sidebar, em desktop (expandida e colapsada)
- [ ] Confirmar que no mobile (sidebar fechada) o conteúdo ocupa a largura toda sem margin indevida
- [ ] Adicionar tratamento explícito do estado `offline` no badge do cabeçalho do Dashboard (ícone `CloudOff` estático, texto "Modo Demo")
- [ ] Adicionar tratamento explícito do estado `offline` no card "Firebase Sincronizado" do Dashboard (mesmo padrão visual, sem spinner)
- [ ] Criar helpers de data relativa em `src/data/demo.ts` (ex.: `daysAgo`, `monthsAgoDate`) e substituir todas as datas fixas de `leite`, `financeiro`, `pesagens` por datas relativas a `new Date()`
- [ ] Garantir que pelo menos parte de `financeiro` e `leite` caia no mês corrente (para os cards "do Mês" nunca ficarem zerados) e parte no mês anterior (para dar histórico nas Atividades Recentes)
- [ ] Substituir todas as ocorrências de "Utilizador"/"Utilizadores" por "Usuário"/"Usuários" em `UserManagementView.tsx` (títulos de modal, botões, diálogo de exclusão, cabeçalho de tabela)

## Verification checklist
- [ ] `pnpm lint` sem erros/warnings novos
- [ ] Screenshot do Dashboard em desktop (1280px): saudação e os 6 KPI cards totalmente visíveis, nenhum atrás da sidebar
- [ ] Screenshot do Dashboard com sidebar colapsada: conteúdo se ajusta (margin menor), sem espaço em branco nem sobreposição
- [ ] Screenshot do Dashboard em mobile (<1024px): sidebar fixa não aparece, conteúdo ocupa largura total
- [ ] Com Firebase não configurado (estado padrão/demo): badge mostra "Modo Demo" fixo, sem spinner girando indefinidamente
- [ ] Cards "Leite do Mês" e "Financeiro do Mês" no Dashboard mostram valores diferentes de zero com os dados demo, na data atual do sistema
- [ ] Tela de Gestão de Usuários não contém mais a palavra "Utilizador" em nenhum texto visível
- [ ] Console do navegador sem novos erros após as mudanças
