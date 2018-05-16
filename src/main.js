function fisheye(focus, d) {
    if (typeof graph === 'undefined') {
        console.log("Error: Trying to deform an undefined graph");
        return;
    }
    if (d < 0) {
        console.log("Error: Distortion factor below zero.");
        return;
    }

    function G(x) {
        return ((d + 1) * x) / (d * x + 1);
    }

    function coord(P_i, F_i, limit) {
        var dMax_i = (P_i > F_i ? limit - F_i : -F_i) / limit;
        var d = (P_i - F_i) / limit;
        return G(d / dMax_i) * dMax_i * limit + F_i;
    }

    graph.nodes.forEach(function(node) {
        var x = coord(node.origin.x, focus.x, graphWidth);
        var y = coord(node.origin.y, focus.y, graphHeight);

        graph.nodes.update({id: node.id, x: x, y: y});
    });
}

function sliderCallback(value) {
    var focus = {
        x: 525,//0.5 * canvasWidth,
        y: 175//0.5 * canvasHeight
    }
    fisheye(focus, Number(value));
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

    graphWidth = nodes.max("x").x - nodes.min("x").x;
    graphHeight = nodes.max("y").y - nodes.min("y").y;
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

var graph;
const canvasWidth = document.getElementById('visualization').getBoundingClientRect().width;
const canvasHeight = document.getElementById('visualization').getBoundingClientRect().height;
var graphWidth;
var graphHeight;
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

createGraph(dataSrc);
