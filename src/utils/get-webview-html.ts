const html = String.raw;

export function getWebviewHtml(
  stylesUri: string,
  scriptUri: string,
  nonce: string,
  cspSource: string,
): string {
  return html`<!doctype html>
    <html lang="en">
      <head>
        <meta charset="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          http-equiv="Content-Security-Policy"
          content="style-src ${cspSource}; script-src 'nonce-${nonce}';"
        />
        <link rel="stylesheet" type="text/css" href="${stylesUri}" />
        <title>vrm-companion</title>
      </head>
      <body class="h-screen w-screen overflow-hidden">
        <div id="root"></div>
        <script type="module" nonce="${nonce}" src="${scriptUri}"></script>
      </body>
    </html>`;
}
