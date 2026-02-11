from __future__ import annotations

import json
import re

from app.services.disease_helpers import keyify

DEFAULT_CATEGORY = "General"
SYNC_DEFAULT_CATEGORY = "Environment"

_CATEGORY_CANONICAL = {
    "leaf": "Leaf",
    "leafhead": "Leaf / Head",
    "wholeplant": "Whole plant",
    "stem": "Stem",
    "head": "Head",
    "root": "Root",
    "seed": "Seed / Seedling",
    "seedling": "Seed / Seedling",
    "seedseedling": "Seed / Seedling",
    "environment": "Environment",
    "env": "Environment",
    "environmental": "Environment",
    "general": "General",
}


def _norm(value: str) -> str:
    return (value or "").strip().lower()


def canonical_category(value: str) -> str:
    raw = (value or "").strip()
    if not raw:
        return DEFAULT_CATEGORY
    key = re.sub(r"[^a-z0-9]+", "", raw.lower())
    return _CATEGORY_CANONICAL.get(key, raw)


def _normalize_items(items: list[dict]) -> list[dict]:
    out: list[dict] = []
    for item in items or []:
        if isinstance(item, dict):
            label = (item.get("label") or "").strip()
            category = canonical_category(item.get("category") or DEFAULT_CATEGORY)
            key = (item.get("key") or "").strip() or keyify(label)
        else:
            label = str(item).strip()
            category = DEFAULT_CATEGORY
            key = keyify(label)

        if not label:
            continue
        out.append({"key": key, "label": label, "category": category})
    return out


def _unique_keyed_items(items: list[dict]) -> list[dict]:
    # Remove exact duplicates by category+label (case-insensitive), then ensure unique keys.
    seen_label_cat: set[tuple[str, str]] = set()
    deduped: list[dict] = []
    for item in items:
        pair = (_norm(item.get("category")), _norm(item.get("label")))
        if pair in seen_label_cat:
            continue
        seen_label_cat.add(pair)
        deduped.append(item)

    seen_keys: set[str] = set()
    out: list[dict] = []
    for item in deduped:
        base_key = (item.get("key") or "").strip() or keyify(item["label"])
        key = base_key
        i = 1
        while key in seen_keys:
            i += 1
            key = f"{base_key}_{i}"
        seen_keys.add(key)
        out.append({"key": key, "label": item["label"], "category": item["category"]})
    return out


def disease_items(disease) -> list[dict]:
    return _unique_keyed_items(_normalize_items(disease.checklist_items() or []))


def checklist_to_symptoms_text(items: list[dict]) -> str:
    normalized = _unique_keyed_items(_normalize_items(items))
    lines: list[str] = []
    for item in normalized:
        label = (item.get("label") or "").strip()
        category = canonical_category(item.get("category") or SYNC_DEFAULT_CATEGORY)
        if not label:
            continue
        if _norm(category) == _norm(DEFAULT_CATEGORY):
            category = SYNC_DEFAULT_CATEGORY
        lines.append(f"{category}: {label}")
    return "\n".join(lines)


def parse_symptoms_text_to_items(
    text: str,
    *,
    default_category: str = SYNC_DEFAULT_CATEGORY,
) -> list[dict]:
    rows: list[dict] = []
    seen_pairs: set[tuple[str, str]] = set()

    for raw in (text or "").splitlines():
        line = str(raw or "").strip()
        if not line:
            continue
        line = re.sub(r"^[-*•\s]+", "", line).strip()
        if not line:
            continue

        category = default_category
        label = line
        if ":" in line:
            left, right = line.split(":", 1)
            left = (left or "").strip()
            right = (right or "").strip()
            if right:
                label = right
                category = canonical_category(left or default_category)

        category = canonical_category(category or default_category)
        if _norm(category) == _norm(DEFAULT_CATEGORY):
            category = default_category

        label = (label or "").strip()
        if not label:
            continue

        pair = (_norm(category), _norm(label))
        if pair in seen_pairs:
            continue
        seen_pairs.add(pair)
        rows.append({"key": keyify(label), "label": label, "category": category})

    if not rows and (text or "").strip():
        # Keep a non-empty fallback so symptoms text and checklist never diverge.
        fallback = re.sub(r"\s+", " ", (text or "").strip())
        if fallback:
            cat = canonical_category(default_category or SYNC_DEFAULT_CATEGORY)
            rows.append({"key": keyify(fallback), "label": fallback, "category": cat})

    return _unique_keyed_items(_normalize_items(rows))


