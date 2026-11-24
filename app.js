import {fortunes,selectFortune,topicReadings,articles,normalizeName,escapeXml} from './data.js?v=20261124-r1';
import {articleFromHash,articleHash} from './routing.mjs';
const $=s=>document.querySelector(s);
const menu=$('.menu-button'),nav=$('#navigation');
menu.addEventListener('click',()=>{const open=menu.getAttribute('aria-expanded')!=='true';menu.setAttribute('aria-expanded',String(open));nav.classList.toggle('open',open);});
nav.addEventListener('click',e=>{if(e.target.closest('a')){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');const people=nav.querySelector('details');if(people)people.open=false;}});
document.addEventListener('keydown',e=>{if(e.key==='Escape'){nav.classList.remove('open');menu.setAttribute('aria-expanded','false');const people=nav.querySelector('details');if(people)people.open=false;}});
document.addEventListener('click',e=>{const people=nav.querySelector('details');if(people&&!people.contains(e.target))people.open=false;});
for(const dialog of document.querySelectorAll('dialog')){
 dialog.querySelector('.dialog-close').addEventListener('click',()=>dialog.close());
 dialog.addEventListener('click',e=>{if(e.target!==dialog)return;const r=dialog.getBoundingClientRect();if(e.clientX<r.left||e.clientX>r.right||e.clientY<r.top||e.clientY>r.bottom)dialog.close();});
}
document.addEventListener('click',e=>{
 const ritual=e.target.closest('[data-open]');
 if(ritual){$('#'+ritual.dataset.open+'-dialog').showModal();return;}
 const article=e.target.closest('[data-article]');
 if(article){e.preventDefault();openArticle(article.dataset.article);}
});
function openArticle(id,{navigate=true}={}){
 const article=articles[id];if(!article)return;
 if(navigate){const hash=articleHash(id,articles);if(hash&&location.hash!==hash)history.pushState(null,'',hash);}
 $('#article-meta').textContent=article.meta;$('#article-heading').textContent=article.title;
 // Only hard-coded editorial content is inserted here. Visitor input uses textContent below.
 $('#article-body').innerHTML=article.body;
 const dialog=$('#article-dialog');if(!dialog.open)dialog.showModal();dialog.querySelector('.article-scroll').scrollTop=0;
 dialog.querySelector('.dialog-close').focus({preventScroll:true});
}
$('.close-article').addEventListener('click',()=>$('#article-dialog').close());
let applyingArticleRoute=false;
function syncArticleRoute(){
 const id=articleFromHash(location.hash,articles),dialog=$('#article-dialog');
 applyingArticleRoute=true;
 try{if(id)openArticle(id,{navigate:false});else if(dialog.open)dialog.close();}
 finally{applyingArticleRoute=false;}
}
$('#article-dialog').addEventListener('close',()=>{
 if(!applyingArticleRoute&&articleFromHash(location.hash,articles))history.replaceState(null,'',location.pathname+location.search+'#notices');
});
window.addEventListener('hashchange',syncArticleRoute);
window.addEventListener('popstate',syncArticleRoute);
syncArticleRoute();
for(const button of document.querySelectorAll('[data-filter]'))button.addEventListener('click',()=>{
 for(const other of document.querySelectorAll('[data-filter]'))other.setAttribute('aria-pressed',String(other===button));
 for(const row of document.querySelectorAll('[data-kind]'))row.hidden=button.dataset.filter!=='all'&&row.dataset.kind!==button.dataset.filter;
});
let prayer=null;
$('#lamp-form').addEventListener('submit',e=>{
 e.preventDefault();const form=new FormData(e.currentTarget),name=normalizeName(String(form.get('name')||''));
 if(!name){$('#lamp-error').textContent='請填寫 1 至 24 字的稱呼或暱稱。';$('#prayer-name').focus();return;}
 prayer={name,wish:String(form.get('wish')),message:String(form.get('message')||'').trim().slice(0,80)};
 $('#lamp-error').textContent='';$('#blessing-name').textContent=prayer.name+'，願您';$('#blessing-wish').textContent=prayer.wish;
 $('#blessing-message').textContent=prayer.message;$('#lamp-form').hidden=true;$('#lamp-result').hidden=false;
 $('#lamp-dialog').scrollTop=0;$('#save-card').focus({preventScroll:true});
});
$('#relight').addEventListener('click',()=>{$('#lamp-result').hidden=true;$('#lamp-form').hidden=false;$('#lamp-form').reset();$('#prayer-name').focus();});
$('#save-card').addEventListener('click',()=>{
 if(!prayer)return;
 const lines=Array.from(prayer.message).reduce((acc,c,i)=>{if(i%20===0)acc.push('');acc[acc.length-1]+=c;return acc;},[]);
 const svg=`<svg xmlns="http://www.w3.org/2000/svg" width="900" height="1200" viewBox="0 0 900 1200"><rect width="900" height="1200" fill="#f5f4ee"/><rect x="36" y="36" width="828" height="1128" fill="none" stroke="#9ba98e"/><rect x="49" y="49" width="802" height="1102" fill="none" stroke="#d2d8c9"/><g text-anchor="middle" fill="#3a4d3e" font-family="serif"><text x="450" y="150" font-size="54" letter-spacing="14">太濟觀</text><text x="450" y="210" font-size="24" letter-spacing="9">一 燈 一 願</text><path d="M450 285 Q410 340 450 365 Q487 345 450 285" fill="#d0a15a"/><path d="M355 378H545Q535 435 450 435Q365 435 355 378" fill="#97916d"/><path d="M439 434H461V515H504V526H396V515H439Z" fill="#97916d"/><text x="450" y="620" font-size="${prayer.name.length>12?26:38}">${escapeXml(prayer.name)}</text><text x="450" y="690" font-size="44" letter-spacing="6">${escapeXml(prayer.wish)}</text>${lines.map((line,i)=>`<text x="450" y="${755+i*35}" font-size="23">${escapeXml(line)}</text>`).join('')}<text x="450" y="980" font-size="25">願此微光伴君安度歲月</text><text x="450" y="1025" font-size="25">心神澄明，諸事平順。</text><text x="450" y="1100" font-size="19" fill="#8c967e">太初有道 · 濟世渡厄</text></g></svg>`;
 const url=URL.createObjectURL(new Blob([svg],{type:'image/svg+xml;charset=utf-8'}));const a=document.createElement('a');a.href=url;a.download='太濟觀-祈福卡.svg';document.body.append(a);a.click();a.remove();setTimeout(()=>URL.revokeObjectURL(url),10000);
});
let drawing=false,drawTimer=null;
$('#draw-fortune').addEventListener('click',()=>{
 if(drawing)return;drawing=true;$('#draw-fortune').disabled=true;$('.dialog-fortune').classList.add('drawing');$('#draw-status').textContent='心念已定，靜候一籤……';
 drawTimer=setTimeout(()=>{
  const numbers=new Uint32Array(1);crypto.getRandomValues(numbers);const fortune=selectFortune(numbers[0]/4294967296);
  $('#fortune-number').textContent='第 '+String(fortunes.indexOf(fortune)+1).padStart(2,'0')+' 籤';$('#fortune-title').textContent=fortune.title;$('#fortune-poem').textContent=fortune.poem;$('#fortune-reading').textContent=fortune.reading;$('#fortune-topic-reading').textContent=topicReadings[$('#fortune-topic').value];
  $('#fortune-start').hidden=true;$('#fortune-result').hidden=false;$('.fortune-explanation').open=false;$('.dialog-fortune').classList.remove('drawing');drawing=false;drawTimer=null;$('#draw-fortune').disabled=false;$('#fortune-dialog').scrollTop=0;$('.fortune-explanation summary').focus({preventScroll:true});
 },matchMedia('(prefers-reduced-motion: reduce)').matches?0:1100);
});
function resetFortune(){clearTimeout(drawTimer);drawTimer=null;drawing=false;$('#draw-fortune').disabled=false;$('.dialog-fortune').classList.remove('drawing');$('#draw-status').textContent='心念平穩後，再輕觸籤筒。';$('#fortune-result').hidden=true;$('#fortune-start').hidden=false;}
$('#redraw').addEventListener('click',()=>{resetFortune();$('#draw-fortune').focus();});
$('#fortune-dialog').addEventListener('close',()=>{if(drawing)resetFortune();});
