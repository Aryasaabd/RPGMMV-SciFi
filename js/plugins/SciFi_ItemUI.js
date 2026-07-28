/*:
 * @plugindesc SciFi Item UI v0.3.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Item UI
 * ============================================================================
 *
 * Restyle Scene_Item jadi 2 kolom:
 *
 *   [Kolom Kiri]                 [Kolom Kanan]
 *   Category Window (atas,       Item Window (atas, 2 kolom,
 *   vertikal, style command      tiap item ada panel background
 *   list kayak menu utama)       dari SciFi_UICore)
 *
 *   Gold Window (bawah,          Help/Description Window (bawah,
 *   terpisah dari Category,      tinggi = rasio dari tinggi layar)
 *   style sama kayak di Menu)
 *
 * Actor Window (target select waktu pakai Consumable) cuma
 * ditambahin border/background SciFi_UICore -- tampilan carousel
 * kartunya sendiri udah otomatis ke-inherit dari Window_MenuStatus
 * (SciFi_MenuUI), karena Window_MenuActor adalah turunannya.
 *
 * ----------------------------------------------------------------------
 * v0.1.0 -- Style/Layout Only
 * ----------------------------------------------------------------------
 * Versi awal: cuma restyle layout (2 kolom, panel background, dst),
 * Window_ItemList masih 1 baris per item id, tanpa info per-instance.
 *
 * ----------------------------------------------------------------------
 * v0.3.0 -- Tampilkan Item yang Lagi Dipakai Aktor
 * ----------------------------------------------------------------------
 * Sebelumnya cuma item yang beneran ada di $gameParty (bag) yang
 * kelihatan -- starting equipment (yang gak pernah lewat gainItem)
 * jadi gak keliatan di Item menu, TAPI instance-nya tetap kehitung
 * di instancesOfBaseItem(), bikin jumlah baris jadi ganjil begitu
 * ada unit lain dari item yang sama masuk lewat gainItem.
 *
 * Sekarang daftar item DIGABUNG dari 2 sumber: yang ada di bag +
 * yang lagi kepasang di aktor MANAPUN (termasuk cadangan). Baris
 * yang mewakili unit yang lagi dipakai aktor menampilkan NAMA AKTOR
 * itu (menggantikan angka jumlah), baris "stack" biasa tetap
 * menampilkan jumlah seperti sebelumnya. Berlaku baik untuk item
 * ber-instance (Armor/Shield Generator, tiap unit baris sendiri)
 * maupun yang tidak (senjata biasa, dll -- 1 baris stack + 1 baris
 * per aktor yang memakainya).
 *
 * ----------------------------------------------------------------------
 * PENTING -- Class yang dipakai bareng Scene_Shop
 * ----------------------------------------------------------------------
 * Window_ItemCategory dan Window_ItemList adalah class BAWAAN RPG Maker
 * MV yang juga dipakai Scene_Shop (kategori beli/jual & list barang).
 * Semua override di plugin ini (nama kategori, vertikal, maxCols,
 * panel background, dst) otomatis kebawa ke Scene_Shop begitu
 * Window_Shop dibikin nanti. Kalau ternyata gayanya beda dengan yang
 * dimau di shop, tinggal override lagi lebih spesifik di plugin
 * shop-nya (override yang lebih baru/lebih spesifik akan menang).
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_UICore
 *
 * Load Order:
 * - Setelah SciFi_Core & SciFi_UICore. Posisi relatif terhadap
 *   SciFi_MenuUI/SciFi_EquipUI bebas (tidak saling bergantung).
 */

var Imported = Imported || {};
Imported.SciFi_ItemUI = true;

var SciFi = SciFi || {};
SciFi.ItemUI = SciFi.ItemUI || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_ItemUI requires SciFi_Core.");
}

if (!Imported.SciFi_UICore) {
    throw new Error("SciFi_ItemUI requires SciFi_UICore.");
}

