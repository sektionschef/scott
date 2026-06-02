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

function _axisPointInPolygon(point, polygon) {
  let inside = false;
  for (let i = 0, j = polygon.length - 1; i < polygon.length; j = i, i += 1) {
    const xi = polygon[i].x;
    const yi = polygon[i].y;
    const xj = polygon[j].x;
    const yj = polygon[j].y;
    const intersects = ((yi > point.y) !== (yj > point.y))
      && (point.x < ((xj - xi) * (point.y - yi)) / ((yj - yi) || 1e-8) + xi);
    if (intersects) {
      inside = !inside;
    }
  }
  return inside;
}

function _axisPolygonBounds(points) {
  return {
    minX: Math.min(...points.map((p) => p.x)),
    maxX: Math.max(...points.map((p) => p.x)),
    minY: Math.min(...points.map((p) => p.y)),
    maxY: Math.max(...points.map((p) => p.y)),
  };
}

function _axisHatchCirclesForPolygon(groupId, polygon, brightness, circleParams, strokeColor) {
  const bounds = _axisPolygonBounds(polygon);
  const area = _axisPolygonArea(polygon);
  const base = Math.max(4, Math.sqrt(area) * 0.09);
  const spacingScale = Math.max(0.2, circleParams.circleSpacing);
  const radiusScale = Math.max(0.1, circleParams.circleRadius);
  const adjustedRadius = Math.max(0.5, base * 0.55 * radiusScale);
  const densityFactor = Math.max(0.6, 1.2 - (brightness - 0.8) * 2.5);
  const rowStep = Math.max(adjustedRadius * 1.9, base * 1.6 * densityFactor * spacingScale);
  const colStep = Math.max(adjustedRadius * 2.15, base * 2.0 * densityFactor * spacingScale);
  const jitterAmount = adjustedRadius * Math.max(0, Math.min(0.9, circleParams.circleJitter));

  let rowIndex = 0;
  for (let centerY = bounds.minY + adjustedRadius; centerY <= bounds.maxY - adjustedRadius; centerY += rowStep) {
    const rowOffset = (rowIndex % 2 === 0) ? 0 : colStep * 0.5;
    for (let centerX = bounds.minX + adjustedRadius + rowOffset; centerX <= bounds.maxX - adjustedRadius; centerX += colStep) {
      const jitteredX = centerX + getRandomFromInterval(-jitterAmount, jitterAmount);
      const jitteredY = centerY + getRandomFromInterval(-jitterAmount, jitterAmount);
      if (!_axisPointInPolygon({ x: jitteredX, y: jitteredY }, polygon)) {
        continue;
      }

      const circle = new circlePath({
        center: { x: jitteredX, y: jitteredY },
        radius: adjustedRadius,
        group: groupId,
        color: strokeColor,
        width: 0.15,
        fill: "none",
        stroke: strokeColor,
        strokeWidth: 1,
      });
      if (circle?.path) {
        circle.path.setAttributeNS(null, "pointer-events", "none");
      }
    }
    rowIndex += 1;
  }
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
    hatchWidth: 1.0,
    hatchJitter: 0.7,
    hatchBend: 0.0,
    hatchSpacing: 1,
    hatchEdgeInset: null,
    hatchTrimRatio: 0.42,
    hatchMinVisible: 4,
    circleSpacing: 1.8,
    circleRadius: 0.5,
    circleJitter: 0.15,
  };

  const parsed = {
    hatchWidth: Number(search.get("hatchWidth")),
    hatchJitter: Number(search.get("hatchJitter")),
    hatchBend: Number(search.get("hatchBend")),
    hatchSpacing: Number(search.get("hatchSpacing")),
    hatchEdgeInset: search.get("hatchEdgeInset") === null ? null : Number(search.get("hatchEdgeInset")),
    hatchTrimRatio: Number(search.get("hatchTrimRatio")),
    hatchMinVisible: Number(search.get("hatchMinVisible")),
    circleSpacing: Number(search.get("circleSpacing")),
    circleRadius: Number(search.get("circleRadius")),
    circleJitter: Number(search.get("circleJitter")),
  };

  return {
    hatchWidth: Number.isFinite(parsed.hatchWidth) ? parsed.hatchWidth : fallback.hatchWidth,
    hatchJitter: Number.isFinite(parsed.hatchJitter) ? parsed.hatchJitter : fallback.hatchJitter,
    hatchBend: Number.isFinite(parsed.hatchBend) ? parsed.hatchBend : fallback.hatchBend,
    hatchSpacing: Number.isFinite(parsed.hatchSpacing) ? parsed.hatchSpacing : fallback.hatchSpacing,
    hatchEdgeInset: parsed.hatchEdgeInset !== null && Number.isFinite(parsed.hatchEdgeInset) ? parsed.hatchEdgeInset : fallback.hatchEdgeInset,
    hatchTrimRatio: Number.isFinite(parsed.hatchTrimRatio) ? parsed.hatchTrimRatio : fallback.hatchTrimRatio,
    hatchMinVisible: Number.isFinite(parsed.hatchMinVisible) ? parsed.hatchMinVisible : fallback.hatchMinVisible,
    circleSpacing: Number.isFinite(parsed.circleSpacing) ? parsed.circleSpacing : fallback.circleSpacing,
    circleRadius: Number.isFinite(parsed.circleRadius) ? parsed.circleRadius : fallback.circleRadius,
    circleJitter: Number.isFinite(parsed.circleJitter) ? parsed.circleJitter : fallback.circleJitter,
  };
}

