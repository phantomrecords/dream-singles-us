
function loadFlirts(profile_id, name, gender, reply_to)
{
    //alert("load modal");
    $.getJSON( "/members/flirts/select?receiver_profile_id=" + profile_id, function( data ) {
        data["reply_to"] = reply_to;
        let html = "";
        if (data['code'] != 1){
            if (data['err_code'] == 2){
                $("#flirtTitle").css("display", "none");
                html += `<div id="flirt_text"><div id="flirt_inner">${data['response']}<br/>
                          <a class="upgrade-now btn btn-primary" href="/members/new/page3.php">UPGRADE NOW <img src="../images/free-trial-imgs/double-chev-down.png" alt="down arrow" class="icon"></a>
                       </div>`;
                $('.carousel-control').css("display", "none");
            } else if(data['err_code'] == 4) {
                $('#verify-to-flirt-more').modal('show');
                return
            } else if (data['err_code'] == 1) {
                $("#flirtTitle").css("display", "none");
                $(".flirts-action").css("display", "none");
                html += `
                    <img src="/images/icons/alert_icon.png" class="flirtAlert"><br/> 
                    <div id="duplicateFlirt">${data['response']}</div>
                    <button class="btn btn-primaryBlue" onclick="$('#flirtsModal').modal('hide');">Ok</button>`;
                if (gender == 'M') {
                    $('#chat'+profile_id).fadeOut();
                }
            } else {
              $("#flirtTitle").css("display", "none");
              html += `<div id="flirt_text"><div class="errorMessage"><h2>${data['response']}</h2></div></div>`;
              if (gender == 'M') {
                  $('#chat'+profile_id).fadeOut();
              }
            }
            $("#flirtCarouselInner").html(html);
            $("#sendFlirt").css("display", "none");
            $(".carousel-control").css("display", "none");
            $('#flirtsCloseMessage').click( function(e) { e.stopPropagation();});
            setEvents(data, gender, profile_id);
            $("#flirtsModal").modal('show');
          return;
        } else {
            buildFlirtsHTML(profile_id, name, gender, data);
            const lis = $(".aflirtlinks");
            for(let i = 0; i < lis.length; i += 4) {
                if(i == 0) {
                    lis.slice(i, i+4).wrapAll("<div class='carousel-item item active row' data-bs-interval=\"false\"></div>");
                } else {
                    lis.slice(i, i+4).wrapAll("<div class='carousel-item item row' data-bs-interval=\"false\"></div>");
                }
            }
            $("#flirtsModal").modal('show');
            $("#flirtCarouselInner").carousel({ interval: false});
            // Instantiate the Bootstrap carousel
            setEvents(data, gender, profile_id);
        }
    });
}

function buildFlirtsHTML(profile_id, name, gender, data)
{
    $("#flirtsName").html(name);
    $("#flirtsId").html(profile_id);
    var opts="";
    $.each( data['flirts'], function( key, value ) {
      opts += `<a href='#' class='aflirtlinks d-block col-6 col-xs-6 col-md-6' style="float: left"><img src='${value['src']}' class='flirt w-100' data-flirt_id='${value['flirt_name']}'></a>`;
    });
    $("#flirtCarouselInner").html(opts);
    $("#flirtTitle").css("display", "block");
    $(".flirts-action").css("display", "block");
    $("#sendFlirt").css("display", "inline-block");
}

function setEvents(data, gender, profile_id)
{
    $('.flirt').click(function () {
        $('.flirt').removeClass('selected');
        $(this).addClass('selected');
    });

    $('#sendFlirt').click(function () {
        var flirt_id = $('.flirt.selected').attr('data-flirt_id');
        if (!flirt_id)
            return;

        $.ajax({
            type: "POST",
            url: "/members/flirts/send?receiver_member_id=" + data['receiver'],
            data: {
                reply_to: data["reply_to"],
                flirt_name: flirt_id
            },
            success: function (data) {
                clearFlirtList(data['checkbox']);
                showSmsOptInAjaxPopup(data['receiver'], 4);
            },
            dataType: "json"
        });
    });
}

let checkboxHide;

$("#silent_chat_flirt").on('click', function () {

    if ($("#silent_chat_flirt").prop("checked")) {
        checkboxHide = "yes";
    }

    $.ajax({
        type: "POST",
        url: "/members/flirts/flirtSessionPopup",
        data: {data: checkboxHide},
        success: function () {
            $("#flirtsModalSmall").modal('hide');
        },
        dataType: "json"
    })
});

function clearFlirtList(data) {
    $("#flirtsModal").modal('hide');
    if (data) {
        $("#flirtsModalSmall").modal('hide');
        return 0;
    } else {
        $("#flirtsModalSmall").modal('show');
        setTimeout(function () {
            $("#flirtsModalSmall").modal('hide')
        }, 3000);
    }
}

function showSmsOptInAjaxPopup(girl_mid, event_id) {
    $.get(
        "/members/notifyme/smsOptInPopup/?event_id=" + event_id + "&girl_mid=" + girl_mid,
        function (result) {
            if (result.event) {
                $("#notify-txt").html('Would you like to get notifications from <a href="/' + result.for_profile_id + '.html" target="_blank" >' + result.for_profile_name + '</a>?');
                $("#btn-sms-optin").attr('href', '/members/notifyme/add/' + result.for_profile_id );
                $('#sms_preference').modal({
                    backdrop: 'static',
                    keyboard: false
                })
            }
        });
    return false;
}
