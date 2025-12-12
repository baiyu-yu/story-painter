export interface LogItem {
    id: string;
    nickname: string;
    imUserId: string;
    time: string;
    message: string;
    isDice: boolean;
    isOther?: boolean; // Added isOther
    commandId?: number;
}

export type RoleType = 'host' | 'player' | 'ob' | 'dice';

export interface Character {
    name: string;
    avatar?: string; // Data URL
    attributes: { label: string; value: string }[]; 
    class?: string; // Profession / Nationality
    background?: string;
    color: string;
    roleType: RoleType; // Added roleType
    // Optional
    abilities?: string;
    equipment?: string;
    relations?: string;
}

export type ThemeType = 'dnd' | 'coc' | 'cyberpunk' | 'japanese' | 'ancient' | 'minimalist' | 'terminal' | 'script' | 'office' | 'magazine';

export interface PDFSettings {
    theme: ThemeType;
    pageSize: 'A4' | 'LETTER';
    showOb: boolean; // Show OB comments?
    obDensity: 'low' | 'medium' | 'high';
    title: string;
    moduleName: string;
    intro: string;
    characters: Character[];
    showAvatarInLog: boolean; // New: Show avatar in log
    sceneBreaks: string; // New: Text content for scene structure
    imageQuality: number; // 0.1 to 1.0
}

export const defaultSettings: PDFSettings = {
    theme: 'dnd',
    pageSize: 'A4',
    showOb: true,
    obDensity: 'medium',
    title: '跑团日志',
    moduleName: '未命名模组',
    intro: '这是一个精彩的冒险故事...',
    characters: [],
    showAvatarInLog: true,
    sceneBreaks: '',
    imageQuality: 0.7
};
