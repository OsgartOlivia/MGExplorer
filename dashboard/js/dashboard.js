define( ["view"], function (View) {

  return function Dashboard (idDiv) {
  
    var _idDashboard = idDiv,     // Id da div que contém o dashboard
	    _lastIndex = 0,           // Último índice utilizado para identificar as view
	    _activeView = null,       // View que está ativa com z-index maior
	    _vIdViews = [],           // Lista de views existentes no dashboard 
        _vObjViews = [],          // Lista de objetos views
		_zIndexActive = 99,      		
		
		_treeCharts = null,       // Armazena a arvore de conexoes entre as views		
		_historyChart = null,     // Armazena o gráfico que contém o historico
		_svgLinks = null,

		_dragConect = d3.behavior.drag().on("drag", _onDragConect);		
		
	var DS_NodeEdge = 0,
		DS_ClusterVis = 1,
		DS_Iris = 2,
		DS_GlyphMatrix = 3;
				
	var _configView = {
		  barTitle : true,
		  btTool   : true,
		  btClose  : true,
		  draggable: true,
		  resizable: true,
		  aspectRatio: false,
		  visible: true
	    },
		
		_contextMenu = {
			showing: false,
			vItens : [null,null,null,null]
		},
		
		_dashboardArea = {
			div : null,
			svg : null,
			width : 0,
			height : 0
		};
		
// ---------------- Acoes de inicializacao


	_dashboardArea.div = d3.select("#"+idDiv);
	_dashboardArea.div.classed("DS-viewArea", true).on("contextmenu", _onContextMenu);
	
	_dashboardArea.width  = _dashboardArea.div.node().scrollWidth;
	_dashboardArea.height = _dashboardArea.div.node().scrollHeight;	
	_dashboardArea.svg = _dashboardArea.div.append("svg")
							.attr("width", _dashboardArea.width)
							.attr("height", _dashboardArea.height);	
	
//--------------------------------- Funcoes privadas
	function _addLink( viewParent, viewChild) {
		var line,conect;
		
		var centerViewParent = viewParent.getCenter(),
			centerViewChild = viewChild.getCenter();
		line = _dashboardArea.svg.
			insert("line",".DS-conect")
				.attr({x1:centerViewParent.cx, y1:centerViewParent.cy, x2:centerViewChild.cx, y2:centerViewChild.cy})
				.attr("class","DS-linkChartShow P-" + viewParent.idChart() + " F-" +viewChild.idChart() );
		conect = _dashboardArea.svg.
			append("rect")
				.datum([{x:centerViewChild.cx, y:centerViewChild.cy, viewParent:viewParent, viewChild:viewChild}])
				.attr("class","DS-conect " + viewChild.idChart())
				.attr("x",centerViewChild.cx-6)
				.attr("y",centerViewChild.cy-6)
				.attr("width",12)			
				.attr("height",12)
				.call (_dragConect);
		return {line:line, conect:conect, visible:true};				
	}
	
	function _onDragConect(d) {
					var dt;				
				
					d.x = d3.event.x;
					d.y = d3.event.y;
					d3.select(this).attr("x", d.x-6).attr("y",d.y-6);
					dt = d3.select(this).datum();
					_dashboardArea.svg.select(".F-" + dt[0].viewChild.idChart()).attr("x2",d.x).attr("y2",d.y);
					_dashboardArea.svg.selectAll(".P-" + dt[0].viewChild.idChart()).attr("x1",d.x).attr("y1",d.y);
					dt[0].viewChild.setCenter(d.x,d.y);	  // Move a janela escondida
					dt[0].viewChild.refresh();
					dt[0].x = d.x;
					dt[0].y = d.y;
	}
	
	function _onContextMenu() {
		var clickedElem, nodeElem,viewDiv,popupDiv,mousePos;
	
		if (_contextMenu.showing) {
			d3.event.preventDefault();
			_contextMenu.showing = false;
			d3.select(".DS-popup").remove();			
		} else {
			clickedElem = d3.select(d3.event.target);
			if (clickedElem.classed("NE-node") || clickedElem.classed("NE-edge") || 
													clickedElem.classed("CV-node") ||
													clickedElem.classed("IC-node") ||
													clickedElem.classed("GM-node")) {
				d3.event.preventDefault();

				viewDiv = _findParentDiv(clickedElem);
				mousePos = d3.mouse(viewDiv.node());
				
				popupDiv = viewDiv.append("div")
					.attr("class", "DS-popup")
					.style("left", mousePos[0] + "px")
					.style("top", mousePos[1] + "px");
				_contextMenu.showing = true;
				if (clickedElem.classed("NE-node") || clickedElem.classed("NE-edge") )
					_execCtxMenuNodeEdge(popupDiv,clickedElem, viewDiv.node().id);
				else 
					if (clickedElem.classed("CV-node"))
						_execCtxMenuClusterVis(popupDiv,clickedElem, viewDiv.node().id);
					else
						if ( clickedElem.classed("IC-node"))
							_execCtxMenuIris(popupDiv,clickedElem, viewDiv.node().id);
						else
							if ( clickedElem.classed("GM-node"))
								_execCtxMenuGlyphMatrix(popupDiv,clickedElem, viewDiv.node().id);						
			}

		}	
	}
	
//------------
	function _findParentDiv(clickedElem) {
		var nodeElem = clickedElem.node();

		while (nodeElem.nodeName != "svg") {
			nodeElem = d3.select(nodeElem.parentNode).node();		
		}
		return d3.select(nodeElem.parentNode);
	}
//------------	
	function _execCtxMenuNodeEdge(popupDiv,clickedElem, parentId) {
		popupDiv.selectAll("div")
					.data(_contextMenu.vItens[DS_NodeEdge])
					.enter()
						.append("div")
						.on("click", function(d) { 
							_contextMenu.showing = false;
							d3.select(".DS-popup").remove();
							if ( clickedElem.classed("NE-node"))
								d.fActionNode(clickedElem.datum(),parentId);
							else
								d.fActionEdge(clickedElem.datum(),parentId);								
						})
						.append("label")
						.text(function(d) { return d.label;} );				
	}
	
//------------	
	function _execCtxMenuClusterVis(popupDiv,clickedElem, parentId) {
		popupDiv.selectAll("div")
					.data(_contextMenu.vItens[DS_ClusterVis])
					.enter()
						.append("div")
						.on("click", function(d) { 
							_contextMenu.showing = false;
							d3.select(".DS-popup").remove();
							d.fActionNode(clickedElem.datum(),parentId);															
						})
						.append("label")
						.text(function(d) { return d.label;} );				
	}

//------------	
	function _execCtxMenuIris(popupDiv,clickedElem, parentId) {
		popupDiv.selectAll("div")
					.data(_contextMenu.vItens[DS_Iris])
					.enter()
						.append("div")
						.on("click", function(d) { 
							_contextMenu.showing = false;
							d3.select(".DS-popup").remove();
							d.fActionNode(clickedElem.datum(),parentId);															
						})
						.append("label")
						.text(function(d) { return d.label;} );				
	}

//------------	
	function _execCtxMenuGlyphMatrix(popupDiv,clickedElem, parentId) {
		popupDiv.selectAll("div")
					.data(_contextMenu.vItens[DS_GlyphMatrix])
					.enter()
						.append("div")
						.on("click", function(d) { 
							_contextMenu.showing = false;
							d3.select(".DS-popup").remove();
							d.fActionNode(clickedElem.datum(),parentId);															
						})
						.append("label")
						.text(function(d) { return d.label;} );				
	}	
//--------------------------------- 		
	function dashboard() {}

	//---------------------	 
	dashboard.newView = function (x, y) {	 
	      _lastIndex++;
	  var idView = "view-" + _lastIndex;
	  var objView = View(idView,this);
		
      _vIdViews.push(idView);
      _vObjViews.push(objView);
      _activeView = objView;	

      objView
    	.create(x,y,_configView);	

      return objView;	// retorna a view criada	
	}
	
	//---------------------
    dashboard.configureView = function (configView) {
	
	  if (configView.barTitle != undefined)
	    _configView.barTitle = configView.barTitle;
		
	  if (configView.btTool != undefined)
		_configView.btTool = configView.btTool;

	  if (configView.btClose != undefined)
		_configView.btClose = configView.btClose;		
	
	  if (configView.draggable != undefined)
		_configView.draggable = configView.draggable;	

	  if (configView.resizable != undefined)
		_configView.resizable = configView.resizable;
	
	  if (configView.aspectRatio != undefined)
		_configView.aspectRatio = configView.aspectRatio;

	  if (configView.visible != undefined)
		_configView.visible = configView.visible;
		
	  return dashboard;
    };
	
	//---------------------	
    dashboard.activeView = function(_) {
	  if (!arguments.length)
	     return _activeView;
	  _activeView = _;
	  
	  return dashboard;
	}
	
	//---------------------	 
	dashboard.idDashboard = function () {
	  return _idDashboard;
    }

	//---------------------	 
	dashboard.nextZIndex = function () {
		_zIndexActive++;
	  return _zIndexActive;
    }	
		//---------------------	 
	dashboard.setItensContextMenu = function(codChart,itens) {
	  _contextMenu.vItens[codChart] = itens;
	}
		
	//---------------------
	// Inclui os dados da técnica na árvore como último filho do pai. Pai igual a 0 significa incluir como raiz
	// Retorna o id do nodo incluído. Retorna -1 se não foi possível incluir
	dashboard.addChart = function ( idParent, objChart) {
		var nodeTree,link;
		
		if (idParent == 0) {
			if (_treeCharts == null) {
				_treeCharts = { id:objChart.id, title:objChart.title, typeChart:objChart.typeChart, hidden:objChart.hidden,
				                x:objChart.x, y:objChart.y, chart: objChart.chart, view: objChart.view, 
								parentNode:null, isLeaf:true, link:null };	
			} else {
				return -1;
			}
		} else {
			nodeTree = this.getChart(idParent);
			if (nodeTree == null)
				return -1;			
			if (nodeTree.children == undefined)
				nodeTree.children = [];
			nodeTree.isLeaf = false;
			link = _addLink(nodeTree.view, objChart.view);			
			nodeTree.children.push({ id:objChart.id, title:objChart.title, typeChart:objChart.typeChart, hidden:objChart.hidden,
									 x:objChart.x, y:objChart.y, chart: objChart.chart, view: objChart.view,
									 parentNode:nodeTree, isLeaf:true, link:link });
		}
	  return objChart.id;
	}
	
	//---------------------	
	dashboard.getChart = function (idChart) {

		return getChartRec(_treeCharts);
		
		function getChartRec (nodeTree) {
			var tempNodeTree;
			
			if (nodeTree == null)
				return null;
			if (nodeTree.id == idChart)
				return nodeTree;
			if (nodeTree.children == undefined)
				return null;
			
			for (var i=0; i<nodeTree.children.length; i++) {
				tempNodeTree = getChartRec(nodeTree.children[i]);
				if (tempNodeTree != null)
					return tempNodeTree;
			}
			return null;
		}
	}

	//---------------------	
	dashboard.getTree = function () {
		return _treeCharts;
	}
	
	//---------------------	
	dashboard.historyChart = function (_) {
	  if (!arguments.length)
	     return _historyChart;	 
	  _historyChart = _;
	  return dashboard;
	}
	
	//---------------------		
	dashboard.refreshSvg = function() {
		_dashboardArea.width  = _dashboardArea.div.node().scrollWidth;
		_dashboardArea.height = _dashboardArea.div.node().scrollHeight;	
		_dashboardArea.svg.attr("width", _dashboardArea.width);
		_dashboardArea.svg.attr("height", _dashboardArea.height);		
	}
	
	//---------------------	
	dashboard.getSvg = function () {
		return _dashboardArea.svg;
	}
	
	//---------------------		
	dashboard.refreshLinks = function() {
		refreshLinksRec(_treeCharts);
		
		function refreshLinksRec (nodeTree) {
			var tempNodeTree;
			
			if (nodeTree != null) {
				processNode(nodeTree);
			}
			if (nodeTree.children != undefined) {
				for (var i=0; i<nodeTree.children.length; i++) {
					refreshLinksRec(nodeTree.children[i]);	
				}
			}
		}

		function processNode(nodeTree) {
			if (nodeTree.link != null) {
				if (nodeTree.link.visible) {
					if ( nodeTree.hidden == true || (nodeTree.parentNode.hidden && !nodeTree.hidden)){
						nodeTree.link.line.classed("DS-linkChartShow",false);
						nodeTree.link.line.classed("DS-linkChartHidden",true);
					} else {
						nodeTree.link.line.classed("DS-linkChartShow",true);
						nodeTree.link.line.classed("DS-linkChartHidden",false);					
					}
					nodeTree.link.conect.style("display",null);
					nodeTree.link.line.style("display",null);					
				} else {
					nodeTree.link.conect.style("display","none");				
					nodeTree.link.line.style("display","none");				
				}				
			}
		}
	}

	//---------------------	
	dashboard.closeView = function (view) {
		var nodeTree = this.getChart(view.idChart());
		var node=nodeTree;
		
		if (node.isLeaf) {
			while (node != null) {
				node.link.visible = false;
				if ( temFilhosVisiveis(node.parentNode)) {
					break;
				} else {
					node.parentNode.isLeaf = true;
				}				
				node = node.parentNode;
				if (node.hidden == false) {
					break;
				}
			}		
		}
		
		nodeTree.hidden = true;		
		view.show(false);
		this.refreshLinks();		
		
/*							
		nodeTree.hidden = true;							
		view.show(false);

		node = nodeTree;
		while (node.hidden) {
			if (node.isLeaf) {
				node.link.visible = false;
				console.log(node);
				if ( temFilhosVisiveis(node.parentNode)) {
					console.log("tem filho");
					break;
				} else {
					node.parentNode.isLeaf = true;
				}									
			}
			node = node.parentNode;										
		}	
*/		
		this.historyChart().data(dashboard.getTree());
//		this.refreshLinks();
							
		function temFilhosVisiveis(node) {
			var i;
			if (node.children==undefined)
				return false;
			else {
				for (i=0; i<node.children.length; i++)
//					if (node.children[i].hidden==false)
					if (node.children[i].link.visible)
						return true; 
			}
			return false;
		}
	}
	
	//---------------------	
	dashboard.showView = function (view) {
		var nodeTree = this.getChart(view.idChart());
		var node=nodeTree;

		while (node.link.visible == false) {
			node.link.visible = true;
			node=node.parentNode;
			node.isLeaf = false;			
			if (node.parentNode == null)  // Verifica se é o raiz
			   break;
		}
		
		nodeTree.hidden = false;
		view.show(true);
		this.refreshLinks();		
	}

	dashboard.removeTudo = function () {
		var i;
		_dashboardArea.svg.remove();
		for (i=0; i<_vIdViews.length; i++)
			d3.select("#" + _vIdViews[i]).remove();  
	}
	//---------------------		
	 return dashboard;
  }


});