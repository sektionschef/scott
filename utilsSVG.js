function getRandomFromInterval(min, max) {
    return $fx.rand() * (max - min) + min;
}


function getRandomFromList(items) {
    return items[Math.floor($fx.rand() * items.length)];
}


// comes from https://gist.github.com/xposedbones/75ebaef3c10060a3ee3b246166caab56
// const map = (value, x1, y1, x2, y2) => (value - x1) * (y2 - x2) / (y1 - x1) + x2;

function mapRange(value, inMin, inMax, outMin, outMax) {
    // with min max limiting and negative growth - https://www.tutorialspoint.com/how-to-create-a-slider-to-map-a-range-of-values-in-javascript#:~:text=In%20JavaScript%2C%20mapping%20a%20range,mapped%20value%20in%20real%2Dtime. 

    if ((outMax - outMin) > 0) {
        var result = ((value - inMin) * (outMax - outMin)) / (inMax - inMin) + outMin;

        if (result < outMin) {
            result = outMin;
        }

        if (result > outMax) {
            result = outMax;
        }
    } else {
        var result = ((value - inMin) * (outMin - outMax)) / (inMax - inMin) + outMax;
        result = outMin - result;

        if (result > outMin) {
            result = outMin;
        }

        if (result < outMax) {
            result = outMax;
        }
    }

    return result
}


// VECTOR
// angle between two points - https://gist.github.com/conorbuck/2606166 
function angleBetweenPoints(p1, p2) {
    // angle in radians
    var angleRadians = Math.atan2(p2.y - p1.y, p2.x - p1.x);
    // angle in degrees
    var angleDeg = Math.atan2(p2.y - p1.y, p2.x - p1.x) * 180 / Math.PI;

    return angleDeg;
}

// comes from https://plantpot.works/8660
function vectorFromAngle(angleRadians, vectorMagnitude) {
    point = { x: Math.round(vectorMagnitude * Math.cos(angleRadians)), y: Math.round(vectorMagnitude * Math.sin(angleRadians)) };
    return point;
}


function vectorAdd(p1, p2) {
    return { x: p1.x + p2.x, y: p1.y + p2.y }
}


// COLOR

// comes from https://stackoverflow.com/questions/36721830/convert-hsl-to-rgb-and-hex 
// function hslToHex(h, s, l) {
//     l /= 100;
//     const a = s * Math.min(l, 1 - l) / 100;
//     const f = n => {
//         const k = (n + h / 30) % 12;
//         const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
//         return Math.round(255 * color).toString(16).padStart(2, '0');   // convert to Hex and prefix "0" if needed
//     };
//     return `#${f(0)}${f(8)}${f(4)}`;
// }



// // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
// function rgbToHex(r, g, b) {
//     return "#" + (1 << 24 | r << 16 | g << 8 | b).toString(16).slice(1);
// }

// // https://stackoverflow.com/questions/5623838/rgb-to-hex-and-hex-to-rgb
// function hexToRgb(hex) {
//     // Expand shorthand form (e.g. "03F") to full form (e.g. "0033FF")
//     var shorthandRegex = /^#?([a-f\d])([a-f\d])([a-f\d])$/i;
//     hex = hex.replace(shorthandRegex, function (m, r, g, b) {
//         return r + r + g + g + b + b;
//     });

//     var result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
//     return result ? {
//         r: parseInt(result[1], 16),
//         g: parseInt(result[2], 16),
//         b: parseInt(result[3], 16)
//     } : null;
// }

// // https://blog.logrocket.com/how-to-manipulate-css-colors-with-javascript-fb547113a1b8/
// const rgbToLightness = (r, g, b) =>
//     1 / 2 * (Math.max(r, g, b) + Math.min(r, g, b));


// // https://blog.logrocket.com/how-to-manipulate-css-colors-with-javascript-fb547113a1b8/
// const rgbToSaturation = (r, g, b) => {
//     const L = rgbToLightness(r, g, b);
//     const max = Math.max(r, g, b);
//     const min = Math.min(r, g, b);
//     return (L === 0 || L === 1)
//         ? 0
//         : (max - min) / (1 - Math.abs(2 * L - 1));
// };

// // https://blog.logrocket.com/how-to-manipulate-css-colors-with-javascript-fb547113a1b8/
// const rgbToHue = (r, g, b) => Math.round(
//     Math.atan2(
//         Math.sqrt(3) * (g - b),
//         2 * r - g - b,
//     ) * 180 / Math.PI
// );

// // https://blog.logrocket.com/how-to-manipulate-css-colors-with-javascript-fb547113a1b8/
// const rgbToHsl = (r, g, b) => {
//     const lightness = rgbToLightness(r, g, b);
//     const saturation = rgbToSaturation(r, g, b);
//     const hue = rgbToHue(r, g, b);
//     return [hue, saturation, lightness];
// }

