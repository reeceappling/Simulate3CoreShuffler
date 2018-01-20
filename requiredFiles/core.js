//Define variables
var allassemblies = [];
var centarray = [];
var vertarray = [];
var angarray = [];
var octantarray = [];
var newassemblies = [];
var labels = [];
var exposures =[];
var output;
var dragSrc; //initialize element to hold item drag source
var endcell;
var prevcycle =0;

var tempconst=0;

//define constants
var octms = [2,0,1,2,3,4]; //constant per row for octant table shaping
var celllayout = [3,2,1,7,1,2,3,8,7,6,5,4,6,4,5,6,7,8,8,5,12,11,10,9,5,9,10,11,12,5,8,7,12,4,15,14,13,4,13,14,15,4,12,7,3,6,11,15,3,17,16,3,16,17,3,15,11,6,3,2,5,10,14,17,2,18,2,18,2,17,14,10,5,2,1,4,9,13,16,18,1,1,1,18,16,13,9,4,1,7,6,5,4,3,2,1,1,1,2,3,4,5,6,7,1,4,9,13,16,18,1,1,1,18,16,13,9,4,1,2,5,10,14,17,2,18,2,18,2,17,14,10,5,2,3,6,11,15,3,17,16,3,16,17,3,15,11,6,3,7,12,4,15,14,13,4,13,14,15,4,12,7,8,5,12,11,10,9,5,9,10,11,12,5,8,8,7,6,5,4,6,4,5,6,7,8,3,2,1,7,1,2,3];
var typelayout = [1,1,1,3,1,1,1,1,1,1,1,1,3,1,1,1,1,1,1,4,1,1,1,1,3,1,1,1,1,4,1,1,1,4,1,1,1,3,1,1,1,4,1,1,1,1,1,1,4,1,1,3,1,1,4,1,1,1,1,1,1,1,1,1,4,1,3,1,4,1,1,1,1,1,1,1,1,1,1,1,4,3,4,1,1,1,1,1,1,3,3,3,3,3,3,3,2,3,3,3,3,3,3,3,1,1,1,1,1,1,4,3,4,1,1,1,1,1,1,1,1,1,1,1,4,1,3,1,4,1,1,1,1,1,1,1,1,1,4,1,1,3,1,1,4,1,1,1,1,1,1,4,1,1,1,3,1,1,1,4,1,1,1,4,1,1,1,1,3,1,1,1,1,4,1,1,1,1,1,1,3,1,1,1,1,1,1,1,1,3,1,1,1];
var rotationallayout = [8,8,8,1,1,1,1,8,8,8,8,8,1,1,1,1,1,1,7,4,8,8,8,8,1,1,1,1,1,1,2,7,7,4,8,8,8,1,1,1,1,1,2,2,7,7,7,7,4,8,8,1,1,1,1,2,2,2,2,7,7,7,7,7,4,8,1,1,1,2,2,2,2,2,7,7,7,7,7,7,4,1,1,2,2,2,2,2,2,4,4,4,4,4,4,4,1,2,2,2,2,2,2,2,6,6,6,6,6,6,3,3,2,3,3,3,3,3,3,6,6,6,6,6,3,5,3,4,2,3,3,3,3,3,6,6,6,6,3,5,5,3,4,4,2,3,3,3,3,6,6,3,5,5,5,3,4,4,4,2,3,3,6,3,5,5,5,5,3,4,4,4,4,2,3,5,5,5,5,5,3,4,4,4,4,4,5,5,5,3,4,4,4];

//define objects
function Assembly(label, exposure,layout,row,col) {
	this.label = label;//current assembly label
	this.exposure = exposure;//
	this.layout = layout;//layout object, {cell,type,rotational}
	this.row = row; //originating row
	this.col = col; //originating col
}

function moveableAssembly(originalsection,octantnumber,newrod,exposure){
	this.div = originalsection;
	this.exposure = exposure;
	this.newrod = newrod;//0 if not new, increment otherwise based on new rods
	this.pos = octantnumber;//position within the octant
}

function newFUE(formnum){//formnum,serialnum,labelnum,numtocreate,fueltypenum,poisons,absorbers
	this.formNumber=formnum;
}

function getrawcore(outputfile){
	return outputfile.split('\'FUE.LAB\' 6/')[1].split('  0  0     FUE.LAB/SER OR BPR.SER')[0];
}


//function to get column letter from label
function colfromlab(label){
	return label.match(/[A-R]{1}/g)[0];
}

//function to get row number from label
function rowfromlab(label){
	return Number(label.split('-')[1]);
}

//Array of column labels by letter
var labelLetterArray = ["R","P","N","M","L","K","J","H","G","F","E","D","C","B","A"];

//possibly unused, remove-------------------------------------------------
//function to convert column letter to column number
function cLetToNum(letter){
	for(var i=0;i<labelLetterArray.length;i++){
		if(letter==labelLetterArray[i]){
			return i;
		}
	}
}

//function to convert column number to column letter
function cNumToLet(n){
	return labelLetterArray(n);
}
 
 //generate blank core table in specified div
function maketable(div){
	var drows = "";
	for(var i=0;i<15;i++){
		var dcells = "";
		for(var k=0;k<15;k++){
			dcells = dcells + "<td class=\"fccell\"></td>";
		}
		drows = drows+"<tr>"+dcells+"</tr>";
	}
	$(div).append("<table id=\""+div+"\"class=\"fullcoretable\">"+drows+"</table>");
}

function genOctTab(x,y,div,z){
	var drows = "";
	for(var i=0;i<y;i++){
		var dcells = "";
		for(var k=0;k<x;k++){
			dcells = dcells + "<td class=\"octcell\"></td>";
		}
		drows = drows+"<tr>"+dcells+"</tr>";
	}
	$(div).append("<table id=\""+div.substr(1)+"t\"class=\"octtab\">"+drows+"</table>");
}

 
 //ON DOCUMENT START
