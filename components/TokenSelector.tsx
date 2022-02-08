import * as React from "react";
import { useEffect, useState } from "react";
import styled from "@emotion/styled";
import Select from "react-select";
import AyncSelect from "react-select/async";

import wizardLayers from "../public/static/nfts/wizards/wizards-layers.json";
import soulLayers from "../public/static/nfts/souls/souls-layers.json";
import ponyLayers from "../public/static/nfts/ponies/ponies-layers.json";

import { keyBy, sortBy } from "lodash";
import FuzzyReactSelect from "./FuzzyReactSelect";

export type TokenSelectOption = {
  value: any;
  label: string;
};

const wizardOptions: TokenSelectOption[] = wizardLayers.map((w) => {
  const name = `Wizard #${w.idx} ${w.name}`;
  return { value: w.idx, label: name };
});

const soulsOptions: TokenSelectOption[] = sortBy(
  soulLayers.map((w) => {
    const name = `Soul #${w.idx} ${w.name}`;
    return { value: w.idx, label: name };
  }),
  (w) => parseInt(w.value)
);

const poniesOptions: TokenSelectOption[] = sortBy(
  ponyLayers.map((w) => {
    const name = `Pony #${w.idx} ${w.name}`;
    return { value: w.idx, label: name };
  }),
  (w) => parseInt(w.value)
);

const optionSets: { [key: string]: TokenSelectOption[] } = {
  wizards: wizardOptions,
  souls: soulsOptions,
  ponies: poniesOptions,
};

const TokenSelectorElement = styled.div``;

const tokenTypeOptions: TokenSelectOption[] = [
  { value: "wizards", label: "Wizard" },
  { value: "souls", label: "Soul" },
  { value: "ponies", label: "Pony" },
];

// fuze.js options
const fuzzyOptions = {
  keys: [{ name: "label", weight: 0.7 }],
  valueKey: "value",
  maxPatternLength: 8,
  includeScore: true,
  maxResults: 25,
  threshold: 0.3,
};

export const customSelectStyles: any = {
  container: (provided: any) => ({
    ...provided,
    minWidth: "98%",
    maxWidth: "98%",
    margin: "5px",
  }),
  valueContainer: (provided: any) => ({
    ...provided,
    backgroundColor: "#171818",
  }),
  input: (provided: any) => ({
    ...provided,
    // backgroundColor: "#171818",
    color: "white",
  }),
  menu: (provided: any) => ({
    ...provided,
    backgroundColor: "#171818",
    color: "white",
  }),
  option: (provided: any, state: any) => ({
    ...provided,
    backgroundColor: state.isSelected
      ? "#350a49"
      : state.isFocused
      ? "#092953"
      : "#171818",
    color: "white",
    "&:hover": {
      backgroundColor: "#212222",
    },
  }),
  control: (provided: any) => ({
    ...provided,
    backgroundColor: "#171818",
    color: "white",
    borderColor: "#3D3F3E",
  }),
  singleValue: (provided: any) => ({
    ...provided,
    backgroundColor: "#171818",
    color: "white",
  }),
};

export type TokenSelectTokenSpec = {
  tokenSlug: string;
  tokenId: string;
  ridingTokenSlug?: string;
  ridingTokenId?: string;
};

export type TokenSelectFields = {
  tokenTypeOption: TokenSelectOption;
  tokenOption: TokenSelectOption;
  ridingTokenTypeOption?: TokenSelectOption | null;
  ridingTokenOption?: TokenSelectOption | null;
};

type Props = {
  onChange: (options: TokenSelectTokenSpec, fields: TokenSelectFields) => void;
  includeMounts?: boolean;
  defaultTokens?: TokenSelectTokenSpec;
};

function findOptionByValue(optionSet: TokenSelectOption[], value: any) {
  return optionSet.find((f) => f.value === value) || { value: null, label: "" };
}

