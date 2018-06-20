var LIVES_ALARM_NAME = "com.focusHD.Lives";
var livesRemaining = 0;
var usingLive = false;

var liveTime = 1000 * 60 * 5;


function resetLives(){
	usingLive = false;
	livesRemaining = 3;
}

function canUseLive(){
	return livesRemaining > 0;
}

function statusLivesDecorator(status){
	status.lives = livesRemaining;
}

function sessionRestarted(){
	browser.alarms.clear(LIVES_ALARM_NAME);
	usingLive = false;
}

function useLive(){

	if(usingLive || livesRemaining <= 0)
	{
		console.log("lives: useLive: illegal call");
		return false;
	}

	usingLive = true;
	var now = Date.now();

	browser.alarms.create(
    	LIVES_ALARM_NAME,
    	{ when : now + liveTime}
  	)

	livesRemaining--;

	if(!browser.alarms.onAlarm.hasListener(liveIsOver))
   	 browser.alarms.onAlarm.addListener(liveIsOver);
}

function liveIsOver(alarm){
	
	if(alarm.name != LIVES_ALARM_NAME)
    	return;

    usingLive = false;
    
    var timer = getGlobalTimerInstance();
    timer.start();
    console.log(timer);

    browser.notifications.create("livesTimeUp", {
	    "type": "basic",
	    "iconUrl": browser.extension.getURL("icons/icono48.png"),
	    "title": "Time's up",
	    "message": "Get back to work",
  	});

  	browser.tabs.reload();
}

// Message dispatcher
function livesHandler(request, sender, sendResponse)
{
  
	if(request.action == "Get")
	{
	  sendResponse({remaining: livesRemaining});
	  return;
	}

	sendResponse({error: "Action unknown"});
}



function bindLivesTimerListeners()
{
	var timer = getGlobalTimerInstance();
	timer.addStartListener(resetLives);
	timer.addPauseListener(useLive);
	timer.addDoneListener(resetLives);
	timer.addResumeListener(sessionRestarted);

	timer.addBeforePauseListener(canUseLive);
	timer.addStatusDecorator(statusLivesDecorator);
}

bindLivesTimerListeners();
