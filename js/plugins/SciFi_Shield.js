/*:
 * @plugindesc SciFi Shield System v0.3.0
 * @author Arya Setyaki Abdillah & OpenAI ChatGPT
 *
 * @help
 * ============================================================================
 * SciFi Shield System
 * ============================================================================
 *
 * Provides shield data management.
 *
 * This version DOES NOT affect battle.
 *
 * Requires:
 *   SciFi_Core
 *   SciFi_BattleCore
 *
 */

var Imported = Imported || {};
Imported.SciFi_Shield = true;

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
// Actor Setup
//=============================================================================

const _SciFi_Actor_setup = Game_Actor.prototype.setup;

Game_Actor.prototype.setup = function(actorId) {

    _SciFi_Actor_setup.call(this, actorId);

    const shield =
        SciFi.Shield.readShieldNotetag(this.actor());

    this._shield = shield;
    this._maxShield = shield;

};

//=============================================================================
// Enemy Setup
//=============================================================================

const _SciFi_Enemy_setup = Game_Enemy.prototype.setup;

Game_Enemy.prototype.setup = function(enemyId, x, y) {

    _SciFi_Enemy_setup.call(this, enemyId, x, y);

    const shield =
        SciFi.Shield.readShieldNotetag(this.enemy());

    this._shield = shield;
    this._maxShield = shield;

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
        SciFi.Utils.clamp(value, 0, this.maxShield());

};

Game_Battler.prototype.gainShield = function(value) {

    this.setShield(this.shield() + value);

};

//=============================================================================
// Battle Processing
//=============================================================================

SciFi.Shield.processDamage = function(context) {

    // Heal tidak diproses Shield
    if (context.damage <= 0) {
        return context;
    }

    const target = context.target;

    // Tidak punya shield
    if (target._shield <= 0) {
        return context;
    }

    const absorbed = Math.min(target._shield, context.damage);

    target._shield -= absorbed;

    context.shieldDamage = absorbed;

    context.damage -= absorbed;

    return context;

};

//=============================================================================

SciFi.log("Shield Loaded");
SciFi.log("Shield Version " + SciFi.Version);

})();