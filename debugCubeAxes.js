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

function _axisBuildCubePolygons(width, height) {
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

  const yaw = getRandomFromInterval(0.58, 0.94);
  const pitch = getRandomFromInterval(-0.88, -0.56);
  const roll = getRandomFromInterval(-0.12, 0.12);
  const scale = Math.min(width, height) * getRandomFromInterval(0.25, 0.33);
  const cx = width * 0.5;
  const cy = height * 0.56;

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

  const visible = transformedFaces
    .filter((face) => face.depth > 0)
    .sort((a, b) => b.depth - a.depth)
    .slice(0, 3);

  return visible;
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

  const debugGroup = document.createElementNS("http://www.w3.org/2000/svg", "g");
  debugGroup.setAttribute("id", "debugCubeAxesGroup");
  svgNode.appendChild(debugGroup);

  const polygons = _axisBuildCubePolygons(width, height);
  const fills = ["#f2f2ef", "#e3e3de", "#cdcdc6"];

  polygons.forEach((poly, index) => {
    const polygon = document.createElementNS("http://www.w3.org/2000/svg", "polygon");
    polygon.setAttribute("points", poly.points.map((point) => `${point.x.toFixed(2)},${point.y.toFixed(2)}`).join(" "));
    polygon.setAttribute("fill", fills[index % fills.length]);
    polygon.setAttribute("stroke", "#202020");
    polygon.setAttribute("stroke-width", "1.2");
    debugGroup.appendChild(polygon);

    const axis = _axisPrincipalDirection(poly.points);
    const area = _axisPolygonArea(poly.points);
    const arrowLength = Math.max(28, Math.min(120, Math.sqrt(area) * 0.48));
    _axisDrawPrincipalLine(debugGroup, axis.center, axis.principal, arrowLength * 1.12, "#111111");
    _axisDrawArrow(debugGroup, axis.center, axis.perpendicular, arrowLength, "#d61f1f");

    const centerDot = document.createElementNS("http://www.w3.org/2000/svg", "circle");
    centerDot.setAttribute("cx", axis.center.x.toFixed(2));
    centerDot.setAttribute("cy", axis.center.y.toFixed(2));
    centerDot.setAttribute("r", "2.2");
    centerDot.setAttribute("fill", "#101010");
    debugGroup.appendChild(centerDot);

    const label = document.createElementNS("http://www.w3.org/2000/svg", "text");
    label.setAttribute("x", (axis.center.x + 8).toFixed(2));
    label.setAttribute("y", (axis.center.y - 8).toFixed(2));
    label.setAttribute("fill", "#111111");
    label.setAttribute("font-size", "12");
    label.setAttribute("font-family", "ui-monospace, Menlo, monospace");
    label.textContent = `${poly.name} ⟂`;
    debugGroup.appendChild(label);
  });
}