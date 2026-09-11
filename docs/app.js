/* G30 Twenties — catalog logic.
   Data lives in wheels-data.js (window.WHEELS).
   body[data-page] selects the subset: "g30" (sets with a G30 photo),
   "more" (everything else), "all" (single-page build). */

const STYLES = ["All","OEM+","Motorsport","Concave","Classic","Luxury"];
const BUDGETS = [
  {label:"All", test:()=>true},
  {label:"< €1.500", test:m=>m<1500},
  {label:"€1.500–2.500", test:m=>m>=1500&&m<2500},
  {label:"€2.500–3.500", test:m=>m>=2500&&m<3500},
  {label:"> €3.500", test:m=>m>=3500}
];
const mid = w => (w.price[0]+w.price[1])/2;
const tier = w => { const m=mid(w); return m<1500?"€":m<2500?"€€":m<3500?"€€€":"€€€€"; };
const fmt = n => "€ " + n.toLocaleString("nl-NL");
const hasG30Photo = w => !!((w.photo && w.photo.isG30) || (w.photoLinks && w.photoLinks.some(l=>l.isG30)));
const esc = s => String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/"/g,"&quot;");

/* ================= Hero showcase: real G30 photos, rotating ================= */
const HERO = WHEELS.filter(w => w.photo && w.photo.isG30);
const REDUCED = window.matchMedia && window.matchMedia("(prefers-reduced-motion: reduce)").matches;
const HERO_MS = 6000;
let heroIdx = 0, heroTimer = null, heroLayer = 0, heroBusy = false;

function heroLabel(w){
  const p=w.photo;
  return (p.car||"BMW G30") + (p.size ? " · " + p.size : "");
}
function showHero(i){
  const wrap=document.getElementById("heroshow");
  if(!wrap || !HERO.length || heroBusy) return;
  i=(i+HERO.length)%HERO.length;
  const w=HERO[i], layers=wrap.querySelectorAll("img.slide");
  const next=layers[1-heroLayer], cur=layers[heroLayer];
  heroBusy=true;
  const done=()=>{
    next.classList.add("on"); cur.classList.remove("on");
    heroLayer=1-heroLayer; heroIdx=i; heroBusy=false;
    document.getElementById("hero-title").textContent=w.brand+" "+w.model;
    document.getElementById("hero-meta").innerHTML=esc(heroLabel(w))+
      ' · photo via <a href="'+esc(w.photo.creditUrl)+'" target="_blank" rel="noopener">'+esc(w.photo.creditName)+'</a>';
    wrap.querySelectorAll(".herodots button").forEach((b,bi)=>b.setAttribute("aria-selected", bi===i?"true":"false"));
  };
  next.onload=done;
  next.onerror=()=>{ heroBusy=false; if(HERO.length>1) showHero(i+1); };
  next.alt=w.brand+" "+w.model+" on a "+(w.photo.car||"BMW G30");
  next.src=w.photo.src;
  if(next.complete && next.naturalWidth>0) done();
}
function startHero(){
  if(REDUCED || HERO.length<2) return;
  stopHero(); heroTimer=setInterval(()=>showHero(heroIdx+1), HERO_MS);
}
function stopHero(){ if(heroTimer){ clearInterval(heroTimer); heroTimer=null; } }
function buildHero(){
  const wrap=document.getElementById("heroshow");
  if(!wrap) return;
  if(!HERO.length){ wrap.remove(); return; }
  wrap.innerHTML=`
    <img class="slide" alt="" referrerpolicy="no-referrer" decoding="async">
    <img class="slide" alt="" referrerpolicy="no-referrer" decoding="async">
    <div class="herocap"><span class="fl">Seen on a G30</span><strong id="hero-title"></strong><span id="hero-meta"></span></div>
    <div class="herodots" role="tablist" aria-label="Showcase photos">${HERO.map((w,i)=>
      `<button role="tab" aria-selected="false" aria-label="${esc(w.brand+" "+w.model)}" data-i="${i}"></button>`).join("")}</div>`;
  wrap.querySelectorAll(".herodots button").forEach(b=>b.addEventListener("click",()=>{ showHero(+b.dataset.i); startHero(); }));
  wrap.addEventListener("mouseenter", stopHero);
  wrap.addEventListener("mouseleave", startHero);
  // preload the next slide so the crossfade never waits on the network
  wrap.addEventListener("transitionend", ()=>{ const n=HERO[(heroIdx+1)%HERO.length]; if(n){ const im=new Image(); im.referrerPolicy="no-referrer"; im.src=n.photo.src; } });
  heroIdx=Math.floor(Math.random()*HERO.length);
  showHero(heroIdx);
  startHero();
}
function jumpHero(w){
  const i=HERO.indexOf(w);
  if(i<0) return;
  showHero(i); startHero();
  const wrap=document.getElementById("heroshow");
  if(wrap) wrap.scrollIntoView({behavior:"smooth",block:"center"});
}

