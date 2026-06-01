# Plano: Painel de Gestão de Acesso (Firebase)

## Contexto
O usuário tem o sistema BoviGest PRO (React + Firebase) e quer um painel dedicado para cadastrar/editar/excluir usuários com permissões (Admin/Operador), mantendo o Firebase como backend — igual ao padrão já usado no App.jsx original.

## O que será feito

### 1. Instalar Firebase
- Adicionar pacote `firebase` ao projeto via `add_dependency`

### 2. Arquivo de serviço: `src/services/firebase.ts`
- Inicializa Firebase com config armazenada em `localStorage` (`bovigest_firebase_config`)
- Exporta `db` (Firestore) e `auth`
- Se não houver config, retorna `null` para que a UI exiba tela de configuração

### 3. Serviço de usuários: `src/services/userService.ts`
- Funções `getUsers(adminEmail)`, `saveUser(user, adminEmail)`, `deleteUser(id, adminEmail)`
- Lê/escreve no documento `bovigest_users/{adminEmail}` (mesmo padrão do App.jsx original)
- Campo `usuarios[]` dentro do documento

### 4. Página de configuração: `src/pages/FirebaseSetup.tsx`
- Formulário para inserir `firebaseConfig` JSON
- Valida e salva no `localStorage`
- Redireciona para o painel após salvar

### 5. Página principal: `src/pages/UserManagement.tsx`
Subcomponentes internos:
- **Header**: título, breadcrumb, botão "Novo Usuário"
- **Cards de estatísticas**: Total, Admins, Operadores, Inativos
- **Tabela de usuários**: avatar inicial, Nome, Email, Cargo (badge), Status (badge), Ações (editar/excluir)
- **Dialog de criação/edição**: campos Nome, Email, Senha, Cargo (Admin/Operador), Status (Ativo/Inativo)
- **Dialog de confirmação de exclusão**: AlertDialog do shadcn
- Indicador de conexão com Firebase (online/erro)

### 6. Atualizar `src/router.tsx`
- Adicionar rota `/` → `UserManagement`
- Adicionar rota `/firebase-setup` → `FirebaseSetup`

### 7. Atualizar `src/index.css`
- Adicionar tokens de cor com tema verde/agro consistente com BoviGest
- `--primary`: verde escuro (142 70% 29%)
- `--accent`: verde claro para badges

## Arquivos a modificar/criar
| Arquivo | Ação |
|---|---|
| `src/services/firebase.ts` | Criar |
| `src/services/userService.ts` | Criar |
| `src/pages/FirebaseSetup.tsx` | Criar |
| `src/pages/UserManagement.tsx` | Criar |
| `src/router.tsx` | Modificar |
| `src/index.css` | Modificar |

## Verificação
1. Abrir o app → aparece painel de gestão de utilizadores
2. Se Firebase não configurado → redireciona para `/firebase-setup`
3. Inserir config Firebase válida → volta ao painel
4. Criar novo usuário → aparece na tabela, salvo no Firestore
5. Editar usuário → dados atualizados
6. Excluir usuário → removido com confirmação
7. Indicador "Nuvem" verde quando conectado ao Firebase
