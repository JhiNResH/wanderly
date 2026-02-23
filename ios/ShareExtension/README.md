# iOS Share Extension Setup

After running `npx expo prebuild`, add the Share Extension to Xcode:

## Steps

1. Open `ios/wanderly.xcworkspace` in Xcode
2. File → New → Target → **Share Extension**
3. Product Name: `ShareExtension`
4. Bundle Identifier: `com.wanderly.app.ShareExtension`
5. Replace the generated `ShareViewController.swift` with `ios/ShareExtension/ShareViewController.swift`
6. Replace the generated `Info.plist` with `ios/ShareExtension/Info.plist`

## App Group (required for shared storage)

1. Main target → Signing & Capabilities → **+ Capability → App Groups**
   - Add: `group.com.wanderly.app`
2. ShareExtension target → Signing & Capabilities → **+ Capability → App Groups**
   - Add: `group.com.wanderly.app`

## How it works

```
User shares URL from Instagram/YouTube/TikTok/小紅書
      ↓
ShareViewController receives NSExtensionItem
      ↓
Saves URL to UserDefaults(suiteName: "group.com.wanderly.app")
Key: "wanderly_shared_url"
      ↓
Shows "Saved to Wanderly ✓" (1.5s)
      ↓
Main app reads from UserDefaults on foreground (useSharedUrl hook)
      ↓
Alert: "Save this link?" → navigates to Add screen → processUrl()
```

## React Native Side

The `useSharedUrl` hook in `src/hooks/useSharedUrl.ts` reads from AsyncStorage:
- Key: `wanderly_shared_url`
- Called on app mount and every time app becomes active

The Share Extension writes to both:
1. `UserDefaults(suiteName: appGroupID)` — native side
2. `@AsyncStorage:wanderly_shared_url` — React Native AsyncStorage format
