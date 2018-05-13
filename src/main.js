function mouseCallback(event) {
    var delta = 5;
    var dir = event.altKey ? -1 : 1;

    if (typeof graph !== 'undefined') {
        var y = graph.nodes.get(126).y + dir * delta;
        graph.nodes.update({id: 126, y: y});
    }
}

function nodesToScreenCoords(nodes) {
    // generate screen coords
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

        //nodes.update({id: node.id, x: x, y: y, origin: {x: x, y: y}});
        nodes.update({id: node.id, x: x, y: y, origin: {x: x, y: y}, title: x.toString().substring(0, 3) + " " + y.toString().substring(0, 3)}); // debug only
    });
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

const canvasWidth = document.getElementById('visualization').getBoundingClientRect().width;
const canvasHeight = document.getElementById('visualization').getBoundingClientRect().height;
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
    var graph;
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
    var network = new vis.Network(container, graph, options);
}

function switchData(id) {
    if (dataSrc === id)
        return;

    dataSrc = id;
    createGraph(id);
}

createGraph(dataSrc);
