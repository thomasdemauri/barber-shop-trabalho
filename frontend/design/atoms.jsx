
// Navalha de Ouro ิว๖ Shared atoms + data
// Loaded as text/babel, exports to window.*

const { useState, useEffect, useRef } = React;

// ิ๖วิ๖ว Design Tokens ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
const C = {
  bg:'#0b0907', s1:'#151210', s2:'#1d1a16', s3:'#262320', s4:'#2f2b25',
  gold:'#c4912a', gold2:'#d4a84c', gold3:'#eacf78', goldBg:'#1e1508',
  cream:'#f0e3c4', cream2:'#b0a080', cream3:'#6a5c44',
  b1:'#222018', b2:'#3c3428',
  green:'#4a9d6e', greenBg:'#0c2216',
  red:'#c05050', redBg:'#280e0e',
};

// ิ๖วิ๖ว Data ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว
const SERVICES = [
  { id:1, icon:'ิฃ้ดฉล', name:'Corte Cl+ํssico',      desc:'40 min -ภ Tesoura ou m+ํquina',    price:40,  cat:'corte' },
  { id:2, icon:'ญๆๆ', name:'Corte + Barba',        desc:'70 min -ภ Combo premium',         price:65,  cat:'combo' },
  { id:3, icon:'ญฌฦ', name:'Barba Completa',        desc:'30 min -ภ Navalha profissional',  price:35,  cat:'barba' },
  { id:4, icon:'ญฦๅ', name:'Hidrata+บ+๚o Capilar',    desc:'20 min -ภ Tratamento profundo',   price:30,  cat:'trat'  },
  { id:5, icon:'ิฃฟ', name:'Design de Sobrancelha', desc:'15 min -ภ Modelagem precisa',     price:20,  cat:'trat'  },
  { id:6, icon:'ญฤฟ', name:'Colora+บ+๚o',             desc:'90 min -ภ Platinado, luzes, ombr+ฎ', price:120, cat:'trat'  },
];

const BARBERS = [
  { id:1, name:'Jo+๚o Mestre',   exp:'12 anos', rating:4.9, reviews:380, icon:'ญๆฟิว์ญชฆ', specialty:'Cortes cl+ํssicos e degrad+ฌ' },
  { id:2, name:'Pedro Silva',   exp:'7 anos',  rating:4.7, reviews:210, icon:'ญๆฟิว์ญชฆ', specialty:'Barba e tratamentos capilares' },
  { id:3, name:'Carlos Barbosa',exp:'10 anos', rating:4.8, reviews:290, icon:'ญบ๖',  specialty:'Cortes modernos e colora+บ+๚o' },
];

const TIME_SLOTS = ['09:00','09:30','10:00','10:30','11:00','11:30','14:00','14:30','15:00','15:30','16:00','16:30','17:00'];
const BUSY = new Set(['09:00','09:30','11:00','15:30']);

// May 2026 ิว๖ May 1 = Friday (dow=5 in Sun=0 system)
const CAL_DAYS = (() => {
  const arr = Array(5).fill(null);
  for (let d = 1; d <= 31; d++) {
    const dow = (5 + d - 1) % 7;
    arr.push({ d, dow, isWeekend: dow===0||dow===6, isPast: d<12, isToday: d===12, available: d>12 && dow!==0 && dow!==6 });
  }
  return arr;
})();

const DOW_NAMES = ['Dom','Seg','Ter','Qua','Qui','Sex','S+ํb'];
const getDayLabel = (d) => DOW_NAMES[(5 + d - 1) % 7];

