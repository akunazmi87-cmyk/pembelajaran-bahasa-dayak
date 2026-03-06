export const VOCABULARY = [
  { id: "1", ngaju: "Tabe", indonesian: "Halo / Selamat", audio: "/audio/tabe.mp3" },
  { id: "2", ngaju: "Narai kabar?", indonesian: "Apa kabar?", audio: "/audio/narai_kabar.mp3" },
  { id: "3", ngaju: "Pakanan", indonesian: "Makanan", audio: "/audio/pakanan.mp3" },
  { id: "4", ngaju: "Mangkut", indonesian: "Membawa", audio: "/audio/mangkut.mp3" },
  { id: "5", ngaju: "Lewu", indonesian: "Kampung / Desa", audio: "/audio/lewu.mp3" },
  { id: "6", ngaju: "Bara", indonesian: "Dari", audio: "/audio/bara.mp3" },
  { id: "7", ngaju: "Amun", indonesian: "Kalau", audio: "/audio/amun.mp3" },
  { id: "8", ngaju: "Kuman", indonesian: "Makan", audio: "/audio/kuman.mp3" },
  { id: "9", ngaju: "Mihup", indonesian: "Minum", audio: "/audio/mihup.mp3" },
  { id: "10", ngaju: "Tiruh", indonesian: "Tidur", audio: "/audio/tiruh.mp3" },
];

export const CONVERSATIONS = [
  {
    id: "lobby-school",
    title: "Menyapa di Sekolah",
    dialogues: [
      { speaker: "Siswa A", text: "Tabe, narai kabar?", language: "Dayak Ngaju", audio: "/audio/d1.mp3" },
      { speaker: "Siswa B", text: "Kabar bahalap. Ikau narai kabar?", language: "Dayak Ngaju", audio: "/audio/d2.mp3" },
      { speaker: "Siswa A", text: "Kabar bahalap kea. Ikau handak kuman?", language: "Dayak Ngaju", audio: "/audio/d3.mp3" },
      { speaker: "Siswa B", text: "Yoh, ayo itah kuman hong kantin!", language: "Dayak Ngaju", audio: "/audio/d4.mp3" },
    ]
  },
  {
    id: "perkenalan",
    title: "Perkenalan Sederhana",
    dialogues: [
      { speaker: "Guru", text: "Tabe anak-anak, aran ku Bapak Iwan.", language: "Dayak Ngaju", audio: "/audio/d5.mp3" },
      { speaker: "Siswa", text: "Tabe Bapak. Aran ku Siti.", language: "Dayak Ngaju", audio: "/audio/d6.mp3" },
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
