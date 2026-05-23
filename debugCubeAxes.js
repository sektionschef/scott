function _axisRotateY(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: point.x * c + point.z * s,
    y: point.y,
    z: -point.x * s + point.z * c,
  };
}

function _axisRotateX(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: point.x,
    y: point.y * c - point.z * s,
    z: point.y * s + point.z * c,
  };
}

function _axisRotateZ(point, angle) {
  const c = Math.cos(angle);
  const s = Math.sin(angle);
  return {
    x: point.x * c - point.y * s,
    y: point.x * s + point.y * c,
    z: point.z,
  };
}

function _axisPolygonCentroid(points) {
  let x = 0;
  let y = 0;
  for (const point of points) {
    x += point.x;
    y += point.y;
  }
  return { x: x / points.length, y: y / points.length };
}

function _axisPrincipalDirection(points) {
  const center = _axisPolygonCentroid(points);
  let sxx = 0;
  let syy = 0;
  let sxy = 0;
  for (const point of points) {
    const dx = point.x - center.x;
    const dy = point.y - center.y;
    sxx += dx * dx;
    syy += dy * dy;
    sxy += dx * dy;
  }
  const angle = 0.5 * Math.atan2(2 * sxy, sxx - syy);
  return {
    center,
    principal: { x: Math.cos(angle), y: Math.sin(angle) },
    perpendicular: { x: -Math.sin(angle), y: Math.cos(angle) },
  };
}

function _axisPolygonArea(points) {
  let area = 0;
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    area += a.x * b.y - b.x * a.y;
  }
  return Math.abs(area) * 0.5;
}

function _axisDot(a, b) {
  return a.x * b.x + a.y * b.y;
}

function _axisSub(a, b) {
  return { x: a.x - b.x, y: a.y - b.y };
}

function _axisAdd(a, b) {
  return { x: a.x + b.x, y: a.y + b.y };
}

function _axisScale(a, factor) {
  return { x: a.x * factor, y: a.y * factor };
}

function _axisLength(a) {
  return Math.sqrt(a.x * a.x + a.y * a.y);
}

function _axisNormalize(a) {
  const len = Math.max(1e-8, _axisLength(a));
  return { x: a.x / len, y: a.y / len };
}

function _axisUniquePoints(points, tolerance) {
  const unique = [];
  for (const point of points) {
    const exists = unique.some((candidate) => Math.abs(candidate.x - point.x) < tolerance && Math.abs(candidate.y - point.y) < tolerance);
    if (!exists) {
      unique.push(point);
    }
  }
  return unique;
}

function _axisIntersectLineWithPolygon(points, sweepDir, lineOffset, hatchDir) {
  const intersections = [];
  for (let index = 0; index < points.length; index += 1) {
    const a = points[index];
    const b = points[(index + 1) % points.length];
    const edge = _axisSub(b, a);
    const denom = _axisDot(edge, sweepDir);
    if (Math.abs(denom) < 1e-8) {
      continue;
    }
    const t = (lineOffset - _axisDot(a, sweepDir)) / denom;
    if (t < -1e-6 || t > 1 + 1e-6) {
      continue;
    }
    intersections.push({
      x: a.x + edge.x * t,
      y: a.y + edge.y * t,
    });
  }

  const unique = _axisUniquePoints(intersections, 0.6);
  if (unique.length < 2) {
    return null;
  }

  unique.sort((p, q) => _axisDot(p, hatchDir) - _axisDot(q, hatchDir));
  return { start: unique[0], end: unique[unique.length - 1] };
}

function _axisBuildHatchSegments(points, hatchDir, sweepDir, spacing, edgeInset, trimRatio, minVisibleLength) {
  const minOffset = Math.min(...points.map((point) => _axisDot(point, sweepDir)));
  const maxOffset = Math.max(...points.map((point) => _axisDot(point, sweepDir)));
  const segments = [];

  for (let offset = minOffset; offset <= maxOffset; offset += spacing) {
    const segment = _axisIntersectLineWithPolygon(points, sweepDir, offset, hatchDir);
    if (!segment) {
      continue;
    }
    const direction = _axisNormalize(_axisSub(segment.end, segment.start));
    const segmentLength = _axisLength(_axisSub(segment.end, segment.start));
    const trim = Math.min(edgeInset, Math.max(0, segmentLength * trimRatio));
    if (segmentLength <= trim * 2 + minVisibleLength) {
      continue;
    }
    segments.push({
      start: _axisAdd(segment.start, _axisScale(direction, trim)),
      end: _axisAdd(segment.end, _axisScale(direction, -trim)),
    });
  }

  // Ensure at least one stroke per pass on tiny or near-degenerate projections.
  if (segments.length === 0) {
    const centerOffset = _axisDot(_axisPolygonCentroid(points), sweepDir);
    const centerSegment = _axisIntersectLineWithPolygon(points, sweepDir, centerOffset, hatchDir);
    if (centerSegment) {
      const direction = _axisNormalize(_axisSub(centerSegment.end, centerSegment.start));
      const segmentLength = _axisLength(_axisSub(centerSegment.end, centerSegment.start));
      const trim = Math.min(edgeInset, Math.max(0, segmentLength * Math.max(0.12, trimRatio - 0.06)));
      if (segmentLength > trim * 2 + Math.max(1, minVisibleLength * 0.5)) {
        segments.push({
          start: _axisAdd(centerSegment.start, _axisScale(direction, trim)),
          end: _axisAdd(centerSegment.end, _axisScale(direction, -trim)),
        });
      }
    }
  }

  return segments;
}

