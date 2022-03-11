import * as React from "react";
import { useState } from "react";
import Link from "next/link";
import styled from "@emotion/styled";
import { Post } from "./types";
import Spacer from "../Spacer";

type Props = { post: Post };

export const StyledAnchor = styled.a`
  font-size: 1.2em;
  margin-bottom: 0.3em;
  display: inline-block;
  cursor: pointer;
  text-decoration: none;

  &:hover > h2 {
    text-decoration: underline;
  }
`;

export const Description = styled.div`
  font-size: 14px;
  color: #585858;
`;

export const Category = styled.a`
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
export const BlogEntryElement = styled.div``;

export const StyledImageAnchor = styled.a`
  display: block;
  position: relative;
  width: 100%;
  padding-top: 57%;
  text-decoration: none;
`;
export const BlogPostImgWrap = styled.div`
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

// image-rendering: ${(props) =>
//   props.pixelated === undefined || props.pixelated
//     ? "pixelated"
//     : "inherit"};
export const BlogPostImgWrapInner = styled.div<{
  pixelated?: boolean;
  cover?: boolean;
  backgroundColor?: string;
}>`
  img {
    image-rendering: pixelated;
    position: absolute;
    left: 0;
    top: 0;
    right: 0;
    bottom: 0;
    width: 100%;
    height: 100%;
    object-fit: ${(props) =>
      props.cover == undefined || props.cover ? "cover" : "contain"};
    border-radius: 5px;
    background-color: ${(props) => props.backgroundColor ?? "inherit"};
  }
`;

export default function BlogEntry({ post }: Props) {
  const slug = post.slug
    ? post.slug
    : post.filePath?.replace(/(\.(\w\w-?(\w\w)?))?\.mdx?$/, "");
  return (
    <BlogEntryElement>
      <Link as={`/posts/${slug}`} href={`/posts/[slug]`} passHref={true}>
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

      <Link as={`/posts/${slug}`} href={`/posts/[slug]`} passHref={true}>
        <StyledAnchor title={post.data.title}>
          {post.data.description && (
            <Description>{post.data.description}</Description>
          )}
        </StyledAnchor>
      </Link>
    </BlogEntryElement>
  );
}
