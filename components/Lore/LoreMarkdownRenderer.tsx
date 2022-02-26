import ReactPlayer from "react-player";
import { IPFS_SERVER } from "../../constants";
import ReactMarkdown, { uriTransformer } from "react-markdown";
import * as React from "react";
import { CLOUDINARY_SERVER, TextPage } from "./IndividualLorePage";
import Link from "next/link";
import { getContrast } from "../../lib/colorUtils";
import {
  getContractFromTokenSlug,
  getSlugFromTag,
  getTokenName,
} from "../../lib/nftUtilis";
import dynamic from "next/dynamic";

const ImageWithFallback = dynamic(() => import("../ui/ImageWithFallback"), {
  ssr: false,
});

const TOKEN_TAG_REGEX = /\@(wizard|soul|pony)([0-9]+)/gm;

export function getCloudinaryFrontedImageSrc(src?: string, flags?: string) {
  let fallbackSrc: string;
  let newSrc: string;

  const CLOUDINARY_SERVER_WITH_FLAGS = `${CLOUDINARY_SERVER}${
    flags ? flags : "f_auto"
  }/`;
  if (src?.startsWith("ipfs://")) {
    newSrc = src.replace(
      /^ipfs:\/\//,
      `${CLOUDINARY_SERVER_WITH_FLAGS}${IPFS_SERVER}/`
    );
    // We fall back to IPFS CDN if we get error (e.g. in case being over limit with Cloudinary)
    fallbackSrc = src.replace(/^ipfs:\/\//, `${IPFS_SERVER}/`);
  } else if (src?.startsWith("https://") || src?.startsWith("http://")) {
    newSrc = `${CLOUDINARY_SERVER_WITH_FLAGS}${src}`;
    fallbackSrc = src;
  } else if (src?.startsWith("data")) {
    newSrc = src;
    fallbackSrc = src;
  } else {
    newSrc = uriTransformer(src as string);
    fallbackSrc = newSrc;
  }
  return { newSrc, fallbackSrc };
}

const LoreMarkdownRenderer = ({
  markdown,
  bgColor = "#000000",
}: {
  markdown: any;
  bgColor: string | undefined;
}) => {
  const textColor = getContrast(bgColor ?? "#000000");

  return (
    <TextPage
      style={{ color: textColor, backgroundColor: bgColor ?? "#000000" }}
    >
      <ReactMarkdown
        children={markdown}
        components={{
          pre: ({ node, children, ...props }) => (
            <pre {...props} style={{ whiteSpace: "pre-line" }}>
              {children}
            </pre>
          ),
          p: ({ node, children, ...props }) => {
            let processedChildren = [];

            for (let i = 0; i < children.length; i++) {
              const child = children[i];

              if (typeof child === "string") {
                if (child.startsWith("https://www.youtube.com")) {
                  processedChildren.push(
                    <ReactPlayer url={child} width={"100%"} />
                  );
                } else {
                  const tokenTagMatches = [...child.matchAll(TOKEN_TAG_REGEX)];

                  if (tokenTagMatches.length > 0) {
                    tokenTagMatches.forEach((match, index) => {
                      const priorMatchEnd =
                        index === 0
                          ? 0
                          : // @ts-ignore
                            tokenTagMatches[index - 1].index +
                            // @ts-ignore
                            tokenTagMatches[index - 1][0].length;

                      const tagType = match[1]; // e.g. "wizard"
                      const slug = getSlugFromTag(tagType);
                      const tokenId = match[2];

                      const name = getTokenName(
                        tokenId,
                        getContractFromTokenSlug(slug)
                      );

                      processedChildren.push(
                        child.slice(priorMatchEnd, match.index)
                      );
                      processedChildren.push(
                        <Link href={`/lore/${slug}/${tokenId}`}>{name}</Link>
                      );

                      if (index === tokenTagMatches.length - 1) {
                        const fullMatchedWord = match[0]; // e.g. @wizard123
                        processedChildren.push(
                          // @ts-ignore
                          child.slice(match.index + fullMatchedWord.length)
                        );
                      }
                    });
                  } else {
                    processedChildren.push(child);
                  }
                }
              } else {
                // do nothing, pass through
                processedChildren.push(child);
              }
            }

            return (
              <p {...props} style={{ wordWrap: "break-word" }}>
                {processedChildren}
              </p>
            );
          },
          img: ({ node, src, ...props }) => {
            const { newSrc, fallbackSrc } = getCloudinaryFrontedImageSrc(src);

            return (
              <ImageWithFallback
                src={newSrc}
                fallbackSrc={fallbackSrc}
                style={{ maxWidth: "100%", height: "auto" }}
              />
            );
          },
        }}
      />
    </TextPage>
  );
};

export default LoreMarkdownRenderer;
