"use server";

import { redirect } from "next/navigation";
import { revalidatePath } from "next/cache";
import { createAdminClient } from "@/lib/supabase/admin";

export async function login(prevStateOrFormData, maybeFormData) {
  const formData = maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;
  const email = formData.get("email");
  const password = formData.get("password");

  if (!email || !password) {
    return { error: "Email dan password wajib diisi." };
  }

  const supabase = await createAdminClient();
  const { error } = await supabase.auth.signInWithPassword({
    email: String(email).trim(),
    password: String(password),
  });

  if (error) {
    if (error.message === "Invalid login credentials") {
      return { error: "Email atau password salah." };
    }
    return { error: error.message || "Gagal masuk. Periksa kembali email dan password." };
  }

  redirect("/admin");
}

export async function logout() {
  const supabase = await createAdminClient();
  await supabase.auth.signOut();
  redirect("/admin/login");
}

export async function gantiPassword(prevStateOrFormData, maybeFormData) {
  const formData = maybeFormData instanceof FormData ? maybeFormData : prevStateOrFormData;
  const passwordBaru = formData.get("password_baru");
  const konfirmasiPassword = formData.get("konfirmasi_password");

  if (!passwordBaru || !konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password wajib diisi." };
  }

  if (String(passwordBaru).length < 8) {
    return { error: "Password baru minimal 8 karakter." };
  }

  if (passwordBaru !== konfirmasiPassword) {
    return { error: "Password baru dan konfirmasi password tidak sama." };
  }

  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    return { error: "Sesi admin tidak ditemukan. Silakan login kembali." };
  }

  const { error } = await supabase.auth.updateUser({
    password: String(passwordBaru),
  });

  if (error) {
    return { error: error.message || "Gagal mengganti password." };
  }

  return { success: true, message: "Password berhasil diganti." };
}

// US-08: Tambah produk (harus terkunci login)
// useActionState memanggil action dengan (prevState, formData) – prevState diabaikan
export async function tambahProduk(prevState, formData) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const nama = formData.get("nama");
  const harga = parseInt(formData.get("harga"), 10) || 0;
  const kategori = formData.get("kategori");
  const foto_url = formData.get("foto_url") || "/produk/kue-soes.svg";
  const deskripsi = formData.get("deskripsi");

  const { error } = await supabase.from("produk").insert({
    nama: String(nama),
    harga,
    kategori: String(kategori),
    foto_url: String(foto_url),
    deskripsi: String(deskripsi),
  });

  if (error) {
    return { error: error.message || "Gagal menyimpan produk." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  redirect("/admin");
}

// US-09: Ubah produk (harus terkunci login)
// useActionState + bind(null, id) → action dipanggil dengan (id, prevState, formData)
export async function ubahProduk(id, prevState, formData) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const nama = formData.get("nama");
  const harga = parseInt(formData.get("harga"), 10) || 0;
  const kategori = formData.get("kategori");
  const foto_url = formData.get("foto_url") || "/produk/kue-soes.svg";
  const deskripsi = formData.get("deskripsi");

  const { error } = await supabase
    .from("produk")
    .update({
      nama: String(nama),
      harga,
      kategori: String(kategori),
      foto_url: String(foto_url),
      deskripsi: String(deskripsi),
    })
    .eq("id", id);

  if (error) {
    return { error: error.message || "Gagal menyimpan perubahan." };
  }

  revalidatePath("/");
  revalidatePath("/admin");
  revalidatePath(`/produk/${id}`);
  redirect("/admin");
}

// US-10: Hapus produk (harus terkunci login)
export async function hapusProduk(id) {
  const supabase = await createAdminClient();
  const {
    data: { user },
    error: userError,
  } = await supabase.auth.getUser();

  if (userError || !user) {
    redirect("/admin/login");
  }

  const { error } = await supabase.from("produk").delete().eq("id", id);
  if (error) {
    throw new Error(error.message);
  }

  revalidatePath("/");
  revalidatePath("/admin");
}

// US-14: Deskripsi produk dibuat AI (Gemini API)
export async function buatDeskripsiAI(nama, kategori) {
  const supabase = await createAdminClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { error: "Anda harus login untuk menggunakan fitur AI." };
  }

  if (!nama) {
    return { error: "Nama produk harus diisi terlebih dahulu." };
  }

  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    return {
      deskripsi: `${nama} berkualitas dari dapur rumahan, dibuat dari bahan-bahan pilihan dengan cita rasa gurih dan manis yang pas. Cocok untuk suguhan dan acara istimewa.`,
    };
  }

  try {
    const prompt = `Buatkan deskripsi produk singkat yang menarik dan menggugah selera (maksimal 2 kalimat dalam Bahasa Indonesia) untuk produk UMKM kue berikut:\nNama: ${nama}\nKategori: ${kategori || "Kue"}.\nLangsung teks deskripsinya tanpa tanda kutip.`;

    const res = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
        }),
      }
    );

    const json = await res.json();
    const hasil = json.candidates?.[0]?.content?.parts?.[0]?.text?.trim();
    if (hasil) {
      return { deskripsi: hasil };
    }
  } catch (err) {
    console.error("Gemini API error:", err);
  }

  return {
    deskripsi: `${nama} istimewa dengan bahan alami pilihan dan resep tradisional, disajikan hangat dan segar setiap hari.`,
  };
}