//=============================================================================
// Config: Nama Kategori
//=============================================================================
// key di sini HARUS sama dengan symbol command bawaan MV
// (item / weapon / armor / keyItem), cuma label yang ditampilkan
// yang diganti.
//=============================================================================

SciFi.ItemUI.CategoryNames = {

    item : "Consumable",

    weapon : "Armament",

    armor : "Apparel",

    keyItem : "Key Item"

};

//=============================================================================
// Config: Item List (Window_ItemList, kolom kanan atas)
//=============================================================================

SciFi.ItemUI.ItemListLayout = {

    // Berapa kolom item ditampilkan.
    Columns : 2,

    // Jarak antar panel & jarak panel ke tepi window (px), sesuai
    // permintaan: 8px semua sisi.
    PanelMargin : 8,

    // Tinggi 1 baris/panel item. Dibikin cukup buat 2 baris konten
    // (nama+icon di baris 1, info tambahan di baris 2) supaya SEMUA
    // panel seragam tingginya, walau isinya beda-beda (ada yang
    // baris 2-nya kosong).
    RowHeight : 68,

    // Font & posisi baris info tambahan (baris ke-2).
    InfoFontSize : 18,

    InfoOffsetY : 34

};

//=============================================================================
// Config: Scene Layout (posisi 2 kolom)
//=============================================================================
// Dihitung dari Graphics.boxWidth/boxHeight, otomatis menyesuaikan
// resolusi (termasuk 16:9 HD).
//=============================================================================

SciFi.ItemUI.SceneLayout = {

    // Tinggi Help/Description Window, sebagai rasio dari tinggi
    // layar penuh.
    HelpHeightRate : 0.22,

    //--------------------------------------------------------------
    // Lebar kolom kiri -- disamakan dengan lebar command window di
    // menu utama (240, nilai default mainCommandWidth() di MV),
    // sesuai permintaan "lebarnya sama kayak yang di menuUI".
    //
    // SENGAJA angka tetap (bukan manggil Scene_MenuBase.prototype.
    // mainCommandWidth()) karena Window_Gold ternyata juga dipakai
    // Window_Message (popup dapet uang) di Scene_Map, jauh sebelum
    // Scene_Menu ada -- manggil method dari Scene_MenuBase di titik
    // itu bikin error "is not a function" di project ini.
    //
    // Kalau menu utama kamu pakai lebar command window yang beda
    // dari 240, ubah angka ini juga biar tetap sinkron.
    //--------------------------------------------------------------
    LeftColumnWidth : 240,

    leftColumnWidth : function() {

        return this.LeftColumnWidth;

    },

    helpHeight : function() {

        return Math.floor(Graphics.boxHeight * this.HelpHeightRate);

    },

    //--------------------------------------------------------------
    // Kolom Kiri -- Category Window (atas)
    //--------------------------------------------------------------
    // Tinggi window ini sudah otomatis pas (lihat override
    // numVisibleRows() di bawah), jadi di sini cuma dipakai ulang
    // ukuran yang sudah benar tsb -- tetap dilewatin lewat
    // forceWindowRect supaya canvas-nya di-refresh ulang setelah
    // SciFi.UICore.drawWindow() (yang me-reset contents).
    //--------------------------------------------------------------
    categoryRect : function(scene) {

        return new Rectangle(

            0,

            0,

            scene._categoryWindow.width,

            scene._categoryWindow.height

        );

    },

    //--------------------------------------------------------------
    // Kolom Kiri -- Gold Window (SELALU nempel di pojok kiri BAWAH
    // layar, gak peduli category window tingginya berapa -- jadi
    // walau nanti kategori nambah banyak & category window jadi
    // lebih tinggi, Gold Window tetap diam di pojok bawah).
    //--------------------------------------------------------------
    goldRect : function(scene) {

        var y = Graphics.boxHeight - scene._goldWindow.height;

        return new Rectangle(

            0,

            y,

            scene._goldWindow.width,

            scene._goldWindow.height

        );

    },

    //--------------------------------------------------------------
    // Kolom Kanan -- Item Window (atas)
    //--------------------------------------------------------------
    itemRect : function(scene) {

        var x = this.leftColumnWidth();

        var width = Graphics.boxWidth - x;

        var height = Graphics.boxHeight - this.helpHeight();

        return new Rectangle(x, 0, width, height);

    },

    //--------------------------------------------------------------
    // Kolom Kanan -- Help/Description Window (bawah)
    //--------------------------------------------------------------
    helpRect : function(scene) {

        var x = this.leftColumnWidth();

        var width = Graphics.boxWidth - x;

        var height = this.helpHeight();

        var y = Graphics.boxHeight - height;

        return new Rectangle(x, y, width, height);

    }

};

