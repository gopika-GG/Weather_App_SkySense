    const apiKey = "41229cf61edd8e1021251c339a96e62c"; // Replace with your OpenWeatherMap API key
    const openUVKey = "YOUR_OPENUV_API_KEY"; // Replace with your OpenUV API key
    const geoKey = "41229cf61edd8e1021251c339a96e62c"; // For geocoding city → lat/lon
    let lastCoords = null;
    let weatherData = {};
    

    async function getWeather() {
      const city = document.getElementById("cityInput").value;
      const urlCurrent = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
      const urlForecast = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

      try {
        const responseCurrent = await fetch(urlCurrent);
        const dataCurrent = await responseCurrent.json();

        if (dataCurrent.cod === 200) {
          lastCoords = dataCurrent.coord;
          document.getElementById("weatherResult").innerHTML = `
            <h4>${dataCurrent.name}, ${dataCurrent.sys.country}</h4>
            <img src="https://openweathermap.org/img/wn/${dataCurrent.weather[0].icon}@2x.png" alt="icon">
            <p><strong>${dataCurrent.main.temp} °C</strong></p>
            <p>${dataCurrent.weather[0].description}</p>
            <p>Humidity: ${dataCurrent.main.humidity}% | Wind: ${dataCurrent.wind.speed} m/s</p>
          `;
        } else {
          document.getElementById("weatherResult").innerHTML = `<div class="alert alert-danger">City not found!</div>`;
        }

        const responseForecast = await fetch(urlForecast);
        const dataForecast = await responseForecast.json();

        weatherData = {}; // reset
        let forecastHTML = "";
        if (dataForecast.cod === "200") {
          for (let i = 0; i < dataForecast.list.length; i += 8) {
            const item = dataForecast.list[i];
            const hour = new Date(item.dt * 1000).getHours();
            weatherData[hour] = {
              condition: item.weather[0].main,
              temp: item.main.temp
            };
            const date = new Date(item.dt_txt).toLocaleDateString("en-IN", { weekday: "short", day: "numeric", month: "short" });
                forecastHTML += `
                  <div class="col-6 col-md-4 text-center">
                       <div class="card p-2 shadow-sm">
                        <h6>${date}</h6>
                       <img src="https://openweathermap.org/img/wn/${item.weather[0].icon}@4x.png" 
                         alt="icon" class="img-fluid" style="max-height:80px; max-width:80px; object-fit:contain;">
                             <p class="mb-0">${item.main.temp} °C</p>
                              <small>${item.weather[0].description}</small>
                     </div>
                   </div>
                  `;      
                 }
          document.getElementById("forecast").innerHTML = forecastHTML;
        }
      } catch (error) {
        document.getElementById("weatherResult").inner
        TML = `<div class="alert alert-warning">Error fetching data.</div>`;
      }
    }

    async function getAirQuality() {
      if (!lastCoords) {
        document.getElementById("aqiResult").innerHTML = `<div class="alert alert-warning">Please fetch weather first!</div>`;
        return;
      }

      const { lat, lon } = lastCoords;
      const urlAQI = `https://api.openweathermap.org/data/2.5/air_pollution?lat=${lat}&lon=${lon}&appid=${apiKey}`;

      try {
        const responseAQI = await fetch(urlAQI);
        const dataAQI = await responseAQI.json();

        if (dataAQI.list && dataAQI.list.length > 0) {
          const aqi = dataAQI.list[0].main.aqi;
          const levels = ["Good", "Fair", "Moderate", "Poor", "Very Poor"];
          document.getElementById("aqiResult").innerHTML = `
            <div class="alert alert-info text-center">
              <strong>Air Quality Index:</strong> ${aqi} (${levels[aqi-1]})
            </div>
          `;
        } else {
          document.getElementById("aqiResult").innerHTML = `<div class="alert alert-danger">AQI data not available!</div>`;
        }
      } catch (error) {
        document.getElementById("aqiResult").innerHTML = `<div class="alert alert-warning">Error fetching AQI data.</div>`;
      }
    }


    // Health Risk Alert
    function healthRiskAlert(temp, humidity) {
      if (temp > 35 && humidity > 70) {
        return { msg: "⚠️ High risk: Hot and humid conditions — avoid strenuous outdoor activity.", type: "danger" };
      } else if (temp < 10) {
        return { msg: "❄️ Cold risk: Low temperature — dress warmly to prevent health issues.", type: "primary" };
      } else if (humidity > 80) {
        return { msg: "💧 High humidity: Possible discomfort — stay hydrated.", type: "warning" };
      } else {
        return { msg: "✅ Conditions look safe — no major health risks detected.", type: "success" };
      }
    }
    function openHealthPage() {
      document.getElementById("app").style.display = "none";
      document.getElementById("healthPage").style.display = "block";
    }
    function showHealthRiskAlert() {
      const temp = parseFloat(document.getElementById("tempInput").value);
      const humidity = parseFloat(document.getElementById("humidityInput").value);
      if (isNaN(temp) || isNaN(humidity)) {
        alert("Please enter both temperature and humidity values.");
        return;
      }
      const result = healthRiskAlert(temp, humidity);
      document.getElementById("healthResult").innerHTML = `<div class="alert alert-${result.type}">${result.msg}</div>`;
    }

    // Back button
    function goBack() {
      document.getElementById("commutePage").style.display = "none";
      document.getElementById("healthPage").style.display = "none";
      document.getElementById("app").style.display = "block";
    }

    // Best Activity Time logic
  let forecastData = null;

