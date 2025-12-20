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
import { DBAssetType, getAssetById, DBAsset, getAssetSourceURL } from "@/db";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { createSprite } from "@/lib/core";

import { Dialogue, Sprite, AnimatedGIF, Video, isChild } from "@vnve/core";

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
    if (isOpen && activeScene) {
      const loadBindings = async () => {
        const init: Record<string, any> = {};
        for (const n of names) init[n] = null;

        const nameToAssetId = new Map<string, number>();
        const spriteMap = new Map<string, Sprite>();

        // 1. 收集场景中的 Character Sprite
        activeScene.children.forEach((c) => {
          // Check type property directly instead of instanceof check (isChild) because activeScene from store is a plain object
          if ((c as any).type === "Sprite" && (c as any).assetType === DBAssetType.Character) {
            spriteMap.set(c.name, c as Sprite);
          }
        });

        // 2. 通过 speakerTargetName 查找绑定
        activeScene.dialogues.forEach((d) => {
          const s = d.speak?.speaker;
          if (s?.name && s?.speakerTargetName) {
            const sprite = spriteMap.get(s.speakerTargetName);
            if (sprite) {
              nameToAssetId.set(s.name, sprite.assetID);
            }
          }
        });

        // 3. 通过 label 查找绑定 (fallback)
        spriteMap.forEach((sprite) => {
          if (names.includes(sprite.label) && !nameToAssetId.has(sprite.label)) {
            nameToAssetId.set(sprite.label, sprite.assetID);
          }
        });

        // 4. 加载资源
        for (const [name, assetId] of nameToAssetId.entries()) {
          const asset = await getAssetById(assetId);
          if (asset) {
            init[name] = asset;
          }
        }
        setNameAssetMap(init);
      };
      loadBindings();
    }
  }, [isOpen, names, activeScene]);

  const handleSelectCharacter = async (name: string) => {
    const asset = await selectAsset(DBAssetType.Character);
    if (asset) {
      setNameAssetMap({ ...nameAssetMap, [name]: asset });
    }
  };

  const handleConfirm = async () => {
    // Use editor.activeScene (instance) instead of store activeScene (plain object) to ensure methods exist
    const sceneInstance = editor.activeScene;
    if (!sceneInstance) {
      onClose();
      return;
    }

    const nameToSpriteName = new Map<string, string>();
    const newSprites: (Sprite | AnimatedGIF | Video)[] = [];
    const updates: Array<{ name: string; source: string; assetID: number }> = [];

    for (const [logName, asset] of Object.entries(nameAssetMap)) {
      if (!asset) continue;

      let sprite = sceneInstance.findChildByLabel(logName) as Sprite | AnimatedGIF | Video;

      if (!sprite) {
        const newSprite = await createSprite(asset as DBAsset, editor);
        newSprite.label = logName;
        newSprites.push(newSprite);
        nameToSpriteName.set(logName, newSprite.name);
      } else {
        nameToSpriteName.set(logName, sprite.name);
        if (sprite.assetID !== asset.id) {
          const state = asset.states.find((s) => s.id === asset.stateId) || asset.states[0];
          const source = getAssetSourceURL(state);
          updates.push({ name: sprite.name, source, assetID: asset.id });
        }
      }
    }

    // Use editor.addChild to ensure transform listeners are attached for interactivity
    newSprites.forEach((s) => editor.addChild(s));

    editor.updateActiveScene((scene) => {
      updates.forEach((u) => {
        const s = scene.getChildByName(u.name) as Sprite | AnimatedGIF | Video;
        if (s) {
          s.changeSource(u.source);
          s.assetID = u.assetID;
          s.load();
        }
      });

      scene.dialogues = scene.dialogues.map((d) => {
        const logName = d.speak?.speaker?.name ?? "";
        const spriteName = nameToSpriteName.get(logName);
        if (spriteName) {
          const prevSpeaker = (d.speak?.speaker || { name: logName }) as Dialogue["speak"]["speaker"];
          return {
            ...d,
            speak: {
              ...d.speak,
              speaker: {
                ...prevSpeaker,
                speakerTargetName: spriteName,
              },
            },
          } as Dialogue;
        }
        return d as Dialogue;
      });
    });

    onClose();
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="w-[95vw] sm:w-full sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
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