//=============================================================================
// Force Window Rect
//=============================================================================
// Sama kayak SciFi.EquipUI.forceWindowRect: SciFi.UICore.drawWindow()
// me-reset ukuran contents window ke default, jadi setelah dipanggil
// HARUS di-move() + createContents() + refresh() ulang, kalau enggak
// bakal ke-clip. Pola ini sudah terbukti reliable di SciFi_EquipUI.
//=============================================================================

SciFi.ItemUI.forceWindowRect = function(win, rect) {

    if (!win) {
        return;
    }

    win.move(rect.x, rect.y, rect.width, rect.height);

    if (win.createContents) {

        win.createContents();

    }

    win.refresh();

};

//=============================================================================
// Instance Info Helpers
//=============================================================================
// Cuma Armor & Shield Generator yang punya instance (lihat
// SciFi_ItemInstance/SciFi_EquipmentData) -- item lain (Consumable,
// senjata biasa, Key Item) gak punya, jadi otomatis fallback ke
// tampilan 1 baris per item id seperti biasa (baris info kosong).
//=============================================================================

/*
 * True kalau item ini PUNYA instance yang sudah pernah dibuat
 * (baik lagi di pool atau lagi kepasang di aktor manapun).
 */
SciFi.ItemUI.hasInstances = function(item) {

    if (!Imported.SciFi_ItemInstance || !Imported.SciFi_EquipmentData) {
        return false;
    }

    if (!DataManager.isArmor(item)) {
        return false;
    }

    return SciFi.EquipmentData.instancesOfBaseItem(item.id).length > 0;

};

/*
 * Teks baris info (baris ke-2) untuk 1 instance tertentu.
 * Mengembalikan "" kalau gak ada apa-apa buat ditampilkan (uid
 * null, instance gak ketemu, atau gak punya shield/durability).
 */
SciFi.ItemUI.instanceInfoLine = function(item, uid) {

    if (!uid || !Imported.SciFi_ItemInstance) {
        return "";
    }

    var instance = SciFi.ItemInstance.get(uid);

    if (!instance) {
        return "";
    }

    if (instance.shield) {

        return "Shield : " +
            instance.shield.current + " / " + instance.shield.max;

    }

    if (instance.durability) {

        var base = Number(item.meta.Armor || 0);

        var ratio = instance.durability.max > 0 ?
            (instance.durability.current / instance.durability.max) : 0;

        var effective = Math.floor(base * ratio);

        return "Armor : " + effective + " / " + base +
            "   Durability : " +
            instance.durability.current + " / " + instance.durability.max;

    }

    return "";

};

/*
 * Key unik per item database (beda tipe tapi id sama harus dianggap
 * beda), dipakai buat de-duplikasi waktu ngumpulin daftar kandidat.
 */
SciFi.ItemUI.itemKey = function(item) {

    if (DataManager.isWeapon(item)) {
        return "weapon_" + item.id;
    }

    if (DataManager.isArmor(item)) {
        return "armor_" + item.id;
    }

    return "item_" + item.id;

};

/*
 * Semua item/weapon/armor yang PERLU dipertimbangkan buat
 * ditampilkan: yang lagi di bag ($gameParty.allItems()) DIGABUNG
 * sama yang lagi kepasang di aktor MANAPUN (termasuk aktor cadangan
 * yang lagi gak di party aktif), supaya starting equipment yang gak
 * pernah lewat gainItem tetap kelihatan.
 */
