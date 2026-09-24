#
# Minimal LuCI panel for the upstream bol-van/zapret2 project
#

include $(TOPDIR)/rules.mk

PKG_NAME:=luci-app-zapret2
PKG_VERSION:=0.2.0
PKG_RELEASE:=25
PKG_LICENSE:=MIT
PKG_MAINTAINER:=Eduard Gushchin

LUCI_TITLE:=LuCI panel for the upstream bol-van/zapret2 project
LUCI_DEPENDS:=+kmod-nfnetlink-queue +rpcd +zapret2 +jq
LUCI_PKGARCH:=all

define Package/$(PKG_NAME)/description
 Minimal LuCI panel for the upstream bol-van/zapret2 project.
 Expects /etc/init.d/zapret2 and /opt/zapret2/config to exist.
 Adds DPI bypass strategy selection (incl. QUIC) with Save & Apply.
endef

define Package/$(PKG_NAME)/postinst
#!/bin/sh
if [ -z "$${IPKG_INSTROOT}" ]; then
	rm -f /tmp/luci-index*
	rm -rf /tmp/luci-modulecache/
	/etc/init.d/rpcd reload >/dev/null 2>&1 || true
	[ -f "/etc/init.d/uhttpd" ] && /etc/init.d/uhttpd reload >/dev/null 2>&1 || true
	# install our init override (UCI -> /opt/zapret2/config generator).
	# Done as a file copy, NOT a package file: apk refuses two packages
	# owning /etc/init.d/zapret2, while opkg silently overwrites.
	OVR=/usr/share/luci-app-zapret2/init.d-zapret2
	[ -f "$$OVR" ] && {
		cp -f "$$OVR" /etc/init.d/zapret2
		chmod 0755 /etc/init.d/zapret2
	}
	# addon ships disabled: undo any enable+start from the engine install
	# (covers foreign/stock engines; ours already disables itself).
	[ -x /etc/init.d/zapret2 ] && {
		/etc/init.d/zapret2 disable 2>/dev/null
		/etc/init.d/zapret2 stop 2>/dev/null || true
	}
	# telemetry: tag stock queue rules with nft counter so
	# `zapret2-speedtest packets` can read per-rule counters.
	# Idempotent; skipped if the engine already ships counters.
	NFT_SH=/opt/zapret2/common/nft.sh
	[ -f "$$NFT_SH" ] && ! grep -q 'counter queue num' "$$NFT_SH" 2>/dev/null && \
		sed -i 's/queue num /counter queue num /g' "$$NFT_SH"
fi
exit 0
endef

include $(TOPDIR)/feeds/luci/luci.mk

# call BuildPackage - OpenWrt buildroot signature
