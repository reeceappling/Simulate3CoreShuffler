var recentFile;
var canreset=false;

function drop_handler(e){
	if (e.preventDefault) { e.preventDefault(); }
	// fetch FileList object
	var files = e.target.files || e.dataTransfer.files;

	// process all File objects
	for (var i = 0, f; f = files[i]; i++) {
		ParseFile(f);
	}
  return false;
}

function ParseFile(file) {
	if(file.name.split('.')[1]=='out'){
		Output(
			"<p>"+now()+"</p>"+
			"<p class=\"indent\" style=\"color:green;\">	<strong>Accepted File: " + file.name +
			"</strong> size: <strong>" + file.size/1000 +
			"</strong> kB</p>"
		);
		recentFile=file;
		canreset=true;
		$('#loadtext').html("Current file: "+file.name);
		$('#filedroptext').html("Drag another .out file here to reset, or");
		$('#loadtext').css("color","green");
		$('#dropArea').slideUp();
		loadFile(file);
	}
	else {
		if($('#loadtext').css("color")!="rgb(0, 255, 0)"){
			$('#loadtext').html("Incorrect File Format");
			$('#loadtext').css("color","red");
			alert("Incorrect file format, files must have .out extension");
		}
		else{alert("Incorrect file format, work has not been reset");}
		Output(
			"<p>"+now()+"</p>"+
			"<p class=\"indent\" style=\"color:red;\">	<strong>Rejected File: " + file.name +
			"</strong> size: <strong>" + file.size/1000 +
			"</strong> kB</p>"
		);
	}
	
}

// getElementById
function $id(id) {
	return document.getElementById(id);
}

//
// output information
function Output(msg) {
	var m = $id("msgs");
	m.innerHTML =  msg + m.innerHTML;
}
$( document ).ready(function() {
    document.getElementById('fileselect').addEventListener('change',drop_handler,false);
	Output(
			"<p>"+now()+"</p>"+
			"<p class=\"indent\">Program Started</p>"
		);
});