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

    return 20;

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

    this.changeTextColor(
        this.normalColor()
    );

    this.drawText(

        actor.name(),

        rect.x + 12,

        rect.y + 12,

        rect.width - 24

    );

    this.drawText(

        "Lv " + actor.level,

        rect.x + 12,

        rect.y + 40,

        rect.width - 24

    );

};

Window_MenuStatus.prototype.drawCardPortrait =
function(actor, rect) {

    var y =
        rect.y + 80;

    var h =
        rect.height - 220;

    this.drawText(

        "PORTRAIT",

        rect.x,

        y + h / 2 - 18,

        rect.width,

        "center"

    );

};

Window_MenuStatus.prototype.drawCardResources =
function(actor, rect) {

};

//=============================================================================
// Plugin Loaded
//=============================================================================

console.log("SciFi_MenuUI v0.4.1 Loaded");

})();