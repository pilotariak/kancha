# How to run Kancha locally

This guide covers running the app on each supported platform during development.

## Prerequisites

Dependencies installed (`bun install`) and environment configured (see [Getting started](../tutorials/getting-started.md)).

## iOS simulator

```bash
make run-ios
```

## Android emulator

Requires a running Android Virtual Device in Android Studio.

```bash
make run-android
```

## Web browser

```bash
make run-web
```

Opens `http://localhost:8081` in the default browser. Web support is limited — some native APIs are unavailable.

## Expo Go (physical device)

```bash
make run-expo
```

Scan the QR code with the Expo Go app on iOS or Android.

## Changing the API endpoint

Set `EXPO_PUBLIC_API_URL` in `.env.local` to point at a local Frontis instance:

```bash
EXPO_PUBLIC_API_URL=http://localhost:4000/graphql
```

Restart Metro after changing env vars:

```bash
bunx expo start --clear
```

## Troubleshooting

**Metro fails to start** — run `bun install` again and clear the cache with `bunx expo start --clear`.

**iOS build errors** — run `bunx expo prebuild` then open `ios/` in Xcode to inspect native errors.
