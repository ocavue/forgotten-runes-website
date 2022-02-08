import * as React from "react";
import { useState } from "react";
import styled from "@emotion/styled";
import TokenSelector, {
  TokenSelectOption,
  TokenSelectTokenSpec,
} from "./TokenSelector";
import ResolutionSelector from "./ResolutionSelector";
import { LockscreenImg } from "./LockscreenImg";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";

type Props = {
  tokenSlug: string;
  tokenId: string;
  ridingTokenSlug?: string;
  ridingTokenId?: string;
};

const LockscreenPickerElement = styled.div`
  display: flex;
  flex-direction: column;
  @media (min-width: 768px) {
    flex-direction: row;
  }
`;

const Controls = styled.div`
  @media (min-width: 768px) {
    flex: 50%;
    margin: 0.5em;
  }
`;
const Preview = styled.div`
  margin: 0.5em;
  @media (min-width: 768px) {
    flex: 50%;
    margin-left: 2em;
  }
`;
const ImgFrame = styled.div`
  background-color: white;
  padding: 5px;
  padding-bottom: 3px;
  border-radius: 5px;
`;

export default function LockscreenPicker({
  tokenSlug,
  tokenId,
  ridingTokenSlug,
  ridingTokenId,
}: Props) {
  const router = useRouter();
  console.log(router.query);
  const defaultToken: TokenSelectTokenSpec = {
    tokenSlug,
    tokenId,
    ridingTokenSlug,
    ridingTokenId,
  };

  const [currentToken, setCurrentToken] =
    useState<TokenSelectTokenSpec>(defaultToken);

  //   console.log("currentToken: ", currentToken);
  const [currentResolution, setCurrentResolution] = useState<any>();

  const currentTokenChanged = (newToken: TokenSelectTokenSpec) => {
    const { tokenSlug, tokenId, ridingTokenSlug, ridingTokenId } = newToken;
    if (newToken && tokenId) {
      console.log("currentTokenChanged: ", newToken);
      setCurrentToken(newToken);
      let newQueryParams = newToken;
      router.push({ path: "/lockscreen", query: newQueryParams }, undefined, {
        shallow: true,
      });
    }
  };

  //   const downloadImage = () => {
  //     saveAs("image_url", "image.jpg"); // Put your image url here.
  //   };

  return (
    <LockscreenPickerElement>
      <Controls>
        <h2>Pick a Wizard</h2>
        <TokenSelector
          onChange={currentTokenChanged}
          defaultTokens={currentToken}
        />
        <h2>Pick a Resolution</h2>
        <ResolutionSelector onChange={setCurrentResolution} />
        {/* <pre>{JSON.stringify(currentToken, null, 2)}</pre>
        <pre>{JSON.stringify(currentResolution, null, 2)}</pre> */}
        {/* <Button onClick={downloadImage}>Download!</Button> */}
      </Controls>

      <Preview>
        <ImgFrame>
          <LockscreenImg
            {...currentToken}
            device={currentResolution?.resolutionOption?.value?.name}
            width={currentResolution?.resolutionOption?.value?.width}
            height={currentResolution?.resolutionOption?.value?.height}
            ratio={currentResolution?.resolutionOption?.value?.ratio}
          />
        </ImgFrame>
      </Preview>
    </LockscreenPickerElement>
  );
}
