/**
 * 빌드 후 JS·CSS 의 gzip 압축본(.gz)을 미리 만듦 — npm run build 의 postbuild 단계
 *   공유호스팅에서 서버 압축(mod_deflate)을 켤 수 없어도, root/.htaccess 가 브라우저가 gzip 을 받을 수 있을 때 .gz 파일을 대신 제공
 */
const fs = require('fs');
const path = require('path');
const zlib = require('zlib');
const { BUILD_DIR } = require('./site-url');

const STATIC_DIR = path.join(BUILD_DIR, 'static');
const COMPRESS_PATTERN = /\.(js|css)$/;
// 이보다 작은 파일은 압축 이득이 적어 그대로 둠
const MIN_BYTES = 1024;

function listFiles(dir) {
    return fs.readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
        const fullPath = path.join(dir, entry.name);
        return entry.isDirectory() ? listFiles(fullPath) : [fullPath];
    });
}

function main() {
    const targets = listFiles(STATIC_DIR).filter((file) => COMPRESS_PATTERN.test(file) && fs.statSync(file).size >= MIN_BYTES);
    let before = 0;
    let after = 0;
    targets.forEach((file) => {
        const source = fs.readFileSync(file);
        const compressed = zlib.gzipSync(source, { level: zlib.constants.Z_BEST_COMPRESSION });
        fs.writeFileSync(`${file}.gz`, compressed);
        before += source.length;
        after += compressed.length;
    });
    console.log(`[compress] ${targets.length}개 파일 gzip (${Math.round(before / 1024)}KB → ${Math.round(after / 1024)}KB)`);
}

main();
