// Determine the critical axis (based on section modulus)
const index: number = [w_ply, w_plz].indexOf(Math.max(w_ply, w_plz)); // Index for max section modulus

// Parameters for the critical axis
const L_I: number[] = [I_y, I_z];
const L_w: number[] = [w_ply, w_plz];
const L_bh: [number, number][] = [
  [widthh, heightt],
  [heightt, widthh],
];
const L_fmk: number[] = [f_myk, f_mzk];
const L_k_crit: number[] = [1, 1]; // Stability coefficients (default to 1)

// Select parameters for the critical axis
const I_crit = L_I[index];
const w_crit = L_w[index];
const [b_crit, h_crit] = L_bh[index];
const f_mk_crit = L_fmk[index];
let k_crit = L_k_crit[index];

// Calculate relative slenderness for the critical axis
const lamb_relm =
  Math.sqrt((l_ef * 1000) / (Math.PI * Math.pow(widthh, 2))) *
  Math.sqrt(f_myk / Math.sqrt(entryParams.grade.E05 * entryParams.grade.G05));

// Determine the buckling coefficient based on slenderness
if (lamb_relm <= 0.75) {
  k_crit = 1;
} else if (lamb_relm > 0.75 && lamb_relm < 1.4) {
  k_crit = 1.56 - 0.75 * lamb_relm;
} else if (lamb_relm >= 1.4) {
  k_crit = 1 / Math.pow(lamb_relm, 2);
}

// Adjust stability coefficients based on critical axis
if (index === 0) {
  L_k_crit[0] = k_crit;
  L_k_crit[1] = 1;
} else if (index === 1) {
  L_k_crit[0] = 1;
  L_k_crit[1] = k_crit;
}

// Perform design checks and calculate utilizations
let utilizationY, utilizationZ;
let checkY, checkZ;

// Y-axis check
if (k_crit === 1 && lamb_rel_y < 0.3) {
  utilizationY =
    Math.pow(sigma_c0d / f_c0d, 2) +
    sigma_myd / f_myd +
    (0.7 * sigma_mzd) / f_mzd;
  checkY = "EN 1995-1-1 Ch. 6.2.4 - Combined bending and axial compression";
} else if (k_crit === 1 && lamb_rel_y > 0.3) {
  utilizationY =
    sigma_c0d / (f_c0d * k_c_y) +
    sigma_myd / f_myd +
    (0.7 * sigma_mzd) / f_mzd;
  checkY =
    "EN 1995-1-1 Ch. 6.3.2 - Columns subjected to either compression or combined compression and bending";
} else if (k_crit < 1) {
  utilizationY =
    sigma_c0d / (f_c0d * k_c_y) +
    sigma_myd / (f_myd * k_crit) +
    Math.pow(sigma_mzd / f_mzd, 2);
  checkY =
    "EN 1995-1-1 Ch. 6.3.3 - Beams subjected to either bending or combined bending and compression";
}

// Z-axis check
if (k_crit === 1 && lamb_rel_z < 0.3) {
  utilizationZ =
    Math.pow(sigma_c0d / f_c0d, 2) +
    (0.7 * sigma_myd) / f_myd +
    sigma_mzd / f_mzd;
  checkZ = "EN 1995-1-1 Ch. 6.2.4 - Combined bending and axial compression";
} else if (k_crit === 1 && lamb_rel_z > 0.3) {
  utilizationZ =
    sigma_c0d / (f_c0d * k_c_z) +
    (0.7 * sigma_myd) / f_myd +
    sigma_mzd / f_mzd;
  checkZ =
    "EN 1995-1-1 Ch. 6.3.2 - Columns subjected to either compression or combined compression and bending";
} else if (k_crit < 1) {
  utilizationZ =
    sigma_c0d / (f_c0d * k_c_z) +
    sigma_myd / (f_myd * k_crit) +
    sigma_mzd / f_mzd;
  checkZ =
    "EN 1995-1-1 Ch. 6.3.3 - Beams subjected to either bending or combined bending and compression";
}



