import {useEffect,useState} from 'react';import {api} from '../services/api';
export default function useLookups(map){const[data,setData]=useState({});useEffect(()=>{let active=true;Promise.all(Object.entries(map).map(async([key,path])=>[key,await api(path)])).then(entries=>{if(active)setData(Object.fromEntries(entries))}).catch(()=>{});return()=>{active=false};
// Lookup endpoints are fixed for the lifetime of each page.
// eslint-disable-next-line react-hooks/exhaustive-deps
},[]);return data;}
