# 유지보수 가이드

모든 수정은 다음 순서로 진행합니다: **파일 수정 → `npm run dev`로 확인(선택) → commit & push → 1~2분 뒤 자동 반영**

---

## 1. 텍스트 수정 (가장 자주 하는 작업)

거의 모든 문구는 **`src/data/content.ts` 한 파일**에 있습니다.

| 바꾸려는 것 | content.ts에서 찾을 이름 |
|---|---|
| Research Interests | `researchInterests` |
| 경력 bullet | `experience` → `groups` → `items` |
| 학력 / 수강과목 | `degrees`, `creditCoursework`, `training` |
| 수상 | `awards` (`kind: 'external'` 또는 `'internal'`) |
| 스킬 | `skills` (각 그룹의 `items`와 `evidence`) |
| 자격증 | `certifications` (`date`가 비어 있으면 '—'로 표시) |
| 어학 | `languages` |

이름, 직함, 소개 문구, 링크는 **`src/config/site.ts`**에 있습니다.
- **LinkedIn:** `linkedin: ''` 안에 URL을 넣으면 사이트 전체에 LinkedIn 링크와 `linkedin_click` 추적이 자동으로 켜집니다.

`TODO(Zoey)` 주석이 붙은 곳은 공개 전에 확인이 필요한 항목입니다. VS Code에서 `TODO(Zoey)`로 전체 검색하세요.

---

## 1-1. 왼쪽 프로필 카드 (사진·링크)

| 항목 | 방법 |
|---|---|
| 프로필 사진 | 정사각형에 가까운 JPG(권장 600×600 이상)를 **`public/images/profile.jpg`** 로 저장. 파일이 없으면 "KC" 모노그램이 표시됨 |
| 사진 메타데이터 | 올리기 전에 위치정보(EXIF GPS)를 제거하세요. Windows: 파일 우클릭 → 속성 → 자세히 → "속성 및 개인 정보 제거" |
| LinkedIn | `src/config/site.ts` → `linkedin: 'https://www.linkedin.com/in/아이디/'` 입력 → 프로필 카드·푸터·CV 페이지에 아이콘이 자동으로 표시됨 |
| 이름·직함·한 줄 소개 | `src/config/site.ts` → `PROFILE`의 `nativeName`, `positions`, `tagline` |
| 홈 화면 Hana Bank 요약 6칸 | `src/data/content.ts` → `experienceHighlights` |

## 1-2. About 페이지 사진 갤러리
`docs/GALLERY_DRIVE_KO.md` 를 참고하세요.

## 2. 프로젝트 추가

1. `src/data/content.ts`의 `projects` 배열에 기존 항목을 복사해 붙여 넣고 내용을 수정합니다.
   - `slug`: 주소에 쓰이는 이름입니다 (예: `llm-prompt-injection` → `/projects/llm-prompt-injection/`).
   - `name`: Analytics에 기록되는 식별자입니다. 영문 소문자와 `_`만 쓰고, **공개한 뒤에는 바꾸지 마세요.** 바꾸면 통계가 끊깁니다.
   - `featured: true`는 한 프로젝트에만 지정합니다. 홈과 Projects 페이지 맨 위에 크게 표시됩니다.
   - `contributions`에는 본인 기여, `teamOutcomes`에는 팀 공동 성과를 나눠 적습니다.
2. 이미지는 `public/images/projects/`에 넣고 `figures`에 경로, 대체 텍스트(alt), 가로·세로 픽셀 크기를 적습니다.
3. 상세 페이지, 카드, 사이트맵, `project_view` 추적이 자동으로 생성됩니다.

---

## 3. CV 교체

1. Word에서 새 CV를 **PDF로 저장**합니다.
   - 웹 공개용이므로 **전화번호를 빼고**, 서버 대수·제품명 같은 내부 정보도 제외하세요.
2. 파일 이름을 **`Kyounglim_Cho_CV.pdf`** 그대로 유지해 `public/cv/`의 기존 파일을 덮어씁니다.
   - 이름을 바꾸려면 `src/config/site.ts`의 `cv` 경로도 함께 수정합니다.
3. PDF 속성(파일 → 속성)의 작성자·제목 메타데이터에 불필요한 정보가 없는지 확인합니다.

---

## 4. GitHub 저장소 연결

- 프로젝트의 `repo` 필드에 저장소 URL을 넣으면 상세 페이지 버튼과 Repository 섹션에 표시되고, 클릭이 `project_github_click`(project 속성 포함)으로 기록됩니다.
- 저장소 이름을 바꿨다면 `repo`도 함께 수정하세요. GitHub의 자동 리다이렉트에 의존하지 마세요.

---

## 5. Analytics 이벤트 추가

### 방법 A — 링크에 속성만 추가 (코드 수정 없음)

```html
<a href="/talks/" data-track="talk_click" data-loc="home">Talks</a>
```

이렇게 하면 클릭 시 `talk_click {location: 'home', page, device, ref_cat}`이 기록됩니다.

### 방법 B — 스크립트에서 직접 호출

```js
window.pfTrack('poster_view', { section: 'poster' });
```

### 주의

- 새 속성 이름을 쓰려면 `public/js/umami-guard.js`의 `ALLOWED_PROPS`에 추가해야 전송됩니다. 개인정보 보호를 위한 허용 목록 방식입니다.
- 이메일, 이름, 입력값처럼 사람을 식별할 수 있는 값은 절대 속성으로 보내지 마세요.
- 이벤트 이름은 50자 이내의 `snake_case`로 짓습니다.
- 추가한 뒤에는 `docs/ANALYTICS_KO.md` 2-2의 표도 업데이트하세요.

---

## 6. Dashboard 확인 루틴 (권장)

- **매주 (5분):** 기간을 "Last 7 days"로 놓고 방문 수, Referrers, `cv_download` 건수를 확인합니다.
- **매월 (15분):** "Last 30 days" 기준으로 ANALYTICS 문서 4장의 5가지 질문을 점검합니다.
  - 종료가 많은 페이지에는 다음 행동을 유도하는 링크를 보강합니다.
  - 체류가 짧은 프로젝트는 상단 요약을 개선합니다.
- **지원서 제출 직후:** 제출일 전후 1~2주를 비교합니다.
- Hobby 플랜은 데이터를 약 6개월 보관합니다. 필요하면 월별로 화면을 캡처하거나 CSV로 내보내 두세요.

---

## 7. 재배포와 문제 해결

| 상황 | 조치 |
|---|---|
| push 했는데 반영 안 됨 | Actions 탭에서 실패 로그를 확인합니다. 대부분 `content.ts`의 쉼표나 따옴표 오류입니다 |
| 로컬에서 미리 오류 확인 | `npm run build` (오류 줄 번호가 표시됨) |
| 수동 재배포 | Actions → Deploy to GitHub Pages → **Run workflow** |
| 이전 버전으로 되돌리기 | `git revert <commit>` 후 push |
| Analytics 끄기 | Variables에서 `UMAMI_WEBSITE_ID`를 삭제한 뒤 재배포합니다 (스크립트가 삽입되지 않음) |
| Astro 업데이트 | `npm update astro` → `npm run build` 확인 → push |
