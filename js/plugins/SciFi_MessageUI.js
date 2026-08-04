/*:
 * @plugindesc SciFi Message UI v0.2.0
 * @author
 *
 * @param --- Layout ---
 *
 * @param Talk Textbox Height
 * @parent --- Layout ---
 * @type number
 * @desc Tinggi textbox mode talk (di luar name bar). Total window = ini + Name Bar Height.
 * @default 180
 *
 * @param Narration Textbox Height
 * @parent --- Layout ---
 * @type number
 * @desc Tinggi textbox mode narasi (gak ada name bar, jadi ini tinggi total window).
 * @default 180
 *
 * @param Name Bar Height
 * @parent --- Layout ---
 * @type number
 * @desc Tinggi name bar (hanya muncul di talk mode).
 * @default 45
 *
 * @param Portrait Width
 * @parent --- Layout ---
 * @type number
 * @desc Lebar portrait (dari atas ke bawah akan scaled otomatis).
 * @default 348
 *
 * @param Portrait Height
 * @parent --- Layout ---
 * @type number
 * @desc Tinggi portrait.
 * @default 524
 *
 * @param --- Styling ---
 *
 * @param Text Color
 * @parent --- Styling ---
 * @desc Warna text di dalam bubble.
 * @default #fff9df
 *
 * @param Name Text Color
 * @parent --- Styling ---
 * @desc Warna text nama di name bar.
 * @default #fff9df
 *
 * @param Name Offset Left
 * @parent --- Styling ---
 * @type number
 * @desc Jarak nama dari tepi kiri saat talk left (px).
 * @default 18
 *
 * @param Name Offset Right
 * @parent --- Styling ---
 * @type number
 * @desc Jarak nama dari tepi kanan saat talk right (px).
 * @default 18
 *
 * @param Talk Padding X
 * @parent --- Styling ---
 * @type number
 * @desc Jarak TEXT dari tepi kiri/kanan gambar TalkBubble (bukan margin gambarnya sendiri).
 * @default 16
 *
 * @param Talk Padding Y
 * @parent --- Styling ---
 * @type number
 * @desc Jarak TEXT dari tepi atas/bawah gambar TalkBubble (bukan margin gambarnya sendiri).
 * @default 12
 *
 * @param Narration Padding X
 * @parent --- Styling ---
 * @type number
 * @desc Jarak TEXT dari tepi kiri/kanan gambar NarrationBox (bukan margin gambarnya sendiri).
 * @default 16
 *
 * @param Narration Padding Y
 * @parent --- Styling ---
 * @type number
 * @desc Jarak TEXT dari tepi atas/bawah gambar NarrationBox (bukan margin gambarnya sendiri).
 * @default 12
 *
 * @param --- Portrait ---
 *
 * @param Portrait Offset X
 * @parent --- Portrait ---
 * @type number
 * @desc Crop offset X (0-1, 0=left, 0.5=center, 1=right).
 * @default 0.5
 *
 * @param Portrait Offset Y
 * @parent --- Portrait ---
 * @type number
 * @desc Crop offset Y (0-1, 0=top, 0.5=center, 1=bottom).
 * @default 0.5
 *
 * @help
 * ============================================================================
 * SciFi Message UI
 * ============================================================================
 *
 * Sistem message window custom dengan portrait 2 slot independen (kiri &
 * kanan) dan textbox yang bisa di-set jadi talk-left / talk-right /
 * narration. Semua manual lewat plugin command -- gak ada auto-hide.
 *
 * ----------------------------------------------------------------------
 * Portrait Commands
 * ----------------------------------------------------------------------
 *
 *   MePortrait left [character] [expression]
 *   MePortrait right [character] [expression]
 *
 *     Nampilin/update portrait di slot kiri atau kanan. Tiap slot cuma
 *     bisa nampung 1 portrait -- manggil lagi dengan slot yang sama akan
 *     GANTI portrait yang lagi ada di situ (bukan nambah).
 *
 *     contoh: MePortrait left Android happy
 *             MePortrait right MC neutral
 *
 *     Nama karakter MULTI-KATA: pakai underscore buat spasi, karena
 *     RPG Maker MV parse plugin command dengan split spasi biasa (gak
 *     ngerti tanda kutip). Underscore OTOMATIS diubah jadi spasi asli
 *     pas ditampilin di name bar.
 *
 *     contoh: MePortrait left Space_Cowboy happy
 *             -> nama tampil "Space Cowboy", tapi file portrait yang
 *                dicari tetap "Space_Cowboy_happy.png" (underscore-nya
 *                gak ilang di nama file, cuma di TAMPILAN doang).
 *
 *   MePortraitHide left
 *   MePortraitHide right
 *   MePortraitHide all
 *
 *     Sembunyikan portrait di slot tertentu, atau semuanya.
 *
 * ----------------------------------------------------------------------
 * Textbox Commands
 * ----------------------------------------------------------------------
 *
 *   MeTalk left
 *   MeTalk right
 *
 *     Textbox jadi mode dialog, posisi menyesuaikan slot LAWAN dari
 *     yang bicara (talk left -> textbox di kanan, portrait kiri yang
 *     "ngomong", name bar ambil nama dari portrait slot kiri).
 *     Portrait TIDAK otomatis muncul -- pastikan sudah di-set duluan
 *     lewat MePortrait.
 *
 *   MeNarration
 *
 *     Textbox jadi mode narasi: full-width, tanpa name bar. Portrait
 *     (kalau ada yang lagi ditampilkan) tetap kelihatan di BELAKANG
 *     textbox.
 *
 *   Textbox mode ini PERSIST antar Show Text -- gak akan berubah
 *   sendiri, tetap di mode yang sama sampai ada command baru yang
 *   eksplisit menggantinya. Cuma bisa 1 mode aktif dalam satu waktu.
 *
 * ----------------------------------------------------------------------
 * Animasi
 * ----------------------------------------------------------------------
 * Textbox & portrait animasi masuk/keluar otomatis (slide dikit + fade,
 * ease-in-out, 0.3 detik):
 * - Textbox: slide dari Y+30 ke posisi final, fade in/out mengikuti
 *   buka/tutup window.
 * - Portrait: slide dari sisi sendiri (kiri dari -50px, kanan dari
 *   +50px), fade in saat MUNCUL PERTAMA KALI (dari hidden), fade out
 *   saat di-hide (MePortraitHide).
 * - Ganti ekspresi TANPA lepas dari slot (portrait masih kelihatan,
 *   cuma ganti character/expression) TETAP instant, gak ada animasi.
 *
 * ----------------------------------------------------------------------
 * Z-Order
 * ----------------------------------------------------------------------
 * Portrait selalu digambar DI BELAKANG textbox/bubble (baik talk mode
 * maupun narration), tapi tetap di DEPAN map/karakter.
 *
 * ----------------------------------------------------------------------
 * Portrait files:
 *   img/portraits/[CharacterName]_[expression].png
 *   contoh: img/portraits/Android_happy.png
 *
 * Textbox images (WAJIB ada, plugin gak akan jalan tanpa ini):
 *   img/textbox/TalkBubble.png    (920 x 225)
 *   img/textbox/NarrationBox.png  (1280 x 180)
 *
 *   TalkBubble.png didesain buat talkLeft (tail/nama di kiri). Untuk
 *   talkRight, gambar ini di-MIRROR HORIZONTAL otomatis oleh plugin --
 *   gak perlu bikin asset kedua buat sisi kanan.
 *
 * Requires:
 * - SciFi_Core
 * - SciFi_UICore (untuk font style)
 *
 */