export default function TokenSelector({
  onChange,
  defaultTokens,
  includeMounts = true,
}: Props) {
  const [tokenTypeOption, setTokenTypeOption] = useState<TokenSelectOption>(
    defaultTokens?.tokenSlug
      ? findOptionByValue(tokenTypeOptions, defaultTokens?.tokenSlug)
      : tokenTypeOptions[0]
  );
  const [tokenOption, setTokenOption] = useState<TokenSelectOption>(
    defaultTokens?.tokenId
      ? findOptionByValue(
          optionSets[tokenTypeOption?.value as string] || [],
          defaultTokens?.tokenId
        )
      : wizardOptions[0]
  );
  const [ridingTokenTypeOption, setRidingTokenTypeOption] =
    useState<TokenSelectOption | null>(
      defaultTokens?.ridingTokenSlug
        ? findOptionByValue(tokenTypeOptions, defaultTokens?.ridingTokenSlug)
        : null
    );
  const [ridingTokenOption, setRidingTokenOption] =
    useState<TokenSelectOption | null>(
      defaultTokens?.ridingTokenId
        ? findOptionByValue(
            optionSets[ridingTokenTypeOption?.value as string] || [],
            defaultTokens?.ridingTokenId
          )
        : null
    );

  const [tokenOptionsSet, setTokenOptionsSet] =
    useState<TokenSelectOption[]>(wizardOptions);

  useEffect(() => {
    if (tokenTypeOption) {
      setTokenOptionsSet(
        tokenTypeOption.value === "wizards"
          ? wizardOptions
          : tokenTypeOption.value === "souls"
          ? soulsOptions
          : tokenTypeOption.value === "ponies"
          ? poniesOptions
          : wizardOptions
      );
    }
  }, [tokenTypeOption]);

  useEffect(() => {
    if (tokenTypeOption?.value && tokenOption?.value) {
      let onChangeArgs =
        tokenTypeOption.value === "ponies"
          ? {
              tokenSlug: tokenTypeOption.value,
              tokenId: tokenOption.value,
              ridingTokenSlug: ridingTokenTypeOption?.value,
              ridingTokenId: ridingTokenOption?.value,
            }
          : {
              tokenSlug: tokenTypeOption.value,
              tokenId: tokenOption.value,
            };

      onChange(onChangeArgs, {
        tokenTypeOption,
        tokenOption,
        ridingTokenTypeOption,
        ridingTokenOption,
      });
    }
  }, [tokenTypeOption, tokenOption, ridingTokenTypeOption, ridingTokenOption]);

  let typeOptions = includeMounts
    ? tokenTypeOptions
    : tokenTypeOptions.filter((t) => t.value !== "ponies");

  const onFuzzyReactSelectChanged = (newValue: any) => {
    console.log("onFuzzyReactSelectChanged: ", newValue);
    setTokenOption(newValue);
  };

  const onRiderTokenChanged = (
    newValue: TokenSelectTokenSpec,
    newSelects: TokenSelectFields
  ) => {
    if (newValue?.tokenId) {
      setRidingTokenTypeOption(newSelects.tokenTypeOption);
      setRidingTokenOption(newSelects.tokenOption);
    }
  };

  return (
    <TokenSelectorElement>
      <Select
        styles={customSelectStyles}
        options={typeOptions}
        defaultValue={tokenTypeOption}
        value={tokenTypeOption}
        onChange={setTokenTypeOption as any}
      />

      <FuzzyReactSelect
        styles={customSelectStyles}
        theme={(theme: any) => ({
          ...theme,
          colors: {
            ...theme.colors,
          },
        })}
        options={tokenOptionsSet}
        defaultValue={tokenOption}
        fuzzyOptions={fuzzyOptions}
        onChange={onFuzzyReactSelectChanged}
        placeholder="Search..."
      />

      {tokenTypeOption.value === "ponies" && (
        <>
          <h3>Pick a rider</h3>
          <TokenSelector
            onChange={onRiderTokenChanged}
            includeMounts={false}
            defaultTokens={{
              tokenId: ridingTokenOption?.value,
              tokenSlug: ridingTokenTypeOption?.value,
            }}
          />
        </>
      )}
    </TokenSelectorElement>
  );
}
