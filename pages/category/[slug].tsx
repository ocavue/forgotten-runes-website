import { POSTS_PATH, postFilePaths } from "../../lib/mdxUtils";
import { fileLocale, pickBestByLocale } from "../../lib/localeTools";

import { GetStaticPaths, GetStaticProps } from "next";
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
import { titleCase } from "title-case";
import { BlogPostGrid } from "../../components/Blog/BlogPostGrid";
import { uniqBy } from "lodash";
import { post } from "request";

export default function Index({
  slug,
  posts,
}: {
  slug: string;
  posts: Post[];
}) {
  // sort the blog posts by their index in the descending order
  posts.sort((a: Post, b: Post) => {
    const indexA = a.data.index ? a.data.index : 99999;
    const indexB = b.data.index ? b.data.index : 99999;
    return indexB - indexA;
  });

  const categoryName = titleCase(slug);

  return (
    <InfoPageLayout
      title={`${categoryName} Posts: Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs`}
      size="wide"
    >
      <h1>{categoryName} Posts</h1>
      <BlogPostGrid>
        {posts.map((post) => (
          <BlogEntry post={post} key={post.filePath} />
        ))}
      </BlogPostGrid>
    </InfoPageLayout>
  );
}

export const getStaticProps: GetStaticProps = async ({
  params,
  locale,
  locales,
  defaultLocale,
}) => {
  const slug = params?.slug;
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
  posts = posts.filter((p) => p.data.category === slug);
  posts = compact(pickBestByLocale(locale || "default", posts));

  return { props: { posts, slug } };
};

export const getStaticPaths: GetStaticPaths = async ({
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

  let categories = uniqBy(
    posts.map((p) => {
      let locale = p.locale === "default" ? "en-US" : p.locale;
      if (!p.data.category) {
        console.log(`Post has no category ${p.filePath}`);
      }

      return {
        locale,
        category: p.data.category || "Post",
        key: `${p.data.category || "Post"}:::${locale}`,
      };
    }),
    "key"
  );

  const paths = categories.map((cat) => {
    return { params: { slug: cat.category || "Post" }, locale: cat.locale };
  });

  return {
    paths,
    fallback: false,
  };
};
