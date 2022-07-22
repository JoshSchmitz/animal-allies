/*
====================
AVENET MENU NAV v3.1
====================

Changelog:

v3.0    - added support for pri/sec horiz/vert in any combination
        - major code cleaning
        - optimized HTML output using registration functions and more OO syntax

v3.1    - added deferred positioning
        - improved right edge detection
        - added awareness of bottom edge and scroll position
            - menus will now "bounce" off the bottom edge
        - couple of event processing efficiency fixes
        - menus now cache their positioned state
        
v3.1.1  - removed some harmful fudge in the shadow contruction code for IE7
            - off by one workaround and PNG fix no longer needed

*/

function ConsoleWindow()    // self-contained ConsoleWindow Class
{
    // Methods
    this.print = ConsoleWindow_print;
    this.command = ConsoleWindow_command;
    
    // Constructor
    var x = 350;
    var y = 250;
    var stylesheet = "BODY{ margin: 0px; font:12px Monaco,Courier; background-color:black; }";
    stylesheet += "DIV#mainDiv{  padding: 5px;padding-top: 40px; }\n";
    stylesheet += "DIV#inputDiv{ position: fixed; top: 0px; left: 0px; padding:5px; background-color: #DDD; width:98%; border-bottom: 1px solid #999; border-top: 1px solid white; }";
    stylesheet += "INPUT{ width: 100%; }";
    stylesheet += "FORM{ margin: 0px; }";
    
    this.wObj = window.open("","debugWindow", "height="+ y + ",width=" + x + ",top=1,left=1,scrollbars=yes,resizable=yes");
    if( this.wObj ) {
        this.wDoc = this.wObj.document;
        this.wDoc.open();
        this.wDoc.write("<html><head><style type='text/css'>" + stylesheet + "</style></head><body style='background-color:black; color:#FFFFFF; font:9pt Charcoal;'><div id='inputDiv'><form onSubmit='window.opener.console.command();return false;'><input type='text' id='textField' /></form></div><div style='width: 95%;' id='mainDiv'></div></body></html>");
        this.wDoc.close();
        this.mainDiv = this.wDoc.getElementById("mainDiv");
        if( !this.mainDiv ) this.mainDiv = this.wDoc.all.mainDiv;
        this.print('<b>Console Ready.</b>');
    }
}

function ConsoleWindow_print( text )
{
    if( this.mainDiv )
    {
        try{
            //this.wDoc.getElementById("main").innerHTML = this.wDoc.getElementById("main").innerHTML + theString + "<br />";
            this.mainDiv.innerHTML = this.mainDiv.innerHTML + text + "<br />";
            this.wObj.scrollBy( 0, 500 );
        } catch( err ) {
            //nothing.
        }
    }
}

function ConsoleWindow_command( text )
{
    var theResult;
    var theField = this.wObj.document.getElementById( "textField" );
    
    if( theField.value == 'clear' )
    {
        this.mainDiv.innerHTML = "cleared.";
    }
    else
    {
        try {
            theResult = eval( "window.parent." + theField.value );
            this.print( theResult );
        } catch( err ) {
            this.print( "SYNTAX ERROR" );
        }
    }
    
    theField.value = "";
    theField.focus();
}

/* To figure out where things are */
function getElementPosition( offsetTrail, grump )
{
    var offsetLeft = 0;
    var offsetTop = 0;
    
    while (offsetTrail && !(offsetTrail.id == "secNavBox" || offsetTrail.id == "priNavBox")) {
        offsetLeft += offsetTrail.offsetLeft;
        offsetTop += offsetTrail.offsetTop;
        offsetTrail = offsetTrail.offsetParent;
    }

    return { left:offsetLeft, top:offsetTop };
}

