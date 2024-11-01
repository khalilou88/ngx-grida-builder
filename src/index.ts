import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from '@angular-devkit/architect';
import { JsonObject } from '@angular-devkit/core';
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from 'fs';
import * as path from 'path';
import { xliffToJson } from './xliff-to-json';

interface Options extends JsonObject {
  locales: string[];
  source: string;
  destination: string;
}
export default createBuilder(xliffToJsonBuilder);

async function xliffToJsonBuilder(
  options: Options,
  context: BuilderContext,
): Promise<BuilderOutput> {
  let isSourceDirExists =
    existsSync(options.source) && lstatSync(options.source).isDirectory();

  if (!isSourceDirExists) {
    context.logger.error(`${options.source} don't exist or is not a folder`);
  }

  let isDestinationDirExists =
    existsSync(options.destination) &&
    lstatSync(options.destination).isDirectory();

  if (isDestinationDirExists) {
    mkdirSync(options.destination, { recursive: true });
  }

  context.reportStatus(
    `Converting xliff files to json from ${options.source} folder to ${options.destination} folder.`,
  );
  try {
    options.locales.forEach(async (locale) => {
      const xliffFile = path.join(options.source, `messages.${locale}.xlf`);
      const jsonFile = path.join(
        options.destination,
        `messages.${locale}.json`,
      );

      if (existsSync(xliffFile)) {
        const xliff = readFileSync(xliffFile, 'utf8');
        const js = await xliffToJson(xliff);
        writeFileSync(jsonFile, JSON.stringify(js));
      } else {
        context.logger.warn(`File ${xliffFile} is missing`);
      }
    });
  } catch (err) {
    context.logger.error('Failed to converts files.');
    return {
      success: false,
      error: (err as Error).message,
    };
  }
  context.reportStatus('Done.');
  return { success: true };
}
