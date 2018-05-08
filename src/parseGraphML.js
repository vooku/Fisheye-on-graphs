        var graphml = require('graphml-js');
        var fs = require('fs');
         
        var graphmlText = fs.readFileSync('../airlines.graphml');
        var parser = new graphml.GraphMLParser();
         
        parser.parse(graphmlText, function(err, graph) {
            fs.writeFile("airlines.json", JSON.stringify(graph), function(err) {
                if(err) {
                    return console.log(err);
                }

                console.log("The file was saved!");
            }); 
        })