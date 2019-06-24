require(["dashboard","databaseUFRGS2004","clusterVisChart","clusterVisPanel"],function (Dashboard,DatabaseUFRGS2004,ClusterVisChart,ClusterVisPanel) {

	var databaseUFRGS = DatabaseUFRGS2004();
//	var dados = databaseUFRGS.getDataGraph();
	var dados = databaseUFRGS.getDataClusterVis(37);
	console.log(dados);
	var dashboard = Dashboard("viewArea");
	
	var v1 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(0,0);  
	var clusterVisChart = ClusterVisChart(v1.idChart());  
 
    clusterVisChart
	       .box ( {width:300, height:300})
           .indexAttrSort(1001)     // Atributo 0 numérico. Deve estar antes de data()		   
		   .data(dados)
		   .addAttribute(0,"V")
		   .addAttribute(1,"V")
		   .addAttribute(2,"V")
		   .addAttribute(2,"V");
//		   .addAttribute(2,"V");

		   v1.conectChart(clusterVisChart,ClusterVisPanel);
		   
// Testa alteracao de dados
/*	
    setTimeout(function () { 
	    clusterVisChart.data(databaseUFRGS.getDataClusterVis(20));
    }, 3000);	
*/		   
		   
/*	
    setTimeout(function () { 
	    clusterVisChart.addAttribute(2,"V");
        setTimeout(function () { clusterVisChart.pOuterRadius(0.27); }, 2000);	
    }, 3000);	
*/
 /*   	
    setTimeout(function () { 
       clusterVisChart.pOuterRadius(0.27); 
       console.log("passei setTimeout");	   
    }, 5000);	
 */ 

 	var v2 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(100,0);  
	var clusterVisChart2 = ClusterVisChart(v2.idChart());  
 
    clusterVisChart2
	       .box ( {width:300, height:300})
           .indexAttrSort(1001)     // Atributo 0 numérico. Deve estar antes de data()		   
		   .data(dados)
		   .addAttribute(1,"V")
		   .addAttribute(2,"V");


		   v2.conectChart(clusterVisChart2,ClusterVisPanel);
		   
});