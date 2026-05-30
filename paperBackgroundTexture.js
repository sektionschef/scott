(function () {
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

  function parseHexColor(value, fallback) {
    if (typeof value !== "string") {
      return fallback;
    }
    var normalized = value.trim();
    return /^#([0-9a-fA-F]{6})$/.test(normalized) ? normalized : fallback;
  }

  function sanitizeMixMode(value, fallback) {
    var allowed = ["multiply", "darken", "overlay", "soft-light", "hard-light", "screen"];
    if (allowed.indexOf(value) >= 0) {
      return value;
    }
    return fallback;
  }

  var DEFAULT_OPTIONS = {
    width: 1200,
    height: 900,
    paperColor: "#d8d6ce",
    seedA: 368,
    seedB: 253,
    grainFreq: 2.2,
    grainOpacity: 0.71,
    stainFreq: 0.016,
    stainOpacity: 0.6,
    stainBlobFreq: 0.005,
    stainBlobOpacity: 0.22,
    stainBlobBlur: 6.5,
    stainMixMode: "overlay",
    softBlur: 0.4,
    contrast: 0.92,
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

  PaperBackgroundTexture.prototype._buildPaperNoiseFilter = function () {
    var stainMixMode = sanitizeMixMode(this.options.stainMixMode, "overlay");

    var filter = createSvgNode("filter");
    filter.setAttribute("id", "paperNoiseFilter");
    filter.setAttribute("x", "-10%");
    filter.setAttribute("y", "-10%");
    filter.setAttribute("width", "120%");
    filter.setAttribute("height", "120%");
    filter.setAttribute("color-interpolation-filters", "sRGB");

    var stainsFine = createSvgNode("feTurbulence");
    stainsFine.setAttribute("type", "fractalNoise");
    stainsFine.setAttribute("baseFrequency", toFixed(clamp(this.options.stainFreq, 0.005, 0.12), 3));
    stainsFine.setAttribute("numOctaves", "6");
    stainsFine.setAttribute("seed", String(Math.round(this.options.seedB)));
    stainsFine.setAttribute("result", "stainsFine");
    filter.appendChild(stainsFine);

    var stainsBlob = createSvgNode("feTurbulence");
    stainsBlob.setAttribute("type", "fractalNoise");
    stainsBlob.setAttribute("baseFrequency", toFixed(clamp(this.options.stainBlobFreq, 0.001, 0.03), 3));
    stainsBlob.setAttribute("numOctaves", "2");
    stainsBlob.setAttribute("seed", String(Math.round(this.options.seedB) + 137));
    stainsBlob.setAttribute("result", "stainsBlob");
    filter.appendChild(stainsBlob);

    var blobBlur = createSvgNode("feGaussianBlur");
    blobBlur.setAttribute("in", "stainsBlob");
    blobBlur.setAttribute("stdDeviation", toFixed(clamp(this.options.stainBlobBlur, 0, 10), 2));
    blobBlur.setAttribute("result", "stainsBlobSoft");
    filter.appendChild(blobBlur);

    var blobGray = createSvgNode("feColorMatrix");
    blobGray.setAttribute("in", "stainsBlobSoft");
    blobGray.setAttribute("type", "saturate");
    blobGray.setAttribute("values", "0");
    blobGray.setAttribute("result", "stainsBlobGray");
    filter.appendChild(blobGray);

    var blobShape = createSvgNode("feComponentTransfer");
    blobShape.setAttribute("in", "stainsBlobGray");
    blobShape.setAttribute("result", "stainsBlobShaped");
    ["R", "G", "B"].forEach(function (channel) {
      var func = createSvgNode("feFunc" + channel);
      func.setAttribute("type", "linear");
      func.setAttribute("slope", "2.2");
      func.setAttribute("intercept", "-0.55");
      blobShape.appendChild(func);
    });
    filter.appendChild(blobShape);

    var fineBlobMix = createSvgNode("feBlend");
    fineBlobMix.setAttribute("in", "stainsFine");
    fineBlobMix.setAttribute("in2", "stainsBlobShaped");
    fineBlobMix.setAttribute("mode", "multiply");
    fineBlobMix.setAttribute("result", "stains");
    filter.appendChild(fineBlobMix);

    var grayStains = createSvgNode("feColorMatrix");
    grayStains.setAttribute("in", "stains");
    grayStains.setAttribute("type", "saturate");
    grayStains.setAttribute("values", "0");
    grayStains.setAttribute("result", "grayStains");
    filter.appendChild(grayStains);

    var fineAlpha = createSvgNode("feComponentTransfer");
    fineAlpha.setAttribute("in", "grayStains");
    fineAlpha.setAttribute("result", "stainsFineAlpha");
    ["R", "G", "B"].forEach(function (channel) {
      var func = createSvgNode("feFunc" + channel);
      func.setAttribute("type", "linear");
      func.setAttribute("slope", "0.45");
      func.setAttribute("intercept", "0.50");
      fineAlpha.appendChild(func);
    });
    var fineAlphaA = createSvgNode("feFuncA");
    fineAlphaA.setAttribute("type", "linear");
    fineAlphaA.setAttribute("slope", toFixed(clamp(this.options.stainOpacity, 0, 0.8), 3));
    fineAlpha.appendChild(fineAlphaA);
    filter.appendChild(fineAlpha);

    var blobAlpha = createSvgNode("feComponentTransfer");
    blobAlpha.setAttribute("in", "stainsBlobShaped");
    blobAlpha.setAttribute("result", "blobStains");
    ["R", "G", "B"].forEach(function (channel) {
      var func = createSvgNode("feFunc" + channel);
      func.setAttribute("type", "linear");
      func.setAttribute("slope", "0.4");
      func.setAttribute("intercept", "0.56");
      blobAlpha.appendChild(func);
    });
    var blobAlphaA = createSvgNode("feFuncA");
    blobAlphaA.setAttribute("type", "linear");
    blobAlphaA.setAttribute("slope", toFixed(clamp(this.options.stainBlobOpacity, 0, 0.9), 3));
    blobAlpha.appendChild(blobAlphaA);
    filter.appendChild(blobAlpha);

    var finalBlend = createSvgNode("feBlend");
    finalBlend.setAttribute("in", "stainsFineAlpha");
    finalBlend.setAttribute("in2", "blobStains");
    finalBlend.setAttribute("mode", stainMixMode);
    filter.appendChild(finalBlend);

    return filter;
  };

  PaperBackgroundTexture.prototype._buildDirtyObjectFilter = function () {
    var grainAlpha = clamp(this.options.grainOpacity, 0, 0.8);
    var stainAlpha = clamp(this.options.stainOpacity, 0, 0.8);
    var blobAlpha = clamp(this.options.stainBlobOpacity, 0, 0.9);
    var stainMixMode = sanitizeMixMode(this.options.stainMixMode, "overlay");

    var filter = createSvgNode("filter");
    filter.setAttribute("id", "paperDirtyObjectFilter");
    filter.setAttribute("filterUnits", "userSpaceOnUse");
    filter.setAttribute("primitiveUnits", "userSpaceOnUse");
    filter.setAttribute("x", "0");
    filter.setAttribute("y", "0");
    filter.setAttribute("width", String(this.options.width));
    filter.setAttribute("height", String(this.options.height));
    filter.setAttribute("color-interpolation-filters", "sRGB");

    var grain = createSvgNode("feTurbulence");
    grain.setAttribute("type", "fractalNoise");
    grain.setAttribute("baseFrequency", toFixed(clamp(this.options.grainFreq, 0.2, 2.2), 2));
    grain.setAttribute("numOctaves", "4");
    grain.setAttribute("seed", String(Math.round(this.options.seedA)));
    grain.setAttribute("result", "grain");
    filter.appendChild(grain);

    var clouds = createSvgNode("feTurbulence");
    clouds.setAttribute("type", "fractalNoise");
    clouds.setAttribute("baseFrequency", toFixed(clamp(this.options.stainFreq, 0.005, 0.12), 3));
    clouds.setAttribute("numOctaves", "5");
    clouds.setAttribute("seed", String(Math.round(this.options.seedB)));
    clouds.setAttribute("result", "clouds");
    filter.appendChild(clouds);

    var cloudsAlpha = createSvgNode("feComponentTransfer");
    cloudsAlpha.setAttribute("in", "clouds");
    cloudsAlpha.setAttribute("result", "cloudsAlpha");
    ["R", "G", "B"].forEach(function (channel) {
      var func = createSvgNode("feFunc" + channel);
      func.setAttribute("type", "identity");
      cloudsAlpha.appendChild(func);
    });
    var cloudsA = createSvgNode("feFuncA");
    cloudsA.setAttribute("type", "linear");
    cloudsA.setAttribute("slope", toFixed(stainAlpha, 3));
    cloudsAlpha.appendChild(cloudsA);
    filter.appendChild(cloudsAlpha);

    var cloudBlobs = createSvgNode("feTurbulence");
    cloudBlobs.setAttribute("type", "fractalNoise");
    cloudBlobs.setAttribute("baseFrequency", toFixed(clamp(this.options.stainBlobFreq, 0.001, 0.03), 3));
    cloudBlobs.setAttribute("numOctaves", "2");
    cloudBlobs.setAttribute("seed", String(Math.round(this.options.seedB) + 137));
    cloudBlobs.setAttribute("result", "cloudBlobs");
    filter.appendChild(cloudBlobs);

    var cloudBlobBlur = createSvgNode("feGaussianBlur");
    cloudBlobBlur.setAttribute("in", "cloudBlobs");
    cloudBlobBlur.setAttribute("stdDeviation", toFixed(clamp(this.options.stainBlobBlur, 0, 10), 2));
    cloudBlobBlur.setAttribute("result", "cloudBlobsSoft");
    filter.appendChild(cloudBlobBlur);

    var cloudBlobGray = createSvgNode("feColorMatrix");
    cloudBlobGray.setAttribute("in", "cloudBlobsSoft");
    cloudBlobGray.setAttribute("type", "saturate");
    cloudBlobGray.setAttribute("values", "0");
    cloudBlobGray.setAttribute("result", "cloudBlobsGray");
    filter.appendChild(cloudBlobGray);

    var cloudBlobShape = createSvgNode("feComponentTransfer");
    cloudBlobShape.setAttribute("in", "cloudBlobsGray");
    cloudBlobShape.setAttribute("result", "cloudBlobsShaped");
    ["R", "G", "B"].forEach(function (channel) {
      var func = createSvgNode("feFunc" + channel);
      func.setAttribute("type", "linear");
      func.setAttribute("slope", "2.2");
      func.setAttribute("intercept", "-0.55");
      cloudBlobShape.appendChild(func);
    });
    filter.appendChild(cloudBlobShape);

    var softened = createSvgNode("feGaussianBlur");
    softened.setAttribute("in", "SourceGraphic");
    softened.setAttribute("stdDeviation", toFixed(clamp(this.options.softBlur, 0, 3), 2));
    softened.setAttribute("result", "softened");
    filter.appendChild(softened);

    var blobAlphaNode = createSvgNode("feColorMatrix");
    blobAlphaNode.setAttribute("in", "cloudBlobsShaped");
    blobAlphaNode.setAttribute("type", "matrix");
    blobAlphaNode.setAttribute(
      "values",
      "0.25 0.25 0.25 0 0  0.25 0.25 0.25 0 0  0.25 0.25 0.25 0 0  0 0 0 " + toFixed(blobAlpha, 3) + " 0"
    );
    blobAlphaNode.setAttribute("result", "blobAlpha");
    filter.appendChild(blobAlphaNode);

    var stainedSoft = createSvgNode("feBlend");
    stainedSoft.setAttribute("in", "softened");
    stainedSoft.setAttribute("in2", "blobAlpha");
    stainedSoft.setAttribute("mode", stainMixMode);
    stainedSoft.setAttribute("result", "stainedSoft");
    filter.appendChild(stainedSoft);

    var grainAlphaNode = createSvgNode("feColorMatrix");
    grainAlphaNode.setAttribute("in", "grain");
    grainAlphaNode.setAttribute("type", "matrix");
    grainAlphaNode.setAttribute(
      "values",
      "0.25 0.25 0.25 0 0  0.25 0.25 0.25 0 0  0.25 0.25 0.25 0 0  0 0 0 " + toFixed(grainAlpha, 3) + " 0"
    );
    grainAlphaNode.setAttribute("result", "grainAlpha");
    filter.appendChild(grainAlphaNode);

    var dirty = createSvgNode("feBlend");
    dirty.setAttribute("in", "stainedSoft");
    dirty.setAttribute("in2", "grainAlpha");
    dirty.setAttribute("mode", "multiply");
    dirty.setAttribute("result", "dirty");
    filter.appendChild(dirty);

    var contrastTransfer = createSvgNode("feComponentTransfer");
    contrastTransfer.setAttribute("in", "dirty");
    ["R", "G", "B"].forEach(function (channel) {
      var func = createSvgNode("feFunc" + channel);
      func.setAttribute("type", "linear");
      func.setAttribute("slope", toFixed(clamp(this.options.contrast, 0.35, 1.4), 3));
      func.setAttribute("intercept", "0");
      contrastTransfer.appendChild(func);
    }, this);
    filter.appendChild(contrastTransfer);

    return filter;
  };

  PaperBackgroundTexture.prototype._buildDefs = function () {
    clearNode(this.defs);
    this.defs.appendChild(this._buildPaperNoiseFilter());
    this.defs.appendChild(this._buildDirtyObjectFilter());
  };

  PaperBackgroundTexture.prototype._drawBase = function () {
    var base = createSvgNode("rect");
    base.setAttribute("x", "0");
    base.setAttribute("y", "0");
    base.setAttribute("width", String(this.options.width));
    base.setAttribute("height", String(this.options.height));
    base.setAttribute("fill", parseHexColor(this.options.paperColor, DEFAULT_OPTIONS.paperColor));
    this.rootGroup.appendChild(base);
  };

  PaperBackgroundTexture.prototype._drawNoise = function () {
    var layer = createSvgNode("rect");
    layer.setAttribute("x", "0");
    layer.setAttribute("y", "0");
    layer.setAttribute("width", String(this.options.width));
    layer.setAttribute("height", String(this.options.height));
    layer.setAttribute("fill", "#000000");
    layer.setAttribute("opacity", "1");
    layer.setAttribute("filter", "url(#paperNoiseFilter)");
    this.rootGroup.appendChild(layer);
  };

  PaperBackgroundTexture.prototype.render = function () {
    this._ensureLayers();
    this._setSvgSize();
    this._buildDefs();
    clearNode(this.rootGroup);

    this._drawBase();
    this._drawNoise();

    return this.svgNode;
  };

  window.PaperBackgroundTexture = PaperBackgroundTexture;
})();
