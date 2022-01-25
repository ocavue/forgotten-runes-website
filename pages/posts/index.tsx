import { POSTS_PATH, postFilePaths } from "../../lib/mdxUtils";
import { fileLocale, pickBestByLocale } from "../../lib/localeTools";

import { GetStaticProps } from "next";
import InfoPageLayout from "../../components/InfoPageLayout";
import Link from "next/link";
import compact from "lodash/compact";
import fs from "fs";
import matter from "gray-matter";
import path from "path";
import styled from "@emotion/styled";
import { Post } from "../../components/Blog/types";
import BlogEntry from "../../components/Blog/BlogEntry";
import {
  ogImagePropsFromFrontMatter,
  ogImageURL,
} from "../../components/OgImage";
import { BlogPostGrid } from "../../components/Blog/BlogPostGrid";

export default function Index({ posts }: { posts: Post[] }) {
  // sort the blog posts by their index in the descending order
  posts.sort((a: Post, b: Post) => {
    const indexA = a.data.index ? a.data.index : 99999;
    const indexB = b.data.index ? b.data.index : 99999;
    return indexB - indexA;
  });
  return (
    <InfoPageLayout
      title="Blog Posts: Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs"
      size="wide"
    >
      <h1>Forgotten Blog Posts</h1>
      <BlogPostGrid>
        {posts.map((post) => (
          <BlogEntry post={post} key={post.filePath} />
        ))}
      </BlogPostGrid>
    </InfoPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({
  locale,
  locales,
  defaultLocale,
}) => {
  let posts: Post[] = compact(
    postFilePaths.map((filePath) => {
      const { basename, localeExt } = fileLocale(filePath);
      const source = fs.readFileSync(path.join(POSTS_PATH, filePath));
      const { content, data } = matter(source);

      let ogImageProps = ogImagePropsFromFrontMatter(data);
      let coverImageUrl = ogImageURL(ogImageProps);

      return {
        content,
        data,
        filePath,
        basename,
        locale: localeExt,
        coverImageUrl,
      };
    })
  );
  posts = pickBestByLocale(locale || "default", posts);

  return { props: { posts } };
};
