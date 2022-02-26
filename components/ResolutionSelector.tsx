import * as React from "react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Select from "react-select";
import { DEVICE_ASPECT_RATIOS } from "../lib/util/devices";
import { customSelectStyles } from "./TokenSelector";
import { getSelectorsByUserAgent } from "react-device-detect";
import { useWindowSize } from "@react-hook/window-size";

const resolutionOptions = DEVICE_ASPECT_RATIOS.map((w) => {
  const name = `${w.name} (${w.width * w.ratio}x${w.height * w.ratio})`;
  return { value: w, label: name };
});

type Props = {
  onChange: any;
};

const ResolutionSelectorElement = styled.div``;

export default function ResolutionSelector({ onChange }: Props) {
  const selectors = getSelectorsByUserAgent(
    typeof window !== "undefined" ? window?.navigator?.userAgent : ""
  );
  const [width, height] = useWindowSize();
  const { isMobile, mobileVendor, mobileModel } = selectors
    ? selectors
    : { isMobile: false, mobileVendor: "", mobileModel: "" };

  let defaultResolution = resolutionOptions.find((r: any) =>
    r.label.match(/iPhone 8/)
  );

  if (isMobile) {
    const matchingDevice = resolutionOptions.find((r: any) => {
      return r.value.width === width && r.value.height === height;
    });
    if (matchingDevice) {
      defaultResolution = matchingDevice;
    } else {
      const deviceName = `${mobileVendor} ${mobileModel}`;
      defaultResolution = {
        label: deviceName,
        value: {
          name: deviceName,
          width,
          height,
          ratio: typeof window !== "undefined" ? window.devicePixelRatio : 1,
          type: "mobile",
        },
      };
      console.log("defaultResolution: ", defaultResolution);
    }
  }

  const [resolutionOption, setResolutionOption] = useState(defaultResolution);
  // console.log("resolutionOption: ", resolutionOption);

  useEffect(() => {
    onChange({ resolutionOption });
  }, [resolutionOption]);

  return (
    <ResolutionSelectorElement>
      <Select
        styles={customSelectStyles}
        options={resolutionOptions}
        defaultValue={resolutionOption}
        value={resolutionOption}
        onChange={setResolutionOption as any}
        isSearchable={true}
      />
    </ResolutionSelectorElement>
  );
}
