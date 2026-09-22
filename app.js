const grid=document.querySelector('#grid'),q=document.querySelector('#q'),cat=document.querySelector('#cat'),chips=document.querySelector('#chips');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const watched=JSON.parse(localStorage.getItem('edutrack_progress')||'{}');

function pct(id){return Math.max(0,Math.min(100,Number(watched[id]||0)))}
function save(){localStorage.setItem('edutrack_progress',JSON.stringify(watched))}
function card(v){
  const p=pct(v.id);
  const url=esc(v.url||'');
  const fallback=`<div class="thumb-fallback">🎓</div>`;
  const media=url?`<video muted preload="metadata" src="${url}"></video>`:fallback;
  return `<article class="card">
    <div class="thumb">${media}<span class="play">▶</span>${v.duration?`<span class="duration">${esc(v.duration)}</span>`:''}</div>
    <div class="body">
      <span class="tag">${esc(v.category||'Formation')}</span>
      <h3>${esc(v.title)}</h3>
      <p>${esc(v.description||'Apprenez à utiliser cette fonctionnalité d’EduTrack.')}</p>
      <div class="card-bottom">
        <div class="card-progress"><div class="small-bar"><i style="width:${p}%"></i></div><div class="percent">${p?`${p}% terminé`:'À commencer'}</div></div>
        <a class="btn ${p>=100?'done':''}" href="/video.html?id=${encodeURIComponent(v.id)}">${p>=100?'Revoir':'Commencer'} →</a>
      </div>
    </div>
  </article>`
}
function updateProgress(total){
  const vals=Object.values(watched).map(Number);
  const avg=total?Math.round(vals.reduce((a,b)=>a+b,0)/total):0;
  document.querySelector('#progressPercent').textContent=avg+'%';
  document.querySelector('#progressText').textContent=avg+'%';
  document.querySelector('#progressBar').style.width=avg+'%';
  const ring=document.querySelector('#progressRing');
  ring.style.background=`conic-gradient(#2563eb ${avg*3.6}deg,#e8edf6 ${avg*3.6}deg)`;
  document.querySelector('#progressTitle').textContent=avg? 'Votre parcours est en cours':'Commencez votre parcours';
  document.querySelector('#progressDetail').textContent=avg?`${Object.values(watched).filter(x=>Number(x)>=100).length} formation(s) terminée(s) ou en cours.`:'Regardez une première vidéo pour commencer votre progression.';
}
async function load(){
  grid.innerHTML='<div class="empty">Chargement des formations…</div>';
  const p=new URLSearchParams();
  if(q.value.trim())p.set('q',q.value.trim());
  if(cat.value)p.set('category',cat.value);
  try{
    const r=await fetch('/api/videos?'+p);
    const d=await r.json();
    cat.innerHTML='<option value="">Toutes les catégories</option>'+d.categories.map(c=>`<option value="${esc(c)}">${esc(c)}</option>`).join('');
    if(p.get('category'))cat.value=p.get('category');
    chips.innerHTML='<button class="chip active" data-cat="">Toutes</button>'+d.categories.map(c=>`<button class="chip" data-cat="${esc(c)}">${esc(c)}</button>`).join('');
    chips.querySelectorAll('.chip').forEach(b=>b.onclick=()=>{cat.value=b.dataset.cat;q.value='';load()});
    document.querySelector('#videoCount').textContent=d.total??d.videos.length;
    grid.innerHTML=d.videos.map(card).join('')||'<div class="empty"><strong>Aucune formation trouvée</strong><br><small>Essayez un autre mot-clé ou une autre catégorie.</small></div>';
    updateProgress(d.total||d.videos.length);
  }catch(e){
    grid.innerHTML='<div class="empty"><strong>Impossible de charger les formations.</strong><br><small>Vérifiez que le serveur EduTrack est démarré.</small></div>';
  }
}
q.addEventListener('input',load);cat.addEventListener('change',load);load();
