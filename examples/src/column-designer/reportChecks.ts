import { html } from "lit-html";
import { renderMath } from "./reportUtils";

export function generateCompressionCheckHTML(results) {
  return html`

    <h3>Compression parallel to the grain</h3>
    <p class="caption">EN1995-1-1 Ch. 6.1.4</p>

    <p class="math">
      ${renderMath(
        `\\sigma_{c,0,d} = \\frac{N_{ed}}{A} = ${results.compressionCheckResult.sigma_c0d.toFixed(
          2
        )} \\ \\text{N/mm}^2`
      )}
      <span class="explanation">(Design compressive stress)</span>
    </p>
    <br />

    <p class="math">
      ${renderMath(
        `f_{c,0,d} = f_{c,0,k} \\cdot \\chi = ${results.designResistance.f_c0d.toFixed(
          2
        )} \\ \\text{N/mm}^2`
      )}
      <span class="explanation">(Design compressive strength)</span>
    </p>
    <br />

    <p class="math">
      ${renderMath(
        `\\eta = \\frac{\\sigma_{c,0,d}}{f_{c,0,d}} = ${(
          results.compressionCheckResult.etaCheckCompressionParallelToGrain * 100
        ).toFixed(2)} \\%`
      )}
      <span class="explanation">(Utilization ratio)</span>
    </p>
    <br /><br/>
  `;
}

export function generateBendingCheckHTML(results) {
  return html`
    <h3>Bending</h3>
    <p class="caption">EN1995-1-1 Ch. 6.1.6</p>

    <p class="math">
      ${renderMath(
        `\\sigma_{m,y,d} = \\frac{M_{y,d}}{W_{pl,y}} = ${results.bendingCheckResult.sigma_myd.toFixed(
          2
        )} \\ \\text{N/mm}^2`
      )}
      <span class="explanation">(Bending stress about y-axis)</span>
    </p>
    <br />

    <p class="math">
      ${renderMath(
        `\\sigma_{m,z,d} = \\frac{M_{z,d}}{W_{pl,z}} = ${results.bendingCheckResult.sigma_mzd.toFixed(
          2
        )} \\ \\text{N/mm}^2`
      )}
      <span class="explanation">(Bending stress about z-axis)</span>
    </p>
    <br />

    <p class="math">
      ${renderMath(
        `\\eta_{y} = \\frac{\\sigma_{m,y,d}}{f_{m,y,d}} + k_{m} \\cdot \\frac{\\sigma_{m,z,d}}{f_{m,z,d}} = ${
          results.bendingCheckResult.etaCheckBendingY.toFixed(2) * 100
        } \\%`
      )}
      <span class="explanation">(Utilization ratio for bending y-axis)</span>
    </p>
    <br/><br/>
  `;
}

