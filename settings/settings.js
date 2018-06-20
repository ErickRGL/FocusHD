var allowedListBlockedValues = ["blacklist", "whitelist"];

var currentList = undefined;
var lists = {};
var settings = {};

var originalName;

// This function is responsible for starting the ui when the user enters to the settings page
function initSettings() {
  // call when loading page to fetch first site or create a new one
  fetchSettings([setFirstListOrCreate, setSettingsOrCreate]);
}

function updateComboBoxOptions() {
  var keys = Object.keys(lists);
  keys.sort();
  setComboBoxOptions(keys);
}

function setFirstListOrCreate() {
  var keys = Object.keys(lists);

  if (keys.length == 0) {
    addList();
  }
  else {
    currentList = lists[keys[0]];
    setListDataInUI();
    updateComboBoxOptions();
    selectFirstList();
  }
}

function setSettingsOrCreate() {

  var keys = Object.keys(settings);

  if (keys.length == 0) {
    settings = {
      type: "blacklist"
    };

    saveSettings();
  }

  validateSettings();
  $('#settings-type option[value="' + settings.type + '"]').prop('selected', true);

}

function validateSettings(){

  // Variable that keeps the state
  var invalid = false;

  // Validate the list setting
  var typeValid = allowedListBlockedValues.indexOf(settings.type);
  if(typeValid == -1)
  {
    invalid = true;
    settings.type = allowedListBlockedValues[0];
  }

  // If something was corrected fix
  if(invalid)
    saveSettings();
}

// This function recieves an array of strings and adds each one of them as an options int the list select 
function setComboBoxOptions(options) {
  var template = $('.option-template').clone().removeClass('option-template');
  var optionsSelect = $("#lists");

  // Clean up options
  optionsSelect.html('');

  options.forEach(function (option) {
    var current = template.clone();
    current.text(option);
    current.attr('value', option);
    optionsSelect.append(current);
  });
}

function selectFirstList() {
  $("#lists option:first").attr('selected', true);
  $("#lists").trigger("change");
}

function selectListByName(name) {
  $("#lists option[value='" + name + "']").attr('selected', true);
}

// Retrieves the lists from the browser storage
function fetchSettings(callback) {

  function nextStage(result) {
    lists = result.lists;
    settings = result.settings;

    if (lists == undefined)
      lists = {};

    if (settings == undefined)
      settings = {};

    callback.forEach(function (callbackSingle) {
      callbackSingle();
    })
  }

  function onError(error) {
    alert("Something went wrong. Could not fetch lists.");
    console.log(`Error: ${error}`);
  }

  browser.storage.local.get(["lists", "settings"]).then(nextStage, onError);
}

// Loads all the information of a list in the UI
function setListDataInUI() {
  originalName = currentList.name;
  setListActiveText();

  $('#name').val(originalName);

  var siteRows = $("#normal-site").find('tbody');
  siteRows.empty();

  var siteTemplate = $(".site-template").clone().removeClass("site-template");

  currentList.sites.forEach(function (site) {
    var currentSiteHtml = siteTemplate.clone();
    currentSiteHtml.find(".name").val(site);
  siteRows.append(currentSiteHtml);
  });

  bindRemoveButtons();

  $("#list-type option[selected='selected']").removeAttr('selected');
  $("#list-type option[value='" + currentList.type + "']").prop('selected', true);
}


// Removes a site from the ui of the current list. A save is needed for the change to take effect
function removeSite(){
  $(this).closest('tr').remove();
}

// Adds a row to the blocked/allowed sites
function addSite(){
  $('#normal-site').find('tbody').append($('<tr>').append($('.site-template').html()));
  $('#normal-site tr:last td:first input').focus();
  bindRemoveButtons();
}

// Given a name returns a valid name (unused name to avoid conflicts)
function getListName(name) {
  if (lists[name] == undefined) {
    return name;
  }
  else {
    var number = 1;

    while (true) {
      var attempt = name + " " + number;
      if (lists[attempt] == undefined)
        return attempt;
      else
        number++;
    }
  }
}

