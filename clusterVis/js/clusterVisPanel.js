/**
* clusterVisPanel
*
*/

define([], function () {

  return function ClusterVisPanel (clusterVisChart) {
	var _clusterVisChart = clusterVisChart,
	    _width = 170,
		_height = 105,
		_selectOrder = null,
		_vSelectAneis = [],
		_vDivAneis = [],
		_vAttrSelecionaveis = [],
		_idPanel;     // Atribuido na função create
 
  //-----------------------------------		
    function _addSelectOrder( idDivPanel) {
	  _selectOrder = $("<select>", { class: "CV-selOrderBy"});
	  $(idDivPanel).append( $("<br/>") ).append( $("<label>").append("&nbsp;Order by:")).append(_selectOrder);
	  _addItemsSelectOrder();
	}
	
  //-----------------------------------		
	function _addCheckBoxScale( idDivPanel) {
		var div, checkbox;
		checkbox = $("<input>", { 
			type: "checkbox"
		}).click( function (event){
			_clusterVisChart.acSameScale(this.checked);
		});
		
		div = $("<div>");
		div.append( $("<br/>") );
		div.append(checkbox); //.append( $("<label>").append("Same scale"));
		div.append("Same scale");
		
		$(idDivPanel).append(div);		
//	  checkbox = $("<input>", { type: "checkbox"}).append("Same scale");
//	  $(idDivPanel).append( checkbox);	
	}
	
  //-----------------------------------		
    function _addBotoesSelect( idDivPanel) {
		var idDiv = $("<div>", { class: "CV-aneis"});
		$(idDivPanel).append(  $("<label>").append("&nbsp;"));		
		$(idDivPanel).append(idDiv);
        $(idDivPanel + " .CV-aneis").append(  $("<label>").append("&nbsp;Rings:"));
		$(idDivPanel + " .CV-aneis").append($("<button>",{class: "CV-BtMais"}));			
		$(idDivPanel + " .CV-aneis").append($("<button>",{class: "CV-BtMenos"}));
		
		   //------- Botao mais
		$( idDivPanel + " .CV-BtMais" ).button({
					label : "+"
		}).click( function(event) {   //------------- Clique do botão mais
			var vRings,indexUltimo,divAneis,i,indexProcurado;

			vRings = _clusterVisChart.obtemRings();		
			indexUltimo = vRings.length-1;
			if (indexUltimo <= 5) {
				if (vRings[indexUltimo].typeAttr=="V")
					_clusterVisChart.addAttribute(vRings[indexUltimo].indexAttr,"V");			
				else
					_clusterVisChart.addAttribute(vRings[indexUltimo].indexAttr,"L");
				divAneis = "#"+ _idPanel + " .CV-aneis";

				vRings = _clusterVisChart.obtemRings();   // Atualiza os dados dos aneis		
				indexUltimo = vRings.length-1;
				
				_vSelectAneis[indexUltimo] =  $("<select>", { class: "CV-selAneis"});
			    _vDivAneis[indexUltimo] = $("<div>");
				$(_vDivAneis[indexUltimo]).append( $("<label>").append("&nbsp;" + (indexUltimo+1) + ":&nbsp;")).append(_vSelectAneis[indexUltimo]);
				$(divAneis).append(_vDivAneis[indexUltimo]);
//				$(divAneis).append( $("<br/>") ).append( $("<label>").append("&nbsp;" + (indexUltimo+1) + ":&nbsp;"))
//						.append(_vSelectAneis[indexUltimo]);

				$("#"+_idPanel+" .CV-panel").css({"height": _height + vRings.length*19});
	
				for (i=0; i<_vAttrSelecionaveis.length; i++) {
					if ( _vAttrSelecionaveis[i] >= 1000)
						_vSelectAneis[indexUltimo].append(new Option(_clusterVisChart.data().nodes.valueTitle[_vAttrSelecionaveis[i]-1000], _vAttrSelecionaveis[i]));
					else
						_vSelectAneis[indexUltimo].append(new Option(_clusterVisChart.data().nodes.labelTitle[_vAttrSelecionaveis[i]], _vAttrSelecionaveis[i]));
				}

		
				if (vRings[indexUltimo].typeAttr == "V")
					indexProcurado = vRings[indexUltimo].indexAttr + 1000;
				else
					indexProcurado = vRings[indexUltimo].indexAttr;
			
				for (i=0; i< _vAttrSelecionaveis.length; i++) {
					if (_vAttrSelecionaveis[i] == indexProcurado) {
						_vSelectAneis[indexUltimo][0].selectedIndex = i;
						break;
					}
				}
				
				_addChangeSelectAnel(indexUltimo);		
			}
					
		});
		
		   //------- Botao menos			
		$( idDivPanel + " .CV-BtMenos" ).button({
					label : "-"
		}).click( function(event) {
			var vRings;
			vRings = _clusterVisChart.obtemRings();	
			
			if (vRings.length >1 ) {
				_vSelectAneis.pop();
				_vDivAneis[_vDivAneis.length-1].remove();
				_vDivAneis.pop();				
				_clusterVisChart.removeAnelExterno();
				$("#"+_idPanel+" .CV-panel").css({"height": _height + vRings.length*19});				
			}
		}); //.css({"width":25,"text-align": "center"});
				
	}	

  //-----------------------------------	
    function _addItemsSelectOrder() {
	  var selOption,sizeLabelTitle,i,sizeValueTitle;
	  
	  if (_clusterVisChart.data() != null ) {
		selOption = d3.select("#" + _idPanel + " .CV-selOrderBy").selectAll("option");
		if (!selOption.empty())
			selOption.remove();
		sizeLabelTitle = _clusterVisChart.data().nodes.labelTitle.length;  
		for (i=0; i<sizeLabelTitle; i++)
			_selectOrder.append(new Option(_clusterVisChart.data().nodes.labelTitle[i], i));
	
		sizeValueTitle = _clusterVisChart.data().nodes.valueTitle.length;
		for (i=0; i<sizeValueTitle; i++)
			_selectOrder.append(new Option(_clusterVisChart.data().nodes.valueTitle[i], i+1000));  // 100 começa índice numéricos	  

		if (_clusterVisChart.indexAttrSort() < 1000)  
			_selectOrder[0].selectedIndex = _clusterVisChart.indexAttrSort();
		else
			_selectOrder[0].selectedIndex = _clusterVisChart.indexAttrSort()-1000 + sizeLabelTitle;
	  
		_selectOrder.change( function(){
			_clusterVisChart.acSortExec(this.value);
		});
	  }	
	}
	
  //-----------------------------------		
    function _addChangeSelectAnel(indice) {
			if (indice==0) {
				_vSelectAneis[indice].change( function(){
					_clusterVisChart.acAlteraAnel(0,this.value); // Acionar a alteração do atributo do anel
				});
			} else if (indice==1) {
				_vSelectAneis[indice].change( function(){
					_clusterVisChart.acAlteraAnel(1,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (indice==2) {
				_vSelectAneis[indice].change( function(){
					_clusterVisChart.acAlteraAnel(2,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (indice==3) {
				_vSelectAneis[indice].change( function(){
					_clusterVisChart.acAlteraAnel(3,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (indice==4) {
				_vSelectAneis[indice].change( function(){
					_clusterVisChart.acAlteraAnel(4,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (indice==5) {
				_vSelectAneis[indice].change( function(){
					_clusterVisChart.acAlteraAnel(5,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (indice==6) {
				_vSelectAneis[indice].change( function(){
					_clusterVisChart.acAlteraAnel(6,this.value); // Acionar a alteração do atributo do anel
				});							
			}
	
	}
	
  //-----------------------------------	  
	
    function panel() {}

	panel.create = function( idPanel) {
	  _idPanel = idPanel;
	  var divPanel = $("<div/>",{
		  class:"CV-panel"
	  }).css({"width":_width, "height": _height});
	  $("#"+_idPanel).append(divPanel);
	  
					//------------- Select para a ordem de classificação
	  _addSelectOrder("#"+ _idPanel + " .CV-panel");
	  _addCheckBoxScale("#"+ _idPanel + " .CV-panel");
	  _addBotoesSelect("#" + _idPanel +" .CV-panel");

	  return panel;
	}

	//---------------------
	panel.update = function() {
	  _addItemsSelectOrder();
	}
	
	//---------------------
	// Remove todos os itens que foram colocados  e deixa apenas os que fazem parte do Ring	
	panel.alteraSelectOrder = function () {
	  var selOption,i,vRings, indiceAttrSort;
	  
	  if (_clusterVisChart.data() != null ) {
	    vRings = _clusterVisChart.obtemRings();
		selOption = d3.select("#" + _idPanel + " .CV-selOrderBy").selectAll("option");
		
		if (!selOption.empty())
			selOption.remove();

		for (i=0; i<vRings.length; i++) {
		  if ( vRings[i].typeAttr == "V")
		     _selectOrder.append(new Option(_clusterVisChart.data().nodes.valueTitle[vRings[i].indexAttr], vRings[i].indexAttr+1000));
		  else
			_selectOrder.append(new Option(_clusterVisChart.data().nodes.labelTitle[vRings[i].indexAttr], vRings[i].indexAttr));
		}			

		indiceAttrSort = _clusterVisChart.indexAttrSort();
		if (indiceAttrSort < 1000)
			for (i=0; i<vRings.length; i++) {
				if (indiceAttrSort == vRings[i].indexAttr) {
					_selectOrder[0].selectedIndex = i;
					break;
				}
			}
		else
			for (i=0; i<vRings.length; i++) {
				if (indiceAttrSort == vRings[i].indexAttr+1000) {
					_selectOrder[0].selectedIndex = i;
					break;
				}
			}				

	    }	  
	}

	//---------------------
	// Inclui os select para todos os aneis adicionados	
	// É chamado n olusterVisChart, pois tem que estar depois do addAttribute
	panel.incluiSelectAneis = function ( vAttrSelecionaveis) {
		var i,j,indexProcurado;
		var vRings = _clusterVisChart.obtemRings();
		var divAneis = "#"+ _idPanel + " .CV-aneis";

		for (i=0; i<vAttrSelecionaveis.length; i++)
			_vAttrSelecionaveis[i] = vAttrSelecionaveis[i];
	
		$("#"+_idPanel+" .CV-panel").css({"height": _height + vRings.length*19});	
				
		for (i=0; i< vRings.length; i++) {	
			_vDivAneis[i] = $("<div>");
			_vSelectAneis[i] =  $("<select>", { class: "CV-selAneis"});
			_vDivAneis[i].append( $("<label>").append("&nbsp;" + (i+1) + ":&nbsp;")).append(_vSelectAneis[i]);
			$(divAneis).append(	_vDivAneis[i]);		
		}
		
// Preenche os selects
		for (j=0; j<vRings.length; j++)
			for (i=0; i<vAttrSelecionaveis.length; i++) {
				if ( vAttrSelecionaveis[i] >= 1000)
					_vSelectAneis[j].append(new Option(_clusterVisChart.data().nodes.valueTitle[vAttrSelecionaveis[i]-1000], vAttrSelecionaveis[i]));
				else
					_vSelectAneis[j].append(new Option(_clusterVisChart.data().nodes.labelTitle[vAttrSelecionaveis[i]], vAttrSelecionaveis[i]));
		}

		
// Atribui valor inicial aos selects
		for (i=0; i<vRings.length; i++) {		
			if (vRings[i].typeAttr == "V")
				indexProcurado = vRings[i].indexAttr + 1000;
			else
				indexProcurado = vRings[i].indexAttr;
		
			for (j=0; j< vAttrSelecionaveis.length; j++) {
				if (vAttrSelecionaveis[j] == indexProcurado) {
					_vSelectAneis[i][0].selectedIndex = j;
					break;
				}
			}
		}
		
// Anexa o evento change
		for (i=0; i<vRings.length; i++) {
			if (i==0) {
				_vSelectAneis[i].change( function(){
					_clusterVisChart.acAlteraAnel(0,this.value); // Acionar a alteração do atributo do anel
				});
			} else if (i==1) {
				_vSelectAneis[i].change( function(){
					_clusterVisChart.acAlteraAnel(1,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (i==2) {
				_vSelectAneis[i].change( function(){
					_clusterVisChart.acAlteraAnel(2,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (i==3) {
				_vSelectAneis[i].change( function(){
					_clusterVisChart.acAlteraAnel(3,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (i==4) {
				_vSelectAneis[i].change( function(){
					_clusterVisChart.acAlteraAnel(4,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (i==5) {
				_vSelectAneis[i].change( function(){
					_clusterVisChart.acAlteraAnel(5,this.value); // Acionar a alteração do atributo do anel
				});			
			} else if (i==6) {
				_vSelectAneis[i].change( function(){
					_clusterVisChart.acAlteraAnel(6,this.value); // Acionar a alteração do atributo do anel
				});							
			}	
		}
	}
	
  	return panel; 
  };

})
