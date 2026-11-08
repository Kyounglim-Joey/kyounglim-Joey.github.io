# photos/ — 내 PC에서 미리보기 전용 폴더

이 폴더의 사진은 `.gitignore`로 제외되어 **GitHub에 올라가지 않습니다** (이 README만 올라감).
`npm run dev` / `npm run build` 할 때 내 PC에서만 사이트에 반영되어 모양을 확인할 수 있습니다.

- `profile.jpg` (또는 .png/.webp) → 왼쪽 프로필 사진 (자동으로 정사각형 600×600)
- 그 밖의 JPG/PNG/WebP → About 페이지 갤러리, 파일명 순서 (예: `01_conference.jpg`)
- 캡션(선택): `captions.json` → `{ "01_conference.jpg": "At a security meetup" }`
- 공개 사이트에 반영하려면 같은 사진을 Google Drive 폴더에 올리세요 → `docs/GALLERY_DRIVE_KO.md`
- 처리 과정에서 크기 축소 + EXIF(GPS 위치 등) 제거된 사본만 사용됩니다.
