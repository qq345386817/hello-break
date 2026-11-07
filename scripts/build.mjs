import fs from 'node:fs';
import path from 'node:path';
import { createHash } from 'node:crypto';
import {execFileSync} from 'node:child_process';
const root = path.resolve(import.meta.dirname, '..');
const config = JSON.parse(fs.readFileSync(path.join(root,'content/locales.json')));
const site = JSON.parse(fs.readFileSync(path.join(root,'site.config.json')));
const origin = (process.env.SITE_ORIGIN || site.origin)?.replace(/\/$/,'');
const email = process.env.SUPPORT_EMAIL || site.supportEmail;
const editorial = JSON.parse(fs.readFileSync(path.join(root,'content/seo.json')));
const store=JSON.parse(fs.readFileSync(path.join(root,'content/store-metadata.json')));
const product=JSON.parse(fs.readFileSync(path.join(root,'content/product.json')));
if(origin && !/^https:\/\/[a-z0-9.-]+(?::\d+)?$/i.test(origin))throw new Error('SITE_ORIGIN must be a public HTTPS origin');
if(email && !/^[^\s@<>]+@[^\s@<>]+\.[^\s@<>]+$/.test(email))throw new Error('SUPPORT_EMAIL is invalid');
const out=path.join(root,'dist');fs.rmSync(out,{recursive:true,force:true});fs.mkdirSync(out,{recursive:true});fs.cpSync(path.join(root,'assets'),path.join(out,'assets'),{recursive:true});
fs.copyFileSync(path.join(root,'_headers'),path.join(out,'_headers'));
const escape = text => String(text).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const pages=['index','help','privacy'];
const pageUpdated=page=>page==='privacy'?(product.privacyUpdatedOn??product.updatedOn):product.updatedOn;
const asset = file => `${file}?v=${createHash('sha256').update(fs.readFileSync(path.join(out,file))).digest('hex').slice(0,12)}`;
const jsonScript = value => JSON.stringify(value).replace(/</g,'\\u003c');
for(const locale of config.locales){
 const strings=JSON.parse(fs.readFileSync(path.join(root,'content',locale.id+'.json')));
 const seoContent=editorial[locale.id];
 const t=key=>escape(strings[key]??(()=>{throw new Error('Missing '+key)})());
 for(const page of pages){
  const route=`/${locale.id}/${page==='index'?'':page+'/'}`;
  const kind=page==='index'?'home':page;
  const title = 'HelloBreak — '+seoContent[kind+'Title'];
  const description = seoContent[kind+'Description'];
  const seo=origin?`<link rel="canonical" href="${origin}${route}">${config.locales.map(l=>`<link rel="alternate" hreflang="${l.id}" href="${origin}/${l.id}/${page==='index'?'':page+'/'}">`).join('')}<link rel="alternate" hreflang="x-default" href="${origin}/en-US/${page==='index'?'':page+'/'}">`:'';
  const nav=`<header class="wrap"><a class="wordmark" href="/${locale.id}/"><img class="brand-icon" src="/assets/icons/icon-128.png" width="32" height="32" alt="">HelloBreak</a><nav aria-label="HelloBreak"><a href="/${locale.id}/#how">${t('web.how')}</a><a href="/${locale.id}/help/">${t('web.help')}</a><a href="/${locale.id}/privacy/">${t('web.privacy')}</a><details class="languages"><summary>${escape(locale.name)}</summary><div>${config.locales.map(l=>`<a lang="${l.id}" hreflang="${l.id}" href="/${l.id}/${page==='index'?'':page+'/'}" ${l.id===locale.id?'aria-current="true"':''}>${escape(l.name)}</a>`).join('')}</div></details></nav></header>`;
  const footer=`<footer class="wrap"><a class="wordmark" href="/${locale.id}/"><img class="brand-icon" src="/assets/icons/icon-128.png" width="32" height="32" alt="">HelloBreak</a><p>${escape(seoContent.privacyLine)}</p><div><a href="/${locale.id}/help/">${t('web.help')}</a><a href="/${locale.id}/privacy/">${t('web.privacy')}</a></div><small>© 2026 Peike Luo</small></footer>`;
  const support=email?`<a href="mailto:${escape(email)}">${escape(email)}</a>`:`<p>${t('help.contactBody')}</p><a href="https://github.com/qq345386817/hello-break/issues" rel="noreferrer">GitHub Issues</a>`;
  let body;
  if(page==='index'){
   const featureLinks=['app-limits','websites','focus','reports'];
   body=`<main><section class="hero wrap"><div><p class="eyebrow">iPhone · iPad · Mac</p><h1>${escape(store.platforms.ios[locale.id].subtitle)}</h1><p class="lead">${escape(description)}</p><a class="button" href="/${locale.id}/help/">${t('web.help')} <span aria-hidden="true">↗</span></a><p class="small">${escape(seoContent.privacyLine)}</p></div><aside class="pause-preview" aria-labelledby="break-preview"><p class="eyebrow">HELLOBREAK</p><h2 id="break-preview">${escape(seoContent.previewHeading)}</h2><p class="preview-flow">${escape(seoContent.previewFlow)}</p><p>${escape(seoContent.previewBody)}</p><a href="/${locale.id}/help/#guided-break">${t('web.how')} →</a></aside></section><section id="how" class="wrap steps"><div class="section-heading"><h2>${escape(seoContent.featuresHeading)}</h2></div>${seoContent.features.map(([heading,text],i)=>`<article><h3><a href="/${locale.id}/help/#${featureLinks[i]}">${escape(heading)}</a></h3><p>${escape(text)}</p></article>`).join('')}</section><section id="download" class="platforms wrap"><h2>${t('web.platforms')}</h2><p>${t('web.downloadPending')}</p><div class="platform-grid"><article><h3>iPhone / iPad</h3><p>${escape(store.platforms.ios[locale.id].intro)}</p><a href="/${locale.id}/help/#iphone">${t('web.help')} →</a></article><article><h3>${t('web.mac')}</h3><p>${escape(store.platforms.mac[locale.id].intro)}</p><a href="/${locale.id}/help/#mac">${t('web.help')} →</a></article></div></section><section class="faq wrap" aria-labelledby="faq-title"><h2 id="faq-title">${escape(seoContent.faqHeading)}</h2>${seoContent.faq.map(([q,a],i)=>`<details id="${product.faqIds[i]}"><summary>${escape(q)}</summary><p>${escape(a)}</p></details>`).join('')}</section></main>`;
  }else if(page==='help'){
   body=`<main class="document wrap"><p class="eyebrow">HELLOBREAK / ${t('web.help')}</p><h1>${t('help.title')}</h1><p class="lead">${escape(description)}</p><section id="iphone"><h2>iPhone / iPad</h2><p>${escape(store.platforms.ios[locale.id].intro)}</p></section><section id="mac"><h2>${t('help.mac')}</h2><p>${t('help.macBody')}</p></section><section id="safari"><h2>${t('safari.title')}</h2><p>${t('safari.description')}</p><h3>iPhone / iPad</h3><p>${t('safari.setup.ios')}</p><h3>macOS</h3><p>${t('safari.setup.mac')}</p><p>${t('safari.limitations')}</p></section><section id="chrome"><h2>${t('help.chrome')}</h2><p>${t('help.chromeBody')}</p><details class="technical"><summary>${escape(seoContent.advancedHeading)}</summary><pre><code>~/Library/Application Support/Google/Chrome/NativeMessagingHosts/com.luopeike.hellobreak.json</code></pre><p>Chrome: <code>chrome://extensions</code></p></details></section><section id="focus"><h2>${t('focus.title')}</h2><p>${t('help.focusSetup')}</p><p>${t('focus.restore')}</p><p>${t('focus.macNote')}</p></section><section><h2>${t('help.limitations')}</h2><p>${t('help.limitBody')}</p></section><section><h2>${t('help.contact')}</h2>${support}</section></main>`;
  }else{
   body=`<main class="document wrap"><p class="eyebrow">HELLOBREAK</p><h1>${t('privacy.title')}</h1><p class="small"><time datetime="${pageUpdated(page)}">${escape(seoContent.updatedLabel)}</time></p><p class="lead">${escape(description)}</p><section><h2>${t('privacy.localTitle')}</h2><p>${escape(seoContent.localDataBody)}</p></section><section><h2>${escape(seoContent.privacyScopeHeading)}</h2><p>${escape(seoContent.privacyScopeBody)}</p></section>${[['privacy.browserTitle','privacy.browser'],['privacy.controlTitle','privacy.control'],['privacy.webTitle','privacy.web']].map(([heading,text])=>`<section><h2>${t(heading)}</h2><p>${t(text)}</p>${text==='privacy.browser'?`<p>${t('privacy.chromeLocal')}</p>`:''}</section>`).join('')}<section id="chrome-extension"><h2>${escape(seoContent.privacyChromeHeading)}</h2><p>${escape(seoContent.privacyChromeBody)}</p><p>${escape(seoContent.privacyChromeLimitedUse)}</p></section><section><h2>${t('help.contact')}</h2>${support}</section></main>`;
  }
  const url=origin?origin+route:route;
  const graph=origin?[
   {'@type':'WebSite','@id':origin+'/#website',name:'HelloBreak',url:origin+'/en-US/',inLanguage:config.locales.map(l=>l.id)},
   {'@type':'SoftwareApplication','@id':origin+'/#app',name:'HelloBreak',alternateName:strings['app.name'],url:origin+'/en-US/',applicationCategory:'ProductivityApplication',operatingSystem:product.operatingSystems,inLanguage:locale.id,image:origin+'/assets/icons/icon-1024.png',description:seoContent.homeDescription,featureList:seoContent.features.map(([heading])=>heading),author:{'@type':'Person',name:'Peike Luo'}},
   {'@type':page==='index'?'WebPage':page==='help'?'FAQPage':'WebPage','@id':url+'#page',url,name:title,description,inLanguage:locale.id,dateModified:pageUpdated(page),isPartOf:{'@id':origin+'/#website'},about:{'@id':origin+'/#app'},...(page==='help'?{mainEntity:seoContent.faq.map(([q,a])=>({'@type':'Question',name:q,acceptedAnswer:{'@type':'Answer',text:a}}))}:{})}
  ]:[];
  // Every FAQ answer marked up here is also rendered as ordinary readable HTML.
  if(page==='help')body=body.replace('</main>',`<section><h2>${escape(seoContent.faqHeading)}</h2>${seoContent.faq.map(([q,a],i)=>`<h3 id="${product.faqIds[i]}">${escape(q)}</h3><p>${escape(a)}</p>`).join('')}</section></main>`);
  const metadata=`<meta name="description" content="${escape(description)}"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:image" content="${origin??''}${asset('/assets/icons/icon-1024.png')}"><meta property="og:image:width" content="1024"><meta property="og:image:height" content="1024"><meta property="og:image:alt" content="HelloBreak"><meta property="og:locale" content="${({'en-US':'en_US','zh-Hans':'zh_CN','zh-Hant':'zh_TW',es:'es_ES',ja:'ja_JP',ko:'ko_KR',fr:'fr_FR',de:'de_DE'}[locale.id])}"><meta property="og:type" content="website"><meta property="og:url" content="${url}"><meta name="twitter:card" content="summary"><meta name="twitter:title" content="${escape(title)}"><meta name="twitter:description" content="${escape(description)}"><meta name="twitter:image" content="${origin??''}${asset('/assets/icons/icon-1024.png')}">`;
  const verification=site.googleSiteVerification?`<meta name="google-site-verification" content="${escape(site.googleSiteVerification)}">`:'';
  const html=`<!doctype html><html lang="${locale.id}"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width,initial-scale=1">${metadata}${verification}<meta name="color-scheme" content="light dark"><link rel="icon" href="${asset('/assets/icons/icon-32.png')}" sizes="32x32" type="image/png"><link rel="icon" href="${asset('/assets/icons/icon-16.png')}" sizes="16x16" type="image/png"><link rel="apple-touch-icon" href="${asset('/assets/icons/icon-180.png')}"><title>${escape(title)}</title>${seo}${graph.length?`<script type="application/ld+json">${jsonScript({'@context':'https://schema.org','@graph':graph})}</script>`:''}<link rel="stylesheet" href="${asset('/assets/brand.css')}"><link rel="stylesheet" href="${asset('/assets/site.css')}"></head><body>${nav}${body}${footer}</body></html>`;
  const directory=path.join(out,locale.id,page==='index'?'':page);fs.mkdirSync(directory,{recursive:true});fs.writeFileSync(path.join(directory,'index.html'),html);
  if(locale.id===config.default&&page==='index')fs.writeFileSync(path.join(out,'index.html'),html);
 }
}
fs.writeFileSync(path.join(out,'404.html'),'<!doctype html><html lang="en-US"><meta charset="utf-8"><title>HelloBreak — 404</title><link rel="stylesheet" href="/assets/brand.css"><link rel="stylesheet" href="/assets/site.css"><main class="document wrap"><h1>404</h1><a href="/en-US/">HelloBreak</a></main></html>');
if(origin){fs.writeFileSync(path.join(out,'sitemap.xml'),'<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">'+config.locales.flatMap(l=>pages.map(p=>`<url><loc>${origin}/${l.id}/${p==='index'?'':p+'/'}</loc><lastmod>${pageUpdated(p)}</lastmod></url>`)).join('')+'</urlset>');fs.writeFileSync(path.join(out,'robots.txt'),'User-agent: *\nAllow: /\nSitemap: '+origin+'/sitemap.xml\n');}else{for(const f of ['sitemap.xml','robots.txt'])if(fs.existsSync(path.join(out,f)))fs.unlinkSync(path.join(out,f));}
console.log(`Built 24 localized pages; default ${config.default}. ${origin?'Public metadata configured.':'SITE_ORIGIN is unset: local preview only.'}`);
if(origin){
 const llms=`# HelloBreak\n\n> ${editorial['en-US'].homeDescription}\n\nPublic App Store release links are being prepared. This site does not claim that an app awaiting review is publicly available.\n\n${editorial['en-US'].faq.map(([q,a])=>`## ${q}\n\n${a}`).join('\n\n')}\n\nSupport: ${email}.\n\n## Official English pages\n\n- [Overview](${origin}/en-US/)\n- [Help and setup](${origin}/en-US/help/)\n- [Report scope](${origin}/en-US/help/#reports)\n- [Privacy policy](${origin}/en-US/privacy/)\n\n## Localized pages\n\n${config.locales.map(l=>`- [${l.name}](${origin}/${l.id}/)`).join('\n')}\n\n- [Sitemap](${origin}/sitemap.xml)\n\nThis optional index summarizes visible public pages. It does not grant crawler access, override robots.txt or guarantee indexing or AI citations.\n`;
 fs.writeFileSync(path.join(out,'llms.txt'),llms);
}

let commit=process.env.CF_PAGES_COMMIT_SHA||null;
if(!commit)try{commit=execFileSync('git',['rev-parse','HEAD'],{cwd:root,encoding:'utf8',stdio:['ignore','pipe','ignore']}).trim();}catch{}
fs.writeFileSync(path.join(out,'deployment.json'),JSON.stringify({project:'hello-break',commit,contentUpdatedOn:[product.updatedOn,product.privacyUpdatedOn].filter(Boolean).sort().at(-1),privacyUpdatedOn:product.privacyUpdatedOn??product.updatedOn})+'\n');
