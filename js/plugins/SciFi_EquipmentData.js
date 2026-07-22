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

    SciFi.EquipmentData._suppressInventorySync = true;

    _Game_Actor_changeEquip.call(
        this,
        slotId,
        item
    );

    SciFi.EquipmentData._suppressInventorySync = false;

    SciFi.EquipmentData.refresh(this);

};
//=============================================================================
// Gain Item Hook
//=============================================================================

SciFi.EquipmentData._suppressInventorySync = false;

const _SciFi_Game_Party_gainItem =
    Game_Party.prototype.gainItem;

Game_Party.prototype.gainItem = function(item, amount, includeEquip) {

    _SciFi_Game_Party_gainItem.call(

        this,

        item,

        amount,

        includeEquip

    );

    if (

        item &&

        DataManager.isArmor(item) &&

        !SciFi.EquipmentData._suppressInventorySync

    ) {

        SciFi.EquipmentData.syncInventoryInstances(item);

    }

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

//=============================================================================
// Instance Creation on Gain
//=============================================================================
// Supaya armor/shield generator yang didapat lewat toko/loot juga
// langsung punya instance sejak masuk inventory (bukan cuma pas
// di-equip), sehingga UI nanti bisa menampilkan tiap unit secara
// terpisah beserta durability/shield-nya masing-masing.
//=============================================================================

/*
 * Daftar "provider" yang tahu cara membuat extraData untuk baseItem
 * tertentu. Diisi oleh Durability & Shield lewat registerInstanceProvider,
 * supaya EquipmentData sendiri tidak perlu tahu detail durability/shield.
 */
SciFi.EquipmentData._instanceProviders = [];

/*
 * Dipanggil oleh plugin lain (Durability, Shield) untuk mendaftarkan
 * fungsi extraDataFn yang dipakai saat instance baru dibuat untuk
 * item yang match dengan checkFn.
 *
 * checkFn(item) -> boolean, apakah item ini perlu instance
 * extraDataFn(item) -> object data tambahan (misal { durability: {...} })
 */
SciFi.EquipmentData.registerInstanceProvider = function(checkFn, extraDataFn) {

    SciFi.EquipmentData._instanceProviders.push({

        check: checkFn,

        build: extraDataFn

    });

};

/*
 * Menggabungkan semua extraData dari provider yang cocok dengan
 * item ini jadi satu object.
 */
SciFi.EquipmentData.buildExtraDataForItem = function(item) {

    var result = {};

    var providers = SciFi.EquipmentData._instanceProviders;

    for (var i = 0; i < providers.length; i++) {

        var provider = providers[i];

        if (provider.check(item)) {

            var data = provider.build(item);

            for (var key in data) {

                result[key] = data[key];

            }

        }

    }

    return result;

};

/*
 * Membuat instance baru untuk 1 unit item dan memasukkannya ke pool,
 * supaya nanti bisa diambil saat di-equip atau dipilih dari UI.
 */
SciFi.EquipmentData.createPooledInstance = function(item) {

    var extraData = SciFi.EquipmentData.buildExtraDataForItem(item);

    var uid = SciFi.ItemInstance.create(item, extraData);

    var pool = SciFi.EquipmentData.pool();

    if (!pool[item.id]) {
        pool[item.id] = [];
    }

    pool[item.id].push(uid);

    SciFi.log(
        "Instance Created on Gain"
        + " | UID: " + uid
        + " | BaseItemId: " + item.id
    );

    return uid;

};

/*
 * Menghitung berapa banyak unit dari item ini yang SUDAH punya
 * instance (baik lagi terpasang di aktor manapun, atau nganggur
 * di pool).
 */
SciFi.EquipmentData.trackedInstanceCount = function(item) {

    var pool = SciFi.EquipmentData.pool();

    var poolList = pool[item.id] || [];

    return poolList.length;

};

/*
 * Dipanggil setiap kali party dapat/kehilangan armor. Kalau
 * bertambah dan item ini perlu instance (ada provider yang cocok),
 * buatkan instance baru untuk selisihnya.
 *
 * Kalau berkurang (dijual/dibuang), instance yang "lebih" (gak
 * kepakai) dihapus dari pool & registry.
 */
SciFi.EquipmentData.syncInventoryInstances = function(item) {

    if (!Imported.SciFi_ItemInstance) {
        return;
    }

    if (!item) {
        return;
    }

    var extraData = SciFi.EquipmentData.buildExtraDataForItem(item);

    // Item ini gak dilacak provider manapun (misal Pistol biasa).
    var isEmpty = Object.keys(extraData).length === 0;

    if (isEmpty) {
        return;
    }

    var ownedCount = $gameParty.numItems(item);

    var trackedCount = SciFi.EquipmentData.trackedInstanceCount(item);

    if (ownedCount > trackedCount) {

        // Nambah: buat instance baru untuk selisihnya.
        var toCreate = ownedCount - trackedCount;

        for (var i = 0; i < toCreate; i++) {

            SciFi.EquipmentData.createPooledInstance(item);

        }

    } else if (ownedCount < trackedCount) {

        // Berkurang: hapus instance yang nganggur di pool dulu
        // (yang lagi terpasang di aktor tidak disentuh).
        var toRemove = trackedCount - ownedCount;

        var pool = SciFi.EquipmentData.pool();

        var poolList = pool[item.id] || [];

        for (var j = 0; j < toRemove && poolList.length > 0; j++) {

            var removedUid = poolList.pop();

            SciFi.ItemInstance.delete(removedUid);

        }

    }

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

    var previousInstance = previousUid
        ? SciFi.ItemInstance.get(previousUid)
        : null;

    // Kalau instance yang tersimpan sudah cocok dengan item yang
    // terpasang sekarang, gak perlu ngapa-ngapain.
    if (item && previousInstance && previousInstance.baseItemId === item.id) {
        return;
    }

    // Instance lama (kalau ada) perlu dilepas ke pool, baik karena
    // slotnya jadi kosong ATAU karena diganti ke item yang berbeda.
    if (previousInstance) {

        var releasedBaseId = previousInstance.baseItemId;

        if (!pool[releasedBaseId]) {
            pool[releasedBaseId] = [];
        }

        pool[releasedBaseId].push(previousUid);

        SciFi.log(
            "Instance Released to Pool"
            + " | UID: " + previousUid
            + " | BaseItemId: " + releasedBaseId
        );

    }

    delete battler._scifi.equipmentInstances[slotId];

    if (!item) {
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
// Equip by Specific Instance (uid)
//=============================================================================
// Dipakai saat player memilih unit spesifik dari beberapa item
// identik (misal 2 Heavy Armor dengan durability berbeda). Berbeda
// dari changeEquip bawaan yang cuma tahu item.id, ini menunjuk
// langsung ke instance mana yang mau dipasang.
//=============================================================================

/*
 * Mencari slotId mana yang sedang menggunakan uid tertentu di
 * seluruh party (baik aktor yang sama atau aktor lain), atau
 * null kalau uid itu tidak sedang terpasang di manapun.
 */
SciFi.EquipmentData.findEquippedOwner = function(uid) {

    var members = $gameParty.members();

    for (var i = 0; i < members.length; i++) {

        var member = members[i];

        if (!member._scifi || !member._scifi.equipmentInstances) {
            continue;
        }

        for (var slotId in member._scifi.equipmentInstances) {

            if (member._scifi.equipmentInstances[slotId] === uid) {

                return { actor: member, slotId: Number(slotId) };

            }

        }

    }

    return null;

};

/*
 * Memasang instance dengan uid tertentu ke slotId aktor ini.
 *
 * Mengembalikan true kalau berhasil, false kalau gagal (misal
 * uid tidak ditemukan, atau baseItemId tidak cocok dengan slot).
 */
SciFi.EquipmentData.equipInstance = function(actor, slotId, uid) {

    if (!Imported.SciFi_ItemInstance) {
        return false;
    }

    var instance = SciFi.ItemInstance.get(uid);

    if (!instance) {

        SciFi.log("equipInstance failed: instance not found | UID: " + uid);

        return false;

    }

    var item = $dataArmors[instance.baseItemId];

    if (!item) {

        SciFi.log("equipInstance failed: baseItemId invalid | UID: " + uid);

        return false;

    }

    var etypeId = actor.equipSlots()[slotId];

    if (item.etypeId !== etypeId) {

        SciFi.log(
            "equipInstance failed: item etype mismatch"
            + " | Item: " + item.name
            + " | Slot: " + slotId
        );

        return false;

    }

    // Kalau instance ini lagi terpasang di aktor lain, lepas dulu
    // dari sana (ini otomatis melempar uid ke pool lewat
    // syncSlotInstance bawaan).
    var owner = SciFi.EquipmentData.findEquippedOwner(uid);

    if (owner) {

        owner.actor.changeEquip(owner.slotId, null);

    }

    // Apapun jalurnya di atas, pastikan uid ini TIDAK lagi
    // tercatat di pool sebelum kita pasang ke slot baru —
    // supaya tidak ada instance yang "dobel pegang".
    var pool = SciFi.EquipmentData.pool();

    var poolList = pool[instance.baseItemId];

    if (poolList) {

        var idx = poolList.indexOf(uid);

        if (idx >= 0) {
            poolList.splice(idx, 1);
        }

    }

    // Pasang lewat changeEquip bawaan MV supaya param dari
    // armor tetap terhitung normal (def, mdf, dll), lalu
    // syncSlotInstance otomatis jalan dari hook yang sudah ada.
    actor.changeEquip(slotId, item);

    // syncSlotInstance tadi mungkin: (a) tidak melakukan apa-apa
    // kalau baseItemId item lama & baru sama (early return), jadi
    // slot masih menunjuk uid lama, atau (b) membuat/reuse instance
    // lain dari pool secara sembarang. Di kedua kasus, apapun yang
    // sekarang nempel di slot dan BUKAN uid yang kita minta harus
    // dilepas ke pool dulu, supaya tidak jadi instance yatim.
    var leftoverUid = actor._scifi.equipmentInstances[slotId];

    if (leftoverUid && leftoverUid !== uid) {

        var leftoverInstance = SciFi.ItemInstance.get(leftoverUid);

        if (leftoverInstance) {

            var leftoverBaseId = leftoverInstance.baseItemId;

            if (!pool[leftoverBaseId]) {
                pool[leftoverBaseId] = [];
            }

            pool[leftoverBaseId].push(leftoverUid);

            SciFi.log(
                "Instance Released to Pool"
                + " | UID: " + leftoverUid
                + " | BaseItemId: " + leftoverBaseId
            );

        }

    }

    actor._scifi.equipmentInstances[slotId] = uid;

    SciFi.EquipmentData.refresh(actor);

    SciFi.log(
        "Equip Instance"
        + " | Actor: " + actor.name()
        + " | Slot: " + slotId
        + " | UID: " + uid
    );

    return true;

};

//=============================================================================
// Instance Enumeration
//=============================================================================
// Menjawab pertanyaan kebalikan dari instanceForSlot(): untuk satu
// baseItemId tertentu, instance apa aja yang ada, dan masing-masing
// statusnya (nganggur di pool, atau lagi kepasang di aktor mana slot
// berapa).
//=============================================================================

/*
 * Returns array of:
 * {
 *   uid: string,
 *   instance: object (data instance dari SciFi.ItemInstance),
 *   location: "pool" | "equipped",
 *   actorId: number | null,   // hanya terisi kalau location === "equipped"
 *   slotId: number | null     // hanya terisi kalau location === "equipped"
 * }
 *
 * Urutan tidak dijamin (pool dulu baru equipped), jangan diasumsikan urut.
 */
SciFi.EquipmentData.instancesOfBaseItem = function(baseItemId) {

    var result = [];

    if (!Imported.SciFi_ItemInstance) {
        return result;
    }

    //------------------------------------------
    // Pool (nganggur, gak kepasang siapa-siapa)
    //------------------------------------------

    var pool = SciFi.EquipmentData.pool();

    var poolUids = pool[baseItemId] || [];

    for (var i = 0; i < poolUids.length; i++) {

        var uid = poolUids[i];

        var instance = SciFi.ItemInstance.get(uid);

        if (!instance) {
            continue;
        }

        result.push({

            uid: uid,

            instance: instance,

            location: "pool",

            actorId: null,

            slotId: null

        });

    }

    //------------------------------------------
    // Equipped (lagi kepasang di salah satu aktor)
    //------------------------------------------

    var actors = $gameActors._data;

    for (var actorId = 1; actorId < actors.length; actorId++) {

        var actor = actors[actorId];

        if (!actor || !actor._scifi || !actor._scifi.equipmentInstances) {
            continue;
        }

        var slots = actor._scifi.equipmentInstances;

        for (var slotId in slots) {

            var equippedUid = slots[slotId];

            var equippedInstance = SciFi.ItemInstance.get(equippedUid);

            if (!equippedInstance) {
                continue;
            }

            if (equippedInstance.baseItemId !== baseItemId) {
                continue;
            }

            result.push({

                uid: equippedUid,

                instance: equippedInstance,

                location: "equipped",

                actorId: actorId,

                slotId: Number(slotId)

            });

        }

    }

    return result;

};

/*
 * Sama seperti instancesOfBaseItem(), tapi cuma instance yang bisa
 * dipilih untuk "actingActor" pasang di slotId tertentu:
 * - instance yang nganggur di pool
 * - instance yang SUDAH kepasang di actingActor sendiri, di slotId
 *   yang sama (supaya muncul di list-nya sendiri sebagai "currently
 *   equipped", bukan cuma hilang dari list)
 *
 * Instance yang kepasang di aktor LAIN sengaja TIDAK ikut,
 * sesuai keputusan: gak ada mekanisme tukar otomatis.
 */
SciFi.EquipmentData.selectableInstances = function(baseItemId, actingActor, slotId) {

    var all = SciFi.EquipmentData.instancesOfBaseItem(baseItemId);

    var actingActorId = actingActor ? actingActor.actorId() : null;

    return all.filter(function(entry) {

        if (entry.location === "pool") {
            return true;
        }

        // location === "equipped"
        return (
            entry.actorId === actingActorId &&
            entry.slotId === slotId
        );

    });

};

//=============================================================================
// Change Equip to Specific Instance
//=============================================================================
// Selayaknya changeEquip() bawaan MV, tapi player bisa pilih UID
// instance yang spesifik (bukan cuma "pasang item ini, terserah
// instance mana yang diambil pool").
//=============================================================================

/*
 * Memasang instance (uid) tertentu ke slotId milik actor.
 *
 * Instance lama di slot itu (kalau ada) akan dilepas balik ke pool,
 * sama persis seperti alur syncSlotInstance() saat slot dikosongkan.
 *
 * uid HARUS instance yang valid & statusnya "pool" (nganggur), atau
 * fungsi ini tidak melakukan apa-apa (return false).
 */
SciFi.EquipmentData.changeEquipToInstance = function(actor, slotId, uid) {

    if (!actor.isActor()) {
        return false;
    }

    var instance = SciFi.ItemInstance.get(uid);

    if (!instance) {
        return false;
    }

    var baseItem = $dataArmors[instance.baseItemId] || $dataWeapons[instance.baseItemId];

    if (!baseItem) {
        return false;
    }

    //------------------------------------------
    // Pastikan uid ini memang lagi nganggur di pool
    //------------------------------------------

    var pool = SciFi.EquipmentData.pool();

    var poolList = pool[instance.baseItemId] || [];

    var poolIndex = poolList.indexOf(uid);

    if (poolIndex === -1) {

        SciFi.log(
            "changeEquipToInstance gagal: UID " + uid +
            " tidak berstatus pool (mungkin sudah terpasang di aktor lain)."
        );

        return false;

    }

    //------------------------------------------
    // Lepas instance lama di slot ini (kalau ada) -> balik ke pool
    //------------------------------------------

    var previousUid = actor._scifi.equipmentInstances[slotId];

    if (previousUid && previousUid !== uid) {

        var previousInstance = SciFi.ItemInstance.get(previousUid);

        if (previousInstance) {

            var prevBaseId = previousInstance.baseItemId;

            if (!pool[prevBaseId]) {
                pool[prevBaseId] = [];
            }

            pool[prevBaseId].push(previousUid);

        }

    }

    //------------------------------------------
    // Ambil uid baru keluar dari pool
    //------------------------------------------

    poolList.splice(poolIndex, 1);

    //------------------------------------------
    // Pasang item database seperti biasa
    // (ini akan memicu changeEquip -> syncSlotInstance bawaan,
    // makanya kita OVERRIDE hasil syncSlotInstance itu setelahnya)
    //------------------------------------------

    actor.changeEquip(slotId, baseItem);

    //------------------------------------------
    // Timpa instance yang otomatis diambil syncSlotInstance
    // dengan uid yang memang kita mau
    //------------------------------------------

    actor._scifi.equipmentInstances[slotId] = uid;

    SciFi.EquipmentData.refresh(actor);

    SciFi.log(
        "changeEquipToInstance"
        + " | Actor: " + actor.name()
        + " | Slot: " + slotId
        + " | UID: " + uid
    );

    return true;

};

//=============================================================================

SciFi.log("EquipmentData Loaded");
SciFi.log("EquipmentData v0.5.0");
