/*
 * Creation Date: 2026-07-10
 * Last Modified: 2026-07-11
 * Description: Single-poem display with daily-fixed shuffle, EN/ES toggle,
 *              and painting gallery below. No dependencies.
 * Author: enigmak9
 */

(function () {
  "use strict";

  var TOTAL_ORIGINAL = 1000;
  var TOTAL_FAMOUS = 1000;
  var TOTAL_POEMS = TOTAL_ORIGINAL + TOTAL_FAMOUS;

  var poemOrder = [];
  var poemPos = 0;
  var paintingOrder = [];
  var paintingPos = 0;
  var currentLang = "en";

  /* ---- Poem Helpers ---- */

  function getPoem(globalIndex, lang) {
    lang = lang || currentLang;
    if (globalIndex < TOTAL_ORIGINAL) {
      var p = PoemEngine.generate(globalIndex, lang);
      return {
        title: p.title,
        lines: p.lines,
        attribution: (lang === "es" ? "generado / " : "generated / ") + p.form + " / " + p.theme,
        index: globalIndex
      };
    }
    var fp = FamousEngine.generate(globalIndex - TOTAL_ORIGINAL, lang);
    return {
      title: fp.title,
      lines: fp.lines,
      attribution: fp.author + " / " + fp.language,
      index: globalIndex
    };
  }

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
    document.getElementById("poem-counter").textContent = (position + 1) + " of " + TOTAL_POEMS;
  }

  function showCurrentPoem() {
    showPoem(getPoem(poemOrder[poemPos], currentLang), poemPos);
  }

  function showNextPoem() {
    poemPos = (poemPos + 1) % poemOrder.length;
    showCurrentPoem();
  }

  /* ---- Painting Helpers ---- */

  function showPainting(painting, position) {
    var el = document.getElementById("painting-display");
    var imgHtml = "";
    if (painting.image) {
      imgHtml = '<img src="' + painting.image + '" alt="' + painting.title + '" class="painting-img" loading="lazy">';
    }
    var desc = painting.description || "";

    el.innerHTML =
      '<div class="painting-card">' +
        imgHtml +
        '<div class="painting-info">' +
          '<h3 class="painting-title">' + painting.title + '</h3>' +
          '<span class="painting-meta">' + painting.artist + " &middot; " + painting.year + " &middot; " + painting.movement + '</span>' +
          (desc ? '<p class="painting-desc">' + desc + "</p>" : "") +
        "</div>" +
      "</div>";

    document.getElementById("painting-counter").textContent = (position + 1) + " of " + PaintingEngine.TOTAL;
  }

  function showCurrentPainting() {
    var p = PaintingEngine.generate(paintingOrder[paintingPos], currentLang);
    showPainting(p, paintingPos);
  }

  function showNextPainting() {
    paintingPos = (paintingPos + 1) % paintingOrder.length;
    showCurrentPainting();
  }

  /* ---- Init ---- */

  function init() {
    if (!PoemEngine.selfCheck().allUnique ||
        !FamousEngine.selfCheck().realPoem0) {
      document.body.textContent = "Generation check failed. Please reload.";
      return;
    }

    poemOrder = Rotation.getDailyOrder(TOTAL_POEMS);
    poemPos = 0;
    paintingOrder = Rotation.getDailyOrder(PaintingEngine.TOTAL);
    paintingPos = 0;

    document.getElementById("date-label").textContent = Rotation.getTodayLabel();
    showCurrentPoem();
    showCurrentPainting();

    document.getElementById("next-poem").addEventListener("click", showNextPoem);
    document.getElementById("next-painting").addEventListener("click", showNextPainting);
    document.getElementById("lang-toggle").addEventListener("click", toggleLang);

    document.addEventListener("keydown", function (e) {
      if (e.key === "ArrowRight" || e.key === " " || e.key === "n") {
        e.preventDefault();
        showNextPoem();
      }
      if (e.key === "p") {
        e.preventDefault();
        showNextPainting();
      }
      if (e.key === "t") {
        e.preventDefault();
        toggleLang();
      }
    });
  }

  function toggleLang() {
    currentLang = currentLang === "en" ? "es" : "en";
    document.getElementById("lang-toggle").textContent = currentLang === "en" ? "ES" : "EN";
    showCurrentPoem();
    showCurrentPainting();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
