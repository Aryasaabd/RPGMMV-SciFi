/*:
 * @plugindesc SciFi Durability System v0.2.0
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

        armor = SciFi.EquipmentData.armor(this);

    } else {

        armor = this.enemy();

    }

    var max = SciFi.Durability.maxDurability(armor);

    this._scifi.durability.current = max;
    this._scifi.durability.max = max;

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

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("Durability v0.2.0 Loaded");

})();