/* Дополнительные анимации. Отдельный файл: если сломается, основной сайт работает. */
(function(){try{
const $=(s,r=document)=>r.querySelector(s),$$=(s,r=document)=>[...r.querySelectorAll(s)];
const reduce=matchMedia('(prefers-reduced-motion: reduce)').matches;
if(reduce)return;
const fine=matchMedia('(hover:hover) and (pointer:fine)').matches;

/* 1. каскад: дети сеток появляются по очереди */
['.audiences','.nums','.ops','.flow','.zones','.facts','.menu-groups'].forEach(sel=>{
  $$(sel).forEach(g=>[...g.children].forEach((c,i)=>{c.style.setProperty('--st',i*110+'ms');c.classList.add('cascade');}));
});
const cio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){e.target.classList.add('cas-in');cio.unobserve(e.target);}}),{threshold:.2});
$$('.cascade').forEach(c=>cio.observe(c.parentElement===document.body?c:c.parentElement));
/* наблюдаем родителей, класс ставим детям */
const pio=new IntersectionObserver(es=>es.forEach(e=>{if(e.isIntersecting){[...e.target.children].forEach(c=>c.classList.add('cas-in'));pio.unobserve(e.target);}}),{threshold:.18});
$$('.cascade').forEach(c=>pio.observe(c.parentElement));

/* 2. параллакс фото при прокрутке */
const par=$$('.trio img,.duo img,.idea-pic img,.menu-photo img,.iso img');
let tick=false;
function px(){tick=false;const h=innerHeight;par.forEach(im=>{const r=im.getBoundingClientRect();if(r.bottom<-50||r.top>h+50)return;const p=((r.top+r.height/2)-h/2)/h;im.style.setProperty('--py',(p*-9).toFixed(1)+'px');});}
addEventListener('scroll',()=>{if(!tick){tick=true;requestAnimationFrame(px);}},{passive:true});px();

/* 3. план 55 м²: зоны подсвечиваются сами, пока посетитель не взял управление */
const zones=$$('.zone'),rows=$$('.zrow[data-z]');let zi=0,zuser=false,zt;
if(zones.length){
  const mark=z=>{zones.forEach(g=>g.classList.toggle('on',g.dataset.z===String(z)));rows.forEach(r=>r.classList.toggle('on',r.dataset.z===String(z)));};
  const zio=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting&&!zuser){clearInterval(zt);zt=setInterval(()=>{if(zuser)return clearInterval(zt);zi=(zi+1)%zones.length;mark(zi);},2200);}
    else clearInterval(zt);
  }),{threshold:.4});
  zio.observe($('#plan')||zones[0]);
  [...zones,...rows].forEach(el=>['mouseenter','click','focus','touchstart'].forEach(ev=>el.addEventListener(ev,()=>{zuser=true;clearInterval(zt);},{passive:true})));
}

/* 4. схема «как готовим»: шаги загораются по очереди */
const fs=$$('.fstep');
if(fs.length){let fi=0,ft;
  const fio=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting){clearInterval(ft);fs[0].classList.add('act');ft=setInterval(()=>{fi=(fi+1)%fs.length;fs.forEach((f,k)=>f.classList.toggle('act',k===fi));},1800);}
    else clearInterval(ft);
  }),{threshold:.3});
  fio.observe($('.flow'));
}

/* 5. меню: вкладки сами листаются, пока человек не нажал */
const tabs=$$('#tabs button');
if(tabs.length){let ti=0,tuser=false,tt;
  const tio=new IntersectionObserver(es=>es.forEach(e=>{
    if(e.isIntersecting&&!tuser){clearInterval(tt);tt=setInterval(()=>{if(tuser)return clearInterval(tt);ti=(ti+1)%tabs.length;tabs[ti].click();},3800);}
    else clearInterval(tt);
  }),{threshold:.5});
  tio.observe($('.menu-grid'));
  tabs.forEach(b=>b.addEventListener('pointerdown',e=>{if(e.isTrusted){tuser=true;clearInterval(tt);}}));
}

/* 6. подсветка под курсором на карточках и лёгкий наклон главного кадра (только мышь) */
if(fine){
  $$('.audiences article,.fstep,.ops article,.nums div,.facts div').forEach(c=>{
    c.addEventListener('pointermove',e=>{const r=c.getBoundingClientRect();c.style.setProperty('--mx',(e.clientX-r.left)+'px');c.style.setProperty('--my',(e.clientY-r.top)+'px');});
    c.classList.add('spot');
  });
  const hm=$('.hero-media'),hero=$('.hero');
  if(hero&&hm){hero.addEventListener('pointermove',e=>{const x=(e.clientX/innerWidth-.5)*-14,y=(e.clientY/innerHeight-.5)*-10;hm.style.setProperty('--mx2',x.toFixed(1)+'px');hm.style.setProperty('--my2',y.toFixed(1)+'px');});}
}


/* живой слой главной: совпадает с видимой частью кадра при любом размере окна */
const live=$('#live'),himg=$('.hero-media img');
if(live&&himg){
  const NW=1800,NH=1013;
  function fit(){const box=himg.getBoundingClientRect?himg.parentElement.getBoundingClientRect():null;if(!box)return;
    const W=himg.offsetWidth,H=himg.offsetHeight,sc=Math.max(W/NW,H/NH),iw=NW*sc,ih=NH*sc;
    const pos=getComputedStyle(himg).objectPosition.split(' ').map(v=>parseFloat(v)/100);
    const ox=(W-iw)*(isNaN(pos[0])?.5:pos[0]),oy=(H-ih)*(isNaN(pos[1])?.5:pos[1]);
    live.style.left=(himg.offsetLeft+ox)+'px';live.style.top=(himg.offsetTop+oy)+'px';live.style.width=iw+'px';live.style.height=ih+'px';
    live.style.transformOrigin=((W/2-ox)/iw*100)+'% '+((H/2-oy)/ih*100)+'%';}
  fit();addEventListener('resize',fit);himg.addEventListener('load',fit);
}

/* 7. заголовки блоков: цифры «01 / 06» в блоке «День» перелистываются с отскоком */
const clock=$('#clock');
if(clock){new MutationObserver(()=>{clock.classList.remove('bump');void clock.offsetWidth;clock.classList.add('bump');}).observe(clock,{childList:true,characterData:true,subtree:true});}

/* 8. кнопка музыки: волна эквалайзера рядом с кнопкой, пока играет, уже в main.js; здесь только подсказка после 1-й прокрутки */
let hinted=false;addEventListener('scroll',()=>{if(hinted||scrollY<innerHeight*.9)return;hinted=true;const s=$('#sound');if(s&&s.getAttribute('aria-pressed')!=='true')s.classList.add('nudge');},{passive:true});
}catch(e){console.warn('anim.js',e);}})();
