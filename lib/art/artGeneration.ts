import sharp from "sharp";
import path from "path";
import wizardLayers from "../../public/static/nfts/wizards/wizards-layers.json";
import wizardTraits from "../../public/static/nfts/wizards/wizards-traits.json";
import soulLayers from "../../public/static/nfts/souls/souls-layers.json";
import soulTraits from "../../public/static/nfts/souls/souls-traits.json";
import ponyLayers from "../../public/static/nfts/ponies/ponies-layers.json";
import ponyTraits from "../../public/static/nfts/ponies/ponies-traits.json";

import { compact, groupBy, keyBy, map, sortBy } from "lodash";
import fs from "fs";
import fetch from "node-fetch";
import fileType from "file-type";
import Bluebird from "bluebird";

// public/static/nfts/wizards/forgotten-runes-wizards-cult-traits.png

/*
### So the routes are something like:

- [+] `/art/:tokenSlug/trait/:traitSlug/:traitName.png` - the trait layer for the collection (e.g. "Wizzy Head.png")
- [-] `/art/:tokenSlug/:tokenId.zip` - downloadable package, everything, including sprites & layers with preset resizes
- [+] `/art/:tokenSlug/:tokenId.png` - regular image of the wizard add default size 400px
- [-] `/art/:tokenSlug/:tokenId/spritesheet.png` - full spritesheet
- [-] `/art/:tokenSlug/:tokenId/spritesheet.json` - full spritesheet.json
- [+] `/art/:tokenSlug/:tokenId/trait/:traitSlug.png` - a "wizard's" trait layer
- [+] `/art/:tokenSlug/:tokenId/:style.png` - stylized image
- [-] `/art/:tokenSlug/:tokenId/frame/:animationTag/:frameName.png` - full layers for an anim pos: "Kobald 0 left"
- [-] `/art/:tokenSlug/:tokenId/frame/:animationTag/:frameName/:traitName.png` - e.g. "head of kobald 0 facing left"
  head, walk, up

### With Parameters:

- `tokenSlug` - `{wizards,souls,warriors,...}` - slug name of token
- `tokenId` - A number, representing the token serial number
- `width` - A number for the width you want to generate
- `style` - `{full,parchment,nobg,...}` - The style of image you want. Logic is built into this name in code
- `traitSlug` - `{background,body,head,prop,familiar,rune,...}`
- `animationTag` - `{std,walk,swing,...}`
- `frameName` - `{default,up,r,...}`

### Examples

- http://localhost:3005/api/art/wizards/487/trait/head.png
- http://localhost:3005/api/art/wizards/107/default.png
- http://localhost:3005/api/art/wizards/107/nobg.png?width=700
- http://localhost:3005/api/art/wizards/108.png
- http://localhost:3005/api/art/wizards/108/sepia.png
- http://localhost:3005/api/art/wizards/trait/head/Prophet.png?trim=true
- http://localhost:3005/api/art/wizards/487/riding/pony/123
- http://localhost:3005/api/art/souls/1001/riding/pony/123
- http://localhost:3005/api/art/souls/123.png

### TODO

Every time we fetch a URL and save it to a Buffer we should just cache it because it will be way faster in number of sizes

*/

export const ROOT_PATH = path.join(process.cwd());

export const stripExtension = (s: string) => s.replace(/\.[^/.]+$/, "");
export const slugify = (s: string) =>
  s
    .toLowerCase()
    .replace(/\s+/g, "-")
    .replace(/[^\w-]+/g, "");

// Wizard-specific configs
export const wizardLayersIdx: { [key: string]: any } = keyBy(
  wizardLayers,
  "idx"
);
export const soulLayersIdx: { [key: string]: any } = keyBy(soulLayers, "idx");
export const poniesLayersIdx: { [key: string]: any } = keyBy(ponyLayers, "idx");

export async function getWizardPartsBuffer() {
  return sharp(
    path.join(
      ROOT_PATH,
      "public/static/nfts/wizards/forgotten-runes-wizards-cult-traits.png"
    )
  )
    .png()
    .toBuffer();
}
export const wizardLayerNames = [
  "background",
  "body",
  "familiar",
  "head",
  "prop",
  "rune",
];

export const wizardFamiliarLayernames = ["familiar"];

export const soulsLayerNames = [
  "background",
  "body",
  "familiar",
  "head",
  "prop",
  "rune",
  "undesirable",
];

const poniesLayerNames = [
  "background",
  "pony",
  "clothes",
  "head",
  "mouth",
  "rune",
];

export const tokenLayerNames: { [key: string]: string[] } = {
  wizards: wizardLayerNames,
  souls: soulsLayerNames,
  ponies: poniesLayerNames,
  "wizard-familiars": wizardFamiliarLayernames,
};

export type TraitsLayerDescription = {
  idx: string;
  filename: string;
  trait: string;
  label: string;
};

export type ExtendedSharpBuffer = sharp.OverlayOptions & {
  zIndex?: number;
};

function doubleKeyBy(collection: any[], key1: string, key2: string) {
  let grouped = groupBy(collection, key1);
  let final: any = {};
  map(grouped, (groupItems, key) => {
    final[key] = final[key] || {};
    for (let i = 0; i < groupItems.length; i++) {
      final[key][groupItems[i][key2]] = groupItems[i];
    }
  });
  return final;
}

