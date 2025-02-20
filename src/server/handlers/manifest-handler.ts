import type { Request, Response } from "express";
import { LemmyHttp } from "lemmy-js-client";
import { getHttpBaseInternal } from "../../shared/env";
import { wrapClient } from "../../shared/services/HttpService";
import generateManifestJson from "../utils/generate-manifest-json";
import { setForwardedHeaders } from "../utils/set-forwarded-headers";

let manifest: Awaited<ReturnType<typeof generateManifestJson>> | undefined =
  undefined;

export default async (req: Request, res: Response) => {
  if (!manifest) {
    const headers = setForwardedHeaders(req.headers);
    const client = wrapClient(new LemmyHttp(getHttpBaseInternal(), headers));
    const site = await client.getSite({});

    if (site.state === "success") {
      manifest = await generateManifestJson(site.data);
    } else {
      res.sendStatus(500);
      return;
    }
  }

  res.setHeader("content-type", "application/manifest+json");

  res.send(manifest);
};
