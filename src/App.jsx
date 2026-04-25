import { useState, useEffect } from "react";
import { BrowserRouter, Routes, Route, Navigate, useNavigate } from "react-router-dom";
import { AuthProvider, useAuth } from "@/lib/auth-context";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Skeleton } from "@/components/ui/skeleton";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog";
import { createUrl, listUrls, deleteUrl, getShortUrl, getUrlData } from "@/lib/api";
import { Copy, ExternalLink, Trash2, LogOut } from "lucide-react";

function LoginPage() {
  const [key, setKey] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    const success = await login(key);
    if (success) {
      navigate("/");
    } else {
      setError("Invalid API key");
    }
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-4">
      <Card className="w-full max-w-sm border-none shadow-none">
        <CardHeader className="text-center">
          <div className="flex justify-center pb-2">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/mattr.svg" />
              <AvatarFallback className="bg-muted">CN</AvatarFallback>
            </Avatar>
          </div>
          <CardTitle className="text-2xl font-normal">Welcome</CardTitle>
          <CardDescription>Enter your API key to continue</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="api-key" className="text-xs text-muted-foreground">API Key</Label>
              <Input id="api-key" type="password" placeholder="sk-..." value={key} onChange={(e) => setKey(e.target.value)} disabled={loading} className="h-10" />
            </div>
            {error && <p className="text-xs text-destructive">{error}</p>}
            <Button type="submit" className="w-full h-10" disabled={loading}>{loading ? "Verifying..." : "Continue"}</Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}

