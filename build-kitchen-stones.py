r"""Build the Kitchen Stones catalog (kitchen-stones.html + kitchen-stones/*.jpg).

Source 1: the supplier's live product list (WooCommerce store API on raphaelstoneusa.com)
          -> every countertop slab with ALL of its photos (slab + kitchen scenes),
             material line, colour, finish, slab size and thickness.
Source 2: the supplier's PDF "Slab Catalog 2025" -> quartz colours that are in the PDF
          but not on the website; their slab + kitchen photos are pulled out of the PDF.

The page is generated from catalog.html (same header, filters, lightbox, "Add to
Selection" quote flow), so it always matches the rest of the site.

Re-run any time the supplier adds colours:  python build-kitchen-stones.py
"""
import html, io, json, os, re, sys, urllib.request
import fitz  # PyMuPDF
from PIL import Image

HERE = os.path.dirname(os.path.abspath(__file__))
OUT = os.path.join(HERE, 'kitchen-stones')
PDF = os.environ.get('SLAB_PDF', r'C:\Users\realc\Downloads\Slab Catalog 2025_compressed (1).pdf')
API = 'https://www.raphaelstoneusa.com/wp-json/wc/store/v1/products?per_page=100&page={}'
UA = {'User-Agent': 'Mozilla/5.0'}
MAX_W = 1100


def get(url):
    return urllib.request.urlopen(urllib.request.Request(url, headers=UA), timeout=60).read()


def save_jpg(img, name):
    img = img.convert('RGB')
    if img.width > MAX_W:
        img = img.resize((MAX_W, round(img.height * MAX_W / img.width)), Image.LANCZOS)
    path = os.path.join(OUT, name + '.jpg')
    img.save(path, 'JPEG', quality=78, optimize=True, progressive=True)
    return name


def norm_code(s):  # RQ09893 / RQ9893-2 -> RQ9893
    m = re.match(r'([A-Z]+)0*(\d+)', (s or '').upper())
    return m.group(1) + m.group(2) if m else ''


def key(name):
    return re.sub(r'[^a-z]', '', name.lower().replace('printed quartz', '').replace('quartz', ''))


LINE = {'Engineered Stone': 'Quartz', 'Printed Stone': 'Printed Quartz', 'Natural Stone': 'Natural Stone',
        'Mineral Stone': 'Mineral Stone', 'Sintered Stone': 'Sintered Stone'}


def size_txt(terms):
    out = []
    for t in terms:
        m = re.match(r'(\d+)\s*x\s*(\d+)', t)
        if m: out.append(f'{m.group(1)}"x{m.group(2)}"')
    return ' / '.join(dict.fromkeys(out)) or 'Slab'


os.makedirs(OUT, exist_ok=True)
products = []

# ---- 1. website ---------------------------------------------------------------------------
web = []
for page in (1, 2, 3):
    batch = json.loads(get(API.format(page)))
    if not batch: break
    web += batch
print('website products:', len(web))
for p in web:
    attrs = {a['name']: [t['name'] for t in a['terms']] for a in p['attributes']}
    cat = next((c['name'] for c in p['categories'] if c['name'] in LINE), None)
    if not cat:  # natural stones carry no category, only the Material attribute
        mat = (attrs.get('Material') or ['Natural Stone'])[0]
        cat = 'Natural Stone' if 'Natural' in mat else 'Engineered Stone'
    slug = p['slug']
    imgs = []
    for i, im in enumerate(p['images']):
        name = f'{slug}-{i + 1}'
        if not os.path.exists(os.path.join(OUT, name + '.jpg')):
            try:
                save_jpg(Image.open(io.BytesIO(get(im['src']))), name)
            except Exception as e:
                print('  image failed', slug, im['src'], e); continue
        imgs.append(name)
    if not imgs:
        print('  skipped (no image):', p['name']); continue
    desc = html.unescape(re.sub(r'<[^>]+>', ' ', p['short_description'] or p['description'] or ''))
    desc = re.sub(r'\s+', ' ', desc).strip()
    line = LINE.get(cat, cat)
    if line == 'Natural Stone':  # tell the homeowner which natural stone it is
        txt = (p['name'] + ' ' + desc).lower()
        line = next((n for w, n in (('quartzite', 'Quartzite'), ('granite', 'Granite'), ('marble', 'Marble'),
                                    ('onyx', 'Onyx'), ('travertine', 'Travertine')) if w in txt), 'Natural Stone')
    thick = attrs.get('Thickness') or []
    products.append({
        'name': html.unescape(p['name']).strip(), 'sku': p['sku'] or '', 'category': line,
        'finish': ' / '.join(attrs.get('Finish') or ['Polished']),
        'size': size_txt(attrs.get('Size and Shape') or []),
        'color': (attrs.get('Main Color') or attrs.get('Primary Color') or ['Other'])[0],
        'thickness': ' & '.join(thick) if thick else '2CM & 3CM',
        'images': imgs, 'desc': desc,
        'tags': [t['name'] for t in p.get('tags', [])],
    })

