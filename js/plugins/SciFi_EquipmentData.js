/*:
 * @plugindesc SciFi Equipment Data v0.1.0
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

SciFi.log("EquipmentData Loaded");
SciFi.log("EquipmentData v0.1.0");
