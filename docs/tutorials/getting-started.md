# Getting started with Kancha

In this tutorial you will clone Kancha, install dependencies, and run the app on an iOS simulator. By the end you will see the competition list screen on a running simulator.

## Prerequisites

Install the following tools before starting:

- [Bun](https://bun.sh/) ≥ 1.3
- [Node.js](https://nodejs.org/) ≥ 20
- [Xcode](https://developer.apple.com/xcode/) (iOS simulator) or Android Studio (Android emulator)
- [Expo CLI](https://docs.expo.dev/get-started/installation/) — installed automatically via `bunx`

## 1. Clone the repository

```bash
git clone https://github.com/Pilotariak/kancha.git
cd kancha
```

## 2. Install dependencies

```bash
bun install
```

## 3. Set up environment variables

Copy the development environment file:

```bash
cp .env.development .env.local
```

The default `EXPO_PUBLIC_API_URL` points to the staging Frontis gateway — no changes needed for this tutorial.

## 4. Start the app on iOS

```bash
make run-ios
```

Expo will launch Metro bundler and open the iOS Simulator automatically. Wait for the bundle to compile (first run takes ~30 s).

You should see the Kancha launch screen followed by the competition list.

## Next steps

- [How to run on Android or web](../how-to/howto-dev.md)
- [How to build a release with EAS](../how-to/howto-build.md)
- [Architecture explanation](../explanation/architecture.md)
