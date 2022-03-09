import React from "react";
import { pinFileToIpfs } from "../AddLore/addLoreHelpers";

export function uploadImageIpfs(
  firstImageUrl: string | undefined,
  setFirstImageUrl: React.Dispatch<React.SetStateAction<string | undefined>>
) {
  return async (a: File) => {
    try {
      const res = await pinFileToIpfs(a, 1, "1");

      const url = `ipfs://${res.IpfsHash}`;
      if (!firstImageUrl) {
        setFirstImageUrl(url);
      }
      return url;
    } catch (e: any) {
      console.error(e);
      return "Problem uploading, please try again...";
    }
  };
}
