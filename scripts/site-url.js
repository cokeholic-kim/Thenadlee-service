/**
 * 빌드 스크립트 공용: 사이트 주소(REACT_APP_SITE_URL)와 빌드 폴더 경로
 */
const fs = require('fs');
const path = require('path');

const ROOT_DIR = path.resolve(__dirname, '..');
const BUILD_DIR = path.join(ROOT_DIR, 'build');
// CRA 운영 빌드와 같은 우선순위 (index.html 의 %REACT_APP_SITE_URL% 과 같은 값이 되도록)
const ENV_FILES = ['.env.production.local', '.env.local', '.env.production', '.env'];
const SITE_URL_KEY = 'REACT_APP_SITE_URL';

function readEnvValue(filePath, key) {
    if (!fs.existsSync(filePath)) return '';
    const line = fs.readFileSync(filePath, 'utf8').split(/\r?\n/).find((row) => row.startsWith(`${key}=`));
    return line ? line.slice(key.length + 1).trim() : '';
}

function resolveSiteUrl() {
    const fromEnv = process.env[SITE_URL_KEY];
    const fromFile = ENV_FILES.map((file) => readEnvValue(path.join(ROOT_DIR, file), SITE_URL_KEY)).find(Boolean);
    const siteUrl = (fromEnv || fromFile || '').replace(/\/+$/, '');
    if (!siteUrl) {
        throw new Error(`${SITE_URL_KEY} 가 설정되지 않아 robots.txt / sitemap.xml 을 만들 수 없습니다.`);
    }
    return siteUrl;
}

module.exports = { ROOT_DIR, BUILD_DIR, resolveSiteUrl };