function _axisWriteParams(params) {
  const search = new URLSearchParams(window.location.search);
  search.set("debugHatchingStudio", "1");
  search.delete("debugCubeAxes");
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

const AXIS_BRIGHTNESS_PROFILE_STORAGE_KEY = "camogli3d.hatchingBrightnessProfiles.v1";

function _axisBrightnessBinIndex(brightness) {
  const normalized = Math.max(0, Math.min(0.999999, Number(brightness) || 0));
  return Math.max(0, Math.min(9, Math.floor(normalized * 10)));
}

function _axisBuildBrightnessProfilePayload(studioState) {
  const bins = Array.from({ length: 10 }, (_, index) => ({
    bin: index,
    range: `${index * 10}-${(index + 1) * 10}`,
    hatchMode: null,
    hatchSpacing: null,
    circleSpacing: null,
    hatchColor: null,
  }));

  for (const side of studioState.sides || []) {
    const bin = _axisBrightnessBinIndex(side.brightness);
    bins[bin] = {
      bin,
      range: `${bin * 10}-${(bin + 1) * 10}`,
      hatchMode: side.hatchMode,
      hatchSpacing: Number(side.params?.hatchSpacing ?? 1),
      circleSpacing: Number(side.params?.circleSpacing ?? 1),
      hatchColor: side.hatchColor || null,
    };
  }

  return {
    v: 2,
    source: "debugHatchingStudio",
    updatedAt: new Date().toISOString(),
    seed: studioState.seed >>> 0,
    selectedSideId: studioState.selectedSideId,
    showDebugDirection: !!studioState.showDebugDirection,
    showSideLabels: !!studioState.showSideLabels,
    globalParams: {
      hatchWidth: studioState.globalParams.hatchWidth,
      hatchJitter: studioState.globalParams.hatchJitter,
      hatchBend: studioState.globalParams.hatchBend,
      hatchEdgeInset: studioState.globalParams.hatchEdgeInset,
      hatchTrimRatio: studioState.globalParams.hatchTrimRatio,
      hatchMinVisible: studioState.globalParams.hatchMinVisible,
      circleRadius: studioState.globalParams.circleRadius,
      circleJitter: studioState.globalParams.circleJitter,
    },
    bins,
  };
}

function _axisSaveBrightnessProfile(studioState) {
  if (typeof window === "undefined" || !window.localStorage) {
    return false;
  }
  try {
    const payload = _axisBuildBrightnessProfilePayload(studioState);
    window.localStorage.setItem(AXIS_BRIGHTNESS_PROFILE_STORAGE_KEY, JSON.stringify(payload));
    return true;
  } catch (_error) {
    return false;
  }
}

function _axisLoadBrightnessProfile() {
  if (typeof window === "undefined" || !window.localStorage) {
    return null;
  }
  try {
    const raw = window.localStorage.getItem(AXIS_BRIGHTNESS_PROFILE_STORAGE_KEY);
    if (!raw) {
      return null;
    }
    const payload = JSON.parse(raw);
    if (!payload || !Array.isArray(payload.bins)) {
      return null;
    }
    return payload;
  } catch (_error) {
    return null;
  }
}

function _axisApplyBrightnessProfileToStudioState(studioState, payload, rebuildFromSeed = null) {
  if (!studioState || !Array.isArray(studioState.sides) || !payload || !Array.isArray(payload.bins)) {
    return false;
  }

  const normalizedSeed = _axisNormalizeSeed(payload.seed);
  if (normalizedSeed !== null) {
    studioState.seed = normalizedSeed;
    if (typeof rebuildFromSeed === "function") {
      rebuildFromSeed();
    }
  }

  if (payload.globalParams && typeof payload.globalParams === "object") {
    const keys = [
      "hatchWidth",
      "hatchJitter",
      "hatchBend",
      "hatchEdgeInset",
      "hatchTrimRatio",
      "hatchMinVisible",
      "circleRadius",
      "circleJitter",
    ];
    for (const key of keys) {
      if (!Object.prototype.hasOwnProperty.call(payload.globalParams, key)) {
        continue;
      }
      const value = payload.globalParams[key];
      if (value === null && key === "hatchEdgeInset") {
        studioState.globalParams[key] = null;
        continue;
      }
      if (Number.isFinite(Number(value))) {
        studioState.globalParams[key] = Number(value);
      }
    }
  }

  if (typeof payload.showDebugDirection === "boolean") {
    studioState.showDebugDirection = payload.showDebugDirection;
  }
  if (typeof payload.showSideLabels === "boolean") {
    studioState.showSideLabels = payload.showSideLabels;
  }
  if (typeof payload.selectedSideId === "string") {
    studioState.selectedSideId = payload.selectedSideId;
  }

  const byBin = new Map();
  for (const row of payload.bins) {
    const bin = Math.max(0, Math.min(9, Number(row?.bin)));
    byBin.set(bin, row);
  }

  let applied = false;
  for (const side of studioState.sides) {
    const row = byBin.get(_axisBrightnessBinIndex(side.brightness));
    if (!row) {
      continue;
    }
    if (row.hatchMode === "none" || row.hatchMode === "single" || row.hatchMode === "cross") {
      side.hatchMode = row.hatchMode;
      applied = true;
    }
    const hatchSpacing = Number(row.hatchSpacing);
    if (Number.isFinite(hatchSpacing)) {
      side.params.hatchSpacing = Math.max(0.2, Math.min(2.0, hatchSpacing));
      applied = true;
    }
    const circleSpacing = Number(row.circleSpacing);
    if (Number.isFinite(circleSpacing)) {
      side.params.circleSpacing = Math.max(0.2, Math.min(6.0, circleSpacing));
      applied = true;
    }
    if (typeof row.hatchColor === "string" && /^#[0-9a-fA-F]{6}$/.test(row.hatchColor.trim())) {
      side.hatchColor = row.hatchColor.trim();
      applied = true;
    }
  }

  return applied;
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
    let legacyGlobalApplied = false;
    let legacyCircleSpacing = null;

    if (Array.isArray(payload.g) && payload.g.length >= 6) {
      studioState.globalParams.hatchWidth = _axisSanitizeParamValue(Number(payload.g[0]), studioState.globalParams.hatchWidth);
      studioState.globalParams.hatchJitter = _axisSanitizeParamValue(Number(payload.g[1]), studioState.globalParams.hatchJitter);
      studioState.globalParams.hatchBend = _axisSanitizeParamValue(Number(payload.g[2]), studioState.globalParams.hatchBend);
      studioState.globalParams.hatchEdgeInset = payload.g[3] === null
        ? null
        : _axisSanitizeParamValue(Number(payload.g[3]), studioState.globalParams.hatchEdgeInset);
      studioState.globalParams.hatchTrimRatio = _axisSanitizeParamValue(Number(payload.g[4]), studioState.globalParams.hatchTrimRatio);
      studioState.globalParams.hatchMinVisible = _axisSanitizeParamValue(Number(payload.g[5]), studioState.globalParams.hatchMinVisible);
      if (payload.g.length >= 9) {
        const sideCircleFallback = studioState.sides[0]?.params.circleSpacing ?? 1.8;
        legacyCircleSpacing = _axisSanitizeParamValue(Number(payload.g[6]), sideCircleFallback);
        studioState.globalParams.circleRadius = _axisSanitizeParamValue(Number(payload.g[7]), studioState.globalParams.circleRadius);
        studioState.globalParams.circleJitter = _axisSanitizeParamValue(Number(payload.g[8]), studioState.globalParams.circleJitter);
      } else if (payload.g.length >= 8) {
        studioState.globalParams.circleRadius = _axisSanitizeParamValue(Number(payload.g[6]), studioState.globalParams.circleRadius);
        studioState.globalParams.circleJitter = _axisSanitizeParamValue(Number(payload.g[7]), studioState.globalParams.circleJitter);
      }
    } else if (Array.isArray(payload.g) && payload.g.length >= 5) {
      // Backward compatibility with v2 payload where hatchWidth was side-specific.
      studioState.globalParams.hatchJitter = _axisSanitizeParamValue(Number(payload.g[0]), studioState.globalParams.hatchJitter);
      studioState.globalParams.hatchBend = _axisSanitizeParamValue(Number(payload.g[1]), studioState.globalParams.hatchBend);
      studioState.globalParams.hatchEdgeInset = payload.g[2] === null
        ? null
        : _axisSanitizeParamValue(Number(payload.g[2]), studioState.globalParams.hatchEdgeInset);
      studioState.globalParams.hatchTrimRatio = _axisSanitizeParamValue(Number(payload.g[3]), studioState.globalParams.hatchTrimRatio);
      studioState.globalParams.hatchMinVisible = _axisSanitizeParamValue(Number(payload.g[4]), studioState.globalParams.hatchMinVisible);
    }

    for (const row of payload.d) {
      const side = byId.get(row.id);
      if (!side) {
        continue;
      }
      if (row.mode === "none" || row.mode === "single" || row.mode === "cross") {
        // Migrate old payloads that stored many `none` modes for cube faces.
        if ((payload.v || 1) < 3 && row.mode === "none") {
          side.hatchMode = _axisDefaultHatchMode(side.brightness);
        } else {
          side.hatchMode = row.mode;
        }
      }
      if (!Array.isArray(row.p) || row.p.length < 1) {
        // keep parsing optional color below
      } else if (row.p.length >= 2) {
        // Backward compatibility with payload where p[0] was width and p[1] was hatchSpacing.
        side.params.hatchSpacing = _axisSanitizeParamValue(Number(row.p[1]), side.params.hatchSpacing);
        if (row.p.length >= 3) {
          side.params.circleSpacing = _axisSanitizeParamValue(Number(row.p[2]), side.params.circleSpacing);
        }
      } else {
        side.params.hatchSpacing = _axisSanitizeParamValue(Number(row.p[0]), side.params.hatchSpacing);
        side.params.circleSpacing = legacyCircleSpacing !== null
          ? legacyCircleSpacing
          : side.params.circleSpacing;
      }
      if (typeof row.c === "string" && /^#[0-9a-fA-F]{6}$/.test(row.c.trim())) {
        side.hatchColor = row.c.trim();
      }

      // Backward compatibility with older payloads where every side stored full params.
      if (!legacyGlobalApplied && row.p.length >= 7) {
        studioState.globalParams.hatchJitter = _axisSanitizeParamValue(Number(row.p[1]), studioState.globalParams.hatchJitter);
        studioState.globalParams.hatchBend = _axisSanitizeParamValue(Number(row.p[2]), studioState.globalParams.hatchBend);
        studioState.globalParams.hatchEdgeInset = row.p[4] === null
          ? null
          : _axisSanitizeParamValue(Number(row.p[4]), studioState.globalParams.hatchEdgeInset);
        studioState.globalParams.hatchTrimRatio = _axisSanitizeParamValue(Number(row.p[5]), studioState.globalParams.hatchTrimRatio);
        studioState.globalParams.hatchMinVisible = _axisSanitizeParamValue(Number(row.p[6]), studioState.globalParams.hatchMinVisible);
        legacyGlobalApplied = true;
      }
    }

    if (typeof payload.s === "string" && byId.has(payload.s)) {
      studioState.selectedSideId = payload.s;
    }
    if (typeof payload.dir === "boolean") {
      studioState.showDebugDirection = payload.dir;
    }
    if (typeof payload.lbl === "boolean") {
      studioState.showSideLabels = payload.lbl;
    }
  } catch (_error) {
    // ignore malformed studio param
  }
}