const wizardsTraitsLayerDescriptionByLabel: {
  [trait: string]: { [label: string]: TraitsLayerDescription };
} = doubleKeyBy(wizardTraits, "trait", "label");
const soulsTraitsLayerDescriptionByLabel: {
  [trait: string]: { [label: string]: TraitsLayerDescription };
} = doubleKeyBy(soulTraits, "trait", "label");
const poniesTraitsLayerDescriptionByLabel: {
  [trait: string]: { [label: string]: TraitsLayerDescription };
} = doubleKeyBy(ponyTraits, "trait", "label");

export const tokenTraitsByLabel: {
  [tokenSlug: string]: {
    [trait: string]: { [label: string]: TraitsLayerDescription };
  };
} = {
  wizards: wizardsTraitsLayerDescriptionByLabel,
  souls: soulsTraitsLayerDescriptionByLabel,
  ponies: poniesTraitsLayerDescriptionByLabel,
};

const wizardTraitsLayerDescriptionByIndex: {
  [idx: string]: TraitsLayerDescription;
} = keyBy(wizardTraits, "idx");
const soulTraitsLayerDescriptionByIndex: {
  [idx: string]: TraitsLayerDescription;
} = keyBy(soulTraits, "idx");
const ponyTraitsLayerDescriptionByIndex: {
  [idx: string]: TraitsLayerDescription;
} = keyBy(ponyTraits, "idx");

export const tokenTraitsByIndex: {
  [tokenSlug: string]: {
    [idx: string]: TraitsLayerDescription;
  };
} = {
  wizards: wizardTraitsLayerDescriptionByIndex,
  souls: soulTraitsLayerDescriptionByIndex,
  ponies: ponyTraitsLayerDescriptionByIndex,
};

export async function extractTokenFrameBuffer({
  tokenSlug,
  frameNum,
  partsBuffer,
}: {
  tokenSlug: string;
  partsBuffer?: Buffer;
  frameNum: number;
}) {
  if (frameNum === 7777) {
    return;
  }
  switch (tokenSlug) {
    default:
    case "wizards": {
      return extractWizardFrame({
        partsBuffer: partsBuffer as Buffer,
        frameNum,
      });
    }
    case "souls":
    case "ponies": {
      const filename = tokenTraitsByIndex[tokenSlug][frameNum].filename;
      const fullFilename = path.join(
        ROOT_PATH,
        `public/static/nfts/${tokenSlug}/layers/${filename}`
      );
      if (!fs.existsSync(fullFilename)) {
        console.log("can't find: ", fullFilename);
      }

      return sharp(fullFilename).png().toBuffer();
    }
  }
}

const MOUNT_OFFSET = -2; // ugh

export async function extractWizardFrame({
  partsBuffer,
  frameNum,
}: {
  partsBuffer: Buffer;
  frameNum: number;
}) {
  const COLUMNS = 19,
    // ROWS = 18,
    width = 50,
    height = 50;

  if (frameNum === 7777) {
    return;
  }

  const row = Math.floor(frameNum / COLUMNS);
  const col = frameNum % COLUMNS;
  const top = row * height;
  const left = col * width;

  const buffer = await sharp(partsBuffer)
    .extract({ left, top, width, height })
    .png()
    .toBuffer();
  return buffer;
}

// Routing functions

export async function getTokenPartsBuffer({
  tokenSlug,
}: {
  tokenSlug: string;
}) {
  switch (tokenSlug) {
    default:
    case "wizards": {
      return getWizardPartsBuffer();
    }
  }
}

export async function getTokenLayersData({
  tokenSlug,
  tokenId,
}: {
  tokenSlug: string;
  tokenId: string;
}) {
  switch (tokenSlug) {
    default:
    case "wizards": {
      return wizardLayersIdx[tokenId];
    }
    case "souls": {
      return soulLayersIdx[tokenId];
    }
    case "ponies": {
      return poniesLayersIdx[tokenId];
    }
  }
}

export async function getTokenFrameNumber({
  tokenSlug,
  tokenId,
  traitSlug,
}: {
  tokenSlug: string;
  tokenId: string;
  traitSlug: string;
}): Promise<number> {
  const wizardLayerData = await getTokenLayersData({ tokenSlug, tokenId });
  // console.log({ tokenSlug, tokenId, traitSlug });

  const frameNum: number =
    wizardLayerData?.[traitSlug]?.length > 0
      ? parseInt(wizardLayerData[traitSlug])
      : -1;

  return frameNum;
}

// --------

export async function getTraitLayerBufferForTokenId({
  tokenSlug,
  tokenId,
  traitSlug,
  width,
  trim,
}: {
  tokenSlug: string;
  tokenId: string;
  traitSlug: string;
  width?: number;
  trim?: boolean;
}) {
  const partsBuffer = await getTokenPartsBuffer({ tokenSlug });
  //   const wizardLayerData = await getTokenLayersData({ tokenSlug, tokenId });
  const frameNum = await getTokenFrameNumber({ tokenSlug, tokenId, traitSlug });

  if (frameNum < 0) {
    throw new Error(`Unknown trait ${traitSlug}`);
  }

  const layerPartBuffer = await extractTokenFrameBuffer({
    tokenSlug,
    partsBuffer,
    frameNum,
  });

  let layerPartBufferSharp = await sharp(layerPartBuffer);
  const imgMetadata = await layerPartBufferSharp.metadata();
  const newWidth = width || imgMetadata.width;
  const newHeight = width || imgMetadata.height;

  let buffer = await layerPartBufferSharp
    .resize(newWidth, newHeight, {
      fit: sharp.fit.fill,
      kernel: sharp.kernel.nearest,
    })
    .toBuffer();

  if (trim) {
    buffer = await sharp(buffer).trim().toBuffer();
  }

  return buffer;
}

