let noise = {
  reset(seed) {
    this._p.reset(seed);
    this._s.reset(seed);
  },
  // at first only working for squares
  perlin2Grid(gridSize, resolution) {
    let numPixels = gridSize / resolution;
    let scale = gridSize * resolution;

    let grid = Array.from(new Array(scale), x => new Array(scale))

    for (let y = 0; y < gridSize; y += numPixels / gridSize) {
      for (let x = 0; x < gridSize; x += numPixels / gridSize) {
        let yi = y / numPixels * gridSize;
        let xi = x / numPixels * gridSize;
        grid[yi][xi] = this._p.get(x, y);
      }
    }

    return grid;
  },
  simplex2Grid(gridSize, resolution) {
    let numPixels = gridSize / resolution;
    let scale = gridSize * resolution;

    let grid = Array.from(new Array(scale), x => new Array(scale))

    for (let y = 0; y < gridSize; y += numPixels / gridSize) {
      for (let x = 0; x < gridSize; x += numPixels / gridSize) {
        let yi = y / numPixels * gridSize;
        let xi = x / numPixels * gridSize;
        grid[yi][xi] = this._s.get(x, y);
      }
    }

    return grid;
  },
  _p: {
    randomUnitVector() {
      this.seed = new alea(this.seed)();
      let theta = this.seed * 2 * Math.PI;
      return {
        x: Math.cos(theta),
        y: Math.sin(theta),
      };
    },
    reset(s) {
      this.gradients = {};
      this.memory = {};
      this.seed = new alea(s || Date.now())();
    },
    smooth(x) {
      return 6*x**5 - 15*x**4 + 10*x**3;
    },
    interpolate(x, a, b) {
      return a + this.smooth(x) * (b-a);
    },
    dot(x, y, vx, vy) {
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
    get(x, y) {
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
    }
  },
  _s: {
    p: [151,160,137,91,90,15,
      131,13,201,95,96,53,194,233,7,225,140,36,103,30,69,142,8,99,37,240,21,10,23,
      190, 6,148,247,120,234,75,0,26,197,62,94,252,219,203,117,35,11,32,57,177,33,
      88,237,149,56,87,174,20,125,136,171,168, 68,175,74,165,71,134,139,48,27,166,
      77,146,158,231,83,111,229,122,60,211,133,230,220,105,92,41,55,46,245,40,244,
      102,143,54, 65,25,63,161, 1,216,80,73,209,76,132,187,208, 89,18,169,200,196,
      135,130,116,188,159,86,164,100,109,198,173,186, 3,64,52,217,226,250,124,123,
      5,202,38,147,118,126,255,82,85,212,207,206,59,227,47,16,58,17,182,189,28,42,
      223,183,170,213,119,248,152, 2,44,154,163, 70,221,153,101,155,167, 43,172,9,
      129,22,39,253, 19,98,108,110,79,113,224,232,178,185, 112,104,218,246,97,228,
      251,34,242,193,238,210,144,12,191,179,162,241, 81,51,145,235,249,14,239,107,
      49,192,214, 31,181,199,106,157,184, 84,204,176,115,121,50,45,127, 4,150,254,
      138,236,205,93,222,114,67,29,24,72,243,141,128,195,78,66,215,61,156,180],
    grad2: [{x:1,y:1},{x:-1,y:1},{x:1,y:-1},{x:-1,y:-1},
             {x:1,y:0},{x:-1,y:0},{x:1,y:0},{x:-1,y:0},
             {x:0,y:1},{x:0,y:-1},{x:0,y:1},{x:0,y:-1}],
    get(xin, yin) {
      const F2 = 0.5*(Math.sqrt(3)-1);
      const G2 = (3-Math.sqrt(3))/6;

      var n0, n1, n2; // Noise contributions from the three corners
      // Skew the input space to determine which simplex cell we're in
      var s = (xin+yin)*F2; // Hairy factor for 2D
      var i = Math.floor(xin+s);
      var j = Math.floor(yin+s);
      var t = (i+j)*G2;
      var x0 = xin-i+t; // The x,y distances from the cell origin, unskewed.
      var y0 = yin-j+t;
      // For the 2D case, the simplex shape is an equilateral triangle.
      // Determine which simplex we are in.
      var i1, j1; // Offsets for second (middle) corner of simplex in (i,j) coords
      if(x0>y0) { // lower triangle, XY order: (0,0)->(1,0)->(1,1)
        i1=1; j1=0;
      } else {    // upper triangle, YX order: (0,0)->(0,1)->(1,1)
        i1=0; j1=1;
      }
      // A step of (1,0) in (i,j) means a step of (1-c,-c) in (x,y), and
      // a step of (0,1) in (i,j) means a step of (-c,1-c) in (x,y), where
      // c = (3-sqrt(3))/6
      var x1 = x0 - i1 + G2; // Offsets for middle corner in (x,y) unskewed coords
      var y1 = y0 - j1 + G2;
      var x2 = x0 - 1 + 2 * G2; // Offsets for last corner in (x,y) unskewed coords
      var y2 = y0 - 1 + 2 * G2;
      // Work out the hashed gradient indices of the three simplex corners
      i &= 255;
      j &= 255;
      var gi0 = this.gradP[i+this.perm[j]];
      var gi1 = this.gradP[i+i1+this.perm[j+j1]];
      var gi2 = this.gradP[i+1+this.perm[j+1]];
      // Calculate the contribution from the three corners
      var t0 = 0.5 - x0*x0-y0*y0;
      if(t0<0) {
        n0 = 0;
      } else {
        t0 *= t0;
        n0 = t0 * t0 * this.dot(gi0.x, gi0.y, x0, y0);  // (x,y) of grad3 used for 2D gradient
      }
      var t1 = 0.5 - x1*x1-y1*y1;
      if(t1<0) {
        n1 = 0;
      } else {
        t1 *= t1;
        n1 = t1 * t1 * this.dot(gi1.x, gi1.y, x1, y1);
      }
      var t2 = 0.5 - x2*x2-y2*y2;
      if(t2<0) {
        n2 = 0;
      } else {
        t2 *= t2;
        n2 = t2 * t2 * this.dot(gi2.x, gi2.y, x2, y2);
      }
      // Add contributions from each corner to get the final noise value.
      // The result is scaled to return values in the interval [-1,1].
      return 70 * (n0 + n1 + n2);
    },
    dot(x1,y1, x2, y2) {
      return x1*x2 + y1*y2;
    },
    seed(seed) {
      if(seed > 0 && seed < 1) {
        // Scale the seed out
        seed *= 65536;
      }

      seed = Math.floor(seed);
      if(seed < 256) {
        seed |= seed << 8;
      }

      for(var i = 0; i < 256; i++) {
        var v;
        if (i & 1) {
          v = this.p[i] ^ (seed & 255);
        } else {
          v = this.p[i] ^ ((seed>>8) & 255);
        }

        this.perm[i] = this.perm[i + 256] = v;
        this.gradP[i] = this.gradP[i + 256] = this.grad2[v % 12];
      }
    },
    reset(seed) {
      this.perm = new Array(512);
      this.gradP = new Array(512);
      this.seed(seed);
    }
  }
}
