require(["dashboard","databaseUFRGS2004","clusterVisChart","clusterVisPanel"],function (Dashboard,DatabaseUFRGS2004,ClusterVisChart,ClusterVisPanel) {

	let databaseUFRGS = DatabaseUFRGS2004();
//	var dados = databaseUFRGS.getDataGraph();
	let dados = databaseUFRGS.getDataClusterVis(37);
	console.log(dados);
	let dashboard = Dashboard("viewArea");
	
	let v1 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(0,0);  
	let clusterVisChart = ClusterVisChart(v1.idChart());
 
    clusterVisChart
	       .box ( {width:300, height:300})
           .indexAttrSort(1001)     // Numeric attribute 0. Must be before data()
		   .data(dados)
		   .addAttribute(0,"V")
		   .addAttribute(1,"V")
		   .addAttribute(2,"V")
		   .addAttribute(2,"V");
//		   .addAttribute(2,"V");

		   v1.conectChart(clusterVisChart,ClusterVisPanel);
		   
// Test change data
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

 	let v2 = dashboard
	           .configureView({barTitle:true, draggable:true, resizable:true,aspectRatio:true})
	           .newView(100,0);  
	let clusterVisChart2 = ClusterVisChart(v2.idChart());
 
    clusterVisChart2
	       .box ( {width:300, height:300})
           .indexAttrSort(1001)     // Numeric attribute 0. Must be before data()
		   .data(dados)
		   .addAttribute(1,"V")
		   .addAttribute(2,"V");
		   v2.conectChart(clusterVisChart2,ClusterVisPanel);
		   
});