export async function getTraitLayerBuffer({
  tokenSlug,
  traitSlug,
  traitName,
  width,
  trim,
}: {
  tokenSlug: string;
  traitSlug: string;
  traitName: string;
  width: number;
  trim?: boolean;
}) {
  const partsBuffer = await getTokenPartsBuffer({ tokenSlug });

  const tokenLayerInfo = tokenTraitsByLabel[tokenSlug][traitSlug][traitName];

  const layerPartBuffer = await extractTokenFrameBuffer({
    tokenSlug,
    partsBuffer,
    frameNum: parseInt(tokenLayerInfo.idx),
  });

  const size = width;
  let buffer = await sharp(layerPartBuffer)
    .resize(size, size, {
      fit: sharp.fit.fill,
      kernel: sharp.kernel.nearest,
    })
    .toBuffer();

  if (trim) {
    buffer = await sharp(buffer).trim().toBuffer();
  }

  return buffer;
}

export type GetStyledTokenBufferProps = {
  tokenSlug: string;
  tokenId: string;
  width?: number;
  trim?: boolean;
  noBg?: boolean;
  sepia?: boolean;
  layers?: string[];
};

export const VALID_TOKEN_STYLES = ["default", "nobg", "sepia"];
export async function getStyledTokenBuffer({
  tokenSlug,
  tokenId,
  width,
  trim,
  noBg,
  sepia,
  layers,
}: GetStyledTokenBufferProps) {
  const partsBuffer = await getTokenPartsBuffer({ tokenSlug });
  // const wizardLayerData = await getTokenLayersData({ tokenSlug, tokenId });

  const layerNames = layers || tokenLayerNames[tokenSlug];

  let buffers: Buffer[] = [];

  for (let i = 0; i < layerNames.length; i++) {
    const traitSlug = layerNames[i];
    const frameNum = await getTokenFrameNumber({
      tokenSlug,
      tokenId,
      traitSlug,
    });

    if (frameNum < 0 || frameNum == 7777) {
      continue;
    }

    // console.log({ tokenSlug, tokenId, frameNum });
    const layerPartBuffer = await extractTokenFrameBuffer({
      tokenSlug,
      partsBuffer,
      frameNum,
    });

    if (layerPartBuffer) {
      buffers = [...buffers, layerPartBuffer];
    }
  }

  if (sepia) {
    noBg = true;
  }

  if (noBg) {
    buffers.shift(); // remove bg
  }

  let [bgBuffer, ...rest] = buffers;

  let bgSharp = await sharp(bgBuffer);
  const imgMetadata = await bgSharp.metadata();
  const newWidth = width || imgMetadata.width;
  const newHeight = width || imgMetadata.height;

  const restBuffers = rest.map((r: any) => ({ input: r }));
  const canvas = await sharp(bgBuffer).composite(restBuffers).png().toBuffer();

  let buffer = await sharp(canvas)
    .resize(newWidth, newHeight, {
      fit: sharp.fit.fill,
      kernel: sharp.kernel.nearest,
    })
    .toBuffer();

  if (sepia) {
    buffer = await sharp(buffer)
      .modulate({
        saturation: 0,
      })
      .tint("#9F7E34")
      .modulate({
        brightness: 1.1,
        saturation: 1 - 0.1,
      })
      .modulate({
        brightness: 0.8,
      })
      .toBuffer();
  }

  if (trim) {
    buffer = await sharp(buffer).trim().toBuffer();
  }

  return buffer;
}

export async function buildReadme({
  tokenSlug,
  tokenId,
}: {
  tokenSlug: string;
  tokenId: string;
}) {
  const tokenData = await getTokenLayersData({ tokenSlug, tokenId });
  let readme = fs
    .readFileSync(path.join(ROOT_PATH, "data/DOWNLOAD_LICENSE.md"))
    .toString();
  readme = readme.replace(
    /\*\*WIZARD_NAME\*\*/g,
    `#${tokenId} ${tokenData.name}`
  );
  return readme;
}

export type AsepriteRect = {
  x: number;
  y: number;
  w: number;
  h: number;
};

export type AsepriteFrame = {
  frame: AsepriteRect;
  rotated: boolean;
  trimmed: boolean;
  spriteSourceSize: AsepriteRect;
  sourceSize: { w: number; h: number };
  duration: number;
};

export type AseSpriteFrames = {
  [key: string]: AsepriteFrame;
};

export const MountZIndex = {
  bg: 0,
  arm: 10,
  prop: 20,
  mount: 30,
  body: 40,
  head: 50,
  fg: 60,
};

const frameBaseURL = `https://nftz.forgottenrunes.com/frames`;
const turnaroundsBaseURL = `https://nftz.forgottenrunes.com/turnarounds`;

