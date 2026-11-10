
// Navalha de Ouro ิว๖ All screen components
// Depends on atoms.jsx (loaded first)

const { useState, useEffect, useRef } = React;
const { C, SERVICES, BARBERS, TIME_SLOTS, BUSY, CAL_DAYS, getDayLabel,
  UPCOMING, HISTORY, ADMIN_TL, STATUS_MAP, SVC_DUR,
  StatusBar, BackBar, Btn, Inp, HomeIndicator, Stars, Badge, BottomNav } = window;

// ิ๖วิ๖ว LoginScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function LoginScreen({ push, replaceAll, setUserMode }) {
  const [email, setEmail] = useState('');
  const [pw, setPw] = useState('');
  const [mode, setMode] = useState('client');
  const [loading, setLoading] = useState(false);
  const [showPw, setShowPw] = useState(false);

  const handleLogin = () => {
    setLoading(true);
    setTimeout(() => { setLoading(false); setUserMode(mode); replaceAll(mode === 'admin' ? 'admin' : 'home'); }, 1100);
  };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <div className="scroll-y" style={{ flex:1, padding:'0 32px' }}>
        {/* Brand */}
        <div style={{ paddingTop:20, paddingBottom:36, textAlign:'center' }}>
          <div className="float" style={{ fontSize:52, display:'inline-block', marginBottom:16 }}>ิฃ้</div>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, fontWeight:700, color:C.cream, letterSpacing:'0.04em', lineHeight:1, marginBottom:14 }}>Navalha de Ouro</div>
          <div style={{ display:'flex', alignItems:'center', gap:12, justifyContent:'center', marginBottom:10 }}>
            <div style={{ flex:1, height:1, background:`linear-gradient(to right,transparent,${C.gold})`, opacity:0.4 }} />
            <span style={{ color:C.gold2, fontSize:13 }}>ิฃช</span>
            <div style={{ flex:1, height:1, background:`linear-gradient(to left,transparent,${C.gold})`, opacity:0.4 }} />
          </div>
          <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.cream3, letterSpacing:'0.2em', textTransform:'uppercase' }}>Barbearia Premium</div>
        </div>

        {/* Mode toggle */}
        <div style={{ display:'flex', background:C.s2, borderRadius:12, padding:4, marginBottom:28, border:`1px solid ${C.b1}` }}>
          {[['client','ญๆ๑  Cliente'],['admin','ิฃ้ดฉล  Barbeiro']].map(([m, lbl]) => (
            <button key={m} className="tap" onClick={() => setMode(m)} style={{ flex:1, height:36, borderRadius:9, background:mode===m?C.s4:'transparent', border:`1px solid ${mode===m?C.b2:'transparent'}`, fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:mode===m?600:400, color:mode===m?C.cream:C.cream3, transition:'all 0.2s' }}>
              {lbl}
            </button>
          ))}
        </div>

        <Inp label="E-mail ou Telefone" value={email} onChange={setEmail} type="email" placeholder="nome@email.com" />
        <Inp label="Senha" value={pw} onChange={setPw} type={showPw?'text':'password'} placeholder="ิว๓ิว๓ิว๓ิว๓ิว๓ิว๓ิว๓ิว๓"
          right={<button onClick={() => setShowPw(p=>!p)} style={{ background:'none', border:'none', color:C.cream3, fontSize:12, fontFamily:'DM Sans,sans-serif', flexShrink:0 }}>{showPw?'Ocultar':'Ver'}</button>} />

        <div style={{ textAlign:'right', marginBottom:24, marginTop:-10 }}>
          <button className="tap" onClick={() => push('forgot')} style={{ background:'none', border:'none', color:C.cream3, fontSize:13, fontFamily:'DM Sans,sans-serif' }}>Esqueceu a senha?</button>
        </div>

        <Btn onClick={handleLogin} loading={loading}>{loading ? '' : 'Entrar'}</Btn>

        <div style={{ textAlign:'center', marginTop:24, marginBottom:8 }}>
          <span style={{ color:C.cream3, fontSize:14, fontFamily:'DM Sans,sans-serif' }}>N+๚o tem conta? </span>
          <button className="tap" onClick={() => push('register')} style={{ background:'none', border:'none', color:C.gold2, fontSize:14, fontFamily:'DM Sans,sans-serif', fontWeight:600 }}>Cadastre-se</button>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}

