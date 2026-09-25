
window.BRUI=(()=>{
  const C={
    INR:{symbol:'₹',name:'Indian Rupee'},
    USD:{symbol:'$',name:'US Dollar'},
    EUR:{symbol:'€',name:'Euro'},
    GBP:{symbol:'£',name:'Pound Sterling'},
    AED:{symbol:'د.إ',name:'UAE Dirham'},
    JPY:{symbol:'¥',name:'Japanese Yen'},
    CAD:{symbol:'CA$',name:'Canadian Dollar'},
    AUD:{symbol:'A$',name:'Australian Dollar'},
    CHF:{symbol:'CHF',name:'Swiss Franc'},
    CNY:{symbol:'CN¥',name:'Chinese Yuan'},
    SGD:{symbol:'S$',name:'Singapore Dollar'},
    BDT:{symbol:'৳',name:'Bangladeshi Taka'},
    BRL:{symbol:'R$',name:'Brazilian Real'},
    ZAR:{symbol:'R',name:'South African Rand'}
  };
  const fallback={INR:1};
  const stored=localStorage.getItem('brCurrency');
  const state={currency:C[stored]?stored:'INR',rates:{INR:1},date:null};
  function format(n){
    if(n==null||Number.isNaN(Number(n))) return '—';
    const value=Number(n)*(state.rates[state.currency]||fallback[state.currency]||1);
    return new Intl.NumberFormat(navigator.language||'en',{style:'currency',currency:state.currency,maximumFractionDigits:2}).format(value);
  }
  function setCurrency(cur){if(C[cur]){state.currency=cur;localStorage.setItem('brCurrency',cur)}}
  async function fetchRates(){
    if(state.currency==='INR'){state.rates.INR=1;return true}
    const cacheKey='brFX:'+state.currency;
    try{
      const cached=JSON.parse(localStorage.getItem(cacheKey)||'null');
      if(cached&&Date.now()-cached.saved<86400000){state.rates={INR:1,[state.currency]:cached.rate};state.date=cached.date;return true}
    }catch(_){}
    const controller=new AbortController(); const timer=setTimeout(()=>controller.abort(),5000);
    try{
      const q=encodeURIComponent(state.currency);
      const res=await fetch('https://api.frankfurter.dev/v2/rates?base=INR&quotes='+q,{signal:controller.signal,cache:'no-store'});
      const data=await res.json();
      clearTimeout(timer);
      const row=Array.isArray(data)?data.find(x=>x.quote===state.currency):null;
      if(!row||!Number(row.rate)) throw new Error('FX unavailable');
      state.rates={INR:1,[state.currency]:Number(row.rate)};state.date=row.date;
      localStorage.setItem(cacheKey,JSON.stringify({rate:Number(row.rate),date:row.date,saved:Date.now()}));
      return true;
    }catch(e){clearTimeout(timer);state.rates={INR:1};return false}
  }
  return {C,state,format,setCurrency,fetchRates}
})();

