import type { H3Event } from "h3";
import {
  rendererTemplate,
  rendererTemplateFile,
} from "#nitro-internal-virtual/renderer-template";
import { HTTPResponse } from "h3";
import { hasTemplateSyntax, renderToResponse, compileTemplate } from "rendu";

export default async function renderIndexHTML(event: H3Event) {
  let html = await rendererTemplate(event.req as Request);

  if ((globalThis as any).__transform_html__) {
    html = await (globalThis as any).__transform_html__(html);
  }

  if (!hasTemplateSyntax(html)) {
    return new HTTPResponse(html, {
      headers: { "content-type": "text/html; charset=utf-8" },
    });
  }

  const template = compileTemplate(html, { filename: rendererTemplateFile });
  return renderToResponse(template, {
    request: event.req as Request,
  });
}
