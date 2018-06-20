
describe('resetLives()', function() {

  it('Reset lives correctly, lives remaining variable should restart', function() {
    return new Promise(function(resolve) {
      resetLives(); 
      resolve(); 
    }).then(function() {
      assert.equal(livesRemaining, 3); 
    });
  });
});

describe('canUseLive()', function() {

  it('Can use live returns false when there are no lives available', function(done) {
    livesRemaining = 0; 
    assert.isFalse(canUseLive()); 
    done();
  });

  it('Can use live returns true when there are lives available', function(done) {
    livesRemaining = 1; 
    assert.isTrue(canUseLive()); 
    done();
  });
});

describe('useLive()', function() {

  beforeEach(function () {
    resetLives(); 
  });

  afterEach(function () {
     browser.alarms.onAlarm.removeListener(liveIsOver);
  });

  it('Use live when there are no lives available should throw an error', function(done) {
    livesRemaining = 0; 
    assert.isFalse(useLive()); 
    done();
  });

  it('Use live works correctly', function(done) {
    var numLives = livesRemaining;
    useLive(); 
    assert.isBelow(livesRemaining, numLives); 
    done();
  });
});