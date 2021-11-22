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

        for (let p of data) {
            if (p.countryCode == 'LT') {
                let city_option = document.createElement('option');
                city_option.value = p.administrativeDivision;
                city_option.innerText = p.name;
                city_option.classList.add(p.code);
                citySelect.appendChild(city_option);
                city_option.style.display = 'none';
            }
        }
        let rObj = new Set();
        let filteredRegions = data.filter(el => {
            let duplicate = rObj.has(el.administrativeDivision);
            rObj.add(el.administrativeDivision);
            return !duplicate;
        });

        for (let r of filteredRegions) {
            if (r.countryCode == 'LT') {
                let reg_option = document.createElement('option');
                reg_option.innerText = r.administrativeDivision;
                reg_option.value = r.administrativeDivision;
                regionSelect.appendChild(reg_option);
            }
        };
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


function createNewCarouselItem(conditionCode, temperature, day, wind) {
    let newDiv = document.createElement('div');
    newDiv.classList.add('carousel-item');
    let newForecast = document.createElement('i');
    newForecast.classList.add('fas');
    newForecast.classList.add(conditionCode);
    let newTemp = document.createElement('h1');
    newTemp.innerText = `${temperature}°C`;
    let dayOfForecast = document.createElement('h4');
    dayOfForecast.innerText = day;
    let windImage = document.createElement('div');
    windImage.classList.add('fas');
    windImage.classList.add('fa-wind');
    let windSpeed = document.createElement('h5');
    windSpeed.innerText = `${wind} m/s`;
    newDiv.appendChild(newForecast);
    newDiv.appendChild(newTemp);
    newDiv.appendChild(dayOfForecast);
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
        console.log(data.forecastTimestamps);

        let time = new Date;
        let currentDate = `${time.getFullYear()}-${time.getMonth() + 1}-${time.getDate()}`;
        let currentTime = `${time.getHours()}`;
        let carousel = document.querySelector('.carousel-inner');
        carousel.innerHTML = '';

        for (let t of data.forecastTimestamps) {

            let forecastTempDate = Array.from(t.forecastTimeUtc).splice(0, 10).join('');
            let forecastTempTime = Array.from(t.forecastTimeUtc).slice(11).splice(0,2).join('');
            let forecastDisplayTime = Array.from(t.forecastTimeUtc).slice(11).splice(0, 5).join('');



            if (currentDate == forecastTempDate && currentTime == forecastTempTime) {

                carousel.appendChild(createNewCarouselItem(setWeatherPicture(t.conditionCode), t.airTemperature, 'Dabar', t.windGust));
                let firstCarouselItem = document.querySelector('.carousel-inner > div');
                firstCarouselItem.classList.add('active');
            }
            if (currentDate == forecastTempDate && currentTime < forecastTempTime) {
                carousel.appendChild(createNewCarouselItem(setWeatherPicture(t.conditionCode), t.airTemperature, `Vėliau šiandien ${forecastDisplayTime}`, t.windGust));
            }
            if (forecastTempDate.slice(8) == +currentDate.slice(8) + 1) {
                carousel.appendChild(createNewCarouselItem(setWeatherPicture(t.conditionCode), t.airTemperature, `Rytoj ${forecastDisplayTime}`, t.windGust));
            }
            if (forecastTempDate.slice(8) == +currentDate.slice(8) + 2) {
                carousel.appendChild(createNewCarouselItem(setWeatherPicture(t.conditionCode), t.airTemperature, `Poryt ${forecastDisplayTime}`, t.windGust));
            }
        };
    });
});
