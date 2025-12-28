import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { useEffect, useRef, useState } from "react";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useSettingsStore } from "@/store/settings";
import { Icons } from "@/components/icons";

const llmFormSchema = z.object({
  platform: z.string().min(1, "平台必选"),
  key: z.string().min(1, "API KEY不能为空"),
  model: z.string().min(1, "模型不能为空"),
});

const ttsFormSchema = z.object({
  token: z.string().optional(),
  appid: z.string().optional(),
  pollLimit: z.coerce.number().min(1).default(10),
  enableCustom: z.boolean().default(false),
  customUrl: z.string().optional(),
  customHeaders: z.string().optional(),
  customBody: z.string().optional(),
  customModels: z.string().optional(),
});

function KeyValueEditor({
  value,
  onChange,
  placeholderKey = "Key",
  placeholderValue = "Value",
}: {
  value: string;
  onChange: (value: string) => void;
  placeholderKey?: string;
  placeholderValue?: string;
}) {
  const [pairs, setPairs] = useState<{ key: string; value: string }[]>([]);
  const lastEmittedValueRef = useRef<string | null>(null);

  const displayValue = (v: unknown) => {
    if (typeof v === "string") return v;
    try {
      return JSON.stringify(v);
    } catch {
      console.error("Failed to stringify value in KeyValueEditor", v);
      return "";
    }
  };

  const parseValueMaybeJSON = (raw: string) => {
    const trimmed = raw.trim();
    if (!trimmed) return "";
    if (
      (trimmed.startsWith("{") && trimmed.endsWith("}")) ||
      (trimmed.startsWith("[") && trimmed.endsWith("]"))
    ) {
      try {
        return JSON.parse(trimmed);
      } catch {
        return raw;
      }
    }
    return raw;
  };

  useEffect(() => {
    if (value === lastEmittedValueRef.current) return;
    try {
      const parsed = JSON.parse(value || "{}") as unknown;
      if (!parsed || typeof parsed !== "object" || Array.isArray(parsed)) {
        setPairs([{ key: "", value: "" }]);
        return;
      }
      const newPairs = Object.entries(parsed as Record<string, unknown>).map(
        ([key, v]) => ({
        key,
        value: displayValue(v),
      }),
      );
      setPairs(newPairs.length > 0 ? newPairs : [{ key: "", value: "" }]);
    } catch {
      setPairs([{ key: "", value: "" }]);
    }
  }, [value]);

  const updateValue = (newPairs: { key: string; value: string }[]) => {
    const obj = newPairs.reduce((acc, { key, value }) => {
      if (key) acc[key] = parseValueMaybeJSON(value);
      return acc;
    }, {} as Record<string, unknown>);
    const serialized = JSON.stringify(obj);
    lastEmittedValueRef.current = serialized;
    onChange(serialized);
    setPairs(newPairs);
  };

  const handleAdd = () => {
    updateValue([...pairs, { key: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    updateValue(newPairs);
  };

  const handleChange = (index: number, field: "key" | "value", val: string) => {
    const newPairs = [...pairs];
    newPairs[index][field] = val;
    updateValue(newPairs);
  };

  return (
    <div className="space-y-2">
      {pairs.map((pair, index) => (
        <div key={index} className="flex gap-2 items-center">
          <Input
            className="flex-1 h-8 text-xs"
            placeholder={placeholderKey}
            value={pair.key}
            onChange={(e) => handleChange(index, "key", e.target.value)}
          />
          <Input
            className="flex-1 h-8 text-xs"
            placeholder={placeholderValue}
            value={pair.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 w-8 p-0"
            onClick={() => handleRemove(index)}
          >
            <Icons.delete className="size-4" />
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full h-8 text-xs"
        onClick={handleAdd}
      >
        <Icons.add className="size-3 mr-1" /> 添加
      </Button>
    </div>
  );
}

function CustomModelsEditor({
  value,
  onChange,
}: {
  value: string;
  onChange: (value: string) => void;
}) {
  const [pairs, setPairs] = useState<{ name: string; value: string }[]>([]);

  useEffect(() => {
    try {
      const parsed = JSON.parse(value || "[]");
      if (Array.isArray(parsed)) {
        const newPairs = parsed.map((item) => ({
          name: String(item.name ?? ""),
          value: String(item.value ?? ""),
        }));
        setPairs(newPairs.length > 0 ? newPairs : [{ name: "", value: "" }]);
      } else {
        setPairs([{ name: "", value: "" }]);
      }
    } catch {
      setPairs([{ name: "", value: "" }]);
    }
  }, []);

  const updateValue = (newPairs: { name: string; value: string }[]) => {
    const arr = newPairs.filter((p) => p.name).map((p) => ({ name: p.name, value: p.value }));
    onChange(JSON.stringify(arr));
    setPairs(newPairs);
  };

  const handleAdd = () => {
    updateValue([...pairs, { name: "", value: "" }]);
  };

  const handleRemove = (index: number) => {
    const newPairs = pairs.filter((_, i) => i !== index);
    updateValue(newPairs);
  };

  const handleChange = (index: number, field: "name" | "value", val: string) => {
    const newPairs = [...pairs];
    newPairs[index][field] = val;
    updateValue(newPairs);
  };

  return (
    <div className="space-y-2">
      {pairs.map((pair, index) => (
        <div key={index} className="flex flex-col sm:flex-row gap-2 items-stretch sm:items-center bg-muted/20 p-2 sm:p-0 rounded-md sm:bg-transparent">
          <Input
            className="flex-1 h-8 text-xs"
            placeholder="音色名称"
            value={pair.name}
            onChange={(e) => handleChange(index, "name", e.target.value)}
          />
          <Input
            className="flex-1 h-8 text-xs"
            placeholder="音色值"
            value={pair.value}
            onChange={(e) => handleChange(index, "value", e.target.value)}
          />
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="h-8 sm:w-8 w-full p-0 hover:bg-destructive/10 hover:text-destructive"
            onClick={() => handleRemove(index)}
          >
            <Icons.delete className="size-4" />
            <span className="sm:hidden ml-2 text-xs">删除</span>
          </Button>
        </div>
      ))}
      <Button
        type="button"
        variant="outline"
        size="sm"
        className="w-full h-8 text-xs"
        onClick={handleAdd}
      >
        <Icons.add className="size-3 mr-1" /> 添加
      </Button>
    </div>
  );
}

export function EditorSettingsDialog({
  isOpen,
  onClose,
}: {
  isOpen: boolean;
  onClose: () => void;
}) {
  const [activeTab, setActiveTab] = useState("llm");
  const ai = useSettingsStore((state) => state.ai);
  const tts = useSettingsStore((state) => state.tts);
  const updateAI = useSettingsStore((state) => state.updateAI);
  const updateTTS = useSettingsStore((state) => state.updateTTS);
  const [isRawMode, setIsRawMode] = useState(false);

  const handleOpenChange = (value) => {
    if (!value) {
      onClose();
    }
  };

  const llmForm = useForm<z.infer<typeof llmFormSchema>>({
    resolver: zodResolver(llmFormSchema),
    defaultValues: {
      platform: "deepseek",
      key: "",
      model: "deepseek-chat",
    },
  });

  const ttsForm = useForm<z.infer<typeof ttsFormSchema>>({
    resolver: zodResolver(ttsFormSchema),
    defaultValues: {
      appid: "",
      token: "",
      customUrl: "",
      customHeaders: "",
      customBody: "",
      customModels: "",
    },
  });

  function onSubmitLLM(values: Required<z.infer<typeof llmFormSchema>>) {
    updateAI(values);
    onClose();
  }

  function onSubmitTTS(values: z.infer<typeof ttsFormSchema>) {
    updateTTS({
      appid: values.appid || "",
      token: values.token || "",
      pollLimit: values.pollLimit,
      enableCustom: values.enableCustom,
      customUrl: values.customUrl,
      customHeaders: values.customHeaders,
      customBody: values.customBody,
      customModels: values.customModels,
    });
    onClose();
  }

  useEffect(() => {
    if (ai) {
      llmForm.reset(ai);
    }
  }, [ai, llmForm]);

  useEffect(() => {
    if (tts) {
      ttsForm.reset({
        appid: tts.appid,
        token: tts.token,
        pollLimit: tts.pollLimit ?? 10,
        enableCustom: tts.enableCustom ?? false,
        customUrl: tts.customUrl || "",
        customHeaders: tts.customHeaders || "",
        customBody: tts.customBody || "",
        customModels: tts.customModels || "",
      });
    }
  }, [tts, ttsForm]);

  return (
    <Dialog open={isOpen} onOpenChange={handleOpenChange}>
      <DialogContent
        className="w-[95vw] sm:w-full sm:max-w-[600px] max-h-[80vh] overflow-y-auto"
        onPointerDownOutside={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>设置</DialogTitle>
          <DialogDescription className="sr-only">
            配置 AI 平台和语音合成等设置
          </DialogDescription>
        </DialogHeader>

        <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
          <TabsList className="grid grid-cols-2 mb-4">
            <TabsTrigger value="llm">大模型</TabsTrigger>
            <TabsTrigger value="tts">语音合成</TabsTrigger>
          </TabsList>

          <TabsContent value="llm">
            <Form {...llmForm}>
              <form
                onSubmit={llmForm.handleSubmit(onSubmitLLM)}
                className="space-y-4"
              >
                <FormField
                  control={llmForm.control}
                  name="platform"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>AI平台</FormLabel>
                      <FormControl>
                        <Select
                          onValueChange={field.onChange}
                          value={field.value}
                        >
                          <SelectTrigger>
                            <SelectValue placeholder="请选择AI平台" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="deepseek">DeepSeek</SelectItem>
                            <SelectItem value="ark">火山方舟</SelectItem>
                            <SelectItem value="openai">OpenAI</SelectItem>
                          </SelectContent>
                        </Select>
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={llmForm.control}
                  name="key"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>API KEY</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="请输入API KEY"
                          {...field}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={llmForm.control}
                  name="model"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Model</FormLabel>
                      <FormControl>
                        <Input placeholder="请输入模型名称" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <div className="flex justify-center gap-2">
                  <Button type="submit">确定</Button>
                  <Button variant="ghost" onClick={onClose}>
                    取消
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>

          <TabsContent value="tts">
            <Form {...ttsForm}>
              <form
                onSubmit={ttsForm.handleSubmit(onSubmitTTS)}
                className="space-y-4"
              >
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <FormField
                    control={ttsForm.control}
                    name="appid"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>AppID (火山引擎)</FormLabel>
                        <FormControl>
                          <Input placeholder="请输入AppID" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ttsForm.control}
                    name="token"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Token (火山引擎)</FormLabel>
                        <FormControl>
                          <Input
                            type="password"
                            placeholder="请输入Token"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  <FormField
                    control={ttsForm.control}
                    name="pollLimit"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>轮询上限</FormLabel>
                        <FormControl>
                          <Input
                            type="number"
                            min={1}
                            placeholder="默认为10"
                            {...field}
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="border-t pt-4">
                  <div className="flex justify-between items-center mb-4">
                    <FormField
                      control={ttsForm.control}
                      name="enableCustom"
                      render={({ field }) => (
                        <FormItem className="flex flex-row items-center space-x-2 space-y-0">
                          <FormControl>
                            <Switch
                              checked={field.value}
                              onCheckedChange={field.onChange}
                            />
                          </FormControl>
                          <FormLabel className="text-sm font-medium">
                            启用自定义TTS服务
                          </FormLabel>
                        </FormItem>
                      )}
                    />
                    <Button 
                      type="button" 
                      variant="ghost" 
                      size="sm" 
                      onClick={() => setIsRawMode(!isRawMode)}
                      className="text-xs h-6"
                    >
                      {isRawMode ? "切换至简易模式" : "切换至JSON模式"}
                    </Button>
                  </div>
                  
                  {ttsForm.watch("enableCustom") && (
                    <>
                      <FormField
                        control={ttsForm.control}
                        name="customUrl"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>请求地址</FormLabel>
                            <FormControl>
                              <Input placeholder="https://api.example.com/tts" {...field} />
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ttsForm.control}
                        name="customHeaders"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>请求头 (JSON)</FormLabel>
                            <FormControl>
                              {isRawMode ? (
                                <Textarea 
                                  placeholder='{"Authorization": "Bearer {token}"}' 
                                  className="font-mono text-xs"
                                  rows={3}
                                  {...field} 
                                />
                              ) : (
                                <KeyValueEditor 
                                  value={field.value || ""} 
                                  onChange={field.onChange} 
                                  placeholderKey="Header Name"
                                  placeholderValue="Header Value"
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ttsForm.control}
                        name="customBody"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>请求体 (JSON)</FormLabel>
                            <FormControl>
                              {isRawMode ? (
                                <Textarea 
                                  placeholder='{"text": "{text}", "voice": "{voice}"}' 
                                  className="font-mono text-xs"
                                  rows={3}
                                  {...field} 
                                />
                              ) : (
                                <KeyValueEditor 
                                  value={field.value || ""} 
                                  onChange={field.onChange} 
                                  placeholderKey="Body Key"
                                  placeholderValue="Body Value ({text}, {voice}...)"
                                />
                              )}
                            </FormControl>
                            <FormDescription className="text-xs text-muted-foreground">
                              可用变量: {"{text}"}, {"{voice}"}, {"{speed}"}, {"{volume}"}, {"{pitch}"}
                            </FormDescription>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                      <FormField
                        control={ttsForm.control}
                        name="customModels"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>可用音色列表 (JSON)</FormLabel>
                            <FormControl>
                              {isRawMode ? (
                                <Textarea 
                                  placeholder='[{"name": "默认女声", "value": "female_01"}]' 
                                  className="font-mono text-xs"
                                  rows={3}
                                  {...field} 
                                />
                              ) : (
                                <CustomModelsEditor 
                                  value={field.value || ""} 
                                  onChange={field.onChange} 
                                />
                              )}
                            </FormControl>
                            <FormMessage />
                          </FormItem>
                        )}
                      />
                    </>
                  )}
                </div>

                <div className="flex justify-center gap-2">
                  <Button type="submit">确定</Button>
                  <Button variant="ghost" onClick={onClose}>
                    取消
                  </Button>
                </div>
              </form>
            </Form>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

function FormDescription({ className, children }: { className?: string; children: React.ReactNode }) {
  return <p className={className}>{children}</p>;
}