function _axisBuildCubePolygons(width, height, options = {}) {
  const cubeVertices = [
    { x: -0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: -0.5, z: -0.5 },
    { x: 0.5, y: 0.5, z: -0.5 },
    { x: -0.5, y: 0.5, z: -0.5 },
    { x: -0.5, y: -0.5, z: 0.5 },
    { x: 0.5, y: -0.5, z: 0.5 },
    { x: 0.5, y: 0.5, z: 0.5 },
    { x: -0.5, y: 0.5, z: 0.5 },
  ];

  const faces = [
    { name: "front", indices: [4, 5, 6, 7], normal: { x: 0, y: 0, z: 1 } },
    { name: "back", indices: [1, 0, 3, 2], normal: { x: 0, y: 0, z: -1 } },
    { name: "right", indices: [5, 1, 2, 6], normal: { x: 1, y: 0, z: 0 } },
    { name: "left", indices: [0, 4, 7, 3], normal: { x: -1, y: 0, z: 0 } },
    { name: "top", indices: [7, 6, 2, 3], normal: { x: 0, y: 1, z: 0 } },
    { name: "bottom", indices: [0, 1, 5, 4], normal: { x: 0, y: -1, z: 0 } },
  ];

  const yaw = options.yaw ?? getRandomFromInterval(0.58, 0.94);
  const pitch = options.pitch ?? getRandomFromInterval(-0.88, -0.56);
  const roll = options.roll ?? getRandomFromInterval(-0.12, 0.12);
  const scale = options.scale ?? (Math.min(width, height) * getRandomFromInterval(0.25, 0.33));
  const cx = options.cx ?? (width * 0.5);
  const cy = options.cy ?? (height * 0.56);

  const transformed = cubeVertices.map((vertex) => {
    const yRot = _axisRotateY(vertex, yaw);
    const xRot = _axisRotateX(yRot, pitch);
    const zRot = _axisRotateZ(xRot, roll);
    return {
      x: cx + zRot.x * scale,
      y: cy - zRot.y * scale,
      z: zRot.z,
    };
  });

  const transformedFaces = faces.map((face) => {
    const yRot = _axisRotateY(face.normal, yaw);
    const xRot = _axisRotateX(yRot, pitch);
    const zRot = _axisRotateZ(xRot, roll);
    const points = face.indices.map((vertexIndex) => transformed[vertexIndex]);
    return {
      name: face.name,
      points,
      depth: zRot.z,
    };
  });

  return transformedFaces
    .filter((face) => face.depth > 0)
    .sort((a, b) => b.depth - a.depth)
    .slice(0, 3);
}

function _axisDrawArrow(group, origin, direction, length, color) {
  const end = {
    x: origin.x + direction.x * length,
    y: origin.y + direction.y * length,
  };
  const arrow = document.createElementNS("http://www.w3.org/2000/svg", "line");
  arrow.setAttribute("x1", origin.x.toFixed(2));
  arrow.setAttribute("y1", origin.y.toFixed(2));
  arrow.setAttribute("x2", end.x.toFixed(2));
  arrow.setAttribute("y2", end.y.toFixed(2));
  arrow.setAttribute("stroke", color);
  arrow.setAttribute("stroke-width", "2.2");
  group.appendChild(arrow);

  const headSize = Math.max(8, length * 0.14);
  const back = {
    x: end.x - direction.x * headSize,
    y: end.y - direction.y * headSize,
  };
  const side = { x: -direction.y, y: direction.x };
  const left = {
    x: back.x + side.x * headSize * 0.55,
    y: back.y + side.y * headSize * 0.55,
  };
  const right = {
    x: back.x - side.x * headSize * 0.55,
    y: back.y - side.y * headSize * 0.55,
  };

  const head = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
  head.setAttribute("points", `${end.x.toFixed(2)},${end.y.toFixed(2)} ${left.x.toFixed(2)},${left.y.toFixed(2)} ${right.x.toFixed(2)},${right.y.toFixed(2)}`);
  head.setAttribute("fill", color);
  group.appendChild(head);
}

