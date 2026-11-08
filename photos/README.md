# photos/ — local gallery fallback

Google Drive 연동을 쓰지 않거나 설정 전이라면, 여기에 JPG/PNG/WebP 사진을 넣고 push 하세요.
- 파일명 순서대로 표시됩니다 (예: `01_conference.jpg`, `02_team.jpg`).
- 캡션: 같은 폴더의 `captions.json` 에 `{ "01_conference.jpg": "At a security meetup" }` 형식으로 작성.
- 빌드 시 자동으로 리사이즈되고 EXIF(GPS 위치 포함)가 제거된 사본만 공개됩니다. 원본은 저장소에 남으니,
  원본 자체를 공개하고 싶지 않다면 이 폴더 대신 Google Drive 연동을 사용하세요.
- Drive 연동이 설정되어 있으면 이 폴더는 무시됩니다.