/* needed for accurate menu-reversing when we would otherwise go off the edge of the window */
function getAbsoluteElementPosition( offsetTrail, grump )
{
    var offsetLeft = 0;
    var offsetTop = 0;
    
    while (offsetTrail) {
        offsetLeft += offsetTrail.offsetLeft;
        offsetTop += offsetTrail.offsetTop;
        offsetTrail = offsetTrail.offsetParent;
    }

    return { left:offsetLeft, top:offsetTop };
}


function positionMenu( menuID )
{
    var theTitle = document.getElementById( menuID + "_title" );
    var theMenu = document.getElementById( menuID + "_menu" );
    var titlePos, absTitlePos;
    
    if( !theMenu ) return;
    
    if( theMenu.mode == "vertical" ) {
        positionMenuAside( menuID );
        return;
    }
    
    // Get menu positions, relative to both the nav and the whole document
    if( isIE && (realVersion < 5.5) ) { // Don't know why this works...but it does!
        titlePos = getElementPosition( theTitle.offsetParent );
    } else {
        titlePos = getElementPosition( theTitle );
    }
    if( isIE && (realVersion < 5.5) ) {
        absTitlePos = getAbsoluteElementPosition( theTitle.offsetParent );
    } else {
        absTitlePos = getAbsoluteElementPosition( theTitle );
    }

    
    if( theMenu ) {
        if( isOffRightEdge(absTitlePos.left + theMenu.offsetWidth) ) {
            theMenu.style.left = titlePos.left + theTitle.offsetWidth - theMenu.offsetWidth + "px";
            theMenu.reversePos = true;
        } else {
            theMenu.style.left = titlePos.left + "px";
            theMenu.reversePos = false;
        }
        
        theMenu.style.top = titlePos.top + theTitle.offsetHeight + "px";
    }
}

function positionMenuAside( menuID )
{
    var theTitle = document.getElementById( menuID + "_title" );
    var theMenu = document.getElementById( menuID + "_menu" );
    var titlePos = getElementPosition( theTitle );
    var absTitlePos = getAbsoluteElementPosition( theTitle );
    var theLeft;
    var theTop;
    
    // Don't know why this works...but it does!
    if( isIE && (realVersion < 5.5) ) {
        titlePos = getElementPosition( theTitle.offsetParent );
        if( isMac ){
            titlePos.top = getElementPosition( theTitle ).top - 5;
        }
    } else {
        titlePos = getElementPosition( theTitle );
        if( isPC && isIE && (realVersion > 5) && (realVersion < 6) && (titlePos.top != 0)){
            titlePos.top = titlePos.top - 2;
            /*  This is the supidest thing I've ever seen. */
        }
    }
    
    var menuRightEdge = absTitlePos.left + theTitle.offsetWidth + theMenu.offsetWidth;
    var menuBottomEdge = absTitlePos.top + theTitle.offsetHeight + theMenu.offsetHeight;

    if( isOffRightEdge(menuRightEdge) ) {
        theLeft = titlePos.left - theMenu.offsetWidth;
        theTop = titlePos.top;
        theMenu.reversePos = true;

        theLeft -= menuOffsetX; // 'cause we're going backwards here...
        theTop += menuOffsetY;
    } else {
        theLeft = titlePos.left + theTitle.offsetWidth;
        theTop = titlePos.top;
        theMenu.reversePos = false;

        // standard offset adjustments
        theLeft += menuOffsetX;
        theTop += menuOffsetY;
    }
    
    // to keep items aligned with one another across menus
    if( !noAutoMenuPadding )
    {
        theMenu.style.paddingTop = ((menuOffsetY<0) ? -menuOffsetY : menuOffsetY) + "px";
        theMenu.style.paddingBottom = ((menuOffsetY<0) ? -menuOffsetY : menuOffsetY) + "px";
    }
        
    theTop -= parseInt( theMenu.style.borderTopWidth );
    
    // move the menu up such that its bottom is not below the bottom edge of the window
    if( isOffBottomEdge(menuBottomEdge) ) {
        bottomEdge = getBottomEdge();
        theTop -= (menuBottomEdge - bottomEdge);
        //don't go above the top...
        var parentNav = document.getElementById( theMenu.parentNav + "Menu" );
        var navTop = getAbsoluteElementPosition( parentNav ).top;
        if( (navTop + theTop) < 0 ) theTop = -navTop; 
    }
    
    theMenu.style.left = theLeft + "px";
    theMenu.style.top = theTop + "px";
}

