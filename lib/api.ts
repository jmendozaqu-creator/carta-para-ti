import { NextResponse } from 'next/server';import { getState,patchState } from './supabase';
const HOURS=24;
export function normalized(s:any){if(!s)return null;if(s.started_at&&!['destroyed','expired','finished'].includes(s.status)){const end=new Date(s.started_at).getTime()+HOURS*3600000;if(Date.now()>=end)return {...s,status:'expired'};}return s}
export function seconds(s:any){if(!s?.started_at)return HOURS*3600;return Math.max(0,Math.floor((new Date(s.started_at).getTime()+HOURS*3600000-Date.now())/1000))}
export async function sync(){let s=normalized(await getState());if(s&&s.status==='expired')s=await patchState({status:'expired'});return s}
export {NextResponse,patchState};