function _axisDrawPrincipalLine(group, origin, direction, length, color) {
  const half = length * 0.5;
  const a = {
    x: origin.x - direction.x * half,
    y: origin.y - direction.y * half,
  };
  const b = {
    x: origin.x + direction.x * half,
    y: origin.y + direction.y * half,
  };
  const line = document.createElementNS("http://www.w3.org/2000/svg", "line");
  line.setAttribute("x1", a.x.toFixed(2));
  line.setAttribute("y1", a.y.toFixed(2));
  line.setAttribute("x2", b.x.toFixed(2));
  line.setAttribute("y2", b.y.toFixed(2));
  line.setAttribute("stroke", color);
  line.setAttribute("stroke-width", "1.5");
  group.appendChild(line);
}

function _axisReadParams(search) {
  const fallback = {
    hatchWidth: 1.3,
    hatchJitter: 0.7,
    hatchBend: 0.0,
    hatchSpacing: 1,
    hatchEdgeInset: null,
    hatchTrimRatio: 0.42,
    hatchMinVisible: 4,
  };

  const parsed = {
    hatchWidth: Number(search.get("hatchWidth")),
    hatchJitter: Number(search.get("hatchJitter")),
    hatchBend: Number(search.get("hatchBend")),
    hatchSpacing: Number(search.get("hatchSpacing")),
    hatchEdgeInset: search.get("hatchEdgeInset") === null ? null : Number(search.get("hatchEdgeInset")),
    hatchTrimRatio: Number(search.get("hatchTrimRatio")),
    hatchMinVisible: Number(search.get("hatchMinVisible")),
  };

  return {
    hatchWidth: Number.isFinite(parsed.hatchWidth) ? parsed.hatchWidth : fallback.hatchWidth,
    hatchJitter: Number.isFinite(parsed.hatchJitter) ? parsed.hatchJitter : fallback.hatchJitter,
    hatchBend: Number.isFinite(parsed.hatchBend) ? parsed.hatchBend : fallback.hatchBend,
    hatchSpacing: Number.isFinite(parsed.hatchSpacing) ? parsed.hatchSpacing : fallback.hatchSpacing,
    hatchEdgeInset: parsed.hatchEdgeInset !== null && Number.isFinite(parsed.hatchEdgeInset) ? parsed.hatchEdgeInset : fallback.hatchEdgeInset,
    hatchTrimRatio: Number.isFinite(parsed.hatchTrimRatio) ? parsed.hatchTrimRatio : fallback.hatchTrimRatio,
    hatchMinVisible: Number.isFinite(parsed.hatchMinVisible) ? parsed.hatchMinVisible : fallback.hatchMinVisible,
  };
}

function _axisWriteParams(params) {
  const search = new URLSearchParams(window.location.search);
  search.set("debugCubeAxes", "1");
  search.set("hatchWidth", params.hatchWidth.toFixed(2));
  search.set("hatchJitter", params.hatchJitter.toFixed(2));
  search.set("hatchBend", params.hatchBend.toFixed(3));
  search.set("hatchSpacing", params.hatchSpacing.toFixed(2));
  search.set("hatchTrimRatio", params.hatchTrimRatio.toFixed(2));
  search.set("hatchMinVisible", params.hatchMinVisible.toFixed(2));
  if (params.hatchEdgeInset === null) {
    search.delete("hatchEdgeInset");
  } else {
    search.set("hatchEdgeInset", params.hatchEdgeInset.toFixed(2));
  }
  window.history.replaceState(null, "", `?${search.toString()}`);
}

function _axisNormalizeSeed(seed) {
  const asNumber = Number(seed);
  if (!Number.isFinite(asNumber)) {
    return null;
  }
  return Math.max(1, Math.floor(asNumber) >>> 0);
}

