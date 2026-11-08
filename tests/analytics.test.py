"""
Analytics behaviour tests (run against a TEST build that uses tests/umami-stub.js).

  PUBLIC_UMAMI_WEBSITE_ID=test-site PUBLIC_UMAMI_SCRIPT_URL=/js/umami-stub.js \
  PUBLIC_UMAMI_DOMAINS=localhost npx astro build --outDir dist-test
  cp tests/umami-stub.js dist-test/js/
  (cd dist-test && python3 -m http.server 4322 &)
  python3 tests/analytics.test.py

The stub records what WOULD be sent to Umami after umamiBeforeSend; nothing leaves the machine.
This verifies the site's own tracking logic. It cannot verify Umami Cloud ingestion.
"""
import asyncio, json, os, re, sys
from playwright.async_api import async_playwright

BASE = 'http://localhost:4322'
CHROME = os.environ.get('CHROME') or None  # e.g. CHROME=/usr/bin/google-chrome
ALLOWED = {'page', 'project', 'location', 'device', 'ref_cat', 'target', 'domain',
           'engaged_s', 'engaged_bucket', 'scroll_pct', 'section', 'file'}
results = []

def check(name, cond, detail=''):
    results.append((name, bool(cond), detail))
    print(('PASS ' if cond else 'FAIL ') + name + (f'  [{detail}]' if detail else ''))

async def log(pg):
    return json.loads(await pg.evaluate("localStorage.getItem('stub.log') || '[]'"))

def events(entries, name=None):
    ev = [e['payload'] for e in entries if e['payload'].get('name')]
    return [e for e in ev if name is None or e['name'] == name]

def pageviews(entries):
    return [e['payload'] for e in entries if not e['payload'].get('name')]

async def fresh(browser, **kw):
    ctx = await browser.new_context(viewport={'width': 1280, 'height': 800}, **kw)
    # Keep the test inside the site: block real external navigation.
    await ctx.route(re.compile(r'^https?://(?!localhost).*'), lambda r: r.abort())
    pg = await ctx.new_page()
    await pg.goto(BASE + '/privacy/')
    await pg.evaluate("localStorage.clear(); sessionStorage.clear()")
    return ctx, pg

