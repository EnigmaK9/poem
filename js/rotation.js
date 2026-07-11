/*
 * Creation Date: 2026-07-10
 * Last Modified: 2026-07-10
 * Description: Daily poem rotation logic using UTC date as seed
 * Author: enigmak9
 */

var Rotation = (function () {
  "use strict";

  function mulberry32(seed) {
    return function () {
      seed |= 0;
      seed = (seed + 0x6d2b79f5) | 0;
      var t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
      t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
      return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
    };
  }

  function getDailySeed() {
    var now = new Date();
    var utcYear = now.getUTCFullYear();
    var start = Date.UTC(utcYear, 0, 0);
    var diff = now.getTime() - start;
    return Math.floor(diff / 86400000);
  }

  /**
   * Build a daily-fixed shuffled order of poem indices.
   * Fisher-Yates shuffle seeded by the day, so it's the same all day.
   * @param {number} totalPoems
   * @returns {number[]}
   */
  function getDailyOrder(totalPoems) {
    var seed = getDailySeed();
    var rng = mulberry32(seed);
    var order = [];

    // Build identity array
    for (var i = 0; i < totalPoems; i++) {
      order.push(i);
    }

    // Fisher-Yates shuffle with day-seeded RNG
    for (var j = order.length - 1; j > 0; j--) {
      var k = Math.floor(rng() * (j + 1));
      var tmp = order[j];
      order[j] = order[k];
      order[k] = tmp;
    }

    return order;
  }

  function getTodayLabel() {
    var now = new Date();
    var options = { year: "numeric", month: "long", day: "numeric", timeZone: "UTC" };
    return now.toLocaleDateString("en-US", options);
  }

  function selfCheck() {
    var seed1 = getDailySeed();
    var seed2 = getDailySeed();
    var order = getDailyOrder(10);
    return {
      consistent: seed1 === seed2,
      seed: seed1,
      orderLength: order.length
    };
  }

  return {
    getDailySeed: getDailySeed,
    getDailyOrder: getDailyOrder,
    getTodayLabel: getTodayLabel,
    selfCheck: selfCheck
  };
})();