function _axisReadSeed(search) {
  const parsed = _axisNormalizeSeed(search.get("seed"));
  return parsed === null ? ((Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0) : parsed;
}

function _axisCreateSeededRandom(seed) {
  let state = (seed >>> 0) || 1;
  return function _rand() {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function _axisHashSeed(input) {
  const str = String(input);
  let hash = 2166136261;
  for (let i = 0; i < str.length; i += 1) {
    hash ^= str.charCodeAt(i);
    hash = Math.imul(hash, 16777619);
  }
  return hash >>> 0;
}

function _axisWithSeededRandom(seed, run) {
  const seeded = _axisCreateSeededRandom(seed >>> 0);
  const originalMathRandom = Math.random;
  const hadFx = typeof $fx !== "undefined" && $fx && typeof $fx.rand === "function";
  const originalFxRandom = hadFx ? $fx.rand : null;
  Math.random = seeded;
  if (hadFx) {
    $fx.rand = seeded;
  }
  try {
    return run();
  } finally {
    Math.random = originalMathRandom;
    if (hadFx && originalFxRandom) {
      $fx.rand = originalFxRandom;
    }
  }
}

function _axisSanitizeParamValue(value, fallback) {
  return Number.isFinite(value) ? value : fallback;
}

function _axisApplyStudioFromUrl(search, studioState) {
  const encoded = search.get("studio");
  if (!encoded) {
    return;
  }
  try {
    const payload = JSON.parse(decodeURIComponent(encoded));
    if (!payload || !Array.isArray(payload.d)) {
      return;
    }

    const byId = new Map(studioState.sides.map((side) => [side.id, side]));
    for (const row of payload.d) {
      const side = byId.get(row.id);
      if (!side) {
        continue;
      }
      if (row.mode === "none" || row.mode === "single" || row.mode === "cross") {
        side.hatchMode = row.mode;
      }
      if (!Array.isArray(row.p) || row.p.length < 7) {
        continue;
      }
      side.params.hatchWidth = _axisSanitizeParamValue(Number(row.p[0]), side.params.hatchWidth);
      side.params.hatchJitter = _axisSanitizeParamValue(Number(row.p[1]), side.params.hatchJitter);
      side.params.hatchBend = _axisSanitizeParamValue(Number(row.p[2]), side.params.hatchBend);
      side.params.hatchSpacing = _axisSanitizeParamValue(Number(row.p[3]), side.params.hatchSpacing);
      side.params.hatchEdgeInset = row.p[4] === null ? null : _axisSanitizeParamValue(Number(row.p[4]), side.params.hatchEdgeInset);
      side.params.hatchTrimRatio = _axisSanitizeParamValue(Number(row.p[5]), side.params.hatchTrimRatio);
      side.params.hatchMinVisible = _axisSanitizeParamValue(Number(row.p[6]), side.params.hatchMinVisible);
    }

    if (typeof payload.s === "string" && byId.has(payload.s)) {
      studioState.selectedSideId = payload.s;
    }
    if (typeof payload.dir === "boolean") {
      studioState.showDebugDirection = payload.dir;
    }
  } catch (_error) {
    // ignore malformed studio param
  }
}

function _axisWriteStudioState(studioState) {
  const search = new URLSearchParams(window.location.search);
  search.set("debugCubeAxes", "1");
  search.set("seed", String(studioState.seed >>> 0));

  const selected = studioState.sides.find((side) => side.id === studioState.selectedSideId) || studioState.sides[0];
  if (selected) {
    search.set("hatchWidth", selected.params.hatchWidth.toFixed(2));
    search.set("hatchJitter", selected.params.hatchJitter.toFixed(2));
    search.set("hatchBend", selected.params.hatchBend.toFixed(3));
    search.set("hatchSpacing", selected.params.hatchSpacing.toFixed(2));
    search.set("hatchTrimRatio", selected.params.hatchTrimRatio.toFixed(2));
    search.set("hatchMinVisible", selected.params.hatchMinVisible.toFixed(2));
    if (selected.params.hatchEdgeInset === null) {
      search.delete("hatchEdgeInset");
    } else {
      search.set("hatchEdgeInset", selected.params.hatchEdgeInset.toFixed(2));
    }
  }

  const payload = {
    v: 1,
    s: studioState.selectedSideId,
    dir: !!studioState.showDebugDirection,
    d: studioState.sides.map((side) => ({
      id: side.id,
      mode: side.hatchMode,
      p: [
        Number(side.params.hatchWidth.toFixed(2)),
        Number(side.params.hatchJitter.toFixed(2)),
        Number(side.params.hatchBend.toFixed(3)),
        Number(side.params.hatchSpacing.toFixed(2)),
        side.params.hatchEdgeInset === null ? null : Number(side.params.hatchEdgeInset.toFixed(2)),
        Number(side.params.hatchTrimRatio.toFixed(2)),
        Number(side.params.hatchMinVisible.toFixed(2)),
      ],
    })),
  };

  search.set("studio", encodeURIComponent(JSON.stringify(payload)));
  window.history.replaceState(null, "", `?${search.toString()}`);
}

function _axisRemoveExistingRender() {
  const existing = document.getElementById("debugCubeAxesGroup");
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }
}

function _axisDefaultHatchMode(brightness) {
  return brightness > 0.5 ? "cross" : "single";
}

function _axisCloneParams(params) {
  return {
    hatchWidth: params.hatchWidth,
    hatchJitter: params.hatchJitter,
    hatchBend: params.hatchBend,
    hatchSpacing: params.hatchSpacing,
    hatchEdgeInset: params.hatchEdgeInset,
    hatchTrimRatio: params.hatchTrimRatio,
    hatchMinVisible: params.hatchMinVisible,
  };
}

function _axisBuildStudioSides(width, height, baseParams) {
  const brightnessGroups = [
    [0.0, 0.1, 0.2],
    [0.3, 0.4, 0.5],
    [0.6, 0.7, 0.8],
  ];
  const yaw = getRandomFromInterval(0.62, 0.92);
  const pitch = getRandomFromInterval(-0.86, -0.58);
  const roll = getRandomFromInterval(-0.08, 0.08);
  const scale = Math.min(width, height) * 0.16;
  const centers = [width * 0.2, width * 0.5, width * 0.8];

  const sides = [];
  for (let cubeIndex = 0; cubeIndex < 3; cubeIndex += 1) {
    const polygons = _axisBuildCubePolygons(width, height, {
      yaw,
      pitch,
      roll,
      scale,
      cx: centers[cubeIndex],
      cy: height * 0.58,
    });
    for (let sideIndex = 0; sideIndex < polygons.length; sideIndex += 1) {
      const brightness = brightnessGroups[cubeIndex][sideIndex];
      const sideLabel = String.fromCharCode(65 + sideIndex);
      sides.push({
        id: `C${cubeIndex + 1}-${sideLabel}`,
        cubeIndex,
        sideLabel,
        brightness,
        hatchMode: _axisDefaultHatchMode(brightness),
        poly: polygons[sideIndex],
        params: _axisCloneParams(baseParams),
      });
    }
  }
  return sides;
}

function _axisRenderCubeAxes(svgNode, studioState, onSelectSide) {
  _axisRemoveExistingRender();

  const debugGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  debugGroup.setAttribute("id", "debugCubeAxesGroup");
  svgNode.appendChild(debugGroup);
  const canvasCenter = {
    x: CANVASFORMATCHOSEN.canvasWidth * 0.5,
    y: CANVASFORMATCHOSEN.canvasHeight * 0.5,
  };

  for (let sideIndex = 0; sideIndex < studioState.sides.length; sideIndex += 1) {
    const side = studioState.sides[sideIndex];
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", side.poly.points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" "));
    polygon.setAttribute("fill", "none");
    polygon.setAttribute("stroke", "none");
    polygon.setAttribute("stroke-width", "0");
    polygon.setAttribute("pointer-events", "none");
    debugGroup.appendChild(polygon);

    const axis = _axisPrincipalDirection(side.poly.points);
    const area = _axisPolygonArea(side.poly.points);
    const arrowLength = Math.max(22, Math.min(96, Math.sqrt(area) * 0.42));

    const hatchGroupId = `debugCubeAxesHatch_${side.id}`;
    const hatchGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
    hatchGroup.setAttribute("id", hatchGroupId);
    debugGroup.appendChild(hatchGroup);

    const sweepDir = _axisNormalize(axis.principal);
    const hatchDir = _axisNormalize(axis.perpendicular);
    const spacingFactor = 1.35 - side.brightness * 0.95;
    const spacing = Math.max(4, Math.sqrt(area) * 0.1 * side.params.hatchSpacing * spacingFactor);
    const edgeInset = side.params.hatchEdgeInset !== null
      ? Math.max(0, side.params.hatchEdgeInset)
      : Math.max(2.0, side.params.hatchWidth * 1.3 + side.params.hatchJitter * 0.9);

    const sideSeed = _axisHashSeed(`${studioState.seed}|${side.id}|${side.hatchMode}`);
    _axisWithSeededRandom(sideSeed, () => {
      if (side.hatchMode !== "none") {
        const hatchSegments = _axisBuildHatchSegments(side.poly.points, hatchDir, sweepDir, spacing, edgeInset, side.params.hatchTrimRatio, side.params.hatchMinVisible);
        for (const segment of hatchSegments) {
          const hatch = new filledPath({
            start: { x: segment.start.x, y: segment.start.y },
            end: { x: segment.end.x, y: segment.end.y },
            group: hatchGroupId,
            width: side.params.hatchWidth,
            jitter: side.params.hatchJitter,
            bend: side.params.hatchBend,
          });
          if (hatch?.path) {
            hatch.path.setAttributeNS(null, "fill", "#111111");
            hatch.path.setAttributeNS(null, "pointer-events", "none");
          }
        }
      }

      if (side.hatchMode === "cross") {
        const crossSegments = _axisBuildHatchSegments(side.poly.points, sweepDir, hatchDir, spacing * 1.03, edgeInset, side.params.hatchTrimRatio, side.params.hatchMinVisible);
        for (const segment of crossSegments) {
          const hatch = new filledPath({
            start: { x: segment.start.x, y: segment.start.y },
            end: { x: segment.end.x, y: segment.end.y },
            group: hatchGroupId,
            width: side.params.hatchWidth,
            jitter: side.params.hatchJitter,
            bend: side.params.hatchBend,
          });
          if (hatch?.path) {
            hatch.path.setAttributeNS(null, "fill", "#111111");
            hatch.path.setAttributeNS(null, "pointer-events", "none");
          }
        }
      }
    });

    if (studioState.showDebugDirection) {
      _axisDrawPrincipalLine(debugGroup, axis.center, axis.principal, arrowLength * 1.1, "#169c41");
      _axisDrawArrow(debugGroup, axis.center, axis.perpendicular, arrowLength, "#d61f1f");
    }

    const outwardRaw = _axisSub(axis.center, canvasCenter);
    const outwardLen = _axisLength(outwardRaw);
    const outward = outwardLen < 1e-6 ? { x: 0, y: -1 } : _axisNormalize(outwardRaw);
    const furthestEdgeProjection = Math.max(...side.poly.points.map((point) => _axisDot(_axisSub(point, axis.center), outward)));
    const labelRadius = Math.max(arrowLength * 0.9 + 24, furthestEdgeProjection + 28);
    const labelPos = {
      x: axis.center.x + outward.x * labelRadius,
      y: axis.center.y + outward.y * labelRadius,
    };

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", labelPos.x.toFixed(2));
    label.setAttribute("y", labelPos.y.toFixed(2));
    label.setAttribute("fill", "#777777");
    label.setAttribute("font-size", "11");
    label.setAttribute("font-family", "ui-monospace, Menlo, monospace");
    label.setAttribute("pointer-events", "none");
    label.textContent = `${side.id} b=${side.brightness.toFixed(2)}`;
    debugGroup.appendChild(label);

    const hitArea = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    hitArea.setAttribute("points", side.poly.points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" "));
    hitArea.setAttribute("fill", "rgba(0,0,0,0.001)");
    hitArea.setAttribute("stroke", "none");
    hitArea.style.cursor = "pointer";
    hitArea.setAttribute("pointer-events", "all");
    hitArea.addEventListener("click", () => onSelectSide(side.id));
    debugGroup.appendChild(hitArea);
  }
}

function _axisBuildSidebar(studioState, onRender, onReroll, onApplySeed) {
  const existing = document.getElementById("debugCubeAxesPanel");
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  const panel = document.createElement("div");
  panel.id = "debugCubeAxesPanel";
  panel.style.position = "fixed";
  panel.style.right = "14px";
  panel.style.top = "14px";
  panel.style.zIndex = "9999";
  panel.style.width = "320px";
  panel.style.maxHeight = "calc(100vh - 28px)";
  panel.style.overflow = "auto";
  panel.style.background = "rgba(250,250,248,0.95)";
  panel.style.border = "1px solid #b9b9b9";
  panel.style.borderRadius = "10px";
  panel.style.padding = "12px";
  panel.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";
  panel.style.color = "#111";

  const title = document.createElement("div");
  title.textContent = "Cube Hatch Studio";
  title.style.fontWeight = "700";
  title.style.marginBottom = "8px";
  panel.appendChild(title);

  const selected = studioState.sides.find((side) => side.id === studioState.selectedSideId) || studioState.sides[0];
  const sideInfo = document.createElement("div");
  sideInfo.textContent = `Selected: ${selected.id} | brightness ${selected.brightness.toFixed(2)} (0=bright, 1=dark)`;
  sideInfo.style.fontSize = "12px";
  sideInfo.style.marginBottom = "10px";
  panel.appendChild(sideInfo);

  const debugDirectionWrap = document.createElement("label");
  debugDirectionWrap.style.display = "inline-flex";
  debugDirectionWrap.style.alignItems = "center";
  debugDirectionWrap.style.gap = "6px";
  debugDirectionWrap.style.marginBottom = "10px";
  debugDirectionWrap.style.fontSize = "12px";

  const debugDirectionToggle = document.createElement("input");
  debugDirectionToggle.type = "checkbox";
  debugDirectionToggle.checked = !!studioState.showDebugDirection;
  debugDirectionToggle.addEventListener("change", () => {
    studioState.showDebugDirection = debugDirectionToggle.checked;
    onRender();
  });

  const debugDirectionText = document.createElement("span");
  debugDirectionText.textContent = "Debug direction";
  debugDirectionWrap.appendChild(debugDirectionToggle);
  debugDirectionWrap.appendChild(debugDirectionText);
  panel.appendChild(debugDirectionWrap);

  const seedWrap = document.createElement("div");
  seedWrap.style.marginBottom = "10px";
  const seedLabel = document.createElement("label");
  seedLabel.textContent = "Seed";
  seedLabel.style.display = "block";
  seedLabel.style.fontSize = "12px";
  seedLabel.style.marginBottom = "4px";
  const seedInput = document.createElement("input");
  seedInput.type = "number";
  seedInput.min = "1";
  seedInput.step = "1";
  seedInput.value = String(studioState.seed >>> 0);
  seedInput.style.width = "100%";
  seedInput.style.boxSizing = "border-box";

  const seedActions = document.createElement("div");
  seedActions.style.display = "flex";
  seedActions.style.gap = "8px";
  seedActions.style.marginTop = "6px";

  const applySeedButton = document.createElement("button");
  applySeedButton.textContent = "Apply Seed";
  applySeedButton.type = "button";
  applySeedButton.style.padding = "5px 8px";
  applySeedButton.style.cursor = "pointer";
  applySeedButton.addEventListener("click", () => {
    const parsed = _axisNormalizeSeed(seedInput.value);
    if (parsed !== null) {
      onApplySeed(parsed);
    }
  });

  const newSeedButton = document.createElement("button");
  newSeedButton.textContent = "New Seed";
  newSeedButton.type = "button";
  newSeedButton.style.padding = "5px 8px";
  newSeedButton.style.cursor = "pointer";
  newSeedButton.addEventListener("click", onReroll);

  seedInput.addEventListener("keydown", (event) => {
    if (event.key === "Enter") {
      const parsed = _axisNormalizeSeed(seedInput.value);
      if (parsed !== null) {
        onApplySeed(parsed);
      }
    }
  });

  seedActions.appendChild(applySeedButton);
  seedActions.appendChild(newSeedButton);
  seedWrap.appendChild(seedLabel);
  seedWrap.appendChild(seedInput);
  seedWrap.appendChild(seedActions);
  panel.appendChild(seedWrap);

  const modeWrap = document.createElement("div");
  modeWrap.style.marginBottom = "10px";
  const modeLabel = document.createElement("label");
  modeLabel.textContent = "Hatch Mode";
  modeLabel.style.display = "block";
  modeLabel.style.fontSize = "12px";
  modeLabel.style.marginBottom = "4px";
  const modeSelect = document.createElement("select");
  modeSelect.style.width = "100%";
  modeSelect.innerHTML = `<option value="none">none</option><option value="single">single</option><option value="cross">cross</option>`;
  modeSelect.value = selected.hatchMode;
  modeSelect.addEventListener("change", () => {
    selected.hatchMode = modeSelect.value;
    onRender();
  });
  modeWrap.appendChild(modeLabel);
  modeWrap.appendChild(modeSelect);
  panel.appendChild(modeWrap);

  const controls = [
    { key: "hatchWidth", label: "Width", min: 0.2, max: 3.5, step: 0.05 },
    { key: "hatchJitter", label: "Jitter", min: 0.0, max: 2.0, step: 0.05 },
    { key: "hatchBend", label: "Bend", min: -0.2, max: 0.2, step: 0.01 },
    { key: "hatchSpacing", label: "Spacing", min: 0.2, max: 2.2, step: 0.05 },
    { key: "hatchEdgeInset", label: "Edge Inset", min: 0.0, max: 8.0, step: 0.1, nullable: true },
    { key: "hatchTrimRatio", label: "Trim Ratio", min: 0.05, max: 0.7, step: 0.01 },
    { key: "hatchMinVisible", label: "Min Visible", min: 0.0, max: 12.0, step: 0.2 },
  ];

  for (const control of controls) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "10px";

    const label = document.createElement("label");
    label.textContent = control.label;
    label.style.display = "flex";
    label.style.justifyContent = "space-between";
    label.style.fontSize = "12px";

    const valueNode = document.createElement("span");
    const currentValue = selected.params[control.key] === null ? "auto" : Number(selected.params[control.key]).toFixed(2);
    valueNode.textContent = currentValue;
    label.appendChild(valueNode);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = String(control.min);
    slider.max = String(control.max);
    slider.step = String(control.step);
    slider.value = String(selected.params[control.key] === null ? Math.max(control.min, 2.2) : selected.params[control.key]);
    slider.style.width = "100%";

    slider.addEventListener("input", () => {
      selected.params[control.key] = Number(slider.value);
      valueNode.textContent = Number(selected.params[control.key]).toFixed(2);
      onRender();
    });

    wrap.appendChild(label);
    wrap.appendChild(slider);

    if (control.nullable) {
      const autoWrap = document.createElement("label");
      autoWrap.style.display = "inline-flex";
      autoWrap.style.alignItems = "center";
      autoWrap.style.gap = "6px";
      autoWrap.style.marginTop = "4px";
      autoWrap.style.fontSize = "12px";

      const autoCheckbox = document.createElement("input");
      autoCheckbox.type = "checkbox";
      autoCheckbox.checked = selected.params[control.key] === null;
      autoCheckbox.addEventListener("change", () => {
        if (autoCheckbox.checked) {
          selected.params[control.key] = null;
          valueNode.textContent = "auto";
        } else {
          selected.params[control.key] = Number(slider.value);
          valueNode.textContent = Number(selected.params[control.key]).toFixed(2);
        }
        onRender();
      });

      const autoText = document.createElement("span");
      autoText.textContent = "auto";
      autoWrap.appendChild(autoCheckbox);
      autoWrap.appendChild(autoText);
      wrap.appendChild(autoWrap);
    }

    panel.appendChild(wrap);
  }

  const actions = document.createElement("div");
  actions.style.display = "flex";
  actions.style.gap = "8px";
  actions.style.marginTop = "8px";

  const reroll = document.createElement("button");
  reroll.textContent = "New Seed + Re-roll";
  reroll.type = "button";
  reroll.style.padding = "6px 10px";
  reroll.style.cursor = "pointer";
  reroll.addEventListener("click", onReroll);

  actions.appendChild(reroll);
  panel.appendChild(actions);

  document.body.appendChild(panel);
}

