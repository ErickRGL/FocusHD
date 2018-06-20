var totalLives = 3;
var currentLives = 3;
var blockedPage = "";

var modal = document.getElementById('myModal');

var btn = document.getElementById("openButton");

function setLivesUI(){
	// Modify the text for the remaining lives
	var textLives = document.getElementById("textLives");
	textLives.innerHTML = "You got " + currentLives + " lives left";

	// Modify the hearts appearing in the focusHD page
	var lives = document.getElementById("livesIcons");
	var innerLives = "";
	if (totalLives - currentLives < 0){
	    totalLives = 3;
	    currentLives = 0;
	}
	// Full hearts
	for (var i = 0; i < currentLives; i++) {
	   innerLives += '<i class="fa fa-heart" aria-hidden="true"></i>';
	}
	// Empty hearts
	for (var i = 0; i < totalLives-currentLives; i++) {
	   innerLives += '<i class="fa fa-heart-o" aria-hidden="true"></i>';
	}

	lives.innerHTML = innerLives;
}

// Close the modal
var span = document.getElementsByClassName("close")[0];
btn.onclick = function() {
    modal.style.display = "block";
}
span.onclick = function() {
    modal.style.display = "none";
}

window.onclick = function(event) {
    if (event.target == modal) {
        modal.style.display = "none";
    }
} 

function setLives(message){
	currentLives = message.remaining;
	setLivesUI();
}

function setBlockedPage(message){
	blockedPage = message.blocked;
}

function init(){
	askBackgroundPage("Lives", "Get", setLives);
	askBackgroundPage("Blocker", "Get", setBlockedPage);
}

function askBackgroundPage(sending, action, callback) {
  var sending = browser.runtime.sendMessage({
    sending : sending,
    action: action
  });

  sending.then(callback);  
}

init();

$('#closeTab').click(function(){
	window.location.replace("http://www.google.com");
});

$('#distract').click(function(){

	function redirect()
	{
		window.location.replace(blockedPage);
	}

	browser.runtime.sendMessage(
	{
	    sending : "Timer",
	    action: "Stop"
	}).then(redirect); 
});