function MainContent() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [url, setUrl] = useState("");
  const [customId, setCustomId] = useState("");
  const [creating, setCreating] = useState(false);
  const [created, setCreated] = useState(null);
  const [viewingId, setViewingId] = useState(null);
  const [linkDetails, setLinkDetails] = useState(null);
  const [detailsLoading, setDetailsLoading] = useState(false);
  const { logout } = useAuth();

  useEffect(() => { loadUrls(); }, []);

  const loadUrls = async () => {
    setLoading(true);
    try {
      const data = await listUrls(null, 50);
      setUrls(data.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setCreating(true);
    setCreated(null);
    try {
      const result = await createUrl(url.trim(), customId.trim() || null);
      setCreated(result);
      setUrl("");
      setCustomId("");
      loadUrls();
    } catch (err) { 
      setCreated({ error: err.message || "Failed to create" }); 
    }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete this link?")) return;
    await deleteUrl(id);
    setUrls(urls.filter((u) => u.id !== id));
  };

  const openDetails = async (item) => {
    setViewingId(item.id);
    setDetailsLoading(true);
    setLinkDetails(null);
    try {
      const data = await getUrlData(item.id);
      setLinkDetails(data);
    } catch (err) { setLinkDetails({ error: err.message }); }
    setDetailsLoading(false);
  };

  return (
    <div className="min-h-screen bg-background">
      <header className="flex h-14 items-center justify-between border-b bg-card/50 px-4 backdrop-blur">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/mattr.svg" />
          <AvatarFallback className="bg-muted text-xs">CN</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="sm" onClick={logout} className="text-muted-foreground">
          <LogOut className="h-4 w-4" />
        </Button>
      </header>

      <main className="p-4 space-y-4 max-w-4xl mx-auto">
        <Card className="border-none shadow-none bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Create Link</CardTitle>
          </CardHeader>
          <CardContent className="pt-0">
            <form onSubmit={handleCreate} className="flex flex-col gap-3 sm:flex-row">
              <div className="flex-1">
                <Label className="text-xs text-muted-foreground mb-1.5 block">URL</Label>
                <Input placeholder="https://example.com/..." value={url} onChange={(e) => setUrl(e.target.value)} disabled={creating} className="h-9" />
              </div>
              <div className="w-28">
                <Label className="text-xs text-muted-foreground mb-1.5 block">ID</Label>
                <Input placeholder="my-id" value={customId} onChange={(e) => setCustomId(e.target.value)} disabled={creating} className="h-9" />
              </div>
              <div className="flex items-end">
                <Button type="submit" disabled={creating || !url.trim()} className="h-9 px-4">{creating ? "..." : "Create"}</Button>
              </div>
            </form>
            {created && (
              <div className="mt-3 flex gap-2">
                <Input readOnly value={created.error ? created.error : getShortUrl(created.id)} className={`h-9 text-xs font-mono ${created.error ? "border-destructive text-destructive" : ""}`} />
                {!created.error && <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(getShortUrl(created.id))} className="h-9 w-9"><Copy className="h-3 w-3" /></Button>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card className="border-none shadow-none bg-card/30">
          <CardHeader className="pb-3">
            <CardTitle className="text-lg font-medium">Your Links</CardTitle>
            <CardDescription className="text-xs">{urls.length} link{urls.length !== 1 ? "s" : ""}</CardDescription>
          </CardHeader>
          <CardContent className="pt-0">
            <ScrollArea className="h-[60vh] rounded-md border">
              <Table>
                <TableHeader className="sticky top-0 bg-muted/50">
                  <TableRow className="hover:bg-transparent">
                    <TableHead className="w-24 text-xs font-medium">ID</TableHead>
                    <TableHead className="text-xs font-medium">URL</TableHead>
                    <TableHead className="w-16 text-right text-xs font-medium">Clicks</TableHead>
                    <TableHead className="w-20"></TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {loading ? [...Array(5)].map((_, i) => (
                    <TableRow key={i}>
                      <TableCell><Skeleton className="h-6 w-16" /></TableCell><TableCell><Skeleton className="h-6 w-40" /></TableCell><TableCell><Skeleton className="h-6 w-8 ml-auto" /></TableCell><TableCell></TableCell>
                    </TableRow>
                  )) :
                  urls.length === 0 ? (
                    <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground text-sm py-8">No links yet</TableCell></TableRow>
                  ) : urls.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono text-sm">
                        <Dialog>
                          <DialogTrigger asChild>
                            <Button variant="link" className="h-auto p-0 font-mono text-sm text-foreground" onClick={() => openDetails(item)}>{item.id}</Button>
                          </DialogTrigger>
                          <DialogContent>
                            <DialogHeader>
                              <DialogTitle className="font-mono text-lg">{item.id}</DialogTitle>
                              <DialogDescription>Click data for this link</DialogDescription>
                            </DialogHeader>
                            <ScrollArea className="h-64 mt-2 rounded-md border p-3">
                              {detailsLoading ? <Skeleton className="h-16" /> : linkDetails?.clicks?.length ? (
                                linkDetails.clicks.map((c, i) => (
                                  <div key={i} className="mb-3 pb-3 border-b last:border-0 last:pb-0">
                                    <div className="text-sm font-medium">Click #{i+1}</div>
                                    <div className="mt-1 space-y-1 text-xs text-muted-foreground">
                                      <p>{c.IP || 'N/A'}</p>
                                      <p>{c.city ? `${c.city}, ${c.country}` : 'Location unknown'}</p>
                                      <p className="truncate">{c.timestamp ? new Date(c.timestamp).toLocaleString() : ''}</p>
                                    </div>
                                  </div>
                                ))
                              ) : <p className="text-sm text-muted-foreground text-center py-4">No clicks yet</p>}
                            </ScrollArea>
                          </DialogContent>
                        </Dialog>
                      </TableCell>
                      <TableCell className="max-w-[300px] truncate text-sm text-muted-foreground">{item.url}</TableCell>
                      <TableCell className="text-right text-sm">{item.clicks?.length || 0}</TableCell>
                      <TableCell>
                        <div className="flex gap-0.5 justify-end">
                          <Button variant="ghost" size="icon" className="h-7 w-7" onClick={() => navigator.clipboard.writeText(getShortUrl(item.id))}><Copy className="h-3 w-3" /></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7" asChild><a href={getShortUrl(item.id)} target="_blank" rel="noopener"><ExternalLink className="h-3 w-3" /></a></Button>
                          <Button variant="ghost" size="icon" className="h-7 w-7 text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-3 w-3" /></Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </main>
    </div>
  );
}

function MainContentWrapper() {
  const { apiKey, isValid, loading } = useAuth();
  if (loading) return <div className="flex min-h-screen items-center justify-center"><Skeleton className="h-8 w-24" /></div>;
  if (!apiKey || isValid !== true) return <Navigate to="/login" replace />;
  return <MainContent />;
}

export default function App() {
  return <BrowserRouter><AuthProvider><Routes><Route path="/login" element={<LoginPage />} /><Route path="/*" element={<MainContentWrapper />} /></Routes></AuthProvider></BrowserRouter>;
}