const defaultSpritesheetSettings = {
  tags: [
    { name: "front", frames: 4 },
    { name: "left", frames: 4 },
    { name: "back", frames: 4 },
    { name: "right", frames: 4 },
  ],
  width: 50,
  height: 50,
  duration: 200,
  columns: 4,
  rows: 4,
};

const familiarSpritesheetSettings = {
  tags: [
    { name: "front", frames: 4 },
    { name: "front_idle", frames: 4 },
    { name: "left", frames: 4 },
    { name: "left_idle", frames: 4 },
    { name: "back", frames: 4 },
    { name: "back_idle", frames: 4 },
    { name: "right", frames: 4 },
    { name: "right_idle", frames: 4 },
  ],
  width: 50,
  height: 50,
  duration: 200,
  columns: 4,
  rows: 8,
};

export async function buildSpritesheet({
  tokenSlug,
  tokenId,
  json,
  image,
}: {
  tokenSlug: string;
  tokenId: string;
  json?: boolean;
  image?: boolean;
}) {
  const tokenSlugLookup =
    tokenSlug === "wizard-familiars" ? "wizards" : tokenSlug;

  const settings =
    tokenSlug === "wizard-familiars"
      ? familiarSpritesheetSettings
      : defaultSpritesheetSettings;

  const { tags, width, height, duration, columns, rows } = settings;

  const WIDTH = width;
  const HEIGHT = height;
  const DURATION = duration;
  const imageWidth = columns * WIDTH;
  const imageHeight = rows * HEIGHT;

  // get the familiar slug
  // we can get this two ways, either from the wizzyId or the name as the tokenId

  const tokenLayerData = await getTokenLayersData({
    tokenSlug: tokenSlugLookup,
    tokenId,
  });
  const bodyLayer = await getTokenTraitLayerDescription({
    tokenSlug: tokenSlugLookup,
    tokenId,
    traitSlug: "body",
  });
  const headLayer = await getTokenTraitLayerDescription({
    tokenSlug: tokenSlugLookup,
    tokenId,
    traitSlug: "head",
  });
  const familiarLayer = await getTokenTraitLayerDescription({
    tokenSlug: tokenSlugLookup,
    tokenId,
    traitSlug: "familiar",
  });

  const layers =
    tokenSlug === "wizard-familiars" ? [familiarLayer] : [bodyLayer, headLayer];

  let img = sharp({
    create: {
      width: imageWidth,
      height: imageHeight,
      channels: 4,
      background: "rgba(0,0,0,0)",
    },
  });

  let frames: AseSpriteFrames = {};
  let frameTags = [];
  let frameFromIndex = 0;
  let frameBuffers: any[] = [];
  let frameFiles: { filename: string; buffer: Buffer }[] = [];

  let idx = 0;
  let row = 0;

  for (let t = 0; t < tags.length; t++) {
    let column = 0;
    let tagDescription = tags[t];
    for (let f = 0; f < tagDescription.frames; f++) {
      let frame = {
        frame: { x: column * WIDTH, y: row * HEIGHT, w: WIDTH, h: HEIGHT },
        rotated: false,
        trimmed: false,
        spriteSourceSize: { x: 0, y: 0, w: WIDTH, h: HEIGHT },
        sourceSize: { w: WIDTH, h: HEIGHT },
        duration: DURATION,
      };
      // let frameName = `${tagDescription.name}-${f}`;
      let frameName = idx.toString();
      frames[frameName] = frame;

      if (image) {
        let singleFrameBuffers: any[] = [];
        await Bluebird.mapSeries(layers, async (layer) => {
          const frameBasename = path.basename(layer?.filename || "", ".png");
          const frameBaseUrl = `${frameBasename}_${tagDescription.name}_${
            f + 1
          }.png`;
          const framePath = path.join(
            ROOT_PATH,
            `public/static/nfts/${tokenSlug}/walkcycles/${frameBaseUrl}`
          );

          if (!fs.existsSync(framePath)) {
            return;
          }

          const frameBuffer = await sharp(framePath).png().toBuffer();

          frameBuffers.push({
            top: row * HEIGHT,
            left: column * WIDTH,
            input: frameBuffer,
          });
          frameFiles.push({
            filename: `${layer?.trait}/${frameBaseUrl}`,
            buffer: frameBuffer,
          });
          singleFrameBuffers.push({ input: frameBuffer });
        });

        // create a frame that is the head and body combined
        let bothFrameBuffer = await sharp({
          create: {
            width: WIDTH,
            height: HEIGHT,
            channels: 4,
            background: "rgba(0,0,0,0)",
          },
        })
          .composite(singleFrameBuffers.map((b) => ({ input: b.input })))
          .png()
          .toBuffer();
        frameFiles.push({
          filename: `frames/${tokenId}-frame-${frameName}.png`,
          buffer: bothFrameBuffer,
        });
      }

      idx += 1;
      column += 1;
    }

    frameTags.push({
      // name: `${tokenSlug}-${tokenId}-${tagDescription.name}`,
      name: `${tagDescription.name}`,
      from: frameFromIndex,
      to: frameFromIndex + tagDescription.frames - 1,
      direction: "forward",
    });
    frameFromIndex += tagDescription.frames;

    row += 1;
  }

  const meta = {
    app: "http://www.aseprite.org/",
    version: "1.2.27",
    image: `${tokenSlug}-${tokenId}-spritesheet.png`,
    format: "RGBA8888",
    tokenSlug,
    tokenId,
    tokenName: tokenLayerData.name,
    size: { w: imageWidth, h: imageHeight },
    scale: "1",
    frameTags,
    layers: [
      { name: bodyLayer?.label, opacity: 255, blendMode: "normal" },
      { name: headLayer?.label, opacity: 255, blendMode: "normal" },
    ],
    slices: [],
  };

  const buffer = image
    ? await img.composite(frameBuffers).png().toBuffer()
    : null;

  if (buffer) {
    frameFiles.push({
      filename: `${tokenSlug}-${tokenId}.png`,
      buffer: buffer,
    });
  }

  return { sheet: { meta, frames }, buffer, frameFiles };
}

