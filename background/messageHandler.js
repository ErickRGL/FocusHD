function handleMessage(request, sender, sendResponse) 
{

  var func = undefined;
  if(request.sending == "Timer")
  {
    func = timerHandler;
  }
  else if(request.sending == "Statistics")
  {
  	func = statisticHandler;
  }
  else if(request.sending == "Lives")
  {
  	func = livesHandler;
  }
  else if(request.sending == "Blocker")
  {
  	func = blockerHandler;
  }
  else return false;

  func(request, sender, sendResponse);
}

browser.runtime.onMessage.addListener(handleMessage);