// Creates a new list and updates the ui
function addList() {
  if (currentList != undefined)
    saveChanges();

  var list = {
    name: getListName('unnamed'),
    active: true,
    type: "blacklist",
    sites : [],
  }

  currentList = list;
  lists[list.name] = list;
  setListDataInUI();
  updateComboBoxOptions();
  selectListByName(list.name);
}

// When the user changes the name of the list this retrieves the valid name for it and updates the model
function renameList() {
  var userName = $('#name').val();
  if ($(userName != originalName)) {
    currentList.name = getListName(userName);
  }
  else {
    currentList.name = originalName;
  }

  saveChanges();
}

// This method controls the text of the active / not active button and paragraph
function setListActiveText() {
  $(this).remove();
  var buttonText = "";
  var paragraphText = "";

  if (currentList.active) {
    buttonText = "deactivate";
    paragraphText = "active";
      $("#cmn-toggle-7").prop('checked', true);
  }
  else {
    buttonText = "activate"
    paragraphText = "not active"
      $("#cmn-toggle-7").prop('checked', false);
  }

  $('#active-button').text(buttonText);
  $('#active-paragraph').text(paragraphText);
}

// UI interface for toogle the list activation
function toogleListActivation() {
  currentList.active = !currentList.active;
  setListActiveText();
}

// Changes the list type and updates the model
function changeListType() {
  currentList.type = $(this).val();
}

// When a row is added, this must be called to bind the remove button to the function
function bindRemoveButtons() {
  $(".remove").unbind("click");
  $(".remove").click(removeSite);
}

// Saves the changes in the current list
function saveChanges() {
  $("#lists").prop('disabled', true);
  var list = currentList;
  var localOriginalName = originalName;

  list.sites = [];
  $('.sites table tbody tr input').each(function(index){
    var currentValue = $(this).val().trim();
    if (currentValue != "")
      list.sites.push(currentValue);
  });

  console.log(list.sites);

  delete lists[localOriginalName];
  lists[list.name] = list;

  browser.storage.local.set({
    lists: lists
  });
  $("#lists").prop('disabled', false);
  updateComboBoxOptions();
  selectListByName(list.name);
}

// Handles the change on the list selection
function changeCurrentList() {
  var val = $(this).val();
  // Same list selected & renamed
  if (lists[val] == undefined)
    return;
  else {
    saveChanges();
    currentList = lists[val];
    setListDataInUI();
    updateComboBoxOptions();
    // In case the other list was renamed
    selectListByName(val);
  }
}

function deleteList() {
  var deleting = confirm("Are you sure you want to delete this list? This action cannot be undone.");
  if (deleting) {
    delete lists[originalName];
    delete lists[currentList.name];
    setFirstListOrCreate();
  }
}

function changeBlockedType() {
  settings.type = $("#settings-type").val();
  saveSettings();
}

function saveSettings() {
  browser.storage.local.set({
    settings: settings
  });
}

function getLists() {
  return this.lists;
}

function saveWithButton(evt){
  evt.preventDefault();
  saveChanges();
  browser.notifications.create("ChangesSaved", {
    "type": "basic",
    "iconUrl": browser.extension.getURL("icons/icono48.png"),
    "title": "Your changes have been saved.",
    "message": "You can start your focus session",
	});
  return false;
}

// Before closing, ensure that everything is saved
window.addEventListener("beforeunload", function (e) {
  saveChanges();
  return true;
});

// Actions binding to the ui
$(".add-site").click(addSite);
$("#name").change(renameList);
$('#cmn-toggle-7').click(toogleListActivation);
$('#new-list').click(addList);
$('#lists').change(changeCurrentList)
$('#list-type').change(changeListType);
$('#delete-list').click(deleteList);
$('#settings-type').click(changeBlockedType);
$('#save').click(saveWithButton);
initSettings();

// TODO: Disable all if timer is started

function getLists() {
  return this.lists;
}

$(document).ready(function() {
    $(window).keydown(function(event){
        if(event.keyCode == 13) {
            event.preventDefault();
            $("#save").focus();
            return false;
        }
    });
});


