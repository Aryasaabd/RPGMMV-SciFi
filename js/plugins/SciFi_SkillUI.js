/*:
 * @plugindesc SciFi Skill UI v0.1.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi Skill UI
 * ============================================================================
 *
 * Re-layout Scene_Skill jadi 4 area:
 *
 *   [Kolom A]        [Kolom B]           [Kolom C]
 *   Actor Panel      Skill Type          Skill List
 *   (foto + gauge,   (tombol jenis       (daftar skill,
 *   sama gayanya     skill, tengah)      kanan atas)
 *   kayak EquipUI)
 *
 *   [Help / Description Window]
 *   (deskripsi skill, bawah, membentang penuh dari kiri ke kanan)
 *
 * Actor panel (Window_SkillActorPanel) adalah duplikat gaya dari
 * Window_EquipActorPanel di SciFi_EquipUI: foto cover-crop, gradient
 * di bawah foto, lalu gauge Shield/HP/Stamina/Momentum.
 *
 * Window_SkillStatus bawaan MV (yang biasanya nampilin foto kecil +
 * MP/TP aktor) DIHILANGKAN sepenuhnya, digantikan actor panel di
 * atas.
 *
 * Semua ukuran window diatur lewat rasio di SciFi.SkillUI.SceneLayout,
 * jadi gampang diubah kalau perlu diseting ulang.
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_UICore
 * - SciFi_MenuUI (untuk sumber foto portrait)
 */

var Imported = Imported || {};
Imported.SciFi_SkillUI = true;

var SciFi = SciFi || {};
SciFi.SkillUI = SciFi.SkillUI || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_SkillUI requires SciFi_Core.");
}

if (!Imported.SciFi_UICore) {
    throw new Error("SciFi_SkillUI requires SciFi_UICore.");
}

//=============================================================================
// Config: Actor Panel (Window_SkillActorPanel, kolom A)
//=============================================================================

SciFi.SkillUI.ActorPanelLayout = {

    // Tinggi area foto aktor (di dalam actor panel).
    PhotoHeight : 576

};

// Gradasi hitam transparan di bagian BAWAH foto, transisi ke area
// gauge -- gaya sama kayak Window_EquipActorPanel.
SciFi.SkillUI.ActorPanelGradient = {

    Height : 200,

    StartAlpha : 0.9

};

// Jarak vertikal antar baris gauge.
SciFi.SkillUI.ActorPanelGaugeGap = 36;

//=============================================================================
// Config: Panel Window_SkillType (kolom B)
//=============================================================================
// Panel 1 = latar judul "Skill Type" (atas).
// Panel 2 = latar sisa area di bawahnya, tempat pilihan skill type
// digambar di atasnya.
//=============================================================================

SciFi.SkillUI.SkillTypeLayout = {

    Margin : 8,

    PanelGap : 8,

    TitleText : "Skill Type",

    TitleFontSize : 24,

    // Tinggi panel judul (di luar margin).
    TitleHeight : 40

};

//=============================================================================
// Config: Panel Window_SkillList (kolom C)
//=============================================================================
// Tiap skill dapet panel sendiri-sendiri. Kalau slotnya kosong (gak
// ada skill), gak ada panel yang digambar sama sekali.
//=============================================================================

SciFi.SkillUI.ListLayout = {

    Margin : 8,

    PanelGap : 8,

    // Tinggi 1 baris (SUDAH termasuk PanelGap -- panel sendiri
    // digambar lebih pendek dari ini supaya sisanya jadi jarak ke
    // panel berikutnya).
    RowHeight : 68

};

//=============================================================================
// Portrait Crop Offset
//=============================================================================
// Sama konsepnya kayak SciFi.EquipUI.portraitOffset(): x/y 0 = nempel
// kiri/atas, 0.5 = tengah, 1 = nempel kanan/bawah.
//=============================================================================

SciFi.SkillUI.PortraitOffsetDefault = { x : 1, y : 1 };

// Override per id aktor kalau posisi wajah di tiap foto beda-beda.
// Contoh: SciFi.SkillUI.PortraitOffsets[1] = { x : 0.5, y : 0.15 };
SciFi.SkillUI.PortraitOffsets = {};

SciFi.SkillUI.portraitOffset = function(actor) {

    var custom = SciFi.SkillUI.PortraitOffsets[actor.actorId()];

    return custom || SciFi.SkillUI.PortraitOffsetDefault;

};

