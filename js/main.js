(function(){
const $=(s,r=document)=>r.querySelector(s), $$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;

/* reveal + counters + price bars */
const io=new IntersectionObserver(es=>es.forEach(e=>{
  if(!e.isIntersecting)return; e.target.classList.add('in'); io.unobserve(e.target);
  $$('[data-count]',e.target).forEach(count);
  if(e.target.classList.contains('prices'))e.target.classList.add('in');
}),{threshold:.18});
$$('.reveal').forEach(el=>io.observe(el));
function count(el){
  const to=+el.dataset.count; if(reduce){el.textContent=to;return;}
  el.textContent=0;
  const t0=performance.now(), d=1400;
  (function f(t){const p=Math.min(1,(t-t0)/d); el.textContent=Math.round(to*(1-Math.pow(1-p,3))); if(p<1)requestAnimationFrame(f);})(t0);
}

/* scroll: header, progress, parallax, day timeline */
const top=$('.top'), bar=$('#bar'), par=$$('[data-parallax]');
const day=$('.day'), imgs=$$('.d-img'), steps=$$('.step'), dots=$$('#dots li'), clock=$('#clock');
const times=['Утро','Обед','Перерыв','Гости','Встречи','Позже'];
let cur=-1, tick=0;
function onScroll(){
  const y=scrollY, h=document.documentElement.scrollHeight-innerHeight;
  bar.style.width=(y/h*100)+'%'; top.classList.toggle('solid',y>innerHeight*.6);
  if(!reduce) par.forEach(el=>{
    const r=el.parentElement.getBoundingClientRect(); if(r.bottom<0||r.top>innerHeight)return;
    const k=+el.dataset.parallax*.5, off=(r.top+r.height/2-innerHeight/2)*k;
    const t=el.tagName==='IMG'?el:el; t.style.transform=`translate3d(0,${off}px,0)`;
  });
  const r=day.getBoundingClientRect(), p=Math.min(.9999,Math.max(0,-r.top/(r.height-innerHeight)));
  const i=Math.floor(p*imgs.length);
  if(i!==cur){cur=i; imgs.forEach((m,k)=>{m.classList.toggle('on',k===i);m.classList.toggle('past',k<i);}); steps.forEach((s,k)=>s.classList.toggle('on',k===i)); dots.forEach((d,k)=>d.classList.toggle('on',k===i)); tween(times[i]);}
}
function tween(to){clock.textContent=to;}
addEventListener('scroll',()=>requestAnimationFrame(onScroll),{passive:true}); onScroll();

/* plan */
const NS='http://www.w3.org/2000/svg', seats=$('.seats'), zones=$$('.zone'), rows=$$('.zrow');
for(let i=0;i<14;i++){const c=document.createElementNS(NS,'circle');c.setAttribute('class','seat');
  c.setAttribute('cx',50+(i%7)*83);c.setAttribute('cy',i<7?410:430);c.setAttribute('r',9);seats.appendChild(c);}
function zone(z){zones.forEach(g=>g.classList.toggle('on',g.dataset.z===z)); rows.forEach(r=>r.classList.toggle('on',r.dataset.z===z));}
[...zones,...rows].forEach(el=>{el.addEventListener('mouseenter',()=>zone(el.dataset.z));el.addEventListener('focus',()=>zone(el.dataset.z));el.addEventListener('click',()=>zone(el.dataset.z));});
zone('0');

/* menu */
const MENU={
  coffee:{img:'06-coffee',video:'steam',items:['Кофейная классика','Чай, какао, вода','Один сезонный напиток']},
  eat:{img:'07-breakfast',items:['Сырники с ягодным соусом','Овсяная каша с вишней','Рисовая каша с абрикосом','Йогурт с гранолой','Собираем понятный завтрак: блюдо и любимый напиток']},
  snack:{img:'04-hall',items:['Курица, сыр и свежие овощи','Индейка с горчичным соусом','Ролл с курицей и зеленью','Круассан с сыром и индейкой','Варианты для ротации. На витрине одновременно сохраняем два сэндвича и один ролл']},
  lunch:{img:'08-lunch',items:['Супы дня: куриный суп с лапшой, чечевичный суп, грибной крем-суп','Горячее с гарниром: котлета из индейки с пюре, курица с рисом и овощами, говядина с гречкой, запечённая рыба с овощами','Один суп и два горячих блюда каждый день','Варианты сменяются по двухнедельному циклу. Все блюда готовит внешняя производственная кухня']},
  sweet:{img:'03-counter',items:['Салат с курицей и овощами','Овощной салат с сыром','Салат с индейкой и крупой','Чизкейк, вишнёвый пирог, морковный пирог','Круассан и порционная выпечка','Региональный акцент: порционный пирог с сыром и зеленью']}
};
const list=$('#menuList'), mi=$('#menuImg'), mv=$('#menuVid');
function tab(k){
  $$('#tabs button').forEach(b=>b.classList.toggle('on',b.dataset.t===k));
  list.innerHTML=MENU[k].items.map((t,i)=>`<p style="animation-delay:${i*70}ms">${t}</p>`).join('');
  const m=MENU[k];
  if(m.video){mv.poster='assets/web/'+m.img+'.jpg';mv.src='assets/video/'+m.video+'.mp4?v=27';mv.play().catch(()=>{});mv.style.opacity=1;mi.style.opacity=0;}
  else{mv.pause();mv.style.opacity=0;mi.style.opacity=0;setTimeout(()=>{mi.src='assets/web/'+m.img+'.jpg';mi.style.opacity=1;},180);}
}
$$('#tabs button').forEach(b=>b.addEventListener('click',()=>tab(b.dataset.t))); tab('coffee');

/* prices */
const P=[['Кофе с молоком',180,250],['Завтрак без напитка',230,350],['Сэндвич или ролл',250,350],['Горячее с гарниром',320,420],['Суп и горячее с гарниром',450,550],['Десерт',180,300]];
$('#priceBars').innerHTML=P.map(([n,a,b])=>`<div class="bar"><span>${n}</span><div class="track"><div class="fill" style="left:${(a-150)/4.2}%;right:${100-(b-150)/4.2}%"></div></div><em>${a}–${b} ₽</em></div>`).join('');

/* hero: цикл; на телефонах повторная попытка запуска при первом касании или прокрутке */
const hv=$('#heroVideo');
const kick=()=>{if(hv.paused)hv.play().catch(()=>{});};
hv.play&&hv.play().catch(()=>{});
['touchstart','pointerdown','scroll','visibilitychange'].forEach(e=>addEventListener(e,kick,{passive:true,once:e!=='visibilitychange'&&e!=='scroll'}));
document.addEventListener('visibilitychange',kick);
/* все ролики идут по кругу, пока видны; вне экрана ставятся на паузу */
const loops=$$('video[data-loop]');
const vio=new IntersectionObserver(es=>es.forEach(e=>{const v=e.target;if(e.isIntersecting)v.play().catch(()=>{});else v.pause();}),{threshold:.1});
loops.forEach(v=>vio.observe(v));
})();

