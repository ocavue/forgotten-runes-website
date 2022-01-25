import path from "path";
import { compact, forEach, groupBy, keyBy } from "lodash";
import { Post } from "../components/Blog/types";

export const pickBestByLocale = (locale: string, files: Post[]): Post[] => {
  const idx = groupBy(files, (f) => f.basename);

  let outFiles: Post[] = [];
  forEach(idx, (localeFiles: Post[], filename: string) => {
    const localeIndexed = keyBy(localeFiles, "locale");
    if (localeIndexed[locale]) {
      outFiles.push(localeIndexed[locale]);
    } else {
      outFiles.push(localeIndexed["default"]);
    }
  });

  return outFiles;
};

export const fileLocale = (filePath: string) => {
  const localeMatch = path
    .basename(filePath)
    .match(/(.*?)(\.(\w\w-?(\w\w)?))?\.md/);
  const basename = localeMatch && localeMatch[1] ? localeMatch[1] : "";
  const localeExt = localeMatch && localeMatch[3] ? localeMatch[3] : "default";
  return { filePath, basename, localeExt };
};
