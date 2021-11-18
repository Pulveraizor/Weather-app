window.axios = require('axios');
window.bootstrap = require('bootstrap');

let regionSelect = document.querySelector('#region');
let citySelect = document.querySelector('#city');

function time(){
    let d = new Date();
    let s = d.getSeconds();
    let m = d.getMinutes();
    let h = d.getHours();

    document.querySelector('#clock').innerText = `${h}:${m}:${s}`;

}

setInterval(time,1000);

document.addEventListener('DOMContentLoaded', function() {
    fetch('/weather/places').then(response => response.json()).then(data => {

        for (let p of data) {
            if (p.countryCode == 'LT') {
                let city_option = document.createElement('option');
                city_option.value = p.administrativeDivision;
                city_option.innerText = p.name;
                city_option.classList.add(p.code);
                city.appendChild(city_option);
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
        } else {
            i.style.display = 'block';
        }
    }
});

citySelect.addEventListener('input', function() {
    let selection = citySelect.options[citySelect.selectedIndex].className;

    fetch(`./weather/places/${selection}`).
    then(response => response.json()).
    then(data => {
        let resultBox = document.querySelector('#weather_result');
        let temp = document.createElement('h1');
        temp.innerHTML = data.forecastTimestamps[0].airTemperature;
        resultBox.appendChild(temp);
    });
})