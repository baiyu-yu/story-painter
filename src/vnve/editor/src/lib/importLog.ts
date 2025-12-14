import { Dialogue, createDialogueScene } from "@vnve/core";
import { useEditorStore } from "@/store";
import { importAssetToProjectTmp, DBAssetType } from "@/db";
import { createSprite } from "@/lib/core";

export interface LogItem {
  nickname: string;
  message: string;
  isDice: boolean;
  role?: string;
  IMUserId?: string;
}

export interface CharItem {
  name: string;
  role: '主持人' | '角色' | '骰子' | '隐藏';
  IMUserId?: string;
  color?: string;
}

// 用于标记骰子角色的角色名集合
let diceCharacterNames: Set<string> = new Set();

// 导出函数，用于检查某个角色名是否是骰子角色
export function isDiceCharacter(name: string): boolean {
  return diceCharacterNames.has(name);
}

// 导出函数，获取所有骰子角色名
export function getDiceCharacterNames(): Set<string> {
  return diceCharacterNames;
}

export function importFromLocalStorage(): boolean {
  const dataStr = localStorage.getItem('vnve_import_data');
  if (!dataStr) return false;

  try {
    const data = JSON.parse(dataStr) as { logs: LogItem[], characters: CharItem[] };
    localStorage.removeItem('vnve_import_data');

    const editorStore = useEditorStore.getState();
    const editor = editorStore.editor;
    if (!editor) return false;

    // 收集被标记为"骰子"角色的角色名
    diceCharacterNames = new Set();
    if (data.characters) {
      data.characters.forEach(c => {
        // 如果角色的 role 是 "骰子"，将其名字加入骰子角色集合
        if (c.role === '骰子') {
          diceCharacterNames.add(c.name);
        }
      });
    }

    // Create a new scene for the imported log
    // We can try to be smart and split scenes if there is a long pause or specific marker?
    // For now, let's create one big scene. User can split it later if we provide split tool (which we don't yet).
    // Or we can just create one scene.

    const scene = createDialogueScene();
    scene.label = "完整log";
    scene.config.speak.effect = "typewriter";

    // Clear default empty dialogue if any
    scene.dialogues = [];

    const speakerSet = new Set<string>();
    data.logs.forEach(log => {
        if (!log.message) return;

        // Filter out [mirai:...] and [CQ:...] tags
        const filteredMessage = String(log.message)
            .replace(/\[mirai:.*?\]/g, '')
            .replace(/\[CQ:.*?\]/g, '');

        if (!filteredMessage.trim()) return;

        // Convert message to Plate JSON
        // If message has newlines, we should create multiple paragraphs
        const paragraphs = filteredMessage.split('\n').map(line => ({
            type: "p",
            children: [{ text: line }]
        }));

        // 直接使用 nickname 作为角色名
        const speakerName = log.nickname || "未知角色";
        if (speakerName) speakerSet.add(speakerName);

        // 判断是否为骰子角色：log.isDice 为真，或者该角色被分配为"骰子"角色
        const isDiceRole = !!log.isDice || diceCharacterNames.has(speakerName);

        const dialogue: Dialogue = {
            speak: {
                wordsPerMin: 300,
                interval: 0.2,
                effect: "typewriter",
                speaker: {
                    name: speakerName,
                    isDice: isDiceRole,
                    targetName: "",
                    autoShowSpeaker: {
                        inEffect: "Show"
                    },
                    autoMaskOtherSpeakers: {
                        alpha: 0.5
                    }
                }
            },
            lines: paragraphs
        };
        
        scene.addDialogue(dialogue);
    });
    
    editor.addScene(scene);
    editor.setActiveSceneByName(scene.name);

    // 异步创建占位角色素材并插入到场景中，恢复角色选择
    (async () => {
      try {
        const project = useEditorStore.getState().project;
        if (!project || !project.id) return;

        // 透明 1x1 PNG Base64
        const transparentPngBase64 =
          "iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mP8/x8AAusB9Ue8n3wAAAAASUVORK5CYII=";
        const pngBytes = Uint8Array.from(atob(transparentPngBase64), (c) => c.charCodeAt(0));

        const nameToSpriteName = new Map<string, string>();

        for (const name of speakerSet) {
          // 清理文件名中的特殊字符，避免 URL 解析问题
          const safeName = name.replace(/[\/\\:*?"<>|]/g, '_');
          const file = new File([pngBytes], `${safeName}.png`, { type: "image/png" });
          const asset = await importAssetToProjectTmp(project.id, DBAssetType.Character, file);
          const sprite = await createSprite(asset, editor);
          sprite.label = name;
          editor.addChild(sprite);
          nameToSpriteName.set(name, sprite.name);
        }

        // 绑定对白的 speakerTargetName 以便编辑器识别到角色
        scene.dialogues.forEach((d) => {
          const target = nameToSpriteName.get(d.speak.speaker?.name || "");
          if (target && d.speak.speaker) {
            d.speak.speaker.speakerTargetName = target;
          }
        });

        // 触发一次场景刷新，确保编辑器状态与界面中的activeScene同步（包含角色列表）
        editor.setActiveSceneByName(scene.name);
      } catch (err) {
        console.error("角色占位创建失败", err);
      }
    })();
    return true;
    
  } catch (e) {
    console.error("Import failed", e);
    return false;
  }
}
