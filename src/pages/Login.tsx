import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beef, LogIn, Eye, EyeOff, AlertCircle, UserPlus } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

export default function Login() {
  const navigate = useNavigate();
  const { signIn, signUp, session, loading: authLoading } = useAuth();

  const [mode, setMode] = useState<'login' | 'signup'>('login');
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [showPass, setShowPass] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  // Already authenticated → go straight to the app.
  useEffect(() => {
    if (!authLoading && session) navigate('/', { replace: true });
  }, [authLoading, session, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (mode === 'login') {
        await signIn(email, senha);
      } else {
        if (!nome.trim()) {
          setError('Informe seu nome.');
          setLoading(false);
          return;
        }
        await signUp(nome, email, senha);
      }
      // On success, useAuth's session update triggers the redirect via the effect above.
    } catch {
      setError(
        mode === 'login'
          ? 'Email ou senha inválidos.'
          : 'Não foi possível criar a conta. O email já pode estar em uso.',
      );
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
          <p className="text-white/50 mt-2 text-sm font-medium">
            {mode === 'login' ? 'Entre para acessar sua fazenda' : 'Crie sua conta e comece a gerenciar'}
          </p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          {/* Mode toggle */}
          <div className="grid grid-cols-2 p-1.5 m-3 bg-muted rounded-2xl gap-1">
            <button type="button" onClick={() => setMode('login')}
              className={`py-2 rounded-xl text-sm font-bold transition-colors ${mode === 'login' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Entrar
            </button>
            <button type="button" onClick={() => setMode('signup')}
              className={`py-2 rounded-xl text-sm font-bold transition-colors ${mode === 'signup' ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'}`}>
              Criar Fazenda
            </button>
          </div>

          <div className="px-6 pb-2 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              {mode === 'login' ? <LogIn size={15} className="text-primary" /> : <UserPlus size={15} className="text-primary" />}
            </div>
            <div>
              <h2 className="font-black text-foreground text-sm">{mode === 'login' ? 'Entrar' : 'Criar Conta'}</h2>
              <p className="text-[11px] text-muted-foreground">
                {mode === 'login' ? 'Use suas credenciais de acesso' : 'Você será o administrador da fazenda'}
              </p>
            </div>
          </div>

          <form onSubmit={handleSubmit} className="p-6 pt-4 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium">
                <AlertCircle size={15} className="shrink-0" />{error}
              </div>
            )}

            {mode === 'signup' && (
              <div>
                <label className="block text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wide">Nome</label>
                <input required value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome"
                  className="w-full px-3 py-2.5 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-foreground" />
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
                : mode === 'login'
                  ? <><LogIn size={16} /> Entrar</>
                  : <><UserPlus size={16} /> Criar Conta</>
              }
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