var Imported = Imported || {};
Imported.SciFi_MessageUI = true;

var SciFi = SciFi || {};
SciFi.MessageUI = SciFi.MessageUI || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_MessageUI requires SciFi_Core.");
}

//=============================================================================
// Parameters
//=============================================================================

var parameters = PluginManager.parameters("SciFi_MessageUI");

SciFi.MessageUI.TalkTextboxHeight = Number(parameters["Talk Textbox Height"] || 180);
SciFi.MessageUI.NarrationTextboxHeight = Number(parameters["Narration Textbox Height"] || 180);
SciFi.MessageUI.NameBarHeight = Number(parameters["Name Bar Height"] || 45);
SciFi.MessageUI.PortraitWidth = Number(parameters["Portrait Width"] || 348);
SciFi.MessageUI.PortraitHeight = Number(parameters["Portrait Height"] || 524);

SciFi.MessageUI.TextColor = String(parameters["Text Color"] || "#fff9df");
SciFi.MessageUI.NameTextColor = String(parameters["Name Text Color"] || "#fff9df");

SciFi.MessageUI.NameOffsetLeft = Number(parameters["Name Offset Left"] || 18);

SciFi.MessageUI.NameOffsetRight = Number(parameters["Name Offset Right"] || 18);

SciFi.MessageUI.TalkPaddingX = Number(parameters["Talk Padding X"] || 16);
SciFi.MessageUI.TalkPaddingY = Number(parameters["Talk Padding Y"] || 12);
SciFi.MessageUI.NarrationPaddingX = Number(parameters["Narration Padding X"] || 16);
SciFi.MessageUI.NarrationPaddingY = Number(parameters["Narration Padding Y"] || 12);

SciFi.MessageUI.PortraitOffsetX = Number(parameters["Portrait Offset X"] || 0.5);
SciFi.MessageUI.PortraitOffsetY = Number(parameters["Portrait Offset Y"] || 0.5);