//=============================================================================
// Config: Scene Layout (rasio kolom & baris)
//=============================================================================
// Semua dihitung dari Graphics.boxWidth/boxHeight, otomatis
// menyesuaikan resolusi (termasuk 16:9 HD).
//=============================================================================

SciFi.SkillUI.SceneLayout = {

    // Rasio lebar kolom A (actor panel) & B (skill type) dari lebar
    // layar. Kolom C (skill list) otomatis dapet sisanya.
    ColumnARate : 0.22,
    ColumnBRate : 0.25,

    // Rasio tinggi Help/Description Window (bawah) dari tinggi layar.
    HelpHeightRate : 0.20,

    //--------------------------------------------------------------
    // Tinggi area atas (Actor Panel / Skill Type / Skill List),
    // yaitu sisa layar setelah dikurangi Help Window di bawah.
    //
    // SENGAJA dihitung langsung dari HelpHeightRate (BUKAN dari
    // scene._helpWindow.height). Actor panel dibuat duluan (nebeng
    // di createHelpWindow) SEBELUM _helpWindow di-resize ke ukuran
    // final-nya (baru di-resize belakangan, di createItemWindow),
    // jadi kalau baca .height di sini hasilnya masih ukuran default
    // Window_Help bawaan MV yang kecil, bikin actor panel kegedean
    // dan tabrakan sama help window versi final.
    //--------------------------------------------------------------
    topAreaHeight : function(scene) {

        var helpHeight = Math.floor(Graphics.boxHeight * this.HelpHeightRate);

        return Graphics.boxHeight - helpHeight;

    },

    //--------------------------------------------------------------
    // Help / Description Window - bawah, membentang penuh
    //--------------------------------------------------------------
    helpRect : function(scene) {

        var height = Math.floor(Graphics.boxHeight * this.HelpHeightRate);

        var y = Graphics.boxHeight - height;

        return new Rectangle(0, y, Graphics.boxWidth, height);

    },

    //--------------------------------------------------------------
    // Kolom A - Actor Panel
    //--------------------------------------------------------------
    actorPanelRect : function(scene) {

        var width = Math.floor(Graphics.boxWidth * this.ColumnARate);

        var height = this.topAreaHeight(scene);

        return new Rectangle(0, 0, width, height);

    },

    //--------------------------------------------------------------
    // Kolom B - Skill Type (tombol jenis skill)
    //--------------------------------------------------------------
    skillTypeRect : function(scene) {

        var x = scene._actorPanelWindow.width;

        var width = Math.floor(Graphics.boxWidth * this.ColumnBRate);

        var height = this.topAreaHeight(scene);

        return new Rectangle(x, 0, width, height);

    },

    //--------------------------------------------------------------
    // Kolom C - Skill List
    //--------------------------------------------------------------
    itemRect : function(scene) {

        var x = scene._actorPanelWindow.width + scene._skillTypeWindow.width;

        var width = Graphics.boxWidth - x;

        var height = this.topAreaHeight(scene);

        return new Rectangle(x, 0, width, height);

    }

};

//=============================================================================
// Window_SkillActorPanel - Kolom A
//=============================================================================
// Duplikat gaya dari Window_EquipActorPanel (SciFi_EquipUI): foto +
// nama + gauge current (Shield/HP/Stamina/Momentum).
//=============================================================================

function Window_SkillActorPanel() {

    this.initialize.apply(this, arguments);

}

Window_SkillActorPanel.prototype = Object.create(Window_Base.prototype);
Window_SkillActorPanel.prototype.constructor = Window_SkillActorPanel;

Window_SkillActorPanel.prototype.initialize = function(x, y, width, height) {

    Window_Base.prototype.initialize.call(this, x, y, width, height);

    this._actor = null;

    this.refresh();

};

Window_SkillActorPanel.prototype.setActor = function(actor) {

    if (this._actor !== actor) {

        this._actor = actor;

        this.refresh();

    }

};

Window_SkillActorPanel.prototype.refresh = function() {

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
    // Foto (sumber sama kayak SciFi_MenuUI, cover + bisa digeser)
    //------------------------------------------------------------

    this.drawPortrait(y);

    this.drawPhotoGradient(y);

    y += SciFi.SkillUI.ActorPanelLayout.PhotoHeight + 12;

    //------------------------------------------------------------
    // Gauge Current
    //------------------------------------------------------------

    this.drawResourceGauges(y);

};

