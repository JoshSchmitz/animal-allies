/*======================================================================================
===== Geoff's Browser Detector v2.0  ====================================================
========================================================================================

Change Log:
    v1.0                        - Initial release
    v2.0                        - Detector has been separated from the flashLib
                                - Now aware of Safari, Gecko browsers
                                  (Mozilla & friends), and Opera
                                - Can now determine "actual" browser version numbers
                                - This is now a pretty durned good detector
    
- GTP

*/

// debugging flag
var montyPython = false;

// All the detector variables
var isGecko         = false;
var isSafari        = false;
var isIE            = false;
var isOpera         = false;
var isNS4           = false;
var isOther         = false;

var hasFlash        = false;

var isMac           = false;
var isPC            = false;

var browserVersionText, browserVersionNum, browserName, platform, userAgent, realVersion;
var screenHeight, screenWidth, screenColorDepth;
var screenWarningString = false;
var numScreenErrors = 0;
var depthString, pluralString, platformAdvice;


// Get all this crap
browserVersionText  = navigator.appVersion;
browserVersionNum   = parseFloat( browserVersionText );

platform            = navigator.platform;
userAgent           = navigator.userAgent;
browserName         = navigator.appName;
screenHeight        = screen.height;
screenWidth         = screen.width;
screenColorDepth    = screen.colorDepth;


// Platform testing
if( platform == "MacPPC" || platform == "Mac68k") {
    isMac = true;
} else if ( platform == "Win32") {
    isPC = true;
}

// We look for...

// Opera
if ( userAgent.indexOf("Opera") != -1 ) {
    isOpera = true;
    realVersion = grabVersion( "Opera", "[" );
}
// Safari
else if( userAgent.indexOf("AppleWebKit/") != -1 ) {    
    isSafari = true;
    realVersion = grabVersion( "AppleWebKit/", "(" );
}
// Mozilla & friends
else if( userAgent.indexOf("Gecko") != -1 ) {
    isGecko = true;
    realVersion = grabVersion( "rv:", ")" );
}
// IE
else if( browserName.indexOf("Internet Explorer") != -1 ) {
    isIE = true;
    realVersion = grabVersion( "MSIE", ";" );
}
// NS4
else if ( browserName == "Netscape" && isGecko == false ) {
    isNS4 = true;
}
else {
    isOther = true;
}

// DEBUGGING - output the results of the sniffage
if( montyPython == true ){
    document.writeln("isGecko = " + isGecko + "<br>");
    document.writeln("isSafari = " + isSafari + "<br>");
    document.writeln("isOpera = " + isOpera + "<br>");
    document.writeln("isNS4 = " + isNS4 + "<br>");
    document.writeln("isIE = " + isIE + "<br>");
    document.writeln("isOther = " + isOther + "<br>");
    document.writeln("hasFlash = " + hasFlash + "<br>");
    document.writeln("isMac = " + isMac + "<br>");
    document.writeln("isPC = " + isPC + "<br>");
    document.writeln("userAgent = " + userAgent + "<br>");
    document.writeln("browserVersionText = " + browserVersionText + "<br>");
    document.writeln("browserVersionNum = " + browserVersionNum + "<br>");
    document.writeln("realVersion = " + realVersion + "<br>");
    document.writeln("browserName = " + browserName + "<br>");
    document.writeln("platform = " + platform + "<br>");
    document.writeln("screenWidth = " + screenWidth + "<br>");
    document.writeln("screenHeight = " + screenHeight + "<br>");
    document.writeln("screenColorDepth = " + screenColorDepth + "<br>");
}

function grabVersion( iString, eString )
{
    var vIndex = userAgent.indexOf(iString) + iString.length;
    var endIndex = userAgent.indexOf( eString, vIndex );
    return parseFloat( userAgent.substring(vIndex, endIndex) );
}