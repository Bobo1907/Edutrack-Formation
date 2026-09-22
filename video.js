const id=new URLSearchParams(location.search).get('id'),box=document.querySelector('#content');
const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
const progress=JSON.parse(localStorage.getItem('edutrack_progress')||'{}');
function save(){localStorage.setItem('edutrack_progress',JSON.stringify(progress))}
(async()=>{
  try{
    const r=await fetch('/api/videos/'+encodeURIComponent(id||''));
    const d=await r.json();
    if(!r.ok) return box.innerHTML='<div class="watchbox"><h1>Formation introuvable</h1><p class="muted">Cette formation n’existe plus ou le lien est incorrect.</p></div>';
    const v=d.video; document.title=v.title+' | EduTrack Formation';
    box.innerHTML=`<div class="watchbox">
      <video id="player" controls playsinline preload="metadata" src="${esc(v.url)}"></video>
      <div style="margin-top:18px"><span class="tag">${esc(v.category||'Formation')}</span><h1>${esc(v.title)}</h1><p class="muted">${esc(v.description||'')}</p></div>
      <div class="share"><button id="copy">Copier le lien</button><button id="share">Partager</button><a class="btn" href="/">← Retour aux formations</a></div>
    </div>`;
    const player=document.querySelector('#player');
    player.addEventListener('timeupdate',()=>{
      if(!player.duration)return;
      progress[v.id]=Math.max(Number(progress[v.id]||0),Math.round(player.currentTime/player.duration*100));
      save();
    });
    player.addEventListener('ended',()=>{progress[v.id]=100;save()});
    document.querySelector('#copy').onclick=()=>navigator.clipboard.writeText(location.href).then(()=>document.querySelector('#copy').textContent='Lien copié ✓');
    document.querySelector('#share').onclick=()=>navigator.share?navigator.share({title:v.title,url:location.href}):document.querySelector('#copy').click();
  }catch(e){box.innerHTML='<div class="watchbox"><h1>Erreur de chargement</h1><p class="muted">Le serveur n’a pas pu répondre.</p></div>'}
})();