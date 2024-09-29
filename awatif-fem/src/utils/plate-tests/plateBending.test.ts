import { plateBending } from '../plates/plateBending';

test('plateBending computes the correct kinematic matrix for bending', () => {
  const nnel = 2;
  const dshapedx = [0.1, 0.2];
  const dshapedy = [0.2, 0.3];

  const pb = plateBending(nnel, dshapedx, dshapedy);

  const expectedPb = [
    [0.00000,   -0.10000,    0.00000,   0.00000 ,  -0.20000,    0.00000],
    [0.00000,    0.00000,   -0.20000,    0.00000,    0.00000,   -0.30000],
    [0.00000,   -0.20000,   -0.10000,    0.00000,   -0.30000,   -0.20000],
  ];

  expect(pb).toEqual(expectedPb);
});