SciFi.ItemUI.collectCandidateItems = function() {

    var seen = {};

    var list = [];

    function add(it) {

        if (!it) {
            return;
        }

        var key = SciFi.ItemUI.itemKey(it);

        if (seen[key]) {
            return;
        }

        seen[key] = true;

        list.push(it);

    }

    var bagItems = $gameParty.allItems();

    for (var i = 0; i < bagItems.length; i++) {

        add(bagItems[i]);

    }

    var actors = $gameActors._data;

    for (var actorId = 1; actorId < actors.length; actorId++) {

        var actor = actors[actorId];

        if (!actor) {
            continue;
        }

        var equips = actor.equips();

        for (var slotId = 0; slotId < equips.length; slotId++) {

            add(equips[slotId]);

        }

    }

    return list;

};

/*
 * Semua {actor, slotId} yang lagi memasang item ini SECARA LANGSUNG
 * (perbandingan referensi objek $dataWeapons/$dataArmors/$dataItems,
 * bukan uid). Dipakai buat item TANPA sistem instance (senjata biasa,
 * offhand, accessory, frame, atau armor yang gak punya Durability/
 * Shield notetag) -- item DENGAN instance (Armor/Shield Generator)
 * udah otomatis kebawa "location: equipped" dari
 * SciFi.EquipmentData.instancesOfBaseItem(), gak lewat fungsi ini.
 */
SciFi.ItemUI.equippedEntries = function(item) {

    var result = [];

    var actors = $gameActors._data;

    for (var actorId = 1; actorId < actors.length; actorId++) {

        var actor = actors[actorId];

        if (!actor) {
            continue;
        }

        var equips = actor.equips();

        for (var slotId = 0; slotId < equips.length; slotId++) {

            if (equips[slotId] === item) {

                result.push({ actor : actor, slotId : slotId });

            }

        }

    }

    return result;

};

//=============================================================================
// Window_ItemCategory -- Vertikal, style command list menu utama
//=============================================================================

/*
 * Window_HorzCommand (parent Window_ItemCategory) nge-hardcode
 * maxCols() = 4 DAN numVisibleRows() = 1 (karena aslinya didesain
 * buat bar horizontal 1 baris). Dua-duanya HARUS di-override di sini
 * -- kalau cuma maxCols() doang, windowHeight() masih kepanggil lewat
 * numVisibleRows() versi lama (tetep 1), jadi window-nya cuma bakal
 * setinggi 1 baris dan 3 kategori lain kepotong.
 */

Window_ItemCategory.prototype.maxCols = function() {

    return 1;

};

Window_ItemCategory.prototype.numVisibleRows = function() {

    return this.maxItems();

};

Window_ItemCategory.prototype.itemTextAlign = function() {

    return "left";

};

Window_ItemCategory.prototype.windowWidth = function() {

    return SciFi.ItemUI.SceneLayout.leftColumnWidth();

};

/*
 * Ganti label kategori. Symbol tiap command TETAP sama seperti
 * bawaan MV (item/weapon/armor/keyItem), yang berubah cuma teks
 * yang ditampilkan.
 */
Window_ItemCategory.prototype.makeCommandList = function() {

    var names = SciFi.ItemUI.CategoryNames;

    this.addCommand(names.item, "item");

    this.addCommand(names.weapon, "weapon");

    this.addCommand(names.armor, "armor");

    this.addCommand(names.keyItem, "keyItem");

};

//=============================================================================
// Window_Gold -- Samakan lebar dengan kolom kiri
//=============================================================================
// Class ini SAMA yang dipakai Window_Gold di Scene_Menu (SciFi_MenuUI).
// Nilai leftColumnWidth() = mainCommandWidth() = 240 (default MV),
// jadi override ini tidak mengubah tampilan Scene_Menu yang sudah ada.
//=============================================================================

Window_Gold.prototype.windowWidth = function() {

    return SciFi.ItemUI.SceneLayout.leftColumnWidth();

};

