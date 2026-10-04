import { EditorView } from '@codemirror/view';

export const nativeSelectionTheme = EditorView.theme({
  '.cm-selectionLayer .cm-selectionBackground': {
    backgroundColor: 'transparent !important',
  },
  '.cm-cursorLayer .cm-cursor': {
    display: 'none !important',
  },
  '.cm-cursor, .cm-dropCursor': {
    borderLeftWidth: '2px',
    borderRadius: '1px',
  },
  '.cm-md-cursorLayer': {
    pointerEvents: 'none',
    visibility: 'hidden',
  },
  '&.cm-focused:not(.cm-shapedCursorEnabled) > .cm-scroller > .cm-md-cursorLayer .cm-cursor': {
    display: 'block !important',
  },
  '&.cm-focused:not(.cm-shapedCursorEnabled) > .cm-scroller > .cm-md-cursorLayer': {
    visibility: 'visible',
    animation: 'cm-md-cursor-blink infinite',
  },
  '&.cm-md-hideCaretOnSelection > .cm-scroller > .cm-md-cursorLayer, &.cm-md-hideCaretOnSelection > .cm-scroller > .cm-shapedCursorLayer': {
    visibility: 'hidden !important',
    animationName: 'none !important',
  },
  '@keyframes cm-md-cursor-blink': { '40%, 90%': { opacity: 1 }, '60%, 70%': { opacity: 0 } },
  '@keyframes cm-md-cursor-blink2': { '40%, 90%': { opacity: 1 }, '60%, 70%': { opacity: 0 } },
});