export function generateCombinedBendingCompressionCheckHTML(M_yd, M_zd, results) {
  return html`
    <h4>Combined bending and axial compression</h4>
    <p class="caption">EN1995-1-1 Ch. 6.2.4</p>

    ${
        M_yd !== 0 && M_zd === 0
          ? html`
          <p class="math">
          ${renderMath(
            `\\sigma_{c,0,d} = \\frac{N_{ed}}{A} = ${results.compressionCheckResult.sigma_c0d.toFixed(
              2
            )} \\ \\text{N/mm}^2`
          )}
          <span class="explanation">(Design compressive stress)</span>
        </p>
        <br />
    
        <p class="math">
          ${renderMath(
            `\\sigma_{m,y,d} = \\frac{M_{yd}}{W_{ply}} = ${results.bendingCheckResult.sigma_myd.toFixed(
              2
            )} \\ \\text{N/mm}^2`
          )}
          <span class="explanation">(Bending stress about the y-axis)</span>
        </p>
        <br />
    
        <p class="math">
          ${renderMath(
            `\\eta_{y} = \\left( \\frac{\\sigma_{c,0,d}}{f_{c,0,d}} \\right)^2 + \\frac{\\sigma_{m,y,d}}{f_{myd}} = ${
                results.combinedBendingCompressionCheckResult.etaCheckCombinedBendingCompressionZ.toFixed(2) * 100
            } \\%`
          )}
          <span class="explanation"
            >(Utilization ratio for combined bending and axial compression about the
            y-axis)</span
          >
        </p>
        <br />
        <br /><br/>
            `
          : html``
      }
    
      ${
        M_zd !== 0 && M_yd === 0
          ? html`
          <p class="math">
          ${renderMath(
            `\\sigma_{c,0,d} = \\frac{N_{ed}}{A} = ${results.compressionCheckResult.sigma_c0d.toFixed(
              2
            )} \\ \\text{N/mm}^2`
          )}
          <span class="explanation">(Design compressive stress)</span>
        </p>
        <br />
    
        <p class="math">
          ${renderMath(
            `\\sigma_{m,z,d} = \\frac{M_{zd}}{W_{plz}} = ${results.bendingCheckResult.sigma_mzd.toFixed(
              2
            )} \\ \\text{N/mm}^2`
          )}
          <span class="explanation">(Bending stress about the z-axis)</span>
        </p>
        <br />
    
        <p class="math">
          ${renderMath(
            `\\eta_{z} = \\left( \\frac{\\sigma_{c,0,d}}{f_{c,0,d}} \\right)^2 + \\frac{\\sigma_{m,z,d}}{f_{mzd}} = ${
              results.combinedBendingCompressionCheckResult.etaCheckCombinedBendingCompressionY.toFixed(2) * 100
            } \\%`
          )}
          <span class="explanation"
            >(Utilization ratio for combined bending and axial compression about the
            z-axis)</span
          >
        </p>
        <br /><br/>
            `
          : html`
          
          <p class="math">
          ${renderMath(
            `\\sigma_{c,0,d} = \\frac{N_{ed}}{A} = ${results.compressionCheckResult.sigma_c0d.toFixed(
              2
            )} \\ \\text{N/mm}^2`
          )}
          <span class="explanation">(Design compressive stress)</span>
        </p>
        <br />
    
        <p class="math">
          ${renderMath(
            `\\sigma_{m,y,d} = \\frac{M_{yd}}{W_{ply}} = ${results.bendingCheckResult.sigma_myd.toFixed(
              2
            )} \\ \\text{N/mm}^2`
          )}
          <span class="explanation">(Bending stress about the y-axis)</span>
        </p>
        <br />
    
        <p class="math">
          ${renderMath(
            `\\sigma_{m,z,d} = \\frac{M_{zd}}{W_{plz}} = ${results.bendingCheckResult.sigma_mzd.toFixed(
              2
            )} \\ \\text{N/mm}^2`
          )}
          <span class="explanation">(Bending stress about the z-axis)</span>
        </p>
        <br />
    
        <p class="math">
          ${renderMath(
            `\\eta_{y} = \\left( \\frac{\\sigma_{c,0,d}}{f_{c,0,d}} \\right)^2 + \\frac{\\sigma_{m,y,d}}{f_{myd}} + k_m \\cdot \\frac{\\sigma_{m,z,d}}{f_{mzd}} = ${
                results.combinedBendingCompressionCheckResult.etaCheckCombinedBendingCompressionZ.toFixed(2) * 100
            } \\%`
          )}
          <span class="explanation"
            >(Utilization ratio for combined bending and axial compression about the
            y-axis)</span
          >
        </p>
        <br />
    
        <p class="math">
          ${renderMath(
            `\\eta_{z} = \\left( \\frac{\\sigma_{c,0,d}}{f_{c,0,d}} \\right)^2 + k_m \\cdot \\frac{\\sigma_{m,y,d}}{f_{myd}} + \\frac{\\sigma_{m,z,d}}{f_{mzd}} = ${
              results.combinedBendingCompressionCheckResult.etaCheckCombinedBendingCompressionY.toFixed(2) * 100
            } \\%`
          )}
          <span class="explanation"
            >(Utilization ratio for combined bending and axial compression about the
            z-axis)</span
          >
        </p>
        <br /><br/>

          `
      }
      `;
}

