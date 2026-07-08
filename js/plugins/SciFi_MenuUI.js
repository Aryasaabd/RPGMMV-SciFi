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
// Card
//=============================================================================

SciFi.MenuUI.Card = {

    BackgroundColor : "rgba(15,20,30,0.45)",

    BorderColor : "#5FD6FF",

    BorderWidth : 5

};

//=============================================================================
// Gradient
//=============================================================================

SciFi.MenuUI.Gradient = {

    Height : 180,

    StartAlpha : 0.85,

    EndAlpha : 0.00

};

//=============================================================================
// Card Background
//=============================================================================

Window_MenuStatus.prototype.drawCardBackground =
function(rect) {

    var pad = 1;

    this.contents.fillRect(

        rect.x + pad,

        rect.y + pad,

        rect.width - pad * 2,

        rect.height - pad * 2,

        SciFi.MenuUI.Card.BackgroundColor

    );

};

//=============================================================================
// Card Border
//=============================================================================

Window_MenuStatus.prototype.drawCardBorder =
function(rect) {

    var w = SciFi.MenuUI.Card.BorderWidth;

    var c = SciFi.MenuUI.Card.BorderColor;

    var pad = 1;

    // Top
    this.contents.fillRect(
        rect.x + pad,
        rect.y + pad,
        rect.width - pad * 2,
        w,
        c
    );

    // Bottom
    this.contents.fillRect(
        rect.x + pad,
        rect.y + rect.height - w - pad,
        rect.width - pad * 2,
        w,
        c
    );

    // Left
    this.contents.fillRect(
        rect.x + pad,
        rect.y + pad,
        w,
        rect.height - pad * 2,
        c
    );

    // Right
    this.contents.fillRect(
        rect.x + rect.width - w - pad,
        rect.y + pad,
        w,
        rect.height - pad * 2,
        c
    );

};

//=============================================================================
// Card Gradient
//=============================================================================

Window_MenuStatus.prototype.drawCardGradient =
function(rect) {

    var h =
        SciFi.MenuUI.Gradient.Height;

    for (var i = 0; i < h; i++) {

        var rate =
            i / h;

        var alpha =
            SciFi.MenuUI.Gradient.StartAlpha *
            rate;

        this.contents.fillRect(

            rect.x,

            rect.y +
            rect.height -
            h +
            i,

            rect.width,

            1,

            "rgba(0,0,0," + alpha + ")"

        );

    }

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

Window_MenuStatus.prototype.drawItemBackground =
function(index) {

    var rect =
        this.itemRect(index);

    this.drawCardBackground(rect);

    this.drawCardGradient(rect);

    this.drawCardBorder(rect);

    //------------------------------------------
    // Selection
    //------------------------------------------

    if (index === this.index()) {

        this.changePaintOpacity(false);

        this.contents.fillRect(

            rect.x,

            rect.y,

            rect.width,

            rect.height,

            "rgba(255,255,255,0.08)"

        );

        this.changePaintOpacity(true);

    }

    //------------------------------------------
    // Pending Formation
    //------------------------------------------

    if (index === this._pendingIndex) {

        this.contents.fillRect(

            rect.x,

            rect.y,

            rect.width,

            rect.height,

            "rgba(80,220,255,0.18)"

        );

    }

};

//=============================================================================
// Draw Item
//=============================================================================

Window_MenuStatus.prototype.drawItem =
function(index) {

    var actor =
        $gameParty.members()[index];

    if (!actor) {

        return;

    }

    var rect =
        this.itemRect(index);

    //------------------------------------------
    // Background
    //------------------------------------------

    this.drawItemBackground(index);

    //------------------------------------------
    // Card
    //------------------------------------------

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
        "Hitpoints",
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

this.drawSegmentGauge(

    type,

    value,

    max,

    x,

    y + 30,

    width

);

	this.contents.fontSize =
    oldSize;

};

//=============================================================================
// Resource Colors
//=============================================================================

SciFi.MenuUI.resourceFillColor = function(type) {

    switch (type) {

    case "Shield":
        return "#00C8FF";

    case "Hitpoints":
        return "#E05050";

    case "Stamina":
        return "#4CD964";

    case "Momentum":
        return "#FFC83D";

    }

    return "#FFFFFF";

};

SciFi.MenuUI.resourceBackColor = function(type) {

    switch (type) {

    case "Shield":
        return "#0B4A60";

    case "Hitpoints":
        return "#5A1F1F";

    case "Stamina":
        return "#1D4B22";

    case "Momentum":
        return "#5A4A16";

    }

    return "#444444";

};

//=============================================================================
// Gauge
//=============================================================================

SciFi.MenuUI.Gauge = {

    SegmentValue: 20,

    SegmentGap: 2,

    Height: 12

};

//=============================================================================
// Segmented Gauge
//=============================================================================

Window_MenuStatus.prototype.drawSegmentGauge =
function(type, value, max, x, y, width) {

    //------------------------------------------
    // Config
    //------------------------------------------

    var segmentValue =
        SciFi.MenuUI.Gauge.SegmentValue;

    var gap =
        SciFi.MenuUI.Gauge.SegmentGap;

    var height =
        SciFi.MenuUI.Gauge.Height;

    //------------------------------------------
    // Safety
    //------------------------------------------

    if (max <= 0) {

        return;

    }

    //------------------------------------------
    // Segment Count
    //------------------------------------------

    var segmentCount =
        Math.ceil(
            max / segmentValue
        );

    //------------------------------------------
    // Unit Count
    //------------------------------------------

    var lastCapacity =
        max % segmentValue;

    if (lastCapacity === 0) {

        lastCapacity = segmentValue;

    }

    var totalUnits =
        (segmentCount - 1)
        +
        (lastCapacity / segmentValue);

    var totalGap =
        (segmentCount - 1) * gap;

    var unitWidth =
        (width - totalGap)
        / totalUnits;

    //------------------------------------------
    // Draw Segments
    //------------------------------------------

    var currentX = x;

    for (var i = 0; i < segmentCount; i++) {

        //--------------------------------------
        // Segment Range
        //--------------------------------------

        var start =
            i * segmentValue;

        var end =
            Math.min(
                max,
                start + segmentValue
            );

        var capacity =
            end - start;
        
        var currentWidth =
            unitWidth *
            (capacity / segmentValue);

        //--------------------------------------
        // Current Fill
        //--------------------------------------

        var current =
            Math.max(
                0,
                Math.min(
                    value - start,
                    capacity
                )
            );

        var rate =
            current / capacity;

        //--------------------------------------
        // Background
        //--------------------------------------

        this.contents.fillRect(

            currentX,

            y,

            currentWidth,

            height,

            SciFi.MenuUI.resourceBackColor(type)

        );

        //--------------------------------------
        // Fill
        //--------------------------------------

        if (rate > 0) {

            this.contents.fillRect(

                currentX,

                y,

                currentWidth * rate,

                height,

                SciFi.MenuUI.resourceFillColor(type)

            );

            //----------------------------------
            // Highlight
            //----------------------------------

            this.contents.fillRect(

                currentX,

                y,

                currentWidth * rate - 1,

                2,

                "rgba(255,255,255,0.40)"

            );

        }

        currentX += currentWidth + gap;

    }

};

//=============================================================================
// Plugin Loaded
//=============================================================================

console.log("SciFi_MenuUI v0.11.0 Loaded");

})();