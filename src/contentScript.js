/**
 * src/contentScript.js — Tab Out
 *
 * Key insight from diagnostics: the shim exposes cm.cm6, which is the real
 * CM6 EditorView. We add a capture-phase DOM listener on cm.cm6.dom so we
 * intercept Tab before Joplin's keymap system ever sees it.
 *
 * Tab behaviour:
 *   - Cursor before " ' ` ) ] } >  →  move cursor past it
 *   - Cursor before ```             →  fall through (don't exit code fence)
 *   - Text selected                 →  fall through
 *   - Anything else                 →  fall through (normal indent)
 */
'use strict';
/* global module */

module.exports = {
  default: function (context) {
    return {
      plugin: function (CodeMirror) {
        const TAB_OUT_CHARS = new Set(['"', "'", '`', ')', ']', '}', '>']);

        CodeMirror.defineOption('tabOutEnabled', false, function (cm, val) {
          if (!val) return;

          // Access the real CM6 EditorView through the shim
          const view = cm.cm6;
          if (!view || !view.dom) {
            console.warn('[TabOut] cm.cm6 not available');
            return;
          }

          // Guard against registering the listener twice if the option is
          // toggled or the editor is recreated.
          if (view.dom._tabOutAttached) return;
          view.dom._tabOutAttached = true;

          view.dom.addEventListener('keydown', function (event) {
            // Only plain Tab
            if (event.key !== 'Tab' || event.shiftKey || event.ctrlKey || event.altKey || event.metaKey) return;

            const state   = view.state;
            const sel     = state.selection.main;

            // Text selected — let Tab indent normally
            if (!sel.empty) return;

            const pos     = sel.head;
            const nextCh  = state.doc.sliceString(pos, pos + 1);

            // Nothing after cursor
            if (!nextCh) return;

            // Never jump past triple-backtick fence marker
            if (nextCh === '`' && state.doc.sliceString(pos, pos + 3) === '```') return;

            if (TAB_OUT_CHARS.has(nextCh)) {
              event.preventDefault();
              event.stopPropagation();
              view.dispatch({ selection: { anchor: pos + 1 } });
            }
            // Otherwise fall through — Tab propagates and Joplin handles it
          }, true); // capture: true = fires before any other handler

          console.info('[TabOut] keydown listener attached to cm6.dom');
        });
      },

      codeMirrorOptions: {
        tabOutEnabled: true,
      },
    };
  },
};
