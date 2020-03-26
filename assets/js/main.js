window.addEventListener('DOMContentLoaded', function () {
    document.body.style.height = `${window.innerHeight}px`;
  
    Model.createHtmlElements();
    Controller.addEventListeners();
    Model.getCoordsByCity();
  });
  
  let Controller = {
    addEventListeners: function () {
        let buttonChangeBackground = document.getElementById('button-change-background');
        buttonChangeBackground.addEventListener('click', () => Model.getLinkToImage());

        let buttonFahrenheit = document.querySelector('.button-fahrenheit');
        let buttonCelsius = document.querySelector('.button-celsius');

        buttonFahrenheit.addEventListener('click', () => {
            buttonFahrenheit.classList.add('active');
            buttonCelsius.classList.remove('active');
            localStorage.setItem('temperatureUnits', 'fahrenheit');
            View.changeTemperatureUnits();
        });
        buttonCelsius.addEventListener('click', () => {
            buttonFahrenheit.classList.remove('active');
            buttonCelsius.classList.add('active');
            localStorage.setItem('temperatureUnits', 'celsius');
            View.changeTemperatureUnits();
        });

        let buttonSearchCity = document.querySelector('#search-city');
            buttonSearchCity.addEventListener('click', (e) => {
            e.preventDefault();
            
            let city = document.querySelector('#data-search-city').value;
            Model.getCoordsByCity(city);
        });


        let select = document.querySelector('select#change-language');
        select.addEventListener('change', () => {
            localStorage.setItem('language', select.value);
            Model.lang = select.value;
            Model.changeElementsLanguage();
        });

        let voiceSearch = document.querySelector('.voice-search');
        voiceSearch.addEventListener('click', () => {
            document.querySelector('#data-search-city').value = 'Please, Saying the city...';
            Model.getCityFromVoice();
        });
    },
};
let Model = {
    dataWeather: null,
    userLocation: null,
    lang: localStorage.getItem('language') || 'en', 

    getCurrentUserLocation: async function() {
        let url,
            queryApi = `https://ipinfo.io/json?`,
            accessKey = `token=38d2b06ce1f4a0`;
        url = queryApi + accessKey;

        let res = await fetch(url);
        let data = await res.json();
          
        console.log('FFF');     
        console.log(data);

        this.getCoordsByCity(data.city);
    },    

    getLinkToImage: async function () {
        let dataWeather = this.dataWeather;
        let season = dataWeather.season;
        let time = dataWeather.timeOfDay;

        let url,
            queryApi = `https://api.unsplash.com/photos/random?orientation=landscape&query=`,
            queries = `${season},${time},${dataWeather.currently.icon}`,
            accessKey = `&client_id=5e9850d56c424eb9d034a2aadbab18f91c067e055a5d4b48491758c683566e04`;
        
        url = queryApi + queries + accessKey;
        console.log(url);

        let res = await fetch(url);
        let data = await res.json();

        View.showBackgroundImage(data.urls.regular);        
    },

    getWeather: async function () {
        let userLocation = this.userLocation;
        let lang = this.lang;
        let url,
            proxyUrl = 'https://cors-anywhere.herokuapp.com/',
            query = 'https://api.darksky.net/forecast/',
            secretKey = '2fdae10cc13fdac7fa39acc55446c565',
            geo = `/${userLocation.loc}?lang=${lang}`;
        
        url = proxyUrl + query + secretKey + geo;

        let res = await fetch(url);  
        let data = await res.json();

        this.dataWeather = data;  
        
        this.getDateForLinkToImage();    
        this.getLinkToImage();
        View.showDaysWeek();
        View.changeIcons();
        View.changeTime();  
    },

    getDateForLinkToImage: function () {
        let dateNow = new Date();
        let dataWeather = this.dataWeather;

        let months = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];

        let month = months[dateNow.getMonth()];

        if (months.indexOf(month) > 1 & months.indexOf(month) < 5) 
            dataWeather.season = 'spring';
        else if (months.indexOf(month) > 4 & months.indexOf(month) < 8)
            dataWeather.season = 'summer';
        else if (months.indexOf(month) > 7 & months.indexOf(month) < 11)
            dataWeather.season = 'autumn';
        else dataWeather.season = 'winter';

        let hour = dateNow.getHours();  
        if (hour >= 3 & hour < 9)
            dataWeather.timeOfDay = 'morning';
        else if (hour >= 9 & hour < 15)
            dataWeather.timeOfDay = 'afternoon';
        else if (hour >= 15 & hour < 21)
            dataWeather.timeOfDay = 'evening';
        else dataWeather.timeOfDay = 'night';
    },

    getCoordsByCity: async function (city) {

        if (!city) {    
            this.getCurrentUserLocation();
        } else {
            let lang = this.lang;
            document.querySelector(`option.${lang}`).selected = true;

            let url,
                queryApi = `https://api.opencagedata.com/geocode/v1/json?`,
                accessKey = `q=${city}&key=37bfcb048c814707a72fe9b61f8c1247&pretty=1&no_annotations=1&language=${lang}`;
            url = queryApi + accessKey;

            let res = await fetch(url);
            let data = await res.json();
            
            this.userLocation = data;
            let userLocation = this.userLocation;        
            console.log(data);

            userLocation.loc = `${data.results[0].geometry.lat},${data.results[0].geometry.lng}`; 

            View.changeInfoCityCountry();
            this.changeDataGeolocation();
            this.getWeather();
            View.showMap();
        }
    },

    getCityFromVoice: function () {
        window.SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

        let recognition = new SpeechRecognition();
        recognition.interimResults = true;

        recognition.addEventListener('result', e => {            
            if (e.results[0].isFinal) {
                let city =  e.results[0][0].transcript;                
                console.log(city);
                document.querySelector('#data-search-city').value = city;
                Model.getCoordsByCity(city);
            }            
        });
        recognition.start();        
    },

    changeElementsLanguage: function () {        
        this.CoordinatesOtherLang();
        
        console.log(this.lang);
        let lang = this.lang;
        let arrayOfWords = [];
        
        arrayOfWords.push(document.querySelector('.day-week-first').innerText);
        arrayOfWords.push(document.querySelector('.day-week-second').innerText);
        arrayOfWords.push(document.querySelector('.day-week-third').innerText);

        arrayOfWords.push(document.querySelector('li.summary').innerHTML);
    
        let dateNow = new Date();

        var options = {timeZone: this.dataWeather.timezone, weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'};
        let textHeader3 = dateNow.toLocaleString([this.lang], options);

        textHeader3 = textHeader3.split(' ');
        arrayOfWords.push(textHeader3[2]);

        arrayOfWords = arrayOfWords.join(', ');

        console.log(arrayOfWords);

        async function TEST() {            
            let url,
            query = 'https://api.darksky.net/forecast/',
            secretKey = '2fdae10cc13fdac7fa39acc55446c565'; 
    
            
            url = `https://translate.yandex.net/api/v1.5/tr.json/translate?key=trnsl.1.1.20191214T222649Z.ec69bae71f031024.7313fe6c7495fa52adc206df4714beeaf0f90f49&text=${arrayOfWords}&lang=${lang}`;
    
            let res = await fetch(url);  
            let data = await res.json();  
    
            console.log(data);    
            data.text = data.text[0].split(', ');
            console.log(data);    
    
            document.querySelector('.day-week-first').innerText = data.text[0];
            document.querySelector('.day-week-second').innerText = data.text[1];
            document.querySelector('.day-week-third').innerText = data.text[2];

            document.querySelector('li.summary').innerHTML = data.text[3];

            textHeader3[2] = data.text[4];
            document.querySelector('.info h3').innerHTML = `${textHeader3.join(' ')}`;
        }
        TEST();

        let config = {
            feels: {
                'ru': 'Ощущается, как',
                'be': 'Адчуваецца як',
                'en': 'Feels like'
            },

            wind: {
                'ru': 'Ветер',
                'be': 'Вецер',
                'en': 'Wind'  
            },

            humidity: {
                'ru': 'Влажность',
                'be': 'Вільготнасць',
                'en': 'Humidity'  
            },

            days: [
                {'ru': 'Понедельник', 'be': 'Панядзелак', 'en': 'Monday'},
                {'ru': 'Вторник', 'be': 'Аўторак', 'en': 'Tuesday'},
                {'ru': 'Среда', 'be': 'Серада', 'en': 'Wednesday'},
                {'ru': 'Четверг', 'be': 'Чацвер', 'en': 'Thursday'},
                {'ru': 'Пятница', 'be': 'Пятніца', 'en': 'Friday'},
                {'ru': 'Суббота', 'be': 'Субота', 'en': 'Saturday'},
                {'ru': 'Воскресенье', 'be': 'Нядзеля', 'en': 'Sunday'},
            ]
        };

        let strFeels = document.querySelector('li.feels-like').innerHTML.split(':');
        let strWind = document.querySelector('li.wind').innerHTML.split(':');
        let strHumidity = document.querySelector('li.humidity').innerHTML.split(':');

        document.querySelector('li.feels-like').innerHTML = config.feels[lang] + ': ' + strFeels[1];
        document.querySelector('li.wind').innerHTML = config.wind[lang] + ': ' + strWind[1];
        document.querySelector('li.humidity').innerHTML = config.humidity[lang] + ': ' + strHumidity[1];
    
        View.displayCoords();    
    },

    CoordinatesOtherLang: async function () {
        let lang = Model.lang;
        
        let city = document.querySelector('#data-search-city').value || 'Minsk';
        let url,
            queryApi = `https://api.opencagedata.com/geocode/v1/json?`,
            accessKey = `q=${city}&key=37bfcb048c814707a72fe9b61f8c1247&pretty=1&no_annotations=1&language=${lang}`;  
            url = queryApi + accessKey;

        let res = await fetch(url);
        let data = await res.json();

        Model.userLocation = data;
        Model.userLocation.loc = `${data.results[0].geometry.lat},${data.results[0].geometry.lng}`; 

        Model.changeDataGeolocation();
        View.changeInfoCityCountry();   
    },



    changeDataGeolocation: function () {
        let userLocation = this.userLocation;
        let coords = [];
        let location = userLocation.loc.split(',');
        location.forEach(element => {    
            element = (element*1).toFixed(2);
            coords.push(element.split('.'));
        });

        userLocation.coords = coords;
        View.displayCoords(); 
    },

    createHtmlElements: function () {
        
        const markup = `
            <header>

                <div class="control-panel">

                    <div class="button-change-background" id="button-change-background"></div>
            
                    <form action="#" class="change-language">
            
                        <select name="" id="change-language">
            
                            <option class="en" value="en">en</option>
                            <option class="ru" value="ru">ru</option>
                            <option class="be" value="be">be</option>
            
                        </select>
            
                    </form>
            
                    <div class="buttons-change-temperature-units">
                        <div class="button-fahrenheit">&ordm; f</div>
                        <div class="button-celsius">&ordm; c</div>
                    </div>           
                </div>

                <form action="#" class="form-search">    
                    <input type="search" id="data-search-city" placeholder="Search city or ZIP"/>
                    <input type="submit" id="search-city" value="search"/>
                    <div class="voice-search"></div>        

                </form>  

            </header>

            <div class="wrapper">

                <div class="weather">

                    <div class="weather__today">
            
                        <div class="info">        
                            <h1></h1>                         
                            <h3></h3>                
                        </div>

                        <div class="temperature-summary">                    

                            <p class="temperature"></p>
                            <img src="" alt="" class="icon-weather">

                            <ul>
                                <li class="summary"></li>
                                <li class="feels-like"></li>
                                <li class="wind"></li>
                                <li class="humidity"></li>
                            </ul>

                        </div>
            
                    </div>

                    <div class="weather__three-days">

                        <div class="weather__three-days__first">

                            <p class="day-week day-week-first"></p>

                            <div class="info-day">
                                <p class="day-temperature"></p>
                                <img src="" alt="" class="day-icon">
                            </div>                        

                        </div>

                        <div class="weather__three-days__second">

                            <p class="day-week day-week-second"></p>

                            <div class="info-day">
                                <p class="day-temperature"></p>
                                <img src="" alt="" class="day-icon">
                            </div>

                        </div>

                        <div class="weather__three-days__third">

                            <p class="day-week day-week-third"></p>

                            <div class="info-day">
                                <p class="day-temperature"></p>
                                <img src="" alt="" class="day-icon">
                            </div>

                        </div>

                    </div>
            
                </div>
            
                <div class="geolocation">
            
                    <div class="geolocation__map">

                        <div class="map" id="map"></div>                

                    </div>
            
                    <div class="geolocation__coordinates">

                        <p class="latitude"></p>
                        <p class="longitude"></p>

                    </div>

                </div>

            </div>
        `;
        document.body.innerHTML = markup;
    }
};
let View = {
    changeTemperatureUnits: function () {
        let units = localStorage.getItem('temperatureUnits') || 'celsius'; 

        let button = document.querySelector(`.button-${units}`);
        button.classList.add('active'); 

        let data = Model.dataWeather;
        
        let averageTemp = [ (data.daily.data[0].temperatureHigh + data.daily.data[0].temperatureLow) / 2,
                (data.daily.data[1].temperatureHigh + data.daily.data[1].temperatureLow) / 2,
                (data.daily.data[2].temperatureHigh + data.daily.data[2].temperatureLow) / 2];
    
        let temperatureNextFirstDay = document.querySelector('.weather__three-days__first p.day-temperature');
        let temperatureNextSecondDay = document.querySelector('.weather__three-days__second p.day-temperature');
        let temperatureNextThirdDay = document.querySelector('.weather__three-days__third p.day-temperature');   
        let tempToday;
    
        if (units === 'celsius') {    
            temperatureNextFirstDay.innerHTML =  `${Math.round( (averageTemp[0] - 32) * 0.55 )}&ordm;`;
            temperatureNextSecondDay.innerHTML =  `${Math.round( (averageTemp[1] - 32) * 0.55 )}&ordm;`;
            temperatureNextThirdDay.innerHTML =  `${Math.round( (averageTemp[2] - 32) * 0.55 )}&ordm;`;
            tempToday = Math.round( (data.currently.temperature - 32) * 0.55 );
        
            let tempFeelsLike = Math.round( (data.currently.apparentTemperature - 32) * 0.55 );
            document.querySelector('li.feels-like').innerHTML = `Feels like: ${tempFeelsLike}&ordm;`;
        
        } else {    
            temperatureNextFirstDay.innerHTML =  `${Math.round(averageTemp[0])}&ordm;`;
            temperatureNextSecondDay.innerHTML = `${Math.round(averageTemp[1])}&ordm;`;
            temperatureNextThirdDay.innerHTML =  `${Math.round(averageTemp[2])}&ordm;`;
            tempToday = Math.round(data.currently.temperature);
                
            let tempFeelsLike = Math.round(data.currently.apparentTemperature);
            document.querySelector('li.feels-like').innerHTML = `Feels like: ${tempFeelsLike}&ordm;`;
        }
        document.querySelector('.weather__today p.temperature').innerHTML = `${tempToday}<span>&ordm;</span>`;
    },

    changeIcons: function () {
        let data = Model.dataWeather;
    
        document.querySelector('li.summary').innerText = `${data.currently.summary}`;
        document.querySelector('li.wind').innerText = `Wind: ${Math.round(data.currently.windSpeed, 1)}m/s`;
        document.querySelector('li.humidity').innerText = `Humidity: ${Math.round(data.currently.humidity * 100)}%`;  
        
        let imageWeatherToday = document.querySelector('.weather__today img');
        imageWeatherToday.src = `assets/data/weather/${data.currently.icon}.png`;
    
        let imageNextFirstDay = document.querySelector('.weather__three-days__first img');
        let imageNextSecondDay = document.querySelector('.weather__three-days__second img');
        let imageNextThirdDay = document.querySelector('.weather__three-days__third img');   
    
        imageNextFirstDay.src = `assets/data/weather/${data.daily.data[0].icon}.png`;
        imageNextSecondDay.src = `assets/data/weather/${data.daily.data[1].icon}.png`;
        imageNextThirdDay.src = `assets/data/weather/${data.daily.data[2].icon}.png`;
    
        this.changeTemperatureUnits('celsius');  
        Model.changeElementsLanguage();
    },

    changeInfoCityCountry: function () {
        let info = Model.userLocation.results[0].formatted.split(',');
        let country = info[info.length-1];
        let city = info[0];  
        document.querySelector('.info h1').innerHTML = `${city}, ${country}`;
    },

    displayCoords: function () {
        let lang = localStorage.getItem('language') || 'en';

        let config = {
            'coords': {
            'lat': { 'en': 'Latitude', 'ru': 'Широта', 'be': 'Шырата'},
            'lon': {'en': 'Longitude','ru': 'Долгота', 'be': 'Даўгата'}  
            }
        };
        let coords = Model.userLocation.coords;
        
        document.querySelector('.latitude').innerHTML = `${config.coords.lat[lang]}: <span>${coords[0][0]}&ordm;${coords[0][1]}'</span>`;
        document.querySelector('.longitude').innerHTML = `${config.coords.lon[lang]}: <span>${coords[1][0]}&ordm;${coords[1][1]}'</span>`;  
    },

    showBackgroundImage: function (url) {
        document.body.style.background = 'url(" ' + url + ' ")no-repeat no-repeat ';
        document.body.style.backgroundSize = 'cover';
    }, 

    showDaysWeek: function () {
        let dateNow = new Date();

        let days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];        
        document.querySelector('.day-week-first').innerText = days[dateNow.getDay()+1>6 ? (dateNow.getDay()+1) % 7:dateNow.getDay()+1];
        document.querySelector('.day-week-second').innerText = days[dateNow.getDay()+2>6 ?(dateNow.getDay()+2) % 7:dateNow.getDay()+2];
        document.querySelector('.day-week-third').innerText = days[dateNow.getDay()+3>6 ? (dateNow.getDay()+3) % 7:dateNow.getDay()+3];
    },




    changeTime: function () {
        function update() {
            let dateNow = new Date();

            var options = {timeZone: Model.dataWeather.timezone, weekday: 'short', month: 'long', day: 'numeric', hour: '2-digit', minute: '2-digit'};
            document.querySelector('.info h3').innerHTML = `${dateNow.toLocaleString([Model.lang], options)}`;
        }
        update();
        setInterval(update, 60000); 
    },

    showMap: function () {
        mapboxgl.accessToken = 'pk.eyJ1Ijoib2tzdHVrYWNoIiwiYSI6ImNrNDYzN25kbzAweDMzanFsYXFqam1xMXQifQ.pZzTd2O4RqqwfIn0kuDjaA';
            var map = new mapboxgl.Map({
                container: 'map', // container id
                style: 'mapbox://styles/mapbox/streets-v11', // stylesheet location
        });

        var size = 50;
        
        var pulsingDot = {
            width: size,
            height: size,
            data: new Uint8Array(size * size * 4),
            
            onAdd: function() {
                var canvas = document.createElement('canvas');
                canvas.width = this.width;
                canvas.height = this.height;
                this.context = canvas.getContext('2d');
            },

            render: function() {
                var duration = 1000;
                var t = (performance.now() % duration) / duration;
                
                var radius = size / 2 * 0.3;
                var outerRadius = size / 2 * 0.7 * t + radius;
                var context = this.context;
                
                context.clearRect(0, 0, this.width, this.height);
                context.beginPath();
                context.arc(this.width / 2, this.height / 2, outerRadius, 0, Math.PI * 2);
                context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
                context.fill();
                
                context.beginPath();
                context.arc(this.width / 2, this.height / 2, radius, 0, Math.PI * 2);
                context.fillStyle = 'rgba(255, 100, 100, 1)';
                context.strokeStyle = 'white';
                context.lineWidth = 2 + 4 * (1 - t);
                context.fill();
                context.stroke();
                
                this.data = context.getImageData(0, 0, this.width, this.height).data;
                
                map.triggerRepaint();
                
                return true;
            }
        };

        function showGeolocationOnMap() {        
            let coords = Model.userLocation.loc.split(',');

            map.addImage('pulsing-dot', pulsingDot, { pixelRatio: 2 });
            
            map.addLayer({
                "id": "points",
                "type": "symbol",
                "source": {
                    "type": "geojson",
                    "data": {
                        "type": "FeatureCollection",
                        "features": [{
                            "type": "Feature",
                            "geometry": {
                                "type": "Point",
                                "coordinates": [coords[1], coords[0]]
                            }
                        }]
                    }
                },
                "layout": {
                    "icon-image": "pulsing-dot"
                }
            });
        }

        map.on('load', function () {   
            showGeolocationOnMap();    
        });

    }
};