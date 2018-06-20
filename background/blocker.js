// Component: blocker
// Depends on: Timer and exceptions

var lastBlockedPage = undefined;

var onError = function(error) {
  console.log("Error updating array: " + error);
}

function shouldBlockSite(url){

  var timer = getGlobalTimerInstance();

  if(!timer.isRunning())
    return false;

  // boolean saying if the site is in the list array
  url = getRootUrl(url);

  if(shouldAlwaysAllow(url))
    return false;

  var inSiteArray = searchExpression(url, targetPageRegex);

  if(settings.type == "blacklist")
  {
    return inSiteArray;
  }
  // Whitelist
  else
  {
    return !inSiteArray;
  }
}

function updateLists(queryResult){
  var lists = queryResult.lists;
  settings  = queryResult.settings;
  var sites = [];

  if(lists == undefined){
    console.log("Could not fetch any list. Is everything alright in the query?");
    targetPageRegex = [];
    return;
  }

  var listNames = Object.keys(lists);
    var siteExp = "";
  for (let listName of listNames) {
    var list = lists[listName];
    if(list.active && list.type == settings.type){
      list.sites.forEach(function(site){
        sites.push(getRootUrl(site));
      });
    }
  }

  makeTargetPageRegex(sites);
}


function getListSites()
{
  var listPromise = browser.storage.local.get(["lists", "settings"]);
  listPromise.then(updateLists, onError);
}

// Search if the url is in the blocklist array
// if yes returns the index else returns -1
function searchStringInArray (str, strArray) {
    str = getRootUrl(str);
    for (var j=0; j<strArray.length; j++) {
        if (strArray[j].match(str)) return j;
    }
    return -1;
}

function searchExpression(str, strArray){
    var re;
    for (var j=0; j<strArray.length; j++) {
        re = new RegExp(strArray[j]);
        if (re.test(str))
            return true;
    }

    return false;
}

function makeTargetPageRegex(targetPage){
    targetPageRegex = []
    var domain = "";
    for (target in targetPage){
        domain = targetPage[target];
        targetPageRegex.push("/*" + domain + "*/*");
    }
}

// If the timer is running verifies if the page that the user wants to go 
// is in the blacklist, if yes then it blocks it and update the current tab
// to the Focus HD page
function openMyPage(requestDetails){

    var url = requestDetails.url;
    console.log("Debug: openMyPage: " + url);

    if (url === "https://testsfocus.com/"){
      browser.tabs.update({
        "url": "/tests.html"
      });
      return {"cancel": true};
    }
    
    if(shouldBlockSite(url)){

      console.log("Debug: openMyPage: Blocked site: " + url);

      browser.tabs.update({
        "url": "/focus.html"
      });

      lastBlockedPage = url;

      return {"cancel": true};
    }
}

function tabSecondBlocker(id, info, tab)
{
  if(tab == undefined || tab.url == undefined)
    return; 

  var url = tab.url;
  
  if(shouldBlockSite(url)){
    var updating = browser.tabs.update(
      id,
      {
        url: "/focus.html"
      }
    );
  }
}

function validateList()
{
  if(targetPageRegex.length == 0)
  {
    browser.tabs.create({
      active: true,
      url: "/settings/settings_ui.html"
    });
    return false;
  }

  return true;
}

function blockerHandler(request, sender, sendResponse)
{
  
  if(request.action == "Get")
  {
    sendResponse({blocked: lastBlockedPage});
    return;
  }
  else if(request.action == "Trigger")
  {
    lastBlockedPage = lastBlockedPage == undefined ? "http://google.com" : lastBlockedPage;
    browser.tabs.create({
      active: true,
      url: "/focus.html"  
    });
    sendResponse({success: true});
    return;
  }
  else if(request.action == "Load"){
    var timer = getGlobalTimerInstance();

    if(timer.isRunning())
      return false;
    
    getListSites();
    return;
  }
  sendResponse({error: "Action unknown"});
}

function bindBlockerTimerActions()
{
  var timer = getGlobalTimerInstance();
  timer.addBeforeStartListener(validateList);
}

var settings = {};
var targetPageRegex = [];
  
browser.webRequest.onBeforeRequest.addListener(openMyPage, {urls: ["<all_urls>"], types: ["main_frame"]}, ["blocking"] );
browser.tabs.onUpdated.addListener(tabSecondBlocker);
bindBlockerTimerActions();
