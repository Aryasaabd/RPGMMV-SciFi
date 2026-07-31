/*:
 * @plugindesc SciFi Save/Load UI v0.1.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Save/Load UI
 * ============================================================================
 *
 * Restyle Scene_Save & Scene_Load (keduanya extend Scene_File bawaan MV,
 * sama-sama pakai Window_SavefileList) supaya konsisten sama gaya window
 * SciFi_UICore.
 *
 * v0.1.0 -- Style Only
 * ----------------------------------------------------------------------
 * - Border/background Window_SavefileList & Window_Help (kalau ada)
 *   diganti gaya SciFi_UICore.
 * - Tiap baris savefile (Window_SavefileList.drawItem) dikasih panel
 *   background (SciFi.UICore.drawPanel), bukan cuma teks polos seperti
 *   bawaan MV.
 * - Belum ada perubahan LAYOUT (posisi/ukuran window tetap bawaan MV) --
 *   kalau nanti mau direposisi (mis. jadi 2 kolom, atau ditambah portrait
 *   party), itu perubahan lanjutan terpisah.
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_UICore
 */

var Imported = Imported || {};
Imported.SciFi_SaveUI = true;

var SciFi = SciFi || {};
SciFi.SaveUI = SciFi.SaveUI || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_SaveUI requires SciFi_Core.");
}

if (!Imported.SciFi_UICore) {
    throw new Error("SciFi_SaveUI requires SciFi_UICore.");
}

//=============================================================================
// Config: Savefile Row Panel
//=============================================================================

SciFi.SaveUI.RowLayout = {

    // Margin panel dari tepi kiri/kanan/atas/bawah tiap baris.
    Margin : 6

};

//=============================================================================
// Window_SavefileList: Panel Background per Baris
//=============================================================================
// drawItem() bawaan MV menggambar: nomor savefile (kiri), lalu lewat
// drawContents() -> characters/party face, playtime, timestamp. Kita
// TIDAK mengubah drawContents() sama sekali (biar isi tetap sama persis
// seperti bawaan) -- cuma menambah panel background SEBELUM konten
// digambar, dan menggeser dikit posisi teks nomor biar gak nempel ke
// panel.
//=============================================================================

var _SciFi_SaveUI_WindowSavefileList_drawItem =
    Window_SavefileList.prototype.drawItem;

Window_SavefileList.prototype.drawItem = function(index) {

    var rect = this.itemRectForText ?
        this.itemRectForText(index) :
        this.itemRect(index);

    var margin = SciFi.SaveUI.RowLayout.Margin;

    var panelRect = this.itemRect(index);

    SciFi.UICore.drawPanel(

        this,

        panelRect.x + margin,

        panelRect.y + margin,

        panelRect.width - (margin * 2),

        panelRect.height - (margin * 2)

    );

    _SciFi_SaveUI_WindowSavefileList_drawItem.call(this, index);

};

//=============================================================================
// Scene_File: Terapkan Style Window
//=============================================================================
// Scene_Save & Scene_Load keduanya extend Scene_File dan TIDAK meng-
// override create() sendiri (cuma createListWindow()), jadi cukup hook
// di Scene_File supaya berlaku buat dua-duanya sekaligus.
//=============================================================================

var _SciFi_SaveUI_SceneFile_create =
    Scene_File.prototype.create;

Scene_File.prototype.create = function() {

    _SciFi_SaveUI_SceneFile_create.call(this);

    var windows = [

        this._listWindow,

        this._helpWindow

    ];

    for (var i = 0; i < windows.length; i++) {

        if (windows[i]) {

            SciFi.UICore.drawWindow(windows[i]);

        }

    }

    // SciFi.UICore.drawWindow() mereset contents window -- panggil
    // ulang createContents() + refresh() supaya gak ke-clip (lesson
    // learned dari EquipUI/ItemUI/ShopUI/QuestUI).
    this.reapplyScifiSaveLayout();

};

Scene_File.prototype.reapplyScifiSaveLayout = function() {

    var windows = [

        this._listWindow,

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
// Plugin Loaded
//=============================================================================

SciFi.log("SaveUI v0.1.0 Loaded");

})();
