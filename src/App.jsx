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
import { Badge } from "@/components/ui/badge";
import { createUrl, listUrls, deleteUrl, getShortUrl, getUrlData } from "@/lib/api";
import { Copy, ExternalLink, Trash2, LogOut, RotateCw, Globe, MapPin, Clock, Monitor, Link2 } from "lucide-react";

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
    if (success) navigate("/");
    else setError("Invalid API key");
    setLoading(false);
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-background p-6">
      <Card className="w-full max-w-sm">
        <CardHeader className="text-center space-y-4">
          <div className="flex justify-center">
            <Avatar className="h-14 w-14">
              <AvatarImage src="/mattr.svg" />
              <AvatarFallback className="bg-muted text-sm">CN</AvatarFallback>
            </Avatar>
          </div>
          <div>
            <CardTitle className="text-xl font-normal">Welcome</CardTitle>
            <CardDescription>Enter your API key to continue</CardDescription>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="api-key" className="text-sm text-muted-foreground">API Key</Label>
            <Input id="api-key" type="password" placeholder="sk-..." value={key} onChange={(e) => setKey(e.target.value)} disabled={loading} className="h-10" />
          </div>
          {error && <p className="text-sm text-destructive text-center">{error}</p>}
          <Button type="submit" onClick={handleSubmit} className="w-full h-10" disabled={loading}>{loading ? "Verifying..." : "Continue"}</Button>
        </CardContent>
      </Card>
    </div>
  );
}

