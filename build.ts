await Bun.build({
    entrypoints: ["./src/index.ts"],
    outdir: "./build",
});

for (const file of ["index.html", "styles.css", "cat_names.txt"]) {
    await Bun.write("./build/" + file, Bun.file("./" + file))
}
const BASE_PATH = "./build";
Bun.serve({
    port: 3000,
    async fetch(req) {
        const pathname = new URL(req.url).pathname;
        const filePath = BASE_PATH + (pathname === "/" ? "/index.html" : pathname);
        const file = Bun.file(filePath);
        return new Response(file);
    },
    error() {
        return new Response(null, { status: 404 });
    },
});
console.log("Listening on port 3000!")