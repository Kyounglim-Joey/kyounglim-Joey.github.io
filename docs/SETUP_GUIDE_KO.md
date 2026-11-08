# 배포 & Analytics 설정 가이드 (처음 하는 사람 기준)

목표 주소: **https://kyounglim-joey.github.io**
(GitHub는 사용자 이름을 소문자로 바꿔서 주소를 만듭니다. `Kyounglim-Joey.github.io`로 입력해도 같은 사이트로 연결됩니다.)

---

## 0. 준비물

| 항목 | 확인 방법 |
|---|---|
| GitHub 계정 `Kyounglim-Joey` | 로그인 가능 여부 |
| Node.js 20 이상 (로컬 미리보기용, 선택) | 터미널에서 `node -v` |
| Git | `git --version` |

> 로컬 미리보기를 건너뛰고 GitHub 웹 화면만으로도 배포할 수 있습니다(2-B 참고).

---

## 1. 로컬에서 미리보기 (선택)

```bash
unzip kyounglim-joey.github.io.zip
cd kyounglim-joey.github.io
npm ci
npm run dev        # 브라우저에서 http://localhost:4321
```

로컬에서는 Analytics가 동작하지 않습니다. Website ID가 없으면 추적 스크립트가 아예 삽입되지 않고, 설정하더라도 `data-domains`가 `kyounglim-joey.github.io`로 제한되어 있기 때문입니다. 테스트 방문이 통계에 섞이지 않게 하려는 의도입니다.

---

## 2. GitHub 저장소 만들기

### 2-A. 터미널 사용 (권장)

1. GitHub → 오른쪽 위 **+** → **New repository**
2. Repository name: **`Kyounglim-Joey.github.io`** (이 이름이어야 루트 주소로 배포됩니다)
3. **Public** 선택. README 등은 추가하지 않고 **Create repository**를 누릅니다.
4. 압축을 푼 폴더에서 아래를 실행합니다.

```bash
git init
git add .
git commit -m "Initial portfolio site"
git branch -M main
git remote add origin https://github.com/Kyounglim-Joey/Kyounglim-Joey.github.io.git
git push -u origin main
```

> 같은 이름의 저장소가 이미 있다면, 기존 내용을 백업한 뒤 덮어쓰거나 내용을 정리하고 push 하세요.

### 2-B. 웹 화면만 사용

저장소 페이지에서 **Add file → Upload files**를 누르고, 압축을 푼 폴더 **안의 내용 전체**를 끌어다 놓은 뒤 Commit 합니다.
`.github` 폴더처럼 숨김 폴더가 함께 올라갔는지 반드시 확인하세요. 이 폴더가 빠지면 자동 배포가 동작하지 않습니다.
`node_modules`, `dist`는 올리지 마세요.

---

## 3. GitHub Pages 활성화

1. 저장소 → **Settings → Pages**
2. **Build and deployment → Source**에서 **GitHub Actions**를 선택합니다. "Deploy from a branch"가 아닙니다.
3. **Actions** 탭에서 "Deploy to GitHub Pages" 워크플로가 실행되는지 확인합니다. 초록색 체크가 나오면 완료입니다(보통 1~2분).
   - 실행되지 않았다면 Actions 탭 → 워크플로 선택 → **Run workflow**를 누릅니다.
4. **Settings → Pages**에 표시되는 주소로 접속합니다.
5. **HTTPS:** `*.github.io` 주소는 HTTPS가 자동으로 적용됩니다. 같은 화면의 **Enforce HTTPS**가 체크되어 있는지 확인하세요.

이 단계까지 끝나면 사이트는 공개되지만, Analytics는 아직 꺼진 상태입니다.

---

## 4. Analytics(Umami Cloud) 연결

### 4-1. 계정과 웹사이트 등록

1. <https://cloud.umami.is>에서 회원가입합니다. 무료 **Hobby** 플랜이면 충분합니다.
2. **Add website**를 누르고 다음과 같이 입력합니다.
   - Name: `Portfolio`
   - Domain: `kyounglim-joey.github.io`
3. 등록한 웹사이트의 **Edit / Settings → Tracking code**에서 `data-website-id="xxxxxxxx-xxxx-..."` 값을 복사합니다.
   → 이 값이 **Website ID**입니다.

> Website ID는 비밀번호가 아닙니다. 모든 페이지 HTML에 공개적으로 들어가는 식별자입니다.
> 반면 **API Key, 비밀번호, Share URL은 저장소에 절대 넣지 마세요.**

### 4-2. GitHub에 Website ID 입력 — 직접 입력할 값은 이것 하나입니다

1. 저장소 → **Settings → Secrets and variables → Actions**
2. **Variables** 탭(Secrets 탭이 아닙니다) → **New repository variable**
   - Name: **`UMAMI_WEBSITE_ID`**
   - Value: 4-1에서 복사한 ID
3. **Actions** 탭 → 최근 워크플로 → **Re-run all jobs** (또는 아무 변경이나 push)

