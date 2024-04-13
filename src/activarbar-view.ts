import vscode = require('vscode');

export class ActivityBarView
    implements vscode.WebviewViewProvider, vscode.Disposable
{
    private _view: vscode.WebviewView | undefined;
    private _getScore: any;
    private _disposables: vscode.Disposable[];

    constructor(getScore: any) {
        this._getScore = getScore;
        this._disposables = [
            vscode.window.registerWebviewViewProvider(
                'whack-a-mole.activityBar',
                this
            ),
        ];
    }

    dispose() {
        for (const d of this._disposables) {
            d.dispose();
        }
        this._disposables = [];
    }

    public update() {
        const v = this._view?.webview;
        if (v) {
            v.html = this._webViewHTML();
        }
    }

    public resolveWebviewView(
        vsWebView: vscode.WebviewView,
        context: vscode.WebviewViewResolveContext,
        token: vscode.CancellationToken
    ) {
        this._view = vsWebView;
        const v = this._view.webview;

        v.options = {
            enableScripts: true,
        };
        v.html = this._webViewHTML();
    }

    private _webViewHTML() {
        const nonce = getNonce();
        const sessionScore = this._getScore();

        return `<!DOCTYPE html>
            <html lang="en">
            <head>
            <meta charset="UTF-8">
            <meta http-equiv="Content-Security-Policy" content="default-src 'none'; script-src 'nonce-${nonce}';">
            <meta name="viewport" content="width=device-width, initial-scale=1.0">
            </head>
            <body>
                <div>
                </div>
                <fieldset>
                    <legend>Score:</legend>
                    <div>
                        Session score: ${sessionScore}</br>
                    </div>
                </fieldset>
            </body>
            </html>`;
    }
}

function getNonce() {
    let text = '';
    const possible =
        'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
    for (let i = 0; i < 32; i++) {
        text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
}
