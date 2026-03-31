const $ = (s) => document.querySelector(s);
const api = (p, opt={}) => fetch(p, { headers:{'Content-Type':'application/json'}, ...opt}).then(r=>r.json());
const metric = (label, value) => { const d=document.createElement('div'); d.className='metric'; d.innerHTML=`<div class="label">${label}</div><div class="value">${value}</div>`; return d; };

async function load() {
  const [dash, assets, tickets, energy, health] = await Promise.all([
    api('/api/dashboard'), api('/api/assets'), api('/api/tickets'), api('/api/energy'), api('/api/health')
  ]);
  const m = $('#metrics'); m.innerHTML='';
  m.append(metric('Assets', dash.assets), metric('Tickets', dash.tickets), metric('Open', dash.openTickets), metric('Energy logs', dash.energy));
  renderList('#assets', assets, a => `${a.name || 'asset'} — ${a.type || ''} ${a.location||''}`);
  renderList('#tickets', tickets, t => `${t.title||'ticket'} — ${t.status}`);
  renderList('#energy', energy, e => `${e.site||'site'} — ${e.kwh||e.usage||0} kWh`);
}

function renderList(sel, items, fmt){ const el=$(sel); el.innerHTML=''; if(!items.length){el.innerHTML='<li>None yet</li>';return;} items.forEach(i=>{const li=document.createElement('li'); li.textContent=fmt(i); el.append(li);}); }

$('#asset-form').onsubmit = async (e)=>{e.preventDefault(); const d=Object.fromEntries(new FormData(e.target)); await api('/api/assets',{method:'POST',body:JSON.stringify(d)}); e.target.reset(); load();};
$('#ticket-form').onsubmit = async (e)=>{e.preventDefault(); const d=Object.fromEntries(new FormData(e.target)); await api('/api/tickets',{method:'POST',body:JSON.stringify(d)}); e.target.reset(); load();};
$('#energy-form').onsubmit = async (e)=>{e.preventDefault(); const d=Object.fromEntries(new FormData(e.target)); await api('/api/energy',{method:'POST',body:JSON.stringify(d)}); e.target.reset(); load();};

load();
