/**
* nodeEdgeChart
*
*/

define(["model","algCluster"], function (Model,AlgCluster) {
  return function NodeEdge (idDiv) {

    var _thisNodeEdge = this,
	    _nodeEdgePanel = null,  // Representa o panel associado aao grafico

	    _grpNodeEdge = null,    // Grupo que representa todo o grafico
		_forceLayout = null,
		
		_indexAttSize = 0,      // Apenas para categorico
		
		_nodes = null,
		_edges = null,
		
		_rClusterScale = d3.scale.linear().range([3,40]),
		_linkWidthScale = d3.scale.linear().range([1, 7]),
		_linkDistanceScale = d3.scale.linear(),
		_chargeScale = d3.scale.linear().range([50,800]),		
		_rNormalNode = 3,  // Raio do nodo normal
		
		_colors = {
			nodoNormal : "blue",
			edgeNormal : "gray"
		},

		_configDefault = {
			charge: 100,
            linkDistance:25,  // 30
			fNodoClusterDefault: function (d) { return ""}
		},
		
		_tooltips = {
			divTT: null, // Div onde o toolTip será inserido
			normalNode: null,   // Objeto que gerencia o tooltip para nodo normal
			clusterNode: null,   // Objeto que gerencia o tooltip para nodo do tipo Cluster
			normalEdge : null,
			clusterEdge : null
		},
/*		
		_contextMenu = {            // Retirei daqui para passar para o dashboard
			showing: false,
			itens: null
		},
*/		
		_configLayout = {
			charge: _configDefault.charge,
			fCharge : function (d) { return  - ( _chargeScale(d.qtNodes) + _configLayout.charge); 
								   },
			linkDistance: _configDefault.linkDistance,
			gravity: 0            // Calculado
		},
		
		_graphElem = {   // Elementos do DOM
		  nodes: null,
		  edges: null
		},
		
		_graphData = null;   // Estrutura exibida
		
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
			

		_tooltips.divTT = d3.select("#"+idDiv).append("div")
										.style("display","none")
										.classed("NE-Tooltip",true);  // Tooltip para o nodo normal
		
		_grpNodeEdge = _grpChart.append("g").attr("class","NodeEdgeChart");

		
//		d3.select(".DS-viewArea").on("contextmenu", _onContextMenu);   // Retirei daqui para passar para o dashboard

		_forceLayout = d3.layout.force()
			.on("tick", function() {
				_graphElem.edges.attr("x1", function(d) { return d.source.x; })
					.attr("y1", function(d) { return d.source.y; })
					.attr("x2", function(d) { return d.target.x; })
					.attr("y2", function(d) { return d.target.y; });
 
				_graphElem.nodes.attr("cx", function(d) { return d.x; })
					.attr("cy", function(d) { return d.y; });
					
				if (_forceLayout.alpha() < 0.03)
					_forceLayout.stop();
//				console.log(_forceLayout.alpha());
				})
			.on("end", function() { 
		
//			console.log(_forceLayout.size());
//			console.log(_forceLayout.alpha());
			
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

		dataLength = data.nodes.dataNodes.length;
		
		_configLayout.gravity = 375/ ((Math.PI * widthChart*widthChart/4)/dataLength);
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
		if (_graphElem.nodes != null) {
		  _graphElem.nodes.remove();
		}
		if (_graphData.nodes[0].cluster) {
		_graphElem.nodes = _grpNodeEdge.selectAll(".NE-node")
//			.data(model.data.nodes.dataNodes)
			.data(_graphData.nodes)
			.enter()
				.append("circle")
				.attr("class", "NE-node")
//				.attr("r", function (d) { return _rClusterScale(1)} )
				.attr("r", function (d) { return _rClusterScale(d.qtNodes)} )
				.style("fill", _colors.nodoNormal)				
//				.style("fill", function (d) { return (d.cluster )? corScale(d.id) : _colors.nodoNormal; })				
//				.style("fill", function (d) { if (d.id==2) return "red"; else if (d.id==1) return "yellow"; else return corScale(d.cluster)})
				.on("mouseover", _onMouseOverNode)
				.on("mouseout", _onMouseOutNode);
		} else {
		_graphElem.nodes = _grpNodeEdge.selectAll(".NE-node")
//			.data(model.data.nodes.dataNodes)
			.data(_graphData.nodes)
			.enter()
				.append("circle")
				.attr("class", "NE-node")
//				.attr("r", function (d) { return _rClusterScale(1)} )
				.attr("r", function (d) { return _rClusterScale(d.values[_indexAttrSize]/*qtNodes*/)} )
				.style("fill", _colors.nodoNormal)				
//				.style("fill", function (d) { return (d.cluster )? corScale(d.id) : _colors.nodoNormal; })				
//				.style("fill", function (d) { if (d.id==2) return "red"; else if (d.id==1) return "yellow"; else return corScale(d.cluster)})
				.on("mouseover", _onMouseOverNode)
				.on("mouseout", _onMouseOutNode);		
		}
	}

    function _appendEdges() {
		if (_graphElem.edges != null)
		  _graphElem.edges.remove();
		  
		_graphElem.edges = _grpNodeEdge.selectAll(".NE-edge")
			.data(_graphData.edges)			
			.enter()
				.append("line")
				.attr("class", "NE-edge")
				.style("stroke-width", function (d) { return _linkWidthScale(d.qt);} )
				.on("mouseover", _onMouseOverEdge)
				.on("mouseout", _onMouseOutEdge);					
	}
	
/**
 * _onMouseOverNode
 */
    function _onMouseOverNode(d) {
		_graphElem.nodes.each( function(n) { n.highLight=false;} );
		d.highLight = true;

		_graphElem.edges.classed("NE-HighLight", function(edge) { 
			if (edge.source===d || edge.target===d) return edge.source.highLight=edge.target.highLight=true;
			else return false;				   
		});
	   
		_graphElem.nodes.classed("NE-HighLight", function(node) { return node.highLight; });

		if (d.cluster) {
			if (_tooltips.clusterNode !=null)
				_tooltips.clusterNode.create( _tooltips.divTT, d);					
		} else {
			if (_tooltips.normalNode !=null)
				_tooltips.normalNode.create( _tooltips.divTT, d);
		
		}
	}

/**
 * _onMouseOutNode
 */
    function _onMouseOutNode(d) {
		_graphElem.nodes.classed("NE-HighLight", false);
		_graphElem.edges.classed("NE-HighLight", false);

		if (d.cluster) {
			if (_tooltips.clusterNode !=null)
				_tooltips.clusterNode.remove();		
		} else {
			if (_tooltips.normalNode !=null)	   
				_tooltips.normalNode.remove();		
		}
	}

/**
 * _onMouseOverEdge
 */
    function _onMouseOverEdge(d) {
	   _graphElem.nodes.each( function(n) { n.highLight=false;} );
	   
		d.highLight = true;
		d.source.highLight = true;
		d.target.highLight = true;	   

		d3.select(this).classed("NE-HighLight",true);
		_graphElem.nodes.classed("NE-HighLight", function(node) { return node.highLight; });
		
		if (d.source.cluster && d.target.cluster) {
			if (_tooltips.clusterEdge !=null)
				_tooltips.clusterEdge.create( _tooltips.divTT,d);		
		} else {
			if (_tooltips.normalEdge !=null)
				_tooltips.normalEdge.create( _tooltips.divTT,d);
		}
	    
	}

/**
 * _onMouseOutEdge
 */
    function _onMouseOutEdge(d) {
		d.highLight = false;
		d.source.highLight = false;
		d.target.highLight = false;
		
		d3.select(this).classed("NE-HighLight",false);	   
	   _graphElem.nodes.classed("NE-HighLight", false);
		if (d.source.cluster && d.target.cluster) {
			if (_tooltips.clusterEdge !=null)
				_tooltips.clusterEdge.remove();		
		} else {	   
			if (_tooltips.normalEdge !=null)
				_tooltips.normalEdge.remove();
		}
	}
	
	function _adjustGraph( data) {
	var result = {
			nodes : null,
			edges : null	  
	  };
		
		result.nodes = data.nodes.dataNodes.filter( function (d) { return d.visible});
		result.nodes.forEach ( function (d,i) {
			d.newIndex = i;
		});
		result.edges = data.edges.dataEdges.filter( function (d) { return d.visible});
		result.edges.forEach( function (d) {
			d.source = data.nodes.dataNodes[d.src].newIndex;
			d.target = data.nodes.dataNodes[d.tgt].newIndex;			
		});
		return result;
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
	chart.setTTNormalNode = function(_) {
	  _tooltips.normalNode = _;
 
	  return chart;
	}

 	//---------------------	 
	chart.setTTClusterNode = function(_) {
	  _tooltips.clusterNode = _;
 
	  return chart;
	}

	 	//---------------------	 
	chart.setTTNormalEdge = function(_) {
	  _tooltips.normalEdge = _;
 
	  return chart;
	}

 	//---------------------	 
	chart.setTTClusterEdge = function(_) {
	  _tooltips.clusterEdge = _;
 
	  return chart;
	}

 	//---------------------	 
  	chart.data = function(_) {

	  var qtLabel=0, qtValue=0, maxQtNodes, maxLinkDistance, maxQtEdges, vNodesTemp;
	  if (!arguments.length)
	     return model.data;
	  model.data = _;
	  
	  if (model.data.isCluster===undefined) {
	    vNodesTemp = d3.range(model.data.nodes.dataNodes.length).map (function(d,i) { return 0;});
	    model.data.isCluster = false;
		model.data.nodes.qtNodes = model.data.nodes.dataNodes.length;
		model.data.nodes.dataNodes.forEach( function (d) {
				d.idCluster = -1;
				d.qtNodes = 1;
				d.visible = true;
				d.cluster = false;
				d.grau = 0;
//				if (d.id == 2) //---------- So para testar. Depois retirar
//				   d.visible = false;
				});
		model.data.edges.qtEdges = model.data.edges.dataEdges.length;
		model.data.edges.dataEdges.forEach( function (d) {
				vNodesTemp[d.src]++;
				vNodesTemp[d.tgt]++;
				d.qt = 1;
				d.source = d.src;
				d.target = d.tgt;
				d.visible = true;
				});
		model.data.nodes.dataNodes.forEach( function (d,i) { d.grau = vNodesTemp[i];}); 							
	  }
	  
	  model.data.nodes.dataNodes.forEach( function (d,i) { d.highLight=false;}); 
  
	  _graphData = _adjustGraph(model.data);

//	  console.log(_graphData);
//	  console.log(model.data.nodes.dataNodes);

	  _rClusterScale.domain([1, model.data.nodes.qtNodes]);	
	  
	  maxQtNodes = d3.max( _graphData.nodes, function(d) {return d.qtNodes} );
	  _chargeScale.domain([1, maxQtNodes]);
	  maxLinkDistance = Math.round(_rClusterScale(maxQtNodes));
//	  console.log("maxLinkDistance: " + maxLinkDistance);
	  

	  _linkDistanceScale.range([3, maxLinkDistance]).domain([1, maxQtNodes]); 

	  maxQtEdges = d3.max( _graphData.edges, function(d) {return d.qt} );	  
	  _linkWidthScale.domain([1,maxQtEdges]);
	  
//	  console.log("qtNodes: " + _.nodes.qtNodes);
//	  console.log("max: " + maxQtNodes);
//	  console.log( _rClusterScale(maxQtNodes));
	  
	  _forceLayout
//	    .linkDistance( _configLayout.linkDistance)
		.charge( function(d) {  return  -( _chargeScale(d.qtNodes) + _configLayout.charge);})		

	  .linkDistance( function (d) { 
			return _configLayout.linkDistance + _linkDistanceScale(d.source.qtNodes) + _linkDistanceScale(d.target.qtNodes);
			})	
    	.nodes(_graphData.nodes)		
    	.links(_graphData.edges);
//    	.nodes(_.nodes.dataNodes)		
//    	.links(_.edges.dataEdges);		
//	  _nodeEdgePanel.atualizaAutocomplete();
	  _appendEdges();		
	  _appendNodes();
	  
	  
	  return chart;
	}

	//---------------------	 
	chart.getGravity = function() {
	  return _configLayout.gravity;
	}

	//---------------------	 
	chart.getCharge = function() {
	  return _configLayout.charge;
	}

	//---------------------	 
	chart.getLinkDistance = function() {
	  return _configLayout.linkDistance;
	}	
	//---------------------	 
	chart.getQtNodes = function() {
	  return _graphData.nodes.length;
//	  return model.data.nodes.qtNodes;
	}

	//---------------------	 
	chart.getQtEdges = function() {
	  return _graphData.edges.length;	
//	  return model.data.edges.qtEdges;
	}

	//---------------------	 
	chart.setItensContextMenu = function(itens) {
	  _contextMenu.itens = itens;
	}

	//---------------------
    // Altera o atributo que vai ser usado para mapear o tamanho	
	chart.indexAttrSize = function(_) {
	  if (!arguments.length)
	     return _indexAttrSize + 1000;	 
	  _indexAttrSize = _-1000;
 
	  return chart;
	}
	
   	//======== Funçoes de ações	 

 	//---------------------	 
    chart.acChangeGravity = function (value) {		
		_configLayout.gravity = +value;
		_forceLayout.gravity(_configLayout.gravity).start();		
    }
	//---------------------
   chart.acChangeCharge = function (value) {		
		_configLayout.charge = +value;
		_forceLayout.charge( function (d) {  return  - ( _chargeScale(d.qtNodes) + _configLayout.charge); }).start();		
    }
	//---------------------	
   chart.acChangeLinkDistance = function (value) {		
		_configLayout.linkDistance = +value;
		_forceLayout.linkDistance( function (d) {  
									return _configLayout.linkDistance + _linkDistanceScale(d.source.qtNodes) + _linkDistanceScale(d.target.qtNodes); 
								  }).start();		
    }	
	
	//---------------------	 
	chart.acChangeAttrSize = function(atributo) {
		_indexAttrSize = atributo;
		console.log(atributo+1000);
		_appendEdges();		
		_appendNodes();			
		model.redraw +=1 ;		
	}

	//---------------------	 
	chart.acSelectByName = function(nome) {

		_graphElem.nodes.each (function (d) {

			d.highSearch = false;
			d.highSearch = (d.labels[1] == nome);

		});
		_graphElem.nodes.classed ("NE-HighSearch", function (d) { return d.highSearch });
	}

	//---------------------	 
	chart.acSelectByNameCluster = function(nomeCluster) {
		_graphElem.nodes.each (function (d) {

			d.highSearch = false;			
			d.highSearch = (d.key == nomeCluster);

		});
		_graphElem.nodes.classed ("NE-HighSearch", function (d) { return d.highSearch });
	}	
 	//---------------------	
/*	
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
				
			_forceLayout			
				.linkDistance(200)
				.nodes(_dataCluster.dataNodes)
				.links(_dataCluster.dataEdges);	

			_appendEdgesCluster();		
			_appendNodesCluster();				
			
//			_dataCluster.dataEdges.forEach( function (d,i){ console.log(i+":"+ "qt: " + d.qt+" "+d.source.cluster + "-->" + d.target.cluster)} );
			console.log(_dataCluster);
	
//		    _fDrawCluster = true;
			model.redraw += 1;
		  }
	
    }

*/	
    return chart; 
  };
  
	
});