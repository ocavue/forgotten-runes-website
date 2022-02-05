import { keyBy, sortBy } from "lodash";
import sharp from "sharp";
import { DEVICE_ASPECT_RATIOS } from "../util/devices";
import {
  ExtendedSharpBuffer,
  getStyledTokenBuffer,
  getTokenLayersData,
  getTraitLayerBufferForTokenId,
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

  const tokenData = await getTokenLayersData({ tokenSlug, tokenId });
  console.log("tokenData: ", tokenData);

  let buffers: ExtendedSharpBuffer[] = [];

  {
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

    buffers.push({ input: backgroundBuffer });
  }

  {
    // now let's place the wizard or rider
    const tokenBuffer = await getStyledTokenBuffer({
      tokenSlug,
      tokenId,
      layers: ["body", "familiar", "head", "prop", "undesirable"],
      trim: true,
    });
    buffers.push({ input: tokenBuffer });
  }

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
