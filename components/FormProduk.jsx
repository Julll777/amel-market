"use client";

import { useActionState, useRef, useTransition } from "react";
import Input from "@/components/Input";
import Tombol from "@/components/Tombol";
import { buatDeskripsiAI } from "@/app/admin/actions";

export default function FormProduk({ produk = {}, action, labelTombol }) {
  const [state, formAction, isPending] = useActionState(action, null);
  const [isGenerating, startTransition] = useTransition();
  const deskripsiRef = useRef(null);
  const namaRef = useRef(null);
  const kategoriRef = useRef(null);

  function handleGenerateAI() {
    const nama = namaRef.current?.value;
    const kategori = kategoriRef.current?.value;
    startTransition(async () => {
      const hasil = await buatDeskripsiAI(nama, kategori);
      if (hasil?.deskripsi && deskripsiRef.current) {
        deskripsiRef.current.value = hasil.deskripsi;
      }
    });
  }

  return (
    <form action={formAction} className="flex max-w-xl flex-col gap-4">
      {state?.error && (
        <div className="rounded-xl border border-bahaya/30 bg-bahaya/10 p-3 text-sm text-bahaya">
          {state.error}
        </div>
      )}
      <Input
        label="Nama produk"
        name="nama"
        defaultValue={produk.nama}
        required
        ref={namaRef}
      />
      <Input
        label="Harga (Rp)"
        name="harga"
        type="number"
        min="0"
        defaultValue={produk.harga}
        required
      />
      <Input
        label="Kategori"
        name="kategori"
        defaultValue={produk.kategori}
        ref={kategoriRef}
      />
      <Input
        label="Link foto"
        name="foto_url"
        placeholder="https://... atau /produk/nama-file.svg"
        defaultValue={produk.foto_url}
      />

      {/* Deskripsi + tombol AI (US-14) */}
      <div className="flex flex-col gap-1.5">
        <div className="flex items-center justify-between">
          <span className="text-sm font-semibold">Deskripsi</span>
          <button
            type="button"
            onClick={handleGenerateAI}
            disabled={isGenerating}
            className="text-xs text-utama underline underline-offset-2 hover:text-utama-gelap disabled:opacity-50"
          >
            {isGenerating ? "Membuat deskripsi..." : "✨ Buat dengan AI"}
          </button>
        </div>
        <textarea
          name="deskripsi"
          rows={4}
          ref={deskripsiRef}
          defaultValue={produk.deskripsi}
          className="w-full rounded-lg border border-garis bg-latar px-3 py-2.5 text-base text-teks placeholder:text-teks-lembut focus:border-utama focus:outline-none"
        />
      </div>

      <div className="flex gap-3">
        <Tombol type="submit" disabled={isPending}>
          {isPending ? "Menyimpan..." : labelTombol}
        </Tombol>
        <Tombol href="/admin" varian="garis">
          Batal
        </Tombol>
      </div>
    </form>
  );
}
