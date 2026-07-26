
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { UserCircle, ArrowRight, ArrowLeft } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from "@/components/ui/card";

export default function GuestPage() {
  const [name, setName] = useState("");
  const router = useRouter();

  const handleGuestEntry = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return;

    // Simpan ke sessionStorage (hanya bertahan selama tab dibuka)
    sessionStorage.setItem("guest_name", name.trim());
    router.replace("/");
  };

  return (
    <div className="container mx-auto px-4 py-20 flex justify-center items-center min-h-[80vh]">
      <Card className="w-full max-w-md shadow-2xl border-none">
        <div className="h-2 bg-primary rounded-t-lg" />
        <CardHeader className="space-y-1 text-center">
          <div className="mx-auto w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mb-4">
            <UserCircle className="w-8 h-8 text-primary" />
          </div>
          <CardTitle className="text-3xl font-headline font-bold text-primary">Sesi Tamu</CardTitle>
          <CardDescription>
            Masukkan nama Anda untuk mulai belajar tanpa mendaftar.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleGuestEntry} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="guestName">Nama Anda</Label>
              <Input
                id="guestName"
                placeholder="Contoh: Khairil Azmi"
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="h-12 border-2 focus-visible:ring-primary text-lg"
                autoFocus
              />
            </div>
            <Button type="submit" className="w-full h-12 text-lg rounded-full font-bold shadow-lg" disabled={!name.trim()}>
              Masuk Sekarang <ArrowRight className="ml-2 h-5 w-5" />
            </Button>
          </form>
        </CardContent>
        <CardFooter className="flex justify-center">
          <Button variant="ghost" onClick={() => router.push("/welcome")} className="text-muted-foreground gap-2 font-bold">
            <ArrowLeft className="w-4 h-4" /> Kembali
          </Button>
        </CardFooter>
      </Card>
    </div>
  );
}