Window_SkillActorPanel.prototype.drawPhotoGradient = function(photoTopY) {

    var cfg = SciFi.SkillUI.ActorPanelGradient;

    var h = cfg.Height;

    var w = this.contentsWidth();

    var bottom = photoTopY + SciFi.SkillUI.ActorPanelLayout.PhotoHeight;

    for (var i = 0; i < h; i++) {

        var rate = i / h;

        var alpha = cfg.StartAlpha * rate;

        this.contents.fillRect(

            0,

            bottom - h + i - 70,

            w,

            1,

            "rgba(0,0,0," + alpha + ")"

        );

    }

};

Window_SkillActorPanel.prototype.drawPortrait = function(y) {

    var actor = this._actor;

    var w = this.contentsWidth();

    var h = SciFi.SkillUI.ActorPanelLayout.PhotoHeight;

    // Fallback ke foto wajah bawaan MV kalau SciFi_MenuUI (sumber
    // foto) belum ke-load.
    if (!Imported.SciFi_MenuUI || !SciFi.MenuUI || !SciFi.MenuUI.loadPortrait) {

        this.drawActorFace(actor, 0, y);

        return;

    }

    var bitmap = SciFi.MenuUI.loadPortrait(actor);

    if (!bitmap.isReady()) {

        bitmap.addLoadListener(this.refresh.bind(this));

        return;

    }

    this.drawPortraitCover(bitmap, 0, y, w, h);

};

/*
 * Gambar bitmap dengan mode "cover": dizoom secukupnya biar penuh
 * area tujuan (dw x dh) tanpa gepeng, kelebihannya di-crop sesuai
 * titik fokus dari SciFi.SkillUI.portraitOffset().
 */
Window_SkillActorPanel.prototype.drawPortraitCover = function(bitmap, dx, dy, dw, dh) {

    var offset = SciFi.SkillUI.portraitOffset(this._actor);

    var scale = Math.max(dw / bitmap.width, dh / bitmap.height);

    var sw = dw / scale;

    var sh = dh / scale;

    var maxSx = Math.max(0, bitmap.width - sw);

    var maxSy = Math.max(0, bitmap.height - sh);

    var sx = maxSx * offset.x;

    var sy = maxSy * offset.y;

    this.contents.blt(bitmap, sx, sy, sw, sh, dx, dy, dw, dh);

};

