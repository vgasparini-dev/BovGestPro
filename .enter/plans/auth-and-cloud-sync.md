# Login definitivo + Sincronização em nuvem eficiente (Enter Cloud)

## Contexto
O login atual depende do Firebase: cada instalação precisa colar credenciais de um
projeto Firebase próprio (tela `/firebase-setup`), as senhas são comparadas em
texto puro contra documentos do Firestore, e a sessão vive só no `localStorage`.
Além disso, Animais, Financeiro e Confinamento só existem em memória (`useState`
com `demoData`) — um refresh de página apaga tudo.

Como o Enter Cloud já está habilitado neste projeto, vamos:
1. Substituir o Firebase pelo login/cadastro real do Enter Cloud (decisão
   recomendada, assumida com base na sua resposta anterior).
2. Persistir Animais, Financeiro, Confinamento e Usuários no banco do Enter
   Cloud, com Realtime, para que qualquer usuário da mesma fazenda veja os
   mesmos dados sincronizados entre sessões/dispositivos.
3. Manter o fluxo atual de gestão de usuários (Admin define nome/senha/cargo
   diretamente), via uma função de backend com privilégio administrativo —
   conforme você confirmou.

Módulos ainda não implementados (Reprodução, Pasto, Vacinação, Pesagem,
Nascimentos, Leite, Insumos, Lotes, Configurações) continuam como "Em breve"
com os dados demo estáticos — fora do escopo deste pedido.

## Modelo de dados

**`profiles`** (1 linha por usuário autenticado)
- `id uuid PK` → `auth.users.id`
- `farm_id uuid not null` — dono da fazenda (o próprio `id` para quem cria a
  conta/fazenda; o `id` do Admin convidante para quem é criado por ele)
- `nome text`, `email text`
- `role text` check `Admin|Operador|Veterinario`
- `status text` check `Ativo|Inativo`
- `criado_em timestamptz default now()`, `ultimo_acesso timestamptz`
- Trigger `on auth.users insert` (SECURITY DEFINER) cria a linha lendo
  `raw_user_meta_data` (`nome`, `role`, `farm_id`); sem metadata → vira Admin
  dono da própria fazenda (fluxo de cadastro público).

**`animais`, `financeiro`, `confinamento`**
- `id uuid PK default gen_random_uuid()`
- `farm_id uuid not null default public.get_my_farm_id()`
- Colunas equivalentes aos campos de `Animal`, `Financeiro`, `Confinamento`
  em `src/types.ts` (snake_case)
- `created_at timestamptz default now()`

**RLS (todas as tabelas acima)**
- Funções SECURITY DEFINER `public.get_my_farm_id()` e `public.is_admin()`
  (evitam recursão de policy).
- `profiles`: SELECT para quem está na mesma `farm_id`; UPDATE para o próprio
  usuário ou Admin da fazenda; DELETE só para Admin da fazenda (nunca a si
  mesmo).
- `animais`/`financeiro`/`confinamento`: SELECT/INSERT/UPDATE/DELETE
  restritos a `farm_id = get_my_farm_id()`.
- Realtime habilitado nas 3 tabelas de negócio (`ALTER PUBLICATION
  supabase_realtime ADD TABLE ...`) para sincronização entre sessões sem
  polling.

## Backend function
`supabase/functions/manage-team-user/index.ts` — única função, uma
responsabilidade (gestão de usuários da equipe pelo Admin):
- Identifica o chamador pelo JWT, confirma `role = Admin` via `profiles`.
- `action: 'create'` → `auth.admin.createUser({ email, password, email_confirm: true, user_metadata: { nome, role, farm_id: caller.farm_id } })`; o trigger cria o profile automaticamente.
- `action: 'update'` → confirma que o alvo é da mesma fazenda; atualiza `profiles` (nome/role/status); se `senha` vier preenchida, `auth.admin.updateUserById(id, { password })`.
- `action: 'delete'` → confirma mesma fazenda e alvo ≠ chamador; `auth.admin.deleteUser(id)` (cascata remove o profile).
- CORS + tratamento de `OPTIONS` conforme padrão do Enter Cloud.

## Frontend

**Autenticação**
- `src/hooks/useAuth.tsx` (novo): `AuthProvider` + hook `useAuth()` expondo
  `session`, `user`, `profile`, `loading`, `signIn`, `signUp`, `signOut`.
  Segue o padrão do Enter Cloud: registra `onAuthStateChange` antes de checar
  a sessão existente, guarda `session` (não só `user`), e adia chamadas ao
  client dentro do callback com `setTimeout(...,0)`.
- `supabase_configure_auth`: `auto_confirm_email: true` (cadastro entra
  direto, sem round-trip de e-mail).
- `src/pages/Login.tsx` — reescrita: um único cartão com alternância
  "Entrar" / "Criar fazenda" (signup). Sem Firebase, sem `demoData` como
  fallback de credenciais.
