//=============================================================================
// SciFi_MenuUI.js
//=============================================================================

var Imported = Imported || {};
Imported.SciFi_MenuUI = true;

var SciFi = SciFi || {};
SciFi.MenuUI = SciFi.MenuUI || {};

(function() {

"use strict";

//=============================================================================
// Layout
//=============================================================================

SciFi.MenuUI.maxCols = function() {

    return 4;

};

SciFi.MenuUI.visibleRows = function() {

    return 1;

};

SciFi.MenuUI.cardPadding = function() {

    return 12;

};

//=============================================================================
// Fonts
//=============================================================================

SciFi.MenuUI.Font = {

    Header: 24,

    HeaderSmall: 18,

    Resource: 18

};

//=============================================================================
// Window_MenuStatus Layout
//=============================================================================

Window_MenuStatus.prototype.maxCols = function() {

    return SciFi.MenuUI.maxCols();

};

Window_MenuStatus.prototype.numVisibleRows = function() {

    return SciFi.MenuUI.visibleRows();

};

Window_MenuStatus.prototype.itemWidth = function() {

    var totalWidth =
        this.contentsWidth();

    var spacing =
        this.spacing();

    var cols =
        this.maxCols();

    return Math.floor(

        (totalWidth - spacing * (cols - 1))

        / cols

    );

};

Window_MenuStatus.prototype.itemHeight = function() {

    return this.contentsHeight();

};

Window_MenuStatus.prototype.spacing = function() {

    return 0;

};

Window_MenuStatus.prototype.drawItem = function(index) {

    this.drawItemBackground(index);

    var actor =
        $gameParty.members()[index];

    var rect =
        this.itemRect(index);

    this.drawActorCard(
        actor,
        rect
    );

};

Window_MenuStatus.prototype.drawActorCard =
function(actor, rect) {

    this.drawCardBackground(rect);

    this.drawCardHeader(actor, rect);

    this.drawCardPortrait(actor, rect);

    this.drawCardResources(actor, rect);

};

Window_MenuStatus.prototype.drawCardBackground =
function(rect) {

    this.contents.fillRect(

        rect.x + 2,
        rect.y + 2,

        rect.width - 4,
        rect.height - 4,

        this.gaugeBackColor()

    );

};

Window_MenuStatus.prototype.drawCardHeader =
function(actor, rect) {

    var oldSize =
        this.contents.fontSize;

    //------------------------------------------
    // Name
    //------------------------------------------

    this.contents.fontSize =
        SciFi.MenuUI.Font.Header;

    this.changeTextColor(
        this.normalColor()
    );

    this.drawText(

        actor.name(),

        rect.x + 12,

        rect.y + 10,

        rect.width - 24

    );

    //------------------------------------------
    // Level
    //------------------------------------------

    this.contents.fontSize =
        SciFi.MenuUI.Font.HeaderSmall;

    this.changeTextColor(
        this.systemColor()
    );

    this.drawText(

        "Lv. " + actor.level,

        rect.x + 12,

        rect.y + 40,

        60

    );

    //------------------------------------------
    // Class
    //------------------------------------------

    this.changeTextColor(
        this.normalColor()
    );

    this.drawText(

        actor.currentClass().name,

        rect.x + 72,

        rect.y + 40,

        rect.width - 84

    );

    //------------------------------------------

    this.contents.fontSize =
        oldSize;

};

Window_MenuStatus.prototype.drawCardPortrait =
function(actor, rect) {

    var margin = 12;

    var x =
        rect.x + margin;

    var y =
        rect.y + 80;

    var w =
        rect.width - margin * 2;

    var h =
        rect.height - 220;

    //------------------------------------------
    // Portrait Background
    //------------------------------------------

    this.contents.fillRect(

        x,
        y,

        w,
        h,

        this.normalColor()

    );

    //------------------------------------------
    // Face Position
    //------------------------------------------

    var faceWidth =
        Window_Base._faceWidth;

    var faceHeight =
        Window_Base._faceHeight;

    var faceX =
        x + (w - faceWidth) / 2;

    var faceY =
        y + (h - faceHeight) / 2;

    this.drawActorFace(

        actor,

        faceX,

        faceY,

        faceWidth,

        faceHeight

    );

};

Window_MenuStatus.prototype.drawCardResources =
function(actor, rect) {

    var x = rect.x + 12;
    var y = rect.height + rect.y - 170;
    var width = rect.width - 24;

    this.drawResourceGauge(
        "Shield",
        actor.shield(),
        actor.maxShield(),
        x,
        y,
        width
    );

    y += 38;

    this.drawResourceGauge(
        "HP",
        actor.hp,
        actor.mhp,
        x,
        y,
        width
    );

    y += 38;

    this.drawResourceGauge(
        "Stamina",
        actor.mp,
        actor.mmp,
        x,
        y,
        width
    );

    y += 38;

    this.drawResourceGauge(
        "Momentum",
        actor.tp,
        actor.maxTp(),
        x,
        y,
        width
    );

};

Window_MenuStatus.prototype.drawResourceGauge =
function(type, value, max, x, y, width) {
	
	var oldSize =
		this.contents.fontSize;

	this.contents.fontSize =
		SciFi.MenuUI.Font.Resource;

    var gaugeHeight = 12;
    var rate = 0;

    if (max > 0) {
        rate = value / max;
    }

    //------------------------------------------
    // Label
    //------------------------------------------

    this.changeTextColor(
        this.systemColor()
    );

    this.drawText(
        type,
        x,
        y,
        width,
        "left"
    );

    //------------------------------------------
    // Value
    //------------------------------------------

    this.changeTextColor(
        this.normalColor()
    );

    this.drawText(
        value + " / " + max,
        x,
        y,
        width,
        "right"
    );

    //------------------------------------------
    // Gauge Background
    //------------------------------------------

    this.contents.fillRect(

        x,

        y + 30,

        width,

        gaugeHeight,

        this.gaugeBackColor()

    );

    //------------------------------------------
    // Gauge Fill
    //------------------------------------------

    this.contents.fillRect(

        x,

        y + 30,

        Math.floor(width * rate),

        gaugeHeight,

        SciFi.MenuUI.resourceColor(type)

    );

	this.contents.fontSize =
    oldSize;

};

SciFi.MenuUI.resourceColor =
function(type) {

    switch (type) {

    case "Shield":
        return "#00BFFF";

    case "HP":
        return "#E05050";

    case "Stamina":
        return "#4CD964";

    case "Momentum":
        return "#FFD040";

    }

    return "#FFC83D";

};

//=============================================================================
// Plugin Loaded
//=============================================================================

console.log("SciFi_MenuUI v0.8.0 Loaded");

})();