function getWeatherforActivity() {
  const city = document.getElementById("cityInput").value;
  const apiKey = "41229cf61edd8e1021251c339a96e62c"; // replace with your OpenWeatherMap API key
  const url = `https://api.openweathermap.org/data/2.5/forecast?q=${city}&appid=${apiKey}&units=metric`;

  fetch(url)
    .then(response => response.json())
    .then(data => {
      forecastData = data; // save globally

      // Current weather
      document.getElementById("weatherResult").innerText =
        `🌡️ Temp: ${data.list[0].main.temp}°C, ${data.list[0].weather[0].main}`;

      // Forecast cards
      const forecastDiv = document.getElementById("forecast");
      forecastDiv.innerHTML = "";
      data.list.slice(0, 5).forEach(item => {
        const hour = new Date(item.dt * 1000).getHours();
        forecastDiv.innerHTML += `
          <div class="col-md-2 card p-2 text-center">
            <p>${hour}:00</p>
            <p>${item.main.temp}°C</p>
            <p>${item.weather[0].main}</p>
          </div>
        `;
      });
    })
    .catch(err => console.error(err));
}


    function findBestActivityTime() {
  const activity = document.getElementById("activitySelect").value;

  if (!forecastData) {
    document.getElementById("activityResult").innerText = "Please fetch weather first.";
    return;
  }

  let bestHour = null;
  let bestScore = -Infinity;
  let bestCondition = "";

  forecastData.list.forEach(item => {
    const hour = new Date(item.dt * 1000).getHours();
    const temp = item.main.temp;
    const condition = item.weather[0].main;

    let score = 0;
    switch (activity) {
      case "Jogging":
        if (temp >= 18 && temp <= 26) score += 5;
        if (condition === "Clear" || condition === "Clouds") score += 3;
        if (condition === "Rain") score -= 5;
        break;
      case "Walking":
        if (temp >= 16 && temp <= 30) score += 4;
        if (condition !== "Rain") score += 2;
        break;
      case "Picnic":
        if (temp >= 20 && temp <= 32) score += 5;
        if (condition === "Clear") score += 4;
        if (condition === "Rain") score -= 6;
        break;
      case "Cycling":
        if (temp >= 15 && temp <= 28) score += 5;
        if (condition === "Clear" || condition === "Clouds") score += 3;
        if (condition === "Rain") score -= 4;
        break;
    }

    if (score > bestScore) {
      bestScore = score;
      bestHour = hour;
      bestCondition = condition;
    }
  });

  const resultDiv = document.getElementById("activityResult");

  if (bestHour !== null) {
    resultDiv.innerHTML =
      `<div class="alert alert-success">
        🌟 Best time for ${activity}: ${bestHour}:00 hrs<br>
        Condition: ${bestCondition}
      </div>`;
  } else {
    resultDiv.innerHTML =
      `<div class="alert alert-danger">No suitable time found in forecast.</div>`;
  }

  // ✨ Add fade-in animation
  resultDiv.classList.remove("animated-result");
  void resultDiv.offsetWidth; // trigger reflow
  resultDiv.classList.add("animated-result");

  // ✨ Change background based on activity
  document.body.className = ""; // reset
  if (activity === "Jogging") document.body.classList.add("bg-jogging");
  if (activity === "Walking") document.body.classList.add("bg-walking");
  if (activity === "Picnic") document.body.classList.add("bg-picnic");
  if (activity === "Cycling") document.body.classList.add("bg-cycling");
}


