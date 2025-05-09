import { renderToStaticMarkup } from "react-dom/server";

export function getWebviewHtml(
  stylesUri: string,
  scriptUri: string,
  nonce: string,
  cspSource: string,
) {
  return renderToStaticMarkup(
    <html lang="en">
      <head>
        <meta charSet="UTF-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <meta
          http-equiv="Content-Security-Policy"
          content={`style-src ${cspSource}; script-src 'nonce-${nonce}';`}
        />
        <link rel="stylesheet" type="text/css" href={stylesUri} />
        <title>Hello World</title>
      </head>
      <body>
        <div id="root"></div>
        <script type="module" nonce={nonce} src={scriptUri}></script>
      </body>
    </html>,
  );
}