function testCubePrincipalAxes() {
  const svgNode = document.getElementById("svgNode");
  if (!svgNode) {
    console.error("testCubePrincipalAxes: svgNode not found");
    return;
  }

  const defsNode = document.getElementById("defs");
  if (defsNode) {
    defsNode.innerHTML = "";
  }

  const width = CANVASFORMATCHOSEN.canvasWidth;
  const height = CANVASFORMATCHOSEN.canvasHeight;
  svgNode.style.background = "#f8f8f6";
  const search = new URLSearchParams(window.location.search);
  const baseParams = _axisReadParams(search);
  const studioState = {
    seed: _axisReadSeed(search),
    sides: [],
    selectedSideId: "C1-A",
    showDebugDirection: search.get("debugDirection") === "1",
  };

  const rebuildFromSeed = () => {
    studioState.sides = _axisWithSeededRandom(studioState.seed, () => _axisBuildStudioSides(width, height, baseParams));
  };

  rebuildFromSeed();
  _axisApplyStudioFromUrl(search, studioState);

  const reroll = () => {
    studioState.seed = ((Math.floor(Math.random() * 0x7fffffff) + 1) >>> 0);
    rebuildFromSeed();
    if (!studioState.sides.some((side) => side.id === studioState.selectedSideId)) {
      studioState.selectedSideId = studioState.sides[0].id;
    }
  };

  const applySeed = (seed) => {
    studioState.seed = seed;
    rebuildFromSeed();
    if (!studioState.sides.some((side) => side.id === studioState.selectedSideId)) {
      studioState.selectedSideId = studioState.sides[0].id;
    }
    render();
  };

  const render = () => {
    _axisWithSeededRandom(studioState.seed, () => {
      _axisRenderCubeAxes(svgNode, studioState, (sideId) => {
        studioState.selectedSideId = sideId;
        render();
      });
    });
    _axisBuildSidebar(studioState, render, () => {
      reroll();
      render();
    }, applySeed);
    _axisWriteStudioState(studioState);
  };

  render();
}