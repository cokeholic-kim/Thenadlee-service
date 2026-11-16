# 🖥️ 프로젝트 소개
React를 활용한 웹사이트 만들기(여행 커뮤니티) 더 나들이
<br>

## 🚀 배포 (공유호스팅 · FTP)

| 저장소 경로 | 서버 경로 | 내용 |
|---|---|---|
| `root/.htaccess` | `html/` | 도메인 루트 접속 시 `html/front/` 의 React 앱 제공 |
| `build/` (빌드 결과) | `html/front/` | React 앱 |
| `file/` | `html/file/` | 이미지·영상 정적 파일 |
| (별도 private 저장소) | `html/back/` | PHP API |

접속 주소는 도메인 그대로입니다 (예: `https://도메인/`, `https://도메인/map/Jeju`).
파일은 `html/front/` 에 있지만 주소창에는 `/front` 가 나타나지 않으며, `/front/...` 로 접속하면 루트 주소로 이동합니다.

`main` 브랜치에 push 하면 `.github/workflows/deploy.yml` 이 React 빌드 후 FTP 로 업로드합니다.

### GitHub 설정 (Settings → Secrets and variables → Actions, Environment: `production`)

**Secrets**

| 이름 | 설명 |
|---|---|
| `FTP_SERVER` / `FTP_USERNAME` / `FTP_PASSWORD` | FTP 접속 정보 |

**Variables**

| 이름 | 기본값 | 설명 |
|---|---|---|
| `DEPLOY_ENABLED` | (없음) | `true` 로 설정해야 FTP 업로드 실행 |
| `FTP_BASE_DIR` | `html/` | FTP 접속 후 웹 루트 경로 |
| `FTP_PROTOCOL` / `FTP_PORT` | `ftp` / `21` | FTPS 지원 시 `ftps` 권장 |

### 프론트 환경변수 (`.env.production`)

API 키와 경로는 저장소의 `.env.production` 파일에 넣으며, 빌드 시 이 값이 사용됩니다.

| 이름 | 기본값 | 발급처 |
|---|---|---|
| `REACT_APP_API_URL` / `REACT_APP_FILE_URL` | `/back` / `/file` | |
| `REACT_APP_GOOGLE_API_KEY` | | Google Cloud Console → API 및 서비스 → 사용자 인증 정보 |
| `REACT_APP_WHEATHER_API_KEY` | | https://home.openweathermap.org/api_keys |
| `REACT_APP_WHEATHER_BASE_URL` | `https://api.openweathermap.org/data/2.5/` | |

> `REACT_APP_` 값은 빌드된 JS 에 포함되어 브라우저에서 누구나 볼 수 있습니다.
> 이 저장소는 public 이므로 Google Maps 키에는 반드시 배포 도메인 HTTP referrer 제한을 걸어주세요.

### 로컬 개발

```bash
cp .env.example .env.local
npm install
npm start
```

## 🕰️ 개발 기간
* 23.02.01 - 23.02.14

## 🧑‍🤝‍🧑 맴버구성
 - 김동현: 여행지 , 여행스팟 NodeJs API 서버 개발, 지도페이지 컴포넌트 개발
 - 고요한: 구글 API연동 , API를 이용한 기능 개발.
 - 김민준: 회원가입, 로그인, 로그아웃, 아이디 찾기, 비밀번호 찾기, 비밀번호 변경
 - 김별: 메인페이지, 이용방법 페이지, 전체적인 css 확인, DB관리

### ⚙️ 사용한 스킬
Html, Css, Sass, JavaScript, React.js, Redux, MySQL, Node.Js

## 📌 주요 기능

#### 추천 여행지 조회
- 각 도시별 추천 여행지 조회
- 추천 여행지를 추가하여 왼쪽의 일정페이지에 추가할수있다.
- 일정을 추가하면 해당 여행지가 지도위에 마커로 표시된다
- 지도위의 마커는 선으로 이어져서 동선을 파악하는데 도움을 줄수있다.
- 추가한 일정은 순서를 변경할수있고 변경한 순서대로 다시 선을 그려준다.

#### 월 정보조회
- 여행지 페이지로 이동시 오늘 날짜로 관광지의 정보를 조회할수있다.
- 캘린더를 조정하여 여행일정을 조정하면 조정한 날짜의 정보로 다시 조회된다.

#### 날씨 조회
- 오늘 날짜로 관광지의 날씨를 조회할수있다.
- OpenWeatherMap API 이용

#### 여행 포스팅 조회
- 여행지와 관련된 포스팅을 조회할수있다.
- 현재 페이지에서 이동없이 모달로 포스팅을 조회

#### 추천일정 조회
- 추천하는 일정을 조회할수있다 
- 해당 일정을 내 일정에 선택해서 추가할수있다
- 모두선택으로 해당일정을 모두 내 일정에 추가할수 있다.

#### 일정 생성
- 현재 추가해놓은 일정을 캡처해서 Png 파일로 저장할수 있다. 