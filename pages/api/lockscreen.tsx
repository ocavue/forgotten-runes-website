import { NextApiRequest, NextApiResponse } from "next";
import request from "request";
import fs from "fs";
import * as os from "os";
import stream from "stream";
import sharp from "sharp";
import { getRiderOnMountImageBuffer } from "../../lib/art/artGeneration";
import { getLockscreenImageBuffer } from "../../lib/art/lockscreen";

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  console.log("lockscreen api");

  // if (req.method !== "GET") {
  //   return res.status(404);
  // }

  try {
    let {
      tokenSlug,
      tokenId,
      ridingTokenSlug,
      ridingTokenId,
      width,
      height,
      device,
    } = req.query;

    let buffer = await getLockscreenImageBuffer({
      tokenSlug: tokenSlug as string,
      tokenId: tokenId as string,
      ridingTokenSlug: ridingTokenSlug as string,
      ridingTokenId: ridingTokenId as string,
      width: parseInt(width as string),
      height: parseInt(height as string),
      device: (device as string) || "iPhone 8",
    });

    buffer = await sharp(buffer).toBuffer();

    var bufferStream = new stream.PassThrough();
    bufferStream.end(buffer);
    return bufferStream.pipe(res);
  } catch (err) {
    console.log(err);
    console.log((err as any)?.stack);
    return res.status(500).json({ error: err, stack: (err as any)?.stack });
  }
}

// http://localhost:3005/api/art/wizards/487/riding/pony/123
