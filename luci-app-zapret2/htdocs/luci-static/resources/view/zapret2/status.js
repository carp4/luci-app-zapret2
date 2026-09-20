'use strict';
'require view';
'require rpc';
'require fs';
'require poll';
'require ui';
'require uci';
'require request';

var DEFAULT_HOSTS = ['youtube.com', 'googlevideo.com', 'ytimg.com', 'ggpht.com', 'youtu.be', 'facebook.com', 'fbcdn.net', 'instagram.com', 'cdninstagram.com', 'tiktok.com', 'tiktokcdn.com', 'tiktokv.com', 'snapchat.com', 'sc-cdn.net', 'netflix.com', 'nflxvideo.net', 'disneyplus.com', 'cloudfront.net', 'akamaized.net', 'speedtest.net', 'ookla.com'];

function detectLocale() {
	var htmlLang = '';
	var luciLang = '';
	var browserLang = '';

	try {
		htmlLang = document && document.documentElement ? (document.documentElement.getAttribute('lang') || '') : '';
	} catch (e) {}

	try {
		luciLang = window.L && L.env ? (L.env.lang || L.env.i18nLanguage || '') : '';
	} catch (e2) {}

	try {
		browserLang = (navigator.language || (navigator.languages && navigator.languages[0]) || '');
	} catch (e3) {}

	return String(htmlLang || luciLang || browserLang || 'en').toLowerCase();
}

var CURRENT_LOCALE = detectLocale();
var USE_RUSSIAN = /^ru([_-]|$)/.test(CURRENT_LOCALE);

function tr(en, ru) {
	return USE_RUSSIAN ? ru : en;
}

if (!window.__zapret2PanelStylesInjected) {
	window.__zapret2PanelStylesInjected = true;
	document.head.append(E('style', { 'type': 'text/css' }, `
		.z2-page {
			display: flex;
			flex-direction: column;
			gap: 16px;
		}
		.z2-muted {
			opacity: .82;
		}
		.z2-status-strip {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			flex-wrap: wrap;
		}
		.z2-badge {
			display: inline-flex;
			align-items: center;
			gap: 8px;
			padding: 7px 12px;
			border-radius: 999px;
			font-weight: 700;
			font-size: 13px;
			line-height: 1;
			letter-spacing: .01em;
		}
		.z2-badge::before {
			content: '';
			width: 8px;
			height: 8px;
			border-radius: 50%;
			background: currentColor;
			opacity: .9;
		}
		.z2-running {
			background: rgba(46, 162, 86, .14);
			color: #2ea256;
		}
		.z2-stopped {
			background: rgba(138, 138, 138, .15);
			color: #9aa0a6;
		}
		.z2-disabled {
			background: rgba(117, 117, 117, .16);
			color: #8d96a0;
		}
		.z2-error {
			background: rgba(255, 78, 84, .14);
			color: #ff4e54;
		}
		.z2-grid {
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(180px, 1fr));
			gap: 12px;
		}
		.z2-card {
			border: 1px solid var(--border-color-medium, rgba(255,255,255,.08));
			border-radius: 14px;
			padding: 14px 16px;
			background: var(--app-body-bg, rgba(255,255,255,.02));
			box-shadow: 0 2px 12px rgba(0,0,0,.06);
		}
		.z2-card-label {
			font-size: 12px;
			text-transform: uppercase;
			letter-spacing: .06em;
			opacity: .72;
			margin-bottom: 8px;
		}
		.z2-card-value {
			font-size: 15px;
			font-weight: 600;
			word-break: break-word;
		}
		.z2-page .cbi-section {
			margin: 0 0 16px 0;
			padding: 16px 18px;
		}
		.z2-page .cbi-section:last-child {
			margin-bottom: 0;
		}
		.z2-page .cbi-section-node {
			padding: 0;
		}
		.z2-actions {
			display: flex;
			flex-wrap: wrap;
			gap: 8px;
			margin: 10px 0 12px 0;
		}
		.z2-page .cbi-section-node.z2-actions {
			padding: 4px 0;
		}
		.z2-actions .btn {
			margin: 0 !important;
		}
		.z2-group-block {
			display: flex;
			flex-direction: column;
			gap: 4px;
		}
		.z2-group-title {
			font-size: 13px;
			font-weight: 700;
			margin: 12px 0 0 0;
		}
		.z2-subbox {
			padding: 2px 0;
		}
		.z2-section-header {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 10px;
			flex-wrap: wrap;
			margin-bottom: 14px;
		}
		.z2-section-title {
			font-size: 15px;
			font-weight: 700;
			margin-bottom: 4px;
		}
		.z2-section-tools {
			display: flex;
			gap: 8px;
			flex-wrap: wrap;
		}
		.z2-section-tools .btn {
			margin: 0 !important;
		}
		.z2-textarea {
			width: 100%;
			box-sizing: border-box;
			min-height: 220px;
			font-family: ui-monospace, SFMono-Regular, Menlo, Consolas, monospace;
			font-size: 12px;
			line-height: 1.45;
			border-radius: 12px;
			padding: 12px 13px;
		}
		.z2-textarea.z2-compact {
			min-height: 180px;
		}
		.z2-note {
			font-size: 12px;
			opacity: .72;
			margin-top: 8px;
			line-height: 1.45;
		}
		.z2-speed-warn {
			font-size: 12px;
			line-height: 1.45;
			margin-top: 8px;
			padding: 8px 10px;
			border-radius: 8px;
			border: 1px solid var(--border-color-medium, rgba(128,128,128,.25));
			background: var(--app-body-bg, transparent);
			color: #d9a441;
		}
		.z2-section + .z2-section {
			margin-top: 4px;
		}
		.z2-strat-box {
			display: flex;
			flex-direction: column;
			gap: 10px;
		}
		.z2-strat-row {
			display: flex;
			align-items: center;
			gap: 10px;
			padding: 10px 12px;
			border: 1px solid var(--border-color-medium, rgba(128,128,128,.25));
			border-radius: 10px;
			background: var(--app-body-bg, transparent);
		}
		.z2-strat-row input[type=checkbox] {
			width: auto;
			height: auto;
		}
		.z2-strat-row .z2-badge {
			margin-left: auto;
			padding: 3px 8px;
			font-size: 11px;
		}
		.z2-speed-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 10px;
			padding: 10px 12px;
			border: 1px solid var(--border-color-medium, rgba(128,128,128,.25));
			border-radius: 10px;
			background: var(--app-body-bg, transparent);
		}
		.z2-speed-value {
			font-weight: 600;
			white-space: nowrap;
		}
		.z2-speed-source {
			font-size: 11px;
			opacity: .6;
			margin-left: 6px;
		}
		.z2-speed-right {
			display: inline-flex;
			align-items: center;
			gap: 8px;
		}
		.z2-speed-row .z2-badge {
			padding: 3px 8px;
			font-size: 11px;
		}
		.z2-maint-card {
			display: flex;
			flex-direction: column;
			gap: 12px;
		}
		.z2-maint-row {
			display: flex;
			align-items: center;
			gap: 10px;
			flex-wrap: wrap;
		}
		.z2-maint-label {
			font-weight: 600;
		}
		.z2-hostlist-box {
			display: flex;
			flex-direction: column;
			gap: 6px;
		}
		.z2-host-li {
			display: flex;
			align-items: center;
			gap: 6px;
		}
		.z2-host-input {
			flex: 1;
		}
		details.z2-advanced {
			margin-top: 20px;
			border-top: 1px solid var(--border-color-medium, rgba(255,255,255,.08));
			padding-top: 12px;
		}
		details.z2-advanced > summary {
			cursor: pointer;
			font-weight: 700;
			font-size: 14px;
			user-select: none;
		}
		.z2-muted {
			opacity: .65;
			font-size: 12px;
		}
		.z2-radio-row {
			display: inline-flex;
			align-items: center;
			gap: 6px;
			white-space: nowrap;
		}
		.z2-speed-msg {
			font-size: 14px;
			font-weight: 600;
			color: inherit;
			line-height: 1.5;
		}
		.z2-speed-msg.z2-msg-error {
			color: #e57367;
			font-weight: 700;
		}
		@keyframes z2-spin {
			to { transform: rotate(360deg); }
		}
		.z2-spin {
			display: inline-block;
			width: 14px;
			height: 14px;
			border: 2px solid currentColor;
			border-top-color: transparent;
			border-radius: 50%;
			animation: z2-spin .7s linear infinite;
			margin-left: 6px;
			vertical-align: -2px;
		}
		.z2-tabbar {
			display: flex;
			gap: 6px;
			padding: 4px;
			border-radius: 12px;
			background: #f4f4f5;
			margin-bottom: 14px;
		}
		.z2-tab {
			flex: 1;
			text-align: center;
			padding: 10px 12px;
			border-radius: 10px;
			cursor: pointer;
			border: 1px solid transparent;
			background: transparent;
			font-weight: 600;
			color: #1a1a1e;
		}
		.z2-tab.z2-tab-active {
			background: #fff;
			color: #1a1a1e;
			border-color: transparent;
			box-shadow: 0 1px 2px rgba(0,0,0,.12);
		}
		.z2-panel {
			display: none;
		}
		.z2-panel.z2-panel-open {
			display: block;
		}
		.z2-switch-row {
			display: flex;
			align-items: center;
			justify-content: space-between;
			gap: 12px;
			padding: 12px;
			border: 1px solid var(--border-color-medium, rgba(128,128,128,.25));
			border-radius: 10px;
			background: var(--app-body-bg, transparent);
		}
		.z2-switch {
			display: inline-flex;
			align-items: center;
			flex: none;
			cursor: pointer;
		}
		/* The checkbox is visually replaced by the track/knob spans below.
		   Styling the <input> itself with appearance:none + ::after is not
		   portable (pseudo-elements on replaced inputs are ignored by some
		   browsers -> bare checkbox with the tick drawn outside the box).
		   A hidden input plus real elements renders identically everywhere. */
		.z2-switch-input {
			position: absolute;
			width: 1px;
			height: 1px;
			opacity: 0;
			margin: 0;
			pointer-events: none;
		}
		.z2-switch-track {
			display: inline-block;
			position: relative;
			width: 48px;
			height: 26px;
			border-radius: 999px;
			background: rgba(117,117,117,.35);
			transition: background .15s ease;
		}
		.z2-switch-knob {
			position: absolute;
			top: 3px;
			left: 3px;
			width: 20px;
			height: 20px;
			border-radius: 50%;
			background: #fff;
			box-shadow: 0 1px 2px rgba(0,0,0,.35);
			transition: transform .15s ease;
		}
		.z2-switch-input:checked + .z2-switch-track {
			background: #2ea256;
		}
		.z2-switch-input:checked + .z2-switch-track .z2-switch-knob {
			transform: translateX(22px);
		}
		.z2-switch-input:focus-visible + .z2-switch-track {
			box-shadow: 0 0 0 3px rgba(46,162,86,.35);
		}
		.z2-switch-input:disabled + .z2-switch-track {
			opacity: .5;
			cursor: not-allowed;
		}
	`));
}

