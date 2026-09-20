# luci-app-zapret2 + zapret2 (single feed repo)

Two OpenWrt packages, one repo. Use this repo directly as an
OpenWrt feed — no wrapper feed needed.

- **zapret2/** — thin packaging shim for upstream
  [bol-van/zapret2](https://github.com/bol-van/zapret2). Zero engine
  code: downloads the upstream release tarball, builds `nfqws2`
  from source, installs the stock runtime to `/opt/zapret2`.
  Installs disabled (first boot comes up Off).
- **luci-app-zapret2/** — LuCI panel ("Services → Traffic Engine")
  plus all UX: speed comparison, UCI-owned config, default host
  list, `zapret2-speedtest` backend, nft counter tagging.
  Depends on `zapret2` (pulls the engine automatically).

## Firmware builders

```
echo "src-git zapret2 https://github.com/carp4/luci-app-zapret2.git" >> feeds.conf.default
./scripts/feeds update zapret2
./scripts/feeds install -a -p zapret2
```

Then `make menuconfig`: Network → Zapret → zapret2,
LuCI → Services → Traffic Engine.

## Stock devices (no build tree)

See Releases: download both `.apk` (25.12) / `.ipk` (24.10)
for your arch and install together:

```
apk add --allow-untrusted ./zapret2-*.apk ./luci-app-zapret2-*.apk
opkg install ./zapret2_*.ipk ./luci-app-zapret2_*.ipk
```

Engine installs disabled. Enable via the panel or
`/etc/init.d/zapret2 enable && /etc/init.d/zapret2 start`.

## Tracking upstream

Bump `zapret2/Makefile` (`PKG_VERSION` + `PKG_HASH` together,
`PKG_RELEASE` resets to 1) to track upstream releases.
No engine rebase ever: the shim holds packaging only.
