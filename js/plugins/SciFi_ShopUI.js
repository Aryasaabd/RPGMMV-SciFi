/*:
 * @plugindesc SciFi Shop UI v0.1.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Shop UI
 * ============================================================================
 *
 * Restyle Scene_Shop jadi layout 2 kolom, konsisten sama SciFi_ItemUI:
 *
 *   [Kolom Kiri]                  [Kolom Kanan]
 *   Command (Buy/Sell/Cancel)     Dummy Window (placeholder awal)
 *   ATAU Category (pas Sell)      -> jadi Buy+Status ATAU Sell+Status
 *   (window yang sama, gantian)   -> item terpilih -> jadi Number+Status
 *
 *   Gold (SELALU di pojok kiri    Help (kanan-bawah, rasio sama
 *   bawah, gak peduli tinggi      kayak di ItemUI)
 *   Command/Category)
 *
 * Semua window sudah dibuat dari awal oleh Scene_Shop bawaan MV
 * (cuma show()/hide()/activate() yang gantian) -- plugin ini TIDAK
 * mengubah alur show/hide bawaan itu KECUALI 1 hal (lihat catatan
 * "Command vs Category" di bawah), sisanya murni reposisi + border +
 * panel background.
 *
 * ----------------------------------------------------------------------
 * PENTING -- Command vs Category numpuk posisi
 * ----------------------------------------------------------------------
 * Di layout bawaan MV, Window_ShopCommand & Window_ItemCategory ada
 * di POSISI BEDA (gak akan pernah numpuk), jadi vanilla Scene_Shop
 * gak pernah repot nyembunyiin salah satunya secara eksplisit.
 *
 * Di layout INI, keduanya SENGAJA ditaruh di slot yang SAMA (kiri
 * atas, gantian kayak slot/item di SciFi_EquipUI). Karena itu, 2
 * method dioverride TAMBAHAN (bukan cuma reposisi) supaya gak
 * numpuk keliatan bareng:
 * - commandSell()      -> nambahin this._commandWindow.hide() +
 *                          this._statusWindow.show() (biar Status
 *                          langsung kelihatan bareng Sell, gak
 *                          nunggu sampai 1 item dipilih)
 * - onCategoryCancel() -> nambahin this._commandWindow.show()
 * (onCategoryOk tetap bawaan MV, gak perlu diapa-apain lagi)
 *
 * Window_ShopCommand juga ternyata nge-hardcode numVisibleRows()=1
 * sendiri (persis kasus Window_HorzCommand punya Window_ItemCategory
 * di SciFi_ItemUI) -- jadi selain maxCols=1, numVisibleRows() WAJIB
 * di-override juga supaya tingginya beneran ngikutin jumlah command.
 *
 * ----------------------------------------------------------------------
 * PENTING -- Window_ShopSell & Instance yang lagi Kepasang
 * ----------------------------------------------------------------------
 * Window_ShopSell adalah SUBCLASS Window_ItemList TANPA override
 * makeItemList/drawItem/dst sama sekali di bawaan MV -- artinya
 * SEMUA override dari SciFi_ItemUI (panel background, baris info
 * durability/shield, 2 kolom, dst) otomatis ke-inherit ke sini,
 * TERMASUK logic "tampilkan juga yang lagi dipakai aktor".
 *
 * Itu OK-OK aja buat Item menu (view-only), TAPI buat jualan itu
 * gak masuk akal -- kalau instance yang lagi kepasang di aktor ikut
 * muncul di list jual, player bisa "jual" barang yang sebenernya
 * masih nempel di badan karakter (harus dilepas dulu lewat Equip
 * scene). Makanya makeItemList() di-override ULANG khusus di
 * Window_ShopSell (shadow, nimpa punya Window_ItemList) supaya:
 * - Armor/Shield Generator: cuma instance yang lagi NGANGGUR di
 *   pool yang ditampilkan (uid punya, actorName selalu null).
 * - Item lain: cuma yang beneran ada di bag ($gameParty.numItems).
 * Baris "lagi dipakai aktor X" TIDAK muncul sama sekali di sini.
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_UICore
 * - SciFi_ItemUI       (Window_ItemCategory & Window_ItemList sudah
 *                        di-restyle di sana, dipakai ulang di sini)
 *
 * Load Order:
 * - Setelah SciFi_Core, SciFi_UICore, SciFi_ItemUI.
 */

