const url=process.env.SUPABASE_URL!;
const key=process.env.SUPABASE_SERVICE_ROLE_KEY!;
export async function sb(path:string, init:RequestInit={}) {
  const r=await fetch(`${url}/rest/v1/${path}`,{
    ...init,
    headers:{'apikey':key,'Authorization':`Bearer ${key}`,'Content-Type':'application/json','Prefer':'return=representation',...(init.headers||{})},
    cache:'no-store'
  });
  if(!r.ok) throw new Error(await r.text());
  const text=await r.text(); return text?JSON.parse(text):null;
}
export async function getState(){
  const rows=await sb('letter_state?id=eq.main&select=*');
  return rows?.[0]||null;
}
export async function patchState(data:Record<string,unknown>){
  const rows=await sb('letter_state?id=eq.main',{method:'PATCH',body:JSON.stringify(data)});
  return rows?.[0]||null;
}
