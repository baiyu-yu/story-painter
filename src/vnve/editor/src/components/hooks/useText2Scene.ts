import { useState } from "react";

export function useText2Scene() {
  const [isOpen, setIsOpen] = useState(false);
  const [type, setType] = useState<"formatter" | "ai">();
  const [initialScript, setInitialScript] = useState("");

  const handleOpenImportText2Scene = (script?: string) => {
    setIsOpen(true);
    setType("formatter");
    if (script) setInitialScript(script);
  };

  const handleOpenAiText2Scene = () => {
    setIsOpen(true);
    setType("ai");
  };

  const handleCloseText2Scene = () => {
    setIsOpen(false);
    setInitialScript("");
  };

  return {
    isOpenText2Scene: isOpen,
    text2SceneType: type,
    initialScript,
    handleOpenImportText2Scene,
    handleOpenAiText2Scene,
    handleCloseText2Scene,
  };
}
