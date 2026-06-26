/*:
 * @plugindesc SciFi Battle Core v0.2.0
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
 *   0.2.0
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
// Version
//=============================================================================

SciFi.Version = "0.2.0";

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
// Battle Context
//=============================================================================

SciFi.Battle.createContext = function(action, target, damage) {

    const context = {

        action: action,

        subject: action.subject(),

        target: target,

        damage: damage

    };

    return context;

};

//=============================================================================
// HP Damage Pipeline
//=============================================================================

SciFi.Battle.processHpDamage = function(context) {

    if (context.action.isDrain()) {
        context.damage = Math.min(
            context.target.hp,
            context.damage
        );
    }

    context.action.makeSuccess(context.target);

    context.target.gainHp(-context.damage);

    if (context.damage > 0) {
        context.target.onDamage(context.damage);
    }

    context.action.gainDrainedHp(context.damage);

};

//=============================================================================
// Redirect RPG Maker HP Damage
//=============================================================================

Game_Action.prototype.executeHpDamage = function(target, value) {

    const context =
        SciFi.Battle.createContext(
            this,
            target,
            value
        );

    SciFi.Battle.processHpDamage(context);

};

SciFi.log("BattleCore Loaded");
SciFi.log("BattleCore Version " + SciFi.Version);

})();