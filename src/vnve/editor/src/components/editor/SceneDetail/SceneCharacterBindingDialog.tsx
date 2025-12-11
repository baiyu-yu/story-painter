import { useEffect, useMemo, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useEditorStore } from "@/store";
import { AssetStateCard } from "@/components/editor/AssetLibrary/AssetCard";
import { DBAssetType } from "@/db";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { createSprite } from "@/lib/core";
import { Dialogue } from "@vnve/core";

export function SceneCharacterBindingDialog({ isOpen, onClose }: { isOpen: boolean; onClose: () => void }) {
  const editor = useEditorStore((state) => state.editor);
  const activeScene = useEditorStore((state) => state.activeScene);
  const { selectAsset } = useAssetLibrary();
  const [nameAssetMap, setNameAssetMap] = useState<Record<string, any>>({});

  const names = useMemo(() => {
    if (!activeScene) return [] as string[];
    const set = new Set<string>();
    for (const d of activeScene.dialogues) {
      const n = d.speak?.speaker?.name || "";
      if (n.trim()) set.add(n.trim());
    }
    return Array.from(set);
  }, [activeScene]);

  useEffect(() => {
    if (isOpen) {
      const init: Record<string, any> = {};
      for (const n of names) init[n] = null;
      setNameAssetMap(init);
    }
  }, [isOpen, names]);

  const handleSelectCharacter = async (name: string) => {
    const asset = await selectAsset(DBAssetType.Character);
    if (asset) {
      setNameAssetMap({ ...nameAssetMap, [name]: asset });
    }
  };

  const handleConfirm = async () => {
    if (!activeScene) {
      onClose();
      return;
    }

    const addedSprites: Record<string, string> = {};

    for (const [name, asset] of Object.entries(nameAssetMap)) {
      if (!asset) continue;
      const sprite = await createSprite(asset, editor);
      sprite.label = name;
      editor.addChild(sprite);
      addedSprites[name] = sprite.name;
    }

    const mapped: Dialogue[] = activeScene.dialogues.map((d) => {
      const n = d.speak?.speaker?.name ?? "";
      const target = addedSprites[n];
      if (target) {
        const prevSpeaker = (d.speak?.speaker || { name: n }) as Dialogue["speak"]["speaker"];
        return {
          ...d,
          speak: {
            ...d.speak,
            speaker: {
              ...prevSpeaker,
              name: prevSpeaker.name ?? n,
              speakerTargetName: target,
            },
          },
        } as Dialogue;
      }
      return d as Dialogue;
    });

    editor.updateActiveScene((scene) => {
      scene.dialogues = mapped;
      const firstTarget = Object.values(addedSprites)[0];
      const firstName = Object.keys(addedSprites)[0] || (scene.config.speak?.speaker?.name ?? "");
      if (firstTarget) {
        scene.config.speak = {
          ...scene.config.speak,
          speaker: {
            ...(scene.config.speak?.speaker || {}),
            name: firstName,
            targetName: firstTarget,
          },
        };
      }
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px]">
        <DialogHeader>
          <DialogTitle className="text-base font-bold">角色绑定</DialogTitle>
          <DialogDescription>为当前场景对白中的角色名绑定角色立绘素材</DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <div className="flex flex-wrap gap-2">
            {names.map((n) => {
              const asset = nameAssetMap[n];
              let state = { name: n, id: 0, ext: "" } as any;
              if (asset) {
                const hit = asset.states.find((s) => s.id === asset.stateId) || asset.states[0];
                state = { ...hit, name: n };
              }
              return (
                <div key={n} className="flex flex-col items-center gap-1">
                  <AssetStateCard type={DBAssetType.Character} state={state} onSelect={() => handleSelectCharacter(n)} />
                  <span className="text-sm">{n}</span>
                  <Button size="sm" variant="outline" onClick={() => handleSelectCharacter(n)}>
                    选择角色素材
                  </Button>
                </div>
              );
            })}
            {names.length === 0 && (
              <div className="text-sm text-muted-foreground">未检测到角色名，请先添加对白</div>
            )}
          </div>
        </ScrollArea>
        <DialogFooter className="justify-center sm:justify-center">
          <Button onClick={handleConfirm} disabled={names.length === 0}>确定</Button>
          <Button variant="outline" onClick={onClose}>取消</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