// https://nftz.forgottenrunes.com/frames/wizards/body_diamondPattern_back_1.png

export async function getTokenTraitLayerDescription({
  tokenSlug,
  tokenId,
  traitSlug,
}: {
  tokenSlug: string;
  tokenId: string;
  traitSlug: string;
}): Promise<TraitsLayerDescription | null> {
  const frameNum = await getTokenFrameNumber({
    tokenSlug: tokenSlug as string,
    tokenId,
    traitSlug,
  });
  if (frameNum < 0 || frameNum == 7777) {
    return null;
  }

  const layerDescription =
    tokenTraitsByIndex[tokenSlug as string][frameNum.toString()];
  return layerDescription;
}
export async function getAllTurnaroundFrameBuffers({
  tokenId,
  tokenSlug,
  size,
}: {
  tokenId: string;
  tokenSlug: string;
  size?: number;
}) {
  let directions = ["front", "left", "back", "right"];
  let buffers = [];
  for (let i = 0; i < directions.length; i++) {
    let direction = directions[i];
    buffers.push({
      name: `${tokenSlug}-${tokenId}-${i}-${direction}.png`,
      buffer: await getTurnaroundFrameBuffer({
        tokenId,
        tokenSlug,
        direction,
        size,
      }),
    });
  }
  return buffers;
}

export async function getTurnaroundFrameBuffer({
  tokenId,
  tokenSlug,
  direction,
  size,
}: {
  tokenId: string;
  tokenSlug: string;
  direction: string;
  size?: number;
}) {
  let imageWidth = 50;
  let imageHeight = 50;

  let directionSuffix: { [key: string]: string } = {
    front: "ft",
    back: "bk",
    left: "L_sd",
    right: "R_sd",
  };

  const wizardLayerData = await getTokenLayersData({ tokenSlug, tokenId });
  const bodyLayer = await getTokenTraitLayerDescription({
    tokenSlug,
    tokenId,
    traitSlug: "body",
  });
  const headLayer = await getTokenTraitLayerDescription({
    tokenSlug,
    tokenId,
    traitSlug: "head",
  });

  let img = sharp({
    create: {
      width: imageWidth,
      height: imageHeight,
      channels: 4,
      background: "rgba(0,0,0,0)",
    },
  });

  let frameBuffers = [];

  // body
  const bodyFrameBasename = path.basename(bodyLayer?.filename || "", ".png");
  const bodyFrameUrl = `${turnaroundsBaseURL}/${tokenSlug}/${bodyFrameBasename}_${directionSuffix[direction]}.png`;

  const bodyFrameBuffer = await fetchBufferFromUrlCached({ url: bodyFrameUrl });

  frameBuffers.push({
    input: bodyFrameBuffer,
  });

  // head
  const headFrameBasename = path.basename(headLayer?.filename || "", ".png");
  const headFrameUrl = `${turnaroundsBaseURL}/${tokenSlug}/${headFrameBasename}_${directionSuffix[direction]}.png`;

  const headFrameBuffer = await fetchBufferFromUrlCached({ url: headFrameUrl });
  frameBuffers.push({
    input: headFrameBuffer,
  });

  let buffer = await img.composite(frameBuffers).png().toBuffer();

  // resize it
  buffer = await sharp(buffer)
    .resize(size, size, {
      fit: sharp.fit.fill,
      kernel: sharp.kernel.nearest,
    })
    .png()
    .toBuffer();

  return buffer;
}

export async function getAllFamiliarTurnaroundFrameBuffers({
  tokenId,
  tokenSlug,
  size,
}: {
  tokenId: string;
  tokenSlug: string;
  size?: number;
}) {
  let directions = ["front", "left", "back", "right"];
  let buffers = [];
  for (let i = 0; i < directions.length; i++) {
    let direction = directions[i];
    buffers.push({
      name: `${tokenSlug}-${tokenId}-familiar-${i}-${direction}.png`,
      buffer: await getFamiliarTurnaroundFrameBuffer({
        tokenId,
        tokenSlug,
        direction,
        size,
      }),
    });
  }
  return buffers;
}

