var popup_chat=new Array();
var ajax_invitation_id=0;
function showDSpopup_vday(imagepath=""){
var win_width=525; 
if($(window).width()<525)
  win_width = $(window).width()-5; 
  if(imagepath!=""){
    $('<div id="msg_dialog"><a href="#" onClick="closeDSDialog();return false;"><img src="'+imagepath+'" alt="" width="100%" height="auto"></a></div>').dialog({          
       width: win_width,				
       modal: true,
       position: ['center', 'center'],
       resizable: false,
       closeOnEscape: true          
     });
     $('#msg_dialog').css('margin', '0px');
     $('#msg_dialog').css('padding', '0px');
   //  $('#msg_dialog').css('border', '1px solid #DCE');
     $('.btn-ds').css('font-size', '32px');   
     $('.btn-ds').css('color', '#FFF');
     $('.btn-ds').css('font-weight', 'bold');
     $('.btn-ds').css('background', '#39ab2d');  	 
     $('.ui-widget-overlay').css('opacity', '0.8');
    $('.ui-widget-overlay').css('background', '#000');     
   	$("#msg_dialog").dialog('open').siblings('.ui-dialog-titlebar').remove();
  }
 
}
function popupEmailConfirm(){
      var widthvar = $(window).width()-50;
      if ($(window).width()> 600) {
          widthvar = 500;
      }
      
      $('#popover-welcome').
          dialog({
              width: widthvar,
              height: 'auto',
              modal: true,
              resizable: false,
              closeOnEscape: true,
              title: false,
              dialogClass: "popover-welcome",
          }
      );
      $('.ui-dialog').css('padding', '0');
      $('.ui-dialog').css('overflow', 'visible');
      $('.ui-dialog').css('position', 'fixed');				
      $('.ui-widget-overlay').css('opacity', '0.7');			
      if ($(window).height() > 800) {
        $('.ui-dialog').css('top', '300px');
      }else{
        $('.ui-dialog').css('top', '150px');
      }
}	
function resendWelcomeEmail(){
  $.post(
    "/members/account/resend_welcome_email",
    function(result){
     $(".resendalert").html("Email has been sent.");  
   });
	 return false;
}
function closeDSDialog(){
  $( "#msg_dialog" ).dialog( "close" );
}
function allStart(message,redirect)
{
  if (message) alert(message);
  if (redirect) window.location.href=redirect;
}

function addBookmark(title,url)
{
  var msg_netscape="NetScape message";
  var msg_opera="This function does not work with this version of Opera.  Please bookmark us manually.";
  var msg_other="Your browser does not support automatic bookmarks.  Please bookmark us manually.";
  var agt=navigator.userAgent.toLowerCase();
  if (agt.indexOf("opera")!=-1)
    {
      if (window.opera && window.print) return true;
      else alert(msg_other);
    }    
  else if (agt.indexOf("firefox")!=-1) window.sidebar.addPanel(title,url,"");
  else if (agt.indexOf("netscape")!=-1) window.sidebar.addPanel(title,url,"")
  else if (window.sidebar && window.sidebar.addPanel) window.sidebar.addPanel(title,url,"");
  else alert(msg_other);
}

var countAlertMessage=0;

function getXMLHttpRequest()
{
  var req=false;
  try { req=new XMLHttpRequest(); }
  catch (trymicrosoft)
    {
      try { req=new ActiveXObject("Msxml2.XMLHTTP"); } 
      catch (othermicrosoft) 
        {
          try { req=new ActiveXObject("Microsoft.XMLHTTP"); }
          catch (failed) { request=false; }
        }
    }
  return req;
}

function checkSignupFields()
{
	user = document.getElementById("miniSignupUser").value;
	email = document.getElementById("miniSignupEmail").value;
	password = document.getElementById("miniSignupPassword").value;
	country = document.getElementById("miniSignupCountry").options[document.getElementById("miniSignupCountry").selectedIndex].value;
	read = document.getElementById("miniSignupTC").checked;

	if (user.length == 0)
	{
		alert("You must enter a username.");
		return false;
	}
	else if (email.length == 0)
	{
		alert("You must enter an email address.");
		return false;
	}
	else if (password.length < 8)
	{
		alert("Password must be over 8 characters in length.");
		return false;
	}
	else if (country == 0)
	{
		alert("You must select a country.");
		return false;
	}
	else if (read == false)
	{
		alert("You must accept the Dream Singles Terms/Conditions.");
		return false;
	}
	return true;
}
function sendTourInvite(status,guy_memberid,lady_memberid,name){
	if(status=='Locked'){
		alert('Sending an invitaion to '+name+' is locked for 24 hours. Try again later.');
	}else if(status=='Invited'){
		alert("You already sent an invitaion to this man. ");
	}else{
		//Ajax code for invitation
		 $.post(
			 "/members/ajax_sendTourinvitation.php", 
			 {guyid:guy_memberid,ladyid:lady_memberid}, 
			 function(result){
				if(result!='false'){
				    alert("Your invitation has been sent to "+name);
					$("#tourInvite").css('display','none');				    
				}else{
					alert("Oops! Please try later");
				}
				
			});		
		
	}
	
}
function viewVideoConfirm(profileid, clipid, msg){  
  var win_width=525; 
  if($(window).width()<525)
    win_width = $(window).width()-5; 
    $('<div id="msg_intro_dialog">'+msg+'<br/><a id="albumMessageLink" class="btn btn-primaryBlue" href="/members/videos/view?pid='+profileid+'&id='+clipid+'">Continue</a></div>').dialog({
       width: win_width,				
       modal: true,
       height: 'auto',
       resizable: false,
       closeOnEscape: true,
       close: function(event, ui)
          {
              $(this).dialog('destroy').remove();
          }     
     });
     $('#msg_intro_dialog').css('padding', '10px');
     $('#msg_intro_dialog').css('text-align', 'center');
     $('#msg_intro_dialog').css('font-size', '14px');
     $('.ui-widget-overlay').css('opacity', '0.8');
     $('.ui-widget-overlay').css('background', '#000'); 
     $('.ui-widget-content a').css('color', '#FFF');
     $('.ui-widget-content a').css('font-size', '20px');

     $('.ui-dialog .ui-dialog-titlebar').css('background', '#ECECEC');
     $('.ui-dialog .ui-dialog-titlebar').css('text-align', 'right');
     $('.ui-dialog .ui-dialog-titlebar').css('padding', '8px, 16px');

    $(".ui-dialog")
        .find(".ui-dialog-titlebar-close")
        .removeClass("ui-dialog-titlebar-close")
        .css('border','none')
        .css('font-size', '22px')
        .html(`<button type="button" class="close" data-dismiss="modal" aria-label="Close"><span aria-hidden="true">&times;</span></button>`);


}