function positionSubMenu( menuID )
{
    var theTitle = document.getElementById( menuID + "_title" );
    var theMenu = document.getElementById( menuID + "_menu" );
    var titlePos = getElementPosition( theTitle );
    var absTitlePos = getAbsoluteElementPosition( theTitle );
    var theLeft, theTop;
    
    var menuRightEdge = absTitlePos.left + theTitle.offsetWidth + theMenu.offsetWidth;
    var menuBottomEdge = absTitlePos.top + theTitle.offsetHeight + theMenu.offsetHeight;
    
    if( isOffRightEdge(menuRightEdge) || theMenu.mParent.mParent.reversePos ) {
        theLeft = titlePos.left - theMenu.offsetWidth;
        theTop = titlePos.top;
        theMenu.reversePos = true;
        
        // Customized for browser misbehavior
        if( (isPC && isIE) || isGecko || isOpera ) {
            //theLeft -= ( parseInt(theMenu.style.borderRightWidth) );
        } else if ( isSafari || (isIE && isMac) ) {
            theLeft -= ( parseInt(theMenu.style.borderLeftWidth) );
            theTop -= parseInt( theMenu.style.borderTopWidth );
        }
        if( !noOffsetForSubMenus )
        {
            theLeft = theLeft - menuOffsetX; // 'cause we're going backwards here...
            theTop = theTop + menuOffsetY;
        }
        
        // if we've doubled back, add an offset to improve clarity (but only once) 
        if( !(theMenu.mParent.mParent.reversePos) && !(isIE && isMac) )
            theTop += Math.round(theTitle.clientHeight * doubleBackVerticalOffset);
        
        //now, we flip that triangle...
        flipTriangle( theMenu, "<" );
        
    } else {
        theLeft = titlePos.left + theTitle.offsetWidth;
        theTop = titlePos.top;
        theMenu.reversePos = false;
        
        // Customized for browser misbehavior
        if( (isPC && isIE) || isGecko || isOpera ) {
            theLeft += ( parseInt(theMenu.style.borderRightWidth) + parseInt(theMenu.style.borderLeftWidth) );
        } else if ( isSafari || (isIE && isMac) ) {
            theLeft += parseInt( theMenu.style.borderRightWidth );
            theTop -= parseInt( theMenu.style.borderTopWidth );
        }
        
        if( !noOffsetForSubMenus )
        {
            theLeft = theLeft + menuOffsetX;
            theTop = theTop + menuOffsetY;
        }
        
        //and maybe flip it back...
        flipTriangle( theMenu, ">" );
    }
    
    // to keep items aligned with one another across menus
    if( !noAutoMenuPadding )
    {
        theMenu.style.paddingTop = ((menuOffsetY<0) ? -menuOffsetY : menuOffsetY) + "px";
        theMenu.style.paddingBottom = ((menuOffsetY<0) ? -menuOffsetY : menuOffsetY) + "px";
    }
    
    // move the menu up such that its bottom is not below the bottom edge of the window
    if( isOffBottomEdge(menuBottomEdge) ) {
        bottomEdge = getBottomEdge();
        theTop -= (menuBottomEdge - bottomEdge);
        //don't go above the top...
        var parentNav = document.getElementById( theMenu.parentNav + "Menu" );
        var navTop = getAbsoluteElementPosition( parentNav ).top;
        if( (navTop + theTop) < 0 ) theTop = -navTop; 
    }
    
    theMenu.style.left = theLeft + "px";
    theMenu.style.top = theTop + "px";    
}

