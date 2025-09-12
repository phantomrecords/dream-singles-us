function checkLen(el, len) {
      var rchars = $('#'+el+'rchars');
      var obj = $('#'+el);
      var ignore_everything = /[^a-z0-9\u2000-\u206F\u2E00-\u2E7F\\'!"#$%&()*+,\-.\/:;<=>?@\[\]^_`{|}~\]]/ig;
 		  var replace_char = '';

      if(obj.val().replace(ignore_everything,replace_char).length > len){
          var text = obj.val();
          var spaceCount = (text.split(" ").length - 1);
          obj.val(text.substr(0, (len - 1) + spaceCount));
      }

      var rawLength = obj.val().length;
      var remaining = len-obj.val().replace(ignore_everything,replace_char).length;

      if (remaining < 20) {
          rchars.parent().css('color','red').css('font-weight','bold');
      } else {
          rchars.parent().css('color','unset').css('font-weight','normal');
      }
      if (remaining <= 0) {

        if (remaining < 0) {
          rawLength += remaining;
          remaining = 0;
        }
        obj.attr('maxlength', rawLength).val(obj.val().substring(0, rawLength));
      } else {
        obj.removeAttr('maxLength');
      }
        rchars.html(remaining);
  }

function bindLimitedInputs() {
    // Reset bindings
    $('.limited').off('input.limited change.limited');


    // Apply bindings to input and change events
    $('.limited').on("input.limited change.limited", function(){

        var maxLength = $(this).attr('charLimit');

        checkLen($(this).attr('id'), maxLength);
    });
}

$(document).ready(function(){
    bindLimitedInputs();
});