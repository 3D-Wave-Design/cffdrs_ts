/* #' Overwintering Drought Code
#'
#' @description \code{overwinter_drought_code} calculates an initial or season
#' starting Drought Code (DC) value based on a standard method of overwintering
#' the Drought Code (Lawson and Armitage 2008).  This method uses the final DC
#' value from previous year, over winter precipitation and estimates of how much
#' over-winter precipitation 'refills' the moisture in this fuel layer. This
#' function could be used for either one weather station or for multiple weather
#' stations.
#'
#' Of the three fuel moisture codes (i.e. FFMC, DMC and DC) making up the FWI
#' System, only the DC needs to be considered in terms of its values carrying
#' over from one fire season to the next.  In Canada both the FFMC and the DMC
#' are assumed to reach moisture saturation from overwinter precipitation at or
#' before spring melt; this is a reasonable assumption and any error in these
#' assumed starting conditions quickly disappears.  If snowfall (or other
#' overwinter precipitation) is not large enough however, the fuel layer
#' tracked by the Drought Code may not fully reach saturation after spring snow
#' melt; because of the long response time in this fuel layer (53 days in
#' standard conditions) a large error in this spring starting condition can
#' affect the DC for a significant portion of the fire season.  In areas where
#' overwinter precipitation is 200 mm or more, full moisture recharge occurs
#' and DC overwintering is usually unnecessary.  More discussion of
#' overwintering and fuel drying time lag can be found in Lawson and Armitage
#' (2008) and Van Wagner (1985).
#'
#' @param DCf Final fall DC value from previous year
#' @param rw Winter precipitation (mm)
#' @param a User selected values accounting for carry-over fraction (view table
#' below)
#' @param b User selected values accounting for wetting efficiency fraction
#' (view table below)
#' @return \code{overwinter_drought_code} returns either a single value or a
#'    vector of wDC values.
#' @author Xianli Wang, Mike Wotton, Alan Cantin, and Mike Flannigan
#' @seealso \code{\link{fwi}}, \code{\link{fire_season}}
#' @references Lawson B.D. and Armitage O.B. 2008. Weather Guide for the
#' Canadian Forest Fire Danger Rating System. Natural Resources Canada,
#' Canadian Forest Service, Northern Forestry Centre, Edmonton, Alberta. 84 p.
#' \url{https://cfs.nrcan.gc.ca/pubwarehouse/pdfs/29152.pdf}
#'
#' Van Wagner, C.E. 1985. Drought, timelag and fire danger rating. Pages
#' 178-185 in L.R. Donoghue and R.E. Martin, eds. Proc. 8th Conf. Fire For.
#' Meteorol., 29 Apr.-3 May 1985, Detroit, MI. Soc. Am. For., Bethesda, MD.
#' \url{https://cfs.nrcan.gc.ca/pubwarehouse/pdfs/23550.pdf} */

function overwinterDroughtCode(DCf: number = 100, rw: number = 200, a: number = 0.75, b: number = 0.75): number {
    // Eq. 3 - Final fall moisture equivalent of the DC
    const Qf = 800 * Math.exp(-DCf / 400);
    // Eq. 2 - Starting spring moisture equivalent of the DC
    const Qs = a * Qf + b * (3.94 * rw);
    // Eq. 4 - Spring start-up value for the DC
    let DCs = 400 * Math.log(800 / Qs);
    // Constrain DC
    DCs = DCs < 15 ? 15 : DCs;
    return DCs;
  }
  
  // Example usage
  const winterDC1 = overwinterDroughtCode(300, 110);
  console.log(winterDC1);
  
  const winterDC2 = overwinterDroughtCode(300, 110, 1.0, 0.9);
  console.log(winterDC2);
  
  const winterDC3 = [400, 300, 250].map((DCf, i) => overwinterDroughtCode(DCf, [99, 110, 200][i], [0.75, 1.0, 0.75][i], [0.75, 0.9, 0.75][i]));
  console.log(winterDC3);
  