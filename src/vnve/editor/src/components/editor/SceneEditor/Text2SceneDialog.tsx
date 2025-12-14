import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useEffect, useState, useRef } from "react";
import {
  getAssetById,
} from "@/db";
import {
  StoryScene,
  parseStory,
  story2Scenes,
  story2Text,
  text2Story,
} from "@/lib/core";
import { useEditorStore } from "@/store";
import { aiConvert2Story, aiGenStory } from "@/lib/llm";
import { useToast } from "@/components/hooks/use-toast";
import { TextFileEditor } from "@/components//ui/text-file-editor";
import { useAssetLibrary } from "@/components/hooks/useAssetLibrary";
import { AssetStateCard } from "@/components/editor/AssetLibrary/AssetCard";
import { DBAssetType } from "@/db";
import { Loader2 } from "lucide-react";
import { ScrollArea, ScrollBar } from "@/components/ui/scroll-area";
import { matchJSON } from "@/lib/utils";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";

export function Text2SceneDialog({
  isOpen,
  type,
  initialText,
  onClose,
}: {
  isOpen: boolean;
  type: "formatter" | "ai";
  initialText?: string;
  onClose: () => void;
}) {
  const editor = useEditorStore((state) => state.editor);
  const [story, setStory] = useState([]);
  const [loadingText, setLoadingText] = useState("");
  const { toast } = useToast();
  const [characterAssetMap, setCharacterAssetMap] = useState(null);
  const [backgroundAssetMap, setBackgroundAssetMap] = useState(null);
  const [perSceneBackgroundMap, setPerSceneBackgroundMap] = useState<Record<string, any>>({});
  const [aiInputText, setAiInputText] = useState("");
  const [importInputText, setImportInputText] = useState("");
  const [step, setStep] = useState(1);
  const { selectAsset } = useAssetLibrary();
  const [sceneTemplateName, setSceneTemplateName] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  
  // Scene Split State
  const [enableSplit, setEnableSplit] = useState(false);
  const [splitSeparator, setSplitSeparator] = useState("---");

  useEffect(() => {
    if (initialText && type === "formatter") {
      setImportInputText(initialText);
    }
  }, [initialText, type]);

  useEffect(() => {
    if (type === "ai") {
      setStep(1);
    }

    if (type === "formatter") {
      setStep(2);
    }
  }, [type]);

  const handleClose = () => {
    onClose();
    setStory([]);
    setLoadingText("");
    setCharacterAssetMap(null);
    setBackgroundAssetMap(null);
    setAiInputText("");
    setImportInputText("");
    setEnableSplit(false);
  };

  const handleImportScreenplay = async (text: string) => {
    setLoadingText("剧本导入中");
    try {
      const json = matchJSON(text); // 同步支持导入JSON格式
      let finalStory: StoryScene[] = [];

      if (json?.scenes) {
        finalStory = json.scenes;
      } else if (enableSplit && splitSeparator) {
        const parts = text.replace(new RegExp(splitSeparator, 'g'), `${splitSeparator}\n\n`).split(new RegExp(splitSeparator, 'g'));
        for (let i = 0; i < parts.length; i++) {
          const part = parts[i];
          if (!part.trim()) continue;
          const partStory = text2Story(part);
          // Ensure scenes have names if they are default
          partStory.forEach((s, idx) => {
            if (!s.name || s.name === "未命名") {
              s.name = `场景${i + 1}-${idx + 1}`;
            }
          });
          finalStory.push(...partStory);
        }
      } else {
        finalStory = text2Story(text);
      }

      await handleStory(finalStory);
    } catch (error) {
      toast({
        title: "导入失败！",
        description: error.message,
        variant: "destructive",
      });
      console.error(error);
    } finally {
      setLoadingText("");
    }
  };

  const handleAiScreenplay = async (
    type: "convert" | "generate",
    input: string,
  ) => {
    setLoadingText(type === "convert" ? "智能转换中" : "智能生成中");
    try {
      let story;

      if (type === "convert") {
        story = await aiConvert2Story(input);
      } else {
        story = await aiGenStory(input);
      }

      const text = story2Text(story);

      setImportInputText(text);
      setStep(step + 1);
    } catch (error) {
      toast({
        title: `${type === "convert" ? "转换" : "生成"}失败！`,
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingText("");
    }
  };

  const handleStory = async (story: StoryScene[]) => {
    setStory(story);
    const result = await parseStory(story);

    // Fallback: 如果数据库中找不到角色素材，尝试从编辑器当前的场景中查找
    // 这种情况常见于刚刚通过 importLog 导入的临时角色
    if (editor.scenes.length > 0) {
      const activeScene = editor.activeScene || editor.scenes[0];
      for (const name of Object.keys(result.characterAssetMap)) {
        if (!result.characterAssetMap[name]) {
          // 尝试在场景中查找同名的 Sprite
          // 注意：importLog 创建的 Sprite label 就是角色名
          const sprite = activeScene.children.find(
            (c: any) => c.type === "Sprite" && c.label === name
          ) as any;
          
          if (sprite && sprite.assetID) {
             const asset = await getAssetById(sprite.assetID);
             if (asset) {
               result.characterAssetMap[name] = asset;
             }
          }
        }
      }
    }

    setCharacterAssetMap(result.characterAssetMap);
    setBackgroundAssetMap(result.backgroundAssetMap);

    const initPerScene: Record<string, any> = {};
    story.forEach((_, idx) => {
      initPerScene[String(idx)] = null;
    });
    setPerSceneBackgroundMap(initPerScene);

    setStep(step + 1);
  };

  const handleDoNextStep = () => {
    /*
    const hasUnselected = Object.keys(characterAssetMap).some(
      (name) => !characterAssetMap[name],
    );

    if (hasUnselected) {
      toast({
        title: "请为所有角色选择素材",
        variant: "destructive",
      });
      return;
    }
    */
    setStep(step + 1);
  };

  const handleStory2Scenes = async () => {
    /*
    const hasUnselected = Object.keys(perSceneBackgroundMap).some(
      (key) => !perSceneBackgroundMap[key],
    );

    if (hasUnselected) {
      toast({
        title: "请为所有场景选择素材",
        variant: "destructive",
      });
      return;
    }
    */
    setLoadingText("场景生成中");
    try {
      await story2Scenes(
        story,
        editor,
        characterAssetMap,
        perSceneBackgroundMap,
        sceneTemplateName,
      );
      handleClose();
    } catch (error) {
      toast({
        title: "生成失败！",
        description: error.message,
        variant: "destructive",
      });
    } finally {
      setLoadingText("");
    }
  };

  const handleSelectCharacter = async (name: string) => {
    const asset = await selectAsset(DBAssetType.Character);

    if (asset) {
      setCharacterAssetMap({
        ...characterAssetMap,
        [name]: asset,
      });
    }
  };

  const handleRemoveCharacter = (name: string) => {
    const newMap = { ...characterAssetMap };
    delete newMap[name];
    setCharacterAssetMap(newMap);
  };

  const handleSelectBackground = async (indexKey: string) => {
    if (loadingText) {
      return;
    }

    const asset = await selectAsset(DBAssetType.Background);

    if (asset) {
      setPerSceneBackgroundMap({
        ...perSceneBackgroundMap,
        [indexKey]: asset,
      });
    }
  };

  const handleInsertSplit = () => {
    const textarea = textareaRef.current;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const prevScrollTop = textarea.scrollTop;
    const prevScrollLeft = textarea.scrollLeft;
    const text = importInputText;
    const insertText = `\n${splitSeparator}\n`;

    const newText =
      text.substring(0, start) + insertText + text.substring(end);
    setImportInputText(newText);

    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(
        start + insertText.length,
        start + insertText.length,
      );
      textarea.scrollTop = prevScrollTop;
      textarea.scrollLeft = prevScrollLeft;
    }, 0);
  };

  // AI
  const Step1 = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Icons.sparkles className="size-5" />
            智能剧本
          </DialogTitle>
          <DialogDescription></DialogDescription>
        </DialogHeader>
        <Tabs defaultValue="convert">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="convert" disabled={!!loadingText}>
              转换剧本
            </TabsTrigger>
            <TabsTrigger value="generate" disabled={!!loadingText}>
              生成剧本
            </TabsTrigger>
          </TabsList>
          <TabsContent value="convert">
            <TextFileEditor
              value={aiInputText}
              onChange={setAiInputText}
              placeholder="请输入小说、故事原文"
              loading={loadingText}
              onComplete={(text) => handleAiScreenplay("convert", text)}
            ></TextFileEditor>
          </TabsContent>
          <TabsContent value="generate">
            <TextFileEditor
              value={aiInputText}
              onChange={setAiInputText}
              placeholder="请输入剧情大纲"
              loading={loadingText}
              onComplete={(text) => handleAiScreenplay("generate", text)}
            ></TextFileEditor>
          </TabsContent>
        </Tabs>
      </>
    );
  };

  // 剧本展示
  const Step2 = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            导入剧本
          </DialogTitle>
          <DialogDescription></DialogDescription>
          <div className="flex items-center gap-4 py-2">
            <div className="flex items-center gap-2">
              <Switch 
                id="split-mode" 
                checked={enableSplit} 
                onCheckedChange={setEnableSplit}
              />
              <Label htmlFor="split-mode">场景分割</Label>
            </div>
            {enableSplit && (
              <div className="flex items-center gap-2 flex-1">
                <Label htmlFor="split-sep" className="whitespace-nowrap">分割符</Label>
                <Input 
                  id="split-sep" 
                  value={splitSeparator} 
                  onChange={(e) => setSplitSeparator(e.target.value)}
                  placeholder="例如: ---"
                  className="h-8"
                />
                <Button size="sm" variant="outline" onClick={handleInsertSplit}>插入</Button>
              </div>
            )}
          </div>
          <TextFileEditor
            textareaRef={textareaRef}
            value={importInputText}
            placeholder="请输入或者选择剧本文件"
            loading={loadingText}
            onChange={setImportInputText}
            onComplete={handleImportScreenplay}
            onChangeTemplate={setSceneTemplateName}
          >
            {type === "ai" && (
              <Button variant="outline" onClick={() => setStep(step - 1)}>
                返回
              </Button>
            )}
          </TextFileEditor>
        </DialogHeader>
      </>
    );
  };

  // 选择人物
  const Step3 = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            选择角色
          </DialogTitle>
          <DialogDescription>
            根据剧本解析出以下角色，请选择角色对应的素材
          </DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <div className="flex gap-1 pb-4">
            {Object.keys(characterAssetMap).map((name) => {
              const asset = characterAssetMap[name];
              let state = { name, id: 0, ext: "" };

              if (asset) {
                const hit =
                  asset.states.find((state) => state.id === asset.stateId) ||
                  asset.states[0];
                state = { ...hit, name };
              }

              return (
                <div key={name} className="relative group">
                  <AssetStateCard
                    type={DBAssetType.Character}
                    state={state}
                    onSelect={() => handleSelectCharacter(name)}
                  ></AssetStateCard>
                  <Button
                    size="icon"
                    variant="destructive"
                    className="absolute -top-2 -right-2 size-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                    onClick={() => handleRemoveCharacter(name)}
                  >
                    <Icons.clear className="size-3" />
                  </Button>
                </div>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex justify-between">
          <Button variant="outline" onClick={() => setStep(step - 1)}>
            返回
          </Button>

          <Button onClick={handleDoNextStep}>下一步</Button>
        </div>
      </>
    );
  };

  // 选择场景
  const Step4 = () => {
    return (
      <>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            选择场景
          </DialogTitle>
          <DialogDescription>
            根据剧本解析出以下场景，请选择场景对应的素材
          </DialogDescription>
        </DialogHeader>
        <ScrollArea>
          <div className="flex gap-1 pb-4">
            {story.map((s, idx) => {
              const key = String(idx);
              const asset = perSceneBackgroundMap[key];
              const displayName = s.name?.trim() ? s.name : `场景${idx + 1}`;
              let state = { name: displayName, id: 0, ext: "" };

              if (asset) {
                const hit =
                  asset.states.find((st) => st.id === asset.stateId) ||
                  asset.states[0];
                state = { ...hit, name: displayName };
              }

              return (
                <AssetStateCard
                  key={key}
                  type={DBAssetType.Background}
                  state={state}
                  onSelect={() => handleSelectBackground(key)}
                ></AssetStateCard>
              );
            })}
          </div>
          <ScrollBar orientation="horizontal" />
        </ScrollArea>
        <div className="flex justify-between">
          <Button
            variant="outline"
            disabled={!!loadingText}
            onClick={() => setStep(step - 1)}
          >
            返回
          </Button>
          <Button disabled={!!loadingText} onClick={handleStory2Scenes}>
            {loadingText && <Loader2 className="animate-spin mr-1" />}
            {loadingText ? loadingText : "生成"}
          </Button>
        </div>
      </>
    );
  };

  const Steps = [Step1, Step2, Step3, Step4];

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent
        className="min-w-[70vw]"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        {step > 0 && Steps[step - 1]()}
      </DialogContent>
    </Dialog>
  );
}