$( document ).ready(function() {
	//hide new rod button
	$('#addnewrodfield').hide();
	//generate blank core tables
	/*#oldcore table*/maketable("#oldcore");
	/*#newcore table*/maketable("#newcore");
	//change full core table styles
	$('.workarea div').css("padding",0);
	$('.workarea div').css("margin",0);
	//black out unused full core cells
	$('.fullcoretable tr td').each(function(){
		if(Math.abs($(this).parent().index()-7)+Math.abs($(this).index()-7)>=11&&!(Math.abs($(this).parent().index()-7)==6&&Math.abs($(this).index()-7)==5)&&!(Math.abs($(this).parent().index()-7)==5&&Math.abs($(this).index()-7)==6)){
			blackout(this);
		}
	});
	//generate blank octant tables
	/*vertical	*/genOctTab(1,7,"#secvert",1);
	/*octant  	*/genOctTab(5,6,"#secoct",2);
	/*center 	*/genOctTab(1,1,"#seccent",3);
	/*angled	*/genOctTab(5,5,"#secangle",4);
	//resize full core cells based on window size
	$('.fccell').css('width',getcellsize(15));
	$('.fccell').css('height',getcellsize(15));
	//resize octant div height
	$('#octant').css('height',$('#oldcore').height());
	//resize and reposition section divs
	$('#secsI').css('width',getcellsize(12));
	$('#secsII').css('width',(screenwidth()/4)-(getcellsize(12)));
	$('#secsI').css('height',getcellsize(15)*15);
	$('#secsII').css('height',getcellsize(15)*15);
	$('#secsI').css("top",0);
	$('#secsII').css("top",0);
	$('#secsI').css("left",0);
	$('#secsII').css("left",getcellsize(12));
	//resize and reposition octant cells
	$('.octcell').css('width',getcellsize(12));
	$('.octcell').css('height',getcellsize(12));
	$('#secvert').css('top',"5%");
	$('#secoct').css('top',"5%");
	$('#seccent').css('top',"25%");
	$('#secoct').css('left',"35%");
	$('#secangle').css('top',"5%");
	$('#secangle').css('left',"25%");
	//black out unused octant cells, also make them draggable and change cursor to move
	/*vertical*/setListeners('#secvert tr td');
	/*center*/setListeners('#seccent tr td');
	/*angled*/$('#secanglet tr td').each(function(){useOrRemove(this,$(this).parent().index()+$(this).index()!=4);});
	/*octant*/$('#secoctt tr td').each(function(){useOrRemove(this,$(this).index()>=5-octms[$(this).parent().index()]);});
});
 
 //set cell drag attributes and listeners
 function setListeners(cell){
	$(cell).attr('draggable',true);$(cell).css('cursor',"move");
	$(cell).bind('dragover', function(e){e.preventDefault();});//prevent default dragover functionality
	$(cell).bind('dragenter', function(e){e.preventDefault();});//prevent default dragenter functionality
	$(cell).on('drop', function(evt){handleAssemblyDrop(evt);});
	$(cell).on('dragstart', function(evt){handledragstart(evt);});
	$(cell).on("dblclick", function(evt) {dblclickhandler(evt);});
 }
 
 function useOrRemove(cell,algorithm){
	if(algorithm){
		blackout(cell);
	}
	else{
		setListeners(cell);
	}
 }
 
 //ON DATA LOAD
function loadFile(file){
	//read file as text
	var reader = new FileReader();
	reader.onload = function(e) {
		loadWorkspace(reader.result);
	}
	reader.readAsText(file);
}

