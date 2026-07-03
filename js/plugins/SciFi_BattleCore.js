/*:
 * @plugindesc SciFi Battle Core v0.4.0
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
 *   0.4.0
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
// Critical Capture
//=============================================================================

Game_Action.prototype.makeDamageValue = function(target, critical) {

    this._scifiCritical = critical;

    var item = this.item();

    var baseValue =
        this.evalDamageFormula(target);

    var value =
        baseValue * this.calcElementRate(target);

    if (this.isPhysical()) {
        value *= target.pdr;
    }

    if (this.isMagical()) {
        value *= target.mdr;
    }

    if (baseValue < 0) {
        value *= target.rec;
    }

    // ---------------------------------------------------------
    // Critical dipindahkan ke BattleCore
    // ---------------------------------------------------------

    value =
        this.applyVariance(
            value,
            item.damage.variance
        );

    value =
        this.applyGuard(
            value,
            target
        );

    value =
        Math.round(value);

    return value;

};

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
	
	critical: action._scifiCritical || false,

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
	
	SciFi.log(
		"Critical: " +
		context.critical
	);

    //--------------------------------------------------------------------------
    // Shield Layer
    //--------------------------------------------------------------------------

    if (Imported.SciFi_Shield) {
        context = SciFi.Shield.processDamage(context);
		SciFi.log("Shield -> Armor");
    }
	
	//------------------------------------------------------------
	// Critical
	//------------------------------------------------------------

	if (context.critical && context.damage > 0) {

		context.damage =
			context.action.applyCritical(
				context.damage
			);

		SciFi.log(
			"Critical | HP Damage: " +
			context.damage
		);

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