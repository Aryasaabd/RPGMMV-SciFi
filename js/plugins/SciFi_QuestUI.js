/*:
 * @plugindesc SciFi Quest UI v0.1.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Quest UI
 * ============================================================================
 *
 * Restyle Galv's Quest Log (Galv_QuestLog.js) supaya konsisten sama gaya
 * window SciFi_UICore (border/frame/background) yang sudah dipakai di
 * Menu/Equip/Item/Shop/Skill.
 *
 * Plugin ini TIDAK mengubah logic quest sama sekali (tracking, kategori,
 * status objective, dsb tetap murni punya Galv_QuestLog). Yang diubah
 * cuma tampilan:
 *
 * - Window_QuestCategory, Window_QuestList, Window_QuestInfo dipasangi
 *   border/background SciFi_UICore lewat Scene_QuestLog.create().
 * - Baris judul kategori ("Main Quests", "Side Quests", "Crafting
 *   Quests") di Window_QuestList sekarang dikasih panel background
 *   (SciFi.UICore.drawPanel), bukan cuma teks polos.
 *
 * Cara kerja override baris kategori: drawItem() bawaan Galv_QuestLog
 * di-override ULANG di sini (shadow, menimpa punya Galv_QuestLog).
 * Untuk baris quest biasa (non-kategori), perilakunya tetap sama persis
 * seperti aslinya -- cuma baris kategori yang beda (ditambah panel).
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_UICore
 * - Galv_QuestLog (harus load SEBELUM plugin ini)
 *
 * Load Order:
 * - SciFi_Core -> SciFi_UICore -> ... -> Galv_QuestLog -> SciFi_QuestUI
 */

var Imported = Imported || {};
Imported.SciFi_QuestUI = true;

var SciFi = SciFi || {};
SciFi.QuestUI = SciFi.QuestUI || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_QuestUI requires SciFi_Core.");
}

if (!Imported.SciFi_UICore) {
    throw new Error("SciFi_QuestUI requires SciFi_UICore.");
}

if (!Imported.Galv_QuestLog) {
    throw new Error("SciFi_QuestUI requires Galv_QuestLog (must load BEFORE this plugin).");
}

//=============================================================================
// Config: Category Title Row (panel background)
//=============================================================================

SciFi.QuestUI.CategoryRow = {

    // Tinggi panel kategori. Sedikit lebih kecil dari itemHeight()
    // window (yang dipakai spacing()=48 bawaan Galv), supaya ada
    // jarak antar panel.
    Height : 40,

    // Margin kiri/kanan panel dari tepi contents.
    Margin : 4

};

//=============================================================================
// Scene_QuestLog: Terapkan Style Window
//=============================================================================

var _SciFi_QuestUI_SceneQuestLog_create =
    Scene_QuestLog.prototype.create;

Scene_QuestLog.prototype.create = function() {

    _SciFi_QuestUI_SceneQuestLog_create.call(this);

    var windows = [

        this._categoryWindow,

        this._itemWindow,

        this._helpWindow

    ];

    for (var i = 0; i < windows.length; i++) {

        if (windows[i]) {

            SciFi.UICore.drawWindow(windows[i]);

        }

    }

    // SciFi.UICore.drawWindow() mereset contents window (lesson
    // learned dari EquipUI/ItemUI/ShopUI) -- panggil ulang
    // createContents() + refresh() supaya gak ke-clip.
    this.reapplyScifiQuestLayout();

};

Scene_QuestLog.prototype.reapplyScifiQuestLayout = function() {

    var windows = [

        this._categoryWindow,

        this._itemWindow,

        this._helpWindow

    ];

    for (var i = 0; i < windows.length; i++) {

        var win = windows[i];

        if (!win) {
            continue;
        }

        if (win.createContents) {

            win.createContents();

        }

        win.refresh();

    }

};

//=============================================================================
// Window_QuestList: Panel Background untuk Baris Kategori
//=============================================================================
// Shadow drawItem() bawaan Galv_QuestLog. Baris quest biasa (item._id
// ada) TETAP pakai gambar yang sama persis seperti aslinya -- cuma
// baris kategori (item.categoryTitle != undefined) yang ditambah
// panel background sebelum teksnya digambar.
//=============================================================================

Window_QuestList.prototype.drawItem = function(index) {

    var item = this.item(index);

    if (!item) {
        return;
    }

    var rect = this.itemRect(index);

    rect.width -= this.textPadding();

    if (item.categoryTitle != undefined) {

        //------------------------------------------------------------
        // Panel Background (baris kategori)
        //------------------------------------------------------------

        var cfg = SciFi.QuestUI.CategoryRow;

        var panelX = rect.x - this.textPadding() + cfg.Margin;

        var panelY = rect.y;

        var panelWidth = this.contentsWidth() - (cfg.Margin * 2);

        var panelHeight = cfg.Height;

        SciFi.UICore.drawPanel(

            this,

            panelX,

            panelY,

            panelWidth,

            panelHeight

        );

        //------------------------------------------------------------
        // Teks kategori (posisi vertikal disamakan tengah panel)
        //------------------------------------------------------------

        var textY = panelY +
            Math.floor((panelHeight - this.lineHeight()) / 2);

        var cat = Galv.QUEST.categories[item.categoryTitle];

        var txt = cat.name;

        this.changeTextColor(cat.color);

        this.drawText(

            txt,

            rect.x + 4,

            textY,

            rect.width

        );

        this.drawText(

            "(" + item.count + ")",

            rect.x,

            textY,

            rect.width,

            "right"

        );

        this.changeTextColor(this.normalColor());

        return;

    }

    //------------------------------------------------------------
    // Baris quest biasa -- sama persis seperti Galv_QuestLog asli
    //------------------------------------------------------------

    var icon = item._id == $gameSystem._quests.tracked ?
        Galv.QUEST.icon3 :
        Galv.QUEST["icon" + item._status];

    this.drawIcon(icon, rect.x, rect.y);

    this.drawText(item.name(), rect.x + 40, rect.y, rect.width);

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("QuestUI v0.1.0 Loaded");

})();
