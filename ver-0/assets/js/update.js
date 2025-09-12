var timeoutInvite;
var timeoutChatLog;
var timeoutLoadState;
var timebar=0;
var lastChatAction=0;
var updateLength = 900000; // 15 minutes
var timeoutSessionRefresh;
var sessionShouldBeUpdated = false;
var waitingForUpdateSwitch = false;

function checkLoadState(num)
{
	if(elementsLoaded<num)
	{
		timeoutLoadState=setTimeout("checkLoadState("+num+")", 1000);
	}
	else
	{
		flashInit();
		//updateChatLog();
		timeoutChatLog=setTimeout("updateChatLog()",2000);
		timeoutSessionRefresh = setTimeout("refreshSession()", 180000);
		
		if(window.current_recipient>0 && window.gender==0)
			waitingForUpdateSwitch=true;
	}		
}

function refreshSession()
{
	sessionShouldBeUpdated = true;
	timeoutSessionRefresh = setTimeout("refreshSession()", 200000);
}

function listenForInvite(id)
{
	if (id != 0)
	{
		var widgetText = document.getElementById("inv-header-text");
    		widgetText.innerHTML = 'These men are inviting you to chat!';
		
		invitationWidget = new InvitationWidget(0, 0, id);
	
		setTimeout("invitationWidget.updateTimers()",1000);
		setTimeout("invitationWidget.cleanOldInvites()",10000);
		invitationWidget.checkInvites();
		
	}
}

function inviteTimeout()
{
	var timer=document.getElementById('timeleft');
	
	if(timer)
	{
		if(timer.value>0)
		{
			document.getElementById('pbCell'+Math.floor(30*(60-timer.value)/60)).style.backgroundColor="#888888";
			timer.value=timer.value-1;
			timeoutInvite=setTimeout("inviteTimeout()", 1000);
		}
		else
		{
			window.close();
		}
	}
}

function updateTime()
{
	var theDate = new Date();
	timeoutTime=setTimeout("updateTime()", 1000);
	document.getElementById("currenttime").innerHTML = "Current Time: " + displayTime(theDate.getHours(),theDate.getMinutes(),theDate.getSeconds());
}

function updateVideoKey(key)
{
	video_key = key;
}

//function updateChatLog()
//{
////	getFrameContents('chatlog').location.reload();
////	alert(document.getElementById('chatlog').contentWindow);
//
//	ajaxFunction(pathToHandler + "processor.php?id=" + user_id + "&recipient=" + current_recipient + (sessionShouldBeUpdated?"&sessionUpdate=1":""));
//	timeoutChatLog=setTimeout("updateChatLog()",10000);
//	onbeforeunloadcanfire = true;
//
//	if (sessionShouldBeUpdated)
//		sessionShouldBeUpdated = false;
//}

function bindEnter(e,message)
{
	if(e.keyCode==13)
	{
		message=message.replace(/[\r\n]/g,'');
		sendMessage(message);
	}
}

elementsLoaded++;
