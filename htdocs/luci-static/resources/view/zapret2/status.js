'use strict';
'require view';
'require rpc';
'require fs';
'require poll';
'require ui';

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
			display: grid;
			grid-template-columns: repeat(auto-fit, minmax(220px, 1fr));
			gap: 10px;
			align-items: stretch;
			margin: 10px 0 12px 0;
		}
		.z2-page .cbi-section-node.z2-actions {
			padding: 4px 0;
		}
		.z2-actions .btn {
			display: inline-flex !important;
			align-items: center;
			justify-content: center;
			width: 100%;
			min-height: 42px;
			margin: 0 !important;
			padding: 10px 14px;
			border-radius: 10px;
			text-align: center;
			white-space: normal;
			line-height: 1.25;
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
			border: 1px solid var(--border-color-medium, rgba(255,255,255,.08));
			border-radius: 10px;
			background: var(--app-body-bg, rgba(255,255,255,.02));
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
		.z2-save-note {
			margin-top: 6px;
			font-size: 12px;
			opacity: .72;
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
 * Each DPI bypass technique maps to an nfqws2 `NFQWS2_OPT` profile block
 * following the grammar used by bol-van/zapret2 config.default and
 * blockcheck2.d. The QUIC profile is surfaced separately and is the
 * HTTP/3 (UDP 443) bypass.
 */
var STRATEGY_CATALOG = [
	{
		id: 'tls',
		labelEn: 'TLS fake + multidisorder',
		labelRu: 'TLS fake + multidisorder',
		enabled: true,
		quic: false,
		profile: '\n' +
			'--filter-tcp=443 --filter-l7=tls <HOSTLIST> --payload=tls_client_hello --lua-desync=fake:blob=fake_default_tls:tcp_md5:tcp_seq=-10000 --lua-desync=multidisorder:pos=1,midsld'
	},
	{
		id: 'http',
		labelEn: 'HTTP fake + multisplit',
		labelRu: 'HTTP fake + multisplit',
		enabled: true,
		quic: false,
		profile: '\n' +
			'--filter-tcp=80 --filter-l7=http <HOSTLIST> --payload=http_req --lua-desync=fake:blob=fake_default_http:tcp_md5 --lua-desync=multisplit:pos=method+2'
	},
	{
		id: 'quic',
		labelEn: 'QUIC (HTTP/3) bypass',
		labelRu: 'QUIC (HTTP/3) обход',
		enabled: true,
		quic: true,
		profile: '\n' +
			'--filter-udp=443 --filter-l7=quic <HOSTLIST_NOAUTO> --payload=quic_initial --lua-desync=fake:blob=fake_default_quic:repeats=6'
	}
];

function buildNfqwsOpt(checkedIds) {
	var parts = [];
	for (var i = 0; i < STRATEGY_CATALOG.length; i++) {
		var strat = STRATEGY_CATALOG[i];
		if (checkedIds.indexOf(strat.id) !== -1) {
			parts.push(strat.profile);
		}
	}
	if (!parts.length)
		return '\t';
	return '\n' + parts.join('\n--new') + '\n';
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
			safeExec('/opt/zapret2/nfq2/nfqws2', [ '--version' ])
		]);
	},

	handleServiceAction: function(action, ev) {
		var self = this;
		if (ev && ev.currentTarget)
			ev.currentTarget.blur();

		return callInitAction('zapret2', action).then(function(success) {
			if (!success)
				throw new Error('Command failed');

			ui.addNotification(null, E('p', tr('Action executed: %s', 'Команда выполнена: %s').format(action)));
			return self.updateStatus();
		}).catch(function(err) {
			ui.addNotification(null, E('p', tr('Unable to execute action "%s": %s', 'Не удалось выполнить действие "%s": %s').format(action, err.message || err)));
		});
	},

	updateStatus: function() {
		var self = this;
		return this.fetchData().then(function(data) {
			self.applyData(data);
		});
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

		this.statusBadge.textContent = state.label;
		this.statusBadge.className = 'z2-badge ' + state.className;
		this.autorunValue.textContent = enabled ? tr('Enabled', 'Включён') : tr('Disabled', 'Выключен');
		this.instancesValue.textContent = info.totalCount ? String(info.runningCount) + ' / ' + String(info.totalCount) : '0';
		this.pidsValue.textContent = info.pids.length ? info.pids.join(', ') : '—';
		this.versionValue.textContent = versionText;
		this.profileCountValue.textContent = info.profileCount ? String(info.profileCount) : '—';
		this.commandArea.value = info.formattedCommand || '';
		this.rulesArea.value = rulesText;
		this.configArea.value = trimText(configText);

		this.btnEnable.disabled = enabled;
		this.btnDisable.disabled = !enabled;
		this.btnStart.disabled = info.running;
		this.btnRestart.disabled = !info.running;
		this.btnStop.disabled = !info.running;
	},

	render: function(data) {
		var self = this;

		this.statusBadge = E('span', { 'class': 'z2-badge z2-stopped' }, tr('Loading...', 'Загрузка...'));
		this.autorunValue = E('span', '—');
		this.instancesValue = E('span', '—');
		this.pidsValue = E('span', '—');
		this.versionValue = E('span', '—');
		this.profileCountValue = E('span', '—');

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

		this.btnEnable = E('button', {
			'class': 'btn cbi-button-save important',
			'click': ui.createHandlerFn(this, function(ev) { return self.handleServiceAction('enable', ev); })
		}, tr('Enable autorun', 'Включить автозапуск'));
		this.btnDisable = E('button', {
			'class': 'btn cbi-button-negative important',
			'click': ui.createHandlerFn(this, function(ev) { return self.handleServiceAction('disable', ev); })
		}, tr('Disable autorun', 'Выключить автозапуск'));
		this.btnStart = E('button', {
			'class': 'btn cbi-button-action',
			'click': ui.createHandlerFn(this, function(ev) { return self.handleServiceAction('start', ev); })
		}, tr('Start', 'Запустить'));
		this.btnRestart = E('button', {
			'class': 'btn cbi-button-action',
			'click': ui.createHandlerFn(this, function(ev) { return self.handleServiceAction('restart', ev); })
		}, tr('Restart', 'Перезапустить'));
		this.btnStop = E('button', {
			'class': 'btn cbi-button-negative',
			'click': ui.createHandlerFn(this, function(ev) { return self.handleServiceAction('stop', ev); })
		}, tr('Stop', 'Остановить'));
		this.btnRefresh = E('button', {
			'class': 'btn',
			'click': ui.createHandlerFn(this, function() { return self.updateStatus(); })
		}, tr('Refresh', 'Обновить'));

		this.strategyChecks = {};
		for (var si = 0; si < STRATEGY_CATALOG.length; si++) {
			(function(s) {
				var cb = E('input', { 'type': 'checkbox', 'data-strat': s.id });
				if (s.enabled)
					cb.checked = true;
				self.strategyChecks[s.id] = cb;
			})(STRATEGY_CATALOG[si]);
		}
		var stratToggleRows = STRATEGY_CATALOG.map(function(s) {
			return E('label', { 'class': 'z2-strat-row' }, [
				self.strategyChecks[s.id],
				' ',
				tr(s.labelEn, s.labelRu),
				s.quic ? E('span', { 'class': 'z2-badge z2-running' }, 'QUIC') : ''
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

		poll.add(function() {
			return self.updateStatus();
		}, 5);

		var page = E('div', { 'class': 'z2-page' }, [
			E('div', { 'class': 'cbi-section' }, [
				E('div', { 'class': 'cbi-section-node' }, [
					E('div', { 'class': 'z2-status-strip' }, [
						E('div', {}, [
							E('h2', { 'style': 'margin:0 0 6px 0;' }, 'Zapret2'),
							E('div', { 'class': 'z2-muted' }, tr(
								'Minimal panel for a manually installed zapret2 on Flint 2.',
								'Мини-панель для вручную установленного zapret2 на Flint 2.'
							))
						]),
						this.statusBadge
					])
				])
			]),

			E('div', { 'class': 'z2-grid' }, [
				makeMetaCard(tr('Autorun', 'Автозапуск'), this.autorunValue),
				makeMetaCard(tr('Instances', 'Инстансы'), this.instancesValue),
				makeMetaCard('PID', this.pidsValue),
				makeMetaCard(tr('nfqws2 version', 'Версия nfqws2'), this.versionValue),
				makeMetaCard(tr('Profiles in command', 'Профили в команде'), this.profileCountValue)
			]),

			E('div', { 'class': 'cbi-section' }, [
				E('div', { 'class': 'z2-section-header' }, [
					E('div', { 'class': 'z2-section-title' }, tr('Service control', 'Управление сервисом')),
					E('div', { 'class': 'z2-section-tools' }, [ this.btnRefresh ])
				]),
				E('div', { 'class': 'cbi-section-node z2-actions' }, [
					this.btnEnable,
					this.btnDisable,
					this.btnStart,
					this.btnRestart,
					this.btnStop
				]),
				E('div', { 'class': 'z2-note' }, tr(
					'The page refreshes automatically every 5 seconds.',
					'Страница обновляется автоматически раз в 5 секунд.'
				))
			]),

			E('div', { 'class': 'cbi-section' }, [
				E('div', { 'class': 'z2-section-header' }, [
					E('div', { 'class': 'z2-section-title' }, tr(
						'DPI bypass strategies',
						'Стратегии обхода DPI'
					)),
					E('div', { 'class': 'z2-note' }, tr(
						'Select the bypass techniques, then Save (write config) or Save & Apply (write config and restart the service). No live changes happen until you apply.',
						'Выберите техники обхода, затем «Сохранить» (записать конфиг) или «Сохранить и применить» (записать конфиг и перезапустить сервис). Ничего не меняется, пока вы не примените.'
					))
				]),
				E('div', { 'class': 'cbi-section-node' }, [ this.strategyBox ]),
				E('div', { 'class': 'cbi-section-node z2-actions' }, [
					this.btnSave,
					this.btnSaveApply
				])
			]),

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
		]);

		this.applyData(data);
		return page;
	},

	handleSaveConfig: function(apply) {
		var self = this;

		var checked = [];
		for (var id in this.strategyChecks) {
			if (this.strategyChecks[id].checked)
				checked.push(id);
		}
		var opt = buildNfqwsOpt(checked);
		var optLine = 'NFQWS2_OPT="' + opt + '"';
		var enableLine = 'NFQWS2_ENABLE=1';

		return fs.read('/opt/zapret2/config').catch(function() { return ''; }).then(function(current) {
			var lines = (current || '').split('\n');
			var out = [];
			var inOpt = false;

			for (var i = 0; i < lines.length; i++) {
				var line = lines[i];

				// drop the entire old NFQWS2_OPT multi-line quoted block,
				// or a single-line NFQWS2_OPT="..." value
				if (inOpt) {
					if (line.trim() === '"')
						inOpt = false;
					continue;
				}
				if (/^NFQWS2_OPT=/.test(line)) {
					if (!/="[^"]*"$/.test(line)) {
						// opening quote not closed on this line -> multi-line block
						inOpt = true;
					}
					continue;
				}
				// drop any existing enable line; a fresh one is appended below
				if (/^NFQWS2_ENABLE=/.test(line)) {
					continue;
				}

				out.push(line);
			}

			// append the fresh option + enable lines
			out.push(optLine);
			out.push(enableLine);

			var body = out.join('\n') + '\n';
			return fs.write('/opt/zapret2/config', body).then(function() {
				ui.addNotification(null, E('p', tr(
					'Config saved. Selected strategy: %s.',
					'Конфиг сохранён. Выбранная стратегия: %s.'
				).format(checked.join(', ') || tr('none', 'нет'))));
				if (apply) {
					return self.handleServiceAction('restart', null);
				}
				return true;
			}).catch(function(err) {
				ui.addNotification(null, E('p', tr(
					'Unable to save config: %s',
					'Не удалось сохранить конфиг: %s'
				).format(err.message || err)));
				return false;
			});
		});
	},

	handleSave: null,
	handleSaveApply: null,
	handleReset: null
});