var Imported = Imported || {};
Imported.SciFi_ShopUI = true;

var SciFi = SciFi || {};
SciFi.ShopUI = SciFi.ShopUI || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_ShopUI requires SciFi_Core.");
}

if (!Imported.SciFi_UICore) {
    throw new Error("SciFi_ShopUI requires SciFi_UICore.");
}

if (!Imported.SciFi_ItemUI) {
    throw new Error("SciFi_ShopUI requires SciFi_ItemUI (Window_ItemList/Window_ItemCategory style-nya dipakai ulang di sini).");
}

//=============================================================================
// Config: Layout
//=============================================================================

SciFi.ShopUI.SceneLayout = {

    // Lebar kolom kiri. Nilai sama kayak di SciFi_ItemUI (240),
    // sengaja angka tetap terpisah (bukan referensi ke
    // SciFi.ItemUI.SceneLayout) supaya SciFi_ShopUI tetap gampang
    // dibaca sendirian tanpa buka file lain. Ubah dua-duanya kalau
    // mau ganti lebar kolom kiri secara global.
    LeftColumnWidth : 240,

    // Tinggi Help Window, rasio dari tinggi layar (sama kayak ItemUI).
    HelpHeightRate : 0.22,

    // Rasio lebar Buy/Sell/Number vs Status di kolom kanan (area
    // yang tadinya "dummy window"). 0.6 artinya Buy/Sell/Number
    // dapet 60% lebar, Status 40%.
    BuyAreaRate : 0.6,

    helpHeight : function() {

        return Math.floor(Graphics.boxHeight * this.HelpHeightRate);

    },

    //--------------------------------------------------------------
    // Kolom Kiri -- Command ATAU Category (slot yang sama, gantian)
    //--------------------------------------------------------------
    // Tinggi window DIAMBIL dari tinggi window itu sendiri (sudah
    // otomatis pas berkat maxCols=1 + numVisibleRows berbasis
    // maxItems -- Command 3 baris, Category 4 baris, beda tinggi,
    // gak masalah karena cuma 1 yang keliatan di satu waktu).
    //--------------------------------------------------------------
    leftTopRect : function(scene, win) {

        return new Rectangle(0, 0, this.LeftColumnWidth, win.height);

    },

    //--------------------------------------------------------------
    // Kolom Kiri -- Gold (SELALU pojok kiri bawah, gak peduli
    // tinggi Command/Category di atasnya).
    //--------------------------------------------------------------
    goldRect : function(scene) {

        var y = Graphics.boxHeight - scene._goldWindow.height;

        return new Rectangle(0, y, scene._goldWindow.width, scene._goldWindow.height);

    },

    //--------------------------------------------------------------
    // Kolom Kanan -- Area atas penuh (dummy window / placeholder
    // sebelum Buy atau Sell dipilih).
    //--------------------------------------------------------------
    rightAreaRect : function(scene) {

        var x = this.LeftColumnWidth;

        var width = Graphics.boxWidth - x;

        var height = Graphics.boxHeight - this.helpHeight();

        return new Rectangle(x, 0, width, height);

    },

    //--------------------------------------------------------------
    // Kolom Kanan -- Bagian KIRI dari area atas: dipakai gantian
    // oleh Buy / Sell / Number (posisi & ukuran SAMA PERSIS untuk
    // ketiganya, sesuai permintaan).
    //--------------------------------------------------------------
    leftPaneRect : function(scene) {

        var area = this.rightAreaRect(scene);

        var width = Math.floor(area.width * this.BuyAreaRate);

        return new Rectangle(area.x, area.y, width, area.height);

    },

    //--------------------------------------------------------------
    // Kolom Kanan -- Bagian KANAN dari area atas: Status Window.
    //--------------------------------------------------------------
    rightPaneRect : function(scene) {

        var area = this.rightAreaRect(scene);

        var leftWidth = Math.floor(area.width * this.BuyAreaRate);

        return new Rectangle(area.x + leftWidth, area.y, area.width - leftWidth, area.height);

    },

    //--------------------------------------------------------------
    // Kolom Kanan -- Help (bawah, gak pernah berubah posisi).
    //--------------------------------------------------------------
    helpRect : function(scene) {

        var x = this.LeftColumnWidth;

        var width = Graphics.boxWidth - x;

        var height = this.helpHeight();

        var y = Graphics.boxHeight - height;

        return new Rectangle(x, y, width, height);

    }

};

