import React, { useState } from 'react';
import { 
  Server, 
  ExternalLink, 
  Copy, 
  Check, 
  Download, 
  Terminal, 
  RefreshCw, 
  Layers, 
  CheckCircle2, 
  ArrowRight,
  GitBranch,
  Globe,
  Code
} from 'lucide-react';
import { BACKEND_CODE_FILES, DeploymentCodeFile } from '../services/backendCodeFiles';
import { pingBackend, saveBackendUrl } from '../services/apiClient';

interface DeploymentHubProps {
  backendUrl: string;
  setBackendUrl: (url: string) => void;
}

export const DeploymentHub: React.FC<DeploymentHubProps> = ({
  backendUrl,
  setBackendUrl,
}) => {
  const [selectedFile, setSelectedFile] = useState<DeploymentCodeFile>(BACKEND_CODE_FILES[0]);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [testUrl, setTestUrl] = useState(backendUrl);
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<{ ok: boolean; message: string; latency?: number } | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRunPing = async () => {
    setIsTesting(true);
    setTestResult(null);
    const res = await pingBackend(testUrl);
    setIsTesting(false);
    setTestResult({
      ok: res.ok,
      message: res.message,
      latency: res.latencyMs,
    });
    if (res.ok) {
      setBackendUrl(testUrl.trim());
      saveBackendUrl(testUrl.trim());
    }
  };

  const handleDownloadFile = (file: DeploymentCodeFile) => {
    const blob = new Blob([file.content], { type: 'text/plain;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = file.filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      {/* Overview & Architecture Banner */}
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-5 shadow-xs">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 pb-4 border-b border-slate-800">
          <div>
            <div className="flex items-center gap-2 text-xs text-slate-400">
              <span>Full-Stack Cloud Infrastructure</span>
              <span aria-hidden="true">·</span>
              <span className="text-emerald-400 font-semibold">GitHub → Vercel → Render</span>
            </div>
            <h2 className="text-lg font-bold text-white mt-1">
              STAMAS Deployment &amp; Live Backend Command Center
            </h2>
            <p className="text-xs text-slate-300 mt-1 max-w-3xl">
              This interactive center provides production-ready code files, exact cloud settings, and real-time connectivity testing for your STAMAS Bid Compliance deployment.
            </p>
          </div>
        </div>

        {/* Visual Architecture Flow Diagram */}
        <div className="mt-5 p-4 bg-slate-950 rounded-xl border border-slate-800">
          <div className="text-xs font-semibold text-slate-300 uppercase tracking-wider mb-4 flex items-center gap-2">
            <Layers className="w-4 h-4 text-emerald-400" />
            <span>Public Cloud Request Architecture</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-4 gap-3 text-center">
            {/* Box 1: Public Internet / User */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Entrypoint</div>
              <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <Globe className="w-3.5 h-3.5 text-blue-400" />
                <span>Public Internet</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1">HTTPS Client Access</div>
            </div>

            {/* Box 2: Vercel Frontend */}
            <div className="p-3 rounded-lg bg-slate-900 border border-emerald-500/40">
              <div className="text-[10px] uppercase font-bold text-emerald-400 mb-1">Frontend</div>
              <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <span>Vercel (React + Vite)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono text-[10px]">
                stamas-bid-compliance.vercel.app
              </div>
            </div>

            {/* Box 3: Render FastAPI */}
            <div className="p-3 rounded-lg bg-slate-900 border border-purple-500/40">
              <div className="text-[10px] uppercase font-bold text-purple-400 mb-1">API Engine</div>
              <div className="text-xs font-bold text-white flex items-center justify-center gap-1.5">
                <Server className="w-3.5 h-3.5 text-purple-400" />
                <span>Render (FastAPI)</span>
              </div>
              <div className="text-[11px] text-slate-400 mt-1 font-mono text-[10px]">
                stamas-backend.onrender.com
              </div>
            </div>

            {/* Box 4: Pipeline Core */}
            <div className="p-3 rounded-lg bg-slate-900 border border-slate-800">
              <div className="text-[10px] uppercase font-bold text-slate-500 mb-1">Pipeline</div>
              <div className="text-xs font-bold text-white">OCR · AI/RAG · Rules</div>
              <div className="text-[11px] text-emerald-400 font-semibold mt-1">PASS / FAIL / REVIEW</div>
            </div>
          </div>
        </div>
      </div>

      {/* Step-by-Step Deployment Guide Tabs */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Left: Step Instructions (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Step 1: GitHub Repo Structure */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  1
                </span>
                <h3 className="text-sm font-bold text-white">Create GitHub Repository</h3>
              </div>
              <a
                href="https://github.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
              >
                <span>Open GitHub</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-300">
              Create a new repository named <code className="text-emerald-400 bg-slate-950 px-1.5 py-0.5 rounded font-mono">stamas-bid-compliance</code> and structure your files:
            </p>

            <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 overflow-x-auto">
{`stamas-bid-compliance/
├── frontend/
│   ├── package.json
│   ├── src/
│   ├── index.html
│   └── vercel.json
│
└── backend/
    ├── main.py
    └── requirements.txt`}
            </pre>
          </div>

          {/* Step 2: Render Backend Deploy */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  2
                </span>
                <h3 className="text-sm font-bold text-white">Deploy FastAPI Backend on Render</h3>
              </div>
              <a
                href="https://dashboard.render.com/select-repo?type=web"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-purple-400 hover:text-purple-300 flex items-center gap-1"
              >
                <span>Open Render</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <p className="text-xs text-slate-300">
              On Render, select <strong>New → Web Service</strong>, choose your repository, and enter:
            </p>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Root Directory</span>
                  <span className="font-mono text-slate-200">backend</span>
                </div>
                <button
                  onClick={() => copyToClipboard('backend', 'render-root')}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy"
                >
                  {copiedKey === 'render-root' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Build Command</span>
                  <span className="font-mono text-slate-200">pip install -r requirements.txt</span>
                </div>
                <button
                  onClick={() => copyToClipboard('pip install -r requirements.txt', 'render-build')}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy"
                >
                  {copiedKey === 'render-build' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Start Command</span>
                  <span className="font-mono text-slate-200">uvicorn main:app --host 0.0.0.0 --port $PORT</span>
                </div>
                <button
                  onClick={() => copyToClipboard('uvicorn main:app --host 0.0.0.0 --port $PORT', 'render-start')}
                  className="p-1 text-slate-400 hover:text-white"
                  title="Copy"
                >
                  {copiedKey === 'render-start' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>

          {/* Step 3: Vercel Frontend Deploy */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="w-5 h-5 rounded-full bg-emerald-500/20 text-emerald-400 text-xs font-bold flex items-center justify-center">
                  3
                </span>
                <h3 className="text-sm font-bold text-white">Deploy React Frontend on Vercel</h3>
              </div>
              <a
                href="https://vercel.com/new"
                target="_blank"
                rel="noreferrer"
                className="text-xs text-blue-400 hover:text-blue-300 flex items-center gap-1"
              >
                <span>Open Vercel</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>

            <div className="space-y-2 text-xs">
              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Root Directory</span>
                  <span className="font-mono text-slate-200">frontend</span>
                </div>
                <button
                  onClick={() => copyToClipboard('frontend', 'vercel-root')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedKey === 'vercel-root' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Framework Preset</span>
                  <span className="font-mono text-slate-200">Vite</span>
                </div>
              </div>

              <div className="bg-slate-950 p-2.5 rounded-lg border border-slate-800 flex items-center justify-between">
                <div>
                  <span className="text-[10px] uppercase font-bold text-slate-500 block">Environment Variable</span>
                  <span className="font-mono text-emerald-400">VITE_API_BASE_URL={testUrl}</span>
                </div>
                <button
                  onClick={() => copyToClipboard(`VITE_API_BASE_URL=${testUrl}`, 'vercel-env')}
                  className="p-1 text-slate-400 hover:text-white"
                >
                  {copiedKey === 'vercel-env' ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Right: Code Inspector & Live Tester (6 cols) */}
        <div className="lg:col-span-6 space-y-4">
          {/* Live Backend Connection Tester */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Terminal className="w-4 h-4 text-emerald-400" />
                <h3 className="text-sm font-bold text-white">Live Backend Connection Test</h3>
              </div>
            </div>

            <p className="text-xs text-slate-300">
              Test connectivity to your deployed Render service:
            </p>

            <div className="flex gap-2">
              <input
                type="text"
                value={testUrl}
                onChange={(e) => setTestUrl(e.target.value)}
                placeholder="https://stamas-backend.onrender.com"
                className="flex-1 bg-slate-950 border border-slate-700 rounded-lg px-3 py-2 text-xs text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 font-mono"
              />
              <button
                onClick={handleRunPing}
                disabled={isTesting}
                className="px-3.5 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white rounded-lg text-xs font-semibold flex items-center gap-1.5 transition-colors"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isTesting ? 'animate-spin' : ''}`} />
                <span>Test Ping</span>
              </button>
            </div>

            {testResult && (
              <div
                className={`p-3 rounded-lg border text-xs ${
                  testResult.ok
                    ? 'bg-emerald-950/40 border-emerald-800 text-emerald-200'
                    : 'bg-amber-950/40 border-amber-800 text-amber-200'
                }`}
              >
                <div className="font-semibold flex items-center gap-1.5">
                  {testResult.ok ? (
                    <>
                      <CheckCircle2 className="w-4 h-4 text-emerald-400" />
                      <span>Render Backend Connected ({testResult.latency}ms)</span>
                    </>
                  ) : (
                    <>
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                      <span>Backend Notice / Standby Mode</span>
                    </>
                  )}
                </div>
                <div className="mt-1 text-slate-300">{testResult.message}</div>
                {testResult.ok ? (
                  <div className="mt-1 text-[11px] text-emerald-300">
                    Active URL saved! All evaluations will automatically query this Render backend.
                  </div>
                ) : (
                  <div className="mt-2 text-[11px] text-slate-400">
                    If deploying on Render's free tier, the first spin-up takes ~30-50 seconds. STAMAS continues to run full client evaluation automatically!
                  </div>
                )}
              </div>
            )}
          </div>

          {/* Interactive Backend Code Inspector & Downloader */}
          <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <Code className="w-4 h-4 text-purple-400" />
                <h3 className="text-sm font-bold text-white">Starter Code Files Inspector</h3>
              </div>
              <button
                onClick={() => handleDownloadFile(selectedFile)}
                className="text-xs text-emerald-400 hover:text-emerald-300 flex items-center gap-1"
                title="Download this file"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Download {selectedFile.filename}</span>
              </button>
            </div>

            {/* File Switcher Tabs */}
            <div className="flex items-center gap-1 overflow-x-auto pb-1 border-b border-slate-800">
              {BACKEND_CODE_FILES.map((file) => (
                <button
                  key={file.filename}
                  onClick={() => setSelectedFile(file)}
                  className={`px-2.5 py-1 text-xs rounded font-medium whitespace-nowrap transition-colors ${
                    selectedFile.filename === file.filename
                      ? 'bg-slate-800 text-white font-bold'
                      : 'text-slate-400 hover:text-slate-200'
                  }`}
                >
                  {file.filename}
                </button>
              ))}
            </div>

            <div className="text-[11px] text-slate-400 flex items-center justify-between">
              <span>Path: <strong className="text-slate-200 font-mono">{selectedFile.path}</strong></span>
              <button
                onClick={() => copyToClipboard(selectedFile.content, `code-${selectedFile.filename}`)}
                className="text-emerald-400 hover:text-emerald-300 flex items-center gap-1 font-medium"
              >
                {copiedKey === `code-${selectedFile.filename}` ? (
                  <>
                    <Check className="w-3.5 h-3.5" />
                    <span>Copied!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copy Code</span>
                  </>
                )}
              </button>
            </div>

            {/* Code Snippet Box */}
            <div className="relative">
              <pre className="bg-slate-950 p-3 rounded-lg border border-slate-800 font-mono text-[11px] text-slate-300 max-h-80 overflow-y-auto leading-relaxed">
                <code>{selectedFile.content}</code>
              </pre>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
