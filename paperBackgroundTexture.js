(function () {
  function mulberry32(seed) {
    var t = seed >>> 0;
    return function () {
      t += 0x6D2B79F5;
      var r = Math.imul(t ^ (t >>> 15), 1 | t);
      r ^= r + Math.imul(r ^ (r >>> 7), 61 | r);
      return ((r ^ (r >>> 14)) >>> 0) / 4294967296;
    };
  }

  function clamp(value, min, max) {
    return Math.max(min, Math.min(max, value));
  }

  function createSvgNode(type) {
    return document.createElementNS("http://www.w3.org/2000/svg", type);
  }

  function clearNode(node) {
    while (node.firstChild) {
      node.removeChild(node.firstChild);
    }
  }

  function toFixed(value, digits) {
    return Number(value).toFixed(digits || 3);
  }

  var DEFAULT_OPTIONS = {
    width: 1200,
    height: 900,
    seed: 12345,
    paperColor: "#f5f1e8",
    grainColor: "#44413c",
    grainOpacity: 0.2,
    grainFrequencyX: 0.85,
    grainFrequencyY: 0.65,
    grainOctaves: 4,
    embossStrength: 1.5,
    embossAzimuth: 77,
    embossElevation: 35,
    dirtCount: 800,
    dirtMinRadius: 0.4,
    dirtMaxRadius: 2.5,
    dirtOpacity: 0.18,
    dirtBlur: 1.95,
    dirtColor: "#6c5847",
    includeFibers: true,
    fiberCount: 1200,
    fiberLengthMin: 4,
    fiberLengthMax: 16,
    fiberStrokeWidth: 0.68,
    fiberOpacity: 0.17,
    fiberColor: "#9d8d79"
  };

  function PaperBackgroundTexture(svgNode, options) {
    if (!svgNode || svgNode.namespaceURI !== "http://www.w3.org/2000/svg") {
      throw new Error("PaperBackgroundTexture requires an SVG root node.");
    }

    this.svgNode = svgNode;
    this.options = Object.assign({}, DEFAULT_OPTIONS, options || {});
    this.defs = null;
    this.rootGroup = null;
  }

  PaperBackgroundTexture.prototype.setOptions = function (nextOptions) {
    this.options = Object.assign({}, this.options, nextOptions || {});
  };

  PaperBackgroundTexture.prototype._ensureLayers = function () {
    if (!this.defs) {
      this.defs = this.svgNode.querySelector("defs");
      if (!this.defs) {
        this.defs = createSvgNode("defs");
        this.svgNode.appendChild(this.defs);
      }
    }

    if (!this.rootGroup) {
      this.rootGroup = createSvgNode("g");
      this.rootGroup.setAttribute("id", "paperTextureRoot");
      this.svgNode.appendChild(this.rootGroup);
    }
  };

  PaperBackgroundTexture.prototype._setSvgSize = function () {
    var width = Math.max(1, Math.round(this.options.width));
    var height = Math.max(1, Math.round(this.options.height));
    this.svgNode.setAttribute("viewBox", "0 0 " + width + " " + height);
    this.svgNode.setAttribute("width", String(width));
    this.svgNode.setAttribute("height", String(height));
    this.options.width = width;
    this.options.height = height;
  };

  PaperBackgroundTexture.prototype._buildDefs = function () {
    clearNode(this.defs);

    var noiseFilter = createSvgNode("filter");
    noiseFilter.setAttribute("id", "paperNoiseFilter");
    noiseFilter.setAttribute("x", "0");
    noiseFilter.setAttribute("y", "0");
    noiseFilter.setAttribute("width", "100%");
    noiseFilter.setAttribute("height", "100%");

    var turbulence = createSvgNode("feTurbulence");
    turbulence.setAttribute("type", "fractalNoise");
    turbulence.setAttribute(
      "baseFrequency",
      toFixed(clamp(this.options.grainFrequencyX, 0.01, 4), 3) +
        " " +
        toFixed(clamp(this.options.grainFrequencyY, 0.01, 4), 3)
    );
    turbulence.setAttribute(
      "numOctaves",
      String(Math.round(clamp(this.options.grainOctaves, 1, 7)))
    );
    turbulence.setAttribute("seed", String(Math.round(this.options.seed)));
    turbulence.setAttribute("stitchTiles", "stitch");
    turbulence.setAttribute("result", "paperTurbulence");
    noiseFilter.appendChild(turbulence);

    var diffuse = createSvgNode("feDiffuseLighting");
    diffuse.setAttribute("in", "paperTurbulence");
    diffuse.setAttribute("surfaceScale", toFixed(clamp(this.options.embossStrength, 0, 5), 3));
    diffuse.setAttribute("lighting-color", "#ffffff");
    diffuse.setAttribute("result", "paperEmboss");

    var distant = createSvgNode("feDistantLight");
    distant.setAttribute("azimuth", toFixed(this.options.embossAzimuth, 2));
    distant.setAttribute("elevation", toFixed(this.options.embossElevation, 2));
    diffuse.appendChild(distant);
    noiseFilter.appendChild(diffuse);

    var blend = createSvgNode("feBlend");
    blend.setAttribute("mode", "multiply");
    blend.setAttribute("in", "paperTurbulence");
    blend.setAttribute("in2", "paperEmboss");
    blend.setAttribute("result", "paperTextureOut");
    noiseFilter.appendChild(blend);

    this.defs.appendChild(noiseFilter);

    var dirtFilter = createSvgNode("filter");
    dirtFilter.setAttribute("id", "paperDirtBlur");
    dirtFilter.setAttribute("x", "-10%");
    dirtFilter.setAttribute("y", "-10%");
    dirtFilter.setAttribute("width", "120%");
    dirtFilter.setAttribute("height", "120%");

    var blur = createSvgNode("feGaussianBlur");
    blur.setAttribute("stdDeviation", toFixed(clamp(this.options.dirtBlur, 0, 8), 2));
    dirtFilter.appendChild(blur);

    this.defs.appendChild(dirtFilter);
  };

  PaperBackgroundTexture.prototype._drawBase = function () {
    var base = createSvgNode("rect");
    base.setAttribute("x", "0");
    base.setAttribute("y", "0");
    base.setAttribute("width", String(this.options.width));
    base.setAttribute("height", String(this.options.height));
    base.setAttribute("fill", this.options.paperColor);
    this.rootGroup.appendChild(base);
  };

  PaperBackgroundTexture.prototype._drawNoise = function () {
    var noiseLayer = createSvgNode("rect");
    noiseLayer.setAttribute("x", "0");
    noiseLayer.setAttribute("y", "0");
    noiseLayer.setAttribute("width", String(this.options.width));
    noiseLayer.setAttribute("height", String(this.options.height));
    noiseLayer.setAttribute("fill", this.options.grainColor);
    noiseLayer.setAttribute("opacity", toFixed(clamp(this.options.grainOpacity, 0, 1), 3));
    noiseLayer.setAttribute("filter", "url(#paperNoiseFilter)");
    this.rootGroup.appendChild(noiseLayer);
  };

  PaperBackgroundTexture.prototype._drawFibers = function (rng) {
    if (!this.options.includeFibers) {
      return;
    }

    var group = createSvgNode("g");
    group.setAttribute("opacity", toFixed(clamp(this.options.fiberOpacity, 0, 1), 3));

    var count = Math.max(0, Math.round(this.options.fiberCount));
    var w = this.options.width;
    var h = this.options.height;
    var minLen = Math.max(0.5, this.options.fiberLengthMin);
    var maxLen = Math.max(minLen + 0.1, this.options.fiberLengthMax);

    for (var i = 0; i < count; i++) {
      var x = rng() * w;
      var y = rng() * h;
      var angle = rng() * Math.PI * 2;
      var len = minLen + (maxLen - minLen) * rng();
      var x2 = x + Math.cos(angle) * len;
      var y2 = y + Math.sin(angle) * len;

      var line = createSvgNode("line");
      line.setAttribute("x1", toFixed(x, 2));
      line.setAttribute("y1", toFixed(y, 2));
      line.setAttribute("x2", toFixed(x2, 2));
      line.setAttribute("y2", toFixed(y2, 2));
      line.setAttribute("stroke", this.options.fiberColor);
      line.setAttribute("stroke-width", toFixed(clamp(this.options.fiberStrokeWidth, 0.1, 8), 2));
      line.setAttribute("stroke-linecap", "round");
      group.appendChild(line);
    }

    this.rootGroup.appendChild(group);
  };

  PaperBackgroundTexture.prototype._drawDirt = function (rng) {
    var dirtGroup = createSvgNode("g");
    dirtGroup.setAttribute("opacity", toFixed(clamp(this.options.dirtOpacity, 0, 1), 3));
    dirtGroup.setAttribute("filter", "url(#paperDirtBlur)");

    var count = Math.max(0, Math.round(this.options.dirtCount));
    var w = this.options.width;
    var h = this.options.height;
    var minR = Math.max(0.2, this.options.dirtMinRadius);
    var maxR = Math.max(minR + 0.1, this.options.dirtMaxRadius);

    for (var i = 0; i < count; i++) {
      var cx = rng() * w;
      var cy = rng() * h;
      var r = minR + (maxR - minR) * rng();

      if (rng() < 0.64) {
        var c = createSvgNode("circle");
        c.setAttribute("cx", toFixed(cx, 2));
        c.setAttribute("cy", toFixed(cy, 2));
        c.setAttribute("r", toFixed(r, 2));
        c.setAttribute("fill", this.options.dirtColor);
        dirtGroup.appendChild(c);
      } else {
        var e = createSvgNode("ellipse");
        e.setAttribute("cx", toFixed(cx, 2));
        e.setAttribute("cy", toFixed(cy, 2));
        e.setAttribute("rx", toFixed(r * (0.7 + rng() * 0.8), 2));
        e.setAttribute("ry", toFixed(r * (0.45 + rng() * 0.5), 2));
        e.setAttribute("transform", "rotate(" + toFixed(rng() * 360, 2) + " " + toFixed(cx, 2) + " " + toFixed(cy, 2) + ")");
        e.setAttribute("fill", this.options.dirtColor);
        dirtGroup.appendChild(e);
      }
    }

    this.rootGroup.appendChild(dirtGroup);
  };

  PaperBackgroundTexture.prototype.render = function () {
    this._ensureLayers();
    this._setSvgSize();
    this._buildDefs();
    clearNode(this.rootGroup);

    var rng = mulberry32(Math.round(this.options.seed));

    this._drawBase();
    this._drawNoise();
    this._drawFibers(rng);
    this._drawDirt(rng);

    return this.svgNode;
  };

  window.PaperBackgroundTexture = PaperBackgroundTexture;
})();
