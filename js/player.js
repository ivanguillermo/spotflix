// --- MANEJO DEL REPRODUCTOR PRINCIPAL DE VÍDEO ---
const videoPlayer = document.getElementById('main-video-player');
const playerWrapper = document.getElementById('player-section');
const sidepanelEpisodes = document.getElementById('sidevideoplayer');

// Alternar Tamaño (Normal / Grande)
document.getElementById('btn-toggle-size').addEventListener('click', () => {
  playerWrapper.classList.toggle('size-normal');
  playerWrapper.classList.toggle('size-large');
});

// Mostrar / Ocultar Panel de Episodios
document.getElementById('btn-toggle-sideview').addEventListener('click', () => {
  sidepanelEpisodes.classList.toggle('hidden');
});

// Pantalla Completa
document.getElementById('btn-fullscreen').addEventListener('click', () => {
  if (videoPlayer.requestFullscreen) {
    videoPlayer.requestFullscreen();
  } else if (videoPlayer.webkitRequestFullscreen) {
    videoPlayer.webkitRequestFullscreen();
  }
});

function skipVideo(seconds) {
  videoPlayer.currentTime += seconds;
}

// Cargar Serie y sus Episodios en el Reproductor
function loadSeriesToPlayer(seriesObj) {
  document.getElementById('current-media-title').textContent = seriesObj.title;
  const listContainer = document.getElementById('episodios-list');
  listContainer.innerHTML = '';

  seriesObj.episodes.forEach((ep, index) => {
    const li = document.createElement('li');
    li.textContent = `${index + 1}. ${ep.title}`;
    li.onclick = () => {
      videoPlayer.src = ep.videoUrl;
      videoPlayer.play();
    };
    listContainer.appendChild(li);
  });

  // Mostrar panel si estaba oculto
  sidepanelEpisodes.classList.remove('hidden');
}

// Cargar Álbum (Con Portada Fija en Reproductor Principal)
function loadAlbumToPlayer(albumObj) {
  videoPlayer.pause();
  videoPlayer.poster = albumObj.coverUrl;
  videoPlayer.src = albumObj.audioOrVideoUrl;
  videoPlayer.play();
  sidepanelEpisodes.classList.add('hidden');
}

// --- MANEJO DEL REPRODUCTOR DE AUDIO FIX (FOOTER) ---
const audioElement = document.getElementById('audio-element');
const btnPlayAudio = document.getElementById('rep_play-btn');

function playSong(song) {
  audioElement.src = song.url;
  document.getElementById('song_on_title').textContent = song.title;
  document.getElementById('song_on_artist').textContent = song.artist;
  audioElement.play();
  btnPlayAudio.innerHTML = '<i class="fa-solid fa-pause"></i>';
}

btnPlayAudio.addEventListener('click', () => {
  if (audioElement.paused) {
    audioElement.play();
    btnPlayAudio.innerHTML = '<i class="fa-solid fa-pause"></i>';
  } else {
    audioElement.pause();
    btnPlayAudio.innerHTML = '<i class="fa-solid fa-play"></i>';
  }
});