function flipTriangle( theMenu, theDirection )
{
    var theItem = theMenu.mParent;
    var theDivs = theItem.getElementsByTagName("div");
    for( i=0; i<theDivs.length; i++ ) {
        if( theDivs.item(i).className == "subTriangle" ) {
            var theTri = theDivs.item(i);
            if( theTri.childNodes.length == 1 && (theTri.childNodes[0].nodeValue == ">" || theTri.childNodes[0].nodeValue == "<") ) {
                theTri.removeChild( theTri.childNodes[0] );
                theTri.appendChild( document.createTextNode(theDirection) );
            }
        }
    }
}

function positionMenus( theMenu )
{
    if( theMenu.items )
    {
        var i = 0;

        for( i=0; i<theMenu.items.length; i++ )
        {
            if( theMenu.items[i].mChild ) {
                positionSingleMenu( chop(theMenu.items[i].id) );
                positionMenus( theMenu.items[i].mChild );
            }
        }
    }
}

function positionChildMenus( theMenu )
{
    if( theMenu.items )
    {
        var i = 0;

        for( i=0; i<theMenu.items.length; i++ )
        {
            if( theMenu.items[i].mChild ) {
                positionSingleMenu( chop(theMenu.items[i].id) );
            }
        }
    }
}

function positionAllMenus()
{
    if( !deferredPositioning ) {
        if( priMenu ) positionMenus( priMenu );
        if( secMenu ) positionMenus( secMenu );
    } else {
        windowSize = { x:getRightEdge(), y:getBottomEdge() };
    }
}

function chop( theString )
{
    return theString.split("_")[0];
}


/* Menu opening and closing */

function openMenu( titleID )
{
    var menuObj = document.getElementById( titleID + "_menu" );
    var otherNav = null;
    
    if( menuObj ){
        if( noMenus || !finishedLoading || menuObj.style.visibility == "visible" ) //various reasons not to be here
            return;
        
        if( deferredPositioning )
            positionSingleMenu( titleID );
        
        var parentNav = document.getElementById( menuObj.parentNav + "Menu" );
        
        if( menusActAsOne ) {
            if( menuObj.parentNav == "pri" ) otherNav = document.getElementById( "secMenu" );
            else otherNav = document.getElementById( "priMenu" );
            if( otherNav ) otherNav.closeAllMenus();
        }
        
        menuObj.style.zIndex = menuObj.numParents * 2 + 5;
        menuObj.style.visibility = "visible";
        
        // shadows
        if( !noShadows && !(isIE && isMac) ) showShadow( menuObj );
        
        closeAllSiblingsOf( titleID );
        if( typeof(layeringWorkaround) != "undefined" ) doLayeringWorkaround( "on", menuObj );
        rememberMenu( titleID, parentNav );
    }
}

function positionSingleMenu( titleID )
{
    var menuObj = document.getElementById( titleID + "_menu" );
    var repo = false;
    var scrollY = getScrollY();
    
    if( menuObj.positionedFor && menuObj.positionedFor.x == windowSize.x && menuObj.positionedFor.y == windowSize.y && menuObj.positionedFor.scroll == scrollY )
        return; //work is already done
        
    if( menuObj.positionedFor ) repo = true;  // this is a reposition
    
    menuObj.positionedFor = { x:windowSize.x, y:windowSize.y, scroll:scrollY };
    
    if( menuObj.menuType == "sub" )
        positionSubMenu( titleID );
    else
        positionMenu( titleID );
    
    if( repo && !noShadows ) repositionShadow( menuObj );
}

function rememberMenu( sectionID, parentNav )
{
    var theMenu = document.getElementById( sectionID + "_menu" );
    theMenu.mParent.mParent.currentlyOpen = theMenu;
    parentNav.lastOpened = sectionID;
}

function forgetMenu( menuObj )
{
    menuObj.mParent.mParent.currentlyOpen = null;
    menuObj.parentNav.lastOpened = null;
}

