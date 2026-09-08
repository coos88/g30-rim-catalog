/* G30 Twenties — catalog logic & wheel renderer.
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

/* ================= Wheel renderer ================= */
function shade(hex, amt){
  const n=parseInt(hex.slice(1),16);
  let r=(n>>16)+amt, g=((n>>8)&255)+amt, b=(n&255)+amt;
  r=Math.max(0,Math.min(255,r)); g=Math.max(0,Math.min(255,g)); b=Math.max(0,Math.min(255,b));
  return "rgb("+r+","+g+","+b+")";
}
function lipColors(kind, face){
  if(kind==="bright") return ["#e8eaee","#8a9099"];
  if(kind==="metal")  return [shade(face,60), shade(face,-20)];
  return ["#3a3e46","#1a1c20"]; // dark
}
function spokeGrad(ctx, r0, r1, a, face){
  const g=ctx.createLinearGradient(r0*Math.sin(a), -r0*Math.cos(a), r1*Math.sin(a), -r1*Math.cos(a));
  g.addColorStop(0, shade(face,-30));
  g.addColorStop(.55, face);
  g.addColorStop(1, shade(face,25));
  return g;
}
function taperedSpoke(ctx, r0, r1, a, hw0, hw1, bow){
  const P=(r,da)=>[r*Math.sin(a+da), -r*Math.cos(a+da)];
  const rm=(r0+r1)/2, hwm=(hw0+hw1)/2;
  let p;
  ctx.beginPath();
  p=P(r0,-hw0); ctx.moveTo(p[0],p[1]);
  p=P(rm,-hwm+bow); const e1=P(r1,-hw1); ctx.quadraticCurveTo(p[0],p[1],e1[0],e1[1]);
  const e2=P(r1,hw1); ctx.lineTo(e2[0],e2[1]);
  p=P(rm,hwm+bow); const e3=P(r0,hw0); ctx.quadraticCurveTo(p[0],p[1],e3[0],e3[1]);
  ctx.closePath();
}
function strokeBeveled(ctx, x0,y0,x1,y1, w, face){
  ctx.lineCap="round";
  ctx.strokeStyle=shade(face,-35); ctx.lineWidth=w;
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
  ctx.strokeStyle=shade(face,10); ctx.lineWidth=w*.55;
  ctx.beginPath(); ctx.moveTo(x0,y0); ctx.lineTo(x1,y1); ctx.stroke();
}
function drawWheelAt(ctx, cx, cy, R, cfg, face){
  ctx.save();
  ctx.translate(cx,cy);
  const rimR=R*.80, faceR=rimR*.93, hubR=R*.105, r0=R*.16;

  // tire
  ctx.beginPath(); ctx.arc(0,0,R,0,7); ctx.fillStyle="#0c0e11"; ctx.fill();
  ctx.beginPath(); ctx.arc(0,0,R*.905,0,7);
  ctx.strokeStyle="rgba(255,255,255,.05)"; ctx.lineWidth=R*.09; ctx.stroke();

  // rim lip
  const [l1,l2]=lipColors(cfg.lip,face);
  const lg=ctx.createLinearGradient(-rimR,-rimR,rimR,rimR);
  lg.addColorStop(0,l1); lg.addColorStop(.5,l2); lg.addColorStop(1,shade(face,-10));
  ctx.beginPath(); ctx.arc(0,0,rimR,0,7); ctx.fillStyle=lg; ctx.fill();

  // barrel
  const bg=ctx.createRadialGradient(0,0,faceR*.2,0,0,faceR);
  bg.addColorStop(0,"#101216"); bg.addColorStop(1,"#181b20");
  ctx.beginPath(); ctx.arc(0,0,faceR,0,7); ctx.fillStyle=bg; ctx.fill();

  // spokes
  const n=cfg.count, slot=Math.PI/n, bow=(cfg.curve||0);
  for(let i=0;i<n;i++){
    const a=i*2*Math.PI/n;
    const g=spokeGrad(ctx,r0,faceR,a,face);
    if(cfg.style==="twin"||cfg.style==="double"){
      const off=slot*cfg.width*.52, hw=slot*cfg.width*.34;
      for(const s of [-1,1]){
        taperedSpoke(ctx,r0,faceR,a+s*off, hw*.9, hw, bow);
        ctx.fillStyle=g; ctx.fill();
        ctx.strokeStyle="rgba(0,0,0,.28)"; ctx.lineWidth=1; ctx.stroke();
      }
    } else if(cfg.style==="multi"||cfg.style==="five"){
      taperedSpoke(ctx,r0,faceR,a, slot*cfg.width*.75, slot*cfg.width*.55, bow);
      ctx.fillStyle=g; ctx.fill();
      ctx.strokeStyle="rgba(0,0,0,.28)"; ctx.lineWidth=1; ctx.stroke();
    } else if(cfg.style==="directional"){
      taperedSpoke(ctx,r0,faceR,a, slot*cfg.width*.85, slot*cfg.width*.4, bow);
      ctx.fillStyle=g; ctx.fill();
      ctx.strokeStyle="rgba(0,0,0,.28)"; ctx.lineWidth=1; ctx.stroke();
    } else if(cfg.style==="y"){
      const w=R*cfg.width*.14, rm=faceR*.52, d=slot*.62;
      const S=(r,da)=>[r*Math.sin(a+da),-r*Math.cos(a+da)];
      const h=S(r0,0), m=S(rm,0), a1=S(faceR,-d), a2=S(faceR,d);
      strokeBeveled(ctx,h[0],h[1],m[0],m[1],w*1.25,face);
      strokeBeveled(ctx,m[0],m[1],a1[0],a1[1],w,face);
      strokeBeveled(ctx,m[0],m[1],a2[0],a2[1],w,face);
    } else if(cfg.style==="mesh"){
      const w=R*cfg.width*.12, d=slot*1.35;
      const S=(r,da)=>[r*Math.sin(a+da),-r*Math.cos(a+da)];
      const h=S(r0,0), b1=S(faceR,-d), b2=S(faceR,d);
      strokeBeveled(ctx,h[0],h[1],b1[0],b1[1],w,face);
      strokeBeveled(ctx,h[0],h[1],b2[0],b2[1],w,face);
    }
  }

  // concave shading
  const cc=ctx.createRadialGradient(0,0,r0*.5,0,0,faceR);
  cc.addColorStop(0,"rgba(0,0,0,"+(0.55*(cfg.concave||0)).toFixed(3)+")");
  cc.addColorStop(1,"rgba(0,0,0,0)");
  ctx.beginPath(); ctx.arc(0,0,faceR,0,7); ctx.fillStyle=cc; ctx.fill();

  // hub + bolts + cap
  ctx.beginPath(); ctx.arc(0,0,r0*.95,0,7); ctx.fillStyle=shade(face,-15); ctx.fill();
  ctx.strokeStyle="rgba(0,0,0,.35)"; ctx.lineWidth=1; ctx.stroke();
  for(let i=0;i<5;i++){
    const a=i*2*Math.PI/5 - Math.PI/2;
    ctx.beginPath(); ctx.arc(R*.125*Math.cos(a), R*.125*Math.sin(a), R*.02,0,7);
    ctx.fillStyle="#0d0f12"; ctx.fill();
    ctx.strokeStyle="rgba(255,255,255,.18)"; ctx.lineWidth=.8; ctx.stroke();
  }
  ctx.beginPath(); ctx.arc(0,0,hubR*.62,0,7);
  ctx.fillStyle="#15171b"; ctx.fill();
  ctx.strokeStyle=shade(face,30); ctx.lineWidth=1.2; ctx.stroke();

  // sheen
  ctx.save();
  ctx.beginPath(); ctx.arc(0,0,rimR,0,7); ctx.clip();
  const sg=ctx.createLinearGradient(-R,-R,R*.6,R*.6);
  sg.addColorStop(0,"rgba(255,255,255,.14)");
  sg.addColorStop(.45,"rgba(255,255,255,0)");
  ctx.fillStyle=sg; ctx.fillRect(-R,-R,2*R,2*R);
  ctx.restore();

  ctx.restore();
}
function drawCardWheel(canvas, cfg, face){
  const ctx=canvas.getContext("2d");
  const W=canvas.width, H=canvas.height;
  ctx.clearRect(0,0,W,H);
  const R=H*.375, cx=W/2, cy=H*.47;
  ctx.save();
  ctx.translate(cx, cy+R*1.06); ctx.scale(1,.13);
  const sh=ctx.createRadialGradient(0,0,0,0,0,R*.95);
  sh.addColorStop(0,"rgba(0,0,0,.5)"); sh.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=sh; ctx.beginPath(); ctx.arc(0,0,R*.95,0,7); ctx.fill();
  ctx.restore();
  drawWheelAt(ctx,cx,cy,R,cfg,face);
}

