/**
* irisChart
*
*/

define(["d3","model"], function (d3,Model) {

  return function IrisChart (idDiv) {
  
    var _irisPanel = null,  // Representa o panel associado aao grafico
		_xIrisCenter = 0,
        _yIrisCenter = 0,
		_innerRadius = 0,  // (calculado) Raio do círculo onde o centróide está inserido
        _outerRadius = 0,
        _maxHeightBar = 0, // (Calculado) Distância ocupada pelas barras - Alteração causa mudança na quantidade de barras máxima da Iris - Original 40		
        _numMaxBars = 0,
        _grpIris = null,   // Grupo que representa a IRIS
        _grpBars = null,       // Seleção que contém todos os grupos de barras 		
		_dataVis = [],         // Vetor de dados visíveis. Aponta para os elementos de model.data (possui os atributos "angle" e "index")
	    _indexFirstData = 0,   // Índice no vetor "dataVis" onde está localizado o primeiro elemento do vetor data
			                     // Usado apenas quando a quantidade de elementos em this.data é menor ou igual a "dataVis"
        _pDesloc = 0.08,       // Percentual de deslocamento do centro

        _focusArea = {
		   widthBar: 0,       // (Calculada) Largura da barra na área de largura máxima (foco) Original: 11
		   angleBar: 0.0,     // (calculada) Ângulo do setor ocupado pelas barras que estão no Foco
	       marginBar: 1,      // 
		   angleSector: 0.0,  // (calculado)
		   indexCenter: 0,    // (calculado) indice no vetor dataVis onde está o centro do foco
		   numBars: 7         // Número de barras no foco (melhor um número ímpar		
        },
		
		_updateIndexCenter = true,   // Indica que o IndexCenter deve ser atualizado

        _fisheyeArea = {
		   geometry : [ {width:0.0, angle:0.0}],   // Um elemento para cada barra
		   marginBar : 1,                          // Margem entre as barras do fisheye area
		   numBars : 0,         // (calculado)
		   angleSector: 0.0                        // (calculado) Soma do ângulo de todas as barras que formam a área fisheye		
        },
		
		_minArea = {
		   widthBar : 0,        // Largura da barra na área onde a largura das barras é minima Original: 4	
           angleBar : 0.0,      // (calculada) Ângulo do setor ocupado pelas barras que estão na área de larguram mínima (MIN)
           marginBar : 1,
           numBars   : 0,       // (calculada)
           angleSector : 0.0    // (calculada)			
		},
	
		_hiddenArea = {
			widthBar    : 0,    // (Calculada) Largura das barras do área não visível (igual ao do foco)
			angleBar    : 0.0,  // (calculado)
			numBars     : 1,    // Número de barras de largura igual ao do Foco na hiddenArea
            angleSector : 0.0   // (calculado) Ângulo do setor ocupado pela hidden área
		},
		
		_cfgIndexAttr = {          // Contém os índices dos atributos que podem ser configurados no grafico
			titleCentroid: 0,       // Indice do atributo que será impresso no centro do círculo (Deve ser Label)
			titleDegree: "co-authors",     // Texto que será usado após o valor de degree no centroide
			textBar: 0             // Texto que será impresso após as barras
		};
		
  // ---------------- Modelo 
    var model = Model();

  // ---------------- Atributos geométricos do grafico	
        model.margin = {top: 2, right: 2, bottom: 2, left: 2};
        model.box = { width:150, height:150};
		model.pInnerRadius = 0.15;    // Percentual em relação a largura do gráfico para cálculo do _innerRadius
		model.pOuterRadius = 0.57;    // Percentual em relação a largura do gráfico para cálculo do _OuterRadius
        model.pMaxHeightBar =  0.10;  // Percentual em relação a largura do gráfico para cálculo do _MaxHeightBar
        model.pFocusWidthBar =  0.0275;  // Percentual em relação a largura do gráfico para cálculo do _focusArea.widthBar
//        model.pFocusWidthBar =  0.05,  // Percentual em relação a largura do gráfico para cálculo do _focusArea.widthBar
//        model.barScale = d3.scale.linear();
        model.pMinWidthBar = 0.01;       // Percentual em relação a largura do gráfico para cálculo do _minArea.widthBar Original 4
		
        model.indexAttBar = 0;           // Indice do atributo que será plotado na barra
//	    model.indexAttText = 0;          // Indice do atributo cujo texto sera impresso
		
		
  // ---------------- Acoes de inicializacao
    var _svg = d3.select("#"+idDiv).append("svg"),  // Cria o svg sem dimensoes 
	    _grpChart = _svg.append("g");                       // Não existe na Iris original
		
		_grpIris = _grpChart.append("g").attr("class","IrisChart");  
		_grpIris.append("circle").attr("class","IC-centroidBack");
		_grpIris.append("text")
			.text("")
			.classed("IC-centroidTitle",true);    // Inclui o atributo title do centroide
			
		_grpIris.append("text")
			.text("")
			.classed("IC-centroidDegree",true);    // Inclui o atributo title do degree			
		
		    // ------      Inclusão do arco (setor) que representa o fundo do foco
        _grpIris.append("path").attr("class","IC-focus"); 
		
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
	model.when(["widthChart","pInnerRadius"], function (widthChart,pInnerRadius) {
	  _innerRadius = Math.floor(widthChart  * pInnerRadius);
	  _grpIris.select("circle.IC-centroidBack").attr("r",_innerRadius);		  
    });	
	
  //---------------------	
	model.when(["widthChart","pOuterRadius"], function (widthChart,pOuterRadius) {
      _outerRadius = Math.floor(widthChart * pOuterRadius);
    });	

  //--------------------- 	
    model.when(["data", "widthChart","indexAttBar","pMaxHeightBar"], function (data, widthChart,indexAttBar,pMaxHeightBar) {	
	 var maxValue = d3.max( data.children.data, function(d){return d.edge.values[indexAttBar];});
	     _maxHeightBar = Math.floor(widthChart  * pMaxHeightBar); 
         model.barScale = d3.scale.linear().range([ 0, _maxHeightBar ]).domain([ 0, maxValue ]);
    })		
	
  //---------------------	
	model.when(["widthChart","pFocusWidthBar"], function (widthChart,pFocusWidthBar) {
      _focusArea.widthBar = Math.floor(widthChart  * pFocusWidthBar) 
	  _hiddenArea.widthBar = _focusArea.widthBar;
    });

  //---------------------	
	model.when(["widthChart","pMinWidthBar"], function (widthChart,pMinWidthBar) {
      _minArea.widthBar = Math.floor(widthChart  * pMinWidthBar) 
	if (_minArea.widthBar === 0)
		_minArea.widthBar = 1;	  
    });		

  //--------------------- 
    model.when(["data","widthChart","heightChart","barScale","pInnerRadius","pOuterRadius"], 
	  function (data,widthChart,heightChart,barScale,pInnerRadius,pOuterRadius) {
	  
	  _xIrisCenter = Math.floor(widthChart / 2) - Math.floor(widthChart*_pDesloc);  //Para deslocar o centro para esquerda
      _yIrisCenter = Math.floor(heightChart / 2);
	  
	  _grpIris.attr("transform", "translate(" + _xIrisCenter + "," + _yIrisCenter + ")");

      _calcGeometry();
	  _grpIris.select(".IC-focus")
	     .attr("d", d3.svg.arc().innerRadius(_innerRadius)
//			.outerRadius(geometry.innerRadius+geometry.maxHeightBar)   // Para deixar apenas sobre as barras
			.outerRadius(_outerRadius /*+12*/)          // Alterar para evitar a soma 
			.startAngle( -_degreeToRadian(_focusArea.angleSector/2) + Math.PI/2)
			.endAngle( _degreeToRadian(_focusArea.angleSector/2) + Math.PI/2) );
		
	  _grpIris.select("text.IC-centroidTitle")
			.text( function(d) { return _adjustLengthText(data.root.data.labels[ _cfgIndexAttr.titleCentroid],13) } )
			.style("font-size", function (d) { 
			return (_dataVis[ _focusArea.indexCenter].widthText*0.70)+"px";
			} );
			
	  _grpIris.select("text.IC-centroidDegree")
			.attr("y", _innerRadius * 0.30)  // 30% do raio
			.text( function(d) { return data.children.data.length + " " + _cfgIndexAttr.titleDegree} )
			.style("font-size", function (d) { 
			return (_dataVis[ _focusArea.indexCenter].widthText*0.70)+"px";
			} );			
			
      if (_grpBars != null)
	     _grpBars.remove();
	
      _grpBars =  _grpIris.selectAll(".IC-grpBar")
	      .data(_dataVis)
          .enter()
		  .append("g")
			.attr("class", "IC-grpBar")
			.attr("transform", function(d, i) { return "rotate(" + d.angleRot + ")"; 	})
			.on("click", function( d,i) {        	
        	      if (i > _focusArea.indexCenter)
	                  i_Rotate(i- _focusArea.indexCenter,1,i-1);       		
                  else 
                      i_Rotate(_focusArea.indexCenter-i,-1,i+1);      
            });

      _grpBars.append("rect")
		.attr("class", "IC-node")	  
		.attr("x", _innerRadius)
		.attr("y",      function (d) { return Math.round(-d.width / 2 ); })
		.attr("height", function (d) { return d.width; }) 
		.attr("width",  function (d) { return _calcWidthBar(d) })
    	   .append("title")   
				.text ( function (d) { return _tooltip(d)});
				
	  _grpBars.append("text")
		.attr("class", "IC-node")
		.text( function(d) { return _text(d); })  
	    	.attr("x", _innerRadius + _maxHeightBar)
	    	.attr("y", function(d){return d.widthText/2*0.48;})
	    	.classed("IC-active", function(d,i){ return _focusArea.indexCenter==i;})
//	    .on("mouseover", function (d){ console.log("teste");d3.select(this).classed("active", true);})
//        .on("mouseout",function (d){ d3.selectAll(".grpBar text").classed("active", false);})

	    	.style("font-size", function (d) { return (d.widthText*0.70)+"px";} );  // Tamanho reduzido em 30%

	                console.log(_grpIris.selectAll(".IC-grpBar > rect > title"));			
      //----------					
      function i_Rotate(qtBars,dir,origin) {
           	if (qtBars!=0) {
            		i_MoveDataVis(_focusArea.indexCenter+dir,_focusArea.indexCenter);
	                _grpIris.selectAll(".IC-grpBar > rect")
    	                .attr("width", function(d){ return _calcWidthBar(d); });
	                _grpIris.selectAll(".IC-grpBar > rect > title")
						.text ( function (d) { return _tooltip(d)});	   	                						
	                _grpIris.selectAll(".IC-grpBar > text")
                        .text( function(d) { return _text(d); })
	                    .classed("IC-active", function(d,i) { return origin==i; });
            		setTimeout( function() {
            			i_Rotate(qtBars-1,dir,origin-dir);
            		}, 45);
            	}                    		
      }
	  
      //----------
      function i_MoveDataVis( source, target) {
	    var i,index,sizeData;

	    sizeData = model.data.children.data.length;
	    if (sizeData >= _dataVis.length){
		   index = (sizeData + _dataVis[source].indexData - target) % sizeData;
		   for (i=0; i< _dataVis.length; i++) {
		     _dataVis[i].indexData = index;
		     index = (index+1) % sizeData;		   
		   };		
	    } else {	
		   index = (_indexFirstData - source + target + _dataVis.length) % _dataVis.length;
		   _indexFirstData = index;
		   for (i=0; i< _dataVis.length; i++)
			 _dataVis[i].indexData = -1;
		   for (i=0; i<sizeData; i++) {
			 _dataVis[index].indexData = i;
			 index = (index+1) % _dataVis.length;
		   }	
	    }			
      }; // Fim i_MoveDataVis	  
  
    });	
//--------------------------------- Funcoes privadas

/**
 * _calcGeometry
 * 
 * Calcula todos os parâmetros geométricos para exibição da Iris
 */
    function _calcGeometry() {
	
	var maxValue = 0;  // Valor maximo do atributo que será representado pelas barras
	
	  i_CalcFocusArea();
	  i_CalcFisheyeArea();
	  i_CalcHiddenArea();
	  i_CalcMinArea();   // Deve ser a última a ser calculada pois é a área que sobra
                       // Recalcula o ângulo do setor da hidden area
                       //    acrescentando o que faltou para 360 graus
	  
      _hiddenArea.angleSector = 360 - _fisheyeArea.angleSector*2 - _focusArea.angleSector - _minArea.angleSector*2;
    
                             // O calculo do número de barras deve ser executado após o cálculo do elementos das áreas
      _numMaxBars = _focusArea.numBars + 2*_fisheyeArea.numBars + 2*_minArea.numBars;
    
/*
    if (this.dataChart.children.data.length <= geometry.numMaxBars) {  // Se a quantidade de dados é menor que os slots para a visualização 
    	                                            // recalcula removendo a hidden área
    	                                            // redistribui o que sobra para os angulos dos setores das barras
    	                                            // Não está alterando as dimensões das barras
    	geometry.hiddenArea.angleBar = 0;   
        geometry.hiddenArea.angleSector = 0; 
        this._calcMinArea();
        var sobra = 180 - fisheyeArea.angleSector - focusArea.angleSector/2 - minArea.angleSector;
        geometry.minArea.angleSector += sobra;
        geometry.minArea.angleBar = geometry.minArea.angleSector/ geometry.minArea.numBars; 
        geometry.numMaxBars = focusArea.numBars + 2*fisheyeArea.numBars + 2*minArea.numBars;    	
    }
*/

    						 // O calculo do indice no vetor dataVis onde está o centro do foco deve ser calculado após o elementos das áreas					 
		_focusArea.indexCenter = _minArea.numBars + _fisheyeArea.numBars + Math.floor(_focusArea.numBars/2);
                            
                             // Inicializa o vetor dataVis com capacidade para a quantidade maxima de barras
                             // Não associa o dataVis com o vetor dados (indicado pelo valor -1 nos índices)    
    i_InicDataVisVector();
	i_BindDataVisToData();


	//--------
	function i_CalcFocusArea() {   
      _focusArea.angleBar = _widthToAngle( _focusArea.widthBar + _focusArea.marginBar , _innerRadius );
      _focusArea.angleSector = _focusArea.angleBar * _focusArea.numBars;
	}
	
	//--------
	function i_CalcFisheyeArea() {
    var index=0;	
	
	  _fisheyeArea.angleSector = 0.0;
	  _fisheyeArea.geometry = [ {width:0.0, angle:0.0}];
	  for (var widthBar= _minArea.widthBar+1; widthBar< _focusArea.widthBar; widthBar++) {
	    _fisheyeArea.geometry[index] = { width : widthBar, angle : _widthToAngle( widthBar + _fisheyeArea.marginBar, _innerRadius) };
	    _fisheyeArea.angleSector += _fisheyeArea.geometry[index].angle; 
	    index++;
	  }
	  _fisheyeArea.numBars = index;
    };
	
	//--------
    function i_CalcHiddenArea() {
      _hiddenArea.angleBar = _widthToAngle( _hiddenArea.widthBar+1, _innerRadius );   
      _hiddenArea.angleSector = _hiddenArea.angleBar * _hiddenArea.numBars;   	
    };
	
	//--------
    function i_CalcMinArea() {  
      _minArea.angleBar = _widthToAngle( _minArea.widthBar   + _minArea.marginBar   , _innerRadius );  
      _minArea.numBars  = Math.floor( (360.0 - _fisheyeArea.angleSector*2 - _focusArea.angleSector - _hiddenArea.angleSector)/(2*_minArea.angleBar));
      _minArea.angleSector = _minArea.numBars * _minArea.angleBar;
    };
	
	//--------
    function i_InicDataVisVector() {
	  var angleRotBar;

      _dataVis = d3.range( _numMaxBars ).map( function(d,i) { return {angleRot:0.0, width:0, widthText:0, indexData:0 };});
 
                     // Determina como angulo de rotação inicial da barra com índice 0 o ângulo da linha superior do setor da área não visivel
      angleRotBar = 180 + _hiddenArea.angleSector/2;
    
// ----------  Área Mínima 1
      angleRotBar = i_CalcGeometryFixedArea(angleRotBar, 0, _minArea.numBars-1, _minArea.widthBar,_minArea.angleBar); 
    
// ---------- Área Fisheye 1
      angleRotBar = i_CalcGeometryFisheyeArea(angleRotBar, _minArea.numBars, _minArea.numBars + _fisheyeArea.numBars-1,true); 
     
// ---------- Área Foco    
      angleRotBar = i_CalcGeometryFixedArea(angleRotBar, _minArea.numBars + _fisheyeArea.numBars, 
    												 _minArea.numBars + _fisheyeArea.numBars + _focusArea.numBars-1, 
    												 _focusArea.widthBar, _focusArea.angleBar); // Área Foco          
// ---------- Área Fisheye 2 
      angleRotBar = i_CalcGeometryFisheyeArea(angleRotBar, _minArea.numBars + _fisheyeArea.numBars + _focusArea.numBars, 
    												       _minArea.numBars + 2*_fisheyeArea.numBars + _focusArea.numBars-1,
			 										       false);    

// ---------- Área Mínima 2 
      angleRotBar = i_CalcGeometryFixedArea(angleRotBar, _minArea.numBars + 2*_fisheyeArea.numBars + _focusArea.numBars, 
    												     2*_minArea.numBars + 2*_fisheyeArea.numBars + _focusArea.numBars-1, 
         											       _minArea.widthBar, _minArea.angleBar);													

	  //--------
      function i_CalcGeometryFixedArea (angleRotBar, startIndex, finalIndex, width, angleBar) {
	    var radiusText = _innerRadius + _maxHeightBar;

	    for (var i=startIndex; i<=finalIndex; i++) {         // ajusta o ângulo de rotação para o centro da barra
	      _dataVis[i].angleRot = (angleRotBar + angleBar/2)%360; 
		  _dataVis[i].indexData = -1;
		  _dataVis[i].width = width;
	   	  _dataVis[i].widthText = _angleToWidth(angleBar, radiusText);		 
		  angleRotBar = (angleRotBar+angleBar)%360;
	    }
	    return angleRotBar;
      };  

	  //--------
      function i_CalcGeometryFisheyeArea(angleRotBar, startIndex, finalIndex, ascending) {
  	    var indexGeometry, 
	        lastIndex = _fisheyeArea.geometry.length-1,
	        radiusText = _innerRadius + _maxHeightBar;

        for (var i=startIndex; i<=finalIndex; i++) {
   	      indexGeometry = (ascending) ? i-startIndex : lastIndex-(i-startIndex);
          _dataVis[i].angleRot = (angleRotBar + _fisheyeArea.geometry[indexGeometry].angle/2) % 360; 
   	      _dataVis[i].indexData = -1;
   	      _dataVis[i].width = _fisheyeArea.geometry[indexGeometry].width;
   	      _dataVis[i].widthText = _angleToWidth(_fisheyeArea.geometry[indexGeometry].angle, radiusText);
   	      angleRotBar = (angleRotBar + _fisheyeArea.geometry[indexGeometry].angle) % 360;
        }

	    return angleRotBar;
      };	  
    };
	 //--------
    function i_BindDataVisToData() {
	  var i,startIndex,endIndex,index, sizeDataChildren;
	
	  sizeDataChildren = model.data.children.data.length;
	
	  if (sizeDataChildren >= _dataVis.length)
		for (i=0; i< _dataVis.length; i++)
			_dataVis[i].indexData = i;
	  else {		
		startIndex = _focusArea.indexCenter - Math.floor(sizeDataChildren/2);
		_indexFirstData = startIndex;
		endIndex   = startIndex + sizeDataChildren;
		index = 0;
		for (i=startIndex; i<endIndex; i++,index++)
		  _dataVis[i].indexData = index;		
	  }	
   }; // Fim i_BindDataVisToData
   
};

/**
 * _calcWidthBar
 * 
 * Calcula a largura da barra do gráfico
 * Se não há barra (d.indexData == -1) não desenha
 */
function _calcWidthBar(d) {
  if (d.indexData !== -1)
	return model.barScale(model.data.children.data[d.indexData].edge.values[model.indexAttBar]);		
  else
	return 0;       // Não desenha o retângulo	
};

/**
 * _text
 * 
 * retorna o texto associado a barra
 *   número + " " + nome
 */
function _text(d) {	
	if (d.indexData !== -1) 
		return _adjustLengthText(model.data.children.data[d.indexData].labels[_cfgIndexAttr.textBar],15);
	else
		return "";
};

/**
 * _textCentroid
 * 
 * Ajusta o tamanho do texto que será impresso no titulo do centroid
 */
function _adjustLengthText( stText, limit) {
	if (stText.length > limit)
		return stText.slice(0,limit)+"...";
	else
		return stText;
};

/**
 * _tooltip
 * 
 * retorna o tooltip associado a barra
 *   
 */
function _tooltip(d) {	
	if (d.indexData !== -1) {
		return model.data.edges.valueTitle[model.indexAttBar] + ": " +
			   model.data.children.data[d.indexData].edge.values[model.indexAttBar];		
    }		
    else
    	return "";       // Tooltip Vazio
};

/**
 * _angleToWidth
 * 
 * Calcula a largura da corda do círculo a partir do ângulo (graus) e raio
 * E: angulo, radius
 * S: largura
 */
function _angleToWidth ( angle, radius) {
	return 2 * radius * Math.sin( angle*Math.PI/360.0);
};

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
 * _degreeToRadian
 * 
 * Converte um ângulo de graus para radianos
 */	
function _degreeToRadian ( angle ) {
	return angle * Math.PI / 180;
};

	
//--------------------------------- Funcoes publicas	  
	
    function chart() {}
	
	chart.box = function(_) {
	  if (!arguments.length)
	     return model.box;	 
	  model.box = _;
 
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
	chart.pMaxHeightBar = function(_) {
	  if (!arguments.length)
	     return model.pMaxHeightBar;	 
	  model.pMaxHeightBar = _;
	  return chart;
	}	
	
 	//---------------------
    // Essa função é necessário em todas as técnicas
    // É chamada internamente na conectChart	
	chart.panel = function(_) {
	  if (!arguments.length)
	     return _irisPanel;	 
	  _irisPanel = _;
 
	  return chart;
	}
	
 	//---------------------	 
  	chart.data = function(_) {
	  if (!arguments.length)
	     return model.data;
	  model.data = _;
console.log(model.data);	  
	  _irisPanel.update();	  
	  return chart;
	}

 	//---------------------	 
  	chart.dataVisToNode = function( index ) {
		return model.data.children.data[index];
	}
	
 	//---------------------	
  	return chart; 
  };


});