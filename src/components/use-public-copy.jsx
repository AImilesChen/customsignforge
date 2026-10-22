import {useLocale} from './use-locale.jsx';
import zh from '../data/zh/site.json';
import detail from '../data/zh/product-detail-content.json';
import {publicCopy} from '../lib/malay-content.mjs';
import {thaiPublicCopy} from '../lib/thai-content.mjs';
import {germanPublicCopy} from '../lib/german-content.mjs';
import {frenchPublicCopy} from '../lib/french-content.mjs';
import {koreanPublicCopy} from '../lib/korean-content.mjs';
import {portuguesePublicCopy} from '../lib/portuguese-content.mjs';
import {arabicPublicCopy} from '../lib/arabic-content.mjs';
import {spanishPublicCopy} from '../lib/spanish-content.mjs';
const resources={zh:{site:zh,detail},ms:publicCopy,th:thaiPublicCopy,de:germanPublicCopy,fr:frenchPublicCopy,ko:koreanPublicCopy,'pt-br':portuguesePublicCopy,ar:arabicPublicCopy,es:spanishPublicCopy};
export function usePublicCopy(){const {locale,t}=useLocale(),data=resources[locale]||resources.zh;return {t,siteCopy:data.site,chineseProducts:data.site.products,chineseSpace:value=>data.site.settings[value]||value,productDetails:data.detail};}