//=============================================================================
// Force Window Rect
//=============================================================================
// Sama kayak SciFi.ItemUI.forceWindowRect / SciFi.EquipUI.
// forceWindowRect -- reposisi window + bikin ulang contents +
// refresh, dipanggil SEBELUM drawWindow() (biar border digambar
// sesuai ukuran final) dan SEKALI LAGI SETELAH drawWindow() (karena
// drawWindow() reset contents window).
//=============================================================================

SciFi.ShopUI.forceWindowRect = function(win, rect) {

    if (!win || !rect) {
        return;
    }

    win.move(rect.x, rect.y, rect.width, rect.height);

    if (win.createContents) {

        win.createContents();

    }

    if (win.refresh) {

        win.refresh();

    }

};

//=============================================================================
// Window_ShopCommand -- Vertikal (biar seragam sama Category)
//=============================================================================
// Window_ShopCommand TERNYATA nge-hardcode numVisibleRows() = 1
// sendiri (persis kasus Window_HorzCommand di Window_ItemCategory
// kemarin) -- maxCols=1 SAJA gak cukup, numVisibleRows() WAJIB
// di-override juga supaya windowHeight() beneran ngikutin
// maxItems() (3 command, atau 2 kalau purchaseOnly).
//=============================================================================

Window_ShopCommand.prototype.maxCols = function() {

    return 1;

};

Window_ShopCommand.prototype.numVisibleRows = function() {

    return this.maxItems();

};

Window_ShopCommand.prototype.itemTextAlign = function() {

    return "left";

};

//=============================================================================
// Window_ShopBuy -- Panel Background per Item (dari SciFi_UICore)
//=============================================================================

SciFi.ShopUI.BuyListLayout = {

    PanelMargin : 8,

    PriceWidth : 96

};

Window_ShopBuy.prototype.maxCols = function() {

    return 1;

};

Window_ShopBuy.prototype.itemRect = function(index) {

    var margin = SciFi.ShopUI.BuyListLayout.PanelMargin;

    var width = this.contentsWidth() - margin * 2;

    var height = this.itemHeight();

    var x = margin;

    var y = margin + index * (height + margin) - this._scrollY;

    return new Rectangle(x, y, width, height);

};

Window_ShopBuy.prototype.drawItem = function(index) {

    var item = this._data[index];

    if (!item) {
        return;
    }

    var rect = this.itemRect(index);

    //------------------------------------------------------------
    // Panel Background
    //------------------------------------------------------------

    SciFi.UICore.drawPanel(this, rect.x, rect.y, rect.width, rect.height);

    SciFi.UICore.applyFontStyle(this);

    var innerPad = this.textPadding();

    var priceWidth = SciFi.ShopUI.BuyListLayout.PriceWidth;

    this.changePaintOpacity(this.isEnabled(item));

    this.drawItemName(

        item,

        rect.x + innerPad,

        rect.y,

        rect.width - priceWidth - innerPad * 2

    );

    this.resetTextColor();

    this.drawText(

        this.price(item),

        rect.x,

        rect.y,

        rect.width - innerPad,

        "right"

    );

    this.changePaintOpacity(true);

};

//=============================================================================
// Window_ShopSell -- 1 Kolom (nimpa 2 kolom bawaan Window_ItemList)
//=============================================================================
// itemWidth()/itemRect() dari Window_ItemList (SciFi_ItemUI) sudah
// generik berdasarkan this.maxCols(), jadi cukup override maxCols
// di sini -- otomatis jadi 1 kolom penuh selebar window, mirip
// Window_ShopBuy, tanpa perlu nulis ulang itemRect/itemWidth.
//=============================================================================

