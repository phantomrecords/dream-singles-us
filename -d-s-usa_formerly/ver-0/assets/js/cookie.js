function setCookie(name, value, days) {
  var d = new Date();
  d.setTime(d.getTime() + (days * 24 * 60 * 60 * 1000));
  var expires = d.toUTCString();
  var curCookie = name + "=" + escape(value) + "; expires=" + expires;
  document.cookie = curCookie;
}


function getCookie(name) {
  var prefix = name + "=";
  var cookieStartIndex = document.cookie.indexOf(prefix);
  if(cookieStartIndex == -1) return null;
  var cookieEndIndex = document.cookie.indexOf(";", cookieStartIndex + prefix.length);
  if(cookieEndIndex == -1) cookieEndIndex = document.cookie.length;
  return unescape(document.cookie.substring(cookieStartIndex + prefix.length, cookieEndIndex));
}


function delCookie(name, path, domain) {
  if(getCookie(name)) {
    document.cookie = name + "=" + 
    ((path) ? "; path=" + path : "; path=/") +
    ((domain) ? "; domain=" + domain : "") +
    "; expires=Thu, 01-Jan-70 00:00:01 GMT";
  }
}