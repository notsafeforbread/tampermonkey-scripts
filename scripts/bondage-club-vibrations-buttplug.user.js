// ==UserScript==
// @name         Bondage Club Vibrations to Buttplug.io
// @namespace    https://github.com/notsafeforbread/tampermonkey-scripts
// @version      0.3
// @description  Uses buttplug-js to vibrate local sex toys when your character is getting vibed
// @author       notsafeforbread
// @downloadurl  https://github.com/notsafeforbread/tampermonkey-scripts/raw/master/scripts/bondage-club-vibrations-buttplug.user.js
// @updateurl    https://github.com/notsafeforbread/tampermonkey-scripts/raw/master/scripts/bondage-club-vibrations-buttplug.user.js
// @include      https://www.bondageprojects.com/college/R60/BondageClub/
// @include      https://www.bondageprojects.elementfx.com/R60/BondageClub/
// @require      https://cdn.jsdelivr.net/npm/buttplug@0.13.2/dist/web/buttplug.min.js
// @require      https://raw.githubusercontent.com/buttplugio/buttplug-tampermonkey/master/utils/buttplug-tampermonkey-ui.js
// @run-at       document-end
// ==/UserScript==
// Note: Bondage Club beta/cheat servers not included yet.

function isVibrator(Item) {
    'use strict';
    // Might only include vibrators that have been turned on.
    if (InventoryItemHasEffect(Item, "Egged", true)
        && (Item.Property != null)
        && (Item.Property.Intensity != null)
        && (typeof Item.Property.Intensity === "number")
        && !isNaN(Item.Property.Intensity)
        && (Item.Property.Intensity >= 0)
       ) {
        return true;
    }
    else {
        return false;
    }
}

function findHighestVibratorOnPlayer() {
    'use strict';
    // Check if we're logged in? CurrentScreen != "Login"
    var strongestVibe = -1;
    for(let A = 0; A < Player.Appearance.length; A++) {
        var Item = Player.Appearance[A];
        if (isVibrator(Item)){
            var vibrationStrength = Item.Property.Intensity;
            if(vibrationStrength > strongestVibe) {
                strongestVibe = vibrationStrength;
            }
        }
    }
    return strongestVibe;
}

async function stopVibrating() {
    if(typeof window.buttplug_devices !== 'undefined') { // Check if buttplug loaded
        for (const device of window.buttplug_devices) {
            if (device.AllowedMessages.includes("VibrateCmd")) {
                await device.SendStopDeviceCmd();
            }
        }
    }
}

async function vibrateAtIntensity(intensity) {
    if(typeof window.buttplug_devices !== 'undefined') {
        for (const device of window.buttplug_devices) {
            if (device.AllowedMessages.includes("VibrateCmd")) {
                await device.SendVibrateCmd(intensity);
            }
        }
    }
}

function checkVibrations() {
    'use strict';
    var strongestVibe = findHighestVibratorOnPlayer();
    if(strongestVibe == -1) {
        // Turn off vibrators
        stopVibrating();
    } else {
        // Calculate intensity on a scale of 0.0-1.0 and start vibin'
        // -1 = "TurnOff"
        // 0  = "Low"
        // 1  = "Medium"
        // 2  = "High"
        // 3  = "Maximum"
        var scaledIntensity = ((strongestVibe + 1) * 25) / 100
        vibrateAtIntensity(scaledIntensity);
    }
}

// Every second, check for active vibrators on the player
window.setInterval(function(){
  checkVibrations();
}, 1000);