def save_disease_items(disease, items: list[dict]) -> None:
    normalized_raw = _unique_keyed_items(_normalize_items(items))
    normalized: list[dict] = []
    for item in normalized_raw:
        label = (item.get("label") or "").strip()
        key = (item.get("key") or "").strip() or keyify(label)
        category = canonical_category(item.get("category") or SYNC_DEFAULT_CATEGORY)
        if _norm(category) == _norm(DEFAULT_CATEGORY):
            category = SYNC_DEFAULT_CATEGORY
        if not label:
            continue
        normalized.append({"key": key, "label": label, "category": category})

    disease.symptom_checklist_json = json.dumps(normalized)
    disease.symptoms = checklist_to_symptoms_text(normalized)


def sync_disease_symptom_data(disease) -> bool:
    old_json = disease.symptom_checklist_json or ""
    old_symptoms = disease.symptoms or ""

    existing = disease_items(disease)
    if existing:
        save_disease_items(disease, existing)
        return (disease.symptom_checklist_json or "") != old_json or (
            disease.symptoms or ""
        ) != old_symptoms

    parsed = parse_symptoms_text_to_items(disease.symptoms or "")
    if not parsed:
        return False
    save_disease_items(disease, parsed)
    return (disease.symptom_checklist_json or "") != old_json or (disease.symptoms or "") != old_symptoms


def add_symptom_to_disease(disease, *, label: str, category: str) -> bool:
    label = (label or "").strip()
    if not label:
        return False

    items = disease_items(disease)
    cat = canonical_category(category)
    pair = (_norm(cat), _norm(label))
    if any((_norm(it["category"]), _norm(it["label"])) == pair for it in items):
        return False

    items.append({"key": keyify(label), "label": label, "category": cat})
    save_disease_items(disease, items)
    return True


def edit_symptom_globally(
    diseases: list,
    *,
    old_label: str,
    old_category: str,
    new_label: str,
    new_category: str,
) -> tuple[int, int, set[int]]:
    old_pair = (_norm(canonical_category(old_category)), _norm(old_label))
    new_label = (new_label or "").strip()
    new_cat = canonical_category(new_category)
    if not new_label:
        return (0, 0)

    affected_diseases = 0
    affected_items = 0
    changed_disease_ids: set[int] = set()

    for disease in diseases:
        items = disease_items(disease)
        changed = False
        for item in items:
            pair = (_norm(item.get("category")), _norm(item.get("label")))
            if pair == old_pair:
                item["label"] = new_label
                item["category"] = new_cat
                item["key"] = keyify(new_label)
                affected_items += 1
                changed = True

        if changed:
            save_disease_items(disease, items)
            affected_diseases += 1
            changed_disease_ids.add(disease.id)

    return (affected_diseases, affected_items, changed_disease_ids)


def delete_symptom_globally(
    diseases: list,
    *,
    label: str,
    category: str,
) -> tuple[int, int, set[int]]:
    target = (_norm(canonical_category(category)), _norm(label))
    affected_diseases = 0
    removed_items = 0
    changed_disease_ids: set[int] = set()

    for disease in diseases:
        items = disease_items(disease)
        kept = []
        removed_here = 0
        for item in items:
            pair = (_norm(item.get("category")), _norm(item.get("label")))
            if pair == target:
                removed_here += 1
            else:
                kept.append(item)

        if removed_here:
            save_disease_items(disease, kept)
            affected_diseases += 1
            removed_items += removed_here
            changed_disease_ids.add(disease.id)

    return (affected_diseases, removed_items, changed_disease_ids)


def collect_all_symptoms(diseases: list) -> list[dict]:
    symptom_map: dict[tuple[str, str], dict] = {}

    for disease in diseases:
        for item in disease_items(disease):
            label = (item.get("label") or "").strip()
            category = canonical_category(item.get("category") or DEFAULT_CATEGORY)
            if not label:
                continue

            map_key = (_norm(category), _norm(label))
            if map_key not in symptom_map:
                symptom_map[map_key] = {
                    "category": category,
                    "label": label,
                    "disease_ids": set(),
                    "disease_names": set(),
                }

            symptom_map[map_key]["disease_ids"].add(disease.id)
            symptom_map[map_key]["disease_names"].add(disease.name)

    return sorted(
        (
            {
                "category": row["category"],
                "label": row["label"],
                "disease_count": len(row["disease_ids"]),
                "disease_names": sorted(row["disease_names"]),
            }
            for row in symptom_map.values()
        ),
        key=lambda row: (row["category"].lower(), row["label"].lower()),
    )
