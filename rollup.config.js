import htmlBundle from "rollup-plugin-html-bundle";
import livereload from "rollup-plugin-livereload";
import nodeResolve from "@rollup/plugin-node-resolve";
import serve from "rollup-plugin-serve";
import styles from "rollup-styles";
import terser from "@rollup/plugin-terser";
import copy from "rollup-plugin-copy";
import typescript from "@rollup/plugin-typescript";
import svg from "rollup-plugin-svg-import";
import dotenv from "rollup-plugin-dotenv";

const production = !process.env.ROLLUP_WATCH;
const poki = process.env.NODE_ENV === "poki";
const outputDir = production ? "dist" : "out";

export default {
  input: "src/index.ts",
  output: {
    file: `${outputDir}/game.js`,
    name: "FindX",
    format: "iife",
  },
  plugins: [
    dotenv(),
    svg(),
    typescript(),
    nodeResolve(),
    styles({
      minimize: production,
    }),
    production &&
      !poki &&
      terser({
        mangle: {
          properties: {
            keep_quoted: true,
          },
        },
        compress: {
          booleans_as_integers: true,
          drop_console: true,
        },
      }),
    htmlBundle({
      template: "src/index.html",
      target: `${outputDir}/index.html`,
    }),
    copy({
      targets: [{ src: "src/manifest.json", dest: `${outputDir}` }],
    }),
    !production && serve({ contentBase: outputDir, open: true }),
    !production && livereload(outputDir),
  ],
  watch: {
    exclude: ["node_modules/**"],
  },
};