# ---- 2. PDF-only colours ------------------------------------------------------------------
have_codes = {norm_code(p['sku']) for p in products if p['sku']}
have_names = {key(p['name']) for p in products}
doc = fitz.open(PDF)
CODE = re.compile(r'\b(R[A-Z]{0,3}\d{3,6})\s+([A-Z][A-Za-z\']+(?: [A-Z][A-Za-z\']+){0,3})')
found = {}
for pno, page in enumerate(doc):
    big = [i for i in page.get_image_info(xrefs=True) if i['bbox'][2] - i['bbox'][0] > 250]
    spread = len(big) <= 2 and all(i['bbox'][2] - i['bbox'][0] > 700 for i in big)
    for b in page.get_text('dict')['blocks']:
        for line in b.get('lines', []):
            txt = ''.join(s['text'] for s in line['spans'])
            for m in CODE.finditer(txt):
                code, name = norm_code(m.group(1)), m.group(2).strip()
                name = re.sub(r'\s+(Printed|Design|Concrit|Quartz)$', '', name)
                if code in found or code in have_codes or key(name) in have_names or len(name) < 3:
                    continue
                if spread:
                    # slab photo first (it carries the code label), kitchen scene second
                    x0 = line['bbox'][0]
                    pics = sorted(big, key=lambda i: 0 if i['bbox'][0] <= x0 < i['bbox'][2] else 1)
                else:
                    cx = (line['bbox'][0] + line['bbox'][2]) / 2
                    # grid pages: one caption line holds several codes -> use the code's own x
                    span = next((s for s in line['spans'] if m.group(1) in s['text']), None)
                    if span: cx = span['bbox'][0] + 20
                    pics = [min(big, key=lambda i: abs((i['bbox'][0] + i['bbox'][2]) / 2 - cx))] if big else []
                found[code] = (name, pno, [i['xref'] for i in pics])
print('PDF-only colours:', len(found))
for code, (name, pno, xrefs) in found.items():
    imgs = []
    for n, xref in enumerate(xrefs):
        fname = f'pdf-{code.lower()}-{n + 1}'
        if not os.path.exists(os.path.join(OUT, fname + '.jpg')):
            pix = fitz.Pixmap(doc, xref)
            if pix.n - pix.alpha >= 4: pix = fitz.Pixmap(fitz.csRGB, pix)
            save_jpg(Image.open(io.BytesIO(pix.tobytes('png'))), fname)
        imgs.append(fname)
    if not imgs: continue
    if len(imgs) > 1:  # slab photo first: a slab is far more uniform than a room photo
        def busy(f):
            g = Image.open(os.path.join(OUT, f + '.jpg')).convert('L').resize((8, 8))
            v = list(g.getdata()); m = sum(v) / len(v)
            return sum((x - m) ** 2 for x in v)
        imgs.sort(key=busy)
    low = name.lower()
    color = ('Black' if 'black' in low else 'Grey' if ('grey' in low or 'silver' in low) else 'Blue' if 'blue' in low
             else 'Purple' if 'amethyst' in low else 'Beige' if ('gold' in low or 'taj' in low) else 'White')
    products.append({'name': name, 'sku': code, 'category': 'Quartz', 'finish': 'Polished', 'size': '126"x64"',
                     'color': color, 'thickness': '2CM & 3CM', 'images': imgs,
                     'desc': f'{name} quartz slab, 126" x 64", available in 2 cm and 3 cm.', 'tags': []})

