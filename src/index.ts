import {
  BuilderContext,
  BuilderOutput,
  createBuilder,
} from "@angular-devkit/architect";
import { JsonObject } from "@angular-devkit/core";
import {
  existsSync,
  lstatSync,
  mkdirSync,
  readFileSync,
  writeFileSync,
} from "fs";
import * as path from "path";
// @ts-expect-error need this to work
import { xliff12ToJs } from "xliff";

interface Options extends JsonObject {
  locales: string[];
  source: string;
  destination: string;
}
export default createBuilder(xliffToJsonBuilder);

async function xliffToJsonBuilder(
  options: Options,
  context: BuilderContext
): Promise<BuilderOutput> {
  let isSourceDirExists =
    existsSync(options.source) && lstatSync(options.source).isDirectory();

  if (!isSourceDirExists) {
    context.logger.error(`${options.source} don't exist or is not a folder`);
  }

  let isDestinationExists = existsSync(options.destination);

  let isNotDir =
    isDestinationExists && !lstatSync(options.destination).isDirectory();

  if (isNotDir) {
    context.logger.error(`${options.destination} is not a folder`);
  }

  if (!isDestinationExists) {
    mkdirSync(options.destination, { recursive: true });
  }

  context.reportStatus(
    `Converting xliff files to json from ${options.source} folder to ${options.destination} folder.`
  );
  try {
    options.locales.forEach(async (locale) => {
      const xliffFile = path.join(options.source, `messages.${locale}.xlf`);
      const jsonFile = path.join(
        options.destination,
        `messages.${locale}.json`
      );

      if (existsSync(xliffFile)) {
        const xliff = readFileSync(xliffFile, "utf8");
        const js = await xliffToJson(xliff);
        writeFileSync(jsonFile, JSON.stringify(js));
      } else {
        context.logger.warn(`File ${xliffFile} is missing`);
      }
    });
  } catch (err) {
    context.logger.error("Failed to converts files.");
    return {
      success: false,
      error: (err as Error).message,
    };
  }
  context.reportStatus("Done.");
  return { success: true };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
async function xliffToJson(translations: any) {
  const parserResult = await xliff12ToJs(translations, {
    captureSpacesBetweenElements: true,
  });
  const xliffContent = parserResult.resources["ng2.template"];

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  return Object.keys(xliffContent).reduce((result: any, current) => {
    const translation = xliffContent[current].target;
    if (typeof translation === "string") {
      result[current] = translation;
    } else if (Array.isArray(translation)) {
      result[current] = translation
        .map((entry) =>
          typeof entry === "string" ? entry : `{{${entry.Standalone.id}}}`
        )
        .map((entry) => entry.replace("{{", "{$").replace("}}", "}"))
        .join("");
    } else {
      throw new Error("Could not parse XLIFF: " + JSON.stringify(translation));
    }
    return result;
  }, {});
}
