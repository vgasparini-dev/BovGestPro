          {currentView === 'dashboard' && (() => {
            // ── Dashboard computed values ─────────────────────────────────────
            const hoje = new Date();
            const mesAtual = hoje.getMonth();
            const anoAtual = hoje.getFullYear();

            // Alertas: animais em carência
            const animaisCarencia = cVac.filter(v =>
              v.dataLiberacao && new Date(v.dataLiberacao) > hoje
            );

            // Alertas: vacinas do calendário próximas (mês atual / próximo mês)
            const mesesProximos = [
              hoje.toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase()),
              new Date(anoAtual, mesAtual + 1, 1).toLocaleString('pt-BR', { month: 'long' }).replace(/^\w/, c => c.toUpperCase())
            ];
            const vacProximas = cCal.filter(c =>
              mesesProximos.some(m => c.mes?.includes(m)) || c.mes?.includes('Qualquer')
            );

            // Alertas: insumos críticos
            const insumosCriticos = cInsumos.filter(i =>
              Number(i.quantidade || 0) <= Number(i.estoqueMinimo || 0)
            );

            const totalAlertas = animaisCarencia.length + vacProximas.length + insumosCriticos.length;

            // Atividades recentes (últimas 4 de cada tipo, mescladas por data)
            const recentes = [
              ...cPesagens.slice(-4).map(p => ({ tipo: 'pesagem', icone: '⚖', cor: 'bg-orange-100 text-orange-600', desc: `Pesagem: Brinco ${p.brinco} → ${p.pesoAtual} kg`, data: p.data })),
              ...cVac.slice(-4).map(v => ({ tipo: 'vacina', icone: '💉', cor: 'bg-red-100 text-red-600', desc: `Vacinação: ${v.vacina} — Lote ${v.lote}`, data: v.dataAplicacao })),
              ...cNasc.slice(-4).map(n => ({ tipo: 'nascimento', icone: '🐄', cor: 'bg-blue-100 text-blue-600', desc: `Nascimento: Bezerro ${n.brincoBezerro} (M: ${n.brincoMatriz})`, data: n.data })),
            ]
              .filter(x => x.data)
              .sort((a, b) => new Date(b.data) - new Date(a.data))
              .slice(0, 5);

            // Financeiro do mês atual
            const finMes = cFin.filter(f => {
              if (!f.data) return false;
              const d = new Date(f.data);
              return d.getMonth() === mesAtual && d.getFullYear() === anoAtual && f.status === 'pago';
            });
            const receitasMes = finMes.filter(f => f.tipo === 'receita').reduce((s, f) => s + Number(f.valor || 0), 0);
            const despesasMes = finMes.filter(f => f.tipo === 'despesa').reduce((s, f) => s + Number(f.valor || 0), 0);
            const saldoMes = receitasMes - despesasMes;
            const maxBarMes = Math.max(receitasMes, despesasMes, 1);

            return (
              <div className="space-y-6">

                {/* ── KPI Cards ─────────────────────────────────────────────── */}
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-4">
                  <div className="bg-white p-6 rounded-3xl border shadow-sm">
                    <div className="bg-blue-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-blue-600"><Beef size={28}/></div>
                    <h3 className="text-4xl font-black">{cAnimais.length}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Cabeças</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border shadow-sm">
                    <div className="bg-green-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-green-600"><DollarSign size={28}/></div>
                    <h3 className="text-2xl font-black mt-2 truncate">{formatCurrency(saldoAtual)}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Saldo Global</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border shadow-sm">
                    <div className="bg-cyan-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-cyan-600"><Droplets size={28}/></div>
                    <h3 className="text-4xl font-black">{totalLeiteMes} <span className="text-lg text-gray-400">L</span></h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Leite Mês</p>
                  </div>
                  <div className="bg-white p-6 rounded-3xl border shadow-sm">
                    <div className="bg-pink-50 w-14 h-14 rounded-2xl flex items-center justify-center mb-4 text-pink-600"><HeartPulse size={28}/></div>
                    <h3 className="text-4xl font-black">{cRep.filter(r=>r.status==='Prenhe').length}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Prenhes</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border shadow-sm">
                    <div className="bg-rose-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-rose-500 font-black text-xl">F</div>
                    <h3 className="text-3xl font-black text-rose-500">{cAnimais.filter(a=>a.sexo==='F').length}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Fêmeas</p>
                  </div>
                  <div className="bg-white p-5 rounded-3xl border shadow-sm">
                    <div className="bg-blue-50 w-12 h-12 rounded-2xl flex items-center justify-center mb-3 text-blue-500 font-black text-xl">M</div>
                    <h3 className="text-3xl font-black text-blue-500">{cAnimais.filter(a=>a.sexo==='M').length}</h3>
                    <p className="text-xs font-bold text-gray-400 mt-1 uppercase">Machos</p>
                  </div>
                </div>

                {/* ── Row 2: Alertas + Financeiro ───────────────────────────── */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

                  {/* Alertas */}
                  <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-amber-50">
                      <div className="flex items-center gap-2">
                        <AlertTriangle size={20} className="text-amber-600"/>
                        <h3 className="font-black text-gray-900">Alertas</h3>
                        {totalAlertas > 0 && (
                          <span className="w-5 h-5 rounded-full bg-red-500 text-white text-[10px] font-black flex items-center justify-center">{totalAlertas}</span>
                        )}
                      </div>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-64 overflow-y-auto">
                      {totalAlertas === 0 && (
                        <div className="px-6 py-8 text-center text-gray-400">
                          <CheckCircle2 size={32} className="mx-auto mb-2 text-green-400"/>
                          <p className="font-bold text-sm">Sem alertas ativos</p>
                        </div>
                      )}
                      {animaisCarencia.map((v, i) => (
                        <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-orange-50/50">
                          <div className="w-8 h-8 bg-orange-100 rounded-xl flex items-center justify-center shrink-0">
                            <ShieldAlert size={15} className="text-orange-600"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">Em carência: Lote {v.lote}</p>
                            <p className="text-xs text-gray-500 font-medium">Liberação: {v.dataLiberacao}</p>
                          </div>
                          <span className="bg-orange-100 text-orange-700 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">Carência</span>
                        </div>
                      ))}
                      {vacProximas.map((c, i) => (
                        <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-blue-50/50">
                          <div className="w-8 h-8 bg-blue-100 rounded-xl flex items-center justify-center shrink-0">
                            <CalendarDays size={15} className="text-blue-600"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">Vacina: {c.doenca}</p>
                            <p className="text-xs text-gray-500 font-medium">{c.mes} — {c.publico}</p>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${c.obrigatorio ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {c.obrigatorio ? 'Obrig.' : 'Recom.'}
                          </span>
                        </div>
                      ))}
                      {insumosCriticos.map((ins, i) => (
                        <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-red-50/50">
                          <div className="w-8 h-8 bg-red-100 rounded-xl flex items-center justify-center shrink-0">
                            <PackagePlus size={15} className="text-red-600"/>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">Estoque crítico: {ins.nome}</p>
                            <p className="text-xs text-gray-500 font-medium">{ins.quantidade} {ins.unidade} (mín: {ins.estoqueMinimo})</p>
                          </div>
                          <span className="bg-red-100 text-red-700 text-[10px] font-black px-2 py-0.5 rounded-full shrink-0">Crítico</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Resumo Financeiro do Mês */}
                  <div className="bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <div className="flex items-center justify-between px-6 py-4 border-b bg-green-50">
                      <div className="flex items-center gap-2">
                        <DollarSign size={20} className="text-green-600"/>
                        <h3 className="font-black text-gray-900">Financeiro do Mês</h3>
                      </div>
                      <span className="text-xs font-bold text-gray-400">
                        {hoje.toLocaleString('pt-BR', { month: 'long', year: 'numeric' })}
                      </span>
                    </div>
                    <div className="p-6 space-y-4">
                      <div className="grid grid-cols-3 gap-3 text-center">
                        <div className="bg-green-50 rounded-2xl p-4">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Receitas</p>
                          <p className="text-lg font-black text-green-600 truncate">{formatCurrency(receitasMes)}</p>
                        </div>
                        <div className="bg-red-50 rounded-2xl p-4">
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Despesas</p>
                          <p className="text-lg font-black text-red-600 truncate">{formatCurrency(despesasMes)}</p>
                        </div>
                        <div className={`rounded-2xl p-4 ${saldoMes >= 0 ? 'bg-slate-900' : 'bg-red-900'}`}>
                          <p className="text-xs font-bold text-gray-400 uppercase mb-1">Saldo</p>
                          <p className={`text-lg font-black truncate ${saldoMes >= 0 ? 'text-white' : 'text-red-300'}`}>{formatCurrency(saldoMes)}</p>
                        </div>
                      </div>
                      {/* Barras visuais */}
                      <div className="space-y-2">
                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>Receitas</span><span>{formatCurrency(receitasMes)}</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full">
                            <div className="h-full bg-green-500 rounded-full transition-all" style={{width: `${(receitasMes/maxBarMes)*100}%`}}/>
                          </div>
                        </div>
                        <div>
                          <div className="flex justify-between text-xs font-bold text-gray-500 mb-1">
                            <span>Despesas</span><span>{formatCurrency(despesasMes)}</span>
                          </div>
                          <div className="w-full h-2.5 bg-gray-100 rounded-full">
                            <div className="h-full bg-red-500 rounded-full transition-all" style={{width: `${(despesasMes/maxBarMes)*100}%`}}/>
                          </div>
                        </div>
                      </div>
                      {finMes.length === 0 && (
                        <p className="text-center text-gray-400 text-sm font-medium py-2">Nenhum lançamento este mês</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* ── Row 3: Atividades Recentes + Calendário + Firebase ─────── */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">

                  {/* Atividades Recentes */}
                  <div className="lg:col-span-1 bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b bg-slate-50">
                      <Activity size={18} className="text-slate-600"/>
                      <h3 className="font-black text-gray-900">Atividades Recentes</h3>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                      {recentes.length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-400">
                          <Activity size={28} className="mx-auto mb-2 opacity-30"/>
                          <p className="font-bold text-sm">Nenhuma atividade ainda</p>
                        </div>
                      )}
                      {recentes.map((a, i) => (
                        <div key={i} className="flex items-start gap-3 px-6 py-3 hover:bg-gray-50">
                          <div className={`w-8 h-8 ${a.cor} rounded-xl flex items-center justify-center shrink-0 text-sm`}>{a.icone}</div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm leading-tight">{a.desc}</p>
                            <p className="text-xs text-gray-400 font-medium mt-0.5">{a.data}</p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Próximos eventos do calendário sanitário */}
                  <div className="lg:col-span-1 bg-white rounded-3xl border shadow-sm overflow-hidden">
                    <div className="flex items-center gap-2 px-6 py-4 border-b bg-blue-50">
                      <CalendarDays size={18} className="text-blue-600"/>
                      <h3 className="font-black text-gray-900">Calendário Sanitário</h3>
                    </div>
                    <div className="divide-y divide-gray-50 max-h-72 overflow-y-auto">
                      {cCal.length === 0 && (
                        <div className="px-6 py-8 text-center text-gray-400">
                          <CalendarDays size={28} className="mx-auto mb-2 opacity-30"/>
                          <p className="font-bold text-sm">Sem eventos cadastrados</p>
                        </div>
                      )}
                      {cCal.slice(0, 6).map((c, i) => (
                        <div key={i} className="flex items-center gap-3 px-6 py-3 hover:bg-blue-50/50">
                          <div className="w-10 h-10 bg-blue-100 rounded-xl flex flex-col items-center justify-center shrink-0">
                            <span className="text-[9px] font-black text-blue-600 uppercase leading-none">{(c.mes||'').slice(0,3)}</span>
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="font-bold text-sm truncate">{c.doenca}</p>
                            <p className="text-xs text-gray-500">{c.publico}</p>
                          </div>
                          <span className={`text-[10px] font-black px-2 py-0.5 rounded-full shrink-0 ${c.obrigatorio ? 'bg-red-100 text-red-700' : 'bg-blue-100 text-blue-700'}`}>
                            {c.obrigatorio ? 'Obrig.' : 'Recom.'}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Status Firebase + mini stats */}
                  <div className="lg:col-span-1 space-y-4">
                    {/* Status nuvem */}
                    <div className={`rounded-3xl border p-5 shadow-sm ${cloudStatus === 'online' ? 'bg-blue-50 border-blue-100' : cloudStatus === 'error' ? 'bg-red-50 border-red-100' : 'bg-gray-50 border-gray-100'}`}>
                      <div className="flex items-center gap-3 mb-3">
                        {cloudStatus === 'online' ? <Cloud size={22} className="text-blue-600"/> : cloudStatus === 'error' ? <CloudOff size={22} className="text-red-500"/> : <Loader2 size={22} className="text-gray-400 animate-spin"/>}
                        <div>
                          <p className="font-black text-sm">
                            {cloudStatus === 'online' ? 'Firebase Sincronizado' : cloudStatus === 'error' ? 'Erro de Sincronização' : 'Conectando...'}
                          </p>
                          <p className="text-xs text-gray-500 font-medium">
                            {cloudStatus === 'online' ? 'Dados em tempo real na nuvem' : cloudStatus === 'error' ? 'Verifique a ligação à internet' : 'A estabelecer ligação...'}
                          </p>
                        </div>
                        <div className={`ml-auto w-3 h-3 rounded-full ${cloudStatus === 'online' ? 'bg-green-500 animate-pulse' : cloudStatus === 'error' ? 'bg-red-500' : 'bg-gray-400'}`}/>
                      </div>
                    </div>

                    {/* Mini KPIs */}
                    <div className="bg-white rounded-3xl border shadow-sm p-5">
                      <p className="text-xs font-black text-gray-400 uppercase mb-3">Resumo do Rebanho</p>
                      <div className="space-y-2.5">
                        {[
                          { label: 'Peso médio', value: `${pesoMedio} kg`, color: 'text-blue-600' },
                          { label: 'Pesagens registadas', value: cPesagens.length, color: 'text-orange-600' },
                          { label: 'Nascimentos', value: cNasc.length, color: 'text-green-600' },
                          { label: 'Vacinações', value: cVac.length, color: 'text-red-600' },
                          { label: 'Insumos ativos', value: cInsumos.length, color: 'text-purple-600' },
                          { label: 'Lotes', value: cLotes.length, color: 'text-teal-600' },
                        ].map((item, i) => (
                          <div key={i} className="flex items-center justify-between">
                            <span className="text-xs font-bold text-gray-500">{item.label}</span>
                            <span className={`text-sm font-black ${item.color}`}>{item.value}</span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>

              </div>
            );
          })()}
