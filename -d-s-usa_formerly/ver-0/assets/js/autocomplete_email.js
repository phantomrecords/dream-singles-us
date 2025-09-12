$(document).ready(function(){
   var acList =[ "gmail.com", "yahoo.com", "hotmail.com", "aol.com", "outlook.com", "comcast.net", "live.com","mail.com", "msn.com", "att.net", "icloud.com" ] ;
   var lastDot = -1;

     $("#email").autocomplete({
         minLength: 0,
         source: function (request, response) {
             if (lastDot>=0) {
                 response($.ui.autocomplete.filter(
                 acList, extractLast(request.term.substring(lastDot+1))));          
             }
         },
         focus: function () {
             return false;
         },
         select: function (event, ui) {
             var terms = split(this.value);
             terms.pop();
             terms.push(ui.item.value);
             terms.push("");
             this.value = this.value.substr(0,lastDot+1);
             this.value += terms.join("");
             return false;
         }
     }).on("keypress", function (e) {
         var keys = [];
         keys.unshift(e.which);
         if (String.fromCharCode(keys[0]) == "@") {
             lastDot =  $("#email").val().length;

         }
     });

     function split(val) {
         return val.split(/,\s*/);
     }

     function extractLast(term) {
         return split(term).pop();
     }
});