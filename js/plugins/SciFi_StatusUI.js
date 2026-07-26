//=============================================================================
// SciFi_StatusUI.js
//=============================================================================

/*:
 * @plugindesc [v1.5] Custom HD Status UI. Panel grouping, dynamic box height, scroll indicators.
 * @author Gemini (AI Assistant)
 *
 * @param --- Layout ---
 * @param Column Ratios
 * @parent --- Layout ---
 * @desc Rasio kolom Kiri, Tengah, Kanan (total 100). Format: Kiri,Tengah,Kanan
 * @default 30,40,30
 *
 * @param Default Portrait
 * @parent --- Layout ---
 * @desc Nama file fallback jika aktor tidak punya tag portrait.
 * @default Actor1_1
 *
 * @param --- Font Sizes ---
 * @param Header Font Size
 * @parent --- Font Sizes ---
 * @type number
 * @desc Ukuran font untuk teks judul (PROFILE, STATS, dll).
 * @default 24
 *
 * @param Content Font Size
 * @parent --- Font Sizes ---
 * @type number
 * @desc Ukuran font untuk teks status, nama, level, exp, dll.
 * @default 20
 *
 * @param Bio Font Size
 * @parent --- Font Sizes ---
 * @type number
 * @desc Ukuran font khusus untuk teks biografi di kolom kiri.
 * @default 18
 *
 * @help
 * ============================================================================
 * PENGATURAN BIOGRAFI & PORTRAIT
 * ============================================================================
 * <portrait: nama_file>
 * <bio>
 * Teks panjang biografi.
 * Baris kosong akan dihitung sebagai pemisah paragraf.
 * </bio>
 *
 * ============================================================================
 * PENGATURAN DYNAMIC TRAITS
 * ============================================================================
 * <custom_trait: Nama Trait | Teks Bonus>
 * tag custom traits bisa ditaruh di actor, class, equipment, ataupun state
 */

