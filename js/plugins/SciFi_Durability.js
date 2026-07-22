/*:
 * @plugindesc SciFi Durability System v0.4.1
 * @author
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

    // Musuh tetap pakai durability langsung di battler, seperti
    // sebelumnya, karena musuh tidak punya equipment instance.
    if (this.isEnemy() && !this._scifi.durability) {
        this._scifi.durability = {};
    }

    this.refreshSciFiDurability();

};

//=============================================================================
// Refresh
//=============================================================================

/*
 * Untuk aktor: memastikan instance armor yang sedang terpasang
 * punya data durability (dibuat sekali saat instance baru lahir).
 * Dipanggil sebagai extraDataFn saat syncSlotInstance/syncAllSlots
 * membuat instance baru, supaya durability.max langsung terisi
 * dari notetag armor sejak awal.
 */
SciFi.Durability.buildInstanceExtraData = function(item) {

    var max = SciFi.Durability.maxDurability(item);

    return {

        durability: {

            current: max,

            max: max

        }

    };

};

Game_Battler.prototype.refreshSciFiDurability = function() {

    if (this.isActor()) {

        SciFi.EquipmentData.initialize(this);

        // Aktor: cuma sentuh slot armor (index 2), supaya gak
        // numpuk sama slot lain yang jadi tanggung jawab plugin
        // lain (misal slot 3 = shield generator, ditangani Shield).
        SciFi.EquipmentData.syncSlotInstance(

            this,

            2,

            SciFi.Durability.buildInstanceExtraData

        );

        return;

    }

    // Musuh: tetap seperti sebelumnya, baca notetag dari enemy().
    var armor = this.enemy();

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

/*
 * Mengembalikan instance armor yang sedang terpasang di slot armor
 * aktor (slot index 2, sesuai SciFi.EquipmentData.armor()), atau
 * null kalau tidak ada / target bukan aktor.
 */
SciFi.Durability.actorArmorInstance = function(target) {

    if (!target.isActor()) {
        return null;
    }

    // Slot armor = index 2, sesuai SciFi.EquipmentData.armor()
    return SciFi.EquipmentData.instanceForSlot(target, 2);

};

SciFi.Durability.current = function(target) {

    if (target.isActor()) {

        var instance = SciFi.Durability.actorArmorInstance(target);

        if (!instance || !instance.durability) {
            return 0;
        }

        return instance.durability.current;

    }

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

    if (target.isActor()) {

        var instance = SciFi.Durability.actorArmorInstance(target);

        if (!instance || !instance.durability) {
            return 0;
        }

        return instance.durability.max;

    }

    return target._scifi.durability.max;

};

SciFi.Durability.setCurrent = function(target, value) {

    var max = SciFi.Durability.max(target);

    var clamped = SciFi.Utils.clamp(value, 0, max);

    if (target.isActor()) {

        var instance = SciFi.Durability.actorArmorInstance(target);

        if (!instance) {
            return;
        }

        if (!instance.durability) {
            instance.durability = { current: max, max: max };
        }

        instance.durability.current = clamped;

        return;

    }

    target._scifi.durability.current = clamped;

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
// Register as Instance Provider
//=============================================================================

SciFi.EquipmentData.registerInstanceProvider(

    function(item) {
        return DataManager.isArmor(item) && SciFi.Durability.maxDurability(item) > 0;
    },

    SciFi.Durability.buildInstanceExtraData

);

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("Durability v0.4.1 Loaded");

})();