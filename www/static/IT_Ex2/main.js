//Author: James Adams
//I imported JQuery and a KS math library to the index.html, assuming that's okay.

//init stuff - enters here the first time the page loads.
document.addEventListener("DOMContentLoaded", function() {		
      	  if (!sessionStorage['done']) {
       		sessionStorage['done'] = 'yes';
       		generate_initial_divs();
       		generate_form();
  		  }
});

//warn on refresh/page close. 
window.onbeforeunload = function() {
  return "Refresh/data storage between instances has not been implemented, as it was not mentioned in the assignment spec. Open the application in a new tab to start over.";
};

//transfer functions between the 'pages'
function login_to_profile() {
	//this can also be done by just deleting the form as in profile_to_login.
	x=document.getElementById("login");
	y=document.getElementById("login_form");
	x.removeChild(y);
	//render the profile page.
	txt="<button onclick='return profile_to_login()'>Logout</button>"
	txt=txt+"<button onclick='return profile_to_calculator()'>Calculator</button>"
	var profile = "<H2>Welcome to James Adams' Calculator Extravaganza!</H2>\
	<p> In my free time, I like to go rock climbing, hiking, or play guitar.</p> \
<p>\"You don't have to be smart to laugh at farts, but you have to be stupid not to.\" - Louis C.K . </p>\
<img src=\"climbing.jpg\" width ='560' height = '560' onmouseover=\"this.src='james.jpg'\" onmouseout=\"this.src='climbing.jpg'\" />\
";
	$("#profile").append(txt,profile);
}

function profile_to_calculator() {
	//clean up/erase the profile
	document.getElementById("profile").innerHTML="";
	var heading = document.createElement("h1");  // Create with DOM
    heading.innerHTML = "Calculator page!";
    button="<button onclick='return generate_calc()'>New Calculator</button>";
    $("#calc").append(heading,button);
    calculators=[];
    //create the initial calculator
    generate_calc();
}

function profile_to_login() {
	document.getElementById("profile").innerHTML="";
	generate_form();
}


//render functions

function generate_form() {
	//add stuff to form.
	txt="<form name='loginForm' id='login_form' onsubmit='return validateForm()' method='post'>\
	Username: <input type='text' name='uname'>\
	Password: <input type='password' name='pword'>\
	<input type='submit' value='login'>\
	</form>";
	$("#login").append(txt);

}

function generate_initial_divs() {
	login_div="<div id='login'> </div>";
	profile_div="<div id='profile'> </div>";
	calc_div="<div id='calc'> </div>"
	$("body").append(login_div,profile_div,calc_div);
}

//form validation
function validateForm() {
    var username = document.forms["loginForm"]["uname"].value;
    var password = document.forms["loginForm"]["pword"].value;
    if (username=="admin" && password == "admin") {
    	login_to_profile();
    	return false;
    }
    else {
    	//unsuccesful login, print error message
    	alert("Unsuccesful login. Please check your credentials, and try again.");
    	return false;
    }
}

//Calc functions/class/object

//use math library from mathjs.org
function Calc (id) {
	this.id=id;
	this.value=0;
}
 
Calc.prototype.parse = function() {
	var new_value=math.eval(document.getElementById("value_calc_"+this.id).value);
	this.replace(new_value);
	this.value=new_value;
};

Calc.prototype.replace = function (val)
{
	document.getElementById("value_calc_"+this.id).value=val;
	this.value=val;
}
Calc.prototype.add = function(val) 
{
	document.getElementById("value_calc_"+this.id).value+=val;
	this.value+=val;
}

//http://www.accessify.com/tools-and-wizards/developer-tools/html-javascript-convertor/
function generate_calc() {
	var calc_num = calculators.length;
	//specialise the text.
var calc="";
//calc += "<div id=\"ID\">";
//ensure proper calc id gets inserted.
calc +="<div id='"
calc +=calc_num;
calc +="'>";
calc += "<p>";
calc +="<input type=\"text\" readonly size=\"18\" id=\'value_calc_";
calc+=calc_num
calc+="'>";
calc += "<\/p>";
calc += "<p>";
calc += "<input type=\"button\" value=\"1\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('1')\">";
calc += "<input type=\"button\" value=\"2\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('2')\">";
calc += "<input type=\"button\" value=\"3\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('3')\">";
calc += "<input type=\"button\" value=\"+\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('+')\">";
calc += "<\/p>";
calc += "<p>";
calc += "<input type=\"button\" value=\"4\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('4')\">";
calc += "<input type=\"button\" value=\"5\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('5')\">";
calc += "<input type=\"button\" value=\"6\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('6')\">";
calc += "<input type=\"button\" value=\"-\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('-')\">";
calc += "<\/p>";
calc += "<p>";
calc += "<input type=\"button\" value=\"7\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('7')\">";
calc += "<input type=\"button\" value=\"8\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('8')\">";
calc += "<input type=\"button\" value=\"9\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('9')\">";
calc += "<input type=\"button\" value=\"*\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('*')\">";
calc += "<\/p>";

calc += "<input type=\"button\" value='/' onclick=\"calculators[";
calc+= calc_num;
calc+="].add('/')\">";
calc += "<input type=\"button\" value=\"(\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add('(')\">";
calc += "<input type=\"button\" value=\")\" onclick=\"calculators[";
calc+= calc_num;
calc+="].add(')')\">";
calc +="<input type=\"button\" value=\"=\" onclick=\"calculators[";
calc+=calc_num;
calc+="].parse()\">";

//calc += "<input type=\"button\" value=\"=\" onclick=\"calc_parse()\">";
calc += "<input type=\"button\" value=\"C\" onclick=\"calculators[";
calc+=calc_num;
calc+="].replace(' ')\">";

//calc += "<input type=\"button\" value=\"C\" onclick=\"calc_replace(' ')\">";
calc += "<\/div>";
calc+="<hr>";
$("#calc").append(calc);
calculators[calc_num]=new Calc(calc_num);
return false;
}



