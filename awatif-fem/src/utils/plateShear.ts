export function plateShear(
    nnel: number,
    dshapedx: number[],
    dshapedy: number[],
    shape: number[]
  ): number[][] {
    // Initialize ps as a 2 x (nnel * 3) matrix filled with zeros
    const numRows = 2;
    const numCols = nnel * 3;
    const ps: number[][] = Array.from({ length: numRows }, () =>
      new Array(numCols).fill(0)
    );
  
    // Loop over each node
    for (let i = 0; i < nnel; i++) {
      const i1 = i * 3;
      const i2 = i1 + 1;
      const i3 = i1 + 2;
  
      ps[0][i1] = dshapedx[i];
      ps[1][i1] = dshapedy[i];
      ps[0][i2] = -shape[i];
      ps[1][i3] = -shape[i];
    }
  
    return ps;
  }
  