import messages from '../data/zh/messages.json' with {type:'json'};
import malay from '../data/ms/messages.json' with {type:'json'};
import publicMalay from '../data/ms/public.json' with {type:'json'};
import thai from '../data/th/messages.json' with {type:'json'};
import publicThai from '../data/th/public.json' with {type:'json'};
import thaiOverrides from '../data/th/overrides.json' with {type:'json'};
import publicGerman from '../data/de/public.json' with {type:'json'};
import german from '../data/de/messages.json' with {type:'json'};
import germanOverrides from '../data/de/overrides.json' with {type:'json'};
import publicFrench from '../data/fr/public.json' with {type:'json'};
import french from '../data/fr/messages.json' with {type:'json'};
import frenchOverrides from '../data/fr/overrides.json' with {type:'json'};
import publicKorean from '../data/ko/public.json' with {type:'json'};
import korean from '../data/ko/messages.json' with {type:'json'};
import koreanOverrides from '../data/ko/overrides.json' with {type:'json'};
import publicPortuguese from '../data/pt-br/public.json' with {type:'json'};
import portuguese from '../data/pt-br/messages.json' with {type:'json'};
import portugueseOverrides from '../data/pt-br/overrides.json' with {type:'json'};
import publicArabic from '../data/ar/public.json' with {type:'json'};
import arabic from '../data/ar/messages.json' with {type:'json'};
import arabicOverrides from '../data/ar/overrides.json' with {type:'json'};
import publicSpanish from '../data/es/public.json' with {type:'json'};
import spanish from '../data/es/messages.json' with {type:'json'};
import spanishOverrides from '../data/es/overrides.json' with {type:'json'};
import {spanishContentDictionary} from './spanish-content.mjs';
const dictionaries={zh:messages,ms:{...publicMalay,...malay},th:{...publicThai,...thai,...thaiOverrides},de:{...publicGerman,...german,...germanOverrides},fr:{...publicFrench,...french,...frenchOverrides},ko:{...publicKorean,...korean,...koreanOverrides},'pt-br':{...publicPortuguese,...portuguese,...portugueseOverrides},ar:{...publicArabic,...arabic,...arabicOverrides},es:{...spanishContentDictionary,...publicSpanish,...spanish,...spanishOverrides}};
// Only explicit language-resource entries are translated. Stored customer text is never passed here.
export function translate(value,locale='en') {
 if(typeof value!=='string'||!dictionaries[locale])return value;
 const key=value.trim(),dictionary=dictionaries[locale];return Object.hasOwn(dictionary,key)?value.replace(key,dictionary[key]):value;
}
