// Change everytime the format changes FROM RELEASE
var export_version = 2;

function exportList(list)
{
	var finalJson = prepareToExport(list);
	var blob = new Blob([JSON.stringify(finalJson, null, 2)], {type : 'application/json'});
	var objectURL = URL.createObjectURL(blob);
	browser.downloads.download({ 
		url : objectURL,
		filename: list.name + ".focushd"
	});
}

function prepareToExport(list)
{
	var object = {};
	object.version = export_version;
	object.list = list;
	return object;
}

function exportCurrentList()
{
	exportList(currentList);
}

function handleFiles() 
{
	var fileList = this.files; /* now you can work with the file list */
	var numFiles = fileList.length;

	if(numFiles != 1)
	{
		alert("Please select only one file");
		clearFile();
		return;
	}

	var reader = new FileReader();
	reader.onload = parsedFile;
	reader.onerror = errorParsing;
	reader.readAsText(fileList[0]);
}

function clearFile() 
{
	$("#import").val('');
};

function parsedFile(event)
{
	try
	{
		var string = event.target.result;
		value = JSON.parse(string);

		if(!validateList(value))
			errorParsing("Valid Json but not list");

		var confirmImport = confirm("Import " + value.list.name + "?");

		if(confirmImport)
		{
			// Prevent unexpected changes with the current list
			saveChanges();
			var oldName = value.list.name;
			var name = getListName(oldName);
			var changed = name != oldName;
			value.list.name = name;
			lists[name] = value.list;
			saveChanges();
			var str = !changed ? name : oldName + " as " + name;
			updateComboBoxOptions();
			selectListByName(name);
			$("#lists").trigger("change");
			alert("Succesfully imported " + str + "!");
		}

	  	clearFile();
	}
	catch(err)
	{
		errorParsing(err);
	}
}

function validateList(value)
{
	var error = undefined;

	if(value.version == undefined || !Number.isInteger(value.version) || value.version > export_version)
		error = "The file is created with a newer version of the app. Please update."
	else
	{

		if(value.version < export_version)
			upgrade(value);

		var list = value.list;
		// Validate all values present
		if(!validateListElementsExistence(list))
			error = "Missing information";
		else if(!validateListElementTypes(list))
			error = "Incorrect types";
	}

	if(error)
		return false;

	return true;
}

function validateListElementsExistence(list)
{
	return  list.name != undefined &&
			list.active != undefined &&
			list.type != undefined  &&
			list.sites != undefined;
}

function validateListElementTypes(list)
{
	var string = "string";
	var boolean = "boolean";

	return (typeof list.name) == string &&
		   (typeof list.active) == boolean &&
		   (typeof list.type) == string &&
		   Array.isArray(list.sites) &&
		   validateArrayElements(list.sites, string);
}

function validateArrayElements(array, type)
{
	for(var i = 0; i < array.length; i++)
		if(!(typeof (array[i])) == type)
			return false;

	return true;
}

function errorParsing(e)
{
	alert("Could not parse the selected file. Are you sure is a FocusHD file?");
	console.log(e);
  	clearFile();
}

function upgrade(settings)
{
	if(settings.version == 1)
		upgradeFromOne(settings);
}

function upgradeFromOne(settings)
{
	// From version 1 to 2 we deleted regex
	delete settings.list.regex;
	settings.version = 2;
}

var inputElement = document.getElementById("import");
inputElement.addEventListener("change", handleFiles, false);
$('.export-list').click(exportCurrentList);
