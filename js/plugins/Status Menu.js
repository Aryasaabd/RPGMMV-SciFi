/*:
 * @plugindesc SciFi Stats
 * @author Arya
 */

(function() {

//================================================
// Rename Parameter
//================================================

TextManager.param = function(paramId) {
    switch(paramId) {

        case 0: return "HP";
        case 1: return "STA";

        case 2: return "DMG";
        case 3: return "ARM";

        case 4: return "MAT";
        case 5: return "MDF";

        case 6: return "AGI";
        case 7: return "LUK";

        default:
            return "";
    }
};

//================================================
// Status Menu
//================================================

Window_Status.prototype.drawParameters = function(x, y) {

    var params = [
        2, // DMG
        3, // ARM
        6, // AGI
        7  // LUK
    ];

    for (var i = 0; i < params.length; i++) {

        var paramId = params[i];

        this.changeTextColor(this.systemColor());

        this.drawText(
            TextManager.param(paramId),
            x,
            y + i * this.lineHeight(),
            160
        );

        this.resetTextColor();

        this.drawText(
            this._actor.param(paramId),
            x + 160,
            y + i * this.lineHeight(),
            60,
            'right'
        );
    }
};

})();