import messages from '../data/zh/messages.json' with {type:'json'};
// Only explicit language-resource entries are translated. Stored customer text is never passed here.
export function translate(value,locale='en') {
 if(locale!=='zh'||typeof value!=='string')return value;
 const key=value.trim();return Object.hasOwn(messages,key)?value.replace(key,messages[key]):value;
}