(function() {
    var parameters = PluginManager.parameters('SciFi_StatusUI');
    var ratios = String(parameters['Column Ratios'] || '30,40,30').split(',').map(Number);
    var totalRatio = ratios[0] + ratios[1] + ratios[2];
    var leftRatio = ratios[0] / totalRatio;
    var midRatio = ratios[1] / totalRatio;
    var rightRatio = ratios[2] / totalRatio;

    var headerFontSize = Number(parameters['Header Font Size'] || 24);
    var contentFontSize = Number(parameters['Content Font Size'] || 20);
    var bioFontSize = Number(parameters['Bio Font Size'] || 18);

    ImageManager.loadPortrait = function(filename) {
        return this.loadBitmap('img/portraits/', filename, 0, true);
    };

    var _DataManager_isDatabaseLoaded = DataManager.isDatabaseLoaded;
    DataManager.isDatabaseLoaded = function() {
        if (!_DataManager_isDatabaseLoaded.call(this)) return false;
        if (!this._statusBioLoaded) {
            this.processStatusBioNotetags($dataActors);
            this._statusBioLoaded = true;
        }
        return true;
    };

    DataManager.processStatusBioNotetags = function(group) {
        var note1 = /<bio>/i;
        var note2 = /<\/bio>/i;
        for (var n = 1; n < group.length; n++) {
            var obj = group[n];
            var notedata = obj.note.split('\n');
            obj.customBio = '';
            var evalMode = 'none';

            for (var i = 0; i < notedata.length; i++) {
                var line = notedata[i].replace('\r', ''); 
                if (line.match(note1)) {
                    evalMode = 'bio';
                } else if (line.match(note2)) {
                    evalMode = 'none';
                } else if (evalMode === 'bio') {
                    obj.customBio += line + '\n';
                }
            }
        }
    };

    var _Window_Status_initialize = Window_Status.prototype.initialize;
    Window_Status.prototype.initialize = function() {
        _Window_Status_initialize.call(this);
        this._bioScrollY = 0;
        this._maxScrollY = 0;
        this._statPage = 0;
        this._maxStatPages = 2;
        this.applyUICoreStyle(); 
    };

    Window_Status.prototype.applyUICoreStyle = function() {
        if (typeof Imported !== 'undefined' && Imported.SciFi_UICore) {
            SciFi.UICore.drawWindow(this);
            SciFi.UICore.applyFontStyle(this);
        }
    };

    Window_Status.prototype.setActor = function(actor) {
        if (this._actor !== actor) {
            this._actor = actor;
            this._bioScrollY = 0;
            this._statPage = 0;
            this.refresh();
        }
    };

    Window_Status.prototype.refresh = function() {
        this.contents.clear();
        if (this._actor) {
            var w = this.contentsWidth();
            var col1X = 0;
            var col1Width = Math.floor(w * leftRatio);
            var col2X = col1Width;
            var col2Width = Math.floor(w * midRatio);
            var col3X = col1Width + col2Width;
            var col3Width = Math.floor(w * rightRatio);

            this.drawLeftColumn(col1X, 0, col1Width, this.contentsHeight());
            this.drawMiddleColumn(col2X, 0, col2Width, this.contentsHeight());
            this.drawRightColumn(col3X, 0, col3Width, this.contentsHeight());
        }
    };

    // Helper untuk memanggil Panel dari UICore
    Window_Status.prototype.drawPanel = function(x, y, width, height) {
        if (typeof SciFi !== 'undefined' && SciFi.UICore && SciFi.UICore.drawPanel) {
            SciFi.UICore.drawPanel(this, x, y, width, height);
        }
    };

    // ========================================================================
    // KOLOM KIRI (PROFILE & BIO)
    // ========================================================================
    Window_Status.prototype.drawLeftColumn = function(x, y, width, height) {
        var gap = 8;
        var padding = 8;
        var innerX = x + gap;
        var innerW = width - (gap * 2);
        var rowH = 28;

        // --- KOTAK 1: PROFILE HEADER ---
        var headerH = rowH + (padding * 2);
        this.drawPanel(innerX, y + gap, innerW, headerH);
        
        this.contents.fontSize = headerFontSize;
        this.changeTextColor(this.systemColor());
        this.drawText('PROFILE', innerX, y + gap + padding, innerW, 'center');
        this.resetTextColor();

        // --- KOTAK 2: BIO CONTENT ---
        var bioY = y + gap + headerH + gap;
        var bioH = height - bioY - gap;
        this.drawPanel(innerX, bioY, innerW, bioH);

        var bioText = this._actor.actor().customBio || "No biographical data available.";
        
        var ctx = this.contents._context;
        ctx.save();
        ctx.beginPath();
        // Masking teks agar tetap rapi di dalam kotak bio
        ctx.rect(innerX + padding, bioY + padding, innerW - (padding * 2), bioH - (padding * 2));
        ctx.clip();

        this.contents.fontSize = bioFontSize; 
        var textState = { 
            index: 0, 
            x: innerX + padding, 
            y: bioY + padding - this._bioScrollY, 
            left: innerX + padding 
        };
        textState.text = this.convertEscapeCharacters(bioText);
        textState.height = this.calcTextHeight(textState, false);
        
        while (textState.index < textState.text.length) {
            this.processCharacter(textState);
        }
        
        var totalTextHeight = textState.y + this._bioScrollY - (bioY + padding);
        this._maxScrollY = Math.max(0, totalTextHeight - (bioH - (padding * 2)));
        ctx.restore();

        // --- INDIKATOR SCROLL (SEGITIGA ATAS & BAWAH) ---
        var arrowX = innerX + (innerW / 2);
        
        // Indikator Atas (Akan muncul jika sudah discroll ke bawah)
        if (this._bioScrollY > 0) {
            var topArrowY = bioY + padding - 8;
            ctx.save();
            ctx.fillStyle = "#fff9df";
            ctx.beginPath();
            ctx.moveTo(arrowX, topArrowY - 6);
            ctx.lineTo(arrowX - 8, topArrowY + 6);
            ctx.lineTo(arrowX + 8, topArrowY + 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }

        // Indikator Bawah (Akan muncul jika masih ada teks di bawah)
        if (this._bioScrollY < this._maxScrollY) {
            var botArrowY = bioY + bioH - padding + 8;
            ctx.save();
            ctx.fillStyle = "#fff9df";
            ctx.beginPath();
            ctx.moveTo(arrowX - 8, botArrowY - 6);
            ctx.lineTo(arrowX + 8, botArrowY - 6);
            ctx.lineTo(arrowX, botArrowY + 6);
            ctx.closePath();
            ctx.fill();
            ctx.restore();
        }
    };

    // ========================================================================
    // KOLOM TENGAH (INFO, EXP, STATS, TRAITS)
    // ========================================================================
    Window_Status.prototype.drawMiddleColumn = function(x, y, width, height) {
        var gap = 8;
        var padding = 8;
        var innerX = x + gap;
        var innerW = width - (gap * 2);
        var halfW = Math.floor((innerW - padding * 2) / 2);
        var rowH = 26;
        var currentY = y + gap;

        this.contents.fontSize = contentFontSize;

        // --- KOTAK 1: INFO AKTOR (Nama, Nickname, Level, Class) ---
        var box1H = (rowH * 2) + (padding * 2);
        this.drawPanel(innerX, currentY, innerW, box1H);

        var lineY = currentY + padding;
        this.drawActorName(this._actor, innerX + padding, lineY);
        this.drawActorNickname(this._actor, innerX + padding + halfW, lineY, halfW);
        lineY += rowH;
        this.drawActorLevel(this._actor, innerX + padding, lineY);
        this.drawActorClass(this._actor, innerX + padding + halfW, lineY, halfW);
        
        currentY += box1H + gap;

        // --- KOTAK 2: EXP INFO ---
        var box2H = (rowH * 2) + (padding * 2);
        this.drawPanel(innerX, currentY, innerW, box2H);

        lineY = currentY + padding;
        this.changeTextColor(this.systemColor());
        this.drawText('EXP Current:', innerX + padding, lineY, halfW);
        this.resetTextColor();
        this.drawText(this._actor.currentExp(), innerX + padding + halfW, lineY, halfW, 'right');
        lineY += rowH;

        this.changeTextColor(this.systemColor());
        this.drawText('To Next Lvl:', innerX + padding, lineY, halfW);
        this.resetTextColor();
        this.drawText(this._actor.nextRequiredExp(), innerX + padding + halfW, lineY, halfW, 'right');

        currentY += box2H + gap;

        // --- KOTAK 3: STATS HEADER ---
        var box3H = rowH + (padding * 2);
        this.drawPanel(innerX, currentY, innerW, box3H);

        this.contents.fontSize = headerFontSize;
        this.changeTextColor(this.systemColor());
        this.drawText('STATS', innerX + padding, currentY + padding, halfW);
        this.resetTextColor();
        
        this.contents.fontSize = contentFontSize - 2;
        this.changeTextColor("#7CFFB2");
        this.drawText('Page ' + (this._statPage + 1) + '/' + this._maxStatPages, innerX + padding + halfW, currentY + padding, halfW, 'right');
        this.resetTextColor();

        currentY += box3H + gap;

        // --- KOTAK 4: STATS LIST ---
        var statList = this.getStatPageData();
        var box4H = (rowH * statList.length) + (padding * 2);
        this.drawPanel(innerX, currentY, innerW, box4H);

        for (var i = 0; i < statList.length; i++) {
            var statY = currentY + padding + (i * rowH);
            this.changeTextColor(this.systemColor());
            this.drawText(statList[i].name, innerX + padding, statY, halfW);
            this.resetTextColor();
            this.drawText(statList[i].value, innerX + padding + halfW, statY, halfW, 'right');
        }

        currentY += box4H + gap;

        // --- KOTAK 5: TRAITS HEADER ---
        var box5H = rowH + (padding * 2);
        this.drawPanel(innerX, currentY, innerW, box5H);

        this.contents.fontSize = headerFontSize;
        this.changeTextColor(this.systemColor());
        this.drawText('SPECIAL TRAITS', innerX + padding, currentY + padding, innerW - (padding * 2));
        this.resetTextColor();

        currentY += box5H + gap;

        // --- KOTAK 6: TRAITS LIST (Memanjang Otomatis Sampai Bawah) ---
        var box6H = height - currentY - gap;
        this.drawPanel(innerX, currentY, innerW, box6H);

        var traits = this.getCustomTraits(this._actor);
        var maxTraitsToShow = Math.floor((box6H - (padding * 2)) / rowH);
        
        this.contents.fontSize = contentFontSize;
        if (traits.length === 0) {
            this.drawText("- None -", innerX + padding, currentY + padding, innerW - (padding * 2), 'center');
        } else {
            for (var t = 0; t < Math.min(traits.length, maxTraitsToShow); t++) {
                var traitY = currentY + padding + (t * rowH);
                this.resetTextColor();
                this.drawText(traits[t].name, innerX + padding, traitY, halfW);
                this.changeTextColor(this.powerUpColor());
                this.drawText(traits[t].bonus, innerX + padding + halfW, traitY, halfW, 'right');
            }
        }
    };

    Window_Status.prototype.getStatPageData = function() {
        var a = this._actor;
        if (this._statPage === 0) {
            return [
                { name: TextManager.param(2), value: a.param(2) },
                { name: TextManager.param(3), value: a.param(3) },
                { name: TextManager.param(4), value: a.param(4) },
                { name: TextManager.param(5), value: a.param(5) },
                { name: TextManager.param(6), value: a.param(6) },
                { name: TextManager.param(7), value: a.param(7) }
            ];
        } else {
            return [
                { name: 'Accuracy', value: Math.round(a.hit * 100) + '%' },
                { name: 'Evasion', value: Math.round(a.eva * 100) + '%' },
                { name: 'Crit Rate', value: Math.round(a.cri * 100) + '%' },
                { name: 'Crit Evade', value: Math.round(a.cev * 100) + '%' },
                { name: 'Counter', value: Math.round(a.cnt * 100) + '%' },
                { name: 'HP Regen', value: Math.round(a.hrg * 100) + '%' }
            ];
        }
    };

    Window_Status.prototype.getCustomTraits = function(actor) {
        var traits = [];
        var regex = /<custom_trait:\s*(.+?)\s*\|\s*(.+?)>/gi;
        
        var objects = [actor.actor(), actor.currentClass()];
        var equips = actor.equips();
        for (var i = 0; i < equips.length; i++) {
            if (equips[i]) objects.push(equips[i]);
        }
        var states = actor.states();
        for (var j = 0; j < states.length; j++) {
            if (states[j]) objects.push(states[j]);
        }
        
        objects.forEach(function(obj) {
            if (obj && obj.note) {
                var match;
                while ((match = regex.exec(obj.note)) !== null) {
                    traits.push({ name: match[1].trim(), bonus: match[2].trim() });
                }
            }
        });
        
        return traits;
    };

    // ========================================================================
    // KOLOM KANAN (PORTRAIT)
    // ========================================================================
    Window_Status.prototype.drawRightColumn = function(x, y, width, height) {
        var metaData = this._actor.actor().meta;
        var portraitName = metaData.portrait || parameters['Default Portrait'];
        var bitmap = ImageManager.loadPortrait(portraitName);
        
        if (bitmap.width <= 0) {
            bitmap.addLoadListener(function() {
                this.drawPortraitImage(bitmap, x, y, width, height);
            }.bind(this));
        } else {
            this.drawPortraitImage(bitmap, x, y, width, height);
        }
    };

    Window_Status.prototype.drawPortraitImage = function(bitmap, x, y, width, height) {
        var dx = x + (width / 2) - (bitmap.width / 2);
        var dy = y + (height / 2) - (bitmap.height / 2);
        this.contents.blt(bitmap, 0, 0, bitmap.width, bitmap.height, dx, Math.max(y, dy));
    };

    var _Window_Status_resetFontSettings = Window_Status.prototype.resetFontSettings;
    Window_Status.prototype.resetFontSettings = function() {
        _Window_Status_resetFontSettings.call(this);
        if (typeof Imported !== 'undefined' && Imported.SciFi_UICore) {
            SciFi.UICore.applyFontStyle(this);
        }
    };

    var _Window_Status_update = Window_Status.prototype.update;
    Window_Status.prototype.update = function() {
        _Window_Status_update.call(this);
        this.updateBioScroll();
        this.updatePageCycle();
    };

    Window_Status.prototype.updateBioScroll = function() {
        var scrollSpeed = 5;
        var scrolled = false;

        if (Input.isPressed('down')) {
            if (this._bioScrollY < this._maxScrollY) {
                this._bioScrollY += scrollSpeed;
                scrolled = true;
            }
        } else if (Input.isPressed('up')) {
            if (this._bioScrollY > 0) {
                this._bioScrollY -= scrollSpeed;
                scrolled = true;
            }
        }

        if (this._bioScrollY > this._maxScrollY) this._bioScrollY = this._maxScrollY;
        if (this._bioScrollY < 0) this._bioScrollY = 0;

        if (scrolled) this.refresh();
    };

    Window_Status.prototype.updatePageCycle = function() {
        if (Input.isTriggered('shift')) {
            SoundManager.playCursor();
            this._statPage = (this._statPage + 1) % this._maxStatPages;
            this.refresh();
        }
    };

})();