export function generateStabilityCheckHTML(M_yd, M_zd, results) {
  return html`
  <h4>Columns subjected to either compression or combined compression and bending</h4>
  <p class="caption">EN1995-1-1 Ch. 6.3</p> 

  ${
    M_yd !== 0
      ? html`
          <h3>Around y-axis</h3>
          <p class="math">
            ${renderMath(
              `\\lambda_{ef,y} = \\frac{l_{ef}}{i_y} = ${results.stabilityCheckResult.lamb_y.toFixed(2)}`
            )}
            <span class="explanation"
              >(Slenderness absolute along y-axis)</span
            >
          </p>
          <br />
          <p class="math">
            ${renderMath(
              `\\lambda_{rel,y} = \\frac{\\lambda_{y}}{\\pi} \\sqrt{\\frac{f_{c0k}}{E_{05}}} = ${results.stabilityCheckResult.lamb_rel_y.toFixed(2)}`
            )}
            <span class="explanation"
              >(Relative slenderness along y-axis)</span
            >
          </p>
          <br />
          <p class="math">
            ${renderMath(
              `k_{y,y} = 0.5 \\left(1 + 0.1 \\cdot (\\lambda_{rel,y} - 0.3) + \\lambda_{rel,y}^2 \\right) = ${results.stabilityCheckResult.k_y_y.toFixed(2)}`
            )}
            <span class="explanation">(Y-axis coefficient)</span>
          </p>
          <br />
          <p class="math">
            ${renderMath(
              `k_{c,y} = \\frac{1}{k_{y,y} + \\sqrt{k_{y,y}^2 - \\lambda_{rel,y}^2}} = ${results.stabilityCheckResult.k_c_y.toFixed(2)}`
            )}
            <span class="explanation">(Y-axis buckling coefficient)</span>
          </p>
          <p class="math">
            ${renderMath(
              `\\eta_{y} = \\left( \\frac{\\sigma_{c,0,d}}{f_{c,0,d} \\cdot k_{c,y}} \\right) + k_m \\cdot \\frac{\\sigma_{m,y,d}}{f_{myd}} + \\frac{\\sigma_{m,z,d}}{f_{mzd}} = ${
                results.stabilityCheckResult.etaStabilityZ.toFixed(2) * 100
              } \\%`
            )}
            <span class="explanation">
              (Utilization ratio for combined bending and axial compression
              about the z-axis)
            </span>
          </p>
          <br/>
        `
      : html``
  }
  

  ${
    M_zd !== 0
      ? html`
          <h3>Around z-axis</h3>
          <p class="math">
            ${renderMath(
              `\\lambda_{ef,z} = \\frac{l_{ef}}{i_z} = ${results.stabilityCheckResult.lamb_z.toFixed(2)}`
            )}
            <span class="explanation"
              >(Slenderness absolute along z-axis)</span
            >
          </p>
          <br />
          <p class="math">
            ${renderMath(
              `\\lambda_{rel,z} = \\frac{\\lambda_{z}}{\\pi} \\sqrt{\\frac{f_{c0k}}{E_{05}}} = ${results.stabilityCheckResult.lamb_rel_z.toFixed(2)}`
            )}
            <span class="explanation"
              >(Relative slenderness along z-axis)</span
            >
          </p>
          <br />
          <p class="math">
            ${renderMath(
              `k_{y,z} = 0.5 \\left(1 + 0.1 \\cdot (\\lambda_{rel,z} - 0.3) + \\lambda_{rel,z}^2 \\right) = ${results.stabilityCheckResult.k_y_z.toFixed(2)}`
            )}
            <span class="explanation">(Z-axis coefficient)</span>
          </p>
          <br />
          <p class="math">
            ${renderMath(
              `k_{c,z} = \\frac{1}{k_{y,z} + \\sqrt{k_{y,z}^2 - \\lambda_{rel,z}^2}} = ${results.stabilityCheckResult.k_c_z.toFixed(2)}`
            )}
            <span class="explanation">(Z-axis buckling coefficient)</span>
          </p>
          <p class="math">
            ${renderMath(
              `\\eta_{z} = \\left( \\frac{\\sigma_{c,0,d}}{f_{c,0,d} \\cdot k_{c,z}} \\right) + k_m \\cdot \\frac{\\sigma_{m,y,d}}{f_{myd}} + \\frac{\\sigma_{m,z,d}}{f_{mzd}} = ${
                results.stabilityCheckResult.etaStabilityY.toFixed(2) * 100
              } \\%`
            )}
            <span class="explanation"
              >(Utilization ratio for combined bending and axial compression
              about the z-axis)</span
            >
          </p>
          <br />
        `
      : html``
  }
  `;
}

export function generateLTBCheckHTML(input, results) {
    return html`
    <br />
    <h3>Lateral Torsional Stability</h3>
    <p class="caption">EN1995-1-1 Ch. 6.3.3</p>
    <p class="p1">
      Lateral torsional stability shall be verified both in the case where only
      a moment My exists about the strong axis y and where a combination of
      moment My and compressive force N exists.
    </p>

    ${(input[5] !== 0 && input[6] !== 0) ||
        input[5] !== 0 ||
        input[6] === 0 ||
        input[5] === 0 ||
        input[6] !== 0
      ? html`
          <p class="p1">Lateral torsional stability shall be verified.</p>
          <p class="math">
            ${renderMath(
              `\\lambda_{relm} = \\sqrt{\\frac{l_{ef}}{\\pi \\cdot \\text{width}^2}} \\cdot \\sqrt{\\frac{f_{myk}}{\\sqrt{E_{05} \\cdot G_{05}}}}`
            )}
          </p>

          <p class="math">
            ${renderMath(
              `\\lambda_{relm} = \\sqrt{\\frac{l_{ef}}{\\pi \\cdot \\text{width}^2}} \\cdot \\sqrt{\\frac{f_{myk}}{\\sqrt{E_{05} \\cdot G_{05}}}} = ${results.lamb_relm.toFixed(2)}`
            )}
            <span class="explanation">(Relative slenderness for bending)</span>
          </p>
          <br />

          <p class="math">
            ${renderMath(`k_{crit} = ${results.k_crit.toFixed(2)} = 
                \\begin{cases} 
                1 & \\text{if } \\lambda_{relm} \\leq 0.75 \\\\ 
                1.56 - 0.75 \\cdot \\lambda_{relm} & \\text{if } 0.75 < \\lambda_{relm} < 1.4 \\\\ 
                \\frac{1}{\\lambda_{relm}^2} & \\text{if } \\lambda_{relm} \\geq 1.4 
                \\end{cases}`)}
            <span class="explanation"
              >(Factor for reduced bending strength due to lateral
              buckling.)</span
            >
          </p>
          <br /><br />
        `
      : html` <p class="p1">
            Lateral torsional stability will not be verified.
          </p>
          <br />`}
    `;
  }
  



export function generateCombinedBendingCompressionCheckHTMLXX(results) {
  return html``;
}