function loadWorkspace(rawfiletext){
	//show rod field add button
	$('#addnewrodfield').show();
	//if no rod fields, add first and set # to 0
	if($('.rodform').length==0){
		addnewrodfield();
	}
	//get previous cycle number from DEP.CYC
	var cycstr = rawfiletext.match(/\'DEP\.CYC\'\s\'c1c\d{2}\'\s\.0{3}\s\d{2}/)[0];
	prevcycle = Number(cycstr.split(" ")[cycstr.split(" ").length-1]);
	//get raw label core array
	var rawlabels = rawfiletext.split('\'FUE.LAB\' 6/')[1].split('  0  0     FUE.LAB/SER OR BPR.SER')[0].split("\n");
										//for serial .split('\'FUE.SER\' 6/');
	//note: rawlabels starts finding data on [1], ends on [15]
	//make array of labels
	labels = [];
	for(var i=1;i<=15;i++){
		var rowlabelarray = rawlabels[i].match(/\S{6}/g);
		for(var j=0;j<rowlabelarray.length;j++){
			if(rowlabelarray[j]!=null){
				labels.push({label:rowlabelarray[j],row:i-1,col:j+getBlankSpace(i-1)});
			}
		}
		rowlabelarray = null;
	}
	//get raw exposure array
	var filebyline = rawfiletext.split("WRE - Writing to restart file")[1].split('\n')[1];
	var endingexp = Number(filebyline.match(/at\s{1}exposure\s{1}\=\s+(\d{3}\.\d{4})\s{1}EFPD/g)[0].match(/\d{3}\.\d{4}/g)[0].split('.')[0]);
		//pin peak exps raw
		var rawexposure = rawfiletext.split("ITE - QPANDA Flux solution")[1].split('PIN.EDT 2XPO  - Peak Pin Exposure (GWd/T):   Assembly 2D  (AFTER PINFIL INTEGRATION)')[1].split('**   H-     G-     F-     E-     D-     C-     B-     A-     **')[0];
			//pin avg exps raw --------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
			//var rawesposure = rawfiletext.split("ITE - QPANDA Flux solution")[1].split('PRI.STA 2EXP  - Assembly 2D Ave EXPOSURE  - GWD/T')[1].split('**   H-     G-     F-     E-     D-     C-     B-     A-     **')[0];
	var rawexparray = rawexposure.split('\n');
		//numbers are in rawexparray[3-10]
	//make array of arrays of exposures
	exposures = [];
	for(var i=3;i<=10;i++){
		var exposureline = rawexparray[i].match(/\d{2}\.\d{3}/g);
		var explinearray = [];
		for(var j=0;j<exposureline.length;j++){
			explinearray.push(Math.round(Number(exposureline[j])));
		}
		exposures.push(explinearray);
	}
	//fill allassemblies with mapped exposures
	allassemblies = [];
	for(var i=0;i<labels.length;i++){
		allassemblies.push(new Assembly(labels[i].label,exposures[Math.abs(7-labels[i].col)][Math.abs(7-labels[i].row)],{cell:celllayout[i]-1,type:typelayout[i],rotation:rotationallayout[i]},labels[i].row,labels[i].col));
	}
	//fill initial and final core tables
	for(var i=0;i<allassemblies.length;i++){
		$('#oldcore').find('tr').eq(allassemblies[i].row).find('td').eq(allassemblies[i].col).css('background-color',getcolor(allassemblies[i].exposure,0));
		$('#newcore').find('tr').eq(allassemblies[i].row).find('td').eq(allassemblies[i].col).css('background-color',getcolor(allassemblies[i].exposure,0));
	}
	//fill octant
		//center
			centarray=[];
			centarray.push(new moveableAssembly("seccent",0,0,exposures[0][0]));
			$('#seccent td').css('background-color',getcolor(exposures[0][0],0));
		//vertical - 
			vertarray=[];
			for(var i=0;i<7;i++){
				vertarray.push(new moveableAssembly("secvert",i,0,exposures[i+1][0]));
				$('#secvert').find('tr').eq(6-i).find('td').eq(0).css('background-color',getcolor(exposures[i+1][0],0));
			}
		//angled
			angarray=[];
			for(var i=0;i<5;i++){
				angarray.push(new moveableAssembly("secangle",i,0,exposures[i+1][i+1]));
				$('#secangle').find('tr').eq(4-i).find('td').eq(i).css('background-color',getcolor(exposures[i+1][i+1],0));
			}
		//octant
			octantarray=[];
			var counter=0;
			for(var i=0;i<6;i++){
				for(var j=0;j<5-octms[i];j++){
					octantarray.push(new moveableAssembly("secoct",counter,0,exposures[7-i][j+1]));
					counter = counter+1;
					$('#secoct').find('tr').eq(i).find('td').eq(j).css('background-color',getcolor(exposures[7-i][j+1],0));
				}
			}
	//load assembly stats
	$('#freshassembs').html("<strong>"+totnewrods()+"</strong> / <strong>"+numbernewrods(0)+"</strong> / <strong>"+(Number(totnewrods())+Number(numbernewrods(0)))+"</strong>");
}

function getcolor(exposure,newrod){
	if(newrod==0){
		if(exposure<32.5){
			return "rgb("+Math.round(exposure*2*255/65)+",255,0)";
		}
		else{
			return "rgb(255,"+(255-Math.round((exposure-32.5)*2*255/65))+",0)";
		}
	}
	else{
		return "rgb(0,255,0)";
	}
}

//handleDragStart
function handledragstart(e) {
	dragSrc = {div:$(e.target).parent().parent().parent().parent().attr('id'),row:$(e.target).parent().index(),col:$(e.target).index()}; 
}
//handleAssemblyDrop
function handleAssemblyDrop(e) {
	if (e.stopPropagation) {
		e.stopPropagation(); // stops browser from redirecting.
	}
	endcell = {div:$(e.target).parent().parent().parent().parent().attr('id'),row:$(e.target).parent().index(),col:$(e.target).index()};
	if(dragSrc.div==endcell.div&&dragSrc.row==endcell.row&&dragSrc.col==endcell.col){
		//dropping into same cell, notify of non-functionality
		Output("<p class=\"indent\" style=\"color:orange;\">You cannot switch a cell with itself</p>");
	}
	else{ //trying to drop into different cell
		//check that drop is ok (4-4/8-8,etc)
		if(cellWorth(dragSrc)==cellWorth(endcell)){//if cell worths are the same,
			//switch and repaint octant cells
			switchCells(dragSrc,endcell);
			//repaintfinal core
			repaint();
		}
		else {//cell worth different, notify
			Output("<p class=\"indent\" style=\"color:red;\">You cannot switch a cell with a cell of different symmetry worth</p>");
		}
	}
  return false;
}

function repaint(){
	for(var i=0;i<15;i++){
		for(var j=0;j<15;j++){
			if(i==7&&j==7){//center
				if(getMoveableAssembly({div:"seccent",row:0,col:0}).newrod!=0){
					$('#newcore').find('tr').eq(i).find('td').eq(j).html(getMoveableAssembly({div:"seccent",row:0,col:0}).newrod);
				}
				else{
					$('#newcore').find('tr').eq(i).find('td').eq(j).html("");
				}
				$('#newcore').find('tr').eq(i).find('td').eq(j).css('background-color',getcolor(getMoveableAssembly({div:"seccent",row:0,col:0}).exposure,getMoveableAssembly({div:"seccent",row:0,col:0}).newrod));
			}
			else{
				if(i!=7&&j==7){//axial
					if(i<7){
						if(getMoveableAssembly({div:"secvert",row:i,col:0}).newrod==0){
							$('#newcore').find('tr').eq(i).find('td').eq(j).html(" ");
							$('#newcore').find('tr').eq(j).find('td').eq(i).html(" ");
						}
						else{
							$('#newcore').find('tr').eq(i).find('td').eq(j).html(getMoveableAssembly({div:"secvert",row:i,col:0}).newrod);
							$('#newcore').find('tr').eq(j).find('td').eq(i).html(getMoveableAssembly({div:"secvert",row:i,col:0}).newrod);
						}
						$('#newcore').find('tr').eq(i).find('td').eq(j).css('background-color',getcolor(getMoveableAssembly({div:"secvert",row:i,col:0}).exposure,getMoveableAssembly({div:"secvert",row:i,col:0}).newrod));
						$('#newcore').find('tr').eq(j).find('td').eq(i).css('background-color',getcolor(getMoveableAssembly({div:"secvert",row:i,col:0}).exposure,getMoveableAssembly({div:"secvert",row:i,col:0}).newrod));
					}
					else{
						if(getMoveableAssembly({div:"secvert",row:Math.abs(i-14),col:0}).newrod==0){
							$('#newcore').find('tr').eq(i).find('td').eq(j).html(" ");
							$('#newcore').find('tr').eq(j).find('td').eq(i).html(" ");
						}
						else{
							$('#newcore').find('tr').eq(i).find('td').eq(j).html(getMoveableAssembly({div:"secvert",row:Math.abs(i-14),col:0}).newrod);
							$('#newcore').find('tr').eq(j).find('td').eq(i).html(getMoveableAssembly({div:"secvert",row:Math.abs(i-14),col:0}).newrod);
						}
						$('#newcore').find('tr').eq(i).find('td').eq(j).css('background-color',getcolor(getMoveableAssembly({div:"secvert",row:Math.abs(i-14),col:0}).exposure,getMoveableAssembly({div:"secvert",row:Math.abs(i-14),col:0}).newrod));
						$('#newcore').find('tr').eq(j).find('td').eq(i).css('background-color',getcolor(getMoveableAssembly({div:"secvert",row:Math.abs(i-14),col:0}).exposure,getMoveableAssembly({div:"secvert",row:Math.abs(i-14),col:0}).newrod));
					}
				}
				else{
					if(i==j&&Math.abs(7-i)<6&&i!=7){//angled
						if(getMoveableAssembly({div:"secangle",row:5-Math.abs(7-i),col:Math.abs(7-i)}).newrod==0){
							$('#newcore').find('tr').eq(i).find('td').eq(i).html(" ");
						}
						else{
							$('#newcore').find('tr').eq(i).find('td').eq(i).html(getMoveableAssembly({div:"secangle",row:5-Math.abs(7-i),col:Math.abs(7-i)}).newrod);
						}
						if(getMoveableAssembly({div:"secangle",row:5-Math.abs(7-i),col:Math.abs(7-i)}).newrod==0){
							$('#newcore').find('tr').eq(14-i).find('td').eq(i).html(" ");
						}
						else{
							$('#newcore').find('tr').eq(14-i).find('td').eq(i).html(getMoveableAssembly({div:"secangle",row:5-Math.abs(7-i),col:Math.abs(7-i)}).newrod);
						}
						$('#newcore').find('tr').eq(i).find('td').eq(i).css('background-color',getcolor(getMoveableAssembly({div:"secangle",row:5-Math.abs(7-i),col:Math.abs(7-i)}).exposure,getMoveableAssembly({div:"secangle",row:5-Math.abs(7-i),col:Math.abs(7-i)}).newrod));
						$('#newcore').find('tr').eq(14-i).find('td').eq(i).css('background-color',getcolor(getMoveableAssembly({div:"secangle",row:5-Math.abs(7-i),col:Math.abs(7-i)}).exposure,getMoveableAssembly({div:"secangle",row:5-Math.abs(7-i),col:Math.abs(7-i)}).newrod));
					}
				}
			}
		}
	}
	for(var i=0;i<6;i++){//octant
		for(var j=0;j<5-octms[i];j++){
			if(getMoveableAssembly({div:"secoct",row:i,col:j}).newrod==0){
				$('#newcore').find('tr').eq(i).find('td').eq(j+8).html(" ");
				$('#newcore').find('tr').eq(i).find('td').eq(6-j).html(" ");
				$('#newcore').find('tr').eq(14-i).find('td').eq(j+8).html(" ");
				$('#newcore').find('tr').eq(14-i).find('td').eq(6-j).html(" ");
				$('#newcore').find('tr').eq(j+8).find('td').eq(i).html(" ");
				$('#newcore').find('tr').eq(6-j).find('td').eq(i).html(" ");
				$('#newcore').find('tr').eq(j+8).find('td').eq(14-i).html(" ");
				$('#newcore').find('tr').eq(6-j).find('td').eq(14-i).html(" ");
			}
			else{
				$('#newcore').find('tr').eq(i).find('td').eq(j+8).html(getMoveableAssembly({div:"secoct",row:i,col:j}).newrod);
				$('#newcore').find('tr').eq(i).find('td').eq(6-j).html(getMoveableAssembly({div:"secoct",row:i,col:j}).newrod);
				$('#newcore').find('tr').eq(14-i).find('td').eq(j+8).html(getMoveableAssembly({div:"secoct",row:i,col:j}).newrod);
				$('#newcore').find('tr').eq(14-i).find('td').eq(6-j).html(getMoveableAssembly({div:"secoct",row:i,col:j}).newrod);
				$('#newcore').find('tr').eq(j+8).find('td').eq(i).html(getMoveableAssembly({div:"secoct",row:i,col:j}).newrod);
				$('#newcore').find('tr').eq(6-j).find('td').eq(i).html(getMoveableAssembly({div:"secoct",row:i,col:j}).newrod);
				$('#newcore').find('tr').eq(j+8).find('td').eq(14-i).html(getMoveableAssembly({div:"secoct",row:i,col:j}).newrod);
				$('#newcore').find('tr').eq(6-j).find('td').eq(14-i).html(getMoveableAssembly({div:"secoct",row:i,col:j}).newrod);
			}
			$('#newcore').find('tr').eq(i).find('td').eq(j+8).css('background-color',getcolor(getMoveableAssembly({div:"secoct",row:i,col:j}).exposure,getMoveableAssembly({div:"secoct",row:i,col:j}).newrod));
			$('#newcore').find('tr').eq(i).find('td').eq(6-j).css('background-color',getcolor(getMoveableAssembly({div:"secoct",row:i,col:j}).exposure,getMoveableAssembly({div:"secoct",row:i,col:j}).newrod));
			$('#newcore').find('tr').eq(14-i).find('td').eq(j+8).css('background-color',getcolor(getMoveableAssembly({div:"secoct",row:i,col:j}).exposure,getMoveableAssembly({div:"secoct",row:i,col:j}).newrod));
			$('#newcore').find('tr').eq(14-i).find('td').eq(6-j).css('background-color',getcolor(getMoveableAssembly({div:"secoct",row:i,col:j}).exposure,getMoveableAssembly({div:"secoct",row:i,col:j}).newrod));
			$('#newcore').find('tr').eq(j+8).find('td').eq(i).css('background-color',getcolor(getMoveableAssembly({div:"secoct",row:i,col:j}).exposure,getMoveableAssembly({div:"secoct",row:i,col:j}).newrod));
			$('#newcore').find('tr').eq(6-j).find('td').eq(i).css('background-color',getcolor(getMoveableAssembly({div:"secoct",row:i,col:j}).exposure,getMoveableAssembly({div:"secoct",row:i,col:j}).newrod));
			$('#newcore').find('tr').eq(j+8).find('td').eq(14-i).css('background-color',getcolor(getMoveableAssembly({div:"secoct",row:i,col:j}).exposure,getMoveableAssembly({div:"secoct",row:i,col:j}).newrod));
			$('#newcore').find('tr').eq(6-j).find('td').eq(14-i).css('background-color',getcolor(getMoveableAssembly({div:"secoct",row:i,col:j}).exposure,getMoveableAssembly({div:"secoct",row:i,col:j}).newrod));
		}
	}
}

function recolor(div,row,col,exp,newrod){
	if(newrod==0){
		$('#'+div).find('tr').eq(row).find('td').eq(col).html(' ');
	}
	else{
		$('#'+div).find('tr').eq(row).find('td').eq(col).html(newrod);
	}
	$('#'+div).find('tr').eq(row).find('td').eq(col).css('background-color',getcolor(exp,newrod));
}

function switchCells(start,end){
	var assembsToSwap = [getMoveableAssembly(start),getMoveableAssembly(end)];
	insertAssembly(assembsToSwap[0],end);
	insertAssembly(assembsToSwap[1],start);
	recolor(start.div,start.row,start.col,assembsToSwap[1].exposure,assembsToSwap[1].newrod);//change for new rod-----------------------------
	recolor(end.div,end.row,end.col,assembsToSwap[0].exposure,assembsToSwap[0].newrod);//change for new rod-----------------------------
}

function insertAssembly(insert,ref){//ref cell used for final position
	switch(ref.div){
		case "secoct":
			octantarray[arrPos(ref.div,ref.row,ref.col)] = insert;
			break;
		case "secangle":
			angarray[arrPos(ref.div,ref.row,ref.col)] = insert;
			break;
		case "secvert":
			vertarray[arrPos(ref.div,ref.row,ref.col)] = insert;
			break;
		default:
			centarray[arrPos(ref.div,ref.row,ref.col)] = insert;
			break;
	}
}

function getMoveableAssembly(cell){
	return getMAArray(cell.div)[arrPos(cell.div,cell.row,cell.col)];
}

//function to return moveable assembly array based on div
function getMAArray(div){
	switch(div){
		case "secoct":
			return octantarray;
			break;
		case "secangle":
			return angarray;
			break;
		case "secvert":
			return vertarray;
			break;
		default:
			return centarray;
			break;
	}
}

//get section array position based on div,row,and col
function arrPos(div,row,col){
	switch(div){
		case "secoct":
			switch(row){
				case 0:
					return 0+col;
					break;
				case 1:
					return 3+col;
					break;
				case 2:
					return 8+col;
					break;
				case 3:
					return 12+col;
					break;
				case 4:
					return 15+col;
					break;
				case 5:
					return 17+col;
					break;
				default:
					//error, notify
					Output("<p class=\"indent\" style=\"color:red;\">Error: invalid octant position</p>");
					return null;
			}
			break;
		case "secangle":
			return 4-row;
			break;
		case "secvert":
			return 6-row;
			break;
		case "seccent":
			return 0;
			break;
		default:
			//error, notify
			Output("<p class=\"indent\" style=\"color:red;\">Error: invalid position</p>");
			return null;
			break;
	}
}

function cellWorth(source){
	switch(source.div){
		case "seccent":
			return 1;
			break;
		case "secvert":
			return 4;
			break;
		case "secangle":
			return 4;
			break;
		case "secoct":
			return 8;
			break;
		default:
			return 0;
	}
}

function celltype(typenum){
	switch(typenum){
		case 1:
			return "secoct";
			break;
		case 2:
			return "seccent";
			break;
		case 3:
			return "secvert";
			break;
		case 4:
			return "secangle";
			break;
		default:
			return 0;
	}
}

function typenum(celltype){
	switch(celltype){
		case "secoct":
			return 1;
			break;
		case "seccent":
			return 2;
			break;
		case "secvert":
			return 3;
			break;
		case "secangle":
			return 4;
			break;
		default:
			return 0;
	}
}

//reset core to most recent file
function resetCore(){
	if(canreset){
		ParseFile(recentFile);
		repaint();
	}
	else{
		//cant reset, notify--------------------------------------------------------
	}
}

//function to get number of new loaded assemblies of a specific type (0 will get total number of rods)
function numbernewrods(a){
	var counter=0;
	for(var i=0;i<centarray.length;i++){
		if(centarray[i].newrod==a){
			counter = counter+1;
		}
	}
	for(var i=0;i<angarray.length;i++){
		if(angarray[i].newrod==a){
			counter = counter+4;
		}
	}
	for(var i=0;i<vertarray.length;i++){
		if(vertarray[i].newrod==a){
			counter = counter+4;
		}
	}
	for(var i=0;i<octantarray.length;i++){
		if(octantarray[i].newrod==a){
			counter = counter+8;
		}
	}
	return counter;
}

//function to get total number of new assemblies
function totnewrods(){
	var counter=0;
	for(var i=0;i<centarray.length;i++){
		if(centarray[i].newrod!=0){
			counter = counter+1;
		}
	}
	for(var i=0;i<angarray.length;i++){
		if(angarray[i].newrod!=0){
			counter = counter+4;
		}
	}
	for(var i=0;i<vertarray.length;i++){
		if(vertarray[i].newrod!=0){
			counter = counter+4;
		}
	}
	for(var i=0;i<octantarray.length;i++){
		if(octantarray[i].newrod!=0){
			counter = counter+8;
		}
	}
	return counter;
}

function addnewrodfield(){
	if($('input[name=rodselector]').length>0){
		var myint=Number($('input[name=rodselector]').last().val());
	}
	else{
		var myint=0;
	}
	var formtext = "<div class=\'rodform\'>"+(myint+1)+"<strong></strong><input type=\"radio\" name=\"rodselector\" value="+(myint+1)+">#WABA<select name=\"WABA\"><option value=0>0</option><option value=4>4</option><option value=8>8</option><option value=12>12</option></select>#IFBA<select name=\"IFBA\"><option value=0>0</option><option value=32>32</option><option value=64>64</option><option value=96>96</option><option value=128>128</option><option value=156>156</option></select><input class=\"delbutton\" type=\"button\" value=\"Delete\"/></div>";
	if($('.rodform').length>0){
		$id("rodsettings").innerHTML =  $id("rodsettings").innerHTML+formtext;
	}
	else{
		$id("rodsettings").innerHTML =  $id("rodsettings").innerHTML+formtext;
		$('input[name=rodselector]').prop("checked",true);
	}
	$('#info_and_new').css('height',$('#newrods').height());
	$('.delbutton').on( "click",function(evt){
		deletehandler(evt);
	});
}
//make sure selected stays selected---------------------------------------

function deletehandler(e){
	//$(e.target).parent().find('input[name=rodselector]').val();//gets rod selector value to delete
	//getdeletedvalue: $(e.target).parent().find('input[name=rodselector]').attr("value")
	//loop through octants to remove all deleted rods - octants made at ~line235
	var deletedval=$(e.target).parent().find('input[name=rodselector]').attr("value");
	var currentselected = $('input[name=rodselector]:checked').attr("value");
	if($('input[name=rodselector]').length>1){//if rod field is not only field
		//center
		if(getMAArray("seccent")[arrPos("seccent",0,0)].newrod==deletedval){
			getMAArray("seccent")[arrPos("seccent",0,0)].newrod=0;
			recolor("seccent",0,0,getMoveableAssembly({div:"seccent",row:0,col:0}).exposure,0);
		}
		//axial
		for(var i=0;i<vertarray.length;i++){
			if(getMAArray("secvert")[arrPos("secvert",i,0)].newrod==deletedval){
				getMAArray("secvert")[arrPos("secvert",i,0)].newrod=0;
				recolor("secvert",i,0,getMoveableAssembly({div:"secvert",row:i,col:0}).exposure,0);
			}
		}
		//angular
		for(var i=0;i<angarray.length;i++){
			if(getMAArray("secangle")[arrPos("secangle",i,4-i)].newrod==deletedval){
				getMAArray("secangle")[arrPos("secangle",i,4-i)].newrod=0;
				recolor("secangle",i,4-i,getMoveableAssembly({div:"secangle",row:i,col:4-i}).exposure,0);
			}
		}
		//octant
		for(var i=0;i<octantarray.length;i++){
			for(var j=0;j<5-octms[i];j++){
				if(getMAArray("secoct")[arrPos("secoct",i,j)].newrod==deletedval){
					getMAArray("secoct")[arrPos("secoct",i,j)].newrod=0;
					recolor("secoct",i,j,getMoveableAssembly({div:"secoct",row:i,col:j}).exposure,0);
				}
			}
		}
		repaint();
		$(e.target).parent().remove();//removes assembly field
		$('#info_and_new').css('height',$('#newrods').height());
		if(typeof currentselected!='undefined'){
			$('input[name=rodselector]').each(function(){
				if($(this).attr("value")==currentselected){
					$(this).prop("checked",true);
				}
				else{
					$(this).prop("checked",false);
				}
			});
		}
	}
}
//handles rod type deletions, ensure all rods of that type are set to newrod 0
//repaint all

function dblclickhandler(e){
	var ref = {div:$(e.target).parent().parent().parent().parent().attr('id'),row:$(e.target).parent().index(),col:$(e.target).index()};
	if(typeof $('input[name=rodselector]:checked').val()!='undefined'){
		switch(ref.div){
			case "secoct":
				if(octantarray[arrPos(ref.div,ref.row,ref.col)].newrod!=0){
					octantarray[arrPos(ref.div,ref.row,ref.col)].newrod=0;
				}
				else{
					octantarray[arrPos(ref.div,ref.row,ref.col)].newrod = $('input[name=rodselector]:checked').val();
				}
				break;
			case "secangle":
				if(angarray[arrPos(ref.div,ref.row,ref.col)].newrod!=0){
					angarray[arrPos(ref.div,ref.row,ref.col)].newrod=0;
				}
				else{
					angarray[arrPos(ref.div,ref.row,ref.col)].newrod = $('input[name=rodselector]:checked').val();
				}
				break;
			case "secvert":
				if(vertarray[arrPos(ref.div,ref.row,ref.col)].newrod!=0){
					vertarray[arrPos(ref.div,ref.row,ref.col)].newrod=0;
				}
				else{
					vertarray[arrPos(ref.div,ref.row,ref.col)].newrod = $('input[name=rodselector]:checked').val();
				}
				break;
			default:
				if(centarray[arrPos(ref.div,ref.row,ref.col)].newrod!=0){
					centarray[arrPos(ref.div,ref.row,ref.col)].newrod=0;
				}
				else{
					centarray[arrPos(ref.div,ref.row,ref.col)].newrod = $('input[name=rodselector]:checked').val();
				}
				break;
		}
	}
	else{
		Output(
			"<p>"+now()+"</p><p class=\"indent\" style=\"color:red;\">	<strong>New rod type not selected<strong></p>"
		);
	}
	recolor(ref.div,ref.row,ref.col,getMoveableAssembly(ref).exposure,getMoveableAssembly(ref).newrod);
	repaint();
	$('#freshassembs').html("<strong>"+totnewrods()+"</strong> / <strong>"+numbernewrods(0)+"</strong> / <strong>"+(Number(totnewrods())+Number(numbernewrods(0)))+"</strong>");
}
//ensure one button is checked at all times-------------------------------------

//gets lowest available rod setting form number
function getlowestavailform(){
	if($('.rodform').length==0){
		return 1;
	}
	else{
		var count=1;
		var exists =false;
		var exitloop = false;
		while(exitloop==false){
			for(var i=0;i<$('input[name=rodselector]').length;i++){
				if($('input[name=rodselector]').eq(i).val()==count){
					exists=true;
					i=$('input[name=rodselector]').length;
				}
			}
			if(exists==false){
				exitloop=true;
			}
			else{
				exists=false;
				count++;
			}
		}
		return count;
	}
}

function outputCore(){
	outputc=[];
	for(var i=0;i<allassemblies.length;i++){
		//in cell of same # and type, but rotation 1 (our tables),
		//get originating table and number,
		//place originating table and number but our initial rotation cell into new assembly array
		var originatingnumber = getMAArray(celltype(allassemblies[i].layout.type))[allassemblies[i].layout.cell].pos;
		var originatingtype = getMAArray(celltype(allassemblies[i].layout.type))[allassemblies[i].layout.cell].div;
		//IF CELL IS NEW ROD, place new rod label in
		if(getMAArray(celltype(allassemblies[i].layout.type))[allassemblies[i].layout.cell].newrod>0){
			outputc.push("25--"+getMAArray(celltype(allassemblies[i].layout.type))[allassemblies[i].layout.cell].newrod);
		}
		//otherwise cell is not new rod, continue mapping
		else{
			for(var j=0;j<allassemblies.length;j++){
				if(allassemblies[j].layout.rotation==allassemblies[i].layout.rotation&&(allassemblies[j].layout.cell==originatingnumber)&&(celltype(allassemblies[j].layout.type)==originatingtype)){
					outputc.push(allassemblies[j].label);
					j=allassemblies.length;
				}
			}
		}
	}
	var outastext ="";
	var outcount = 0;
	for(var i=0;i<15;i++){
		outastext = outastext.concat("\u00A0");
		if(i+1<10){
			outastext = outastext.concat("\u00A0");
		}
		outastext = outastext.concat(i+1+"\u00A0\u00A0 1");
		for(var j=0;j<15-getBlankSpace(i);j++){
			if(j<getBlankSpace(i)){
				outastext = outastext=outastext.concat("\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0\u00A0");
			}
			else{
				outastext = outastext.concat("\u00A0"+outputc[outcount]);
				outcount++;
			}
		}
		outastext = outastext.concat("\n");
	}
	var out = outastext.split('\n');
	outastext = "";
	for(var i=0;i<out.length;i++){
		outastext = outastext.concat(out[i]+/*"\n"*/"\n");
	}
	return outastext;
}

function generateresults(){
	var fileresults = "";
	fileresults = fileresults.concat("\'DIM.PWR\' 15 15 15 0/\n\'DIM.CAL\' "+prevcycle+" 2 2 1/\n\'DIM.DEP\' \'HTMO\' \'HTFU\' \'SAM\' \'HBOR\' \'EXP\' \'PIN\' \'EBP\'/\n\n\'FUE.LAB\' 6/\n");
	fileresults = fileresults.concat(outputCore());
	fileresults = fileresults.concat("\n\n\n\'COM\'               SERIAL   NUMBER TO    FUEL    BATCH\n\'COM\'               LABEL     CREATE	  TYPE   NUMBER\n");
	//FUE NEW CARDS-------------- EX:\'FUE.NEW\' \'TYPE01\', \'sil00\',	  97,        44,    ,,1/\n ----------------------------------------
		//	'FUE.NEW' 'TYPE01', 'sil00',	  97,        44,    ,,1/
		// 97 - number of rod type
		// 44 -
		// 1  -
		//-------------------------------------------------------------------------------
	fileresults = fileresults.concat("\n");
	//RESTART FILE              EX: \'RES\' \'c1c24eoc.res\' 20000.  /\n
	fileresults = fileresults.concat("\'RES\' \'c1c"+prevcycle+"eoc.res\' 20000.  /\n");
	fileresults = fileresults.concat("\n");
	fileresults = fileresults.concat("\'LIB\' \'./cms.pwr-all2.lib\'/");
	//SEGMENT LIBRARIES ------------------------------------------------------------------
		//	\'SEG.LIB\'  44 \'sil400p0a0\' 0 0/\n
		//	\'SEG.LIB\'  45 \'sil400p0a0\' 0 0/\n
	fileresults = fileresults.concat("\n");
	//SEG.DAT CARDS ----------------------------------------------------------------------
/*
'SEG.DAT' 4 2.600000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 5 2.600000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 10 4.600000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 11 4.600000E+00 0.000000E+00 0.000000E+00 1.600000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 12 4.600000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 13 4.600000E+00 1.500000E+00 0.000000E+00 1.600000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 14 4.950000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 15 4.950000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 16 4.950000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 17 4.950000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 18 4.100000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 19 4.100000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 20 4.600000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 21 4.600000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 22 4.600000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 23 4.950000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 24 4.950000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 25 4.950000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 26 4.950000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 27 4.550000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 28 4.550000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 29 4.550000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 30 4.850000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 31 4.850000E+00 0.000000E+00 0.000000E+00 2.400000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 32 4.850000E+00 1.500000E+00 0.000000E+00 2.400000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 33 4.850000E+00 1.500000E+00 0.000000E+00 2.400000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 34 4.950000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 35 4.950000E+00 0.000000E+00 0.000000E+00 2.000000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 36 4.950000E+00 0.000000E+00 0.000000E+00 2.400000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 37 4.950000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 38 4.950000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 39 4.950000E+00 1.500000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 40 4.950000E+00 1.500000E+00 0.000000E+00 2.000000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 41 4.950000E+00 1.500000E+00 0.000000E+00 2.400000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 42 4.950000E+00 1.500000E+00 0.000000E+00 2.400000E+01 0.000000E+00 0.000000E+00/
'SEG.DAT' 43 2.050000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 44 4.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
'SEG.DAT' 45 4.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00 0.000000E+00/
*/
	fileresults = fileresults.concat("\n");
	//FUE.ZON cards -------------------------------------------------------------------
		//	'FUE.ZON' 44 1 'sil495p0a0' 1 .000 45 15.240 44 22.860 44 30.480 44 335.280 44 342.900 44 350.520 45 365.760 3/
	fileresults = fileresults.concat("\n");
	//ITE BOR ------------------------------------------------------------------------
	//fileresults.push("\'ITE.BOR\' 1500/\n");
		//	'ITE.BOR' 1500/
	//COR.OPE ------------------------------------------------------------------------
	//fileresults.push("\'COR.OPE\' 100/\n");
		//	'COR.OPE' 100/
	fileresults = fileresults.concat("\n");
	fileresults = fileresults.concat("\'DEP.CYC\' \'c1c"+(prevcycle+1)+"\' .000 "+(prevcycle+1)+" "+getStartEndDate()+"/ * new cycle date, prev. end cyle date\n");
	fileresults = fileresults.concat("\'ERR.SUP\'/\n");
	//cycle exposure steps line 2
	fileresults = fileresults.concat("\'DEP.STA\' 'AVE' 0.0 -25. 150. -50. 590. /                       * Cycle exposure steps (EFPD)\n");
	//STA line 1
	fileresults = fileresults.concat("\'STA\'/\n");
	//cycle exposure steps line 2
	fileresults = fileresults.concat("\'DEP.STA\' \'AVE\' 620. /                       * Cycle exposure steps (EFPD)\n");
	//comment for ITE Line
	fileresults = fileresults.concat("\'COM\' The following performs an automated search on power at a boron of 0 ppmCOM\n");
	//performs an automated search on power at a boron of 0 ppmCOM
	fileresults = fileresults.concat("\'ITE.SRC\' \'SET\' \'POWER\'/\n\n");
	//WRA line
	fileresults = fileresults.concat("\'WRE\' \'c1c"+(prevcycle+1)+"eoc.res\'/\n");
	//STA line 2
	fileresults = fileresults.concat("\'STA\'/\n");
	//end file line
	fileresults = fileresults.concat("\'END\'/");
	//fileresults.push("");
	for(var i=0;i<fileresults.split("\n").length;i++){
		Output(fileresults.split("\n")[fileresults.split("\n").length-1-i]+"<br>");
	}
}

function getStartEndDate(){
	//for cycle24 should return 
	return "20181227 20181129";
}
//-------------------------------------------------------------------------------

function getBlankSpace(row){
	if(row==0||row==14){
		return 4;
	}
	if(row==1||row==13){
		return 2;
	}
	if(row==2||row==3||row==11||row==12){
		return 1;
	}
	return null;
}

function checkpoint(){
	tempconst++;
	Output("checkpoint "+tempconst+"<br>");
}

//double click insert on new core, not octant
//--------------------------------------------------------------------------------

//function to verify exposure is within limits
//-------------------------------------------------------------------------------
 
 //generate TAB.TFU, FUE.ZON, etc,
 //-------------------------------------------------------------------------------
 
 //use generated TAB.TFU/etc and full core to generate .inp file
 //-------------------------------------------------------------------------------
 
 
 //maybe
 //check # silicide rods
 //re-orient half-removals div over octant------------------------------------
 //half-removal dynamic table size--------------------------------------------
 //add half-removal functionality, (removing and readding)--------------------
 
 
 //remove BR from calls to output ----------------------------------------------------
  //change all calls to output to contain <p class="indent"> ----------------------------------------------------
  
  //reposition workspace--------------------------------------
  
  //re-order script functions etc-------------------------------------------
  
  //output-------------------------------------
  
  //load from old state point in webspage (locally saved)--------------------------------
