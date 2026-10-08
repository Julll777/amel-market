"use client";

import { useState } from "react";
import { toko } from "@/lib/toko";
import { formatRupiah } from "@/lib/format";

export default function TombolWhatsApp({ produk }) {
  const [jumlah, setJumlah] = useState(1);

  const nomor = toko.nomorWhatsApp ? toko.nomorWhatsApp.replace(/\D/g, "") : "";
  const pesan = `Halo, saya ingin memesan ${jumlah}x ${produk.nama} (${formatRupiah(produk.harga)} / pcs). Total: ${formatRupiah(produk.harga * jumlah)}.`;
  const urlWhatsApp = `https://wa.me/${nomor}?text=${encodeURIComponent(pesan)}`;

  return (
    <div className="flex flex-col gap-3">
      {/* US-12: Pilih jumlah */}
      <div className="flex items-center gap-3">
        <span className="text-sm font-semibold">Jumlah:</span>
        <div className="flex items-center gap-2 rounded-lg border border-garis bg-latar">
          <button
            type="button"
            onClick={() => setJumlah((j) => Math.max(1, j - 1))}
            className="w-9 py-2 text-center text-lg font-bold text-teks-lembut hover:text-teks"
            aria-label="Kurangi"
          >
            −
          </button>
          <span className="w-8 text-center text-sm font-semibold">{jumlah}</span>
          <button
            type="button"
            onClick={() => setJumlah((j) => j + 1)}
            className="w-9 py-2 text-center text-lg font-bold text-teks-lembut hover:text-teks"
            aria-label="Tambah"
          >
            +
          </button>
        </div>
      </div>

      {/* Tombol WhatsApp */}
      <a
        href={urlWhatsApp}
        target="_blank"
        rel="noopener noreferrer"
        className="inline-flex w-full items-center justify-center rounded-lg bg-utama px-5 py-3 font-semibold text-white hover:bg-utama-gelap sm:w-auto"
      >
        Pesan via WhatsApp
      </a>
    </div>
  );
}