var GAP = 12; // Jarak antara portrait & textbox

//=============================================================================
// Textbox Images
//=============================================================================
// TalkBubble.png   : 920x225 (dipakai buat talkLeft, di-mirror horizontal
//                     buat talkRight -- gak perlu 2 asset kiri/kanan).
// NarrationBox.png : 1280x180 (dipakai buat narration, gak ada mirror).
//
// Preload di awal biar udah ready pas message pertama muncul (kalau
// ditunda sampai baru dipakai, ada kemungkinan bitmap belum ready pas
// newPage() pertama kali gambar, jadi ke-skip 1 frame/pesan).
//=============================================================================

SciFi.MessageUI.TextboxFolder = "img/textbox/";

ImageManager.loadBitmap(SciFi.MessageUI.TextboxFolder, "TalkBubble", 0, true);
ImageManager.loadBitmap(SciFi.MessageUI.TextboxFolder, "NarrationBox", 0, true);

SciFi.MessageUI.loadTalkBubble = function() {

    return ImageManager.loadBitmap(SciFi.MessageUI.TextboxFolder, "TalkBubble", 0, true);

};

SciFi.MessageUI.loadNarrationBox = function() {

    return ImageManager.loadBitmap(SciFi.MessageUI.TextboxFolder, "NarrationBox", 0, true);

};

//=============================================================================
// Mirrored Blt Helper
//=============================================================================
// Bitmap.prototype.blt bawaan MV gak support mirror langsung (dw/dh
// negatif gak reliable). Ini gambar bitmap SUMBER ke bitmap TUJUAN
// dengan di-flip horizontal, pakai canvas transform manual.
//=============================================================================

SciFi.MessageUI.bltMirroredX = function(destBitmap, srcBitmap, dx, dy, dw, dh) {

    var ctx = destBitmap._context;

    ctx.save();

    ctx.translate(dx + dw, dy);

    ctx.scale(-1, 1);

    ctx.drawImage(srcBitmap._canvas || srcBitmap._image, 0, 0, srcBitmap.width, srcBitmap.height, 0, 0, dw, dh);

    ctx.restore();

    destBitmap._setDirty();

};

//=============================================================================
// State
//=============================================================================
// portraits.left / portraits.right : { character, expression } atau null
//   kalau null berarti slot itu kosong/hidden.
//
// textboxMode : "narration" (default) | "talkLeft" | "talkRight"
//=============================================================================

SciFi.MessageUI.portraits = {

    left : null,

    right : null

};

SciFi.MessageUI.textboxMode = "narration";

//=============================================================================
// Portrait Filename Helper
//=============================================================================

SciFi.MessageUI.portraitFilename = function(side) {

    var data = SciFi.MessageUI.portraits[side];

    if (!data) {
        return null;
    }

    return data.character + "_" + data.expression;

};

//=============================================================================
// Display Name Helper
//=============================================================================
// RPG Maker MV parse plugin command dengan split spasi biasa (gak
// ngerti tanda kutip), jadi nama karakter multi-kata gak bisa langsung
// ditulis dengan spasi di command. Konvensinya: pakai underscore buat
// spasi di argument character (contoh "Space_Cowboy"), dan itu OTOMATIS
// dikonversi jadi spasi asli pas ditampilkan di name bar ("Space Cowboy").
//
// Filename portrait TETAP pakai underscore apa adanya (gak dikonversi),
// jadi filenya jadi "Space_Cowboy_happy.png" -- cukup samain nama file
// asetnya sesuai argument yang kamu ketik di command.
//=============================================================================

SciFi.MessageUI.displayName = function(characterKey) {

    if (!characterKey) {
        return "";
    }

    return characterKey.replace(/_/g, " ");

};

//=============================================================================
// Plugin Commands
//=============================================================================

const _SciFi_MessageUI_pluginCommand = Game_Interpreter.prototype.pluginCommand;