const DATA=[
{name:"Sugar",cat:"Grocery",u:"kg",retail:56.70,wholesale:5000,aliases:["shakkar"]},
{name:"Rice",cat:"Grocery",u:"kg",retail:46.43,wholesale:4159.92},
{name:"Wheat",cat:"Grocery",u:"kg",retail:31.90,wholesale:2763.48},
{name:"Atta",cat:"Grocery",u:"kg",retail:37.58,wholesale:3204.75},
{name:"Gram Dal",cat:"Pulses",u:"kg",retail:88.41,wholesale:8150},
{name:"Tur/Arhar Dal",cat:"Pulses",u:"kg",retail:125.18,wholesale:11200},
{name:"Urad Dal",cat:"Pulses",u:"kg",retail:122.89,wholesale:11000},
{name:"Moong Dal",cat:"Pulses",u:"kg",retail:112.05,wholesale:10000},
{name:"Masoor Dal",cat:"Pulses",u:"kg",retail:90.34,wholesale:8200},
{name:"Potato",cat:"Vegetables",u:"kg",retail:22.72,wholesale:1800},
{name:"Onion",cat:"Vegetables",u:"kg",retail:54.13,wholesale:4200},
{name:"Tomato",cat:"Vegetables",u:"kg",retail:39.49,wholesale:3100},
{name:"Groundnut Oil",cat:"Oil",u:"litre",retail:210.04,wholesale:19500},
{name:"Mustard Oil",cat:"Oil",u:"litre",retail:202.65,wholesale:18800},
{name:"Soya Oil",cat:"Oil",u:"litre",retail:167.11,wholesale:15500},
{name:"Sunflower Oil",cat:"Oil",u:"litre",retail:193.97,wholesale:18000},
{name:"Palm Oil",cat:"Oil",u:"litre",retail:153.61,wholesale:14200},
{name:"Milk",cat:"Dairy",u:"litre",retail:61.21},
{name:"Salt",cat:"Grocery",u:"kg",retail:22.34},
{name:"Tea",cat:"Grocery",u:"kg",retail:274.48}
];
const MODEL_MARKETS=[
{name:"Central Market",km:1.8,m:1.02},
{name:"Main Mandi",km:4.6,m:.92},
{name:"Station Road",km:3.2,m:1.04},
{name:"Neighbourhood Stores",km:.9,m:1.07}
];
let compares=[],basket=[];
const $=id=>document.getElementById(id);
const money=n=>"₹"+Number(n||0).toFixed(2);
function product(q){q=(q||"").toLowerCase().trim();return DATA.find(x=>x.name.toLowerCase()===q||x.name.toLowerCase().includes(q)||x.aliases?.includes(q))||null}
function norm(q,u){if(u==="g"||u==="ml")return q/1000;return q}
function unitPrice(price,qty,u){let n=norm(Number(qty),u);return n?price/n:0}
function go(name){document.querySelectorAll(".page").forEach(x=>x.classList.remove("active"));$("page-"+name).classList.add("active");document.querySelectorAll("nav button").forEach(x=>x.classList.toggle("active",x.dataset.page===name));window.scrollTo({top:0,behavior:"smooth"});if(name==="compare")renderCompare();if(name==="basket")renderBasket();if(name==="markets")renderMarkets();if(name==="report")renderReports();closeNav()}
function toggleNav(){$("nav").classList.toggle("open")}function closeNav(){$("nav").classList.remove("open")}
function heroCheck(){let s=$("heroSearch").value.trim();let m=s.match(/^(.+?)\s+₹\s*([\d.]+)/);if(m){$("cp").value=m[1];$("cprice").value=m[2]}else $("cp").value=s;go("check");if(m)checkPrice()}
function checkPrice(){
let p=product($("cp").value), price=+$("cprice").value, qty=+$("cqty").value||1,u=$("cunit").value;
if(!p||!price){$("checkResult").innerHTML='<div class="result bad">Enter a supported product and a price.</div>';return}
let entered=unitPrice(price,qty,u);let ref=p.retail;let pct=(entered-ref)/ref*100;let status=pct<=-5?"GOOD PRICE":pct>=5?"HIGH PRICE":"TYPICAL RANGE";let cls=status==="GOOD PRICE"?"good":status==="HIGH PRICE"?"bad":"warn";
$("checkResult").innerHTML=`<div class="result"><div class="small">${p.name} • official retail reference</div><div class="big">${money(entered)}/${p.u}</div><div class="status ${cls}">${status}</div><div class="statrow"><div class="stat"><span>Reference</span><b>${money(ref)}</b></div><div class="stat"><span>Difference</span><b>${money(entered-ref)}</b></div><div class="stat"><span>Compared with ref</span><b>${pct.toFixed(1)}%</b></div></div><p class="small">Reference date: 24 Sep 2026. This does not establish the exact local market price. Compare with a verified local observation before traveling.</p><div class="bar"><button class="primary" onclick='prefillCompare("${p.name}")'>Compare</button><button class="secondary" onclick='setAlert("${p.name}")'>Set alert</button></div></div>`
}
function prefillCompare(n){addCompare(n);go("compare")}
function setAlert(n){let target=prompt("Alert me when "+n+" is at or below ₹:");if(!target)return;let a=JSON.parse(localStorage.brA||"[]");a.push({product:n,target:+target,created:new Date().toISOString()});localStorage.brA=JSON.stringify(a);alert("Saved in this browser. A backend is needed for real notifications.");}
function addCompare(n=""){compares.push({name:n||"Sugar",price:"",qty:1,unit:"kg"});renderCompare()}
function renderCompare(){let el=$("compareRows");el.innerHTML=compares.map((r,i)=>`<div class="item"><div style="flex:1"><b>#${i+1}</b><div class="formgrid" style="grid-template-columns:1.2fr .8fr .7fr .8fr;margin-top:8px"><div class="field"><label>Product</label><input value="${r.name}" oninput="compares[${i}].name=this.value"></div><div class="field"><label>Price</label><input type="number" value="${r.price}" oninput="compares[${i}].price=this.value"></div><div class="field"><label>Qty</label><input type="number" value="${r.qty}" oninput="compares[${i}].qty=this.value"></div><div class="field"><label>Unit</label><select onchange="compares[${i}].unit=this.value"><option ${r.unit==="kg"?"selected":""}>kg</option><option ${r.unit==="g"?"selected":""}>g</option><option ${r.unit==="litre"?"selected":""}>litre</option><option ${r.unit==="ml"?"selected":""}>ml</option></select></div></div></div><button class="secondary" onclick="compares.splice(${i},1);renderCompare()">Remove</button></div>`).join("")||'<div class="empty">Add two or more products.</div>';if(compares.length)compareRun()}
function compareRun(){let rows=compares.map(r=>{let p=product(r.name),up=unitPrice(+r.price,+r.qty,r.unit);return p&&r.price?{name:p.name,entered:up,ref:p.retail,diff:up-p.retail}:null}).filter(Boolean);$("compareResult").innerHTML=rows.length?'<div class="result"><table class="table"><thead><tr><th>Product</th><th>Your unit price</th><th>Reference</th><th>Difference</th></tr></thead><tbody>'+rows.map(x=>`<tr><td>${x.name}</td><td>${money(x.entered)}</td><td>${money(x.ref)}</td><td class="${x.diff<=0?"good":"bad"}">${money(x.diff)}</td></tr>`).join("")+'</tbody></table></div>':""}
function calcUnit(){let r=unitPrice(+$("uprice").value,+$("uqty").value,$("uunit").value);$("ures").value=r?money(r):""}
function addBasket(n="Sugar"){basket.push({name:n,qty:1});renderBasket()}
function renderBasket(){let el=$("basketRows");el.innerHTML=basket.map((r,i)=>`<div class="item"><div style="flex:1"><b>${i+1}. ${r.name}</b><div class="formgrid" style="grid-template-columns:1fr .6fr;margin-top:8px"><div class="field"><label>Product</label><input value="${r.name}" oninput="basket[${i}].name=this.value"></div><div class="field"><label>Qty</label><input type="number" value="${r.qty}" oninput="basket[${i}].qty=+this.value||1"></div></div></div><button class="secondary" onclick="basket.splice(${i},1);renderBasket()">Remove</button></div>`).join("")||'<div class="empty">Add items to estimate a basket.</div>';if(basket.length)basketRun()}
function basketRun(){let sums=MODEL_MARKETS.map(m=>{let subtotal=basket.reduce((s,r)=>{let p=product(r.name);return s+(p?p.retail*m.m*(+r.qty||1):0)},0);let travel=m.km*2.5;return {...m,total:subtotal+travel,subtotal,travel}});let best=sums.slice().sort((a,b)=>a.total-b.total)[0];$("basketResult").innerHTML='<div class="result"><table class="table"><thead><tr><th>Modeled market</th><th>Items</th><th>Travel estimate</th><th>Total estimate</th></tr></thead><tbody>'+sums.map(x=>`<tr><td>${x.name}<div class="small">${x.km} km</div></td><td>${money(x.subtotal)}</td><td>${money(x.travel)}</td><td><b>${money(x.total)}</b></td></tr>`).join("")+'</tbody></table><p class="small">Modeled values are placeholders for the comparison workflow; use verified local observations in production.</p><div class="status good">Lowest modeled total: ${best.name} at ${money(best.total)}</div></div>'}
function renderMarkets(){let q=($("marketSearch").value||"").toLowerCase();let rows=DATA.filter(p=>p.name.toLowerCase().includes(q)).map(p=>`<tr><td><b>${p.name}</b><div class="small">${p.cat}</div></td><td>${money(p.retail)}/${p.u}</td><td>${money(p.retail*1.02)}/${p.u}</td><td>${money(p.retail*.92)}/${p.u}</td><td><button class="secondary" onclick='prefillCompare("${p.name}")'>Compare</button></td></tr>`).join("");$("marketTable").innerHTML=rows}
function mrpCheck(){let m=+$("mrp").value,c=+$("charged").value;if(!m||!c)return;$("mrpResult").innerHTML=`<div class="result ${c>m?"bad":"good"}"><b>${c>m?"Charged above printed MRP":"Charged price is not above printed MRP"}</b><div class="small">Difference: ${money(c-m)}. Applicability depends on the product/package and relevant rules.</div></div>`}
function costCheck(){let a=+$("baseCost").value||0,b=+$("extraCost").value||0;$("costResult").innerHTML=`<div class="result"><b>Real total: ${money(a+b)}</b><div class="small">Base ${money(a)} + extras ${money(b)}</div></div>`}
function receiptCheck(){let lines=$("receipt").value.split(/\n+/).map(x=>x.split("|").map(y=>y.trim())).filter(x=>x.length===3);let total=0;for(const [n,q,p] of lines)total+=(+q||0)*(+p||0);$("receiptResult").innerHTML=`<div class="result"><b>Calculated total: ${money(total)}</b><div class="small">${lines.length} lines parsed. Compare against the bill total.</div></div>`}
function shrinkCheck(){let op=unitPrice(+$("op").value,+$("oq").value,"kg"),np=unitPrice(+$("np").value,+$("nq").value,"kg");if(!op||!np)return;let ch=(np-op)/op*100;$("shrinkResult").innerHTML=`<div class="result ${ch>0?"bad":"good"}"><b>Effective unit-price change: ${ch.toFixed(1)}%</b><div class="small">Old unit price ${money(op)} • New unit price ${money(np)}</div></div>`}
function saveReport(){let p=$("rp").value.trim(),price=+$("rprice").value,q=+$("rqty").value||1,u=$("runit").value,m=$("rmarket").value.trim();if(!p||!price){$("reportResult").innerHTML='<div class="result bad">Enter product and price.</div>';return}let a=JSON.parse(localStorage.brR||"[]");a.unshift({product:p,price,qty:q,unit:u,market:m,time:new Date().toISOString()});localStorage.brR=JSON.stringify(a.slice(0,50));$("reportResult").innerHTML='<div class="result good"><b>Saved as a community observation.</b><div class="small">It is not official and should be verified before publishing as market data.</div></div>';renderReports()}
function renderReports(){let a=JSON.parse(localStorage.brR||"[]");$("savedReports").innerHTML=a.length?'<div class="list">'+a.map((x,i)=>`<div class="item"><div><b>${x.product}</b> • ${money(x.price)}/${x.unit}<div class="small">${x.market||"No market label"} • ${new Date(x.time).toLocaleString()}</div></div><button class="secondary" onclick="removeReport(${i})">Delete</button></div>`).join("")+'</div>':'<div class="empty">No saved local reports in this browser.</div>'}
function removeReport(i){let a=JSON.parse(localStorage.brR||"[]");a.splice(i,1);localStorage.brR=JSON.stringify(a);renderReports()}
function popular(){let items=["Sugar","Potato","Tomato","Onion","Rice","Mustard Oil"];$("popular").innerHTML=items.map(n=>{let p=product(n);return `<div class="item"><div><b>${n}</b><div class="small">Official retail reference</div></div><strong>${money(p.retail)}/${p.u}</strong><button class="secondary" onclick='prefillCompare("${n}")'>Compare</button></div>`}).join("")}
popular();compares=[{name:"Sugar",price:56.7,qty:1,unit:"kg"},{name:"Rice",price:46.43,qty:1,unit:"kg"}];basket=[{name:"Sugar",qty:1},{name:"Rice",qty:2}];renderCompare();