<h2>Checks</h2>

    ${designInputs.val[i][5] !== 0
      ? html`
          <h3>Around y-axis</h3>
          <p class="caption">${designResultsInterface.val[i].checkY}</p>

          ${designResultsInterface.val[i].checkY ===
          "EN 1995-1-1 Ch. 6.2.4 - Combined bending and axial compression"
            ? html`
                <p class="math">
                  ${renderMath(
                    `\\left(\\frac{\\sigma_{cd}}{f_{c0d}}\\right)^2 + 0.7 \\cdot \\frac{\\sigma_{myd}}{f_{myd}} + \\frac{\\sigma_{mzd}}{f_{mzd}} = ${designResultsInterface.val[
                      i
                    ].utilizationY.toFixed(
                      2
                    )} \\text{ for } k_{crit} = 1 \\text{ and } \\lambda_{rel,y} < 0.3`
                  )}
                </p>
                <br />
              `
            : designResultsInterface.val[i].checkY ===
              "EN 1995-1-1 Ch. 6.3.2 - Columns subjected to either compression or combined compression and bending"
            ? html`
                <p class="math">
                  ${renderMath(
                    `\\frac{\\sigma_{cd}}{f_{c0d} \\cdot k_{c,y}} + 0.7 \\cdot \\frac{\\sigma_{myd}}{f_{myd}} + \\frac{\\sigma_{mzd}}{f_{mzd}} = ${designResultsInterface.val[
                      i
                    ].utilizationY.toFixed(
                      2
                    )} \\text{ for } k_{crit} = 1 \\text{ and } \\lambda_{rel,y} > 0.3`
                  )}
                </p>
                <br />
              `
            : html`
                <p class="math">
                  ${renderMath(
                    `\\frac{\\sigma_{cd}}{f_{c0d} \\cdot k_{c,y}} + \\frac{\\sigma_{myd}}{f_{myd} \\cdot k_{crit}} + \\frac{\\sigma_{mzd}}{f_{mzd}} = ${designResultsInterface.val[
                      i
                    ].utilizationY.toFixed(2)} \\text{ for } k_{crit} < 1`
                  )}
                </p>
                <br />
              `}
        `
      : html``}
    ${designInputs.val[i][6] !== 0
      ? html`
          <h3>Around z-axis</h3>
          <p class="caption">${designResultsInterface.val[i].checkZ}</p>

          ${designResultsInterface.val[i].checkZ ===
          "EN 1995-1-1 Ch. 6.2.4 - Combined bending and axial compression"
            ? html`
                <p class="math">
                  ${renderMath(
                    `\\left(\\frac{\\sigma_{cd}}{f_{c0d}}\\right)^2 + \\frac{\\sigma_{myd}}{f_{myd}} + 0.7 \\cdot \\frac{\\sigma_{mzd}}{f_{mzd}} = ${designResultsInterface.val[
                      i
                    ].utilizationZ.toFixed(
                      2
                    )} \\text{ if } k_{crit} = 1 \\text{ and } \\lambda_{rel,z} < 0.3`
                  )}
                </p>
                <br />
              `
            : designResultsInterface.val[i].checkZ ===
              "EN 1995-1-1 Ch. 6.3.2 - Columns subjected to either compression or combined compression and bending"
            ? html`
                <p class="math">
                  ${renderMath(
                    `\\frac{\\sigma_{cd}}{f_{c0d} \\cdot k_{c,z}} + \\frac{\\sigma_{myd}}{f_{myd}} + 0.7 \\cdot \\frac{\\sigma_{mzd}}{f_{mzd}} = ${designResultsInterface.val[
                      i
                    ].utilizationZ.toFixed(
                      2
                    )} \\text{ if } k_{crit} = 1 \\text{ and } \\lambda_{rel,z} > 0.3`
                  )}
                </p>
                <br />
              `
            : html`
                <p class="math">
                  ${renderMath(
                    `\\frac{\\sigma_{cd}}{f_{c0d} \\cdot k_{c,z}} + \\frac{\\sigma_{myd}}{f_{myd} \\cdot k_{crit}} + \\frac{\\sigma_{mzd}}{f_{mzd}} = ${designResultsInterface.val[
                      i
                    ].utilizationZ.toFixed(2)} \\text{ if } k_{crit} < 1`
                  )}
                </p>
                <br />
              `}
        `
      : html``}