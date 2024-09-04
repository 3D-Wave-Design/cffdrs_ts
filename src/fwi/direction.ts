/**
 * Direction definer
 *
 * @description New DIRECTION function to determine clockwise or
 * counter-clockwise "interpretation"
 *
 * @param bearingT1T2 Bearing between T1 and T2
 * @param bearingT1T3 Bearing between T1 and T3
 * @param ThetaAdeg Direction
 *
 * @return DIR - a direction in degrees
 */

function direction(bearingT1T2: number[], bearingT1T3: number[], ThetaAdeg: number): number[] {
    const DIR: number[] = new Array(bearingT1T2.length).fill(NaN);

    for (let i = 0; i < bearingT1T2.length; i++) {
        let T1T2 = bearingT1T2[i];
        let T1T3 = bearingT1T3[i];
        
        if (T1T2 > 0 && T1T3 > 0 && T1T2 > T1T3) {
            DIR[i] = T1T2 - ThetaAdeg;
        } else if (T1T2 > 0 && T1T3 > 0 && T1T2 < T1T3) {
            DIR[i] = T1T2 + ThetaAdeg;
        } else if (T1T2 < 0 && T1T3 < 0 && T1T2 > T1T3) {
            DIR[i] = T1T2 - ThetaAdeg;
        } else if (T1T2 < 0 && T1T3 < 0 && T1T2 < T1T3) {
            DIR[i] = T1T2 + ThetaAdeg;
        } else if (T1T2 > 0 && T1T2 < 90 && T1T3 < 0 && T1T3 > -90) {
            DIR[i] = T1T2 - ThetaAdeg;
        } else if (T1T2 < 0 && T1T2 > -90 && T1T3 > 0 && T1T3 < 90) {
            DIR[i] = T1T2 + ThetaAdeg;
        } else if (T1T2 > 90 && T1T3 < -90 && T1T2 + ThetaAdeg > 180) {
            DIR[i] = T1T2 + ThetaAdeg - 360;
        } else if (T1T2 > 90 && T1T3 < -90 && T1T2 + ThetaAdeg < 180) {
            DIR[i] = T1T2 + ThetaAdeg;
        } else if (T1T2 < -90 && T1T3 > 90 && T1T2 - ThetaAdeg < -180) {
            DIR[i] = T1T2 - ThetaAdeg + 360;
        } else if (T1T2 < -90 && T1T3 > 90 && T1T2 - ThetaAdeg > -180) {
            DIR[i] = T1T2 - ThetaAdeg;
        }

        if (DIR[i] < -180) {
            DIR[i] = DIR[i] + 10;
        }
        if (DIR[i] > 180) {
            DIR[i] = DIR[i] - 10;
        }
    }

    return DIR;
}

// Exporting function for external usage
export { direction };