var callServiceList = rpc.declare({
	object: 'service',
	method: 'list',
	params: [ 'name', 'verbose' ],
	expect: { '': {} }
});

var callInitList = rpc.declare({
	object: 'luci',
	method: 'getInitList',
	params: [ 'name' ],
	expect: { '': {} }
});

var callInitAction = rpc.declare({
	object: 'luci',
	method: 'setInitAction',
	params: [ 'name', 'action' ],
	expect: { result: false }
});

function safeExec(cmd, args) {
	return fs.exec(cmd, args || []).catch(function(err) {
		return {
			code: -1,
			stdout: '',
			stderr: err ? (err.message || String(err)) : 'Unknown exec error'
		};
	});
}

function trimText(value) {
	return (value || '').trim();
}

function toUciList(value) {
	// rpcd returns UCI lists as arrays and options as plain strings; the
	// multi-value fields below are stored space-separated (like firewall
	// zones do), so split those. Tolerates the previous list schema too.
	if (value == null)
		return [];
	var arr = Array.isArray(value) ? value.slice() : String(value).trim().split(/\s+/);
	return arr.filter(function(x) { return x; });
}

function sameUciList(a, b) {
	return toUciList(a).slice().sort().join(' ') === toUciList(b).slice().sort().join(' ');
}

function prettifyCommand(command) {
	if (!command)
		return '';

	return command
		.replace(/\s+--new\b/g, '\n\n--new')
		.replace(/\s+(--[^\s]+)/g, '\n$1')
		.trim();
}

function copyText(text, label) {
	var value = trimText(text);
	if (!value) {
		ui.addNotification(null, E('p', tr('Nothing to copy.', 'Нечего копировать.')));
		return Promise.resolve();
	}

	if (navigator.clipboard && navigator.clipboard.writeText) {
		return navigator.clipboard.writeText(value).then(function() {
			ui.addNotification(null, E('p', tr('Copied: %s', 'Скопировано: %s').format(label)));
		}).catch(function(err) {
			ui.addNotification(null, E('p', tr('Failed to copy %s: %s', 'Не удалось скопировать %s: %s').format(label, err.message || err)));
		});
	}

	try {
		var temp = E('textarea', { 'style': 'position:absolute;left:-9999px;top:-9999px;' }, value);
		document.body.appendChild(temp);
		temp.focus();
		temp.select();
		document.execCommand('copy');
		temp.remove();
		ui.addNotification(null, E('p', tr('Copied: %s', 'Скопировано: %s').format(label)));
	} catch (err2) {
		ui.addNotification(null, E('p', tr('Failed to copy %s: %s', 'Не удалось скопировать %s: %s').format(label, err2.message || err2)));
	}

	return Promise.resolve();
}

function getServiceInfo(serviceData) {
	var svc = serviceData && serviceData.zapret2 ? serviceData.zapret2 : null;
	var instances = svc && svc.instances ? Object.keys(svc.instances).map(function(key) { return svc.instances[key]; }) : [];
	var running = instances.filter(function(instance) { return !!instance.running; });
	var first = running[0] || instances[0] || null;
	var command = first && Array.isArray(first.command) ? first.command.join(' ') : '';

	return {
		totalCount: instances.length,
		runningCount: running.length,
		running: running.length > 0,
		pids: running.map(function(instance) { return instance.pid; }).filter(function(pid) { return pid != null; }),
		command: command,
		formattedCommand: prettifyCommand(command),
		profileCount: command ? Math.max(1, (command.match(/--new\b/g) || []).length + 1) : 0
	};
}

function getStateInfo(enabled, serviceInfo) {
	if (serviceInfo.running) {
		return { label: tr('Running', 'Работает'), className: 'z2-running' };
	}
	if (!enabled) {
		return { label: tr('Disabled', 'Выключен'), className: 'z2-disabled' };
	}
	return { label: tr('Stopped', 'Остановлен'), className: 'z2-stopped' };
}

