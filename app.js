const API_URL = "https://script.google.com/macros/s/AKfycbxEC6qGG_MuO3bvBWNsd0HWM-NHc5vRBBX4T3dbkWgnuX1JOz5nU68hm3UDZYqi1FeG/exec";

let catalogoGlobal = [];

async function cargarSpotiflix() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    const usuarioActual = (data.usuarios && data.usuarios.length > 0)
      ? (data.usuarios.find(u => u.correo && u.correo.trim().toLowerCase() === "ivanglopezp@gmail.com") || data.usuarios[0])
      : null;

    if (usuarioActual && usuarioActual.nombre) {
      document.getElementById("user-name").textContent = `Perfil de ${usuarioActual.nombre}`;
    }

    // 1. Guardar y renderizar Películas
    if (usuarioActual && usuarioActual.peliculas_fav && data.cat_peliculas) {
      const peliIds = usuarioActual.peliculas_fav.toString().split(",");
      const pelisFavoritas = peliIds.map(id => {
        return data.cat_peliculas.find(p => p.id && p.id.toString().trim() === id.trim());
      }).filter(Boolean);

      catalogoGlobal.push(...pelisFavoritas);
      renderCards("fav-movies", pelisFavoritas, false);
      
      // Cargar la primera película por defecto en el reproductor
      if (pelisFavoritas.length > 0) {
        reproducirElemento(pelisFavoritas[0]);
      }
    }

    // 2. Guardar y renderizar Series
    if (usuarioActual && usuarioActual.series_fav && data.cat_series) {
      const serieIds = usuarioActual.series_fav.toString().split(",");
      const seriesFavoritas = serieIds.map(id => {
        return data.cat_series.find(s => s.id && s.id.toString().trim() === id.trim());
      }).filter(Boolean);

      catalogoGlobal.push(...seriesFavoritas);
      renderCards("fav-series", seriesFavoritas, true);
    }

  } catch (error) {
    console.error("Error al cargar los datos:", error);
    document.getElementById("user-name").textContent = "Error al conectar con la API.";
  }
}

// Función para cargar el video o la portada según disponibilidad
function reproducirElemento(item) {
  const playerContainer = document.getElementById("featured-player");
  playerContainer.innerHTML = "";

  if (item.video && item.video.trim() !== "") {
    const videoElement = document.createElement("video");
    videoElement.className = "hero-media";
    videoElement.src = item.video;
    videoElement.controls = true;
    videoElement.autoplay = true;

    // Fallback si falla la carga o reproducción del video
    videoElement.onerror = () => mostrarPortadaFallback(item);

    playerContainer.appendChild(videoElement);
  } else {
    mostrarPortadaFallback(item);
  }
}

// Renderiza la portada cuando no hay video o da error
function mostrarPortadaFallback(item) {
  const playerContainer = document.getElementById("featured-player");
  const subtitulo = item.temporada 
    ? `${item.temporada} Temporadas • ${item.genero}`
    : `${item.genero} • ${item.year}`;

  playerContainer.innerHTML = `
    <div class="hero-fallback" style="background-image: url('${item.poster}');">
      <div class="hero-overlay">
        <h2>${item.nombre}</h2>
        <p>${subtitulo}</p>
      </div>
    </div>
  `;
}

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
    card.onclick = () => reproducirElemento(item);

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
  
  const desplazamiento = 175 * 3;
  track.scrollBy({
    left: direccion * desplazamiento,
    behavior: 'smooth'
  });
}

cargarSpotiflix();
