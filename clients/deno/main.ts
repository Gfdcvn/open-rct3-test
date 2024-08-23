// deno-lint-ignore-file no-var
import { SizeHint, type Webview } from "@webview/webview";
import { asset, uri } from "./src/env.ts";

// QUESTION: https://gpl.ea.com/eawebkit.html

// TODO: https://deno.land/x/wincompile@0.3.2
// TODO: https://deno.com/blog/supabase-on-jsr

declare global {
  var mainWindow: Webview | undefined;
}

if (import.meta.main) {
  const { preload, Webview } = await import("@webview/webview");
  const indexUri = uri("play?client=desktop");

  await preload();
  const view = globalThis.mainWindow = new Webview();
  view.title = "OpenRCT3";
  view.init(await Deno.readTextFile(asset("content-script.js")));
  view.size = { width: 800, height: 450, hint: SizeHint.MIN };
  view.size = { width: 800, height: 600, hint: SizeHint.NONE };

  // Render splash page
  const { html, render } = await import("@lit-labs/ssr");
  const { unsafeHTML } = await import("lit/directives/unsafe-html");
  const { collectResult } = await import("@lit-labs/ssr/render-result");
  const { splash, styles } = await import("./src/splash.ts");
  const document = await collectResult(render(
    html`
      <head>
        <meta charset="utf-8">
        <meta name="" >
        ${unsafeHTML(`<style>${styles.toString()}</style>`)}
      </head>
      <body>${splash}</body>
    `
  ));

  view.navigate(`data:text/html,${document}`);

  // FIXME: Window flickers too much when launching on Windows 10
  view.run();
}

// TODO: Extract IPC primitives into a shared library
// IPC Protocol Primitives
// Prior art: Maxis' EA WebKit GUI for SimCity
interface Request<Response, Body = undefined> {
  method: "get" | "post";
  uri: URL | string;
  send(body?: Body): Promise<Response>;
}
