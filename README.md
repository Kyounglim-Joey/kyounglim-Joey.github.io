# kyounglim-joey.github.io

Academic & technical portfolio of **Kyounglim Cho** — Astro static site on GitHub Pages, with privacy-first analytics (Umami Cloud).

## Quick start

```bash
npm ci            # install (Node 20+; CI uses Node 22)
npm run dev       # http://localhost:4321  (analytics off locally)
npm run build     # static output in dist/
npm run preview   # serve dist/
```

Push to `main` → GitHub Actions builds and deploys to <https://kyounglim-joey.github.io>.

## Structure

```
src/
  config/site.ts        ← name, links (LinkedIn), analytics settings (env-driven)
  data/content.ts       ← ALL text: experience, projects, education, awards, skills
  layouts/Base.astro    ← <head>, SEO/Open Graph, CSP, header/footer
  components/           ← Header, Footer, ProfileCard (left sidebar), ProjectCard, Gallery, Analytics loader
  pages/                ← one file per page; projects/[slug].astro = case studies
  styles/global.css     ← design tokens (light/dark), layout, components
public/
  cv/Kyounglim_Cho_CV.pdf   ← web version of the CV (no phone number)
  images/projects/          ← figures from the project repositories
  images/profile.jpg        ← sidebar portrait (add your own; monogram shown if missing)
  js/theme-init.js, site.js ← theme + menu (no tracking)
  js/umami-guard.js         ← privacy filter applied to every analytics payload
  js/analytics.js           ← custom events, engagement time, scroll depth
  js/privacy.js             ← opt-out toggle on /privacy/
scripts/sync-photos.mjs     ← About-page gallery: Google Drive (or photos/) → resized, EXIF-stripped WebP
photos/                     ← optional local gallery source
tests/                      ← analytics tests against a local Umami stub
docs/                       ← Korean guides (setup, analytics, maintenance)
.github/workflows/deploy.yml
```

## Docs (Korean)

- `docs/SETUP_GUIDE_KO.md` — 저장소 생성 → Pages 배포 → Umami 연결 → 대시보드 사용
- `docs/ANALYTICS_KO.md` — 도구 비교, 이벤트 명세, 5가지 분석 질문별 확인 방법, 한계
- `docs/MAINTENANCE_KO.md` — 프로젝트/CV/수상/스킬 수정, 이벤트 추가, 재배포
- `docs/GALLERY_DRIVE_KO.md` — About 페이지 사진 갤러리 (Google Drive 연동)

## Analytics tests

```bash
PUBLIC_UMAMI_WEBSITE_ID=test-site PUBLIC_UMAMI_SCRIPT_URL=/js/umami-stub.js \
PUBLIC_UMAMI_DOMAINS=localhost npx astro build --outDir dist-test
cp tests/umami-stub.js dist-test/js/
(cd dist-test && python3 -m http.server 4322 &)
pip install playwright && python3 -m playwright install chromium   # first time only
python3 tests/analytics.test.py     # optional: CHROME=/path/to/chrome
```

## Credits

Page layout (sticky profile sidebar, card-based home) is inspired by [luost26/academic-homepage](https://github.com/luost26/academic-homepage) (MIT License). No code was copied; the structure was re-implemented in Astro.
