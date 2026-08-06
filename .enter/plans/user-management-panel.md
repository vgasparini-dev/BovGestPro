# Tela de Login — BoviGest PRO

## Contexto
Hoje o app não tem nenhuma barreira de acesso: `/` abre direto o BoviGest com dados demo, e `/firebase-setup` é uma configuração opcional que não exige login depois. Isso não reflete um sistema de gestão real (qualquer pessoa com o link abre tudo). O pedido é implementar uma tela de login de verdade, aproveitando a estrutura de usuários (`usuarios[]`) que já existe e já é editável em "Gestão de Usuários".

Sem migrar para o Enter Cloud (não solicitado agora), a abordagem realista é: autenticar contra a lista de usuários já existente (Firebase, quando configurado, ou dados demo, quando não) e guardar uma sessão local simples. Deixo registrado que autenticação com hash de senha via Enter Cloud continua sendo a recomendação de segurança para um próximo passo.

## Abordagem

1. **Nova página `/login`** (`src/pages/Login.tsx`) — visual consistente com `FirebaseSetup.tsx` (fundo `setup-gradient`, logo BoviGest). Formulário de Email + Senha (com mostrar/ocultar, mesmo padrão usado em `UserManagementView`).
2. **Validação reaproveitando serviços existentes**: se há Firebase configurado (`getSavedConfig` + `ADMIN_EMAIL_KEY`), autentica anonimamente e busca `usuarios` via `getUsers()` (já existente); senão, valida contra `demoData.usuarios`. Confere email + senha + `status === 'Ativo'`.
3. **Sessão simples**: novo `src/services/session.ts` (mesmo padrão de `firebase.ts`) com `getSession/saveSession/clearSession` usando `localStorage`, guardando `{ email, nome, role }`.
4. **Guarda de acesso em `BoviGest.tsx`**: se não houver sessão, redireciona para `/login`; `adminEmail`/`adminName` passam a vir da sessão (não mais hardcoded). `handleLogout` agora só limpa a sessão (não apaga mais a configuração do Firebase) e manda para `/login`.
5. **Primeiro acesso via `FirebaseSetup.tsx`**: ao conectar, chama a função `ensureAdminExists()` do `userService.ts` (já existe no código mas nunca era chamada!) para garantir que o admin tenha um usuário válido (senha padrão `admin` se for a primeira vez), depois navega para `/login` (não mais direto para `/`) passando um aviso com o email configurado. O botão "Continuar sem Firebase" também passa a levar para `/login` (com as credenciais demo funcionando: `admin@fazenda.com` / `admin123`).
6. **Limpeza de tipos**: `userService.ts` duplica o tipo de usuário (`ManagedUser`, com só 2 papéis) enquanto `types.ts` já tem `AppUser` (3 papéis, usado no resto do app). Unificar `userService.ts` para importar e usar `AppUser`/`UserRole`/`UserStatus` de `types.ts`, removendo a duplicata — confirmado que `ManagedUser` não é importado em nenhum outro arquivo.

## Arquivos afetados
- `src/services/session.ts` — **novo**
- `src/pages/Login.tsx` — **novo**
- `src/router.tsx` — adiciona rota `/login`
- `src/pages/BoviGest.tsx` — guarda de sessão, `adminEmail`/`adminName` a partir da sessão, `handleLogout` ajustado
- `src/pages/FirebaseSetup.tsx` — chama `ensureAdminExists`, navega para `/login` em vez de `/`
- `src/services/userService.ts` — remove tipos duplicados, usa `AppUser` de `types.ts`

## Implementation checklist
- [ ] Criar `src/services/session.ts` com `Session = { email, nome, role }` e `getSession/saveSession/clearSession` via `localStorage` (chave `bovigest_session`)
- [ ] Refatorar `userService.ts`: remover `ManagedUser`/`UserRole`/`UserStatus` locais, importar `AppUser` de `../types`, ajustar assinaturas de `getUsers`, `saveUser`, `deleteUser`, `ensureAdminExists`
- [ ] Criar `src/pages/Login.tsx`: formulário email/senha, toggle mostrar senha, estado de erro/loading, botão "Entrar"
- [ ] Lógica de login: Firebase configurado → `initFirebase` + `signInAnonymously` + `getUsers(db, ADMIN_EMAIL_KEY)`; senão → `demoData.usuarios`; validar email+senha+status Ativo
- [ ] Em caso de sucesso: `saveSession({ email, nome, role })` e `navigate('/')`; em caso de usuário inativo ou credenciais erradas, mostrar mensagem de erro clara
- [ ] Exibir banner informativo quando vier de `FirebaseSetup` recém-configurado (via `location.state`), e uma dica de credenciais demo quando não há Firebase configurado
- [ ] Link "Configurar Firebase" no rodapé do Login apontando para `/firebase-setup`
- [ ] Adicionar rota `/login` → `Login.tsx` em `router.tsx`
- [ ] `BoviGest.tsx`: inicializar `adminEmail`/`adminName` a partir de `getSession()`; `useEffect` de guarda que redireciona para `/login` se não houver sessão
- [ ] `BoviGest.tsx`: `handleLogout` chama `clearSession()` (não mais `clearConfig()`) e navega para `/login`
- [ ] `FirebaseSetup.tsx`: após conectar, chamar `ensureAdminExists(db, emailNormalizado)` e navegar para `/login` com `state: { justConfigured: true, email }`
- [ ] `FirebaseSetup.tsx`: `handleSkip` navega para `/login` em vez de `/`

## Verification checklist
- [ ] `pnpm lint` sem erros/avisos novos
- [ ] Sem sessão salva, acessar `/` redireciona automaticamente para `/login`
- [ ] Login com credenciais demo (`admin@fazenda.com` / `admin123`) sem Firebase configurado funciona e leva ao Dashboard
- [ ] Login com email/senha incorretos mostra mensagem de erro e não navega
- [ ] Login com um usuário de status "Inativo" (ex.: `ana@fazenda.com` / `ana123`) é bloqueado com mensagem específica
- [ ] Sidebar exibe nome/email corretos do usuário autenticado após login
- [ ] Logout limpa a sessão e volta para `/login`, mas mantém a configuração do Firebase (se houver) intacta
- [ ] Fluxo "Continuar sem Firebase" em `/firebase-setup` leva a `/login`, não direto ao app
- [ ] Console do navegador sem novos erros após as mudanças