async def main():
    async with async_playwright() as p:
        b = await p.chromium.launch(executable_path=CHROME, args=['--no-sandbox'])

        # 1. Page view + URL / referrer sanitisation
        ctx, pg = await fresh(b)
        await pg.goto(BASE + '/?utm_source=x&token=SECRET123#frag', referer='https://www.google.com/search?q=SECRETQUERY')
        await pg.wait_for_timeout(400)
        pv = pageviews(await log(pg))
        check('page view recorded on load', len(pv) == 1, f'{len(pv)} page views')
        check('query string and fragment removed from URL', pv and pv[0]['url'] == '/', pv[0]['url'] if pv else '')
        check('referrer reduced to origin', pv and pv[0]['referrer'] == 'https://www.google.com/', pv[0]['referrer'] if pv else '')

        # 2. research_interest_view fires once, only after ≥1 s in view
        await pg.locator('#ri-title').scroll_into_view_if_needed()
        await pg.wait_for_timeout(300)
        early = len(events(await log(pg), 'research_interest_view'))
        await pg.wait_for_timeout(1300)
        await pg.mouse.wheel(0, -2000); await pg.wait_for_timeout(300)
        await pg.locator('#ri-title').scroll_into_view_if_needed(); await pg.wait_for_timeout(1500)
        riv = events(await log(pg), 'research_interest_view')
        check('research_interest_view not sent before 1 s dwell', early == 0)
        check('research_interest_view sent exactly once', len(riv) == 1, str(len(riv)))
        check('event carries ref_cat=search from landing referrer', riv and riv[0]['data'].get('ref_cat') == 'search', riv[0]['data'] if riv else '')

        # 3. CV download (double click → one event)
        await pg.evaluate("document.querySelectorAll('a[href$=\".pdf\"]').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))")
        cv = pg.locator('a[data-loc="hero"][href$=".pdf"]')
        await cv.click(); await cv.click()
        cvd = events(await log(pg), 'cv_download')
        check('cv_download recorded once for a double click', len(cvd) == 1, str(len(cvd)))
        check('cv_download has location=hero', cvd and cvd[0]['data'].get('location') == 'hero')

        # 4. GitHub profile, email, contact
        await pg.evaluate("document.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))")
        await pg.locator('a[data-loc="hero"][href="https://github.com/Kyounglim-Joey"]').click()
        await pg.locator('a[data-loc="home-cta"][href^="mailto:"]').click()
        await pg.locator('a[data-loc="home-cta"][href="/cv/"]').click()
        ent = await log(pg)
        check('github_profile_click recorded', len(events(ent, 'github_profile_click')) == 1)
        check('email_click recorded', len(events(ent, 'email_click')) == 1)
        check('contact_click recorded', len(events(ent, 'contact_click')) == 1)
        await ctx.close()

        # 5. Project pages: project_view per project, repo click with project name
        ctx, pg = await fresh(b)
        for slug in ['et5-korean-summarization', 'mold-detection-yolov5', 'customer-decline-prediction']:
            await pg.goto(f'{BASE}/projects/{slug}/'); await pg.wait_for_timeout(300)
        await pg.evaluate("document.querySelectorAll('a').forEach(a=>a.addEventListener('click',e=>e.preventDefault()))")
        await pg.locator('a[data-loc="detail-repo"]').click()
        ent = await log(pg)
        pvs = events(ent, 'project_view')
        names = sorted(e['data']['project'] for e in pvs)
        check('project_view once per project page', names == ['customer_decline', 'et5_summarization', 'mold_detection'], str(names))
        pg_paths = sorted(e['url'] for e in pageviews(ent) if e['url'].startswith('/projects/'))
        check('page views distinguish project pages', len(set(pg_paths)) == 3, str(pg_paths))
        pgc = events(ent, 'project_github_click')
        check('project_github_click carries project name', pgc and pgc[0]['data'].get('project') == 'customer_decline', pgc[0]['data'] if pgc else '')

        # 6. Engagement time: active time counted, unfocused time excluded
        await pg.evaluate("localStorage.setItem('stub.log','[]')")
        await pg.goto(f'{BASE}/projects/et5-korean-summarization/')
        await pg.evaluate("Object.defineProperty(document,'hasFocus',{value:()=>window.__focus!==false,configurable:true})")
        for i in range(6):
            await pg.mouse.move(100 + i * 10, 200); await pg.mouse.wheel(0, 900); await pg.wait_for_timeout(1000)
        await pg.evaluate("window.__focus=false")
        await pg.wait_for_timeout(4000)
        est = await pg.evaluate("window.__pfEngagement()")
        await pg.goto(f'{BASE}/about/'); await pg.wait_for_timeout(300)  # pagehide sends page_engagement
        eng = [e for e in events(await log(pg), 'page_engagement') if e['data']['page'] == '/projects/et5-korean-summarization/']
        s = eng[0]['data']['engaged_s'] if eng else -1
        check('page_engagement sent once when leaving the page', len(eng) == 1, str(len(eng)))
        check('engaged time ≈ active seconds, unfocused time excluded', 4 <= s <= 8, f'engaged_s={s}, raw={est}')
        check('scroll depth bucket recorded', eng and eng[0]['data']['scroll_pct'] in (25, 50, 75, 100), eng[0]['data'] if eng else '')
        await ctx.close()

        # 7. Opt-out on /privacy/ stops everything
        ctx, pg = await fresh(b)
        await pg.check('#optout')
        await pg.evaluate("localStorage.setItem('stub.log','[]')")
        await pg.goto(BASE + '/'); await pg.wait_for_timeout(400)
        await pg.goto(BASE + '/projects/mold-detection-yolov5/'); await pg.wait_for_timeout(400)
        check('opt-out: nothing recorded', len(await log(pg)) == 0, str(len(await log(pg))))
        await ctx.close()

        # 8. Global Privacy Control stops everything
        ctx = await b.new_context()
        await ctx.add_init_script("Object.defineProperty(navigator,'globalPrivacyControl',{get:()=>true})")
        pg = await ctx.new_page()
        await pg.goto(BASE + '/'); await pg.wait_for_timeout(400)
        await pg.goto(BASE + '/projects/'); await pg.wait_for_timeout(400)
        check('GPC: nothing recorded', len(await log(pg)) == 0)
        await ctx.close()

        # 9. Do Not Track stops everything
        ctx = await b.new_context()
        await ctx.add_init_script("Object.defineProperty(navigator,'doNotTrack',{get:()=>'1'})")
        pg = await ctx.new_page()
        await pg.goto(BASE + '/'); await pg.wait_for_timeout(400)
        check('DNT: nothing recorded', len(await log(pg)) == 0)
        await ctx.close()

        # 10. Payload hygiene across a full browse session
        ctx, pg = await fresh(b)
        for path in ['/', '/about/', '/experience/', '/projects/', '/projects/et5-korean-summarization/', '/education/', '/awards/', '/skills/', '/cv/?ref=SECRET', '/privacy/']:
            await pg.goto(BASE + path); await pg.mouse.wheel(0, 3000); await pg.wait_for_timeout(250)
        await pg.goto(BASE + '/'); await pg.wait_for_timeout(300)
        ent = await log(pg)
        blob = json.dumps(ent)
        check('no query strings in any sent URL', all('?' not in e['payload']['url'] for e in ent))
        check('no secrets / email address in payloads', 'SECRET' not in blob and '@' not in blob)
        bad = [k for e in ent for k in (e['payload'].get('data') or {}) if k not in ALLOWED]
        check('only allow-listed event properties', not bad, str(bad))
        check('engagement events produced while browsing', len(events(ent, 'page_engagement')) >= 8, str(len(events(ent, 'page_engagement'))))
        await ctx.close()
        await b.close()

    failed = [r for r in results if not r[1]]
    print(f'\n{len(results) - len(failed)}/{len(results)} checks passed')
    sys.exit(1 if failed else 0)

asyncio.run(main())
