"use client";

import { useRouter, useSearchParams } from "next/navigation";
import { useTransition } from "react";

export default function CariProduk({ kategoriList, q, kategoriAktif }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [, startTransition] = useTransition();

  function handleCari(e) {
    e.preventDefault();
    const form = e.currentTarget;
    const nilai = form.q.value.trim();
    const params = new URLSearchParams(searchParams);
    if (nilai) {
      params.set("q", nilai);
    } else {
      params.delete("q");
    }
    params.delete("kategori");
    startTransition(() => router.push(`/?${params.toString()}`));
  }

  function handleKategori(kat) {
    const params = new URLSearchParams(searchParams);
    if (kat) {
      params.set("kategori", kat);
    } else {
      params.delete("kategori");
    }
    params.delete("q");
    startTransition(() => router.push(`/?${params.toString()}`));
  }

  return (
    <div className="flex flex-col gap-3">
      {/* Kotak Cari */}
      <form onSubmit={handleCari} className="flex gap-2">
        <input
          name="q"
          defaultValue={q}
          placeholder="Cari produk..."
          className="flex-1 rounded-lg border border-garis bg-latar px-3 py-2 text-sm text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
        <button
          type="submit"
          className="rounded-lg bg-utama px-4 py-2 text-sm font-semibold text-white hover:bg-utama-gelap"
        >
          Cari
        </button>
      </form>

      {/* Tombol Filter Kategori */}
      {kategoriList.length > 0 && (
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            onClick={() => handleKategori("")}
            className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
              !kategoriAktif
                ? "border-utama bg-utama text-white"
                : "border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
            }`}
          >
            Semua
          </button>
          {kategoriList.map((kat) => (
            <button
              key={kat}
              type="button"
              onClick={() => handleKategori(kat)}
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition-colors ${
                kategoriAktif === kat
                  ? "border-utama bg-utama text-white"
                  : "border-garis bg-latar text-teks-lembut hover:border-utama hover:text-utama"
              }`}
            >
              {kat}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

