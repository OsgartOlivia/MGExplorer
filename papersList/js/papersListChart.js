/**
 * papersListChart
 *
 */

define(["model","libCava"], function (Model,LibCava) {

    return function PapersListChart (idDiv) {

        let _papersListPanel = null,  // represents the panel associated with the graph
            _sortByText = true,
            _grpPapersList = null,   // Group representing IRIS
            _grpPapers = null,       // Selection that contains all groups of bars
            _maxLenghtTitleIndex = 6.8,
            _indexFirstData = 0,   // Index in the "dataVis" vector where the first element of the data vector is located
            // Used only when the amount of elements in this.data is less than or equal to "dataVis"

            _vOrder = null,      // Indirect ordering vector

            _orders = {
                publications: [0,1,2,3],
                journals: [1,2,3,0],
                books: [2,3,0,1],
                proceedings: [3,0,1,2],
            },

            _cfgIndexAttr = {          // Contains the indexes of the attributes that can be configured in the graph
                titleCentroid: 0,       // Index of the attribute to be printed in the center of the circle (Must be Label)
                titleDegree: "co-authors",     // Text to be used after degree value in centroid
                textBar: 0             // Text that will be printed after the bars
            },

            _nbOfTypesDoc = 4,     // number of types of documents in the base
            _colorsRect = ["#1f77b4", "#2ca02c", "#d62728", "#ff7d0e"];     // colors for the different types

        // ---------------- Model
        let model = Model();
        let lcv   = LibCava();

        // ---------------- Geometric attributes of the graph
        model.margin = {top: 2, right: 2, bottom: 2, left: 2};
        model.box = { width:150, height:150};
        model.pInnerRadius = 0.13;    // Percentage relative to graph width for _innerRadius calculation
        model.pOuterRadius = 0.57;    // Percentage relative to graph width for _OuterRadius calculation
        model.pMaxHeightBar =  0.15;  // Percentage relative to graph width for _MaxHeightBar calculation
        model.pFocusWidthBar =  0.0275;  // Percentage relative to graph width for calculation of _focusArea.widthBar
        model.pMinWidthBar = 0.01;       // Percentage relative to graph width for calculation of _minArea.widthBar Original 4

        model.indexAttBar = 0;           // Index of the attribute that will be plotted in the toolbar

        model.redraw = 0;


        // ---------------- Initialization Actions
        let _svg = d3.select("#"+idDiv).append("svg"),  // Create dimensionless svg
            _sort  = lcv.sortIris(),                     // Creates sorting function
            _grpChart = _svg.append("g");

        _svg.attr("class", "PapersListView");
        _grpPapersList = _grpChart.append("g").attr("class","PapersListChart");

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
        model.when(["data","widthChart","heightChart","redraw"],
            function _createPapersList () {
                if (_grpPapers != null)
                    _grpPapers.remove();

                _grpPapers =  _grpPapersList.selectAll(".PL-grpPapers")
                    .data(model.data.root.data.documents)
                    .enter()
                    .append("g")
                    .attr("class", "PL-grpPapers");

                let x = 5, y = -20;
                _grpPapers.append("rect")
                    .attr("class", "PL-type")
                    .attr("x", x)
                    .attr("y", function () { return y += 35 })
                    .attr("height", 10)
                    .attr("width", 10)
                    .attr("fill", function(d) {
                        return _colorsRect[_getTheIndex(d.type)];
                    })
                    .append("title")
                    .text ( function (d) { return d.type });

                x = 25;
                y = -10;
                let maxLenghtTitle = model.widthChart/_maxLenghtTitleIndex;
                _grpPapers.append("text")
                    .attr("class", "PL-title")
                    .text(function (d) {
                        if (d.title.length <= maxLenghtTitle)
                            return d.title;
                        else
                            return d.title.slice(0,maxLenghtTitle) + "..." })
                    .attr("x", x)
                    .attr("y", function () {return y += 35;})
                    .style("font-size", "12px")
                    .append("title")
                    .text(function (d) {return d.title});

                x = 25;
                y = 5;

                _grpPapers.append("text")
                    .attr("class", "PL-authors")
                    .text(function (d) {
                        let authorsNames = "";
                        for (let i = 0; i < d.authors.length; i++) {
                            authorsNames += _findAuthorById(d.authors[i]);
                            if (i !== d.authors.length-1)
                                authorsNames += ", ";
                        }
                        return authorsNames;
                    })
                    .attr("x", x)
                    .attr("y", function () {return y += 35;})
                    .style("font-size", "12px");
            } // End
        );
//--------------------------------- Private functions

        /**
         *
         * _getTheRightOrder
         *
         * Returns the index for the color
         *
         * @param type
         * @returns number
         * @private
         */
        function _getTheIndex(type) {
            switch (type) {
                case "publications":
                    return 0;
                case "conference paper":
                    return 1;
                case "report":
                    return 2;
                case "article":
                    return 3;
            }
        }

        /**
         *
         * _getTheIndex
         *
         * Returns the order in which we need to display the types of documents
         *
         * @param i
         * @returns {number[]}
         * @private
         */
        function _getTheRightOrder(i) {
            switch (i) {
                case 0:
                    return _orders.publications;
                case 1:
                    return _orders.journals;
                case 2:
                    return _orders.books;
                case 3:
                    return _orders.proceedings;
            }
        }

        /**
         *
         * _findAuthorById
         *
         * Returns the author depending on his id
         *
         * @param id
         * @returns string
         * @private
         */
        function _findAuthorById(id) {
            for (let i = 0; i < model.data.children.data.length; i++) {
                if (model.data.children.data[i].id === id) {
                    return model.data.children.data[i].labels[0];
                }
            }
            return "Not known";
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
        // This function is required in all techniques
        // It is called internally in conectChart
        chart.panel = function(_) {
            if (!arguments.length)
                return _papersListPanel;
            _papersListPanel = _;

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

            _papersListPanel.update();
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

        chart.getVOrder = function() {
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
            return chart;
        };

        //---------------------
        return chart;
    };
});