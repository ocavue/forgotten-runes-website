import fs from "fs";
import matter from "gray-matter";
import { MDXRemote } from "next-mdx-remote";
import { serialize } from "next-mdx-remote/serialize";
import Head from "next/head";
import Link from "next/link";
import path from "path";
import styled from "@emotion/styled";
import Layout from "../../components/InfoPageLayout";
import WizardArt from "../../components/WizardArt";
import OgImage, {
  ogImagePropsFromFrontMatter,
  ogImageURL,
} from "../../components/OgImage";
import { postFilePaths, POSTS_PATH } from "../../lib/mdxUtils";
import rehypeSlug from "rehype-slug";
import rehypeAutolinkHeadings from "rehype-autolink-headings";
import { GetStaticPaths, GetStaticProps } from "next";
import { ResponsiveImg } from "../../components/ResponsivePixelImg";
import { TwitterTweetEmbed } from "react-twitter-embed";
import Codepen from "react-codepen-embed";
import WizardHeads from "../../components/Post/WizardHeads";
import { getStatic__allBlogPosts } from "../../components/Blog/blogUtils";
import { Post } from "../../components/Blog/types";
import RelatedPosts from "../../components/Blog/RelatedPosts";
import { documentToReactComponents } from "@contentful/rich-text-react-renderer";
import { BLOCKS } from "@contentful/rich-text-types";
import { createClient } from "contentful";

// import CustomLink from "../../components/CustomLink";
// Custom components/renderers to pass to MDX.
// Since the MDX files aren't loaded by webpack, they have no knowledge of how
// to handle import statements. Instead, you must include components in scope
// here.
const components = {
  //   a: CustomLink,
  // It also works with dynamically-imported components, which is especially
  // useful for conditionally loading components for certain routes.
  // See the notes in README.md for more details.
  //   TestComponent: dynamic(() => import("../../components/TestComponent")),
  Head,
  WizardArt,
  ResponsiveImg,
  TwitterTweetEmbed,
  Codepen,
  WizardHeads,
};

const NavAnchor = styled.a`
  text-decoration: none;
  font-style: italic;
  opacity: 0.7;
  &:hover {
    opacity: 1;
  }
`;

const PostHeader = styled.div`
  max-width: 1370px;
  margin: 2em auto;
  padding: 0 2em;
  display: flex;
  justify-content: flex-start;
  flex-direction: column;
  @media (min-width: 960px) {
    flex-direction: row;
  }

  h1 {
    margin-top: 4px;
  }
`;

const PostNameDesc = styled.div`
  flex-basis: 100%;
  @media (min-width: 960px) {
    flex-basis: 50%;
  }
`;

const StyledImageWrap = styled.div`
  display: block;
  position: relative;
  width: 100%;
  text-decoration: none;
  flex-basis: 100%;

  @media (min-width: 960px) {
    flex-basis: 50%;
  }

  img {
    image-rendering: pixelated;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
  }
`;

const Category = styled.a`
  text-transform: uppercase;
  font-weight: bold;
  color: #a647ff !important;
  font-size: 16px;
  display: block;
  text-decoration: none;
  margin-top: 1.5rem;
`;

function OldPostPage({
  source,
  frontMatter,
  allPosts,
}: {
  source: { compiledSource: string; scope: any };
  frontMatter: any;
  allPosts: Post[];
}) {
  const title = `${frontMatter.title} | Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs`;
  let ogImageProps = ogImagePropsFromFrontMatter(frontMatter);
  let coverImageUrl = ogImageURL(ogImageProps);

  const afterContent = (
    <RelatedPosts thisFrontMatter={frontMatter} allPosts={allPosts} />
  );

  let category = frontMatter.category;

  return (
    <Layout
      title={title}
      description={frontMatter.description}
      afterContent={afterContent}
    >
      <OgImage {...ogImageProps} />
      <header>
        {/* <nav>
          <Link href="/posts">
            <NavAnchor>{"<"} All Posts</NavAnchor>
          </Link>
        </nav> */}
      </header>
      <PostHeader className="post-header full-bleed">
        <PostNameDesc>
          <Link
            as={category ? `/category/${category}` : "/posts"}
            href={category ? `/category/${category}` : "/posts"}
            passHref={true}
          >
            <Category>{category || "Post"}</Category>
          </Link>

          <h1>{frontMatter.title}</h1>
          {frontMatter.description && (
            <p className="description">{frontMatter.description}</p>
          )}
        </PostNameDesc>
        <StyledImageWrap>
          <img src={coverImageUrl} />
        </StyledImageWrap>
      </PostHeader>
      <MDXRemote {...source} components={components} />
      <style jsx>{`
        .post-header h1 {
          margin-bottom: 0.5em;
        }
        .description {
          opacity: 0.6;
        }
      `}</style>
    </Layout>
  );
}

