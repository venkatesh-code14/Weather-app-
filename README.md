# WeatherWise - Interactive Weather Map 🗺️

WeatherWise is a dynamic, map-centric global weather application built with vanilla JavaScript. This project provides an intuitive and visually engaging way for users to get real-time weather data for any location in the world, displayed directly on an interactive map.

---

### 🌍 Live Demo

You can try out the live version of the application here:
**[https://venkatesh-code14.github.io/Weather-app/](https://venkatesh-code14.github.io/Weather-app/)**

*(Note: Please double-check that your GitHub repository is named exactly "Weather-app" for this link to work.)*

---

### ## Key Features ✨

* **Full-Screen Interactive Map:** Uses **Leaflet.js** to create a beautiful satellite-hybrid map that serves as the primary user interface.
* **Powerful Global Search:** Combines the **OpenCage Geocoding API** (for finding coordinates) with the **OpenWeatherMap API** (for fetching weather data), allowing the app to find and display weather for any named location, including small towns and villages.
* **Live Weather Pop-ups:** Displays real-time weather conditions, including temperature, humidity, wind speed, and forecasts in a clean, modern pop-up on the map.
* **Multi-City Comparison:** A smooth, slide-out sidebar allows users to add and compare the weather for multiple cities at once.
* **Geolocation:** Users can instantly get the weather for their current location with a single click.
* **Native Sharing:** Implements the **Web Share API** to trigger the native share dialog on supported devices, allowing for easy sharing to any app.
* **Modern UI/UX:** Features a clean "glass card" aesthetic, smooth animations, and a fully responsive layout for both desktop and mobile.

---

### ## Technologies Used 💻

* **Front-End:** HTML5, CSS3, Vanilla JavaScript (ES6+)
* **Libraries:** Leaflet.js, Font Awesome
* **APIs:** OpenWeatherMap API, OpenCage Geocoding API

---

### ## 🚀 Local Development

To run this project on your local machine:

1.  Clone the repository:
    ```bash
    git clone [https://github.com/venkatesh-code14/Weather-app.git](https://github.com/venkatesh-code14/Weather-app.git)
    ```
2.  Navigate into the project folder:
    ```bash
    cd Weather-app
    ```
3.  Create your free API keys at [OpenWeatherMap](https://openweathermap.org/appid) and [OpenCage Geocoding](https://opencagedata.com/pricing).

4.  In the `script.js` file, replace the placeholder API keys with your own:
    ```javascript
    const OPENWEATHER_API_KEY = 'YOUR_OPENWEATHER_API_KEY_HERE';
    const OPENCAGE_API_KEY = 'YOUR_OPENCAGE_API_KEY_HERE';
    ```
5.  Run the project using a local server. The easiest way is with the **Live Server** extension in VS Code. This is required for the Geolocation and Share APIs to function correctly.
