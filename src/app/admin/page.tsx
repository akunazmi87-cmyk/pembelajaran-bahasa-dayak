
"use client";

import { useState, useMemo, useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { Plus, Edit2, Trash2, Search, Loader2, Database, Save, LogOut, Info, FileUp, Download } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { INITIAL_VOCABULARY } from "@/lib/data";

export default function AdminDashboardPage() {
  const [mounted, setMounted] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<any>(null);
  const [formData, setFormData] = useState({ indonesian: "", ngaju: "", category: "Umum", audioUrl: "" });
  const [isSaving, setIsSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { toast } = useToast();
  const router = useRouter();
  const firestore = useFirestore();
  
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

  const handleFileImport = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = async (e) => {
      try {
        const json = JSON.parse(e.target?.result as string);
        if (!Array.isArray(json)) {
          throw new Error("Format file harus berupa array JSON");
        }

        if (confirm(`Apakah Anda yakin ingin mengimpor ${json.length} kosakata baru?`)) {
          setIsSaving(true);
          const batch = writeBatch(firestore);
          
          json.forEach((item: any) => {
            if (item.indonesian && item.ngaju) {
              const docRef = doc(collection(firestore, "vocabulary"));
              batch.set(docRef, {
                indonesian: item.indonesian,
                ngaju: item.ngaju,
                category: item.category || "Umum",
                audioUrl: item.audioUrl || ""
              });
            }
          });

          await batch.commit();
          toast({ title: `Berhasil mengimpor ${json.length} kosakata!` });
        }
      } catch (error: any) {
        toast({ 
          variant: "destructive", 
          title: "Gagal mengimpor file", 
          description: error.message || "Pastikan format JSON benar." 
        });
      } finally {
        setIsSaving(false);
        if (fileInputRef.current) fileInputRef.current.value = "";
      }
    };
    reader.readAsText(file);
  };

  const downloadTemplate = () => {
    const template = [
      { indonesian: "Contoh", ngaju: "Contoh", category: "Umum", audioUrl: "" }
    ];
    const blob = new Blob([JSON.stringify(template, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "template_kosakata.json";
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleLogout = () => {
    localStorage.removeItem("admin_auth");
    router.push("/");
  };

  const handleSeedData = async () => {
    if (!confirm("Impor 31 kosakata awal ke database? (Gunakan jika database kosong)")) return;
    setIsSaving(true);
    try {
      const batch = writeBatch(firestore);
      INITIAL_VOCABULARY.forEach((word) => {
        const docRef = doc(collection(firestore, "vocabulary"));
        batch.set(docRef, {
          ...word,
          audioUrl: ""
        });
      });
      await batch.commit();
      toast({ title: "Berhasil mengimpor data awal!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal mengimpor data awal" });
    } finally {
      setIsSaving(false);
    }
  };

  if (!mounted) return null;

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2">Dashboard Admin</h1>
          <p className="text-muted-foreground">Kelola database kosakata secara dinamis dan efisien.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          <input 
            type="file" 
            ref={fileInputRef} 
            className="hidden" 
            accept=".json" 
            onChange={handleFileImport} 
          />
          <Button variant="outline" size="sm" onClick={downloadTemplate}>
            <Download className="mr-2 h-4 w-4" /> Template
          </Button>
          <Button variant="outline" size="sm" onClick={() => fileInputRef.current?.click()} disabled={isSaving}>
            <FileUp className="mr-2 h-4 w-4" /> Impor JSON
          </Button>
          <Button variant="outline" size="sm" onClick={handleSeedData} disabled={isSaving || loading}>
            <Database className="mr-2 h-4 w-4" /> Data Awal
          </Button>
          <Button size="sm" onClick={() => handleOpenDialog()} className="rounded-full shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Tambah
          </Button>
          <Button variant="ghost" size="sm" onClick={handleLogout} className="text-destructive">
            <LogOut className="mr-2 h-4 w-4" /> Logout
          </Button>
        </div>
      </header>

      <Card className="shadow-xl border-none overflow-hidden bg-white">
        <div className="p-4 border-b bg-muted/30 flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="relative flex-1 w-full">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Cari berdasarkan kata atau kategori..." 
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm font-bold text-primary">
            Total: {vocabList?.length || 0} Kata
          </div>
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
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center">
                    <Loader2 className="animate-spin inline-block h-8 w-8 text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredVocab.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="h-48 text-center text-muted-foreground italic">
                    Belum ada data. Silakan tambah kosakata atau gunakan fitur impor.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVocab.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-medium">{word.indonesian}</TableCell>
                    <TableCell className="font-bold text-primary">{word.ngaju}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{word.category}</Badge>
                    </TableCell>
                    <TableCell>
                      {word.audioUrl ? (
                        <Badge variant="secondary" className="bg-green-100 text-green-700">Tersedia</Badge>
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

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingWord ? "Edit Kosakata" : "Tambah Kosakata Baru"}</DialogTitle>
            <DialogDescription>
              Data akan langsung diperbarui di seluruh fitur pembelajaran.
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
                placeholder="https://link-ke-file-audio.mp3"
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