const UPCOMING = [
  { id:1, d:15, mon:'MAI', svc:'Corte + Barba',  barber:'Jo+๚o Mestre',   time:'14:00', status:'confirmed', price:65 },
  { id:2, d:22, mon:'MAI', svc:'Corte Cl+ํssico', barber:'Carlos Barbosa',time:'10:00', status:'pending',   price:40 },
];
const HISTORY = [
  { id:3, d:28, mon:'ABR', svc:'Barba Completa', barber:'Jo+๚o Mestre',   time:'11:00', status:'done', price:35 },
  { id:4, d:14, mon:'ABR', svc:'Corte + Barba',  barber:'Pedro Silva',   time:'15:00', status:'done', price:65 },
];
const ADMIN_TL = [
  { time:'09:00', client:'Carlos R.',  svc:'Barba',         dur:'30 min', status:'done'     },
  { time:'10:00', client:'Paulo S.',   svc:'Corte Cl+ํssico',dur:'40 min', status:'next'     },
  { time:'11:30', client:'Marcus L.',  svc:'Corte + Barba', dur:'70 min', status:'upcoming' },
  { time:'13:00', client:null,         svc:'Almo+บo',        dur:'60 min', status:'break'    },
  { time:'14:00', client:'Rafael C.',  svc:'Hidrata+บ+๚o',    dur:'20 min', status:'upcoming' },
  { time:'15:30', client:'Thiago M.',  svc:'Corte Cl+ํssico',dur:'40 min', status:'upcoming' },
];

const SVC_DUR = { 1:'40 min', 2:'70 min', 3:'30 min', 4:'20 min', 5:'15 min', 6:'90 min' };

// ิ๖วิ๖ว Atoms ิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖วิ๖ว

function StatusBar() {
  return (
    <div style={{ height:54, display:'flex', alignItems:'flex-end', justifyContent:'space-between', padding:'0 24px 10px', position:'relative', flexShrink:0 }}>
      <div style={{ position:'absolute', top:10, left:'50%', transform:'translateX(-50%)', width:120, height:34, background:'#000', borderRadius:22 }} />
      <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:15, fontWeight:600, color:C.cream, zIndex:1, position:'relative' }}>9:41</span>
      <div style={{ display:'flex', gap:5, alignItems:'center', zIndex:1, position:'relative' }}>
        <span style={{ fontSize:11, color:C.cream }}>ิ๛ฆิ๛ฆ</span>
        <span style={{ fontSize:11, color:C.cream }}>ิ๛่</span>
      </div>
    </div>
  );
}

