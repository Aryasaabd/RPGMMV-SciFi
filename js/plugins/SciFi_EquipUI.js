/*:
 * @plugindesc SciFi Equip UI v0.1.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Equip UI
 * ============================================================================
 *
 * Menampilkan setiap instance armor sebagai baris terpisah di
 * Window_EquipItem, lengkap dengan durability bar-nya, sehingga
 * player bisa memilih instance spesifik (bukan cuma "pasang item
 * ini, instance mana saja").
 *
 * Slot selain Armor (Weapon, Offhand, Accessory, Frame) tetap
 * berperilaku seperti bawaan MV, karena belum punya sistem instance.
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_UICore
 * - SciFi_EquipmentData
 * - SciFi_Durability
 */

var Imported = Imported || {};
Imported.SciFi_EquipUI = true;

var SciFi = SciFi || {};
SciFi.EquipUI = SciFi.EquipUI || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_EquipUI requires SciFi_Core.");
}

if (!Imported.SciFi_UICore) {
    throw new Error("SciFi_EquipUI requires SciFi_UICore.");
}

//=============================================================================
// Config: slot mana yang punya instance
//=============================================================================
// Slot index 2 = Armor, sesuai SciFi.EquipmentData.armor().
// Kalau nanti Weapon/dll ditambah instance juga, cukup tambah
// index-nya di sini.
//=============================================================================

SciFi.EquipUI.instanceSlots = [2, 3];

SciFi.EquipUI.slotHasInstance = function(slotId) {

    return SciFi.EquipUI.instanceSlots.indexOf(slotId) !== -1;

};

//=============================================================================
// Layout
//=============================================================================

SciFi.EquipUI.RowHeight = 72;

SciFi.EquipUI.GaugeOffsetY = 44;

//=============================================================================
// Build Item List (dengan uid)
//=============================================================================
// Menggantikan Window_EquipItem.prototype.includes() + makeItemList()
// bawaan MV. Untuk slot yang slotHasInstance() true, list berisi
// {item, uid} per INSTANCE (bukan per item id). Untuk slot lain,
// tetap {item, uid: null} per item id (perilaku normal).
//=============================================================================

Window_EquipItem.prototype.makeItemList = function() {

    this._data = [];

    var actor = this._actor;

    var slotId = this._slotId;

    if (!actor) {
        return;
    }

    //------------------------------------------
    // Opsi "Remove Equipment" (selalu ada, uid null)
    //------------------------------------------

    this._data.push({

        item: null,

        uid: null

    });

    //------------------------------------------
    // Slot TANPA instance -> perilaku normal MV
    //------------------------------------------

    if (!SciFi.EquipUI.slotHasInstance(slotId)) {

        var self = this;

        var normalItems = $gameParty.equipItems().filter(function(item) {

            return self.includes(item);

        });

        for (var i = 0; i < normalItems.length; i++) {

            this._data.push({

                item: normalItems[i],

                uid: null

            });

        }

        return;

    }

    //------------------------------------------
    // Slot DENGAN instance (Armor) -> per instance
    //------------------------------------------
    // Jangan ambil baseItemId dari item yang SEDANG terpasang
    // (bisa null kalau baru di-remove). Sebagai gantinya, cari
    // semua item yang party punya & cocok slot ini (sama seperti
    // cara slot non-instance kerja), baru per baseItemId ambil
    // instance-nya masing-masing.
    //------------------------------------------

    var self = this;

    var candidateItems = $gameParty.equipItems().filter(function(item) {

        return self.includes(item);

    });

    for (var k = 0; k < candidateItems.length; k++) {

        var candidateItem = candidateItems[k];

        var selectable = SciFi.EquipmentData.selectableInstances(

            candidateItem.id,

            actor,

            slotId

        );

        for (var j = 0; j < selectable.length; j++) {

            this._data.push({

                item: candidateItem,

                uid: selectable[j].uid

            });

        }

    }

};

//=============================================================================
// Item Accessor Override
//=============================================================================
// Banyak method bawaan Window_ItemList/Window_EquipItem manggil
// this.item() yang defaultnya return this._data[index] langsung
// (objek item database). Sekarang this._data[index] adalah
// {item, uid}, jadi perlu di-unwrap.
//=============================================================================

Window_EquipItem.prototype.item = function() {

    var entry = this._data && this._data[this.index()];

    return entry ? entry.item : null;

};

/*
 * Mengembalikan entry {item, uid} mentah di index tertentu.
 */
Window_EquipItem.prototype.entryAt = function(index) {

    return this._data ? this._data[index] : null;

};

