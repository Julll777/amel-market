import KartuProduk from "@/components/KartuProduk";
import CariProduk from "@/components/CariProduk";
import { createServerClient } from "@/lib/supabase/server";
import { toko } from "@/lib/toko";

export const dynamic = "force-dynamic";
export const revalidate = 0;

export default async function HalamanKatalog({ searchParams }) {
  const { q = "", kategori = "" } = await searchParams;

  let query = createServerClient().from("produk").select("*").order("id", { ascending: true });

  if (q) {
    query = query.ilike("nama", `%${q}%`);
  }
  if (kategori) {
    query = query.eq("kategori", kategori);
  }

  let daftarProduk = [];
  let pesanError = null;

  try {
    const { data, error } = await query;
    if (error) {
      pesanError = error.message || "Gagal mengambil data produk dari database.";
    } else {
      daftarProduk = data || [];
    }
  } catch (err) {
    pesanError = err.message || "Terjadi kesalahan saat menghubungi server database.";
  }

  // Ambil daftar kategori unik
  const { data: semuaProduk } = await createServerClient()
    .from("produk")
    .select("kategori")
    .order("kategori");
  const kategoriList = [...new Set((semuaProduk || []).map((p) => p.kategori).filter(Boolean))];

  return (
    <>
      <section className="py-10 sm:py-14">
        <h1 className="max-w-2xl text-4xl font-extrabold leading-tight tracking-tight sm:text-5xl">
          {toko.nama}
        </h1>
        <p className="mt-3 max-w-xl text-lg text-teks-lembut">{toko.tagline}</p>
        <p className="mt-4 text-sm text-teks-lembut">{toko.jamBuka}</p>
      </section>

      <section aria-labelledby="judul-produk" className="flex flex-col gap-5 pb-16">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <h2 id="judul-produk" className="text-xl font-bold">
            Produk kami
          </h2>
        </div>

        {/* US-11: Filter kategori dan pencarian */}
        <CariProduk kategoriList={kategoriList} q={q} kategoriAktif={kategori} />

        {pesanError ? (
          <div className="rounded-xl border border-bahaya/30 bg-bahaya/10 p-4 text-bahaya">
            <p className="font-semibold">Terjadi kesalahan memuat produk:</p>
            <p className="mt-1 text-sm">{pesanError}</p>
          </div>
        ) : daftarProduk.length === 0 ? (
          <p className="py-12 text-center text-teks-lembut">
            {q || kategori ? "Tidak ada produk yang cocok dengan pencarian." : "Belum ada produk"}
          </p>
        ) : (
          <div className="grid grid-cols-2 gap-4 md:grid-cols-3">
            {daftarProduk.map((produk) => (
              <KartuProduk key={produk.id} produk={produk} />
            ))}
          </div>
        )}
      </section>
    </>
  );
}