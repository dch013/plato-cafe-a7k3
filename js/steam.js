/* Пар над чашкой: частицы на canvas. Источник привязан к поверхности кофе в координатах картинки 06-coffee.jpg. */
(function(){try{
if(matchMedia('(prefers-reduced-motion: reduce)').matches)return;
const stage=document.querySelector('.day-stage'),first=stage&&stage.querySelector('.d-img');
if(!stage||!first)return;
const NW=2000,NH=1116;           // размер картинки
const CX=1191,CY=588,RX=190,RY=44; // эллипс зеркала кофе в координатах картинки
const cv=document.createElement('canvas');cv.className='steam-cv';cv.setAttribute('aria-hidden','true');stage.insertBefore(cv,stage.querySelector('.day-shade')||null);
const ctx=cv.getContext('2d');
let W=0,H=0,dpr=1,S=1,OX=0,OY=0,M=1,AK=1;
function fit(){dpr=Math.min(2,devicePixelRatio||1);W=stage.clientWidth;H=stage.clientHeight;cv.width=W*dpr;cv.height=H*dpr;cv.style.width=W+'px';cv.style.height=H+'px';
  S=Math.max(W/NW,H/NH);OX=(W-NW*S)/2;OY=(H-NH*S)/2;M=Math.max(1,.85/S);AK=W<700?1.9:1;}
fit();addEventListener('resize',fit);
// мягкий спрайт
const sp=document.createElement('canvas');sp.width=sp.height=64;const g=sp.getContext('2d');
const gr=g.createRadialGradient(32,32,0,32,32,32);gr.addColorStop(0,'rgba(255,250,242,1)');gr.addColorStop(.35,'rgba(255,250,242,.55)');gr.addColorStop(1,'rgba(255,250,242,0)');g.fillStyle=gr;g.fillRect(0,0,64,64);
// гладкий шум
function h(x,y){const s=Math.sin(x*127.1+y*311.7)*43758.5453;return s-Math.floor(s);}
function vn(x,y){const xi=Math.floor(x),yi=Math.floor(y),xf=x-xi,yf=y-yi,u=xf*xf*(3-2*xf),v=yf*yf*(3-2*yf);
  return h(xi,yi)*(1-u)*(1-v)+h(xi+1,yi)*u*(1-v)+h(xi,yi+1)*(1-u)*v+h(xi+1,yi+1)*u*v;}
const P=[];let acc=0,last=0,run=false,t0=performance.now();
const MAX=210,RATE=42;
function spawn(){
  const a=Math.random()*Math.PI*2,r=Math.sqrt(Math.random());
  P.push({x:CX+Math.cos(a)*RX*.8*r,y:CY+Math.sin(a)*RY*.7*r,age:0,life:4.4+Math.random()*3,
    r0:(7+Math.random()*9)*M,vy:-(26+Math.random()*26)*M,sd:Math.random()*100,rot:Math.random()*6.28,pk:.1+Math.random()*.09});
}
function frame(now){
  if(!run)return;
  const dt=Math.min(.05,(now-last)/1000||.016);last=now;const t=(now-t0)/1000;
  acc+=RATE*dt;while(acc>=1){acc--;if(P.length<MAX)spawn();}
  ctx.setTransform(dpr,0,0,dpr,0,0);ctx.clearRect(0,0,W,H);
  for(let i=P.length-1;i>=0;i--){
    const p=P[i];p.age+=dt;const k=p.age/p.life;
    if(k>=1){P.splice(i,1);continue;}
    const n=vn(p.x*.018+p.sd,p.y*.018+t*.35)-.5; // поле завихрений ~55 px
    p.x+=(n*46+Math.sin(t*.5+p.sd)*4)*M*dt;
    p.y+=p.vy*dt*(1+k*.5);
    const rad=p.r0*(1+k*1.4);
    // альфа: нарастает у источника, мягко тает к концу
    const al=p.pk*Math.pow(Math.sin(Math.PI*Math.min(1,k*1.15)),1.3);
    const sx=OX+p.x*S,sy=OY+p.y*S,rs=rad*S*2;
    ctx.globalAlpha=Math.min(1,al*AK);ctx.save();ctx.translate(sx,sy);ctx.rotate(p.rot+k*.6);ctx.scale(1.25,.9);ctx.drawImage(sp,-rs/2,-rs/2,rs,rs);ctx.restore();
  }
  ctx.globalAlpha=1;
  requestAnimationFrame(frame);
}
function start(){if(run)return;run=true;last=performance.now();requestAnimationFrame(frame);}
function stop(){run=false;}
let vis=false,onSlide=true;
function upd(){const want=vis&&onSlide&&!document.hidden;want?start():stop();cv.style.opacity=onSlide?1:0;}
new IntersectionObserver(e=>{vis=e[0].isIntersecting;upd();},{threshold:.05}).observe(stage);
new MutationObserver(()=>{onSlide=first.classList.contains('on');upd();}).observe(first,{attributes:true,attributeFilter:['class']});
document.addEventListener('visibilitychange',upd);
}catch(e){console.warn('steam.js',e);}})();