// // https://blog.logrocket.com/how-to-manipulate-css-colors-with-javascript-fb547113a1b8/
// const hslToRgb = (h, s, l) => {
//     const C = (1 - Math.abs(2 * l - 1)) * s;
//     const hPrime = h / 60;
//     const X = C * (1 - Math.abs(hPrime % 2 - 1));
//     const m = l - C / 2;
//     const withLight = (r, g, b) => [r + m, g + m, b + m];
//     if (hPrime <= 1) { return withLight(C, X, 0); } else
//         if (hPrime <= 2) { return withLight(X, C, 0); } else
//             if (hPrime <= 3) { return withLight(0, C, X); } else
//                 if (hPrime <= 4) { return withLight(0, X, C); } else
//                     if (hPrime <= 5) { return withLight(X, 0, C); } else
//                         if (hPrime <= 6) { return withLight(C, 0, X); }
// }



// STUFF

function createCoordString(p) {
    return p.x + "," + p.y;
}

function getRandomIndex(lengthy) {
    let randomIndex = Array.from({ length: lengthy }, (x, i) => i);
    randomIndex.sort(() => $fx.rand() - 0.5);
    return randomIndex
}


function getTimestamp() {
    // from: https://www.kindacode.com/article/javascript-get-current-date-time-in-yyyy-mm-dd-hh-mm-ss-format/

    const dateObj = new Date;
    // console.log(dateObj);

    let year = dateObj.getFullYear();

    let month = dateObj.getMonth();
    month = ('0' + month).slice(-2);
    // To make sure the month always has 2-character-format. For example, 1 => 01, 2 => 02

    let date = dateObj.getDate();
    date = ('0' + date).slice(-2);
    // To make sure the date always has 2-character-format

    let hour = dateObj.getHours();
    hour = ('0' + hour).slice(-2);
    // To make sure the hour always has 2-character-format

    let minute = dateObj.getMinutes();
    minute = ('0' + minute).slice(-2);
    // To make sure the minute always has 2-character-format

    let second = dateObj.getSeconds();
    second = ('0' + second).slice(-2);
    // To make sure the second always has 2-character-format

    // const timestamp = `${year}/${month}/${date} ${hour}:${minute}:${second}`;
    const timestamp = `${year}${month}${date} ${hour}${minute}${second}`;

    return timestamp
}

// eport svg - https://stackoverflow.com/questions/60921718/save-generated-svg-with-svg-js-as-svg-file 
// function downloadString(text, fileType, fileName) {
//     var blob = new Blob([text], { type: fileType });

//     var a = document.createElement('a');
//     a.download = fileName;
//     a.href = URL.createObjectURL(blob);
//     a.dataset.downloadurl = [fileType, a.download, a.href].join(':');
//     a.style.display = "none";
//     document.body.appendChild(a);
//     a.click();
//     document.body.removeChild(a);
//     setTimeout(function () { URL.revokeObjectURL(a.href); }, 1500);
// }

// https://stackoverflow.com/questions/23218174/how-do-i-save-export-an-svg-file-after-creating-an-svg-with-d3-js-ie-safari-an
function saveSvg(svgEl, name) {
    svgEl.setAttribute("xmlns", "http://www.w3.org/2000/svg");
    var svgData = svgEl.outerHTML;
    var preface = '<?xml version="1.0" standalone="no"?>\r\n';
    var svgBlob = new Blob([preface, svgData], { type: "image/svg+xml;charset=utf-8" });
    var svgUrl = URL.createObjectURL(svgBlob);
    var downloadLink = document.createElement("a");
    downloadLink.href = svgUrl;
    downloadLink.download = name;
    document.body.appendChild(downloadLink);
    downloadLink.click();
    document.body.removeChild(downloadLink);
}


function setTagsHTML(data) {
    document.title = data.title;
    document.querySelector('meta[name="description"]').setAttribute("content", data.description);
    document.querySelector('meta[name="author"]').setAttribute("content", data.artist);

    document.querySelector('meta[property="og:title"]').setAttribute("content", data.title);
    document.querySelector('meta[property="og:type"]').setAttribute("content", "website");
    document.querySelector('meta[property="og:url"]').setAttribute("content", data.website);
    document.querySelector('meta[property="og:description"]').setAttribute("content", data.description);
}


// https://mika-s.github.io/javascript/random/normal-distributed/2019/05/15/generating-normally-distributed-random-numbers-in-javascript.html
function boxMullerTransform() {
    const u1 = Math.random();
    const u2 = Math.random();

    const z0 = Math.sqrt(-2.0 * Math.log(u1)) * Math.cos(2.0 * Math.PI * u2);
    const z1 = Math.sqrt(-2.0 * Math.log(u1)) * Math.sin(2.0 * Math.PI * u2);

    return { z0, z1 };
}

function getNormallyDistributedRandomNumber(mean, stddev) {
    const { z0, _ } = boxMullerTransform();

    return z0 * stddev + mean;
}

function reloader() {
    window.location.reload();
}