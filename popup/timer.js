/*
Listen for clicks in the popup.

If the click is on one of the beasts:
  Inject the "beastify.js" content script in the active tab.

  Then get the active tab and send "beastify.js" a message
  containing the URL to the chosen beast's image.

If it's on a button wich contains class "clear":
  Reload the page.
  Close the popup. This is needed, as the content script malfunctions after page reloads.
*/

var remaining = NaN;
var starting = Date.now();

function handleResponse(message) {
  console.log(`Message from the background script:  ${message}`);
  console.log(message);
  
  notifyBackgroundPage("Timer", "Status", updateWithTimerStatus);
}

function handleError(error) {
  console.log(`Error: ${error}`);
}

function notifyBackgroundPage(sending, e, callback = handleResponse) {
  var sending = browser.runtime.sendMessage({
    sending : sending,
    action: e
  });
  sending.then(callback, handleError);  
}

function handleTimerMessage(request, sender, sendResponse)
{
  if(request.sending == "Popup")
  {
    if(request.done)
    {
      var gettingActiveTab = browser.tabs.query({active: true, currentWindow: true});
      gettingActiveTab.then((tabs) => {
        browser.tabs.sendMessage(tabs[0].id, {});
      });
    }
  }
}

function stopCommandVerify(message)
{

  if(!message.success)
  {
    alert("Could not stop the timer! You must be out of lives.");
  }

  handleResponse(message);
}

function updateWithTimerStatus(status)
{
	console.log(status);
  remaining = status.remainingTime;
  starting = Date.now();

  var timerRunning = status.running;
  if(status.paused)
  {
    updateTime();
    remaining = NaN;
    $(".timerAction").text("Continue");
  }
  else if (!timerRunning)
  {
      $(".timerAction").text("Start");
      remaining = NaN;
  }
  else 
  {
    updateTime();
    bindUpdateTime();
    $(".timerAction").text("Stop");
  }

}

function updateTimerStatus()
{
	var text = $(".timerAction").text();
    if (text == "Start" || text == "Continue"){
        notifyBackgroundPage("Timer", "Start");
        $(".timerAction").text("Stop");
    }
    else{
      notifyBackgroundPage("Blocker", "Trigger", stopCommandVerify);
      $(".timerAction").text("Start");
    }
}

function bindUpdateTime(){
  if(!isNaN(remaining))
    setTimeout(updateTime, 1000);
}

function updateTime()
{

  if(isNaN(remaining))
    return;

  var now = Date.now();
  var remainingSeconds = (remaining - (now - starting)) / 1000;

  var minutes = remainingSeconds / 60;
  var seconds = remainingSeconds % 60;

  if(remainingSeconds <= 0)
  {
    minutes = 0;
    seconds = 0;  
  }
  else
  {
    bindUpdateTime();
  }

  if(seconds < 10 && minutes > 10){
      $(".timer").text( parseInt(minutes) + ":0" + parseInt(seconds) );
  }
  else if (minutes < 10 && seconds > 10){
      $(".timer").text( parseInt(minutes) + "0:" + parseInt(seconds) );
  } 
  else if (minutes < 10 && seconds < 10){
      $(".timer").text( parseInt(minutes) + "0:0" + parseInt(seconds) );
  }
  else{
      $(".timer").text( parseInt(minutes) + ":" + parseInt(seconds) );
  }
}

notifyBackgroundPage("Timer", "Status", updateWithTimerStatus);
notifyBackgroundPage("Blocker", "Load", function(e){}); // Not expecting repsonse
browser.runtime.onMessage.addListener(handleTimerMessage);
$(".timerAction").click(updateTimerStatus);