/* ================= Hero car ================= */
function smoothPath(ctx, pts){
  ctx.beginPath();
  ctx.moveTo(pts[0][0], pts[0][1]);
  for(let i=1;i<pts.length-1;i++){
    const xc=(pts[i][0]+pts[i+1][0])/2, yc=(pts[i][1]+pts[i+1][1])/2;
    ctx.quadraticCurveTo(pts[i][0],pts[i][1],xc,yc);
  }
  ctx.lineTo(pts[pts.length-1][0], pts[pts.length-1][1]);
  ctx.closePath();
}
function drawCar(cfg, face){
  const cv=document.getElementById("car");
  if(!cv) return;
  const ctx=cv.getContext("2d");
  ctx.clearRect(0,0,cv.width,cv.height);
  ctx.save();
  ctx.translate(80,96); // car box 880x250, ground at y=250
  const G=250, wR=60, wy=G-wR, rx=185, fx=712;

  // ground shadow
  ctx.save();
  ctx.translate(440,G+8); ctx.scale(1,.09);
  const sh=ctx.createRadialGradient(0,0,0,0,0,470);
  sh.addColorStop(0,"rgba(0,0,0,.55)"); sh.addColorStop(1,"rgba(0,0,0,0)");
  ctx.fillStyle=sh; ctx.beginPath(); ctx.arc(0,0,470,0,7); ctx.fill();
  ctx.restore();

  // body
  const body=[
    [40,240],[12,208],[8,168],[22,132],[95,116],[152,104],[204,60],
    [282,38],[400,32],[482,36],[588,88],[700,100],[802,108],[852,116],
    [870,150],[874,192],[856,240]
  ];
  const bgrad=ctx.createLinearGradient(0,30,0,250);
  bgrad.addColorStop(0,"#39404d"); bgrad.addColorStop(.55,"#2a303b"); bgrad.addColorStop(1,"#1c2129");
  smoothPath(ctx,body);
  ctx.fillStyle=bgrad; ctx.fill();
  ctx.strokeStyle="rgba(255,255,255,.07)"; ctx.lineWidth=1.5; ctx.stroke();

  // greenhouse
  const glass=[[176,100],[214,66],[288,46],[468,44],[556,86],[560,96],[178,106]];
  smoothPath(ctx,glass);
  const gg=ctx.createLinearGradient(0,40,0,110);
  gg.addColorStop(0,"#1b2029"); gg.addColorStop(1,"#0e1116");
  ctx.fillStyle=gg; ctx.fill();
  // B-pillar
  ctx.strokeStyle="#0b0d11"; ctx.lineWidth=7;
  ctx.beginPath(); ctx.moveTo(382,48); ctx.lineTo(376,102); ctx.stroke();

  // character line
  ctx.strokeStyle="rgba(255,255,255,.10)"; ctx.lineWidth=2;
  ctx.beginPath(); ctx.moveTo(56,152); ctx.quadraticCurveTo(450,132,844,132); ctx.stroke();

  // lights
  ctx.fillStyle="rgba(233,231,225,.75)";
  ctx.beginPath(); ctx.moveTo(864,124); ctx.lineTo(820,120); ctx.lineTo(824,134); ctx.lineTo(866,140); ctx.closePath(); ctx.fill();
  ctx.fillStyle="rgba(200,60,50,.8)";
  ctx.beginPath(); ctx.moveTo(12,146); ctx.lineTo(52,140); ctx.lineTo(54,152); ctx.lineTo(12,158); ctx.closePath(); ctx.fill();

  // wheel arches (punch through body)
  ctx.globalCompositeOperation="destination-out";
  for(const x of [rx,fx]){ ctx.beginPath(); ctx.arc(x,wy,wR+9,0,7); ctx.fill(); }
  ctx.globalCompositeOperation="source-over";
  for(const x of [rx,fx]){
    ctx.beginPath(); ctx.arc(x,wy,wR+9,Math.PI,2*Math.PI);
    ctx.strokeStyle="rgba(0,0,0,.5)"; ctx.lineWidth=5; ctx.stroke();
  }

  drawWheelAt(ctx,rx,wy,wR,cfg,face);
  drawWheelAt(ctx,fx,wy,wR,cfg,face);
  ctx.restore();
}

