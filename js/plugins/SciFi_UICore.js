/*:
 * @plugindesc SciFi UI Core v0.1.0
 * @author
 *
 * @help
 * ============================================================================
 * SciFi UI Core
 * ============================================================================
 *
 * Menyediakan style visual generik (window frame, font, gauge segmented)
 * yang dipakai bareng oleh semua plugin UI SciFi (Menu, Equip, Shop, dll).
 *
 * Plugin ini TIDAK tahu soal Window_MenuStatus atau kartu carousel.
 * Murni fungsi gambar yang menerima window sebagai parameter.
 *
 * Requires:
 * - SciFi_Core
 */

var Imported = Imported || {};
Imported.SciFi_UICore = true;

var SciFi = SciFi || {};
SciFi.UICore = SciFi.UICore || {};

(function() {

"use strict";

//=============================================================================
// Dependency Check
//=============================================================================

if (!Imported.SciFi_Core) {
    throw new Error("SciFi_UICore requires SciFi_Core.");
}

//=============================================================================
// Font Style
//=============================================================================

SciFi.UICore.Font = {

    Header: 24,

    HeaderSmall: 18,

    Resource: 18

};

SciFi.UICore.applyFontStyle =
function(window) {

    window.contents.paintOpacity = 255;

    window.contents.outlineColor =
        "rgba(0,0,0,1)";

    window.contents.outlineWidth =
        4;

};

//=============================================================================
// Window Style
//=============================================================================

SciFi.UICore.Window = {

    BackgroundColor : "rgba(9, 10, 12, 0.8)",

    BorderColor : "#2c1b20",

    BorderWidth : 2,

    Opacity : 0.8

};

SciFi.UICore.WindowFrame = {

    Width : 18,

    TopColor : "#a19b91",

    MiddleColor : "#8B857C",

    BottomColor : "#746F67"

};

//=============================================================================
// Draw Window (border + frame + background gradasi)
//=============================================================================

SciFi.UICore.drawWindow =
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

    var c = SciFi.UICore.Window.BackgroundColor;

    bitmap.fillRect(

        0,

        0,

        window.width,

        window.height,

        c

    );

    //------------------------------------------
    // Frame
    //------------------------------------------

    var bw =
        SciFi.UICore.Window.BorderWidth;

    var fw =
        SciFi.UICore.WindowFrame.Width;

    if (fw > 0) {

        var frameCtx =
            bitmap._context;

        var frameGradient =
            frameCtx.createLinearGradient(
                0, 0,
                0, window.height
            );

        frameGradient.addColorStop(
            0, SciFi.UICore.WindowFrame.TopColor
        );

        frameGradient.addColorStop(
            0.3, SciFi.UICore.WindowFrame.MiddleColor
        );

        frameGradient.addColorStop(
            0.7, SciFi.UICore.WindowFrame.MiddleColor
        );

        frameGradient.addColorStop(
            1, SciFi.UICore.WindowFrame.BottomColor
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
        SciFi.UICore.Window.BorderColor;

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

    bitmap.fillRect(
        6,6,
        bw,
        window.height-12,
        bc
    );

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
// Resource Colors
//=============================================================================

SciFi.UICore.resourceFillColor = function(type) {

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

SciFi.UICore.resourceBackColor = function(type) {

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

SciFi.UICore.Gauge = {

    SegmentValue: 20,

    SegmentGap: 2,

    Height: 12

};

//=============================================================================
// Segmented Gauge
//=============================================================================
// Dipanggil dengan window sebagai parameter pertama (bukan method
// milik window tertentu), supaya bisa dipakai dari Equip/Shop/dll
// tanpa harus jadi Window_MenuStatus.
//=============================================================================

SciFi.UICore.drawSegmentGauge =
function(window, type, value, max, x, y, width) {

    var segmentValue =
        SciFi.UICore.Gauge.SegmentValue;

    var gap =
        SciFi.UICore.Gauge.SegmentGap;

    var height =
        SciFi.UICore.Gauge.Height;

    if (max <= 0) {

        return;

    }

    var segmentCount =
        Math.ceil(
            max / segmentValue
        );

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

    var currentX = x;

    for (var i = 0; i < segmentCount; i++) {

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

        window.contents.fillRect(

            currentX,

            y,

            currentWidth,

            height,

            SciFi.UICore.resourceBackColor(type)

        );

        if (rate > 0) {

            window.contents.fillRect(

                currentX,

                y,

                currentWidth * rate,

                height,

                SciFi.UICore.resourceFillColor(type)

            );

            window.contents.fillRect(

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
// Plugin Loaded
//=============================================================================

SciFi.log("UICore v0.1.0 Loaded");

})();