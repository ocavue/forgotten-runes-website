import * as React from "react";
import { useState } from "react";
import styled from "@emotion/styled";
import { Post } from "./types";
import { BlogPostGrid } from "./BlogPostGrid";
import BlogEntry from "./BlogEntry";
import InfoPageLayout, { StandaloneWideLayout } from "../InfoPageContent";
import { shuffle } from "lodash";

type Props = {
  thisFrontMatter: any;
  allPosts: Post[];
};

const RelatedPostsElement = styled(StandaloneWideLayout)`
  padding-bottom: 6em;
`;

export default function RelatedPosts({ thisFrontMatter, allPosts }: Props) {
  const posts = shuffle(allPosts).slice(0, 3);

  return (
    <RelatedPostsElement>
      <h2>Related Posts</h2>
      <BlogPostGrid>
        {posts.map((post) => (
          <BlogEntry post={post} key={post.filePath} />
        ))}
      </BlogPostGrid>
    </RelatedPostsElement>
  );
}
