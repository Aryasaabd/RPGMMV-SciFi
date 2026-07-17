/*:
 * @plugindesc SciFi Damage Data v0.2.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Damage Data
 * ============================================================================
 *
 * Reads damage metadata from Game_Action and stores it in the
 * SciFi Battle Context.
 *
 * Current Features
 * - Reads Element ID
 *
 * Future Features
 * - Damage Type
 * - Shield Bypass
 * - Armor Bypass
 * - True Damage
 * - Splash Damage
 *
 * Requires
 * - SciFi_Core
 * - SciFi_BattleCore
 */

var Imported = Imported || {};
Imported.SciFi_DamageData = true;

var SciFi = SciFi || {};
SciFi.DamageData = SciFi.DamageData || {};

(function() {

"use strict";

//=============================================================================
// Damage Data
//=============================================================================

/*
 * Reads metadata from the current Game_Action.
 */
SciFi.DamageData.build = function(context) {

    var item = context.action.item();

    context.damageData = {

        item: item,

        elementId: item.damage.elementId,

        isNormalAttack: item.damage.elementId === -1,

        damageType: item.damage.type,

        hitType: item.hitType

    };

    //------------------------------------------------------------
    // Debug
    //------------------------------------------------------------

	SciFi.log(
		"DamageData" +
		" | Element: " + context.damageData.elementId +
		" | DamageType: " + context.damageData.damageType +
		" | HitType: " + context.damageData.hitType +
		" | NormalAttack: " + context.damageData.isNormalAttack
	);

    SciFi.log(context.damageData);

    return context;

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("DamageData v0.2.0 Loaded");

})();