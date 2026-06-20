
export const INITIAL_VOCABULARY = [
  { ngaju: "handipe", indonesian: "Ular", category: "Hewan" },
  { ngaju: "bakei", indonesian: "Monyet", category: "Hewan" },
  { ngaju: "rumah", indonesian: "Rumah", category: "Benda" },
  { ngaju: "batunggang", indonesian: "Pintu", category: "Benda" },
  { ngaju: "basenguk", indonesian: "Jendela", category: "Benda" },
  { ngaju: "kasinga", indonesian: "Gigi", category: "Anggota Tubuh" },
  { ngaju: "biwih", indonesian: "Bibir", category: "Anggota Tubuh" },
  { ngaju: "pinding", indonesian: "Telinga", category: "Anggota Tubuh" },
  { ngaju: "lenge", indonesian: "Tangan", category: "Anggota Tubuh" },
  { ngaju: "pai", indonesian: "Kaki", category: "Anggota Tubuh" },
  { ngaju: "puser", indonesian: "Pusar", category: "Anggota Tubuh" },
  { ngaju: "urung", indonesian: "Hidung", category: "Anggota Tubuh" },
  { ngaju: "uyat", indonesian: "Leher", category: "Anggota Tubuh" },
  { ngaju: "mate", indonesian: "Mata", category: "Anggota Tubuh" },
  { ngaju: "penda", indonesian: "Bawah", category: "Arah" },
  { ngaju: "hunjut", indonesian: "Atas", category: "Arah" },
  { ngaju: "para", indonesian: "Pantat", category: "Anggota Tubuh" },
  { ngaju: "gantau", indonesian: "Kanan", category: "Arah" },
  { ngaju: "sambil", indonesian: "Kiri", category: "Arah" },
  { ngaju: "balajar", indonesian: "Belajar", category: "Kegiatan" },
  { ngaju: "hatalla", indonesian: "Tuhan", category: "Umum" },
  { ngaju: "salamat kuman", indonesian: "Selamat makan", category: "Sapaan" },
  { ngaju: "kuman", indonesian: "Makan", category: "Kegiatan" },
  { ngaju: "buah buah", indonesian: "Hati-hati", category: "Sapaan" },
  { ngaju: "pambelum", indonesian: "Hidup", category: "Umum" },
  { ngaju: "rajin", indonesian: "Rajin", category: "Sifat" },
  { ngaju: "mandui", indonesian: "Mandi", category: "Kegiatan" },
  { ngaju: "batiruh", indonesian: "Tidur", category: "Kegiatan" },
  { ngaju: "misik", indonesian: "Bangun", category: "Kegiatan" },
  { ngaju: "mihup", indonesian: "Minum", category: "Kegiatan" },
  { ngaju: "manyarak", indonesian: "Menyisir", category: "Kegiatan" },
];

export const CONVERSATIONS = [
  {
    id: "makan-minum",
    title: "Makan dan Minum",
    dialogues: [
      { speaker: "A", text: "Salamat kuman.", language: "Dayak Ngaju" },
      { speaker: "B", text: "Tarima kasih.", language: "Dayak Ngaju" },
      { speaker: "A", text: "Jangan lupa mihup dan kuman.", language: "Dayak Ngaju" },
      { speaker: "B", text: "Ie, tarima kasih.", language: "Dayak Ngaju" },
    ]
  },
  {
    id: "belajar-dayak",
    title: "Belajar Bahasa",
    dialogues: [
      { speaker: "A", text: "Itah balajar Bahasa Dayak Ngaju.", language: "Dayak Ngaju" },
      { speaker: "B", text: "Ie, aku balajar.", language: "Dayak Ngaju" },
    ]
  },
  {
    id: "kegiatan-mandui",
    title: "Kegiatan Mandi",
    dialogues: [
      { speaker: "A", text: "Andau itah mandui?", language: "Dayak Ngaju" },
      { speaker: "B", text: "Andau sorenya aku mandui.", language: "Dayak Ngaju" },
    ]
  },
  {
    id: "lobby-school",
    title: "Menyapa di Sekolah",
    dialogues: [
      { speaker: "Siswa A", text: "Tabe, narai kabar?", language: "Dayak Ngaju" },
      { speaker: "Siswa B", text: "Kabar bahalap. Ikau narai kabar?", language: "Dayak Ngaju" },
    ]
  }
];
