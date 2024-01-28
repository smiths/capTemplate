export interface MyGlobals {
  tleLines: { [id: string]: string[] };
}

const globals: MyGlobals = {
  tleLines: {
    "55098": [
      "1 55098U 23001CT  23359.66872105  .00021921  00000-0  89042-3 0  9991",
      "2 55098  97.4576  58.0973 0014812  57.5063 302.7604 15.24489013 54199",
    ],
  },
};

export default globals;
