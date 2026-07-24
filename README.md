# SubstationWatch

A React Native (Expo) app that simulates real-time monitoring of substation assets: transformers, breakers, and busbars with temperature thresholds, alarm states, and an operator acknowledgement flow.

Built in about a day as a learning project while preparing for a React Native interview, modeled loosely on industrial remote monitoring products for electric utilities. I had Flutter and React experience but had never used React Native, so I wanted to close that gap with something real rather than tutorials.

## Screenshots

| Login | Asset List | Asset Detail |
|:---:|:---:|:---:|
| <img src="https://github.com/user-attachments/assets/789faef6-88b8-471c-a2f9-ad10641a9ddc" width="260" alt="Login screen"> | <img src="https://github.com/user-attachments/assets/00414a9d-1fa5-43f0-9244-1ae2ad30283f" width="260" alt="Asset list screen"> | <img src="https://github.com/user-attachments/assets/87d2bb26-a9d8-4028-968c-f1fbc28eb406" width="260" alt="Asset detail screen"> |
| Login Screen | Asset List Screen | Asset Detail Screen |

## Features

- Mock sign-in with the token stored in `expo-secure-store`. Navigation is conditional on auth state, so the login stack and app stack never coexist.
- Asset list with live temperature updates every 3 seconds, delivered through a subscription API shaped like a WebSocket wrapper.
- Status (NORMAL / WARNING / ALARM) derived from temperature and per-asset thresholds on every render.
- Alarm acknowledgement shared between the list and detail screens via Context, persisted in AsyncStorage across restarts.
- Explicit loading, error, empty, and success states. The mock API injects 800 ms latency and a 10% failure rate so the error paths were built against real failures.

## Architecture

```text
src/
  api/
    mockApi.js       login, fetchAssets, fetchAssetDetail, subscribeToUpdates
  data/
    mockAssets.js    seed data: 8 assets across 3 sites
  screens/
    LoginScreen.js
    AssetListScreen.js
    AssetDetailScreen.js
  components/
    StatusBadge.js
  context/
    AuthContext.js              token, backed by SecureStore
    AcknowledgementContext.js   ack ids, backed by AsyncStorage
  utils/
    assetStatus.js   pure function mapping temperature and thresholds to status
```

Screens only call functions from `api/` and never know the data is mocked. Swapping in a real REST and WebSocket backend would not change any screen code.

## Design decisions

**Diff-shaped updates, merged immutably.** The subscription delivers only what changed, like a real telemetry stream. The list merges with the updater form of `setState`, since the callback closes over mount-time state and `prev` is the only safe reference. Untouched assets keep their object identity, which is what makes row memoization possible later.

**Status is derived, not stored.** Storing it would create a second source of truth to keep in sync on every temperature tick. Deriving it removes that class of bug entirely.

**Context only for low-frequency shared state.** Auth and acknowledgements live in Context because the list and detail screens are siblings and can't pass props. The 3-second telemetry stream deliberately stays in local screen state, since Context re-renders every consumer on change.

**Auth-conditional stacks.** Rather than navigating after login, the set of screens that exist changes with token state. Going back to login after signing in is structurally impossible, and signing out is just `setToken(null)`.

**Storage matched to sensitivity.** The token goes in SecureStore, backed by the platform keystore. Acknowledgement state goes in AsyncStorage, which is plain but fine for non-sensitive app state. Stored data is validated on read rather than trusted.

**A guard against data loss.** The persistence effect is gated on `isStorageLoaded`, so the initial empty state can't overwrite saved data before the load finishes.

## Known limitations

**Every row re-renders on each update.** I logged renders and saw all 8 rows render every 3 seconds even though only 1 or 2 assets change. The cause is an inline `renderItem` and an unmemoized row. The fix is extracting the row into `React.memo` with a `useCallback`-stable `onPress`; the immutable merge already preserves references, so memo would work. Invisible at 8 rows, the first thing I'd fix at 500.

**Acknowledgements aren't scoped per user.** They live under one global key, so signing out and back in as someone else inherits the previous user's acks. An acknowledgement is really an audit record and should be server-owned, cached locally per user and cleared on sign-out.

**Auth is a mock.** The token is a random string with no expiry. Real auth needs refresh rotation and 401 handling.

**No reconnect or offline path.** The subscription interface is WebSocket-shaped, but drop detection, exponential backoff, and resync after reconnect don't exist yet. For substation connectivity that's the part that actually matters.

**Plain JavaScript.** I hit four silent bugs in one night: `styles=` instead of `style=`, a typo'd style key, a case-mismatched status string that produced `NaN`, and a mismatched export name. None of them threw at the point of the mistake. All four would have been compile-time errors in TypeScript.

No tests and no pull-to-refresh yet.

## Running it

```bash
npm install
npx expo start
```

Open in Expo Go, or press `i` for the iOS simulator. Sign in with any username and password; use `wrong` as the password to see the error path.

## Stack

Expo SDK 57, React Native, React Navigation (native stack), AsyncStorage, expo-secure-store
