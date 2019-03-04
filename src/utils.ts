import { promisify } from "util";
import * as fs from "fs";
import { join } from "path";

export const flatMap = <T, K>(func: (arg: T) => K[], array: T[]): K[] =>
  array.map(func).reduce((all, item) => all.concat(item), []);

const readdirAsync = promisify(fs.readdir);
export const partition = <T>(func: (arg: T) => boolean, array: T[]) => {
  return array.reduce(([pass, nopass]: [T[], T[]], item: T): [T[], T[]]=> {
    if (func(item)) {
      return [[...pass, item], nopass]
    }
    return [pass, [...nopass, item]]
  }, [[], []] as [T[], T[]]);
};


export const glob = async (path: string, regex: RegExp): Promise<string[]> => {
  const dirContent = await readdirAsync(path, {withFileTypes: true});
  const [folders, files] = partition(file => file.isDirectory(), dirContent);

  const matchingFiles = files.reduce((all: string[], file: { name: string }) => {
    if (!regex.test(file.name)) {
      return all;
    }
    const filePath = path ? join(path, file.name) : file.name;
    return [...all, filePath];
  }, []);

  const rest = await folders.reduce(async (all: Promise<string[]>, folder: { name: string }) => {
    const previous = await all;
    const folderPath = join(path, folder.name);
    const globbed = await glob(folderPath, regex);
    return [...previous, ...globbed];
  }, Promise.resolve([]));

  return [...matchingFiles, ...rest]
};
