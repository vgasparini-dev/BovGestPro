import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Beef, Cloud, AlertCircle, CheckCircle2, ChevronRight, ArrowRight, Database } from 'lucide-react';
import { saveConfig, initFirebase, ADMIN_EMAIL_KEY, type FirebaseConfig } from '@/services/firebase';
import { ensureAdminExists } from '@/services/userService';
import { signInAnonymously } from 'firebase/auth';

const EMPTY: FirebaseConfig = { apiKey: '', authDomain: '', projectId: '', storageBucket: '', messagingSenderId: '', appId: '' };

const FIELDS: { key: keyof FirebaseConfig; label: string; placeholder: string; span?: boolean }[] = [
  { key: 'apiKey',            label: 'API Key',             placeholder: 'AIzaSy...', span: true },
  { key: 'authDomain',        label: 'Auth Domain',         placeholder: 'projeto.firebaseapp.com' },
  { key: 'projectId',         label: 'Project ID',          placeholder: 'meu-projeto' },
  { key: 'storageBucket',     label: 'Storage Bucket',      placeholder: 'projeto.appspot.com' },
  { key: 'messagingSenderId', label: 'Messaging Sender ID', placeholder: '123456789' },
  { key: 'appId',             label: 'App ID',              placeholder: '1:123:web:abc...', span: true },
];

export default function FirebaseSetup() {
  const navigate = useNavigate();
  const [config, setConfig] = useState<FirebaseConfig>(EMPTY);
  const [adminEmail, setAdminEmail] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [jsonMode, setJsonMode] = useState(false);
  const [jsonText, setJsonText] = useState('');

  const handleConnect = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    let finalConfig: FirebaseConfig | null = config;
    if (jsonMode) {
      try { finalConfig = JSON.parse(jsonText) as FirebaseConfig; }
      catch { setError('JSON inválido. Verifique o formato.'); setLoading(false); return; }
    }
    if (!adminEmail.trim()) {
      setError('Informe o email do administrador principal.');
      setLoading(false); return;
    }

    try {
      const { auth, db } = initFirebase(finalConfig!);
      await signInAnonymously(auth);
      saveConfig(finalConfig!);
      const emailNorm = adminEmail.trim().toLowerCase();
      localStorage.setItem(ADMIN_EMAIL_KEY, emailNorm);
      await ensureAdminExists(db, emailNorm);
      navigate('/login', { state: { justConfigured: true, email: emailNorm } });
    } catch {
      setError('Não foi possível conectar ao Firebase. Verifique as credenciais.');
    }
    setLoading(false);
  };

  const handleSkip = () => navigate('/login');

  return (
    <div className="min-h-screen setup-gradient flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="inline-flex w-16 h-16 bg-primary rounded-3xl items-center justify-center shadow-2xl mb-4">
            <Beef size={32} className="text-primary-foreground" />
          </div>
          <h1 className="text-3xl font-black text-white">
            BoviGest <span style={{ color: 'hsl(137 55% 55%)' }}>PRO</span>
          </h1>
          <p className="text-white/50 mt-2 text-sm font-medium">Conecte ao Firebase para sincronizar seus dados</p>
        </div>

        {/* Card */}
        <div className="bg-card rounded-3xl border border-border shadow-2xl overflow-hidden">
          <div className="px-6 py-4 border-b border-border bg-muted/30 flex items-center gap-3">
            <div className="w-8 h-8 bg-primary/10 rounded-xl flex items-center justify-center">
              <Database size={15} className="text-primary" />
            </div>
            <div className="flex-1">
              <h2 className="font-black text-foreground text-sm">Configuração Firebase</h2>
              <p className="text-[11px] text-muted-foreground">Insira as credenciais do seu projeto Firebase</p>
            </div>
            <button type="button" onClick={() => setJsonMode(!jsonMode)}
              className="text-xs font-bold text-primary underline underline-offset-2">
              {jsonMode ? 'Modo campos' : 'Colar JSON'}
            </button>
          </div>

          <form onSubmit={handleConnect} className="p-6 space-y-4">
            {error && (
              <div className="flex items-center gap-2 p-3 bg-destructive/10 border border-destructive/20 rounded-xl text-sm text-destructive font-medium">
                <AlertCircle size={15} className="shrink-0" />{error}
              </div>
            )}

            {jsonMode ? (
              <div>
                <label className="block text-xs font-bold text-muted-foreground mb-1.5 uppercase tracking-wide">
                  Objeto <code className="bg-muted px-1.5 py-0.5 rounded text-[11px]">firebaseConfig</code>
                </label>
                <textarea rows={8} value={jsonText} onChange={e => setJsonText(e.target.value)}
                  placeholder={'{\n  "apiKey": "AIzaSy...",\n  "authDomain": "...",\n  "projectId": "..."\n}'}
                  className="w-full px-4 py-3 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-mono resize-none text-foreground" />
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {FIELDS.map(f => (
                  <div key={f.key} className={f.span ? 'sm:col-span-2' : ''}>
                    <label className="block text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wide">{f.label}</label>
                    <input type="text" value={config[f.key]} onChange={e => setConfig(p => ({ ...p, [f.key]: e.target.value }))}
                      placeholder={f.placeholder}
                      className="w-full px-3 py-2 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-foreground" />
                  </div>
                ))}
              </div>
            )}

            <div>
              <label className="block text-[11px] font-bold text-muted-foreground mb-1 uppercase tracking-wide">Email do Administrador Principal</label>
              <input type="email" required value={adminEmail} onChange={e => setAdminEmail(e.target.value)} placeholder="admin@fazenda.com"
                className="w-full px-3 py-2 bg-muted border border-input rounded-xl outline-none focus:ring-2 focus:ring-primary text-sm font-medium text-foreground" />
              <p className="text-[11px] text-muted-foreground mt-1">
                Identifica o documento <code className="bg-muted px-1 rounded">bovigest_users/{'{email}'}</code> no Firestore.
              </p>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 rounded-xl font-black text-primary-foreground bg-primary hover:bg-primary/90 transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-60">
              {loading
                ? <span className="animate-spin w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full" />
                : <><Cloud size={16} /> Conectar ao Firebase <ChevronRight size={15} /></>
              }
            </button>

            <button type="button" onClick={handleSkip}
              className="w-full py-2.5 rounded-xl font-bold text-muted-foreground bg-muted hover:bg-muted/70 transition-colors text-sm flex items-center justify-center gap-2 border border-border">
              <ArrowRight size={14} /> Continuar sem Firebase (demo)
            </button>
          </form>
        </div>

        <p className="text-center text-white/30 text-xs mt-5">
          Firebase Console → Configurações do Projeto → Seus apps → SDK config
        </p>
        <div className="flex items-center justify-center gap-2 mt-3">
          <CheckCircle2 size={12} className="text-primary" />
          <span className="text-white/40 text-xs">Credenciais armazenadas localmente, nunca enviadas a terceiros</span>
        </div>
      </div>
    </div>
  );
}