### 4-3. 내 방문 제외하기 (테스트 트래픽 분리)

본인이 사용하는 각 브라우저에서 사이트를 연 뒤 아래 중 하나를 실행합니다.
- 사이트 하단 **Privacy** → "Do not measure my visits on this site"를 체크합니다. 가장 쉬운 방법입니다.
- 또는 개발자도구 콘솔에서 `localStorage.setItem('umami.disabled', 1)`을 실행합니다.

휴대폰 브라우저에서도 같은 방법으로 설정하세요.

### 4-4. 정상 동작 확인

1. 내 방문 제외 설정을 하지 않은 시크릿 창이나 다른 기기에서 사이트를 열고 몇 페이지를 이동합니다. CV 다운로드와 GitHub 링크도 눌러 봅니다.
2. Umami 대시보드 → 웹사이트 → **Realtime**에서 방문이 보이는지 확인합니다.
3. **Events**에 `cv_download`, `github_profile_click`, `page_engagement` 등이 나타나는지 확인합니다.
4. 기록이 보이지 않으면 아래를 순서대로 확인합니다.
   - 브라우저 광고 차단기를 끄고 다시 테스트합니다. 차단기가 Umami를 막는 경우가 많고, 실제 방문자 중 일부도 같은 이유로 집계되지 않습니다.
   - 개발자도구 → Console에 **CSP** 오류가 있는지 확인합니다. Umami 전송 도메인이 바뀌었다면 `src/layouts/Base.astro`의 `connect-src`에 해당 도메인을 추가합니다.
   - 페이지 소스(Ctrl+U)에 `cloud.umami.is/script.js`가 있는지 확인합니다. 없다면 4-2의 변수명 오타이거나, 변수 입력 후 재배포를 하지 않은 경우입니다.

---

## 5. 대시보드 사용법

Umami Cloud에 로그인해야만 볼 수 있습니다. **Share URL(공개 공유 링크) 기능은 켜지 마세요.** 켜면 누구나 통계를 볼 수 있습니다.

| 보고 싶은 것 | 위치 |
|---|---|
| 방문자 / 방문 / 페이지뷰 / 이탈률 / 평균 방문 시간 | 웹사이트 첫 화면 상단 지표 |
| 기간 필터 (오늘, 7일, 30일, 90일, 사용자 지정) | 오른쪽 위 날짜 선택 |
| 일/주/월 추이 | 메인 그래프 (기간에 따라 단위 자동 변경) |
| 유입 경로, Referrer 도메인 | Referrers / Sources 패널 |
| 국가 / 지역 | Countries / Regions 패널, Location |
| 기기 / 브라우저 / OS | Devices, Browsers, OS 패널 |
| 많이 본 페이지, 진입·종료 페이지 | Pages 패널 (Entry / Exit 탭) |
| CV 다운로드, GitHub·LinkedIn 클릭 등 | Events 패널 → 이벤트 이름 클릭 → 속성(property)별 분포 |
| 프로젝트별 조회 | Events → `project_view` → 속성 `project` |
| 페이지별 참여 시간 | Events → `page_engagement` → `engaged_bucket`, `engaged_s` (페이지 필터와 함께 사용) |
| 페이지 이동 흐름 | Reports → **Journey** |
| CV 다운로드 전 경로 | Reports → **Funnel** 또는 Journey (`cv_download` 이벤트를 단계로 사용) |

5가지 핵심 질문을 확인하는 구체적인 방법은 `docs/ANALYTICS_KO.md` 4장에 있습니다.

> 메뉴 이름은 Umami 업데이트에 따라 조금씩 바뀔 수 있습니다. Reports 기능 중 일부는 플랜에 따라 제한될 수 있습니다.

---

## 6. 배포 이후 업데이트

1. `src/data/content.ts`(텍스트) 또는 `public/cv/...pdf`(CV)를 수정합니다.
2. `git add . && git commit -m "Update content" && git push`를 실행합니다.
3. 1~2분 후 자동으로 반영됩니다. Actions 탭에서 진행 상황을 확인할 수 있습니다.

자세한 수정 방법은 `docs/MAINTENANCE_KO.md`를 참고하세요.

---

## 7. 배포 후 점검 체크리스트

- [ ] 메뉴 7개와 프로젝트 상세 3개 페이지가 정상적으로 열린다
- [ ] CV PDF가 다운로드된다 (전화번호가 없는 웹용 버전)
- [ ] GitHub 링크와 각 프로젝트 저장소 링크가 열린다
- [ ] 휴대폰에서 메뉴 버튼과 다크모드가 동작한다
- [ ] Umami Realtime에 방문이 잡힌다 (광고 차단기를 끈 다른 기기에서 확인)
- [ ] Events에 `cv_download`, `project_view`, `page_engagement`가 보인다
- [ ] 내 브라우저에서는 opt-out 설정이 되어 있다
- [ ] Umami Share URL이 꺼져 있다
