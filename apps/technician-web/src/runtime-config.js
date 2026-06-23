const CONFIG_URLS=import.meta.env.VITE_RUNTIME_CONFIG_URL?[import.meta.env.VITE_RUNTIME_CONFIG_URL]:[
 'https://raw.githubusercontent.com/0tyght/postsales-iot/main/runtime-config.json',
 new URL('runtime-config.json',`${location.origin}${import.meta.env.BASE_URL}`).href,
];
const CACHE_KEY='postsales_runtime_api_url';
let pending;

const normalize=value=>{
 if(!value)return '';
 try{const url=new URL(value);if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))return '';return url.href.replace(/\/$/,'').replace(/\/api$/,'')+'/api'}catch{return ''}
};

export function clearRuntimeConfig(){pending=undefined}
export async function getApiBase(force=false){
 const manual=normalize(localStorage.getItem('tech_api_url'));if(manual&&!force)return manual;
 if(force)pending=undefined;
 if(!pending)pending=(async()=>{for(const configUrl of CONFIG_URLS){try{const response=await fetch(`${configUrl}?t=${Date.now()}`,{cache:'no-store'});if(!response.ok)continue;const remote=normalize((await response.json()).apiBaseUrl);if(!remote)continue;localStorage.setItem(CACHE_KEY,remote);return remote}catch{continue}}return normalize(localStorage.getItem(CACHE_KEY))||import.meta.env.VITE_API_URL||'/api'})();
 return pending;
}
