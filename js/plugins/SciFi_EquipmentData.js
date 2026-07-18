/*:
 * @plugindesc SciFi Equipment Data v0.4.1
 * @author
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

    if (battler.isActor()) {

        battler._scifi.equipmentInstances = {};

    }

};

Game_Actor.prototype.setup

const _Game_Actor_setup =
    Game_Actor.prototype.setup;

Game_Actor.prototype.setup = function(actorId) {

    _Game_Actor_setup.call(this, actorId);

    SciFi.EquipmentData.initialize(this);

    SciFi.EquipmentData.syncAllSlots(this);

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
// Equipment Change
//=============================================================================

const _Game_Actor_changeEquip =
    Game_Actor.prototype.changeEquip;

Game_Actor.prototype.changeEquip = function(slotId, item) {

    _Game_Actor_changeEquip.call(
        this,
        slotId,
        item
    );

    SciFi.EquipmentData.syncSlotInstance(this, slotId);

    SciFi.EquipmentData.refresh(this);

};

//=============================================================================
// Equipment Access
//=============================================================================

SciFi.EquipmentData.primary = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[0];

};

SciFi.EquipmentData.offhand = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[1];

};

SciFi.EquipmentData.armor = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[2];

};

SciFi.EquipmentData.shieldGenerator = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[3];

};

//=============================================================================
// Shield Data
//=============================================================================

/*
 * Returns maximum shield provided by Shield Generator.
 *
 * Notetag:
 * <Shield:100>
 */
SciFi.EquipmentData.maxShield = function(battler) {

    var shield =
        SciFi.EquipmentData.shieldGenerator(battler);

    if (!shield) {
        return 0;
    }

    return Number(
        shield.meta.Shield || 0
    );

};

SciFi.EquipmentData.accessory = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[4];

};

SciFi.EquipmentData.frame = function(battler) {
	
	if (!battler.isActor()) {
    return null;
	}

    return battler.equips()[5];

};

//=============================================================================
// Shield Element Rate Data
//=============================================================================

/*
 * Returns the Shield Element Rate.
 *
 * Notetag format:
 *
 * <ShieldElementRate:2,150>
 *
 * Returns:
 * 1.5  = 150%
 * 0.5  = 50%
 * 1.0  = Default
 */
SciFi.EquipmentData.shieldElementRate = function(target, elementId) {

    //------------------------------------------------------------
    // Shield Data Source
    //------------------------------------------------------------

    var source = null;

    if (target.isActor()) {

        source = SciFi.EquipmentData.shieldGenerator(target);

    } else {

        source = target.enemy();

    }

    if (!source) {
        return 1.0;
    }

    var regex =
        /<ShieldElementRate\s*:\s*(\d+)\s*,\s*(\d+)\s*>/gi;

    var match;

    while ((match = regex.exec(source.note)) !== null) {

        if (Number(match[1]) === elementId) {

            return Number(match[2]) / 100;

        }

    }

    return 1.0;

};

/*
 * Debug
 */
SciFi.EquipmentData.debugShieldElementRate =
function(target, elementId) {

    var rate =
        SciFi.EquipmentData.shieldElementRate(
            target,
            elementId
        );

    SciFi.log(
        "Shield Element Rate" +
        " | Element: " + elementId +
        " | Rate: " + rate
    );

    return rate;

};

//=============================================================================
// Equipment Refresh
//=============================================================================

/*
 * Refreshs cached equipment-dependent values.
 */
SciFi.EquipmentData.refresh = function(battler) {

	//------------------------------------------------------------
    // Shield
    //------------------------------------------------------------

    if (Imported.SciFi_Shield) {

        SciFi.Shield.refreshEquipment(
            battler
        );

    }
	
	//------------------------------------------------------------
    // Durability
    //------------------------------------------------------------

       if (Imported.SciFi_Durability) {

        SciFi.Durability.refreshEquipment(
            battler
        );

    }

};

//=============================================================================
// Item Instance Sync
//=============================================================================
// Menjaga agar tiap slot equipment aktor (khususnya armor, nanti bisa
// diperluas ke shieldGenerator dll) punya instance unik di registry
// SciFi.ItemInstance, supaya durability/shield charge bisa nempel ke
// armor spesifik, bukan ke aktor.
//=============================================================================

/*
 * Returns the uid of the item instance currently equipped in slotId
 * for this actor, or null if none / not an actor.
 */
