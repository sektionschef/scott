class circlePath {
    constructor(data) {
        this.center = data.center;
        this.radius = data.radius !== undefined ? data.radius : 2;
        this.group = data.group;
        this.colory = data.color !== undefined ? data.color : "#333333ff";
        this.fill = data.fill !== undefined ? data.fill : this.colory;
        this.stroke = data.stroke !== undefined ? data.stroke : "none";
        this.strokeWidth = data.strokeWidth !== undefined ? data.strokeWidth : 0;

        // Same parameter model as filledPath/hatches.
        this.jitter = data.jitter !== undefined ? data.jitter : getRandomFromInterval(0.3, 0.7);
        this.bend = data.bend !== undefined ? data.bend : getRandomFromInterval(-0.05, 0.05);
        this.width = data.width !== undefined ? data.width : 1;

        // width acts as a radial thickness contribution.
        this.radiusOuter = Math.max(0.2, this.radius + this.width * 0.5);

        this.drawPath();
        this.showCirclePath();
    }

    drawPath() {
        const R = this.radiusOuter;
        const k = Math.max(0.15, 0.5522847498 * (1 + this.bend));
        const h = R * k;

        const e = jitterPoint({ x: this.center.x + R, y: this.center.y }, this.jitter);
        const n = jitterPoint({ x: this.center.x, y: this.center.y - R }, this.jitter);
        const w = jitterPoint({ x: this.center.x - R, y: this.center.y }, this.jitter);
        const s = jitterPoint({ x: this.center.x, y: this.center.y + R }, this.jitter);

        const cEN = { x: e.x, y: e.y - h };
        const cNE = { x: n.x + h, y: n.y };

        const cNW = { x: n.x - h, y: n.y };
        const cWN = { x: w.x, y: w.y - h };

        const cWS = { x: w.x, y: w.y + h };
        const cSW = { x: s.x - h, y: s.y };

        const cSE = { x: s.x + h, y: s.y };
        const cES = { x: e.x, y: e.y + h };

        this.path = document.createElementNS("http://www.w3.org/2000/svg", "path");
        this.path.setAttributeNS(null, "d", `M ${e.x} ${e.y}
            C ${cEN.x} ${cEN.y}, ${cNE.x} ${cNE.y}, ${n.x} ${n.y}
            C ${cNW.x} ${cNW.y}, ${cWN.x} ${cWN.y}, ${w.x} ${w.y}
            C ${cWS.x} ${cWS.y}, ${cSW.x} ${cSW.y}, ${s.x} ${s.y}
            C ${cSE.x} ${cSE.y}, ${cES.x} ${cES.y}, ${e.x} ${e.y}
            Z`);
    }

    showCirclePath() {
        const group = document.getElementById(this.group);
        if (!group) { return; }
        this.path.setAttributeNS(null, "stroke", this.stroke);
        this.path.setAttributeNS(null, "stroke-width", this.strokeWidth);
        this.path.setAttributeNS(null, "opacity", 1);
        this.path.setAttributeNS(null, "fill", this.fill);
        group.appendChild(this.path);
    }
}
