/*:
 * @plugindesc SciFi Armor System v0.1.0
 * @author Arya & ChatGPT
 *
 * @help
 * ============================================================================
 * SciFi Armor
 * ============================================================================
 *
 * Provides the armor layer for the SciFi combat engine.
 *
 * Current Features:
 * - Armor API
 * - Armor processing pipeline
 *
 * Future Features:
 * - Durability scaling
 * - Armor Piercing
 * - Element modifiers
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_BattleCore
 */

var Imported = Imported || {};
Imported.SciFi_Armor = true;

var SciFi = SciFi || {};
SciFi.Armor = SciFi.Armor || {};

(function() {

"use strict";

//=============================================================================
// Armor API
//=============================================================================

/*
 * Returns the current effective armor value.
 * (Temporary: returns database DEF directly)
 */
SciFi.Armor.value = function(target) {

    return target.def;

};

//=============================================================================
// Battle Processing
//=============================================================================

/*
 * Armor processing.
 * v0.1.0 does not modify damage yet.
 */
SciFi.Armor.processDamage = function(context) {

    SciFi.log("Armor processing");

    SciFi.log(
        "Armor Value : " +
        SciFi.Armor.value(context.target)
    );

    return context;

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("Armor v0.1.0 Loaded");

})();