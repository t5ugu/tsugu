import * as vscode from 'vscode';

export function fullToHalf() {
    let editor = vscode.window.activeTextEditor!,
        doc = editor.document;

    let select = new vscode.Selection(new vscode.Position(0, 0),
        new vscode.Position(doc.lineCount, 0));
    let text = doc.getText(select);

    for (let i = 0; i < text.length; i++) { if (text.charAt(i) === '　') {
        text = text.substring(0, i) + '  ' + text.substring(i + 1, text.length);
    }}
    editor.edit(edit => { edit.replace(select, text); });
}