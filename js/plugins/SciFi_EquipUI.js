/*:
 * @plugindesc SciFi Equip UI v0.3.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Equip UI
 * ============================================================================
 *
 * Layout Scene_Equip dibagi jadi 3 kolom:
 *
 *   [Kolom A]      [Kolom B]        [Kolom C]
 *   Actor Panel     Stats           Slot / Item Window
 *   (foto + gauge   (compare page,  (gantian ditampilkan di posisi
 *   current)        page 1/2/3)     yang sama)
 *   Command Window                  Description Window (di bawah)
 *   (Equip/Optimize/
 *    Clear, 1 kolom)
 *
 * Menampilkan setiap instance armor/shield sebagai baris terpisah di
 * Window_EquipItem, lengkap dengan durability/shield bar-nya, sehingga
 * player bisa memilih instance spesifik (bukan cuma "pasang item ini,
 * instance mana saja"). Instance/item yang SEDANG terpasang tidak lagi
 * dimunculkan sebagai pilihan (dihilangkan, bukan cuma ditandai).
 *
 * Slot selain Armor/Shield Generator (Weapon, Offhand, Accessory, Frame)
 * tetap berperilaku seperti bawaan MV untuk urusan instance, karena
 * belum punya sistem instance (Weapon/Accessory/Frame).
 *
 * ----------------------------------------------------------------------
 * v0.3.0 Changes
 * ----------------------------------------------------------------------
 * - Scene_Equip full di-layout ulang jadi 3 kolom (lihat di atas),
 *   bukan lagi tumpukan vertikal bawaan MV.
 * - Window_EquipActorPanel (BARU): foto + nama + gauge current
 *   Shield/HP/Stamina/Momentum, gaya sama kayak card di SciFi_MenuUI.
 * - Window_EquipStatus: halaman "Core Stats" gabungan (param dasar +
 *   Ex-Param + Sp-Param + Armor efektif + Max Shield), + 2 halaman
 *   baru "Shield Resistance" & "Armor Resistance". Cycle kiri/kanan
 *   masih lewat Window_EquipSlot (setelah pilih "Equip"). Panah
 *   compare SEKARANG cuma muncul untuk stat yang beneran berubah,
 *   dari equipment jenis apapun yang lagi di-compare.
 * - Window_EquipSlot: baris slot sekarang bisa nampilin info singkat
 *   dari item yang terpasang (Attack utk senjata, Armor+Durability
 *   utk armor, Shield utk shield generator), pakai angka (bukan
 *   gauge, karena gauge current udah ada di Actor Panel).
 * - Window_EquipItem: instance/item yang lagi dipakai DIHILANGKAN
 *   dari daftar pilihan (bukan lagi cuma ditandai).
 * - Help/description window dipindah ke bawah kolom C (bukan lagi
 *   bar penuh di atas layar).
 *
 * Semua angka layout & config stat ada di bagian atas file ini,
 * silakan diubah kalau ada yang masih tabrakan / belum sesuai game
 * kamu.
 *
 * ----------------------------------------------------------------------
 * Placeholder / belum final (sengaja dikosongin dulu, gampang diubah)
 * ----------------------------------------------------------------------
 * - Attack senjata: masih baca notetag <Attack:X> polos, belum ada
 *   pembagian Ranged/Melee. Kalau sistem itu udah ada, tinggal ganti
 *   SciFi.EquipUI.weaponAttackValue() & slot info provider slot 0/1.
 * - Daftar elemen di halaman Shield/Armor Resistance
 *   (SciFi.EquipUI.ParamPages[1].elementIds / [2].elementIds) masih
 *   contoh [1,2,3,4]. Sesuaikan sama Types > Elements di database
 *   kamu.
 * - Preview "Armor" / "Max Shield" di kolom tengah pas lagi milih
 *   item BELUM 100% akurat: tempActor hasil forceChangeEquip() gak
 *   ikut lewat sinkronisasi instance (durability/shield instance-nya
 *   masih nunjuk ke item lama), jadi anggap aja itu perkiraan kasar,
 *   bukan nilai pasti instance yang lagi disorot.
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
// Slot index 2 = Armor, 3 = Shield Generator, sesuai
// SciFi.EquipmentData.armor() / shieldGenerator().
//=============================================================================

SciFi.EquipUI.instanceSlots = [2, 3];

SciFi.EquipUI.slotHasInstance = function(slotId) {

    return SciFi.EquipUI.instanceSlots.indexOf(slotId) !== -1;

};

//=============================================================================
// Config: Item List Row (Window_EquipItem)
//=============================================================================

SciFi.EquipUI.RowHeight = 72;

SciFi.EquipUI.GaugeOffsetY = 44;

//=============================================================================
// Config: Warna aksen umum (tab halaman, dsb)
//=============================================================================

SciFi.EquipUI.AccentColor = "#7CFFB2";

//=============================================================================
// Config: Actor Panel (Window_EquipActorPanel, kolom A)
//=============================================================================

SciFi.EquipUI.ActorPanelLayout = {

    // Tinggi total actor panel (foto + nama + gauge). Command window
    // ditaruh persis di bawah ini.
    Height : 576,

    // Jarak vertikal antar baris gauge.
    GaugeGap : 36

};

//=============================================================================
// Config: Scene Layout (posisi 3 kolom)
//=============================================================================
// Dihitung dari Graphics.boxWidth/boxHeight, jadi otomatis
// menyesuaikan resolusi (termasuk 16:9 HD). Silakan diubah kalau
// masih ada yang tabrakan.
//=============================================================================

SciFi.EquipUI.SceneLayout = {

    // Rasio lebar kolom A (actor panel) & B (stats) dari lebar layar.
    // Kolom C (equipment) otomatis dapet sisanya.
    ColumnARate : 0.22,
    ColumnBRate : 0.31,

    //--------------------------------------------------------------
    // Kolom A - Actor Panel (atas)
    //--------------------------------------------------------------
    actorPanelRect : function(scene) {

        var width = Math.floor(Graphics.boxWidth * this.ColumnARate);

        var height = SciFi.EquipUI.ActorPanelLayout.Height;

        return new Rectangle(0, 0, width, height);

    },

    //--------------------------------------------------------------
    // Kolom A - Command Window (di bawah actor panel)
    //--------------------------------------------------------------
    commandRect : function(scene) {

        var x = 0;

        var y = scene._actorPanelWindow.height;

        var width = scene._actorPanelWindow.width;

        var padding = scene._commandWindow.padding;

        var lh = scene._commandWindow.lineHeight();

        // 3 command (Equip/Optimize/Clear), 1 kolom -> 3 baris.
        var height = (lh * 3) + (padding * 2);

        return new Rectangle(x, y, width, height);

    },

    //--------------------------------------------------------------
    // Kolom B - Stats (full height)
    //--------------------------------------------------------------
    statusRect : function(scene) {

        var x = scene._actorPanelWindow.width;

        var width = Math.floor(Graphics.boxWidth * this.ColumnBRate);

        // Perbaikan: Hitung tinggi secara mandiri berdasarkan layout slot.
        // Karena Status (Kolom B) dan Slot (Kolom C) sejajar di atas Help Window,
        // maka tingginya dipastikan sama persis.
        var padding = scene._helpWindow.padding;
        var rows = SciFi.EquipUI.SlotLayout.MaxVisibleSlots;
        var rowHeight = SciFi.EquipUI.SlotLayout.RowHeight;
        var height = (rows * rowHeight) + (padding * 2);

        return new Rectangle(x, 0, width, height);

    },

    //--------------------------------------------------------------
    // Kolom C - Slot / Item Window (atas, tinggi dipatok supaya
    // semua slot kelihatan tanpa scroll)
    //--------------------------------------------------------------
    slotRect : function(scene) {

        var x = scene._actorPanelWindow.width + scene._statusWindow.width;

        var width = Graphics.boxWidth - x;

        var padding = scene._slotWindow.padding;

        var rows = SciFi.EquipUI.SlotLayout.MaxVisibleSlots;

        var rowHeight = SciFi.EquipUI.SlotLayout.RowHeight;

        var height = (rows * rowHeight) + (padding * 2);

        return new Rectangle(x, 0, width, height);

    },

    itemRect : function(scene) {

        // Posisinya SAMA PERSIS dengan slot window, supaya tukar
        // tampilan slot <-> item kelihatan seamless (gantian, bukan
        // ditumpuk).
        return this.slotRect(scene);

    },

    //--------------------------------------------------------------
    // Kolom C - Description / Help Window (bawah, sisa ruang)
    //--------------------------------------------------------------
    helpRect : function(scene) {

        var x = scene._commandWindow.width;

        var y = scene._slotWindow.height;

        var width = scene._statusWindow.width + scene._slotWindow.width;

        var height = Graphics.boxHeight - y;

        return new Rectangle(x, y, width, height);

    }

};

//=============================================================================
// Config: Slot Window Row (Window_EquipSlot, kolom C atas)
//=============================================================================

SciFi.EquipUI.SlotLayout = {

    // Berapa banyak slot yang HARUS langsung kelihatan tanpa scroll.
    // Samakan dengan jumlah equip slot di game kamu (sekarang 6:
    // Primary, Offhand, Armor, Shield Generator, Accessory, Frame).
    MaxVisibleSlots : 6,

    // Tinggi tiap baris slot, dalam pixel. Harus cukup buat label +
    // nama item + sampai 2 baris info tambahan (kasus Armor: Armor +
    // Durability).
    RowHeight : 90,

    LabelFontSize : 26,
    NameFontSize : 24,
    InfoFontSize : 20,

    // Jarak baris nama/info pertama dari baris label.
    NameOffsetY : 34,

    // Jarak antar baris info tambahan (kalau lebih dari 1 baris info).
    InfoLineHeight : 26

};

//=============================================================================
// Slot Info Providers
//=============================================================================
// Nampilin info singkat di sisi kanan baris slot (angka, bukan
// gauge -- gauge current-nya udah ada di Actor Panel). Bisa didaftar
// per slotId, boleh lebih dari 1 baris (mis. Armor + Durability).
//
// fn(actor, slotId) -> array of string, boleh kosong []
//=============================================================================

SciFi.EquipUI.SlotInfoProviders = {};

SciFi.EquipUI.registerSlotInfo = function(slotId, fn) {

    SciFi.EquipUI.SlotInfoProviders[slotId] = fn;

};

SciFi.EquipUI.slotInfoLines = function(actor, slotId) {

    var provider = SciFi.EquipUI.SlotInfoProviders[slotId];

    if (!provider) {
        return [];
    }

    return provider(actor, slotId) || [];

};

//------------------------------------------------------------
// PLACEHOLDER - Attack senjata.
//
// Baca notetag polos <Attack:X> dari weapon yang kepasang. Nanti
// kalau attack dipecah jadi Ranged/Melee, fungsi ini kemungkinan
// pindah ke plugin battle-nya sendiri (mis. SciFi_WeaponAttack.js)
// dan dipakai juga di formula damage, bukan cuma buat ditampilkan.
//------------------------------------------------------------

SciFi.EquipUI.weaponAttackValue = function(item) {

    if (!item) {
        return 0;
    }

    return Number(item.meta.Attack || 0);

};

// Slot 0 (Primary Weapon) & 1 (Offhand) -> tampilkan Attack.
var scifiWeaponSlotInfo = function(actor, slotId) {

    var item = actor.equips()[slotId];

    if (!item) {
        return [];
    }

    return ["Attack : " + SciFi.EquipUI.weaponAttackValue(item)];

};

SciFi.EquipUI.registerSlotInfo(0, scifiWeaponSlotInfo);
SciFi.EquipUI.registerSlotInfo(1, scifiWeaponSlotInfo);

// Slot 2 (Armor) -> tampilkan Armor efektif/base + Durability.
SciFi.EquipUI.registerSlotInfo(2, function(actor, slotId) {

    var item = actor.equips()[slotId];

    if (!item) {
        return [];
    }

    var lines = [];

    if (Imported.SciFi_Armor) {

        var effective = SciFi.Armor.value(actor);

        var base = SciFi.Armor.baseValue(actor);

        lines.push("Armor : " + effective + " / " + base);

    }

    if (Imported.SciFi_Durability) {

        var current = SciFi.Durability.current(actor);

        var max = SciFi.Durability.max(actor);

        lines.push("Durability : " + current + " / " + max);

    }

    return lines;

});

// Slot 3 (Shield Generator) -> tampilkan Shield current/max.
SciFi.EquipUI.registerSlotInfo(3, function(actor, slotId) {

    var item = actor.equips()[slotId];

    if (!item || !Imported.SciFi_Shield) {
        return [];
    }

    return ["Shield : " + actor.shield() + " / " + actor.maxShield()];

});

// Slot 4 (Accessory) & 5 (Frame) -> belum ada info tambahan,
// sengaja dikosongin (tinggal registerSlotInfo(4, ...) / (5, ...)
// kalau nanti ada statnya).

//=============================================================================
// Config: Param Pages (Window_EquipStatus, kolom B)
//=============================================================================
// type "basic"  -> actor.param(id)   -> nilai integer biasa
// type "ex"     -> actor.xparam(id)  -> rate, ditampilkan sebagai %
// type "sp"     -> actor.sparam(id)  -> rate, ditampilkan sebagai %
// type "custom" -> lewat SciFi.EquipUI.CustomStatGetters[key]
//
// Untuk SEMBUNYIKAN sebuah stat: hapus row/id-nya.
// Untuk UBAH URUTAN: ubah urutan row/id di dalam array-nya.
//
// Referensi id param bawaan RPG Maker MV:
//
//   basic (actor.param) : 0 MaxHP, 1 MaxMP, 2 ATK, 3 DEF,
//                          4 MAT, 5 MDF, 6 AGI, 7 LUK
//
//   ex (actor.xparam)   : 0 Hit Rate, 1 Evasion, 2 Critical Rate,
//                          3 Critical Evade, 4 Magic Evade,
//                          5 Magic Reflect, 6 Counter Rate,
//                          7 HP Regen, 8 MP Regen, 9 TP Regen
//
//   sp (actor.sparam)   : 0 Aggro, 1 Guard Rate, 2 Recovery Rate,
//                          3 Pharmacy Rate, 4 MP Cost Rate,
//                          5 TP Charge Rate, 6 Physical Dmg Rate,
//                          7 Magic Dmg Rate, 8 Floor Dmg Rate,
//                          9 Exp Rate
//=============================================================================

SciFi.EquipUI.ExParamNames = [
    "Hit Rate", "Evasion", "Critical Rate", "Crit Evade",
    "Magic Evade", "Magic Reflect", "Counter Rate",
    "HP Regen", "MP Regen", "TP Regen"
];

SciFi.EquipUI.SpParamNames = [
    "Aggro", "Guard Rate", "Recovery Rate", "Pharmacy Rate",
    "MP Cost Rate", "TP Charge Rate", "Phys Dmg Rate",
    "Magic Dmg Rate", "Floor Dmg Rate", "Exp Rate"
];

//------------------------------------------------------------
// Custom Stats (bukan param/xparam/sparam bawaan)
//------------------------------------------------------------
// "armor"     -> Armor efektif (udah kepengaruh durability), dari
//                SciFi_Armor. Ganti ke SciFi.Armor.baseValue(actor)
//                di bawah kalau maunya nilai base (full durability).
// "maxShield" -> Max Shield dari Shield Generator yang kepasang.
//------------------------------------------------------------

SciFi.EquipUI.CustomStatGetters = {

    armor : function(actor) {

        return Imported.SciFi_Armor ? SciFi.Armor.value(actor) : 0;

    },

    maxShield : function(actor) {

        return Imported.SciFi_Shield ? actor.maxShield() : 0;

    }

};

SciFi.EquipUI.CustomStatNames = {

    armor : "Armor",
    maxShield : "Max Shield"

};

SciFi.EquipUI.ParamPages = [

    {

        label : "Core Stats",

        rows : [

            // Basic params (2 ATK, 3 DEF, 4 MAT, 5 MDF, 6 AGI, 7 LUK)
            { type : "basic", id : 2 },
            // Custom stats (dari notetag SciFi, bukan param bawaan)
            { type : "custom", key : "armor" },
            { type : "custom", key : "maxShield" },
            { type : "basic", id : 6 },
            { type : "basic", id : 7 },

            // Ex-Param (sesuaikan sama yang beneran dipakai di gamemu)
            { type : "ex", id : 0 }, // Hit Rate
            { type : "ex", id : 1 }, // Evasion
            { type : "ex", id : 2 }, // Critical Rate

            // Sp-Param
            { type : "sp", id : 0 } // Aggro

        ]

    },

    {

        label : "Shield Resistance",

        type : "shieldElement",

        // Sesuaikan sama Types > Elements di database kamu.
        elementIds : [1, 2, 3, 4, 5, 6, 7]

    },

    {

        label : "Armor Resistance",

        type : "armorElement",

        // Sesuaikan sama Types > Elements di database kamu.
        elementIds : [1, 2, 3, 4, 5, 6, 7]

    }

];

//------------------------------------------------------------
// Param Value / Name / Format Helpers
//------------------------------------------------------------

SciFi.EquipUI.paramValue = function(actor, row) {

    if (!actor) {
        return 0;
    }

    if (row.type === "basic") {
        return actor.param(row.id);
    }

    if (row.type === "ex") {
        return actor.xparam(row.id);
    }

    if (row.type === "sp") {
        return actor.sparam(row.id);
    }

    if (row.type === "custom") {

        var getter = SciFi.EquipUI.CustomStatGetters[row.key];

        return getter ? getter(actor) : 0;

    }

    return 0;

};

SciFi.EquipUI.paramName = function(row) {

    if (row.type === "basic") {
        return TextManager.param(row.id);
    }

    if (row.type === "ex") {
        return SciFi.EquipUI.ExParamNames[row.id] || ("Ex-Param " + row.id);
    }

    if (row.type === "sp") {
        return SciFi.EquipUI.SpParamNames[row.id] || ("Sp-Param " + row.id);
    }

    if (row.type === "custom") {
        return SciFi.EquipUI.CustomStatNames[row.key] || row.key;
    }

    return "?";

};

SciFi.EquipUI.formatParamValue = function(row, value) {

    if (row.type === "basic" || row.type === "custom") {
        return String(value);
    }

    // ex / sp disimpan sebagai rate (mis. 0.05 = 5%)
    return (Math.round(value * 1000) / 10) + "%";

};

//------------------------------------------------------------
// Element Resistance Helpers
//------------------------------------------------------------
// Ditampilkan sebagai "resistance" (bukan rate mentah): 0% berarti
// dmg normal, positif berarti resist, negatif berarti weakness.
//------------------------------------------------------------

SciFi.EquipUI.elementName = function(elementId) {

    return ($dataSystem.elements[elementId] || ("Element " + elementId));

};

SciFi.EquipUI.shieldResistance = function(actor, elementId) {

    if (!Imported.SciFi_EquipmentData) {
        return 0;
    }

    var rate = SciFi.EquipmentData.shieldElementRate(actor, elementId);

    return 1 - rate;

};

SciFi.EquipUI.armorResistance = function(actor, elementId) {

    return 1 - actor.elementRate(elementId);

};

SciFi.EquipUI.formatResistance = function(value) {

    return (Math.round(value * 1000) / 10) + "%";

};

//=============================================================================
// Window_EquipActorPanel (BARU) - Kolom A
//=============================================================================
// Foto + nama + gauge current (Shield/HP/Stamina/Momentum), gaya
// sama kayak card di SciFi_MenuUI.
//=============================================================================

function Window_EquipActorPanel() {

    this.initialize.apply(this, arguments);

}

Window_EquipActorPanel.prototype = Object.create(Window_Base.prototype);
Window_EquipActorPanel.prototype.constructor = Window_EquipActorPanel;

Window_EquipActorPanel.prototype.initialize = function(x, y, width, height) {

    Window_Base.prototype.initialize.call(this, x, y, width, height);

    this._actor = null;

    this.refresh();

};

Window_EquipActorPanel.prototype.setActor = function(actor) {

    if (this._actor !== actor) {

        this._actor = actor;

        this.refresh();

    }

};

Window_EquipActorPanel.prototype.refresh = function() {

    this.contents.clear();

    if (!this._actor) {
        return;
    }

    SciFi.UICore.applyFontStyle(this);

    var lh = this.lineHeight();

    var y = 0;

    //------------------------------------------------------------
    // Nama
    //------------------------------------------------------------

    this.resetTextColor();

    this.drawActorName(this._actor, this.textPadding(), y);

    y += lh;

    //------------------------------------------------------------
    // Foto
    //------------------------------------------------------------

    this.drawActorFace(this._actor, this.textPadding(), y);

    y += Window_Base._faceHeight + 12;

    //------------------------------------------------------------
    // Gauge Current
    //------------------------------------------------------------

    this.drawResourceGauges(y);

};

Window_EquipActorPanel.prototype.drawResourceGauges = function(y) {

    var actor = this._actor;

    var x = this.textPadding();

    var width = this.contentsWidth() - (this.textPadding() * 2);

    var gap = SciFi.EquipUI.ActorPanelLayout.GaugeGap;

    if (Imported.SciFi_Shield) {

        this.drawResourceGauge("Shield", actor.shield(), actor.maxShield(), x, y, width);

        y += gap;

    }

    this.drawResourceGauge("Hitpoints", actor.hp, actor.mhp, x, y, width);

    y += gap;

    this.drawResourceGauge("Stamina", actor.mp, actor.mmp, x, y, width);

    y += gap;

    this.drawResourceGauge("Momentum", actor.tp, actor.maxTp(), x, y, width);

    y += gap;

    return y;

};

Window_EquipActorPanel.prototype.drawResourceGauge = function(label, value, max, x, y, width) {

    var oldSize = this.contents.fontSize;

    this.contents.fontSize = SciFi.UICore.Font.Resource;

    this.changeTextColor(this.systemColor());

    this.drawText(label, x, y + 190, width, "left");

    this.resetTextColor();

    this.drawText(value + " / " + max, x, y + 190, width, "right");

    SciFi.UICore.drawSegmentGauge(this, label, value, max, x, y + 220, width);

    this.contents.fontSize = oldSize;

};

//=============================================================================
// Scene_Equip: Layout Override
//=============================================================================
// Menjalankan create*Window() bawaan MV dulu (supaya semua handler /
// linking antar window tetap terpasang normal), lalu memindah &
// mengubah ukurannya sesuai SciFi.EquipUI.SceneLayout. Actor panel
// (window baru) dibuat nebeng di createHelpWindow, karena itu method
// pertama yang dipanggil vanilla create() -- supaya createCommandWindow
// dkk (dipanggil setelahnya) sudah bisa baca this._actorPanelWindow.
//=============================================================================

var _SciFi_EquipUI_Scene_Equip_createHelpWindow =
    Scene_Equip.prototype.createHelpWindow;

Scene_Equip.prototype.createHelpWindow = function() {

    _SciFi_EquipUI_Scene_Equip_createHelpWindow.call(this);

    this.createActorPanelWindow();

};

Scene_Equip.prototype.createActorPanelWindow = function() {

    var rect = SciFi.EquipUI.SceneLayout.actorPanelRect(this);

    this._actorPanelWindow = new Window_EquipActorPanel(

        rect.x, rect.y, rect.width, rect.height

    );

    this.addWindow(this._actorPanelWindow);

};

var _SciFi_EquipUI_Scene_Equip_createStatusWindow =
    Scene_Equip.prototype.createStatusWindow;

Scene_Equip.prototype.createStatusWindow = function() {

    _SciFi_EquipUI_Scene_Equip_createStatusWindow.call(this);

    var rect = SciFi.EquipUI.SceneLayout.statusRect(this);

    this._statusWindow.move(rect.x, rect.y, rect.width, rect.height);

    if (this._statusWindow.createContents) {
        this._statusWindow.createContents();
    }

    this._statusWindow.refresh();

};

var _SciFi_EquipUI_Scene_Equip_createCommandWindow =
    Scene_Equip.prototype.createCommandWindow;

Scene_Equip.prototype.createCommandWindow = function() {

    _SciFi_EquipUI_Scene_Equip_createCommandWindow.call(this);

    var rect = SciFi.EquipUI.SceneLayout.commandRect(this);

    this._commandWindow.move(rect.x, rect.y, rect.width, rect.height);

    if (this._commandWindow.createContents) {
        this._commandWindow.createContents();
    }

    this._commandWindow.refresh();

};

var _SciFi_EquipUI_Scene_Equip_createSlotWindow =
    Scene_Equip.prototype.createSlotWindow;

Scene_Equip.prototype.createSlotWindow = function() {

    _SciFi_EquipUI_Scene_Equip_createSlotWindow.call(this);

    var rect = SciFi.EquipUI.SceneLayout.slotRect(this);

    this._slotWindow.move(rect.x, rect.y, rect.width, rect.height);

    if (this._slotWindow.createContents) {
        this._slotWindow.createContents();
    }

    this._slotWindow.refresh();

};

var _SciFi_EquipUI_Scene_Equip_createItemWindow =
    Scene_Equip.prototype.createItemWindow;

Scene_Equip.prototype.createItemWindow = function() {

    _SciFi_EquipUI_Scene_Equip_createItemWindow.call(this);

    var itemRect = SciFi.EquipUI.SceneLayout.itemRect(this);

    this._itemWindow.move(itemRect.x, itemRect.y, itemRect.width, itemRect.height);

    if (this._itemWindow.createContents) {
        this._itemWindow.createContents();
    }

    this._itemWindow.refresh();

    // Item window numpuk PERSIS di posisi slot window (biar gantian,
    // bukan ditumpuk keduanya sekaligus) -- makanya harus disembunyikan
    // di awal, baru dimunculkan pas user pilih slot yang mau diganti
    // (lihat onSlotOk/onSlotCancel/onItemOk/onItemCancel di bawah).
    this._itemWindow.hide();

    // Help/description window: pindah dari bar atas ke bawah kolom C.
    var helpRect = SciFi.EquipUI.SceneLayout.helpRect(this);

    this._helpWindow.move(helpRect.x, helpRect.y, helpRect.width, helpRect.height);

    if (this._helpWindow.createContents) {
        this._helpWindow.createContents();
    }

    this._helpWindow.refresh();

};

var _SciFi_EquipUI_Scene_Equip_refreshActor =
    Scene_Equip.prototype.refreshActor;

Scene_Equip.prototype.refreshActor = function() {

    _SciFi_EquipUI_Scene_Equip_refreshActor.call(this);

    this._actorPanelWindow.setActor(this.actor());

};

//=============================================================================
// Slot <-> Item Window: Gantian (bukan ditumpuk)
//=============================================================================
// Karena slotRect/itemRect posisinya SAMA PERSIS, dua window ini
// harus gantian show()/hide() supaya cuma satu yang kelihatan.
//=============================================================================

var _SciFi_EquipUI_Scene_Equip_onSlotOk =
    Scene_Equip.prototype.onSlotOk;

Scene_Equip.prototype.onSlotOk = function() {

    _SciFi_EquipUI_Scene_Equip_onSlotOk.call(this);

    this._slotWindow.hide();

    this._itemWindow.show();

};

var _SciFi_EquipUI_Scene_Equip_onSlotCancel =
    Scene_Equip.prototype.onSlotCancel;

Scene_Equip.prototype.onSlotCancel = function() {

    _SciFi_EquipUI_Scene_Equip_onSlotCancel.call(this);

    this._itemWindow.hide();

    this._slotWindow.show();

};

var _SciFi_EquipUI_Scene_Equip_onItemCancel =
    Scene_Equip.prototype.onItemCancel;

Scene_Equip.prototype.onItemCancel = function() {

    _SciFi_EquipUI_Scene_Equip_onItemCancel.call(this);

    this._itemWindow.hide();

    this._slotWindow.show();

};

//=============================================================================
// Cycle Param Page - Tombol Global (Shift)
//=============================================================================
// Aktif selama ada di Scene_Equip, gak peduli window mana yang lagi
// fokus (command / slot / item). Tombolnya diatur lewat
// SciFi.EquipUI.CyclePageButton di bagian config atas.
//=============================================================================

var _SciFi_EquipUI_Scene_Equip_update =
    Scene_Equip.prototype.update;

Scene_Equip.prototype.update = function() {

    _SciFi_EquipUI_Scene_Equip_update.call(this);

    if (Input.isTriggered(SciFi.EquipUI.CyclePageButton)) {

        this._statusWindow.cyclePage(1);

        SoundManager.playCursor();

    }

};

//=============================================================================
// Window_EquipCommand: paksa 1 kolom (vertikal, 3 baris)
//=============================================================================

Window_EquipCommand.prototype.maxCols = function() {

    return 1;

};

//=============================================================================
// Window_EquipSlot: Baris Slot
//=============================================================================

Window_EquipSlot.prototype.itemHeight = function() {

    return SciFi.EquipUI.SlotLayout.RowHeight;

};

// Fallback kalau versi core tidak punya itemRectForText.
Window_EquipSlot.prototype.itemRectForText =
    Window_EquipSlot.prototype.itemRectForText ||
    function(index) {

        var rect = this.itemRect(index);

        rect.x += this.textPadding();

        rect.width -= this.textPadding() * 2;

        return rect;

    };

// Fallback kalau versi core tidak punya itemAt() (dipakai untuk
// mengambil item yang sedang terpasang di slot index tertentu).
Window_EquipSlot.prototype.itemAt =
    Window_EquipSlot.prototype.itemAt ||
    function(index) {

        return this._actor ? this._actor.equips()[index] : null;

    };

Window_EquipSlot.prototype.drawItem = function(index) {

    if (!this._actor) {
        return;
    }

    var rect = this.itemRectForText(index);

    this.changePaintOpacity(this.isEnabled(index));

    SciFi.UICore.applyFontStyle(this);

    var oldSize = this.contents.fontSize;

    var layout = SciFi.EquipUI.SlotLayout;

    //------------------------------------------------------------
    // Baris atas: label jenis slot (mis. "Shield Generator")
    //------------------------------------------------------------

    this.contents.fontSize = layout.LabelFontSize;

    this.changeTextColor(this.systemColor());

    this.drawText(this.slotName(index), rect.x, rect.y, rect.width, "left");

    //------------------------------------------------------------
    // Nama item + baris info pertama (kalau ada), sebaris
    //------------------------------------------------------------

    var infoLines = SciFi.EquipUI.slotInfoLines(this._actor, index);

    var nameY = rect.y + layout.NameOffsetY;

    var nameWidth = infoLines.length > 0 ?
        Math.floor(rect.width * 0.5) :
        rect.width;

    this.contents.fontSize = layout.NameFontSize;

    this.resetTextColor();

    this.drawItemName(this.itemAt(index), rect.x, nameY, nameWidth);

    if (infoLines.length > 0) {

        this.contents.fontSize = layout.InfoFontSize;

        this.changeTextColor(this.systemColor());

        this.drawText(infoLines[0], rect.x, nameY, rect.width, "right");

    }

    //------------------------------------------------------------
    // Baris info tambahan (mis. Durability, di bawah baris nama)
    //------------------------------------------------------------

    for (var i = 1; i < infoLines.length; i++) {

        var extraY = nameY + (layout.InfoLineHeight * i);

        this.drawText(infoLines[i], rect.x, extraY, rect.width, "right");

    }

    this.contents.fontSize = oldSize;

    this.resetTextColor();

    this.changePaintOpacity(true);

};

//=============================================================================
// Window_EquipStatus: Halaman Compare Stats (kolom B)
//=============================================================================

//=============================================================================
// Window_EquipStatus: ukuran konstruksi
//=============================================================================
// Override windowWidth/windowHeight supaya window ini LAHIR di ukuran
// akhir yang benar (bukan ukuran kecil bawaan MV yang cuma muat 7
// baris, terus baru "dibesarin" lewat .move() belakangan). Ini
// menghindari kasus di mana .move() gak bikin ulang kanvas teks
// (contents) sesuai ukuran baru.
//=============================================================================

Window_EquipStatus.prototype.windowWidth = function() {

    return Math.floor(Graphics.boxWidth * SciFi.EquipUI.SceneLayout.ColumnBRate);

};

Window_EquipStatus.prototype.windowHeight = function() {

    // Perbaikan: Jangan gunakan Graphics.boxHeight (full screen).
    // Gunakan perhitungan yang sama dengan statusRect agar kanvas terbuat
    // dengan ukuran yang pas sejak awal window dilahirkan.
    var padding = this.standardPadding ? this.standardPadding() : 18;
    var rows = SciFi.EquipUI.SlotLayout.MaxVisibleSlots;
    var rowHeight = SciFi.EquipUI.SlotLayout.RowHeight;
    
    return (rows * rowHeight) + (padding * 2);

};

SciFi.EquipUI.StatusRowHeight = 30;

// Ukuran font baris stats. HARUS lebih kecil dari StatusRowHeight di
// atas (kasih jarak beberapa pixel), kalau enggak teksnya bakal
// numpuk/kepotong antar baris.
SciFi.EquipUI.StatusFontSize = 24;

// Ukuran font judul halaman ("Core Stats" dst). Dipisah dari
// StatusFontSize supaya gak ikut kena bug "ukuran nempel dari baris
// terakhir yang digambar" -- title SELALU pakai ukuran ini secara
// eksplisit, gak pernah mewarisi ukuran font dari elemen lain.
SciFi.EquipUI.StatusTitleFontSize = 26;

// Proporsi lebar kolom nama/nilai per baris stat (dari lebar penuh
// window, karena sekarang 1 kolom lagi -- lihat drawParamPage).
SciFi.EquipUI.StatusColumn = {

    NameRate : 0.5,
    ValueRate : 0.2,
    ArrowWidth : 30

};

// Tombol buat cycle halaman stats (Core Stats / Shield Resistance /
// Armor Resistance). Aktif selama ada di Scene_Equip, gak peduli
// window mana yang lagi fokus. Sengaja BUKAN pageup/pagedown (Q/W)
// karena itu biasanya sudah dipakai buat ganti karakter party kalau
// party-mu lebih dari 1 orang.
SciFi.EquipUI.CyclePageButton = "shift";

Window_EquipStatus.prototype.initScifiParamPage = function() {

    if (this._scifiParamPage === undefined) {

        this._scifiParamPage = 0;

    }

};

/*
 * Dipanggil oleh Window_EquipSlot saat tombol kiri/kanan ditekan.
 */
