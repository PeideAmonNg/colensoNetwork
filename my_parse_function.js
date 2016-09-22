//This function parse a neo4j cypher query result, and transform it into a sigma graph object.
parse=function(result) {
    var graph = { nodes: [], edges: [] },
        nodesMap = {},
        edgesMap = {},
        key;

    console.log("prinintg result");
    console.log(result);

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

    var max_degree = 0;

    //Find max_degree
    result.results[1].data.forEach(function (data, i, a) {
        if(data.row[2] > max_degree){
            max_degree = data.row[2];
        }
    });


    var startTime = Date.now()
    // Iteration on all result data
    result.results[0].data.forEach(function (data, i, a) {

        if(data.graph.nodes[1]==null || data.graph.nodes[0]==null){
            return;
        }

        //var node=data.graph.nodes[0];
        var node=data.row[0];
        
        var degreeArray=result.results[1].data;
        var node1size;
        var node2size;
        
        degreeArray.forEach(function(d, index, b){
            if(data.row[4]==d.row[0]){
                node1size=d.row[2];
            }else if(data.row[5]==d.row[0]){
                node2size=d.row[2];
            }

            if(d.row[2] > max_degree){
                max_degree = d.row[2];
            }
        });

        if (data.row[4] in nodesMap) { //node1.id in nodesMap
            // do nothing
        } else {
            var scaled_size = 1 + 1023*node1size/max_degree;
            var node1 =  {
                id : data.row[4],
                label : data.row[0].name,
                x : Math.cos(Math.PI * 2 * i / a.length),
                y : Math.sin(Math.PI * 2 * i / a.length),
                //size : Math.random()*5,
                // size: node1size,
                size : Math.log2(scaled_size),
                color: "blue",
                neo4j_labels : node.labels,
                neo4j_data : node.properties
            };
            nodesMap[node1.id] = node1;
        }
        
        if(data.row[5] in nodesMap){ //node2.id  in nodesMap
            // do nothing
        }else{
            var scaled_size = 1 + 256*node2size/max_degree;
            node2 =  {
                id : data.row[5],
                label : data.row[1].name,
                x : getX(),
                y : getY(),
                size: Math.log2(scaled_size),
                color : "blue",
                neo4j_labels : node.labels,
                neo4j_data : node.properties
            };
            nodesMap[node2.id] = node2;
        }   

        console.log("freq: "+data.row[2]);
        if(data.row[2] == null || data.row[2] == " " || data.row[2] == ""){
            alert("null alert");
        }
        
        
        var sigmaEdge = {
            id : edgeId,
            label : "freq: "+data.row[2]+", avg words: "+Math.round(data.row[3]),
            source : data.row[4], //node1.id
            target : data.row[5], //node2.id
            size : data.row[2]/maxFreq,
            weight : data.row[2]/maxFreq,
            color: getEdgeColor(data.row[2]),
            neo4j_type : "sends_to",
            neo4j_data : "data",
            type: "arrow"
            //type: "curvedArrow"
        };

        edgeId++;

        if (sigmaEdge.id in edgesMap) {
            // do nothing
        } else {
            edgesMap[sigmaEdge.id] = sigmaEdge;
        }

    });

    console.log("assigning node importance took " + (Date.now()-startTime)/1000 + "s");    
    console.log("max_degree is " + max_degree); 
    console.log(edgesMap);
    console.log("edge count is " + result.results[0].data.length);

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