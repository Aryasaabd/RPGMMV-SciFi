/*:
 * @plugindesc SciFi Armor Piercing System v0.1.1
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Armor Piercing
 * ============================================================================
 *
 * Handles armor durability damage from attacks.
 *
 * Current Features:
 * - Reads ArmorPiercing notetag
 * - Damages armor durability
 *
 * Future Features:
 * - AP multipliers
 * - Armor breaking effects
 * - Element interaction
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_Durability
 */

var Imported = Imported || {};
Imported.SciFi_ArmorPiercing = true;

var SciFi = SciFi || {};
SciFi.ArmorPiercing = SciFi.ArmorPiercing || {};

(function() {

"use strict";

//=============================================================================
// Notetag
//=============================================================================

/*
 * Reads Armor Piercing value from a skill or item.
 *
 * Example:
 * <ArmorPiercing:15>
 */
SciFi.ArmorPiercing.value = function(action) {

    var item = action.item();

    if (!item) {
        return 0;
    }

    return Number(item.meta.ArmorPiercing || 0);

};

//=============================================================================
// Durability Damage
//=============================================================================

/*
 * Reduces current armor durability.
 */
SciFi.ArmorPiercing.apply = function(target, amount) {

    if (amount <= 0) {
        return;
    }

    SciFi.Durability.damage(target, amount);

    //-------------------------------------------------------------------------
    // Debug Log
    //-------------------------------------------------------------------------
    SciFi.log(
        "Armor Piercing: -" +
        amount +
        " | Durability: " +
        target._scifi.durability.current +
        "/" +
        target._scifi.durability.max
    );

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("Armor Piercing v0.1.1 Loaded");

})();