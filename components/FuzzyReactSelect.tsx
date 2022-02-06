// https://codesandbox.io/s/lwivu?file=/src/index.js:825-1010
import React, { useState, useEffect } from "react";
import PropTypes from "prop-types";
import AsyncSelect from "react-select/async";
import debounce from "debounce-promise";
import Fuse from "fuse.js";

import MenuList from "./MenuList";

const FuzzyReactSelect = ({
  options,
  fuzzyOptions,
  wait,
  onChange,
  ...props
}: {
  options: any;
  fuzzyOptions: any;
  wait?: number;
  onChange: any;
  [_rest: string]: any;
}) => {
  const [fuse, setFuse] = useState<any>(null);

  // use fuse to search
  const searchOptions = (inputValue: any) =>
    new Promise((resolve) => {
      resolve(
        (fuse as any).search(inputValue).map((c: any) => ({ ...c.item }))
      );
    });

  // call promiseOptions
  const loadOptions = (inputValue: any) => searchOptions(inputValue);

  // debouncer
  const debouncedLoadOptions = debounce(loadOptions, wait);

  useEffect(() => {
    setFuse(new Fuse(options, fuzzyOptions));
    return () => setFuse(null);
  }, [options, fuzzyOptions]);

  useEffect(() => {
    if (options && fuse) {
      fuse.setCollection(options);
    }
  }, [fuse, options]);

  return (
    <AsyncSelect
      options={options}
      components={{ MenuList }}
      loadOptions={(value: any) => debouncedLoadOptions(value)}
      onChange={onChange}
      {...props}
    />
  );
};

export default FuzzyReactSelect;
