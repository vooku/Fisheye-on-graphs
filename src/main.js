function mouseCallback(event) {
    var delta = 5;
    var dir = event.altKey ? -1 : 1;

    if (typeof graph !== 'undefined') {
        var y = graph.nodes.get(126).y + dir * delta;
        graph.nodes.update({id: 126, y: y});
    }
}

var dataSrc = "airlines";
document.getElementById(dataSrc).checked = true;

const canvasWidth = document.getElementById('visualization').getBoundingClientRect().width;
const canvasHeight = document.getElementById('visualization').getBoundingClientRect().height;
const container = document.getElementById('visualization');
const options = {
    width: canvasWidth + 'px',
    height: canvasHeight + 'px',
    autoResize: true,
    clickToUse: true,
    nodes: {
        shape: 'circle',
        fixed: {
            x: true,
            y: true
        },

    },
    interaction: {
        //multiselect: true
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
