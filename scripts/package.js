import { join, relative, resolve } from "node:path";
import { createWriteStream } from "node:fs";
import archiver from "archiver";

const rootDir = resolve(import.meta.dirname, '..');
const distDir = resolve(rootDir, "dist");
const zipFile = join(rootDir, "dist.zip");

const output = createWriteStream(zipFile);
const archive = archiver("zip", { zlib: { level: 9 } });

archive.pipe(output);
archive.directory(distDir, false);
await archive.finalize();

console.log(`${relative(rootDir, zipFile)} created`)
console.log(`${archive.pointer()} / ${13*1024} total bytes`);