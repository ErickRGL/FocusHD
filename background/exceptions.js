// This is a place for all the non dependent shared functions
// Also, it contains a list of the problematic websites that needs to be taken care of in different components

var alwaysAllowed = [
	/about:*/,
	/accounts.*.com/
];

var statisticIgnore = [
	/about:*/,
	/moz-extension:*/
];

function shouldAlwaysAllow(site){

	console.log("Debug: shouldAlwaysAllow: site: " + site);
	for (var j=0; j < alwaysAllowed.length; j++) 
		if (alwaysAllowed[j].test(site))
			return true;

	console.log("Debug: shouldAlwaysAllow: Not always allowed");
	return false;
}

function shouldStatisticlyIgnore(url){
	var site = getRootUrl(url);
	for (var j=0; j < statisticIgnore.length; j++) 
		if (statisticIgnore[j].test(site))
			return true;

	return false;
}

// Get the root url from any url, removes http, https, www.
// "*://" + domain + "/*"
function getRootUrl(url) {
    var domain = url.replace('http://','').replace('https://','').replace('www.', '').split(/[/?#]/)[0];
    return domain;
}
