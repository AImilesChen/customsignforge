import {useSite} from './site-context.jsx';
import {switchLanguage} from '../lib/locale.mjs';
export default function LanguageSwitcher(){
 const {locale}=useSite();
 function change(e){
  const next=e.target.value;if(next===locale)return;
  window.dispatchEvent(new Event('csf-save-draft'));
  window.location.assign(switchLanguage(window.location.pathname,window.location.search,window.location.hash,next));
 }
 return <div className="language-switcher"><select aria-label={locale==='zh'?'网站语言':'Website language'} value={locale} onChange={change}>
  <option value="en" lang="en">English</option><option value="zh" lang="zh-Hans">简体中文</option>
 </select><svg viewBox="0 0 16 16" width="14" height="14" fill="none" aria-hidden="true"><path d="m4 6 4 4 4-4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/></svg></div>;
}