function _axisWriteStudioState(studioState) {
  const search = new URLSearchParams(window.location.search);
  search.set("debugHatchingStudio", "1");
  search.delete("debugCubeAxes");
  search.set("seed", String(studioState.seed >>> 0));
  if (studioState.showSideLabels) {
    search.set("sideLabels", "1");
  } else {
    search.delete("sideLabels");
  }

  // Keep the URL compact: full editor state lives inside `studio` payload.
  search.delete("hatchWidth");
  search.delete("hatchJitter");
  search.delete("hatchBend");
  search.delete("hatchSpacing");
  search.delete("circleSpacing");
  search.delete("hatchTrimRatio");
  search.delete("hatchMinVisible");
  search.delete("hatchEdgeInset");
  search.delete("circleRadius");
  search.delete("circleJitter");

  const payload = {
    v: 3,
    s: studioState.selectedSideId,
    dir: !!studioState.showDebugDirection,
    lbl: !!studioState.showSideLabels,
    g: [
      Number(studioState.globalParams.hatchWidth.toFixed(2)),
      Number(studioState.globalParams.hatchJitter.toFixed(2)),
      Number(studioState.globalParams.hatchBend.toFixed(3)),
      studioState.globalParams.hatchEdgeInset === null ? null : Number(studioState.globalParams.hatchEdgeInset.toFixed(2)),
      Number(studioState.globalParams.hatchTrimRatio.toFixed(2)),
      Number(studioState.globalParams.hatchMinVisible.toFixed(2)),
      Number(studioState.globalParams.circleRadius.toFixed(2)),
      Number(studioState.globalParams.circleJitter.toFixed(2)),
    ],
    d: studioState.sides.map((side) => ({
      id: side.id,
      mode: side.hatchMode,
      p: [
        Number(side.params.hatchSpacing.toFixed(2)),
        Number(side.params.circleSpacing.toFixed(2)),
      ],
      c: side.hatchColor,
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
  // Rectangle studio should always show hatching by default.
  return brightness >= 0.75 ? "cross" : "single";
}

function _axisDefaultSpacingForBrightness(brightness) {
  // Lower spacing => denser hatch for darker buckets.
  if (brightness <= 0.2) return 1.35;
  if (brightness <= 0.3) return 1.2;
  if (brightness <= 0.4) return 1.05;
  if (brightness <= 0.5) return 0.95;
  if (brightness <= 0.6) return 0.85;
  if (brightness <= 0.7) return 0.75;
  if (brightness <= 0.8) return 0.68;
  if (brightness <= 0.9) return 0.6;
  return 0.52;
}

function _axisCloneParams(params) {
  return {
    hatchSpacing: params.hatchSpacing,
    circleSpacing: params.circleSpacing,
  };
}

function _axisCloneGlobalParams(params) {
  return {
    hatchWidth: params.hatchWidth,
    hatchJitter: params.hatchJitter,
    hatchBend: params.hatchBend,
    hatchEdgeInset: params.hatchEdgeInset,
    hatchTrimRatio: params.hatchTrimRatio,
    hatchMinVisible: params.hatchMinVisible,
    circleRadius: params.circleRadius,
    circleJitter: params.circleJitter,
  };
}

function _axisBuildStudioSides(width, height, baseParams) {
  const legacyIds = [
    "C1-A", "C1-B", "C1-C",
    "C2-A", "C2-B", "C2-C",
    "C3-A", "C3-B", "C3-C",
    "C4-A",
  ];
  const count = 10;
  const outerMarginX = width * 0.06;
  const gap = width * 0.012;
  const stripHeight = Math.min(height * 0.56, width * 0.2);
  const yTop = (height - stripHeight) * 0.5;
  const usableWidth = width - outerMarginX * 2 - gap * (count - 1);
  const rectWidth = usableWidth / count;

  const sides = [];
  for (let index = 0; index < count; index += 1) {
    const brightnessValue = index + 0.5;
    const brightness = brightnessValue / 10;
    const x = outerMarginX + index * (rectWidth + gap);
    const polygon = {
      name: `rect${index + 1}`,
      points: [
        { x, y: yTop },
        { x: x + rectWidth, y: yTop },
        { x: x + rectWidth, y: yTop + stripHeight },
        { x, y: yTop + stripHeight },
      ],
    };

    sides.push({
      id: legacyIds[index] || `B${index + 1}`,
      cubeIndex: index,
      sideLabel: String(index + 1),
      brightness,
      brightnessValue,
      hatchMode: _axisDefaultHatchMode(brightness),
      hatchColor: "#111111",
      poly: polygon,
      params: {
        ..._axisCloneParams(baseParams),
        hatchSpacing: _axisDefaultSpacingForBrightness(brightness),
      },
    });
  }
  return sides;
}

function _axisRenderCubeAxes(svgNode, studioState, onSelectSide) {
  _axisRemoveExistingRender();

  const debugGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  debugGroup.setAttribute("id", "debugCubeAxesGroup");
  svgNode.appendChild(debugGroup);

  const cubeCenterAcc = new Map();
  for (const side of studioState.sides) {
    const center = _axisPolygonCentroid(side.poly.points);
    const acc = cubeCenterAcc.get(side.cubeIndex) || { x: 0, y: 0, count: 0 };
    acc.x += center.x;
    acc.y += center.y;
    acc.count += 1;
    cubeCenterAcc.set(side.cubeIndex, acc);
  }
  const cubeCenters = new Map();
  for (const [cubeIndex, acc] of cubeCenterAcc.entries()) {
    cubeCenters.set(cubeIndex, {
      x: acc.x / Math.max(1, acc.count),
      y: acc.y / Math.max(1, acc.count),
    });
  }

  for (let sideIndex = 0; sideIndex < studioState.sides.length; sideIndex += 1) {
    const side = studioState.sides[sideIndex];
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", side.poly.points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" "));
    polygon.setAttribute("fill", "none");
    polygon.setAttribute("stroke", "#6a6a6a");
    polygon.setAttribute("stroke-width", "0.8");
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
    const sideSpacing = Math.max(0.2, Math.min(2.0, side.params.hatchSpacing));
    const spacing = Math.max(4, Math.sqrt(area) * 0.1 * sideSpacing * spacingFactor);
    const baseEdgeInset = studioState.globalParams.hatchEdgeInset !== null
      ? Math.max(0, studioState.globalParams.hatchEdgeInset)
      : Math.max(2.0, studioState.globalParams.hatchWidth * 1.3 + studioState.globalParams.hatchJitter * 0.9);
    const bounds = _axisPolygonBounds(side.poly.points);
    const minSpan = Math.max(1, Math.min(bounds.maxX - bounds.minX, bounds.maxY - bounds.minY));
    const edgeInset = Math.min(baseEdgeInset, Math.max(0.6, minSpan * 0.12));
    const trimRatio = Math.min(studioState.globalParams.hatchTrimRatio, 0.32);
    const minVisible = Math.min(studioState.globalParams.hatchMinVisible, Math.max(0.8, minSpan * 0.22));

    const sideSeed = _axisHashSeed(`${studioState.seed}|${side.id}|${side.hatchMode}`);
    _axisWithSeededRandom(sideSeed, () => {
      if (side.hatchMode !== "none") {
        const hatchSegments = _axisBuildHatchSegments(
          side.poly.points,
          hatchDir,
          sweepDir,
          spacing,
          edgeInset,
          trimRatio,
          minVisible,
        );
        for (const segment of hatchSegments) {
          const hatch = new filledPath({
            start: { x: segment.start.x, y: segment.start.y },
            end: { x: segment.end.x, y: segment.end.y },
            group: hatchGroupId,
            width: studioState.globalParams.hatchWidth,
            jitter: studioState.globalParams.hatchJitter,
            bend: studioState.globalParams.hatchBend,
          });
          if (hatch?.path) {
            hatch.path.setAttributeNS(null, "fill", side.hatchColor || "#111111");
            hatch.path.setAttributeNS(null, "pointer-events", "none");
          }
        }
      }

      if (side.hatchMode === "cross") {
        const crossSegments = _axisBuildHatchSegments(
          side.poly.points,
          sweepDir,
          hatchDir,
          spacing * 1.03,
          edgeInset,
          trimRatio,
          minVisible,
        );
        for (const segment of crossSegments) {
          const hatch = new filledPath({
            start: { x: segment.start.x, y: segment.start.y },
            end: { x: segment.end.x, y: segment.end.y },
            group: hatchGroupId,
            width: studioState.globalParams.hatchWidth,
            jitter: studioState.globalParams.hatchJitter,
            bend: studioState.globalParams.hatchBend,
          });
          if (hatch?.path) {
            hatch.path.setAttributeNS(null, "fill", side.hatchColor || "#111111");
            hatch.path.setAttributeNS(null, "pointer-events", "none");
          }
        }
      }

      // Add organic circle texture for the darkest sides.
      if (side.brightness > 0.8) {
        _axisHatchCirclesForPolygon(hatchGroupId, side.poly.points, side.brightness, {
          circleSpacing: side.params.circleSpacing,
          circleRadius: studioState.globalParams.circleRadius,
          circleJitter: studioState.globalParams.circleJitter,
        }, side.hatchColor || "#111111");
      }
    });

    if (studioState.showDebugDirection) {
      _axisDrawPrincipalLine(debugGroup, axis.center, axis.principal, arrowLength * 1.1, "#169c41");
      _axisDrawArrow(debugGroup, axis.center, axis.perpendicular, arrowLength, "#d61f1f");
    }

    if (studioState.showSideLabels) {
      const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
      const bounds = _axisPolygonBounds(side.poly.points);
      label.setAttribute("x", axis.center.x.toFixed(2));
      label.setAttribute("y", (bounds.maxY + 12).toFixed(2));
      label.setAttribute("fill", "#777777");
      label.setAttribute("font-size", "11");
      label.setAttribute("font-family", "ui-monospace, Menlo, monospace");
      label.setAttribute("text-anchor", "middle");
      label.setAttribute("dominant-baseline", "hanging");
      label.setAttribute("pointer-events", "none");
      label.textContent = `${side.id} b=${(side.brightnessValue ?? (side.brightness * 10)).toFixed(1)}`;
      debugGroup.appendChild(label);
    }

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

function _axisBuildSidebar(studioState, onRender, onReroll, onApplySeed, onLoadProfile) {
  const existing = document.getElementById("debugCubeAxesPanel");
  if (existing && existing.parentNode) {
    existing.parentNode.removeChild(existing);
  }

  const panel = document.createElement("div");
  panel.id = "debugCubeAxesPanel";
  panel.style.position = "relative";
  panel.style.zIndex = "1";
  panel.style.width = "100%";
  panel.style.maxWidth = "340px";
  panel.style.maxHeight = "calc(100vh - 24px)";
  panel.style.overflow = "auto";
  panel.style.background = "rgba(250,250,248,0.95)";
  panel.style.border = "1px solid #b9b9b9";
  panel.style.borderRadius = "10px";
  panel.style.padding = "12px";
  panel.style.boxSizing = "border-box";
  panel.style.fontFamily = "ui-sans-serif, system-ui, -apple-system, Segoe UI, sans-serif";
  panel.style.color = "#111";

  const title = document.createElement("div");
  title.textContent = "Brightness Hatch Studio";
  title.style.fontWeight = "700";
  title.style.marginBottom = "8px";
  panel.appendChild(title);

  const selected = studioState.sides.find((side) => side.id === studioState.selectedSideId) || studioState.sides[0];
  const sideInfo = document.createElement("div");
  sideInfo.textContent = `Selected: ${selected.id} | brightness ${(selected.brightnessValue ?? (selected.brightness * 10)).toFixed(1)} | cross if > 5.0`;
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

  const sideLabelsWrap = document.createElement("label");
  sideLabelsWrap.style.display = "inline-flex";
  sideLabelsWrap.style.alignItems = "center";
  sideLabelsWrap.style.gap = "6px";
  sideLabelsWrap.style.marginBottom = "10px";
  sideLabelsWrap.style.marginLeft = "10px";
  sideLabelsWrap.style.fontSize = "12px";

  const sideLabelsToggle = document.createElement("input");
  sideLabelsToggle.type = "checkbox";
  sideLabelsToggle.checked = !!studioState.showSideLabels;
  sideLabelsToggle.addEventListener("change", () => {
    studioState.showSideLabels = sideLabelsToggle.checked;
    onRender();
  });

  const sideLabelsText = document.createElement("span");
  sideLabelsText.textContent = "Side labels";
  sideLabelsWrap.appendChild(sideLabelsToggle);
  sideLabelsWrap.appendChild(sideLabelsText);
  panel.appendChild(sideLabelsWrap);

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

  const hatchColorWrap = document.createElement("div");
  hatchColorWrap.style.marginBottom = "10px";
  const hatchColorLabel = document.createElement("label");
  hatchColorLabel.textContent = "Hatch Color";
  hatchColorLabel.style.display = "block";
  hatchColorLabel.style.fontSize = "12px";
  hatchColorLabel.style.marginBottom = "4px";
  const hatchColorInput = document.createElement("input");
  hatchColorInput.type = "color";
  hatchColorInput.value = /^#[0-9a-fA-F]{6}$/.test(selected.hatchColor || "") ? selected.hatchColor : "#111111";
  hatchColorInput.style.width = "100%";
  hatchColorInput.addEventListener("input", () => {
    selected.hatchColor = hatchColorInput.value;
    onRender();
  });
  hatchColorWrap.appendChild(hatchColorLabel);
  hatchColorWrap.appendChild(hatchColorInput);
  panel.appendChild(hatchColorWrap);

  const controls = [
    { key: "hatchSpacing", label: "Spacing", min: 0.2, max: 2.0, step: 0.05 },
    { key: "circleSpacing", label: "Circle Spacing", min: 0.2, max: 6.0, step: 0.1 },
  ];

  for (const control of controls) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "10px";

    const label = document.createElement("label");
    label.textContent = `${control.label} (side)`;
    label.style.display = "flex";
    label.style.justifyContent = "space-between";
    label.style.fontSize = "12px";

    const valueInput = document.createElement("input");
    valueInput.type = "number";
    valueInput.min = String(control.min);
    valueInput.max = String(control.max);
    valueInput.step = String(control.step);
    valueInput.value = Number(selected.params[control.key]).toFixed(2);
    valueInput.style.width = "74px";
    valueInput.style.boxSizing = "border-box";
    label.appendChild(valueInput);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = String(control.min);
    slider.max = String(control.max);
    slider.step = String(control.step);
    slider.value = String(selected.params[control.key]);
    slider.style.width = "100%";

    const syncValue = (value) => {
      const clamped = Math.max(control.min, Math.min(control.max, Number(value)));
      selected.params[control.key] = clamped;
      slider.value = String(clamped);
      valueInput.value = clamped.toFixed(2);
      onRender();
    };

    slider.addEventListener("input", () => {
      syncValue(slider.value);
    });

    valueInput.addEventListener("change", () => {
      syncValue(valueInput.value);
    });

    valueInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        syncValue(valueInput.value);
      }
    });

    wrap.appendChild(label);
    wrap.appendChild(slider);
    panel.appendChild(wrap);
  }

  const globalControls = [
    { key: "hatchWidth", label: "Width", min: 0.2, max: 3.5, step: 0.05 },
    { key: "hatchJitter", label: "Jitter", min: 0.0, max: 2.0, step: 0.05 },
    { key: "hatchBend", label: "Bend Amount", min: 0.0, max: 0.2, step: 0.01 },
    { key: "hatchEdgeInset", label: "Edge Inset", min: 0.0, max: 8.0, step: 0.1, nullable: true },
    { key: "hatchTrimRatio", label: "Trim Ratio", min: 0.05, max: 0.7, step: 0.01 },
    { key: "hatchMinVisible", label: "Min Visible", min: 0.0, max: 12.0, step: 0.2 },
    { key: "circleRadius", label: "Circle Radius", min: 0.1, max: 3.0, step: 0.1 },
    { key: "circleJitter", label: "Circle Jitter", min: 0.0, max: 0.9, step: 0.02 },
  ];

  for (const control of globalControls) {
    const wrap = document.createElement("div");
    wrap.style.marginBottom = "10px";
    const currentRawValue = studioState.globalParams[control.key];
    const currentUiValue = control.key === "hatchBend"
      ? Math.abs(Number(currentRawValue) || 0)
      : currentRawValue;

    const label = document.createElement("label");
    label.textContent = `${control.label} (global)`;
    label.style.display = "flex";
    label.style.justifyContent = "space-between";
    label.style.fontSize = "12px";

    const valueInput = document.createElement("input");
    valueInput.type = "number";
    valueInput.min = String(control.min);
    valueInput.max = String(control.max);
    valueInput.step = String(control.step);
    valueInput.value = currentUiValue === null ? "" : Number(currentUiValue).toFixed(2);
    valueInput.placeholder = control.nullable ? "auto" : "";
    valueInput.style.width = "74px";
    valueInput.style.boxSizing = "border-box";
    label.appendChild(valueInput);

    const slider = document.createElement("input");
    slider.type = "range";
    slider.min = String(control.min);
    slider.max = String(control.max);
    slider.step = String(control.step);
    slider.value = String(currentUiValue === null ? Math.max(control.min, 2.2) : currentUiValue);
    slider.style.width = "100%";

    const syncValue = (value) => {
      const clamped = Math.max(control.min, Math.min(control.max, Number(value)));
      studioState.globalParams[control.key] = control.key === "hatchBend" ? Math.abs(clamped) : clamped;
      slider.value = String(clamped);
      valueInput.value = clamped.toFixed(2);
      onRender();
    };

    slider.addEventListener("input", () => {
      syncValue(slider.value);
    });

    valueInput.addEventListener("change", () => {
      if (control.nullable && valueInput.value.trim() === "") {
        studioState.globalParams[control.key] = null;
        onRender();
        return;
      }
      syncValue(valueInput.value);
    });

    valueInput.addEventListener("keydown", (event) => {
      if (event.key === "Enter") {
        if (control.nullable && valueInput.value.trim() === "") {
          studioState.globalParams[control.key] = null;
          onRender();
          return;
        }
        syncValue(valueInput.value);
      }
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
      autoCheckbox.checked = studioState.globalParams[control.key] === null;
      autoCheckbox.addEventListener("change", () => {
        if (autoCheckbox.checked) {
          studioState.globalParams[control.key] = null;
          valueInput.value = "";
          valueInput.disabled = true;
        } else {
          studioState.globalParams[control.key] = control.key === "hatchBend"
            ? Math.abs(Number(slider.value))
            : Number(slider.value);
          valueInput.disabled = false;
          valueInput.value = Number(control.key === "hatchBend"
            ? Math.abs(Number(studioState.globalParams[control.key]))
            : studioState.globalParams[control.key]).toFixed(2);
        }
        onRender();
      });

      valueInput.disabled = autoCheckbox.checked;

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
  actions.style.flexWrap = "wrap";
  actions.style.gap = "8px";
  actions.style.marginTop = "8px";

  const reroll = document.createElement("button");
  reroll.textContent = "New Seed + Re-roll";
  reroll.type = "button";
  reroll.style.padding = "6px 10px";
  reroll.style.cursor = "pointer";
  reroll.addEventListener("click", onReroll);

  const saveProfile = document.createElement("button");
  saveProfile.textContent = "Save 0-100 Profile";
  saveProfile.type = "button";
  saveProfile.style.padding = "6px 10px";
  saveProfile.style.cursor = "pointer";
  saveProfile.addEventListener("click", () => {
    const ok = _axisSaveBrightnessProfile(studioState);
    saveProfile.textContent = ok ? "Saved" : "Save failed";
    setTimeout(() => {
      saveProfile.textContent = "Save 0-100 Profile";
    }, 900);
  });

  const loadProfile = document.createElement("button");
  loadProfile.textContent = "Load 0-100 Profile";
  loadProfile.type = "button";
  loadProfile.style.padding = "6px 10px";
  loadProfile.style.cursor = "pointer";
  loadProfile.addEventListener("click", () => {
    const payload = _axisLoadBrightnessProfile();
    const ok = typeof onLoadProfile === "function"
      ? onLoadProfile(payload)
      : _axisApplyBrightnessProfileToStudioState(studioState, payload);
    loadProfile.textContent = ok ? "Loaded" : "No profile";
    setTimeout(() => {
      loadProfile.textContent = "Load 0-100 Profile";
    }, 900);
  });

  actions.appendChild(reroll);
  actions.appendChild(saveProfile);
  actions.appendChild(loadProfile);
  panel.appendChild(actions);

  document.body.appendChild(panel);
}

function _axisApplyStudioLayout(svgNode) {
  const body = document.body;
  if (body) {
    body.style.margin = "0";
    body.style.display = "grid";
    body.style.gridTemplateColumns = "minmax(0,1fr) 340px";
    body.style.columnGap = "12px";
    body.style.padding = "12px";
    body.style.boxSizing = "border-box";
    body.style.height = "100vh";
    body.style.overflow = "hidden";
    body.style.alignItems = "start";
  }

  const host = document.getElementById("badAssCanvas");
  if (host) {
    host.style.width = "100%";
    host.style.height = "calc(100vh - 24px)";
    host.style.overflow = "hidden";
    host.style.display = "flex";
    host.style.alignItems = "center";
    host.style.justifyContent = "center";
    host.style.gridColumn = "1 / 2";
  }

  if (svgNode) {
    svgNode.style.width = "100%";
    svgNode.style.height = "100%";
    svgNode.style.maxWidth = "100%";
    svgNode.style.maxHeight = "100%";
  }
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
  _axisApplyStudioLayout(svgNode);
  const search = new URLSearchParams(window.location.search);
  const baseParams = _axisReadParams(search);
  const studioState = {
    seed: _axisReadSeed(search),
    globalParams: _axisCloneGlobalParams(baseParams),
    sides: [],
    selectedSideId: "C1-A",
    showDebugDirection: search.get("debugDirection") === "1",
    showSideLabels: search.get("sideLabels") === "1",
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

  const renderPreview = () => {
    _axisWithSeededRandom(studioState.seed, () => {
      _axisRenderCubeAxes(svgNode, studioState, (sideId) => {
        studioState.selectedSideId = sideId;
        render();
      });
    });
    _axisWriteStudioState(studioState);
  };

  const applyProfile = (payload) => {
    const ok = _axisApplyBrightnessProfileToStudioState(studioState, payload, rebuildFromSeed);
    if (!ok) {
      return false;
    }
    if (!studioState.sides.some((side) => side.id === studioState.selectedSideId)) {
      studioState.selectedSideId = studioState.sides[0]?.id || null;
    }
    render();
    return true;
  };

  const render = () => {
    renderPreview();
    _axisBuildSidebar(studioState, renderPreview, () => {
      reroll();
      render();
    }, applySeed, applyProfile);
  };

  render();
}