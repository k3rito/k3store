const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://tvdleuubuubfurzdatfu.supabase.co';
const supabaseKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InR2ZGxldXVidXViZnVyemRhdGZ1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3Njk5NzgzNDQsImV4cCI6MjA4NTU1NDM0NH0.6i7pUjoWWqypePSrH1xSD7lLYiG_I4hPBND7c51Jv4Q';

const supabase = createClient(supabaseUrl, supabaseKey);

async function main() {
  const { data, error } = await supabase.auth.signUp({
    email: 'k3@store.com',
    password: 'admin123',
  });
  if (error) {
    console.error("Error signing up:", error.message);
  } else {
    console.log("SUCCESS:", data.user?.id);
  }
}
main();
