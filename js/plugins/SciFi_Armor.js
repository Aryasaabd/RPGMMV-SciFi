/*:
 * @plugindesc SciFi Armor System v0.2.0
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

    return Math.max(0, target.def - 1);

};

//=============================================================================
// Battle Processing
//=============================================================================

/*
 * Applies armor reduction to HP damage.
 * Shield damage is not affected.
 */
SciFi.Armor.processDamage = function(context) {
	
	SciFi.log(
		"Before Armor | Damage: " + context.damage +
		" | Armor: " + SciFi.Armor.value(context.target)
	);

    // Tidak perlu diproses jika tidak ada damage HP
    if (context.damage <= 0) {
		
		SciFi.log(
			"After Armor | Damage: " + context.damage
		);
		
        return context;
    }

    const armor = SciFi.Armor.value(context.target);

    // Simpan untuk debugging dan battle context
    context.armorReduction = Math.min(armor, context.damage);

    // Kurangi damage HP
    context.damage = Math.max(0, context.damage - armor);

    // Debug
    SciFi.log(
        "Armor: -" + context.armorReduction +
        " | HP Damage: " + context.damage
    );

    return context;

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("Armor v0.2.0 Loaded");

})();