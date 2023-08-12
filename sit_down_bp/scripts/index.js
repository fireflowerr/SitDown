import {system, world} from '@minecraft/server';

const MAX_EVENT_TIME_MS = 2000;

/**
 * @typedef {object} DoubleCrouchTracking
 * @param {number} startTime
 * @param {boolean} hasStood
 */

/**
 * @type {Record<string, DoubleCrouchTracking>}
 */
const crouchingTracker = {};


system.runInterval(() => {
    world.getAllPlayers().forEach((player) => {
        if (performPlayerCheck(player)) {
            player.playAnimation('animation.player.sitting', {
                stopExpression: 'query.is_moving'
            });
        }
    });
});

/**
 * Performs a check regarding the player's double crouching status.
 * 
 * @param {import('@minecraft/server').Player} player 
 */
const performPlayerCheck = (player) => {
    const currentTimestamp = Date.now();
    const trackingInfo = crouchingTracker[player.id];
    const crouching = player.isSneaking;

    if (!trackingInfo) {
        if (crouching) {
            crouchingTracker[player.id] = {
                startTime: currentTimestamp,
                hasStood: false,
            };
        }
        return false;
    }

    if (crouching && trackingInfo.hasStood) {
        const result = currentTimestamp - trackingInfo.startTime < MAX_EVENT_TIME_MS
        delete crouchingTracker[player.id];
        return result;
    }

    if (!crouching && !trackingInfo.hasStood) {
        trackingInfo.hasStood = true;
    }

    return false;
}