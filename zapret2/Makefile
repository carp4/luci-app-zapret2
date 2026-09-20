#
# Thin OpenWrt packaging shim for upstream bol-van/zapret2 (nfqws2).
# Zero engine code lives here: the source tarball is downloaded from the
# upstream release, built from source, and the stock runtime is installed
# verbatim under /opt/zapret2. All UX deltas (speedtest, UCI config
# generation, default-Off policy beyond this postinst, hostlists) belong
# to the companion luci-app-zapret2 package in this same repo.
#
# Upstream: https://github.com/bol-van/zapret2
# Pinned release: v1.0.5.2 (latest at packaging time; bump PKG_VERSION +
# PKG_HASH together to track upstream, PKG_RELEASE resets to 1).
#
include $(TOPDIR)/rules.mk

PKG_NAME:=zapret2
PKG_VERSION:=1.0.5.2
PKG_RELEASE:=1

PKG_SOURCE:=zapret2-v$(PKG_VERSION).tar.gz
PKG_SOURCE_URL:=https://github.com/bol-van/zapret2/releases/download/v$(PKG_VERSION)/
PKG_HASH:=fb3bcf69e7d86b9fa2d60bd53c956ac06d9dcc3adf9392afd84865f1d94b1158

# Release tarball extracts to zapret2-v<VERSION>/ inside the build dir.
PKG_BUILD_DIR:=$(BUILD_DIR)/$(PKG_NAME)-$(PKG_VERSION)/zapret2-v$(PKG_VERSION)

include $(INCLUDE_DIR)/package.mk

LUA_JIT?=1
ifeq ($(LUA_JIT),1)
LUAJIT_VER?=2.1
LUA_VER?=5.1
LUA_DEP:=luajit
LUA_INCLUDE:=-I$(STAGING_DIR)/usr/include/luajit-$(LUAJIT_VER)
LUA_LIBRARY:=-L$(STAGING_DIR)/usr/lib -lluajit-$(LUA_VER)
else
LUA_VER?=5.3
LUA_DEP:=lua$(LUA_VER)
LUA_INCLUDE:=-I$(STAGING_DIR)/usr/include/lua$(LUA_VER)
LUA_LIBRARY:=-L$(STAGING_DIR)/usr/lib -llua$(LUA_VER)
endif

# runtime base on target
ZAPRET_DIR:=/opt/zapret2

define Package/zapret2
	SECTION:=net
	CATEGORY:=Network
	TITLE:=zapret2 - anti-DPI engine (nfqws2) with full runtime
	SUBMENU:=Zapret
	URL:=https://github.com/bol-van/zapret2
	DEPENDS:=+libnetfilter-queue +kmod-nfnetlink-queue +libmnl +libcap +zlib +$(LUA_DEP)
endef

define Package/zapret2/description
	zapret2 (nfqws2) is the second-generation anti-DPI engine: a
	programmable packet manipulation tool with Lua-based DPI-bypass
	strategies. This package builds the engine from the upstream
	release tarball and installs the complete stock runtime (Lua
	strategy library, init scripts, default config, ipset lists and
	fake blobs) to $(ZAPRET_DIR).
endef

define Build/Compile
	$(MAKE) -C $(PKG_BUILD_DIR)/nfq2 $(TARGET_CONFIGURE_OPTS) \
		LUA_CFLAGS="$(LUA_INCLUDE)" LUA_LIB="$(LUA_LIBRARY)"
endef

define Package/zapret2/install
	# engine binary
	$(INSTALL_DIR) $(1)$(ZAPRET_DIR)/nfq2
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/nfq2/nfqws2 $(1)$(ZAPRET_DIR)/nfq2/

	# lua strategy library
	$(INSTALL_DIR) $(1)$(ZAPRET_DIR)/lua
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/lua/*.lua $(1)$(ZAPRET_DIR)/lua/

	# common runtime helpers
	$(INSTALL_DIR) $(1)$(ZAPRET_DIR)/common
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/common/*.sh $(1)$(ZAPRET_DIR)/common/

	# ip2net helper + ipset scripts/lists
	$(INSTALL_DIR) $(1)$(ZAPRET_DIR)/ipset
	$(CP) $(PKG_BUILD_DIR)/ipset/* $(1)$(ZAPRET_DIR)/ipset/

	# fake blobs
	$(INSTALL_DIR) $(1)$(ZAPRET_DIR)/files
	$(CP) $(PKG_BUILD_DIR)/files/* $(1)$(ZAPRET_DIR)/files/

	# blockcheck strategy tree (reference / on-device blockcheck)
	$(INSTALL_DIR) $(1)$(ZAPRET_DIR)/blockcheck2.d
	$(CP) $(PKG_BUILD_DIR)/blockcheck2.d/* $(1)$(ZAPRET_DIR)/blockcheck2.d/
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/blockcheck2.sh $(1)$(ZAPRET_DIR)/blockcheck2.sh

	# default config
	$(INSTALL_DATA) $(PKG_BUILD_DIR)/config.default $(1)$(ZAPRET_DIR)/config.default

	# init scripts (procd) + firewall
	$(INSTALL_DIR) $(1)$(ZAPRET_DIR)/init.d/openwrt
	$(CP) $(PKG_BUILD_DIR)/init.d/openwrt/* $(1)$(ZAPRET_DIR)/init.d/openwrt/
	$(INSTALL_DIR) $(1)/etc/init.d
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/init.d/openwrt/zapret2 $(1)/etc/init.d/zapret2
	$(INSTALL_DIR) $(1)/etc/hotplug.d/iface
	$(INSTALL_BIN) $(PKG_BUILD_DIR)/init.d/openwrt/90-zapret2 $(1)/etc/hotplug.d/iface/90-zapret2

	# create runtime config from default on first boot
	$(INSTALL_DIR) $(1)/etc/uci-defaults
	$(INSTALL_BIN) $(CURDIR)/uci-defaults.zapret2 $(1)/etc/uci-defaults/99-zapret2-config
endef

define Package/zapret2/postinst
#!/bin/sh
# zapret2 installs DISABLED: the APK default_postinst enables+starts any
# init script with START= on a LIVE install. Undo that so a freshly added
# package doesn't run until the user opts in. (First boot of flashed
# images is handled by uci-defaults/99-zapret2-config.)
if [ -z "$${IPKG_INSTROOT}" ]; then
	/etc/init.d/zapret2 disable 2>/dev/null
	/etc/init.d/zapret2 stop 2>/dev/null || true
fi
exit 0
endef

$(eval $(call BuildPackage,zapret2))