ORDER = ['Quartz', 'Printed Quartz', 'Quartzite', 'Marble', 'Granite', 'Onyx', 'Travertine', 'Natural Stone', 'Mineral Stone', 'Sintered Stone']
products.sort(key=lambda p: (ORDER.index(p['category']) if p['category'] in ORDER else 99, p['name']))
for i, p in enumerate(products, 1):
    p['id'] = i

# ---- 3. page ------------------------------------------------------------------------------
src = open(os.path.join(HERE, 'catalog.html'), encoding='utf-8').read()


def sub(old, new, count=1):
    global src
    if src.count(old) < 1:
        sys.exit(f'template changed, cannot find: {old[:70]!r}')
    src = src.replace(old, new) if count == 0 else src.replace(old, new, count)


def js(v):
    return json.dumps(v, ensure_ascii=False)


data = ',\n'.join(
    '  {id:%d,image:%s,images:%s,name:%s,sku:%s,category:%s,finish:%s,size:%s,material:%s,color:%s,use:%s,brand:"",tags:%s,desc:%s}'
    % (p['id'], js(p['images'][0]), js(p['images']), js(p['name']), js(p['sku']), js(p['category']), js(p['finish']),
       js(p['size']), js(p['category']), js(p['color']), js(p['thickness']), js(p['tags']), js(p['desc']))
    for p in products)
a = src.index('const PRODUCTS = ['); b = src.index('];', a) + 2
src = src[:a] + 'const PRODUCTS = [\n' + data + '\n];' + src[b:]

sub('<title>Product Catalog | Hello Projects Pro</title>', '<title>Kitchen Countertop Stones | Hello Projects Pro</title>')
src = re.sub(r'\s*<link rel="alternate" hreflang="[a-z]+" href="https://helloprojectspro.com/catalog[^"]*">', '', src)
src = src.replace('https://helloprojectspro.com/catalog.html', 'https://helloprojectspro.com/kitchen-stones.html')
src = re.sub(r'(<meta name="description" content=")[^"]*', r'\1Browse ' + str(len(products)) +
             ' quartz, quartzite, marble and granite countertop slabs. Select your favorites and get a free kitchen countertop quote from Hello Projects Pro.', src, count=1)
src = re.sub(r'(<meta property="og:title" content=")[^"]*', r'\1Kitchen Countertop Stones | Hello Projects Pro', src, count=1)
src = re.sub(r'(<meta property="og:description" content=")[^"]*', r'\1Quartz, quartzite, marble and granite slabs for your kitchen countertops.', src, count=1)
sub('<a href="catalog.html" class="nav-link active">Catalog</a>', '<a href="catalog.html" class="nav-link">Catalog</a>')
if '<a href="kitchen-stones.html" class="nav-link">Kitchen Stones</a>' in src:  # catalog.html already links here
    sub('<a href="kitchen-stones.html" class="nav-link">Kitchen Stones</a>',
        '<a href="kitchen-stones.html" class="nav-link active">Kitchen Stones</a>')
else:
    sub('<a href="catalog.html" class="nav-link">Catalog</a>',
        '<a href="catalog.html" class="nav-link">Catalog</a>\n        <a href="kitchen-stones.html" class="nav-link active">Kitchen Stones</a>')
sub('<h1>Materials Catalog</h1>', '<h1>Kitchen Countertop Stones</h1>')
# hero: one of our own kitchens (green cabinets, white quartz island) behind a dark overlay
sub('''      background: linear-gradient(135deg, var(--primary) 0%, var(--navy) 50%, var(--blue) 100%);
      color: var(--white);''', '''      background: linear-gradient(rgba(10, 22, 40, 0.62), rgba(10, 22, 40, 0.72)), url('kitchen-stones-hero.jpg') center 60% / cover no-repeat;
      color: var(--white);''')
sub('''      font-size: 18px;
      color: #94a3b8;''', '''      font-size: 18px;
      color: #e2e8f0;
      text-shadow: 0 1px 3px rgba(0, 0, 0, 0.5);''')
sub('<p>Browse our curated selection of premium flooring and tile. Find the perfect look for your renovation project.</p>',
    f'<p>{len(products)} quartz, quartzite, marble and granite slabs for your kitchen countertops, islands and backsplashes. Tap any stone to see it installed.</p>')
