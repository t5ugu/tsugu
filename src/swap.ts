import * as vscode from 'vscode';

export function swap() {
    let editor = vscode.window.activeTextEditor!;
    let doc = editor.document;
    let cursors = editor.selections;

    function select(s: vscode.Selection) {
        if (s.isEmpty) {
            let r = doc.getWordRangeAtPosition(s.start)!;
            return new vscode.Selection(r.start, r.end);
        }
        return new vscode.Selection(s.start, s.end);;
    }

    if (cursors.length === 2) {
        let A = select(cursors[0]),
            B = select(cursors[1]);

        editor.edit(edit => {
            edit.replace(A, doc.getText(B));
            edit.replace(B, doc.getText(A));
        });
    }
}