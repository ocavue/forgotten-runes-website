import React from "react";
import PropTypes from "prop-types";
import { FixedSizeList as List } from "react-window";

// simple check if array is empty
const arrayIsEmpty = (arr) => !Array.isArray(arr) || !arr.length;

// react window MenuList component
const MenuList = ({ options, children, getValue }) => {
  const lineHeight = 40;
  const [value] = getValue();
  const initialOffset = Math.max(options.indexOf(value) * lineHeight, 0);
  const maxHeight = Math.min(children.length * lineHeight, 300) || lineHeight;

  // if no options, render react-selects default message
  if (arrayIsEmpty(children)) {
    return <div>{children}</div>;
  }

  return (
    <List
      height={maxHeight}
      itemCount={children.length}
      itemSize={40}
      initialScrollOffset={initialOffset}
    >
      {({ index, style }) => <div style={style}>{children[index]}</div>}
    </List>
  );
};

MenuList.propTypes = {
  options: PropTypes.array.isRequired,
  children: PropTypes.any.isRequired,
  getValue: PropTypes.func.isRequired,
};

export default MenuList;