function makeMetaCard(label, valueNode) {
	return E('div', { 'class': 'z2-card' }, [
		E('div', { 'class': 'z2-card-label' }, label),
		E('div', { 'class': 'z2-card-value' }, [ valueNode ])
	]);
}

function makeTextSection(title, subtitle, textareaNode, copyLabel, self) {
	return E('div', { 'class': 'cbi-section' }, [
		E('div', { 'class': 'z2-section-header' }, [
			E('div', {}, [
				E('div', { 'class': 'z2-section-title' }, title),
				subtitle ? E('div', { 'class': 'z2-note' }, subtitle) : ''
			]),
			E('div', { 'class': 'z2-section-tools' }, [
				E('button', {
					'class': 'btn',
					'click': ui.createHandlerFn(self, function() {
						return copyText(textareaNode.value, copyLabel);
					})
				}, tr('Copy', 'Копировать'))
			])
		]),
		E('div', { 'class': 'cbi-section-node' }, [ textareaNode ])
	]);
}

/*
 * Strategy catalog.
 *
 * Checkbox labels for the DPI bypass techniques the page manages. The
 * engine-side nfqws2 profile blocks live in /etc/init.d/zapret2, which
 * regenerates them from the UCI `strategy` list on every start — the page
 * itself only reads and writes strategy ids.
 */
var STRATEGY_CATALOG = [
	{
		id: 'tls',
		labelEn: 'TLS fake + multidisorder',
		labelRu: 'TLS fake + multidisorder',
		enabled: true
	},
	{
		id: 'http',
		labelEn: 'HTTP fake + multisplit',
		labelRu: 'HTTP fake + multisplit',
		enabled: true
	},
	{
		id: 'quic',
		labelEn: 'QUIC (HTTP/3) bypass',
		labelRu: 'QUIC (HTTP/3) обход',
		enabled: true
	}
];

function rowCoveredBy(row, wan) {
	// A device is covered by the pinned UCI wan4/wan6 lists when every
	// logical interface it backs appears in the matching family list.
	if (!row)
		return false;
	for (var i = 0; i < (row.v4 || []).length; i++) {
		if (wan.v4.indexOf(row.v4[i]) === -1)
			return false;
	}
	for (var j = 0; j < (row.v6 || []).length; j++) {
		if (wan.v6.indexOf(row.v6[j]) === -1)
			return false;
	}
	return true;
}

