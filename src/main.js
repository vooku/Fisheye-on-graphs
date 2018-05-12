var nnodes = 200;
var nedges = 1000;

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
            label: node["_attributes"]["tooltip"].substring(0, 3),
            chosen: {
                node: changeChosenNode
            }
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
            to: edge["_target"],
            chosen: {
                edge: changeChosenEdge
            }
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
        shape: 'dot',
        fixed: {
            x: true,
            y: true
        },
        size: 6,
        borderWidth: 2

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

var network = new vis.Network(container, graph, options);
