# How to build and deploy Kancha with EAS

This guide covers building Kancha for distribution using Expo Application Services (EAS).

## Prerequisites

- EAS CLI authenticated: `make eas-login`
- Project configured: `make eas-configure`
- A committed working tree (`eas.json` enforces `requireCommit: true`)

## Build profiles

| Profile       | Purpose                        | Distribution |
| ------------- | ------------------------------ | ------------ |
| `development` | Dev client with debug tools    | Internal     |
| `preview`     | Internal QA build              | Internal     |
| `production`  | App Store / Play Store release | Public       |

## Build for iOS

```bash
PROFILE=development make eas-build-ios
# or
PROFILE=production make eas-build-ios
```

## Build for Android

```bash
PROFILE=development make eas-build-android
```

## Build for all platforms

```bash
PROFILE=preview make eas-build-all
```

## Export and deploy the web app

```bash
make eas-export-web   # produces dist/
make cf-deploy-web    # deploys to Cloudflare Pages (kancha-website project)
```

## Submit to stores

Submission is configured in `eas.json` under `submit.production`:

- **Android**: internal track, draft release status
- **iOS**: `en-US` language

```bash
bunx eas submit -p ios --latest
bunx eas submit -p android --latest
```

See the [Configuration reference](../reference/configuration.md) for environment variable details per profile.