Window_EquipStatus.prototype.cyclePage = function(delta) {

    this.initScifiParamPage();

    var count = SciFi.EquipUI.ParamPages.length;

    this._scifiParamPage = (this._scifiParamPage + delta + count) % count;

    this.refresh();

};

Window_EquipStatus.prototype.currentParamPage = function() {

    this.initScifiParamPage();

    return SciFi.EquipUI.ParamPages[this._scifiParamPage];

};

Window_EquipStatus.prototype.refresh = function() {

    this.contents.clear();

    if (!this._actor) {
        return;
    }

    SciFi.UICore.applyFontStyle(this);

    var lh = this.lineHeight();

    var y = 0;

    //------------------------------------------------------------
    // Tab Halaman (◀ Core Stats ▶ / Shield Resistance / dst)
    //------------------------------------------------------------

    this.drawParamPageTab(y);

    y += lh + 8;

    //------------------------------------------------------------
    // Isi Halaman
    //------------------------------------------------------------

    this.drawParamPage(y);

};

Window_EquipStatus.prototype.drawParamPageTab = function(y) {

    var page = this.currentParamPage();

    var pageIndex = SciFi.EquipUI.ParamPages.indexOf(page) + 1;

    var pageCount = SciFi.EquipUI.ParamPages.length;

    var w = this.contentsWidth();

    var oldSize = this.contents.fontSize;

    this.contents.fontSize = SciFi.EquipUI.StatusTitleFontSize;

    //------------------------------------------------------------
    // Judul, rata kiri
    //------------------------------------------------------------

    this.resetTextColor();

    this.drawText(page.label, 10, y + 5, w - 10, "left");

    //------------------------------------------------------------
    // "page X/Y", rata kanan
    //------------------------------------------------------------

    this.changeTextColor(SciFi.EquipUI.AccentColor);

    this.drawText("page " + pageIndex + "/" + pageCount, -10, y + 5, w - 10, "right");

    this.resetTextColor();

    this.contents.fontSize = oldSize;

};

