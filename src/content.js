(function () {
  'use strict';

  if (window.__jsonViewLoaded) return;

  function detectJSON() {
    const ct = (document.contentType || '').toLowerCase();
    const isJSONMime = ct.includes('application/json') ||
                       ct.includes('text/json') ||
                       ct.includes('+json');

    if (isJSONMime) {
      const pre = document.querySelector('body > pre');
      return pre ? pre.textContent : document.body.textContent;
    }

    const children = document.body.children;
    if (children.length === 0 || (children.length === 1 && children[0].tagName === 'PRE')) {
      const text = (children[0] || document.body).textContent.trim();
      if ((text.startsWith('{') && text.endsWith('}')) || (text.startsWith('[') && text.endsWith(']'))) {
        return text;
      }
    }

    return null;
  }

  const rawText = detectJSON();
  if (!rawText) return;

  let parsedData;
  try {
    parsedData = JSON.parse(rawText);
  } catch (err) {
    return;
  }

  window.__jsonViewLoaded = true;

  document.documentElement.classList.add('jv-active');
  document.body.classList.add('jv-active');

  // Tint Safari desktop & mobile chrome to match Catppuccin theme
  let head = document.head;
  if (!head) {
    head = document.createElement('head');
    document.documentElement.insertBefore(head, document.body);
  }
  const lightMeta = document.createElement('meta');
  lightMeta.name = 'theme-color';
  lightMeta.content = '#eff1f5';
  lightMeta.media = '(prefers-color-scheme: light)';

  const darkMeta = document.createElement('meta');
  darkMeta.name = 'theme-color';
  darkMeta.content = '#1e1e2e';
  darkMeta.media = '(prefers-color-scheme: dark)';

  head.appendChild(lightMeta);
  head.appendChild(darkMeta);

  const container = document.createElement('div');
  container.id = 'jv-container';

  const ICONS = {
    code: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m16 18 6-6-6-6"/><path d="m8 6-6 6 6 6"/></svg>',
    braces: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3H7a2 2 0 0 0-2 2v5a2 2 0 0 1-2 2 2 2 0 0 1 2 2v5c0 1.1.9 2 2 2h1"/><path d="M16 21h1a2 2 0 0 0 2-2v-5c0-1.1.9-2 2-2a2 2 0 0 1-2-2V5a2 2 0 0 0-2-2h-1"/></svg>',
    copy: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="14" height="14" x="8" y="8" rx="2" ry="2"/><path d="M4 16c-1.1 0-2-.9-2-2V4c0-1.1.9-2 2-2h10c1.1 0 2 .9 2 2"/></svg>',
    check: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20 6 9 17l-5-5"/></svg>',
    sunMoon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2"/><path d="M14.837 16.385a6 6 0 1 1-7.223-7.222c.624-.147.97.66.715 1.248a4 4 0 0 0 5.26 5.259c.589-.255 1.396.09 1.248.715"/><path d="M16 12a4 4 0 0 0-4-4"/><path d="m19 5-1.256 1.256"/><path d="M20 12h2"/></svg>',
    sun: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="4"/><path d="M12 2v2"/><path d="M12 20v2"/><path d="m4.93 4.93 1.41 1.41"/><path d="m17.66 17.66 1.41 1.41"/><path d="M2 12h2"/><path d="M20 12h2"/><path d="m6.34 17.66-1.41 1.41"/><path d="m19.07 4.93-1.41 1.41"/></svg>',
    moon: '<svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M20.985 12.486a9 9 0 1 1-9.473-9.472c.405-.022.617.46.402.803a6 6 0 0 0 8.268 8.268c.344-.215.825-.004.803.401"/></svg>'
  };

  // Subtle floating action buttons in the corner
  const actions = document.createElement('div');
  actions.id = 'jv-actions';

  const themeBtn = document.createElement('button');
  themeBtn.className = 'jv-action-btn';

  let currentTheme = localStorage.getItem('jv-theme') || 'auto';

  function applyTheme(theme) {
    currentTheme = theme;
    document.documentElement.classList.remove('jv-theme-light', 'jv-theme-dark');

    if (theme === 'light') {
      document.documentElement.classList.add('jv-theme-light');
      lightMeta.removeAttribute('media');
      darkMeta.removeAttribute('media');
      lightMeta.content = '#eff1f5';
      darkMeta.content = '#eff1f5';
      themeBtn.innerHTML = ICONS.sun;
      themeBtn.title = 'Theme: Light (click for dark)';
      themeBtn.setAttribute('aria-label', 'Theme: Light (click for dark)');
    } else if (theme === 'dark') {
      document.documentElement.classList.add('jv-theme-dark');
      lightMeta.removeAttribute('media');
      darkMeta.removeAttribute('media');
      lightMeta.content = '#1e1e2e';
      darkMeta.content = '#1e1e2e';
      themeBtn.innerHTML = ICONS.moon;
      themeBtn.title = 'Theme: Dark (click for auto)';
      themeBtn.setAttribute('aria-label', 'Theme: Dark (click for auto)');
    } else {
      lightMeta.media = '(prefers-color-scheme: light)';
      lightMeta.content = '#eff1f5';
      darkMeta.media = '(prefers-color-scheme: dark)';
      darkMeta.content = '#1e1e2e';
      themeBtn.innerHTML = ICONS.sunMoon;
      themeBtn.title = 'Theme: Auto (click for light)';
      themeBtn.setAttribute('aria-label', 'Theme: Auto (click for light)');
    }
  }

  themeBtn.addEventListener('click', () => {
    let nextTheme = 'auto';
    if (currentTheme === 'auto') nextTheme = 'light';
    else if (currentTheme === 'light') nextTheme = 'dark';
    else if (currentTheme === 'dark') nextTheme = 'auto';
    localStorage.setItem('jv-theme', nextTheme);
    applyTheme(nextTheme);
  });

  applyTheme(currentTheme);

  const viewModeBtn = document.createElement('button');
  viewModeBtn.className = 'jv-action-btn';
  viewModeBtn.innerHTML = ICONS.code;
  viewModeBtn.title = 'View raw';
  viewModeBtn.setAttribute('aria-label', 'View raw');

  const copyBtn = document.createElement('button');
  copyBtn.className = 'jv-action-btn';
  copyBtn.innerHTML = ICONS.copy;
  copyBtn.title = 'Copy JSON';
  copyBtn.setAttribute('aria-label', 'Copy JSON');

  actions.appendChild(themeBtn);
  actions.appendChild(viewModeBtn);
  actions.appendChild(copyBtn);

  const contentArea = document.createElement('main');
  contentArea.id = 'jv-content';

  const treeContainer = document.createElement('div');
  treeContainer.id = 'jv-tree';

  const rawContainer = document.createElement('pre');
  rawContainer.id = 'jv-raw';
  rawContainer.textContent = rawText;

  contentArea.appendChild(treeContainer);
  contentArea.appendChild(rawContainer);

  container.appendChild(actions);
  container.appendChild(contentArea);

  document.body.replaceChildren(container);

  // Recursive Tree Builder
  function buildNode(key, value, isLast, isRoot = false) {
    const node = document.createElement('div');
    node.className = 'jv-node' + (isRoot ? ' jv-root' : '');

    const line = document.createElement('div');
    line.className = 'jv-line';

    const isObject = value !== null && typeof value === 'object' && !Array.isArray(value);
    const isArray = Array.isArray(value);

    if (isObject || isArray) {
      const toggle = document.createElement('span');
      toggle.className = 'jv-toggle';
      toggle.textContent = '▼';
      toggle.addEventListener('click', (e) => {
        e.stopPropagation();
        node.classList.toggle('jv-collapsed');
        toggle.classList.toggle('collapsed');
      });
      line.appendChild(toggle);
    } else {
      const placeholder = document.createElement('span');
      placeholder.className = 'jv-toggle-placeholder';
      line.appendChild(placeholder);
    }

    if (key !== null) {
      const keySpan = document.createElement('span');
      keySpan.className = 'jv-key';
      keySpan.textContent = `"${key}"`;
      line.appendChild(keySpan);

      const colon = document.createElement('span');
      colon.className = 'jv-colon';
      colon.textContent = ':';
      line.appendChild(colon);
    }

    if (isObject || isArray) {
      const openBracket = document.createElement('span');
      openBracket.className = 'jv-bracket';
      openBracket.textContent = isArray ? '[' : '{';
      line.appendChild(openBracket);

      const ellipsis = document.createElement('span');
      ellipsis.className = 'jv-ellipsis';
      const itemsCount = isArray ? value.length : Object.keys(value).length;
      const noun = isArray ? (itemsCount === 1 ? 'item' : 'items') : (itemsCount === 1 ? 'key' : 'keys');
      ellipsis.textContent = `${itemsCount} ${noun}`;
      ellipsis.addEventListener('click', (e) => {
        e.stopPropagation();
        node.classList.remove('jv-collapsed');
        const t = node.querySelector('.jv-toggle');
        if (t) t.classList.remove('collapsed');
      });
      line.appendChild(ellipsis);

      const childrenContainer = document.createElement('div');
      childrenContainer.className = 'jv-children';

      const entries = isArray ? value : Object.entries(value);
      const total = isArray ? value.length : entries.length;

      if (isArray) {
        value.forEach((item, idx) => {
          childrenContainer.appendChild(buildNode(null, item, idx === total - 1));
        });
      } else {
        entries.forEach(([k, v], idx) => {
          childrenContainer.appendChild(buildNode(k, v, idx === total - 1));
        });
      }

      node.appendChild(line);
      node.appendChild(childrenContainer);

      const closeLine = document.createElement('div');
      closeLine.className = 'jv-line';
      const closePlaceholder = document.createElement('span');
      closePlaceholder.className = 'jv-toggle-placeholder';
      closeLine.appendChild(closePlaceholder);

      const closeBracket = document.createElement('span');
      closeBracket.className = 'jv-bracket';
      closeBracket.textContent = isArray ? ']' : '}';
      closeLine.appendChild(closeBracket);

      if (!isLast && !isRoot) {
        const comma = document.createElement('span');
        comma.className = 'jv-comma';
        comma.textContent = ',';
        closeLine.appendChild(comma);
      }
      node.appendChild(closeLine);

    } else {
      const valSpan = document.createElement('span');
      if (typeof value === 'string') {
        valSpan.className = 'jv-string';
        if (value.startsWith('http://') || value.startsWith('https://')) {
          const a = document.createElement('a');
          a.href = value;
          a.target = '_blank';
          a.rel = 'noopener noreferrer';
          a.textContent = value;
          valSpan.append('"', a, '"');
        } else {
          valSpan.textContent = `"${value}"`;
        }
      } else if (typeof value === 'number') {
        valSpan.className = 'jv-number';
        valSpan.textContent = String(value);
      } else if (typeof value === 'boolean') {
        valSpan.className = 'jv-boolean';
        valSpan.textContent = String(value);
      } else if (value === null) {
        valSpan.className = 'jv-null';
        valSpan.textContent = 'null';
      }

      line.appendChild(valSpan);

      if (!isLast && !isRoot) {
        const comma = document.createElement('span');
        comma.className = 'jv-comma';
        comma.textContent = ',';
        line.appendChild(comma);
      }
      node.appendChild(line);
    }

    return node;
  }

  // Render tree
  treeContainer.appendChild(buildNode(null, parsedData, true, true));

  // Toggle Raw / Formatted
  let isRaw = false;
  viewModeBtn.addEventListener('click', () => {
    isRaw = !isRaw;
    if (isRaw) {
      treeContainer.style.display = 'none';
      rawContainer.style.display = 'block';
      viewModeBtn.innerHTML = ICONS.braces;
      viewModeBtn.title = 'View formatted';
      viewModeBtn.setAttribute('aria-label', 'View formatted');
      viewModeBtn.classList.add('active');
    } else {
      treeContainer.style.display = 'block';
      rawContainer.style.display = 'none';
      viewModeBtn.innerHTML = ICONS.code;
      viewModeBtn.title = 'View raw';
      viewModeBtn.setAttribute('aria-label', 'View raw');
      viewModeBtn.classList.remove('active');
    }
  });

  // Copy
  copyBtn.addEventListener('click', async () => {
    const textToCopy = JSON.stringify(parsedData, null, 2);
    try {
      await navigator.clipboard.writeText(textToCopy);
    } catch (e) {
      const ta = document.createElement('textarea');
      ta.value = textToCopy;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
    }
    copyBtn.innerHTML = ICONS.check;
    copyBtn.title = 'Copied';
    copyBtn.setAttribute('aria-label', 'Copied');
    copyBtn.classList.add('copied');
    setTimeout(() => {
      copyBtn.innerHTML = ICONS.copy;
      copyBtn.title = 'Copy JSON';
      copyBtn.setAttribute('aria-label', 'Copy JSON');
      copyBtn.classList.remove('copied');
    }, 1500);
  });
})();
