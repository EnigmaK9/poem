/*
 * Creation Date: 2026-07-10
 * Last Modified: 2026-07-10
 * Description: Daily poem rotation logic using UTC date as seed
 * Author: enigmak9
 */

var Rotation = (function () {
  "use strict";

  /**
   * Get the day-of-year seed based on UTC date.
   * Ensures consistent rotation across all timezones.
   * @returns {number} days since start of current UTC year
   */
  function getDailySeed() {
    var now = new Date();
    var utcYear = now.getUTCFullYear();
    var start = Date.UTC(utcYear, 0, 0);
    var diff = now.getTime() - start;
    return Math.floor(diff / 86400000);
  }

  /**
   * Get the featured poem index for today.
   * @param {number} totalPoems - total number of poems available
   * @returns {number} index of the daily poem
   */
  function getDailyPoemIndex(totalPoems) {
    return getDailySeed() % totalPoems;
  }

  /**
   * Build the display order for all poems.
   * Descending order (highest index first), with the daily poem
   * moved to the front as the featured piece.
   * @param {number} totalPoems - total number of poems
   * @returns {number[]} array of indices in display order
   */
  function getDisplayOrder(totalPoems) {
    var dailyIndex = getDailyPoemIndex(totalPoems);
    var order = [];

    // Build descending list, skipping the daily poem
    for (var i = totalPoems - 1; i >= 0; i--) {
      if (i !== dailyIndex) {
        order.push(i);
      }
    }

    // Prepend daily poem as featured
    order.unshift(dailyIndex);

    return order;
  }

  /**
   * Get today's date as a human-readable string.
   * @returns {string} formatted date
   */
  function getTodayLabel() {
    var now = new Date();
    var options = { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" };
    return now.toLocaleDateString("en-US", options);
  }

  /**
   * Self-check: verify seed consistency.
   */
  function selfCheck() {
    var seed1 = getDailySeed();
    var seed2 = getDailySeed();
    return {
      consistent: seed1 === seed2,
      seed: seed1,
      dailyIndex: getDailyPoemIndex(1000),
      displayOrderLength: getDisplayOrder(1000).length
    };
  }

  return {
    getDailySeed: getDailySeed,
    getDailyPoemIndex: getDailyPoemIndex,
    getDisplayOrder: getDisplayOrder,
    getTodayLabel: getTodayLabel,
    selfCheck: selfCheck
  };
})();
