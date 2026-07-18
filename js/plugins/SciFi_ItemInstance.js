/*:
 * @plugindesc SciFi Item Instance System v0.1.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Item Instance
 * ============================================================================
 *
 * Provides independent item instances, so that two armors with the
 * same database ID can have separate durability/shield data.
 *
 * Registry is stored in $gameSystem so it persists with save data.
 *
 * Current Features:
 * - Create / get / delete item instances
 * - Unique ID (uid) generator
 *
 * Future Features:
 * - Instance metadata beyond durability (e.g. enchantments)
 *
 * Requires:
 * - SciFi_Core
 */

var Imported = Imported || {};
Imported.SciFi_ItemInstance = true;

var SciFi = SciFi || {};
SciFi.ItemInstance = SciFi.ItemInstance || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_ItemInstance requires SciFi_Core.");
}

//=============================================================================
// Registry Initialization
//=============================================================================

/*
 * Ensures $gameSystem has a place to store item instances.
 * Safe to call multiple times.
 */
SciFi.ItemInstance.initRegistry = function() {

    if (!$gameSystem._scifiItemInstances) {

        $gameSystem._scifiItemInstances = {};

    }

    if (!$gameSystem._scifiItemInstanceCounter) {

        $gameSystem._scifiItemInstanceCounter = 0;

    }

};

//=============================================================================
// UID Generator
//=============================================================================

/*
 * Generates a new unique instance id.
 * Format: "item_0001", "item_0002", etc.
 */
SciFi.ItemInstance.generateUid = function() {

    SciFi.ItemInstance.initRegistry();

    $gameSystem._scifiItemInstanceCounter += 1;

    var number = $gameSystem._scifiItemInstanceCounter;

    var padded = String(number).padStart(4, "0");

    return "item_" + padded;

};

//=============================================================================
// Create
//=============================================================================

/*
 * Creates a new item instance and stores it in the registry.
 *
 * baseItem   : the $dataArmors/$dataWeapons/etc entry
 * extraData  : optional object merged into the instance
 *              (e.g. { durability: { current: 100, max: 100 } })
 *
 * Returns the uid of the new instance.
 */
SciFi.ItemInstance.create = function(baseItem, extraData) {

    SciFi.ItemInstance.initRegistry();

    var uid = SciFi.ItemInstance.generateUid();

    var instance = {

        uid: uid,

        baseItemId: baseItem ? baseItem.id : 0

    };

    if (extraData) {

        for (var key in extraData) {

            instance[key] = extraData[key];

        }

    }

    $gameSystem._scifiItemInstances[uid] = instance;

    SciFi.log(
        "ItemInstance Created"
        + " | UID: " + uid
        + " | BaseItemId: " + instance.baseItemId
    );

    return uid;

};

//=============================================================================
// Get
//=============================================================================

/*
 * Returns the instance data for a given uid, or null if not found.
 */
SciFi.ItemInstance.get = function(uid) {

    SciFi.ItemInstance.initRegistry();

    if (!uid) {
        return null;
    }

    return $gameSystem._scifiItemInstances[uid] || null;

};

//=============================================================================
// Delete
//=============================================================================

/*
 * Removes an instance from the registry entirely.
 * Use with caution: any slot still referencing this uid will
 * end up pointing at nothing.
 */
SciFi.ItemInstance.delete = function(uid) {

    SciFi.ItemInstance.initRegistry();

    if (!uid) {
        return;
    }

    delete $gameSystem._scifiItemInstances[uid];

    SciFi.log(
        "ItemInstance Deleted"
        + " | UID: " + uid
    );

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("ItemInstance v0.1.0 Loaded");

})();