function BackBar({ title, onBack, right }) {
  return (
    <div style={{ height:52, display:'flex', alignItems:'center', padding:'0 16px', gap:8, flexShrink:0 }}>
      <button className="tap" onClick={onBack} style={{ width:36, height:36, borderRadius:18, background:C.s3, border:'none', display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
        <span style={{ color:C.cream, fontSize:18, lineHeight:1 }}>ิๅษ</span>
      </button>
      <span style={{ flex:1, fontFamily:'DM Sans,sans-serif', fontWeight:600, fontSize:16, color:C.cream, textAlign:'center' }}>{title}</span>
      <div style={{ width:36, display:'flex', justifyContent:'flex-end' }}>{right || null}</div>
    </div>
  );
}

function Btn({ children, onClick, variant='primary', disabled, loading, style:extra }) {
  const p = variant === 'primary';
  const sec = variant === 'secondary';
  const danger = variant === 'danger';
  const bg = disabled ? C.s4 : p ? `linear-gradient(135deg,${C.gold},${C.gold2})` : sec ? 'transparent' : danger ? C.redBg : 'transparent';
  const col = disabled ? C.cream3 : p ? '#0b0907' : danger ? C.red : C.cream;
  const brd = sec ? `1px solid ${C.b2}` : danger ? `1px solid rgba(192,80,80,0.3)` : 'none';
  const sh = (!disabled && p) ? '0 4px 24px rgba(196,145,42,0.28)' : 'none';
  return (
    <button className={disabled||loading ? '' : 'tap'} onClick={disabled||loading ? undefined : onClick}
      style={{ width:'100%', height:52, borderRadius:12, border:brd, fontFamily:'DM Sans,sans-serif', fontSize:16, fontWeight:600, cursor:disabled||loading?'not-allowed':'pointer', transition:'all 0.2s', flexShrink:0, background:bg, color:col, boxShadow:sh, ...(extra||{}) }}>
      {loading
        ? <span style={{ display:'inline-block', width:18, height:18, border:`2px solid ${p?'rgba(0,0,0,0.25)':C.b2}`, borderTopColor:p?'#0b0907':C.cream2, borderRadius:'50%', animation:'spin 0.7s linear infinite' }} />
        : children}
    </button>
  );
}

function Inp({ label, value, onChange, type='text', placeholder, right, autoFocus }) {
  return (
    <div className="inp-wrap" style={{ marginBottom:20 }}>
      <div style={{ fontFamily:'DM Sans,sans-serif', fontSize:10, color:C.cream3, letterSpacing:'0.14em', textTransform:'uppercase', marginBottom:8 }}>{label}</div>
      <div style={{ display:'flex', alignItems:'center', gap:8 }}>
        <input type={type} value={value} onChange={e=>onChange(e.target.value)} placeholder={placeholder} autoFocus={autoFocus}
          style={{ flex:1, background:'transparent', border:'none', fontFamily:'DM Sans,sans-serif', fontSize:16, color:C.cream }} />
        {right}
      </div>
      <div className="inp-line" style={{ height:1, background:C.b2, marginTop:8, transition:'background 0.2s' }} />
    </div>
  );
}

function HomeIndicator() {
  return <div style={{ height:34, display:'flex', alignItems:'center', justifyContent:'center', flexShrink:0 }}>
    <div style={{ width:134, height:5, background:C.cream, borderRadius:3, opacity:0.18 }} />
  </div>;
}

function Stars({ rating, size=14 }) {
  return <div style={{ display:'flex', gap:2 }}>
    {[1,2,3,4,5].map(i => <span key={i} style={{ color:i<=Math.round(rating)?C.gold2:C.b2, fontSize:size }}>ิÿเ</span>)}
  </div>;
}

const STATUS_MAP = {
  confirmed:{ bg:'rgba(74,157,110,0.14)', c:'#4a9d6e', label:'Confirmado' },
  pending:  { bg:'rgba(196,145,42,0.12)', c:'#d4a84c', label:'Pendente'   },
  done:     { bg:'#262320',               c:'#6a5c44', label:'Conclu+กdo'  },
  next:     { bg:'rgba(196,145,42,0.18)', c:'#d4a84c', label:'Pr+ฆximo'    },
  upcoming: { bg:'#1d1a16',               c:'#6a5c44', label:'Agendado'   },
  break:    { bg:'#1d1a16',               c:'#6a5c44', label:'Pausa'      },
};
function Badge({ status }) {
  const st = STATUS_MAP[status] || STATUS_MAP.done;
  return <span style={{ display:'inline-block', padding:'3px 9px', borderRadius:6, background:st.bg, color:st.c, fontFamily:'DM Sans,sans-serif', fontSize:11, fontWeight:600 }}>{st.label}</span>;
}

function BottomNav({ current, onNav }) {
  const items = [['home','In+กcio','ิ๎้'],['services','Agendar','ิฃ้'],['appointments','Agenda','ิ๙ภ'],['profile','Perfil','ิ๙ฤ']];
  return (
    <div style={{ height:80, background:C.s1, borderTop:`1px solid ${C.b1}`, display:'flex', alignItems:'flex-start', paddingTop:12, flexShrink:0 }}>
      {items.map(([id,label,icon]) => {
        const active = current === id;
        return (
          <button key={id} className="tap" onClick={() => onNav(id)} style={{ flex:1, background:'none', border:'none', display:'flex', flexDirection:'column', alignItems:'center', gap:4 }}>
            <span style={{ fontSize:20, opacity:active?1:0.28, color:active?C.gold2:C.cream, transition:'all 0.2s' }}>{icon}</span>
            <span style={{ fontFamily:'DM Sans,sans-serif', fontSize:10, color:active?C.gold2:C.cream3, fontWeight:active?600:400, transition:'all 0.2s' }}>{label}</span>
          </button>
        );
      })}
    </div>
  );
}

Object.assign(window, {
  C, SERVICES, BARBERS, TIME_SLOTS, BUSY, CAL_DAYS, getDayLabel,
  UPCOMING, HISTORY, ADMIN_TL, STATUS_MAP, SVC_DUR,
  StatusBar, BackBar, Btn, Inp, HomeIndicator, Stars, Badge, BottomNav,
});
