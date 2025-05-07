let localidad = 'Badolatosa'; // valor por defecto

// Función principal de carga
function cargarTiempo(ciudad) {
  const API_KEY = '527879194a784a07863114325252404'; 
  const URL = `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${ciudad}&days=10&aqi=no&alerts=no`;

  $.ajax({
    url: URL,
    method: 'GET',
    dataType: 'json',
    success: function (data) {
      $('#carrusel-horas').empty();
      $('#carrusel-dias').empty();
      mostrarCabecera(data);
      cargarHoras(data.forecast.forecastday);
      cargarDias(data.forecast.forecastday);
      configurarEventos();
      $('#vista-dias').trigger('click'); // Mostrar por días por defecto

    },
    error: function () {
      alert('No se pudo obtener el tiempo. Verifica la ciudad o tu conexión.');
    }
  });
}

// Mostrar cabecera
function mostrarCabecera(data) {
  $('#icono-tiempo').attr('src', data.current.condition.icon);
  $('#temperatura-actual').text(`${data.current.temp_c} °C`);
  $('#viento-actual').text(`Viento: ${data.current.wind_kph} km/h`);
  $('#ubicacion').text(`El tiempo en: ${data.location.name}, ${data.location.region}, ${data.location.country}`);
}

// Tarjetas por horas
function cargarHoras(dias) {
  const contenedor = $('#carrusel-horas');
  let totalHoras = 0;
  let diaAnterior = '';

  dias.forEach(dia => {
    const fecha = new Date(dia.date);
    const diaTexto = fecha.toLocaleDateString('es-ES', { weekday: 'short', day: 'numeric' });

    dia.hour.forEach(hora => {
      const horaTexto = hora.time.split(' ')[1];

      // Insertar separador si cambia el día
      if (diaTexto !== diaAnterior) {
        contenedor.append(`<div class="dia-separador">${diaTexto}</div>`);
        diaAnterior = diaTexto;
      }

      const tarjeta = `
        <div class="tarjeta-hora">
          <div>${horaTexto}</div>
          <img src="${hora.condition.icon}" alt="icono">
          <div>${hora.temp_c} °C</div>
            <div>${hora.precip_mm} mm | ${hora.chance_of_rain}%</div>
        </div>`;
      contenedor.append(tarjeta);
      totalHoras++;
    });
  });

  $('#rango-horas').attr('max', totalHoras - 1);
}

// Tarjetas por días
function cargarDias(dias) {
  const contenedor = $('#carrusel-dias');

  dias.forEach(dia => {
    const hora6 = dia.hour.find(h => h.time.includes('06:00'));
    const hora14 = dia.hour.find(h => h.time.includes('14:00'));
    const hora22 = dia.hour.find(h => h.time.includes('22:00'));

    const fecha = new Date(dia.date);
    const diaTexto = fecha.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric' });

    const tarjeta = `
      <div class="tarjeta-dia">
        <h3>${diaTexto}</h3>
        <p>🌡️ Máx: ${dia.day.maxtemp_c}°C / Mín: ${dia.day.mintemp_c}°C</p>
        <p><strong> 06:00 →</strong>${hora6?.temp_c ?? '-'}°C</p>
        <p><strong> 14:00 →</strong>${hora14?.temp_c ?? '-'}°C</p>
        <p><strong> 22:00 →</strong>${hora22?.temp_c ?? '-'}°C</p>
        <p>☔ Lluvia: ${dia.day.totalprecip_mm} mm</p>
        <p>💨 Viento: ${dia.day.maxwind_kph} km/h</p>
        <p>🌅 ${dia.astro.sunrise} / 🌇 ${dia.astro.sunset}</p>
      </div>`;
    contenedor.append(tarjeta);
  });

  $('#rango-dias').attr('max', dias.length - 1);
}

// Eventos y controles
function configurarEventos() {
  $('#vista-horas').on('click', function () {
    $('#contenedor-horas').removeClass('oculto');
    $('#contenedor-dias').addClass('oculto');
  });

  $('#vista-dias').on('click', function () {
    $('#contenedor-dias').removeClass('oculto');
    $('#contenedor-horas').addClass('oculto');
  });

  $('#rango-horas').on('input', function () {
    const index = $(this).val();
    $('#carrusel-horas').css('transform', `translateX(-${index * 110}px)`);
  });

  $('#rango-dias').on('input', function () {
    const index = $(this).val();
    $('#carrusel-dias').css('transform', `translateX(-${index * 310}px)`);
  });
}

// Buscar por ciudad
$('#buscar-ciudad').on('click', () => {
  const ciudad = $('#input-ciudad').val();
  if (ciudad) cargarTiempo(ciudad);
});

// Usar ubicación actual
$('#usar-ubicacion').on('click', () => {
  navigator.geolocation.getCurrentPosition(
    (pos) => {
      const coords = `${pos.coords.latitude},${pos.coords.longitude}`;
      cargarTiempo(coords);
    },
    () => {
      alert('No se pudo obtener tu ubicación.');
    }
  );
});

// Carga inicial
$(document).ready(() => {
  cargarTiempo(localidad);
});
