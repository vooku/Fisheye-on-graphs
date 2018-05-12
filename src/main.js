function mouseCallback(event) {
    var delta = 5;
    var dir = event.altKey ? -1 : 1;

    if (typeof graph !== 'undefined') {
        var y = graph.nodes.get(126).y + dir * delta;
        graph.nodes.update({id: 126, y: y});
    }
}

function parseNodes(data, options, canvasWidth, canvasHeight) {
    var nodes = new vis.DataSet(options);

    for (const node of data["nodes"]) {
        var x = node["_attributes"]["x"];
        var y = node["_attributes"]["y"];

        nodes.add({
            id: node["_id"],
            x: x,
            y: y,
            origin: {
                x: x,
                y: y
            },
            label: node["_attributes"]["tooltip"].substring(0,3)
        });
    }

    // generate screen coords
    var xMax = nodes.max("x").x;
    var xMin = nodes.min("x").x;
    var yMax = nodes.max("y").y;
    var yMin = nodes.min("y").y;
    var w = xMax - xMin;
    var h = yMax - yMin;
    var ratio = w / h;

    nodes.forEach(function(node) {
        var x = (-xMin + node.x) / w * canvasWidth;
        var y = (-yMin + node.y) / h * canvasWidth / ratio;

        nodes.update({id: node.id, x: x, y: y, origin: {x: x, y: y}});
    });

    return nodes;
}

function parseEdges(data, options) {
    var edges = new vis.DataSet(options);

    for (const edge of data["edges"]) {
        edges.add({
            id: edge["_id"],
            from: edge["_source"],
            to: edge["_target"]
        });
    }

    return edges;
}

var width = document.getElementById('visualization').getBoundingClientRect().width;
var height = document.getElementById('visualization').getBoundingClientRect().height;

var options = {};
var nodes = parseNodes(data, options, width, height);
var edges = parseEdges(data, options);

var container = document.getElementById('visualization');
var graph = {
  nodes: nodes,
  edges: edges
};

options = {
    width: width + 'px',
    height: height + 'px',
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

var network = new vis.Network(container, graph, options);
