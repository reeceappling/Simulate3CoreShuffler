function screenwidth(){
	return $(window).width();
}

//get row number of a cell
function getrow(tableid){
	return $(tableid).parent().index();
}

//get column number of a cell
function getcol(tableid){
	return $(tableid).index();
}

//get size of single cell for x cells
function getcellsize(x){
	return screenwidth()/(3*x);
}

//black out a given cell and hide it in background
function blackout(cell){
	$(cell).css("background-color","black");
	$(cell).css("z-index",-999);
}

//returns time and date
function now(){
	return new Date();
}

//input JSON object, output string
function objToStr(obj){
	return JSON.stringify(obj);
}

//input JSON string, output JSON object
function strToObj(str){
	return JSON.parse(str);
}

function toggleconsole(){
	$('#msgs').toggle();
}