import { createServerClient } from '@/lib/supabase/server';
import KartuProduk from '@/components/KartuProduk'; // Sesuaikan path komponen KartuProduk yang ada di proyek

export const revalidate = 0; // Memastikan data selalu segar dari server

export default async function HomePage() {
  let produk = [];
  let errorMessage = null;

  try {
    const supabase = createServerClient();
    const { data, error } = await supabase
      .from('produk')
      .select('*')
      .order('id', { ascending: true });

    if (error) {
      errorMessage = error.message || 'Gagal mengambil data dari Supabase.';
    } else {
      produk = data || [];
    }
  } catch (err) {
    errorMessage = err.message || 'Terjadi kesalahan pada server saat menghubungkan ke Supabase.';
  }

  return (
    <main className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Daftar Produk</h1>

      {errorMessage ? (
        <div className="p-4 bg-red-50 border border-red-200 text-red-700 rounded-md">
          <p className="font-semibold">Terjadi kesalahan saat memuat produk:</p>
          <p className="text-sm mt-1">{errorMessage}</p>
        </div>
      ) : produk.length === 0 ? (
        <div className="py-12 text-center text-gray-500">
          <p className="text-lg">Belum ada produk</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
          {produk.map((item) => (
            <KartuProduk key={item.id} produk={item} />
          ))}
        </div>
      )}
    </main>
  );
}