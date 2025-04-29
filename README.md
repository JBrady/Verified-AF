# Verified AF

**Verified AF** is a lightweight, offline-first desktop app that helps you verify downloaded files the right way — without the usual PGP or checksum headaches.

Right now, Verified AF lets you:
- ✅ Verify a file against a PGP signature you already have (using your system's GPG install)
- ✅ Verify a file against a manually pasted SHA256 or SHA512 checksum
- ✅ See clean, easy-to-understand results (Good signature / Valid but untrusted / Bad signature / Checksum match or mismatch)

It's focused on doing one thing **very well**: telling you if a file is legit.

---

## Goals and Philosophy

- **Simplicity first**: No over-engineered UX. Clear actions, clear results.
- **Trust through transparency**: We never hide verification details behind magic green checkmarks. If it's valid, you’ll know why. If it’s sketchy, you’ll know exactly how.
- **Offline by default**: Verified AF assumes no internet connection. No automatic key fetching, no background calls you didn’t ask for.
- **Build in public**: Features are added with real-world feedback from users who actually care about security — not marketing checklists.

---

## What's Coming Soon

- Drag-and-drop file support
- Parsing `.sha256` and `.sha512` files automatically
- Built-in database of trusted fingerprints (e.g., Tails, Qubes, Debian)
- Inline fingerprint comparisons for easy manual verification
- Exportable verification reports
- Optional profanity filter toggle (for normie-friendly mode)

---

## Future Roadmap

- Full Rust-native OpenPGP verification (no GPG dependency)
- SBOM (Software Bill of Materials) support for verifying software provenance
- CLI version for DevOps workflows
- Enterprise API integration (for companies that want to automate file integrity checks)

---

## License

This project is licensed under the [MIT License](LICENSE).

You’re free to use, modify, and distribute Verified AF — just don't blame us if you still manage to get pwned.  
Use common sense, verify your sources, and stay dangerous.

---
