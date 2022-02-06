import * as React from "react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Select from "react-select";
import { DEVICE_ASPECT_RATIOS } from "../lib/util/devices";
import { customSelectStyles } from "./TokenSelector";

const resolutionOptions = DEVICE_ASPECT_RATIOS.map((w) => {
  const name = `${w.name} (${w.width * w.ratio}x${w.height * w.ratio})`;
  return { value: w, label: name };
});

type Props = {
  onChange: any;
};

const TokenSelectorElement = styled.div``;

export default function TokenSelector({ onChange }: Props) {
  const [resolutionOption, setResolutionOption] = useState(
    resolutionOptions.find((r: any) => r.label.match(/iPhone 8/))
  );

  useEffect(() => {
    onChange({ resolutionOption });
  }, [resolutionOption]);

  return (
    <TokenSelectorElement>
      <Select
        styles={customSelectStyles}
        options={resolutionOptions}
        defaultValue={resolutionOption}
        value={resolutionOption}
        onChange={setResolutionOption as any}
        isSearchable={true}
      />
    </TokenSelectorElement>
  );
}
