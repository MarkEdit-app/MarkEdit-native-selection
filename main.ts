import { JSONObject, MarkEdit } from 'markedit-api';
import { hideCaretOnSelectionExtension, nativeCursorLayer } from './src/cursor';
import { selectionBackgroundLayer } from './src/selectionBackground';
import { nativeSelectionTheme } from './src/theme';

const options = (MarkEdit.userSettings['extension.markeditNativeSelection'] ?? {}) as JSONObject;
const showCaretOnSelection = options?.showCaretOnSelection === true;

MarkEdit.addExtension([
  nativeSelectionTheme,
  selectionBackgroundLayer,
  nativeCursorLayer,
  showCaretOnSelection ? [] : hideCaretOnSelectionExtension,
]);
