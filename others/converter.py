import csv
import logging
import xml.etree.ElementTree as ET
import json

# 定数: XML namespace
NS = {
    'wp': 'http://wordpress.org/export/1.2/',
    'content': 'http://purl.org/rss/1.0/modules/content/',
    'dc': 'http://purl.org/dc/elements/1.1/'
}

# ログ設定
logging.basicConfig(
    filename='convert.log',
    level=logging.INFO,
    format='%(asctime)s %(levelname)s: %(message)s'
)

# XML解析
tree = ET.parse('./origin.xml')
root = tree.getroot()

# アイキャッチURLマッピング (attachmentID -> URL)
thumb_map = {}
for item in root.findall('.//item'):
    post_type = item.findtext('wp:post_type', NS)
    if post_type == 'attachment':
        att_id = item.findtext('wp:post_id', NS)
        url = item.findtext('wp:attachment_url', NS)
        if att_id and url:
            thumb_map[att_id] = url

# CSV出力
with open('posts.csv', 'w', encoding='utf-8', newline='') as f:
    writer = csv.writer(f)
    writer.writerow([
        'post_id','title','content','eyecatch',
        'category','tag','author','created_date','updated_date','custom_fields'
    ])

    count_total = 0
    count_ok = 0

    for item in root.findall('.//item'):
        post_type = item.findtext('wp:post_type', NS)
        status = item.findtext('wp:status', NS)
        if post_type != 'post' or status != 'publish':
            continue
        count_total += 1
        try:
            post_id = item.findtext('wp:post_id', NS)
            title = item.findtext('title') or ''
            content = item.findtext('content:encoded', NS) or ''  # HTMLのまま

            # アイキャッチ
            thumb_id = None
            for pm in item.findall('wp:postmeta', NS):
                key = pm.findtext('wp:meta_key', NS)
                if key == '_thumbnail_id':
                    thumb_id = pm.findtext('wp:meta_value', NS)
                    break
            eyecatch = thumb_map.get(thumb_id, '')

            # カテゴリ／タグ
            cats, tags = [], []
            for cat in item.findall('category'):
                domain = cat.get('domain')
                name = cat.text or ''
                if domain == 'category':
                    cats.append(name)
                elif domain == 'post_tag':
                    tags.append(name)
            category = ';'.join(cats)
            tag = ';'.join(tags)

            # 作者
            author = item.findtext('dc:creator', NS) or ''

            # 日付
            created_date = item.findtext('wp:post_date', NS) or ''
            updated_date = item.findtext('wp:post_date_gmt', NS) or ''

            # カスタムフィールド（未使用なので空オブジェクト）
            custom_fields = json.dumps({})

            writer.writerow([
                post_id, title, content, eyecatch,
                category, tag, author, created_date, updated_date, custom_fields
            ])
            count_ok += 1
            logging.info(f"Post ID {post_id} を変換完了")
        except Exception as e:
            logging.error(f"Post ID {post_id} 変換失敗: {e}")

logging.info(f"変換完了: 正常 {count_ok}/{count_total} 件")
