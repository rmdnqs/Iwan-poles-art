import { createClient } from '@supabase/supabase-js';

// Kunci ini disimpan aman di dashboard hosting (Environment Variables)
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).json({ error: 'Method not allowed' });
    }

    try {
        // Ambil konfigurasi web
        const { data: config } = await supabase.from('konfigurasi_web').select('*').eq('id', 1).single();
        // Ambil data lukisan
        const { data: lukisan } = await supabase.from('lukisan').select('*').order('created_at', { ascending: false });

        // Kembalikan data ke frontend tanpa membocorkan API Key
        return res.status(200).json({ config, lukisan });
    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}