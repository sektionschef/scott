(function () {
  var svg = document.getElementById("paperDebugSvg");
  var panel = document.getElementById("paperControls");
  var randomizeBtn = document.getElementById("randomizeSeed");
  var downloadBtn = document.getElementById("downloadSvg");
  var savePresetUrlBtn = document.getElementById("savePresetUrl");
  var copyPresetBtn = document.getElementById("copyPreset");
  var downloadPresetBtn = document.getElementById("downloadPreset");
  var loadPresetBtn = document.getElementById("loadPreset");
  var loadPresetInput = document.getElementById("loadPresetInput");
  var presetStatus = document.getElementById("presetStatus");
  var seedInput = document.getElementById("seed");
  var seedValue = document.getElementById("seedValue");
  var PRESET_URL_PARAM = "preset";
  var PRESET_STORAGE_KEY = "paperBackgroundDebugPreset.v1";

  var controls = [
    { id: "width", valueId: "widthValue", type: "number" },
    { id: "height", valueId: "heightValue", type: "number" },
    { id: "paperColor", type: "color" },
    { id: "grainColor", type: "color" },
    { id: "grainOpacity", valueId: "grainOpacityValue", type: "range", digits: 2 },
    { id: "grainFrequencyX", valueId: "grainFrequencyXValue", type: "range", digits: 2 },
    { id: "grainFrequencyY", valueId: "grainFrequencyYValue", type: "range", digits: 2 },
    { id: "grainOctaves", valueId: "grainOctavesValue", type: "range", digits: 0 },
    { id: "embossStrength", valueId: "embossStrengthValue", type: "range", digits: 2 },
    { id: "embossAzimuth", valueId: "embossAzimuthValue", type: "range", digits: 0 },
    { id: "embossElevation", valueId: "embossElevationValue", type: "range", digits: 0 },
    { id: "includeFibers", type: "checkbox" },
    { id: "fiberCount", valueId: "fiberCountValue", type: "range", digits: 0 },
    { id: "fiberLengthMin", valueId: "fiberLengthMinValue", type: "range", digits: 1 },
    { id: "fiberLengthMax", valueId: "fiberLengthMaxValue", type: "range", digits: 1 },
    { id: "fiberStrokeWidth", valueId: "fiberStrokeWidthValue", type: "range", digits: 2 },
    { id: "fiberOpacity", valueId: "fiberOpacityValue", type: "range", digits: 2 },
    { id: "fiberColor", type: "color" },
    { id: "dirtCount", valueId: "dirtCountValue", type: "range", digits: 0 },
    { id: "dirtMinRadius", valueId: "dirtMinRadiusValue", type: "range", digits: 1 },
    { id: "dirtMaxRadius", valueId: "dirtMaxRadiusValue", type: "range", digits: 1 },
    { id: "dirtOpacity", valueId: "dirtOpacityValue", type: "range", digits: 2 },
    { id: "dirtBlur", valueId: "dirtBlurValue", type: "range", digits: 2 },
    { id: "dirtColor", type: "color" }
  ];

  var texture = new window.PaperBackgroundTexture(svg, {
    width: 1200,
    height: 900,
    seed: Number(seedInput.value)
  });

  function readValue(ctrl) {
    var input = document.getElementById(ctrl.id);
    if (!input) {
      return null;
    }

    if (ctrl.type === "checkbox") {
      return input.checked;
    }

    if (ctrl.type === "number" || ctrl.type === "range") {
      return Number(input.value);
    }

    return input.value;
  }

  function updateLabel(ctrl, value) {
    if (!ctrl.valueId) {
      return;
    }
    var node = document.getElementById(ctrl.valueId);
    if (!node) {
      return;
    }

    if (typeof value === "number") {
      node.textContent = value.toFixed(ctrl.digits || 0);
    } else {
      node.textContent = String(value);
    }
  }

  function collectOptions() {
    var next = {
      seed: Number(seedInput.value)
    };

    for (var i = 0; i < controls.length; i++) {
      var ctrl = controls[i];
      var value = readValue(ctrl);
      next[ctrl.id] = value;
      updateLabel(ctrl, value);
    }

    seedValue.textContent = String(next.seed);
    return next;
  }

  function setStatus(message) {
    if (!presetStatus) {
      return;
    }
    presetStatus.textContent = message;
  }

  function encodePreset(preset) {
    return btoa(unescape(encodeURIComponent(JSON.stringify(preset))));
  }

  function decodePreset(encoded) {
    return JSON.parse(decodeURIComponent(escape(atob(encoded))));
  }

  function updateUrlPreset(preset, replace) {
    var url = new URL(window.location.href);
    url.searchParams.set(PRESET_URL_PARAM, encodePreset(preset));
    if (replace) {
      window.history.replaceState({}, "", url.toString());
    } else {
      window.history.pushState({}, "", url.toString());
    }
    return url.toString();
  }

  function savePresetToStorage(preset) {
    try {
      localStorage.setItem(PRESET_STORAGE_KEY, JSON.stringify(preset));
    } catch (error) {
      setStatus("Local save failed (storage unavailable).");
    }
  }

  function applyPresetToInputs(preset) {
    for (var i = 0; i < controls.length; i++) {
      var ctrl = controls[i];
      if (!Object.prototype.hasOwnProperty.call(preset, ctrl.id)) {
        continue;
      }
      var input = document.getElementById(ctrl.id);
      if (!input) {
        continue;
      }

      var value = preset[ctrl.id];
      if (ctrl.type === "checkbox") {
        input.checked = Boolean(value);
      } else {
        input.value = String(value);
      }
      updateLabel(ctrl, readValue(ctrl));
    }

    if (Object.prototype.hasOwnProperty.call(preset, "seed")) {
      seedInput.value = String(preset.seed);
      seedValue.textContent = String(Number(preset.seed));
    }
  }

  function currentPreset() {
    return collectOptions();
  }

  function loadPresetFromUrl() {
    var params = new URLSearchParams(window.location.search);
    var encoded = params.get(PRESET_URL_PARAM);
    if (!encoded) {
      return null;
    }
    try {
      return decodePreset(encoded);
    } catch (error) {
      setStatus("URL preset invalid, using last local/default settings.");
      return null;
    }
  }

  function loadPresetFromStorage() {
    try {
      var raw = localStorage.getItem(PRESET_STORAGE_KEY);
      if (!raw) {
        return null;
      }
      return JSON.parse(raw);
    } catch (error) {
      return null;
    }
  }

  function render() {
    var preset = collectOptions();
    texture.setOptions(preset);
    texture.render();
    savePresetToStorage(preset);
    updateUrlPreset(preset, true);
  }

  function randomSeed() {
    var seed = Math.floor(Math.random() * 1000000000);
    seedInput.value = String(seed);
    render();
  }

  panel.addEventListener("input", render);
  panel.addEventListener("change", render);

  randomizeBtn.addEventListener("click", randomSeed);

  savePresetUrlBtn.addEventListener("click", function () {
    var url = updateUrlPreset(currentPreset(), false);
    setStatus("Preset saved in URL.");

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(url)
        .then(function () {
          setStatus("Preset URL copied to clipboard.");
        })
        .catch(function () {
          setStatus("Preset URL saved. Copy it from address bar.");
        });
    }
  });

  copyPresetBtn.addEventListener("click", function () {
    var presetJson = JSON.stringify(currentPreset(), null, 2);

    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(presetJson)
        .then(function () {
          setStatus("Preset JSON copied.");
        })
        .catch(function () {
          setStatus("Copy failed. Use Download Preset instead.");
        });
    } else {
      setStatus("Clipboard not available. Use Download Preset.");
    }
  });

  downloadPresetBtn.addEventListener("click", function () {
    var presetJson = JSON.stringify(currentPreset(), null, 2);
    var blob = new Blob([presetJson], { type: "application/json;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "paper-background-preset.json";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    setStatus("Preset JSON downloaded.");
  });

  loadPresetBtn.addEventListener("click", function () {
    loadPresetInput.click();
  });

  loadPresetInput.addEventListener("change", function (event) {
    var file = event.target.files && event.target.files[0];
    if (!file) {
      return;
    }

    var reader = new FileReader();
    reader.onload = function () {
      try {
        var preset = JSON.parse(String(reader.result));
        applyPresetToInputs(preset);
        render();
        setStatus("Preset loaded from JSON file.");
      } catch (error) {
        setStatus("Invalid preset file.");
      }
    };
    reader.readAsText(file);
    loadPresetInput.value = "";
  });

  downloadBtn.addEventListener("click", function () {
    var clone = svg.cloneNode(true);
    clone.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var data = '<?xml version="1.0" standalone="no"?>\n' + clone.outerHTML;
    var blob = new Blob([data], { type: "image/svg+xml;charset=utf-8" });
    var url = URL.createObjectURL(blob);
    var link = document.createElement("a");
    link.href = url;
    link.download = "paper-background-debug.svg";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  });

  var initialPreset = loadPresetFromUrl() || loadPresetFromStorage();
  if (initialPreset) {
    applyPresetToInputs(initialPreset);
    setStatus("Loaded saved preset.");
  }

  render();
})();