/* ================= Cards & filters ================= */
const PAGE=document.body.dataset.page||"all";
const state={style:"All", budget:0, sort:"featured", q:""};
const grid=document.getElementById("grid");

function pageSubset(){
  if(PAGE==="g30") return WHEELS.filter(hasG30Photo);
  if(PAGE==="more") return WHEELS.filter(w=>!hasG30Photo(w));
  return WHEELS;
}

function photoBlock(w){
  if(!w.photo) return "";
  const p=w.photo;
  const label=(p.isG30?"On a G30":"On: "+(p.car||"another car"))+(p.size?" · "+p.size:"");
  return `<img class="photo" src="${p.src}" alt="${w.brand} ${w.model} mounted on ${p.car||"a car"}"
    loading="lazy" referrerpolicy="no-referrer">
  <span class="shownchip">${label}</span>
  <button class="viewtoggle" aria-pressed="false">Render</button>`;
}
function creditLine(w){
  if(!w.photo) return "";
  return `<p class="photocredit">Photo via <a href="${w.photo.creditUrl}" target="_blank" rel="noopener">${w.photo.creditName}</a></p>`;
}
function photoLinksRow(w){
  if(!w.photoLinks || !w.photoLinks.length) return "";
  return `<div class="plinks"><span class="fl">Real photos</span>${w.photoLinks.map(l=>
    `<a class="plink${l.isG30?" g30":""}" href="${l.url}" target="_blank" rel="noopener">${l.label}&nbsp;&nearr;</a>`).join("")}</div>`;
}

