import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js/+esm';

// Usa variables de entorno de Vite
const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_SERVICE_ROLE_KEY = import.meta.env.VITE_SUPABASE_SERVICE_ROLE_KEY;

export const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

export async function uploadImageFromDataUrl(dataUrl) {
  function dataURLtoBlob(dataurl) {
    const arr = dataurl.split(',');
    const mime = arr[0].match(/:(.*?);/)[1];
    const bstr = atob(arr[1]);
    const n = bstr.length;
    const u8arr = new Uint8Array(n);
    for (let i = 0; i < n; i++) u8arr[i] = bstr.charCodeAt(i);
    return new Blob([u8arr], { type: mime });
  }

  const blob = dataURLtoBlob(dataUrl);
  const filename = `mapas/mapa-estelar-${Date.now()}.jpg`;

  const { error: uploadError } = await supabase.storage
    .from(import.meta.env.VITE_SUPABASE_BUCKET)
    .upload(filename, blob, { upsert: true });

  if (uploadError) {
    throw new Error('Error subiendo imagen a Supabase: ' + uploadError.message);
  }

  const { data: urlData, error: urlError } = supabase.storage
    .from(import.meta.env.VITE_SUPABASE_BUCKET)
    .getPublicUrl(filename);

  if (urlError) {
    throw new Error('Error obteniendo URL pública: ' + urlError.message);
  }

  return urlData.publicUrl;
}
