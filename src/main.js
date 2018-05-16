/**
 * Intersect ray and rectangle
 * @param  pos  Starting position of ray
 * @param  dir  Direction of ray
 * @param  rect Rectangle to intersect
 * @return      First intersection
 */
function rayRectIntersect(pos, dir, rect) {
    if (pos.x < rect.l || pos.x > rect.r || pos.y < rect.t || pos.y > rect.b) {
        console.log("Point outside rectangle; feature not implemented.");
        return { x: 0, y: 0};
    }

    if (dir.x == 0 && dir.y == 0) {
        console.log("Invalid ray direction.");
        return { x: NaN, y: NaN};
    }

    if (pos.x == rect.l || pos.x == rect.r || pos.y == rect.t || pos.y == rect.b)
        return pos;

    var t, y;
    if (dir.x != 0) {
        // left
        t = (rect.l - pos.x) / dir.x;
        if (t > 0) {
            y = pos.y + t * dir.y;
            if (y >= rect.t && y <= rect.b)
                return { x: rect.l, y: y };
        }
        // right
        t = (rect.r - pos.x) / dir.x;
        if (t > 0) {
            y = pos.y + t * dir.y;
            if (y >= rect.t && y <= rect.b)
                return { x: rect.r, y: y };
        }
    }
    if (dir.y != 0) {
        // top
        t = (rect.t - pos.y) / dir.y;
        if (t > 0) {
            x = pos.x + t * dir.x;
            if (x >= rect.l && x <= rect.r)
                return { x: x, y: rect.t };
        }
        // bottom
        t = (rect.b - pos.y) / dir.y;
        if (t > 0) {
            x = pos.x + t * dir.x;
            if (x >= rect.l && x <= rect.r)
                return { x: x, y: rect.b };
        }
    }

    console.log("Cannot intersect ray with rectangle for unknown reason.");
    return { x: NaN, y: NaN};
}

function fisheye() {
    if (typeof graph === 'undefined') {
        console.log("Error: Trying to deform an undefined graph");
        return;
    }

    var dFactor = Number(document.getElementById("distortion").value);
    if (dFactor < 0) {
        console.log("Error: Distortion factor below zero.");
        return;
    }

    function G(x) {
        return ((dFactor + 1) * x) / (dFactor * x + 1);
    }

    var distort;
    switch (method) {
        case "cartesian":
            distort = function(P, F) {
                function coord(P_i, F_i, limit) {
                    var dMax_i = (P_i > F_i ? limit - F_i : -F_i) / limit;
                    var dist_i = (P_i - F_i) / limit;
                    return G(dist_i / dMax_i) * dMax_i * limit + F_i;
                }

                return {
                    x: coord(P.x, F.x, graphBounds.w),
                    y: coord(P.y, F.y, graphBounds.h)
                };
            };
            break;
        case "polar":
            distort = function(P, F) {
                var a = {
                    x: P.x - F.x,
                    y: P.y - F.y
                }
                var r = Math.sqrt(a.x * a.x + a.y * a.y);
                var phi = Math.atan2(a.y, a.x);

                // TODO points on side of square
                var rho = rayRectIntersect(F, a, graphBounds);
                var rMax = Math.sqrt((rho.x - F.x)*(rho.x - F.x) + (rho.y - F.y)*(rho.y - F.y))
                var rn = rMax * ((dFactor + 1) * r / rMax) / (dFactor * r / rMax + 1);
                return {
                    x: F.x + rn * Math.cos(phi),
                    y: F.y + rn * Math.sin(phi)
                }
            };
            break;
        case "graph":
            distort = function(P, F) {
                return {
                    x: 0,
                    y: 0
                }
            };
            break;
        default:
        console.log("Invalid method \"" + method + "\".");
        return;
    }

    graph.nodes.forEach(function(node) {
        var pos = distort(node.origin, focus);
        graph.nodes.update({id: node.id, x: pos.x, y: pos.y});
    });
}