Game_Interpreter.prototype.pluginCommand = function(command, args) {

    _SciFi_MessageUI_pluginCommand.call(this, command, args);

    //=================================================================
    // MePortrait [left|right] [character] [expression]
    //=================================================================

    if (command === "MePortrait") {

        var side = (args[0] || "").toLowerCase().trim();

        var characterName = (args[1] || "").trim();

        var expression = (args[2] || "").trim();

        if (side !== "left" && side !== "right") {

            console.log("[SciFi MessageUI] ✗ MePortrait: side harus 'left' atau 'right'");

            return;

        }

        if (!characterName || !expression) {

            console.log("[SciFi MessageUI] ✗ MePortrait: character/expression kosong");

            return;

        }

        SciFi.MessageUI.portraits[side] = {

            character : characterName,

            expression : expression

        };

        SciFi.MessageUI.updatePortraits();

        console.log("[SciFi MessageUI] ✓ Portrait " + side + ": " + characterName + "_" + expression);

        return;

    }

    //=================================================================
    // MePortraitHide [left|right|all]
    //=================================================================

    if (command === "MePortraitHide") {

        var target = (args[0] || "").toLowerCase().trim();

        if (target === "left" || target === "all") {

            SciFi.MessageUI.portraits.left = null;

        }

        if (target === "right" || target === "all") {

            SciFi.MessageUI.portraits.right = null;

        }

        SciFi.MessageUI.updatePortraits();

        console.log("[SciFi MessageUI] ✓ Portrait hidden: " + target);

        return;

    }

    //=================================================================
    // MeTalk [left|right]
    //=================================================================

    if (command === "MeTalk") {

        var talkSide = (args[0] || "").toLowerCase().trim();

        if (talkSide !== "left" && talkSide !== "right") {

            console.log("[SciFi MessageUI] ✗ MeTalk: harus 'left' atau 'right'");

            return;

        }

        SciFi.MessageUI.textboxMode = (talkSide === "left") ? "talkLeft" : "talkRight";

        console.log("[SciFi MessageUI] ✓ Textbox mode: " + SciFi.MessageUI.textboxMode);

        return;

    }

    //=================================================================
    // MeNarration
    //=================================================================

    if (command === "MeNarration") {

        SciFi.MessageUI.textboxMode = "narration";

        console.log("[SciFi MessageUI] ✓ Textbox mode: narration");

        return;

    }

};

//=============================================================================
// Animation Config
//=============================================================================
// Textbox & portrait animasi masuk/keluar: slide dikit + fade, ease-in-out,
// 0.3 detik (asumsi 60fps -> 18 frame).
//=============================================================================

SciFi.MessageUI.AnimFrames = 18; // 0.3s @ 60fps

SciFi.MessageUI.PortraitSlideDistance = 50; // px, kiri -50 / kanan +50

SciFi.MessageUI.TextboxSlideDistance = 30; // px, Y+30

SciFi.MessageUI.easeInOutQuad = function(t) {

    return t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;

};

//=============================================================================
// Window_Message Base Style
//=============================================================================

Window_Message.prototype.standardPadding = function() {

    return 0;

};

Window_Message.prototype.lineHeight = function() {

    return 36;

};

//=============================================================================
// Animasi Textbox: State Machine Sendiri (Decoupled dari "openness")
//=============================================================================
// PENTING: sebelumnya kita coba piggyback di sistem "openness" bawaan
// MV (openSpeed(), lalu updateOpen()/updateClose()) -- keduanya TIDAK
// ngefek, kemungkinan besar karena method/mekanisme internal MV yang
// sebenarnya beda dari yang diasumsikan (gak ada cara pasti verifikasi
// tanpa baca source rpg_windows.js langsung).
//
// Solusi yang lebih AMAN: jangan gantungin ke openness sama sekali.
// Pakai open()/close() -- ini API publik MV yang PASTI ada & reliable
// (dipakai luas oleh banyak plugin komunitas) -- buat trigger state
// machine kita sendiri (pola sama kayak animasi portrait yang sudah
// terbukti jalan).
//
// State: "hidden" | "in" | "shown" | "out"
// - open()  dipanggil MV -> mulai phase "in"
// - close() dipanggil MV -> mulai phase "out", TAPI closing ASLI
//   (yang bikin $gameMessage berhenti nge-block interpreter) DITUNDA
//   sampai animasi "out" kita selesai -- supaya timing game tetap
//   sinkron sampai fade-out kelar (gak ke-skip event berikutnya
//   sebelum textbox beneran ilang dari layar).
//=============================================================================

var _SciFi_MessageUI_Window_Message_open = Window_Message.prototype.open;

Window_Message.prototype.open = function() {

    _SciFi_MessageUI_Window_Message_open.call(this);

    this._scifiPhase = "in";

    this._scifiAnimStart = Graphics.frameCount;

    this._scifiPendingClose = null;

};

var _SciFi_MessageUI_Window_Message_close = Window_Message.prototype.close;

Window_Message.prototype.close = function() {

    var self = this;

    // Tunda close ASLI sampai animasi "out" kita selesai.
    this._scifiPhase = "out";

    this._scifiAnimStart = Graphics.frameCount;

    this._scifiPendingClose = function() {

        _SciFi_MessageUI_Window_Message_close.call(self);

    };

};

var _SciFi_MessageUI_Window_Message_update = Window_Message.prototype.update;

