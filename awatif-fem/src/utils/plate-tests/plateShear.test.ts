import { plateShear } from '../plates/plateShear';

test('plateShear computes the correct kinematic matrix for shear', () => {
  const nnel = 2;
  const dshapedx = [0.1, 0.2];
  const dshapedy = [0.2, 0.3];
  const shape = [0.25, 0.25];

  const ps = plateShear(nnel, dshapedx, dshapedy, shape);

  const expectedPs = [
    [0.1, -0.25, 0, 0.2, -0.25, 0],
    [0.2, 0, -0.25, 0.3, 0, -0.25],
  ];

  expect(ps).toEqual(expectedPs);
});
