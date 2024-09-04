interface WeatherData {
    temp: number[];
    rh: number[];
    ws: number[];
    prec: number[];
    hr?: number[];
    bui?: number[];
    id?: number[];
  }
  
  interface FFMCOptions {
    ffmcOld?: number;
    timeStep?: number;
    calcStep?: boolean;
    batch?: boolean;
    hourlyFWI?: boolean;
  }
  
  function hourlyFineFuelMoistureCode(
    temp: number[],
    rh: number[],
    ws: number[],
    prec: number[],
    Fo: number[],
    t0: number
  ): number[] {
    const FFMC_COEFFICIENT = 59.5;
    const mo = Fo.map(f => FFMC_COEFFICIENT * (101 - f) / (59.5 + f));
    const rf = prec;
  
    const mr = mo.map((moVal, i) => {
      if (moVal <= 150) {
        return moVal + 42.5 * rf[i] * Math.exp(-100 / (251 - moVal)) * (1 - Math.exp(-6.93 / rf[i]));
      } else {
        return (
          moVal +
          42.5 * rf[i] * Math.exp(-100 / (251 - moVal)) * (1 - Math.exp(-6.93 / rf[i])) +
          0.0015 * Math.pow(moVal - 150, 2) * Math.sqrt(rf[i])
        );
      }
    });
  
    const mrCapped = mr.map(m => Math.min(m, 250));
    const moUpdated = prec.map((p, i) => (p > 0 ? mrCapped[i] : mo[i]));
  
    const Ed = rh.map((rhVal, i) =>
      0.942 * Math.pow(rhVal, 0.679) +
      11 * Math.exp((rhVal - 100) / 10) +
      0.18 * (21.1 - temp[i]) * (1 - Math.exp(-0.115 * rhVal))
    );
  
    const ko = rh.map((rhVal, i) =>
      0.424 * (1 - Math.pow(rhVal / 100, 1.7)) +
      0.0694 * Math.sqrt(ws[i]) * (1 - Math.pow(rhVal / 100, 8))
    );
  
    const kd = ko.map((k, i) => k * 0.0579 * Math.exp(0.0365 * temp[i]));
    const md = Ed.map((ed, i) => ed + (moUpdated[i] - ed) * Math.pow(10, -kd[i] * t0));
  
    const Ew = rh.map((rhVal, i) =>
      0.618 * Math.pow(rhVal, 0.753) +
      10 * Math.exp((rhVal - 100) / 10) +
      0.18 * (21.1 - temp[i]) * (1 - Math.exp(-0.115 * rhVal))
    );
  
    const k1 = rh.map((rhVal, i) =>
      0.424 * (1 - Math.pow((100 - rhVal) / 100, 1.7)) +
      0.0694 * Math.sqrt(ws[i]) * (1 - Math.pow((100 - rhVal) / 100, 8))
    );
  
    const kw = k1.map((k, i) => k * 0.0579 * Math.exp(0.0365 * temp[i]));
    const mw = Ew.map((ew, i) => ew - (ew - moUpdated[i]) * Math.pow(10, -kw[i] * t0));
  
    const m = moUpdated.map((moVal, i) =>
      moVal > Ed[i] ? md[i] : moVal < Ew[i] ? mw[i] : moVal
    );
  
    const FoNew = m.map(mVal => 59.5 * (250 - mVal) / (FFMC_COEFFICIENT + mVal)).map(FoVal => Math.max(FoVal, 0));
  
    return FoNew;
  }
  
  function hffmc(
    input: WeatherData,
    options: FFMCOptions = {}
  ): number[] | (WeatherData & { ffmc: number[]; isi?: number[]; fwi?: number[]; dsr?: number[] }) {
    const {
      ffmcOld = 85,
      timeStep = 1,
      calcStep = false,
      batch = true,
      hourlyFWI = false
    } = options;
  
    const { temp, rh, ws, prec, hr, bui, id } = input;
  
    const n = batch ? (id ? new Set(id).size : 1) : temp.length;
    let Fo = Array(n).fill(ffmcOld);
  
    const f: number[] = [];
  
    const n0 = temp.length / n;
  
    for (let i = 0; i < n0; i++) {
      const k = Array.from({ length: n }, (_, j) => i * n + j);
      const t0 = calcStep && i > 0 && hr ? hr[k[0]] - hr[k[0] - n] : timeStep;
      const f1 = hourlyFineFuelMoistureCode(
        k.map(idx => temp[idx]),
        k.map(idx => rh[idx]),
        k.map(idx => ws[idx]),
        k.map(idx => prec[idx]),
        Fo,
        t0
      );
      Fo = f1;
      f.push(...f1);
    }
  
    if (hourlyFWI && bui) {
      const isi = f.map((ffmc, i) => initialSpreadIndex(ffmc, ws[i]));
      const fwi = isi.map((isi, i) => fireWeatherIndex(isi, bui[i]));
      const dsr = fwi.map(fwi => 0.0272 * Math.pow(fwi, 1.77));
  
      return {
        ...input,
        ffmc: f,
        isi,
        fwi,
        dsr
      };
    } else if (hourlyFWI && !bui) {
      throw new Error("Daily BUI is required to calculate hourly FWI");
    } else {
      return f;
    }
  }
  
  function initialSpreadIndex(ffmc: number, ws: number): number {
    // Placeholder function logic here
    return ffmc; // Replace with actual ISI calculation
  }
  
  function fireWeatherIndex(isi: number, bui: number): number {
    // Placeholder function logic here
    return isi; // Replace with actual FWI calculation
  }
  
  // Example test case
/*   const weatherData: WeatherData = {
    temp: [20, 21, 22, 23],
    rh: [50, 55, 60, 65],
    ws: [10, 12, 14, 16],
    prec: [0, 0, 0, 0],
    hr: [1, 2, 3, 4],
    bui: [50, 50, 50, 50],
    id: [1, 1, 1, 1]
  };
  
  try {
    const result = hffmc(weatherData, { ffmcOld: 85, timeStep: 1, hourlyFWI: true });
    console.log(result);
  } catch (error) {
    console.error(error);
  }
   */