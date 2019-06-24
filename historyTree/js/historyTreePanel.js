/**
* historyTreePanel
*
*/

define([], function () {

  return function HistoryTreePanel (historyTreeChart) {
	var _historyTreeChart = historyTreeChart,
	    _width = 170,
		_height = 80,
		_idPanel;     // Atribuido na função create
	
  //-----------------------------------	  
	
    function panel() {}

	panel.create = function( idPanel) {
	  _idPanel = idPanel;
	  var divPanel = $("<div/>",{
		  class:"HT-panel"
	  }).css({"width":_width, "height": _height});
	  $("#"+_idPanel).append(divPanel);
	  
      console.log ("criei o panel: " + idPanel);
	  return panel;
	}

	//---------------------
	panel.update = function() {

	}
	
  	return panel; 
  };

})