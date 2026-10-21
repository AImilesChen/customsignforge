import messages from '../data/zh/messages.json' with {type:'json'};
import malay from '../data/ms/messages.json' with {type:'json'};
import publicMalay from '../data/ms/public.json' with {type:'json'};
import thai from '../data/th/messages.json' with {type:'json'};
import publicThai from '../data/th/public.json' with {type:'json'};
import thaiOverrides from '../data/th/overrides.json' with {type:'json'};
import publicGerman from '../data/de/public.json' with {type:'json'};
import german from '../data/de/messages.json' with {type:'json'};
import germanOverrides from '../data/de/overrides.json' with {type:'json'};
const dictionaries={zh:messages,ms:{...publicMalay,...malay},th:{...publicThai,...thai,...thaiOverrides},de:{...publicGerman,...german,...germanOverrides}};
// Only explicit language-resource entries are translated. Stored customer text is never passed here.
export function translate(value,locale='en') {
 if(typeof value!=='string'||!dictionaries[locale])return value;
 const key=value.trim(),dictionary=dictionaries[locale];return Object.hasOwn(dictionary,key)?value.replace(key,dictionary[key]):value;
}