function cardHTML(w){
  const specs=[["Front",w.front],["Rear",w.rear],["Construction",w.construction],["Weight / wheel",w.weight],["Tires",w.tires],["Set of 4",fmt(w.price[0])+" – "+fmt(w.price[1])]];
  return `
  <article class="card" data-id="${w.id}">
    <div class="stage">
      <canvas width="640" height="470" aria-label="Rendering of the ${w.brand} ${w.model} wheel design"></canvas>
      ${photoBlock(w)}
    </div>
    <div class="card-body">
      ${creditLine(w)}
      <div class="brandline"><span class="brand">${w.brand}</span><span class="tierchip" title="Price tier">${tier(w)}</span></div>
      <h2 class="model">${w.model}</h2>
      <p class="blurb">${w.blurb}</p>
      <div class="finishes">
        <span class="fl">Finish</span>
        ${w.finishes.map((f,fi)=>`<button class="dot" style="background:${f.face}" data-fi="${fi}" aria-pressed="${fi===0}" title="${f.name}" aria-label="Show in ${f.name}"></button>`).join("")}
        <span class="fname">${w.finishes[0].name}</span>
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
        <button class="btn primary fit">Fit on car</button>
        <a class="btn" href="${w.url}" target="_blank" rel="noopener">Brand site&nbsp;&nearr;</a>
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
  const cv=card.querySelector("canvas");
  const img=card.querySelector("img.photo");
  const toggle=card.querySelector(".viewtoggle");
  const chip=card.querySelector(".shownchip");
  let cur=0;
  drawCardWheel(cv,w.render,w.finishes[0].face);
  if(img){
    img.addEventListener("error",()=>{
      img.remove(); if(toggle) toggle.remove(); if(chip) chip.remove();
      const credit=card.querySelector(".photocredit"); if(credit) credit.remove();
    });
    if(toggle) toggle.addEventListener("click",()=>{
      const showingRender=img.hidden;
      img.hidden=!showingRender ? true : false;
      if(chip) chip.hidden=img.hidden;
      toggle.textContent=img.hidden?"Photo":"Render";
      toggle.setAttribute("aria-pressed", img.hidden?"true":"false");
    });
  }
  card.querySelectorAll(".dot").forEach(dot=>{
    dot.addEventListener("click",()=>{
      cur=+dot.dataset.fi;
      card.querySelectorAll(".dot").forEach(d=>d.setAttribute("aria-pressed", d===dot ? "true":"false"));
      card.querySelector(".fname").textContent=w.finishes[cur].name;
      drawCardWheel(cv,w.render,w.finishes[cur].face);
      if(img && !img.hidden && toggle){ // switch to render so the finish change is visible
        img.hidden=true; if(chip) chip.hidden=true;
        toggle.textContent="Photo"; toggle.setAttribute("aria-pressed","true");
      }
    });
  });
  card.querySelector(".fit").addEventListener("click",()=>{
    drawCar(w.render,w.finishes[cur].face);
    const label=document.getElementById("fitted-name");
    if(label) label.textContent=w.brand+" "+w.model+" — "+w.finishes[cur].name;
    const wrap=document.querySelector(".carwrap");
    if(wrap) wrap.scrollIntoView({behavior:"smooth",block:"center"});
  });
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

render();
const oem=WHEELS.find(w=>w.id==="668m")||WHEELS[0];
drawCar(oem.render, oem.finishes[0].face);