function closeMenu( menuID )
{
    var theObj;
    
    if( typeof( menuID ) == "string" )
        theObj = document.getElementById( menuID + "_menu" );
    else
        theObj = menuID;
        
    if( theObj && menuIsOpen(theObj) ){
        for( var i = 0; i<theObj.items.length; i++ )
            if( theObj.items[i].mChild )
                closeMenu( theObj.items[i].mChild ); 
        
        killShadow( theObj );
        theObj.style.visibility = "hidden";
        forgetMenu( theObj );
        if( typeof(layeringWorkaround) != "undefined" ) doLayeringWorkaround( "off", theObj );
    }
}



// this is meant to be called as a method, attached to a pri or sec menu bar object
function closeAllMenus()
{
    if( this.currentlyOpen )
        closeMenu( this.currentlyOpen );
}

function doLayeringWorkaround( state, menuObj )
{
    if( layeringWorkaround && document.getElementById(menuObj.parentNav + "Menu").currentlyOpen == null )
    {
        if( state == "on" ) layeringWorkaround.on();
        else if( state == "off" ) layeringWorkaround.off();
    }
}

function isOffRightEdge( xValue )
{
    if( getRightEdge() <= xValue ) return true;
    return false;
}

function isOffBottomEdge( yValue )
{
    if( getBottomEdge() <= yValue ) return true;
    return false;
}

function getBottomEdge()
{
    var scrollbar = 17;
    var scrollY = getScrollY();
    if( typeof(window.innerHeight) == "number" )
    {
        if( isSafari ) return (window.innerHeight + scrollbar + scrollY);
        return window.innerHeight + scrollY;
    }
    else if( document.documentElement && document.documentElement.clientHeight )
        return document.documentElement.clientHeight + scrollY;
    else
        return (document.body.clientHeight + scrollbar + scrollY);
}

function getRightEdge()
{ 
    var scrollbar = 17;
    if( typeof(window.innerWidth) == "number" )
    {
        if( isSafari ) return (window.innerWidth + scrollbar);
        return window.innerWidth;
    }
    else if( document.documentElement && document.documentElement.clientWidth )
        return document.documentElement.clientWidth;
    else
        return (document.body.clientWidth + scrollbar);
}

function getScrollY() {
    var scrOfY = 0;
    if( typeof( window.pageYOffset ) == 'number' ) {
        //Netscape compliant
        scrOfY = window.pageYOffset;
    } else if( document.body && ( document.body.scrollLeft || document.body.scrollTop ) ) {
        //DOM compliant
        scrOfY = document.body.scrollTop;
    } else if( document.documentElement && ( document.documentElement.scrollLeft || document.documentElement.scrollTop ) ) {
        //IE6 standards compliant mode
        scrOfY = document.documentElement.scrollTop;
    }
    return scrOfY;
}

// these are the actual offsets for the shadow DIV
// they affect the position of the shadow DIV
var xOffset = -12;
var yOffset = 12;

// these are for fine-tuning how far the shadow is from each corner
// they affect the dimensions of the shadow DIV
var yStretch = 12;
var xStretch = 15;


function positionShadow( theMenu, shadowDIV )
{
    shadowDIV.style.left = parseInt(theMenu.style.left) + xOffset + "px";
    shadowDIV.style.top = parseInt(theMenu.style.top) + yOffset - yStretch + "px";
}

function repositionShadow( theMenu )
{
    positionShadow( theMenu, document.getElementById( theMenu.id + "shadow" ) );
}

function createShadow( theMenu )
{
    var theDIV = document.getElementById( theMenu.id + "shadow" );
    
    if( theDIV ) {
        positionShadow( theMenu, theDIV );
        return;
    }
    
    // if we've already constructed a shadow DIV, clone and alter it instead
    if( !genericShadowDIV  ) {
        constructShadow( theMenu, theDIV );
        theDIV = genericShadowDIV;
    } else
        theDIV = cloneShadow( theMenu, theDIV );
    
    theMenu.parentNode.appendChild( theDIV );
}

