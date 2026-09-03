const API_URL = "https://script.google.com/macros/s/AKfycbz_iYhLGM7eFgHKZ7M1dq8oZliXncrmkVTGC6Vc0vaBZM8Ag6qQC6YB2BptoizVj6ix/exec";

const DEFAULT_VIDEO = "https://www.w3schools.com/html/mov_bbb.mp4";


async function cargarSpotiflix() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const usuarioActual = (data.usuarios && data.usuarios.length > 0)
      ? (data.usuarios.find(u => u.correo && u.correo.trim().toLowerCase() === "ivanglopezp@gmail.com") || data.usuarios[0])
      : null;

    if (usuarioActual) {
      // Cargar foto de perfil en la navbar
      const avatarImg = document.getElementById("user-avatar");
      if (usuarioActual.foto_perfil && usuarioActual.foto_perfil.trim() !== "") {
        avatarImg.src = usuarioActual.foto_perfil;
        avatarImg.style.display = "block";
      }

      if (usuarioActual.nombre) {
        document.getElementById("user-name").textContent = `Perfil de ${usuarioActual.nombre}`;
      }
    }

    // 1. Películas
    if (usuarioActual && usuarioActual.peliculas_fav && data.cat_peliculas) {
      const peliIds = usuarioActual.peliculas_fav.toString().split(",");
      const pelisFavoritas = peliIds.map(id => {
        return data.cat_peliculas.find(p => p.id && p.id.toString().trim() === id.trim());
      }).filter(Boolean);
      renderCards("fav-movies", pelisFavoritas, false);
      if (pelisFavoritas.length > 0) reproducirElemento(pelisFavoritas[0], false);
    }

    // 2. Series
    if (usuarioActual && usuarioActual.series_fav && data.cat_series) {
      const serieIds = usuarioActual.series_fav.toString().split(",");
      const seriesFavoritas = serieIds.map(id => {
        return data.cat_series.find(s => s.id && s.id.toString().trim() === id.trim());
      }).filter(Boolean);
      renderCards("fav-series", seriesFavoritas, true);
    }

    // 3. Canciones
    if (usuarioActual && usuarioActual.canciones_fav && data.cat_canciones) {
      const cancionIds = usuarioActual.canciones_fav.toString().split(",");
      const cancionesFavoritas = cancionIds.map(id => {
        return data.cat_canciones.find(c => c.id && c.id.toString().trim() === id.trim());
      }).filter(Boolean);
      renderSongs(cancionesFavoritas);
    } else if (data.cat_canciones) {
      // Fallback: mostrar todo el catálogo de canciones si no hay filtro de favoritas
      renderSongs(data.cat_canciones);
    }
    // 3. Libros
    if (usuarioActual && usuarioActual.libros_fav && data.cat_libros) {
      const libroIds = usuarioActual.libros_fav.toString().split(",");
      const librosFavoritos = libroIds.map(id => {
        return data.cat_libros.find(l => l.id && l.id.toString().trim() === id.trim());
      }).filter(Boolean);    
      renderBooks("fav-books", librosFavoritos);
    } else if (data.cat_libros) {
      renderBooks("fav-books", data.cat_libros);
    }
          
    if (usuarioActual && usuarioActual.bandas_fav && data.cat_bandas) {
      const bandasIds = usuarioActual.bandas_fav.toString().split(",").map(id => id.trim());
      const bandasFavoritas = bandasIds.map(id => {
        return data.cat_bandas.find(b => b.id && b.id.toString().trim() === id);
      }).filter(Boolean);
      renderBandas(bandasFavoritas, data.cat_canciones || []);
    } else if (data.cat_bandas) {
      renderBandas(data.cat_bandas, data.cat_canciones || []);
    }

  } catch (error) {
    console.error("Error al cargar los datos:", error);
    document.getElementById("user-name").textContent = "Error al conectar con la API.";
  }
}

// Lógica de reproducción de video
function reproducirElemento(item, autoPlay = true) {
  const videoPlayer = document.getElementById("main-video-player");
  const playingTitle = document.getElementById("playing-title");
  const playingInfo = document.getElementById("playing-info");

  const videoSrc = (item.video && item.video.trim() !== "") ? item.video : DEFAULT_VIDEO;

  videoPlayer.poster = item.poster || "";
  videoPlayer.src = videoSrc;
  playingTitle.textContent = item.nombre || "Sin título";

  const subtitulo = item.temporada 
    ? `Serie • ${item.temporada} Temporadas • ${item.genero || ""}`
    : `Película • ${item.genero || ""} • ${item.year || ""}`;

  playingInfo.textContent = `${subtitulo} ${item.resumen ? "— " + item.resumen : ""}`;

  if (autoPlay) videoPlayer.play().catch(() => {});
}

// Lógica para reproducir canción en la barra inferior
function reproducirCancion(cancion) {
  const audioPlayer = document.getElementById("main-audio-player");
  const titleElem = document.getElementById("audio-track-title");
  const artistElem = document.getElementById("audio-track-artist");

  titleElem.textContent = cancion.cancion || cancion.nombre || "Sin título";
  artistElem.textContent = cancion.artista || "Artista desconocido";

  if (cancion.audio) {
    audioPlayer.src = cancion.audio;
    audioPlayer.play().catch(err => console.log("Error al reproducir audio:", err));
  }
}

