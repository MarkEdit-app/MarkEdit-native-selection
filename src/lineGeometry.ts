import { Line } from '@codemirror/state';
import { Direction, EditorView } from '@codemirror/view';

export type VisualRow = {
  top: number;
  bottom: number;
  center: number;
};

export function getLineElement(view: EditorView, line: Line): HTMLElement | null {
  let node: Node | null = view.domAtPos(line.from).node;
  while (node && !(node instanceof HTMLElement && node.classList.contains('cm-line'))) {
    node = node.parentNode;
  }

  return node as HTMLElement | null;
}

function lineRect(view: EditorView, element: HTMLElement) {
  const rect = element.getBoundingClientRect();
  const scroller = view.scrollDOM;
  const offset = scroller.scrollTop * view.scaleY - scroller.getBoundingClientRect().top;
  return { top: rect.top + offset, bottom: rect.bottom + offset };
}

export function visualRows(view: EditorView, element: HTMLElement): VisualRow[] {
  const lineBounds = lineRect(view, element);
  const range = document.createRange();
  range.selectNodeContents(element);
  const rects = [...range.getClientRects()];
  if (rects.length === 0) {
    return [row(lineBounds.top, lineBounds.bottom)];
  }

  const rowThreshold = Math.max(1, view.defaultLineHeight / 2);
  const groups: { top: number; bottom: number; center: number }[] = [];

  rects.map(rect => ({
    top: toDocumentY(view, rect.top),
    bottom: toDocumentY(view, rect.bottom),
  }))
  .sort((lhs, rhs) => lhs.top - rhs.top)
  .forEach(rect => {
    const center = (rect.top + rect.bottom) / 2;
    let group: typeof groups[number] | undefined;
    for (let index = groups.length - 1; index >= 0; index--) {
      const candidate = groups[index];
      if (Math.abs(candidate.center - center) < rowThreshold) {
        group = candidate;
        break;
      }
    }

    if (group === undefined) {
      groups.push({ ...rect, center });
    } else {
      group.top = Math.min(group.top, rect.top);
      group.bottom = Math.max(group.bottom, rect.bottom);
      group.center = (group.top + group.bottom) / 2;
    }
  });

  groups.sort((lhs, rhs) => lhs.center - rhs.center);
  return groups.map((group, index) => {
    const top = index === 0
      ? lineBounds.top
      : Math.max(lineBounds.top, (groups[index - 1].center + group.center) / 2);
    const bottom = index === groups.length - 1
      ? lineBounds.bottom
      : Math.min(lineBounds.bottom, (group.center + groups[index + 1].center) / 2);
    return row(top, bottom);
  });
}

export function visualRowAt(rows: VisualRow[], y: number): VisualRow {
  return rows.reduce((nearest, current) => {
    return Math.abs(current.center - y) < Math.abs(nearest.center - y) ? current : nearest;
  });
}

export function toDocumentY(view: EditorView, screenY: number) {
  const scroller = view.scrollDOM;
  return screenY - scroller.getBoundingClientRect().top + scroller.scrollTop * view.scaleY;
}

export function contentHorizontalBounds(view: EditorView) {
  const contentRect = view.contentDOM.getBoundingClientRect();
  const line = view.contentDOM.querySelector('.cm-line');
  const style = line === null ? undefined : window.getComputedStyle(line);
  const paddingLeft = style === undefined ? 0 : parseFloat(style.paddingLeft) || 0;
  const paddingRight = style === undefined ? 0 : parseFloat(style.paddingRight) || 0;
  const textIndent = style === undefined ? 0 : parseFloat(style.textIndent) || 0;
  const left = contentRect.left + paddingLeft + Math.min(0, textIndent);
  const right = contentRect.right - paddingRight;
  const scroller = view.scrollDOM;
  const scrollerRect = scroller.getBoundingClientRect();
  const baseLeft = (view.textDirection === Direction.LTR
    ? scrollerRect.left
    : scrollerRect.right - scroller.clientWidth * view.scaleX) - scroller.scrollLeft * view.scaleX;
  return { left: left - baseLeft, width: Math.max(0, right - left) };
}

function row(top: number, bottom: number): VisualRow {
  return { top, bottom, center: (top + bottom) / 2 };
}