Window_EquipStatus.prototype.drawParamPage = function(y) {

    var page = this.currentParamPage();

    var rowHeight = SciFi.EquipUI.StatusRowHeight;

    var w = this.contentsWidth();

    if (page.rows) {

        for (var i = 0; i < page.rows.length; i++) {

            this.drawParamRow(10, y + (rowHeight * i), w - 10, page.rows[i]);

        }

        return;

    }

    if (page.elementIds) {

        for (var j = 0; j < page.elementIds.length; j++) {

            this.drawElementRow(10, y + (rowHeight * j), w - 10, page.type, page.elementIds[j]);

        }

    }

};

Window_EquipStatus.prototype.drawParamRow = function(x, y, w, row) {

    var col = SciFi.EquipUI.StatusColumn;

    var nameWidth = Math.floor(w * col.NameRate);

    var valueWidth = Math.floor(w * col.ValueRate);

    var arrowWidth = col.ArrowWidth;

    this.contents.fontSize = SciFi.EquipUI.StatusFontSize;

    //------------------------------------------------------------
    // Nama
    //------------------------------------------------------------

    this.changeTextColor(this.systemColor());

    this.drawText(SciFi.EquipUI.paramName(row), x, y, nameWidth);

    //------------------------------------------------------------
    // Nilai Sekarang
    //------------------------------------------------------------

    var oldValue = SciFi.EquipUI.paramValue(this._actor, row);

    if (this._actor) {

        this.resetTextColor();

        this.drawText(

            SciFi.EquipUI.formatParamValue(row, oldValue),

            x + nameWidth,

            y,

            valueWidth,

            "right"

        );

    }

    //------------------------------------------------------------
    // Nilai Baru - cuma muncul kalau BENERAN berubah
    //------------------------------------------------------------

    if (this._tempActor) {

        var newValue = SciFi.EquipUI.paramValue(this._tempActor, row);

        var diff = newValue - oldValue;

        if (Math.abs(diff) > 0.0005) {

            this.changeTextColor(this.systemColor());

            this.drawText("\u2192", x + nameWidth + valueWidth, y, arrowWidth, "center");

            this.changeTextColor(this.paramchangeTextColor(diff));

            this.drawText(

                SciFi.EquipUI.formatParamValue(row, newValue),

                x + nameWidth + valueWidth + arrowWidth,

                y,

                valueWidth,

                "right"

            );

        }

    }

};