function constructShadow( theMenu, theDIV )
{
    // if we've gotten this far, we have yet to construct the shadow.  Let's do that.
    var imagePath = "/repository/designs/images/menuShadows/";
    
    theDIV = document.createElement( "div" );
    theDIV.id = theMenu.id + "shadow";
    theDIV.style.zIndex = theMenu.numParents * 2 - 1 + 5;
    theDIV.style.height = theMenu.clientHeight + yStretch + "px";
    theDIV.style.width = theMenu.clientWidth + xStretch + "px";
    theDIV.style.position = "absolute";
    theDIV.style.visibility = "hidden";
    positionShadow( theMenu, theDIV );
    theDIV.className = "shadowDIV";

    // now conjure up the shadow images...
    var TLImage = document.createElement( "img" );
    var BLImage = document.createElement( "img" );
    var LImage = document.createElement( "img" );
    var BImage = document.createElement( "img" );
    var BRImage = document.createElement( "img" );
    TLImage.src = imagePath + "shadowTL.png";
    BLImage.src = imagePath + "shadowBL.png";
    LImage.src = imagePath + "shadowL.png";
    BImage.src = imagePath + "shadowB.png";
    BRImage.src = imagePath + "shadowBR.png";

    //TLImage.className = "TLImage";
    //BLImage.className = "BLImage";
    LImage.className = "LImage";
    BImage.className = "BImage";
    //BRImage.className = "BRImage";

    TLImage.style.position = BLImage.style.position = LImage.style.position = BImage.style.position = BRImage.style.position = "absolute";

    // Set the well-known dimensions of the corner images
    TLImage.style.width = BLImage.style.width = LImage.style.width = "30px";
    TLImage.style.height = BLImage.style.height = "17px";
    BLImage.style.height = BImage.style.height = BRImage.style.height = "17px";
    BLImage.style.width = BRImage.style.width = "30px";

    // Position all images
    TLImage.style.top = "0px";
    TLImage.style.left = BLImage.style.left = LImage.style.left = "0px";
    BLImage.style.bottom = BImage.style.bottom = BRImage.style.bottom = "0px";
    BRImage.style.right = "0px";
    LImage.style.top = "17px";  // just under the TL image
    BImage.style.left = "30px";  // just to the right of the BL piece

    // Set the computed dimensions of the resizable "middle" images
    LImage.style.height = parseInt(theDIV.style.height) - 34 + "px";  // height is total height minus TL piece and BL piece
    BImage.style.width = parseInt(theDIV.style.width) - 60 + "px";  // width is total width minus BL piece and BR piece

    // As we all know, IE needs a little help with transparency
    if( isIE && realVersion >= 5.5 && realVersion < 7 )
    {
        shadowFixIE( TLImage );
        shadowFixIE( BLImage );
        shadowFixIE( BImage );
        shadowFixIE( BRImage );
        shadowFixIE( LImage );
        BImage.style.width = parseInt(theDIV.style.width) - 61 + "px";
    }

    if( parseInt(theDIV.style.height) > 34 ) theDIV.appendChild( LImage ); //if the height of this menu is small enough, we don't need this
    theDIV.appendChild( BImage );
    theDIV.appendChild( TLImage );
    theDIV.appendChild( BLImage );
    theDIV.appendChild( BRImage );
    theDIV.LImage = LImage;

    theDIV.BImage = BImage;
    genericShadowDIV = theDIV;
}

function cloneShadow( theMenu, theDIV )
{
    var LImage, shadowHeight;
    theDIV = genericShadowDIV.cloneNode( true );

    theDIV.id = theMenu.id + "shadow";
    theDIV.style.zIndex = theMenu.numParents * 2 - 1 + 5;
    theDIV.style.height = (shadowHeight = theMenu.clientHeight + yStretch) + "px";

    if( theDIV.childNodes[0].className == "LImage" )
        theDIV.childNodes[0].style.height = (shadowHeight - 34) + "px";  // height is total height minus TL piece and BL piece

    positionShadow( theMenu, theDIV );
    
    return theDIV;
}