Window_ShopSell.prototype.maxCols = function() {

    return 1;

};

//=============================================================================
// Window_ShopSell -- Sambungkan ke Status Window
//=============================================================================
// Vanilla MV TIDAK punya method ini di Window_ShopSell (beda dari
// Window_ShopBuy yang punya) -- soalnya bawaan MV emang gak pernah
// nampilin Status Window pas mode Sell (commandSell() bawaan
// nyembunyiinnya). Karena kita SENGAJA nampilin Status pas Sell
// juga (lihat commandSell() di bawah), wiring ini WAJIB ditambah
// biar isinya ke-update ngikutin item yang lagi disorot di list
// jual -- tanpa ini, Status bakal kelihatan tapi isinya kosong/gak
// pernah berubah.
//=============================================================================

Window_ShopSell.prototype.setStatusWindow = function(statusWindow) {

    this._statusWindow = statusWindow;

    this.updateHelp();

};

Window_ShopSell.prototype.updateHelp = function() {

    Window_ItemList.prototype.updateHelp.call(this);

    if (this._statusWindow) {

        this._statusWindow.setItem(this.item());

    }

};

//=============================================================================
// Window_ShopSell -- Shadow makeItemList() Window_ItemList
//=============================================================================
// Lihat catatan panjang di header file soal kenapa ini perlu
// di-override ULANG (bukan cuma dibiarkan inherit dari
// Window_ItemList): instance yang lagi kepasang di aktor TIDAK
// boleh muncul sebagai pilihan buat dijual.
//
// drawItem/itemRect/itemWidth/maxCols/itemHeight TETAP inherit dari
// Window_ItemList (SciFi_ItemUI) apa adanya -- panel background +
// baris info durability/shield tetap kepakai, cuma DATA-nya yang
// dipersempit di sini.
//=============================================================================

Window_ShopSell.prototype.makeItemList = function() {

    this._data = [];

    var self = this;

    var allItems = $gameParty.allItems();

    for (var i = 0; i < allItems.length; i++) {

        var it = allItems[i];

        if (!self.includes(it)) {
            continue;
        }

        if (SciFi.ItemUI.hasInstances(it)) {

            var instances = SciFi.EquipmentData.instancesOfBaseItem(it.id);

            for (var j = 0; j < instances.length; j++) {

                // Cuma yang nganggur di pool -- yang lagi kepasang
                // di aktor manapun sengaja DILEWATIN, gak boleh
                // dijual langsung tanpa dilepas dulu.
                if (instances[j].location === "pool") {

                    self._data.push({

                        item : it,

                        uid : instances[j].uid,

                        actorName : null

                    });

                }

            }

        } else {

            if ($gameParty.numItems(it) > 0) {

                self._data.push({ item : it, uid : null, actorName : null });

            }

        }

    }

};

//=============================================================================
// Scene_Shop -- Layout 2 Kolom
//=============================================================================

var _SciFi_ShopUI_SceneShop_create = Scene_Shop.prototype.create;

Scene_Shop.prototype.create = function() {

    _SciFi_ShopUI_SceneShop_create.call(this);

    this.applyScifiShopStyle();

};

Scene_Shop.prototype.applyScifiShopStyle = function() {

    //------------------------------------------------------------
    // 1) Reposisi SEMUA window ke rect final DULU -- WAJIB sebelum
    // drawWindow(), supaya border yang digambar sesuai ukuran yang
    // benar (lihat lesson learned di SciFi_ItemUI/SciFi_EquipUI).
    //------------------------------------------------------------

    this.reapplyScifiShopLayout();

    //------------------------------------------------------------
    // 2) Gambar border/background (ukuran window sekarang sudah benar).
    //------------------------------------------------------------

    var windows = [

        this._helpWindow,

        this._goldWindow,

        this._commandWindow,

        this._dummyWindow,

        this._numberWindow,

        this._statusWindow,

        this._buyWindow,

        this._categoryWindow,

        this._sellWindow

    ];

    for (var i = 0; i < windows.length; i++) {

        if (windows[i]) {

            SciFi.UICore.drawWindow(windows[i]);

        }

    }

    //------------------------------------------------------------
    // 3) drawWindow() reset contents window -- panggil ulang biar
    // gak ke-clip. Posisi/ukuran sudah benar dari langkah 1.
    //------------------------------------------------------------

    this.reapplyScifiShopLayout();

};