Window_SkillActorPanel.prototype.drawResourceGauges = function(y) {

    var actor = this._actor;

    var x = this.textPadding();

    var width = this.contentsWidth() - (this.textPadding() * 2);

    var gap = SciFi.SkillUI.ActorPanelGaugeGap;

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

Window_SkillActorPanel.prototype.drawResourceGauge = function(label, value, max, x, y, width) {

    var oldSize = this.contents.fontSize;

    this.contents.fontSize = SciFi.UICore.Font.Resource;

    this.changeTextColor(this.systemColor());

    this.drawText(label, x, y - 240, width, "left");

    this.resetTextColor();

    this.drawText(value + " / " + max, x, y - 240, width, "right");

    SciFi.UICore.drawSegmentGauge(this, label, value, max, x, y - 210, width);

    this.contents.fontSize = oldSize;

};

//=============================================================================
// Scene_Skill: Layout Override
//=============================================================================
// Menjalankan create*Window() bawaan MV dulu (supaya semua handler /
// linking antar window tetap terpasang normal), lalu memindah &
// mengubah ukurannya sesuai SciFi.SkillUI.SceneLayout.
//
// Window_SkillStatus bawaan (foto kecil + MP/TP) DIHILANGKAN sama
// sekali, digantikan actor panel. Actor panel dibuat nebeng di
// createHelpWindow, karena itu method pertama yang dipanggil vanilla
// create() -- supaya createSkillTypeWindow dkk (dipanggil setelahnya)
// sudah bisa baca this._actorPanelWindow.
//=============================================================================

var _SciFi_SkillUI_SceneSkill_createHelpWindow =
    Scene_Skill.prototype.createHelpWindow;

Scene_Skill.prototype.createHelpWindow = function() {

    _SciFi_SkillUI_SceneSkill_createHelpWindow.call(this);

    this.createActorPanelWindow();

};

Scene_Skill.prototype.createActorPanelWindow = function() {

    var rect = SciFi.SkillUI.SceneLayout.actorPanelRect(this);

    this._actorPanelWindow = new Window_SkillActorPanel(

        rect.x, rect.y, rect.width, rect.height

    );

    this.addWindow(this._actorPanelWindow);

};

var _SciFi_SkillUI_SceneSkill_createSkillTypeWindow =
    Scene_Skill.prototype.createSkillTypeWindow;

Scene_Skill.prototype.createSkillTypeWindow = function() {

    _SciFi_SkillUI_SceneSkill_createSkillTypeWindow.call(this);

    var rect = SciFi.SkillUI.SceneLayout.skillTypeRect(this);

    this._skillTypeWindow.move(rect.x, rect.y, rect.width, rect.height);

    if (this._skillTypeWindow.createContents) {
        this._skillTypeWindow.createContents();
    }

    this._skillTypeWindow.refresh();

};

//------------------------------------------------------------
// Window_SkillStatus bawaan dihilangkan sepenuhnya (digantikan
// actor panel). Tetap dibuat (supaya this._statusWindow ada dan
// handler bawaan tidak error kalau ada yang manggil), tapi
// disembunyikan & dipindah keluar layar.
//------------------------------------------------------------

var _SciFi_SkillUI_SceneSkill_createStatusWindow =
    Scene_Skill.prototype.createStatusWindow;

Scene_Skill.prototype.createStatusWindow = function() {

    _SciFi_SkillUI_SceneSkill_createStatusWindow.call(this);

    this._statusWindow.move(0, 0, 1, 1);

    this._statusWindow.hide();

    this._statusWindow.deactivate();

};

var _SciFi_SkillUI_SceneSkill_createItemWindow =
    Scene_Skill.prototype.createItemWindow;

Scene_Skill.prototype.createItemWindow = function() {

    _SciFi_SkillUI_SceneSkill_createItemWindow.call(this);

    var rect = SciFi.SkillUI.SceneLayout.itemRect(this);

    this._itemWindow.move(rect.x, rect.y, rect.width, rect.height);

    if (this._itemWindow.createContents) {
        this._itemWindow.createContents();
    }

    this._itemWindow.refresh();

    // Help window (deskripsi): pindah ke bawah, membentang penuh.
    var helpRect = SciFi.SkillUI.SceneLayout.helpRect(this);

    this._helpWindow.move(helpRect.x, helpRect.y, helpRect.width, helpRect.height);

    if (this._helpWindow.createContents) {
        this._helpWindow.createContents();
    }

    this._helpWindow.refresh();

};

//=============================================================================
// Refresh Actor -> ikut update actor panel
//=============================================================================

var _SciFi_SkillUI_SceneSkill_refreshActor =
    Scene_Skill.prototype.refreshActor;

Scene_Skill.prototype.refreshActor = function() {

    _SciFi_SkillUI_SceneSkill_refreshActor.call(this);

    var actor = this.actor();

    this._actorPanelWindow.setActor(actor);

};

//=============================================================================
// Terapkan style window (biar konsisten sama Menu/Equip) + paksa
// ulang layout terakhir kali, jaga-jaga kalau ada yang balik ke
// ukuran salah setelah drawWindow() dipanggil.
//=============================================================================

var _SciFi_SkillUI_SceneSkill_create =
    Scene_Skill.prototype.create;

Scene_Skill.prototype.create = function() {

    _SciFi_SkillUI_SceneSkill_create.call(this);

    var windows = [

        this._actorPanelWindow,

        this._skillTypeWindow,

        this._itemWindow,

        this._helpWindow

    ];

    for (var i = 0; i < windows.length; i++) {

        if (windows[i]) {

            SciFi.UICore.drawWindow(windows[i]);

        }

    }

    this.reapplyScifiSkillLayout();

};

Scene_Skill.prototype.reapplyScifiSkillLayout = function() {

    var layout = SciFi.SkillUI.SceneLayout;

    SciFi.SkillUI.forceWindowRect(this._actorPanelWindow, layout.actorPanelRect(this));

    SciFi.SkillUI.forceWindowRect(this._skillTypeWindow, layout.skillTypeRect(this));

    SciFi.SkillUI.forceWindowRect(this._itemWindow, layout.itemRect(this));

    SciFi.SkillUI.forceWindowRect(this._helpWindow, layout.helpRect(this));

    // Window_SkillStatus bawaan tetap disembunyikan.
    this._statusWindow.hide();

};

/*
 * Paksa window pindah ke rect tertentu DAN bikin ulang kanvas
 * teksnya (createContents), lalu refresh -- pola yang sama dengan
 * SciFi.EquipUI.forceWindowRect(), supaya window gak kena bug
 * kanvas kepotong/persegi setelah drawWindow() dipanggil.
 */
SciFi.SkillUI.forceWindowRect = function(win, rect) {

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
// Window_SkillType: 2 Panel (Judul + Area Pilihan)
//=============================================================================
// Panel 1: latar judul "Skill Type", di paling atas.
// Panel 2: latar sisa area di bawah judul (sampai batas bawah
// window), tempat command skill type (Attack/Magic/dst) digambar.
//=============================================================================

Window_SkillType.prototype.titlePanelRect = function() {

    var m = SciFi.SkillUI.SkillTypeLayout.Margin;

    return new Rectangle(

        m,

        m,

        this.contentsWidth() - (m * 2),

        SciFi.SkillUI.SkillTypeLayout.TitleHeight

    );

};

Window_SkillType.prototype.listPanelRect = function() {

    var m = SciFi.SkillUI.SkillTypeLayout.Margin;

    var gap = SciFi.SkillUI.SkillTypeLayout.PanelGap;

    var titleRect = this.titlePanelRect();

    var y = titleRect.y + titleRect.height + gap;

    var height = this.contentsHeight() - y - m;

    return new Rectangle(

        m,

        y,

        this.contentsWidth() - (m * 2),

        height

    );

};

Window_SkillType.prototype.drawSkillTypeBackground = function() {

    var layout = SciFi.SkillUI.SkillTypeLayout;

    var titleRect = this.titlePanelRect();

    var listRect = this.listPanelRect();

    //------------------------------------------------------------
    // Panel 1 - Judul
    //------------------------------------------------------------

    SciFi.UICore.drawPanel(

        this,

        titleRect.x,

        titleRect.y,

        titleRect.width,

        titleRect.height

    );

    var oldSize = this.contents.fontSize;

    this.contents.fontSize = layout.TitleFontSize;

    this.changeTextColor(this.systemColor());

    var textY = titleRect.y + Math.floor(

        (titleRect.height - layout.TitleFontSize) / 2

    );

    this.drawText(

        layout.TitleText,

        titleRect.x,

        textY,

        titleRect.width,

        "center"

    );

    this.resetTextColor();

    this.contents.fontSize = oldSize;

    //------------------------------------------------------------
    // Panel 2 - Latar Area Pilihan
    //------------------------------------------------------------

    SciFi.UICore.drawPanel(

        this,

        listRect.x,

        listRect.y,

        listRect.width,

        listRect.height

    );

};

// Command (pilihan skill type) digambar DI ATAS panel 2, jadi
// posisinya & LEBARNYA perlu disamakan persis dengan listPanelRect()
// (bukan cuma digeser x/y) -- ini juga otomatis bikin cursor
// (yang dihitung dari itemRect() yang sama) selebar panel.
Window_SkillType.prototype.itemRect = function(index) {

    var rect = Window_Selectable.prototype.itemRect.call(this, index);

    var listRect = this.listPanelRect();

    rect.x = listRect.x;

    rect.y += listRect.y;

    rect.width = listRect.width;

    return rect;

};

Window_SkillType.prototype.refresh = function() {

    // PENTING: clearCommandList() + makeCommandList() tetap harus
    // dipanggil di sini (sama seperti Window_Command.prototype.refresh
    // bawaan) -- kalau dilewatin, daftar command gak pernah kebentuk
    // ulang jadi selalu kosong, makanya pilihan skill type gak
    // pernah muncul (dan skill list di kolom C ikut kosong karena
    // gak ada skill type yang aktif untuk dipakai).
    this.clearCommandList();

    this.makeCommandList();

    this.createContents();

    this.contents.clear();

    this.drawSkillTypeBackground();

    this.drawAllItems();

};

//=============================================================================
// Window_SkillList: Panel per Baris
//=============================================================================
// Tiap skill dapet panel sendiri (dari SciFi.UICore.drawPanel), dengan
// margin di kiri/kanan dan jarak antar panel di bawahnya. Kalau
// slotnya kosong (gak ada skill), gak ada panel yang digambar.
//=============================================================================

Window_SkillList.prototype.itemHeight = function() {

    return SciFi.SkillUI.ListLayout.RowHeight;

};

Window_SkillList.prototype.itemRect = function(index) {

    var rect = Window_Selectable.prototype.itemRect.call(this, index);

    var margin = SciFi.SkillUI.ListLayout.Margin;

    var gap = SciFi.SkillUI.ListLayout.PanelGap;

    // Margin kiri/kanan.
    rect.x += margin;

    rect.width -= margin * 2;

    // Margin atas (konstan, berlaku sama ke semua baris -- efeknya
    // menggeser seluruh list turun sejauh margin dari tepi window).
    rect.y += margin;

    // Sisakan PanelGap di bagian bawah rect supaya ada jarak kosong
    // sebelum panel baris berikutnya (RowHeight sudah termasuk gap
    // ini, lihat SciFi.SkillUI.ListLayout.RowHeight).
    rect.height -= gap;

    return rect;

};

Window_SkillList.prototype.drawItem = function(index) {

    var skill = this._data[index];

    if (!skill) {
        return;
    }

    var rect = this.itemRect(index);

    //------------------------------------------------------------
    // Panel latar, satu per skill.
    //------------------------------------------------------------

    SciFi.UICore.drawPanel(

        this,

        rect.x,

        rect.y,

        rect.width,

        rect.height

    );

    //------------------------------------------------------------
    // Nama + Cost, digambar di atas panel dengan padding dalam
    // sebesar margin yang sama.
    //------------------------------------------------------------

    var padding = SciFi.SkillUI.ListLayout.Margin;

    var costWidth = this.costWidth();

    var innerX = rect.x + padding;

    var innerWidth = rect.width - (padding * 2);

    this.changePaintOpacity(this.isEnabled(skill));

    this.drawItemName(skill, innerX, rect.y, innerWidth - costWidth);

    this.drawSkillCost(skill, innerX, rect.y, innerWidth);

    this.changePaintOpacity(true);

};

//=============================================================================
// Window_SkillList: 1 Kolom
//=============================================================================

Window_SkillList.prototype.maxCols = function() {

    return 1;

};

//=============================================================================
// Window_SkillList: Cost Display (STA / MOM, berwarna sesuai gauge)
//=============================================================================
// Bawaan MV cuma nampilin SALAH SATU (TP kalau ada, kalau enggak MP).
// Di sini ditampilkan DUA-DUANYA sekaligus kalau skill butuh
// keduanya, dengan label teks "STA" / "MOM" dan warna teks yang
// SAMA PERSIS dengan warna fill gauge Stamina/Momentum di
// SciFi.UICore.resourceFillColor().
//
// skillMpCost()/skillTpCost() tetap dipakai apa adanya (cuma nama
// tampilannya yang diganti jadi Stamina/Momentum, sesuai konvensi
// gauge di project ini).
//=============================================================================

SciFi.SkillUI.CostGap = 20;

SciFi.SkillUI.costSegments = function(actor, skill) {

    var segments = [];

    var staCost = actor.skillMpCost(skill);

    var momCost = actor.skillTpCost(skill);

    if (staCost > 0) {

        segments.push({

            text : staCost + " STA",

            color : SciFi.UICore.resourceFillColor("Stamina")

        });

    }

    if (momCost > 0) {

        segments.push({

            text : momCost + " MOM",

            color : SciFi.UICore.resourceFillColor("Momentum")

        });

    }

    return segments;

};

Window_SkillList.prototype.costWidth = function() {

    // Cukup lebar buat 2 segmen sekaligus ("000 STA" + gap + "000 MOM").
    return this.textWidth("000 STA") + SciFi.SkillUI.CostGap + this.textWidth("000 MOM");

};

Window_SkillList.prototype.drawSkillCost = function(skill, x, y, width) {

    if (!this._actor) {
        return;
    }

    var segments = SciFi.SkillUI.costSegments(this._actor, skill);

    if (segments.length === 0) {
        return;
    }

    var gap = SciFi.SkillUI.CostGap;

    var widths = segments.map(function(segment) {

        return this.textWidth(segment.text);

    }, this);

    var totalWidth = widths.reduce(function(a, b) {

        return a + b;

    }, 0) + gap * (segments.length - 1);

    // Rata kanan dari area cost.
    var curX = x + width - totalWidth;

    for (var i = 0; i < segments.length; i++) {

        this.changeTextColor(segments[i].color);

        this.drawText(segments[i].text, curX, y, widths[i] + 2, "left");

        curX += widths[i] + gap;

    }

    this.resetTextColor();

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("SkillUI v0.1.0 Loaded");

})();