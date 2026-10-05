import { JSONObject, MarkEdit } from 'markedit-api';
import { hideCaretOnSelectionExtension, nativeCursorLayer } from './src/cursor';
import { selectionBackgroundLayer } from './src/selectionBackground';
import { nestedTableEditorSupport } from './src/nestedTableEditors';
import { nativeSelectionTheme } from './src/theme';

const options = (MarkEdit.userSettings['extension.markeditNativeSelection'] ?? {}) as JSONObject;
const showCaretOnSelection = options?.showCaretOnSelection === true;
const selectionExtensions = [
  nativeSelectionTheme,
  selectionBackgroundLayer,
  nativeCursorLayer,
  showCaretOnSelection ? [] : hideCaretOnSelectionExtension,
];

MarkEdit.addExtension([
  ...selectionExtensions,
  nestedTableEditorSupport(selectionExtensions),
]);
