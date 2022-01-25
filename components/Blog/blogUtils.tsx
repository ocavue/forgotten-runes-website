import fs from "fs";
import matter from "gray-matter";
import compact from "lodash/compact";
import { GetStaticProps } from "next";
import path from "path";
import {
  ogImagePropsFromFrontMatter,
  ogImageURL,
} from "../../components/OgImage";
import { fileLocale, pickBestByLocale } from "../../lib/localeTools";
import { postFilePaths, POSTS_PATH } from "../../lib/mdxUtils";
import { Post } from "./types";

export const getStatic__allBlogPosts: GetStaticProps = async ({
  params,
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
  posts = compact(pickBestByLocale(locale || "default", posts));

  return { props: { posts } };
};