// Renderizado de la tabla de canciones
function renderSongs(canciones) {
  const tbody = document.getElementById("songs-list");
  tbody.innerHTML = "";

  if (!canciones || canciones.length === 0) {
    tbody.innerHTML = `<tr><td colspan="4" style="text-align: center; padding: 20px;">No hay canciones disponibles.</td></tr>`;
    return;
  }

  canciones.forEach(cancion => {
    const tr = document.createElement("tr");

    tr.innerHTML = `
      <td class="play-btn-cell">▶</td>
      <td><a href="#" class="song-link">${cancion.cancion || cancion.nombre}</a></td>
      <td>${cancion.artista || "-"}</td>
      <td>${cancion.album || "-"}</td>
    `;

    // Asignar clic tanto al botón play como al nombre de la canción
    tr.querySelector(".play-btn-cell").addEventListener("click", () => reproducirCancion(cancion));
    tr.querySelector(".song-link").addEventListener("click", (e) => {
      e.preventDefault();
      reproducirCancion(cancion);
    });

    tbody.appendChild(tr);
  });
}

function renderBooks(containerId, libros) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!libros || libros.length === 0) {
    container.innerHTML = `<p style="color: #888;">No hay libros disponibles.</p>`;
    return;
  }

  libros.forEach(libro => {
    const card = document.createElement("article");
    card.className = "book-card";

    const linkPdf = libro.link || libro.pdf || "#";

    card.innerHTML = `
      <img src="${libro.poster}" alt="${libro.nombre}" loading="lazy">
      <a href="${linkPdf}" target="_blank" rel="noopener noreferrer" class="btn-read">Leer</a>
    `;

    container.appendChild(card);
  });
}

// Renderizado de carruseles
function renderCards(containerId, items, esSerie = false) {
  const container = document.getElementById(containerId);
  container.innerHTML = "";

  if (!items || items.length === 0) {
    container.innerHTML = `<p style="color: #888;">No hay elementos seleccionados.</p>`;
    return;
  }

  items.forEach(item => {
    const subtitulo = esSerie 
      ? `${item.temporada} Temp. • ${item.genero}`
      : `${item.genero} • ${item.year}`;

    const card = document.createElement("article");
    card.className = "card";
    card.addEventListener("click", () => reproducirElemento(item, true));

    card.innerHTML = `
      <img src="${item.poster}" alt="${item.nombre}" loading="lazy">
      <h4>${item.nombre}</h4>
      <p>${subtitulo}</p>
    `;

    container.appendChild(card);
  });
}

function moverCarrusel(containerId, direccion) {
  const track = document.getElementById(containerId);
  if (!track) return;
  track.scrollBy({ left: direccion * 175 * 3, behavior: 'smooth' });
}
function renderBandas(bandas, catálogoCanciones) {
  const container = document.getElementById("panels-container");
  if (!container) return;

  container.innerHTML = "";

  if (!bandas || bandas.length === 0) {
    container.innerHTML = `<p style="color: #888; text-align: center; width: 100%; padding-top: 20px;">No hay bandas seleccionadas.</p>`;
    return;
  }

  bandas.forEach((banda, index) => {
    const panel = document.createElement("div");
    panel.className = `panel panel${index + 1}`;

    if (banda.photo && banda.photo.trim() !== "") {
      panel.style.backgroundImage = `url('${banda.photo.trim()}')`;
    }

    // Extraer hasta 6 canciones asociadas a la banda
    let htmlCanciones = "";
    for (let i = 1; i <= 6; i++) {
      const nombreCancion = banda[`cancion_${i}`];
      const idCancion = banda[`cancion_${i}_id`];

      if (nombreCancion && nombreCancion !== "#N/A" && nombreCancion.trim() !== "") {
        // Buscar el MP3 real en el catálogo por id si existe
        const cancionObj = catálogoCanciones.find(c => c.id && c.id.toString().trim() === (idCancion || "").toString().trim());
        const audioUrl = cancionObj ? (cancionObj.link || cancionObj.url || "") : "";

        htmlCanciones += `
          <div class="box box${i}" data-src="${audioUrl}" data-title="${nombreCancion}">
            ${nombreCancion}
          </div>
        `;
      }
    }

    panel.innerHTML = `
      <p>${banda.nombre || 'Banda'}</p>
      <div class="centro">
        ${htmlCanciones}
      </div>
      <p>${banda.Pais || ''}</p>
    `;

    container.appendChild(panel);
  });

  activarEventosPaneles();
}

function activarEventosPaneles() {
  const paneletes = document.querySelectorAll('.panel');
  const caja_colores = ['#ef1df3', '#5ae6e6', '#f99a0d', '#f9186b', '#42e25d', '#1db954'];

  paneletes.forEach(panel => {
    panel.addEventListener('click', function() {
      this.classList.toggle('open');
    });

    panel.addEventListener('transitionend', function(e) {
      if (e.propertyName.includes('flex')) {
        this.classList.toggle('open-active');
      }
    });
  });

  const cajas = document.querySelectorAll('.centro .box');
  cajas.forEach(caja => {
    caja.addEventListener('click', function(e) {
      e.stopPropagation(); // Evita cerrar/abrir el panel al hacer clic en la canción

      const colorAzar = caja_colores[Math.floor(Math.random() * caja_colores.length)];
      document.documentElement.style.setProperty('--color', colorAzar);

      const src = this.getAttribute('data-src');
      const title = this.getAttribute('data-title');
      const mainAudioPlayer = document.getElementById('main-audio-player');

      if (src && mainAudioPlayer) {
        mainAudioPlayer.src = src;
        mainAudioPlayer.currentTime = 0;
        mainAudioPlayer.play();

        const titleElem = document.getElementById('audio-track-title');
        if (titleElem) {
          titleElem.textContent = title || "Canción Seleccionada";
        }
      }
    });
  });
}

cargarSpotiflix();
