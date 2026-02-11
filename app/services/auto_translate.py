import json
from urllib.parse import urlencode
from urllib.request import Request, urlopen

from app.models.translation_cache import TranslationCache
from extensions import db


_MAX_ITEMS_PER_REQUEST = 60
_MAX_TEXT_LEN = 4500
_TRANSLATE_TIMEOUT_SEC = 8


def _normalize_text(value: str) -> str:
    return str(value or "").strip()


def _google_translate_text(text: str, target_lang: str) -> str:
    payload = urlencode(
        {
            "client": "gtx",
            "sl": "auto",
            "tl": target_lang,
            "dt": "t",
            "q": text,
        }
    )
    url = f"https://translate.googleapis.com/translate_a/single?{payload}"
    req = Request(
        url,
        headers={
            "User-Agent": "Mozilla/5.0",
            "Accept": "application/json",
        },
    )

    with urlopen(req, timeout=_TRANSLATE_TIMEOUT_SEC) as response:
        raw = response.read().decode("utf-8", errors="ignore")

    data = json.loads(raw)
    segments = data[0] if isinstance(data, list) and data else []
    translated = "".join(
        segment[0]
        for segment in segments
        if isinstance(segment, list) and len(segment) > 0 and segment[0]
    ).strip()
    return translated or text


def translate_text_batch(texts: list[str], target_lang: str = "km") -> dict[str, str]:
    if target_lang != "km":
        return {}

    cleaned: list[str] = []
    seen: set[str] = set()
    for text in texts or []:
        item = _normalize_text(text)
        if not item:
            continue
        if len(item) > _MAX_TEXT_LEN:
            continue
        if item in seen:
            continue
        seen.add(item)
        cleaned.append(item)
        if len(cleaned) >= _MAX_ITEMS_PER_REQUEST:
            break

    if not cleaned:
        return {}

    output: dict[str, str] = {}
    cached = (
        TranslationCache.query.filter(
            TranslationCache.target_lang == target_lang,
            TranslationCache.source_text.in_(cleaned),
        )
        .all()
    )
    cached_map = {row.source_text: row.translated_text for row in cached}

    for text in cleaned:
        if text in cached_map:
            output[text] = cached_map[text]
            continue

        translated = text
        translated_ok = False
        try:
            translated = _google_translate_text(text, target_lang)
            translated_ok = True
        except Exception:
            translated = text

        output[text] = translated or text

        if not translated_ok:
            continue

        try:
            db.session.add(
                TranslationCache(
                    source_text=text,
                    target_lang=target_lang,
                    translated_text=output[text],
                )
            )
            db.session.flush()
        except Exception:
            db.session.rollback()
            existing = TranslationCache.query.filter_by(
                source_text=text,
                target_lang=target_lang,
            ).first()
            if existing:
                output[text] = existing.translated_text
            continue

    try:
        db.session.commit()
    except Exception:
        db.session.rollback()

    return output