/* ================= Cards & filters ================= */
const PAGE=document.body.dataset.page||"all";
const state={style:"All", budget:0, sort:"featured", q:""};
const grid=document.getElementById("grid");

function pageSubset(){
  if(PAGE==="g30") return WHEELS.filter(hasG30Photo);
  if(PAGE==="more") return WHEELS.filter(w=>!hasG30Photo(w));
  return [...WHEELS].sort((a,b)=>hasG30Photo(b)-hasG30Photo(a));
}

function noPhotoHTML(){
  return `<div class="nophoto"><span>No real photo yet</span><small>only configurator renders exist — see the links below</small></div>`;
}
function stageHTML(w){
  if(!w.photo) return noPhotoHTML();
  const p=w.photo;
  const label=(p.isG30?"On a G30":"On: "+(p.car||"another car"))+(p.size?" · "+p.size:"");
  return `<img class="photo" src="${esc(p.src)}" alt="${esc(w.brand+" "+w.model+" mounted on "+(p.car||"a car"))}"
    loading="lazy" decoding="async" referrerpolicy="no-referrer">
  <span class="shownchip">${esc(label)}</span>`;
}
function creditLine(w){
  if(!w.photo) return "";
  return `<p class="photocredit">Photo via <a href="${esc(w.photo.creditUrl)}" target="_blank" rel="noopener">${esc(w.photo.creditName)}</a></p>`;
}
function photoLinksRow(w){
  if(!w.photoLinks || !w.photoLinks.length) return "";
  return `<div class="plinks"><span class="fl">Real photos</span>${w.photoLinks.map(l=>
    `<a class="plink${l.isG30?" g30":""}" href="${esc(l.url)}" target="_blank" rel="noopener">${esc(l.label)}&nbsp;&nearr;</a>`).join("")}</div>`;
}

