
/* 

Here we fetch the date with a message and then we set it on the page

*/
function fetchStatus() 
{
  browser.runtime.sendMessage(
  {
    sending : "Statistics",
    action: "Get"
  }).then(showStatus);  
}

function formatNumber(number)
{	
	if(number < 10)
		return "0" + number;
	
	return number + "";
}

function getDisplayTime(time)
{
	var totalSeconds = time / 1000;
	var seconds = parseInt(totalSeconds % 60);
	var minutes = parseInt(totalSeconds / 60);

	var hours = parseInt(minutes / 60); 
	minutes = parseInt(minutes % 60);

	var str = formatNumber(minutes) + ":" + formatNumber(seconds);
	
	if(hours > 0)
		str += formatNumber(hours) + ":";

	return str;
}

function showStatus(siteList)
{
	console.log(siteList);
	var sites = Object.keys(siteList);
	sites.sort();
	
	var template = $(".template-row-site").clone().removeClass('template-row-site');
	var table = $('#sites')

	for(var i = 0; i < sites.length; i++)
	{
		var row = template.clone();
		var time = siteList[sites[i]];
		time = getDisplayTime(time);
		row.find('.site').text(sites[i]);
		row.find('.time').text(time);
		table.append(row);
	}

}

fetchStatus();
