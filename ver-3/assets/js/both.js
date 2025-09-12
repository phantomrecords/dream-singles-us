var pathToHandler = mainPath + "/updatedchat/handler/";
var invitePath = mainPath + "/chat";
var reallyRejecting = true;
var user_id = 0;
var sortstyle = 1;
var onbeforeunloadcanfire = false;
var alreadyInvited = [];

function initialize(id, recipient, numelements)
{
//	if(gender)
//		window.onbeforeunload=endConversation;
//	else
//		window.onbeforeunload=endAllConversations;

	user_id = id;
	current_recipient = recipient;
	checkLoadState(numelements);

	soundManager.url = mainPath + '/updatedchat/flash/soundmanager2.swf'; // override default SWF url
}

//
//	User Array
//
//
//
var onlineUsers = new Array();
var sortedOnline = new Array();

function OnlineUser(id, name, age, height, weight, lastLogin, status)
{
	this.id = id;
	this.name = name;
	this.age = age;
	this.height = height;
	this.weight = weight;
	this.lastLogin = lastLogin;
	this.status = status;
}

function addUser(id, name, age, height, weight, lastLogin, status)
{
	if(onlineUsers[id])
	{
//		onlineUsers[id].id = id;
//		onlineUsers[id].name = name;
//		onlineUsers[id].age = age;
//		onlineUsers[id].height = height;
//		onlineUsers[id].weight = weight;
//		onlineUsers[id].lastLogin = lastLogin;
//		onlineUsers[id].status = status;
		
		return false;
	}
	else
	{
		onlineUsers[id] = new OnlineUser(id, name, age, height, weight, lastLogin, status);

	}

	return true;
}

function parseStructure(input)
{
	var inputArr = input.split('\x03');
	var action = inputArr[0];
	var payload = inputArr[1];
	
	if (action == "update")
		parseUpdate(payload);
	if (action == "invites")
		parseInvites(payload);
	if (action == "videoKey")
	{
		flashProxy.call("startMovie", payload);
	}
}

function deleteUser(id)
{
	delete onlineUsers[id];
}

function deleteAllUsers()
{
	onlineUsers = new Array();
    sortedOnline = new Array();
}

function sortLastLogin(a,b)
{
	if (a in onlineUsers && b in onlineUsers)
		return onlineUsers[b].lastLogin - onlineUsers[a].lastLogin;
	else
		return 0;
}

function sortAge(a,b)
{
        if (a in onlineUsers && b in onlineUsers)
		return onlineUsers[a].age - onlineUsers[b].age;
	else
		return 0;
}

function sortLogins()
{
	sortstyle=1;

        sortedOnline = new Array();
        for (var i in onlineUsers)
                sortedOnline[sortedOnline.length] = onlineUsers[i].id;

	sortedOnline.sort(sortLastLogin);
	refreshPhotos("photos");
}

function sortAges()
{
	sortstyle=2;

	sortedOnline = new Array();
	for (var i in onlineUsers)
		sortedOnline[sortedOnline.length] = onlineUsers[i].id;

	sortedOnline.sort(sortAge);
	refreshPhotos("photos");
}

//
// Begin Other Utilities
//
//
//
function getFrameContents(ident)
{
	if(document.getElementById(ident).contentDocument) // Firefox
		result=document.getElementById(ident).contentDocument;
	else if(document.getElementById(ident).contentWindow) // Internet Explorer
		result=document.getElementById(ident).contentWindow.document;

	return result;
}

function chooseStatusIcon(msgtype, id, from, gender)
{
	var icon=CONTACT_ONLINE;
	
	switch(msgtype)
	{
	case "local":
		id=current_recipient;
		
		if(gender==0)
		{
			if((contactList[id].status==CONTACT_ONLINE))
				icon = CONTACT_OUTGOING;
			else if(contactList[id].status!=CONTACT_OUTGOING)
				icon = CONTACT_CONVO;
			else if (contactList[id].status == CONTACT_OUTGOING)
				icon = CONTACT_OUTGOING;
		}
	break;
	case "system":
		icon = contactList[id].status;
	break;
	case "remote":
		if(gender)
			icon=CONTACT_ONLINE;
		else
		{
			if(contactList[id].status==CONTACT_ONLINE||contactList[id].status==CONTACT_INVITE)
				icon=CONTACT_INVITE;
			else
				icon=CONTACT_NEWMSG;
		}
	break;
	}
	
	contactList[id].status=icon;
	contactList[id].update=true;
		
	return icon;
}

