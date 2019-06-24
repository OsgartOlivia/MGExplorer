/**
* clusterVis
*
*/

define(["model","libCava"], function (Model,LibCava) {
  return function ClusterVis (idDiv) {

    var _clusterVisPanel = null,  // Representa o panel associado aao grafico
	    _xClusterCenter = 0,
        _yClusterCenter = 0,
		_innerRadius = 0,     // (calculado) Raio interno do círculo onde o gráfico é desenhado 
        _outerRadius = 0,
//        _widthAllFaixas = 0,  // (calculado) Largura disponível para o desenho de todas as faixas		
        _grpCluster = null,   // Grupo que representa o ClusterVis
		_grpRings = null,    // Seleção que contém todos os grupos que armazenam os anéis
        _grpBars = null,
        _grpLinks = null,
        _links    = null,   // Seleção que contém os links    		
		
		_vRings = [],       // Lista com os dados dos aneis: 
		                     // { indexAttr, typeAttr ("L"-label, "V"-value), pHeight (percentual de _widthAllFaixas, maxValue (valor maximo dos dados para o anel }						 

        _barsArea = {
		   widthBar: 0,       // (Calculada) Largura da barra na área de largura máxima (foco) Original: 11
		   angleBar: 0.0,     // (calculada) Ângulo do setor ocupado pelas barras que estão no Foco
		   startSetor: 0,     // Posição do setor onde a primeira barra é posicionada
	       marginBar: 1,      //
		   pMarginBar: 0.0033,
           maxBars: 0,        // (Calculado) número máximo de barras considerando o anel mais interno da clusterVis	
           numBars: 0         //  Número de barras existentes na clusterVis 		   
        },
		
		_dataLinks = {
		   heightTree: 3,       // Altura da árvore que será gerada 
		   degreeTree: 2,       // Grau dos nodos intermediarios
		   tree : null,         // Árvore gerada artificialmente
		   vBundleLinks : null,  // Vetor de arestas
		   tension : 0.85,        // Tensão utilizada no desenho das arestas
		   bundle  : d3.layout.bundle()   // Gerador do feixe de arestas
		},
		
		_indexAttrSort = 0,  // Índice do atributo utilizado para o sort (0-primeiro labels[] 1000-primeiro values[])
		_vOrder = null,      // Vetor indireto de ordenacao
		_vAngle = null,      // Vetor que contém a medida angular de cada barra. Calculado na _calcGeometry
		_grpBarsRotScale = d3.scale.ordinal(),    // Escala usada para definir o angulo de rotação de cada barra
        _ringScale = d3.scale.linear().domain([ 0, 100 ]),
        _colorScale = d3.scale.category10();		

// ---------------- Modelo 
    var model = Model();
	var lcv   = LibCava();

// ---------------- Atributos geométricos do grafico	
        model.margin = {top: 2, right: 2, bottom: 2, left: 2};
        model.box = { width:150, height:150};
		model.pInnerRadius = 0.20;    // Percentual em relação a largura do gráfico para cálculo do _innerRadius
		model.pOuterRadius = 0.47;    // Percentual em relação a largura do gráfico para cálculo do _OuterRadiu
        model.pWidthBar =  0.0275;    // Percentual em relação a largura do gráfico para cálculo da largura das barras
		
        model.redraw = 0;        // Quando alterado executa um redesenho
//        model.innerRadius = 0;        // (calculado) Raio do círculo onde o centróide está inserido 		
//        model.outerRadius = 0;
		
		
// ---------------- Acoes de inicializacao
    var _svg = d3.select("#"+idDiv).append("svg"),  // Cria o svg sem dimensoes 
	    _grpChart = _svg.append("g"),                       // Não existe na Iris original
	    _sort  = lcv.sort(),                     // Cria função de ordenação
		_drawLine = d3.svg.line.radial()         // Gerador das splines que compoe as arestas
                      .interpolate("bundle")
                      .tension(_dataLinks.tension)
                      .radius(function(d) { return d.y; })
                      .angle(function(d) { return d.x / 180 * Math.PI; });
		
		_grpCluster = _grpChart.append("g").attr("class","ClusterVisChart");  
		_grpCluster.append("circle").attr("class","CV-Inner");		
//		_grpCluster.append("circle").attr("class","CV-Outer");	

		

//===================================================
    model.when(["box", "margin"], function (box, margin) {
      model.widthChart = box.width - margin.left - margin.right,
      model.heightChart = box.height - margin.top - margin.bottom;
	  console.log("when box margin");
    });
	
    model.when("box", function (box) { 
      _svg.attr("width", box.width).attr("height", box.height);
	  console.log("when box");
    });	
	
  //---------------------	
	model.when("margin", function (margin) {
      _grpChart.attr("transform", "translate(" + margin.left + "," + margin.top + ")");
	  console.log("when margin");
    });

  //---------------------	
	model.when(["widthChart","pInnerRadius"], function (widthChart,pInnerRadius) {
	  _innerRadius = Math.floor(widthChart  * pInnerRadius);
//	  _widthAllFaixas = model.outerRadius - model.innerRadius;
	  _grpCluster.select(".CV-Inner").attr("r",_innerRadius);
      _ringScale.range([ _innerRadius, _outerRadius ]);
	  model.redraw += 1;    // Para forçar o redesenho	   
	  console.log("when widthChart pInnerRadius");	  
    });	
	
  //---------------------	
	model.when(["widthChart","pOuterRadius"], function (widthChart,pOuterRadius) {
      _outerRadius = Math.floor(widthChart * pOuterRadius);
//	  _widthAllFaixas = model.outerRadius - model.innerRadius;	  
//	  _grpCluster.select(".CV-Outer").attr("r",model.outerRadius); 
      _ringScale.range([ _innerRadius, _outerRadius ]);
      model.redraw += 1;    // Para forçar o redesenho	   
	  console.log("when widthChart pOuterRadius");
    });
	


  //---------------------	
	model.when(["widthChart","pWidthBar"], function (widthChart,pWidthBar) {
//      _barsArea.widthBar = Math.floor(widthChart  * pWidthBar);
      _barsArea.widthBar = widthChart  * pWidthBar;	  
	  _barsArea.marginBar = widthChart * _barsArea.pMarginBar;
	  console.log("when widthChart pWidthBar");
    });	

  //---------------------	
//	model.when(["innerRadius","outerRadius"], function (innerRadius,outerRadius) {
//       model.ringScale = d3.scale.linear().range([ innerRadius, outerRadius ]).domain([ 0, 100 ]);
//	   console.log("when innerRadius outerRadius");
//    });
	
  //--------------------- 
    model.when(["data","widthChart","heightChart","redraw"], function (data,widthChart,heightChart, redraw ) {

	  
	  _xClusterCenter = Math.floor(widthChart / 2); 
      _yClusterCenter = Math.floor(heightChart / 2);
	  console.log("when todos" + model.pOuterRadius);  
	  
	  _grpCluster.attr("transform", "translate(" + _xClusterCenter + "," + _yClusterCenter + ")");
	  
	  // Traça uma linha para testar o posicionamento das barras
/*	  _grpCluster.append("line")
	                .attr("x1",widthChart/2)
	                .attr("y1",0)
	                .attr("x2",-widthChart/2)
	                .attr("y2",0)
					.style("stroke","red")
					.style("stroke-width",0.5);
*/	  
	  _calcGeometry(data);
	  _grpBarsRotScale.range(_vAngle).domain(_vOrder);
	  _calcCoordinates(data.nodes.dataNodes);
	  
 
      _appendRings();
      _appendBars(data);
      _appendLinks();	  				   					   	  
    });	  
//--------------------------------- Funcoes privadas

/**
 * _appendRings
 * 
 * Adiciona os elementos SVG relativos aos aneis
 */
    function _appendRings() {
	  var vetAux = [];
/*		  cores = ["#99ccff","#add6ff","#c2e0ff","#d6ebff"];
	  for (var i=_vRings.length-1; i>=0; i--)
	    vetAux.push(_vRings[i]);
*/		
	  if (_grpRings != null)
	     _grpRings.remove();
		 
      _grpRings =  _grpCluster.selectAll(".CV-grpRings")
	      .data(_vRings)    // Original _vRings
          .enter()
		  .append("g")
			.attr("class", "CV-grpRings")
			
	  _grpRings.append("circle")
			   .attr("r", function (d){ return _ringScale(d.pHeight)} );
//  		       .style("fill", function (d,i) { return cores[i]; })	// Original: sem esse comando
/*
	  _grpRings.append("circle") // Desenha o último círculo
              .attr("r", _innerRadius )
  		       .style("fill", "#ebf5ff")	// Original: sem esse comando			  
*/			   
	}

/**
 * _appendBars
 * 
 * Adiciona os elementos SVG relativos as barras
 */
    function _appendBars(data) {
	  var barScale = d3.scale.linear();
      if (_grpBars != null)
	     _grpBars.remove();
		 
      _grpBars =  _grpCluster.selectAll(".CV-grpBars")
	      .data( data.nodes.dataNodes)
          .enter()
		  .append("g")
			.attr("class", "CV-grpBars")
//			.attr("transform", function(d, i) { return "rotate(" + ( ( (i+_barsArea.startSector) * _barsArea.angleBar + 180)%360) + ")"; 	});
			.attr("transform", function(d, i) { return "rotate(" + _grpBarsRotScale(i) + ")"; 	});

			
      _grpBars.append("line")
		  .attr("x1", _ringScale(0))
		  .attr("y1", 0)
		  .attr("x2", _ringScale(100)) 
		  .attr("y2",  0);
			
      for (var i=0; i<_vRings.length; i++) {	
	    barScale.range( [1, Math.floor(_vRings[i].pHeightBar* (_outerRadius - _innerRadius))]).domain([0,_vRings[i].maxValue]);
        _grpBars.append("rect")
		  .attr("x", _ringScale(_vRings[i].pX))
		  .attr("y", function (d) {return -_barsArea.widthBar/2;})
		  .attr("height", function (d) { return _barsArea.widthBar; }) 
		  .attr("width",  function (d) { return barScale( d.values[ _vRings[i].indexAttr]); })
		  .style("fill", function (d) { return _colorScale(i); })
		  .attr("title", function(d) { return data.nodes.valueTitle[_vRings[i].indexAttr] + ": " + d.values[ _vRings[i].indexAttr]})
		  .on("mouseover", _mouseOverNode)
		  .on("mouseout", _mouseOutNode);
	  }		 
		 	
	}

/**
 * _appendLinkss
 * 
 * Adiciona os elementos SVG relativos as arestas
 */
    function _appendLinks() {
      if (_grpLinks != null) 
	     _grpLinks.remove();

	  _grpLinks =  _grpCluster.append("g") 
	  				   .attr("class","CV-grpLinks")
                       .attr("transform","rotate(90)");

      _links = _grpLinks.selectAll("path")
		  .data(_dataLinks.vBundleLinks)
		  .enter()
			 .append("path")
			 .attr("d", _drawLine);

		 
	}

/**
 * _mouseOverNode
 */
    function _mouseOverNode(d) {
	   _grpBars.each( function(n) { n.highLight=false;} );

	   _links.classed("CV-linkHL", function(link) { 
	      if (link.source===d || link.target===d) return link.source.highLight=link.target.highLight=true;
          else return false;				   
	   });
	   
	   _grpBars.classed("CV-nodeHL", function(node) { return node.highLight; })	    
	}

/**
 * _mouseOutNode
 */
    function _mouseOutNode( d) {
	   _grpBars.classed("CV-nodeHL", false);
	   _links.classed("CV-linkHL", false);
	}	
/**
 * _calcGeometry
 * 
 * Calcula todos os parâmetros geométricos para exibição da ClusterVis
 */
    function _calcGeometry(data) {
	  
      _barsArea.angleBar = _widthToAngle( _barsArea.widthBar + _barsArea.marginBar , _innerRadius );
      _barsArea.maxBars =  Math.floor (360/_barsArea.angleBar);
	  _barsArea.angleBar = 360.0 / _barsArea.maxBars;
	  _barsArea.numBars = model.data.nodes.dataNodes.length;
	  _barsArea.startSector = Math.round( (_barsArea.maxBars - _barsArea.numBars)/2);

	  _vAngle = [];
      data.nodes.dataNodes.forEach( function (d,i) {
	     _vAngle[i] =  ( (i+_barsArea.startSector) * _barsArea.angleBar + 180)%360;
	  });
	}
	
/**
 * _calcCoordinates
 * 
 * Calcula as coordenadas dos nodos folhas
 */
function _calcCoordinates(dataNodes) {
  var dist = _innerRadius/ _dataLinks.heightTree;
  var distScale = d3.scale.linear().range([20,_innerRadius]).domain([0,_dataLinks.heightTree]);  
  //distScale = d3.scale.pow().exponent(2).range([0,_innerRadius]).domain([0,alturaTree]);  
  
  _vOrder.forEach( function (d,i) {
    dataNodes[d].x = _vAngle[i];
	dataNodes[d].y = _innerRadius;
  });

/*
  nodos.forEach( function (d,i) {
    d.x = ((i+_barsArea.startSector) * _barsArea.angleBar + 180)%360;
	d.y = _innerRadius;
  });
*/  
  posOrdem(_dataLinks.tree);

  
  function posOrdem(raiz) {
     var xPrim, xUlt;
	 
     if (raiz.children != undefined) {
	    raiz.children.forEach( function (d) {
		    posOrdem(d);
		});
		
		xPrim = raiz.children[0].x;
		xUlt  = raiz.children[raiz.children.length-1].x;
		
		if (xPrim < xUlt)
		   raiz.x = (xPrim + xUlt)/2;
		else
		   raiz.x = ((xUlt + 360-xPrim)/2 + xPrim)%360;
//		raiz.y = raiz.depth * dist; 
//        raiz.y = _innerRadius - distScale( alturaTree-raiz.depth); 
        raiz.y = distScale(raiz.depth);		
	    console.log(raiz.id + " " + xPrim + " " + xUlt);
//	    console.log(raiz.children[0].x);
	 }
	 
  }
}
		
/**
 * _widthToAngle
 * 
 * Calcula o angulo do setor ocupado por uma largura
 * E: width, radius
 * S: angulo em graus
 */
function _widthToAngle ( width, radius) {
	return Math.acos(1.0 - width*width / (2*radius*radius))*180.0 / Math.PI;
};	

/**
 * _getTree
 * 
 * Gera uma arvore no formato { id:..., chidren[] }
 */
function _getTree(heightTree, dados, degree, vOrder) {
  var children = null;
  var levelMax = heightTree-1;
  var result = createTree(0,vOrder);
  result.depth = 0;

  function createTree(nivel, vNodos) {
     var obj=[], objPai, inic, fim , delta;
     if (nivel < levelMax) {
	    delta = Math.floor(vNodos.length/degree);
	    inic = 0;
		fim = delta;
		for (var i=0; i<degree-1; i++) {
		   obj.push ( createTree(nivel+1, vNodos.slice(inic, fim)));
		   inic = fim;
		   fim += delta;
		}
		obj.push ( createTree(nivel+1, vNodos.slice(inic)));
		objPai = { id:"N"+nivel, children:obj};
	 } else 
	    if (nivel==levelMax) {
		    children = [];
			vNodos.forEach( function (d) {
			   children.push( dados[d]);
			});
		    objPai = { id:"N"+nivel, children:children};
		}
	 objPai.children.forEach( function (d) {
		 d.parent = objPai;
	     d.depth = nivel+1;
	 });	
  	 return objPai;
  }
   return result;
}

/**
 * _getEdges
 * 
 * Gera um vetor com a listas de arestas no formato: [ {source:Object, target: Object},...]
 */
function _getEdges(dados) {
  var nodos = dados.nodes.dataNodes,
      edges = dados.edges.dataEdges,
	  objSource, objTarget;
	  
  var result = [];
  edges.forEach( function (d) {
     objSource = findNodo(d.source);
	 objTarget = findNodo(d.target);
     result.push( {source: objSource, target:objTarget} );    
  }) ; 

  function findNodo(id) {
     for (var i=0; i< nodos.length; i++)
	   if (nodos[i].id == id)
	      return nodos[i];
	 return  null;
  } 
  
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
	     return _clusterVisPanel;	 
	  _clusterVisPanel = _;
 
	  return chart;
	}	

 	//---------------------	 
  	chart.data = function(_) {
	  if (!arguments.length)
	     return model.data;
	  model.data = _;
	  
	  _sort.inic(model.data.nodes.labelTitle.length, model.data.nodes.valueTitle.length)
	       .data(model.data.nodes.dataNodes);
	  _sort.exec(_indexAttrSort);		   
      _vOrder = _sort.getVetOrder();
	  _dataLinks.tree = _getTree( _dataLinks.heightTree,model.data.nodes.dataNodes,_dataLinks.degreeTree,_vOrder );
      _dataLinks.vBundleLinks = _dataLinks.bundle(_getEdges(model.data));

	                      // Acrescenta os atributos source e target para os dados de cada aresta
	  _dataLinks.vBundleLinks.forEach(function(d) { d.source = d[0], d.target = d[d.length - 1]; });
      model.data.nodes.dataNodes.forEach( function(d) { d.highLight=false;});		  

	  return chart;
	}

 	//---------------------	 
	chart.pInnerRadius = function(_) {
	  if (!arguments.length)
	     return model.pInnerRadius;	 
	  model.pInnerRadius = _;
 
	  return chart;
	}

 	//---------------------	 
	chart.pOuterRadius = function(_) {
	  if (!arguments.length)
	     return model.pOuterRadius;	 
	  model.pOuterRadius = _;

	  return chart;
	}
	
 	//---------------------	 
	chart.addAttribute = function( _indexAttr, _typeAttr) {
	  var deltaHeight = 100/ (_vRings.length+1),
	      maxValue = d3.max( model.data.nodes.dataNodes, function(d){return d.values[_indexAttr];}),
		  pX = 0;
//		  barScale = d3.scale.linear().range(0, model.ringScale(deltaHeight)-_innerRadius).domain(0,maxValue);
		  
	    // Ajusta todo o _vRings
	  for (var i=0, pHeight=deltaHeight; i< _vRings.length; i++, pHeight+=deltaHeight) {  
	    _vRings[i].pHeight = pHeight;
	    _vRings[i].pHeightBar = deltaHeight/100; 
	  }
		
//	  barScale.range(0, ringScale() ).domain(0,maxValue);	
      if (_vRings.length > 0) {
	     _vRings[0].pX = 0;
		 pX = _vRings[_vRings.length-1].pHeight;

	  	 for (i=1; i< _vRings.length; i++)  
	       _vRings[i].pX = _vRings[i-1].pHeight;
      }		 
	  	      
      _vRings.push({indexAttr:_indexAttr, typeAttr:_typeAttr, pHeight:pHeight, pX:pX, pHeightBar:deltaHeight/100,maxValue: maxValue});
	  model.redraw += 1;

	  console.log(_vRings);
	  return chart;
	}

 	//---------------------	 
	chart.indexAttrSort = function(_) {
	  if (!arguments.length)
	     return _indexAttrSort;	 
	  _indexAttrSort = _;
 
	  return chart;
	}

   	//======== Funçoes de ações	 
	chart.acSortExec = function(_) {
	  _indexAttrSort = _;
	  _sort.exec(_indexAttrSort);
	  _vOrder = _sort.getVetOrder();
	  _grpBarsRotScale.domain(_vOrder);
	  
	  _dataLinks.tree = _getTree( _dataLinks.heightTree,model.data.nodes.dataNodes,_dataLinks.degreeTree,_vOrder );
      _dataLinks.vBundleLinks = _dataLinks.bundle(_getEdges(model.data));
	  _dataLinks.vBundleLinks.forEach(function(d) { d.source = d[0], d.target = d[d.length - 1]; });	  
	  _calcCoordinates(model.data.nodes.dataNodes);	  
		  
	  _grpBars.transition().duration(800)
          .attr("transform", function(d, i) { return "rotate(" + _grpBarsRotScale(i) + ")"; });
		  
      _grpLinks.selectAll("path")
		  .data(_dataLinks.vBundleLinks).transition().duration(800).attr("d", _drawLine);
 
	  return chart;
	}

	
    return chart; 
  };
  
	
});