import { Scene, Dialogue, createDialogueScene, createTitleScene } from "@vnve/core";
import { useEditorStore } from "@/store";

export interface LogItem {
  nickname: string;
  message: string;
  isDice: boolean;
  role: string;
}

export interface CharItem {
  name: string;
  role: string;
}

export function importFromLocalStorage() {
  const dataStr = localStorage.getItem('vnve_import_data');
  if (!dataStr) return;
  
  try {
    const data = JSON.parse(dataStr) as { logs: LogItem[], characters: CharItem[] };
    localStorage.removeItem('vnve_import_data');
    
    const editorStore = useEditorStore.getState();
    const editor = editorStore.editor;
    if (!editor) return;

    // Create a new scene for the imported log
    // We can try to be smart and split scenes if there is a long pause or specific marker?
    // For now, let's create one big scene. User can split it later if we provide split tool (which we don't yet).
    // Or we can just create one scene.
    
    const scene = createDialogueScene();
    scene.label = "导入的Log";
    scene.config.speak.effect = "typewriter";
    
    // Clear default empty dialogue if any
    scene.dialogues = [];

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
        
        const dialogue: Dialogue = {
            speak: {
                wordsPerMin: 300,
                interval: 0.2,
                effect: "typewriter",
                speaker: {
                    name: log.nickname || "未知角色",
                    isDice: !!log.isDice,
                    targetName: "", // No sprite by default
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
    
  } catch (e) {
    console.error("Import failed", e);
  }
}
