import SunCalc from 'suncalc';

const sunScale = .8;
const moonScale = .25;

const sunDist = 1;
const moonDist = 1;

const celestialTime = new Date();

export const setCelestialTime = (t: number) => {
  celestialTime.setTime(t);
};

export const getSunDir = () => {
  const sunPos = SunCalc.getPosition(celestialTime, 38.4404, -122.7141);
  // if (Simulation.state.DEBUG) {
  //   (document.getElementById('sun') as HTMLDivElement).innerHTML = `<pre>${JSON.stringify(sunPos, null, '  ')}</pre>`;
  // }
  return [
    -Math.cos(sunPos.altitude) * Math.sin(sunPos.azimuth) * sunDist, // counterclockwise, please
    Math.cos(sunPos.altitude) * Math.cos(sunPos.azimuth) * sunDist,
    -Math.sin(sunPos.altitude) * sunDist, // flip z axis to respect view orientation
  ];
};

export const getSunColor = () => {
  return [1.6 * sunScale, 1.47 * sunScale, 1.29 * sunScale]; // was assigned to 'defaultColor'
  // let m = 1; // color multiplier, just in case
  // return [defaultColor[0] * m, defaultColor[1] * m, defaultColor[2] * m];
  // return defaultColor;
};

export const getMoonDir = () => {
  const moonPos = SunCalc.getMoonPosition(celestialTime, 38.4404, -122.7141);
  // if (Simulation.state.DEBUG) {
  //   (document.getElementById('moon') as HTMLDivElement).innerHTML = `<pre>${JSON.stringify(moonPos, null, '  ')}</pre>`;
  // }
  return [
    -Math.cos(moonPos.altitude) * Math.sin(moonPos.azimuth) * moonDist, // counterclockwise, please
    Math.cos(moonPos.altitude) * Math.cos(moonPos.azimuth) * moonDist,
    -Math.sin(moonPos.altitude) * moonDist, // flip z axis to respect view orientation
  ];
};

export const getMoonColor = () => {
  return [1.29 * moonScale, 1.47 * moonScale, 1.6 * moonScale]; // was assigned to 'defaultColor'
  // let m = 1; // color multiplier, just in case
  // return [defaultColor[0] * m, defaultColor[1] * m, defaultColor[2] * m];
  // return defaultColor;
};
