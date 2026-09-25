const id = new URLSearchParams(location.search).get('id');
const box = document.querySelector('#content');

const esc = s => String(s ?? '').replace(/[&<>"']/g, m => ({
  '&':'&amp;',
  '<':'&lt;',
  '>':'&gt;',
  '"':'&quot;',
  "'":'&#39;'
}[m]));

const progress = JSON.parse(
  localStorage.getItem('edutrack_progress') || '{}'
);

function save(){
  localStorage.setItem(
    'edutrack_progress',
    JSON.stringify(progress)
  );
}

/* Reconnaît les différents formats de liens YouTube */
function getYoutubeId(url){

  try{
    const u = new URL(url);

    // https://www.youtube.com/watch?v=XXXXXXXX
    if(
      (u.hostname === 'www.youtube.com' ||
       u.hostname === 'youtube.com') &&
      u.pathname === '/watch'
    ){
      return u.searchParams.get('v');
    }

    // https://youtu.be/XXXXXXXX
    if(
      u.hostname === 'youtu.be'
    ){
      return u.pathname.substring(1);
    }

    // https://www.youtube.com/embed/XXXXXXXX
    if(
      (u.hostname === 'www.youtube.com' ||
       u.hostname === 'youtube.com') &&
      u.pathname.startsWith('/embed/')
    ){
      return u.pathname.split('/embed/')[1];
    }

  }catch(e){}

  return null;
}

(async()=>{

  try{

    const r = await fetch(
      '/api/videos/' + encodeURIComponent(id || '')
    );

    const d = await r.json();

    if(!r.ok){
      return box.innerHTML = `
        <div class="watchbox">
          <h1>Formation introuvable</h1>
          <p class="muted">
            Cette formation n’existe plus ou le lien est incorrect.
          </p>
        </div>
      `;
    }

    const v = d.video;

    document.title = v.title + ' | EduTrack Formation';

    const youtubeId = getYoutubeId(v.url);

    /* =========================
       LECTEUR YOUTUBE
       ========================= */

    let playerHtml = '';

    if(youtubeId){

      playerHtml = `
        <div style="
          position:relative;
          width:100%;
          aspect-ratio:16/9;
          background:#000;
          border-radius:12px;
          overflow:hidden;
        ">
          <iframe
            id="youtubePlayer"
            src="https://www.youtube.com/embed/${encodeURIComponent(youtubeId)}"
            title="${esc(v.title)}"
            style="
              position:absolute;
              inset:0;
              width:100%;
              height:100%;
              border:0;
            "
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowfullscreen>
          </iframe>
        </div>
      `;

    }

    /* =========================
       VIDÉO NORMALE
       Cloudinary / MP4 / WebM...
       ========================= */

    else{

      playerHtml = `
        <video
          id="player"
          controls
          playsinline
          preload="metadata"
          src="${esc(v.url)}"
          style="width:100%;max-width:100%;"
        ></video>
      `;

    }

    box.innerHTML = `
      <div class="watchbox">

        ${playerHtml}

        <div style="margin-top:18px">
          <span class="tag">
            ${esc(v.category || 'Formation')}
          </span>

          <h1>${esc(v.title)}</h1>

          <p class="muted">
            ${esc(v.description || '')}
          </p>
        </div>

        <div class="share">
          <button id="copy">
            Copier le lien
          </button>

          <button id="share">
            Partager
          </button>

          <a class="btn" href="/">
            ← Retour aux formations
          </a>
        </div>

      </div>
    `;

    /* =========================
       PROGRESSION DES VIDÉOS
       ========================= */

    const player = document.querySelector('#player');

    if(player){

      player.addEventListener('timeupdate',()=>{

        if(!player.duration) return;

        progress[v.id] = Math.max(
          Number(progress[v.id] || 0),
          Math.round(
            player.currentTime /
            player.duration *
            100
          )
        );

        save();

      });

      player.addEventListener('ended',()=>{

        progress[v.id] = 100;

        save();

      });

    }

    /* =========================
       COPIER LE LIEN
       ========================= */

    document.querySelector('#copy').onclick = ()=>{

      navigator.clipboard
        .writeText(location.href)
        .then(()=>{

          document.querySelector('#copy').textContent =
            'Lien copié ✓';

        });

    };

    /* =========================
       PARTAGER
       ========================= */

    document.querySelector('#share').onclick = ()=>{

      if(navigator.share){

        navigator.share({
          title:v.title,
          url:location.href
        });

      }else{

        document.querySelector('#copy').click();

      }

    };

  }catch(e){

    console.error(e);

    box.innerHTML = `
      <div class="watchbox">
        <h1>Erreur de chargement</h1>

        <p class="muted">
          Le serveur n’a pas pu répondre.
        </p>
      </div>
    `;

  }

})();
