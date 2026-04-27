# 배포 가이드

`react-ssutil`을 npm에 배포하는 방법을 정리한 문서입니다.
단순 패키지로 올리는 방법과 npm Organization 스코프로 올리는 방법 두 가지를 다룹니다.

---

## Option A — 단순 패키지 (`react-ssutil`)

org 없이 올리는 가장 간단한 방법입니다. 현재 설정 그대로 사용합니다.

```bash
# 사용자는 이렇게 설치합니다
npm install react-ssutil
```

### 배포 순서

**1. npm 계정 생성**

[npmjs.com/signup](https://www.npmjs.com/signup) 에서 계정을 만듭니다.

**2. CLI 로그인**

```bash
npm login
# username, password, email 입력
# 2FA 설정되어 있으면 OTP 추가 입력
```

**3. 패키지 이름 중복 확인**

```bash
npm view react-ssutil
# "npm error code E404" 가 뜨면 사용 가능한 이름
```

**4. 버전 올리기**

```bash
pnpm version patch   # 0.0.1 → 0.0.2  (버그 수정)
pnpm version minor   # 0.0.1 → 0.1.0  (기능 추가)
pnpm version major   # 0.0.1 → 1.0.0  (Breaking Change)
```

> `package.json` 버전이 자동으로 바뀌고 git tag도 같이 생성됩니다.

**5. 배포**

```bash
pnpm publish
# 최초 배포이거나 public 패키지라면 아래 명령어 사용
pnpm publish --access public
```

---

## Option B — npm Organization 스코프 (`@react-ssutil/hooks`)

`@react-ssutil` org 아래에 패키지를 올리는 방법입니다.

```bash
# 사용자는 이렇게 설치합니다
npm install @react-ssutil/hooks
```

### 배포 순서

**1. npm org 생성**

[npmjs.com/org/create](https://www.npmjs.com/org/create) 에서 org를 만듭니다.

- Org 이름: `react-ssutil`
- 플랜: **Free** (public 패키지 무제한)

**2. `package.json` 이름 변경**

```diff
- "name": "react-ssutil",
+ "name": "@react-ssutil/hooks",
```

**3. playground 의존성 변경**

```diff
// playground/package.json
- "react-ssutil": "workspace:*"
+ "@react-ssutil/hooks": "workspace:*"
```

**4. playground import 변경**

```diff
// playground/src/App.tsx
- } from "react-ssutil";
+ } from "@react-ssutil/hooks";
```

**5. 버전 올리고 배포**

스코프 패키지는 반드시 `--access public` 플래그가 필요합니다.

```bash
pnpm version patch
pnpm publish --access public
```

---

## GitHub Actions 자동 배포

`.github/workflows/publish.yml`이 이미 세팅되어 있습니다.
**GitHub Release를 생성하면 자동으로 npm에 배포**됩니다.

### 최초 설정 (1회)

**1. npm 토큰 발급**

```bash
npm token create --type=automation
# npm_xxxxxxxx... 형태의 토큰이 발급됩니다
```

**2. GitHub에 토큰 등록**

```
GitHub 레포 → Settings → Secrets and variables → Actions
→ New repository secret
  Name:  NPM_TOKEN
  Value: npm_xxxxxxxxxxxxxxxx
```

### 배포 흐름

```
1. package.json 버전 올리기
2. git add . && git commit -m "chore: release v0.1.0"
3. git tag v0.1.0 && git push origin main --tags
4. GitHub → Releases → Draft a new release → 태그 선택 → Publish release
   └─ publish.yml 자동 실행
      ├─ pnpm lint  (타입 체크)
      ├─ pnpm test  (테스트)
      ├─ pnpm build (빌드)
      └─ pnpm publish --access public (배포)
```

---

## 명령어 레퍼런스

| 명령어                             | 설명                                        |
| ---------------------------------- | ------------------------------------------- |
| `npm login`                        | npm 로그인                                  |
| `npm whoami`                       | 현재 로그인된 계정 확인                     |
| `npm view react-ssutil`            | 패키지 이름 사용 가능 여부 확인             |
| `pnpm version patch`               | 패치 버전 올리기                            |
| `pnpm publish --access public`     | 배포 (public 패키지 필수 플래그)            |
| `npm unpublish react-ssutil@0.0.1` | 특정 버전 삭제 (배포 후 72시간 이내만 가능) |

---

## 배포 전 체크리스트

- [ ] `pnpm test` 통과
- [ ] `pnpm lint` 통과
- [ ] `pnpm build` 에러 없이 `dist/` 생성
- [ ] `package.json` 버전 업
- [ ] `README.md` 최신 상태