//=============================================================================
// Window_ItemList -- 2 Kolom + Panel Background + Baris Info Instance
//=============================================================================
// CATATAN PENTING soal Window_EquipItem:
//
// Window_EquipItem (dipakai di SciFi_EquipUI) adalah SUBCLASS dari
// Window_ItemList ini. drawItem(), makeItemList(), dan itemHeight()
// SUDAH di-override langsung di Window_EquipItem.prototype oleh
// SciFi_EquipUI, jadi override kita di sini otomatis KETUTUP/gak
// kepake buat Window_EquipItem (aman, gak perlu di-guard).
//
// TAPI itemRect(), itemWidth(), dan maxCols() TIDAK di-override di
// SciFi_EquipUI (dia masih pakai punya Window_ItemList apa adanya),
// jadi 3 fungsi itu WAJIB di-guard supaya gak ikut ngerusak layout
// gauge yang udah dibikin di Equip scene -- kalau instance-nya
// Window_EquipItem, balikin ke behavior asli Window_Selectable.
//=============================================================================

Window_ItemList.prototype.itemAt = function(index) {

    var entry = this._data ? this._data[index] : null;

    return entry ? entry.item : null;

};

Window_ItemList.prototype.item = function() {

    return this.itemAt(this.index());

};

Window_ItemList.prototype.entryAt = function(index) {

    return this._data ? this._data[index] : null;

};

Window_ItemList.prototype.maxCols = function() {

    if (this instanceof Window_EquipItem) {

        return 2;

    }

    return SciFi.ItemUI.ItemListLayout.Columns;

};

/*
 * Lebar 1 kolom item, sudah memperhitungkan margin di semua sisi +
 * margin antar kolom, supaya total persis pas dengan contentsWidth().
 */
Window_ItemList.prototype.itemWidth = function() {

    if (this instanceof Window_EquipItem) {

        return Window_Selectable.prototype.itemWidth.call(this);

    }

    var margin = SciFi.ItemUI.ItemListLayout.PanelMargin;

    var cols = this.maxCols();

    return (this.contentsWidth() - margin * (cols + 1)) / cols;

};

Window_ItemList.prototype.itemHeight = function() {

    return SciFi.ItemUI.ItemListLayout.RowHeight;

};

/*
 * Grid manual (bukan pakai spacing() bawaan) supaya margin antar
 * panel & margin ke tepi window persis 8px sesuai permintaan.
 */
Window_ItemList.prototype.itemRect = function(index) {

    if (this instanceof Window_EquipItem) {

        return Window_Selectable.prototype.itemRect.call(this, index);

    }

    var margin = SciFi.ItemUI.ItemListLayout.PanelMargin;

    var cols = this.maxCols();

    var col = index % cols;

    var row = Math.floor(index / cols);

    var width = this.itemWidth();

    var height = this.itemHeight();

    var x = margin + col * (width + margin);

    var y = margin + row * (height + margin) - this._scrollY;

    return new Rectangle(x, y, width, height);

};

/*
 * Bikin _data jadi array {item, uid, actorName}.
 *
 * - Armor/Shield Generator (punya instance): 1 baris per UNIT yang
 *   pernah dibuat instance-nya -- baik yang lagi nganggur di pool
 *   (actorName: null) MAUPUN yang lagi kepasang di aktor manapun
 *   (actorName: nama aktor itu, biar jelas siapa yang pakai).
 * - Item lain (Consumable, senjata biasa, Key Item, dst): 1 baris
 *   "stack" kalau ada yang nganggur di bag (actorName: null, jumlah
 *   ditampilkan seperti biasa), DITAMBAH 1 baris terpisah per aktor
 *   yang lagi memakainya (actorName diisi, gak ada jumlah).
 *
 * View-only -- belum ada aksi apa-apa yang dibedain berdasarkan uid/
 * actorName di sini. onItemOk tetap pakai perilaku "use item" bawaan
 * MV apa adanya.
 */
