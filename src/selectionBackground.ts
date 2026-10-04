import { EditorView, RectangleMarker, layer } from '@codemirror/view';
import { contentHorizontalBounds, getLineElement, toDocumentY, visualRowAt, visualRows, VisualRow } from './lineGeometry';

const selectionClass = 'cm-selectionBackground cm-md-selectionBackground';

export const selectionBackgroundLayer = layer({
  class: 'cm-md-selectionLayer',
  above: false,
  markers: createSelectionMarkers,
  update: update => update.docChanged || update.selectionSet || update.viewportChanged || update.geometryChanged,
});

export function createSelectionMarkers(view: EditorView) {
  return view.state.selection.ranges.flatMap(range => {
    if (range.empty) {
      return [];
    }

    const from = Math.max(range.from, view.viewport.from);
    const to = Math.min(range.to, view.viewport.to);
    if (from >= to) {
      return [];
    }

    const markers = RectangleMarker.forRange(view, selectionClass, range);
    const startLine = view.state.doc.lineAt(from);
    const endLine = view.state.doc.lineAt(to - 1);
    const startsOnEmptyLine = startLine.length === 0;
    const endsAtNextLineStart = endLine.number < view.state.doc.lines &&
      view.state.doc.line(endLine.number + 1).from === to;
    const rowsByLine: VisualRow[][] = [];

    for (let number = startLine.number; number <= endLine.number; number++) {
      const line = view.state.doc.line(number);
      const element = getLineElement(view, line);
      if (element === null) {
        return markers;
      }

      rowsByLine.push(visualRows(view, element));
    }

    const startCoords = view.coordsAtPos(from, from === startLine.to && startLine.length > 0 ? -1 : 1);
    const endCoords = view.coordsAtPos(to, to === endLine.from ? 1 : -1);
    if (startCoords === null || endCoords === null) {
      return markers;
    }

    const startRow = visualRowAt(rowsByLine[0], toDocumentY(view, (startCoords.top + startCoords.bottom) / 2));
    const endRows = rowsByLine[rowsByLine.length - 1];
    const endRow = visualRowAt(endRows, toDocumentY(view, (endCoords.top + endCoords.bottom) / 2));
    const allRows = rowsByLine.flat();
    const startIndex = allRows.indexOf(startRow);
    const endIndex = allRows.indexOf(endRow);
    if (startIndex < 0 || endIndex < startIndex) {
      return markers;
    }

    const selectedRows = allRows.slice(startIndex, endIndex + 1).map(({ top, bottom }) => ({ top, bottom }));
    for (let index = 0; index < selectedRows.length - 1; index++) {
      const boundary = (selectedRows[index].bottom + selectedRows[index + 1].top) / 2;
      selectedRows[index].bottom = boundary;
      selectedRows[index + 1].top = boundary;
    }

    if (selectedRows.length === 1) {
      const row = selectedRows[0];
      if (startsOnEmptyLine || endsAtNextLineStart) {
        const { left, width } = contentHorizontalBounds(view);
        return [new RectangleMarker(selectionClass, left, row.top, width, row.bottom - row.top)];
      }

      return markers.map(marker => new RectangleMarker(selectionClass, marker.left, row.top, marker.width, row.bottom - row.top));
    }

    const bridge = markers.find(marker => {
      const middle = marker.top + marker.height / 2;
      return middle > startRow.bottom && middle < endRow.top && marker.width != null;
    });

    const fullWidth = bridge !== undefined
      ? { left: bridge.left, width: bridge.width }
      : contentHorizontalBounds(view);

    const splitAt = (startRow.center + endRow.center) / 2;
    const topMarkers = startsOnEmptyLine
      ? [new RectangleMarker(selectionClass, fullWidth.left, selectedRows[0].top, fullWidth.width, selectedRows[0].bottom - selectedRows[0].top)]
      : markers
        .filter(marker => {
          const middle = marker.top + marker.height / 2;
          return middle < splitAt && middle <= startRow.bottom;
        })
        .map(marker => new RectangleMarker(selectionClass, marker.left, selectedRows[0].top, marker.width, selectedRows[0].bottom - selectedRows[0].top));

    const lastSelectedRow = selectedRows[selectedRows.length - 1];
    const bottomMarkers = endsAtNextLineStart
      ? [new RectangleMarker(selectionClass, fullWidth.left, lastSelectedRow.top, fullWidth.width, lastSelectedRow.bottom - lastSelectedRow.top)]
      : markers
        .filter(marker => {
          const middle = marker.top + marker.height / 2;
          return middle >= splitAt && middle >= endRow.top;
        })
        .map(marker => new RectangleMarker(selectionClass, marker.left, lastSelectedRow.top, marker.width, lastSelectedRow.bottom - lastSelectedRow.top));

    const middleRows = selectedRows.slice(1, -1);
    const middleMarkers = middleRows.map(row => new RectangleMarker(
      selectionClass,
      fullWidth.left,
      row.top,
      fullWidth.width,
      row.bottom - row.top,
    ));

    return [...topMarkers, ...middleMarkers, ...bottomMarkers];
  });
}
