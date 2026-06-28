/*:
 * @plugindesc SciFi Equipment Data v0.2.0
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
// Equipment Access
//=============================================================================

SciFi.EquipmentData.primary = function(battler) {

    return battler.equips()[0];

};

SciFi.EquipmentData.offhand = function(battler) {

    return battler.equips()[1];

};

SciFi.EquipmentData.armor = function(battler) {

    return battler.equips()[2];

};

SciFi.EquipmentData.shieldGenerator = function(battler) {

    return battler.equips()[3];

};

SciFi.EquipmentData.accessory = function(battler) {

    return battler.equips()[4];

};

SciFi.EquipmentData.frame = function(battler) {

    return battler.equips()[5];

};

//=============================================================================

SciFi.log("EquipmentData Loaded");
SciFi.log("EquipmentData v0.2.0");