Window_EquipStatus.prototype.drawElementRow = function(x, y, w, type, elementId) {

    var col = SciFi.EquipUI.StatusColumn;

    var nameWidth = Math.floor(w * col.NameRate);

    var valueWidth = Math.floor(w * col.ValueRate);

    var arrowWidth = col.ArrowWidth;

    var getResistance = (type === "shieldElement") ?
        SciFi.EquipUI.shieldResistance :
        SciFi.EquipUI.armorResistance;

    this.contents.fontSize = SciFi.EquipUI.StatusFontSize;

    //------------------------------------------------------------
    // Nama Elemen
    //------------------------------------------------------------

    this.changeTextColor(this.systemColor());

    this.drawText(SciFi.EquipUI.elementName(elementId), x, y, nameWidth);

    //------------------------------------------------------------
    // Resistance Sekarang
    //------------------------------------------------------------

    var oldValue = this._actor ? getResistance(this._actor, elementId) : 0;

    if (this._actor) {

        this.resetTextColor();

        this.drawText(

            SciFi.EquipUI.formatResistance(oldValue),

            x + nameWidth,

            y,

            valueWidth,

            "right"

        );

    }

    //------------------------------------------------------------
    // Resistance Baru - cuma muncul kalau BENERAN berubah
    //------------------------------------------------------------

    if (this._tempActor) {

        var newValue = getResistance(this._tempActor, elementId);

        var diff = newValue - oldValue;

        if (Math.abs(diff) > 0.0005) {

            this.changeTextColor(this.systemColor());

            this.drawText("\u2192", x + nameWidth + valueWidth, y, arrowWidth, "center");

            this.changeTextColor(this.paramchangeTextColor(diff));

            this.drawText(

                SciFi.EquipUI.formatResistance(newValue),

                x + nameWidth + valueWidth + arrowWidth,

                y,

                valueWidth,

                "right"

            );

        }

    }

};

