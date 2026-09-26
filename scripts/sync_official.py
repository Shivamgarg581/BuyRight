import json, re
from pathlib import Path
import requests
from bs4 import BeautifulSoup

URL='https://fcainfoweb.nic.in/Default.aspx'
HEADERS={'User-Agent':'BuyRight/1.0 (+https://smartpickai.rf.gd)'}
KNOWN={
'Rice':'rice','Wheat':'wheat','Atta (Wheat)':'atta','Gram Dal':'gram-dal','Tur/Arhar Dal':'tur-arhar-dal','Urad Dal':'urad-dal','Moong Dal':'moong-dal','Masur Dal':'masoor-dal','Masoor Dal':'masoor-dal','Sugar':'sugar','Gur':'gur','Groundnut Oil (Packed)':'groundnut-oil','Mustard Oil (Packed)':'mustard-oil','Vanaspati (Packed)':'vanaspati','Sunflower Oil (Packed)':'sunflower-oil','Soya Oil (Packed)':'soya-oil','Palm Oil (Packed)':'palm-oil','Tea Loose':'tea-loose','Milk @':'milk','Milk':'milk','Potato':'potato','Onion':'onion','Tomato':'tomato','Salt Pack (Iodised)':'salt','Salt':'salt'}

def num(value):
    try: return float(re.sub(r'[^0-9.-]','',value))
    except (TypeError,ValueError): return None

r=requests.get(URL,headers=HEADERS,timeout=30)
r.raise_for_status()
soup=BeautifulSoup(r.text,'html.parser')
body=' '.join(soup.get_text(' ',strip=True).split())
m=re.search(r'As on\\s+(\\d{2}/\\d{2}/\\d{4})',body,re.I)
if not m: raise SystemExit('Official source date not found; refusing to publish.')
d,mo,y=m.group(1).split('/')
observed=f'{y}-{mo}-{d}'
out={'source':'Department of Consumer Affairs Price Monitoring System','sourceUrl':URL,'observedOn':observed,'currency':'INR','retail':{},'wholesalePerQuintal':{}}
for table in soup.find_all('table'):
    text=table.get_text(' ',strip=True)
    parent=table.parent.get_text(' ',strip=True) if table.parent else ''
    scope=text+' '+parent
    kind='retail' if re.search(r'Average\\s+Retail',scope,re.I) else ('wholesale' if re.search(r'Average\\s+Wholesale',scope,re.I) else None)
    if not kind: continue
    for tr in table.find_all('tr'):
        cells=[c.get_text(' ',strip=True) for c in tr.find_all(['th','td'])]
        if len(cells)<2: continue
        slug=KNOWN.get(cells[0])
        price=num(cells[1])
        if not slug or price is None: continue
        out[kind][slug]=price
if len(out['retail'])<10: raise SystemExit(f"Only {len(out['retail'])} retail records parsed; refusing to publish.")
Path('data/official-prices.json').write_text(json.dumps(out,indent=2)+'\\n')
hp=Path('data/price-history.json')
history=json.loads(hp.read_text()) if hp.exists() else []
history=[x for x in history if x.get('date')!=observed]
history.append({'date':observed,'retail':out['retail']})
hp.write_text(json.dumps(history[-365:],indent=2)+'\\n')
print(f'Synced {len(out["retail"])} retail observations for {observed}.')
