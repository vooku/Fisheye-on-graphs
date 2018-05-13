function mouseCallback(event) {
    var delta = 5;
    var dir = event.altKey ? -1 : 1;

    if (typeof graph !== 'undefined') {
        var y = graph.nodes.get(126).y + dir * delta;
        graph.nodes.update({id: 126, y: y});
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
        values.width = 3;
    }

var dataSrc = "airlines";
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
            graph = createRegular(canvasWidth, canvasHeight, 100);
            break;
        default:
            console.log("Invalid id \"" + id + "\"");
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

createGraph("airlines");