function methodSwitch(id) {
    method = id;
    fisheye();
}

function setFocus() {
    focus = {
        x: Number(document.getElementById("focusx").value),
        y: Number(document.getElementById("focusy").value)
    };
    fisheye();
}

function getBounds(nodes) {
    var xMax = nodes.max("x").x;
    var xMin = nodes.min("x").x;
    var yMax = nodes.max("y").y;
    var yMin = nodes.min("y").y;

    return {
        l: xMin,
        t: yMin,
        r: xMax,
        b: yMax,
        w: xMax - xMin,
        h: yMax - yMin
    };
}

function nodesToScreenCoords(nodes) {
    var xMax = nodes.max("x").x;
    var xMin = nodes.min("x").x;
    var yMax = nodes.max("y").y;
    var yMin = nodes.min("y").y;
    var w = xMax - xMin;
    var h = yMax - yMin;
    var ratio = w / h;

    if (w === 0 || h === 0) {
        console.log("Invalid graph dimensions: " + w + " " + h);
        return;
    }

    nodes.forEach(function(node) {
        var x = (-xMin + node.x) / w * canvasWidth;
        var y = (-yMin + node.y) / h * canvasWidth / ratio;

        if (document.getElementById("debug").checked)
            nodes.update({id: node.id, x: x, y: y, origin: {x: x, y: y, title: node.origin.title}, title: x.toString().substring(0, 3) + " " + y.toString().substring(0, 3)});
        else
            nodes.update({id: node.id, x: x, y: y, origin: {x: x, y: y, title: node.origin.title}, title: node.origin.title});
    });

    graphBounds = getBounds(nodes);
}

function createGraph(id) {
    switch (id) {
        case "airlines":
            graph = createAirlines(canvasWidth, canvasHeight);
            break;
        case "regular":
            graph = createRegular(canvasWidth, canvasHeight, 10);
            break;
        default:
            console.log("Invalid id \"" + id + "\", graph not created.");
            return;
    }
    nodesToScreenCoords(graph.nodes);
    var network = new vis.Network(container, graph, options);
}

function switchData(id) {
    if (dataSrc === id)
        return;

    document.getElementById("distortion").value = 0;
    dataSrc = id;
    createGraph(id);
}

var changeChosenNode =
    function (values, id, selected, hovering) {
        values.color = "#fffafa";
        values.borderColor = "#8b0000";
        values.size = 12;
        values.borderWidth = 3;
    }

var changeChosenEdge =
    function (values, id, selected, hovering) {
        values.color = "#8b0000";
        values.opacity = 1.0;
        values.width = 3;
    }

var dataSrc = "regular";
document.getElementById(dataSrc).checked = true;
var method = "cartesian"
document.getElementById(method).checked = true;
document.getElementById("distortion").value = 0;
var graph;
const canvasWidth = document.getElementById('visualization').getBoundingClientRect().width;
const canvasHeight = document.getElementById('visualization').getBoundingClientRect().height;
var graphBounds = {
    l: 0, t: 0, r: 0, b: 0, w: 0, h: 0
};
var focus = {
    x: 0.5 * canvasWidth,
    y: 0.5 * canvasHeight
};
document.getElementById("focusx").value = focus.x;
document.getElementById("focusy").value = focus.y;
const container = document.getElementById('visualization');
const options = {
    width: canvasWidth + 'px',
    height: canvasHeight + 'px',
    autoResize: false,
    clickToUse: true,
    nodes: {
        shape: 'dot',
        fixed: {
            x: true,
            y: true
        },
        size: 6,
        borderWidth: 1
    },
    edges: {
        color: {
            opacity: 0.1
        },
        smooth: {
            enabled: true,
            type: "continuous",
            roundness: 0.5
        },
        width: 1
    },
    interaction: {
        multiselect: true,
        dragNodes: false,
        zoomView: true,
        dragView: false
    }
};

createGraph(dataSrc);
