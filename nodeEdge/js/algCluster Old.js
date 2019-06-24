/**
* algCluster
*
*/

define([], function () {

  return function AlgCluster () {
 
	
   

//--------------------------------- Funcoes publicas	  
	
    function alg() {}

 	//---------------------
    // Saída: [ {key:"xxx", values: [ obj1,obj2,... ]}, {}]
	// Na entrada a lista de arestas deve fazer referencia direta ao nodos 
    //	
	alg.byAttribute = function(data, attr) {
	  var i, achei=false;
	  var result = {
		dataNodes : null,
		dataEdges : []	  
	  };
	  
	  if (attr>=1000) {
	    attr -= 1000;
		result.dataNodes = d3.nest().key( function (d) { return d.values[attr]}).entries(data.nodes.dataNodes);
      } else {
		result.dataNodes = d3.nest().key( function (d) { return d.labels[attr]}).entries(data.nodes.dataNodes);	  
	  }
	  
	  result.dataNodes.forEach(
	    function(d,i) {
		  d.id = i;
		  d.qtNodes = d.values.length;
		  d.qtEdges = 0;
		  d.values.forEach(
		    function(d) {
				d.cluster = i;
			}
		  );
		}
	  );
	  
	  data.edges.dataEdges.forEach(
	    function (d,i) {
		  if ( d.source.cluster != d.target.cluster) {
		     achei = false;
		     for (i=0; i<result.dataEdges.length; i++) {
			   if (result.dataEdges[i].source.cluster == d.source.cluster && result.dataEdges[i].target.cluster == d.target.cluster ||
					result.dataEdges[i].source.cluster == d.target.cluster && result.dataEdges[i].target.cluster == d.source.cluster) {
				 result.dataEdges[i].qt++;
				 achei = true;
                 }				 
			 }

			 if (!achei) {
			   d.qt=1;
			   result.dataEdges.push(d);
			 }
		  } else {
		    result.dataNodes[d.source.cluster].qtEdges++;
		  }
		}	  
	  );
	  
	  result.dataEdges.forEach(
	    function (d) {
			d.source = d.source.cluster;
			d.target = d.target.cluster;
		}
	  );
 
	  return result;
	}


	
   	//======== 	
  	return alg; 
  };


})