Window_Message.prototype.update = function() {

    _SciFi_MessageUI_Window_Message_update.call(this);

    if (this._scifiFinalY === undefined) {

        return;

    }

    var animFrames = SciFi.MessageUI.AnimFrames;

    var elapsed = Graphics.frameCount - (this._scifiAnimStart || 0);

    var rawT;

    if (this._scifiPhase === "in") {

        rawT = Math.min(1, elapsed / animFrames);

        if (rawT >= 1) {

            this._scifiPhase = "shown";

        }

    } else if (this._scifiPhase === "out") {

        var rawTOut = Math.min(1, elapsed / animFrames);

        rawT = 1 - rawTOut;

        if (rawTOut >= 1) {

            // Animasi selesai -- baru sekarang beneran close (openness
            // MV yang asli dipicu di sini, telat sengaja).
            this._scifiPhase = "hidden";

            if (this._scifiPendingClose) {

                this._scifiPendingClose();

                this._scifiPendingClose = null;

            }

        }

    } else if (this._scifiPhase === "shown") {

        rawT = 1;

    } else {

        rawT = 0;

    }

    var t = SciFi.MessageUI.easeInOutQuad(rawT);

    // Slide: mulai dari (finalY + 30), settle ke finalY.
    this.y = this._scifiFinalY + (1 - t) * SciFi.MessageUI.TextboxSlideDistance;

    // Fade: contents sprite alpha (bukan window.opacity -- itu cuma
    // ngatur frame/back bawaan MV yang udah kita hide total).
    if (this._windowContentsSprite) {

        this._windowContentsSprite.alpha = t;

    }

};

//=============================================================================
// Message Window Sizing
//=============================================================================

Window_Message.prototype.windowWidth = function() {

    var mode = SciFi.MessageUI.textboxMode;

    if (mode === "talkLeft" || mode === "talkRight") {

        return Graphics.boxWidth - SciFi.MessageUI.PortraitWidth - GAP;

    }

    // narration: full width
    return Graphics.boxWidth;

};

Window_Message.prototype.windowHeight = function() {

    var mode = SciFi.MessageUI.textboxMode;

    if (mode === "talkLeft" || mode === "talkRight") {

        return SciFi.MessageUI.NameBarHeight + SciFi.MessageUI.TalkTextboxHeight;

    }

    // narration: textbox aja, gak ada name bar
    return SciFi.MessageUI.NarrationTextboxHeight;

};

//=============================================================================
// Message Window Positioning
//=============================================================================

Window_Message.prototype.updatePlacement = function() {

    var mode = SciFi.MessageUI.textboxMode;

    // Simpan posisi Y FINAL terpisah -- animasi slide di update() akan
    // baca nilai ini tiap frame, bukan langsung assign this.y di sini.
    this._scifiFinalY = Graphics.boxHeight - this.height;

    this.y = this._scifiFinalY;

    if (mode === "talkLeft") {

        // Yang bicara portrait KIRI -> textbox di KANAN
        this.x = SciFi.MessageUI.PortraitWidth + GAP;

    } else if (mode === "talkRight") {

        // Yang bicara portrait KANAN -> textbox di KIRI
        this.x = 0;

    } else {

        // narration: full width, mulai dari 0
        this.x = 0;

    }

};

//=============================================================================
// Hook: startMessage - Resize window SEBELUM newPage() jalan, dan
// sembunyikan window skin bawaan MV di talk mode (frame bulat
// krem/putih). Opacity HARUS di-set SETELAH original startMessage()
// dipanggil, karena updateBackground() di dalamnya me-reset opacity
// balik ke 255 berdasarkan setting "Background" di event Show Text.
//=============================================================================

var _SciFi_MessageUI_Window_Message_startMessage = Window_Message.prototype.startMessage;

Window_Message.prototype.startMessage = function() {

    this.updatePlacement();

    this.move(this.x, this.y, this.windowWidth(), this.windowHeight());

    this.createContents();

    if (SciFi.MessageUI._defaultOpacity === undefined) {

        SciFi.MessageUI._defaultOpacity = this.opacity;

        SciFi.MessageUI._defaultBackOpacity = this.backOpacity;

    }

    _SciFi_MessageUI_Window_Message_startMessage.call(this);

    // Semua mode sekarang pakai background custom (image) -- sembunyikan
    // window skin bawaan MV total buat semua mode.
    this.opacity = 0;

    this.backOpacity = 0;

};

//=============================================================================
// Disable Continue Indicator (Triangle) & Input Wait di Talk Mode
//=============================================================================

var _SciFi_MessageUI_Window_Message_updateShowFast = Window_Message.prototype.updateShowFast;

Window_Message.prototype.updateShowFast = function() {

    _SciFi_MessageUI_Window_Message_updateShowFast.call(this);

    // Semua mode sekarang custom -- jangan tampilkan continue indicator.
    this._showFast = false;

};

var _SciFi_MessageUI_Window_Message_isWaitingForInput = Window_Message.prototype.isWaitingForInput;

