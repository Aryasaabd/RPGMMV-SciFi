/*:
 * @plugindesc SciFi Battle Core v0.1.0
 * @author Arya Setyaki Abdillah & OpenAI ChatGPT
 *
 * @help
 * ============================================================================
 * SciFi Battle Core
 * ============================================================================
 *
 * This plugin redirects HP damage processing through SciFi Battle Core.
 *
 * Version:
 *   0.1.0
 *
 * Requires:
 *   SciFi_Core
 *
 */

var Imported = Imported || {};
Imported.SciFi_BattleCore = true;

var SciFi = SciFi || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_BattleCore requires SciFi_Core.");
}

//=============================================================================
// Namespace
//=============================================================================

SciFi.Battle = SciFi.Battle || {};

//=============================================================================
// HP Damage Pipeline
//=============================================================================

SciFi.Battle.processHpDamage = function(action, target, value) {

    // Drain
    if (action.isDrain()) {
        value = Math.min(target.hp, value);
    }

    action.makeSuccess(target);

    target.gainHp(-value);

    if (value > 0) {
        target.onDamage(value);
    }

    action.gainDrainedHp(value);

};

//=============================================================================
// Redirect RPG Maker HP Damage
//=============================================================================

Game_Action.prototype.executeHpDamage = function(target, value) {

    SciFi.Battle.processHpDamage(this, target, value);

};

SciFi.log("BattleCore Loaded");
SciFi.log("BattleCore Version 0.1.0");

})();