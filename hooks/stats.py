"""MkDocs 构建钩子：自动统计站点数据，写入 site/stats.json"""

import json
import os
import re

SITE_START_DATE = "2026-08-16"  # 站点上线日期（可自行修改）


def _extract_text_from_html(path):
    """从 HTML 正文提取纯文本。"""
    try:
        with open(path, "r", encoding="utf-8") as fh:
            html = fh.read()
    except (OSError, UnicodeDecodeError):
        return ""
    m = re.search(r"<article.*?</article>", html, re.DOTALL)
    content = m.group(0) if m else html
    text = re.sub(r"<[^>]+>", "", content)
    return text


def _count_articles(site_dir):
    """统计「文章」模块（blogger 目录）下的文章数与总字数。"""
    words = 0
    pages = 0
    article_dir = os.path.join(site_dir, "blogger")
    if not os.path.isdir(article_dir):
        return words, pages
    for root, _dirs, files in os.walk(article_dir):
        for fname in files:
            if not fname.endswith(".html"):
                continue
            path = os.path.join(root, fname)
            if os.path.normpath(path) == os.path.normpath(os.path.join(article_dir, "index.html")):
                continue
            text = _extract_text_from_html(path)
            words += len(re.sub(r"\s+", "", text))
            pages += 1
    return words, pages


def _recent_updates(site_dir):
    """从日志页提取最近更新条目（最多 2 条）。"""
    log_dir = os.path.join(site_dir, "log")
    if not os.path.isdir(log_dir):
        return []
    index_path = os.path.join(log_dir, "index.html")
    if not os.path.exists(index_path):
        return []
    try:
        with open(index_path, "r", encoding="utf-8") as fh:
            html = fh.read()
    except (OSError, UnicodeDecodeError):
        return []
    # 解析 cl-item 结构：cl-date + cl-tag + cl-text
    items = []
    for block in re.findall(r'<li class="cl-item">(.*?)</li>', html, re.DOTALL):
        m_date = re.search(r'<div class="cl-date">(.*?)</div>', block, re.DOTALL)
        m_text = re.search(r'<div class="cl-text">(.*?)</div>', block, re.DOTALL)
        if not m_date or not m_text:
            continue
        date = re.sub(r"<[^>]+>", "", m_date.group(1)).strip()
        text = re.sub(r"<[^>]+>", "", m_text.group(1)).strip()
        items.append({"date": date, "text": text})
    return items[:2]


def on_post_build(config):
    """构建完成后统计站点数据并写入 stats.json。"""
    site_dir = config["site_dir"]
    words, pages = _count_articles(site_dir)
    recent = _recent_updates(site_dir)
    en_recent = _recent_updates(os.path.join(site_dir, "en"))
    zh_stats = {
        "start_date": SITE_START_DATE,
        "words": words,
        "articles": pages,
        "recent": recent,
    }
    en_stats = {
        "start_date": SITE_START_DATE,
        "words": words,
        "articles": pages,
        "recent": en_recent or recent,
    }

    targets = [
        (site_dir, zh_stats),
        (os.path.join(site_dir, "en"), en_stats),
    ]
    for target, stats in targets:
        stats_path = os.path.join(target, "stats.json")
        try:
            with open(stats_path, "w", encoding="utf-8") as fh:
                json.dump(stats, fh, ensure_ascii=False)
        except OSError:
            pass

    return config