export async function getFamiliarTurnaroundFrameBuffer({
  tokenId,
  tokenSlug,
  direction,
  size,
}: {
  tokenId: string;
  tokenSlug: string;
  direction: string;
  size?: number;
}) {
  let imageWidth = 50;
  let imageHeight = 50;

  let directionSuffix: { [key: string]: string } = {
    front: "1",
    back: "3",
    left: "2",
    right: "4",
  };

  const familiarLayer = await getTokenTraitLayerDescription({
    tokenSlug,
    tokenId,
    traitSlug: "familiar",
  });

  let img = sharp({
    create: {
      width: imageWidth,
      height: imageHeight,
      channels: 4,
      background: "rgba(0,0,0,0)",
    },
  });

  let frameBuffers = [];

  // familiar
  const familiarFrameBasename = path.basename(
    familiarLayer?.filename || "",
    ".png"
  );

  const frameUrl = `${turnaroundsBaseURL}/${tokenSlug}-familiars/${familiarFrameBasename}_turn_${directionSuffix[direction]}.png`;

  const familiarFrameBuffer = await fetchBufferFromUrlCached({ url: frameUrl });
  frameBuffers.push({
    input: familiarFrameBuffer,
  });

  let buffer = await img.composite(frameBuffers).png().toBuffer();

  // resize it
  buffer = await sharp(buffer)
    .resize(size, size, {
      fit: sharp.fit.fill,
      kernel: sharp.kernel.nearest,
    })
    .png()
    .toBuffer();

  return buffer;
}

export async function extractRidingTraitBuffer({
  tokenSlug,
  tokenId,
  traitSlug,
  suffix,
}: {
  tokenSlug: string;
  tokenId: string;
  traitSlug: string;
  suffix: string;
}) {
  const traitLayer = await getTokenTraitLayerDescription({
    tokenSlug,
    tokenId,
    traitSlug,
  });
  const frameBasename = path.basename(traitLayer?.filename || "", ".png");
  const ridingFrameBasename = `${frameBasename}${suffix}.png`;
  const ridingFrameFullname = path.join(
    ROOT_PATH,
    `public/static/nfts/${tokenSlug}/wiz_body_rider/${ridingFrameBasename}`
  );

  if (fs.existsSync(ridingFrameFullname)) {
    const buffer = await sharp(ridingFrameFullname).png().toBuffer();
    return buffer;
  } else {
    return;
  }
}

export async function getMountInCasketImageBuffer({
  tokenSlug,
  tokenId,
  ridingTokenSlug,
  ridingTokenId,
  width,
  scale,
}: {
  tokenSlug: string;
  tokenId: string;
  ridingTokenSlug: string;
  ridingTokenId: string;
  width: number;
  scale: number;
  trim?: boolean;
}) {
  let buffers: ExtendedSharpBuffer[] = [];
  let resizeArgs = { fit: sharp.fit.fill, kernel: sharp.kernel.nearest };
  // get mount
  let mountBuffer = await getMountImageBuffer({
    tokenId: ridingTokenId,
    tokenSlug: ridingTokenSlug,
  });

  const mountSharp = await sharp(mountBuffer);
  const imgMetadata = await mountSharp.metadata();
  const newImgWidth = Math.floor(imgMetadata.width || 59);
  const newImgHeight = Math.floor(imgMetadata.height || 59);
  console.log("imgMetadata: ", imgMetadata);

  let maskBuffer = await sharp(
    path.join(
      ROOT_PATH,
      `public/static/nfts/souls/wiz_body_rider/bg_coffin_mask_black.png`
    )
  )
    .resize(newImgWidth, newImgHeight, resizeArgs)
    .png()
    .toBuffer();

  mountBuffer = await sharp({
    create: {
      width: newImgWidth,
      height: newImgHeight,
      channels: 4,
      background: "rgba(0,0,0,0)",
    },
  })
    .composite([
      {
        input: await sharp(mountBuffer).flip().png().toBuffer(),
        top: 27 * scale,
        left: 0,
      },
    ])
    .png()
    .toBuffer();

  let newBuffer = await sharp({
    create: {
      width: newImgWidth,
      height: newImgHeight,
      channels: 4,
      background: "rgba(0,0,0,0)",
    },
  })
    .composite([
      {
        input: await sharp(maskBuffer).png().toBuffer(),
        top: 0,
        left: 0,
      },
    ])
    .boolean(await sharp(mountBuffer).png().toBuffer(), "and")
    .png()
    .toBuffer();

  mountBuffer = await sharp(mountBuffer)
    .boolean(await sharp(newBuffer).png().toBuffer(), "eor")
    .png()
    .toBuffer();

  buffers.push({
    input: mountBuffer,
    top: 0,
    left: MOUNT_OFFSET * scale, // ugh
    zIndex: 10,
  });

  const undesirableLayer = await getTokenTraitLayerDescription({
    tokenSlug,
    tokenId,
    traitSlug: "undesirable",
  });
  console.log("undesirableLayer: ", undesirableLayer);

  const undesirableBottomBuffer = await extractRidingTraitBuffer({
    tokenSlug,
    tokenId,
    traitSlug: "undesirable",
    suffix: "_bottom",
  });
  buffers.push({
    input: await sharp(undesirableBottomBuffer)
      .resize(newImgWidth, newImgHeight, resizeArgs)
      .toBuffer(),
    top: 0,
    left: MOUNT_OFFSET * scale, // ugh
    zIndex: 0,
  });

  const undesirableTopBuffer = await extractRidingTraitBuffer({
    tokenSlug,
    tokenId,
    traitSlug: "undesirable",
    suffix: "_top",
  });
  buffers.push({
    input: await sharp(undesirableTopBuffer)
      .resize(newImgWidth, newImgHeight, resizeArgs)
      .toBuffer(),
    top: 0,
    left: MOUNT_OFFSET * scale, // ugh
    zIndex: 20,
  });

  // buffers.push({
  //   input: maskBuffer,
  //   top: 0,
  //   left: MOUNT_OFFSET * scale,
  //   zIndex: 60,
  // });

  const canvas = await sharp({
    create: {
      width: newImgWidth,
      height: newImgHeight,
      channels: 4,
      background: "rgba(0,0,0,0)",
    },
  }).composite(sortBy(buffers, (b) => b.zIndex));

  return canvas.png().toBuffer();
}

