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
        return { x: NaN, y: NaN};
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
                };

                if (a.x === 0 && a.y === 0)
                    return P;

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
        var pos2 = distort(node.origin, focus2);
        graph.nodes.update({
            id: node.id,
            x: 0.5 * (pos.x + pos2.x),
            y: 0.5 * (pos.y + pos2.y)
        });
    });
}

function switchMethod(id) {
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
            graph = createRegular(canvasWidth, canvasHeight, 20);
            break;
        default:
            console.log("Invalid id \"" + id + "\", graph not created.");
            return;
    }
    nodesToScreenCoords(graph.nodes);
    network = new vis.Network(container, graph, options);

    network.on('select', function (params) {
        //console.log(params);
        var selectedEdges = params.edges;
        var selectedNodes = params.nodes;
        // console.log(selectedEdges, "|", selectedNodes);
        if (params.edges.length <= 0) {
            for (let i = 0; i < graph.nodes.length; i++) {
               let a = graph.nodes.get(i).group;
               if (a !== undefined) {
                   graph.nodes.update({ id: i, group: undefined, color: { background: '#D2E5FF', border: '#2B7CE9' }, borderWidth: 1 });
               }
            }
        }

        for (let i = 0; i < selectedEdges.length; i++) {
            let a = graph.edges.get(selectedEdges[i]);
            //console.log(a.id, "|", a.from, "|", a.to);
            graph.nodes.update({ id: a.to, group: 'nodeSelectedGFrom' });
            let pom = graph.nodes.get(a.from).group;
            if (pom == undefined) graph.nodes.update({ id: a.from, group: 'nodeSelectedGTo' });
        }

        var newfocus = { x: 0, y: 0 };
        for (let i = 0; i < selectedNodes.length; i++) {
            newfocus.x += graph.nodes.get(selectedNodes[i]).origin.x;
            newfocus.y += graph.nodes.get(selectedNodes[i]).origin.y;
        }

        if (newfocus.x === 0 && newfocus.y === 0) {
            focus.x = 0.5 * canvasWidth;
            focus.y = 0.5 * canvasHeight;
            document.getElementById("distortion").value = 0;
        }
        else {
            newfocus.x /= selectedNodes.length;
            newfocus.y /= selectedNodes.length;
            focus = newfocus;
        }

        fisheye();
    });
}

function switchData(id) {
    if (dataSrc === id)
        return;

    document.getElementById("distortion").value = 0;
    dataSrc = id;
    createGraph(id);
}

function changeParams(event) {
    var delta = 5;
    var dir = event.altKey ? -1 : 1;

    if (typeof graph !== 'undefined') {
        var y = graph.nodes.get(126).y + dir * delta;
        graph.nodes.update({ id: 126, y: y });


        network.on("click", function (params) {
            params.event = "[original event]";
            document.getElementById('eventSpan').innerHTML = '<h2>Click event:</h2>' + JSON.stringify(params, null, 4);
            console.log('click event, getNodeAt returns: ' + this.getNodeAt(params.pointer.DOM));
        });

    }
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
        values.width = 1.5;
    }

var dataSrc = "regular";
document.getElementById(dataSrc).checked = true;
var method = "cartesian"
document.getElementById(method).checked = true;
document.getElementById("distortion").value = 0;
var graph;
var network;
const canvasWidth = document.getElementById('visualization').getBoundingClientRect().width;
const canvasHeight = document.getElementById('visualization').getBoundingClientRect().height;
var graphBounds = {
    l: 0, t: 0, r: 0, b: 0, w: 0, h: 0
};
var focus = {
    x: 0.2 * canvasWidth,
    y: 0.2 * canvasHeight
};
var focus2 = {
    x: 0.8 * canvasWidth,
    y: 0.8 * canvasHeight
};
document.getElementById("focusx").value = focus.x;
document.getElementById("focusy").value = focus.y;
const container = document.getElementById('visualization');
const options = {
    width: canvasWidth + 'px',
    height: canvasHeight + 'px',
    autoResize: false,
    clickToUse: true,

    edges: {
        color: {
            inherit: false,
            opacity: 0.1,
            color: '#2B7CE9'
        },
        smooth: {
            enabled: true,
            type: "continuous",
            roundness: 0.5
        },
        width: 1,
        arrows: {
            to: {
                enabled: true,
                scaleFactor: 0.5
            }
        }
    },
    nodes: {
        shape: 'dot',
        fixed: {
            x: true,
            y: true
        },
        size: 6,
        borderWidth: 1,
        color: {
            background: '#D2E5FF'
        }
    },
    groups: {
        nodeSelectedGFrom: {
            size: 6,
            borderWidth: 1.5,
            color: {
               border: "#8b0000",
                background: "#eeeeee"
            }
        },
        nodeSelectedGTo: {
            size: 6,
            borderWidth: 1.5,
            color: {
                border: "green",
                background: "#eeeeee"
            }
        },
    },
    interaction: {
        multiselect: true,
        dragNodes: false,
        zoomView: false,
        dragView: false,
        //hover: true,
    }
};

createGraph(dataSrc);
