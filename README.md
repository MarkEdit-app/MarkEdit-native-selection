# MarkEdit-native-selection

macOS-style text selections for MarkEdit.

CodeMirror's selection backgrounds can be shorter than visual rows. This extension fills each row and adds a full-height blinking caret, hidden during selections by default.

## Installation

Install this extension from the [MarkEdit Extension Registry](https://markedit-app.github.io/extensions/#markedit-native-selection).

## Settings

To show the blinking caret while text is selected, set `showCaretOnSelection` to `true` in MarkEdit's [settings.json](https://github.com/MarkEdit-app/MarkEdit/wiki/Customization#advanced-settings):

```json
{
  "extension.markeditNativeSelection": {
    "showCaretOnSelection": true
  }
}
```

## Building

```sh
yarn install
yarn build
```

`yarn build` also deploys `markedit-native-selection.js` to your local MarkEdit installation.