Scene_Shop.prototype.reapplyScifiShopLayout = function() {

    var layout = SciFi.ShopUI.SceneLayout;

    // Kiri-atas: Command & Category numpuk di slot yang sama,
    // masing-masing pakai tinggi alaminya sendiri.
    SciFi.ShopUI.forceWindowRect(this._commandWindow, layout.leftTopRect(this, this._commandWindow));

    SciFi.ShopUI.forceWindowRect(this._categoryWindow, layout.leftTopRect(this, this._categoryWindow));

    // Kiri-bawah: Gold, pin ke pojok bawah.
    SciFi.ShopUI.forceWindowRect(this._goldWindow, layout.goldRect(this));

    // Kanan-atas: Dummy (placeholder) penuh, atau Buy/Sell/Number
    // (kiri) + Status (kanan) -- posisi Buy/Sell/Number SAMA PERSIS.
    SciFi.ShopUI.forceWindowRect(this._dummyWindow, layout.rightAreaRect(this));

    SciFi.ShopUI.forceWindowRect(this._buyWindow, layout.leftPaneRect(this));

    SciFi.ShopUI.forceWindowRect(this._sellWindow, layout.leftPaneRect(this));

    SciFi.ShopUI.forceWindowRect(this._numberWindow, layout.leftPaneRect(this));

    SciFi.ShopUI.forceWindowRect(this._statusWindow, layout.rightPaneRect(this));

    // Kanan-bawah: Help, gak pernah pindah.
    SciFi.ShopUI.forceWindowRect(this._helpWindow, layout.helpRect(this));

};

//=============================================================================
// Command <-> Category: sembunyikan salah satunya
//=============================================================================
// Lihat catatan panjang di header file. Command & Category numpuk
// di posisi yang sama di layout ini (beda dengan bawaan MV yang
// naruh mereka di tempat terpisah), jadi HARUS ditambah show()/
// hide() manual supaya gak keliatan bertumpuk.
//=============================================================================

var _SciFi_ShopUI_SceneShop_commandSell = Scene_Shop.prototype.commandSell;

Scene_Shop.prototype.commandSell = function() {

    _SciFi_ShopUI_SceneShop_commandSell.call(this);

    this._commandWindow.hide();

    this._statusWindow.show();

};

var _SciFi_ShopUI_SceneShop_createSellWindow = Scene_Shop.prototype.createSellWindow;

Scene_Shop.prototype.createSellWindow = function() {

    _SciFi_ShopUI_SceneShop_createSellWindow.call(this);

    // Bawaan MV gak manggil ini sama sekali (lihat catatan di
    // Window_ShopSell.prototype.setStatusWindow di atas).
    this._sellWindow.setStatusWindow(this._statusWindow);

};

var _SciFi_ShopUI_onCategoryOk = Scene_Shop.prototype.onCategoryOk;

Scene_Shop.prototype.onCategoryOk = function() {

    _SciFi_ShopUI_onCategoryOk.call(this);

    this._statusWindow.show();          // pastikan tampil

    this._statusWindow.refresh();       // redraw konten
};

var _SciFi_ShopUI_SceneShop_onCategoryCancel = Scene_Shop.prototype.onCategoryCancel;

Scene_Shop.prototype.onCategoryCancel = function() {

    _SciFi_ShopUI_SceneShop_onCategoryCancel.call(this);

    this._commandWindow.show();

    this._statusWindow.hide();   // ← tambahan: sembunyikan status window saat kembali ke command

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("ShopUI v0.1.0 Loaded");

})();