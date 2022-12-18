/**
 * This content script disbales the `cmd`/`ctrl` + `s` shortcut.
 */
const IS_MAC = (navigator?.userAgentData?.platform || navigator?.platform)
	.toLowerCase()
	.includes('mac');

const settingCache = {};
// prime cache
chrome.storage.sync.get(null, (result) => {
	for (const key in result) {
		// if is option
		if (key.startsWith('option-')) {
			// Remove `option-` prefix
			settingCache[key.slice(7)] = result[key];
		}
	}
});
chrome.storage.onChanged.addListener((changes, areaName) => {
	if (areaName === 'sync') {
		for (const key in changes) {
			// Remove `option-` prefix
			settingCache[key.slice(7)] = changes[key].newValue;
		}
	}
});

const actions = {
	// Tests must use cache (rather than await chrome.storage) to be able to preventDefault.
	// You can not use await otherwise, the default behavior will be executed before you're able to preventDefault
	disableSave: {
		test: (e) => {
			return (
				settingCache['disable-save'] &&
				(IS_MAC ? e.metaKey : e.ctrlKey) &&
				e.key === 's'
			);
		},
		preventDefault: true,
		response: async (e) => {
			console.info('LeetCode++ disabled the save shortcut');

			if (await getOption('save-reinforcement')) {
				correctiveFeedback();
			}
		},
	},
	disableVSCodeFormat: {
		test: (e) => {
			return settingCache['disable-vscode-format'] && e.key === 'Ï';
		},
		preventDefault: true,
		response: async (e) => {
			console.info('LeetCode++ disabled the VSCode format shortcut');

			if (await getOption('format-reinforcement')) {
				correctiveFeedback();
			}
		},
	},
};

document.addEventListener(
	'keydown',
	async (e) => {
		// Get relevant actions (by testing all actions)
		const relevantActions = Object.keys(actions)
			.map((key) => {
				if (actions[key].test(e)) {
					return actions[key];
				}
			})
			.filter(Boolean);

		// Prevent default (if necessary)
		relevantActions.some((a) => {
			if (a.preventDefault) {
				e.preventDefault();
				return true;
			}
		});

		// Run response functions
		relevantActions.forEach((a) => {
			a.response?.(e);
		});
	},
	false
);

/**
 * Condition the user with negative reinforcement to stop hitting the save shortcut 🙈
 */
const EDIITOR_SELECTORS = [
	'[role="code"]', // New UI (2022)
	'.react-codemirror2', // Old UI (pre-2022)
].join(', ');
const correctiveFeedback = () => {
	const editor = document.querySelector(EDIITOR_SELECTORS);
	$(editor).effect('shake', { times: 2, distance: 4, direction: 'up' }, 100);
};

/**
 * Get setting option from storage
 */
const getOption = async (name) => {
	name = `option-${name}`;
	return new Promise((resolve) => {
		chrome.storage.sync.get(name, (result) => {
			resolve(result[name]);
		});
	});
};
