import fs from 'node:fs';
import path from 'node:path';
import assert from 'node:assert/strict';
import {createHash} from 'node:crypto';
const root=path.resolve(import.meta.dirname,'..');
const appRoot=path.resolve(root,'..');
const locales=JSON.parse(fs.readFileSync(path.join(root,'content/locales.json'))).locales;
const storeCodes={'en-US':'en-US','zh-Hans':'zh-Hans','zh-Hant':'zh-Hant',es:'es-ES',ja:'ja',ko:'ko',fr:'fr-FR',de:'de-DE'};
const sourceHashes={},platforms={};
for(const [platform,directory] of [['ios','metadata_ios'],['mac','metadata_macos']]){
 platforms[platform]={};
 for(const locale of locales){
  const values={};
  for(const field of ['name','subtitle','description','promotional_text']){
   const relative=`fastlane/${directory}/${storeCodes[locale.id]}/${field}.txt`;
   const bytes=fs.readFileSync(path.join(appRoot,relative));
   values[field]=bytes.toString('utf8').trim();
   sourceHashes[relative]=createHash('sha256').update(bytes).digest('hex');
  }
  assert.equal(values.name,'HelloBreak');
  platforms[platform][locale.id]={name:values.name,subtitle:values.subtitle,intro:values.description.split(/\r?\n\r?\n/)[0],promotionalText:values.promotional_text};
 }
}
for(const locale of locales)assert.equal(platforms.ios[locale.id].subtitle,platforms.mac[locale.id].subtitle);
const snapshot={source:'Canonical root Fastlane metadata; this snapshot does not assert public App Store availability',sourceHashes,platforms};
const file=path.join(root,'content/store-metadata.json'),data=JSON.stringify(snapshot,null,2)+'\n';
if(process.argv.includes('--check'))assert.equal(fs.readFileSync(file,'utf8'),data,'Website metadata snapshot differs from the App');
else fs.writeFileSync(file,data);
console.log('PASS: 16 platform/locale introductions match canonical App metadata.');
