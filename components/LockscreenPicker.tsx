import * as React from "react";
import { useState } from "react";
import styled from "@emotion/styled";
import TokenSelector from "./TokenSelector";
import ResolutionSelector from "./ResolutionSelector";
import { LockscreenImg } from "./LockscreenImg";
import { saveAs } from "file-saver";
import { useRouter } from "next/router";

type Props = {};

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

export default function LockscreenPicker({}: Props) {
  const router = useRouter();
  console.log(router.query);

  const defaultToken =
    router?.query?.tokenType === "ponies"
      ? {
          tokenTypeOption: router?.query?.ridingTokenSlug,
          tokenOption: router?.query?.ridingTokenId,
          riderTokenOption: router?.query?.tokenSlug,
          riderTokenId: router?.query?.tokenId,
        }
      : {
          tokenTypeOption: router?.query?.tokenSlug,
          tokenOption: router?.query?.tokenId,
        };

  const [currentToken, setCurrentToken] = useState<any>(defaultToken);
  const [currentResolution, setCurrentResolution] = useState<any>();

  const buildTokenOptions = (currentToken: any) => {
    let lockscreenImgProps;
    if (currentToken?.tokenTypeOption?.value === "ponies") {
      lockscreenImgProps = {
        ridingTokenSlug: currentToken?.tokenTypeOption?.value,
        ridingTokenId: currentToken?.tokenOption?.value,

        tokenSlug: currentToken?.riderTokenOption?.tokenTypeOption?.value,
        tokenId: currentToken?.riderTokenOption?.tokenOption?.value,
      };
    } else {
      lockscreenImgProps = {
        tokenSlug: currentToken?.tokenTypeOption?.value,
        tokenId: currentToken?.tokenOption?.value,
      };
    }
    return lockscreenImgProps;
  };

  const currentTokenChanged = (newCurrentToken: any) => {
    setCurrentToken(newCurrentToken);

    let newQueryParams = buildTokenOptions(newCurrentToken);
    router.push({ path: "/lockscreen", query: newQueryParams }, undefined, {
      shallow: true,
    });
  };

  let lockscreenImgProps = buildTokenOptions(currentToken);

  //   const downloadImage = () => {
  //     saveAs("image_url", "image.jpg"); // Put your image url here.
  //   };

  return (
    <LockscreenPickerElement>
      <Controls>
        <h2>Pick a Wizard</h2>
        <TokenSelector onChange={currentTokenChanged} />
        <h2>Pick a Resolution</h2>
        <ResolutionSelector onChange={setCurrentResolution} />
        {/* <pre>{JSON.stringify(currentToken, null, 2)}</pre>
        <pre>{JSON.stringify(currentResolution, null, 2)}</pre> */}
        {/* <Button onClick={downloadImage}>Download!</Button> */}
      </Controls>

      <Preview>
        <ImgFrame>
          <LockscreenImg
            {...lockscreenImgProps}
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
