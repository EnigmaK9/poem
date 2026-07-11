/*
 * Creation Date: 2026-07-10
 * Last Modified: 2026-07-10
 * Description: Single-poem display with daily-fixed shuffle
 * Author: enigmak9
 */

(function () {
  "use strict";

  var TOTAL_ORIGINAL = 1000;
  var TOTAL_FAMOUS = 1000;
  var TOTAL = TOTAL_ORIGINAL + TOTAL_FAMOUS;

  var dailyOrder = [];
  var currentPosition = 0;

  /**
   * Generate a poem object given its global index.
   * 0-999: original procedural poems
   * 1000-1999: famous author poems
   */
  function getPoem(globalIndex) {
    if (globalIndex < TOTAL_ORIGINAL) {
      var p = PoemEngine.generate(globalIndex);
      return {
        title: p.title,
        lines: p.lines,
        attribution: "generated / " + p.form + " / " + p.theme,
        index: globalIndex
      };
    }
    var fp = FamousEngine.generate(globalIndex - TOTAL_ORIGINAL);
    return {
      title: fp.title,
      lines: fp.lines,
      attribution: fp.author + " / " + fp.language,
      index: globalIndex
    };
  }

  /**
   * Render a single poem into the display area.
   */
  function showPoem(poem, position) {
    document.getElementById("poem-title").textContent = poem.title;
    document.getElementById("poem-attribution").textContent = poem.attribution;

    var bodyEl = document.getElementById("poem-body");
    bodyEl.innerHTML = "";

    for (var i = 0; i < poem.lines.length; i++) {
      if (poem.lines[i] === "") {
        bodyEl.appendChild(document.createElement("br"));
      } else {
        var p = document.createElement("p");
        p.textContent = poem.lines[i];
        bodyEl.appendChild(p);
      }
    }

    document.getElementById("poem-counter").textContent = (position + 1) + " of " + TOTAL;
  }

  function showNext() {
    currentPosition++;
    if (currentPosition >= dailyOrder.length) {
      currentPosition = 0;
    }
    showPoem(getPoem(dailyOrder[currentPosition]), currentPosition);
  }

  function init() {
    var check = PoemEngine.selfCheck();
    if (!check.allUnique) {
      document.body.textContent = "Poem generation check failed. Please reload.";
      return;
    }

    var fcheck = FamousEngine.selfCheck();
    if (!fcheck.realPoem0) {
      document.body.textContent = "Famous poem check failed. Please reload.";
      return;
    }

    dailyOrder = Rotation.getDailyOrder(TOTAL);
    currentPosition = 0;

    document.getElementById("date-label").textContent = Rotation.getTodayLabel();
    showPoem(getPoem(dailyOrder[0]), 0);

    document.getElementById("next-poem").addEventListener("click", showNext);

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "n") {
        e.preventDefault();
        showNext();
      }
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