// ิ๖วิ๖ว RegisterScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function RegisterScreen({ pop }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [cpw, setCpw] = useState('');
  const [loading, setLoading] = useState(false);
  const pwMatch = pw && cpw && pw === cpw;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <BackBar title="Criar Conta" onBack={pop} />
      <div className="scroll-y" style={{ flex:1, padding:'16px 28px 24px' }}>
        <Inp label="Nome Completo" value={name} onChange={setName} placeholder="Jo+๚o da Silva" autoFocus />
        <Inp label="E-mail" value={email} onChange={setEmail} type="email" placeholder="nome@email.com" />
        <Inp label="Telefone" value={phone} onChange={setPhone} type="tel" placeholder="(11) 9 0000-0000" />
        <Inp label="Senha" value={pw} onChange={setPw} type="password" placeholder="M+กn. 8 caracteres" />
        <Inp label="Confirmar Senha" value={cpw} onChange={setCpw} type="password" placeholder="Repita a senha" />
        {pwMatch && <div className="fade-up" style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.green, marginBottom:20, display:'flex', alignItems:'center', gap:6 }}><span>ิฃ๔</span><span>Senhas coincidem</span></div>}
        <Btn onClick={() => { setLoading(true); setTimeout(pop, 1000); }} loading={loading} disabled={!name||!email||!pwMatch}>
          Criar Conta
        </Btn>
        <div style={{ textAlign:'center', marginTop:20 }}>
          <button className="tap" onClick={pop} style={{ background:'none', border:'none', color:C.cream3, fontSize:14, fontFamily:'DM Sans,sans-serif' }}>J+ํ tenho conta</button>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}

// ิ๖วิ๖ว ForgotScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function ForgotScreen({ pop }) {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <BackBar title="Recuperar Senha" onBack={pop} />
      <div style={{ flex:1, padding:'32px 28px 24px', display:'flex', flexDirection:'column' }}>
        {sent ? (
          <div className="scale-in" style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', gap:20 }}>
            <div style={{ width:80, height:80, borderRadius:40, background:C.greenBg, border:`2px solid ${C.green}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:36 }}>ิฃ๋</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:700, color:C.cream, textAlign:'center' }}>Link Enviado!</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.cream3, textAlign:'center', lineHeight:1.7 }}>Verifique seu e-mail e siga as instru+บ+มes para redefinir sua senha.</div>
            <Btn onClick={pop}>Voltar ao Login</Btn>
          </div>
        ) : (
          <>
            <div style={{ textAlign:'center', marginBottom:40 }}>
              <div style={{ fontSize:48, marginBottom:16 }}>ญ๖ๆ</div>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.cream3, lineHeight:1.7 }}>Enviaremos um link de recupera+บ+๚o para seu e-mail cadastrado.</div>
            </div>
            <Inp label="E-mail" value={email} onChange={setEmail} type="email" placeholder="nome@email.com" autoFocus />
            <div style={{ marginTop:8 }}><Btn onClick={() => setSent(true)} disabled={!email}>Enviar Link</Btn></div>
          </>
        )}
      </div>
      <HomeIndicator />
    </div>
  );
}

// ิ๖วิ๖ว HomeScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function HomeScreen({ push }) {
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <div style={{ padding:'8px 20px 16px', background:C.s1, borderBottom:`1px solid ${C.b1}`, flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
          <div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.cream3, marginBottom:2 }}>Ol+ํ,</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:600, color:C.cream }}>Jo+๚o Silva</div>
          </div>
          <div style={{ position:'relative' }}>
            <button className="tap" style={{ width:42, height:42, borderRadius:21, background:C.s3, border:`1px solid ${C.b2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:18 }}>ญ๖๖</button>
            <div style={{ position:'absolute', top:4, right:4, width:9, height:9, borderRadius:5, background:C.gold, border:`2px solid ${C.s1}` }} />
          </div>
        </div>
      </div>

      <div className="scroll-y" style={{ flex:1, padding:'16px 20px 20px' }}>
        {/* Promo */}
        <div className="tap" onClick={() => push('services')} style={{ background:`linear-gradient(135deg,${C.s2} 0%,${C.goldBg} 100%)`, borderRadius:18, padding:'18px 20px', marginBottom:14, border:`1px solid ${C.b2}`, display:'flex', justifyContent:'space-between', alignItems:'center', position:'relative', overflow:'hidden' }}>
          <div style={{ position:'absolute', right:50, top:-20, width:100, height:100, borderRadius:50, background:C.gold, opacity:0.05 }} />
          <div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.gold2, letterSpacing:'0.12em', textTransform:'uppercase', marginBottom:4 }}>Promo+บ+๚o -ภ Hoje</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, fontWeight:700, color:C.cream, lineHeight:1 }}>20% OFF</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream3, marginTop:6 }}>Corte + Barba</div>
          </div>
          <div style={{ width:62, height:62, borderRadius:14, background:C.s3, border:`1px solid ${C.b2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>ิฃ้ดฉล</div>
        </div>

        <Btn onClick={() => push('services')} style={{ marginBottom:20 }}>ิฃ้ &nbsp;Agendar Agora</Btn>

        {/* Upcoming */}
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:12 }}>
          <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:15, color:C.cream }}>Pr+ฆximo Agendamento</div>
          <button className="tap" onClick={() => push('appointments')} style={{ background:'none', border:'none', fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.gold2 }}>Ver todos</button>
        </div>
        <div className="tap" onClick={() => push('appointments')} style={{ background:C.s2, borderRadius:14, border:`1px solid ${C.b2}`, padding:'14px 16px', marginBottom:20, display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:44, height:52, background:C.s4, borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${C.b2}` }}>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:20, color:C.gold2, lineHeight:1 }}>15</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:9, color:C.cream3, marginTop:2 }}>MAI</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:C.cream, marginBottom:4 }}>Corte + Barba</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.cream3, marginBottom:8 }}>Jo+๚o Mestre -ภ 14:00</div>
            <Badge status="confirmed" />
          </div>
          <span style={{ color:C.cream3, fontSize:18 }}>ิวฆ</span>
        </div>

        <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:15, color:C.cream, marginBottom:14 }}>Servi+บos</div>
        <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr 1fr', gap:10 }}>
          {[{icon:'ิฃ้ดฉล',name:'Corte',price:'R$ 40',h:false},{icon:'ญฌฦ',name:'Barba',price:'R$ 35',h:false},{icon:'ญๆๆ',name:'Combo',price:'R$ 65',h:true}].map(s => (
            <button key={s.name} className="tap" onClick={() => push('services')} style={{ background:s.h?C.goldBg:C.s2, borderRadius:12, padding:'14px 8px', border:`1px solid ${s.h?C.gold+'40':C.b1}`, display:'flex', flexDirection:'column', alignItems:'center', gap:6 }}>
              <span style={{ fontSize:22 }}>{s.icon}</span>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:600, color:s.h?C.gold2:C.cream }}>{s.name}</span>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:10, color:s.h?C.gold3+'aa':C.cream3 }}>{s.price}</span>
            </button>
          ))}
        </div>
      </div>
      <BottomNav current="home" onNav={(id) => push(id)} />
    </div>
  );
}

