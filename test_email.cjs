const { createClient } = require('@supabase/supabase-js');
const supabase = createClient('https://uhwsbovuzmwvbgrynfiy.supabase.co', 'sb_publishable_0wQDnk3R2hKH7usXs0xJkw_vYWe2avj');
supabase.auth.signUp({ email: '"sri@gmail.com"', password: 'password123' }).then(console.log).catch(console.error);
