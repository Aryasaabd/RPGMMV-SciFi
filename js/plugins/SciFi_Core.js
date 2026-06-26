/*:
 * @plugindesc SciFi Core v0.1.0
 * @author Arya Setyaki Abdillah & OpenAI ChatGPT
 *
 * @help
 * ============================================================================
 * SciFi Core
 * ============================================================================
 *
 * This plugin provides the core namespace and shared utility functions used by
 * all SciFi plugins.
 *
 * This plugin does NOT change gameplay.
 *
 * Load Order:
 *   1. SciFi_Core
 *   2. SciFi_BattleCore
 *   3. Other SciFi plugins
 *
 */

var Imported = Imported || {};
Imported.SciFi_Core = true;

var SciFi = SciFi || {};

(function () {

"use strict";

//=============================================================================
// Version
//=============================================================================

SciFi.Version = "0.1.0";

//=============================================================================
// Debug
//=============================================================================

SciFi.Debug = true;

//=============================================================================
// Configuration
//=============================================================================

SciFi.Config = {};

//=============================================================================
// Utility
//=============================================================================

SciFi.Utils = {};

/**
 * Clamp a value between minimum and maximum.
 */
SciFi.Utils.clamp = function(value, min, max) {
    return Math.max(min, Math.min(max, value));
};

/**
 * Returns true if value exists.
 */
SciFi.Utils.exists = function(value) {
    return value !== undefined && value !== null;
};

//=============================================================================
// Logger
//=============================================================================

SciFi.log = function(message) {

    if (!SciFi.Debug) return;

    console.log("[SciFi] " + message);

};

//=============================================================================
// Startup
//=============================================================================

SciFi.log("Core Loaded");
SciFi.log("Version " + SciFi.Version);

})();