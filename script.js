$(document).ready(() => {
  const API_KEY = "527879194a784a07863114325252404";
  const HOURS_TO_SHOW = 72;

  let currentIndex = 0;
  let totalCards = 0;
  let currentLocation;

  // Selectores
  const $currentTemp = $("#current-temp");
  const $currentWind = $("#current-wind");
  const $btnHours = $("#btn-hours");
  const $btnDays = $("#btn-days");
  const $carousel = $("#carousel");
  const $prevBtn = $("#prev-btn");
  const $nextBtn = $("#next-btn");
  const $dailyContainer = $("#daily-container");
  const $dailyCards = $("#daily-cards");
  const $form = $("#location-form");
  const $input = $("#location-input");

  // Actualiza vista: horas vs días
  function toggleView(view) {
    if (view === "hours") {
      $btnHours.addClass("active");
      $btnDays.removeClass("active");
      $("#carousel-container").show();
      $dailyContainer.hide();
    } else {
      $btnDays.addClass("active");
      $btnHours.removeClass("active");
      $("#carousel-container").hide();
      $dailyContainer.show();
    }
  }

  // Render horas
  function renderHours(data) {
    $carousel.empty();
    data.forEach((hour) => {
      const date = new Date(hour.time);
      const card = $(`
          <div class="card">
            <h4>${date.toLocaleString("es-ES", {
              hour: "2-digit",
              minute: "2-digit",
            })}</h4>
            <img src="${hour.condition.icon}" alt="icono">
            <p>${hour.temp_c}°C</p>
            <p>${hour.condition.text}</p>
          </div>
        `);
      $carousel.append(card);
    });
    totalCards = data.length;
    currentIndex = 0;
    updateCarousel();
  }

  // Render días
  function renderDays(data) {
    $dailyCards.empty();
    data.forEach((day) => {
      const sunrise = day.astro.sunrise;
      const sunset = day.astro.sunset;
      const temps = day.hour;
      // Helper para hora específica
      const getHourTemp = (h) =>
        temps.find((t) => new Date(t.time).getHours() === h).temp_c;
      const rain = day.day.totalprecip_mm;

      const card = $(
        `<div class="daily-card">
            <h4>${day.date}</h4>
            <p>Máx: ${day.day.maxtemp_c}°C / Mín: ${day.day.mintemp_c}°C</p>
            <p>06:00: ${getHourTemp(6)}°C</p>
            <p>14:00: ${getHourTemp(14)}°C</p>
            <p>21:00: ${getHourTemp(21)}°C</p>
            <p>Lluvia: ${rain} mm</p>
            <p>Salida: ${sunrise} / Puesta: ${sunset}</p>
          </div>`
      );
      $dailyCards.append(card);
    });
  }

  // Mover carrusel
  function updateCarousel() {
    const width = $carousel.find(".card").outerWidth(true);
    $carousel.css("transform", `translateX(${-currentIndex * width}px)`);
  }

  // Fetch general (hours + current + daily)
  function fetchWeather(q) {
    currentLocation = q;
    // Consulta única para datos actuales y forecast
    fetch(
      `https://api.weatherapi.com/v1/forecast.json?key=${API_KEY}&q=${q}&days=3&aqi=no&alerts=no&lang=es`
    )
      .then((r) => r.json())
      .then((json) => {
        // Actuales
        $currentTemp.text(json.current.temp_c);
        $currentWind.text(json.current.wind_kph);
        $("#current-icon")
          .attr("src", json.current.condition.icon)
          .attr("alt", json.current.condition.text);
        // Horas
        const hours = json.forecast.forecastday
          .flatMap((d) => d.hour)
          .slice(0, HOURS_TO_SHOW);
        // Días
        const days = json.forecast.forecastday;
        renderHours(hours);
        renderDays(days);
      })
      .catch((err) => console.error("Error:", err));
  }

  // Eventos
  $btnHours.on("click", () => toggleView("hours"));
  $btnDays.on("click", () => toggleView("days"));

  $prevBtn.on("click", () => {
    if (currentIndex > 0) currentIndex--;
    updateCarousel();
  });
  $nextBtn.on("click", () => {
    if (currentIndex < totalCards - 1) currentIndex++;
    updateCarousel();
  });

  $form.on("submit", (e) => {
    e.preventDefault();
    const loc = $input.val().trim();
    if (loc) fetchWeather(loc);
  });

  // Inicialización
  toggleView("hours");
  $form.hide();

  if (navigator.geolocation) {
    navigator.geolocation.getCurrentPosition(
      (pos) => fetchWeather(`${pos.coords.latitude},${pos.coords.longitude}`),
      () => $form.show()
    );
  } else {
    $form.show();
  }
});
