define( ["jquery","jqueryui","d3"], function ($,JQueryUI,d3) {

  return function View (idView, dashboard) {

    var _dimView = {width:10, height:10},   // Dimensoes da view
        _dimChart = {width:_dimView.width, height:_dimView.height},
   
		_barTitleHeight = 15,       // Altura da barra de t�tulo
		_yPanel =  15,              // Posicao inicial do painel de controle em rela��o ao topo da janela
		_marginButton = 2,          // Margens dos botoes em relacao a barra de t�tulo
		_divView = null,            // Div que representa a view inclu�da
		_objChart= null,            // Chart associado a view
		_objPanel = null,           // Panel associado ao chart e a view
		_idChart = (idView + "-c"), // id da Div onde o <svg> ser� inclu�do
	    _idPanel = (idView + "-p"), // id da <div> onde o painel de controle da t�cnica ser� inserido
		_config = null,
		_position = {x:0, y:0},
		_center = {cx:0, cy:0},
		_svgBarTitle = null,  // svg da barra de t�tulos
		_rectBtClose = null;  // ret�ngulo do bot�o de fechar

		
//--------------------------------- Funcoes privadas
	function _refreshBarTitle() {
		_svgBarTitle.attr("width", _dimChart.width).attr("height", _barTitleHeight);
		_rectBtClose.attr("x", _dimChart.width - (_barTitleHeight - _marginButton));		
	}

//---------------------		
	function view() {}

//---------------------		
	view.create = function (x, y, config) {
	  var viewDiv,barDiv,chartDiv, panelDiv, idBar, stDisplay, thisView = this; 
	  var selLinkPai,selLinkFilhos,selConect;

	  _config = config;
      if (!_config.barTitle) {
	  	_barTitleHeight = 0;		
	  }
	  
      if (_config.visible) 
	  	stDisplay = "block";
	  else
	  	stDisplay = "none";		
	  
	  
	  _dimView.height = _dimView.height + _barTitleHeight;
                //-----  Cria a janela externa	
	  viewDiv = $("<div/>", {
		id: idView,
		class:"view-view"
	  }).css({"top":y, "left":x, "width": _dimView.width, "height": _dimView.height, "display": stDisplay});

	  _position.x = x;
	  _position.y = y;
	  _center.cx = x + _dimView.width/2;
	  _center.cy = y + _dimView.height/2;
	  
	  $("#" + dashboard.idDashboard()).append(viewDiv);
	  idView = "#" + idView;
	  _divView = $(idView);
	  _divView.css("z-index",dashboard.nextZIndex());	  
	  
    			//----------------------- Cria a barra de t�tulo
	  if (_config.barTitle) {
        					//----------- Cria o container para o t�tulo
		barDiv = $("<div/>", {
			  class:"view-bar"
		}).css({"height":_barTitleHeight});	
		$(idView).append(barDiv);
		
		idBar    = idView + " .view-bar";
		
        if (_config.btTool) {
			_svgBarTitle = d3.select(idBar).append("svg");
					
			_svgBarTitle.append("rect")   // Botao tools
				.attr("x", _marginButton)
				.attr("y", _marginButton)
				.attr("width", _barTitleHeight - 2* _marginButton)
				.attr("height", _barTitleHeight - 2* _marginButton)
					.on("click", function (d) { 						
						var panel = $("#"+_idPanel);
						if (panel.css("display") === "none")
							panel.css({"display":"block"});
						else	
							panel.css({"display":"none"});
					} )
					.append("title")
						.text("Tools");
						
							//--------------- Adiciona um t�tulo vazio que ser� alterado por setTitle
			_svgBarTitle.append("text").text("").attr("x",20).attr("y",11);
			_rectBtClose = _svgBarTitle.append("rect")  // Botao close
						.attr("x", _marginButton)
						.attr("y", _marginButton)
						.attr("width", _barTitleHeight - 2* _marginButton)
						.attr("height", _barTitleHeight - 2* _marginButton)
						.on("click", function (d) { 
							_divView.css( {"display":"none"});
						console.log("PASSEI");
						dashboard.getSvg().select("."+_idChart).style("display","none");							
//							var nodoHistory = dashboard.getChart(_idChart);
							dashboard.getChart(_idChart).hidden = true;
							dashboard.historyChart().data(dashboard.getTree());											
						} );
						
			_rectBtClose.append("title")
							.text("Hide");			
			 
		  panelDiv = $("<div/>", {
				id: _idPanel,
				class:"view-panel"
		    }).css({"position":"absolute", "top":_yPanel,"display":"none"}).draggable();						
		  $(idView).append(panelDiv);			 		
		}		
				
        if (_config.draggable) {     //----------- Torna a view draggable
		  _divView.draggable({ 
			handle: $(idBar),
			start: function( event, ui ) { 
//			  dashboard.activeView().divView().css("z-index",90);
//			  _divView.css("z-index",100);
			  _divView.css("z-index",dashboard.nextZIndex());
				
			  dashboard.activeView (thisView);
			  selLinkPai = dashboard.getSvg().select(".F-" + _idChart);
			  selLinkFilhos	= dashboard.getSvg().selectAll(".P-" + _idChart);
			  selConect = dashboard.getSvg().select("."+_idChart);
		    },
			drag: function( event, ui ) {
				_position.x = ui.position.left;
				_position.y = ui.position.top;				
				_center.cx = _position.x + _dimView.width/2;
				_center.cy = _position.y + _dimView.height/2;
				selLinkPai.attr("x2",_center.cx).attr("y2",_center.cy);
				selLinkFilhos.attr("x1",_center.cx).attr("y1",_center.cy);
				selConect.attr("x",_center.cx-6).attr("y",_center.cy-6);
				dashboard.refreshSvg();				
			},
			stop: function( event, ui ) {
				var dt = selConect.datum();
				_position.x = ui.position.left;
				_position.y = ui.position.top;			
				_center.cx = _position.x + _dimView.width/2;
				_center.cy = _position.y + _dimView.height/2;
				selLinkPai.attr("x2",_center.cx).attr("y2",_center.cy);
				selLinkFilhos.attr("x1",_center.cx).attr("y1",_center.cy);
				selConect.attr("x",_center.cx-6).attr("y",_center.cy-6);
				dt[0].x = _center.cx;
				dt[0].y = _center.cy;				
				console.log("x"+(_center.cx));
				console.log(selConect.datum());   // Atualiza dados do retangulo conector				
				dashboard.refreshSvg();				
			}			
					   
		  });
	    }
	  }

	//----------------------------------- Cria o container para o gr�fico (<svg>)
	  chartDiv = $("<div/>", {
		  id: _idChart,
		  class: "view-chart"
	  }).css({"top":_barTitleHeight, "height": _dimChart.height});
	  $(idView).append(chartDiv);
	  
	  if (_config.resizable) {             //----------- Torna a view resizeble
		$(idView).resizable({
		  helper     : "resizable-helper",
		  aspectRatio: config.aspectRatio,
		  autoHide   : true,
		  start      : function( event, ui ) { 
//		    dashboard.activeView().divView().css("z-index",90);

//		    _divView.css("z-index",100);
//		    $(".resizable-helper").css( "z-index",105);

		    _divView.css("z-index",dashboard.nextZIndex());
		    $(".resizable-helper").css( "z-index",dashboard.nextZIndex()	);
		
		    dashboard.activeView(thisView);
			selLinkPai = dashboard.getSvg().select(".F-" + _idChart);
			selLinkFilhos	= dashboard.getSvg().selectAll(".P-" + _idChart);
			selConect = dashboard.getSvg().select("."+_idChart);			
	      },
		  stop       : function( event, ui ) {
		    var aspect = _dimChart.height/ _dimChart.width;
			var dt = selConect.datum();			
			                             // Atualiza as dimensoes das <div>
			_dimChart.width = ui.size.width-2;
			_dimView.width = _dimChart.width;		
            _dimView.height = ui.size.height-2;
			_dimChart.height =  _dimView.height - _barTitleHeight;
			
			if (_config.aspectRatio) {
			                             // Ajusta a altura para manter o aspecRatio
			    _dimChart.height = aspect * _dimChart.width;
				_dimView.height = _dimChart.height + _barTitleHeight;

				_divView.css( {"height":  _dimView.height});
			}
			_refreshBarTitle();			
            _objChart.box( { width: _dimChart.width, height:_dimChart.height });
			$("#"+_idChart).css( {"height": _dimChart.height});
			_center.cx = _position.x + _dimView.width/2;
			_center.cy = _position.y + _dimView.height/2;		
			dashboard.refreshSvg();	
			selLinkPai.attr("x2",_center.cx).attr("y2",_center.cy);
			selLinkFilhos.attr("x1",_center.cx).attr("y1",_center.cy);
			selConect.attr("x",_center.cx-6).attr("y",_center.cy-6);
			dt[0].x = _center.cx;
			dt[0].y = _center.cy;				
			console.log("x"+(_center.cx));
			console.log(selConect.datum());   // Atualiza dados do retangulo conector			
          }			
		});	
	  }
	  
	}

//---------------------	
    view.divView = function() {  
	  return _divView;
	}
	
//---------------------	
    view.show = function( status) {  
	  if (status)
		_divView.css( {"display":"block"});
	  else
	  	_divView.css( {"display":"none"});
	}
	
//---------------------	
    view.idChart = function() {  
	  return _idChart;
	}
	
//---------------------
    view.conectChart = function(objChart, ConstPanel) {
      var box = objChart.box();
	  _dimView.width = box.width;
	  _dimChart.width = box.width;
      
      _dimView.height = box.height;	  
	  _dimChart.height = box.height;
	  if (_config.barTitle) {
		 _dimView.height =  _dimView.height + _barTitleHeight;
	  }
	  _divView.css({"width":_dimView.width,"height": _dimView.height});
	  $("#"+_idChart).css( {"height":_dimChart.height});
	  _objChart = objChart;
	  if ( _config.btTool) {
		 _refreshBarTitle();
         _objPanel = ConstPanel(_objChart);
		 _objPanel.create(_idPanel);
//	     _objChart.createToolPanel(_idPanel);
         _objChart.panel(_objPanel);

	  }
	  _center.cx = _position.x + _dimView.width/2;
	  _center.cy = _position.y + _dimView.height/2;	  
	}

//---------------------	
    view.setTitle = function( stTitle) {
		d3.select(idView + " .view-bar text").text(stTitle);	  
	}
	
//---------------------	
    view.getPosition = function() {
		return _position;	
	}

//---------------------	
    view.getCenter = function() {
		return _center;	
	}

//---------------------	
    view.setCenter = function(x,y) {
		_center.x = x;
		_center.y = y;
		_position.x = _center.x - _dimView.width/2;
		_position.y = _center.y - _dimView.height/2;
	}

	view.refresh = function () {	
		_divView.css({"top":_position.y, "left":_position.x});
	}
	
//---------------------		
	 return view;
	 
  }


});