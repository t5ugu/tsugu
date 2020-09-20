import vscode = require('vscode');
import rpn = require('./rpn/rpn');

export function scoreOperation() {
    // function gle(arr: any[]) { return arr.slice(-1)[0]; }   // Get Last Element

    const editor = vscode.window.activeTextEditor;
    const doc = editor!.document;
    const selection = editor!.selection;

    let text = doc.getText(selection).split("=")[1];
    let formula = rpn.rpnGenerate(text)!;
    vscode.window.showInformationMessage(formula);

    let ans = rpn.rpnCalculation(formula)!;
    vscode.window.showInformationMessage(ans.toString());
}