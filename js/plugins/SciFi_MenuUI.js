//=============================================================================
// SciFi_MenuUI.js
//=============================================================================

var Imported = Imported || {};
Imported.SciFi_MenuUI = true;

var SciFi = SciFi || {};
SciFi.MenuUI = SciFi.MenuUI || {};

(function() {

"use strict";

//=============================================================================
// Layout
//=============================================================================

SciFi.MenuUI.maxCols = function() {

    return 4;

};

SciFi.MenuUI.visibleRows = function() {

    return 1;

};

SciFi.MenuUI.cardPadding = function() {

    return 12;

};

//=============================================================================
// Font Style
//=============================================================================

SciFi.MenuUI.FontStyle = {};

SciFi.MenuUI.applyFontStyle =
function(window) {

    window.contents.paintOpacity = 255;

    window.contents.outlineColor =
        "rgba(0,0,0,1)";

    window.contents.outlineWidth =
        4;

};

//=============================================================================
// Portrait
//=============================================================================

SciFi.MenuUI.loadPortrait =
function(actor) {

    var filename =
        "Actor" + actor.actorId();

    return ImageManager.loadBitmap(

        "img/portraits/",

        filename,

        0,

        true

    );

};

//=============================================================================
// Control Hints
//=============================================================================

SciFi.MenuUI.ControlHints = {

    FontSize : 18,

    LineHeight : 28,

    KeyWidth : 48,

    TextColor : "#FFFFFF",

    KeyColor : "#fff9df",

    X : 20,

    Y : Graphics.boxHeight - 110,

    Data : [

        {
            key : "▲▼ ◀▶",
            text : "Navigate"
        },

        {
            key : "Z / Enter",
            text : "Confirm"
        },

        {
            key : "X / Esc",
            text : "Back"
        }

    ]

};

//=============================================================================
// Fonts
//=============================================================================

SciFi.MenuUI.Font = {

    Header: 24,

    HeaderSmall: 18,

    Resource: 18

};

//=============================================================================
// Card
//=============================================================================

SciFi.MenuUI.Card = {

    BackgroundColor : "rgba(15,20,30,0.45)",

    // Border luar
    OuterBorderColor : "#8B857C",
    OuterBorderWidth : 7,

    // Border dalam
    InnerBorderColor : "rgb(44,27,32)",
    InnerBorderWidth : 2,
    InnerBorderOffset : 4,

    // Jarak vertikal antara kartu dengan tepi atas/bawah window.
    // Ini yang bikin ada ruang buat background carousel nongol
    // di atas & bawah kartu.
    PaddingY : 10

};

//=============================================================================
// Carousel Background
//=============================================================================

SciFi.MenuUI.Carousel = {

    FillColor : "rgba(9, 10, 12, 0.2)",

    BorderColor : "#8B857C",

    BorderWidth : 4,

    // Jarak vertikal background ke tepi window. Harus LEBIH KECIL
    // dari SciFi.MenuUI.Card.PaddingY supaya background kelihatan
    // lebih tinggi daripada kartu (nongol beberapa pixel di atas
    // & bawah kartu).
    PaddingY : 0

};

//=============================================================================
// Carousel Peek Arrows
//=============================================================================

SciFi.MenuUI.Arrow = {

    Color : "#fff9df",

    Width : 12,

    Height : 20,

    // Jarak dari tepi kiri/kanan window
    Margin : 4

};

//=============================================================================
// Carousel Fade (vignette hitam ke arah peek)
//=============================================================================

SciFi.MenuUI.CarouselFade = {

    // Warna di tepi kiri & kanan (arah peek)
    EdgeColor : "rgba(0,0,0,0.5)",

    // Warna di tengah
    CenterColor : "rgba(0,0,0,0)"

};

//=============================================================================
// Carousel Peek Filler
//=============================================================================
// Ngisi zona peek yang lagi KOSONG (gak ada kartu tetangga di sisi
// itu) dengan warna beda dari background biasa. Kalau kedua sisi
// ada peek, ini gak digambar sama sekali (gak ada zona kosong buat
// diisi). Kalau party <= maxCols (gak overflow), zona peek juga gak
// pernah direservasi ruangnya sama sekali, jadi ini otomatis gak
// kelihatan juga di kondisi itu.
//=============================================================================

SciFi.MenuUI.CarouselPeekFiller = {

    Color : "#8B857C"

};

//=============================================================================
// Anggota Cadangan (non-battle)
//=============================================================================

SciFi.MenuUI.Reserve = {

    // Digambar di atas kartu anggota yang index-nya >=
    // $gameParty.maxBattleMembers() (biasanya 4). Pakai hitam
    // semi-transparan supaya kartu "keliatan gelap" tapi masih
    // kebaca isinya.
    OverlayColor : "rgba(0,0,0,0.55)"

};

//=============================================================================
// Window
//=============================================================================

SciFi.MenuUI.Window = {

    BackgroundColor : "rgba(9, 10, 12, 0.8)",

    BorderColor : "#2c1b20",

    BorderWidth : 2,

    Opacity : 0.8

};

//=============================================================================
// Window Frame (lapisan tengah antara background & border)
//=============================================================================
// Bentuknya kayak "border tebal" yang punya lubang segi empat di
// tengah, jadi background window masih keliatan lewat lubang itu.
// Warnanya gradasi atas-bawah (TopColor -> BottomColor).
//=============================================================================

SciFi.MenuUI.WindowFrame = {

    // Ketebalan frame. Set ke 0 untuk mematikan lapisan ini.
    Width : 18,

    TopColor : "#a19b91",

    MiddleColor : "#8B857C",

    BottomColor : "#746F67"

};

//=============================================================================
// Draw Window
//=============================================================================

SciFi.MenuUI.drawWindow =
function(window) {

    //------------------------------------------
    // Hide default window
    //------------------------------------------

    window.opacity = 0;

    window.backOpacity = 0;

    //------------------------------------------
    // Remove previous sprite
    //------------------------------------------

    if (window._sciFiWindow) {

        window.removeChild(window._sciFiWindow);

    }

    //------------------------------------------
    // Create bitmap
    //------------------------------------------

    var bitmap = new Bitmap(

        window.width,

        window.height

    );

    //------------------------------------------
    // Background
    //------------------------------------------

    var c = SciFi.MenuUI.Window.BackgroundColor;

    bitmap.fillRect(

        0,

        0,

        window.width,

        window.height,

        c

    );

    //------------------------------------------
    // Frame (lapisan tengah, gradient atas-bawah,
    // punya "lubang" segi empat di tengah supaya
    // background tetap keliatan lewat lubang itu)
    //------------------------------------------

    var bw =
        SciFi.MenuUI.Window.BorderWidth;

    var fw =
        SciFi.MenuUI.WindowFrame.Width;

    if (fw > 0) {

        var frameCtx =
            bitmap._context;

        var frameGradient =
            frameCtx.createLinearGradient(
                0, 0,
                0, window.height
            );

        frameGradient.addColorStop(
            0, SciFi.MenuUI.WindowFrame.TopColor
        );

        frameGradient.addColorStop(
            0.3, SciFi.MenuUI.WindowFrame.MiddleColor
        );

                frameGradient.addColorStop(
            0.7, SciFi.MenuUI.WindowFrame.MiddleColor
        );

        frameGradient.addColorStop(
            1, SciFi.MenuUI.WindowFrame.BottomColor
        );

        frameCtx.save();

        frameCtx.fillStyle = frameGradient;

        // Top
        frameCtx.fillRect(
            0, 0,
            window.width, fw
        );

        // Bottom
        frameCtx.fillRect(
            0, window.height - fw,
            window.width, fw
        );

        // Left
        frameCtx.fillRect(
            0, 0,
            fw, window.height
        );

        // Right
        frameCtx.fillRect(
            window.width - fw, 0,
            fw, window.height
        );

        frameCtx.restore();

        bitmap._setDirty();

    }

    //------------------------------------------
    // Border
    //------------------------------------------

    var bc =
        SciFi.MenuUI.Window.BorderColor;

    bitmap.fillRect(
        6,6,
        window.width-12,bw,
        bc
    );

    bitmap.fillRect(
        6,
        window.height-bw-6,
        window.width-12,
        bw,
        bc
    );

    // Left

    bitmap.fillRect(
        6,6,
        bw,
        window.height-12,
        bc
    );

    // Right

    bitmap.fillRect(
        window.width-bw-6,
        6,
        bw,
        window.height-12,
        bc
    );

    //------------------------------------------
    // Sprite
    //------------------------------------------

    window._sciFiWindow =
        new Sprite(bitmap);

    window.addChildToBack(

        window._sciFiWindow

    );

};

//=============================================================================
// Gradient
//=============================================================================

SciFi.MenuUI.Gradient = {

    Height : 200,

    StartAlpha : 0.9,

    EndAlpha : 0.00

};

//=============================================================================
// Card Background
//=============================================================================

Window_MenuStatus.prototype.drawCardBackground =
function(rect) {

    var pad = 1;

    this.contents.fillRect(

        rect.x + pad,

        rect.y + pad,

        rect.width - pad * 2,

        rect.height - pad * 2,

        SciFi.MenuUI.Card.BackgroundColor

    );

};

//=============================================================================
// Card Border
//=============================================================================

Window_MenuStatus.prototype.drawCardBorder =
function(rect) {

    var cfg = SciFi.MenuUI.Card;
    var pad = 1;

    //------------------------------------------
    // Outer Border
    //------------------------------------------

    var ow = cfg.OuterBorderWidth;
    var oc = cfg.OuterBorderColor;

    this.contents.fillRect(
        rect.x + pad,
        rect.y + pad,
        rect.width - pad * 2,
        ow,
        oc
    );

    this.contents.fillRect(
        rect.x + pad,
        rect.y + rect.height - ow - pad,
        rect.width - pad * 2,
        ow,
        oc
    );

    this.contents.fillRect(
        rect.x + pad,
        rect.y + pad,
        ow,
        rect.height - pad * 2,
        oc
    );

    this.contents.fillRect(
        rect.x + rect.width - ow - pad,
        rect.y + pad,
        ow,
        rect.height - pad * 2,
        oc
    );

    //------------------------------------------
    // Inner Border
    //------------------------------------------

    var offset = cfg.InnerBorderOffset;
    var iw = cfg.InnerBorderWidth;
    var ic = cfg.InnerBorderColor;

    this.contents.fillRect(
        rect.x + offset,
        rect.y + offset,
        rect.width - offset * 2,
        iw,
        ic
    );

    this.contents.fillRect(
        rect.x + offset,
        rect.y + rect.height - offset - iw,
        rect.width - offset * 2,
        iw,
        ic
    );

    this.contents.fillRect(
        rect.x + offset,
        rect.y + offset,
        iw,
        rect.height - offset * 2,
        ic
    );

    this.contents.fillRect(
        rect.x + rect.width - offset - iw,
        rect.y + offset,
        iw,
        rect.height - offset * 2,
        ic
    );

};

//=============================================================================
// Card Gradient
//=============================================================================

Window_MenuStatus.prototype.drawCardGradient =
function(rect) {

    var h =
        SciFi.MenuUI.Gradient.Height;

    for (var i = 0; i < h; i++) {

        var rate =
            i / h;

        var alpha =
            SciFi.MenuUI.Gradient.StartAlpha *
            rate;

        this.contents.fillRect(

            rect.x + 1,

            rect.y +
            rect.height -
            h +
            i - 1,

            rect.width - 2,

            1,

            "rgba(0,0,0," + alpha + ")"

        );

    }

};

//=============================================================================
// Window_MenuStatus Layout
//=============================================================================

Window_MenuStatus.prototype.maxCols = function() {

    return SciFi.MenuUI.maxCols();

};

Window_MenuStatus.prototype.numVisibleRows = function() {

    return SciFi.MenuUI.visibleRows();

};

Window_MenuStatus.prototype.itemWidth = function() {

    return this.cardWidth();

};

Window_MenuStatus.prototype.itemHeight = function() {

    return this.contentsHeight();

};

Window_MenuStatus.prototype.spacing = function() {

    return 0;

};

//=============================================================================
// Peek (sliver kartu tetangga di tepi window)
//=============================================================================

SciFi.MenuUI.peekWidth = function() {

    return 14;

};

//=============================================================================
// Overflow Check
//=============================================================================

Window_MenuStatus.prototype.hasOverflow =
function() {

    return $gameParty.members().length >
        this.maxCols();

};

//=============================================================================
// Deteksi Peek Kiri / Kanan
//=============================================================================
// Beda dari hasOverflow() — ini ngecek posisi scroll SAAT INI.
// Di halaman pertama cuma ada peek kanan, di halaman terakhir cuma
// ada peek kiri, di tengah-tengah ada dua-duanya, dan kalau party
// gak overflow gak ada peek sama sekali.
//=============================================================================

Window_MenuStatus.prototype.hasLeftPeek =
function() {

    if (!this.hasOverflow()) {

        return false;

    }

    var first =
        this._firstVisibleIndex || 0;

    return first > 0;

};

Window_MenuStatus.prototype.hasRightPeek =
function() {

    if (!this.hasOverflow()) {

        return false;

    }

    var first =
        this._firstVisibleIndex || 0;

    var visibleFull =
        this.maxCols();

    return (first + visibleFull) <
        $gameParty.members().length;

};

//=============================================================================
// Card Width
//=============================================================================

Window_MenuStatus.prototype.cardWidth =
function() {

    var totalWidth =
        this.contentsWidth();

    var cols =
        this.maxCols();

    // Selalu reservasi ruang peek di kedua sisi, biar lebar kartu
    // konsisten sama aja baik pas party <= maxCols (gak overflow)
    // maupun pas overflow. Celah yang gak kepake (kalau emang gak
    // ada peek beneran di sisi itu) diisi drawCarouselPeekFiller().

    var peek =
        SciFi.MenuUI.peekWidth() * 2;

    return Math.floor(
        (totalWidth - peek) / cols
    );

};

//=============================================================================
// Card Rect
//=============================================================================
// "index" di sini SELALU index aktor yang sesungguhnya di $gameParty
// (sama seperti this.index()), BUKAN slot 0..3. Ini penting supaya
// posisi kartu yang digambar dan posisi kursor selalu sinkron.
//=============================================================================

Window_MenuStatus.prototype.cardRect =
function(index) {

    var rect = new Rectangle();

    var first =
        this._firstVisibleIndex || 0;

    // Slot relatif terhadap kartu pertama yang full-visible.
    // Bisa -1 (peek kiri) sampai maxCols() (peek kanan).
    var slot =
        index - first;

    var cardWidth =
        this.cardWidth();

    var peek =
        SciFi.MenuUI.peekWidth();

    rect.x =
        peek +
        slot * cardWidth;

    var paddingY =
        SciFi.MenuUI.Card.PaddingY;

    rect.y = paddingY;

    rect.width =
        cardWidth;

    rect.height =
        this.itemHeight() - paddingY * 2;

    return rect;

};

//=============================================================================
// Full Cards Width
//=============================================================================
// Lebar area 4 kartu full-visible SAJA, tanpa peek. Ini dipakai
// sebagai basis, lalu carouselBackgroundRect() yang menambah lebar
// sesuai peek yang benar-benar ada di posisi scroll saat ini.
//=============================================================================

Window_MenuStatus.prototype.fullCardsWidth =
function() {

    return this.cardWidth() * this.maxCols();

};

//=============================================================================
// Carousel Background Rect
//=============================================================================
// Lebar & posisi X background ini menyesuaikan peek yang BENAR-BENAR
// ada saat ini (bukan asumsi dua-duanya selalu ada):
// - Gak ada peek sama sekali (party <= maxCols) -> selebar 4 kartu.
// - Cuma peek kanan (halaman pertama) -> nambah lebar ke kanan aja.
// - Cuma peek kiri (halaman terakhir) -> nambah lebar ke kiri aja.
// - Ada dua-duanya (halaman tengah) -> nambah ke kiri & kanan.
//=============================================================================

Window_MenuStatus.prototype.carouselBackgroundRect =
function() {

    var rect =
        new Rectangle();

    var peek =
        SciFi.MenuUI.peekWidth();

    var leftExtend =
        this.hasLeftPeek() ? peek : 0;

    var rightExtend =
        this.hasRightPeek() ? peek : 0;

    // Kartu full sekarang SELALU digeser sejauh peekWidth() dari
    // tepi kiri (lihat cardRect()), gak peduli overflow atau
    // enggak, biar lebar kartu konsisten di semua kondisi.

    var fullCardsX =
        peek;

    var paddingY =
        SciFi.MenuUI.Carousel.PaddingY;

    rect.x =
        fullCardsX - leftExtend;

    rect.y = paddingY;

    rect.width =
        this.fullCardsWidth() +
        leftExtend +
        rightExtend;

    rect.height =
        this.contentsHeight() - paddingY * 2;

    return rect;

};

//=============================================================================
// Gambar Background Carousel
//=============================================================================
// Digambar SEBELUM drawVisibleCards() supaya kartu-kartu menimpa
// bagian yang overlap, dan background cuma kelihatan di celah
// atas/bawah (dan di sisi kalau lebarnya lebih besar dari kartu).
//=============================================================================

Window_MenuStatus.prototype.drawCarouselBackground =
function() {

    var rect =
        this.carouselBackgroundRect();

    var cfg =
        SciFi.MenuUI.Carousel;

    if (cfg.FillColor) {

        this.contents.fillRect(
            rect.x, rect.y,
            rect.width, rect.height,
            cfg.FillColor
        );

    }

    var w =
        cfg.BorderWidth;

    if (w > 0 && cfg.BorderColor) {

        // Top
        this.contents.fillRect(
            rect.x, rect.y,
            rect.width, w,
            cfg.BorderColor
        );

        // Bottom
        this.contents.fillRect(
            rect.x, rect.y + rect.height - w,
            rect.width, w,
            cfg.BorderColor
        );

    }

};

//=============================================================================
// Gambar Filler Zona Peek yang Kosong
//=============================================================================

Window_MenuStatus.prototype.drawCarouselPeekFiller =
function() {

    // Sekarang zona peek SELALU direservasi (lihat cardWidth()),
    // jadi filler ini perlu jalan juga pas party <= maxCols —
    // di kondisi itu hasLeftPeek()/hasRightPeek() otomatis false
    // berdua, jadi filler bakal ngisi kiri & kanan sekaligus.

    var peek =
        SciFi.MenuUI.peekWidth();

    var color =
        SciFi.MenuUI.CarouselPeekFiller.Color;

    var paddingY =
        SciFi.MenuUI.Carousel.PaddingY;

    var y =
        paddingY;

    var height =
        this.contentsHeight() - paddingY * 2;

    if (!this.hasLeftPeek()) {

        this.contents.fillRect(
            0, y,
            peek, height,
            color
        );

    }

    if (!this.hasRightPeek()) {

        this.contents.fillRect(
            this.contentsWidth() - peek, y,
            peek, height,
            color
        );

    }

};

//=============================================================================
// Gambar Fade/Vignette Carousel
//=============================================================================
// Gradient 3-stop (hitam di kedua ujung, transparan di tengah).
// Digambar SETELAH kartu (drawVisibleCards) supaya nutupi kartu di
// bagian tepi, tapi TETAP di dalam this.contents — jadi otomatis
// ada di bawah cursor kustom (yang sprite terpisah, selalu render
// paling atas).
//
// Lebar/tinggi ngikutin carouselBackgroundRect() persis, jadi kalau
// lebar background berubah (peek kiri/kanan aktif/nonaktif), fade
// ini otomatis ikut menyesuaikan juga.
//=============================================================================

Window_MenuStatus.prototype.drawCarouselFade =
function() {

    var rect =
        this.carouselBackgroundRect();

    if (rect.width <= 0 || rect.height <= 0) {

        return;

    }

    var hasLeft =
        this.hasLeftPeek();

    var hasRight =
        this.hasRightPeek();

    // Gak ada peek sama sekali -> gak usah gambar apa-apa.
    if (!hasLeft && !hasRight) {

        return;

    }

    var cfg =
        SciFi.MenuUI.CarouselFade;

    // Ujung yang gak ada peek-nya disamain sama warna tengah,
    // jadi otomatis "hilang" (gak ada fade) di sisi itu.
    var leftColor =
        hasLeft ? cfg.EdgeColor : cfg.CenterColor;

    var rightColor =
        hasRight ? cfg.EdgeColor : cfg.CenterColor;

    var ctx =
        this.contents._context;

    var gradient =
        ctx.createLinearGradient(
            rect.x, 0,
            rect.x + rect.width, 0
        );

    gradient.addColorStop(0, leftColor);
    gradient.addColorStop(0.05, cfg.CenterColor);
    gradient.addColorStop(0.95, cfg.CenterColor);
    gradient.addColorStop(1, rightColor);

    ctx.save();

    ctx.fillStyle = gradient;

    ctx.fillRect(
        rect.x, rect.y,
        rect.width, rect.height
    );

    ctx.restore();

    this.contents._setDirty();

};

//=============================================================================
// Draw Item Background
//=============================================================================

Window_MenuStatus.prototype.drawItemBackground =
function(index) {

    var rect =
        this.cardRect(index);

    //------------------------------------------
    // Selection
    //------------------------------------------

    if (index === this.index()) {

        this.changePaintOpacity(false);

        this.contents.fillRect(

            rect.x,

            rect.y,

            rect.width,

            rect.height,

            "rgba(255,255,255,0.08)"

        );

        this.changePaintOpacity(true);

    }

    //------------------------------------------
    // Pending Formation
    //------------------------------------------

    if (index === this._pendingIndex) {

        this.contents.fillRect(

            rect.x,

            rect.y,

            rect.width,

            rect.height,

            "rgba(80,220,255,0.18)"

        );

    }

};

//=============================================================================
// Draw Item
//=============================================================================

Window_MenuStatus.prototype.drawItem =
function(index) {

    // "index" = index aktor asli di $gameParty, sama dengan
    // yang dipakai this.index() dan cardRect(). Jangan ditambah
    // _firstVisibleIndex lagi di sini.

    var actor =
        $gameParty.members()[index];

    if (!actor) {

        return;

    }

    var rect =
        this.cardRect(index);

    //------------------------------------------
    // Background
    //------------------------------------------

    this.drawItemBackground(index);

    //------------------------------------------
    // Card
    //------------------------------------------

    this.drawActorCard(

        actor,

        rect

    );

    //------------------------------------------
    // Overlay gelap untuk anggota di luar slot battle
    //------------------------------------------

    if (index >= $gameParty.maxBattleMembers()) {

        this.drawReserveOverlay(rect);

    }

};

//=============================================================================
// Overlay Anggota Cadangan (non-battle)
//=============================================================================

Window_MenuStatus.prototype.drawReserveOverlay =
function(rect) {

    var cfg =
        SciFi.MenuUI.Reserve;

    this.contents.fillRect(
        rect.x, rect.y,
        rect.width, rect.height,
        cfg.OverlayColor
    );

};

//=============================================================================
// Draw Visible Cards
//=============================================================================

Window_MenuStatus.prototype.drawVisibleCards =
function() {

    var first =
        this._firstVisibleIndex || 0;

    var visibleFull =
        this.maxCols();

    // Gambar 1 slot ekstra di kiri & kanan untuk efek "peek".
    // Kalau tidak overflow, peekWidth() = 0 jadi ini otomatis
    // tidak kelihatan (dan drawItem akan return lebih awal
    // kalau actor-nya tidak ada).

    var startIndex =
        first - 1;

    var endIndex =
        first + visibleFull;

    for (var i = startIndex; i <= endIndex; i++) {

        this.drawItem(i);

    }

};

var SciFi_MenuUI_WindowMenuStatus_refresh =
    Window_MenuStatus.prototype.refresh;

Window_MenuStatus.prototype.refresh =
function() {

    this.contents.clear();

    this.drawCarouselBackground();

    this.drawCarouselPeekFiller();

    this.drawVisibleCards();

    this.drawCarouselFade();

    this.refreshCarouselCursor();

    this.refreshCarouselArrows();

};

Window_MenuStatus.prototype.drawActorCard =
function(actor, rect) {

    //------------------------------------------
    // Background
    //------------------------------------------

    this.drawCardBackground(rect);

    //------------------------------------------
    // Portrait
    //------------------------------------------

    this.drawCardPortrait(actor, rect);

    //------------------------------------------
    // Gradient
    //------------------------------------------

    this.drawCardGradient(rect);

    //------------------------------------------
    // Border
    //------------------------------------------

    this.drawCardBorder(rect);

    //------------------------------------------
    // Header
    //------------------------------------------

    this.drawCardHeader(actor, rect);

    //------------------------------------------
    // Resources
    //------------------------------------------

    this.drawCardResources(actor, rect);

};

//=============================================================================
// Control Hint
//=============================================================================

SciFi.MenuUI.createControlHints =
function(scene) {

    var cfg =
        SciFi.MenuUI.ControlHints;

    var bmp =
        new Bitmap(220,140);

    bmp.fontSize =
        cfg.FontSize;

    for (var i = 0; i < cfg.Data.length; i++) {

        var y =
            i * cfg.LineHeight;

        //----------------------------------
        // Key
        //----------------------------------

        bmp.textColor =
            cfg.KeyColor;

        bmp.drawText(

            cfg.Data[i].key,

            2,

            y,

            cfg.KeyWidth,

            cfg.LineHeight

        );

        //----------------------------------
        // Description
        //----------------------------------

        bmp.textColor =
            cfg.TextColor;

        bmp.drawText(

            cfg.Data[i].text,

            cfg.KeyWidth + 50,

            y,

            180,

            cfg.LineHeight

        );

    }

    var sprite =
        new Sprite(bmp);

    sprite.x = 10;
    sprite.y = scene._commandWindow.height + 10;

    scene._commandWindow.addChild(sprite);

    scene._controlHintSprite =
        sprite;

};

Window_MenuStatus.prototype.drawCardHeader =
function(actor, rect) {

    SciFi.MenuUI.applyFontStyle(this);

    var oldSize =
        this.contents.fontSize;

    //------------------------------------------
    // Name
    //------------------------------------------

    this.contents.fontSize =
        SciFi.MenuUI.Font.Header;

    this.changeTextColor(
        this.normalColor()
    );

    this.drawText(

        actor.name(),

        rect.x + 12,

        rect.y + 10,

        rect.width - 24

    );

    //------------------------------------------
    // Level
    //------------------------------------------

    this.contents.fontSize =
        SciFi.MenuUI.Font.HeaderSmall;

    this.changeTextColor(
        this.systemColor()
    );

    this.drawText(

        "Lv. " + actor.level,

        rect.x + 12,

        rect.y + 40,

        60

    );

    //------------------------------------------
    // Class
    //------------------------------------------

    this.changeTextColor(
        this.normalColor()
    );

    this.drawText(

        actor.currentClass().name,

        rect.x + 72,

        rect.y + 40,

        rect.width - 84

    );

    //------------------------------------------

    this.contents.fontSize =
        oldSize;

};

Window_MenuStatus.prototype.drawCardPortrait =
function(actor, rect) {

    var bitmap =
        SciFi.MenuUI.loadPortrait(actor);

    if (!bitmap.isReady()) {

        return;

    }

    this.contents.blt(

        bitmap,

        0,

        0,

        bitmap.width,

        bitmap.height,

        rect.x,

        rect.y,

        rect.width -1,

        rect.height -1

    );

};

Window_MenuStatus.prototype.drawCardResources =
function(actor, rect) {

    SciFi.MenuUI.applyFontStyle(this);

    var x = rect.x + 12;
    var y = rect.height + rect.y - 170;
    var width = rect.width - 24;

    this.drawResourceGauge(
        "Shield",
        actor.shield(),
        actor.maxShield(),
        x,
        y,
        width
    );

    y += 38;

    this.drawResourceGauge(
        "Hitpoints",
        actor.hp,
        actor.mhp,
        x,
        y,
        width
    );

    y += 38;

    this.drawResourceGauge(
        "Stamina",
        actor.mp,
        actor.mmp,
        x,
        y,
        width
    );

    y += 38;

    this.drawResourceGauge(
        "Momentum",
        actor.tp,
        actor.maxTp(),
        x,
        y,
        width
    );

};

Window_MenuStatus.prototype.drawResourceGauge =
function(type, value, max, x, y, width) {
	
	var oldSize =
		this.contents.fontSize;

	this.contents.fontSize =
		SciFi.MenuUI.Font.Resource;

    var gaugeHeight = 12;
    var rate = 0;

    if (max > 0) {
        rate = value / max;
    }

    //------------------------------------------
    // Label
    //------------------------------------------

    this.changeTextColor(
        this.systemColor()
    );

    this.drawText(
        type,
        x,
        y,
        width,
        "left"
    );

    //------------------------------------------
    // Value
    //------------------------------------------

    this.changeTextColor(
        this.normalColor()
    );

    this.drawText(
        value + " / " + max,
        x,
        y,
        width,
        "right"
    );

this.drawSegmentGauge(

    type,

    value,

    max,

    x,

    y + 30,

    width

);

	this.contents.fontSize =
    oldSize;

};

//=============================================================================
// Resource Colors
//=============================================================================

SciFi.MenuUI.resourceFillColor = function(type) {

    switch (type) {

    case "Shield":
        return "#00C8FF";

    case "Hitpoints":
        return "#E05050";

    case "Stamina":
        return "#4CD964";

    case "Momentum":
        return "#FFC83D";

    }

    return "#FFFFFF";

};

SciFi.MenuUI.resourceBackColor = function(type) {

    switch (type) {

    case "Shield":
        return "#0B4A60";

    case "Hitpoints":
        return "#5A1F1F";

    case "Stamina":
        return "#1D4B22";

    case "Momentum":
        return "#5A4A16";

    }

    return "#444444";

};

//=============================================================================
// Gauge
//=============================================================================

SciFi.MenuUI.Gauge = {

    SegmentValue: 20,

    SegmentGap: 2,

    Height: 12

};

//=============================================================================
// Segmented Gauge
//=============================================================================

Window_MenuStatus.prototype.drawSegmentGauge =
function(type, value, max, x, y, width) {

    //------------------------------------------
    // Config
    //------------------------------------------

    var segmentValue =
        SciFi.MenuUI.Gauge.SegmentValue;

    var gap =
        SciFi.MenuUI.Gauge.SegmentGap;

    var height =
        SciFi.MenuUI.Gauge.Height;

    //------------------------------------------
    // Safety
    //------------------------------------------

    if (max <= 0) {

        return;

    }

    //------------------------------------------
    // Segment Count
    //------------------------------------------

    var segmentCount =
        Math.ceil(
            max / segmentValue
        );

    //------------------------------------------
    // Unit Count
    //------------------------------------------

    var lastCapacity =
        max % segmentValue;

    if (lastCapacity === 0) {

        lastCapacity = segmentValue;

    }

    var totalUnits =
        (segmentCount - 1)
        +
        (lastCapacity / segmentValue);

    var totalGap =
        (segmentCount - 1) * gap;

    var unitWidth =
        (width - totalGap)
        / totalUnits;

    //------------------------------------------
    // Draw Segments
    //------------------------------------------

    var currentX = x;

    for (var i = 0; i < segmentCount; i++) {

        //--------------------------------------
        // Segment Range
        //--------------------------------------

        var start =
            i * segmentValue;

        var end =
            Math.min(
                max,
                start + segmentValue
            );

        var capacity =
            end - start;
        
        var currentWidth =
            unitWidth *
            (capacity / segmentValue);

        //--------------------------------------
        // Current Fill
        //--------------------------------------

        var current =
            Math.max(
                0,
                Math.min(
                    value - start,
                    capacity
                )
            );

        var rate =
            current / capacity;

        //--------------------------------------
        // Background
        //--------------------------------------

        this.contents.fillRect(

            currentX,

            y,

            currentWidth,

            height,

            SciFi.MenuUI.resourceBackColor(type)

        );

        //--------------------------------------
        // Fill
        //--------------------------------------

        if (rate > 0) {

            this.contents.fillRect(

                currentX,

                y,

                currentWidth * rate,

                height,

                SciFi.MenuUI.resourceFillColor(type)

            );

            //----------------------------------
            // Highlight
            //----------------------------------

            this.contents.fillRect(

                currentX,

                y,

                currentWidth * rate - 1,

                2,

                "rgba(255,255,255,0.40)"

            );

        }

        currentX += currentWidth + gap;

    }

};

//=============================================================================
// Matikan auto-scroll vertikal bawaan Window_Selectable
//=============================================================================
// Window_Selectable bawaan MV memanggil ensureCursorVisible() setiap
// select(), yang otomatis menggeser origin.y berdasarkan baris
// (index / maxCols). Karena itemHeight() di plugin ini = tinggi
// window penuh (dipakai untuk 1 baris kartu), auto-scroll itu malah
// menggeser seluruh isi window keluar layar begitu index masuk
// "baris" ke-2 — inilah yang menyebabkan tampilan seperti
// "loncat ke page lain". Carousel horizontal di plugin ini
// ditangani manual lewat _firstVisibleIndex, jadi auto-scroll
// bawaan harus dinonaktifkan.
//=============================================================================

Window_MenuStatus.prototype.ensureCursorVisible =
function() {

    // Sengaja dikosongkan.

};

//=============================================================================
// Update Viewport Carousel
//=============================================================================

Window_MenuStatus.prototype.updateCarouselViewport =
function() {

    if (this._firstVisibleIndex === undefined) {

        this._firstVisibleIndex = 0;

    }

    var index =
        this.index();

    if (index < 0) {

        return;

    }

    var visibleFull =
        this.maxCols();

    //------------------------------------------
    // Geser supaya index yang dipilih selalu
    // berada di dalam rentang full-visible
    //------------------------------------------

    if (index < this._firstVisibleIndex) {

        this._firstVisibleIndex = index;

    } else if (index >
        this._firstVisibleIndex + visibleFull - 1) {

        this._firstVisibleIndex =
            index - visibleFull + 1;

    }

    //------------------------------------------
    // Clamp supaya tidak ada ruang kosong
    // di ujung kanan
    //------------------------------------------

    var maxFirst =
        Math.max(
            0,
            $gameParty.members().length - visibleFull
        );

    if (this._firstVisibleIndex > maxFirst) {

        this._firstVisibleIndex = maxFirst;

    }

    if (this._firstVisibleIndex < 0) {

        this._firstVisibleIndex = 0;

    }

};

var SciFi_MenuUI_WindowMenuStatus_select =
    Window_MenuStatus.prototype.select;

Window_MenuStatus.prototype.select =
function(index) {

    SciFi_MenuUI_WindowMenuStatus_select.call(
        this,
        index
    );

    if (index >= 0) {

        this.updateCarouselViewport();

    }

    this.refresh();

};

//=============================================================================
// Item Rect (dipakai untuk posisi kursor)
//=============================================================================
// Override ini WAJIB ada: Window_Selectable bawaan menghitung rect
// kursor sendiri berdasarkan (index, maxCols, itemWidth, itemHeight)
// tanpa tahu soal _firstVisibleIndex atau area peek. Dengan
// menyamakan itemRect ke cardRect, kursor dijamin selalu berada
// tepat di kartu yang sama dengan yang digambar.
//=============================================================================

Window_MenuStatus.prototype.itemRect =
function(index) {

    return this.cardRect(index);

};

//=============================================================================
// Cursor Kustom (blink konsisten di semua posisi carousel)
//=============================================================================
// Cursor blink bawaan MV adalah sprite yang di-render DI BELAKANG
// contents (gambar kartu). Untuk kartu dengan background semi-transparan
// itu masih agak kelihatan nembus, tapi hasilnya gak konsisten di semua
// posisi. Solusinya: bikin sprite cursor sendiri yang ditaruh DI ATAS
// kartu, jadi blink-nya konsisten di manapun kartu itu berada, termasuk
// yang baru kelihatan setelah carousel geser.
//=============================================================================

var SciFi_MenuUI_WindowMenuStatus_initialize =
    Window_MenuStatus.prototype.initialize;

Window_MenuStatus.prototype.initialize =
function(x, y, width, height) {

    SciFi_MenuUI_WindowMenuStatus_initialize.call(
        this, x, y, width, height
    );

    this._sciFiCursorSprite =
        new Sprite(new Bitmap(1, 1));

    this.addChild(this._sciFiCursorSprite);

        this.createCarouselArrows();

};

//------------------------------------------
// Bikin sprite segitiga isyarat peek kiri/kanan
//------------------------------------------

Window_MenuStatus.prototype.createCarouselArrows =
function() {

    var cfg =
        SciFi.MenuUI.Arrow;

    this._sciFiLeftArrowSprite =
        new Sprite(
            this.createArrowBitmap(cfg, "left")
        );

    this._sciFiRightArrowSprite =
        new Sprite(
            this.createArrowBitmap(cfg, "right")
        );

    this.addChild(this._sciFiLeftArrowSprite);

    this.addChild(this._sciFiRightArrowSprite);

};

Window_MenuStatus.prototype.createArrowBitmap =
function(cfg, direction) {

    var bitmap =
        new Bitmap(cfg.Width, cfg.Height);

    var ctx =
        bitmap._context;

    ctx.fillStyle =
        cfg.Color;

    ctx.beginPath();

    if (direction === "right") {

        ctx.moveTo(0, 0);
        ctx.lineTo(cfg.Width, cfg.Height / 2);
        ctx.lineTo(0, cfg.Height);

    } else {

        ctx.moveTo(cfg.Width, 0);
        ctx.lineTo(0, cfg.Height / 2);
        ctx.lineTo(cfg.Width, cfg.Height);

    }

    ctx.closePath();

    ctx.fill();

    bitmap._setDirty();

    return bitmap;

};

//------------------------------------------
// Update posisi & visibility panah tiap refresh
//------------------------------------------
// Catatan posisi: sprite ini ditambahkan langsung ke window (bukan
// ke this.contents), jadi koordinatnya masih dalam ruang window utuh,
// BUKAN ruang contents. Makanya perlu ditambah this.padding supaya
// sejajar dengan tepi contents (sama kayak kenapa cursor kustom
// kemarin perlu di-offset manual).
//------------------------------------------

Window_MenuStatus.prototype.refreshCarouselArrows =
function() {

    if (!this._sciFiLeftArrowSprite) {

        return;

    }

    var cfg =
        SciFi.MenuUI.Arrow;

    var y =
        this.padding +
        (this.contentsHeight() - cfg.Height) / 2;

    this._sciFiLeftArrowSprite.x =
        this.padding + cfg.Margin;

    this._sciFiLeftArrowSprite.y = y;

    this._sciFiLeftArrowSprite.visible =
        this.hasLeftPeek();

    this._sciFiRightArrowSprite.x =
        this.padding +
        this.contentsWidth() -
        cfg.Width -
        cfg.Margin;

    this._sciFiRightArrowSprite.y = y;

    this._sciFiRightArrowSprite.visible =
        this.hasRightPeek();

};

//------------------------------------------
// Matikan cursor bawaan MV untuk window ini
//------------------------------------------

Window_MenuStatus.prototype.setCursorRect =
function() {

    // Sengaja dikosongkan — diganti cursor kustom di bawah.

};

//------------------------------------------
// Offset cursor kustom
//------------------------------------------

SciFi.MenuUI.Cursor = {

    OffsetX : 18,

    OffsetY : 18

};

//------------------------------------------
// Gambar ulang cursor kustom sesuai posisi kartu terpilih
//------------------------------------------

Window_MenuStatus.prototype.refreshCarouselCursor =
function() {

    if (!this._sciFiCursorSprite) {

        return;

    }

    if (this.index() < 0) {

        this._sciFiCursorSprite.visible = false;

        return;

    }

    var rect =
        this.cardRect(this.index());

    var w = 7;

    var c = "rgba(255, 251, 214, 0.8)";

    var bitmap =
        new Bitmap(rect.width, rect.height);

    // Top
    bitmap.fillRect(7, 0, rect.width - 14, w, c);

    // Bottom
    bitmap.fillRect(7, rect.height - w, rect.width - 14, w, c);

    // Left
    bitmap.fillRect(0, 0, w, rect.height, c);

    // Right
    bitmap.fillRect(rect.width - w, 0, w, rect.height, c);

    // Midline highlight (buat efek "glow" di tengah border)

    bitmap.fillRect(

        w,

        w,

        bitmap.width - w * 2,

        bitmap.height - w * 2,

        "rgba(255,255,255,0.12)"

    );

    this._sciFiCursorSprite.bitmap =
        bitmap;

    this._sciFiCursorSprite.x =
        rect.x +
        SciFi.MenuUI.Cursor.OffsetX;

    this._sciFiCursorSprite.y =
        rect.y +
        SciFi.MenuUI.Cursor.OffsetY;

    this._sciFiCursorSprite.visible = true;

};

//------------------------------------------
// Animasi blink (pakai counter yang sama dengan
// cursor bawaan MV, biar kecepatan kedapnya identik)
//------------------------------------------

var SciFi_MenuUI_WindowMenuStatus_update =
    Window_MenuStatus.prototype.update;

Window_MenuStatus.prototype.update =
function() {

    SciFi_MenuUI_WindowMenuStatus_update.call(this);

    this.updateCarouselCursorBlink();

    // Matikan arrow atas-bawah bawaan MV. Ini perlu dipaksa tiap
    // frame (bukan cukup sekali) karena base class Window
    // menghitung ulang downArrowVisible/upArrowVisible sendiri
    // setiap update() — di sini nilainya ditimpa balik ke false
    // SETELAH base update jalan.
    this.downArrowVisible = false;
    this.upArrowVisible = false;

};

Window_MenuStatus.prototype.updateCarouselCursorBlink =
function() {

    if (!this._sciFiCursorSprite) {

        return;

    }

    if (this.index() < 0) {

        this._sciFiCursorSprite.visible = false;

        return;

    }

    var blinkCount =
        this._animationCount % 40;

    var opacity = 255;

    if (blinkCount < 20) {

        opacity -= blinkCount * 8;

    } else {

        opacity -= (40 - blinkCount) * 8;

    }

    this._sciFiCursorSprite.visible =
        this.isOpen();

    this._sciFiCursorSprite.opacity =
        this.active ? opacity : 128;

};

//=============================================================================
// Nonaktifkan wrap-around (kiri & kanan)
//=============================================================================
// Bawaan MV: kalau di kartu ujung lalu tombol arah DIPENCET (bukan
// ditahan), dia otomatis muter balik ke ujung yang lain. Ini karena
// wrap cuma dicek pakai Input.isTriggered (true di awal pencet baru,
// termasuk kalau tombol dilepas dulu lalu dipencet lagi persis pas
// di kartu ujung) — beda dengan Input.isRepeated yang dipakai untuk
// jalan terus saat ditahan. Makanya "hold sampai ujung" kelihatan
// gak wrap, tapi "lepas lalu pencet lagi pas di ujung" masih wrap.
// Di sini wrap dimatikan total untuk dua arah: kartu terakhir +
// kanan = diam, kartu pertama + kiri = diam.
//=============================================================================

Window_MenuStatus.prototype.cursorRight =
function(wrap) {

    var index =
        this.index();

    var maxItems =
        this.maxItems();

    var maxCols =
        this.maxCols();

    if (maxCols >= 2 && index < maxItems - 1) {

        this.select(index + 1);

    }

};

Window_MenuStatus.prototype.cursorLeft =
function(wrap) {

    var index =
        this.index();

    var maxCols =
        this.maxCols();

    if (maxCols >= 2 && index > 0) {

        this.select(index - 1);

    }

};

//=============================================================================
// Apply Menu Window
//=============================================================================

var _Scene_Menu_create =
    Scene_Menu.prototype.create;

Scene_Menu.prototype.create =
function() {

    _Scene_Menu_create.call(this);

    //------------------------------------------
    // All menu windows
    //------------------------------------------

    var windows = [

        this._commandWindow,

        this._goldWindow,

        this._statusWindow

    ];

    for (var i = 0; i < windows.length; i++) {

        if (windows[i]) {

            SciFi.MenuUI.drawWindow(

                windows[i]

            );

        }

    }

    SciFi.MenuUI.createControlHints(this);

};

//=============================================================================
// Plugin Loaded
//=============================================================================

console.log("SciFi_MenuUI v0.13.0 Loaded");

})();