function showShadow( theMenu )
{
    var theDIV = document.getElementById( theMenu.id + "shadow" );

    if( !theDIV ) {
        createShadow( theMenu );
        theDIV = document.getElementById( theMenu.id + "shadow" );
    }

    theDIV.style.visibility = "visible";
    return;
}

// horked from IEpng.js
function shadowFixIE( elementObj )
{
    var obj = elementObj;
    if( obj.tagName == "IMG" ) // this is an image
    {
        var src = obj.src;
        obj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='" + src + "', sizingMethod='scale')"
        obj.src = "/repository/designs/images/speck.gif";
    }
    else //not an image, it's a background or something
    {
        var bg = obj.currentStyle.backgroundImage;
        if (bg.match(/\.png/i) != null) {
            var mypng = bg.substring(5,bg.length-2);
            obj.style.filter = "progid:DXImageTransform.Microsoft.AlphaImageLoader(src='"+mypng+"', sizingMethod='scale')";
            obj.style.backgroundImage = "url( " + imagePath + "/x.png )";
        }
    }
}

function killShadow( theMenu )
{
    var hoohah;
    if( hoohah = document.getElementById( theMenu.id + "shadow" ) ) hoohah.style.visibility = "hidden";
}

function getCSS ( selector, property )
{
    var sheets = document.styleSheets[0];
    
    var ruleList = (typeof sheets.cssRules != "undefined") ? sheets.cssRules : ((typeof sheets.rules != "undefined") ? sheets.rules : null);
    
    if( ruleList ) {
        for( var i = 0; i<ruleList.length; i++ ) {
            if( ruleList[i].selectorText.toLowerCase() == selector.toLowerCase() ) {
                return eval ( "ruleList[i].style." + property );
            }
        }
    }
}
function menuIsOpen( theMenu )
{
    return theMenu.style.visibility == "visible";
}

/* FUDGE FACTOR functions used to be here, then they were moved to another file, then they were rendered useless */


/* Event handlers */

function initMenus()
{
    positionAllMenus();
    finishedLoading = true;
}

function itemMouseOver() // titleID, thePos
{
    var titleID = this.titleID;
    var titleObj = document.getElementById( titleID + "_title");
    var parentNav = document.getElementById( titleObj.mParent.parentNav + "Menu" );
    
    cancelClose( titleObj.mParent.parentNav );
   // if( parentNav.lastMouseOver == titleID ) return;
    parentNav.lastMouseOver = titleID;
    
    if( titleObj.mChild && !menuIsOpen(titleObj.mChild) )
    {
        openMenu( titleID );
    }
    else
    {
        closeAllSiblingsOf( titleID );
        parentNav.lastOpened = chop(titleObj.mParent.id);
    }
}

function cancelClose( parentNav )
{
    if( parentNav == "pri" ) {
        clearTimeout( priMenu.closeTimer );
        priMenu.closeTimer = null;
    }
    if( parentNav == "sec" ) {
        clearTimeout( secMenu.closeTimer );
        secMenu.closeTimer = null;
    }
}

function closeTimer( parentNav )
{
    if( parentNav == "pri" )
        priMenu.closeTimer = setTimeout( "priMenu.closeAllMenus();", closeDelay );
    if( parentNav == "sec" )
        secMenu.closeTimer = setTimeout( "secMenu.closeAllMenus();", closeDelay );
}

function itemMouseOut()
{
    var titleObj = document.getElementById( this.titleID + "_title" );
    closeTimer( titleObj.mParent.parentNav );
}

