import React, {useState, useEffect} from 'react';
import config from '../../config.js';

// require('dotenv').config();


// `api.openweathermap.org/data/2.5/weather?lat=${park[0].LATITUDE}&lon=${park[0].LONGITUDE}&appid=${process.env.WEATHER_API_KEY}` 
//     => {weather: [{"id":803,"main":"Clouds","description":"broken clouds","icon":"04d"}], "main":{"temp":283.12,"feels_like":280.23,"temp_min":282.15,"temp_max":284.26,"pressure":1019,"humidity":81}}
//   // we will want weather[0].main (maybe icon?) and main.temp -- note that temp is in Kelvin, so add 273.15 -- and to get to F, multiply by 9/5 and add 32
// `https://api.waqi.info/feed/geo:${park[0].LATITUDE};${park[0].LONGITUDE}/?token=${process.env.AQI_API_KEY}` => {status: 'ok', data: {aqi: 28}}
// https://api.waqi.info/feed/geo:36.199192;-121.543293/?token=05467966f386a9a8e3cea4345cbfe61494a4cad0




const FavParkCard = (props) => { // props will include id from DB corresponding to API
  const [parkName, setParkName] = useState('');
  const [imgUrl, setImgUrl] = useState('');
  const [weather, setWeather] = useState({});
  const [AQI, setAQI] = useState('');  
  const [numVisits, setNumVisits] = useState('');
  
  const weatherMap = {
    Clouds: '../assets/cloud.svg',
    Clear: '../assets/sunny.svg',
    Rain: '../assets/rain.svg',
    Drizzle: '../assets/drizzle.svg',
    Snow: '../assets/snowflake.svg',
    Haze: '../assets/foggy.svg',
  };
  
  // , temperature: Math.floor((main.temp + 273.15) * (9/5) + 32)
  useEffect(() => {
    // fetch number of visits
    //we actually want to fetch with the id of the specific visit row, which is vis_id, not user_id
    fetch(`/trails/visited/${sessionStorage.getItem('user_id')}/${props.parkId}`)
    .then((data) => data.json())
    .then((result) => setNumVisits(result[0].visits))
    .catch((err) => {throw new Error(err)});

    // fetch to beach api
    const currentBeach = JSON.parse(localStorage.getItem('beaches')).find((beach) => beach.ID === props.parkId);
    console.log(currentBeach)
    setParkName(currentBeach.NameMobileWeb);
    setImgUrl(currentBeach.Photo_1);
    // fetch(`https://api.coastal.ca.gov/access/v1/locations/id/${props.parkId}`)
    // .then((res) => res.json())
    // .then((park) => {
    //   setParkName(park[0].NameMobileWeb);
    //   setImgUrl(park[0].Photo_1);

      // fetch to weather api
      fetch(`https://api.openweathermap.org/data/2.5/weather?lat=${currentBeach.LATITUDE}&lon=${currentBeach.LONGITUDE}&appid=${config.weatherAPI}`)
      .then((res) => res.json())
      .then((weatherData) => {
        // console.log('weather', weatherData)
        setWeather({weather: weatherData.weather[0].main, temp: Math.floor((weatherData.main.temp - 273.15) * (9/5) + 32)});

      }).catch(err => { throw new Error(err) });
      
      // fetch to AQI api
      fetch(`https://api.waqi.info/feed/geo:${currentBeach.LATITUDE};${currentBeach.LONGITUDE}/?token=${config.aqiAPI}`)
      .then((res) => res.json())
      .then(({data}) => setAQI(data.aqi))
      .catch(err => {throw new Error(err)});
  }, []);

  const onClickHandler = () => {
    // first, confirm visit
    const visited = confirm('Another visit to this beach?');
    if (!visited) return;
    //one more step of logic to determine if beach has 0 visits
    //if so, post, if 1 or more, put  
    console.log('userid, parkid, visits', sessionStorage.getItem('user_id'), props.parkId, numVisits);
    fetch(`/trails/visited/${sessionStorage.getItem('user_id')}/${props.parkId}/${numVisits + 1}`, {
      method: 'PUT',
      headers: {'Content-Type': 'application/json; charset:utf-8'},
      // body: JSON.stringify({visits: numVisits + 1, park_id: props.parkId, user_id: sessionStorage.getItem('user_id')}),
    })
    .then(() => setNumVisits(numVisits + 1))
    .catch(err => {throw new Error(err)});
  }


  return (
  <div className='card' id="beachCard" style={{width: "18rem", minWidth: "18rem"}}>
    <div>
    {imgUrl.length > 0 ?
    <img src={imgUrl} id="card-top-image" className="card-img-top" style={{width: '50%'}} /> 
    : <img src='../../assets/beach.svg' id="card-top-image" className="card-img-top" style={{width: '50%'}} />
    }
    </div>
      <div className="card-body">
      <h5 className="card-title" style={{wordWrap: 'break-word', whiteSpace: 'normal'}}>{parkName}</h5>
      <div className='info-container'>
      <div className="weather-info">
        <img src={weatherMap[weather.weather]} style={{width: '30%'}}/>
        <p className='card-text'>{weather.weather}</p>
        <p className='card-text'>Temp: {weather.temp} °F</p>
      </div>
      <div className ="aqi-info">
        <p className='card-text'>AQI: {AQI}</p>
      </div>
      <div className="card-button-container" key={'btnbtnprim'}>
        <button className="btn btn-primary" onClick = {() => onClickHandler()}> Visited {numVisits} times!</button>
        <button className="btn btn-success" onClick={() => props.favoriteBtnHandler(props.parkId)}>Favorite</button>
      </div>
    </div>   
  </div>
  </div>
  )
};

export default FavParkCard;

// GREEN: #009966
// YELLOW: #ffde33
// ORANGE: #ff9933
// RED: #cc0033
// PURPLE: #660099
// MAHOGANY: #7e0023