Window_Message.prototype.isWaitingForInput = function() {

    // Semua mode sekarang custom -- gak perlu triangle/pause bawaan.
    return false;

};

//=============================================================================
// Hook: newPage - Gambar background (name bar + bubble) SETELAH
// contents.clear() (dipanggil di dalam newPage original), SEBELUM text
// mulai digambar (yang terjadi lewat processCharacter setelah newPage
// return). refresh() TIDAK dipakai Window_Message sama sekali, makanya
// override di newPage(), bukan refresh().
//=============================================================================

var _SciFi_MessageUI_Window_Message_newPage = Window_Message.prototype.newPage;

Window_Message.prototype.newPage = function(textState) {

    _SciFi_MessageUI_Window_Message_newPage.call(this, textState);

    var mode = SciFi.MessageUI.textboxMode;

    if (mode === "talkLeft" || mode === "talkRight") {

        this.drawTalkBackground(mode);

        textState.x = SciFi.MessageUI.TalkPaddingX;

        textState.y = SciFi.MessageUI.NameBarHeight + SciFi.MessageUI.TalkPaddingY;

        textState.left = SciFi.MessageUI.TalkPaddingX;

    } else {

        // narration
        this.drawNarrationBackground();

        textState.x = SciFi.MessageUI.NarrationPaddingX;

        textState.y = SciFi.MessageUI.NarrationPaddingY;

        textState.left = SciFi.MessageUI.NarrationPaddingX;

    }

};

//=============================================================================
// Hook: newLineX - baris ke-2/3/dst tetap mulai dari x yang benar.
//=============================================================================

var _SciFi_MessageUI_Window_Message_newLineX = Window_Message.prototype.newLineX;

Window_Message.prototype.newLineX = function() {

    var mode = SciFi.MessageUI.textboxMode;

    // Semua mode sekarang pakai custom background (image), jadi
    // semuanya butuh padding -- tapi besarnya beda talk vs narration.
    if (mode === "talkLeft" || mode === "talkRight") {

        return SciFi.MessageUI.TalkPaddingX;

    }

    return SciFi.MessageUI.NarrationPaddingX;

};

//=============================================================================
// Text Color Override
//=============================================================================

var _SciFi_MessageUI_Window_Message_normalColor = Window_Message.prototype.normalColor;

Window_Message.prototype.normalColor = function() {

    // Semua mode sekarang pakai background custom (image), jadi
    // semuanya pakai warna teks custom yang sama.
    return SciFi.MessageUI.TextColor;

};

//=============================================================================
// Talk Background: Name Bar + Bubble (dengan tail arah kiri/kanan)
//=============================================================================

Window_Message.prototype.drawTalkBackground = function(mode) {

    var contentsWidth = this.contentsWidth();

    var contentsHeight = this.contentsHeight();

    var nameBarHeight = SciFi.MessageUI.NameBarHeight;

    var bitmap = SciFi.MessageUI.loadTalkBubble();

    if (bitmap && bitmap.isReady()) {

        if (mode === "talkLeft") {

            // Normal, gak perlu mirror (bubble aslinya ngarah ke kiri).
            this.contents.blt(

                bitmap,

                0, 0, bitmap.width, bitmap.height,

                0, 0, contentsWidth, contentsHeight

            );

        } else {

            // talkRight -- mirror horizontal, tail otomatis ngarah ke kanan.
            SciFi.MessageUI.bltMirroredX(

                this.contents,

                bitmap,

                0, 0, contentsWidth, contentsHeight

            );

        }

    }

    //--------------------------------------------------------------
    // Nama karakter (ambil dari portrait slot yang lagi "bicara").
    // Align KIRI kalau talkLeft, align KANAN kalau talkRight -- biar
    // nama selalu "nempel" di sisi yang sama dengan portrait & tail.
    //--------------------------------------------------------------

    var side = (mode === "talkLeft") ? "left" : "right";

    var speakerData = SciFi.MessageUI.portraits[side];

    var name = speakerData ? SciFi.MessageUI.displayName(speakerData.character) : "???";

    var align = (mode === "talkLeft") ? "left" : "right";

    // Offset jarak nama dari tepi -- berbeda kiri vs kanan.
    var nameOffsetX = (mode === "talkLeft") ? SciFi.MessageUI.NameOffsetLeft : SciFi.MessageUI.NameOffsetRight;

    this.changeTextColor(SciFi.MessageUI.NameTextColor);

    this.drawText(

        name,

        nameOffsetX,

        (nameBarHeight - this.lineHeight()) / 2 - 10,

        contentsWidth - (nameOffsetX * 2),

        align

    );

    this.resetTextColor();

};

//=============================================================================
// Narration Background -- gambar NarrationBox.png, no mirror needed.
//=============================================================================

