/*:
 * @plugindesc SciFi Durability System v0.4.1
 * @author Arya & ChatGPT
 *
 * @help
 * ============================================================================
 * SciFi Durability
 * ============================================================================
 *
 * Stores runtime armor durability.
 *
 * Current Features:
 * - Runtime durability storage
 *
 * Future Features:
 * - Armor scaling
 * - Armor Piercing
 * - Repair system
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_EquipmentData
 */

var Imported = Imported || {};
Imported.SciFi_Durability = true;

var SciFi = SciFi || {};
SciFi.Durability = SciFi.Durability || {};

(function() {

"use strict";

//=============================================================================
// Notetag
//=============================================================================

SciFi.Durability.maxDurability = function(item) {

    if (!item) return 0;

    return Number(item.meta.Durability || 0);

};

//=============================================================================
// Initialization
//=============================================================================

const _Game_Actor_setup = Game_Actor.prototype.setup;
Game_Actor.prototype.setup = function(actorId) {

    _Game_Actor_setup.call(this, actorId);

    this.initSciFiDurability();

};

const _Game_Enemy_setup = Game_Enemy.prototype.setup;
Game_Enemy.prototype.setup = function(enemyId, x, y) {

    _Game_Enemy_setup.call(this, enemyId, x, y);

    this.initSciFiDurability();

};

Game_Battler.prototype.initSciFiDurability = function() {

    if (!this._scifi) {
        this._scifi = {};
    }

    if (!this._scifi.durability) {
        this._scifi.durability = {};
    }

    this.refreshSciFiDurability();

};

//=============================================================================
// Refresh
//=============================================================================

Game_Battler.prototype.refreshSciFiDurability = function() {

    var armor = null;

    if (this.isActor()) {

        armor =
            SciFi.EquipmentData.armor(this);

    } else {

        armor =
            this.enemy();

    }

    var max =
        SciFi.Durability.maxDurability(armor);

    var current =
        this._scifi.durability.current;

    if (current == null) {

        current = max;

    }

    this._scifi.durability.max = max;

    SciFi.Durability.setCurrent(

        this,

        current

    );

};

//=============================================================================
// API
//=============================================================================

SciFi.Durability.current = function(target) {

    return target._scifi.durability.current;

};

SciFi.Durability.ratio = function(target) {

    var max = SciFi.Durability.max(target);

    if (max <= 0) {
        return 0;
    }

    return SciFi.Durability.current(target) / max;

};

SciFi.Durability.max = function(target) {

    return target._scifi.durability.max;

};

SciFi.Durability.setCurrent = function(target, value) {

    var oldValue =
        target._scifi.durability.current;

    target._scifi.durability.current =
        SciFi.Utils.clamp(
            value,
            0,
            SciFi.Durability.max(target)
        );
};

//=============================================================================
// Durability Modification
//=============================================================================

/*
 * Damages armor durability.
 */
SciFi.Durability.damage = function(target, amount) {

    if (amount <= 0) {
        return;
    }

    SciFi.Durability.setCurrent(

        target,

        SciFi.Durability.current(target)
        - amount

    );

};

/*
 * Repairs armor durability.
 */
SciFi.Durability.repair = function(target, amount) {

    if (amount <= 0) {
        return;
    }

    SciFi.Durability.setCurrent(

        target,

        SciFi.Durability.current(target)
        + amount
	 );	
};

//=============================================================================
// Menu Usability
//=============================================================================

const _SciFi_Durability_testApply =
    Game_Action.prototype.testApply;

Game_Action.prototype.testApply = function(target) {

    if (_SciFi_Durability_testApply.call(
        this,
        target
    )) {

        return true;

    }

    var amount =
        SciFi.Durability.repairValue(
            this.item()
        );

    if (amount <= 0) {
        return false;
    }

    var armor =
        SciFi.EquipmentData.armor(target);

    if (!armor) {
        return false;
    }

    return (
		SciFi.Durability.current(target)
		<
		SciFi.Durability.max(target)
	);
};

const _SciFi_Durability_apply =
    Game_Action.prototype.apply;

Game_Action.prototype.apply = function(target) {

    _SciFi_Durability_apply.call(
        this,
        target
    );

    var amount =
        SciFi.Durability.repairValue(
            this.item()
        );

    if (amount <= 0) {
        return;
    }

    SciFi.Durability.repair(
        target,
        amount
    );

};

SciFi.Durability.repairValue = function(item) {

    if (!item) {
        return 0;
    }

    return Number(
        item.meta.ArmorRepair || 0
    );

};

//=============================================================================
// Plugin Command
//=============================================================================

const _SciFi_Durability_pluginCommand =
    Game_Interpreter.prototype.pluginCommand;

Game_Interpreter.prototype.pluginCommand = function(command, args) {

    _SciFi_Durability_pluginCommand.call(
        this,
        command,
        args
    );

    if (command === "ArmorDurability") {

        var actor =
            $gameParty.leader();

        if (!actor) {
            return;
        }

        $gameMessage.add(

            "Armor Durability: "

            + SciFi.Durability.current(actor)

            + " / "

            + SciFi.Durability.max(actor)

        );

    }

};

//=============================================================================

SciFi.Durability.refreshEquipment = function(battler) {

    battler.refreshSciFiDurability();

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("Durability v0.4.1 Loaded");

})();