Window_ItemList.prototype.makeItemList = function() {

    this._data = [];

    var self = this;

    var candidates = SciFi.ItemUI.collectCandidateItems();

    for (var i = 0; i < candidates.length; i++) {

        var it = candidates[i];

        if (!self.includes(it)) {
            continue;
        }

        if (SciFi.ItemUI.hasInstances(it)) {

            self.pushInstanceRows(it);

        } else {

            self.pushPlainRows(it);

        }

    }

};

Window_ItemList.prototype.pushInstanceRows = function(item) {

    var instances = SciFi.EquipmentData.instancesOfBaseItem(item.id);

    for (var i = 0; i < instances.length; i++) {

        var entry = instances[i];

        var actorName = null;

        if (entry.location === "equipped") {

            var actor = $gameActors.actor(entry.actorId);

            actorName = actor ? actor.name() : null;

        }

        this._data.push({

            item : item,

            uid : entry.uid,

            actorName : actorName

        });

    }

};

Window_ItemList.prototype.pushPlainRows = function(item) {

    var count = $gameParty.numItems(item);

    if (count > 0) {

        this._data.push({ item : item, uid : null, actorName : null });

    }

    var equipped = SciFi.ItemUI.equippedEntries(item);

    for (var i = 0; i < equipped.length; i++) {

        this._data.push({

            item : item,

            uid : null,

            actorName : equipped[i].actor.name()

        });

    }

};

Window_ItemList.prototype.drawItem = function(index) {

    var entry = this.entryAt(index);

    if (!entry || !entry.item) {
        return;
    }

    var item = entry.item;

    var rect = this.itemRect(index);

    //------------------------------------------------------------
    // Panel Background (dari SciFi_UICore)
    //------------------------------------------------------------

    SciFi.UICore.drawPanel(this, rect.x, rect.y, rect.width, rect.height);

    SciFi.UICore.applyFontStyle(this);

    var innerPad = this.textPadding();

    var line1Width = rect.width - innerPad * 2;

    this.changePaintOpacity(this.isEnabled(item));

    //------------------------------------------------------------
    // Baris 1 : Icon + Nama, lalu salah satu dari:
    // - Nama aktor (kalau unit ini lagi kepasang di aktor tertentu)
    // - Jumlah (kalau ini baris "stack" biasa, gak ada uid/actorName)
    // - Kosong (unit instance yang lagi nganggur di pool)
    //------------------------------------------------------------

    var numberWidth = this.numberWidth();

    if (entry.actorName) {

        this.drawItemName(

            item,

            rect.x + innerPad,

            rect.y,

            line1Width - numberWidth

        );

        this.changeTextColor(this.systemColor());

        this.drawText(

            entry.actorName,

            rect.x,

            rect.y,

            rect.width - innerPad,

            "right"

        );

        this.resetTextColor();

    } else if (!entry.uid) {

        this.drawItemName(

            item,

            rect.x + innerPad,

            rect.y,

            line1Width - numberWidth

        );

        this.drawItemNumber(

            item,

            rect.x,

            rect.y,

            rect.width - innerPad

        );

    } else {

        this.drawItemName(item, rect.x + innerPad, rect.y, line1Width);

    }

    //------------------------------------------------------------
    // Baris 2 : Info tambahan (Armor/Durability atau Shield).
    // Kosong (gak gambar apa-apa) kalau item ini gak punya --
    // tinggi panel tetap sama (RowHeight seragam semua item).
    //------------------------------------------------------------

    var infoLine = SciFi.ItemUI.instanceInfoLine(item, entry.uid);

    if (infoLine) {

        var oldSize = this.contents.fontSize;

        this.contents.fontSize = SciFi.ItemUI.ItemListLayout.InfoFontSize;

        this.changeTextColor(this.systemColor());

        this.drawText(

            infoLine,

            rect.x + innerPad,

            rect.y + SciFi.ItemUI.ItemListLayout.InfoOffsetY,

            rect.width - innerPad * 2,

            "right"

        );

        this.resetTextColor();

        this.contents.fontSize = oldSize;

    }

    this.changePaintOpacity(true);

};

