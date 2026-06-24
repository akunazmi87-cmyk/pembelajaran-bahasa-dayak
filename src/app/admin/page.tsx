
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { 
  Plus, 
  Edit2, 
  Trash2, 
  Search, 
  Loader2, 
  Database, 
  Save, 
  LogOut, 
  FileUp, 
  Download, 
  CheckCircle2,
  FileSpreadsheet,
  FileArchive,
  AlertTriangle,
  X,
  Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore, useStorage } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch, query, where, getDocs, limit } from "firebase/firestore";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import * as XLSX from "xlsx";
import JSZip from "jszip";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<any>(null);
  const [formData, setFormData] = useState({ indonesian: "", ngaju: "", category: "Umum", audioUrl: "" });
  const [isSaving, setIsSaving] = useState(false);
  
  // Impor Massal States
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
  const [importSummary, setImportSummary] = useState({ total: 0, success: 0, fail: 0 });
  const [isProcessingFile, setIsProcessingFile] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);
  const zipInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  const storage = useStorage();
  
  const vocabQuery = useMemo(() => collection(firestore, "vocabulary"), [firestore]);
  const { data: vocabList, loading } = useCollection<any>(vocabQuery);

  useEffect(() => {
    const isAuth = localStorage.getItem("admin_auth");
    if (!isAuth) {
      router.push("/admin/login");
    } else {
      setMounted(true);
    }
  }, [router]);

  const filteredVocab = useMemo(() => {
    if (!vocabList) return [];
    return vocabList.filter(v => 
      v.ngaju?.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.indonesian?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category?.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vocabList, searchQuery]);

  const categories = ["Hewan", "Benda", "Anggota Tubuh", "Arah", "Kegiatan", "Sapaan", "Sifat", "Umum"];

  const handleOpenDialog = (word?: any) => {
    if (word) {
      setEditingWord(word);
      setFormData({ 
        indonesian: word.indonesian, 
        ngaju: word.ngaju, 
        category: word.category || "Umum",
        audioUrl: word.audioUrl || "" 
      });
    } else {
      setEditingWord(null);
      setFormData({ indonesian: "", ngaju: "", category: "Umum", audioUrl: "" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.indonesian || !formData.ngaju) {
      toast({ variant: "destructive", title: "Lengkapi data kosakata!" });
      return;
    }
    setIsSaving(true);
    try {
      if (editingWord) {
        await updateDoc(doc(firestore, "vocabulary", editingWord.id), formData);
        toast({ title: "Kosakata diperbarui!" });
      } else {
        await addDoc(collection(firestore, "vocabulary"), formData);
        toast({ title: "Kosakata baru ditambahkan!" });
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal menyimpan data ke Firestore" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kosakata ini?")) {
      try {
        await deleteDoc(doc(firestore, "vocabulary", id));
        toast({ title: "Kosakata berhasil dihapus!" });
      } catch (error) {
        toast({ variant: "destructive", title: "Gagal menghapus data" });
      }
    }
  };

  // --- FITUR IMPOR MASSAL ---

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsProcessingFile(true);
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const data = e.target?.result;
        const workbook = XLSX.read(data, { type: 'binary' });
        const sheetName = workbook.SheetNames[0];
        const worksheet = workbook.Sheets[sheetName];
        const json = XLSX.utils.sheet_to_json(worksheet);

        const normalizedData = json.map((item: any) => ({
          indonesian: item.Indonesia || item.indonesian || item.indonesia || "",
          ngaju: item["Dayak Ngaju"] || item.ngaju || item.dayak || "",
          category: item.Kategori || item.category || "Umum",
        })).filter(item => item.indonesian && item.ngaju);

        setPreviewData(normalizedData);
        setImportSummary({ total: normalizedData.length, success: 0, fail: 0 });
      } catch (error: any) {
        toast({ variant: "destructive", title: "Gagal membaca file", description: "Pastikan format file benar." });
      } finally {
        setIsProcessingFile(false);
      }
    };
    reader.readAsBinaryString(file);
  };

  const executeBulkImport = async () => {
    if (previewData.length === 0) return;
    setIsSaving(true);
    setImportProgress(0);

    const batchSize = 500;
    let successCount = 0;
    let failCount = 0;

    for (let i = 0; i < previewData.length; i += batchSize) {
      const batch = writeBatch(firestore);
      const chunk = previewData.slice(i, i + batchSize);

      chunk.forEach(item => {
        const docRef = doc(collection(firestore, "vocabulary"));
        batch.set(docRef, {
          indonesian: item.indonesian,
          ngaju: item.ngaju,
          category: item.category,
          audioUrl: ""
        });
      });

      try {
        await batch.commit();
        successCount += chunk.length;
      } catch (err) {
        failCount += chunk.length;
      }
      
      const progress = Math.round(((i + chunk.length) / previewData.length) * 100);
      setImportProgress(progress);
      setImportSummary(prev => ({ ...prev, success: successCount, fail: failCount }));
    }

    toast({ title: "Impor Selesai!", description: `${successCount} berhasil, ${failCount} gagal.` });
    setPreviewData([]);
    if (fileInputRef.current) fileInputRef.current.value = "";
    setIsSaving(false);
  };

  const handleZipAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    setImportProgress(0);

    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const files = Object.keys(content.files).filter(name => !content.files[name].dir && (name.endsWith('.mp3') || name.endsWith('.wav')));
      
      if (files.length === 0) {
        toast({ variant: "destructive", title: "ZIP Kosong", description: "Tidak ditemukan file audio (.mp3/.wav)" });
        setIsSaving(false);
        return;
      }

      let processed = 0;
      const batchSize = 100; // Batch komit firestore
      let currentBatch = writeBatch(firestore);
      let batchCount = 0;

      for (const fileName of files) {
        const audioFile = await content.files[fileName].async("blob");
        const cleanFileName = fileName.split('/').pop() || fileName;
        const storageRef = ref(storage, `vocabulary_audio/${cleanFileName}`);
        
        // 1. Upload ke Storage
        await uploadBytes(storageRef, audioFile);
        const downloadUrl = await getDownloadURL(storageRef);

        // 2. Hubungkan ke Kosakata
        const wordName = cleanFileName.replace(/\.(mp3|wav)$/, "").toLowerCase();
        
        const q = query(collection(firestore, "vocabulary"), where("ngaju", "==", wordName), limit(5));
        const qSnap = await getDocs(q);
        
        qSnap.forEach(d => {
          currentBatch.update(d.ref, { audioUrl: downloadUrl });
          batchCount++;
        });

        // Commit batch jika sudah mencapai batas atau di akhir loop
        if (batchCount >= 400) {
          await currentBatch.commit();
          currentBatch = writeBatch(firestore);
          batchCount = 0;
        }

        processed++;
        setImportProgress(Math.round((processed / files.length) * 100));
      }

      if (batchCount > 0) {
        await currentBatch.commit();
      }

      toast({ title: "Upload Audio ZIP Selesai", description: `${processed} file audio telah diproses.` });
    } catch (error) {
      console.error(error);
      toast({ variant: "destructive", title: "Gagal memproses ZIP", description: "Pastikan file ZIP valid dan koneksi stabil." });
    } finally {
      setIsSaving(false);
      if (zipInputRef.current) zipInputRef.current.value = "";
    }
  };

  const downloadTemplate = () => {
    const data = [
      { Indonesia: "Makan", "Dayak Ngaju": "Kuman", Kategori: "Kegiatan" },
      { Indonesia: "Ular", "Dayak Ngaju": "Handipe", Kategori: "Hewan" }
    ];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kosakata");
    XLSX.writeFile(wb, "template_impor_kosakata.xlsx");
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl" suppressHydrationWarning>
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2">Dashboard Admin</h1>
          <p className="text-muted-foreground">Kelola database kosakata secara dinamis dan efisien.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive font-bold">
            <LogOut className="mr-2 h-4 w-4" /> Logout Admin
          </Button>
        </div>
      </header>

      <Tabs defaultValue="manage" className="space-y-8">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="manage" className="rounded-lg">Kelola Satuan</TabsTrigger>
          <TabsTrigger value="import" className="rounded-lg">Impor Massal</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <Card className="shadow-xl border-none overflow-hidden bg-white">
            <div className="p-6 border-b bg-muted/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Cari kata atau kategori..." 
                  className="pl-10 bg-white"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex items-center gap-4">
                <Badge variant="outline" className="px-3 py-1 font-bold text-primary">
                  Total: {vocabList?.length || 0} Kosakata
                </Badge>
                <Button onClick={() => handleOpenDialog()} className="rounded-full shadow-lg">
                  <Plus className="mr-2 h-4 w-4" /> Tambah Kosakata
                </Button>
              </div>
            </div>
            <div className="overflow-x-auto max-h-[600px]">
              <Table>
                <TableHeader className="bg-white sticky top-0 z-10 shadow-sm">
                  <TableRow>
                    <TableHead>Indonesia</TableHead>
                    <TableHead>Dayak Ngaju</TableHead>
                    <TableHead>Kategori</TableHead>
                    <TableHead>Audio</TableHead>
                    <TableHead className="text-right">Aksi</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center">
                        <Loader2 className="animate-spin inline-block h-8 w-8 text-primary" />
                      </TableCell>
                    </TableRow>
                  ) : filteredVocab.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">
                        Belum ada data. Silakan tambah atau gunakan fitur Impor Massal.
                      </TableCell>
                    </TableRow>
                  ) : (
                    filteredVocab.map((word) => (
                      <TableRow key={word.id}>
                        <TableCell className="font-medium">{word.indonesian}</TableCell>
                        <TableCell className="font-bold text-primary">{word.ngaju}</TableCell>
                        <TableCell>
                          <Badge variant="secondary" className="text-[10px] uppercase">{word.category}</Badge>
                        </TableCell>
                        <TableCell>
                          {word.audioUrl ? (
                            <Badge variant="secondary" className="bg-green-100 text-green-700">Ada</Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">Tidak Ada</span>
                          )}
                        </TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(word)}>
                            <Edit2 className="h-4 w-4" />
                          </Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(word.id)}>
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileSpreadsheet className="w-5 h-5 text-green-600" />
                  Impor Kosakata (Excel/CSV)
                </CardTitle>
                <CardDescription>Unggah file spreadsheet untuk menambahkan banyak kosakata sekaligus.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 p-6 border-2 border-dashed rounded-2xl bg-muted/10 items-center text-center">
                  <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileImport} />
                  <Button variant="outline" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
                    Pilih File Excel/CSV
                  </Button>
                  <p className="text-xs text-muted-foreground">Sistem mendukung ribuan baris data.</p>
                </div>
                <Button variant="ghost" className="w-full gap-2 text-primary" onClick={downloadTemplate}>
                  <Download className="w-4 h-4" /> Download Template Excel
                </Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg border-none">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <FileArchive className="w-5 h-5 text-blue-600" />
                  Upload Audio Massal (ZIP)
                </CardTitle>
                <CardDescription>Unggah file ZIP berisi audio untuk dihubungkan otomatis ke kosakata.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-col gap-4 p-6 border-2 border-dashed rounded-2xl bg-muted/10 items-center text-center">
                  <input type="file" ref={zipInputRef} className="hidden" accept=".zip" onChange={handleZipAudioUpload} />
                  <Button variant="outline" onClick={() => zipInputRef.current?.click()} disabled={isSaving}>
                    Pilih File ZIP Audio
                  </Button>
                  <p className="text-xs text-muted-foreground">Nama file audio harus sama dengan teks Dayak Ngaju.</p>
                </div>
                {isSaving && importProgress > 0 && (
                  <div className="space-y-2">
                    <Progress value={importProgress} className="h-2" />
                    <p className="text-xs text-center font-bold text-primary">Proses: {importProgress}%</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {previewData.length > 0 && (
            <Card className="mt-8 shadow-2xl border-none">
              <CardHeader className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
                <div>
                  <CardTitle>Pratinjau Data Impor</CardTitle>
                  <CardDescription>Ditemukan {previewData.length} baris data (Menampilkan 100 baris pertama untuk performa).</CardDescription>
                </div>
                <div className="flex gap-2 w-full md:w-auto">
                  <Button variant="ghost" onClick={() => setPreviewData([])} disabled={isSaving} className="flex-1 md:flex-none">
                    <X className="w-4 h-4 mr-2" /> Batal
                  </Button>
                  <Button onClick={executeBulkImport} disabled={isSaving} className="flex-1 md:flex-none">
                    {isSaving ? <Loader2 className="animate-spin mr-2" /> : <CheckCircle2 className="mr-2" />}
                    Impor Sekarang
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                {isSaving && <Progress value={importProgress} className="h-2 mb-4" />}
                <div className="max-h-[400px] overflow-auto border rounded-lg">
                  <Table>
                    <TableHeader className="bg-muted sticky top-0 z-10">
                      <TableRow>
                        <TableHead>Indonesia</TableHead>
                        <TableHead>Dayak Ngaju</TableHead>
                        <TableHead>Kategori</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {previewData.slice(0, 100).map((row, i) => (
                        <TableRow key={i}>
                          <TableCell>{row.indonesian}</TableCell>
                          <TableCell className="font-bold text-primary">{row.ngaju}</TableCell>
                          <TableCell>{row.category}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
                {previewData.length > 100 && (
                  <div className="mt-4 flex items-center gap-2 p-3 bg-blue-50 text-blue-700 rounded-lg text-sm">
                    <Info className="w-4 h-4" />
                    Data lainnya disembunyikan dari pratinjau untuk mempercepat performa browser.
                  </div>
                )}
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingWord ? "Edit Kosakata" : "Tambah Kosakata Baru"}</DialogTitle>
            <DialogDescription>
              Isi data di bawah ini untuk memperbarui database secara real-time.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="indonesian">Bahasa Indonesia</Label>
              <Input 
                id="indonesian" 
                value={formData.indonesian} 
                onChange={(e) => setFormData({...formData, indonesian: e.target.value})}
                placeholder="Contoh: Makan"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="ngaju">Bahasa Dayak Ngaju</Label>
              <Input 
                id="ngaju" 
                value={formData.ngaju} 
                onChange={(e) => setFormData({...formData, ngaju: e.target.value})}
                placeholder="Contoh: Kuman"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({...formData, category: v})}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="grid gap-2">
              <Label htmlFor="audio">URL Audio (Opsional)</Label>
              <Input 
                id="audio" 
                value={formData.audioUrl} 
                onChange={(e) => setFormData({...formData, audioUrl: e.target.value})}
                placeholder="https://example.com/audio.mp3"
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan Data
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
