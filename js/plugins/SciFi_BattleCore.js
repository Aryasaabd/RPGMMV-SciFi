/*:
 * @plugindesc SciFi Battle Core v0.3.1
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
 *   0.3.1
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

SciFi.Version = "0.3.0";

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

    originalDamage: damage,

    damage: damage,

    shieldDamage: 0,
	
	shieldElementRate: 1.0,

    armorReduction: 0,

    hpDamage: 0,

    cancelled: false

	};
	
	//------------------------------------------------------------
	// Damage Data
	//------------------------------------------------------------

	if (Imported.SciFi_DamageData) {

		SciFi.log("Entering DamageData");

        SciFi.DamageData.build(context);

        SciFi.log("Leaving DamageData");

	}

    return context;

};

//=============================================================================
// HP Damage Pipeline
//=============================================================================

SciFi.Battle.processHpDamage = function(context) {

    //--------------------------------------------------------------------------
    // Shield Layer
    //--------------------------------------------------------------------------

    if (Imported.SciFi_Shield) {
        context = SciFi.Shield.processDamage(context);
		SciFi.log("Shield -> Armor");
    }

    //--------------------------------------------------------------------------
    // Armor Layer
    //--------------------------------------------------------------------------

    if (Imported.SciFi_Armor) {
        context = SciFi.Armor.processDamage(context);
		SciFi.log("Armor -> HP");
    }

    //--------------------------------------------------------------------------
    // Drain
    //--------------------------------------------------------------------------

    if (context.action.isDrain()) {
        context.damage = Math.min(
            context.target.hp,
            context.damage
        );
    }

    context.action.makeSuccess(context.target);

    //------------------------------------------------------------
	// Final Damage
	//------------------------------------------------------------

	context.damage = Math.round(context.damage);

	context.hpDamage = context.damage;

	context.target.gainHp(-context.damage);

    if (context.damage > 0) {
        context.target.onDamage(context.damage);
    }

    context.action.gainDrainedHp(context.damage);

    SciFi.log(context);

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