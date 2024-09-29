import { shapeFunctionDerivatives } from '../plates/shapeFunctionDerivatives';

test('shapeFunctionDerivatives computes correct derivatives', () => {
 
  const nnel = 4;
  const dshapedxi =  [0.25, -0.25, 0.25, -0.25];
  const dshapedeta = [-0.25, -0.25, 0.25, 0.25];
  const invjacob = [
    [2.0, 0.0],
    [0.0, 2.0],
  ];

  const { dshapedx, dshapedy } = shapeFunctionDerivatives(
    nnel,
    dshapedxi,
    dshapedeta,
    invjacob
  );

  // Expected results
 const expectedDshapedx = dshapedxi.map((val) => invjacob[0][0] * val);
 const expectedDshapedy = dshapedeta.map((val) => invjacob[1][1] * val);


  // Assertions
  for (let i = 0; i < nnel; i++) {
    expect(dshapedx[i]).toBeCloseTo(expectedDshapedx[i], 5);
    expect(dshapedy[i]).toBeCloseTo(expectedDshapedy[i], 5);
  }
});
