import path from "path";
import { constant, keyBy, sortBy, times } from "lodash";
import sharp, { Sharp } from "sharp";
import { DEVICE_ASPECT_RATIOS } from "../util/devices";
import {
  ExtendedSharpBuffer,
  getRiderOnMountImageBuffer,
  getStyledTokenBuffer,
  getTokenLayersData,
  getTokenTraitLayerDescription,
  getTraitLayerBufferForTokenId,
  ROOT_PATH,
} from "./artGeneration";

const DEVICES_BY_NAME = keyBy(DEVICE_ASPECT_RATIOS, "name");
export async function getLockscreenImageBuffer({
  tokenSlug,
  tokenId,
  ridingTokenSlug,
  ridingTokenId,
  width,
  height,
  device,
}: {
  tokenSlug: string;
  tokenId: string;
  ridingTokenSlug: string;
  ridingTokenId: string;
  width?: number;
  height?: number;
  device?: string;
}) {
  //

  const res = {
    w:
      width ||
      DEVICES_BY_NAME[device as string].width *
        DEVICES_BY_NAME[device as string].ratio,
    h:
      height ||
      DEVICES_BY_NAME[device as string].height *
        DEVICES_BY_NAME[device as string].ratio,
  };
  let tokenHeight = res.h / 2;
  let tokenTop = tokenHeight;

  const isLandscape = res.w > res.h ? true : false;

  const tokenData = await getTokenLayersData({ tokenSlug, tokenId });
  console.log("tokenData: ", tokenData);

  let buffers: ExtendedSharpBuffer[] = [];

  {
    console.log("generating background");
    // the background needs to fill the bigger dimension
    let bgSize = Math.max(res.w, res.h);

    let backgroundBuffer = await getTraitLayerBufferForTokenId({
      tokenSlug,
      tokenId,
      traitSlug: "background",
    });

    backgroundBuffer = await sharp(backgroundBuffer)
      .resize(bgSize, bgSize, {
        fit: sharp.fit.fill,
        kernel: sharp.kernel.nearest,
      })
      // cheating but doesn't matter for solid colors
      // but what about souls
      .extract({ top: 0, left: 0, width: res.w, height: res.h })
      .png()
      .toBuffer();

    buffers.push({ input: backgroundBuffer, zIndex: 0 });
  }

  {
    console.log("generating wiz or rider");
    // now let's place the wizard or rider
    let tokenBuffer = ridingTokenSlug
      ? await getRiderOnMountImageBuffer({
          tokenSlug,
          tokenId,
          ridingTokenSlug,
          ridingTokenId,
          width: 400,
        })
      : await getStyledTokenBuffer({
          tokenSlug,
          tokenId,
          layers: ["body", "familiar", "head", "prop", "undesirable"],
        });

    tokenBuffer = await (await trimTransparent(sharp(tokenBuffer)))
      .png()
      .toBuffer();

    const imgMetadata = await sharp(tokenBuffer).metadata();
    const oldWidth = imgMetadata.width as number;
    const oldHeight = imgMetadata.height as number;

    let newScale = isLandscape
      ? (res.h * 0.5) / oldHeight
      : (res.w * 0.8) / oldWidth;

    //
    if (oldHeight * newScale > res.h * 0.5) {
      newScale = (res.h * 0.5) / oldHeight;
    }

    // resize the width
    const newWidth = Math.round(oldWidth * newScale);
    const newHeight = Math.round(oldHeight * newScale);
    tokenBuffer = await sharp(tokenBuffer)
      .resize(newWidth, newHeight, {
        fit: sharp.fit.fill,
        kernel: sharp.kernel.nearest,
      })
      .png()
      .toBuffer();

    const top = res.h - newHeight - Math.floor(newHeight * 0.1);
    const left = Math.floor(res.w / 2 - newWidth / 2);
    buffers.push({ input: tokenBuffer, top, left, zIndex: 20 });

    tokenHeight = newHeight;
    tokenTop = top;
  }

  const runeLayer = await getTokenTraitLayerDescription({
    tokenSlug,
    tokenId,
    traitSlug: "rune",
  });

  if (runeLayer) {
    console.log("generating rune");
    // now the rune, if any
    let tokenBuffer = await getStyledTokenBuffer({
      tokenSlug,
      tokenId,
      layers: ["rune"],
    });

    tokenBuffer = await (await trimTransparent(sharp(tokenBuffer)))
      .png()
      .toBuffer();

    const imgMetadata = await sharp(tokenBuffer).metadata();
    const oldWidth = imgMetadata.width as number;
    const oldHeight = imgMetadata.height as number;

    let newScale = isLandscape
      ? (res.h * 0.8) / oldHeight
      : (res.w * 0.8) / oldWidth;

    // resize the width
    const newWidth = Math.round(oldWidth * newScale);
    const newHeight = Math.round(oldHeight * newScale);

    const width = newWidth;
    const height = newHeight;

    tokenBuffer = await setOpacity(sharp(tokenBuffer), 32);
    tokenBuffer = await sharp(tokenBuffer)
      .resize(newWidth, newHeight, {
        fit: sharp.fit.fill,
        kernel: sharp.kernel.nearest,
      })
      .png()
      .toBuffer();

    const top = Math.floor(res.h / 2 - newHeight / 2);
    const left = Math.floor(res.w / 2 - newWidth / 2);
    buffers.push({ input: tokenBuffer, top, left, zIndex: 10 });
  }
  {
    console.log("generating logo");

    // logo
    const framePath = path.join(
      ROOT_PATH,
      `public/static/img/logo/frwc-logo-yellow.png`
    );
    let tokenBuffer = await sharp(framePath).png().toBuffer();

    const imgMetadata = await sharp(tokenBuffer).metadata();
    const oldWidth = imgMetadata.width as number;
    const oldHeight = imgMetadata.height as number;

    let newScale = isLandscape
      ? (res.h * 0.5) / oldHeight
      : (res.w * 0.8) / oldWidth;

    if (oldWidth * newScale > res.w * 0.8) {
      newScale = (res.w * 0.8) / oldWidth;
    }

    // resize the width
    const newWidth = Math.round(oldWidth * newScale);
    const newHeight = Math.round(oldHeight * newScale);

    const width = newWidth;
    const height = newHeight;

    // tokenBuffer = await setOpacity(sharp(tokenBuffer), 32);
    tokenBuffer = await sharp(tokenBuffer)
      .resize(newWidth, newHeight, {
        fit: sharp.fit.fill,
        kernel: sharp.kernel.nearest,
      })
      .png()
      .toBuffer();

    const top = Math.floor(tokenTop - newHeight - res.h * 0.05);
    const left = Math.floor(res.w / 2 - newWidth / 2);
    buffers.push({ input: tokenBuffer, top, left, zIndex: 10 });
  }

  console.log("done");
  const canvas = await sharp({
    create: {
      width: res.w,
      height: res.h,
      channels: 4,
      background: "rgba(0,0,0,0)",
    },
  }).composite(sortBy(buffers, (b) => b.zIndex));

  return canvas.png().toBuffer();
}

