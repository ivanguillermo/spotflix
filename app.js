const API_URL = "https://script.google.com/macros/s/AKfycbxEC6qGG_MuO3bvBWNsd0HWM-NHc5vRBBX4T3dbkWgnuX1JOz5nU68hm3UDZYqi1FeG/exec";

async function cargarSpotiflix() {
  try {
    const res = await fetch(API_URL);
    const data = await res.json();

    // 1. Obtener usuario activo con fallback seguro
    const usuarioActual = (data.usuarios && data.usuarios.length > 0)
      ? (data.usuarios.find(u => u.correo && u.correo.trim().toLowerCase() === "ivan@gmail.com") || data.usuarios[0])
      : null;

    if (usuarioActual && usuarioActual.nombre) {
      document.getElementById("user-name").textContent = `Perfil de ${usuarioActual.nombre}`;
    } else {
      document.getElementById("user-name").textContent = "Perfil de Usuario";
    }

    // 2. Renderizar Películas
    if (usuarioActual && usuarioActual.peliculas_fav && data.cat_peliculas) {
      const peliIds = usuarioActual.peliculas_fav.toString().split(",");
      const pelisFavoritas = peliIds.map(id => {
        return data.cat_peliculas.find(p => p.id && p.id.toString().trim() === id.trim());
      }).filter(Boolean);

      renderCards("fav-movies", pelisFavoritas, false);
    }

    // 3. Renderizar Series
    if (usuarioActual && usuarioActual.series_fav && data.cat_series) {
      const serieIds = usuarioActual.series_fav.toString().split(",");
      const seriesFavoritas = serieIds.map(id => {
        return data.cat_series.find(s => s.id && s.id.toString().trim() === id.trim());
      }).filter(Boolean);

      renderCards("fav-series", seriesFavoritas, true);
    }

  } catch (error) {
    console.error("Error al cargar los datos:", error);
    document.getElementById("user-name").textContent = "Error al conectar con la API.";
  }
}

// Genera el HTML de las tarjetas
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

    container.innerHTML += `
      <article class="card">
        <img src="${item.poster}" alt="${item.nombre}" loading="lazy">
        <h4>${item.nombre}</h4>
        <p>${subtitulo}</p>
      </article>
    `;
  });
}

// Desplazamiento horizontal para cualquier pasarela
function moverCarrusel(containerId, direccion) {
  const track = document.getElementById(containerId);
  if (!track) return;
  
  const desplazamiento = 175 * 3; // Mueve 3 tarjetas (160px ancho + 15px gap)
  track.scrollBy({
    left: direccion * desplazamiento,
    behavior: 'smooth'
  });
}

// Inicializar al cargar el script
cargarSpotiflix();