// This is for getting a rider/mount pair
//
// getRidingTokenBodyBuffer is for the zip download and we "simplify" the rider together to make it a flat image
export async function getRiderOnMountImageBuffer({
  tokenSlug,
  tokenId,
  ridingTokenSlug,
  ridingTokenId,
  width,
}: {
  tokenSlug: string;
  tokenId: string;
  ridingTokenSlug: string;
  ridingTokenId: string;
  width: number;
  trim?: boolean;
}) {
  const scale = 8;

  {
    // special case for coffins because art
    const undesirableLayer = await getTokenTraitLayerDescription({
      tokenSlug,
      tokenId,
      traitSlug: "undesirable",
    });
    if (undesirableLayer && undesirableLayer.filename.match(/coffin/)) {
      return getMountInCasketImageBuffer({
        tokenSlug,
        tokenId,
        ridingTokenSlug,
        ridingTokenId,
        width,
        scale,
      });
    }
  }

  let buffers = await getRidingBodyBuffers({ tokenSlug, tokenId, scale });

  // get mount
  let mountBuffer = await getMountImageBuffer({
    tokenId: ridingTokenId,
    tokenSlug: ridingTokenSlug,
  });

  // get prop
  const partsBuffer = await getTokenPartsBuffer({ tokenSlug });
  const propFrameNum = await getTokenFrameNumber({
    tokenSlug,
    tokenId,
    traitSlug: "prop",
  });
  const propBuffer =
    propFrameNum >= 0 && propFrameNum != 7777
      ? await extractTokenFrameBuffer({
          tokenSlug,
          partsBuffer,
          frameNum: propFrameNum,
        })
      : undefined;

  const mountSharp = await sharp(mountBuffer);
  const imgMetadata = await mountSharp.metadata();
  const newImgWidth = Math.floor(imgMetadata.width || 59);
  const newImgHeight = Math.floor(imgMetadata.height || 59);
  let resizeArgs = { fit: sharp.fit.fill, kernel: sharp.kernel.nearest };

  // ponies are 472x472 instead of original 59x59 so this gets more complicated
  if (propBuffer) {
    buffers.push({
      input: await sharp(propBuffer).resize(400, 400, resizeArgs).toBuffer(),
      top: 0,
      left: (6 + MOUNT_OFFSET) * scale,
      zIndex: MountZIndex.prop,
    });
  }

  buffers.push({
    input: mountBuffer,
    top: 0,
    left: MOUNT_OFFSET * scale, // ugh
    zIndex: MountZIndex.mount,
  });

  const canvas = await sharp({
    create: {
      width: newImgWidth,
      height: newImgHeight,
      channels: 4,
      background: "rgba(0,0,0,0)",
    },
  }).composite(sortBy(buffers, (b) => b.zIndex));

  return canvas.png().toBuffer();
}

