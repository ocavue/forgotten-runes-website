export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

// https://stackoverflow.com/a/61033353/9426588
// The video id will be captured in the first group.
export const YOUTUBE_REGEX =
  /(?:https?:\/\/)?(?:www\.|m\.)?youtu(?:\.be\/|be.com\/\S*(?:watch|embed)(?:(?:(?=\/[^&\s\?]+(?!\S))\/)|(?:\S*v=|v\/)))([^&\s\?]+)/g;

export const TOKEN_TAG_REGEX = /\@((?:wizard|soul|pony)[0-9]+)/g;

/**
 * Provide the video id.
 */
export function createYouTubeUrl(id: string) {
  const urlStart = "https://www.youtube.com";
  return `${urlStart}/embed/${id}`;
}
