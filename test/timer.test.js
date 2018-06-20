
describe('Timer()', function() {

  it('Timer isRunning property is false at the beggining', function(done) {
    var t = new Timer();
    assert.isFalse(t.isRunning());
    done();
  });

  it('Timer isPaused property is false at the beggining', function(done) {
    var t = new Timer();
    assert.isFalse(t.isPaused());
    done();
  });
});

describe('Timer.start', function() {

  it('Timer isRunning property is true when t.start()', function(done) {
    var t = new Timer();
    t.start();
    assert.isTrue(t.isRunning()); 
    t.stop();
    done();
  });

  it('Timer isPaused property is false when t.start()', function(done) {
    var t = new Timer();
    t.start();
    assert.isFalse(t.isPaused());
    t.stop();
    done();
  });

  it('Try to start timer when is running throws error', function(done) {
    var t = new Timer();
    t.start();
    assert.throws(() => t.start(), TimerErrors.ALREADY_STARTED);
    t.stop();
    done();
  });

  it.skip('Timer isRunning is true in 59 seconds and false in 60 seconds', function(done) {
    var t = new Timer();
    this.timeout(61000);
    t.start();

    setTimeout(function() {
      assert.isTrue(t.isRunning());

      setTimeout(function() {
        assert.isFalse(t.isRunning());
      }, 1000);
      
      done();
    }, 59000);
  });
});

describe('Timer.stop', function() {

  it('Timer isRunning property is false when t.stop()', function() {
    var t = new Timer();
    this.timeout(15000);

    return new Promise(function(resolve) {
      t.start();
      resolve(); 
    }).then(function() {
      t.stop();
      assert.isFalse(t.isRunning());
    });
  });

  it('Try to stop timer when it is not running throws error', function(done) {
    var t = new Timer();
    assert.throws(() => t.stop(), TimerErrors.NOT_STARTED);
    done();
    });
});

describe.skip('Timer.timerHandler action Start', function() {
  beforeEach(function () {
    livesRemaining = 3; 
    return browser.runtime.sendMessage({
      sending : "Timer",
      action: "Stop"
    }).then(function (e){}, function(e){});
  });

  afterEach(function(){
    return browser.runtime.sendMessage({
      sending : "Timer",
      action: "Stop"
    }).then(function (e){}, function(e){});
  });

  it('Sending start request', function() {
     return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Start"
      }).then(function(e){
        resolve(e.timer);
      }, function(e){
        resolve(e);
        throw "Shouldn't be an error";
      });
     }).then(function(timer){
      assert.isTrue(timer.started);
    });
  });

  it('Sending start request two times should return error', function(){
    this.timeout(5000);
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending: "Timer",
        action: "Start"
      }).then(function (e) {
        browser.runtime.sendMessage({
          sending: "Timer",
          action: "Start"
        }).then(function(e){
           console.log("EEEEEEEE: ");
          console.log(e);
          console.log("timer");
          console.log(e.timer); 
          resolve(e);
        });
      }, function(e){
        console.log("Error: ");
        console.log(e);
        throw "Shouldn't be an error"; º
      });
    }).then(function(e){
      assert.equal(e.error, TimerErrors.ALREADY_STARTED);
    });
  });
});

describe.skip('Timer.timerHandler action Stop', function(){
  beforeEach(function () {
    return browser.runtime.sendMessage({
      sending : "Timer",
      action: "Start"
    }).then(function (e){}, function(e){});
  });

  it('Started timer should stop successfully after stop request', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Stop"
      }).then(function(e){
        assert.isTrue(e.success);
        resolve(e.timer);
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(timer){
      assert.isFalse(timer.started);
    });
  });

  it('Started timer should return error after timer is already stopped', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Stop"
      }).then(function(e){
        assert.isTrue(e.success);
        browser.runtime.sendMessage({
          sending : "Timer",
          action: "Stop"
        }).then(function(e){
           resolve(e);
        }, function(e){
          throw "Shouldn't be an error";
        });
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(result){
      assert.equal(result.error, TimerErrors.NOT_STARTED);
    });
  });
});

describe('Timer.timerHandler action Status', function(){

  it('Retrieved status successfully after Status request', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Status"
      }).then(function(e){
        resolve(e);
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(e){
      assert.isNotNull(e); 
    });
  });

  it('Retrieved isRunning correctly in status', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Status"
      }).then(function(e){
        resolve(e);
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(e){
      assert.isBoolean(e.running); 
    });
  });

  it('isRunning value is correct', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Status"
      }).then(function(e){
        resolve(e);
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(e){
      var timer = e.timer; 
      assert.equal(timer.started, e.running); 
    });
  });

  it('Retrieved isPaused correctly in status', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Status"
      }).then(function(e){
        resolve(e);
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(e){
      assert.isBoolean(e.paused); 
    });
  });

  it('isPaused value is correct', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Status"
      }).then(function(e){
        resolve(e);
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(e){
      var timer = e.timer; 
      var paused = timer.remainingTime != timer.originalTime && !timer.started; 
      assert.equal(paused, e.paused); 
    });
  });

  it('Retrieved remaining time correctly in status', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Status"
      }).then(function(e){
        resolve(e);
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(e){
      assert.isNumber(e.remainingTime); 
    });
  });

  it('Retrieved original time correctly in status', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Status"
      }).then(function(e){
        resolve(e);
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(e){
      console.log(e.originalTime); 
      assert.isNumber(e.originalTime); 
    });
  });

  it('Original time value is correct', function(){
    return new Promise(function(resolve){
      browser.runtime.sendMessage({
        sending : "Timer",
        action: "Status"
      }).then(function(e){
        resolve(e);
      }, function(e){
        throw "Shouldn't be an error";
      });
     }).then(function(e){
      var timer = e.timer; 
      assert.equal(timer.originalTime, e.originalTime); 
    });
  });
});