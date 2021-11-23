window.axios = require('axios');
window.bootstrap = require('bootstrap');

let regionSelect = document.querySelector('#region');
let citySelect = document.querySelector('#city');

function getDoubleDigit(a) {
    if (a < 10) {
        return `0${a}`;
    } else {
        return a;
    }
}

function time(){
    let d = new Date();
    let s = d.getSeconds();
    let m = d.getMinutes();
    let h = d.getHours();

    document.querySelector('#clock').innerText = `${getDoubleDigit(h)}:${getDoubleDigit(m)}:${getDoubleDigit(s)}`;
    document.querySelector('#date').innerText = `${d.getFullYear()}-${d.getMonth() + 1}-${d.getDate()}`;

};

setInterval(time,1000);

document.addEventListener('DOMContentLoaded', function() {
    fetch('/weather/places').then(response => response.json()).then(data => {

        let rObj = new Set();
        let filteredRegions = data.filter(el => {
            let duplicate = rObj.has(el.administrativeDivision);
            rObj.add(el.administrativeDivision);
            return !duplicate;
        });

        filteredRegions.sort((a,b) => (a.administrativeDivision > b.administrativeDivision ? 1 : -1));

        for (let r of filteredRegions) {
            if (r.countryCode == 'LT') {
                let reg_option = document.createElement('option');
                reg_option.innerText = r.administrativeDivision;
                reg_option.value = r.administrativeDivision;
                regionSelect.appendChild(reg_option);
            }
        };

        for (let p of data) {
            if (p.countryCode == 'LT') {
                let city_option = document.createElement('option');
                city_option.value = p.administrativeDivision;
                city_option.innerText = p.name;
                city_option.classList.add(p.code);
                citySelect.appendChild(city_option);
            }
        }
    });
});


regionSelect.addEventListener('input', function() {
    let cities = document.querySelectorAll('#city > *');
    for (let i of cities) {
        if (i.value != this.value) {
            i.style.display = 'none';
            citySelect.value = null;
        } else if (this.value == '-- Pasirinkite savivaldybę') {
            i.style.display = 'block';
        } else  {
            i.style.display = 'block';
        }
    }
});

function createNewForecastItem(conditionCode, temperature, time, wind) {
    let newDiv = document.createElement('div');
    newDiv.classList.add('col-12');
    let newForecast = document.createElement('i');
    newForecast.classList.add('fas');
    newForecast.classList.add(conditionCode);
    let forecastTime = document.createElement('div');
    forecastTime.innerText = time;
    let newTemp = document.createElement('div');
    newTemp.innerText = `${temperature}°C`;
    let windImage = document.createElement('div');
    windImage.classList.add('fas');
    windImage.classList.add('fa-wind');
    let windSpeed = document.createElement('span');
    windSpeed.innerText = `${wind} m/s`;
    newDiv.appendChild(forecastTime);
    newDiv.appendChild(newForecast);
    newDiv.appendChild(newTemp);
    newDiv.appendChild(windImage);
    newDiv.appendChild(windSpeed);
    return newDiv;
};

function setWeatherPicture(conditionCode) {
    if (conditionCode == 'clear') {
        return 'fa-sun';
    } else if (conditionCode == 'isolated-clouds') {
        return 'fa-cloud-sun';
    } else if (conditionCode == 'scattered-clouds') {
        return 'fa-cloud-sun';
    } else if (conditionCode == 'overcast') {
        return 'fa-cloud';
    } else if (conditionCode == 'light-rain') {
        return 'fa-cloud-rain';
    } else if (conditionCode == 'moderate-rain') {
        return 'fa-cloud-rain';
    } else if (conditionCode == 'heavy-rain') {
        return 'fa-cloud-showers-heavy';
    } else if (conditionCode == 'sleet') {
        return 'fa-cloud-meatball';
    } else if (conditionCode == 'light-snow') {
        return 'fa-snowflake';
    } else if (conditionCode == 'moderate-snow') {
        return 'fa-snowflake';
    } else if (conditionCode == 'heavy-snow') {
        return 'fa-snowflake';
    } else if (conditionCode == 'fog') {
        return 'fa-smog';
    } else {
        return 'no data';
    }
};

citySelect.addEventListener('input', function() {
    let selection = citySelect.options[citySelect.selectedIndex].className;

    fetch(`./weather/places/${selection}`).
    then(response => response.json()).
    then(data => {

        let time = new Date;
        let currentDate = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
        let currentTime = `${time.getHours()}`;
        let weatherNow = document.querySelector('#weather_now');
        weatherNow.innerHTML = '';
        let laterToday = document.querySelector('#later_today');
        laterToday.innerHTML = '';
        let tomorrow = document.querySelector('#tomorrow');
        tomorrow.innerHTML = '';
        let afterTomorrow = document.querySelector('#after_tomorrow');
        afterTomorrow.innerHTML = '';


        for (let t of data.forecastTimestamps) {

            let forecastTempDate = Array.from(t.forecastTimeUtc).splice(0, 10).join('');
            let forecastTempTime = Array.from(t.forecastTimeUtc).slice(11).splice(0,2).join('');
            let forecastDisplayTime = Array.from(t.forecastTimeUtc).slice(11).splice(0, 5).join('');



            if (currentDate == forecastTempDate && currentTime == forecastTempTime) {
                let weatherPicture = document.createElement('div');
                weatherPicture.classList.add('fas');
                weatherPicture.classList.add('col-6');
                weatherPicture.classList.add(setWeatherPicture(t.conditionCode));
                weatherPicture.classList.add('weatherPicture');
                let currentTemp = document.createElement('div');
                currentTemp.classList.add('col-6');
                currentTemp.innerText = `${Number(t.airTemperature).toFixed(1)}°C`;
                let windImage = document.createElement('div');
                windImage.classList.add('fas');
                windImage.classList.add('fa-wind');
                weatherNow.appendChild(weatherPicture);
                weatherNow.appendChild(currentTemp);
                weatherNow.appendChild(windImage);
            }
            if (currentDate == forecastTempDate && currentTime < forecastTempTime) {
                laterToday.appendChild(createNewForecastItem(setWeatherPicture(t.conditionCode),
                    Number(t.airTemperature).toFixed(1), forecastDisplayTime, t.windGust));
            }
            if (forecastTempDate.slice(8) == +currentDate.slice(8) + 1) {
                tomorrow.appendChild(createNewForecastItem(setWeatherPicture(t.conditionCode),
                    Number(t.airTemperature).toFixed(1), forecastDisplayTime, t.windGust));
            }
            if (forecastTempDate.slice(8) == +currentDate.slice(8) + 2) {
                afterTomorrow.appendChild(createNewForecastItem(setWeatherPicture(t.conditionCode),
                    Number(t.airTemperature).toFixed(1), forecastDisplayTime, t.windGust));
            }
        };
    });
});
