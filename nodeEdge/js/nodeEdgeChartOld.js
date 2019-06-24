/**
* nodeEdgeChart
*
*/

define(["model","algCluster"], function (Model,AlgCluster) {
  return function NodeEdge (idDiv) {

    var _nodeEdgePanel = null,  // Representa o panel associado aao grafico

	    _grpNodeEdge = null,    // Grupo que representa todo o grafico
		_forceLayout = null,
		
		_nodes = null,
		_edges = null,
		
		_fDrawCluster = false,
		_dataCluster = null,
		
		_rClusterScale = d3.scale.linear().range([3,40]),
		
		_colors = {
	   
		},

		_configDefault = {
			charge:-100,
			linkDistance: 30		
		},
		
		_configLayout = {
			charge: _configDefault.charge,
			linkDistance: _configDefault.linkDistance,
			gravity: 0            // Calculado
		},

		_configLayoutCluster = {
			charge: _configDefault.charge,
			linkDistance: 0,      // Calculado
			gravity: 0            // Calculado
		},		
		
		_graphElem = {
		  nodes: null,
		  edges: null
		};
		
// ---------------- Modelo 
    var model = Model(),
	    algCluster =  AlgCluster();

// ---------------- Atributos geométricos do grafico	
        model.margin = {top: 2, right: 2, bottom: 2, left: 2};
        model.box = { width:150, height:150};
		
        model.redraw = 0;        // Quando alterado executa um redesenho	
		
// ---------------- Acoes de inicializacao
	
    var _svg = d3.select("#"+idDiv).append("svg"),  // Cria o svg sem dimensoes	
	    _grpChart = _svg.append("g");               // Grupo que representa a área para o gráfico
			
 		_grpNodeEdge = _grpChart.append("g").attr("class","NodeEdgeChart");

		_forceLayout = d3.layout.force()
			.charge(_configLayout.charge)
//			.chargeDistance(300)
			.linkDistance(_configLayout.linkDistance)
			.on("tick", function() {
				_graphElem.edges.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
 
				_graphElem.nodes.attr("cx", function(d) {  return d.x; })
					.attr("cy", function(d) { return d.y; });
					
				if (_forceLayout.alpha() < 0.03)
					_forceLayout.stop();
//				console.log(_forceLayout.alpha());
				})
			.on("end", function() { 
		
			console.log(_forceLayout.size());
			console.log(_forceLayout.alpha());
			
			});
//===================================================
	
    model.when("box", function (box) { 
      _svg.attr("width", box.width).attr("height", box.height);
    });	
	
  //---------------------	
	model.when("margin", function (margin) {
      _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    });
	
  //---------------------		
    model.when(["box", "margin"], function (box, margin) {
      model.widthChart = box.width - margin.left - margin.right,
      model.heightChart = box.height - margin.top - margin.bottom; 
	  _forceLayout.size( [model.widthChart,model.heightChart] );
    });

  //--------------------- 
    model.when(["data","widthChart","heightChart","redraw"], function (data,widthChart,heightChart, redraw ) {
		var dataLength;

		if (_fDrawCluster) {
			dataLength = _dataCluster.dataNodes.length;		
		} else {
			dataLength = data.nodes.dataNodes.length;
		}
		_configLayout.gravity = 275/ ((Math.PI * widthChart*widthChart/4)/dataLength);
		if (_configLayout.gravity < 0.05)
		   _configLayout.gravity = 0.05;
		   
		if (_configLayout.gravity < 0.1)
			_configLayout.gravity = Math.round(_configLayout.gravity*100)/100;		
		else
			_configLayout.gravity = Math.round(_configLayout.gravity*10)/10;

		_nodeEdgePanel.update();  // Atualiza informações no painel associado a técnica
		_forceLayout.gravity(_configLayout.gravity).start();   
    });	 
	
//--------------------------------- Funcoes privadas
	
    function _appendNodes() {
	    var corScale = d3.scale.category20();
		if (_graphElem.nodes != null)
		  _graphElem.nodes.remove();
		  
		_graphElem.nodes = _grpNodeEdge.selectAll(".node")
			.data(model.data.nodes.dataNodes)
			.enter()
				.append("circle")
				.attr("class", "node")
				.attr("r", 3)
				.style("fill", function (d) {return corScale(d.cluster)})
				.attr("title", function (d) {return d.values[1]});
	}

    function _appendEdges() {
		if (_graphElem.edges != null)
		  _graphElem.edges.remove();
		  
		_graphElem.edges = _grpNodeEdge.selectAll(".edge")
			.data(model.data.edges.dataEdges)
			.enter()
				.append("line")
				.attr("class", "edge")
				.style("stroke", "black");			
	}

    function _appendNodesCluster() {
	    var corScale = d3.scale.category20();	
		if (_graphElem.nodes != null)
		  _graphElem.nodes.remove();
		  
		_graphElem.nodes = _grpNodeEdge.selectAll(".node")
			.data(_dataCluster.dataNodes)
			.enter()
				.append("circle")
				.attr("class", "node")
				.attr("r", function (d) { return _rClusterScale(d.qtNodes)} )
				.style("fill", function (d) {return corScale(d.id)})				
				.attr("title", function (d) {return d.qtNodes});
	}

    function _appendEdgesCluster() {
		if (_graphElem.edges != null)
		  _graphElem.edges.remove();
		  
		_graphElem.edges = _grpNodeEdge.selectAll(".edge")
			.data(_dataCluster.dataEdges)
			.enter()
				.append("line")
				.attr("class", "edge")
				.style("stroke", "black");			
	}	
//--------------------------------- Funcoes publicas	  
	
    function chart() {}
	
 	//---------------------	 
	chart.box = function(_) {
	  if (!arguments.length)
	     return model.box;	 
	  model.box = _;
 
	  return chart;
	}
	
	//---------------------
    // Essa função é necessário em todas as técnicas
    // É chamada internamente na conectChart	
	chart.panel = function(_) {
	  if (!arguments.length)
	     return _nodeEdgePanel;	 
	  _nodeEdgePanel = _;
 
	  return chart;
	}	

 	//---------------------	 
  	chart.data = function(_) {

	  var qtLabel=0, qtValue=0;
	  if (!arguments.length)
	     return model.data;
	  model.data = _;
	  _forceLayout
    	.nodes(_.nodes.dataNodes)
    	.links(_.edges.dataEdges);
	  _appendEdges();		
	  _appendNodes();		
	  _fDrawCluster = false;
	  
	  return chart;
	}

	//---------------------	 
	chart.getGravity = function() {
	  return _configLayout.gravity;
	}

	//---------------------	 
	chart.getQtNodes = function() {
	  return model.data.nodes.dataNodes.length;
	}

	//---------------------	 
	chart.getQtEdges = function() {
	  return model.data.edges.dataEdges.length;
	}		
   	//======== Funçoes de ações	 

 	//---------------------	 
    chart.acChangeGravity = function (value) {		
		_configLayout.gravity = value;
		_forceLayout.gravity(_configLayout.gravity).start();		
    }

 	//---------------------	 
    chart.acClusterExec = function (value) {
		var maxQtNodes;
		
		if (value == 0) {
		} else 
		  if (value == 1) {
			_dataCluster = algCluster.byAttribute(model.data,1001);
			maxQtNodes = d3.max( _dataCluster.dataNodes, function(d) {return d.qtNodes} );
			_rClusterScale.domain([1, maxQtNodes]);
			
			if ( _rClusterScale(maxQtNodes) < _configDefault.linkDistance)
				_configLayoutCluster.linkDistance =	_configDefault.linkDistance;
			else	
				_configLayoutCluster.linkDistance = _rClusterScale(maxQtNodes) * 2;
				
			_forceLayout			
				.linkDistance(200)
				.nodes(_dataCluster.dataNodes)
				.links(_dataCluster.dataEdges);	
			_appendEdgesCluster();		
			_appendNodesCluster();				
			
//			_dataCluster.dataEdges.forEach( function (d,i){ console.log(i+":"+ "qt: " + d.qt+" "+d.source.cluster + "-->" + d.target.cluster)} );
			console.log(_dataCluster);
	
		    _fDrawCluster = true;
			model.redraw += 1;
		  }
	
    }	
    return chart; 
  };
  
	
});