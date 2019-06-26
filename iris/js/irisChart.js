/**
 * irisChart
 *
 */

define(["model","libCava"], function (Model,LibCava) {

    return function IrisChart (idDiv) {

        let _irisPanel = null,  // represents the panel associated with the graph
            _sortByText = true,
            _xIrisCenter = 0,
            _yIrisCenter = 0,
            _innerRadius = 0,  // (calculated) radius of the circle where the centroid is inserted
            _outerRadius = 0,
            _maxHeightBar = 0, // (calculated) distance occupied by the bars - Change causes change in the maximum number of bars of the Iris - Original 40
            _numMaxBars = 0,
            _grpIris = null,   // Group representing IRIS
            _grpBars = null,       // Selection that contains all groups of bars
            _dataVis = [],         // Vector of visible data. Points to the elements of model.data (has the attributes "angle" and "index")
            _indexFirstData = 0,   // Index in the "dataVis" vector where the first element of the data vector is located
                                    // Used only when the amount of elements in this.data is less than or equal to "dataVis"
            _pDesloc = 0.08,       // Percentage of center displacement

            _vOrder = null,      // Indirect ordering vector

            _focusArea = {
                widthBar: 0,       // (calculated) Width of bar in the area of maximum width (focus) Original: 11
                angleBar: 0.0,     // (calculated) Angle of the sector occupied by the bars that are in Focus
                marginBar: 1,      //
                angleSector: 0.0,  // (calculated)
                indexCenter: 0,    // (calculated) index in the dataVis vector where the center of the focus is
                numBars: 7         // Number of bars in focus (best odd number)
            },

            //_updateIndexCenter = true,   // Indicates that IndexCenter should be updated

            _fishEyeArea = {
                geometry : [ {width:0.0, angle:0.0}],   // One element for each bar
                marginBar : 1,                          // Margin between the bars of the fish eye area
                numBars : 0,         // (calculated)
                angleSector: 0.0                        // (calculated) Sum of the angle of all bars forming the fish eye area
            },

            _minArea = {
                widthBar : 0,        // Width of the bar in the area where the width of the bars is minimum Original: 4
                angleBar : 0.0,      // (calculated) Angle of the sector occupied by the bars that are in the area of minimum width (MIN)
                marginBar : 1,
                numBars   : 0,       // (calculated)
                angleSector : 0.0    // (calculated)
            },

            _hiddenArea = {
                widthBar    : 0,    // (calculated) Bar width of area not visible (equal to focus)
                angleBar    : 0.0,  // (calculated)
                numBars     : 1,    // Number of bars with a width equal to the focus in hidden area
                angleSector : 0.0   // (calculated) Sector angle occupied by hidden area
            },

            _cfgIndexAttr = {          // Contains the indexes of the attributes that can be configured in the graph
                titleCentroid: 0,       // Index of the attribute to be printed in the center of the circle (Must be Label)
                titleDegree: "co-authors",     // Text to be used after degree value in centroid
                textBar: 0             // Text that will be printed after the bars
            },

            _nbOfTypesDoc = 4,     // number of types of documents in the base
            _colorsBars = ["#4286f4", "#D2691E", "#15701e", "#f441e5"];     // colors for the different types

        // ---------------- Model
        let model = Model();
        let lcv   = LibCava();

        // ---------------- Geometric attributes of the graph
        model.margin = {top: 2, right: 2, bottom: 2, left: 2};
        model.box = { width:150, height:150};
        model.pInnerRadius = 0.15;    // Percentage relative to graph width for _innerRadius calculation
        model.pOuterRadius = 0.57;    // Percentage relative to graph width for _OuterRadius calculation
        model.pMaxHeightBar =  0.10;  // Percentage relative to graph width for _MaxHeightBar calculation
        model.pFocusWidthBar =  0.0275;  // Percentage relative to graph width for calculation of _focusArea.widthBar
//        model.pFocusWidthBar =  0.05,  // Percentage relative to graph width for calculation of _focusArea.widthBar
//        model.barScale = d3.scale.linear();
        model.pMinWidthBar = 0.01;       // Percentage relative to graph width for calculation of _minArea.widthBar Original 4

        model.indexAttBar = 0;           // Index of the attribute that will be plotted in the toolbar
//	    model.indexAttText = 0;          // Index of the attribute whose text will be printed

        model.redraw = 0;


        // ---------------- Initialization Actions
        let _svg = d3.select("#"+idDiv).append("svg"),  // Create dimensionless svg
            _sort  = lcv.sortIris(),                     // Creates sorting function
            _grpChart = _svg.append("g");                       // Does not exist in the original Iris

        _grpIris = _grpChart.append("g").attr("class","IrisChart");
        _grpIris.append("circle").attr("class","IC-centroidBack");
        _grpIris.append("text")
            .text("")
            .classed("IC-centroidTitle",true);    // Includes title attribute of centroid

        _grpIris.append("text")
            .text("")
            .classed("IC-centroidDegree",true);    // Includes degree title attribute

        // ------      Inclusion of the arc (sector) that represents the background of the focus
        _grpIris.append("path").attr("class","IC-focus");

        //===================================================
        model.when(["box", "margin"], function (box, margin) {
            model.widthChart = box.width - margin.left - margin.right;
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
            let maxValue = d3.max( data.children.data, function(d){return d.edge.values[indexAttBar];});
            _maxHeightBar = Math.floor(widthChart  * pMaxHeightBar);
            model.barScale = d3.scale.linear().range([ 0, _maxHeightBar ]).domain([ 0, maxValue ]);
        });

        //---------------------
        model.when(["widthChart","pFocusWidthBar"], function (widthChart,pFocusWidthBar) {
            _focusArea.widthBar = Math.floor(widthChart  * pFocusWidthBar);
            _hiddenArea.widthBar = _focusArea.widthBar;
        });

        //---------------------
        model.when(["widthChart","pMinWidthBar"], function (widthChart,pMinWidthBar) {
            _minArea.widthBar = Math.floor(widthChart  * pMinWidthBar);
            if (_minArea.widthBar === 0)
                _minArea.widthBar = 1;
        });

        //---------------------
        model.when(["data","widthChart","heightChart","barScale","pInnerRadius","pOuterRadius","redraw"],
            function (data,widthChart,heightChart) {
                _xIrisCenter = Math.floor(widthChart / 2) - Math.floor(widthChart*_pDesloc);  // To move center to left
                _yIrisCenter = Math.floor(heightChart / 2);

                _grpIris.attr("transform", "translate(" + _xIrisCenter + "," + _yIrisCenter + ")");

                _calcGeometry();
                _grpIris.select(".IC-focus")
                    .attr("d", d3.svg.arc().innerRadius(_innerRadius)
                    //			.outerRadius(geometry.innerRadius+geometry.maxHeightBar)   // To just leave on the bars
                        .outerRadius(_outerRadius /*+12*/)          // Change to avoid adding
                        .startAngle( -_degreeToRadian(_focusArea.angleSector/2) + Math.PI/2)
                        .endAngle( _degreeToRadian(_focusArea.angleSector/2) + Math.PI/2) );

                _grpIris.select("text.IC-centroidTitle")
                    .text( _adjustLengthText(data.root.data.labels[ _cfgIndexAttr.titleCentroid],13))
                    .style("font-size", (_dataVis[ _focusArea.indexCenter].widthText*0.70)+"px");

                _grpIris.select("text.IC-centroidDegree")
                    .attr("y", _innerRadius * 0.30)  // 30% of the radius
                    .text( data.children.data.length + " " + _cfgIndexAttr.titleDegree )
                    .style("font-size", (_dataVis[ _focusArea.indexCenter].widthText*0.70)+"px" );

                if (_grpBars != null)
                    _grpBars.remove();

                i_PutBarsOnIris();

                function i_PutBarsOnIris() {
                    _grpBars =  _grpIris.selectAll(".IC-grpBar")
                        .data(_dataVis)
                        .enter()
                        .append("g")
                        .attr("class", "IC-grpBar")
                        .attr("transform", function(d) { return "rotate(" + d.angleRot + ")"; })
                        .on("click", function(d,i) {
                            if (i > _focusArea.indexCenter)
                                i_Rotate(i- _focusArea.indexCenter,1,i-1);
                            else
                                i_Rotate(_focusArea.indexCenter-i,-1,i+1);
                        });

                    let j;
                    for (j = 0; j < _nbOfTypesDoc; j++) {
                        _grpBars.append("rect")
                            .attr("class", "IC-node")
                            .attr("x", function (d) {
                                let prevWidth = 0;
                                if (j !== 0) {
                                    prevWidth = _calcXBar(d, j-1); //calculates from where the new bar should begin
                                }
                                return _innerRadius+prevWidth;
                            })
                            .attr("y",      function (d) { return Math.round(-d.width / 2 ) })
                            .attr("height", function (d) { return d.width; })
                            .attr("width",  function (d) { return _calcWidthBar(d, j); })
                            .attr("fill", _colorsBars[j])
                            .append("title")
                            .text ( function (d) { return _tooltip(d, j)});
                    }

                    _grpBars.append("text")
                        .attr("class", "IC-grpBar")
                        .text( function(d) { return _text(d); })
                        .attr("x", _innerRadius + _maxHeightBar)
                        .attr("y", function(d){return d.widthText/2*0.48;})
                        .classed("IC-active", function(d,i){ return _focusArea.indexCenter===i;})
                        .style("font-size", function (d) { return (d.widthText*0.70)+"px";} )  // Size reduced by 30%
                        .append("title")
                        .text ( function (d) { return _tooltipComplete(d)});
                } // End i_PutBarsOnIris

                function i_Rotate(qtBars,dir,origin) {
                    if (qtBars!==0) {
                        i_MoveDataVis(_focusArea.indexCenter+dir,_focusArea.indexCenter);
                        _grpBars.remove();
                        i_PutBarsOnIris();
                        setTimeout( function() {
                            i_Rotate(qtBars-1,dir,origin-dir);
                        }, 45);
                    }
                } // End i_Rotate

                function i_MoveDataVis( source, target) {
                    let i,index,sizeData;

                    sizeData = model.data.children.data.length;
                    if (sizeData >= _dataVis.length){
                        index = (sizeData + _dataVis[source].indexData - target) % sizeData;
                        for (i=0; i< _dataVis.length; i++) {
                            _dataVis[i].indexData = index;
                            index = (index+1) % sizeData;
                        }
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
                } // End i_MoveDataVis
            } // End
        );
//--------------------------------- Private functions

        /**
         * _calcGeometry
         *
         * Calculates all geometric parameters for Iris display
         */
        function _calcGeometry() {

            //let maxValue = 0;  // Maximum value of the attribute that will be represented by the bars

            i_CalcFocusArea();
            i_CalcFishEyeArea();
            i_CalcHiddenArea();
            i_CalcMinArea();   // It should be the last one to be calculated as it is the area left over
            // Recalculates the sector angle of the hidden area
            // adding what's missing to 360 degrees

            _hiddenArea.angleSector = 360 - _fishEyeArea.angleSector*2 - _focusArea.angleSector - _minArea.angleSector*2;

            // The calculation of the number of bars must be performed after the calculation of the area elements
            _numMaxBars = _focusArea.numBars + 2*_fishEyeArea.numBars + 2*_minArea.numBars;

            /*
                if (this.dataChart.children.data.length <= geometry.numMaxBars) {  // If the amount of data is smaller than the slots for the view
                                                                // recalculates by removing the hidden area
                                                                // redistribute what is left over to the angles of the bar sections
                                                                // You are not changing the dimensions of the bars
                    geometry.hiddenArea.angleBar = 0;
                    geometry.hiddenArea.angleSector = 0;
                    this._calcMinArea();
                    var sobra = 180 - fisheyeArea.angleSector - focusArea.angleSector/2 - minArea.angleSector;
                    geometry.minArea.angleSector += sobra;
                    geometry.minArea.angleBar = geometry.minArea.angleSector/ geometry.minArea.numBars;
                    geometry.numMaxBars = focusArea.numBars + 2*fisheyeArea.numBars + 2*minArea.numBars;
                }
            */

            // The calculation of the index in the dataVis vector where the center of the focus is to be calculated after the elements of the areas
            _focusArea.indexCenter = _minArea.numBars + _fishEyeArea.numBars + Math.floor(_focusArea.numBars/2);

            // Initializes the dataVis vector with capacity for the maximum number of bars
            // Do not associate the dataVis with the data vector (indicated by the value -1 in the indices)
            i_InicDataVisVector();
            i_BindDataVisToData();


            //--------
            function i_CalcFocusArea() {
                _focusArea.angleBar = _widthToAngle( _focusArea.widthBar + _focusArea.marginBar , _innerRadius );
                _focusArea.angleSector = _focusArea.angleBar * _focusArea.numBars;
            }

            //--------
            function i_CalcFishEyeArea() {
                let index = 0;

                _fishEyeArea.angleSector = 0.0;
                _fishEyeArea.geometry = [ {width:0.0, angle:0.0}];
                for (let widthBar= _minArea.widthBar+1; widthBar< _focusArea.widthBar; widthBar++) {
                    _fishEyeArea.geometry[index] = { width : widthBar, angle : _widthToAngle( widthBar + _fishEyeArea.marginBar, _innerRadius) };
                    _fishEyeArea.angleSector += _fishEyeArea.geometry[index].angle;
                    index++;
                }
                _fishEyeArea.numBars = index;
            }

            //--------
            function i_CalcHiddenArea() {
                _hiddenArea.angleBar = _widthToAngle( _hiddenArea.widthBar+1, _innerRadius );
                _hiddenArea.angleSector = _hiddenArea.angleBar * _hiddenArea.numBars;
            }

            //--------
            function i_CalcMinArea() {
                _minArea.angleBar = _widthToAngle( _minArea.widthBar   + _minArea.marginBar   , _innerRadius );
                _minArea.numBars  = Math.floor( (360.0 - _fishEyeArea.angleSector*2 - _focusArea.angleSector - _hiddenArea.angleSector)/(2*_minArea.angleBar));
                _minArea.angleSector = _minArea.numBars * _minArea.angleBar;
            }

            //--------
            function i_InicDataVisVector() {
                let angleRotBar;

                _dataVis = d3.range( _numMaxBars ).map( function(d,i) { return {angleRot:0.0, width:0, widthText:0, indexData:0 };});

                // Determines as the initial rotation angle of the bar with index 0 the angle of the upper line of the sector of the not visible area
                angleRotBar = 180 + _hiddenArea.angleSector/2;

// ---------- Minimum Area 1
                angleRotBar = i_CalcGeometryFixedArea(angleRotBar, 0, _minArea.numBars-1, _minArea.widthBar,_minArea.angleBar);

// ---------- Fish Eye Area 1
                angleRotBar = i_CalcGeometryFishEyeArea(angleRotBar, _minArea.numBars, _minArea.numBars + _fishEyeArea.numBars-1,true);

// ---------- Focus Area
                angleRotBar = i_CalcGeometryFixedArea(angleRotBar, _minArea.numBars + _fishEyeArea.numBars,
                    _minArea.numBars + _fishEyeArea.numBars + _focusArea.numBars-1,
                    _focusArea.widthBar, _focusArea.angleBar); // Focus Area
// ---------- Fish Eye Area 2
                angleRotBar = i_CalcGeometryFishEyeArea(angleRotBar, _minArea.numBars + _fishEyeArea.numBars + _focusArea.numBars,
                    _minArea.numBars + 2*_fishEyeArea.numBars + _focusArea.numBars-1,
                    false);

// ---------- Minimum Area 2
                angleRotBar = i_CalcGeometryFixedArea(angleRotBar, _minArea.numBars + 2*_fishEyeArea.numBars + _focusArea.numBars,
                    2*_minArea.numBars + 2*_fishEyeArea.numBars + _focusArea.numBars-1,
                    _minArea.widthBar, _minArea.angleBar);

                //--------
                function i_CalcGeometryFixedArea (angleRotBar, startIndex, finalIndex, width, angleBar) {
                    let radiusText = _innerRadius + _maxHeightBar;

                    for (let i=startIndex; i<=finalIndex; i++) {         // adjusts the angle of rotation to the center of the bar
                        _dataVis[i].angleRot = (angleRotBar + angleBar/2)%360;
                        _dataVis[i].indexData = -1;
                        _dataVis[i].width = width;
                        _dataVis[i].widthText = _angleToWidth(angleBar, radiusText);
                        angleRotBar = (angleRotBar+angleBar)%360;
                    }
                    return angleRotBar;
                }

                //--------
                function i_CalcGeometryFishEyeArea(angleRotBar, startIndex, finalIndex, ascending) {
                    let indexGeometry,
                        lastIndex = _fishEyeArea.geometry.length-1,
                        radiusText = _innerRadius + _maxHeightBar;

                    for (let i=startIndex; i<=finalIndex; i++) {
                        indexGeometry = (ascending) ? i-startIndex : lastIndex-(i-startIndex);
                        _dataVis[i].angleRot = (angleRotBar + _fishEyeArea.geometry[indexGeometry].angle/2) % 360;
                        _dataVis[i].indexData = -1;
                        _dataVis[i].width = _fishEyeArea.geometry[indexGeometry].width;
                        _dataVis[i].widthText = _angleToWidth(_fishEyeArea.geometry[indexGeometry].angle, radiusText);
                        angleRotBar = (angleRotBar + _fishEyeArea.geometry[indexGeometry].angle) % 360;
                    }

                    return angleRotBar;
                }
            }
            //--------
            function i_BindDataVisToData() {
                let i,startIndex,endIndex,index, sizeDataChildren;

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
            } // End i_BindDataVisToData
        }

        /**
         * _calcWidthBar
         *
         * Calculates the bar width of the chart
         * If there is no slash (d.indexData == -1) do not draw
         */
        function _calcWidthBar(d, i) {
            if (d.indexData !== -1) {
                return model.barScale(model.data.children.data[_vOrder[d.indexData]].edge.values[i]);
            }
            else
                return 0;       // Do not draw the rectangle
        }

        /**
         *
         * _calcXBar
         *
         * Calculates the x position of the bar
         *
         * @param d
         * @param i
         * @returns {number}
         * @private
         */
        function _calcXBar(d, i) {
            let start = 0;
            while (i >= 0) {
                start += _calcWidthBar(d, i);
                i--;
            }
            return start;
        }

        /**
         * _text
         *
         * returns the text associated with the slash
         *   number + " " + name
         */
        function _text(d) {
            if (d.indexData !== -1)
                return _adjustLengthText(model.data.children.data[_vOrder[d.indexData]].labels[_cfgIndexAttr.textBar],15);
            else
                return "";
        }

        /**
         * _textCentroid
         *
         * Adjusts the size of the text that will be printed in the centroid title
         */
        function _adjustLengthText( stText, limit) {
            if (stText.length > limit)
                return stText.slice(0,limit)+"...";
            else
                return stText;
        }

        /**
         * _tooltip
         *
         * returns the tooltip associated with the toolbar
         *
         */
        function _tooltip(d, i) {
            if (d.indexData !== -1) {
                return	model.data.children.data[ _vOrder[d.indexData]].labels[1] + "\n" +  // Full name
                    model.data.edges.valueTitle[i] + ": " +
                    model.data.children.data[ _vOrder[d.indexData]].edge.values[i];
            }
            else
                return "";       // Empty Tooltip
        }

        /**
         * _tooltipComplete
         *
         * returns the complete tooltip associated with the toolbar group
         *
         */
        function _tooltipComplete(d) {
            if (d.indexData !== -1) {
                let result = model.data.children.data[ _vOrder[d.indexData]].labels[1] + "\n";
                let j;
                for (j = 0; j < _nbOfTypesDoc; j++) {
                    result += model.data.edges.valueTitle[j] + ": " +
                        model.data.children.data[ _vOrder[d.indexData]].edge.values[j] + "\n";
                }
                return result;
            }
            else
                return "";       // Empty Tooltip
        }

        /**
         * _angleToWidth
         *
         * Calculates the width of the circle string from the angle (degrees) and radius
         * E: angle, radius
         * S: width
         */
        function _angleToWidth ( angle, radius) {
            return 2 * radius * Math.sin( angle*Math.PI/360.0);
        }

        /**
         * _widthToAngle
         *
         * Calculates the angle of the occupied sector by a width
         * E: width, radius
         * S: angle in degrees
         */
        function _widthToAngle ( width, radius) {
            return Math.acos(1.0 - width*width / (2*radius*radius))*180.0 / Math.PI;
        }

        /**
         * _degreeToRadian
         *
         * Converts an angle from degrees to radians
         */
        function _degreeToRadian ( angle ) {
            return angle * Math.PI / 180;
        }

//--------------------------------- Public functions

        function chart() {}

        chart.box = function(_) {
            if (!arguments.length)
                return model.box;
            model.box = _;

            return chart;
        };

        //---------------------
        chart.pInnerRadius = function(_) {
            if (!arguments.length)
                return model.pInnerRadius;
            model.pInnerRadius = _;

            return chart;
        };

        //---------------------
        chart.pOuterRadius = function(_) {
            if (!arguments.length)
                return model.pOuterRadius;
            model.pOuterRadius = _;
            return chart;
        };

        //---------------------
        chart.pMaxHeightBar = function(_) {
            if (!arguments.length)
                return model.pMaxHeightBar;
            model.pMaxHeightBar = _;
            return chart;
        };

        //---------------------
        // This function is required in all techniques
        // It is called internally in conectChart
        chart.panel = function(_) {
            if (!arguments.length)
                return _irisPanel;
            _irisPanel = _;

            return chart;
        };

        //---------------------
        chart.data = function(_) {
            if (!arguments.length)
                return model.data;
            model.data = _;

            // Configure to sort node names
            _sort.inic(model.data.children.labelTitle.length, model.data.children.valueTitle.length)
                .data(model.data.children.data);
            _sort.exec(_cfgIndexAttr.textBar);
            _vOrder = _sort.getVetOrder();

            _irisPanel.update();
            return chart;
        };

        //---------------------
        // Configure the data that will be printed in the centroid and the text of the bar (Label only)
        chart.configCentroid = function( titulo, tituloGrau, textoBarra ) {
            _cfgIndexAttr.titleCentroid = titulo;
            _cfgIndexAttr.titleDegree = tituloGrau;
            _cfgIndexAttr.textBar = textoBarra;
            return chart;
        };

        //---------------------
        chart.dataVisToNode = function( index ) {
            return model.data.children.data[index];
        };

        //---------------------
        chart.indexAttrBar = function(_) {
            if (!arguments.length)
                return model.indexAttBar+1000;
            model.indexAttBar = _-1000;
            return chart;
        };

        chart.getVOrder = function(_) {
            return _vOrder;
        };


        //======== Actions Functions
        chart.acSortExecText = function() {
            _sortByText = true;
            _sort.exec(_cfgIndexAttr.textBar);
            _vOrder = _sort.getVetOrder();
            model.redraw += 1;
        };

        //---------------------
        chart.acSortExecAttribute = function() {
            _sortByText = false;
            _sort.exec(model.indexAttBar+1000);
            _vOrder = _sort.getVetOrder();
            model.redraw += 1;
        };

        //---------------------
        chart.acChangeAttrBar = function(atributo) {
            model.indexAttBar = atributo;
            if ( !_sortByText) {
                _sort.exec(model.indexAttBar+1000);
                _vOrder = _sort.getVetOrder();
            }
        };
        //---------------------
        return chart;
    };
});