function closeAllSiblingsOf( titleID )
{
    var i = 0;
    var titleObj = document.getElementById( titleID + "_title" );
    var menuObj = titleObj.mParent;
    if( menuObj.currentlyOpen && menuObj.currentlyOpen != titleObj.mChild )
        closeMenu( menuObj.currentlyOpen );
}
function closeAllChildrenOf( thisItem )
{
    if( thisItem.mChild ){
        var i = 0;
        var thisMenu = thisItem.mChild;
        
        for( i=0; i<thisMenu.items.length; i++ ) {
            closeAllChildrenOf( thisMenu.items[i] );
        }
        closeMenu( thisMenu );
    }
}

/* Binding and Registration functions -- essential for good housekeeping */
function registerTitle( titleID, whichNav, hasChildren, isHome )
{
    var menuObj = document.getElementById( whichNav + "Menu" ); // whichNav is "pri" or "sec"
    var titleObj = document.getElementById( titleID + "_title" );
    
    // attach event handlers
    titleObj.titleID = titleID;
    titleObj.onmouseout = itemMouseOut;
    titleObj.onmouseover = itemMouseOver;
    
    if( !menuObj.items ) menuObj.items = new Array();
    if( hasChildren && !isHome ) {
        titleObj.mChild = document.getElementById( titleID + "_menu" );
        titleObj.mChild.mParent = titleObj;
    }
    menuObj.items = menuObj.items.concat( titleObj );
    titleObj.mParent = menuObj;
}
function registerMenu( menuID, whichNav )
{
    var menuObj = document.getElementById( menuID + "_menu" );
    menuObj.parentNav = whichNav;
    menuObj.mode = eval( whichNav + "Mode" );
    menuObj.currentlyOpen = null;
    menuObj.menuType = "full";
    menuObj.numParents = 1;
}
function registerSubMenu( menuID, numParents )
{
    var menuObj = document.getElementById( menuID + "_menu" );
    menuObj.mParent = document.getElementById( menuID + "_title" );
    menuObj.mParent.mChild = menuObj;
    menuObj.parentNav = menuObj.mParent.mParent.parentNav;
    menuObj.menuType = "sub";
    menuObj.numParents = numParents;
}
function registerMenuItem( itemID, hasChildren )
{
    var itemObj = document.getElementById( itemID + "_title" );
    var menuObj = document.getElementById( chop(itemObj.parentNode.id) + "_menu" );
    
    // attach event handlers
    itemObj.titleID = itemID;
    itemObj.onmouseout = itemMouseOut;
    itemObj.onmouseover = itemMouseOver;
    
    if( !menuObj.items ) menuObj.items = new Array();
    itemObj.mParent = menuObj;
    menuObj.items = menuObj.items.concat( itemObj );
}

// DEFAULTS: when mouse passes from primary nav to secondary (or vice versa), do we immediately close any menus open from the other?
var menusActAsOne = true;

// DEFAULTS: menu positioning offsets
var menuOffsetX = -5;
var menuOffsetY = -2;

// DEFAULTS: menu shadow control
var noShadows = true;

// DEFAULTS: nav orientation settings
var priMode = "horizontal";
var secMode = "vertical";

// DEFAULTS: amount to offset height of sub-menus when they bounce off the right edge of the window
var doubleBackVerticalOffset = .6;

// DEFAULTS: time between cursor leaving a menu and menu closing (in milliseconds)
var closeDelay = 500;

// DEFAULTS: to menu, or not to menu (women-u!)
var noMenus = false;

// DEFAULTS: do we automatically adjust menu padding based on the assigned menu offset?
var noAutoMenuPadding = false;

// DEFAULTS: do the menu offsets apply to sub-menus or not?
var noOffsetForSubMenus = false;

// DEFAULTS: defer menu positioning until mouseover?
var deferredPositioning = true;

//var console = new ConsoleWindow();
var inSecMenu = false;
var theTimer = null;
var subTimer = null;
var finishedLoading = false;
var priMenu = null;
var secMenu = null;
var genericShadowDIV = null;
var windowSize = { x:getRightEdge(), y:getBottomEdge() };