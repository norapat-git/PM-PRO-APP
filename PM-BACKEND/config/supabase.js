const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabaseUrl = process.env.SUPABASE_URL || 'https://pgpkwzkbugjqavjlgktu.supabase.co';
// Check if secret key is real (not masked placeholder)
const secretKey = process.env.SUPABASE_SECRET_KEY && !process.env.SUPABASE_SECRET_KEY.includes('••••')
  ? process.env.SUPABASE_SECRET_KEY
  : null;
const publishableKey = process.env.SUPABASE_PUBLISHABLE_KEY || 'sb_publishable_KpEiYPI166HiZpQfS7Awyg_zihooQdI';

// Primary key to use for queries
const effectiveKey = secretKey || publishableKey;

console.log('[Supabase Config] Initializing Supabase client with URL:', supabaseUrl);
console.log('[Supabase Config] Using key type:', secretKey ? 'Secret Key (Admin)' : 'Publishable Key');

const supabase = createClient(supabaseUrl, effectiveKey, {
  auth: {
    persistSession: false,
    autoRefreshToken: false,
  }
});

module.exports = {
  supabase,
  supabaseUrl,
  effectiveKey
};
