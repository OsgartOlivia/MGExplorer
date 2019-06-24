/**
* historyTree
*
*/

define(["model","libCava"], function (Model,LibCava) {
  return function HistoryTree (idDiv, dashboard) {

	var _historyTreePanel = null,  // Representa o panel associado aao grafico
		_nodoHeight = 14,    // Altura do espaço para cada nodo sem as margens
//		_nodoHeight = 20,    // Usada para fazer a history maior
		_leftText = 18,      // Distância do texto a coordenada esquerda do nodo
//		_leftText = 24,      // Usada para fazer a history maior		
		_nodeMargin = 1,
//		_nodeMargin = 2,	 // Usada para fazer a history maior
		_rectHeight = _nodoHeight - _nodeMargin*2,
		_treeLayout = d3.layout.tree().nodeSize([0, _nodoHeight ]),
		_vNodes = [],				// Vetor com os objetos de todos os nodos
		
		_dashboard = dashboard,

		_grpHistory = null,   // Grupo que representa a árvore do histórico
		_grpNodes = null;     // Seleção que contém todos os grupos que armazenam os nodos
		
// ---------------- Modelo 
    var model = Model();
	var lcv   = LibCava();

// ---------------- Atributos geométricos do grafico	
        model.margin = {top: 4, right: 4, bottom: 4, left: 4};
        model.box = { width:150, height:150};	
		
// ---------------- Acoes de inicializacao
    var _svg = d3.select("#"+idDiv).append("svg"),  // Cria o svg sem dimensoes 
	    _grpChart = _svg.append("g");
		_grpHistory = _grpChart.append("g").attr("class","HistoryTreeChart");
		
		_zoomListenerTree = d3.behavior.zoom().on ("zoom", _chartZoomTree);
		_svg.call(_zoomListenerTree);		
	

//===================================================
    model.when(["box", "margin"], function (box, margin) {
      model.widthChart = box.width - margin.left - margin.right,
      model.heightChart = box.height - margin.top - margin.bottom;
    });
	
    model.when("box", function (box) { 
      _svg.attr("width", box.width).attr("height", box.height);
    });	
	
  //---------------------	
	model.when("margin", function (margin) {
      _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
    });
	
  //--------------------- 
    model.when(["data"], function (data ) {
	
		_appendNodos();
	
	});

//--------------------------------- Funcoes privadas

/**
 * _appendNodes
 * 
 * Adiciona os elementos SVG relativos aos nodos
 */
    function _appendNodos() {
		if (_grpNodes != null)
			_grpNodes.remove();

		_grpNodes =  _grpHistory.selectAll(".HT-grpNodos")
	      .data(_vNodes)
          .enter()
		  .append("g")
			.attr("class", function (d) { if (d.id == "view-1-c")
											return "HT-grpNodos HT-grpRoot";
										  else
											return "HT-grpNodos"})
			.attr("transform", function(d, i) { return "translate(" + d.y + "," + d.x + ")"; 	})
			.classed("HT-NodeHidden", function(d){ return d.hidden});
			
        _grpNodes.append("rect")
		  .attr("x", _nodeMargin)
		  .attr("y", _nodeMargin)
		  .attr("height", _rectHeight) 
		  .attr("width",  _rectHeight)
		  .on("click", function (d) {
			if (d.id != "view-1-c") {
				if (!d.hidden) {
					_dashboard.closeView(d.view);
				} else {
					_dashboard.showView(d.view);
//					d.hidden = !d.hidden;
//					d.view.show(!d.hidden);			
				}			
				_grpNodes.classed("HT-NodeHidden",function (d) { return d.hidden});
			}
		  });
		  
        _grpNodes.append("text")
            .attr("x", _leftText)
            .attr("y", _nodoHeight/2 + 3)			
            .attr("text-anchor", "start")
            .text(function(d) {
                return d.title;
            });		  
		  
/*		  
		_grpNodes.append("circle")
			.attr("class","HT-node")
			.attr("cx", 3)		  // Metade do raio	
			.attr("cy", 10)       // Metade da altura
			.attr("r",6);
*/		
	}

    function _chartZoomTree() {
		var zoomTranslate = _zoomListenerTree.translate();	
		_grpChart.attr("transform",
				"translate("+zoomTranslate[0]+","+zoomTranslate[1] + ")");
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
	     return _historyTreePanel;	 
	  _historyTreePanel = _;
 
	  return chart;
	}	

 	//---------------------	 
  	chart.data = function(_) {
	  if (!arguments.length)
	     return model.data;
	  model.data = _;
	  
	  _vNodes = _treeLayout(model.data);

	  _vNodes.forEach(function(n, i) {
		n.x = i * _nodoHeight;
	  });	  
//	  _clusterVisPanel.update();   // Por enquanto está somente aqui
	  return chart;
	}


	
    return chart; 
  };
  
	
});