import {useContext} from 'react';
import {SiteContext} from './site-context.jsx';
import {translate} from '../lib/translate.mjs';
import {localePath} from '../lib/locale.mjs';
export function useLocale(){const context=useContext(SiteContext),locale=context?.locale||'en';return {locale,t:value=>translate(value,locale),href:value=>localePath(value,locale)};}