Window_Message.prototype.drawNarrationBackground = function() {

    var contentsWidth = this.contentsWidth();

    var contentsHeight = this.contentsHeight();

    var bitmap = SciFi.MessageUI.loadNarrationBox();

    if (bitmap && bitmap.isReady()) {

        this.contents.blt(

            bitmap,

            0, 0, bitmap.width, bitmap.height,

            0, 0, contentsWidth, contentsHeight

        );

    }

};

//=============================================================================
// Portrait Sprite Management (2 slot: left & right)
//=============================================================================

SciFi.MessageUI.portraitSprites = {

    left : null,

    right : null

};

//=============================================================================
// Animation State per Portrait Slot
//=============================================================================
// phase: "hidden" | "in" | "shown" | "out"
// - hidden -> in    : dipicu saat portrait baru pertama kali muncul
//                     (sebelumnya null, sekarang di-set).
// - in -> shown      : otomatis setelah AnimFrames selesai.
// - shown -> out     : dipicu saat portrait di-hide (MePortraitHide).
// - out -> hidden    : otomatis setelah AnimFrames selesai.
//
// Ganti ekspresi TANPA lepas dari slot (character/expression beda tapi
// slot tetap terisi) TIDAK memicu animasi apapun -- tetap instant swap
// sesuai keputusan awal, cukup update bitmap-nya langsung saat phase
// "shown".
//=============================================================================

SciFi.MessageUI.portraitAnim = {

    left : { phase : "hidden", startFrame : 0, lastFilename : null },

    right : { phase : "hidden", startFrame : 0, lastFilename : null }

};

SciFi.MessageUI.createPortraitSprites = function(scene) {

    ["left", "right"].forEach(function(side) {

        var existing = SciFi.MessageUI.portraitSprites[side];

        if (existing && existing.parent) {

            existing.parent.removeChild(existing);

        }

        var sprite = new Sprite();

        sprite.visible = false;

        SciFi.MessageUI.portraitSprites[side] = sprite;

        SciFi.MessageUI.portraitAnim[side] = { phase : "hidden", startFrame : 0, lastFilename : null };

    });

    //----------------------------------------------------------------
    // PENTING: Portrait harus di BELAKANG message window (window
    // hidup di dalam scene._windowLayer), tapi tetap di DEPAN
    // map/spriteset. Jadi insert TEPAT SEBELUM windowLayer di child
    // list scene -- bukan addChild biasa (yang taruh di paling
    // depan/atas semua, termasuk di atas textbox).
    //----------------------------------------------------------------

    var windowLayerIndex = scene.children.indexOf(scene._windowLayer);

    if (windowLayerIndex === -1) {

        // Fallback: kalau windowLayer belum ada entah kenapa, taruh di atas.
        scene.addChild(SciFi.MessageUI.portraitSprites.left);

        scene.addChild(SciFi.MessageUI.portraitSprites.right);

    } else {

        scene.addChildAt(SciFi.MessageUI.portraitSprites.left, windowLayerIndex);

        scene.addChildAt(SciFi.MessageUI.portraitSprites.right, windowLayerIndex);

    }

};

//=============================================================================
// Base X/Y (posisi final, tanpa offset animasi)
//=============================================================================

SciFi.MessageUI.portraitBaseX = function(side) {

    var portraitWidth = SciFi.MessageUI.PortraitWidth;

    return (side === "left") ? 0 : (Graphics.boxWidth - portraitWidth);

};

SciFi.MessageUI.portraitBaseY = function() {

    return Graphics.boxHeight - SciFi.MessageUI.PortraitHeight;

};

