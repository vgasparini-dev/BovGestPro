import { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { Beef, LogIn, Eye, EyeOff, AlertCircle, Info, Settings } from 'lucide-react';
import { getSavedConfig, initFirebase, ADMIN_EMAIL_KEY } from '../services/firebase';
import { getUsers, ensureAdminExists } from '../services/userService';
import { saveSession } from '../services/session';
import { demoData } from '../data/demo';
import { signInAnonymously } from 'firebase/auth';

type LocationState = { justConfigured?: boolean; email?: string } | null;

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = location.state as LocationState;

  const [email, setEmail] = useState(state?.email || '');
  const [senha, setSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const hasFirebase = !!(getSavedConfig() && localStorage.getItem(ADMIN_EMAIL_KEY));

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const config = getSavedConfig();
      const configuredAdminEmail = localStorage.getItem(ADMIN_EMAIL_KEY);
      const emailNorm = email.trim().toLowerCase();

      const usuarios = config && configuredAdminEmail
        ? await (async () => {
            const { auth, db } = initFirebase(config);
            await signInAnonymously(auth);
            const lista = await getUsers(db, configuredAdminEmail);
            return lista.length > 0 ? lista : await ensureAdminExists(db, configuredAdminEmail);
          })()
        : demoData.usuarios;

      const found = usuarios.find(u => u.email.toLowerCase() === emailNorm && u.senha === senha);

      if (!found) {
        setError('Email ou senha inválidos.');
        setLoading(false);
        return;
      }
      if (found.status === 'Inativo') {
        setError('Este usuário está inativo. Contate o administrador.');
        setLoading(false);
        return;
      }

      saveSession({ email: found.email, nome: found.nome, role: found.role });
      navigate('/');
    } catch {
      setError('Não foi possível validar o login. Verifique a conexão com o Firebase.');
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen setup-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-primary rounded-3xl items-center justify-center shadow-2xl mb-4">
            <Beef size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-white">
            BoviGest <span style={{ color: 'hsl(137 55% 55%)' }}>PRO</span>
          </h1>
          <p className="text-white/50 mt-2 text-sm font-medium">Entre para acessar sua fazenda</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <LogIn size={15} className="text-primary" />
            </div>
            <div>
              <h2 className="font-black text-foreground text-sm">Entrar</h2>
              <p className="text-[11px] text-muted-foreground">Use suas credenciais de acesso</p>
            </div>
          </div>

          <form onSubmit={handleLogin} className="p-6 space-y-4">
            {state?.justConfigured && (
              <div className="flex items-start gap-2 p-3 bg-primary/10 border border-primary/20 rounded-xl text-xs text-foreground font-medium">
                <Info size={15} className="shrink-0 mt-0.5 text-primary" />
                <span>Firebase conectado! Entre com <strong>{state.email}</strong> — se for o primeiro acesso, a senha padrão é <code className="bg-muted px-1 rounded">admin</code> (altere depois em Usuários).</span>
              </div>
            )}
            {!hasFirebase && (
              <div className="flex items-start gap-2 p-3 bg-muted border border-border rounded-xl text-xs text-muted-foreground font-medium">
                <Info size={15} className="shrink-0 mt-0.5" />
                <span>Modo demo (sem Firebase). Use <strong className="text-foreground">admin@fazenda.com</strong> / <strong className="text-foreground">admin123</strong>.</span>
              </div>
            )}
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium">
                <AlertCircle size={15} className="shrink-0" />{error}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wide">Email</label>
              <input type="email" required value={email} onChange={e => setEmail(e.target.value)} placeholder="seu@fazenda.com"
                className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-foreground" />
            </div>

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wide">Senha</label>
              <div className="relative">
                <input required type={showPass ? 'text' : 'password'} value={senha} onChange={e => setSenha(e.target.value)} placeholder="••••••••"
                  className="w-full px-3 py-2.5 pr-10 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-foreground" />
                <button type="button" onClick={() => setShowPass(!showPass)}
                  className="absolute right-3 top-2.5 text-muted-foreground hover:text-foreground">
                  {showPass ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-black text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                : <><LogIn size={16} /> Entrar</>
              }
            </button>
          </form>
        </div>

        <Link to="/firebase-setup"
          className="mt-5 flex items-center justify-center gap-2 text-white/40 hover:text-white/70 text-xs font-medium transition-colors">
          <Settings size={13} /> Configurar Firebase
        </Link>
      </div>
    </div>
  );
}
