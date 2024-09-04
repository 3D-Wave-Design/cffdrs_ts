import * as geolib from 'geolib';

interface InputData {
  T1: number;
  LONG1: number;
  LAT1: number;
  T2: number;
  LONG2: number;
  LAT2: number;
  T3: number;
  LONG3: number;
  LAT3: number;
}

interface OutputData {
  Ros: number;
  Direction: number;
}

function direction(bearingT1T2: number, bearingT1T3: number, ThetaAdeg: number): number {
  // Calculate the direction based on the provided bearings and angle
  // This is a placeholder implementation; the actual logic should be based on the R code's .direction function
  return (bearingT1T2 + bearingT1T3 + ThetaAdeg) % 360; // Adjust this logic as needed
}

function pros(input: InputData[]): OutputData[] {
  // Force uppercase to the column names
  input.forEach((entry) => {
    for (const key in entry) {
      if (entry.hasOwnProperty(key)) {
        const upperKey = key.toUpperCase();
        if (upperKey !== key) {
          entry[upperKey as keyof InputData] = entry[key as keyof InputData];
          delete entry[key as keyof InputData];
        }
      }
    }
  });

  // Check if the columns exist
  const requiredColumns = [
    "T1", "LONG1", "LAT1", "T2", "LONG2", "LAT2", "T3", "LONG3", "LAT3"
  ];

  input.forEach((entry) => {
    requiredColumns.forEach((col) => {
      if (!(col in entry)) {
        throw new Error(`Column ${col} is required in column list.`);
      }
    });
  });

  return input.map((entry) => {
    const LengthT1T2 = geolib.getDistance(
      { latitude: entry.LAT1, longitude: entry.LONG1 },
      { latitude: entry.LAT2, longitude: entry.LONG2 }
    );
    const LengthT1T3 = geolib.getDistance(
      { latitude: entry.LAT1, longitude: entry.LONG1 },
      { latitude: entry.LAT3, longitude: entry.LONG3 }
    );
    const LengthT2T3 = geolib.getDistance(
      { latitude: entry.LAT2, longitude: entry.LONG2 },
      { latitude: entry.LAT3, longitude: entry.LONG3 }
    );

    const bearingT1T2 = geolib.getGreatCircleBearing(
      { latitude: entry.LAT1, longitude: entry.LONG1 },
      { latitude: entry.LAT2, longitude: entry.LONG2 }
    );
    const bearingT1T3 = geolib.getGreatCircleBearing(
      { latitude: entry.LAT1, longitude: entry.LONG1 },
      { latitude: entry.LAT3, longitude: entry.LONG3 }
    );

    const AngleArad = Math.acos(
      (Math.pow(LengthT1T3, 2) + Math.pow(LengthT1T2, 2) - Math.pow(LengthT2T3, 2))
      / (2 * LengthT1T3 * LengthT1T2)
    );
    const AngleAdeg = (AngleArad * 180) / Math.PI;

    const ThetaArad = Math.atan(
      ((entry.T3 - entry.T1) / (entry.T2 - entry.T1))
      * (LengthT1T2 / (LengthT1T3 * Math.sin(AngleArad)))
      - (1 / Math.tan(AngleArad))
    );
    const ThetaAdeg = (ThetaArad * 180) / Math.PI;

    const DIR = direction(bearingT1T2, bearingT1T3, ThetaAdeg);
    const ROS = (LengthT1T2 * Math.cos(ThetaArad)) / (entry.T2 - entry.T1);

    return { Ros: ROS, Direction: DIR };
  });
}

// Example usage
const inputData: InputData[] = [
  {
    T1: 2, LONG1: -79.701027, LAT1: 43.808872,
    T2: 50, LONG2: -79.699650, LAT2: 43.808833,
    T3: 120, LONG3: -79.700387, LAT3: 43.809816
  }
];

const result = pros(inputData);
console.log(result);