function MainContent() {
  const [urls, setUrls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
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
    setRefreshing(true);
    try {
      const data = await listUrls(null, 50);
      setUrls(data.items || []);
    } catch (e) { console.error(e); }
    setLoading(false);
    setRefreshing(false);
  };

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!url.trim()) return;
    setCreating(true);
    setCreated(null);
    try {
      const result = await createUrl(url.trim(), customId.trim() || null);
      setCreated(result);
      setUrl(""); setCustomId("");
      loadUrls();
    } catch (err) { setCreated({ error: err.message || "Failed" }); }
    setCreating(false);
  };

  const handleDelete = async (id) => {
    if (!confirm("Delete?")) return;
    await deleteUrl(id);
    loadUrls();
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
      <header className="flex h-14 items-center justify-between border-b bg-card/50 px-6">
        <Avatar className="h-8 w-8">
          <AvatarImage src="/mattr.svg" />
          <AvatarFallback className="bg-muted text-xs">CN</AvatarFallback>
        </Avatar>
        <Button variant="ghost" size="sm" onClick={logout}><LogOut className="h-4 w-4" /></Button>
      </header>

      <main className="p-6 space-y-4 max-w-4xl mx-auto">
        <Card>
          <CardContent className="pt-6">
            <form onSubmit={handleCreate} className="flex flex-col gap-4 sm:flex-row sm:items-end">
              <div className="flex-1"><Label className="text-sm text-muted-foreground mb-1.5 block">URL</Label><Input placeholder="https://example.com/..." value={url} onChange={(e) => setUrl(e.target.value)} disabled={creating} className="h-10" /></div>
              <div className="w-28"><Label className="text-sm text-muted-foreground mb-1.5 block">ID</Label><Input placeholder="my-id" value={customId} onChange={(e) => setCustomId(e.target.value)} disabled={creating} className="h-10" /></div>
              <Button type="submit" disabled={creating || !url.trim()} className="h-10 px-6">{creating ? "..." : "Create"}</Button>
            </form>
            {created && (
              <div className="mt-4 flex gap-2">
                <Input readOnly value={created.error ? created.error : getShortUrl(created.id)} className={`h-10 font-mono text-sm ${created.error ? "border-destructive text-destructive" : ""}`} />
                {!created.error && <Button variant="outline" size="icon" onClick={() => navigator.clipboard.writeText(getShortUrl(created.id))} className="h-10 w-10"><Copy className="h-4 w-4" /></Button>}
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <CardTitle className="text-lg">Your Links</CardTitle>
                <Badge variant="secondary" className="ml-2 text-xs font-normal">{urls.length}</Badge>
              </div>
              <Button variant="outline" size="sm" onClick={loadUrls} disabled={refreshing} className="gap-2 h-8">
                <RotateCw className={`h-3.5 w-3.5 ${refreshing ? "animate-spin" : ""}`} />
                Refresh
              </Button>
            </div>
          </CardHeader>
          <CardContent className="p-0">
            <ScrollArea className="h-[65vh]">
              <Table className="w-full">
                <TableHeader><TableRow><TableHead className="w-28">ID</TableHead><TableHead>Destination</TableHead><TableHead className="text-right w-20">Clicks</TableHead><TableHead className="w-24"></TableHead></TableRow></TableHeader>
                <TableBody>
                  {loading ? [...Array(5)].map((_, i) => (<TableRow key={i}><TableCell><Skeleton className="h-8 w-20" /></TableCell><TableCell><Skeleton className="h-8 w-60" /></TableCell><TableCell><Skeleton className="h-8 w-12 ml-auto" /></TableCell><TableCell></TableCell></TableRow>)) :
                  urls.length === 0 ? <TableRow><TableCell colSpan={4} className="text-center text-muted-foreground py-8">No links yet</TableCell></TableRow> :
                  urls.map((item) => (
                    <TableRow key={item.id}>
                      <TableCell className="font-mono"><Dialog><DialogTrigger asChild><Button variant="link" className="h-auto p-0 font-mono" onClick={() => openDetails(item)}>{item.id}</Button></DialogTrigger><DialogContent className="max-w-lg"><DialogHeader><div className="flex items-center justify-between pr-8"><DialogTitle className="font-mono flex items-center gap-2"><Globe className="h-4 w-4" />{item.id}</DialogTitle><Button variant="ghost" size="icon" className="h-8 w-8 ml-auto" onClick={() => openDetails(item)} disabled={detailsLoading}><RotateCw className={`h-4 w-4 ${detailsLoading ? "animate-spin" : ""}`} /></Button></div><DialogDescription className="flex items-center gap-2 mt-1"><Link2 className="h-3.5 w-3.5" />{item.url}</DialogDescription></DialogHeader><div className="space-y-4 mt-2">{detailsLoading ? <Skeleton className="h-24" /> : linkDetails ? (<><div className="flex items-center gap-6 text-sm text-muted-foreground"><div className="flex items-center gap-2"><Monitor className="h-4 w-4" />{linkDetails.totalClicks || 0} clicks</div></div>{linkDetails.clicks?.length ? (<ScrollArea className="h-72 rounded-md border"><div className="p-4 space-y-3">{linkDetails.clicks.map((c, i) => (<div key={i} className="flex items-start justify-between gap-4 pb-3 border-b last:border-0"><div className="space-y-1"><div className="font-medium text-foreground flex items-center gap-2"><Clock className="h-3.5 w-3.5 text-muted-foreground" />{c.timestamp ? new Date(c.timestamp).toLocaleString() : 'Unknown time'}</div><div className="text-sm text-muted-foreground flex items-center gap-2"><MapPin className="h-3.5 w-3.5" />{c.city && c.country ? `${c.city}, ${c.country}` : c.country || 'Unknown location'}</div><div className="text-xs text-muted-foreground/70">{c.IP || c.ip || 'No IP'}</div></div><div className="text-right text-xs text-muted-foreground/70">{c.userAgent ? (c.userAgent.length > 40 ? c.userAgent.slice(0, 40) + "..." : c.userAgent) : 'Unknown browser'}</div></div>))}</div></ScrollArea>) : <p className="text-center text-muted-foreground py-4">No clicks yet</p>}</>) : <p className="text-center text-muted-foreground py-4">Failed to load</p>}</div></DialogContent></Dialog></TableCell>
                      <TableCell className="max-w-[300px] truncate text-muted-foreground">{item.url}</TableCell>
                      <TableCell className="text-right">{item.totalClicks || item.clicks?.length || 0}</TableCell>
                      <TableCell><div className="flex justify-end gap-1"><Button variant="ghost" size="icon" onClick={() => navigator.clipboard.writeText(getShortUrl(item.id))}><Copy className="h-4 w-4" /></Button><Button variant="ghost" size="icon" asChild><a href={getShortUrl(item.id)} target="_blank" rel="noopener"><ExternalLink className="h-4 w-4" /></a></Button><Button variant="ghost" size="icon" className="text-destructive hover:text-destructive" onClick={() => handleDelete(item.id)}><Trash2 className="h-4 w-4" /></Button></div></TableCell>
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