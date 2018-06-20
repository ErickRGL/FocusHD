
// The errors that may be produced by a timer

var TimerErrors = 
{
  TOO_SOON : "The timer needs to be at least 5 minutes",
  ALREADY_STARTED : "The timer is already running",
  OUT_OF_TIME : "The timer is run out of time",
  NOT_STARTED : "The timer is not running",
  ILLEGAL_CALLBACK : "The timer callback was triggered but the timer is not running",
  UNKNOWN_ACTION : "The action is not known by the handler"
};

var GLOBAL_TIMER_ALARM_NAME = "com.focusHD.TimerName";

// A timer
function Timer()
{
  this.started = false;
  this.originalTime = 0;
  this.remainingTime = 0;
  
  // After listeners
  this.startListeners = [];
  this.pauseListeners = [];
  this.doneListeners = [];
  this.resumeListeners = [];

  // Before listeners. Can return false to stop
  this.beforeStartListeners = [];
  this.beforePauseListeners = [];
  this.beforeResumeListeners = [];

  // Status decorator
  this.statusDecorators = [];
}

Timer.prototype.addListener = function()
{
  if(!browser.alarms.onAlarm.hasListener(this.alertListener))
    browser.alarms.onAlarm.addListener(this.alertListener);
}

Timer.setNewTime = function(timeInSeconds)
{
  if(timeInSeconds < 60 * 1)
    ; // For testing we are going to leave this out for now throw TimerErrors.TOO_SOON;

  if(this.started)
    throw TimerErrors.ALREADY_STARTED;

  this.originalTime = this.remainingTime = timeInSeconds * 1000;
}

Timer.prototype.start = function()
{
  if(this.started)
    throw TimerErrors.ALREADY_STARTED;

  // Are we starting or resuming? 
  var isStarting = !this.isPaused();
  if(isStarting)
  {
    if(!this.askListenersGeneric(this.beforeStartListeners))
     return false;
  }
  else
  {
    if(!this.askListenersGeneric(this.beforeResumeListeners))
     return false;
  }
  
  if(!this.isPaused())
    this.originalTime = this.remainingTime = 30 * 60 * 1000;

  this.started = true;
  this.startedTime = Date.now();

  browser.alarms.create(
    GLOBAL_TIMER_ALARM_NAME,
    { when : this.startedTime + this.remainingTime}
  )

  this.addListener();

  if(isStarting)
    this.notifyListenersGeneric(this.startListeners);
  else
    this.notifyListenersGeneric(this.resumeListeners);

  return true;
};

// The callback must recieve a boolean
Timer.prototype.stop = function()
{
  if(!this.started)
    throw TimerErrors.NOT_STARTED;

  if(!this.askListenersGeneric(this.beforePauseListeners))
    return false;

  var clearAlarm = browser.alarms.clear(GLOBAL_TIMER_ALARM_NAME);

  this.remainingTime = this.getRemainingTime();
  this.started = false;
  this.notifyListenersGeneric(this.pauseListeners);
  return true;
};

Timer.prototype.getRemainingTime = function()
{
  var stopTime = Date.now();
  return this.remainingTime - (stopTime - this.startedTime);
}

Timer.prototype.notifyTimerDone = function()
{
  browser.runtime.sendMessage({done: true, sending: "Popup"});
  this.notifyListenersGeneric(this.doneListeners);  
}

Timer.prototype.alertListener = function(alarm)
{

  if(alarm.name != GLOBAL_TIMER_ALARM_NAME)
    return;

  var timer = getGlobalTimerInstance();

  if(!timer.started)
    throw TimerErrors.ILLEGAL_CALLBACK;

  timer.remainingTime = 0;
  timer.started = false;

  timer.notifyTimerDone();
};

Timer.prototype.getStatus = function()
{
  var status = {
    running : this.isRunning(),
    paused: this.isPaused(),
    remainingTime : this.getRemainingTime(),
    originalTime : this.originalTime
  };

  for(var i = 0; i < this.statusDecorators.length; i++)
    this.statusDecorators[i](status);

  return status;
}

Timer.prototype.isPaused = function()
{
  return this.remainingTime != this.originalTime && !this.started && this.remainingTime != 0;
}

Timer.prototype.isRunning = function()
{
  return this.started;
}

Timer.prototype.addStartListener = function (listener)
{
  this.addListenerGeneric(this.startListeners, listener);
}

Timer.prototype.addResumeListener = function (listener)
{
  this.addListenerGeneric(this.resumeListeners, listener);
}

Timer.prototype.addPauseListener = function (listener)
{
  this.addListenerGeneric(this.pauseListeners, listener);
}

Timer.prototype.addDoneListener = function (listener)
{
  this.addListenerGeneric(this.doneListeners, listener);
}

Timer.prototype.addBeforeStartListener = function (listener)
{
  this.addListenerGeneric(this.beforeStartListeners, listener);
}

Timer.prototype.addBeforeResumeListener = function (listener)
{
  this.addListenerGeneric(this.beforeResumeListeners, listener);
}

Timer.prototype.addBeforePauseListener = function (listener)
{
  this.addListenerGeneric(this.beforePauseListeners, listener);
}

Timer.prototype.addListenerGeneric = function(array, listener)
{
  array.push(listener);
}

Timer.prototype.addStatusDecorator = function(listener)
{
  this.statusDecorators.push(listener);
}

Timer.prototype.notifyListenersGeneric = function(array)
{
  var status = this.getStatus();
  for(var j=0; j < array.length; j++)
    array[j](status);
}

Timer.prototype.askListenersGeneric = function(array)
{
  for(var j=0; j < array.length; j++)
    if(!array[j]())
      return false;

  return true;
}

var timerGlobalInstance = undefined;

function getGlobalTimerInstance()
{
  
  if(timerGlobalInstance == undefined)
    timerGlobalInstance = new Timer();
  
  return timerGlobalInstance;
}

// Message dispatcher
function timerHandler(request, sender, sendResponse)
{
  var timer = getGlobalTimerInstance();
  var success = false;
  if(request.action == "Start")
  {
    getListSites();
    success = timer.start();
  }
  else if(request.action == "Stop")
  {
    success = timer.stop();
  }
  else if(request.action == "Set_timer")
  {
    timer.setNewTime(request.newTime);
    success = true;
  }
  else if(request.action == "Status")
  {
    var status = timer.getStatus();
    status.timer = timer;
    sendResponse(status);
    return;
  }
  else
  {
    sendResponse({error: TimerErrors.UNKNOWN_ACTION });
    return false;
  }

  sendResponse({success:success, timer: timer});
  return true;
}
