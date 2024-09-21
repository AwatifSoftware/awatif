
export function shapeFunctionDerivatives(
    nnel: number,
    dshapedxi: number[],
    dshapedeta: number[],
    invjacob: number[][]
  ): { dshapedx: number[]; dshapedy: number[] } {
    // Initialize arrays for derivatives
    const dshapedx: number[] = new Array(nnel);
    const dshapedy: number[] = new Array(nnel);
  
    // Compute derivatives for each node
    for (let i = 0; i < nnel; i++) {
      dshapedx[i] = invjacob[0][0] * dshapedxi[i] + invjacob[0][1] * dshapedeta[i];
      dshapedy[i] = invjacob[1][0] * dshapedxi[i] + invjacob[1][1] * dshapedeta[i];
    }
  
    return { dshapedx, dshapedy };
  }
  