import { basicSetup } from "codemirror";
import { indentWithTab } from "@codemirror/commands";
import { javascript } from "@codemirror/lang-javascript";
import { bracketMatching, HighlightStyle, syntaxHighlighting } from "@codemirror/language";
import { Compartment, EditorState } from "@codemirror/state";
import { EditorView, highlightActiveLine, keymap, lineNumbers } from "@codemirror/view";
import { tags } from "@lezer/highlight";

const darkHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#72D7FF" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#F3C66D" },
  { tag: [tags.definition(tags.variableName), tags.variableName], color: "#D9E2F0" },
  { tag: tags.propertyName, color: "#8ED0FF" },
  { tag: [tags.string, tags.special(tags.string)], color: "#A8D991" },
  { tag: [tags.number, tags.bool, tags.null], color: "#C9A7FF" },
  { tag: [tags.lineComment, tags.blockComment], color: "#718093", fontStyle: "italic" },
  { tag: [tags.operator, tags.punctuation], color: "#AAB5C4" },
  { tag: tags.typeName, color: "#F3A9C8" },
  { tag: tags.invalid, color: "#FF7C91", textDecoration: "underline wavy" }
]);

const lightHighlight = HighlightStyle.define([
  { tag: tags.keyword, color: "#006F92" },
  { tag: [tags.function(tags.variableName), tags.function(tags.propertyName)], color: "#875A00" },
  { tag: [tags.definition(tags.variableName), tags.variableName], color: "#263444" },
  { tag: tags.propertyName, color: "#086D9A" },
  { tag: [tags.string, tags.special(tags.string)], color: "#39752D" },
  { tag: [tags.number, tags.bool, tags.null], color: "#7752A8" },
  { tag: [tags.lineComment, tags.blockComment], color: "#718093", fontStyle: "italic" },
  { tag: [tags.operator, tags.punctuation], color: "#536173" },
  { tag: tags.typeName, color: "#A53B70" },
  { tag: tags.invalid, color: "#C52F4B", textDecoration: "underline wavy" }
]);

const editorTheme = (mode) => EditorView.theme({
  "&": {
    height: "100%",
    color: mode === "dark" ? "#E7ECF3" : "#202A36",
    backgroundColor: mode === "dark" ? "#10141A" : "#FBFCFD"
  },
  ".cm-scroller": {
    fontFamily: '"Cascadia Code", Consolas, "Microsoft YaHei UI", monospace',
    fontSize: "12px",
    lineHeight: "1.65",
    overflow: "auto"
  },
  ".cm-content": { padding: "12px 0", caretColor: "var(--color-accent)" },
  ".cm-line": { padding: "0 16px" },
  ".cm-gutters": {
    color: mode === "dark" ? "#657184" : "#8490A0",
    backgroundColor: mode === "dark" ? "#151A21" : "#F1F4F7",
    borderRight: `1px solid ${mode === "dark" ? "#2B323D" : "#D9E0E7"}`
  },
  ".cm-activeLine": { backgroundColor: mode === "dark" ? "rgba(39,199,235,.07)" : "rgba(8,125,156,.07)" },
  ".cm-activeLineGutter": { color: "var(--color-accent)", backgroundColor: "transparent" },
  ".cm-selectionBackground, ::selection": { backgroundColor: mode === "dark" ? "#214E5C !important" : "#BFE8F1 !important" },
  ".cm-cursor, .cm-dropCursor": { borderLeftColor: "var(--color-accent)" },
  ".cm-matchingBracket": { color: "inherit", outline: "1px solid var(--color-accent)", backgroundColor: "var(--color-accent-soft)" },
  ".cm-panels": { backgroundColor: mode === "dark" ? "#171C23" : "#F5F7F9", color: "inherit" },
  ".cm-tooltip": { border: "1px solid var(--color-line-control)", backgroundColor: mode === "dark" ? "#1B2027" : "#FFFFFF" }
}, { dark: mode === "dark" });

function languageExtension(language) {
  return javascript({ jsx: false, typescript: false });
}

function create(root, options = {}) {
  if (!root) throw new Error("KuroiiCodeEditor requires a root element.");
  const languageCompartment = new Compartment();
  const themeCompartment = new Compartment();
  let currentLanguage = options.language === "expression" ? "expression" : "extendscript";
  let currentTheme = options.theme === "light" ? "light" : "dark";

  const view = new EditorView({
    parent: root,
    state: EditorState.create({
      doc: options.doc || "",
      extensions: [
        basicSetup,
        lineNumbers(),
        highlightActiveLine(),
        bracketMatching(),
        keymap.of([indentWithTab]),
        languageCompartment.of(languageExtension(currentLanguage)),
        themeCompartment.of([
          editorTheme(currentTheme),
          syntaxHighlighting(currentTheme === "dark" ? darkHighlight : lightHighlight)
        ]),
        EditorView.updateListener.of((update) => {
          if (update.docChanged && typeof options.onChange === "function") {
            options.onChange(update.state.doc.toString());
          }
          if (update.selectionSet && typeof options.onSelectionChange === "function") {
            const head = update.state.selection.main.head;
            const line = update.state.doc.lineAt(head);
            options.onSelectionChange({ line: line.number, column: head - line.from + 1 });
          }
        })
      ]
    })
  });

  return {
    getValue() {
      return view.state.doc.toString();
    },
    setValue(value) {
      view.dispatch({ changes: { from: 0, to: view.state.doc.length, insert: value || "" } });
    },
    setLanguage(language) {
      currentLanguage = language === "expression" ? "expression" : "extendscript";
      view.dispatch({ effects: languageCompartment.reconfigure(languageExtension(currentLanguage)) });
    },
    setTheme(theme) {
      currentTheme = theme === "light" ? "light" : "dark";
      view.dispatch({ effects: themeCompartment.reconfigure([
        editorTheme(currentTheme),
        syntaxHighlighting(currentTheme === "dark" ? darkHighlight : lightHighlight)
      ]) });
    },
    focus() {
      view.focus();
    },
    destroy() {
      view.destroy();
      root.replaceChildren();
    }
  };
}

window.KuroiiCodeEditor = { create };