SciFi.EquipmentData.instanceUid = function(battler, slotId) {

    if (!battler.isActor()) {
        return null;
    }

    if (!battler._scifi.equipmentInstances) {
        return null;
    }

    return battler._scifi.equipmentInstances[slotId] || null;

};

/*
 * Returns the item instance data object (from SciFi.ItemInstance)
 * currently equipped in slotId, or null if none.
 */
SciFi.EquipmentData.instanceForSlot = function(battler, slotId) {

    if (!Imported.SciFi_ItemInstance) {
        return null;
    }

    var uid = SciFi.EquipmentData.instanceUid(battler, slotId);

    if (!uid) {
        return null;
    }

    return SciFi.ItemInstance.get(uid);

};

/*
 * Ensures the item currently equipped in slotId has a matching
 * instance. If the slot is empty, clears the mapping. If a new
 * item was equipped, creates a fresh instance for it.
 *
 * extraDataFn: optional function(item) -> extraData object,
 * used when creating a brand-new instance (e.g. to seed
 * durability.max from the item's notetag).
 */
/*
 * Mengembalikan array uid instance untuk baseItemId tertentu
 * yang sedang tidak terpasang di manapun (menunggu di "pool").
 */

SciFi.EquipmentData.pool = function() {

    if (!$gameSystem._scifiInstancePool) {

        $gameSystem._scifiInstancePool = {};

    }

    return $gameSystem._scifiInstancePool;

};

/*
 * Menjalankan syncSlotInstance untuk semua slot equip aktor.
 * Dipanggil saat setup() supaya starting equipment (yang dipasang
 * dari database, bukan lewat changeEquip) tetap dapat instance.
 */
SciFi.EquipmentData.syncAllSlots = function(battler, extraDataFn) {

    if (!battler.isActor()) {
        return;
    }

    var equips = battler.equips();

    for (var slotId = 0; slotId < equips.length; slotId++) {

        SciFi.EquipmentData.syncSlotInstance(battler, slotId, extraDataFn);

    }

};

SciFi.EquipmentData.syncSlotInstance = function(battler, slotId, extraDataFn) {

    if (!battler.isActor()) {
        return;
    }

    if (!Imported.SciFi_ItemInstance) {
        return;
    }

    var item = battler.equips()[slotId];

    var pool = SciFi.EquipmentData.pool();

    var previousUid = battler._scifi.equipmentInstances[slotId];

    if (!item) {

        // Slot kosong (baru dilepas): simpan uid lama ke pool,
        // JANGAN dihapus, supaya kalau dipasang lagi nanti,
        // instance yang sama (dengan durability apa adanya)
        // yang dipakai lagi, bukan bikin instance baru.
        if (previousUid) {

            var releasedInstance = SciFi.ItemInstance.get(previousUid);

            if (releasedInstance) {

                var baseId = releasedInstance.baseItemId;

                if (!pool[baseId]) {
                    pool[baseId] = [];
                }

                pool[baseId].push(previousUid);

                SciFi.log(
                    "Instance Released to Pool"
                    + " | UID: " + previousUid
                    + " | BaseItemId: " + baseId
                );

            }

        }

        delete battler._scifi.equipmentInstances[slotId];

        return;

    }

    var currentInstance = previousUid
        ? SciFi.ItemInstance.get(previousUid)
        : null;

    // Kalau instance yang tersimpan sudah cocok dengan item yang
    // terpasang sekarang, gak perlu ngapa-ngapain.
    if (currentInstance && currentInstance.baseItemId === item.id) {
        return;
    }

    // Cek dulu apakah ada instance yang cocok "menunggu" di pool
    // (misal armor yang sama baru saja dilepas lalu dipasang lagi).
    var reuseUid = null;

    if (pool[item.id] && pool[item.id].length > 0) {

        reuseUid = pool[item.id].pop();

    }

    var newUid;

    if (reuseUid) {

        newUid = reuseUid;

        SciFi.log(
            "Instance Reused from Pool"
            + " | UID: " + newUid
            + " | BaseItemId: " + item.id
        );

    } else {

        var extraData = extraDataFn ? extraDataFn(item) : {};

        newUid = SciFi.ItemInstance.create(item, extraData);

    }

    battler._scifi.equipmentInstances[slotId] = newUid;

    SciFi.log(
        "Slot Instance Synced"
        + " | Actor: " + battler.name()
        + " | Slot: " + slotId
        + " | UID: " + newUid
    );

};

//=============================================================================

SciFi.log("EquipmentData Loaded");
SciFi.log("EquipmentData v0.5.0");
