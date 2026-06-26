/*:
 * @plugindesc Sci-Fi Shield System v1.0
 * @author ChatGPT
 *
 * @help
 * ============================================================================
 * SHIELD SYSTEM V1.0
 * ============================================================================
 *
 * Notetag Actor:
 * <Shield:100>
 *
 * Notetag Enemy:
 * <Shield:50>
 *
 * Shield akan menyerap HP Damage sebelum HP berkurang.
 * Shield tersimpan antar battle.
 *
 * Belum mendukung:
 * - Shield Generator
 * - Shield Bar
 * - Shield Resistance
 * - EMP
 *
 */

(function() {

    //=========================================================================
    // Utility
    //=========================================================================

    function getShieldValue(obj) {
        if (!obj || !obj.note) return 0;

        var match = obj.note.match(/<Shield\s*:\s*(\d+)>/i);
        return match ? Number(match[1]) : 0;
    }

    //=========================================================================
    // Actor Setup
    //=========================================================================

    var _Game_Actor_setup = Game_Actor.prototype.setup;
    Game_Actor.prototype.setup = function(actorId) {
        _Game_Actor_setup.call(this, actorId);

        var shield = getShieldValue(this.actor());

        this._maxShield = shield;
        this._shield = shield;
    };

    //=========================================================================
    // Enemy Setup
    //=========================================================================

    var _Game_Enemy_setup = Game_Enemy.prototype.setup;
    Game_Enemy.prototype.setup = function(enemyId, x, y) {
        _Game_Enemy_setup.call(this, enemyId, x, y);

        var shield = getShieldValue(this.enemy());

        this._maxShield = shield;
        this._shield = shield;
    };

    //=========================================================================
    // Access Functions
    //=========================================================================

    Game_Battler.prototype.shield = function() {
        return this._shield || 0;
    };

    Game_Battler.prototype.maxShield = function() {
        return this._maxShield || 0;
    };

    Game_Battler.prototype.setShield = function(value) {
        this._shield = Math.max(0, Math.min(value, this.maxShield()));
    };

    Game_Battler.prototype.gainShield = function(value) {
        this.setShield(this.shield() + value);
    };

    //=========================================================================
    // Damage Interception
    //=========================================================================

    var _Game_Action_executeHpDamage =
        Game_Action.prototype.executeHpDamage;

    Game_Action.prototype.executeHpDamage = function(target, value) {

        if (value <= 0) {
            _Game_Action_executeHpDamage.call(this, target, value);
            return;
        }

        var shield = target.shield();

        if (shield > 0) {

            if (shield >= value) {

                target.setShield(shield - value);

                target.result().hpDamage = 0;

                return;

            } else {

                var remainingDamage = value - shield;

                target.setShield(0);

                _Game_Action_executeHpDamage.call(
                    this,
                    target,
                    remainingDamage
                );

                return;
            }
        }

        _Game_Action_executeHpDamage.call(this, target, value);
    };

})();