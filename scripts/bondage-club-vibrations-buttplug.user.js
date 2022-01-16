// ==UserScript==
// @name         Bondage Club Vibrations to Buttplug.io
// @namespace    https://github.com/notsafeforbread/tampermonkey-scripts
// @version      0.5
// @description  Uses buttplug-js to vibrate local sex toys when your character is getting vibed. Compatible with BCX.
// @author       notsafeforbread
// @downloadurl  https://github.com/notsafeforbread/tampermonkey-scripts/raw/master/scripts/bondage-club-vibrations-buttplug.user.js
// @updateurl    https://github.com/notsafeforbread/tampermonkey-scripts/raw/master/scripts/bondage-club-vibrations-buttplug.user.js
// @include      https://www.bondageprojects.elementfx.com/R*/BondageClub/
// @include      https://www.bondage-europe.com/R*/BondageClub/
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
    // Don't search for vibrators if we aren't logged in or if nothing is vibrating.
    if(CurrentScreen == 'undefined' || CurrentScreen == "Login" || !Player.Effect.includes("Vibrating")) {
        return -1;
    }

    // Consider looking through Character.js for possibly more efficient ways of searching
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



async function initScript() {
    // Used in buttplug > 1.0, but that seems to have issues with buttplug-tampermonkey
    // await Buttplug.buttplugInit();

    // Every second, check for active vibrators on the player
    // Lower this value if you want it to check more often. Setting it too low may cause high CPU usage.
    var checkIntervalMilliseconds = 1000;
    window.setInterval(function(){
        checkVibrations();
    }, checkIntervalMilliseconds);
    console.log('Bondage Club Vibrations to Buttplug.io initialized.');

}

initScript();


