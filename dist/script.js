/**
 * This script will handle weather api
 */
//API key open weather
const API_KEY = "f3d56a9a93d3db457dfd32f11af18c9d";
//url for fetch weather data
const BASE_URL = `https://api.openweathermap.org/data/2.5/onecall`;
//get place from lat/lang
const GET_PLACE = `http://api.openweathermap.org/geo/1.0/reverse`;
//icon url
const ICON_URL = "http://openweathermap.org/img/w/";
let form = null;
let latitute = null;
let longitute = null;
const getLocation=()=> {
  if (navigator.geolocation) {
     navigator.geolocation.getCurrentPosition(setPosition);
  } else { 
    alert("Geolocation is not supported by this browser.")
  }
}
const setPosition=(position)=>{
  latitute.value=position.coords.latitude
  longitute.value=position.coords.longitude
}
/**
 * On window load event handler
 */
window.onload = () => {
  form = document.getElementById("weather-form");
  latitute = document.getElementById("lat");
  longitute = document.getElementById("lang");
  getLocation()
  //set event listner for form
  if (form) {
    form.addEventListener("submit", (e) => validatate(e));
  }
};
/**
 * This function will check empty value and numeric value and render validation message
 * @param {object} element Dom element
 * @return {Boolean} true/false
 */
const validatateEmptyAndNumeric = (element) => {
  let val = element.value;
  //check value empty
  if (typeof val == "string" && val.trim().length == 0) {
    element.setAttribute("class", "form-control is-invalid");
    console.log(element.nextElementSibling);
    element.nextElementSibling.innerHTML = "Value not allowed to be empty";
    return false;
  } else {
    //check value is numeric
    if ((Number(val) === val && val % 1 === 0) || (Number(val) === val && val % 1 !== 0)) {
      element.setAttribute("class", "form-control is-invalid");
      console.log(element.nextElementSibling);
      element.nextElementSibling.innerHTML = "Value must be a numeric value";
      return false;
    }
    //set text-danger span to empty
    element.setAttribute("class", "form-control");
    element.nextElementSibling.innerHTML = "";
    return true;
  }
};
/**
 * This function will check valid latitude value and render validation message
 * @param {object} element Dom element
 * @return {Boolean} true/false
 */
const validateLatitude = (element) => {
  let num = parseInt(element.value);
  //validate latitude value
  if (isFinite(num) && Math.abs(num) <= 90) {
    element.setAttribute("class", "form-control");
    element.nextElementSibling.innerHTML = "";

    return true;
  } else {
    element.setAttribute("class", "form-control  is-invalid");
    element.nextElementSibling.innerHTML =
      "Invalid latitude value value not greater then 90 and less then -90";

    return false;
  }
};
/**
 * This function will check longitute and render validation message
 * @param {object} element Dom element
 * @return {Boolean} true/false
 */
const validateLongitude = (element) => {
  let num = parseInt(element.value);
  //validate longitute value
  if (isFinite(num) && Math.abs(num) <= 180) {
    element.nextElementSibling.innerHTML = "";

    element.setAttribute("class", "form-control");
    return true;
  } else {
    element.setAttribute("class", "form-control  is-invalid");
    element.nextElementSibling.innerHTML =
      "Invalid latitude value value not greater then 180 and less then -180";
    return false;
  }
};
/**
 * This function will validate all input value if valid then call ajax
 * @param {object} element Dom element
 * @return {Boolean} true/false
 */
const validatate = (event) => {
  event.preventDefault();

  if (
    validatateEmptyAndNumeric(latitute) &&
    validatateEmptyAndNumeric(longitute)
  ) {
    if (validateLatitude(latitute) && validateLongitude(longitute)) {
      callAjax(latitute.value, longitute.value);
    }
  }
};
/**
 * fetch city from lat and lang value
 * @param {float} lat latitude value
 * @param {float} lang longitude value
 */
