import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import styled from "@emotion/styled";
import { Post } from "./types";

type Props = { post: Post };

const StyledAnchor = styled.a`
  font-size: 1.2em;
  margin-bottom: 0.3em;
  display: inline-block;
  cursor: pointer;
  text-decoration: none;

  &:hover > h2 {
    text-decoration: underline;
  }
`;

const Description = styled.div`
  font-size: 14px;
  color: #585858;
`;

const Category = styled.a`
  text-transform: uppercase;
  font-weight: bold;
  color: #a647ff !important;
  font-size: 12px;
  display: block;
  text-decoration: none;
  margin-bottom: 4px;
`;

const BlogPostTitle = styled.h2`
  /* min-height: 2.4em; */
  font-size: 1.5rem !important;
`;
const BlogEntryElement = styled.div``;

const StyledImageAnchor = styled.a`
  display: block;
  position: relative;
  width: 100%;
  padding-top: 57%;
  text-decoration: none;
`;
const BlogPostImgWrap = styled.div`
  position: absolute;
  left: 0;
  top: 0;
  right: 0;
  bottom: 0;
  transition: transform 0.2s ease-in-out;
  &:hover {
    transform: scale(1.1);
  }
`;
const BlogPostImgWrapInner = styled.div`
  img {
    image-rendering: pixelated;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 5px;
  }
`;

export default function BlogEntry({ post }: Props) {
  return (
    <BlogEntryElement>
      <Link
        as={`/posts/${post.filePath.replace(
          /(\.(\w\w-?(\w\w)?))?\.mdx?$/,
          ""
        )}`}
        href={`/posts/[slug]`}
        passHref={true}
      >
        <StyledImageAnchor title={post.data.title}>
          <BlogPostImgWrap>
            <BlogPostImgWrapInner>
              <img src={post.coverImageUrl} />
            </BlogPostImgWrapInner>
          </BlogPostImgWrap>
        </StyledImageAnchor>
      </Link>

      <Link
        as={post.data.category ? `/category/${post.data.category}` : "/posts"}
        href={post.data.category ? `/category/${post.data.category}` : "/posts"}
        passHref={true}
      >
        <Category>{post.data.category || "Post"}</Category>
      </Link>

      <Link
        as={`/posts/${post.filePath.replace(
          /(\.(\w\w-?(\w\w)?))?\.mdx?$/,
          ""
        )}`}
        href={`/posts/[slug]`}
        passHref={true}
      >
        <StyledAnchor title={post.data.title}>
          {/* <BlogPostTitle>{post.data.title}</BlogPostTitle> */}
          {post.data.description && (
            <Description>{post.data.description}</Description>
          )}
        </StyledAnchor>
      </Link>
    </BlogEntryElement>
  );
}