function writeMessage(id, from, date, message, msgtype, gender)
{
	if(msgtype=="local" && current_recipient==0)
		return;
		
	var doc = getFrameContents("chatlog").getElementById('chattable');
	var color;
	
	var icon;
	
	if(msgtype=="remote" && (!contactList[id]))
	{
		addContactToList('listofcontacts', id, onlineUsers[id].name, CONTACT_ONLINE);
	}
	icon=chooseStatusIcon(msgtype, id, from, gender);

	var theDate = new Date();
	theDate.setTime(date*1000);

	if(msgtype=="remote")
		color="#7799ff";
	else
		color="#ff2211";

	if (msgtype != "system")
		message=parseSmilies(message);

	if(msgtype=="system")
		var output=message;
	else
		var output="<span style=\"color:"+color+";text-decoration: underline\"><b>"+from+"</b> "+displayTime(theDate.getHours(),theDate.getMinutes(),theDate.getSeconds()) + "</span><br>"+message+"<br><br>";

	if((current_recipient==id)||(id<0))
	{
		var numrows = doc.rows.length;
		var newrow;
		var newcell;
		
		newrow=doc.insertRow(numrows);
		newcell=newrow.insertCell(0);
		
		newcell.innerHTML=output;

		document.getElementById('chatlog').contentWindow.scrollBy(0,10000000);
	}
	else if(msgtype=="remote"||msgtype=="system")
	{
		if(!conversations[id])
		{
			conversations[id]="";
		}
		
		conversations[id]+=output+"\x02";
	}
	
	if(msgtype=="remote")
		playsound();
}

function sendMessage(message)
{
	if((message!="")&&(message!="\r"))
	{
		if(!contactList[current_recipient])
			addContactToList('listofcontacts', current_recipient, onlineUsers[current_recipient].name, CONTACT_ONLINE);
			
		writeMessage(-1, myName, new Date().getTime() / 1000, message, "local", gender);
		ajaxRequest(pathToHandler + 'processor.php?message=' + message + '&recipient=' + current_recipient + '&action=sendmessage' + "&id=" + user_id, true, true);
	}

	document.getElementById('message').value="";

//	handleContactAfterMessage();
}

function displayTime(hours,minutes,seconds)
{
	var result;

	result=hours+":";
	
	if(minutes<10)
		result+="0";
	
	result+=minutes+":";

	if(seconds<10)
		result+="0";
	
	result+=seconds;
	
	return result;
}

function parseInvites(input)
{
	if(input.indexOf('\n') != -1)
	{
		var structs = input.split('\n');
		var invites = structs[1].split('\x01');
				
		for(var invite=0;invite<invites.length;invite++)
		{
			if(invites[invite].indexOf('\x02') != -1)
			{
				parts = invites[invite].split('\x02');
				//ajaxFunction(pathToHandler + 'processor.php?action=addcontact' + "&id=" + user_id + "&targetuser=" + parts[1] + "&name=" + parts[2], true, true);
                var sender_id = parts[1];
                var already = false;
                for(var i = 0; i < alreadyInvited.length; i++) {
                    if(alreadyInvited[i] == sender_id) {
                        already = true;
                    }
                }
                if(!already) {
                    alreadyInvited.push(sender_id);
                    displayInvite(invitePath + "/invite.php?&senderid="+sender_id);
                }
			}
		}
	}
}

function displayInvite(url, sender_id)
{
	window.open(url,"invite_" + sender_id,"toolbar=no, location=no, directories=no, status=yes, menubar=no, scrollbars=no, resizable=no, copyhistory=yes, width=400, height=200");
}

function rejectInvite()
{
	if (reallyRejecting)
		var temp=ajaxRequest('handler/processor.php?id='+user_id+'&inviteid='+invite_id+'&recipient='+current_recipient+'&action=rejectinvite',false,true);
}

function updateEvent(obj, eventName, newFunction)
{
	var result=0;
	
	if(obj.addEventListener)
		result=obj.addEventListener(eventName, newFunction, false);
	else
		if(document.attachEvent)
			result=obj.attachEvent("on" + eventName, newFunction);
			
	return result;
}

function removeEvent(obj, eventName, currentFunction)
{
	var result=0;
	
	if(obj.removeEventListener)
		result=obj.removeEventListener(eventName, currentFunction, false);
	else
		if(document.detachEvent)
			result=obj.detachEvent("on" + eventName, currentFunction);
			
	return result;
}

function insertSmiley(code)
{
	document.getElementById('message').value+=code;
}

elementsLoaded++;
