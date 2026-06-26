/*:
 * @plugindesc Changes the Critical Multiplier.
 * @author Jory4001
 *
 * @help Critical Multiplier
 *
 * Changes the Critical Multiplier.
 *
 * Must be placed ABOVE any plugins that alter the damage formula,
 * such as the Minimum Damage of 1 plugin.
 *
 * The RMMV default value is x3
 * Using decimals is okay such as 1.5
 * You can even chose critical hits to be critical fumbles by making the
 * critical multiplier less then 1, such as 0.5 to do half damage.
 *
 * @param Multiplier
 * @desc The Critical Multiplier (RMMV Default = 3)
 * @default 3
 */

var parameters = PluginManager.parameters('J_Critical_Multiplier');
var CritMult1 = Number(parameters['Multiplier'] || 3);
 
Game_Action.prototype.applyCritical = function(damage) {
    return damage * CritMult1;
};
