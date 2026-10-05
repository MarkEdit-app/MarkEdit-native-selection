import { Extension, StateEffect } from '@codemirror/state';
import { EditorView, ViewPlugin } from '@codemirror/view';

export function nestedTableEditorSupport(extensions: Extension) {
  return ViewPlugin.fromClass(class {
    private readonly attachedViews = new WeakSet<EditorView>();
    private readonly observer: MutationObserver;

    constructor(private readonly view: EditorView) {
      this.observer = new MutationObserver(() => this.attachExtensions());
      this.observer.observe(view.dom, { childList: true, subtree: true });
      this.attachExtensions();
    }

    destroy() {
      this.observer.disconnect();
    }

    private attachExtensions() {
      for (const content of this.view.dom.querySelectorAll<HTMLElement>('.tbl-cell-editor .cm-content')) {
        const nestedView = EditorView.findFromDOM(content);
        if (nestedView === null || nestedView === this.view || this.attachedViews.has(nestedView)) {
          continue;
        }

        this.attachedViews.add(nestedView);
        nestedView.dispatch({
          effects: StateEffect.appendConfig.of(extensions),
        });
      }
    }
  });
}
