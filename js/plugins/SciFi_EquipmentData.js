/*:
 * @plugindesc SciFi Equipment Data v0.4.0
 * @author Arya & ChatGPT
 *
 * @help
 * Internal plugin.
 * Stores runtime equipment data for SciFi systems.
 */

var Imported = Imported || {};
Imported.SciFi_EquipmentData = true;

var SciFi = SciFi || {};
SciFi.EquipmentData = SciFi.EquipmentData || {};

SciFi.EquipmentData.initialize = function(battler) {

    if (battler._scifi) {
        return;
    }

    battler._scifi = {

        equipment: {

            primary: {},

            offhand: {},

            armor: {},

            shieldGenerator: {},

            accessory: {},

            frame: {}

        }

    };

};

Game_Actor.prototype.setup

const _Game_Actor_setup =
    Game_Actor.prototype.setup;

Game_Actor.prototype.setup = function(actorId) {

    _Game_Actor_setup.call(this, actorId);

    SciFi.EquipmentData.initialize(this);

};

Game_Enemy.prototype.setup

const _Game_Enemy_setup =
    Game_Enemy.prototype.setup;

Game_Enemy.prototype.setup = function(enemyId, x, y) {

    _Game_Enemy_setup.call(this, enemyId, x, y);

    SciFi.EquipmentData.initialize(this);

};

SciFi.EquipmentData.slots = function(battler) {

    return battler._scifi.equipment;

};

//=============================================================================
// Equipment Change
//=============================================================================

const _Game_Actor_changeEquip =
    Game_Actor.prototype.changeEquip;

Game_Actor.prototype.changeEquip = function(slotId, item) {

    _Game_Actor_changeEquip.call(
        this,
        slotId,
        item
    );

    SciFi.EquipmentData.refresh(this);

};

//=============================================================================
// Equipment Access
//=============================================================================

SciFi.EquipmentData.primary = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[0];

};

SciFi.EquipmentData.offhand = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[1];

};

SciFi.EquipmentData.armor = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[2];

};

SciFi.EquipmentData.shieldGenerator = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[3];

};

//=============================================================================
// Shield Data
//=============================================================================

/*
 * Returns maximum shield provided by Shield Generator.
 *
 * Notetag:
 * <Shield:100>
 */
SciFi.EquipmentData.maxShield = function(battler) {

    var shield =
        SciFi.EquipmentData.shieldGenerator(battler);

    if (!shield) {
        return 0;
    }

    return Number(
        shield.meta.Shield || 0
    );

};

SciFi.EquipmentData.accessory = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[4];

};

SciFi.EquipmentData.frame = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[5];

};

//=============================================================================
// Shield Element Rate Data
//=============================================================================

/*
 * Returns the Shield Element Rate.
 *
 * Notetag format:
 *
 * <ShieldElementRate:2,150>
 *
 * Returns:
 * 1.5  = 150%
 * 0.5  = 50%
 * 1.0  = Default
 */
SciFi.EquipmentData.shieldElementRate = function(target, elementId) {

    //------------------------------------------------------------
    // Shield Data Source
    //------------------------------------------------------------

    var source = null;

    if (target.isActor()) {

        source = SciFi.EquipmentData.shieldGenerator(target);

    } else {

        source = target.enemy();

    }

    if (!source) {
        return 1.0;
    }

    var regex =
        /<ShieldElementRate\s*:\s*(\d+)\s*,\s*(\d+)\s*>/gi;

    var match;

    while ((match = regex.exec(source.note)) !== null) {

        if (Number(match[1]) === elementId) {

            return Number(match[2]) / 100;

        }

    }

    return 1.0;

};

/*
 * Debug
 */
SciFi.EquipmentData.debugShieldElementRate =
function(target, elementId) {

    var rate =
        SciFi.EquipmentData.shieldElementRate(
            target,
            elementId
        );

    SciFi.log(
        "Shield Element Rate" +
        " | Element: " + elementId +
        " | Rate: " + rate
    );

    return rate;

};

//=============================================================================
// Equipment Refresh
//=============================================================================

/*
 * Refreshs cached equipment-dependent values.
 */
SciFi.EquipmentData.refresh = function(battler) {

    //------------------------------------------------------------
    // Shield
    //------------------------------------------------------------

    if (Imported.SciFi_Shield) {

        var oldMax =
            battler._maxShield || 0;

        var newMax =
            SciFi.EquipmentData.maxShield(
                battler
            );

        battler._maxShield = newMax;

        //--------------------------------------------------------
        // Clamp current shield
        //--------------------------------------------------------

        battler.setShield(
            Math.min(
                battler.shield(),
                newMax
            )
        );

        SciFi.log(
            "Equipment Refresh"
            + " | Shield "
            + oldMax
            + " -> "
            + newMax
        );

    }

};

//=============================================================================

SciFi.log("EquipmentData Loaded");
SciFi.log("EquipmentData v0.4.0");
