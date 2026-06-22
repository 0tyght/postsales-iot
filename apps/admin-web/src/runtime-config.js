const CONFIG_URL=import.meta.env.VITE_RUNTIME_CONFIG_URL||'https://raw.githubusercontent.com/0tyght/postsales-iot/main/runtime-config.json';
const CACHE_KEY='postsales_runtime_api_url';
let pending;

const normalize=value=>{
 if(!value)return '';
 try{const url=new URL(value);if(url.protocol!=='https:'&&!['localhost','127.0.0.1'].includes(url.hostname))return '';return url.href.replace(/\/$/,'').replace(/\/api$/,'')+'/api'}catch{return ''}
};

export async function getApiBase(){
 if(!pending)pending=(async()=>{try{const response=await fetch(`${CONFIG_URL}?t=${Date.now()}`,{cache:'no-store'});if(!response.ok)throw new Error();const remote=normalize((await response.json()).apiBaseUrl);if(!remote)throw new Error();localStorage.setItem(CACHE_KEY,remote);return remote}catch{return normalize(localStorage.getItem(CACHE_KEY))||import.meta.env.VITE_API_URL||'/api'}})();
 return pending;
}
