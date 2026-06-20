export const VOCABULARY = [
  { id: "1", ngaju: "handipe", indonesian: "Ular", category: "Hewan" },
  { id: "2", ngaju: "bakei", indonesian: "Monyet", category: "Hewan" },
  { id: "3", ngaju: "rumah", indonesian: "Rumah", category: "Benda" },
  { id: "4", ngaju: "batunggang", indonesian: "Pintu", category: "Benda" },
  { id: "5", ngaju: "basenguk", indonesian: "Jendela", category: "Benda" },
  { id: "6", ngaju: "kasinga", indonesian: "Gigi", category: "Anggota Tubuh" },
  { id: "7", ngaju: "biwih", indonesian: "Bibir", category: "Anggota Tubuh" },
  { id: "8", ngaju: "pinding", indonesian: "Telinga", category: "Anggota Tubuh" },
  { id: "9", ngaju: "lenge", indonesian: "Tangan", category: "Anggota Tubuh" },
  { id: "10", ngaju: "pai", indonesian: "Kaki", category: "Anggota Tubuh" },
  { id: "11", ngaju: "puser", indonesian: "Pusar", category: "Anggota Tubuh" },
  { id: "12", ngaju: "urung", indonesian: "Hidung", category: "Anggota Tubuh" },
  { id: "13", ngaju: "uyat", indonesian: "Leher", category: "Anggota Tubuh" },
  { id: "14", ngaju: "mate", indonesian: "Mata", category: "Anggota Tubuh" },
  { id: "15", ngaju: "penda", indonesian: "Bawah", category: "Arah" },
  { id: "16", ngaju: "hunjut", indonesian: "Atas", category: "Arah" },
  { id: "17", ngaju: "para", indonesian: "Pantat", category: "Anggota Tubuh" },
  { id: "18", ngaju: "gantau", indonesian: "Kanan", category: "Arah" },
  { id: "19", ngaju: "sambil", indonesian: "Kiri", category: "Arah" },
  { id: "20", ngaju: "balajar", indonesian: "Belajar", category: "Kegiatan" },
  { id: "21", ngaju: "hatalla", indonesian: "Tuhan", category: "Umum" },
  { id: "22", ngaju: "salamat kuman", indonesian: "Selamat makan", category: "Sapaan" },
  { id: "23", ngaju: "kuman", indonesian: "Makan", category: "Kegiatan" },
  { id: "24", ngaju: "buah buah", indonesian: "Hati-hati", category: "Sapaan" },
  { id: "25", ngaju: "pambelum", indonesian: "Hidup", category: "Umum" },
  { id: "26", ngaju: "rajin", indonesian: "Rajin", category: "Sifat" },
  { id: "27", ngaju: "mandui", indonesian: "Mandi", category: "Kegiatan" },
  { id: "28", ngaju: "batiruh", indonesian: "Tidur", category: "Kegiatan" },
  { id: "29", ngaju: "misik", indonesian: "Bangun", category: "Kegiatan" },
  { id: "30", ngaju: "mihup", indonesian: "Minum", category: "Kegiatan" },
  { id: "31", ngaju: "manyarak", indonesian: "Menyisir", category: "Kegiatan" },
];

export const CONVERSATIONS = [
  {
    id: "lobby-school",
    title: "Menyapa di Sekolah",
    dialogues: [
      { speaker: "Siswa A", text: "Tabe, narai kabar?", language: "Dayak Ngaju" },
      { speaker: "Siswa B", text: "Kabar bahalap. Ikau narai kabar?", language: "Dayak Ngaju" },
      { speaker: "Siswa A", text: "Kabar bahalap kea. Ikau handak kuman?", language: "Dayak Ngaju" },
      { speaker: "Siswa B", text: "Yoh, ayo itah kuman hong kantin!", language: "Dayak Ngaju" },
    ]
  },
  {
    id: "perkenalan",
    title: "Perkenalan Sederhana",
    dialogues: [
      { speaker: "Guru", text: "Tabe anak-anak, aran ku Bapak Iwan.", language: "Dayak Ngaju" },
      { speaker: "Siswa", text: "Tabe Bapak. Aran ku Siti.", language: "Dayak Ngaju" },
    ]
  }
];

export const QUIZ_QUESTIONS = [
  {
    id: "q1",
    type: "mcq",
    question: "Apa arti dari kata 'Kuman'?",
    options: ["Minum", "Makan", "Tidur", "Lari"],
    answer: "Makan"
  },
  {
    id: "q2",
    type: "mcq",
    question: "Bagaimana cara menyapa 'Apa kabar' dalam Bahasa Dayak Ngaju?",
    options: ["Narai kabar?", "Tabe kea?", "Ikau narai?", "Aran ku Siti"],
    answer: "Narai kabar?"
  },
  {
    id: "q3",
    type: "fill",
    question: "Lengkapilah dialog ini: 'Kabar _____' (Artinya: Kabar baik)",
    answer: "bahalap"
  }
];
