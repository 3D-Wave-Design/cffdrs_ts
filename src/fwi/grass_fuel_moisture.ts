// Define the constant used in the calculation
const FFMC_COEFFICIENT = 0.5; // Adjust this value to match the one used in R

/**
 * Calculates the grass fuel moisture content.
 * 
 * @param temp - Temperature (in degrees Celsius)
 * @param rh - Relative Humidity (percentage)
 * @param ws - Wind Speed (km/h)
 * @param prec - Precipitation (mm)
 * @param isol - Insolation (kW/m^2)
 * @param GFMCold - Yesterday's Grass Foliar Moisture Content
 * @param roFL - The nominal fuel load of the fine fuel layer (default 0.3 kg/m^2)
 * @param timeStep - Time step (default 1 hour)
 * @returns The calculated moisture content
 */
function grassFuelMoisture(
  temp: number, 
  rh: number, 
  ws: number, 
  prec: number, 
  isol: number, 
  GFMCold: number, 
  roFL: number = 0.3, 
  timeStep: number = 1
): number {
  // Calculate previous moisture code
  let MCold = FFMC_COEFFICIENT * ((101 - GFMCold) / (59.5 + GFMCold));

  // Calculate the moisture content of the layer in % after rainfall
  let MCr = prec > 0 ? MCold + 100 * (prec / roFL) : MCold;
  MCr = Math.min(MCr, 250); // Constrain to 250
  MCold = MCr;

  // Calculate Fuel temperature
  const Tf = temp + 35.07 * isol * Math.exp(-0.06215 * ws);

  // Calculate Saturation Vapour Pressure (Baumgartner et al. 1982)
  const eS_T = 6.107 * Math.pow(10, (7.5 * temp) / (237 + temp));
  const eS_Tf = 6.107 * Math.pow(10, (7.5 * Tf) / (237 + Tf));

  // Calculate Fuel Level Relative Humidity
  const RH_f = rh * (eS_T / eS_Tf);

  // Calculate Equilibrium Moisture Content for Drying phase
  const EMC_D = ((1.62 * Math.pow(RH_f, 0.532) + 13.7 * Math.exp((RH_f - 100) / 13.0))
    + 0.27 * (26.7 - Tf) * (1 - Math.exp(-0.115 * RH_f)));

  // Calculate Equilibrium Moisture Content for Wetting phase
  const EMC_W = ((1.42 * Math.pow(RH_f, 0.512) + 12.0 * Math.exp((RH_f - 100) / 18.0))
    + 0.27 * (26.7 - Tf) * (1 - Math.exp(-0.115 * RH_f)));

  // RH in terms of RH/100 for desorption
  let Rf = MCold > EMC_D ? RH_f / 100 : rh;
  // RH in terms of 1-RH/100 for absorption
  Rf = MCold < EMC_W ? (100 - RH_f) / 100 : Rf;

  // Calculate Inverse Response time of grass (hours)
  const K_GRASS = 0.389633 * Math.exp(0.0365 * Tf) * (0.424 * (1 - Math.pow(Rf, 1.7)) + 0.0694 *
    Math.sqrt(ws) * (1 - Math.pow(Rf, 8)));

  // Fuel is drying, calculate Moisture Content
  let MC0 = MCold > EMC_D
    ? EMC_D + (MCold - EMC_D) * Math.exp(-1.0 * Math.log(10.0) * K_GRASS * timeStep)
    : MCold;

  // Fuel is wetting, calculate moisture content
  MC0 = MCold < EMC_W
    ? EMC_W + (MCold - EMC_W) * Math.exp(-1.0 * Math.log(10.0) * K_GRASS * timeStep)
    : MC0;

  return MC0;
}

export {grassFuelMoisture};