/**
* irisPanel
*
*/

define([], function () {

  return function IrisPanel (irisVisChart) {
	var _irisChart = irisVisChart,
	    _width = 220,
		_height = 80,
		_selectOrder = null,
		_selectAttr  = null,
		_vAttrEdgesSelecionaveis = [],
		_idPanel;     // Atribuido na função create
 
    function _addItensSelectOrder() {
	var selOption;
	  
		selOption = d3.select("#" + _idPanel + " .IC-selOrderBy").selectAll("option");
		if (!selOption.empty())
			selOption.remove();

		_selectOrder.append(new Option("Text", 0));
		_selectOrder.append(new Option("Attribute", 1));  // 100 começa índice numéricos	  

		_selectOrder[0].selectedIndex = 0;
	  
		_selectOrder.change( function(){
			var valor = +this.value;
			
			if (valor==0)
				_irisChart.acSortExecText();			
			else
				_irisChart.acSortExecAttribute();
		});

	}
	
    function _addSelectOrder( idDivPanel) { 
	  _selectOrder = $("<select>", { class: "IC-selOrderBy"});;
	  $(idDivPanel).append( $("<br/>") ).append( $("<label>").append("&nbsp;Order by:")).append(_selectOrder);
	  _addItensSelectOrder();
	}
	
  //-----------------------------------	  
	
    function panel() {}

	panel.create = function( idPanel) {
	  _idPanel = idPanel;
	  var divPanel = $("<div/>",{
		  class:"IC-panel"
	  }).css({"width":_width, "height": _height});
	  $("#"+_idPanel).append(divPanel);
	  
					//------------- Select para a ordem de classificação
	  _addSelectOrder("#"+ _idPanel + " .IC-panel");

	  return panel;
	}

	//---------------------
	panel.update = function() {
//	  _addItensSelectOrder();	
	}
	
	//---------------------
	// Inclui os select para todos os atributos	

	panel.incluiSelectAttr = function ( vAttrEdgesSelecionaveis) {
	var i;
		for (i=0; i<vAttrEdgesSelecionaveis.length; i++)
			_vAttrEdgesSelecionaveis[i] = vAttrEdgesSelecionaveis[i];
		_selectAttr = $("<select>", { class: "IC-selAtributo"});
		$("#"+ _idPanel + " .IC-panel").append( $("<br/>") ).append( $("<label>").append("&nbsp;Show attribute:")).append(_selectAttr);

		for (i=0; i<vAttrEdgesSelecionaveis.length; i++) {
			if ( vAttrEdgesSelecionaveis[i] >= 1000)
				_selectAttr.append(new Option(_irisChart.data().edges.valueTitle[vAttrEdgesSelecionaveis[i]-1000], vAttrEdgesSelecionaveis[i]-1000));
		}			

		_selectAttr.change( function(){
			var valor = +this.value;
			
			_irisChart.acChangeAttrBar(valor);			
		});	
    }	
		
	//---------------------	
  	return panel; 
  };

})