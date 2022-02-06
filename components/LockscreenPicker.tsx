import * as React from "react";
import { useState } from "react";
import styled from "@emotion/styled";
import TokenSelector from "./TokenSelector";
import ResolutionSelector from "./ResolutionSelector";
import { LockscreenImg } from "./LockscreenImg";
import { saveAs } from "file-saver";

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
  const [currentToken, setCurrentToken] = useState<any>();
  const [currentResolution, setCurrentResolution] = useState<any>();

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

  const downloadImage = () => {
    saveAs("image_url", "image.jpg"); // Put your image url here.
  };

  return (
    <LockscreenPickerElement>
      <Controls>
        <h2>Pick a Wizard</h2>
        <TokenSelector onChange={setCurrentToken} />
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
          />
        </ImgFrame>
      </Preview>
    </LockscreenPickerElement>
  );
}