const getCity = (lat, lang) => {
  let api_url = `${GET_PLACE}?lat=${lat}&lon=${lang}&appid=${API_KEY}`;
  fetch(api_url)
    .then((res) => res.json())
    .then((response) => {
      let city = Array.isArray(response) ? response[0].name : "-";
      fetchWeather(lat, lang, city);
    })
    .catch((err) => {
      // button.removeAttribute("disable");
      // button.innerText = "Submit";
      console.log(err)
      alert("There is no city attach to this location");
      fetchWeather(lat, lang, "");
    });
};

/**
 * call ajax and set button loading
 * @param {float} lat latitude value
 * @param {float} lang longitude value
 */
const callAjax = (lat, lang) => {
  if (typeof lat == "string") {
    lat = lat.trim();
  }
  if (typeof lang == "string") {
    lang = lang.trim();
  }
  let button = document.getElementById("button");
  button.setAttribute("disable", true);
  button.innerText = "Sending...";
  getCity(lat, lang);
};

/**
 * fetch weather data by lat/lang data
 * @param {float} lat latitude value
 * @param {float} lang longitude value
 * @param {string} city city value
 */
const fetchWeather = (lat, lang, city) => {
  let api_url = `${BASE_URL}?lat=${lat}&lon=${lang}&appid=${API_KEY}&exclude=minutely,hourly&units=metric`;
  fetch(api_url)
    .then((res) => res.json())
    .then((response) => {
      //set disable button
      button.removeAttribute("disable");
      button.innerText = "Submit";
      //check result element
      if (
        document.getElementById("current-result") &&
        document.getElementById("week-result")
      ) {
        document.getElementById("current-result").innerHTML = "";
        document.getElementById("week-result").innerHTML = "";
        //get current weather,temperature and date time
        document.getElementById(
          "current-result"
        ).innerHTML = renderCurrentWeather({
          city,
          weatherType:
            response.current.weather && Array.isArray(response.current.weather)
              ? response.current.weather[0].description
              : "",
          weatherIcon:
            response.current.weather && Array.isArray(response.current.weather)
              ? response.current.weather[0].icon
              : "",
          temp: `${Math.round(response.current.temp)}°C`,
          dateTime: new Date(response.current.dt * 1000),
        });
        //get days weather,temperature and date time
        response.daily.map((val) => {
          if (response.current.temp != val.dt) {
            let data = {
              weatherType:
                val.weather && Array.isArray(val.weather)
                  ? val.weather[0].description
                  : "",
              weatherIcon:
                val.weather && Array.isArray(val.weather)
                  ? val.weather[0].icon
                  : "",
              temp: `${Math.round(val.temp.day)}°C`,
              dateTime: new Date(val.dt * 1000).toLocaleString("en-us", {
                weekday: "long",
              }),
            };

            document.getElementById(
              "week-result"
            ).innerHTML += renderWeekWeather(data);
          }
        });
      }
    })
    .catch((err) => {
      //catch error
      console.log(err);
      button.removeAttribute("disable");
      button.innerText = "Submit";
      alert("Something went wrong wrong while fetching data");
    });
};
/**
 * set current format for html
 * @param {object} data data object
 */
const renderCurrentWeather = (data) => {
  let weekDay = data.dateTime.toLocaleString("en-us", {
    weekday: "long",
  });
  let date = data.dateTime.toLocaleString("en-us", {
    year: "numeric",
    month: "long",
    day: "2-digit",
  });
  return `<div class="col">
  <div class="display-4">${data.city}</div>
  <div class="display-7">${weekDay}</div>
  <div class="display-8">${date}</div>

  
  <div class ="display-7">${data.weatherType} <img title="${data.weatherType}" src="${ICON_URL}${data.weatherIcon}.png"/></div>
  <div class="display-5">${data.temp}</div>
 
  </div>`;
};
/**
 * set days weathers format for html
 * @param {object} data data object
 */
const renderWeekWeather = (data) => {
  return `<div class="col">
  <div class="text-center">
  <div class="display-7">${data.dateTime}</div>

  <img title="${data.weatherType}" src="${ICON_URL}${data.weatherIcon}.png"/>
  <div class="display-7">${data.temp}</div>
  </div>
  </div>`;
};
