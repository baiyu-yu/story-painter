import React, { useState, useEffect, useMemo } from 'react';
import { PDFViewer, PDFDownloadLink, BlobProvider } from '@react-pdf/renderer';
import { LogItem, PDFSettings, defaultSettings, Character } from './types';
import { PDFDocument } from './components/PDFDocument';
import { SettingsPanel } from './components/SettingsPanel';
import { useMediaQuery } from 'react-responsive';

const App = () => {
  const [data, setData] = useState<{ logs: LogItem[], characters: any[] } | null>(null);
  const [settings, setSettings] = useState<PDFSettings>(defaultSettings);
  const [loading, setLoading] = useState(true);
  const [isEditorOpen, setIsEditorOpen] = useState(false);
  const [editorContent, setEditorContent] = useState('');
  const isMobile = useMediaQuery({ query: '(max-width: 768px)' });

  // Generate Editor Content from current logs and scene breaks
  const generateEditorContent = () => {
      if (!data) return '';
      const logs = data.logs;
      const breaksText = settings.sceneBreaks || '';
      
      // Parse existing breaks
      const breaks: { title: string, content: string, index: number }[] = [];
      if (breaksText) {
          const lines = breaksText.split('\n');
          let currentBreak: any = null;
          lines.forEach(line => {
              const trimmed = line.trim();
              if (trimmed.startsWith('#')) {
                  if (currentBreak) breaks.push(currentBreak);
                  const title = trimmed.replace(/^#+\s*/, '');
                  currentBreak = { title, content: '', index: 0 };
              } else if (trimmed.startsWith('@Index:')) {
                   if (currentBreak) {
                       const idx = parseInt(trimmed.split(':')[1].trim());
                       if (!isNaN(idx)) currentBreak.index = idx;
                   }
              } else {
                  if (currentBreak) {
                      currentBreak.content += line + '\n';
                  }
              }
          });
          if (currentBreak) breaks.push(currentBreak);
      }
      breaks.sort((a, b) => a.index - b.index);

      let content = '';
      let breakPtr = 0;

      logs.forEach((log, i) => {
          while (breakPtr < breaks.length && breaks[breakPtr].index <= i) {
              const b = breaks[breakPtr];
              content += `\n# ${b.title}\n${b.content.trim()}\n\n`;
              breakPtr++;
          }
          const name = log.nickname || 'Unknown';
          content += `[${name}]: ${log.message}\n`;
      });

      // Trailing breaks
      while (breakPtr < breaks.length) {
          const b = breaks[breakPtr];
          content += `\n# ${b.title}\n${b.content.trim()}\n\n`;
          breakPtr++;
      }

      return content;
  };

  const handleOpenEditor = () => {
      setEditorContent(generateEditorContent());
      setIsEditorOpen(true);
  };

  const handleApplyEditor = () => {
      if (!data) return;

      const lines = editorContent.split('\n');
      const newLogs: LogItem[] = [];
      const newBreaks: string[] = [];
      
      let currentLogIndex = 0;
      let currentSceneTitle = '';
      let currentSceneContent = '';
      let isReadingScene = false;

      const flushScene = () => {
          if (currentSceneTitle) {
              newBreaks.push(`# ${currentSceneTitle}`);
              newBreaks.push(`@Index: ${currentLogIndex}`);
              newBreaks.push(currentSceneContent.trim());
              newBreaks.push(''); // Empty line
              currentSceneTitle = '';
              currentSceneContent = '';
          }
      };

      lines.forEach(line => {
          const trimmed = line.trim();
          
          if (trimmed.startsWith('# ')) {
              flushScene();
              currentSceneTitle = trimmed.substring(2).trim();
              isReadingScene = true;
          } else {
              // Check if it's a log line: [Name]: Message
              const logMatch = line.match(/^\[(.*?)\]:\s*(.*)/);
              if (logMatch) {
                  flushScene(); // If we were reading a scene, it ends here
                  isReadingScene = false;
                  
                  const name = logMatch[1];
                  const message = logMatch[2];
                  
                  // Try to find original log metadata if possible (fuzzy match)
                  // For now, we just create a new structure or try to map by index if simple editing?
                  // User said "put entire text... into editor".
                  // To preserve avatars/colors, we need to link to Characters.
                  // The LogItem needs `nickname` to match `settings.characters`.
                  
                  // We try to reuse the original log item at currentLogIndex if names match, to preserve isDice/etc
                  const originalLog = data.logs[currentLogIndex];
                  
                  if (originalLog && originalLog.nickname === name) {
                       newLogs.push({
                           ...originalLog,
                           message: message
                       });
                  } else {
                      // Created or reordered log
                      newLogs.push({
                          id: `edit-${Date.now()}-${currentLogIndex}`,
                          nickname: name,
                          message: message,
                          time: '',
                          imUserId: '',
                          isDice: false // Default to false if new
                      });
                  }
                  currentLogIndex++;
              } else {
                  if (isReadingScene) {
                      currentSceneContent += line + '\n';
                  } else {
                      // Text outside scene and not a log? 
                      // Maybe multi-line log? Or ignored?
                      // If we assume strict format, we might ignore or append to previous log.
                      // Let's append to previous log if exists
                      if (newLogs.length > 0) {
                          newLogs[newLogs.length - 1].message += '\n' + line;
                      }
                  }
              }
          }
      });
      flushScene();

      // Update Data and Settings
      setData(prev => prev ? { ...prev, logs: newLogs } : null);
      setSettings(prev => ({ ...prev, sceneBreaks: newBreaks.join('\n') }));
      setIsEditorOpen(false);
  };

  useEffect(() => {
    const storedData = localStorage.getItem('pdf_printer_data');
    if (storedData) {
      try {
        const parsed = JSON.parse(storedData);
        setData(parsed);

        // Load options if available
        if (parsed.options) {
          (window as any).pdfExportOptions = parsed.options;
        }
        
        // Initialize characters from input data
        if (parsed.characters && Array.isArray(parsed.characters)) {
            const initialChars: Character[] = parsed.characters.map((pc: any) => {
                // Infer roleType from main app data
                let roleType: any = 'player';
                if (pc.role === '主持人') roleType = 'host';
                else if (pc.role === '骰子') roleType = 'dice';
                else if (pc.role === '角色') roleType = 'player';
                else if (pc.role === '隐藏') roleType = 'ob'; // Or logic for OB

                return {
                    name: pc.name,
                    color: pc.color || '#000000',
                    attributes: [
                        { label: '力量', value: '50' },
                        { label: '敏捷', value: '50' },
                        { label: '意志', value: '50' },
                        { label: '体质', value: '50' },
                        { label: '外貌', value: '50' },
                    ], 
                    class: '',
                    background: '',
                    avatar: undefined,
                    roleType: roleType
                };
            });
            setSettings(prev => ({ ...prev, characters: initialChars }));
        }
      } catch (e) {
        console.error("Failed to parse data", e);
      }
    }
    setLoading(false);
  }, []);

  // Filter logs based on settings (if needed, but PDFDocument handles it mostly)
  // Actually PDFDocument handles showOb.

  const handleRefresh = () => {
    setLoading(true);
    // Simulate re-render
    setTimeout(() => {
        setLoading(false);
    }, 100);
  };

  if (loading) {
      return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  if (!data) {
      return (
        <div className="flex flex-col items-center justify-center h-screen gap-4">
            <div className="text-xl">未找到跑团日志数据</div>
            <div className="text-gray-500">请从主程序的工具箱中启动此工具</div>
        </div>
      );
  }

  return (
    <div className="flex h-screen overflow-hidden bg-gray-100 flex-col md:flex-row">
      {/* Sidebar - Settings */}
      <div className={`w-full md:w-80 flex-shrink-0 bg-white shadow-lg border-r z-10 overflow-hidden overflow-y-auto ${isMobile ? 'flex-1' : 'h-full'}`}>
          <SettingsPanel settings={settings} onChange={setSettings} />
          {/* Mobile Download Area inside Sidebar */}
          {isMobile && (
              <div className="p-4 border-t sticky bottom-0 bg-white shadow-inner flex justify-center">
                   <PDFDownloadLink document={<PDFDocument data={data.logs} settings={settings} />} fileName="run_log.pdf">
                        {({ blob, url, loading, error }) =>
                            <button disabled={loading} className="hand-drawn-btn hand-drawn-btn-primary text-lg px-8 py-2 w-full">
                                {loading ? 'PDF生成中...' : '下载 PDF'}
                            </button>
                        }
                     </PDFDownloadLink>
              </div>
          )}
      </div>

      {/* Main Area - PDF Preview (Hidden on Mobile) */}
      {!isMobile && (
        <div className="flex-1 h-full flex flex-col relative">
            <div className="bg-white border-b p-2 px-4 flex justify-between items-center shadow-sm">
                <h1 className="font-bold text-gray-700">跑团日志 PDF 生成预览</h1>
                <div className="flex gap-2 items-center">
                     <div className="text-xs text-gray-500">提示: PDF生成可能需要几十秒钟，请耐心等待</div>
                </div>
            </div>

            {/* Refresh Button */}
            <button 
                onClick={handleRefresh}
                className="absolute top-16 right-8 z-50 w-10 h-10 rounded-full bg-blue-500 text-white shadow-lg flex items-center justify-center hover:bg-blue-600 transition-colors"
                title="刷新渲染"
            >
                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M21 12a9 9 0 0 0-9-9 9.75 9.75 0 0 0-6.74 2.74L3 8" />
                    <path d="M3 3v5h5" />
                    <path d="M3 12a9 9 0 0 0 9 9 9.75 9.75 0 0 0 6.74-2.74L21 16" />
                    <path d="M16 21h5v-5" />
                </svg>
            </button>

            <div className="flex-1 p-4 overflow-hidden relative">
                <PDFViewer width="100%" height="100%" className="rounded shadow-lg border-none">
                    <PDFDocument data={data.logs} settings={settings} />
                </PDFViewer>
            </div>
        </div>
      )}

      {/* Floating Action Button for Scene Editor */}
      <button
        onClick={handleOpenEditor}
        className="fixed bottom-8 right-8 z-50 w-14 h-14 rounded-full bg-indigo-600 text-white shadow-lg flex items-center justify-center hover:bg-indigo-700 transition-colors border-4 border-white"
        title="编辑幕间/目录"
      >
        <svg xmlns="http://www.w3.org/2000/svg" width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
            <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
        </svg>
      </button>

      {/* Scene Editor Modal */}
      {isEditorOpen && (
        <div className="fixed inset-0 z-[100] bg-black bg-opacity-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-2xl h-[80vh] flex flex-col animate-in fade-in zoom-in duration-200">
                <div className="p-4 border-b flex justify-between items-center bg-gray-50 rounded-t-lg">
                    <h2 className="text-lg font-bold text-gray-800">文本与幕间编辑器</h2>
                    <button onClick={() => setIsEditorOpen(false)} className="text-gray-500 hover:text-gray-700">
                        <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="18" y1="6" x2="6" y2="18"></line><line x1="6" y1="6" x2="18" y2="18"></line></svg>
                    </button>
                </div>
                <div className="flex-1 p-4 flex flex-col overflow-hidden">
                    <div className="text-sm text-gray-600 mb-2 p-3 bg-blue-50 border border-blue-100 rounded">
                        <p className="font-bold mb-1">使用说明：</p>
                        <ul className="list-disc pl-5 space-y-1 text-xs">
                            <li><strong>所有文本均可编辑</strong>，点击"完成并应用"后将重新生成PDF。</li>
                            <li>使用 <code className="bg-white px-1 rounded border border-blue-200 text-blue-600"># 标题</code> 插入新的一幕（生成中间页和目录）。</li>
                            <li>标题下方的文本将被视为中间页的正文。</li>
                            <li>使用 <code className="bg-white px-1 rounded border border-blue-200 text-blue-600">[角色名]: 内容</code> 格式来表示对话日志。</li>
                            <li>示例：<br/><span className="font-mono text-gray-500"># 第一幕：序章<br/>这是故事的开始...<br/><br/>[张三]: 我们出发吧！</span></li>
                        </ul>
                    </div>
                    <textarea 
                        className="flex-1 w-full border rounded p-4 font-mono text-sm resize-none focus:ring-2 focus:ring-indigo-500 focus:outline-none"
                        placeholder="加载中..."
                        value={editorContent}
                        onChange={(e) => setEditorContent(e.target.value)}
                    />
                </div>
                <div className="p-4 border-t bg-gray-50 rounded-b-lg flex justify-end">
                    <button 
                        onClick={() => setIsEditorOpen(false)}
                        className="px-4 py-2 mr-2 text-gray-600 hover:text-gray-800"
                    >
                        取消
                    </button>
                    <button 
                        onClick={handleApplyEditor}
                        className="px-4 py-2 bg-indigo-600 text-white rounded hover:bg-indigo-700 transition-colors"
                    >
                        完成并应用
                    </button>
                </div>
            </div>
        </div>
      )}
    </div>
  );
};

export default App;
