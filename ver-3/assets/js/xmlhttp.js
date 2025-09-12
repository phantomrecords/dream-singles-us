//var xmlHttp;

function ajaxFunction(url)
{
	ajaxRequest(url, true, false);
}

function ajaxCloseFunction(url)
{
	ajaxRequest(url, false, true);
}

function ajaxRequest(url, async, override)
{
	var xmlHttp;
	if (url.lastIndexOf('action') != -1 && lastChatAction != 0 && lastChatAction != -1)
		lastChatAction = new Date().getTime();
//	if(xmlHttp)
//	{
//		if(override)
//			xmlHttp.abort()
//		else if(xmlHttp.readyState<4)
//		{
//			alert('Request was not sent\nReady state' + xmlHttp.readyState + 'found.\nAttempted:' + url + '\nBlocked by' + xmlHttp);
//			return;
//		}
//	}

	try
	{
		// Firefox, Opera 8.0+, Safari
		xmlHttp=new XMLHttpRequest();
	}
	catch (e)
	{
		// Internet Explorer
		try
		{
			xmlHttp=new ActiveXObject("Msxml2.XMLHTTP");
		}
		catch (e)
		{
			try
			{
				xmlHttp=new ActiveXObject("Microsoft.XMLHTTP");
			}
			catch (e)
			{
				alert("Your browser does not support AJAX!");
				return false;
			}
		}
	}
	
	xmlHttp.onreadystatechange=function()
	{
		if(xmlHttp.readyState==4)
		{
			try
			{
				parseStructure(xmlHttp.responseText);
			}
			catch(e)
			{
			}
		}
	}
	
	url = url + "&ts=" + (Math.floor(Math.random()*14)) + (new Date().getTime());
	if (window.location.toString().indexOf("https://") != -1)
		url = url.replace(/http:/, "https:");
	xmlHttp.open("GET", url, async);
	xmlHttp.send(null);
	
	return xmlHttp;
}

elementsLoaded++;
