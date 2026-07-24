
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
  Info,
  GraduationCap,
  ChevronDown
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog";
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

const ITEMS_PER_PAGE = 20;

export default function GuruDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<any>(null);
  const [formData, setFormData] = useState({ indonesian: "", ngaju: "", category: "Umum", audioUrl: "" });
  const [isSaving, setIsSaving] = useState(false);
  const [visibleCount, setVisibleCount] = useState(ITEMS_PER_PAGE);
  
  const [previewData, setPreviewData] = useState<any[]>([]);
  const [importProgress, setImportProgress] = useState(0);
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
    const isAuth = localStorage.getItem("guru_auth");
    if (!isAuth) {
      router.push("/guru/login");
    } else {
      setMounted(true);
    }
  }, [router]);

  const filteredVocab = useMemo(() => {
    if (!vocabList) return [];
    const queryStr = searchQuery.toLowerCase();
    return vocabList.filter(v => 
      v.ngaju?.toLowerCase().includes(queryStr) || 
      v.indonesian?.toLowerCase().includes(queryStr) ||
      v.category?.toLowerCase().includes(queryStr)
    );
  }, [vocabList, searchQuery]);

  const visibleVocabList = useMemo(() => {
    return filteredVocab.slice(0, visibleCount);
  }, [filteredVocab, visibleCount]);

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
        const existing = vocabList?.find(v => v.ngaju.toLowerCase().trim() === formData.ngaju.toLowerCase().trim());
        if (existing) {
          await updateDoc(doc(firestore, "vocabulary", existing.id), formData);
          toast({ title: "Kosakata sudah ada, data diperbarui!" });
        } else {
          await addDoc(collection(firestore, "vocabulary"), formData);
          toast({ title: "Kosakata baru ditambahkan!" });
        }
      }
      setIsDialogOpen(false);
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal menyimpan data" });
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
        const json = XLSX.utils.sheet_to_json(workbook.Sheets[sheetName]);

        const normalizedData = json.map((item: any) => ({
          indonesian: String(item.Indonesia || item.indonesian || "").trim(),
          ngaju: String(item["Dayak Ngaju"] || item.ngaju || "").trim(),
          category: String(item.Kategori || item.category || "Umum").trim(),
        })).filter(item => item.indonesian && item.ngaju);

        setPreviewData(normalizedData);
        toast({ title: "File terbaca!", description: `Ditemukan ${normalizedData.length} kosakata.` });
      } catch (error) {
        toast({ variant: "destructive", title: "Gagal membaca file" });
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

    const existingMap = new Map();
    vocabList?.forEach(v => existingMap.set(v.ngaju?.toLowerCase().trim(), v.id));

    const batchSize = 400; 
    let processedCount = 0;

    try {
      for (let i = 0; i < previewData.length; i += batchSize) {
        const batch = writeBatch(firestore);
        const chunk = previewData.slice(i, i + batchSize);

        chunk.forEach(item => {
          const key = item.ngaju?.toLowerCase().trim();
          if (existingMap.has(key)) {
            const docRef = doc(firestore, "vocabulary", existingMap.get(key));
            batch.update(docRef, { indonesian: item.indonesian, category: item.category });
          } else {
            const docRef = doc(collection(firestore, "vocabulary"));
            batch.set(docRef, { ...item, audioUrl: "" });
          }
        });

        await batch.commit();
        processedCount += chunk.length;
        setImportProgress(Math.round((processedCount / previewData.length) * 100));
      }

      toast({ title: "Impor Berhasil!", description: `Total ${processedCount} data telah diproses.` });
      setPreviewData([]);
    } catch (error) {
      toast({ variant: "destructive", title: "Terjadi kesalahan saat impor" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleZipAudioUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    setIsSaving(true);
    setImportProgress(0);

    try {
      const zip = new JSZip();
      const content = await zip.loadAsync(file);
      const audioFiles = Object.keys(content.files).filter(name => !content.files[name].dir);
      
      let processed = 0;
      const chunkSize = 5;

      for (let i = 0; i < audioFiles.length; i += chunkSize) {
        const chunk = audioFiles.slice(i, i + chunkSize);
        await Promise.all(chunk.map(async (fileName) => {
          const audioBlob = await content.files[fileName].async("blob");
          const cleanFileName = fileName.split('/').pop() || fileName;
          const storageRef = ref(storage, `vocabulary_audio/${cleanFileName}`);
          
          await uploadBytes(storageRef, audioBlob);
          const downloadUrl = await getDownloadURL(storageRef);
          const wordName = cleanFileName.replace(/\.(mp3|wav)$/i, "").toLowerCase().trim();
          
          const q = query(collection(firestore, "vocabulary"), where("ngaju", "==", wordName), limit(1));
          const qSnap = await getDocs(q);
          if (!qSnap.empty) {
            await updateDoc(qSnap.docs[0].ref, { audioUrl: downloadUrl });
          }
        }));

        processed += chunk.length;
        setImportProgress(Math.round((processed / audioFiles.length) * 100));
      }
      toast({ title: "Audio ZIP Selesai!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal memproses file ZIP" });
    } finally {
      setIsSaving(false);
    }
  };

  const downloadTemplate = () => {
    const data = [{ Indonesia: "Makan", "Dayak Ngaju": "Kuman", Kategori: "Kegiatan" }];
    const ws = XLSX.utils.json_to_sheet(data);
    const wb = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(wb, ws, "Kosakata");
    XLSX.writeFile(wb, "template_guru_kosakata.xlsx");
  };

  const handleLogout = () => {
    localStorage.removeItem("guru_auth");
    router.push("/");
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div className="flex items-center gap-4">
          <div className="bg-primary/10 p-3 rounded-2xl">
            <GraduationCap className="w-8 h-8 text-primary" />
          </div>
          <div>
            <h1 className="text-4xl font-headline font-bold mb-1 text-primary">Ruang Guru</h1>
            <p className="text-muted-foreground">Pusat pengelolaan materi Dayak Ngaju.</p>
          </div>
        </div>
        <Button variant="ghost" onClick={handleLogout} className="text-destructive font-bold">
          <LogOut className="mr-2 h-4 w-4" /> Keluar Sesi Guru
        </Button>
      </header>

      <Tabs defaultValue="manage" className="space-y-8">
        <TabsList className="bg-muted p-1 rounded-xl">
          <TabsTrigger value="manage" className="rounded-lg">Manajemen Kosakata</TabsTrigger>
          <TabsTrigger value="import" className="rounded-lg">Impor & Audio</TabsTrigger>
        </TabsList>

        <TabsContent value="manage">
          <Card className="shadow-xl border-none overflow-hidden bg-white">
            <div className="p-6 border-b bg-muted/30 flex flex-col md:flex-row items-center justify-between gap-4">
              <div className="relative flex-1 w-full">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
                <Input 
                  placeholder="Cari kosakata..." 
                  className="pl-10 rounded-full"
                  value={searchQuery}
                  onChange={(e) => {
                    setSearchQuery(e.target.value);
                    setVisibleCount(ITEMS_PER_PAGE);
                  }}
                />
              </div>
              <Button onClick={() => handleOpenDialog()} className="rounded-full shadow-lg gap-2">
                <Plus className="h-4 w-4" /> Tambah Kosakata
              </Button>
            </div>
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
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
                    <TableRow><TableCell colSpan={5} className="h-48 text-center"><Loader2 className="animate-spin inline-block h-8 w-8 text-primary" /></TableCell></TableRow>
                  ) : visibleVocabList.length === 0 ? (
                    <TableRow><TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">Tidak ada data.</TableCell></TableRow>
                  ) : (
                    visibleVocabList.map((word) => (
                      <TableRow key={word.id}>
                        <TableCell className="font-medium">{word.indonesian}</TableCell>
                        <TableCell className="font-bold text-primary">{word.ngaju}</TableCell>
                        <TableCell><Badge variant="secondary" className="text-[10px]">{word.category}</Badge></TableCell>
                        <TableCell>{word.audioUrl ? <Badge variant="outline" className="text-green-600">Ada</Badge> : "-"}</TableCell>
                        <TableCell className="text-right space-x-2">
                          <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(word)}><Edit2 className="h-4 w-4" /></Button>
                          <Button variant="ghost" size="icon" className="text-destructive" onClick={() => handleDelete(word.id)}><Trash2 className="h-4 w-4" /></Button>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </div>
            {filteredVocab.length > visibleCount && (
              <div className="p-4 border-t flex justify-center">
                <Button variant="ghost" onClick={() => setVisibleCount(prev => prev + ITEMS_PER_PAGE)} className="gap-2">
                  <ChevronDown className="w-4 h-4" /> Muat Lebih Banyak ({filteredVocab.length - visibleCount})
                </Button>
              </div>
            )}
          </Card>
        </TabsContent>

        <TabsContent value="import">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileSpreadsheet className="w-5 h-5 text-green-600" /> Spreadsheet</CardTitle>
                <CardDescription>Tambah kosakata dalam jumlah besar.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input type="file" ref={fileInputRef} className="hidden" accept=".xlsx,.xls,.csv" onChange={handleFileImport} />
                <Button variant="outline" className="w-full" onClick={() => fileInputRef.current?.click()}>Pilih File Spreadsheet</Button>
                <Button variant="ghost" className="w-full text-xs" onClick={downloadTemplate}><Download className="w-3 h-3 mr-2" /> Download Template Guru</Button>
              </CardContent>
            </Card>

            <Card className="shadow-lg">
              <CardHeader>
                <CardTitle className="flex items-center gap-2"><FileArchive className="w-5 h-5 text-blue-600" /> ZIP Suara</CardTitle>
                <CardDescription>Upload audio massal untuk kosakata.</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <input type="file" ref={zipInputRef} className="hidden" accept=".zip" onChange={handleZipAudioUpload} />
                <Button variant="outline" className="w-full" onClick={() => zipInputRef.current?.click()} disabled={isSaving}>Unggah ZIP Suara</Button>
                {isSaving && importProgress > 0 && <Progress value={importProgress} className="h-2" />}
              </CardContent>
            </Card>
          </div>

          {previewData.length > 0 && (
            <Card className="mt-8 shadow-2xl overflow-hidden">
              <CardHeader className="flex flex-row items-center justify-between border-b">
                <div>
                  <CardTitle>Pratinjau Data</CardTitle>
                  <CardDescription>{previewData.length} baris siap diimpor.</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="ghost" onClick={() => setPreviewData([])} disabled={isSaving}>Batal</Button>
                  <Button onClick={executeBulkImport} disabled={isSaving}>{isSaving ? <Loader2 className="animate-spin" /> : "Impor Sekarang"}</Button>
                </div>
              </CardHeader>
              <div className="max-h-[400px] overflow-auto">
                <Table>
                  <TableHeader><TableRow><TableHead>Indonesia</TableHead><TableHead>Dayak Ngaju</TableHead><TableHead>Kategori</TableHead></TableRow></TableHeader>
                  <TableBody>
                    {previewData.slice(0, 50).map((row, i) => (
                      <TableRow key={i}><TableCell>{row.indonesian}</TableCell><TableCell className="font-bold">{row.ngaju}</TableCell><TableCell>{row.category}</TableCell></TableRow>
                    ))}
                  </TableBody>
                </Table>
                {previewData.length > 50 && <div className="p-4 bg-muted/50 text-center text-xs text-muted-foreground"><Info className="inline w-3 h-3 mr-1" /> Menampilkan 50 baris pertama.</div>}
              </div>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent>
          <DialogHeader><DialogTitle>{editingWord ? "Edit Kosakata" : "Tambah Baru"}</DialogTitle></DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2"><Label>Bahasa Indonesia</Label><Input value={formData.indonesian} onChange={(e) => setFormData({...formData, indonesian: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Dayak Ngaju</Label><Input value={formData.ngaju} onChange={(e) => setFormData({...formData, ngaju: e.target.value})} /></div>
            <div className="grid gap-2"><Label>Kategori</Label>
              <Select value={formData.category} onValueChange={(v) => setFormData({...formData, category: v})}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>{categories.map(cat => <SelectItem key={cat} value={cat}>{cat}</SelectItem>)}</SelectContent>
              </Select>
            </div>
            <div className="grid gap-2"><Label>Link Audio (Opsional)</Label><Input value={formData.audioUrl} placeholder="https://..." onChange={(e) => setFormData({...formData, audioUrl: e.target.value})} /></div>
          </div>
          <Button onClick={handleSave} disabled={isSaving} className="w-full">{isSaving && <Loader2 className="animate-spin mr-2" />} Simpan</Button>
        </DialogContent>
      </Dialog>
    </div>
  );
}
