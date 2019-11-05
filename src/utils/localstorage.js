const CITY_INFO = 'city_info'

const getCity = () => JSON.parse(localStorage.getItem(CITY_INFO))

const setCity = cityList => localStorage.setItem(CITY_INFO, JSON.stringify(cityList))
// localStorage.setItem("city_info", JSON.stringify({label, value}))

export { getCity, setCity }