/* звук: птицы и лёгкая музыка, по кнопке (браузеры не разрешают автозвук) */
(function(){
  const $=s=>document.querySelector(s);
  const btn=$('#sound'),lbl=$('#soundLbl'),hint=$('#soundHint');
  const tracks=[[new Audio('assets/audio/birds.mp3'),.28],[new Audio('assets/audio/music.mp3'),.7]];
  tracks.forEach(([a])=>{a.loop=true;a.preload='auto';a.volume=0;});
  let on=false,timers=[];
  const fade=(a,to,ms,done)=>{const from=a.volume,t0=performance.now();(function f(t){const p=Math.min(1,(t-t0)/ms);a.volume=Math.max(0,Math.min(1,from+(to-from)*p));if(p<1)requestAnimationFrame(f);else done&&done();})(t0);};
  function set(v){
    on=v;btn.setAttribute('aria-pressed',v);lbl.textContent=v?'Звук вкл':'Звук';btn.setAttribute('aria-label',v?'Выключить фоновый звук':'Включить фоновый звук');
    hint.classList.remove('show');
    tracks.forEach(([a,vol],i)=>{
      if(v){a.play().then(()=>fade(a,vol,2500)).catch(()=>{on=false;btn.setAttribute('aria-pressed',false);lbl.textContent='Звук';});}
      else fade(a,0,900,()=>a.pause());
    });
  }
  btn.addEventListener('click',()=>set(!on));
  document.addEventListener('visibilitychange',()=>tracks.forEach(([a,vol])=>{if(document.hidden)a.pause();else if(on)a.play().then(()=>a.volume=vol).catch(()=>{});}));
  setTimeout(()=>{if(!on)hint.classList.add('show');},2500);
  setTimeout(()=>hint.classList.remove('show'),11000);
})();
