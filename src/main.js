var nnodes = 200;
var nedges = 1000;

function parseNodes(data, options, maxx, maxy) {
    var nodes = new vis.DataSet(options);

    for (i in data["nodes"]) {
        var node = data["nodes"][i];
        var item = {
            id: node["_id"],
            x: node["_attributes"]["x"],
            y: node["_attributes"]["y"],
            label: node["_attributes"]["tooltip"].substring(0,3)
        };

        nodes.add(item);
    }

    return nodes;
}

function parseEdges(data, options) {
    var edges = new vis.DataSet(options);

    for (i in data["edges"]) {
        var edge = data["edges"][i];
        var item = {
            id: edge["_id"],
            from: edge["_source"],
            to: edge["_target"]
        };

        edges.add(item);
    }

    return edges;
}

var width = document.getElementById('visualization').getBoundingClientRect().width;
var height = document.getElementById('visualization').getBoundingClientRect().height;
console.log(width + ", " + height);
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

    },
    interaction: {
        //multiselect: true
        dragNodes: false,
        zoomView: true,
        dragView: false
    }

};

var network = new vis.Network(container, graph, options);