//=============================================================================
// Window_Help -- Style Border SciFi_UICore
//=============================================================================
// Cuma border/background, isi teksnya tetap pakai drawTextEx bawaan.
//=============================================================================

// (Tidak perlu override apa pun di sini -- border ditangani lewat
// SciFi.UICore.drawWindow() di Scene_Item, dan resize lewat
// forceWindowRect. Kalau butuh font style konsisten kayak window
// lain, tambahkan override resetFontSettings di sini nanti.)

//=============================================================================
// Scene_Item -- Layout 2 Kolom
//=============================================================================

var _SciFi_ItemUI_SceneItem_create = Scene_Item.prototype.create;

Scene_Item.prototype.create = function() {

    _SciFi_ItemUI_SceneItem_create.call(this);

    this.createScifiGoldWindow();

    this.applyScifiItemStyle();

};

/*
 * Scene_Item bawaan MV TIDAK punya Gold Window (beda dengan
 * Scene_Menu). Ditambahkan di sini karena diminta muncul persis
 * seperti di Menu.
 */
Scene_Item.prototype.createScifiGoldWindow = function() {

    this._goldWindow = new Window_Gold();

    this.addWindow(this._goldWindow);

};

Scene_Item.prototype.applyScifiItemStyle = function() {

    //------------------------------------------------------------
    // 1) Pindah & resize semua window ke ukuran FINAL dulu.
    //
    // PENTING: ini harus jalan SEBELUM SciFi.UICore.drawWindow(),
    // karena drawWindow() bikin bitmap border berdasarkan
    // window.width/height SAAT DIPANGGIL. Kalau window masih di
    // ukuran default bawaan MV waktu drawWindow() jalan, border-nya
    // bakal kegambar sesuai ukuran lama itu -- makanya sebelumnya
    // border kanan kelihatan hilang / window kelihatan "renggang"
    // (border-nya ada, tapi ukurannya gak sesuai window yang
    // sebenarnya).
    //------------------------------------------------------------

    this.reapplyScifiItemLayout();

    //------------------------------------------------------------
    // 2) Gambar border/background (ukuran window sekarang sudah benar).
    //------------------------------------------------------------

    var windows = [

        this._categoryWindow,

        this._goldWindow,

        this._itemWindow,

        this._helpWindow,

        this._actorWindow

    ];

    for (var i = 0; i < windows.length; i++) {

        if (windows[i]) {

            SciFi.UICore.drawWindow(windows[i]);

        }

    }

    //------------------------------------------------------------
    // 3) drawWindow() me-reset contents window (bug yang sudah
    // diketahui dari SciFi_EquipUI) -- panggil ulang supaya isi
    // window (teks/panel item) gak ke-clip. Posisi/ukuran sudah
    // benar dari langkah 1, jadi panggilan ke-2 ini murni buat
    // bikin ulang canvas + refresh.
    //------------------------------------------------------------

    this.reapplyScifiItemLayout();

};

Scene_Item.prototype.reapplyScifiItemLayout = function() {

    var layout = SciFi.ItemUI.SceneLayout;

    SciFi.ItemUI.forceWindowRect(this._categoryWindow, layout.categoryRect(this));

    SciFi.ItemUI.forceWindowRect(this._goldWindow, layout.goldRect(this));

    SciFi.ItemUI.forceWindowRect(this._itemWindow, layout.itemRect(this));

    SciFi.ItemUI.forceWindowRect(this._helpWindow, layout.helpRect(this));

    // Actor Window (target select) tetap di ukuran/posisi bawaan --
    // cuma di-"refresh" canvas-nya biar gak ke-clip abis drawWindow().
    if (this._actorWindow) {

        SciFi.ItemUI.forceWindowRect(

            this._actorWindow,

            new Rectangle(

                this._actorWindow.x,

                this._actorWindow.y,

                this._actorWindow.width,

                this._actorWindow.height

            )

        );

    }

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("ItemUI v0.3.0 Loaded");

})();