- `src/components/ProtectedRoute.tsx` (novo): redireciona para `/login` sem
  sessão; mostra loading enquanto `useAuth().loading`.
- `src/router.tsx`: `/` passa a usar `ProtectedRoute`; remove a rota
  `/firebase-setup`.

**Remover (Firebase)**
- `src/pages/FirebaseSetup.tsx`, `src/services/firebase.ts`,
  `src/services/userService.ts` (Firestore), `src/services/session.ts`
  (localStorage manual — substituído pela sessão do Enter Cloud).
- Dependência `firebase` do `package.json`.

**Dados de negócio**
- `src/services/dataService.ts` (novo): funções `fetchAnimais/upsertAnimal/
  deleteAnimal` (e equivalentes para `financeiro`/`confinamento`), traduzindo
  snake_case (DB) ↔ camelCase (`src/types.ts`).
- `src/pages/BoviGest.tsx`: substitui a guarda de sessão e o efeito de
  conexão Firebase por `useAuth()`; carrega Animais/Financeiro/Confinamento e
  a lista de `profiles` da fazenda ao montar; assina mudanças Realtime nas 3
  tabelas para refletir edições feitas por outros usuários/dispositivos sem
  refresh; `handleSaveUser`/`handleDeleteUser` chamam a função de backend
  `manage-team-user`; `CloudStatus` passa a ter só `connecting | online |
  error` (sem "offline"/"modo demo").
- `src/types.ts`: `id` de `AppUser`, `Animal`, `Financeiro`, `Confinamento`
  passa de `number` para `string` (uuid). Os demais tipos (ainda só demo)
  ficam como estão.
- `src/views/AnimaisView.tsx`, `FinanceiroView.tsx`, `ConfinamentoView.tsx`,
  `UserManagementView.tsx`: trocam `Date.now()` por `crypto.randomUUID()` ao
  gerar `id` de itens novos (mínima mudança, mantém o restante da UI igual).
- `src/views/Dashboard.tsx`: textos do indicador de nuvem deixam de citar
  "Firebase"/"Modo Demo" e passam a refletir só os 3 estados de `CloudStatus`.

## Implementation checklist
- [ ] Migração: criar `profiles` com trigger de auto-criação e RLS (select/update/delete) usando funções `get_my_farm_id()`/`is_admin()`.
- [ ] Migração: criar `animais`, `financeiro`, `confinamento` com `farm_id default get_my_farm_id()` e RLS completa (select/insert/update/delete).
- [ ] Migração: habilitar Realtime nas 3 tabelas de negócio.
- [ ] Rodar `supabase_get_table_schema` e confirmar RLS + policies ativas nas 4 tabelas.
- [ ] `supabase_configure_auth` com `auto_confirm_email: true`.
- [ ] Criar e implantar `supabase/functions/manage-team-user/index.ts` (create/update/delete com verificação de Admin e farm).
- [ ] Criar `src/hooks/useAuth.tsx` (AuthProvider + useAuth) seguindo o padrão de sessão do Enter Cloud.
- [ ] Reescrever `src/pages/Login.tsx` com login + cadastro via Enter Cloud.
- [ ] Criar `src/components/ProtectedRoute.tsx` e atualizar `src/router.tsx` (remover `/firebase-setup`).
- [ ] Remover `FirebaseSetup.tsx`, `services/firebase.ts`, `services/userService.ts`, `services/session.ts` e a dependência `firebase`.
- [ ] Criar `src/services/dataService.ts` com CRUD de `animais`/`financeiro`/`confinamento`.
- [ ] Atualizar `src/pages/BoviGest.tsx`: `useAuth`, fetch inicial, assinatura Realtime, handlers assíncronos, chamada a `manage-team-user`.
- [ ] Atualizar `src/types.ts` (`id: string` nas 4 entidades persistidas) e os 4 views afetados (`crypto.randomUUID()`).
- [ ] Atualizar textos de status de nuvem em `Dashboard.tsx`.

## Verification checklist
- [ ] Cadastro de nova fazenda cria sessão, perfil Admin e leva ao Dashboard.
- [ ] Logout + login com as mesmas credenciais recupera a sessão corretamente.
- [ ] Login com senha errada mostra erro sem travar a tela.
- [ ] Admin cria um Operador com senha definida na tela Usuários; logout e login com essa conta funciona e mostra os mesmos Animais/Financeiro/Confinamento da fazenda.
- [ ] Admin remove um usuário; essa conta não consegue mais fazer login.
- [ ] Criar/editar/excluir um Animal, um lançamento Financeiro e um registro de Confinamento persiste após dar F5 (recarregar a página).
- [ ] Abrir a fazenda em duas abas logadas (mesmo usuário ou dois usuários da fazenda) e confirmar que uma alteração em Animais aparece na outra aba sem refresh (Realtime).
- [ ] `supabase_get_table_schema` confirma RLS habilitada e policies corretas em `profiles`, `animais`, `financeiro`, `confinamento`.
- [ ] Build/lint do projeto sem erros após as mudanças.