// ิ๖วิ๖ว ServicesScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function ServicesScreen({ push, pop, booking, setBooking }) {
  const [query, setQuery] = useState('');
  const [cat, setCat] = useState('todos');
  const selected = booking.service;

  const filtered = SERVICES.filter(s => {
    const mQ = !query || s.name.toLowerCase().includes(query.toLowerCase());
    const mC = cat === 'todos' || s.cat === cat;
    return mQ && mC;
  });

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <BackBar title="Escolha o Servi+บo" onBack={pop} />
      <div style={{ padding:'6px 20px 10px', flexShrink:0 }}>
        <div style={{ background:C.s2, borderRadius:24, padding:'0 16px', height:40, display:'flex', alignItems:'center', gap:10, border:`1px solid ${C.b1}` }}>
          <span style={{ color:C.cream3 }}>ญ๖์</span>
          <input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Buscar servi+บo..." style={{ flex:1, background:'transparent', border:'none', fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.cream }} />
          {query && <button onClick={() => setQuery('')} style={{ background:'none', border:'none', color:C.cream3, fontSize:16 }}>ิฃ๒</button>}
        </div>
      </div>
      <div className="scroll-x" style={{ padding:'0 20px 10px', display:'flex', gap:8, flexShrink:0 }}>
        {[['todos','Todos'],['corte','Corte'],['combo','Combo'],['barba','Barba'],['trat','Trat.']].map(([id,lbl]) => (
          <button key={id} className="tap" onClick={() => setCat(id)} style={{ flexShrink:0, padding:'6px 14px', borderRadius:20, background:cat===id?C.gold:C.s2, border:`1px solid ${cat===id?C.gold:C.b1}`, fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:cat===id?600:400, color:cat===id?'#0b0907':C.cream3, transition:'all 0.18s' }}>
            {lbl}
          </button>
        ))}
      </div>
      <div className="scroll-y" style={{ flex:1, padding:'0 20px 8px' }}>
        {filtered.map(svc => {
          const isSel = selected?.id === svc.id;
          return (
            <button key={svc.id} className="tap" onClick={() => setBooking(b=>({...b, service:isSel?null:svc}))}
              style={{ width:'100%', display:'flex', alignItems:'center', gap:14, padding:'13px 14px', marginBottom:8, borderRadius:14, background:isSel?C.goldBg:C.s2, border:`1px solid ${isSel?C.gold+'55':C.b1}`, transition:'all 0.2s', textAlign:'left' }}>
              <div style={{ width:44, height:44, borderRadius:12, background:isSel?C.gold+'22':C.s3, display:'flex', alignItems:'center', justifyContent:'center', fontSize:22, flexShrink:0 }}>{svc.icon}</div>
              <div style={{ flex:1 }}>
                <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:isSel?C.gold2:C.cream, marginBottom:2 }}>{svc.name}</div>
                <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.cream3 }}>{svc.desc}</div>
              </div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'flex-end', gap:6, flexShrink:0 }}>
                <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:15, color:C.gold2 }}>R$ {svc.price}</span>
                {isSel && <div style={{ width:20, height:20, borderRadius:10, background:C.gold, display:'flex', alignItems:'center', justifyContent:'center' }}><span style={{ color:'#0b0907', fontSize:11, fontWeight:800 }}>ิฃ๔</span></div>}
              </div>
            </button>
          );
        })}
      </div>
      {selected && (
        <div className="fade-up" style={{ padding:'12px 20px 0', flexShrink:0 }}>
          <Btn onClick={() => push('barber')}>Continuar -ภ {selected.name}</Btn>
        </div>
      )}
      <HomeIndicator />
    </div>
  );
}

