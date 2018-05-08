 $.getJSON( "data/airlines.json", {}, function( data ) {
    var lines = [];
    lines.push("<ul>");
    for (i in data) {
        lines.push( "<li>" + i + ": <ul>" );
        for (j in data[i]) {
            lines.push( "<li>" + "id: " + data[i][j]["_id"] + ": <ul>" );
            if (i == "nodes") {
                for (k in data[i][j]["_attributes"]) {
                    lines.push("<li>" + k + ": " + data[i][j]["_attributes"][k] + "</li>");
                }
            }
            else {
                for (k in data[i][j]) {
                    lines.push("<li>" + k + ": " + data[i][j][k] + "</li>");
                }    
            }
            lines.push("</ul></li>");
        }
        lines.push("</ul></li>");
    }
    lines.push("</ul>");
    document.getElementById("visualization").innerHTML = lines.join("");
});

// var container = document.getElementById('visualization');
// var items = [
//     {x: '2014-06-11', y: 10},
//     {x: '2014-06-12', y: 25},
//     {x: '2014-06-13', y: 30},
//     {x: '2014-06-14', y: 10},
//     {x: '2014-06-15', y: 15},
//     {x: '2014-06-16', y: 30}
// ];
// var dataset = new vis.DataSet(items);
// var options = {
//     start: '2014-06-10',
//     end: '2014-06-18'
// };
// var graph2d = new vis.Graph2d(container, dataset, options);


