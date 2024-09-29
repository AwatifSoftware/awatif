export function plateBending(
    nnel: number,
    dshapedx: number[],
    dshapedy: number[]
  ): number[][] {
    // Initialize pb as a 3 x (nnel * 3) matrix filled with zeros
    const numRows = 3;
    const numCols = nnel * 3;
    const pb: number[][] = Array.from({ length: numRows }, () =>
      new Array(numCols).fill(0)
    );
  
    // Loop over each node
    for (let i = 0; i < nnel; i++) {
      const i1 = i * 3;
      const i2 = i1 + 1;
      const i3 = i1 + 2;
  
      pb[0][i2] = -dshapedx[i];
      pb[1][i3] = -dshapedy[i];
      pb[2][i2] = -dshapedy[i];
      pb[2][i3] = -dshapedx[i];
      pb[2][i1] = 0;
    }
  
    return pb;
  }
  