sub('<option value="">All Categories</option>', '<option value="">All Stone Types</option>')
sub('''          <option value="">Indoor/Outdoor</option>
          <option value="Indoor">Indoor Only</option>
          <option value="Indoor/Outdoor">Indoor & Outdoor</option>
          <option value="Outdoor">Outdoor Only</option>''', '''          <option value="">All Thicknesses</option>
          <option value="2CM">2 cm</option>
          <option value="3CM">3 cm</option>''')
sub('placeholder="Search products..."', 'placeholder="Search stones (e.g. Calacatta, Taj Mahal)..."')
# images live in kitchen-stones/, and every stone has a gallery
sub('<img data-src="catalog/${p.image}.jpg"', '<img data-src="kitchen-stones/${p.image}.jpg"')
sub("document.getElementById('lightboxImg').src = 'catalog/' + p.image + '.jpg';",
    """document.getElementById('lightboxImg').src = 'kitchen-stones/' + p.image + '.jpg';
  var gal = document.getElementById('lightboxGallery');
  if (!gal) {
    gal = document.createElement('div'); gal.id = 'lightboxGallery';
    gal.style.cssText = 'display:flex;gap:8px;flex-wrap:wrap;margin:10px 0 4px;';
    document.getElementById('lightboxName').parentNode.insertBefore(gal, document.getElementById('lightboxName'));
  }
  gal.innerHTML = (p.images.length > 1 ? p.images : []).map(function (im) {
    return '<img src="kitchen-stones/' + im + '.jpg" alt="" style="width:72px;height:56px;object-fit:cover;border-radius:6px;cursor:pointer;border:2px solid #e2e8f0" '
      + 'onclick="document.getElementById(\\'lightboxImg\\').src=this.src">';
  }).join('');""")
sub('<div class="lightbox-meta-row"><span class="lightbox-meta-label">Category</span><span class="lightbox-meta-value">${p.category}</span></div>',
    '<div class="lightbox-meta-row"><span class="lightbox-meta-label">Stone</span><span class="lightbox-meta-value">${p.category}</span></div>')
sub('<div class="lightbox-meta-row"><span class="lightbox-meta-label">Material</span><span class="lightbox-meta-value">${p.material}</span></div>',
    '${p.sku ? \'<div class="lightbox-meta-row"><span class="lightbox-meta-label">Code</span><span class="lightbox-meta-value">\' + p.sku + \'</span></div>\' : \'\'}')
sub('<span class="lightbox-meta-label">Use</span>', '<span class="lightbox-meta-label">Thickness</span>')
sub("tags.innerHTML = p.tags.map(t => `<span class=\"lightbox-tag\">${t}</span>`).join('');",
    "tags.innerHTML = (p.desc ? `<p style=\"color:#475569;font-size:14px;line-height:1.5;margin:0 0 8px;\">${p.desc}</p>` : '') + p.tags.map(t => `<span class=\"lightbox-tag\">${t}</span>`).join('');")
sub('<span class="detail-chip">${p.material}</span>', '<span class="detail-chip">${p.use}</span>')
sub("return p.name + ' (' + p.category + ', ' + p.size + ')';", "return p.name + (p.sku ? ' ' + p.sku : '') + ' (' + p.category + ', ' + p.finish + ')';")
sub("var body = 'CATALOG QUOTE REQUEST\\n'", "var body = 'KITCHEN STONE QUOTE REQUEST\\n'")
sub("content_name: 'Catalog Quote'", "content_name: 'Kitchen Stone Quote'")
sub("event_label: 'quote_request'", "event_label: 'kitchen_stone_quote'")
sub('placeholder="Kitchen, Bathroom, Living Room..."', 'placeholder="Kitchen countertops, island, backsplash..."')
sub("I%27m%20interested%20in%20a%20product%20from%20your%20catalog.", "I%27m%20interested%20in%20a%20kitchen%20countertop%20stone.")
open(os.path.join(HERE, 'kitchen-stones.html'), 'w', encoding='utf-8').write(src)

used = {im for p in products for im in p['images']}
for f in os.listdir(OUT):
    if f.endswith('.jpg') and f[:-4] not in used: os.remove(os.path.join(OUT, f))
mb = sum(os.path.getsize(os.path.join(OUT, f)) for f in os.listdir(OUT)) / 1e6
print(f'kitchen-stones.html: {len(products)} stones, {len(used)} photos, {mb:.1f} MB')
from collections import Counter
print(Counter(p['category'] for p in products))
