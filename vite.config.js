import { readFileSync } from "node:fs";
import { defineConfig } from "vite";

const nginx = readFileSync(new URL("./nginx.conf", import.meta.url), "utf8");
const headers = Object.fromEntries(
  Array.from(
    nginx.matchAll(/^\s*add_header (\S+) "([^"]+)" always;$/gm),
    ([, name, value]) => [name, value],
  ),
);

const bundledFonts = [
  "@fontsource-variable/manrope",
  "@fontsource/instrument-serif",
  "@phosphor-icons/web",
];

export default defineConfig({
  root: "src",
  build: { outDir: "../dist", emptyOutDir: true, assetsInlineLimit: 0 },
  preview: { headers },
  plugins: [
    {
      name: "phosphor-woff2",
      enforce: "pre",
      transform(css, id) {
        if (
          !/\/node_modules\/@phosphor-icons\/web\/src\/[^/]+\/style\.css$/.test(
            id,
          )
        ) {
          return;
        }
        return css.replace(
          /src:\s*(url\([^)]+\.woff2[^)]*\) format\(["']woff2["']\))[^;]*;/,
          "src: $1;",
        );
      },
    },
    {
      name: "font-licenses",
      apply: "build",
      generateBundle() {
        const licenses = bundledFonts.map((pkg) => {
          const path = new URL(
            `./node_modules/${pkg}/LICENSE`,
            import.meta.url,
          );
          return `=== ${pkg} ===\n${readFileSync(path, "utf8").trim()}`;
        });
        this.emitFile({
          type: "asset",
          fileName: "third-party-licenses.txt",
          source: licenses.join("\n\n") + "\n",
        });
      },
    },
  ],
});
