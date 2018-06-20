//This file controls the statistic part of the focus session
// Depends on timer and exceptions



var sessionStatistic = {};

var site = "";
var timestamp = undefined;

function onTabChanged(activeInfo)
{
	var tabId = activeInfo.tabId;
	browser.tabs.get(tabId).then(updateUrlWithTab);
}

function onTabUrlUpdated(id, info, tab)
{
	updateUrlWithTab(tab);
}

// Updates the statistic with the new arriving data.
// If the tab does not have Url it will be ignored.
function updateUrlWithTab(tab)
{

	if(tab == undefined)
		return;

	var url = tab.url;

	if(url == undefined)
		return;

	url = getRootUrl(url);
	console.log("updateUrlWithTab: updatingTab: url: " + tab.url);

	// In this case we don´t need to update
	if(site == url)
		return;

	saveCurrentStatistic();

	if(shouldStatisticlyIgnore(url))
	{
		site = "";
		timestamp = undefined;
		return;
	}

	site = url;
	timestamp = Date.now();
}

function onFocusSessionStart(status)
{
	sessionStatistic = {};
	browser.tabs.getCurrent().then(updateUrlWithTab);
}

function onFocusSessionResume(status)
{
	browser.tabs.getCurrent().then(updateUrlWithTab);
}

function onFocusSessionPaused(status)
{
	saveCurrentStatistic();
}

function onFocusSessionDone(status)
{
	saveCurrentStatistic();
	browser.tabs.create({
  		active: false,
  		url: "/statistic/statistic.html"	
 	});
}

function saveCurrentStatistic()
{
	if(site == "" || timestamp == undefined)
		return;

	var oldStatistic = sessionStatistic[site];

	if(oldStatistic == undefined)
		oldStatistic = 0;

	var time = Date.now() - timestamp;

	sessionStatistic[site] = oldStatistic + time;

	site = "";
	timestamp = undefined;
}

// Message dispatcher
function statisticHandler(request, sender, sendResponse)
{
  try{

    if(request.action == "Get")
    {
      sendResponse(sessionStatistic);
      return;
    }
    
    sendResponse({error: "object unknown"});
  }
  catch(err)
  {
     sendResponse({error : err});
  }
}


function bindTimerListeners()
{
	var timer = getGlobalTimerInstance();
	timer.addStartListener(onFocusSessionStart);
	timer.addPauseListener(onFocusSessionPaused);
	timer.addDoneListener(onFocusSessionDone);
	timer.addResumeListener(onFocusSessionResume);
}

bindTimerListeners();
browser.tabs.onActivated.addListener(onTabChanged);
browser.tabs.onUpdated.addListener(onTabUrlUpdated);
