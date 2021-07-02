const utils = {
  componentToHex: function(c) {
    var hex = c.toString(16);
    return hex.length == 1 ? "0" + hex : hex;
  },

  rgbToHex: function(r, g, b) {
    return "#" + this.componentToHex(r) + this.componentToHex(g) + this.componentToHex(b);
  },

  colorMapper: {
    simple(value) {
      let v = parseInt(((value+1)/2)*255);
      return `rgb(${v},${v},${v})`;
    },
    highlighted(value) {
      let v = Math.abs(value);
      v *= 256;
      v += Math.max(0, (25 - v) * 8);
      v = value > 255 ? 255 : v;
      return `rgb(${v},${v},${v})`;
    },
    colored(value) {
      return `hsl(${parseInt(value * 250)},50%,50%)`;
    }
  }
}