(()=> {
  'use strict';
  const BRUI=window.BRUI;
  const KNOWN={Sugar:56.70,Rice:46.43,Wheat:31.90,Atta:37.58,'Gram Dal':88.41,'Tur / Arhar Dal':125.18,'Urad Dal':122.89,'Moong Dal':112.05,'Masoor Dal':90.34,'Mustard Oil':202.65,'Sunflower Oil':193.97,'Soya Oil':167.11,Milk:61.21,Potato:22.72,Onion:54.13,Tomato:39.49,Salt:22.34,Banana:49.33};
  const LANG={
    en:{home:'Home',check:'Check price',compare:'Compare',basket:'Basket',markets:'Markets',tools:'Tools',report:'Report',learn:'How it works',title:'Know the price before you buy.',subtitle:'Price intelligence without promoted shopping.',ask:'Ask BuyRight AI',language:'Language',currency:'Currency'},
    hi:{home:'होम',check:'कीमत जाँचें',compare:'तुलना',basket:'बास्केट',markets:'बाज़ार',tools:'टूल्स',report:'रिपोर्ट',learn:'कैसे काम करता है',title:'खरीदने से पहले सही कीमत जानें।',subtitle:'बिना प्रमोशन के मूल्य जानकारी।',ask:'BuyRight AI से पूछें',language:'भाषा',currency:'मुद्रा'},
    es:{home:'Inicio',check:'Comprobar precio',compare:'Comparar',basket:'Cesta',markets:'Mercados',tools:'Herramientas',report:'Informar',learn:'Cómo funciona',title:'Conoce el precio antes de comprar.',subtitle:'Inteligencia de precios sin promociones.',ask:'Preguntar a BuyRight AI',language:'Idioma',currency:'Moneda'},
    fr:{home:'Accueil',check:'Vérifier le prix',compare:'Comparer',basket:'Panier',markets:'Marchés',tools:'Outils',report:'Signaler',learn:'Comment ça marche',title:'Connaissez le prix avant d’acheter.',subtitle:'Intelligence des prix sans promotion.',ask:'Demander à BuyRight AI',language:'Langue',currency:'Devise'},
    de:{home:'Start',check:'Preis prüfen',compare:'Vergleichen',basket:'Warenkorb',markets:'Märkte',tools:'Werkzeuge',report:'Melden',learn:'So funktioniert es',title:'Kenne den Preis vor dem Kauf.',subtitle:'Preisinformation ohne Werbung.',ask:'BuyRight AI fragen',language:'Sprache',currency:'Währung'},
    ar:{home:'الرئيسية',check:'فحص السعر',compare:'مقارنة',basket:'السلة',markets:'الأسواق',tools:'الأدوات',report:'إبلاغ',learn:'كيف يعمل',title:'اعرف السعر قبل الشراء.',subtitle:'تحليل أسعار بلا ترويج.',ask:'اسأل BuyRight AI',language:'اللغة',currency:'العملة'},
    bn:{home:'হোম',check:'দাম যাচাই',compare:'তুলনা',basket:'ঝুড়ি',markets:'বাজার',tools:'টুলস',report:'রিপোর্ট',learn:'কীভাবে কাজ করে',title:'কেনার আগে দাম জানুন।',subtitle:'কোনো প্রচার ছাড়া মূল্য বিশ্লেষণ।',ask:'BuyRight AI-কে জিজ্ঞেস করুন',language:'ভাষা',currency:'মুদ্রা'},
    pt:{home:'Início',check:'Ver preço',compare:'Comparar',basket:'Cesta',markets:'Mercados',tools:'Ferramentas',report:'Relatar',learn:'Como funciona',title:'Saiba o preço antes de comprar.',subtitle:'Inteligência de preços sem promoções.',ask:'Perguntar ao BuyRight AI',language:'Idioma',currency:'Moeda'}
  };
  const safe=(s)=>String(s??'').replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
  const langKey=()=>localStorage.getItem('brLang')||'en';
  const L=()=>LANG[langKey()]||LANG.en;
  const toast=(msg)=>{
    let t=document.getElementById('brToast');
    if(!t){t=document.createElement('div');t.id='brToast';t.className='br-toast';document.body.appendChild(t)}
    t.textContent=msg;t.classList.add('show');clearTimeout(t._t);t._t=setTimeout(()=>t.classList.remove('show'),2400);
  };
  function translate(){
    const l=L();
    const maps={Home:l.home,'Check price':l.check,'Compare':l.compare,'Basket':l.basket,'Markets':l.markets,'Tools':l.tools,'Report':l.report,'How it works':l.learn,'Know the price before you buy.':l.title,'Price intelligence without promoted shopping.':l.subtitle};
    document.querySelectorAll('nav button,.brand strong,.hero h1,.hero p').forEach(el=>{
      const original=el.dataset.brOriginal||el.textContent.trim();
      el.dataset.brOriginal=original;
      if(maps[original]) el.textContent=maps[original];
    });
    const ai=document.getElementById('brAIButton'); if(ai) ai.textContent='✦ '+l.ask;
    const lb=document.getElementById('brLangLabel');if(lb)lb.textContent=l.language;
    const cb=document.getElementById('brCurLabel');if(cb)cb.textContent=l.currency;
    document.documentElement.lang=langKey();
    document.documentElement.dir=langKey()==='ar'?'rtl':'ltr';
  }
  async function refresh(){
    await BRUI.fetchRates();
    window.dispatchEvent(new Event('hashchange'));
    setTimeout(()=>{translate();decorate();},30);
  }
  function initControls(){
    if(document.getElementById('brControls')) return;
    const nav=document.querySelector('.nav');
    if(!nav) return;
    const box=document.createElement('div');box.id='brControls';box.className='br-controls';
    box.innerHTML='<span class="br-status" id="brNet">● online</span><select id="brLang" aria-label="Language"><option value="en">EN</option><option value="hi">HI</option><option value="es">ES</option><option value="fr">FR</option><option value="de">DE</option><option value="ar">AR</option><option value="bn">BN</option><option value="pt">PT</option></select><select id="brCur" aria-label="Currency"></select><button id="brAIButton" class="br-ai-btn">✦ Ask BuyRight AI</button></div>';
    const ham=nav.querySelector('.hamb'); if(ham) nav.insertBefore(box,ham); else nav.appendChild(box);
    const cur=document.getElementById('brCur');
    Object.keys(BRUI.C).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k+' '+BRUI.C[k].symbol;cur.appendChild(o)});
    document.getElementById('brLang').value=langKey();cur.value=BRUI.state.currency;
    document.getElementById('brLang').onchange=e=>{localStorage.setItem('brLang',e.target.value);translate();toast('Language changed')};
    cur.onchange=async e=>{BRUI.setCurrency(e.target.value);toast('Updating currency…');await refresh();};
    document.getElementById('brAIButton').onclick=openAI;
    updateNet();
    addEventListener('online',updateNet);addEventListener('offline',updateNet);
  }
  function updateNet(){const el=document.getElementById('brNet');if(!el)return;el.textContent=navigator.onLine?'● online':'● offline';el.classList.toggle('offline',!navigator.onLine)}
  function openAI(){
    let m=document.getElementById('brAIModal');
    if(!m){
      m=document.createElement('div');m.id='brAIModal';m.className='br-modal';
      m.innerHTML='<div class="br-dialog"><button class="br-x" id="brClose">×</button><div class="br-ai-kicker">BUYRIGHT AI · LOCAL REASONING</div><h2>Tell me the buying problem.</h2><p class="muted">No paid AI API is required. This first layer runs locally and routes you to the right BuyRight tool. Optional server AI can be connected later.</p><div class="br-ai-input"><input id="brAsk" placeholder="“Sugar ₹60/kg — is that high?”"><button id="brAskRun" class="btn">Analyze ↗</button></div><div id="brAIOut" class="br-ai-out"></div><div class="br-suggestions"><button data-q="Sugar ₹60/kg">Sugar ₹60/kg</button><button data-q="Compare 1 kg and 2 kg packs">Compare packs</button><button data-q="Is ₹50 above MRP?">MRP check</button><button data-q="Optimize my basket">Basket</button></div></div>';
      document.body.appendChild(m);document.getElementById('brClose').onclick=()=>m.classList.remove('show');m.addEventListener('click',e=>{if(e.target===m)m.classList.remove('show')});
      document.getElementById('brAskRun').onclick=()=>runAI(document.getElementById('brAsk').value);
      m.querySelectorAll('[data-q]').forEach(b=>b.onclick=()=>{document.getElementById('brAsk').value=b.dataset.q;runAI(b.dataset.q)});
    }
    m.classList.add('show');setTimeout(()=>document.getElementById('brAsk').focus(),30);
  }
  function findKnown(text){const lo=text.toLowerCase();return Object.keys(KNOWN).sort((a,b)=>b.length-a.length).find(k=>lo.includes(k.toLowerCase()))}
  function parseAmount(text){const m=text.match(/(?:₹|rs\.?|usd|\$|€|eur|£|gbp|aed)\s*([0-9]+(?:\.[0-9]+)?)/i);return m?Number(m[1]):null}
  function routeCheck(product,amount,unit='kg'){
    location.hash='check';
    setTimeout(()=>{const p=document.getElementById('cp'),v=document.getElementById('cx'),q=document.getElementById('cq');if(p)p.value=product;if(v&&amount!=null)v.value=amount;if(q)q.value=1;const run=document.getElementById('run');if(run)run.click()},120);
  }
  function runAI(raw){
    const text=String(raw||'').trim(), out=document.getElementById('brAIOut');if(!out)return;
    if(!text){out.innerHTML='<div class="empty">Describe the price problem in a sentence.</div>';return}
    const lo=text.toLowerCase(),amount=parseAmount(text),known=findKnown(text);
    if(/mrp|printed price|maximum retail/.test(lo)){out.innerHTML='<div class="callout"><b>MRP route</b><p>Use the MRP checker with the printed MRP and the amount actually charged. Applicability depends on the package/product and relevant rules.</p><button class="btn alt" onclick="location.hash=\'tools\'">Open MRP checker →</button></div>';return}
    if(/basket|shopping list|grocer(y|ies)|whole trip/.test(lo)){out.innerHTML='<div class="callout"><b>Basket optimizer</b><p>Add the items and quantities. BuyRight compares the modeled basket totals and can later use verified local observations.</p><button class="btn alt" onclick="location.hash=\'basket\'">Open basket →</button></div>';return}
    if(/compare|pack|cheaper/.test(lo)){out.innerHTML='<div class="callout"><b>Unit-price comparison</b><p>Enter the prices and quantities. The tool compares normalized unit cost instead of sticker price.</p><button class="btn alt" onclick="location.hash=\'compare\'">Open compare →</button></div>';return}
    if(known&&amount!=null){
      const ref=KNOWN[known],pct=(amount-ref)/ref*100,st=pct<=-5?'GOOD PRICE':pct>=5?'HIGH PRICE':'TYPICAL RANGE',cls=pct<=-5?'good':pct>=5?'high':'normal';
      out.innerHTML='<div class="result"><div class="split"><div><div class="muted">'+safe(known)+' reference</div><div class="big">'+BRUI.format(amount)+'/kg</div></div><span class="status '+cls+'">'+st+'</span></div><div class="kpi"><div class="card"><strong>'+BRUI.format(ref)+'</strong><span class="muted small">reference</span></div><div class="card"><strong>'+pct.toFixed(1)+'%</strong><span class="muted small">vs reference</span></div></div><p class="small muted">This is a local decision aid using the visible official snapshot. It is not a live quote for every shop.</p><div class="actions"><button class="btn" id="brOpenCheck">Open full check</button></div></div>';
      document.getElementById('brOpenCheck').onclick=()=>{document.getElementById('brAIModal').classList.remove('show');routeCheck(known,amount)};
      return
    }
    out.innerHTML='<div class="callout"><b>I can route that.</b><p>Try a specific product and price, for example <b>“Tomato ₹45/kg”</b>, or say <b>compare packs</b>, <b>MRP</b> or <b>shopping list</b>.</p></div>';
  }
  function addToolCard(){
    const app=document.getElementById('app');if(!app||location.hash.slice(1)!=='tools'||document.getElementById('brAdvancedTools'))return;
    const wrap=document.createElement('section');wrap.id='brAdvancedTools';wrap.className='section br-advanced';
    wrap.innerHTML='<div class="title"><div><h2>Advanced free tools</h2><p class="muted">Optional public services only. Every network request has a timeout and a safe fallback.</p></div></div><div class="grid g2"><div class="card panel"><h3>Global currency converter</h3><p class="small muted">Daily reference rates · no API key.</p><div class="form"><div class="group"><label>Amount INR</label><input id="brFxAmount" class="input" type="number" value="1000"></div><div class="group"><label>Target</label><select id="brFxCur" class="select"></select></div></div><button class="btn" id="brFxRun">Convert</button><div id="brFxOut" style="margin-top:10px"></div></div><div class="card panel"><h3>Barcode / product lookup</h3><p class="small muted">On-demand Open Food Facts lookup for product metadata; price is still market-specific.</p><div class="form"><div class="group full"><label>Barcode</label><input id="brBarcode" class="input" inputmode="numeric" placeholder="e.g. 3017624010701"></div></div><div class="actions"><button class="btn" id="brLookup">Lookup</button><label class="btn alt" for="brPhoto">Scan photo</label><input id="brPhoto" type="file" accept="image/*" capture="environment" hidden></div><div id="brProductOut"></div></div></div>';
    app.appendChild(wrap);
    const cur=document.getElementById('brFxCur');Object.keys(BRUI.C).forEach(k=>{const o=document.createElement('option');o.value=k;o.textContent=k+' '+BRUI.C[k].symbol;cur.appendChild(o)});cur.value=BRUI.state.currency;
    document.getElementById('brFxRun').onclick=async()=>{const amount=Number(document.getElementById('brFxAmount').value)||0;BRUI.setCurrency(cur.value);const ok=await BRUI.fetchRates();document.getElementById('brFxOut').innerHTML='<div class="callout"><b>'+BRUI.format(amount)+'</b><div class="small muted">'+(ok?'Exchange-rate source: Frankfurter · date '+(BRUI.state.date||'latest'):'Offline fallback: no live rate available')+'</div></div>'};
    document.getElementById('brLookup').onclick=()=>lookupBarcode(document.getElementById('brBarcode').value);
    document.getElementById('brPhoto').onchange=e=>scanBarcode(e.target.files&&e.target.files[0]);
  }
  async function lookupBarcode(code){
    code=String(code||'').replace(/\D/g,'');const out=document.getElementById('brProductOut');if(!out)return;
    if(!/^\d{8,14}$/.test(code)){out.innerHTML='<div class="callout bad">Enter a valid-looking 8–14 digit barcode.</div>';return}
    out.innerHTML='<div class="empty">Looking up product metadata…</div>';
    const c=new AbortController();const t=setTimeout(()=>c.abort(),6000);
    try{const res=await fetch('https://world.openfoodfacts.org/api/v2/product/'+encodeURIComponent(code)+'?fields=product_name,brands,quantity,categories,image_front_url',{signal:c.signal});clearTimeout(t);const d=await res.json();if(!d||d.status!==1){out.innerHTML='<div class="callout warn">Barcode not found in the public product database.</div>';return}const p=d.product||{};out.innerHTML='<div class="result"><div class="split"><div><b>'+safe(p.product_name||'Unnamed product')+'</b><div class="small muted">'+safe(p.brands||'')+'</div><div class="small">'+safe(p.quantity||'')+'</div></div>'+(p.image_front_url?'<img src="'+safe(p.image_front_url)+'" alt="" style="width:72px;height:72px;object-fit:cover;border-radius:12px">':'')+'</div><p class="small muted">Metadata source: Open Food Facts. This does not establish a local selling price.</p></div>'}catch(e){clearTimeout(t);out.innerHTML='<div class="callout warn">Lookup unavailable right now. You can still use the price tools offline.</div>'}
  }
  async function scanBarcode(file){
    if(!file)return;
    if(!('BarcodeDetector' in window)){toast('Barcode scan is not available in this browser; use the barcode box.');return}
    try{const bmp=await createImageBitmap(file);const det=new BarcodeDetector({formats:['ean_13','ean_8','upc_a','upc_e','code_128']});const found=await det.detect(bmp);bmp.close();if(!found.length){toast('No supported barcode detected.');return}document.getElementById('brBarcode').value=found[0].rawValue;lookupBarcode(found[0].rawValue)}catch(e){toast('Could not read that image.')}
  }
  function decorate(){
    initControls();translate();addToolCard();
    document.querySelectorAll('.card,.hero,.heroCard,.section,.toolgrid,.feature').forEach(el=>{if(!el.classList.contains('br-animated')){el.classList.add('br-animated');}});
    document.querySelectorAll('button').forEach(b=>{if(!b.dataset.brBound){b.dataset.brBound='1';b.addEventListener('pointerdown',()=>{b.classList.add('br-press');setTimeout(()=>b.classList.remove('br-press'),180)})}});
  }
  function particles(){
    if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
    const canvas=document.createElement('canvas');canvas.id='brParticles';document.body.prepend(canvas);const ctx=canvas.getContext('2d');let w=canvas.width=innerWidth,h=canvas.height=innerHeight;let pts=Array.from({length:38},()=>({x:Math.random()*w,y:Math.random()*h,vx:(Math.random()-.5)*.25,vy:(Math.random()-.5)*.25,r:Math.random()*1.5+.4}));
    addEventListener('resize',()=>{w=canvas.width=innerWidth;h=canvas.height=innerHeight});
    function tick(){if(document.hidden){requestAnimationFrame(tick);return}ctx.clearRect(0,0,w,h);for(const p of pts){p.x+=p.vx;p.y+=p.vy;if(p.x<0||p.x>w)p.vx*=-1;if(p.y<0||p.y>h)p.vy*=-1;ctx.fillStyle='rgba(22,124,84,.18)';ctx.beginPath();ctx.arc(p.x,p.y,p.r,0,Math.PI*2);ctx.fill()}requestAnimationFrame(tick)}tick();
    let glow=document.querySelector('.cursor-glow');if(!glow){glow=document.createElement('div');glow.className='cursor-glow';document.body.appendChild(glow);document.addEventListener('pointermove',e=>{glow.style.transform='translate3d('+(e.clientX-120)+'px,'+(e.clientY-120)+'px,0)'},{passive:true})}
  }
  function observe(){
    const app=document.getElementById('app');if(!app)return;
    const io=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('in');io.unobserve(e.target)}}),{threshold:.08});
    new MutationObserver(()=>{decorate();document.querySelectorAll('.br-animated:not(.in)').forEach(x=>io.observe(x))}).observe(app,{childList:true,subtree:true});
    decorate();document.querySelectorAll('.br-animated:not(.in)').forEach(x=>io.observe(x));
  }
  function pwa(){if('serviceWorker' in navigator)navigator.serviceWorker.register('./sw.js').catch(()=>{});}
  addEventListener('load',()=>{pwa();particles();observe();refresh()});
  addEventListener('hashchange',()=>setTimeout(()=>{decorate()},40));
  addEventListener('error',e=>{if(!document.hidden)toast('A small UI error was recovered. Your data stays local.');});
  addEventListener('unhandledrejection',()=>toast('A network feature failed safely; offline tools remain available.'));
})();