// 🌤️ UV Protect
async function getWeatherData() {
  const city = document.getElementById("cityInput").value.trim();
  if (!city) {
    document.getElementById("uvResult").innerHTML =
      `<div class="alert alert-danger">⚠️ Please enter a city name.</div>`;
    return;
  }

  try {
    // 1️⃣ Get city coordinates + Sunrise/Sunset
    const geoUrl = `https://api.openweathermap.org/data/2.5/weather?q=${city}&appid=${apiKey}&units=metric`;
    const geoRes = await fetch(geoUrl);
    const geoData = await geoRes.json();

    if (!geoData.coord) {
      document.getElementById("uvResult").innerHTML =
        `<div class="alert alert-danger">❌ City not found.</div>`;
      return;
    }

    const lat = geoData.coord.lat;
    const lon = geoData.coord.lon;

    // Sunrise/Sunset always available
    const sunrise = new Date(geoData.sys.sunrise * 1000).toLocaleTimeString();
    const sunset = new Date(geoData.sys.sunset * 1000).toLocaleTimeString();
    document.getElementById("sunResult").innerHTML =
      `<div class="alert alert-warning">
        🌅 Sunrise: ${sunrise}<br>🌇 Sunset: ${sunset}
      </div>`;

    // 2️⃣ Get UV Index from One Call API
    // const uvUrl = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&appid=${apiKey}&units=metric`;
    // const uvRes = await fetch(uvUrl);
    // const uvData = await uvRes.json();  // ✅ define uvData here

    // ✅ Safe check
    // if (!uvData.current || uvData.current.uvi === undefined) {
    //   document.getElementById("uvResult").innerHTML =
    //     `<div class="alert alert-secondary">
    //       🌤️ UV Index data not available for ${city}.<br>
    //       Try another city or upgrade API plan.
    //     </div>`;
    //   return;
    // }

  //   const uv = uvData.current.uvi;
  //   let advice = "", alertClass = "", icon = "";

  //   if (uv <= 2) { advice = "Low risk. Safe outdoors."; alertClass = "success"; icon = "🌤️"; }
  //   else if (uv <= 5) { advice = "Moderate. Use sunscreen & sunglasses."; alertClass = "info"; icon = "😎"; }
  //   else if (uv <= 7) { advice = "High. SPF 30+, avoid midday sun."; alertClass = "warning"; icon = "☀️"; }
  //   else if (uv <= 10) { advice = "Very high. Protective clothing needed."; alertClass = "danger"; icon = "🔥"; }
  //   else { advice = "Extreme. Avoid sun exposure."; alertClass = "dark"; icon = "⚠️"; }

  //   document.getElementById("uvResult").innerHTML =
  //     `<div class="alert alert-${alertClass}">
  //       ${icon} UV Index: <strong>${uv}</strong><br>${advice}
  //     </div>`;

  } 
  catch (err) {
    document.getElementById("uvResult").innerHTML =
      `<div class="alert alert-danger">❌ Error: ${err.message}</div>`;
  }
}

    