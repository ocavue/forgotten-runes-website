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
import { getCloudfrontedImageSrc } from "./LoreMarkdownRenderer";
import Spacer from "../Spacer";
import dayjs from "dayjs";
import LocalizedFormat from "dayjs/plugin/localizedFormat";
import { Box, Flex } from "rebass";

dayjs.extend(LocalizedFormat);

export type RecentLoreEntryType = {
  createdAtTimestamp: number;
  image: string;
  pixelateImage: boolean;
  coverImageFit: boolean;
  title: string;
  story: string;
  url: string;
};

export default function RecentLoreEntry({
  entry,
}: {
  entry: RecentLoreEntryType;
}) {
  const { newSrc: imageSrc } = getCloudfrontedImageSrc(entry.image);

  return (
    <Flex flexDirection={"column"} justifyContent={"space-between"}>
      <Box>
        <Link href={entry.url} passHref={true}>
          <StyledImageAnchor title={entry.title}>
            <BlogPostImgWrap>
              <BlogPostImgWrapInner
                pixelated={entry.pixelateImage}
                cover={entry.coverImageFit}
              >
                <img src={imageSrc} alt={entry.title} />
              </BlogPostImgWrapInner>
            </BlogPostImgWrap>
          </StyledImageAnchor>
        </Link>
        <Spacer pt={3} />
        <Link href={entry.url} passHref={true}>
          <Category>{entry.title}</Category>
        </Link>

        <Link href={entry.url} passHref={true}>
          <StyledAnchor title={entry.title}>
            {entry.story && <Description>{entry.story}</Description>}
          </StyledAnchor>
        </Link>
      </Box>
      <h4>{dayjs.unix(entry.createdAtTimestamp).format("L")}</h4>
    </Flex>
  );
}
