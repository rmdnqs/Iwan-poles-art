import { createClient } from '@supabase/supabase-js';

// Menggunakan Service Role Key yang aman di server
const supabase = createClient(process.env.SUPABASE_URL, process.env.SUPABASE_SERVICE_ROLE_KEY);

export default async function handler(req, res) {
    // Proteksi: Cek token autentikasi admin dari header request
    const authHeader = req.headers.authorization;
    if (!authHeader) {
        return res.status(401).json({ error: 'Akses ditolak! Token tidak ditemukan.' });
    }

    const token = authHeader.split(' ')[1];
    
    // Validasi token ke Supabase Auth untuk memastikan yang akses benar-benar Admin (Bini Lu)
    const { data: { user }, error: authError } = await dbCloud.auth.getUser(token);
    if (authError || !user) {
        return res.status(401).json({ error: 'Sesi kedaluwarsa atau token tidak valid!' });
    }

    const { method } = req;
    const body = req.body;

    try {
        // 1. PROSES TAMBAH / UPDATE DATA (POST)
        if (method === 'POST') {
            const { id, ...payload } = body;

            if (id) {
                // Jika ada ID, berarti mode UPDATE / EDIT
                const { data, error } = await supabase.from('lukisan').update(payload).eq('id', id).select();
                if (error) throw error;
                return res.status(200).json({ success: true, message: 'Data lukisan berhasil diperbarui!', data });
            } else {
                // Jika tidak ada ID, berarti mode INSERT BARU
                const { data, error } = await supabase.from('lukisan').insert([payload]).select();
                if (error) throw error;
                return res.status(201).json({ success: true, message: 'Lukisan baru berhasil dikurasi!', data });
            }
        } 
        
        // 2. PROSES HAPUS DATA (DELETE)
        else if (method === 'DELETE') {
            const { id } = req.query; // Mengambil ID dari parameter URL, misal: /api/kelola-lukisan?id=12
            if (!id) {
                return res.status(400).json({ error: 'ID lukisan wajib disertakan!' });
            }

            const { error } = await supabase.from('lukisan').delete().eq('id', id);
            if (error) throw error;
            return res.status(200).json({ success: true, message: 'Karya seni berhasil dihapus dari galeri!' });
        } 
        
        // Jika method selain POST atau DELETE mencoba masuk
        else {
            return res.status(405).json({ error: `Method ${method} tidak diizinkan!` });
        }

    } catch (error) {
        return res.status(500).json({ error: error.message });
    }
}