// ิ๖วิ๖ว BarberScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function BarberScreen({ push, pop, booking, setBooking }) {
  const [noPref, setNoPref] = useState(false);
  const selected = booking.barber;
  const canContinue = selected || noPref;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <BackBar title="Escolha o Barbeiro" onBack={pop} />
      <div className="scroll-y" style={{ flex:1, padding:'8px 20px 20px' }}>
        {/* Context */}
        <div style={{ display:'inline-flex', alignItems:'center', gap:8, background:C.s2, borderRadius:10, padding:'8px 14px', marginBottom:20, border:`1px solid ${C.b1}` }}>
          <span style={{ fontSize:16 }}>{booking.service?.icon}</span>
          <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream }}>{booking.service?.name}</span>
          <span style={{ color:C.b2 }}>-ภ</span>
          <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:13, color:C.gold2 }}>R$ {booking.service?.price}</span>
        </div>

        <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:C.cream, marginBottom:14 }}>Dispon+กveis Hoje</div>
        <div className="scroll-x" style={{ display:'flex', gap:10, paddingBottom:6, marginBottom:20 }}>
          {BARBERS.map(b => {
            const isSel = selected?.id === b.id;
            return (
              <button key={b.id} className="tap" onClick={() => { setNoPref(false); setBooking(bk=>({...bk, barber:isSel?null:b})); }}
                style={{ flexShrink:0, width:92, padding:'14px 10px', borderRadius:14, background:isSel?C.goldBg:C.s2, border:`1.5px solid ${isSel?C.gold:C.b1}`, display:'flex', flexDirection:'column', alignItems:'center', gap:8, transition:'all 0.2s' }}>
                <div style={{ width:54, height:54, borderRadius:27, background:C.s3, border:`2px solid ${isSel?C.gold:C.b2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:24, transition:'border-color 0.2s' }}>{b.icon}</div>
                <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:600, color:isSel?C.gold2:C.cream, textAlign:'center', lineHeight:1.3 }}>{b.name.split(' ')[0]}</div>
                <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:10, color:C.gold2 }}>{'ิÿเ'.repeat(Math.round(b.rating))}</div>
              </button>
            );
          })}
        </div>

        {/* No preference */}
        <button className="tap" onClick={() => { setNoPref(p=>!p); setBooking(b=>({...b, barber:null})); }}
          style={{ width:'100%', padding:'12px 16px', borderRadius:12, background:noPref?C.s3:C.s2, border:`1px solid ${noPref?C.b2:C.b1}`, display:'flex', alignItems:'center', gap:12, marginBottom:20, transition:'all 0.2s' }}>
          <div style={{ width:20, height:20, borderRadius:10, border:`2px solid ${noPref?C.gold:C.b2}`, background:noPref?C.gold:'transparent', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0, transition:'all 0.2s' }}>
            {noPref && <span style={{ color:'#0b0907', fontSize:11, fontWeight:800 }}>ิฃ๔</span>}
          </div>
          <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream }}>Sem prefer+ฌncia (1-ฆ dispon+กvel)</span>
        </button>

        {/* Selected barber detail */}
        {selected && (
          <div className="fade-up" style={{ background:C.s2, borderRadius:16, padding:20, border:`1px solid ${C.b2}` }}>
            <div style={{ display:'flex', gap:14, alignItems:'center', marginBottom:14 }}>
              <div style={{ width:64, height:64, borderRadius:32, background:C.s3, border:`2px solid ${C.gold}44`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:30 }}>{selected.icon}</div>
              <div>
                <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:700, color:C.cream }}>{selected.name}</div>
                <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.cream3 }}>{selected.exp} de experi+ฌncia</div>
              </div>
            </div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream2, lineHeight:1.6, marginBottom:14 }}>{selected.specialty}</div>
            <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center' }}>
              <Stars rating={selected.rating} size={16} />
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream3 }}>{selected.rating} -ภ {selected.reviews} avalia+บ+มes</span>
            </div>
          </div>
        )}
      </div>
      {canContinue && (
        <div className="fade-up" style={{ padding:'12px 20px 0', flexShrink:0 }}>
          <Btn onClick={() => push('datetime')}>Escolher Hor+ํrio</Btn>
        </div>
      )}
      <HomeIndicator />
    </div>
  );
}

// ิ๖วิ๖ว DateTimeScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function DateTimeScreen({ push, pop, booking, setBooking }) {
  const selDate = booking.date;
  const selTime = booking.time;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <BackBar title="Data e Hor+ํrio" onBack={pop} />
      <div className="scroll-y" style={{ flex:1, padding:'8px 20px 20px' }}>
        {/* Calendar */}
        <div style={{ background:C.s2, borderRadius:16, padding:16, marginBottom:20, border:`1px solid ${C.b1}` }}>
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:14 }}>
            <button className="tap" style={{ background:'none', border:'none', color:C.cream3, fontSize:24, padding:'0 6px', lineHeight:1 }}>ิวฆ</button>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:15, color:C.cream }}>Maio 2026</span>
            <button className="tap" style={{ background:'none', border:'none', color:C.cream3, fontSize:24, padding:'0 6px', lineHeight:1 }}>ิวฆ</button>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3, marginBottom:6 }}>
            {['D','S','T','Q','Q','S','S'].map((d,i) => <div key={i} style={{ textAlign:'center', fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.cream3 }}>{d}</div>)}
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'repeat(7,1fr)', gap:3 }}>
            {CAL_DAYS.map((day,i) => {
              if (!day) return <div key={i} />;
              const isSel = selDate === day.d;
              const avail = day.available;
              return (
                <button key={i} className={avail?'tap':''} onClick={() => avail && setBooking(b=>({...b, date:b.date===day.d?null:day.d, time:null}))}
                  style={{ aspectRatio:'1', borderRadius:8, display:'flex', alignItems:'center', justifyContent:'center', fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:isSel?700:day.isToday?600:400, background:isSel?C.gold:day.isToday?C.s3:'transparent', color:isSel?'#0b0907':avail?C.cream:C.cream3, border:day.isToday&&!isSel?`1px solid ${C.b2}`:'none', opacity:(day.isPast||day.isWeekend)&&!day.isToday?0.22:1, cursor:avail?'pointer':'default', transition:'all 0.15s' }}>
                  {day.d}
                </button>
              );
            })}
          </div>
        </div>

        {/* Time slots */}
        {selDate && (
          <div className="fade-up">
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:C.cream, marginBottom:12 }}>
              {getDayLabel(selDate)}, {selDate} Mai ิว๖ Hor+ํrios dispon+กveis
            </div>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(3,1fr)', gap:8, marginBottom:12 }}>
              {TIME_SLOTS.map(t => {
                const isBusy = BUSY.has(t);
                const isSel = selTime === t;
                return (
                  <button key={t} className={!isBusy?'tap':''} onClick={() => !isBusy && setBooking(b=>({...b, time:b.time===t?null:t}))}
                    style={{ height:42, borderRadius:10, background:isSel?C.gold:isBusy?C.s1:C.s2, border:`1px solid ${isSel?C.gold:isBusy?C.b1:C.b2}`, fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:isSel?700:400, color:isSel?'#0b0907':isBusy?C.cream3:C.cream, opacity:isBusy?0.32:1, cursor:isBusy?'not-allowed':'pointer', transition:'all 0.15s' }}>
                    {t}
                  </button>
                );
              })}
            </div>
            <div style={{ display:'flex', gap:14, fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.cream3 }}>
              <span>ิ๛ํ Dispon+กvel</span>
              <span style={{ color:C.gold2 }}>ิ๛แ Selecionado</span>
              <span style={{ opacity:0.45 }}>ิ๛ํ Ocupado</span>
            </div>
          </div>
        )}
      </div>
      {selDate && selTime && (
        <div className="fade-up" style={{ padding:'12px 20px 0', flexShrink:0 }}>
          <Btn onClick={() => push('confirm')}>Confirmar Hor+ํrio -ภ {selTime}</Btn>
        </div>
      )}
      <HomeIndicator />
    </div>
  );
}

// ิ๖วิ๖ว ConfirmScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function ConfirmScreen({ push, pop, booking }) {
  const [loading, setLoading] = useState(false);
  const { service, barber, date, time } = booking;
  const dur = SVC_DUR[service?.id] || '40 min';
  const rows = [
    ['Servi+บo', service?.name],
    ['Barbeiro', barber?.name || 'Primeiro dispon+กvel'],
    ['Data', `${getDayLabel(date)}, ${date} Mai`],
    ['Hor+ํrio', `${time} -ภ ${dur}`],
  ];

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <BackBar title="Confirmar Agendamento" onBack={pop} />
      <div className="scroll-y" style={{ flex:1, padding:'16px 20px 20px' }}>
        <div style={{ background:C.s2, borderRadius:18, border:`1px solid ${C.b2}`, overflow:'hidden', marginBottom:20 }}>
          {rows.map(([k,v], i) => (
            <div key={i} style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'13px 18px', borderBottom:i<rows.length-1?`1px solid ${C.b1}`:'none' }}>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream3 }}>{k}</span>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:600, color:C.cream }}>{v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', padding:'18px', background:C.goldBg, borderTop:`1px solid ${C.gold}28` }}>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:16, color:C.cream }}>Total</span>
            <span style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:30, color:C.gold2 }}>R$ {service?.price},00</span>
          </div>
        </div>
        <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream3, textAlign:'center', lineHeight:1.7, marginBottom:20 }}>
          ญฦฆ Pagamento no local -ภ Cancelamento gratuito at+ฎ 2h antes
        </div>
        <Btn onClick={() => { setLoading(true); setTimeout(() => { setLoading(false); push('success'); }, 1200); }} loading={loading} style={{ marginBottom:12 }}>
          {loading ? '' : 'Confirmar Agendamento'}
        </Btn>
        <Btn variant="secondary" onClick={pop}>Alterar</Btn>
      </div>
      <HomeIndicator />
    </div>
  );
}

// ิ๖วิ๖ว SuccessScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function SuccessScreen({ replaceAll, booking }) {
  const [showGlow, setShowGlow] = useState(false);
  useEffect(() => { const t = setTimeout(() => setShowGlow(true), 300); return () => clearTimeout(t); }, []);

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg, alignItems:'center', justifyContent:'center', padding:'0 28px' }}>
      <StatusBar />
      <div style={{ flex:1, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', width:'100%', gap:0 }}>
        <div className={`scale-in ${showGlow?'glow-ring':''}`} style={{ width:100, height:100, borderRadius:50, background:`radial-gradient(circle at 35% 35%, ${C.s3}, ${C.s1})`, border:`3px solid ${C.gold}`, display:'flex', alignItems:'center', justifyContent:'center', marginBottom:28 }}>
          <span style={{ fontSize:42, lineHeight:1 }}>ิฃ๔</span>
        </div>
        <div className="fade-up" style={{ animationDelay:'0.2s', textAlign:'center', marginBottom:28, width:'100%' }}>
          <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:36, fontWeight:700, color:C.cream, marginBottom:10 }}>Agendado!</div>
          <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.cream3, lineHeight:1.7 }}>Confirma+บ+๚o enviada por SMS e e-mail. At+ฎ l+ํ! ญๆ๏</div>
        </div>
        <div className="fade-up" style={{ animationDelay:'0.35s', background:C.s2, borderRadius:14, border:`1px solid ${C.b2}`, padding:'14px 18px', width:'100%', marginBottom:24 }}>
          {[['Servi+บo', booking.service?.name], ['Data', `${booking.date} Mai -ภ ${booking.time}`], ['Barbeiro', booking.barber?.name || '1-ฆ Dispon+กvel']].map(([k,v]) => (
            <div key={k} style={{ display:'flex', justifyContent:'space-between', padding:'6px 0', borderBottom:`1px solid ${C.b1}` }}>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream3 }}>{k}</span>
              <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:600, color:C.cream }}>{v}</span>
            </div>
          ))}
          <div style={{ display:'flex', justifyContent:'space-between', padding:'8px 0 2px' }}>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:700, color:C.cream }}>Total</span>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:700, color:C.gold2 }}>R$ {booking.service?.price},00</span>
          </div>
        </div>
        <div className="fade-up" style={{ animationDelay:'0.5s', width:'100%', display:'flex', flexDirection:'column', gap:10 }}>
          <Btn onClick={() => replaceAll('appointments')}>Ver Meus Agendamentos</Btn>
          <Btn variant="secondary" onClick={() => replaceAll('home')}>Voltar ao In+กcio</Btn>
        </div>
      </div>
      <HomeIndicator />
    </div>
  );
}

// ิ๖วิ๖ว AppointmentsScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function AppointmentsScreen({ push, replaceAll }) {
  const [tab, setTab] = useState('upcoming');
  const list = tab === 'upcoming' ? UPCOMING : HISTORY;

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <div style={{ padding:'12px 20px 0', flexShrink:0 }}>
        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, fontWeight:700, color:C.cream, marginBottom:14 }}>Meus Agendamentos</div>
        <div style={{ display:'flex', borderBottom:`1px solid ${C.b1}`, gap:0 }}>
          {[['upcoming','Pr+ฆximos'],['history','Hist+ฆrico']].map(([id,lbl]) => (
            <button key={id} className="tap" onClick={() => setTab(id)} style={{ flex:1, height:38, background:'none', border:'none', fontFamily:'DM Sans,sans-serif', fontSize:14, fontWeight:tab===id?600:400, color:tab===id?C.cream:C.cream3, borderBottom:`2px solid ${tab===id?C.gold:'transparent'}`, marginBottom:-1, transition:'all 0.18s' }}>
              {lbl}
            </button>
          ))}
        </div>
      </div>
      <div className="scroll-y" style={{ flex:1, padding:'16px 20px 20px' }}>
        {list.map(appt => (
          <div key={appt.id} className="tap" style={{ background:C.s2, borderRadius:14, border:`1px solid ${C.b2}`, padding:'14px 16px', marginBottom:12, display:'flex', gap:14, alignItems:'flex-start' }}>
            <div style={{ width:44, height:52, background:C.s4, borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0, border:`1px solid ${C.b2}` }}>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:20, color:C.gold2, lineHeight:1 }}>{appt.d}</div>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:9, color:C.cream3, marginTop:2 }}>{appt.mon}</div>
            </div>
            <div style={{ flex:1 }}>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:C.cream, marginBottom:4 }}>{appt.svc}</div>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.cream3, marginBottom:8 }}>{appt.barber} -ภ {appt.time}</div>
              <div style={{ display:'flex', alignItems:'center', gap:10 }}>
                <Badge status={appt.status} />
                <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, color:C.gold2 }}>R$ {appt.price}</span>
              </div>
            </div>
            <button className="tap" style={{ background:'none', border:'none', color:C.cream3, fontSize:20, padding:'0 2px', flexShrink:0 }}>ิ๏ซ</button>
          </div>
        ))}
        <div style={{ marginTop:8 }}>
          <Btn variant="secondary" onClick={() => replaceAll('services')}>+ Novo Agendamento</Btn>
        </div>
      </div>
      <BottomNav current="appointments" onNav={(id) => replaceAll(id)} />
    </div>
  );
}

// ิ๖วิ๖ว ProfileScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function ProfileScreen({ replaceAll }) {
  const items = ['Dados Pessoais','Prefer+ฌncias de Corte','Notifica+บ+มes','Formas de Pagamento','Central de Ajuda'];
  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <div style={{ padding:'12px 20px 20px', flexShrink:0 }}>
        <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:26, fontWeight:700, color:C.cream }}>Perfil</div>
      </div>
      <div className="scroll-y" style={{ flex:1, padding:'0 20px 20px' }}>
        <div style={{ display:'flex', gap:16, alignItems:'center', marginBottom:24, background:C.s2, borderRadius:16, padding:'16px', border:`1px solid ${C.b2}` }}>
          <div style={{ width:64, height:64, borderRadius:32, background:C.s3, border:`2px solid ${C.b2}`, display:'flex', alignItems:'center', justifyContent:'center', fontSize:28 }}>ญๆ๑</div>
          <div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:22, fontWeight:600, color:C.cream, marginBottom:2 }}>Jo+๚o Silva</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream3 }}>joao.silva@email.com</div>
          </div>
        </div>
        {items.map(item => (
          <button key={item} className="tap" style={{ width:'100%', display:'flex', justifyContent:'space-between', alignItems:'center', padding:'14px 16px', marginBottom:6, background:C.s2, borderRadius:12, border:`1px solid ${C.b1}`, fontFamily:'DM Sans,sans-serif', fontSize:14, color:C.cream }}>
            <span>{item}</span><span style={{ color:C.cream3 }}>ิวฆ</span>
          </button>
        ))}
        <div style={{ marginTop:16 }}>
          <Btn variant="danger" onClick={() => replaceAll('login')}>Sair da Conta</Btn>
        </div>
      </div>
      <BottomNav current="profile" onNav={(id) => replaceAll(id)} />
    </div>
  );
}

// ิ๖วิ๖ว AdminScreen ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
function AdminScreen({ replaceAll }) {
  const [openDetail, setOpenDetail] = useState(false);
  const tlDotColor = { done:C.green, next:C.gold2, upcoming:C.b2, break:C.b2 };

  return (
    <div style={{ flex:1, display:'flex', flexDirection:'column', background:C.bg }}>
      <StatusBar />
      <div style={{ background:C.s1, padding:'8px 20px 16px', borderBottom:`1px solid ${C.b1}`, flexShrink:0 }}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'flex-start', marginBottom:14 }}>
          <div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.cream3, marginBottom:4, letterSpacing:'0.05em' }}>Ter, 12 de Maio -ภ 09:41</div>
            <div style={{ fontFamily:'Cormorant Garamond,serif', fontSize:28, fontWeight:700, color:C.cream }}>Ol+ํ, Jo+๚o ิฃ้ดฉล</div>
          </div>
          <button className="tap" onClick={() => replaceAll('login')} style={{ background:C.s3, border:`1px solid ${C.b2}`, borderRadius:10, padding:'6px 14px', fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.cream3 }}>Sair</button>
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[['8','Hoje',false],['R$\n320','Faturamento',false],['3','Pendentes',true]].map(([n,l,h],i) => (
            <div key={i} style={{ flex:1, background:h?C.goldBg:C.s3, borderRadius:12, padding:'10px', border:`1px solid ${h?C.gold+'30':C.b1}` }}>
              <div style={{ fontFamily:'Cormorant Garamond,serif', fontWeight:700, fontSize:22, color:h?C.gold2:C.cream, lineHeight:1.1, whiteSpace:'pre' }}>{n}</div>
              <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:10, color:C.cream3, marginTop:3 }}>{l}</div>
            </div>
          ))}
        </div>
      </div>

      <div className="scroll-y" style={{ flex:1, padding:'16px 20px 20px' }}>
        <div style={{ display:'flex', alignItems:'center', gap:8, marginBottom:12 }}>
          <span style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:C.cream }}>Pr+ฆxima Consulta</span>
          <span style={{ background:'rgba(196,145,42,0.14)', color:C.gold2, fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:600, padding:'2px 8px', borderRadius:6 }}>em 20min</span>
        </div>

        <div className="tap" onClick={() => setOpenDetail(o=>!o)} style={{ background:C.goldBg, borderRadius:14, border:`1px solid ${C.gold}2a`, padding:'14px 16px', marginBottom: openDetail?0:20, display:'flex', gap:14, alignItems:'center' }}>
          <div style={{ width:44, height:52, background:'rgba(196,145,42,0.1)', borderRadius:10, display:'flex', flexDirection:'column', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:700, fontSize:20, color:C.gold2, lineHeight:1 }}>12</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:9, color:C.gold3+'aa', marginTop:2 }}>MAI</div>
          </div>
          <div style={{ flex:1 }}>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:C.cream, marginBottom:4 }}>Paulo Sauro</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.cream3, marginBottom:4 }}>Corte Cl+ํssico -ภ 10:00 -ภ 40 min</div>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, fontWeight:700, color:C.gold2 }}>R$ 40,00</span>
          </div>
          <span style={{ color:C.gold2, fontSize:18, transform:openDetail?'rotate(90deg)':'none', transition:'transform 0.2s' }}>ิวฆ</span>
        </div>

        {openDetail && (
          <div className="fade-up" style={{ background:C.s2, borderRadius:'0 0 14px 14px', border:`1px solid ${C.b2}`, borderTop:'none', padding:'14px 16px', marginBottom:20 }}>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:12, color:C.cream3, marginBottom:8 }}>ญ๔ุ Observa+บ+มes do cliente</div>
            <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream, lineHeight:1.6, marginBottom:14 }}>Prefere tesoura. Corte baixo nas laterais, manter volume no topo.</div>
            <div style={{ display:'flex', gap:8 }}>
              <Btn variant="danger" style={{ height:40, fontSize:13 }}>Cancelar</Btn>
              <Btn style={{ height:40, fontSize:13 }}>ิฃ๔ Concluir</Btn>
            </div>
          </div>
        )}

        <div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:14, color:C.cream, marginBottom:14 }}>Agenda de Hoje</div>
        {ADMIN_TL.map((item, i) => {
          const isNext = item.status === 'next';
          return (
            <div key={i} style={{ display:'flex', gap:10, alignItems:'flex-start', marginBottom:6 }}>
              <div style={{ width:36, textAlign:'right', fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.cream3, paddingTop:12, flexShrink:0 }}>{item.time}</div>
              <div style={{ display:'flex', flexDirection:'column', alignItems:'center', paddingTop:14, flexShrink:0 }}>
                <div style={{ width:8, height:8, borderRadius:4, background:tlDotColor[item.status], boxShadow:isNext?`0 0 10px ${C.gold2}`:'none' }} />
                {i < ADMIN_TL.length-1 && <div style={{ width:1, height:30, background:C.b1, marginTop:2 }} />}
              </div>
              <div style={{ flex:1, background:isNext?C.goldBg:C.s2, borderRadius:10, padding:'9px 12px', border:`1px solid ${isNext?C.gold+'28':C.b1}`, marginBottom:2 }}>
                {item.client
                  ? <><div style={{ fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:13, color:isNext?C.gold2:C.cream }}>{item.client}</div><div style={{ fontFamily:'DM Sans,sans-serif', fontSize:11, color:C.cream3 }}>{item.svc} -ภ {item.dur}</div></>
                  : <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:13, color:C.cream3 }}>ญ์ขดฉล {item.svc}</div>
                }
              </div>
            </div>
          );
        })}
      </div>
      <HomeIndicator />
    </div>
  );
}

Object.assign(window, {
  LoginScreen, RegisterScreen, ForgotScreen, HomeScreen,
  ServicesScreen, BarberScreen, DateTimeScreen, ConfirmScreen,
  SuccessScreen, AppointmentsScreen, ProfileScreen, AdminScreen,
});
