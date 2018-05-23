var graph;
var network;

function mouseCallback(event) {
    var delta = 5;
    var dir = event.altKey ? -1 : 1;

    if (typeof graph !== 'undefined') {
        var y = graph.nodes.get(126).y + dir * delta;
        graph.nodes.update({id: 126, y: y});
    }
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
        //graph.nodes.update({ id: graph.edges.get(id).from, color: 'red' });
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
            //inherit: false,
            //background: "#eeeeee",
           // border: "8b0000"
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
        nodeSelectedGBoth: {
            borderWidth: 1.5,
            color: {
                border: "black",
                background: "#eeeeee"
            }
        },
        edgeSel: {
            color: {
                background: 'red',
                border: "black"
            },
            borderWidth: 20
        }
    },
    interaction: {
        multiselect: true,
        dragNodes: false,
        zoomView: false,
        dragView: false,
        //hover: true,
    }
};

function createGraph(id) {
    
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
    network = new vis.Network(container, graph, options);
}

function switchData(id) {
    if (dataSrc === id)
        return;

    dataSrc = id;
    createGraph(id);
}

createGraph("airlines");

network.on('select', function (params) {
    //console.log(params);
    var selectedEdges = params.edges;
    var selectedNodes = params.nodes;

    if (params.edges.length <= 0) {
        window.location.reload(true);
    }

   // console.log(selectedEdges, "|", selectedNodes);

    for (let i = 0; i < selectedEdges.length; i++) {
        let a = graph.edges.get(selectedEdges[i]);
        //console.log(a.id, "|", a.from, "|", a.to);

        graph.nodes.update({ id: a.to, group: 'nodeSelectedGFrom' });
        let pom = graph.nodes.get(a.from).group;
        if (pom == undefined) graph.nodes.update({ id: a.from, group: 'nodeSelectedGTo' });

        
       
        

    }
});