function cardHTML(w){
  const specs=[["Front",w.front],["Rear",w.rear],["Construction",w.construction],["Weight / wheel",w.weight],["Tires",w.tires],["Set of 4",fmt(w.price[0])+" – "+fmt(w.price[1])]];
  const inHero=HERO.includes(w);
  return `
  <article class="card" data-id="${w.id}">
    <div class="stage">${stageHTML(w)}</div>
    <div class="card-body">
      ${creditLine(w)}
      <div class="brandline"><span class="brand">${esc(w.brand)}</span><span class="tierchip" title="Price tier">${tier(w)}</span></div>
      <h2 class="model">${esc(w.model)}</h2>
      <p class="blurb">${w.blurb}</p>
      <div class="finishes">
        <span class="fl">Finish</span>
        ${w.finishes.map((f,fi)=>`<button class="dot" style="background:${f.face}" data-fi="${fi}" aria-pressed="${fi===0}" title="${esc(f.name)}" aria-label="${esc(f.name)}"></button>`).join("")}
        <span class="fname">${esc(w.finishes[0].name)}</span>
      </div>
      <div class="specs">${specs.map(s=>`<div class="spec"><div class="k">${s[0]}</div><div class="v">${s[1]}</div></div>`).join("")}</div>
      <div class="tags">${w.styles.map(s=>`<span class="tag">${s}</span>`).join("")}</div>
      ${photoLinksRow(w)}
      <div class="pricerow">
        <span class="price">${fmt(w.price[0])} – ${fmt(w.price[1])} <small>/ set</small></span>
      </div>
      <p class="pricenote">${w.priceNote}</p>
      <div class="cert ${w.cert.t}"><span class="b"></span><span>${w.cert.txt}</span></div>
      <div class="actions">
        ${inHero?`<button class="btn primary seehero">See in showcase</button>`:""}
        <a class="btn${inHero?"":" primary"}" href="${esc(w.url)}" target="_blank" rel="noopener">Brand site&nbsp;&nearr;</a>
      </div>
    </div>
  </article>`;
}

function visibleWheels(){
  const q=state.q.trim().toLowerCase();
  let list=pageSubset().filter(w=>
    (state.style==="All"||w.styles.includes(state.style)) &&
    BUDGETS[state.budget].test(mid(w)) &&
    (!q || (w.brand+" "+w.model).toLowerCase().includes(q)));
  if(state.sort==="price-asc") list=[...list].sort((a,b)=>mid(a)-mid(b));
  if(state.sort==="price-desc") list=[...list].sort((a,b)=>mid(b)-mid(a));
  if(state.sort==="name") list=[...list].sort((a,b)=>(a.brand+a.model).localeCompare(b.brand+b.model));
  return list;
}

function wireCard(card){
  const w=WHEELS.find(x=>x.id===card.dataset.id);
  const img=card.querySelector("img.photo");
  if(img){
    img.addEventListener("error",()=>{
      const stage=card.querySelector(".stage");
      stage.innerHTML=noPhotoHTML();
      const credit=card.querySelector(".photocredit"); if(credit) credit.remove();
    });
  }
  card.querySelectorAll(".dot").forEach(dot=>{
    dot.addEventListener("click",()=>{
      card.querySelectorAll(".dot").forEach(d=>d.setAttribute("aria-pressed", d===dot ? "true":"false"));
      card.querySelector(".fname").textContent=w.finishes[+dot.dataset.fi].name;
    });
  });
  const see=card.querySelector(".seehero");
  if(see) see.addEventListener("click",()=>jumpHero(w));
}

function render(){
  const list=visibleWheels();
  grid.innerHTML=list.map(cardHTML).join("");
  document.getElementById("empty").hidden=list.length>0;
  document.getElementById("count").textContent=list.length+" of "+pageSubset().length+" sets";
  grid.querySelectorAll(".card").forEach(wireCard);
}

function buildChips(el, labels, get, set){
  labels.forEach((label,i)=>{
    const b=document.createElement("button");
    b.className="chip"; b.textContent=label;
    b.setAttribute("aria-pressed", get()===i?"true":"false");
    b.addEventListener("click",()=>{
      set(i);
      el.querySelectorAll(".chip").forEach((c,ci)=>c.setAttribute("aria-pressed", ci===get()?"true":"false"));
      render();
    });
    el.appendChild(b);
  });
}
buildChips(document.getElementById("style-chips"), STYLES,
  ()=>STYLES.indexOf(state.style), i=>state.style=STYLES[i]);
buildChips(document.getElementById("budget-chips"), BUDGETS.map(b=>b.label),
  ()=>state.budget, i=>state.budget=i);
document.getElementById("sort").addEventListener("change",e=>{state.sort=e.target.value;render();});
const search=document.getElementById("search");
if(search) search.addEventListener("input",e=>{state.q=e.target.value;render();});

buildHero();
render();
