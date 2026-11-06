import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
const root=path.resolve(import.meta.dirname,'..'),out=path.join(root,'dist');
const config=JSON.parse(fs.readFileSync(path.join(root,'content/locales.json')));
const site=JSON.parse(fs.readFileSync(path.join(root,'site.config.json')));
const titles=new Set(),descriptions=new Set();
const escape=text=>text.replaceAll('&','&amp;').replaceAll('"','&quot;').replaceAll("'",'&#39;').replaceAll('<','&lt;').replaceAll('>','&gt;');
const editorial=JSON.parse(fs.readFileSync(path.join(root,'content/seo.json')));
const store=JSON.parse(fs.readFileSync(path.join(root,'content/store-metadata.json')));
const product=JSON.parse(fs.readFileSync(path.join(root,'content/product.json')));
assert.equal(product.publicRelease,false,'Verify public availability before enabling store download claims');
for(const locale of config.locales){
 const copy=editorial[locale.id];
 assert.equal(copy.faq.length,8);
 assert.equal(copy.features.length,4);
 assert.equal(store.platforms.ios[locale.id].name,'HelloBreak');
 assert.equal(store.platforms.ios[locale.id].subtitle,store.platforms.mac[locale.id].subtitle);
 for(const page of ['index','help','privacy']){
  const route=`/${locale.id}/${page==='index'?'':page+'/'}`;
  const html=fs.readFileSync(path.join(out,locale.id,page==='index'?'':page,'index.html'),'utf8');
  const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];
  assert.equal(scripts.length,1);
  assert.equal(scripts[0][1],' type="application/ld+json"');
  const graph=JSON.parse(scripts[0][2])['@graph'];
  assert.equal(graph.length,3);
  assert(!scripts[0][2].includes('aggregateRating'));
  assert(!scripts[0][2].includes('offers'));
  assert.deepEqual(graph[1].operatingSystem,product.operatingSystems);
  assert.equal(graph[1].description,copy.homeDescription);
  assert.deepEqual(graph[1].featureList,copy.features.map(([heading])=>heading));
  if(page==='help')for(const q of graph[2].mainEntity){
   assert(html.includes(escape(q.name)));
   assert(html.includes(escape(q.acceptedAnswer.text)));
  }
  const title=html.match(/<title>(.*?)<\/title>/)[1];
  const description=html.match(/<meta name="description" content="([^"]+)"/)[1];
  assert(title.startsWith('HelloBreak — '));
  assert(!titles.has(title),'Duplicate title'); titles.add(title);
  assert(!descriptions.has(description),'Duplicate description'); descriptions.add(description);
  assert(html.includes(`rel="canonical" href="${site.origin}${route}"`));
  assert(html.includes(`name="google-site-verification" content="${site.googleSiteVerification}"`));
  assert(html.includes('/assets/icons/icon-32.png?v='));
  if(page==='index'){
   assert(html.includes(`<h1>${escape(store.platforms.ios[locale.id].subtitle)}</h1>`));
   assert(html.includes(escape(store.platforms.ios[locale.id].intro)));
   assert(html.includes(escape(store.platforms.mac[locale.id].intro)));
   assert(html.includes(escape(copy.previewBody)));
   assert(!html.includes('class="choice'));
  }
  if(page==='help')for(const id of product.faqIds)assert(html.includes(`id="${id}"`));
  if(page==='privacy')assert(html.includes(escape(copy.privacyScopeBody)));
  for(const m of html.matchAll(/(?:href|src)="(\/[^"#]*)/g)){
   assert(fs.existsSync(path.join(out,m[1].split(/[?#]/)[0])),`Broken asset/link ${m[1]}`);
  }
 }
}
const sitemap=fs.readFileSync(path.join(out,'sitemap.xml'),'utf8');
const locations=[...sitemap.matchAll(/<loc>(.*?)<\/loc>/g)].map(x=>x[1]);
assert.equal(locations.length,24); assert.equal(new Set(locations).size,24);
const modified=[...sitemap.matchAll(/<lastmod>(.*?)<\/lastmod>/g)].map(x=>x[1]);
assert.equal(modified.length,24);assert(modified.every(date=>date===product.updatedOn));
for(const url of locations){assert(url.startsWith(site.origin+'/')); assert(fs.existsSync(path.join(out,new URL(url).pathname,'index.html')));}
const llms=fs.readFileSync(path.join(out,'llms.txt'),'utf8');
for(const m of llms.matchAll(/\]\((https:[^)]+)\)/g)){assert(m[1].startsWith(site.origin));assert(fs.existsSync(path.join(out,new URL(m[1]).pathname)));}
for(const [question,answer] of editorial['en-US'].faq){assert(llms.includes(question));assert(llms.includes(answer));}
assert(!llms.includes('still require physical-device acceptance'));
assert.equal(JSON.parse(fs.readFileSync(path.join(out,'deployment.json'))).project,'hello-break');
console.log('PASS: unique metadata, canonical URLs, visible FAQ structured data, no executable scripts, assets, GSC verification, 24 sitemap URLs and llms links.');
