import { useState } from "react";
import { draftDB } from "@/db";
import { useLiveQuery } from "dexie-react-hooks";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Icons } from "@/components/icons";
import { ScrollArea } from "@/components/ui/scroll-area";

interface DraftManagerProps<T = any> {
  content?: T;
  type: "dialogue" | "script";
  onLoad: (content: T) => void;
  readonly?: boolean;
}

export function DraftManager<T = any>({ content, type, onLoad, readonly }: DraftManagerProps<T>) {
  const drafts = useLiveQuery(() => draftDB.where("type").equals(type).reverse().sortBy("time"));
  const [name, setName] = useState("");

  const handleSave = async () => {
    if (!name || readonly) return;
    await draftDB.add({
      name,
      content,
      time: Date.now(),
      type,
    });
    setName("");
  };

  const handleLoad = (draft: any) => {
    onLoad(draft.content);
  };

  const handleDelete = async (id: number) => {
    await draftDB.delete(id);
  };

  return (
    <div className="w-80 max-w-full p-2 gap-2 flex flex-col">
      {!readonly && (
        <>
          <div className="flex gap-2">
            <Input 
              placeholder="草稿名称" 
              value={name} 
              onChange={(e) => setName(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === "Enter") {
                  handleSave();
                }
              }}
            />
            <Button onClick={handleSave} size="sm">保存</Button>
          </div>
          <div className="text-xs text-muted-foreground my-1">
            保存草稿（仅保存剧本文本和剧目分割状态）
          </div>
        </>
      )}
      <div className="border rounded-md">
         <ScrollArea className="h-48">
           {drafts?.length === 0 && (
             <div className="text-center text-sm text-muted-foreground py-8">
               暂无草稿
             </div>
           )}
           {drafts?.map(draft => (
             <div key={draft.id} className="flex items-center justify-between p-2 border-b last:border-0 hover:bg-muted/50">
               <div className="flex flex-col overflow-hidden">
                 <span className="text-sm font-medium truncate" title={draft.name}>{draft.name}</span>
                 <span className="text-xs text-muted-foreground">{new Date(draft.time).toLocaleString()}</span>
               </div>
               <div className="flex gap-1 shrink-0">
                 <Button variant="ghost" size="icon" className="size-6" onClick={() => handleLoad(draft)} title="读取">
                   <Icons.check className="size-3" />
                 </Button>
                 <Button variant="ghost" size="icon" className="size-6 text-destructive hover:text-destructive" onClick={() => handleDelete(draft.id!)} title="删除">
                   <Icons.trash className="size-3" />
                 </Button>
               </div>
             </div>
           ))}
         </ScrollArea>
      </div>
    </div>
  );
}
