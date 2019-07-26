/**
 * papersListPanel
 *
 */

define([], function () {

    return function PapersListPanel (papersListChart) {
        let _papersChart = papersListChart,
            _width = 220,
            _height = 80,
            _selectOrder = null,
            _selectAttr  = null,
            _vAttrEdgesSelecionaveis = [],
            _idPanel;     // Assigned in create

        function _addItemsSelectOrder() {
            let selOption;

            selOption = d3.select("#" + _idPanel + " .PL-selOrderBy").selectAll("option");
            if (!selOption.empty())
                selOption.remove();

            _selectOrder.append(new Option("Text", 0));
            _selectOrder.append(new Option("Attribute", 1));  // 100 starts numeric index

            _selectOrder[0].selectedIndex = 0;

            _selectOrder.change( function(){
                let valor = +this.value;

                if (valor===0)
                    _papersChart.acSortExecText();
                else
                    _papersChart.acSortExecAttribute();
            });

        }

        function _addSelectOrder( idDivPanel) {
            _selectOrder = $("<select>", { class: "IC-selOrderBy"});
            $(idDivPanel).append( $("<br/>") ).append( $("<label>").append("&nbsp;Order by:")).append(_selectOrder);
            _addItemsSelectOrder();
        }

        //-----------------------------------

        function panel() {}

        panel.create = function( idPanel) {
            _idPanel = idPanel;
            let divPanel = $("<div/>",{
                class:"PL-panel"
            }).css({"width":_width, "height": _height});
            $("#"+_idPanel).append(divPanel);

            //------------- Select for sort order
            _addSelectOrder("#"+ _idPanel + " .PL-panel");

            return panel;
        };

        //---------------------
        panel.update = function() {
        };

        panel.includeSelectAttr = function ( vAttrEdgesSelecionaveis) {
            let i;
            for (i=0; i<vAttrEdgesSelecionaveis.length; i++)
                _vAttrEdgesSelecionaveis[i] = vAttrEdgesSelecionaveis[i];
            _selectAttr = $("<select>", { class: "PL-selAtributo"});
            $("#"+ _idPanel + " .PL-panel").append( $("<br/>") ).append( $("<label>").append("&nbsp;Show attribute:")).append(_selectAttr);

            for (i=0; i<vAttrEdgesSelecionaveis.length; i++) {
                if ( vAttrEdgesSelecionaveis[i] >= 1000)
                    _selectAttr.append(new Option(_papersChart.data().edges.valueTitle[vAttrEdgesSelecionaveis[i]-1000], vAttrEdgesSelecionaveis[i]-1000));
            }

            _selectAttr.change( function(){
                let valor = +this.value;
                _papersChart.acChangeAttrBar(valor);
            });
        };

        //---------------------
        return panel;
    };

});