//=============================================================================
// Build Item List (dengan uid)
//=============================================================================
// Menggantikan Window_EquipItem.prototype.includes() + makeItemList()
// bawaan MV. Untuk slot yang slotHasInstance() true, list berisi
// {item, uid} per INSTANCE yang BELUM terpasang di manapun (pool).
// Untuk slot lain, {item, uid: null} per item id, TAPI item yang
// sedang terpasang di slot ini dihilangkan dari daftar.
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

    var self = this;

    var currentItem = actor.equips()[slotId];

    //------------------------------------------
    // Slot TANPA instance -> perilaku normal MV, item yang lagi
    // terpasang di slot ini dihilangkan dari list.
    //------------------------------------------

    if (!SciFi.EquipUI.slotHasInstance(slotId)) {

        var normalItems = $gameParty.equipItems().filter(function(item) {

            return self.includes(item) && item !== currentItem;

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
    // Slot DENGAN instance (Armor/Shield) -> per instance yang
    // BELUM terpasang di manapun (pool). Instance yang lagi
    // terpasang (di slot ini atau slot/aktor lain) sengaja
    // dihilangkan, bukan cuma ditandai.
    //------------------------------------------

    var candidateItems = $gameParty.equipItems().filter(function(item) {

        return self.includes(item);

    });

    for (var k = 0; k < candidateItems.length; k++) {

        var candidateItem = candidateItems[k];

        var instances = SciFi.EquipmentData.instancesOfBaseItem(candidateItem.id);

        for (var j = 0; j < instances.length; j++) {

            var entry = instances[j];

            if (entry.location === "equipped") {
                continue;
            }

            this._data.push({

                item: candidateItem,

                uid: entry.uid

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

    //------------------------------------------------------------
    // Remove Equipment
    //------------------------------------------------------------

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

    //------------------------------------------------------------
    // Icon + Name
    //------------------------------------------------------------

    this.drawItemName(entry.item, rect.x, rect.y, rect.width);

    //------------------------------------------------------------
    // Durability / Shield Gauge (kalau ada uid)
    //------------------------------------------------------------

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

    } else {

    // Entry tanpa uid (Remove Equipment, atau slot non-instance)
    // -> perilaku normal MV.
    _SciFi_EquipUI_SceneEquip_onItemOk.call(this);

    }

    this._itemWindow.hide();

    this._slotWindow.show();

    this._slotWindow.activate();

};

//=============================================================================
// Terapkan style window (biar konsisten sama Menu)
//=============================================================================

var _SciFi_EquipUI_SceneEquip_create =
    Scene_Equip.prototype.create;

Scene_Equip.prototype.create = function() {

    _SciFi_EquipUI_SceneEquip_create.call(this);

    var windows = [

        this._actorPanelWindow,

        this._statusWindow,

        this._commandWindow,

        this._slotWindow,

        this._itemWindow,

        this._helpWindow

    ];

    for (var i = 0; i < windows.length; i++) {

        if (windows[i]) {

            SciFi.UICore.drawWindow(windows[i]);

        }

    }

};

//=============================================================================
// Window_Help Override (Ukuran Font)
//=============================================================================
Window_Help.prototype.standardFontSize = function() {
    return 22; // Ubah angka ini sesuai selera (default MV adalah 28)
};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("EquipUI v0.3.0 Loaded");

})();