async function setOpacity(pipeline: Sharp, alpha: number) {
  return await pipeline
    .composite([
      {
        input: Buffer.from([255, 255, 255, alpha]),
        raw: {
          width: 1,
          height: 1,
          channels: 4,
        },
        tile: true,
        blend: "dest-in",
      },
    ])
    .toBuffer();
}

async function trimTransparent(pipeline: Sharp) {
  const imgMetadata = await pipeline.metadata();
  const oldWidth = imgMetadata.width as number;
  const oldHeight = imgMetadata.height as number;

  const info = await getTrimAlphaInfo(pipeline, oldWidth, oldHeight);
  const crop = {
    left: -(info?.trimOffsetLeft as number) || 0,
    top: -(info?.trimOffsetTop as number) || 0,
    width: info.width,
    height: info.height,
  };
  return pipeline.extract(crop);
}

function getTrimAlphaInfo(
  pipeline: Sharp,
  width: number,
  height: number
): Promise<{
  trimOffsetLeft: number;
  trimOffsetTop: number;
  width: number;
  height: number;
}> {
  return pipeline
    .clone()
    .ensureAlpha()
    .extractChannel(3)
    .toColourspace("b-w")
    .raw()
    .toBuffer()
    .then((data) => {
      let topTrim: number = 0;
      let bottomTrim: number = 0;
      let leftTrim: number = 0;
      let rightTrim: number = 0;
      let topStatus: boolean = true;
      let bottomStatus: boolean = true;
      let leftStatus: boolean = true;
      let rightStatus: boolean = true;

      let h: number = height;
      const w: number = width;

      for (let i = 0; i < h; i++) {
        for (let j = 0; j < width; j++) {
          if (topStatus && data[i * width + j] > 0) {
            topStatus = false;
          }
          if (bottomStatus && data[(height - i - 1) * width + j] > 0) {
            bottomStatus = false;
          }
          if (!topStatus && !bottomStatus) {
            break;
          }
        }
        if (!topStatus && !bottomStatus) {
          break;
        }
        if (topStatus) topTrim++;
        if (bottomStatus) bottomTrim++;
      }

      if (topTrim + bottomTrim >= height) {
        return {
          trimOffsetLeft: width * -1,
          trimOffsetTop: height * -1,
          width: 0,
          height: 0,
        };
      }

      h = height - bottomTrim;

      for (let i = 0; i < w; i++) {
        for (let j = topTrim; j < h; j++) {
          if (leftStatus && data[width * j + i] > 0) {
            leftStatus = false;
          }
          if (rightStatus && data[width * j + width - i - 1] > 0) {
            rightStatus = false;
          }
          if (!leftStatus && !rightStatus) {
            break;
          }
        }
        if (!leftStatus && !rightStatus) {
          break;
        }
        if (leftStatus) leftTrim++;
        if (rightStatus) rightTrim++;
      }

      return {
        trimOffsetLeft: leftTrim * -1,
        trimOffsetTop: topTrim * -1,
        width: width - leftTrim - rightTrim,
        height: height - topTrim - bottomTrim,
      };
    });
}
