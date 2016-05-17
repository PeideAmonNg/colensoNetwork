
    var settings={
        maxNodeSize: 20,
        minNodeSize: 1,
        minEdgeSize: 0.5,
        maxEdgeSize: 10,
        borderSize: 5,
        defaultNodeBorderColor: "#a8a4a2",
        defaultNodeColor: "#5FBA7D",
        nodeHoverColor: "default",
        defaultNodeHoverColor: "#222222",
        hideEdgesOnMove: true

    };

    //Config variables
    var neo4j={ url: 'http://localhost:7474', user: 'neo4j', password: 'p' };
    var endpoint = '/db/data/transaction/commit', data, cypherCallback;
    var cypher="match((n:Person)-[r:SENDS_TO]->(rec:Person)) WHERE n.name={person} return n, rec, count(r) as count LIMIT 40";    
    // var sig ={ container: 'graph-container', settings: settings};
    var sig = {
        renderers: [
            {
                container: document.getElementById('graph-container'),
                type: 'canvas', // sigma.renderers.canvas works as well
            }
        ], settings: settings
    };

    var data = JSON.stringify({
            "statements": [
                {
                    "statement": cypher,
                    "parameters": {
                        "person": "William Colenso"
                    },
                    "resultDataContents": ["row", "graph"],
                    "includeStats": false
                }
            ]
        });



    callback=function(response){
        // console.log(response);

        //Modify this function, adding edges and thickness.
        var graph=parse(response);

        //Then do the following to render graph:
        sig = new sigma(sig);
        sig.graph.read(graph);
        sig.refresh();
    }

    sigma.neo4j.send(neo4j, endpoint, 'POST', data, callback);

//This function parse a neo4j cypher query result, and transform it into a sigma graph object.
    parse=function(result) {
        var graph = { nodes: [], edges: [] },
            nodesMap = {},
            edgesMap = {},
            key;

        var maxFreq=0;
        result.results[0].data.forEach(function (data){
            if(data.row[2]>maxFreq){
                maxFreq=data.row[2];
                console.log("freq: "+maxFreq);
                console.log("rec: "+data.graph.nodes[1].properties["name"]);
            }
        });

        console.log("maxFreq: "+maxFreq);

        var edgeId=0;

        // Iteration on all result data
        result.results[0].data.forEach(function (data, index, arr) {

            if(data.graph.nodes[1]==null){
                return;
            }

            var node=data.graph.nodes[0];

            var node1 =  {
                id : node.id,
                label : node.properties["name"].substr(node.properties["name"].length-5, 5),
                x : getX(),
                y : getY(),
                size : 1,      
                neo4j_labels : node.labels,
                neo4j_data : node.properties
            };



            if (node1.id in nodesMap) {
                // do nothing
            } else {
                nodesMap[node1.id] = node1;
            }
            
            // console.log("index: "+index);
            node=data.graph.nodes[1];

            var node2 =  {
                id : node.id,
                label : node.properties["name"].substr(node.properties["name"].length-5, 5),
                x : getX(),
                y : getY(),
                size : 1,      
                neo4j_labels : node.labels,
                neo4j_data : node.properties
            };

            if (node2.id in nodesMap) {
                // do nothing
            } else {
                nodesMap[node2.id] = node2;
            }


            var sigmaEdge =  {
                id : edgeId,
                label : "frequency: "+data.row[2],
                source : node1.id,
                target : node2.id,
                size : data.row[2]/maxFreq,
                color: getEdgeColor(data.row[2])
                // neo4j_type : edge.type,
                // neo4j_data : edge.properties
            };

            edgeId++;

            if (sigmaEdge.id in edgesMap) {
                // do nothing
            } else {
                edgesMap[sigmaEdge.id] = sigmaEdge;
            }

        });

        console.log(edgesMap);

        // construct sigma nodes
        for (key in nodesMap) {
            graph.nodes.push(nodesMap[key]);
        }
        // construct sigma nodes
        for (key in edgesMap) {
            graph.edges.push(edgesMap[key]);
        }

        return graph;
    };

    getX=function(){
        return Math.random();
    }

    getY=function(){
        return Math.random();
    }

    getEdgeColor=function(freq){
        return "#ff756e";
    }
