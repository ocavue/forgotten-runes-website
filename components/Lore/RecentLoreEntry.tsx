import Link from "next/link";
import * as React from "react";
import {
  BlogPostImgWrap,
  BlogPostImgWrapInner,
  Category,
  Description,
  StyledAnchor,
  StyledImageAnchor,
} from "../Blog/BlogEntry";
import { getCloudinaryFrontedImageSrc } from "./LoreMarkdownRenderer";
import Spacer from "../Spacer";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Box, Flex } from "rebass";
import ImageWithFallback from "../ui/ImageWithFallback";

dayjs.extend(LocalizedFormat);

export type RecentLoreEntryType = {
  createdAtTimestamp: number;
  image: string;
  pixelateImage: boolean;
  coverImageFit: boolean;
  backgroundColor: string;
  title: string;
  story: string;
  url: string;
};

export default function RecentLoreEntry({
  entry,
}: {
  entry: RecentLoreEntryType;
}) {
  const { newSrc: src, fallbackSrc } = getCloudinaryFrontedImageSrc(
    entry.image
  );

  return (
    <Flex flexDirection={"column"} justifyContent={"space-between"}>
      <Box>
        <Link href={entry.url} passHref={true}>
          <StyledImageAnchor title={entry.title}>
            <BlogPostImgWrap>
              <BlogPostImgWrapInner
                pixelated={entry.pixelateImage}
                cover={entry.coverImageFit}
                backgroundColor={entry.backgroundColor}
              >
                <ImageWithFallback
                  src={src}
                  fallbackSrc={fallbackSrc}
                  alt={entry.title}
                />
              </BlogPostImgWrapInner>
            </BlogPostImgWrap>
          </StyledImageAnchor>
        </Link>
        <Spacer pt={3} />
        <Link href={entry.url} passHref={true}>
          <Category>{entry.title}</Category>
        </Link>
        <Spacer pt={2} />
        <Link href={entry.url} passHref={true}>
          <StyledAnchor title={entry.title}>
            <Description>
              {dayjs.unix(entry.createdAtTimestamp).format("MMM D, YYYY")}{" "}
              {entry.story ? `• ${entry.story}` : null}
            </Description>
          </StyledAnchor>
        </Link>
      </Box>
    </Flex>
  );
}