//=============================================================================
// isCurrentItemEnabled tetap pakai this.item(), sudah otomatis benar
// karena override di atas.
//=============================================================================

//=============================================================================
// Draw Item Override
//=============================================================================

Window_EquipItem.prototype.drawItem = function(index) {

    var entry = this.entryAt(index);

    if (!entry) {
        return;
    }

    var rect = this.itemRect(index);

    rect.width -= this.textPadding();

    this.changePaintOpacity(this.isEnabled(entry.item));

    //------------------------------------------
    // Remove Equipment
    //------------------------------------------

    if (!entry.item) {

        this.drawText(

            "Remove Equipment",

            rect.x,

            rect.y,

            rect.width

        );

        this.changePaintOpacity(true);

        return;

    }

    //------------------------------------------
    // Icon + Name
    //------------------------------------------

    this.drawItemName(entry.item, rect.x, rect.y, rect.width);

    //------------------------------------------
    // Durability Gauge (kalau ada uid)
    //------------------------------------------

if (entry.uid) {

        var instance = SciFi.ItemInstance.get(entry.uid);

        var gaugeData = null;

        var gaugeType = null;

        if (instance && instance.durability) {

            gaugeData = instance.durability;

            gaugeType = "Armor";

        } else if (instance && instance.shield) {

            gaugeData = instance.shield;

            gaugeType = "Shield";

        }

        if (gaugeData) {

            SciFi.UICore.applyFontStyle(this);

            var oldSize = this.contents.fontSize;

            this.contents.fontSize = SciFi.UICore.Font.Resource;

            this.changeTextColor(this.systemColor());

            this.drawText(

                gaugeData.current + " / " + gaugeData.max,

                rect.x,

                rect.y + 20,

                rect.width,

                "right"

            );

            SciFi.UICore.drawSegmentGauge(

                this,

                gaugeType,

                gaugeData.current,

                gaugeData.max,

                rect.x,

                rect.y + SciFi.EquipUI.GaugeOffsetY,

                rect.width

            );

            this.contents.fontSize = oldSize;

        }

    }

    this.changePaintOpacity(true);

};

//=============================================================================
// Row Height (dilebarkan supaya muat gauge di bawah nama)
//=============================================================================

Window_EquipItem.prototype.itemHeight = function() {

    return SciFi.EquipUI.RowHeight;

};

//=============================================================================
// isEnabled tetap pakai actor.canEquip(item) bawaan, no override.
//=============================================================================

//=============================================================================
// Update Help (biar deskripsi tetap muncul walau item sama tampil 2x)
//=============================================================================

Window_EquipItem.prototype.updateHelp = function() {

    this.setHelpWindowItem(this.item());

    if (this._statusWindow) {

        this._statusWindow.setTempActor(null);

    }

    if (this._actor && this._statusWindow) {

        var actor = JsonEx.makeDeepCopy(this._actor);

        actor.forceChangeEquip(this._slotId, this.item());

        this._statusWindow.setTempActor(actor);

    }

};

//=============================================================================
// Selection Handling (Scene_Equip)
//=============================================================================
// Override onItemOk supaya kalau entry punya uid, pakai
// changeEquipToInstance(); kalau tidak, pakai changeEquip() normal.
//=============================================================================

var _SciFi_EquipUI_SceneEquip_onItemOk =
    Scene_Equip.prototype.onItemOk;

Scene_Equip.prototype.onItemOk = function() {

    var entry = this._itemWindow.entryAt(this._itemWindow.index());

    if (entry && entry.uid) {

        SoundManager.playEquip();

        SciFi.EquipmentData.changeEquipToInstance(

            this.actor(),

            this._slotWindow.index(),

            entry.uid

        );

        this._slotWindow.refresh();

        this._itemWindow.deselect();

        this._itemWindow.refresh();

        this._slotWindow.activate();

        return;

    }

    // Entry tanpa uid (Remove Equipment, atau slot non-instance)
    // -> perilaku normal MV.
    _SciFi_EquipUI_SceneEquip_onItemOk.call(this);

};

//=============================================================================
// Terapkan style window (biar konsisten sama Menu)
//=============================================================================

var _SciFi_EquipUI_SceneEquip_create =
    Scene_Equip.prototype.create;

Scene_Equip.prototype.create = function() {

    _SciFi_EquipUI_SceneEquip_create.call(this);

    var windows = [

        this._helpWindow,

        this._statusWindow,

        this._commandWindow,

        this._slotWindow,

        this._itemWindow

    ];

    for (var i = 0; i < windows.length; i++) {

        if (windows[i]) {

            SciFi.UICore.drawWindow(windows[i]);

        }

    }

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("EquipUI v0.1.1 Loaded");

})();