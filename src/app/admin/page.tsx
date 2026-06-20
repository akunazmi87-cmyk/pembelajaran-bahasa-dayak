
"use client";

import { useState, useMemo } from "react";
import { Plus, Edit2, Trash2, Search, Loader2, Database, Save, X } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { useCollection, useFirestore } from "@/firebase";
import { collection, addDoc, updateDoc, deleteDoc, doc, writeBatch } from "firebase/firestore";
import { INITIAL_VOCABULARY } from "@/lib/data";

export default function AdminPage() {
  const [searchQuery, setSearchQuery] = useState("");
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [editingWord, setEditingWord] = useState<any>(null);
  const [formData, setFormData] = useState({ indonesian: "", ngaju: "", category: "Umum" });
  const [isSaving, setIsSaving] = useState(false);
  
  const { toast } = useToast();
  const firestore = useFirestore();
  const vocabQuery = useMemo(() => collection(firestore, "vocabulary"), [firestore]);
  const { data: vocabList, loading } = useCollection<any>(vocabQuery);

  const filteredVocab = useMemo(() => {
    return vocabList.filter(v => 
      v.ngaju.toLowerCase().includes(searchQuery.toLowerCase()) || 
      v.indonesian.toLowerCase().includes(searchQuery.toLowerCase()) ||
      v.category.toLowerCase().includes(searchQuery.toLowerCase())
    );
  }, [vocabList, searchQuery]);

  const categories = ["Hewan", "Benda", "Anggota Tubuh", "Arah", "Kegiatan", "Sapaan", "Sifat", "Umum"];

  const handleOpenDialog = (word?: any) => {
    if (word) {
      setEditingWord(word);
      setFormData({ indonesian: word.indonesian, ngaju: word.ngaju, category: word.category });
    } else {
      setEditingWord(null);
      setFormData({ indonesian: "", ngaju: "", category: "Umum" });
    }
    setIsDialogOpen(true);
  };

  const handleSave = async () => {
    if (!formData.indonesian || !formData.ngaju) return;
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
      toast({ variant: "destructive", title: "Gagal menyimpan data" });
    } finally {
      setIsSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (confirm("Apakah Anda yakin ingin menghapus kosakata ini?")) {
      try {
        await deleteDoc(doc(firestore, "vocabulary", id));
        toast({ title: "Kosakata dihapus!" });
      } catch (error) {
        toast({ variant: "destructive", title: "Gagal menghapus data" });
      }
    }
  };

  const handleSeedData = async () => {
    if (!confirm("Impor data awal? Ini akan menambahkan kosakata bawaan.")) return;
    setIsSaving(true);
    try {
      const batch = writeBatch(firestore);
      INITIAL_VOCABULARY.forEach((word) => {
        const docRef = doc(collection(firestore, "vocabulary"));
        batch.set(docRef, word);
      });
      await batch.commit();
      toast({ title: "Berhasil mengimpor data awal!" });
    } catch (error) {
      toast({ variant: "destructive", title: "Gagal mengimpor data" });
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="container mx-auto px-4 py-12 max-w-6xl">
      <header className="flex flex-col md:flex-row justify-between items-start md:items-center gap-6 mb-12">
        <div>
          <h1 className="text-4xl font-headline font-bold mb-2">Manajemen Kosakata</h1>
          <p className="text-muted-foreground">Kelola basis data kosakata untuk seluruh fitur aplikasi.</p>
        </div>
        <div className="flex gap-4">
          {vocabList.length === 0 && (
            <Button variant="outline" onClick={handleSeedData} disabled={isSaving}>
              <Database className="mr-2 h-4 w-4" /> Impor Data Awal
            </Button>
          )}
          <Button onClick={() => handleOpenDialog()} className="rounded-full shadow-lg">
            <Plus className="mr-2 h-4 w-4" /> Tambah Kosakata
          </Button>
        </div>
      </header>

      <Card className="shadow-xl border-none overflow-hidden bg-white">
        <div className="p-4 border-b bg-muted/30 flex items-center justify-between gap-4">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input 
              placeholder="Cari berdasarkan kata atau kategori..." 
              className="pl-10 bg-white"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          <div className="text-sm font-bold text-primary">
            Total: {vocabList.length} Kata
          </div>
        </div>
        <CardContent className="p-0">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Dayak Ngaju</TableHead>
                <TableHead>Bahasa Indonesia</TableHead>
                <TableHead>Kategori</TableHead>
                <TableHead className="text-right">Aksi</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center">
                    <Loader2 className="animate-spin inline-block h-8 w-8 text-primary" />
                  </TableCell>
                </TableRow>
              ) : filteredVocab.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="h-48 text-center text-muted-foreground italic">
                    Belum ada data. Silakan tambah kosakata baru.
                  </TableCell>
                </TableRow>
              ) : (
                filteredVocab.map((word) => (
                  <TableRow key={word.id}>
                    <TableCell className="font-bold text-primary">{word.ngaju}</TableCell>
                    <TableCell>{word.indonesian}</TableCell>
                    <TableCell>
                      <Badge variant="outline">{word.category}</Badge>
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
        </CardContent>
      </Card>

      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>{editingWord ? "Edit Kosakata" : "Tambah Kosakata Baru"}</DialogTitle>
            <DialogDescription>
              Isi formulir di bawah ini untuk mengelola basis data kosakata.
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid gap-2">
              <Label htmlFor="ngaju">Bahasa Dayak Ngaju</Label>
              <Input 
                id="ngaju" 
                value={formData.ngaju} 
                onChange={(e) => setFormData({...formData, ngaju: e.target.value})}
                placeholder="Contoh: handipe"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="indonesian">Bahasa Indonesia</Label>
              <Input 
                id="indonesian" 
                value={formData.indonesian} 
                onChange={(e) => setFormData({...formData, indonesian: e.target.value})}
                placeholder="Contoh: Ular"
              />
            </div>
            <div className="grid gap-2">
              <Label htmlFor="category">Kategori</Label>
              <Select 
                value={formData.category} 
                onValueChange={(v) => setFormData({...formData, category: v})}
              >
                <SelectTrigger id="category">
                  <SelectValue placeholder="Pilih Kategori" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map(cat => (
                    <SelectItem key={cat} value={cat}>{cat}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsDialogOpen(false)} disabled={isSaving}>
              Batal
            </Button>
            <Button onClick={handleSave} disabled={isSaving}>
              {isSaving ? <Loader2 className="animate-spin mr-2 h-4 w-4" /> : <Save className="mr-2 h-4 w-4" />}
              Simpan
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}
