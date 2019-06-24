/**
* nodeEdgePanel
*
*/

define([], function () {

  return function NodeEdgePanel (nodeEdgeChart) {
	var _nodeEdgeChart = nodeEdgeChart,
	    _width = 180,
		_height = 100,
	    _spanGravity  = null,  // Exibe o valor do atributo gravity
		_spanNodes    = null,  // Quantidade de nodos
		_spanEdges    = null,  // Quantidade de arestas
		_sliderGravity = null,

		_itemSelCluster = [ "None", "Attribute","Comp. conected"],
		_idPanel;     // Atribuido na função create

//-------------------------
    function _addSelectCluster( idDivPanel) {
	  var idSelectCluster,tagSelect,i,sizeValueTitle=0, selected=0;;  
	  
	  idSelectCluster = _idPanel + "-selCluster";
	  $(idDivPanel).append($("<br/>&nbsp;Clustered by: <select id=" + idSelectCluster + ">"));
	  
	  tagSelect = $("#"+idSelectCluster);
 
	  _itemSelCluster.forEach( function (d,i) { tagSelect.append(new Option(d, i));});
		
      tagSelect[0].selectedIndex = 0; //_nodeEdgeChart.algCluster();
	  
	  tagSelect.change( function(){
	    _nodeEdgeChart.acClusterExec(this.value);
	  });
	}


		
//-------------------------
    function _addSliderGravity( idDivPanel) {
	   _spanGravity  = $("<span/>");
	   $(idDivPanel).append( $("<br/><br/><label/>").append("&nbsp;Gravity:").append(_spanGravity));
	   
	   var divGravity = $("<div/>",{
		  class:"gravity"
	   }).css({"width":80, "height": 7});

	   $(idDivPanel).append(divGravity);
	   	   
	   _sliderGravity = $( idDivPanel + " .gravity" );
	   _sliderGravity.slider( {
			min:0,
			max: 3,
			value: 2,
			step: 0.1,
			slide: function(event,ui) {
				     _spanGravity.text(ui.value);
		           },
	        stop: function( event, ui ) {
				_nodeEdgeChart.acChangeGravity(ui.value);
	        }
	   });		   
    }		

//-------------------------
    function _addStatistics(idDivPanel) {
		_spanNodes  = $("<span/>");
		_spanEdges  = $("<span/>");		
	   $(idDivPanel).append( $("<br/><label/>").append("&nbsp;Nodes:&nbsp;").append(_spanNodes));
	   $(idDivPanel).append( $("<br/><label/>").append("&nbsp;Edges:&nbsp;").append(_spanEdges));	   
    }
	
  //-----------------------------------	  
	
    function panel() {}

	//---------------------
	panel.create = function( idPanel) {
	  _idPanel = idPanel;
	  var divPanel = $("<div/>",{
		  class:"NE-panel"
	  }).css({"width":_width, "height": _height});
	  $("#"+_idPanel).append(divPanel);


	  					//------------- Quantidade de nodos e arestas
      _addStatistics("#"+ _idPanel + " .NE-panel");	
	  
	  					//------------- Select para a seleção do algoritmo de cluster
	  _addSelectCluster("#"+ _idPanel + " .NE-panel");	  
					//------------- Slider para alteração do atributo gracity
      _addSliderGravity("#"+ _idPanel + " .NE-panel");	  
			
	  return panel;
	}
	
	//---------------------
	panel.update = function() {
		var minGravity, maxGravity,stepGravity,dif;
		
		if (_nodeEdgeChart.getGravity() < 0.1) {
			minGravity = Math.round(_nodeEdgeChart.getGravity()*50)/100;
			maxGravity = Math.round(_nodeEdgeChart.getGravity()*150)/100;
		} else {
			minGravity = Math.round(_nodeEdgeChart.getGravity()*5)/10;
			maxGravity = Math.round(_nodeEdgeChart.getGravity()*15)/10;		
		}
		dif = maxGravity-minGravity;
		if (dif <= 0.1)
		   stepGravity = 0.01;
		else
			if (dif <= 0.5)
				stepGravity = 0.05;
			else
				stepGravity = 0.1
console.log(	_nodeEdgeChart.getGravity());	   
console.log (minGravity + " " + _nodeEdgeChart.getGravity()+ " " + maxGravity + " " + stepGravity);
		   
		_sliderGravity.slider("option", "min", minGravity);
		_sliderGravity.slider("option", "max" ,maxGravity);
		_sliderGravity.slider("option", "step", stepGravity);
		_sliderGravity.slider("option", "value",_nodeEdgeChart.getGravity());
		_spanGravity.text(_nodeEdgeChart.getGravity());	
		_spanNodes.text(_nodeEdgeChart.getQtNodes());
		_spanEdges.text(_nodeEdgeChart.getQtEdges());
					
		return panel;
	}

	
  	return panel; 
  };


})