return view.extend({
	load: function() {
		return this.fetchData();
	},

	fetchData: function() {
		return Promise.all([
			callInitList('zapret2'),
			callServiceList('zapret2', 1),
			fs.read('/opt/zapret2/config').catch(function() { return ''; }),
			safeExec('/etc/init.d/zapret2', [ 'list_table' ]),
			safeExec('/opt/zapret2/nfq2/nfqws2', [ '--version' ]),
			safeExec('/usr/sbin/zapret2-speedtest', [ 'interfaces' ]),
			safeExec('/usr/sbin/zapret2-speedtest', [ 'packets' ]),
			uci.load('zapret2').catch(function() { return []; })
		]);
	},

	addHostRow: function(value, focus) {
		var self = this;
		var input = E('input', {
			'type': 'text',
			'class': 'cbi-input-text z2-host-input',
			'value': (value || ''),
			'placeholder': tr('host, e.g. rutracker.org', 'хост, например rutracker.org')
		});
		var row = E('div', { 'class': 'z2-host-li' }, [
			input,
			E('button', {
				'class': 'btn cbi-button-negative',
				'click': ui.createHandlerFn(this, function() { return self.removeHostRow(input); })
			}, '×')
		]);
		this.hostRows.push(input);
		this.hostListBox.appendChild(row);
		if (focus)
			input.focus();
	},

	removeHostRow: function(input) {
		var idx = this.hostRows.indexOf(input);
		if (idx >= 0)
			this.hostRows.splice(idx, 1);
		var row = input.parentNode;
		if (row && row.parentNode === this.hostListBox)
			this.hostListBox.removeChild(row);
	},

	buildHostRows: function(lines) {
		var self = this;
		while (this.hostListBox.firstChild)
			this.hostListBox.removeChild(this.hostListBox.firstChild);
		this.hostRows = [];
		for (var i = 0; i < lines.length; i++) {
			var d = (lines[i] || '').trim().toLowerCase();
			if (d)
				self.addHostRow(d, false);
		}
	},

	collectHostList: function() {
		var seen = {};
		return this.hostRows.map(function(input) {
			var v = (input.value || '').trim().toLowerCase();
			v = v.replace(/^[a-z][a-z0-9+.-]*:\/\//i, '').split('/')[0].split(':')[0];
			v = v.replace(/^\.+|\.+$/g, '');
			if (!v || seen[v])
				return '';
			seen[v] = true;
			return v;
		}).filter(function(v) { return v; });
	},

	setModeTab: function(tab) {
		this.modeTab = (tab === 'masq') ? 'masq' : 'video';
		this.tabVideo.className = 'z2-tab' + ((this.modeTab === 'video') ? ' z2-tab-active' : '');
		this.tabMasq.className = 'z2-tab' + ((this.modeTab === 'masq') ? ' z2-tab-active' : '');
		this.panelVideo.className = 'z2-panel' + ((this.modeTab === 'video') ? ' z2-panel-open' : '');
		this.panelMasq.className = 'z2-panel' + ((this.modeTab === 'masq') ? ' z2-panel-open' : '');
	},

	syncModeSliders: function() {
		// The two switches mirror the single mode; exactly one of them can
		// be on. Slider state is re-derived from `mode` so polling never
		// desyncs the UI from what the engine actually runs, and an
		// in-progress toggle is never clobbered (guarded by modeBusy).
		this.sliderVo.checked = (this.mode === 'video');
		this.sliderMasq.checked = (this.mode === 'masq');
	},

	toggleMode: function(mode, checked) {
		var self = this;
		var target = (mode === 'masq') ? 'masq' : 'video';
		var current = this.mode;
		var label = (target === 'video')
			? tr('Video optimizer', 'Видео-оптимизатор')
			: tr('Traffic masquerade', 'Маскировка трафика');

		// Turning OFF: stop + disable autorun, keep the saved scope so a
		// later ON re-applies the same recipe without asking again.
		if (!checked) {
			this.modeBusy = true;
			return callInitAction('zapret2', 'stop').then(function(success) {
				if (!success)
					throw new Error('Command failed');
				return callInitAction('zapret2', 'disable');
			}).then(function(success) {
				if (!success)
					throw new Error('Command failed');
				self.mode = null;
				self.syncModeSliders();
				ui.addNotification(null, E('p', tr('%s is off', '%s выключен').format(label)));
				return self.updateStatus();
			}).catch(function(err) {
				ui.addNotification(null, E('p', tr('Unable to turn off %s: %s', 'Не удалось выключить %s: %s').format(label, err.message || err)));
			}).then(function() {
				self.modeBusy = false;
			});
		}

		// Turning ON. If the engine is already running under the OTHER
		// scope, this is a takeover: confirm first, and on cancel roll the
		// slider back without touching anything.
		if (current && current !== target) {
			if (!window.confirm(tr('Enable %s? The other mode will be turned off.', 'Включить %s? Другой режим будет выключен.').format(label))) {
				self.syncModeSliders();
				return Promise.resolve(false);
			}
		}

		this.modeBusy = true;
		this.mode = target;   // so collectState() commits the right scope
		var state = this.collectState();
		return this.saveUciState(state).then(function() {
			return self.applyStagedChanges();
		}).then(function() {
			return callInitAction('zapret2', 'enable');
		}).then(function(success) {
			if (!success)
				throw new Error('Command failed');
			// restart picks up the newly committed scope; start boots a
			// currently stopped engine (enable alone doesn't run it)
			return callInitAction('zapret2', self.serviceRunning ? 'restart' : 'start');
		}).then(function(success) {
			if (!success)
				throw new Error('Command failed');
			self.mode = target;
			self.savedScopeHosts = (target === 'video');
			self.setModeTab(target);
			self.syncModeSliders();
			ui.addNotification(null, E('p', tr('%s is on', '%s включён').format(label)));
			return self.updateStatus();
		}).catch(function(err) {
			ui.addNotification(null, E('p', tr('Unable to enable %s: %s', 'Не удалось включить %s: %s').format(label, err.message || err)));
			self.mode = current;
			self.syncModeSliders();
		}).then(function() {
			self.modeBusy = false;
		});
	},

	handleModeToggle: function(mode, checked) {
		var self = this;
		if (this.modeBusy)
			return Promise.resolve(false);

		// checked=false can only mean the currently-active mode is being
		// switched off (the other slider is already off); checked=true is
		// an explicit enable request even when mode is unchanged (engine
		// was stopped out-of-band) — route both through toggleMode.
		if (!checked && this.mode !== (mode === 'video' ? 'video' : 'masq'))
			return Promise.resolve(false);

		return this.toggleMode(mode, checked);
	},

	collectState: function() {
		// Snapshot of everything this page manages, as Save & Apply would
		// commit it. Built from the live DOM each call so staging always
		// captures exactly what the user is looking at.
		var checked = [];
		for (var id in this.strategyChecks) {
			if (this.strategyChecks[id].checked)
				checked.push(id);
		}
		var cov = this.ifaceCoverage();
		return {
			// active mode wins; while the engine is off, fall back to the
			// last saved scope so Save & Apply never silently flips it
			hostsScope: (this.mode === 'video') ? true : (this.mode === 'masq') ? false : this.savedScopeHosts,
			strategies: checked,
			hosts: this.collectHostList(),
			wan4: cov.v4,
			wan6: cov.v6,
			ifaceCount: cov.count
		};
	},

	saveUciState: function(state) {
		// Write the current UI into the UCI staging area — the same
		// server-side queue every native LuCI page uses — then refresh the
		// stock "Unsaved Changes" header indicator. Nothing is applied yet.
		// Like stock CBI forms, only options that actually differ are
		// written, so the queued diff stays minimal (one record per field).
		var cur = uci.get('zapret2', 'main');
		if (cur == null) {
			uci.add('zapret2', 'zapret2', 'main');
			cur = {};
		}
		// Auto mode (all rows checked) = empty wan lists (don't pin).
		// Pinned mode (some rows unchecked) = only those rows' names.
		var allChecked = (this.ifaceRows || []).length > 0 &&
			(this.ifaceRows || []).every(function(r) { return r.cb && r.cb.checked; });
		var wan4Val = allChecked ? '' : (state.wan4 || []).join(' ');
		var wan6Val = allChecked ? '' : (state.wan6 || []).join(' ');
		var scopeVal = state.hostsScope ? 'hostlist' : 'all';
		var strategyVal = (state.strategies || []).join(' ');
		var hostVal = (state.hosts || []).join(' ');
		var n = 0;
		if ((cur.scope || 'all') !== scopeVal) {
			uci.set('zapret2', 'main', 'scope', scopeVal);
			n++;
		}
		if (!sameUciList(cur.strategy, strategyVal)) {
			uci.set('zapret2', 'main', 'strategy', strategyVal);
			n++;
		}
		if (!sameUciList(cur.wan4, wan4Val)) {
			uci.set('zapret2', 'main', 'wan4', wan4Val);
			n++;
		}
		if (!sameUciList(cur.wan6, wan6Val)) {
			uci.set('zapret2', 'main', 'wan6', wan6Val);
			n++;
		}
		if (!sameUciList(cur.host, hostVal)) {
			uci.set('zapret2', 'main', 'host', hostVal);
			n++;
		}
		return uci.save().then(function() {
			return uci.changes();
		}).then(function(changes) {
			ui.changes.renderChangeIndicator(changes || {});
			return n;
		});
	},

	applyStagedChanges: function() {
		// Commit whatever is currently staged through the same endpoint the
		// native changes popup uses. Stock semantics: HTTP 204 means the
		// commit succeeded, anything else must be surfaced instead of
		// silently leaving the change pending. Always refresh the header
		// indicator afterwards so a just-committed change never lingers as
		// a phantom "Unsaved Changes" entry.
		return request.request(L.url('admin/uci', 'apply_unchecked'), {
			method: 'post',
			query: { sid: L.env.sessionid, token: L.env.token }
		}).then(function(res) {
			if (!res || res.status !== 204)
				throw new Error('apply failed (HTTP ' + (res && res.status ? res.status : '?') + ')');
			return uci.changes();
		}).then(function(changes) {
			ui.changes.renderChangeIndicator(changes || {});
		});
	},

	stageChanges: function() {
		// Save: stage the current UI. It shows up in the native
		// "Unsaved Changes" header indicator and is applied only through
		// Save & Apply — here or in the stock changes popup.
		var state = this.collectState();
		if (!state.ifaceCount) {
			ui.addNotification(null, E('p', tr(
				'Select at least one interface. Nothing was saved — the last saved selection stays active.',
				'Выберите хотя бы один интерфейс. Ничего не сохранено — остаётся активной последняя сохранённая настройка.'
			)));
			return Promise.resolve(false);
		}
		return this.saveUciState(state).then(function(n) {
			ui.addNotification(null, E('p', n ? tr(
				'Changes staged — open "Unsaved Changes" in the top bar to review, apply or revert them.',
				'Изменения отложены — откройте «Несохранённые изменения» в верхней панели, чтобы проверить, применить или отменить их.'
			) : tr(
				'No changes — the page already matches the saved configuration.',
				'Нет изменений — страница уже соответствует сохранённой конфигурации.'
			)));
			return true;
		}).catch(function(err) {
			ui.addNotification(null, E('p', tr(
				'Unable to stage changes: %s',
				'Не удалось отложить изменения: %s'
			).format(err.message || err)));
			return false;
		});
	},

	updateStatus: function() {
		var self = this;
		return this.fetchData().then(function(data) {
			self.applyData(data);
		});
	},

	formatSpeed: function(value) {
		if (value == null || isNaN(parseFloat(value)))
			return '—';
		return String(parseFloat(value).toFixed(1)) + ' ' + tr('Mbit/s', 'Мбит/с');
	},

	renderSpeedLeg: function(valueNode, spinNode, value, spinning) {
		spinNode.style.display = spinning ? 'inline-block' : 'none';
		if (spinning) {
			valueNode.textContent = '';
			valueNode.title = '';
		} else {
			valueNode.textContent = this.formatSpeed(value);
		}
	},

	ifaceLabel: function(row) {
		var logical = (row.v4 || []).concat(row.v6 || []);
		return row.device + (logical.length ? (' (' + logical.join('/') + ')') : '');
	},

	ifaceCoverage: function() {
		// Logical names of the currently checked devices, split by family.
		var v4 = [], v6 = [];
		(this.ifaceRows || []).forEach(function(r) {
			if (!(r.cb && r.cb.checked))
				return;
			v4 = v4.concat(r.v4 || []);
			v6 = v6.concat(r.v6 || []);
		});
		return {
			v4: v4,
			v6: v6,
			count: (this.ifaceRows || []).filter(function(r) { return r.cb && r.cb.checked; }).length
		};
	},

	rebuildSpeedIfaceSelect: function() {
		// Rebuild the speed-test select from the CURRENTLY CHECKED devices.
		// Down devices stay listed (per decision: all configured + (down)
		// marker) but are not selectable.
		var self = this;
		var select = this.speedIfaceSelect;
		if (!select)
			return;
		var chosen = select.value || '';
		while (select.firstChild)
			select.removeChild(select.firstChild);
		var ph = E('option', { 'value': '' }, tr('Select interface…', 'Выберите интерфейс…'));
		ph.disabled = true;
		ph.selected = true;
		select.appendChild(ph);
		(this.ifaceRows || []).forEach(function(r) {
			if (!(r.cb && r.cb.checked))
				return;
			var opt = E('option', { 'value': r.device },
				self.ifaceLabel(r) + (r.up ? '' : ' (' + tr('down', 'не в сети') + ')'));
			if (!r.up)
				opt.disabled = true;
			if (r.device === chosen)
				opt.selected = true;
			select.appendChild(opt);
		});
		this.btnSpeedRun.disabled = this.speedBusy || !select.value;
	},

	buildIfaceRows: function(rawRows) {
		// Build the Interfaces checkboxes once, from the live `interfaces`
		// payload. Later polls only refresh up/down markers + the speed
		// select; the checked state below (or the user) owns the selection.
		var self = this;
		this.ifaceRows = [];
		rawRows.forEach(function(r) {
			if (!r || !r.device)
				return;
			var row = {
				device: r.device,
				v4: r.v4 || [],
				v6: r.v6 || [],
				up: !!r.up
			};
			row.cb = E('input', { 'type': 'checkbox', 'data-device': row.device });
			row.cb.addEventListener('click', function() { self.rebuildSpeedIfaceSelect(); });
			row.downNode = E('span', { 'class': 'z2-speed-source' }, '');
			self.ifaceRows.push(row);
			self.ifaceBox.appendChild(E('label', { 'class': 'z2-strat-row' }, [
				row.cb,
				E('span', {}, self.ifaceLabel(row)),
				row.downNode
			]));
		});
	},

	handleSpeedRun: function(ev) {
		var self = this;
		if (ev && ev.currentTarget)
			ev.currentTarget.blur();

		var dev = this.speedIfaceSelect && this.speedIfaceSelect.value;
		if (!dev) {
			this.speedMessage.className = 'z2-speed-msg z2-msg-error';
			this.speedMessage.textContent = tr(
				'Select an uplink interface to test first.',
				'Сначала выберите интерфейс для теста.'
			);
			ui.addNotification(null, E('p', tr(
				'Select an uplink interface to test first.',
				'Сначала выберите интерфейс для теста.'
			)));
			return true;
		}

		if (this.speedTimer) {
			clearInterval(this.speedTimer);
			this.speedTimer = null;
		}
		if (this.speedPolls)
			this.speedPolls = 0;

		this.speedBusy = true;
		this.btnSpeedRun.disabled = true;
		this.speedBadge.textContent = tr('Starting...', 'Запуск...');
		this.speedBadge.className = 'z2-badge z2-stopped';

		return safeExec('/usr/sbin/zapret2-speedtest', [ 'start', dev ]).then(function() {
			return self.refreshSpeedStatus();
		}).catch(function() {
			self.speedBusy = false;
			self.rebuildSpeedIfaceSelect();
			self.speedBadge.textContent = tr('Failed to start', 'Не удалось запустить');
			self.speedBadge.className = 'z2-badge z2-error';
			return true;
		});
	},

	refreshSpeedStatus: function() {
		var self = this;
		return fs.read('/tmp/zapret2_speedtest.json').catch(function() { return ''; }).then(function(text) {
			var json = {};
			try {
				json = JSON.parse((text || '').trim() || '{}');
			} catch (e) {
				json = {};
			}
			return self.applySpeedStatus(json);
		});
	},

	applySpeedStatus: function(json) {
		var self = this;
		var status = json.status || 'idle';
		var running = (status === 'running');
		var phase = json.phase || '';
		var wb = json.without && json.without.speed_mbps;
		var w = json.with && json.with.speed_mbps;
		var ref = json.reference && json.reference.speed_mbps;
		var src = json.reference && json.reference.source;
		var imp = json.improvement;

		this.btnSpeedRun.disabled = this.speedBusy || !(this.speedIfaceSelect && this.speedIfaceSelect.value);
		this.speedRefSource.textContent = (ref != null && src) ? ('(' + src + ')') : '';
		this.renderSpeedLeg(this.speedRefValue, this.speedRefSpin, ref, running && phase === 'reference');
		this.renderSpeedLeg(this.speedWithoutValue, this.speedWithoutSpin, wb, running && phase === 'without');
		this.renderSpeedLeg(this.speedWithValue, this.speedWithSpin, w, running && phase === 'with');

		if (status === 'running') {
			this.speedBusy = true;
			this.speedBadge.textContent = tr('Running...', 'Выполняется...');
			this.speedBadge.className = 'z2-badge z2-running';
			this.speedMessage.className = 'z2-speed-msg';
			var phaseMsg = {
				'reference': tr('Measuring the raw-connection reference…', 'Измеряем референс (сырое соединение)…'),
				'without': tr('Measuring fast.com WITHOUT optimizer…', 'Измеряем fast.com БЕЗ оптимизатора…'),
				'with': tr('Measuring fast.com WITH optimizer…', 'Измеряем fast.com С оптимизатором…')
			}[phase] || tr(
				'Measuring the line — roughly 30-60 s depending on your connection.',
				'Измеряем линию — примерно 30-60 секунд в зависимости от соединения.'
			);
			if (json.interface)
				phaseMsg += ' · ' + tr('interface: %s', 'интерфейс: %s').format(json.interface);
			this.speedMessage.textContent = phaseMsg;
			this.btnSpeedRun.disabled = true;
			if (!this.speedTimer) {
				this.speedPolls = 0;
				this.speedTimer = setInterval(function() {
					if (++self.speedPolls > 80) {
						clearInterval(self.speedTimer);
						self.speedTimer = null;
						self.btnSpeedRun.disabled = false;
						return;
					}
					self.refreshSpeedStatus();
				}, 3000);
			}
			return true;
		}

		if (this.speedTimer) {
			clearInterval(this.speedTimer);
			this.speedTimer = null;
		}
		this.speedRefSource.textContent = this.speedRefSource.textContent || '';

		if (status === 'error') {
			this.speedBusy = false;
			this.speedBadge.textContent = tr('Error', 'Ошибка');
			this.speedBadge.className = 'z2-badge z2-error';
			this.speedBadge.title = (json.message || '') + (json.detail ? (' — ' + json.detail) : '');
			this.speedMessage.className = 'z2-speed-msg z2-msg-error';
			this.speedMessage.textContent = (json.message || tr('The test failed.', 'Тест завершился ошибкой.')) +
				(json.detail ? (' — ' + json.detail) : '');
			this.speedRefSpin.style.display = 'none';
			this.speedWithoutSpin.style.display = 'none';
			this.speedWithSpin.style.display = 'none';
			return true;
		}

		if (status === 'complete') {
			this.speedBusy = false;
			this.speedBadge.textContent = tr('Complete', 'Готово');
			this.speedBadge.className = 'z2-badge z2-running';
			this.speedBadge.title = tr('Last run: %s', 'Последний запуск: %s').format(json.timestamp || '—');
			this.speedMessage.className = 'z2-speed-msg';
			var doneMsg = (json.interface ? tr('Interface: %s', 'Интерфейс: %s').format(json.interface) + ' · ' : '') +
				tr('Last run: %s', 'Последний запуск: %s').format(json.timestamp || '—');
			doneMsg += (json.engine_running
				? ' · ' + tr('optimizer was running — paused for the test and restored', 'оптимизатор был запущен — приостановлен на время теста и восстановлен')
				: ' · ' + tr('optimizer off — numbers show if it would help', 'оптимизатор выключен — числа показывают, поможет ли он'));
			doneMsg += (imp ? ' · ' + tr('improvement %s', 'улучшение %s').format(imp) : '');
			this.speedMessage.textContent = doneMsg;
			return true;
		}

		this.speedBadge.textContent = tr('Not run yet', 'Ещё не запускался');
		this.speedBadge.className = 'z2-badge z2-stopped';
		this.speedBadge.title = '';
		this.speedMessage.className = 'z2-speed-msg';
		this.speedMessage.textContent = '';
		this.speedWithoutValue.textContent = '—';
		this.speedWithValue.textContent = '—';
		this.speedRefValue.textContent = '—';
		this.speedWithoutValue.title = '';
		this.speedWithValue.title = '';
		this.speedRefValue.title = '';
		this.speedRefSpin.style.display = 'none';
		this.speedWithoutSpin.style.display = 'none';
		this.speedWithSpin.style.display = 'none';
		this.speedBusy = false;
		return true;
	},

	applyData: function(data) {
		var initList = data[0] || {};
		var serviceList = data[1] || {};
		var configText = data[2] || '';
		var listTable = data[3] || { code: -1, stdout: '', stderr: '' };
		var versionRes = data[4] || { code: -1, stdout: '', stderr: '' };

		var enabled = !!(initList.zapret2 && initList.zapret2.enabled);
		var info = getServiceInfo(serviceList);
		var state = getStateInfo(enabled, info);
		var versionText = trimText(versionRes.stdout || versionRes.stderr || tr('Unknown', 'Неизвестно'));
		var rulesText = trimText(listTable.stdout || listTable.stderr || tr('No queue rules output', 'Нет вывода queue rules'));

		// refresh the up/down state of every interface row from the live
		// `interfaces` call; the checkbox selection itself is left untouched
		// so a 5s poll never clobbers an in-progress edit
		var ifaceRes = data[5] || { code: -1, stdout: '', stderr: '' };
		var parsed = [];
		try {
			parsed = JSON.parse(ifaceRes.stdout || '[]') || [];
		} catch (e) {
			parsed = [];
		}
		(this.ifaceRows || []).forEach(function(r) {
			var found = null;
			for (var k = 0; k < parsed.length; k++) {
				if (parsed[k].device === r.device)
					found = parsed[k];
			}
			r.up = !!(found && found.up);
			if (r.downNode)
				r.downNode.textContent = r.up ? '' : ('(' + tr('down', 'не в сети') + ')');
		});

		this.statusBadge.textContent = state.label;
		this.statusBadge.className = 'z2-badge ' + state.className;
		this.instancesValue.textContent = info.totalCount ? String(info.runningCount) + ' / ' + String(info.totalCount) : '0';
		this.pidsValue.textContent = info.pids.length ? info.pids.join(', ') : '—';
		this.versionValue.textContent = versionText;
		this.profileCountValue.textContent = info.profileCount ? String(info.profileCount) : '—';

		// data[6] is the {code,stdout,stderr} result of `zapret2-speedtest
		// packets`; read its stdout, not the wrapper object (parsing the
		// object stringified the whole result -> always NaN -> card read 0).
		var pktRes = data[6] || {};
		var pkts = parseInt(String(pktRes.stdout != null ? pktRes.stdout : '').trim(), 10);
		if (isNaN(pkts))
			pkts = 0;
		var nowTs = new Date().getTime();
		var pktRate = 0;
		if (this.pktLast && this.pktLast.t) {
			var dt = (nowTs - this.pktLast.t) / 1000;
			if (dt > 0)
				pktRate = Math.round((pkts - this.pktLast.n) / dt);
			if (pktRate < 0)
				pktRate = 0;
		}
		this.pktLast = { t: nowTs, n: pkts };
		this.packetsValue.textContent = pkts.toLocaleString() + (pktRate > 0 ? (' (' + pktRate + '/s)') : '');
		this.commandArea.value = info.formattedCommand || '';
		this.rulesArea.value = rulesText;
		this.configArea.value = trimText(configText);

		// The edit form (tabs / sliders / strategies / hosts / interfaces) is
		// owned by the UCI config and is populated once in render(); status
		// polls must never clobber an in-progress edit.
		this.serviceRunning = info.running;
		if (this.speedWarn)
			this.speedWarn.style.display = this.serviceRunning ? '' : 'none';

		this.refreshSpeedStatus();
		this.rebuildSpeedIfaceSelect();
	},

	render: function(data) {
		var self = this;

		// Form state comes from the UCI config (the single source of
		// truth); live status below never rewrites it.
		var uciCfg = uci.get('zapret2', 'main') || {};
		var cfgStrategies = (uciCfg.strategy != null) ? toUciList(uciCfg.strategy) : null;
		var cfgHosts = (uciCfg.host != null) ? toUciList(uciCfg.host) : null;
		var cfgWan = { v4: toUciList(uciCfg.wan4), v6: toUciList(uciCfg.wan6) };

		this.statusBadge = E('span', { 'class': 'z2-badge z2-stopped' }, tr('Loading...', 'Загрузка...'));
		this.instancesValue = E('span', '—');
		this.pidsValue = E('span', '—');
		this.versionValue = E('span', '—');
		this.profileCountValue = E('span', '—');
		this.packetsValue = E('span', '—');
		this.pktLast = null;

		this.commandArea = E('textarea', {
			'class': 'cbi-input-textarea z2-textarea z2-compact',
			'readonly': 'readonly',
			'wrap': 'off'
		});
		this.rulesArea = E('textarea', {
			'class': 'cbi-input-textarea z2-textarea',
			'readonly': 'readonly',
			'wrap': 'off'
		});
		this.configArea = E('textarea', {
			'class': 'cbi-input-textarea z2-textarea',
			'readonly': 'readonly',
			'wrap': 'off'
		});

		this.tabVideo = E('button', {
			'class': 'z2-tab',
			'click': ui.createHandlerFn(this, function() { return self.setModeTab('video'); })
		}, tr('Video optimizer', 'Видео-оптимизатор'));
		this.tabMasq = E('button', {
			'class': 'z2-tab',
			'click': ui.createHandlerFn(this, function() { return self.setModeTab('masq'); })
		}, tr('Traffic masquerade', 'Маскировка трафика'));
		this.sliderVo = E('input', {
			'type': 'checkbox', 'class': 'z2-switch-input',
			'change': ui.createHandlerFn(this, function(ev) { return self.handleModeToggle('video', ev.currentTarget.checked); })
		});
		this.sliderMasq = E('input', {
			'type': 'checkbox', 'class': 'z2-switch-input',
			'change': ui.createHandlerFn(this, function(ev) { return self.handleModeToggle('masq', ev.currentTarget.checked); })
		});
		function makeSwitch(input) {
			return E('label', { 'class': 'z2-switch' }, [
				input,
				E('span', { 'class': 'z2-switch-track' }, [
					E('span', { 'class': 'z2-switch-knob' })
				])
			]);
		}
		this.sliderVoSwitch = makeSwitch(this.sliderVo);
		this.sliderMasqSwitch = makeSwitch(this.sliderMasq);
		this.mode = null;   // 'video' | 'masq' | null
		this.modeTab = 'video';
		this.modeBusy = false;
		this.savedScopeHosts = (uciCfg.scope === 'hostlist');
		// Slider state reflects live reality: a stopped engine shows both
		// OFF (calling an engine into service is what the switch is for).
		if (getServiceInfo(data[1] || {}).running) {
			if (uciCfg.scope === 'hostlist')
				this.mode = 'video';
			else
				this.mode = 'masq';
		}

		this.btnSpeedRun = E('button', {
			'class': 'btn cbi-button-action important',
			'click': ui.createHandlerFn(this, function(ev) { return self.handleSpeedRun(ev); })
		}, tr('Run comparison', 'Запустить сравнение'));
		this.btnSpeedRun.disabled = true;
		this.speedIfaceSelect = E('select', { 'class': 'cbi-input-select' });
		this.ifaceRows = [];
		this.ifaceBox = E('div', { 'class': 'z2-strat-box' });
		this.speedBadge = E('span', { 'class': 'z2-badge z2-stopped' }, tr('Not run yet', 'Ещё не запускался'));
		this.speedWithoutValue = E('span', { 'class': 'z2-speed-value' }, '—');
		this.speedWithValue = E('span', { 'class': 'z2-speed-value' }, '—');
		this.speedRefValue = E('span', { 'class': 'z2-speed-value' }, '—');
		this.speedRefSource = E('span', { 'class': 'z2-speed-source' }, '');
		this.speedRefSpin = E('span', { 'class': 'z2-spin' });
		this.speedWithoutSpin = E('span', { 'class': 'z2-spin' });
		this.speedWithSpin = E('span', { 'class': 'z2-spin' });
		this.speedMessage = E('div', { 'class': 'z2-speed-msg' }, '');
		this.speedWarn = E('div', { 'class': 'z2-speed-warn' }, tr(
			'Optimizer is running — it will be paused during the test.',
			'Оптимизатор запущен — на время теста он будет приостановлен.'
		));
		this.speedWarn.style.display = 'none';
		this.speedTimer = null;
		this.speedPolls = 0;
		this.speedBusy = false;

		this.strategyChecks = {};
		for (var si = 0; si < STRATEGY_CATALOG.length; si++) {
			(function(s) {
				var cb = E('input', { 'type': 'checkbox', 'data-strat': s.id });
				cb.checked = (cfgStrategies != null)
					? (cfgStrategies.indexOf(s.id) !== -1)
					: !!s.enabled;
				self.strategyChecks[s.id] = cb;
			})(STRATEGY_CATALOG[si]);
		}
		var stratToggleRows = STRATEGY_CATALOG.map(function(s) {
			return E('label', { 'class': 'z2-strat-row' }, [
				self.strategyChecks[s.id],
				' ',
				tr(s.labelEn, s.labelRu)
			]);
		});
		this.strategyBox = E('div', { 'class': 'z2-strat-box' }, stratToggleRows);

		this.btnSave = E('button', {
			'class': 'btn cbi-button-save important',
			'click': ui.createHandlerFn(this, function() { return self.handleSaveConfig(false); })
		}, tr('Save', 'Сохранить'));
		this.btnSaveApply = E('button', {
			'class': 'btn cbi-button-action important',
			'click': ui.createHandlerFn(this, function() { return self.handleSaveConfig(true); })
		}, tr('Save & Apply', 'Сохранить и применить'));

		this.hostListBox = E('div', { 'class': 'z2-hostlist-box' });
		this.hostRows = [];
		this.btnAddHost = E('button', {
			'class': 'btn cbi-button-action',
			'click': ui.createHandlerFn(this, function() { return self.addHostRow('', true); })
		}, tr('+ Add host', '+ Добавить хост'));

		this.panelVideo = E('div', { 'class': 'z2-panel z2-panel-open' }, [
			E('div', { 'class': 'z2-switch-row' }, [
				E('span', { 'class': 'z2-switch-label' }, tr('Video optimization', 'Оптимизация видео')),
				this.sliderVoSwitch
			]),
			E('div', { 'class': 'z2-maint-card' }, [ this.hostListBox, E('div', { 'class': 'z2-maint-row' }, [ this.btnAddHost ]) ])
		]);
		this.panelMasq = E('div', { 'class': 'z2-panel' }, [
			E('div', { 'class': 'z2-switch-row' }, [
				E('span', { 'class': 'z2-switch-label' }, tr('Traffic masquerade', 'Маскировка трафика')),
				this.sliderMasqSwitch
			]),
			E('div', { 'class': 'z2-maint-card' }, [
				E('div', { 'class': 'z2-maint-row' }, tr(
					'Everything goes through the bypass — no host lists involved.',
					'Весь трафик идёт через обход — списки хостов не участвуют.'
				))
			])
		]);

		poll.add(function() {
			return self.updateStatus();
		}, 5);

var page = E('div', { 'class': 'z2-page' }, [
	E('div', { 'class': 'cbi-section' }, [
		E('div', { 'class': 'cbi-section-node' }, [
			E('div', { 'class': 'z2-status-strip' }, [
				E('div', {}, [
					E('h2', { 'style': 'margin:0 0 6px 0;' }, 'Zapret2')
				]),
				this.statusBadge
			])
		])
	]),

	
			E('div', { 'class': 'z2-grid' }, [
				makeMetaCard(tr('Instances', 'Инстансы'), this.instancesValue),
				makeMetaCard('PID', this.pidsValue),
				makeMetaCard(tr('nfqws2 version', 'Версия nfqws2'), this.versionValue),
				makeMetaCard(tr('Profiles in command', 'Профили в команде'), this.profileCountValue),
				makeMetaCard(tr('Packets processed', 'Обработано пакетов'), this.packetsValue)
			]),

			E('div', { 'class': 'cbi-section' }, [
				E('div', { 'class': 'z2-section-header' }, [
					E('div', {}, [
						E('div', { 'class': 'z2-section-title' }, tr('Operating mode', 'Режим работы')),
						E('div', { 'class': 'z2-note' }, tr(
							'The mode slider starts the engine and enables its autorun in one move; switching it off stops the engine and disables autorun. The scope of the tab you are on is applied immediately.',
							'Слайдер режима запускает движок и включает его автозапуск одним движением; выключение останавливает движок и отключает автозапуск. Охват текущей вкладки применяется сразу.'
						))
					]),
					E('div', { 'class': 'z2-section-tools' }, [])
				]),
				E('div', { 'class': 'cbi-section-node' }, [
					E('div', { 'class': 'z2-tabbar' }, [ this.tabVideo, this.tabMasq ]),
					this.panelVideo,
					this.panelMasq
				]),
				E('div', { 'class': 'z2-note' }, tr(
					'The page refreshes automatically every 5 seconds.',
					'Страница обновляется автоматически раз в 5 секунд.'
				))
			]),

			E('div', { 'class': 'cbi-section' }, [
		E('div', { 'class': 'z2-section-header' }, [
			E('div', {}, [
				E('div', { 'class': 'z2-section-title' }, tr('Bypass recipe', 'Рецепт обхода')),
				E('div', { 'class': 'z2-note' }, tr(
					'Bypass strategies and interfaces apply together through Save & Apply below.',
					'Стратегии обхода и интерфейсы применяются вместе через «Сохранить и применить» ниже.'
				))
			]),
			E('div', { 'class': 'z2-section-tools' }, [])
		]),
		E('div', { 'class': 'z2-group-block' }, [
			E('div', { 'class': 'z2-group-title' }, tr('DPI bypass strategies', 'Стратегии обхода DPI')),
			E('div', { 'class': 'z2-subbox' }, [ this.strategyBox ]),
			E('div', { 'class': 'z2-group-title' }, tr('Interfaces', 'Интерфейсы')),
			E('div', { 'class': 'z2-subbox' }, [ this.ifaceBox ]),
			E('div', { 'class': 'z2-note' }, tr(
				'Interfaces are read live from the router — modems appear as you plug them in; the applied set is what is checked at Save time. Unchecking everything is refused so the last saved selection always stays active.',
				'Интерфейсы читаются с роутера в реальном времени — новые модемы появляются сами; применяется то, что отмечено в момент сохранения. Снять все галочки нельзя — остаётся активной последняя сохранённая настройка.'
			)),
			E('div', { 'class': 'z2-actions' }, [
				this.btnSave,
				this.btnSaveApply
			])
		])
	]),

	E('div', { 'class': 'cbi-section' }, [
		E('div', { 'class': 'z2-section-header' }, [
			E('div', { 'class': 'z2-section-title' }, tr(
				'Speed comparison',
				'Сравнение скорости'
			)),
			E('div', { 'class': 'z2-section-tools' }, [ this.speedIfaceSelect, this.btnSpeedRun ])
		]),
		E('div', { 'class': 'cbi-section-node' }, [
			E('div', { 'class': 'z2-status-strip' }, [ this.speedBadge ])
		]),
		E('div', { 'class': 'cbi-section-node' }, [
			E('div', { 'class': 'z2-speed-row' }, [
				tr('Reference (raw connection)', 'Референс (сырое соединение)'),
				E('span', { 'class': 'z2-speed-right' }, [ this.speedRefValue, this.speedRefSpin, this.speedRefSource ])
			]),
			E('div', { 'class': 'z2-speed-row' }, [
				tr('fast.com — with optimizer', 'fast.com — с оптимизатором'),
				E('span', { 'class': 'z2-speed-right' }, [ this.speedWithValue, this.speedWithSpin ])
			]),
			E('div', { 'class': 'z2-speed-row' }, [
				tr('fast.com — without optimizer', 'fast.com — без оптимизатора'),
				E('span', { 'class': 'z2-speed-right' }, [ this.speedWithoutValue, this.speedWithoutSpin ])
			])
		]),
		E('div', { 'class': 'cbi-section-node' }, [ this.speedWarn ]),
		E('div', { 'class': 'cbi-section-node' }, [ this.speedMessage ]),
		E('div', { 'class': 'z2-note' }, tr(
			'Compares the reference connection against fast.com with and without the optimizer. All values are raw Mbps.',
			'Сравнивает референсное соединение с fast.com с оптимизатором и без него. Все значения — «сырые» Мбит/с.'
		))
	]),

	E('details', { 'class': 'z2-advanced' }, [
		E('summary', tr('Advanced', 'Дополнительно')),
		E('div', {}, [

			makeTextSection(
				tr('Active nfqws2 command', 'Активная команда nfqws2'),
				tr('Current live command line of the running process.', 'Текущая живая командная строка процесса.'),
				this.commandArea,
				tr('nfqws2 command line', 'командная строка nfqws2'),
				this
			),
			makeTextSection(
				tr('Current queue rules', 'Текущие queue rules'),
				tr('Output of /etc/init.d/zapret2 list_table.', 'Вывод /etc/init.d/zapret2 list_table.'),
				this.rulesArea,
				tr('queue rules', 'queue rules'),
				this
			),
			makeTextSection(
				tr('Current /opt/zapret2/config', 'Текущий /opt/zapret2/config'),
				tr('Primary runtime configuration of zapret2 on the router.', 'Основной runtime-конфиг zapret2 на роутере.'),
				this.configArea,
				tr('zapret2 config', 'config zapret2'),
				this
			)
		])
	])
]);

		var ifacePayload = [];
		try {
			ifacePayload = JSON.parse((data[5] && data[5].stdout) || '[]') || [];
		} catch (e) {}
		this.buildIfaceRows(ifacePayload);

		// initial checked state: the UCI-pinned logical WAN names select
		// the covering devices; nothing pinned = all checked
		this.ifaceRows.forEach(function(r) {
			r.cb.checked = (!cfgWan.v4.length && !cfgWan.v6.length) ? true : rowCoveredBy(r, cfgWan);
		});

		// mode tabs from the UCI config; host editor always lives under the
		// video tab and hosts fall back to the shipped defaults only when
		// the UCI config has no host list at all
		this.setModeTab(this.mode === 'masq' ? 'masq' : 'video');
		this.syncModeSliders();
		this.buildHostRows((cfgHosts != null ? cfgHosts : DEFAULT_HOSTS).slice());

		this.applyData(data);
		this.rebuildSpeedIfaceSelect();
		return page;
	},

	handleSaveConfig: function(apply) {
		// Save (false) stages the current UI into the UCI changeset —
		// nothing is written or restarted. Save & Apply (true) stages,
		// commits through the same endpoint the native changes popup uses,
		// then restarts the engine onto the committed config.
		if (!apply)
			return this.stageChanges();
		return this.commitConfig();
	},

	commitConfig: function() {
		var self = this;
		var state = this.collectState();

		if (!state.ifaceCount) {
			ui.addNotification(null, E('p', tr(
				'Select at least one interface. Nothing was saved — the last saved selection stays active.',
				'Выберите хотя бы один интерфейс. Ничего не сохранено — остаётся активной последняя сохранённая настройка.'
			)));
			return Promise.resolve(false);
		}

		return this.saveUciState(state).then(function() {
			return self.applyStagedChanges();
		}).then(function() {
			// Conditional apply: restart only a running engine so the commit
			// picks up immediately. A stopped engine stays off — the change
			// is saved and applies on a later slider-ON (which regenerates
			// /opt/zapret2/config with NFQWS2_ENABLE + the new recipe).
			if (!self.serviceRunning)
				return null;
			return callInitAction('zapret2', 'restart');
		}).then(function() {
			ui.addNotification(null, E('p', self.serviceRunning
				? tr('Config saved and applied.', 'Конфиг сохранён и применён.')
				: tr('Config saved. It will apply the next time the engine starts.', 'Конфиг сохранён. Применится при следующем запуске движка.')
			));
			return self.updateStatus().then(function() { return true; });
		}).catch(function(err) {
			ui.addNotification(null, E('p', tr(
				'Unable to save config: %s',
				'Не удалось сохранить конфиг: %s'
			).format(err.message || err)));
			return false;
		});
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