export async function getRidingBodyBuffers({
  tokenSlug,
  tokenId,
  scale,
}: {
  tokenSlug: string;
  tokenId: string;
  scale: number;
}): Promise<ExtendedSharpBuffer[]> {
  const partsBuffer = await getTokenPartsBuffer({ tokenSlug });

  const bodyFrameNum = await getTokenFrameNumber({
    tokenSlug,
    tokenId,
    traitSlug: "body",
  });
  const headFrameNum = await getTokenFrameNumber({
    tokenSlug,
    tokenId,
    traitSlug: "head",
  });
  const undesirableFrameNum = await getTokenFrameNumber({
    tokenSlug,
    tokenId,
    traitSlug: "undesirable",
  });
  const undesirableLayer = await getTokenTraitLayerDescription({
    tokenSlug,
    tokenId,
    traitSlug: "undesirable",
  });

  const ridingHeadBuffer =
    parseInt(tokenId) >= 0 && headFrameNum >= 0 && headFrameNum != 7777
      ? await extractRidingTraitBuffer({
          tokenSlug,
          tokenId,
          traitSlug: "head",
          suffix: "_rider",
        })
      : undefined;

  const defaultHeadBuffer =
    headFrameNum >= 0 && headFrameNum != 7777
      ? await extractTokenFrameBuffer({
          tokenSlug,
          partsBuffer,
          frameNum: headFrameNum,
        })
      : undefined;

  const headBuffer = ridingHeadBuffer || defaultHeadBuffer;

  const bodyBuffer =
    parseInt(tokenId) >= 0 && bodyFrameNum >= 0 && bodyFrameNum != 7777
      ? await extractRidingTraitBuffer({
          tokenSlug,
          tokenId,
          traitSlug: "body",
          suffix: "_rider",
        })
      : undefined;
  const armBuffer =
    parseInt(tokenId) >= 0 && bodyFrameNum >= 0 && bodyFrameNum != 7777
      ? await extractRidingTraitBuffer({
          tokenSlug,
          tokenId,
          traitSlug: "body",
          suffix: "_rider_arm",
        })
      : undefined;
  const undesirableBuffer =
    parseInt(tokenId) >= 0 &&
    undesirableFrameNum >= 0 &&
    undesirableFrameNum != 7777
      ? await extractRidingTraitBuffer({
          tokenSlug,
          tokenId,
          traitSlug: "undesirable",
          suffix: "_rider",
        })
      : undefined;

  const newImgWidth = Math.floor(59 * scale);
  const newImgHeight = Math.floor(59 * scale);

  let resizeArgs = { fit: sharp.fit.fill, kernel: sharp.kernel.nearest };

  // ponies are 472x472 instead of original 59x59 so this gets more complicated
  let buffers: ExtendedSharpBuffer[] = [];

  if (armBuffer) {
    buffers.push({
      input: await sharp(armBuffer)
        .resize(newImgWidth, newImgHeight, resizeArgs)
        .toBuffer(),
      top: 0,
      left: Math.floor((2 + MOUNT_OFFSET) * scale),
      zIndex: MountZIndex.arm,
    });
  }

  if (bodyBuffer) {
    buffers.push({
      input: await sharp(bodyBuffer)
        .resize(newImgWidth, newImgHeight, resizeArgs)
        .toBuffer(),
      top: 0,
      left: Math.floor((2 + MOUNT_OFFSET) * scale),
      zIndex: MountZIndex.body,
    });
  }

  if (headBuffer) {
    buffers.push({
      input: await sharp(headBuffer)
        .resize(Math.floor(50 * scale), Math.floor(50 * scale), resizeArgs)
        .toBuffer(),
      top: 0,
      left: Math.floor((5 + MOUNT_OFFSET) * scale),
      zIndex: MountZIndex.head,
    });
  }

  if (undesirableBuffer && undesirableLayer) {
    //
    // exceptions because art
    //
    const undesirableZIndex = undesirableLayer.filename.match(/spiritorb/)
      ? MountZIndex.bg
      : MountZIndex.fg;

    buffers.push({
      input: await sharp(undesirableBuffer)
        .resize(newImgWidth, newImgHeight, resizeArgs)
        .toBuffer(),
      top: 0,
      left: Math.floor((2 + MOUNT_OFFSET) * scale),
      zIndex: undesirableZIndex,
    });
  }
  return buffers;
}

export async function getRidingTokenBodyBuffer({
  tokenSlug,
  tokenId,
  scale,
}: {
  tokenSlug: string;
  tokenId: string;
  scale: number;
}) {
  const buffers = await getRidingBodyBuffers({ tokenSlug, tokenId, scale });
  const newImgWidth = Math.floor(59 * scale);
  const newImgHeight = Math.floor(59 * scale);

  const canvas = await sharp({
    create: {
      width: newImgWidth,
      height: newImgHeight,
      channels: 4,
      background: "rgba(0,0,0,0)",
    },
  }).composite(
    sortBy(
      buffers,
      (b: ExtendedSharpBuffer) => b.zIndex
    ) as ExtendedSharpBuffer[]
  );

  return canvas.png().toBuffer();
}

export async function getMountImageBuffer({
  tokenId,
  tokenSlug,
}: {
  tokenSlug: string;
  tokenId: string;
}) {
  const tokenImageURL = `${process.env.NEXT_PUBLIC_SOULS_API}/api/shadowfax/img/${tokenId}.png?nobg=true`;
  // const tokenImageURL = `http://localhost:3005/static/nfts/ponies/pony_brown.png`;
  // const tokenImageURL = `https://quantum-portal-git-preview-forgottenrunes.vercel.app/api/shadowfax/img/${tokenId}?nobg=true`;

  const bodyFrameBuffer = await fetchBufferFromUrlCached({
    url: tokenImageURL,
  });

  const imgSharp = await sharp(bodyFrameBuffer).toBuffer();
  return imgSharp;
}

// We cache these in memory because we often resize images and this helps dedup
// the fetch. They almost never change so cache expiration isn't an issue. Also,
// because we use pixel art below 100x100, the total size of all possible images
// is very small - we probably could add them to the repo, but doing it this way
// lets us have secret nft drops behind quantum API which checks for permissions
// and making sure something is minted.
let __frameBufferCache: { [key: string]: Buffer } = {};

/* 
example:
 const headFrameUrl = `${frameBaseURL}/${tokenSlug}/${headFrameBaseUrl}`;
 const headFrameBuffer = await fetchBufferFromUrlCached({ url: headFrameUrl })
*/

export async function fetchBufferFromUrlCached({
  url,
}: {
  url: string;
}): Promise<Buffer> {
  if (__frameBufferCache[url]) {
    // console.log("cache hit", url);
    return __frameBufferCache[url];
  }

  // console.log("cache miss", url);
  let frameResponse = await fetch(url, {
    compress: false,
  });
  if (frameResponse.status !== 200) {
    // small hack to try lowercase fetch as S3 is case sensitive and we have edge cases
    frameResponse = await fetch(url.toLowerCase(), {
      compress: false,
    });
    if (frameResponse.status !== 200) {
      throw new Error(
        `Error can't find ${url} or ${url.toLowerCase()} - ${
          frameResponse.status
        }`
      );
    }
  }
  let buffer = await frameResponse.buffer();
  __frameBufferCache[url] = buffer;

  return buffer;
}
