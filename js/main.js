/*
 * Creation Date: 2026-07-10
 * Last Modified: 2026-07-10
 * Description: DOM rendering and initialization for the poetry site
 * Author: enigmak9
 */

(function () {
  "use strict";

  var POEMS_PER_PAGE = 20;
  var displayOrder = [];
  var renderedCount = 0;
  var streamEl = null;
  var loadMoreBtn = null;

  /**
   * Create a DOM element for a single poem.
   * @param {object} poem - poem object from PoemEngine
   * @param {boolean} isFeatured - whether this is the daily featured poem
   * @returns {HTMLElement}
   */
  function createPoemElement(poem, isFeatured) {
    var article = document.createElement("article");
    article.className = "poem" + (isFeatured ? " poem--featured" : "");
    article.id = "poem-" + poem.id;
    article.setAttribute("data-index", poem.id);
    article.setAttribute("data-theme", poem.theme);
    article.setAttribute("data-form", poem.form);

    if (isFeatured) {
      var badge = document.createElement("span");
      badge.className = "poem__badge";
      badge.textContent = "Poem of the Day";
      article.appendChild(badge);
    }

    var header = document.createElement("header");
    header.className = "poem__header";

    var index = document.createElement("span");
    index.className = "poem__index";
    index.textContent = "#" + poem.id;

    var title = document.createElement("h2");
    title.className = "poem__title";
    title.textContent = poem.title;

    var meta = document.createElement("span");
    meta.className = "poem__meta";
    meta.textContent = poem.form + " / " + poem.theme;

    header.appendChild(index);
    header.appendChild(title);
    header.appendChild(meta);
    article.appendChild(header);

    var body = document.createElement("div");
    body.className = "poem__body";

    for (var i = 0; i < poem.lines.length; i++) {
      if (poem.lines[i] === "") {
        var br = document.createElement("br");
        body.appendChild(br);
      } else {
        var p = document.createElement("p");
        p.className = "poem__line";
        p.textContent = poem.lines[i];
        body.appendChild(p);
      }
    }

    article.appendChild(body);
    return article;
  }

  /**
   * Render a batch of poems into the stream.
   * @param {number} start - starting position in displayOrder
   * @param {number} count - how many to render
   */
  function renderBatch(start, count) {
    var fragment = document.createDocumentFragment();
    var end = Math.min(start + count, displayOrder.length);

    for (var i = start; i < end; i++) {
      var poem = PoemEngine.generate(displayOrder[i]);
      var isFeatured = i === 0 && start === 0;
      fragment.appendChild(createPoemElement(poem, isFeatured));
    }

    streamEl.appendChild(fragment);
    renderedCount = end;

    if (renderedCount >= displayOrder.length) {
      loadMoreBtn.style.display = "none";
    }
  }

  /**
   * Initialize the page.
   */
  function init() {
    var check = PoemEngine.selfCheck();
    if (!check.allUnique) {
      // ponytail: silent fallback, generation is deterministic so this should never fire
      document.body.textContent = "Poem generation check failed. Please reload.";
      return;
    }

    displayOrder = Rotation.getDisplayOrder(PoemEngine.TOTAL_POEMS);

    streamEl = document.getElementById("poem-stream");
    loadMoreBtn = document.getElementById("load-more");

    document.getElementById("date-label").textContent = Rotation.getTodayLabel();
    document.getElementById("poem-count").textContent = PoemEngine.TOTAL_POEMS;

    renderBatch(0, POEMS_PER_PAGE);

    loadMoreBtn.addEventListener("click", function () {
      renderBatch(renderedCount, POEMS_PER_PAGE);
    });
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init);
  } else {
    init();
  }
})();
