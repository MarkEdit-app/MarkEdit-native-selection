import { EditorSelection } from '@codemirror/state';
import { EditorView, getDrawSelectionConfig, RectangleMarker, layer } from '@codemirror/view';
import { getLineElement, toDocumentY, visualRowAt, visualRows } from './lineGeometry';

const cursorLayerClass = 'cm-md-cursorLayer';

export const hideCaretOnSelectionExtension = EditorView.editorAttributes.of(view => ({
  class: view.state.selection.ranges.some(range => !range.empty)
    ? 'cm-md-hideCaretOnSelection'
    : '',
}));

export const nativeCursorLayer = layer({
  class: cursorLayerClass,
  above: true,
  markers: createCursorMarkers,
  update: (update, dom) => {
    if (update.transactions.some(transaction => transaction.selection) || update.focusChanged) {
      dom.style.animationName = dom.style.animationName === 'cm-md-cursor-blink'
        ? 'cm-md-cursor-blink2'
        : 'cm-md-cursor-blink';
    }

    updateAnimation(dom, update.view);
    return update.docChanged || update.selectionSet || update.viewportChanged || update.geometryChanged ||
      update.focusChanged || update.startState !== update.state;
  },
  mount: (dom, view) => {
    updateAnimation(dom, view);
  },
});

function updateAnimation(dom: HTMLElement, view: EditorView) {
  const blinkRate = getDrawSelectionConfig(view.state).cursorBlinkRate;
  dom.style.animationDuration = `${blinkRate}ms`;

  const defaultCursorLayer = view.scrollDOM.querySelector('.cm-cursorLayer');
  if (defaultCursorLayer !== null) {
    dom.style.animationTimingFunction = getComputedStyle(defaultCursorLayer).animationTimingFunction;
  }

  if (blinkRate === 0) {
    dom.style.animationName = 'none';
  } else if (dom.style.animationName === 'none') {
    dom.style.animationName = 'cm-md-cursor-blink';
  }
}

export function createCursorMarkers(view: EditorView) {
  const { drawRangeCursor } = getDrawSelectionConfig(view.state);

  return view.state.selection.ranges.flatMap(range => {
    if (!range.empty && drawRangeCursor === false) {
      return [];
    }

    const isPrimary = range === view.state.selection.main;
    const cursor = range.empty ? range : EditorSelection.cursor(range.head, range.assoc);
    const className = `cm-cursor ${isPrimary ? 'cm-cursor-primary' : 'cm-cursor-secondary'}`;
    const markers = RectangleMarker.forRange(view, className, cursor);
    const line = view.state.doc.lineAt(range.head);
    const element = getLineElement(view, line);
    const coordinates = view.coordsAtPos(range.head, range.assoc || 1);
    if (element === null || coordinates === null) {
      return markers;
    }

    const rows = visualRows(view, element);
    const y = toDocumentY(view, (coordinates.top + coordinates.bottom) / 2);
    const { top, bottom } = visualRowAt(rows, y);
    return markers.map(marker => new RectangleMarker(className, marker.left, top, marker.width, bottom - top));
  });
}