export default function PostPage({
  source,
  frontMatter,
  allPosts,
  contentfulEntry,
}: {
  source: { compiledSource: string; scope: any };
  frontMatter: any;
  allPosts: Post[];
  contentfulEntry?: any;
}) {
  if (source && frontMatter)
    // old non-contentful pages
    return (
      <OldPostPage
        source={source}
        frontMatter={frontMatter}
        allPosts={allPosts}
      />
    );

  const title = contentfulEntry.fields.title;

  console.log(contentfulEntry.fields.previewImage.fields.file.url);

  const ogImageProps = {
    title: title,
    images: `https:${contentfulEntry.fields.previewImage.fields.file.url}`,
  };
  const coverImageUrl = ogImageURL(ogImageProps);

  const category = contentfulEntry.fields.category;
  const description = contentfulEntry.fields.description;

  return (
    <Layout
      title={`${title} | Forgotten Runes Wizard's Cult: 10,000 on-chain Wizard NFTs`}
      description={description}
      afterContent={null}
    >
      <OgImage {...ogImageProps} />
      <header></header>
      <PostHeader className="post-header full-bleed">
        <PostNameDesc>
          <Link
            as={category ? `/category/${category}` : "/posts"}
            href={category ? `/category/${category}` : "/posts"}
            passHref={true}
          >
            <Category>{category || "Post"}</Category>
          </Link>

          <h1>{title}</h1>
          {description && <p className="description">{description}</p>}
        </PostNameDesc>
        <StyledImageWrap>
          <img src={coverImageUrl} />
        </StyledImageWrap>
      </PostHeader>
      {documentToReactComponents(contentfulEntry.fields.body, {
        renderText: (text: string) => {
          return text
            .split("\n")
            .reduce((children: any[], textSegment: string, index: number) => {
              return [
                ...children,
                index > 0 && <br key={index} />,
                textSegment,
              ];
            }, []);
        },
        renderNode: {
          [BLOCKS.EMBEDDED_ASSET]: (node) => (
            <img
              src={node.data?.target?.fields?.file?.url}
              alt={node.data?.target?.fields?.title}
              style={{ objectFit: "cover", alignSelf: "center" }}
            />
          ),
        },
      })}
      <style jsx>{`
        .post-header h1 {
          margin-bottom: 0.5em;
        }
        .description {
          opacity: 0.6;
        }
      `}</style>
    </Layout>
  );
}

export const getStaticProps: GetStaticProps = async ({ params, locale }) => {
  const slug = params?.slug;

  const localizedPostFilePath = path.join(POSTS_PATH, `${slug}.${locale}.md`);
  const postFilePath = path.join(POSTS_PATH, `${slug}.md`);

  if (fs.existsSync(localizedPostFilePath) || fs.existsSync(postFilePath)) {
    // old posts
    const postFilePathToLoad = fs.existsSync(localizedPostFilePath)
      ? localizedPostFilePath
      : postFilePath;

    const source = fs.readFileSync(postFilePathToLoad);
    const { content, data } = matter(source);
    const mdxSource = await serialize(content, {
      mdxOptions: {
        remarkPlugins: [],
        rehypePlugins: [rehypeSlug, rehypeAutolinkHeadings],
      },
      scope: data,
    });

    const allPostProps = await getStatic__allBlogPosts({ params, locale });

    return {
      props: {
        source: mdxSource,
        frontMatter: data,
        allPosts: (allPostProps as any).props?.posts || [],
      },
    };
  } else {
    const client = createClient({
      space: process.env.CONTENTFUL_SPACE as string,
      accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,
    });

    const entries = await client.getEntries({
      content_type: "blogPost",
      "fields.slug[match]": slug,
      locale: locale,
    });
    // console.log("got it...");
    // console.log(entries);

    return {
      props: {
        contentfulEntry: entries.items?.[0],
      },
    };
  }
};

export const getStaticPaths: GetStaticPaths = async ({
  locales,
  defaultLocale,
}) => {
  const paths = postFilePaths
    // Remove file extensions for page paths
    // including locales
    .map((path) => {
      const slug = path.replace(/(\.(\w\w-?(\w\w)?))?\.mdx?$/, "");
      const localeMatch = path.match(/(\.(\w\w-?(\w\w)?))?\.mdx?$/);
      const locale =
        localeMatch && localeMatch[2]
          ? localeMatch[2]
          : defaultLocale || "en-US";
      return { slug, locale };
    })
    // Map the path into the static paths object required by Next.js
    .map(({ slug, locale }) => ({ params: { slug }, locale }));

  const client = createClient({
    space: process.env.CONTENTFUL_SPACE as string,
    accessToken: process.env.CONTENTFUL_ACCESS_TOKEN as string,
  });

  const entries = await client.getEntries({
    content_type: "blogPost",
  });

  paths.push(
    ...entries.items.map((entry: any) => ({
      params: {
        slug: entry.fields.slug,
      },
      locale: entry.sys.locale,
    }))
  );

  return {
    paths,
    fallback: false,
  };
};
