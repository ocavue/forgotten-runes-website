import { useState } from "react";
import * as React from "react";

const ImageWithFallback = ({ src, fallbackSrc, ...props }: any) => {
  const [imgSrc, setImgSrc] = useState<string>(src);
  const onError = () => {
    console.log(`Error loading ${src}, will try ${fallbackSrc}`);
    setImgSrc(fallbackSrc);
  };
  return <img {...props} src={imgSrc} onError={onError} />;
};

export default ImageWithFallback;