SciFi.MessageUI.updatePortraitSide = function(side) {

    var sprite = SciFi.MessageUI.portraitSprites[side];

    if (!sprite) {
        return;
    }

    var anim = SciFi.MessageUI.portraitAnim[side];

    var filename = SciFi.MessageUI.portraitFilename(side);

    var wantVisible = !!filename;

    var now = Graphics.frameCount;

    var animFrames = SciFi.MessageUI.AnimFrames;

    //----------------------------------------------------------------
    // Trigger transisi phase berdasarkan target visibility
    //----------------------------------------------------------------

    if (wantVisible && anim.phase === "hidden") {

        // Baru pertama kali muncul -> mulai animasi IN
        anim.phase = "in";

        anim.startFrame = now;

    } else if (!wantVisible && (anim.phase === "shown" || anim.phase === "in")) {

        // Diminta hide -> mulai animasi OUT
        anim.phase = "out";

        anim.startFrame = now;

    }

    //----------------------------------------------------------------
    // Phase "hidden": sprite beneran gak ditampilkan.
    //----------------------------------------------------------------

    if (anim.phase === "hidden") {

        sprite.visible = false;

        return;

    }

    //----------------------------------------------------------------
    // Load bitmap (dibutuhkan buat phase in/shown/out -- termasuk out,
    // karena butuh gambar terakhir yang masih kepasang buat fade-out).
    //----------------------------------------------------------------

    var bitmapFilename = filename || anim.lastFilename;

    if (!bitmapFilename) {

        sprite.visible = false;

        anim.phase = "hidden";

        return;

    }

    var bitmap = ImageManager.loadPortrait(bitmapFilename);

    if (!bitmap || !bitmap.isReady()) {

        return; // tunggu frame berikutnya sampai bitmap ready

    }

    anim.lastFilename = bitmapFilename;

    var portraitWidth = SciFi.MessageUI.PortraitWidth;

    var portraitHeight = SciFi.MessageUI.PortraitHeight;

    var baseX = SciFi.MessageUI.portraitBaseX(side);

    var baseY = SciFi.MessageUI.portraitBaseY();

    sprite.bitmap = bitmap;

    sprite.visible = true;

    var scaleX = portraitWidth / bitmap.width;

    var scaleY = portraitHeight / bitmap.height;

    var scale = Math.max(scaleX, scaleY);

    sprite.scale.x = scale;

    sprite.scale.y = scale;

    sprite.y = baseY;

    //----------------------------------------------------------------
    // Hitung progress animasi (0-1) buat phase in/out, atau langsung
    // steady (t=1, gak ada offset) buat phase shown.
    //----------------------------------------------------------------

    var slideDistance = SciFi.MessageUI.PortraitSlideDistance;

    var slideDir = (side === "left") ? -1 : 1; // kiri slide dari -50, kanan dari +50

    if (anim.phase === "in") {

        var elapsedIn = now - anim.startFrame;

        var rawTIn = Math.min(1, elapsedIn / animFrames);

        var tIn = SciFi.MessageUI.easeInOutQuad(rawTIn);

        sprite.x = baseX + (1 - tIn) * slideDistance * slideDir;

        sprite.opacity = 255 * tIn;

        if (rawTIn >= 1) {

            anim.phase = "shown";

        }

    } else if (anim.phase === "out") {

        var elapsedOut = now - anim.startFrame;

        var rawTOut = Math.min(1, elapsedOut / animFrames);

        var tOut = SciFi.MessageUI.easeInOutQuad(rawTOut);

        // Kebalikan dari "in": mulai dari posisi normal (t=0 -> di
        // tempat), geser menjauh + fade seiring waktu berjalan.
        sprite.x = baseX + tOut * slideDistance * slideDir;

        sprite.opacity = 255 * (1 - tOut);

        if (rawTOut >= 1) {

            anim.phase = "hidden";

            sprite.visible = false;

        }

    } else {

        // shown: steady, gak ada offset/fade.
        sprite.x = baseX;

        sprite.opacity = 255;

    }

};

SciFi.MessageUI.updatePortraits = function() {

    SciFi.MessageUI.updatePortraitSide("left");

    SciFi.MessageUI.updatePortraitSide("right");

};

//=============================================================================
// Setup Pada Scene_Map onMapLoaded
//=============================================================================
// PENTING: Scene_Map.create() itu ASYNC -- cuma manggil
// DataManager.loadMapData(), belum bikin spriteset/windowLayer sama
// sekali. Spriteset & windowLayer BARU dibuat di onMapLoaded()
// (dipanggil belakangan setelah data map ready). Portrait HARUS
// ditambahkan di onMapLoaded (setelah windowLayer ada), supaya
// insertion-before-windowLayer di createPortraitSprites() valid.
//=============================================================================

var _SciFi_MessageUI_Scene_Map_onMapLoaded = Scene_Map.prototype.onMapLoaded;

Scene_Map.prototype.onMapLoaded = function() {

    _SciFi_MessageUI_Scene_Map_onMapLoaded.call(this);

    // Reset state setiap masuk map baru.
    SciFi.MessageUI.portraits.left = null;

    SciFi.MessageUI.portraits.right = null;

    SciFi.MessageUI.textboxMode = "narration";

    SciFi.MessageUI.createPortraitSprites(this);

};

//=============================================================================
// Update Portrait Sprite Tiap Frame
//=============================================================================

var _SciFi_MessageUI_Scene_Map_update = Scene_Map.prototype.update;

Scene_Map.prototype.update = function() {

    _SciFi_MessageUI_Scene_Map_update.call(this);

    SciFi.MessageUI.updatePortraits();

};

//=============================================================================
// Portrait Loading
//=============================================================================

ImageManager.loadPortrait = function(filename) {

    return this.loadBitmap("img/portraits/", filename, 0, true);

};

//=============================================================================
// Plugin Loaded
//=============================================================================

SciFi.log("MessageUI v0.2.0 Loaded");

})();