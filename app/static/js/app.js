(() => {
  const root = document.documentElement;
  const body = document.body;

  // ----- Theme -----
  function applyTheme(theme) {
    root.setAttribute('data-theme', theme);
    root.setAttribute('data-bs-theme', theme);
    try {
      localStorage.setItem('sf-theme', theme);
    } catch (_) {}
  }

  const savedTheme = (() => {
    try {
      return localStorage.getItem('sf-theme');
    } catch (_) {
      return null;
    }
  })();

  if (savedTheme === 'dark' || savedTheme === 'light') {
    applyTheme(savedTheme);
  }

  // ----- Sidebar -----
  function openSidebar() {
    body.classList.add('sf-sidebar-open');
  }
  function closeSidebar() {
    body.classList.remove('sf-sidebar-open');
  }
  function toggleSidebar() {
    body.classList.toggle('sf-sidebar-open');
  }

  // ----- Events -----
  document.addEventListener('click', (e) => {
    const t = e.target;
    if (!(t instanceof Element)) return;

    const action = t.closest('[data-action]')?.getAttribute('data-action');

    if (action === 'toggleTheme') {
      const current = root.getAttribute('data-theme') === 'dark' ? 'dark' : 'light';
      applyTheme(current === 'dark' ? 'light' : 'dark');
      return;
    }

    if (action === 'toggleSidebar') toggleSidebar();
    if (action === 'openSidebar') openSidebar();
  });

  // Close sidebar on ESC
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      closeSidebar();
    }
  });

  // ----- Search suggestions -----
  const searchForm = document.querySelector('.sf-search');
  const searchInput = searchForm?.querySelector('.sf-search-input');
  const suggestBox = searchForm?.querySelector('[data-search-suggest]');
  let searchTimer = null;
  let abortController = null;

  function clearSuggestions() {
    if (!suggestBox) return;
    suggestBox.innerHTML = '';
    suggestBox.setAttribute('aria-hidden', 'true');
  }

  function renderSuggestions(items) {
    if (!suggestBox) return;
    if (!items.length) {
      suggestBox.innerHTML = '<div class="sf-suggest-empty">No suggestions</div>';
      suggestBox.setAttribute('aria-hidden', 'false');
      return;
    }
    suggestBox.innerHTML = items
      .map(
        (item) => `
        <a class="sf-suggest-item" href="${item.url}">
          <span class="sf-suggest-type">${item.type}</span>
          <span class="sf-suggest-label">${item.label}</span>
        </a>
      `
      )
      .join('');
    suggestBox.setAttribute('aria-hidden', 'false');
  }

  async function fetchSuggestions(query) {
    if (!suggestBox) return;
    if (abortController) abortController.abort();
    abortController = new AbortController();
    try {
      const res = await fetch(`/search/suggest?q=${encodeURIComponent(query)}`, {
        signal: abortController.signal,
      });
      if (!res.ok) {
        clearSuggestions();
        return;
      }
      const data = await res.json();
      renderSuggestions(Array.isArray(data) ? data : []);
    } catch (err) {
      if (err.name !== 'AbortError') {
        clearSuggestions();
      }
    }
  }

  if (searchInput && suggestBox) {
    searchInput.addEventListener('input', () => {
      const value = searchInput.value.trim();
      clearTimeout(searchTimer);
      if (value.length < 2) {
        clearSuggestions();
        return;
      }
      searchTimer = setTimeout(() => fetchSuggestions(value), 180);
    });

    searchInput.addEventListener('focus', () => {
      const value = searchInput.value.trim();
      if (value.length >= 2) {
        fetchSuggestions(value);
      }
    });

    searchInput.addEventListener('keydown', (e) => {
      if (e.key === 'Escape') {
        clearSuggestions();
      }
    });

    searchInput.addEventListener('blur', () => {
      setTimeout(clearSuggestions, 120);
    });

    document.addEventListener('keydown', (e) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        searchInput.focus();
      }
    });
  }
})();
