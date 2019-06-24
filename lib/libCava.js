/**
* LibCav
*
*/

define(["d3"], function (d3) {

  return function LibCava () {
  
  //-----------------------------------	  
	
    function lcv() {};

       //=========================== sort	
	lcv.sort = function () {
	
      var _vData = null,             // Vetor com os dados que serão classificados (dataNodes[] ou dataEdges[]
		  _vOrder = null,            // Vetor de ordenacao
		  _vLabelConfigSort = null,  // Vetor de configuração das funções de sort. Cada elemento contém 
		                                //  { ascending: true or false, desempate:[ "indexAttr":x, value: true or false, ascending: true or false]
	      _vValueConfigSort = null,
		  _indexAttrSort = 0,          // Índice do atributo que será classificado índice+1000 indica VALUE Ex: 1001
          _labelAttrSort = 0,          // Índice ajustado para o label (igual ao _indexAttrSort
          _valueAttrSort = 0,		  // Índice ajustado para o value (_indexAttrSort-1000)
	  
	         // --- Função que executa a classificacao para LABEL		   
	  _fLabelSort = function (a,b) {
	    if ( _vLabelConfigSort[_labelAttrSort].ascending)	
		  return d3.ascending( _vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
	    else
		  return d3.descending( _vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
      },	  
	  
         // --- Função que executa a classificacao para VALUE
      _fValueSort = function (a,b) {
	    if ( _vValueConfigSort[_valueAttrSort].ascending)
		   return d3.ascending( _vData[a].values[_valueAttrSort], _vData[b].values[_valueAttrSort]);
	    else
		   return d3.descending( _vData[a].values[_valueAttrSort], _vData[b].values[_valueAttrSort]);		   
      },
	  
	     // --- Função que executa a classificacao para VALUE com desempate  
      _fValueSortDesempate = function(a,b) {
	    var i, attrSortConfig, result;

	    attrSortConfig = _vValueConfigSort[_valueAttrSort];

	    for (i=0; i< attrSortConfig.vDesempate.length; i++) {
		   if (attrSortConfig.vDesempate[i].numeric) {
			  if (attrSortConfig.vDesempate[i].ascending) {
				  result = d3.ascending( _vData[a].values[attrSortConfig.vDesempate[i].indexAttr], 
									     _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
			  } else {
				  result = d3.descending( _vData[a].values[attrSortConfig.vDesempate[i].indexAttr], 
										  _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
			  }			
		   } else {
			  if (attrSortConfig.vDesempate[i].ascending) {
				  result = d3.ascending( _vData[a].labels[attrSortConfig.vDesempate[i].indexAttr], 
									     _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
			  } else {
				result = d3.descending( _vData[a].labels[attrSortConfig.vDesempate[i].indexAttr], 
										_vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
			 }			
			
		   }

           if (result !== 0)
        	  return result;		
	    }
	
	  return result;
      },
	  
	     // --- Função que executa a classificacao para LABEL com desempate 

      _fLabelSortDesempate = function(a,b) {
	    var i, attrSortConfig, result;
	
	    attrSortConfig = _vLabelConfigSort[_labelAttrSort];

	    for (i=0; i< attrSortConfig.vDesempate.length; i++) {
		  if (attrSortConfig.vDesempate[i].numeric) {
			if (attrSortConfig.vDesempate[i].ascending) {
				result = d3.ascending( _vData[a].values[attrSortConfig.vDesempate[i].indexAttr], 
									   _vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
			} else {
				result = d3.descending( _vData[a].values[attrSortConfig.vDesempate[i].indexAttr], 
										_vData[b].values[attrSortConfig.vDesempate[i].indexAttr]);
			}			
		} else {
			if (attrSortConfig.vDesempate[i].ascending) {
				result = d3.ascending( _vData[a].labels[attrSortConfig.vDesempate[i].indexAttr], 
									   _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
			} else {
				result = d3.descending( _vData[a].labels[attrSortConfig.vDesempate[i].indexAttr], 
										_vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
			}			
			
		}

        if (result !== 0)
        	return result;		
	}
	
	return result;
};

		 
	  	  
//--------------------------------- Funcoes publicas	  
      var obj = {};		  

              // Inicializa as funções de classificação para cada atributo
	  obj.inic = function (qtLabel, qtValue) {
	    var i;
		_vLabelConfigSort = [];
	    for (i=0; i< qtLabel; i++) {
		  _vLabelConfigSort.push( {fSortOrder: _fLabelSort, vDesempate: null, ascending:true, desempate:false });
	    };
		
	   _vValueConfigSort = [];
	   for (i=0; i<qtValue; i++) {
		  _vValueConfigSort.push( {fSortOrder: _fValueSort, vDesempate: null, ascending:false, desempate:false });
	   };
       return obj;
	 }

 	//---------------------	 	 	  
      obj.data = function (_) {
	    _vData = _;
	    _vOrder =  d3.range(_vData.length);
	    return obj;
	  }
	  
 	//---------------------	 	  
	  obj.getVetOrder = function () {
	    return _vOrder;
	  }

 	//---------------------	 	  
	  obj.config = function ( indexAttr, numeric, ascending, vDesempate) {	  
	    if (vDesempate===undefined) {
		   if (numeric) { // Para atributos numericos
		     _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSort, vDesempate:null, ascending: ascending, desempate: false };		  	
		   } else {
		     _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSort, vDesempate:null, ascending: ascending, desempate: false };			
		   }
	   } else {
		   vDesempate.unshift({indexAttr:indexAttr, numeric:numeric, ascending:ascending});
		   if (numeric) { // Para atributos numericos
			   _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSortDesempate, vDesempate:vDesempate, ascending: ascending, desempate: false };		  	
		   } else {
			   _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSortDesempate, vDesempate:vDesempate, ascending: ascending, desempate: false };			
		   }				
	   }	  
	    return obj;
	  }
	  
 	//---------------------	 	  
      obj.exec = function ( indexAttrSort) {
	     _indexAttrSort = indexAttrSort;

	     if (_indexAttrSort < 1000) {
		    _labelAttrSort = _indexAttrSort;
		    _vOrder.sort( function(a,b) { 
			  return _vLabelConfigSort[_labelAttrSort].fSortOrder.call(obj,a,b);
		    })
		 } else {
		    _valueAttrSort = _indexAttrSort-1000;		 
		    _vOrder.sort( function(a,b) {            			
			  return _vValueConfigSort[_valueAttrSort].fSortOrder(a,b);
		    });		  
	     }
	  }
	  
	  return obj;  
	}
	
	
       //=========================== sortIris	
	lcv.sortIris = function () {
	
      var _vData = null,             // Vetor com os dados que serão classificados (dataNodes[] ou dataEdges[]
		  _vOrder = null,            // Vetor de ordenacao
		  _vLabelConfigSort = null,  // Vetor de configuração das funções de sort. Cada elemento contém 
		                                //  { ascending: true or false, desempate:[ "indexAttr":x, value: true or false, ascending: true or false]
	      _vValueConfigSort = null,
		  _indexAttrSort = 0,          // Índice do atributo que será classificado índice+1000 indica VALUE Ex: 1001
          _labelAttrSort = 0,          // Índice ajustado para o label (igual ao _indexAttrSort
          _valueAttrSort = 0,		  // Índice ajustado para o value (_indexAttrSort-1000)
	  
	         // --- Função que executa a classificacao para LABEL		   
	  _fLabelSort = function (a,b) {
	    if ( _vLabelConfigSort[_labelAttrSort].ascending)	
		  return d3.ascending( _vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
	    else
		  return d3.descending( _vData[a].labels[_labelAttrSort], _vData[b].labels[_labelAttrSort]);
      },	  
	  
         // --- Função que executa a classificacao para VALUE
      _fValueSort = function (a,b) {
	    if ( _vValueConfigSort[_valueAttrSort].ascending)
		   return d3.ascending( _vData[a].edge.values[_valueAttrSort], _vData[b].edge.values[_valueAttrSort]);
	    else
		   return d3.descending( _vData[a].edge.values[_valueAttrSort], _vData[b].edge.values[_valueAttrSort]);		   
      },
	  
	     // --- Função que executa a classificacao para VALUE com desempate  
      _fValueSortDesempate = function(a,b) {
	    var i, attrSortConfig, result;

	    attrSortConfig = _vValueConfigSort[_valueAttrSort];

	    for (i=0; i< attrSortConfig.vDesempate.length; i++) {
		   if (attrSortConfig.vDesempate[i].numeric) {
			  if (attrSortConfig.vDesempate[i].ascending) {
				  result = d3.ascending( _vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr], 
									     _vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
			  } else {
				  result = d3.descending( _vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr], 
										  _vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
			  }			
		   } else {
			  if (attrSortConfig.vDesempate[i].ascending) {
				  result = d3.ascending( _vData[a].labels[attrSortConfig.vDesempate[i].indexAttr], 
									     _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
			  } else {
				result = d3.descending( _vData[a].labels[attrSortConfig.vDesempate[i].indexAttr], 
										_vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
			 }			
			
		   }

           if (result !== 0)
        	  return result;		
	    }
	
	  return result;
      },
	  
	     // --- Função que executa a classificacao para LABEL com desempate 

      _fLabelSortDesempate = function(a,b) {
	    var i, attrSortConfig, result;
	
	    attrSortConfig = _vLabelConfigSort[_labelAttrSort];

	    for (i=0; i< attrSortConfig.vDesempate.length; i++) {
		  if (attrSortConfig.vDesempate[i].numeric) {
			if (attrSortConfig.vDesempate[i].ascending) {
				result = d3.ascending( _vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr], 
									   _vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
			} else {
				result = d3.descending( _vData[a].edge.values[attrSortConfig.vDesempate[i].indexAttr], 
										_vData[b].edge.values[attrSortConfig.vDesempate[i].indexAttr]);
			}			
		} else {
			if (attrSortConfig.vDesempate[i].ascending) {
				result = d3.ascending( _vData[a].labels[attrSortConfig.vDesempate[i].indexAttr], 
									   _vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
			} else {
				result = d3.descending( _vData[a].labels[attrSortConfig.vDesempate[i].indexAttr], 
										_vData[b].labels[attrSortConfig.vDesempate[i].indexAttr]);
			}			
			
		}

        if (result !== 0)
        	return result;		
	}
	
	return result;
};

		 
	  	  
//--------------------------------- Funcoes publicas	  
      var obj = {};		  

              // Inicializa as funções de classificação para cada atributo
	  obj.inic = function (qtLabel, qtValue) {
	    var i;
		_vLabelConfigSort = [];
	    for (i=0; i< qtLabel; i++) {
		  _vLabelConfigSort.push( {fSortOrder: _fLabelSort, vDesempate: null, ascending:true, desempate:false });
	    };
		
	   _vValueConfigSort = [];
	   for (i=0; i<qtValue; i++) {
		  _vValueConfigSort.push( {fSortOrder: _fValueSort, vDesempate: null, ascending:false, desempate:false });
	   };
       return obj;
	 }

 	//---------------------	 	 	  
      obj.data = function (_) {
	    _vData = _;
	    _vOrder =  d3.range(_vData.length);
	    return obj;
	  }
	  
 	//---------------------	 	  
	  obj.getVetOrder = function () {
	    return _vOrder;
	  }

 	//---------------------	 	  
	  obj.config = function ( indexAttr, numeric, ascending, vDesempate) {	  
	    if (vDesempate===undefined) {
		   if (numeric) { // Para atributos numericos
		     _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSort, vDesempate:null, ascending: ascending, desempate: false };		  	
		   } else {
		     _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSort, vDesempate:null, ascending: ascending, desempate: false };			
		   }
	   } else {
		   vDesempate.unshift({indexAttr:indexAttr, numeric:numeric, ascending:ascending});
		   if (numeric) { // Para atributos numericos
			   _vValueConfigSort[indexAttr] = { fSortOrder: _fValueSortDesempate, vDesempate:vDesempate, ascending: ascending, desempate: false };		  	
		   } else {
			   _vLabelConfigSort[indexAttr] = { fSortOrder: _fLabelSortDesempate, vDesempate:vDesempate, ascending: ascending, desempate: false };			
		   }				
	   }	  
	    return obj;
	  }
	  
 	//---------------------	 	  
      obj.exec = function ( indexAttrSort) {
	     _indexAttrSort = indexAttrSort;

	     if (_indexAttrSort < 1000) {
		    _labelAttrSort = _indexAttrSort;
		    _vOrder.sort( function(a,b) { 
			  return _vLabelConfigSort[_labelAttrSort].fSortOrder.call(obj,a,b);
		    })
		 } else {
		    _valueAttrSort = _indexAttrSort-1000;		 
		    _vOrder.sort( function(a,b) {            			
			  return _vValueConfigSort[_valueAttrSort].fSortOrder(a,b);
		    });		  
	     }
	  }
	  
	  return obj;  
	}
	
	
	
	
	
	
	
	
       //=========================== Retorna TOOLTIPS
	lcv.tooltips = function () {
		var _colorTitle = "#238f23";
		var obj={};

		//---------- Funcoes privadas
		
		function _addIconeEdge(svgTooltip) {
			svgTooltip.append("circle")
					.attr("cx",21)
					.attr("cy",9)
					.attr("r",3)
					.style("fill","blue");					

			svgTooltip.append("line")
					.attr("x1",21)
					.attr("y1",9)
					.attr("x2",9)
					.attr("y2",26)
					.style("stroke","blue");					
					
			svgTooltip.append("circle")
					.attr("cx",9)
					.attr("cy",26)
					.attr("r",3)
					.style("fill","blue");					
		}
		
		//---------- Funcoes publicas
		
		obj.normalNode = function( data, indexAttrTitle, vIndexAttr , stAdjacent) {
			var _data = data,
				_indexAttrTitle = indexAttrTitle,	// Indice do atributo que será impresso no título do tooltip
				_vIndexAttr = vIndexAttr,  		// Vetor com o índice dos atributos que serão impressos
				_stAdjacent = stAdjacent,  		// String que representa o significado dos nodos adjacentes
				_divTooltip=null,
				_svgTooltip=null;
			
			var objNormal = {};
			
			objNormal.create = function (divTooltip, node) {
				var y=54, 
					height = _vIndexAttr.length * 14 + 49,
//					height = 35,   // Usada para imprimir somente a quantidade de coautores					
					width; 
				
//				width = 7 * node.labels[_indexAttrTitle].length; // Estava assim para criar uma largura variavel
				width = 190;

				if (width < 90)
					width = 90;
				_divTooltip = divTooltip;
				_svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", height);
				_svgTooltip.append("text")      // Titulo
					.attr("x",5)
					.attr("y",12)
					.text(node.labels[_indexAttrTitle]);
					
				_svgTooltip.append("text")    // n co-authors
					.attr("x",5)
					.attr("y",26)
					.text(node.grau + " " + _stAdjacent);
					
				_vIndexAttr.forEach( function (d,i) {
					if (d >= 1000) {
						_svgTooltip.append("text")
							.attr("x",5)
							.attr("y", i*14 + y)
							.text( _data.nodes.valueTitle[d-1000] + ": " + node.values[d-1000]);						
					} else {
						_svgTooltip.append("text")
							.attr("x",5)
							.attr("y", i*14 + y)
							.text( _data.nodes.labelTitle[d] + ": " + node.labels[d]);						
					}
						
				
				});

				_divTooltip.style("top", (d3.event.layerY + 20)+"px")
							.style("left", d3.event.layerX + "px")					
							.style("display","block");					
			}
			
			objNormal.remove = function() {
				_divTooltip.style("display","none");			
				_svgTooltip.remove();
				_svgTooltip = null;
			}
			
			return objNormal;
		}
//------------------ Tooltip Cluster Louvain
		obj.clusterLouvainNode = function() {
			var _divTooltip=null,
				_svgTooltip=null;
			
			var objCluster = {};
			
			objCluster.create = function (divTooltip, node) {
				_divTooltip = divTooltip;
				
				_svgTooltip = _divTooltip.append("svg").attr("width", 65).attr("height", 53);	
				_svgTooltip.append("text")    // n co-authors
					.attr("x",5)
					.attr("y",12)
					.style("fill",_colorTitle)
					.text( "Cluster " + node.key);
					
				_svgTooltip.append("text")    // n co-authors
					.attr("x",5)
					.attr("y",35)
					.text(node.qtNodes + " nodes");					

				_svgTooltip.append("text")    // n co-authors
					.attr("x",5)
					.attr("y",49)
					.text(node.qtEdges + " edges");					
					
				_divTooltip.style("top", (d3.event.layerY + 20)+"px")
							.style("left", d3.event.layerX + "px")					
							.style("display","block");						
			}
			
			objCluster.remove = function() {
				_divTooltip.style("display","none");			
				_svgTooltip.remove();
				_svgTooltip = null;
			}
			
			return objCluster;
		}
		
//------------------ Tooltip Cluster Attribute
		obj.clusterAttributeNode = function( data, indexAttr) {
			var _data = data,
				_indexAttr = indexAttr,
				_divTooltip=null,
				_svgTooltip=null;
			
			var objCluster = {};
			
			objCluster.create = function (divTooltip, node) {
				var	width,stTemp;

				if (_indexAttr >= 1000)
					stTemp = _data.nodes.valueTitle[_indexAttr-1000] + "=" + node.key;
				else
					stTemp = _data.nodes.labelTitle[_indexAttr] + "=" + node.key;
					
				width = Math.round(6.5 * stTemp.length);
				if (width < 70)
					width = 70;
				
				_divTooltip = divTooltip;
				
				_svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", 68);	
				_svgTooltip.append("text")    
					.attr("x",5)
					.attr("y",12)
					.style("fill",_colorTitle)
					.text("Nodes with");
					
				_svgTooltip.append("text")    
					.attr("x",5)
					.attr("y",26)
					.style("fill",_colorTitle)						
					.text( stTemp);
					
				_svgTooltip.append("text")    
					.attr("x",5)
					.attr("y",49)				
					.text(node.qtNodes + " nodes");

				_svgTooltip.append("text")    
					.attr("x",5)
					.attr("y",63)
					.text(node.qtEdges + " edges");						

				_divTooltip.style("top", (d3.event.layerY + 20)+"px")
							.style("left", d3.event.layerX + "px")					
							.style("display","block");						
			}
			
			objCluster.remove = function() {
				_divTooltip.style("display","none");			
				_svgTooltip.remove();
				_svgTooltip = null;
			}
			
			return objCluster;
		}
		
//------------------ Tooltip Normal Edge
		obj.normalEdge = function(  data, indexAttrTitle,vIndexAttr) {
			var _data = data,
				_indexAttrTitle = indexAttrTitle,
				_vIndexAttr = vIndexAttr,
				_divTooltip=null,
				_svgTooltip=null;
			
			var objNormalEdge = {};
			
			objNormalEdge.create = function (divTooltip, edge) {
				var y=54,
					attNodeSrc, attNodeTgt,
					height = _vIndexAttr.length * 14 + 49,
					width, widthSrc,widthTgt;
									
				if (_indexAttrTitle >= 1000) {
					attNodeSrc = edge.source.values[ _indexAttrTitle-1000];
					attNodeTgt = edge.target.values[ _indexAttrTitle-1000];
				} else {
					attNodeSrc = edge.source.labels[ _indexAttrTitle];
					attNodeTgt = edge.target.labels[ _indexAttrTitle];				
				}
				
				widthSrc =  34 + attNodeSrc.length * 7;
				widthTgt =  22 + attNodeTgt.length * 7;
				
				if (widthSrc > widthTgt)
					width = widthSrc;
				else
					width = widthTgt;

				if (width < 90)
					width = 90;
				
				_divTooltip = divTooltip;
				
				_svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", height);	

			//----- Icone da aresta
				_addIconeEdge(_svgTooltip);			

				// --------------
				
				_svgTooltip.append("text") 
					.attr("x",34)
					.attr("y",12)
					.text(attNodeSrc);
					
				_svgTooltip.append("text") 
					.attr("x",22)
					.attr("y",30)
					.text(attNodeTgt);

				_vIndexAttr.forEach( function (d,i) {
					if (d >= 1000) {
						_svgTooltip.append("text")
							.attr("x",8)
							.attr("y", i*14 + y)
							.text( _data.edges.valueTitle[d-1000] + ": " + edge.values[d-1000]);						
					} else {
						_svgTooltip.append("text")
							.attr("x",8)
							.attr("y", i*14 + y)
							.text( _data.edges.labelTitle[d] + ": " + edge.labels[d]);						
					}				
				});					
					
				_divTooltip.style("top", (d3.event.layerY + 20)+"px")
							.style("left", d3.event.layerX + "px")					
							.style("display","block");						
			}
			
			objNormalEdge.remove = function() {
				_divTooltip.style("display","none");			
				_svgTooltip.remove();
				_svgTooltip = null;
			}			
			return objNormalEdge;
		}
		
//------------------ Tooltip Cluster Louvain Edge
		obj.clusterLouvainEdge = function() {
			var _divTooltip=null,
				_svgTooltip=null;
			
			var objLouvainEdge = {};
			
			objLouvainEdge.create = function (divTooltip, edge) {
				_divTooltip = divTooltip;
				
				_svgTooltip = _divTooltip.append("svg").attr("width", 88).attr("height", 60);	

			//----- Icone da aresta
				_addIconeEdge(_svgTooltip);			

				// --------------
				
				_svgTooltip.append("text") 
					.attr("x",34)
					.attr("y",12)
					.text("Cluster " + edge.source.key);
					
				_svgTooltip.append("text") 
					.attr("x",22)
					.attr("y",30)
					.text("Cluster " + edge.target.key);
					
				_svgTooltip.append("text")
							.attr("x",8)
							.attr("y", 54)
							.text( edge.qt + " edges ");					
					
				_divTooltip.style("top", (d3.event.layerY + 20)+"px")
							.style("left", d3.event.layerX + "px")					
							.style("display","block");						
			}
			
			objLouvainEdge.remove = function() {
				_divTooltip.style("display","none");			
				_svgTooltip.remove();
				_svgTooltip = null;
			}			
			return objLouvainEdge;
		}
		
//------------------ Tooltip Cluster Attribute Edge
		obj.clusterAttributeEdge = function(data,indexAttr) {
			var _data = data,
				_indexAttr = indexAttr,
				_divTooltip=null,
				_svgTooltip=null;
			
			var objAttributeEdge = {};
			
			objAttributeEdge.create = function (divTooltip, edge) {
				var stTempSrc,stTempTgt,widthSrc,widthTgt,width;
				
				_divTooltip = divTooltip;
				
				if (_indexAttr >= 1000) {
					stTempSrc = _data.nodes.valueTitle[_indexAttr-1000] + "=" + edge.source.key;
					stTempTgt = _data.nodes.valueTitle[_indexAttr-1000] + "=" + edge.target.key;					
				} else {
					stTempSrc = _data.nodes.labelTitle[_indexAttr] + "=" + edge.source.key;
					stTempTgt = _data.nodes.labelTitle[_indexAttr] + "=" + edge.target.key;					
				}
					
				widthSrc = 34 + Math.round(6.5 * stTempSrc.length);
				widthTgt = 22 + Math.round(6.5 * stTempTgt.length);
				
				if (widthSrc > widthTgt)
					width = widthSrc;
				else
					width = widthTgt;

				if (width < 90)
					width = 90;							
				
				_svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", 60);	

			//----- Icone da aresta
				_addIconeEdge(_svgTooltip);			

				// --------------
				
				_svgTooltip.append("text") 
					.attr("x",34)
					.attr("y",12)
					.text(stTempSrc);
					
				_svgTooltip.append("text") 
					.attr("x",22)
					.attr("y",30)
					.text(stTempTgt);
					
				_svgTooltip.append("text")
							.attr("x",8)
							.attr("y", 54)
							.text( edge.qt + " edges ");					
					
				_divTooltip.style("top", (d3.event.layerY + 20)+"px")
							.style("left", d3.event.layerX + "px")					
							.style("display","block");						
			}
			
			objAttributeEdge.remove = function() {
				_divTooltip.style("display","none");			
				_svgTooltip.remove();
				_svgTooltip = null;
			}			
			return objAttributeEdge;
		}

//------------------ Tooltip MatrixGliph Cell		
		obj.matrixCell = function(data, glyph, indexAttrTitle) {
			var _data = data,
				_glyph = glyph,
				_indexAttrTitle = indexAttrTitle,
				_divTooltip=null,
				_svgTooltip=null;

			var objMatrixGlyphCell = {};
			
			objMatrixGlyphCell.create = function (divTooltip, cell) {
				var height = 190,
					width,
					attNodeSrc, attNodeTgt, widthSrc,widthTgt,
					grpGlyphTooltip;

				if (_indexAttrTitle >= 1000) {
					attNodeSrc = _data.nodes.dataNodes[cell.x].values[_indexAttrTitle-1000];
					attNodeTgt = _data.nodes.dataNodes[cell.y].values[_indexAttrTitle-1000];
				} else {
					attNodeSrc = _data.nodes.dataNodes[cell.x].labels[_indexAttrTitle];
					attNodeTgt = _data.nodes.dataNodes[cell.y].labels[_indexAttrTitle];				
				}

//				widthSrc =  34 + attNodeSrc.length * 7;  // Cálculo da largura original
//				widthTgt =  22 + attNodeTgt.length * 7;

				widthSrc =  270;
				widthTgt =  270;

				
				if (widthSrc > widthTgt)
					width = widthSrc;
				else
					width = widthTgt;

				if (width < 130)
					width = 130;				

				_divTooltip = divTooltip;
				
				_svgTooltip = _divTooltip.append("svg").attr("width", width).attr("height", height);
				
			//----- Icone da aresta
				_addIconeEdge(_svgTooltip);			

				// --------------
				
				_svgTooltip.append("text") 
					.attr("x",34)
					.attr("y",12)
					.text(attNodeSrc);
					
				_svgTooltip.append("text") 
					.attr("x",22)
					.attr("y",30)
					.text(attNodeTgt);
					
				grpGlyphTooltip	= _svgTooltip.append("g")
											 .attr("transform", "translate(0,60)");										 

				_glyph.calcScaleTooltip(width,100); // Altura e diâmetro do tooltip
				_glyph.drawTooltip(grpGlyphTooltip,cell);
				
				_divTooltip.style("top", (d3.event.layerY + 20)+"px")
							.style("left", d3.event.layerX + "px")					
							.style("display","block");

			}
			
			objMatrixGlyphCell.remove = function() {
				_divTooltip.style("display","none");			
				_svgTooltip.remove();
				_svgTooltip = null;
			}
			
			return objMatrixGlyphCell;
		}		
		
//-----------------		
		return obj;
	}
	
       //=========================== Retorna subgrafos	
	lcv.subGraph = function () {

	  //--------------
	  // graphEdges: Arestas originais do grafo
	  
	  function _addEdges( vNodes, vEdges, graphEdges  ) {
	  	var i,j,qtNodes,qtEdges;	
		qtNodes = vNodes.length;
		
			//------- Inclui as arestas
		vNodes.forEach ( function (node,k) {
			graphEdges.forEach( function (edge) {
				if (edge.src == node.idOrig) {
					for (i=k+1; i<qtNodes; i++) {
						if (edge.tgt==vNodes[i].idOrig) {
							vEdges.push( { src: edge.src,
										   tgt: edge.tgt,
										   labels: edge.labels, 
										   values: edge.values 
									 });
							break;
						}
					}
				} else {
					if (edge.tgt == node.idOrig) {				
						for (i=k+1; i<qtNodes; i++) {						
							if (edge.src===vNodes[i].idOrig) {					
								vEdges.push( { src: edge.src,
											   tgt: edge.tgt,
											   labels: edge.labels, 
										       values: edge.values 
										});
								break;
							}
						}							
					}
				}	
			});
		
		}); 
				//------- Ajusta os id para ficar de acordo com osíndices
		qtNodes = vNodes.length;
		qtEdges = vEdges.length;
		
		for (i=0; i<qtEdges; i++) {
			for(j=0; j<qtNodes; j++) {
				if (vNodes[j].idOrig==vEdges[i].src) {
					vEdges[i].src = j;
					break;
				}
			}
			for(j=0; j<qtNodes; j++) {
				if (vNodes[j].idOrig==vEdges[i].tgt) {
					vEdges[i].tgt = j;
					break;
				}
			}		
		}

		vNodes.forEach ( function (node,k)	 {
			node.id=k;
		});		
	  }
//--------------- Adiciona as arestas na matriz de arestas

	  function _addEdgesMatrix( vNodes, vMatrix, graphEdges  ) {
	  	var i,j,qtNodes,qtEdges,
		    vEdges = [];   // Variável auxiliar para armazenar temporariamente o conjunto de arestas
		
		qtNodes = vNodes.length;
		
			//------- Inclui as arestas
		vNodes.forEach ( function (node,k) {
			graphEdges.forEach( function (edge) {
				if (edge.src == node.idOrig) {
					for (i=k+1; i<qtNodes; i++) {
						if (edge.tgt==vNodes[i].idOrig) {
							vEdges.push( { src: edge.src,
										   tgt: edge.tgt,
										   labels: edge.labels, 
										   values: edge.values 
									 });
							break;
						}
					}
				} else {
					if (edge.tgt == node.idOrig) {				
						for (i=k+1; i<qtNodes; i++) {						
							if (edge.src===vNodes[i].idOrig) {					
								vEdges.push( { src: edge.src,
											   tgt: edge.tgt,
											   labels: edge.labels, 
										       values: edge.values 
										});
								break;
							}
						}							
					}
				}	
			});
		
		}); 
				//------- Ajusta os id para ficar de acordo com osíndices
		qtNodes = vNodes.length;
		qtEdges = vEdges.length;
		
		for (i=0; i<qtEdges; i++) {
			for(j=0; j<qtNodes; j++) {
				if (vNodes[j].idOrig==vEdges[i].src) {
					vEdges[i].src = j;
					break;
				}
			}
			for(j=0; j<qtNodes; j++) {
				if (vNodes[j].idOrig==vEdges[i].tgt) {
					vEdges[i].tgt = j;
					break;
				}
			}		
		}

		vNodes.forEach ( function (node,k)	 {
			node.id=k;
		});
		
		vEdges.forEach( 
			function (d,i) { 
				  vMatrix[d.src].push( { "x":d.tgt, "y":d.src, "exist":true,"labels": d.labels,"values": d.values});
				  vMatrix[d.tgt].push( { "x":d.src, "y":d.tgt, "exist":true,"labels": d.labels,"values": d.values});				  
			}			
		);
	  }
	  
	//--------------------------------- Funcoes publicas	  
      var obj = {};	

	/*--------------------------------- 
	 * Retorna o grafo no formato ClusterVis do grafo contido no nodo do tipo Cluster
	 */
	  obj.clusterClusterVis = function (clusterNode, graphData) {	
	   	var result = {
			nodes : {
				labelTitle : graphData.nodes.labelTitle,
				valueTitle : graphData.nodes.valueTitle,
				imageTitle : graphData.nodes.imageTitle,
				dataNodes  : []		   
			},
			edges : {
				labelTitle: graphData.edges.labelTitle,
				valueTitle: graphData.edges.valueTitle,
				dataEdges: []
			}	
		};

			// Inclui todos os nodos do cluster node
		clusterNode.values.forEach( function (node) {	
			result.nodes.dataNodes.push( {	id: node.id,
											idOrig: node.idOrig,
											labels: node.labels, 
											values: node.values, 
											images: node.images
									 });		
		});	

		_addEdges(result.nodes.dataNodes, result.edges.dataEdges, graphData.edges.dataEdges);		
		return result;
	  }
	  
	/*--------------------------------- 
	 * Nodo e seus adjacentes ClusterVis
	 */
	  obj.normalClusterVis = function (normalNode, graphData) {
	   	var result = {
			nodes : {
				labelTitle : graphData.nodes.labelTitle,
				valueTitle : graphData.nodes.valueTitle,
				imageTitle : graphData.nodes.imageTitle,
				dataNodes  : []		   
			},
			edges : {
				labelTitle: graphData.edges.labelTitle,
				valueTitle: graphData.edges.valueTitle,
				dataEdges: []
			}	
		};
			// Inclui o nodo passado como argumento
		result.nodes.dataNodes.push( { id: normalNode.id,
										idOrig: normalNode.idOrig,
									   labels: normalNode.labels, 
									   values:normalNode.values, 
									   images:normalNode.images
									 });
									 
		graphData.edges.dataEdges.forEach( function (d) {
			if ( d.src == normalNode.idOrig)
			   result.nodes.dataNodes.push( { id: graphData.nodes.dataNodes[d.tgt].id,
			   								  idOrig: graphData.nodes.dataNodes[d.tgt].idOrig,
											  labels: graphData.nodes.dataNodes[d.tgt].labels, 
											  values: graphData.nodes.dataNodes[d.tgt].values, 
											  images: graphData.nodes.dataNodes[d.tgt].images
									 });
			else 
			   if ( d.tgt == normalNode.idOrig)
				result.nodes.dataNodes.push( { id: graphData.nodes.dataNodes[d.src].id, 
			   								  idOrig: graphData.nodes.dataNodes[d.src].idOrig,				
											  labels: graphData.nodes.dataNodes[d.src].labels, 
											  values: graphData.nodes.dataNodes[d.src].values, 
											  images: graphData.nodes.dataNodes[d.src].images
									 });
			
		});
		   // Inclui somente arestas que ligam os nodos existentes
		_addEdges(result.nodes.dataNodes, result.edges.dataEdges, graphData.edges.dataEdges);

		return result;
	  }
	  
	/*--------------------------------- 
	 * Nodo e seus adjacentes Iris
	 */
	  obj.normalIris = function (normalNode, graphData) {
	   	var result = {
			root  : {
				labelTitle : graphData.nodes.labelTitle,
				valueTitle : graphData.nodes.valueTitle,
				imageTitle : graphData.nodes.imageTitle,
				data : {
					id: normalNode.id,
					idOrig: normalNode.idOrig,
					labels: normalNode.labels, 
					values:normalNode.values, 
					images:normalNode.images					
				}
			},
			children : {
				labelTitle : graphData.nodes.labelTitle,
				valueTitle : graphData.nodes.valueTitle,
				imageTitle : graphData.nodes.imageTitle,
				data : []           // Dados dos nodos filhos e da aresta que o liga ao raiz
			},
			edges: {
				labelTitle : graphData.edges.labelTitle,
				valueTitle : graphData.edges.valueTitle,
				data : [] // Dados das demais arestas (que nao se ligam ao raiz( FALTA IMPLEMENTAR
			}
		};
		
		graphData.edges.dataEdges.forEach(
			function (d,i) {
				if (d.src === normalNode.idOrig) {
					result.children.data.push({
					                       id: graphData.nodes.dataNodes[d.tgt].id,
										   idOrig: graphData.nodes.dataNodes[d.tgt].idOrig,										   
					                       labels: graphData.nodes.dataNodes[d.tgt].labels,
					                       values: graphData.nodes.dataNodes[d.tgt].values,
					                       images: graphData.nodes.dataNodes[d.tgt].images,
										   edge: {
												src: d.src,
												tgt: d.tgt,
												labels: d.labels,
												values: d.values												
										         }
					                       });			
				} else 
					if (d.tgt === normalNode.idOrig) {
						result.children.data.push({
					                       id: graphData.nodes.dataNodes[d.src].id,
										   idOrig: graphData.nodes.dataNodes[d.src].idOrig,											   
					                       labels: graphData.nodes.dataNodes[d.src].labels,
					                       values: graphData.nodes.dataNodes[d.src].values,
					                       images: graphData.nodes.dataNodes[d.src].images,
										   edge: {
												src: d.tgt,
												tgt: d.src,
												labels: d.labels,
												values: d.values												
										         }
					                       });					
					} 
			}			
		);		
		return result;
	  }
	  
	/*--------------------------------- 
	 * Cluster MatrixGlyph
	 */
	  obj.clusterMatrixGlyph = function (clusterNode, graphData) {
		var result = {
			nodes : {
				labelTitle : graphData.nodes.labelTitle,
				valueTitle : graphData.nodes.valueTitle,
				imageTitle : graphData.nodes.imageTitle,
				dataNodes  : []		   
			},
			edges : graphData.edges.valueTitle,			
			matrix : []
		};

			// Inclui todos os nodos do cluster node
		clusterNode.values.forEach( function (node) {	
			result.nodes.dataNodes.push( {	id: node.id,
											idOrig: node.idOrig,
											labels: node.labels, 
											values: node.values, 
											images: node.images
									 });		
		});	
		
		
		result.nodes.dataNodes.forEach( 
			function (d,i) {
				result.matrix[i] = [];
			}			
		);
		
		_addEdgesMatrix(result.nodes.dataNodes, result.matrix, graphData.edges.dataEdges);	

		return result;		
	  }

	/*--------------------------------- 
	 * Arestas entre 2 clusters
	 */
	  obj.edgesBtClustersMatrixGlyph = function (edge, graphData) {
		var i,idClusterA, idClusterB,achei,nodeSrc, nodeTgt,qtNodes,qtEdges, 
		     vEdges = [];   // Variável auxiliar para armazenar temporariamente o conjunto de arestas		
		var result = {
			nodes : {
				labelTitle : graphData.nodes.labelTitle,
				valueTitle : graphData.nodes.valueTitle,
				imageTitle : graphData.nodes.imageTitle,
				dataNodes  : []		   
			},
			edges : graphData.edges.valueTitle,			
			matrix : []
		};
	
		idClusterA = edge.source.idCluster;
		idClusterB = edge.target.idCluster;
		
		console.log("IDCLUSTER: " + idClusterA + " " + idClusterB);

	// Inclui nodos pertencentes a clusters distintos ligados por uma aresta
		for (i=0; i< graphData.edges.qtEdges; i++) {
			nodeSrc = i_findNormalNode(graphData.edges.dataEdges[i].src);
			nodeTgt = i_findNormalNode(graphData.edges.dataEdges[i].tgt);			
			if (nodeSrc==null || nodeTgt==null)
				alert("Node not found!");
			if ( nodeSrc.idCluster == idClusterA && nodeTgt.idCluster == idClusterB || 
				nodeSrc.idCluster == idClusterB && nodeTgt.idCluster == idClusterA) {
				vEdges.push( {
							src: graphData.edges.dataEdges[i].src,
							tgt: graphData.edges.dataEdges[i].tgt,
							labels: graphData.edges.dataEdges[i].labels, 
							values: graphData.edges.dataEdges[i].values 
							});				
				i_addNode(nodeSrc, result.nodes.dataNodes);
				i_addNode(nodeTgt, result.nodes.dataNodes);				
			}
		}	  


		// Inicializa a matrix de arestas
		result.nodes.dataNodes.forEach( 
			function (d,i) {
				result.matrix[i] = [];
			}			
		);

				//------- Ajusta os id para ficar de acordo com osíndices
		qtNodes = result.nodes.dataNodes.length;
		qtEdges = vEdges.length;
		
		for (i=0; i<qtEdges; i++) {
			for(j=0; j<qtNodes; j++) {
				if (result.nodes.dataNodes[j].id==vEdges[i].src) {
					vEdges[i].src = j;
					break;
				}
			}
			for(j=0; j<qtNodes; j++) {
				if (result.nodes.dataNodes[j].id==vEdges[i].tgt) {
					vEdges[i].tgt = j;
					break;
				}
			}		
		}

		result.nodes.dataNodes.forEach ( function (node,k)	 {
			node.id=k;
		});
		
		vEdges.forEach( 
			function (d,i) { 
				  result.matrix[d.src].push( { "x":d.tgt, "y":d.src, "exist":true,"labels": d.labels,"values": d.values});
				  result.matrix[d.tgt].push( { "x":d.src, "y":d.tgt, "exist":true,"labels": d.labels,"values": d.values});				  
			}			
		);

		// A função abaixo não funciona aqui porque não pode colocar a arestas entre todos os nodos armazenados, mas
		// somente entre os nodos de cluster diferente
//		_addEdgesMatrix(result.nodes.dataNodes, result.matrix, graphData.edges.dataEdges);
		return result;

		//---- Procura o nodo que possui o id passado como argumento
		function i_findNormalNode(id) {
			var i;
			for (i=0; i<graphData.nodes.qtNodes; i++ ) {
				if (graphData.nodes.dataNodes[i].id == id)
					return graphData.nodes.dataNodes[i];
			}
			return null;
		}		
		
		//---- Adiciona um nodo em vNodo se ele ainda não existir lá
		function i_addNode(node, vNodes) {
			var achei, i;
		
			achei = false;
			for (i=0; i<vNodes.length; i++) {
				if ( node.id == vNodes[i].id) {
					achei = true;
					break;
				}
			}
			if (!achei) {
				vNodes.push( {	id: node.id, 
								labels: node.labels, 
								values: node.values, 
								images: node.images
							});						
					
			}		
		}
	  }



	  
	/*--------------------------------- 
	 * Nodo e seus adjacentes MatrixGlyph
	 */
	  obj.normalMatrixGlyph = function (normalNode, graphData) {
	  
		var result = {
			nodes : {
				labelTitle : graphData.nodes.labelTitle,
				valueTitle : graphData.nodes.valueTitle,
				imageTitle : graphData.nodes.imageTitle,
				dataNodes  : []		   
			},
			edges : graphData.edges.valueTitle,
			matrix : []
		};	

			// Inclui o nodo passado como argumento
		result.nodes.dataNodes.push( { id: normalNode.id,
									   idOrig: normalNode.idOrig,
									   labels: normalNode.labels, 
									   values:normalNode.values, 
									   images:normalNode.images
									 });
									 
		graphData.edges.dataEdges.forEach( function (d) {
			if ( d.src == normalNode.idOrig)
			   result.nodes.dataNodes.push( { id: graphData.nodes.dataNodes[d.tgt].id, 
											  idOrig: graphData.nodes.dataNodes[d.tgt].idOrig, 			   
											  labels: graphData.nodes.dataNodes[d.tgt].labels, 
											  values: graphData.nodes.dataNodes[d.tgt].values, 
											  images: graphData.nodes.dataNodes[d.tgt].images
									 });
			else 
			   if ( d.tgt == normalNode.idOrig)
					result.nodes.dataNodes.push( { id: graphData.nodes.dataNodes[d.src].id, 
												idOrig: graphData.nodes.dataNodes[d.src].idOrig,
											  labels: graphData.nodes.dataNodes[d.src].labels, 
											  values: graphData.nodes.dataNodes[d.src].values, 
											  images: graphData.nodes.dataNodes[d.src].images
									 });
			
		});		
		
		result.nodes.dataNodes.forEach( 
			function (d,i) {
				result.matrix[i] = [];
			}			
		);
		
		_addEdgesMatrix(result.nodes.dataNodes, result.matrix, graphData.edges.dataEdges);		
	  
		return result;
	  }
//---------------------------	  
	  return obj;
	}
	
	return lcv; 
  };

});