# Changelog

## [0.4.0](https://github.com/pilotariak/kancha/compare/kancha-v0.3.0...kancha-v0.4.0) (2026-08-18)

### 🚀 Features

- **cicd:** migrate to EAS Workflows and improve eas.json ([#21](https://github.com/pilotariak/kancha/issues/21)) ([6c037d4](https://github.com/pilotariak/kancha/commit/6c037d4318546267161afc1cbf404c2589bbb0c6))
- **i18n:** add internationalization support with language picker ([#20](https://github.com/pilotariak/kancha/issues/20)) ([4357c8d](https://github.com/pilotariak/kancha/commit/4357c8da27d716388cc57a812df835fadd6e7628))
- **league:** add multi-league support with league picker ([#19](https://github.com/pilotariak/kancha/issues/19)) ([53d4bb2](https://github.com/pilotariak/kancha/commit/53d4bb2044a9faa3eb6e09502bec5dda84a358d7))
- **ui:** add bracket view, score bar, stats strip, and win screen ([#29](https://github.com/pilotariak/kancha/issues/29)) ([fa0ce44](https://github.com/pilotariak/kancha/commit/fa0ce4438e3d5fae41872f0630f8c20fbe4f5bb0))
- **ui:** add score tab with match scoreboard screen ([#25](https://github.com/pilotariak/kancha/issues/25)) ([b5da3ac](https://github.com/pilotariak/kancha/commit/b5da3ac83a495a5819f0487c28cb25569dbed026))
- **ui:** extract KanchaLogo component and improve launch screen ([#27](https://github.com/pilotariak/kancha/issues/27)) ([5f9324b](https://github.com/pilotariak/kancha/commit/5f9324bcb55033d91f1217bb7ee0a87398b88243))

### 🐛 Bug Fixes

- **cicd:** add --project-name flag to cf-deploy-web target ([230f2c8](https://github.com/pilotariak/kancha/commit/230f2c8ebcc17678e74d8470c83574b2a3772af5))
- **ci:** Setup Bun using Github Action ([#35](https://github.com/pilotariak/kancha/issues/35)) ([da9ef20](https://github.com/pilotariak/kancha/commit/da9ef2008c67fa7e5c28249b784ad52cbe686fe8))
- **config:** use environment-specific API URLs for web builds ([#23](https://github.com/pilotariak/kancha/issues/23)) ([9346d12](https://github.com/pilotariak/kancha/commit/9346d12e1a8429f4f3cd6172d508687d9ff63cc4))
- **ui:** allow team names to wrap on multiple lines ([#28](https://github.com/pilotariak/kancha/issues/28)) ([88e51df](https://github.com/pilotariak/kancha/commit/88e51df9cca16452ba61d191b505d272588f47d6))
- **ui:** enforce design system conformance across screens ([#24](https://github.com/pilotariak/kancha/issues/24)) ([ecd5cbc](https://github.com/pilotariak/kancha/commit/ecd5cbc881cb050a392b3ea7493b7191097cb015))

### 🚨 Maintenance

- **config:** replace app.json with dynamic app.config.js ([#18](https://github.com/pilotariak/kancha/issues/18)) ([f157bbc](https://github.com/pilotariak/kancha/commit/f157bbcd13de391ffb7ec93ecff167b5ef7a4129))
- **release-please:** bump to v5.0.0 ([#26](https://github.com/pilotariak/kancha/issues/26)) ([3261db7](https://github.com/pilotariak/kancha/commit/3261db7b849a8d70a58dac69ea12d6a999e4f9a8))

### 📚 Documentation

- add AGENTS.md for AI agent context ([#33](https://github.com/pilotariak/kancha/issues/33)) ([36c9420](https://github.com/pilotariak/kancha/commit/36c9420f9b7c869c5f0017198d244d833a14905f))
- **docs:** add README and Diataxis documentation structure ([#30](https://github.com/pilotariak/kancha/issues/30)) ([40ac747](https://github.com/pilotariak/kancha/commit/40ac747671bfd8c8e8d9cfd8cd13c7dfa22cfbe1))

## [0.3.0](https://github.com/pilotariak/kancha/compare/kancha-v0.2.0...kancha-v0.3.0) (2026-04-16)

### 🚀 Features

- **app:** add graphql data layer, clubs/specialties, and landing theme ([#5](https://github.com/pilotariak/kancha/issues/5)) ([f3f11ad](https://github.com/pilotariak/kancha/commit/f3f11add393f779927abdc46ec839247c38d99b8))
- **app:** simplify navigation to tournament-specialty-category funnel ([#6](https://github.com/pilotariak/kancha/issues/6)) ([10ac56c](https://github.com/pilotariak/kancha/commit/10ac56cfdd0c86e0b258845638cb974bc5db5f85))
- bootstrap expo mobile app ([#3](https://github.com/pilotariak/kancha/issues/3)) ([97f6d51](https://github.com/pilotariak/kancha/commit/97f6d51357cbbcaf2c0347826b5ceca24467338d))
- bootstrap open source project structure ([#1](https://github.com/pilotariak/kancha/issues/1)) ([a11987b](https://github.com/pilotariak/kancha/commit/a11987bf94fec7f0b12249345050161ededf65c0))
- **competitions:** add tournament navigation funnel and bracket view ([6d97c2a](https://github.com/pilotariak/kancha/commit/6d97c2a4ab49129739821419e415bec5908ed4de))
- **competitions:** add tournament navigation funnel and bracket view ([#13](https://github.com/pilotariak/kancha/issues/13)) ([6d97c2a](https://github.com/pilotariak/kancha/commit/6d97c2a4ab49129739821419e415bec5908ed4de))
- **tournaments:** add results screen with match filters ([#4](https://github.com/pilotariak/kancha/issues/4)) ([0a25767](https://github.com/pilotariak/kancha/commit/0a25767b125e4ff60c6ef1a6c2329dae0daf7a91))
- **ui:** overhaul UI with phase grouping, animated splash, and redesigned cards ([#11](https://github.com/pilotariak/kancha/issues/11)) ([fa6cac4](https://github.com/pilotariak/kancha/commit/fa6cac41ceb195350dfc7ebde4c4b51c17202613))

### 🐛 Bug Fixes

- **config:** bump app.json version to match package.json ([#15](https://github.com/pilotariak/kancha/issues/15)) ([c1403b6](https://github.com/pilotariak/kancha/commit/c1403b669f9a468c5170306e819b768bf11838f4))

### 🚨 Maintenance

- **app:** remove dead tabs, landing pages, and mocks ([#14](https://github.com/pilotariak/kancha/issues/14)) ([83fef58](https://github.com/pilotariak/kancha/commit/83fef58f0b9e92523557b05a95ffa2c7a9dcdba2))
- initialize repository ([e3c3ce9](https://github.com/pilotariak/kancha/commit/e3c3ce925a4f8989cbebf5c545515ca34c322c5d))
- **main:** release 0.2.0 ([#2](https://github.com/pilotariak/kancha/issues/2)) ([822e075](https://github.com/pilotariak/kancha/commit/822e075d5dade6bea457b19dc0f1e8132be26b41))
- release please ([457abae](https://github.com/pilotariak/kancha/commit/457abae702233d963ab410c8319786a24dc7f7e4))

## [0.2.0](https://github.com/pilotariak/kancha/compare/v0.1.0...v0.2.0) (2026-03-19)

### 🚀 Features

- **app:** add graphql data layer, clubs/specialties, and landing theme ([#5](https://github.com/pilotariak/kancha/issues/5)) ([f3f11ad](https://github.com/pilotariak/kancha/commit/f3f11add393f779927abdc46ec839247c38d99b8))
- **app:** simplify navigation to tournament-specialty-category funnel ([#6](https://github.com/pilotariak/kancha/issues/6)) ([10ac56c](https://github.com/pilotariak/kancha/commit/10ac56cfdd0c86e0b258845638cb974bc5db5f85))
- bootstrap expo mobile app ([#3](https://github.com/pilotariak/kancha/issues/3)) ([97f6d51](https://github.com/pilotariak/kancha/commit/97f6d51357cbbcaf2c0347826b5ceca24467338d))
- bootstrap open source project structure ([#1](https://github.com/pilotariak/kancha/issues/1)) ([a11987b](https://github.com/pilotariak/kancha/commit/a11987bf94fec7f0b12249345050161ededf65c0))
- **tournaments:** add results screen with match filters ([#4](https://github.com/pilotariak/kancha/issues/4)) ([0a25767](https://github.com/pilotariak/kancha/commit/0a25767b125e4ff60c6ef1a6c2329dae0daf7a91))

### 🚨 Maintenance

- initialize repository ([e3c3ce9](https://github.com/pilotariak/kancha/commit/e3c3ce925a4f8989cbebf5c545515ca34c322c5d))
