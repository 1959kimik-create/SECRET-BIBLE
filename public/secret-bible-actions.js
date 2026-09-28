(function () {
  if (window.__SECRET_BIBLE_ACTIONS_LOADED__) return;
  window.__SECRET_BIBLE_ACTIONS_LOADED__ = true;

  function paint(message, success) {
    window.dispatchEvent(
      new CustomEvent("secret-bible:prompt", { detail: { message: message, success: !!success } })
    );
  }

  function eventTargetNode(t) {
    if (!t) return null;
    if (t.nodeType === 3 && t.parentElement) return t.parentElement;
    return t;
  }

  function readOpinion() {
    var ta = document.getElementById("opinion-textarea");
    return ta && ta.value ? String(ta.value).trim() : "";
  }

  function readSelection() {
    var bookEl = document.getElementById("bible-book-select");
    var chapterEl = document.getElementById("bible-chapter-select");
    var startEl = document.getElementById("bible-start-verse-select");
    var endEl = document.getElementById("bible-end-verse-select");
    return {
      book: bookEl ? bookEl.value : "",
      chapter: chapterEl ? Number(chapterEl.value) : 0,
      startVerse: startEl ? Number(startEl.value) : 0,
      endVerse: endEl ? Number(endEl.value) : 0,
    };
  }

  function readPassageText() {
    var pre = document.getElementById("bible-passage-display");
    return pre ? pre.textContent || "" : "";
  }

  function updateBlocksPanel(blocks) {
    var panel = document.getElementById("saved-blocks-panel");
    if (!panel) return;
    var html =
      '<li class="font-medium text-zinc-300">영상에 포함될 구절: <span class="text-amber-300">' +
      blocks.length +
      "</span>개</li>";
    if (!blocks.length) {
      html += '<li class="text-zinc-600">아직 저장된 구절 없음</li>';
    } else {
      for (var i = 0; i < blocks.length; i++) {
        var b = blocks[i];
        var ref =
          b.book +
          " " +
          b.chapter +
          ":" +
          b.startVerse +
          (b.endVerse !== b.startVerse ? "~" + b.endVerse : "");
        html += '<li class="text-zinc-300">· ' + ref + "</li>";
      }
    }
    panel.innerHTML = html;
  }

  function newId() {
    if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
    return "block-" + Date.now();
  }

  async function saveAndNext(ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    paint("저장 확인 중… (동작 확인됨)", false);

    if (!window.secretBible || !window.secretBible.appendContentBlock) {
      paint("⚠ Electron API가 없습니다.\n시작하기.bat 또는 npm.cmd run electron:dev 로 실행하세요.", false);
      return;
    }

    var sel = readSelection();
    if (!sel.book) {
      paint("⚠ 성경을 선택해 주세요.", false);
      return;
    }
    var opinion = readOpinion();
    if (!opinion) {
      paint("⚠ 위쪽 「나의 의견」 칸에 글을 입력해 주세요.", false);
      return;
    }

    var block = {
      id: newId(),
      book: sel.book,
      chapter: sel.chapter,
      startVerse: sel.startVerse,
      endVerse: sel.endVerse,
      bibleText: readPassageText(),
      opinion: opinion,
    };

    try {
      var res = await window.secretBible.appendContentBlock(block);
      if (!res.ok) {
        paint("⚠ " + (res.message || "저장 실패"), false);
        return;
      }
      updateBlocksPanel(res.blocks);
      var label =
        sel.book +
        " " +
        sel.chapter +
        ":" +
        sel.startVerse +
        (sel.endVerse !== sel.startVerse ? "~" + sel.endVerse : "");
      var okMsg =
        "✅ " +
        label +
        " 저장! (총 " +
        res.blocks.length +
        "개)\n맨 위 「성경」에서 다음 구절을 고르세요.";
      paint(okMsg, true);
      var ta = document.getElementById("opinion-textarea");
      if (ta) ta.value = "";
      window.dispatchEvent(new CustomEvent("secret-bible:blocks-updated", { detail: res.blocks }));
      window.dispatchEvent(
        new CustomEvent("secret-bible:saved-next", {
          detail: { blocks: res.blocks, label: label, message: okMsg },
        })
      );
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      paint("⚠ 오류: " + String(err), false);
    }
  }

  async function finishVideo(ev) {
    if (ev) {
      ev.preventDefault();
      ev.stopPropagation();
    }
    paint("영상 제작 준비 중…", false);

    if (!window.secretBible) {
      paint("⚠ Electron API 없음", false);
      return;
    }

    var sel = readSelection();
    var opinion = readOpinion();
    var blocksRes = await window.secretBible.getContentBlocks();
    var blocks = blocksRes.blocks || [];

    if (sel.book && opinion) {
      var block = {
        id: newId(),
        book: sel.book,
        chapter: sel.chapter,
        startVerse: sel.startVerse,
        endVerse: sel.endVerse,
        bibleText: readPassageText(),
        opinion: opinion,
      };
      var appendRes = await window.secretBible.appendContentBlock(block);
      if (appendRes.ok) blocks = appendRes.blocks;
    }

    if (!blocks.length) {
      paint("⚠ 저장된 구절이 없습니다. 의견을 입력하고 다시 시도하세요.", false);
      return;
    }

    window.dispatchEvent(new CustomEvent("secret-bible:start-generate", { detail: blocks }));
  }

  function handleActionClick(e) {
    if (window.__SECRET_BIBLE_REACT_CLICK__) return;
    var t = eventTargetNode(e.target);
    if (!t || !t.closest) return;
    if (t.closest("#btn-next-bible-yes") || t.closest("#btn-save-and-next")) {
      saveAndNext(e);
    } else if (t.closest("#btn-next-bible-no")) {
      finishVideo(e);
    }
  }

  document.addEventListener("click", handleActionClick, true);

  document.addEventListener(
    "mousedown",
    function (e) {
      var t = eventTargetNode(e.target);
      if (!t || !t.closest) return;
      if (window.__SECRET_BIBLE_REACT_CLICK__) return;
      if (t.closest("#btn-next-bible-yes") || t.closest("#btn-save-and-next")) {
        paint("버튼 눌림 감지… (백업 JS)", false);
      }
    },
    true
  );
})();
