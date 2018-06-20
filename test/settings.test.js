
describe('addList()', function() {

  it('Add a new List', function(done) {
    var keys = Object.keys(getLists()).length;
    addList(); 
    assert.isAbove(Object.keys(getLists()).length, keys); 
    done(); 
  });
});

describe('changeCurrentList()', function() {

	beforeEach(function () {
		addList(); 
	});

	afterEach(function(){
		$("#lists").val($("#lists option:eq(1)")).trigger("change");
  	})

	it('Change current list from UI', function(done) {
		var currentListName = currentList.name;
		var val = $("#lists :selected").text();

		assert.equal(currentListName, val); 
		done(); 
	});
});

describe('renameList()', function() {

	beforeEach(function () {
		lists = {}; 
		$("#name").val("Lista Modificada").trigger("change");
	});

	afterEach(function () {
		saveChanges(); 
	});

	it('Rename list from UI', function() {
		console.log($("#name").val());
		var currentListName = currentList.name;
		console.log(currentListName);  
		assert.equal(currentListName, "Lista Modificada");
	});
}); 

describe('deleteList()', function() {

	var keys; 
	beforeEach(function () {
		keys = Object.keys(getLists()).length;
		lists = {}; 
		window.confirm=function(){ return true; };
		window.alert=function(){ return true; };
	});

	it('Delete a List from UI', function(done) {
		console.log(keys); 
		$("#delete-list").trigger("click");
		window.close(); 
		assert.isBelow(Object.keys(keys, getLists()).length, keys); 
		done(); 
	});
});

describe('setSettingsOrCreate()', function(){
  beforeEach(function(){
    browser.storage.local.set({
      settings: {}
    });
    settings = {};
  });

  afterEach(function(){
    browser.storage.local.set({
      settings: {}
    });
    settings = {};
  })

  it("empty settings adds blacklist to settings variable", function(done){
    let settingskeys = Object.keys(settings);
    assert.equal(0, settingskeys.length);
    setSettingsOrCreate();
    assert.equal("blacklist", settings.type);
    done();
  });

  it("empty settings stores settings into local storage correctly", function(){
    return new Promise(function(resolve){
    setSettingsOrCreate();
    browser.storage.local.get(["settings"]).then(function(query){
        resolve(query.settings);
      }, /* error handler */ function(){ throw "Shouldn't be an error" });
    }).then(function(values){
      assert.equal("blacklist", values.type);
      let keys = Object.keys(values);
      assert.equal(1, keys.length);
    });
  });

  it("get settings correctly from storage and set it to the UI correctly", function(){
    return new Promise(function(resolve){
      settings = {
        test: "myTestSetting",
        type: "blacklist"
      }
      setSettingsOrCreate();
      resolve();
    }).then(function(){
      let selectedValue = $('#settings-type option[value="' + settings.type + '"]').prop('selected');
      assert.isTrue(selectedValue);
      let children = $('#settings-type').children();
      for(let child of children){
        if($(child).prop('selected') === true){
          assert.equal("blacklist", $(child).val());
        }
      };
    });
  });

  it("when type is not blacklist or whitelist should select blacklist", function(){
    return new Promise(function(resolve){
      settings = {
        test: "myTestSetting",
        type: "testtype"
      }
      setSettingsOrCreate();
      resolve();
    }).then(function(){
      let children = $('#settings-type').children();
      for(let child of children){
        if ($(child).prop('selected') === true){
          assert.equal("blacklist", $(child).val());
        }
      };
    });
  });

  it("when type is not blacklist or whitelist should override settings to be default", function(){
    return new Promise(function(resolve){
      settings = {
        test: "myTestSetting",
        type: "testtype"
      }
      setSettingsOrCreate();
      browser.storage.local.get(["settings"]).then(function(result){
        resolve(result);
      }, /* error handler */ function(){ throw "shouldn't be an error" });
    }).then(function(queryresult){
      assert.equal("blacklist", settings.type);
      assert.equal("blacklist", queryresult.settings.type);
    });
  });
});