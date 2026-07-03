/*:
 * @plugindesc SciFi Shield System v0.8.2
 * @author Arya & ChatGPT
 *
 * @param Shielded State ID
 * @type state
 * @default 0
 * @desc State otomatis ketika Shield > 0.
 *
 * @help
 * ============================================================================
 * SciFi Shield System
 * ============================================================================
 *
 * Handles:
 * - Shield HP
 * - Shield Element Rate
 * - Automatic Shielded State
 *
 * Shielded State is automatically added while Shield > 0,
 * and removed when Shield reaches 0.
 *
 * Never add or remove Shielded manually.
 */

var Imported = Imported || {};
Imported.SciFi_Shield = true;

var SciFi = SciFi || {};
SciFi.Shield = SciFi.Shield || {};

(function() {

"use strict";

//=============================================================================
// Plugin Parameters
//=============================================================================

var parameters = PluginManager.parameters("SciFi_Shield");

SciFi.Shield.SHIELDED_STATE_ID =
    Number(parameters["Shielded State ID"] || 0);

//=============================================================================
// Version
//=============================================================================

SciFi.Version = "0.8.2";


//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_Shield requires SciFi_Core.");
}

if (!Imported.SciFi_BattleCore) {
    throw new Error("SciFi_Shield requires SciFi_BattleCore.");
}

//=============================================================================
// Namespace
//=============================================================================

SciFi.Shield = SciFi.Shield || {};

//=============================================================================
// Utility
//=============================================================================

SciFi.Shield.readShieldNotetag = function(databaseObject) {

    if (!databaseObject || !databaseObject.note) {
        return 0;
    }

    var match = databaseObject.note.match(/<Shield\s*:\s*(\d+)>/i);

    return match ? Number(match[1]) : 0;

};

//=============================================================================
// Menu Usability
//=============================================================================

const _SciFi_Shield_testApply =
    Game_Action.prototype.testApply;

Game_Action.prototype.testApply = function(target) {

    // Biarkan RPG Maker mengecek efek normal terlebih dahulu
    if (_SciFi_Shield_testApply.call(this, target)) {
        return true;
    }

    // Cek efek Shield Recover
    var amount =
        SciFi.Shield.recoverValue(this.item());

    if (amount <= 0) {
        return false;
    }

    // Bisa dipakai jika Shield belum penuh
    return target.shield() < target.maxShield();

};

//=============================================================================
// Shield Recovery
//=============================================================================

/*
 * Reads ShieldRecover notetag.
 *
 * Example:
 * <ShieldRecover:50>
 */
SciFi.Shield.recoverValue = function(item) {

    if (!item) {
        return 0;
    }

    return Number(
        item.meta.ShieldRecover || 0
    );

};

//=============================================================================
// Actor Setup
//=============================================================================

const _SciFi_Actor_setup = Game_Actor.prototype.setup;

Game_Actor.prototype.setup = function(actorId) {

    _SciFi_Actor_setup.call(this, actorId);

    const shield =
		SciFi.EquipmentData.maxShield(this);

	this._shield = shield;
	this._maxShield = shield;

	SciFi.Shield.refreshShieldState(this);

};

//=============================================================================
// Enemy Setup
//=============================================================================

const _SciFi_Enemy_setup = Game_Enemy.prototype.setup;

Game_Enemy.prototype.setup = function(enemyId, x, y) {

    _SciFi_Enemy_setup.call(this, enemyId, x, y);

    const shield =
		SciFi.Shield.readShieldNotetag(this.enemy());

	this._maxShield = shield;
	this.setShield(shield);

};

//=============================================================================
// Battler API
//=============================================================================

Game_Battler.prototype.shield = function() {
    return this._shield || 0;
};

Game_Battler.prototype.maxShield = function() {
    return this._maxShield || 0;
};

Game_Battler.prototype.setShield = function(value) {

    this._shield =
        SciFi.Utils.clamp(
            value,
            0,
            this.maxShield()
        );

    SciFi.Shield.refreshShieldState(this);

};

Game_Battler.prototype.gainShield = function(value) {

    this.setShield(this.shield() + value);

};

//=============================================================================
// Shield Recovery Processing
//=============================================================================

const _SciFi_Game_Action_apply =
    Game_Action.prototype.apply;

Game_Action.prototype.apply = function(target) {

    _SciFi_Game_Action_apply.call(
        this,
        target
    );

    var amount =
        SciFi.Shield.recoverValue(
            this.item()
        );

    if (amount <= 0) {
        return;
    }

    target.gainShield(amount);

    SciFi.log(
        "Shield Recover"
        + " | Target: "
        + target.name()
        + " | +" + amount
        + " | Current: "
        + target.shield()
        + "/" + target.maxShield()
    );

};

//=============================================================================
// Shield State
//=============================================================================

/*
 * Updates automatic Shielded state.
 *
 * Rules:
 * - Shield > 0  : Add Shielded
 * - Shield <= 0 : Remove Shielded
 */
SciFi.Shield.refreshShieldState = function(target) {

    var stateId = SciFi.Shield.SHIELDED_STATE_ID;

    if (stateId <= 0) {
        return;
    }

    if (target.shield() > 0) {

        if (!target.isStateAffected(stateId)) {

            target.addState(stateId);

            SciFi.log(
                target.name() +
                " gained Shielded."
            );

        }

    } else {

        if (target.isStateAffected(stateId)) {

            target.removeState(stateId);

            SciFi.log(
                target.name() +
                " lost Shielded."
            );

        }

    }

};

//=============================================================================
// Battle Processing
//=============================================================================

SciFi.Shield.processDamage = function(context) {
	
	SciFi.log(
		"Before Shield | Damage: " + context.damage +
		" | Target: " + context.target.name()
	);

    // Heal tidak diproses Shield
    if (context.damage <= 0) {
        return context;
    }

    const target = context.target;
	
	//------------------------------------------------------------
	// Shield Element
	//------------------------------------------------------------

	var rate = 1.0;

	if (
		Imported.SciFi_DamageData &&
		context.damageData
	) {

		rate = SciFi.EquipmentData.shieldElementRate(
			target,
			context.damageData.elementId
		);

	}

	context.shieldElementRate = rate;
	
	SciFi.log(
		"Shield Element"
		+ " | Element: "
		+ context.damageData.elementId
		+ " | Rate: "
		+ rate
	);

    // Tidak punya shield
	if (target.shield() <= 0) {
		return context;
	}

    //------------------------------------------------------------
	// Shield Element Processing
	//------------------------------------------------------------

	var shield = target.shield();
	var rate = context.shieldElementRate;

	// Damage efektif terhadap Shield
	var effectiveDamage =
		context.damage * rate;

	// Shield tidak habis
	if (effectiveDamage < shield) {

		target.gainShield(-effectiveDamage);

		context.shieldDamage = effectiveDamage;

		context.damage = 0;

	}
	// Shield habis
	else {

		// Damage asli yang dibutuhkan
		var requiredDamage =
			shield / rate;

		target.setShield(0);

		context.shieldDamage = shield;

		context.damage =
			Math.max(
				0,
				context.damage - requiredDamage
			);

	}

	SciFi.log(
    "Shield"
    + " | Effective: " + effectiveDamage
    + " | Required: " + (shield / rate)
    + " | Remaining Damage: " + context.damage
);

    return context;

};

//=============================================================================

SciFi.log("Shield Loaded");
SciFi.log("Shield Version " + SciFi.Version);

})();