# Changelog

All notable changes to `capacitor-plugin-kommunicate` will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [8.0.0] - 2026-08-03

### Added
- Added support for Capacitor 8.
- Added Android 16 compatibility by updating the compile and target SDK versions to 36.

### Changed
- Upgraded the Android Kommunicate UI SDK to version 2.16.6.
- Increased the minimum Android SDK version to 24.
- Increased the minimum iOS deployment target to 15.0 and updated the Swift version to 5.9.

## [6.1.1] - 2026-07-21
- Added Android 15 Compatibility and update sdk to 35
- Upgrade kommunicateui sdk verison 2.16.4


## [6.1.0] - 2026-04-21

### Added
- Added markdown format support for chat message content.
- Added support for richer text formatting behavior in conversations.
- Added additional plugin-level feature enhancements in the 6.1.0 release.

### Changed
- Updated iOS dependency resolution to `Kommunicate ~> 7.3.4` for improved compatibility.
- Bumped Android SDK dependency `io.kommunicate.sdk:kommunicateui` to `2.16.0`.

### Fixed
- Improved iOS build compatibility for newer Xcode toolchains via updated Kommunicate dependency chain.
