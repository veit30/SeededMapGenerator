// console.log(new Math.seedrandom()())

const prng = new alea();
const nodes = 8;

const perlin = {
  randomUnitVector: function() {
    this.key = prng(this.key);
    let theta = this.key * 2 * Math.PI;
    return {
      x: Math.cos(theta),
      y: Math.sin(theta),
    };
  },

  seed: function(s) {
    this.gradients = {};
    this.memory = {};
    this.key = prng(s);
  },

  smooth: function(x) {
    return 6*x**5 - 15*x**4 + 10*x**3;
  },

  interpolate: function(x, a, b) {
    return a + this.smooth(x) * (b-a);
  },

  dot: function(x, y, vx, vy) {
    let g_vect;
    let d_vect = {x: x - vx, y: y - vy};
    if (this.gradients[[vx,vy]]){
      g_vect = this.gradients[[vx,vy]];
    } else {
      g_vect = this.randomUnitVector();
      this.gradients[[vx, vy]] = g_vect;
    }
    return d_vect.x * g_vect.x + d_vect.y * g_vect.y;
  },

  get: function(x,y) {
    if (this.memory.hasOwnProperty([x,y]))
      return this.memory[[x,y]];
    let xf = Math.floor(x);
    let yf = Math.floor(y);
    //interpolate
    let tl = this.dot(x, y, xf,   yf);
    let tr = this.dot(x, y, xf+1, yf);
    let bl = this.dot(x, y, xf,   yf+1);
    let br = this.dot(x, y, xf+1, yf+1);
    let xt = this.interpolate(x-xf, tl, tr);
    let xb = this.interpolate(x-xf, bl, br);
    let v = this.interpolate(y-yf, xt, xb);
    this.memory[[x,y]] = v;
    return v;
  },
}

function createGrid(nodes) {
  let grid = [];
  for (let i = 0; i < nodes; i++) {
    let row = [];
    for(let j = 0; j < nodes; j++) {
      row.push(perlin.randomUnitVector());
    }
    grid.push(row);
  }
  return grid;
}

function mapGridToColorValue(grid) {
  return grid.map(row => {
    return row.map(item => {
      let val = Math.atan2(item.x, item.y) + Math.PI;
      let frac = val / (2*Math.PI);
      let shade = Math.ceil(frac * 255);
      return utils.rgbToHex(shade, shade, shade);
    })
  });
}


function mapGridToColorValue2(grid) {
  return grid.map(row => {
    return row.map(item => {
      let val = item + 1;
      let frac = val / 2;
      let shade = Math.ceil(frac * 255);
      return utils.rgbToHex(shade, shade, shade);
    })
  });
}


perlin.seed();
