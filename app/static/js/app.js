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

  // ----- Diagnose page symptom filters -----
  function initDiagnoseFilters() {
    const diagnoseRoot = document.querySelector('[data-diagnose-root]');
    if (!diagnoseRoot) return;

    const searchField = diagnoseRoot.querySelector('[data-symptom-search]');
    const selectedOnly = diagnoseRoot.querySelector('[data-symptom-selected-only]');
    const clearBtn = diagnoseRoot.querySelector('[data-symptom-clear]');
    const filterButtons = Array.from(diagnoseRoot.querySelectorAll('[data-symptom-filter]'));
    const symptomItems = Array.from(diagnoseRoot.querySelectorAll('[data-symptom-item]'));
    const sections = Array.from(diagnoseRoot.querySelectorAll('[data-symptom-section]'));
    const selectedCountEl = diagnoseRoot.querySelector('[data-symptom-selected-count]');
    const visibleCountEl = diagnoseRoot.querySelector('[data-symptom-visible-count]');
    const emptyState = diagnoseRoot.querySelector('[data-symptom-empty]');

    let activeCategory = 'all';

    function getCheckboxes() {
      return Array.from(diagnoseRoot.querySelectorAll('[data-symptom-checkbox]'));
    }

    function setActiveFilterButton() {
      filterButtons.forEach((btn) => {
        const isActive = btn.getAttribute('data-symptom-filter') === activeCategory;
        btn.classList.toggle('is-active', isActive);
      });
    }

    function applyFilters() {
      const keyword = (searchField?.value || '').trim().toLowerCase();
      const selectedOnlyEnabled = !!selectedOnly?.checked;
      let visibleTotal = 0;

      symptomItems.forEach((item) => {
        const label = (item.getAttribute('data-symptom-label') || '').toLowerCase();
        const category = item.getAttribute('data-symptom-category') || '';
        const checkbox = item.querySelector('[data-symptom-checkbox]');
        const isChecked = !!checkbox?.checked;

        const matchesText = !keyword || label.includes(keyword);
        const matchesCategory = activeCategory === 'all' || category === activeCategory;
        const matchesSelected = !selectedOnlyEnabled || isChecked;
        const shouldShow = matchesText && matchesCategory && matchesSelected;

        item.style.display = shouldShow ? '' : 'none';
        if (shouldShow) visibleTotal += 1;
      });

      sections.forEach((section) => {
        const sectionItems = Array.from(section.querySelectorAll('[data-symptom-item]'));
        const visibleInSection = sectionItems.filter((item) => item.style.display !== 'none').length;
        section.style.display = visibleInSection > 0 ? '' : 'none';

        const counter = section.querySelector('[data-symptom-section-count]');
        if (counter) counter.textContent = `${visibleInSection} shown`;
      });

      if (emptyState) emptyState.classList.toggle('d-none', visibleTotal > 0);
      if (visibleCountEl) visibleCountEl.textContent = String(visibleTotal);
      if (selectedCountEl) {
        selectedCountEl.textContent = String(getCheckboxes().filter((cb) => cb.checked).length);
      }
    }

    filterButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        activeCategory = btn.getAttribute('data-symptom-filter') || 'all';
        setActiveFilterButton();
        applyFilters();
      });
    });

    if (searchField) {
      searchField.addEventListener('input', applyFilters);
    }
    if (selectedOnly) {
      selectedOnly.addEventListener('change', applyFilters);
    }
    if (clearBtn) {
      clearBtn.addEventListener('click', () => {
        activeCategory = 'all';
        if (searchField) searchField.value = '';
        if (selectedOnly) selectedOnly.checked = false;
        setActiveFilterButton();
        applyFilters();
      });
    }

    getCheckboxes().forEach((cb) => cb.addEventListener('change', applyFilters));

    // Quick keyboard focus: "/" jumps to symptom search field.
    document.addEventListener('keydown', (e) => {
      if (e.key !== '/' || !searchField) return;
      const target = e.target;
      if (
        target instanceof HTMLElement &&
        (target.tagName === 'INPUT' || target.tagName === 'TEXTAREA' || target.isContentEditable)
      ) {
        return;
      }
      e.preventDefault();
      searchField.focus();
    });

    setActiveFilterButton();
    applyFilters();
  }

  // ----- Disease form symptom manager -----
  function initSymptomChecklistManager() {
    const form = document.querySelector('form[data-symptom-manager]');
    if (!form) return;

    const typeButtons = Array.from(form.querySelectorAll('[data-symptom-type]'));
    const sourceFields = Array.from(form.querySelectorAll('[data-symptom-source-key]'));
    const itemInput = form.querySelector('[data-symptom-item-input]');
    const saveBtn = form.querySelector('[data-symptom-save]');
    const cancelEditBtn = form.querySelector('[data-symptom-cancel-edit]');
    const activeTypeLabel = form.querySelector('[data-symptom-active-label]');
    const masterList = form.querySelector('[data-symptom-master-list]');
    const emptyState = form.querySelector('[data-symptom-empty]');
    const totalCountEl = form.querySelector('[data-symptom-total-count]');

    if (!typeButtons.length || !sourceFields.length || !itemInput || !saveBtn || !masterList) return;

    const sourceByKey = new Map();
    const typeMeta = new Map();
    const typeOrder = [];
    let selectedType = null;
    let editingId = null;
    let nextId = 1;
    let items = [];

    function splitTokens(raw) {
      return String(raw || '')
        .split(/[\n,;]+/)
        .map((v) => v.trim().replace(/\s+/g, ' '))
        .filter(Boolean);
    }

    function normalized(value) {
      return String(value || '').trim().replace(/\s+/g, ' ').toLowerCase();
    }

    sourceFields.forEach((field) => {
      const key = field.getAttribute('data-symptom-source-key');
      if (!key) return;
      sourceByKey.set(key, field);
      typeOrder.push(key);
    });

    typeButtons.forEach((btn) => {
      const key = btn.getAttribute('data-symptom-type');
      if (!key) return;
      typeMeta.set(key, {
        title: btn.getAttribute('data-symptom-title') || key,
        placeholder: btn.getAttribute('data-symptom-placeholder') || 'Add symptom',
      });
      if (!selectedType || btn.classList.contains('is-active')) {
        selectedType = key;
      }
    });

    if (!selectedType && typeOrder.length) {
      selectedType = typeOrder[0];
    }

    function itemExists(typeKey, label, ignoreId = null) {
      const needle = normalized(label);
      return items.some(
        (item) =>
          item.typeKey === typeKey &&
          normalized(item.label) === needle &&
          (ignoreId === null || item.id !== ignoreId)
      );
    }

    function setSelectedType(typeKey) {
      if (!typeKey) return;
      selectedType = typeKey;
      typeButtons.forEach((btn) => {
        const key = btn.getAttribute('data-symptom-type');
        btn.classList.toggle('is-active', key === selectedType);
      });

      const meta = typeMeta.get(selectedType);
      if (activeTypeLabel) {
        activeTypeLabel.textContent = meta?.title || selectedType;
      }
      if (editingId === null) {
        itemInput.placeholder = meta?.placeholder || 'Add symptom';
      }
    }

    function resetEditor() {
      editingId = null;
      itemInput.value = '';
      const meta = typeMeta.get(selectedType);
      itemInput.placeholder = meta?.placeholder || 'Add symptom';
      saveBtn.textContent = 'Add';
      if (cancelEditBtn) cancelEditBtn.classList.add('d-none');
    }

    function syncSourcesAndCounts() {
      sourceByKey.forEach((field, key) => {
        const labels = items
          .filter((item) => item.typeKey === key)
          .map((item) => item.label);
        field.value = labels.join('\n');

        const countBadge = form.querySelector(`[data-symptom-tab-count="${key}"]`);
        if (countBadge) countBadge.textContent = String(labels.length);
      });

      if (totalCountEl) totalCountEl.textContent = String(items.length);
    }

    function renderList() {
      masterList.innerHTML = '';

      typeOrder.forEach((typeKey) => {
        const meta = typeMeta.get(typeKey);
        const groupItems = items
          .filter((item) => item.typeKey === typeKey)
          .sort((a, b) => a.label.localeCompare(b.label));

        const group = document.createElement('div');
        group.className = 'sf-symptom-group';

        const header = document.createElement('div');
        header.className = 'sf-symptom-group-head';
        const title = document.createElement('span');
        title.className = 'sf-symptom-group-title';
        title.textContent = meta?.title || typeKey;
        const count = document.createElement('span');
        count.className = 'sf-symptom-group-count';
        count.textContent = `${groupItems.length}`;
        header.append(title, count);
        group.appendChild(header);

        if (!groupItems.length) {
          const empty = document.createElement('div');
          empty.className = 'small text-muted';
          empty.textContent = 'No items in this type.';
          group.appendChild(empty);
        } else {
          const list = document.createElement('div');
          list.className = 'sf-symptom-rows';

          groupItems.forEach((item) => {
            const row = document.createElement('div');
            row.className = 'sf-symptom-row';

            const label = document.createElement('div');
            label.className = 'sf-symptom-row-label';
            label.textContent = item.label;

            const actions = document.createElement('div');
            actions.className = 'd-flex gap-2';

            const editBtn = document.createElement('button');
            editBtn.type = 'button';
            editBtn.className = 'btn btn-sm btn-outline-dark';
            editBtn.setAttribute('data-symptom-edit-id', String(item.id));
            editBtn.textContent = 'Edit';

            const deleteBtn = document.createElement('button');
            deleteBtn.type = 'button';
            deleteBtn.className = 'btn btn-sm btn-outline-danger';
            deleteBtn.setAttribute('data-symptom-delete-id', String(item.id));
            deleteBtn.textContent = 'Delete';

            actions.append(editBtn, deleteBtn);
            row.append(label, actions);
            list.appendChild(row);
          });

          group.appendChild(list);
        }

        masterList.appendChild(group);
      });

      if (emptyState) {
        emptyState.classList.toggle('d-none', items.length > 0);
      }
    }

    function startEdit(id) {
      const item = items.find((it) => it.id === id);
      if (!item) return;

      editingId = id;
      setSelectedType(item.typeKey);
      itemInput.value = item.label;
      itemInput.placeholder = 'Update symptom item';
      saveBtn.textContent = 'Update';
      if (cancelEditBtn) cancelEditBtn.classList.remove('d-none');
      itemInput.focus();
    }

    function saveItem() {
      const tokens = splitTokens(itemInput.value);
      if (!tokens.length || !selectedType) return;

      if (editingId !== null) {
        const updatedLabel = tokens[0];
        const row = items.find((it) => it.id === editingId);
        if (!row) {
          resetEditor();
          return;
        }
        if (!itemExists(selectedType, updatedLabel, editingId)) {
          row.label = updatedLabel;
          row.typeKey = selectedType;
        }
        resetEditor();
      } else {
        tokens.forEach((label) => {
          if (!itemExists(selectedType, label)) {
            items.push({ id: nextId++, typeKey: selectedType, label });
          }
        });
        itemInput.value = '';
      }

      syncSourcesAndCounts();
      renderList();
    }

    function deleteItem(id) {
      items = items.filter((item) => item.id !== id);
      if (editingId === id) {
        resetEditor();
      }
      syncSourcesAndCounts();
      renderList();
    }

    // Load existing values from hidden source fields.
    sourceByKey.forEach((field, typeKey) => {
      const seen = new Set();
      splitTokens(field.value).forEach((label) => {
        const key = normalized(label);
        if (!key || seen.has(key)) return;
        seen.add(key);
        items.push({ id: nextId++, typeKey, label });
      });
    });

    typeButtons.forEach((btn) => {
      btn.addEventListener('click', () => {
        const typeKey = btn.getAttribute('data-symptom-type');
        if (typeKey) setSelectedType(typeKey);
      });
    });

    saveBtn.addEventListener('click', saveItem);

    if (cancelEditBtn) {
      cancelEditBtn.addEventListener('click', resetEditor);
    }

    itemInput.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        saveItem();
      }
    });

    masterList.addEventListener('click', (e) => {
      const target = e.target;
      if (!(target instanceof Element)) return;

      const editBtn = target.closest('[data-symptom-edit-id]');
      if (editBtn) {
        const id = Number(editBtn.getAttribute('data-symptom-edit-id'));
        if (Number.isInteger(id)) startEdit(id);
        return;
      }

      const deleteBtn = target.closest('[data-symptom-delete-id]');
      if (deleteBtn) {
        const id = Number(deleteBtn.getAttribute('data-symptom-delete-id'));
        if (Number.isInteger(id)) deleteItem(id);
      }
    });

    form.addEventListener('submit', () => {
      if (itemInput.value.trim()) {
        saveItem();
      } else {
        syncSourcesAndCounts();
      }
    });

    setSelectedType(selectedType);
    resetEditor();
    syncSourcesAndCounts();
    renderList();
  }

  initSymptomChecklistManager();
  initDiagnoseFilters();
})();
