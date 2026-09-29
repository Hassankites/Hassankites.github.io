"""Build the bilingual article catalogue from article front matter."""

from collections import OrderedDict
from datetime import datetime
import json
from pathlib import Path


BLOG_DIR = Path(__file__).resolve().parents[1] / "docs" / "blogger"


def _front_matter(path):
    text = path.read_text(encoding="utf-8")
    if not text.startswith("---\n"):
        return {}
    block = text.split("---", 2)[1]
    data = {}
    active_list = None
    for raw in block.splitlines():
        line = raw.rstrip()
        if active_list and line.lstrip().startswith("- "):
            data[active_list].append(line.lstrip()[2:].strip().strip('"\''))
            continue
        active_list = None
        if ":" not in line:
            continue
        key, value = line.split(":", 1)
        key, value = key.strip(), value.strip()
        if not value:
            data[key] = []
            active_list = key
        elif value.startswith("[") and value.endswith("]"):
            data[key] = [item.strip().strip('"\'') for item in value[1:-1].split(",") if item.strip()]
        else:
            data[key] = value.strip('"\'')
    return data


def _articles(locale):
    suffix = f".{locale}.md"
    articles = []
    for path in BLOG_DIR.glob(f"*{suffix}"):
        if path.name == f"index{suffix}":
            continue
        meta = _front_matter(path)
        if not meta.get("title"):
            continue
        tags = meta.get("tags") or []
        if isinstance(tags, str):
            tags = [tags]
        articles.append({
            "title": meta["title"],
            "subtitle": meta.get("subtitle", ""),
            "date": meta.get("date", "1970-01-01"),
            "tags": tags or (["未分类"] if locale == "zh" else ["Uncategorized"]),
            "cover": meta.get("cover", "../assets/images/avatar.jpg"),
            "url": path.name.removesuffix(suffix) + "/",
        })
    return sorted(articles, key=lambda item: item["date"], reverse=True)


def _card(article, locale, featured=False):
    tags = "".join(f'<span class="article-tag">{tag}</span>' for tag in article["tags"])
    klass = "article-card article-card--featured" if featured else "article-card"
    cover = article["cover"]
    if locale == "en" and cover.startswith("../assets/"):
        cover = "../" + cover
    read_label = "阅读全文" if locale == "zh" else "Read article"
    return f'''<a class="{klass}" href="{article['url']}">

  <div class="article-card__cover"><img src="{cover}" alt="" loading="lazy" width="640" height="480"></div>
  <div class="article-card__body">
    <time class="article-card__date" datetime="{article['date']}">{article['date'].replace('-', '.')}</time>
    <h3 class="article-card__title">{article['title']}</h3>
    <p class="article-card__subtitle">{article['subtitle']}</p>
    <div class="article-card__tags">{tags}</div>
    <span class="article-card__read">{read_label} <span aria-hidden="true">→</span></span>
  </div>
</a>'''


def _render(locale):
    articles = _articles(locale)
    zh = locale == "zh"
    title = "文章" if zh else "Articles"
    intro = "记录学习、开发与生活中的思考。" if zh else "Notes on learning, development, and life."
    empty = "文章正在准备中。" if zh else "Articles are on the way."
    lines = [f'<div class="articles-page" data-article-count="{len(articles)}">', f'<div class="articles-hero"><h1>{title}</h1><p>{intro}</p></div>', '<div class="articles-reading-list">']
    lines.extend(_card(a, locale) for a in articles)
    if not articles: lines.append(f'<p>{empty}</p>')
    lines.extend(['</div>', '</div>'])
    return "\n\n".join(lines) + "\n"


def generate_catalogs():
    catalog = {}
    for locale in ("zh", "en"):
        articles = _articles(locale)
        (BLOG_DIR / f"index.{locale}.md").write_text(_render(locale), encoding="utf-8")
        catalog[locale] = articles[0] if articles else None
    (BLOG_DIR.parent / "article-catalog.json").write_text(
        json.dumps(catalog, ensure_ascii=False, indent=2), encoding="utf-8"
    )


def on_pre_build(config):
    generate_catalogs()
    return config


if __name__ == "__main__":
    generate_catalogs()
