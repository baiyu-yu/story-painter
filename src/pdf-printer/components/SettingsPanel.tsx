import React, { useState } from 'react';
import { PDFSettings, ThemeType, Character } from '../types';
import { themeStyles } from './templates/styles';
import { compressImage } from '../utils/imageOptimizer';

interface Props {
    settings: PDFSettings;
    onChange: (settings: PDFSettings) => void;
}

export const SettingsPanel: React.FC<Props> = ({ settings, onChange }) => {
    const [isOptimizing, setIsOptimizing] = useState(false);
    
    const handleChange = (key: keyof PDFSettings, value: any) => {
        onChange({ ...settings, [key]: value });
    };

    const handleCharacterChange = (index: number, key: keyof Character, value: any) => {
        const newChars = [...settings.characters];
        newChars[index] = { ...newChars[index], [key]: value };
        onChange({ ...settings, characters: newChars });
    };

    const handleAttributeChange = (charIndex: number, attrIndex: number, key: 'label' | 'value', value: string) => {
        const newChars = [...settings.characters];
        const newAttrs = [...newChars[charIndex].attributes];
        newAttrs[attrIndex] = { ...newAttrs[attrIndex], [key]: value };
        newChars[charIndex].attributes = newAttrs;
        onChange({ ...settings, characters: newChars });
    };

    const addAttribute = (charIndex: number) => {
        const newChars = [...settings.characters];
        newChars[charIndex].attributes.push({ label: '新属性', value: '' });
        onChange({ ...settings, characters: newChars });
    };

    const removeAttribute = (charIndex: number, attrIndex: number) => {
        const newChars = [...settings.characters];
        newChars[charIndex].attributes.splice(attrIndex, 1);
        onChange({ ...settings, characters: newChars });
    };

    const handleAvatarUpload = (index: number, file: File) => {
        const reader = new FileReader();
        reader.onload = async (e) => {
            const raw = e.target?.result as string;
            // Compress on upload
            const compressed = await compressImage(raw, settings.imageQuality || 0.7);
            handleCharacterChange(index, 'avatar', compressed);
        };
        reader.readAsDataURL(file);
    };

    const optimizeAllImages = async () => {
        if (!confirm('这将压缩所有角色头像以减小文件体积。原图将被替换。确定继续吗？')) return;
        
        setIsOptimizing(true);
        try {
            const newChars = [...settings.characters];
            let count = 0;
            for (let i = 0; i < newChars.length; i++) {
                if (newChars[i].avatar) {
                    newChars[i].avatar = await compressImage(newChars[i].avatar!, settings.imageQuality || 0.7);
                    count++;
                }
            }
            onChange({ ...settings, characters: newChars });
            alert(`优化完成！已压缩 ${count} 张图片。`);
        } catch (error) {
            console.error(error);
            alert('优化过程中出错');
        } finally {
            setIsOptimizing(false);
        }
    };

    return (
        <div className="flex flex-col gap-4 p-4 h-full overflow-y-auto bg-[#f8f8f8] text-sm hand-drawn-box" style={{ borderRadius: 0, border: 'none', borderRight: '2px solid #555' }}>
            <h2 className="font-bold text-lg border-b-2 border-dashed border-gray-400 pb-2 mb-2" style={{ fontFamily: 'Comic Sans MS, cursive' }}>PDF 设置</h2>
            
            {/* Basic Settings */}
            <div className="flex flex-col gap-2">
                <label className="font-bold">主题风格</label>
                <select 
                    className="hand-drawn-select"
                    value={settings.theme} 
                    onChange={e => handleChange('theme', e.target.value)}
                >
                    <option value="dnd">龙与地下城 (DND)</option>
                    <option value="coc">克苏鲁 (COC)</option>
                    <option value="cyberpunk">赛博朋克 (Cyberpunk)</option>
                    <option value="japanese">日式清新 (Japanese)</option>
                    <option value="ancient">中式古风 (Ancient)</option>
                    <option value="minimalist">极简主义 (Minimalist)</option>
                    <option value="terminal">终端风格 (Terminal)</option>
                    <option value="script">剧本/台本 (Script)</option>
                    <option value="office">办公文档 (Office)</option>
                    <option value="magazine">杂志版式 (Magazine)</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-bold">页面尺寸</label>
                <select 
                    className="hand-drawn-select"
                    value={settings.pageSize} 
                    onChange={e => handleChange('pageSize', e.target.value)}
                >
                    <option value="A4">A4</option>
                    <option value="LETTER">Letter</option>
                </select>
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-bold">标题</label>
                <input 
                    className="hand-drawn-input"
                    type="text" 
                    value={settings.title} 
                    onChange={e => handleChange('title', e.target.value)} 
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-bold">模组名称</label>
                <input 
                    className="hand-drawn-input"
                    type="text" 
                    value={settings.moduleName} 
                    onChange={e => handleChange('moduleName', e.target.value)} 
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-bold">简介/前言</label>
                <textarea 
                    className="hand-drawn-textarea"
                    rows={3}
                    value={settings.intro} 
                    onChange={e => handleChange('intro', e.target.value)} 
                />
            </div>

            <div className="flex flex-col gap-2">
                <label className="font-bold">图片质量 ({Math.round((settings.imageQuality || 0.7) * 100)}%)</label>
                <input 
                    type="range" 
                    min="0.1" 
                    max="1.0" 
                    step="0.1"
                    className="w-full accent-gray-700"
                    value={settings.imageQuality || 0.7} 
                    onChange={e => handleChange('imageQuality', parseFloat(e.target.value))} 
                />
                <span className="text-xs text-gray-500">降低质量可显著减小PDF体积</span>
                <button 
                    onClick={optimizeAllImages}
                    disabled={isOptimizing}
                    className={`mt-2 py-1 px-3 text-white rounded text-xs transition-colors ${isOptimizing ? 'bg-gray-400 cursor-not-allowed' : 'bg-blue-600 hover:bg-blue-700'}`}
                >
                    {isOptimizing ? '正在压缩...' : '压缩所有现有图片'}
                </button>
            </div>

            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    className="accent-gray-700"
                    checked={settings.showOb} 
                    onChange={e => handleChange('showOb', e.target.checked)} 
                />
                <label>显示场外(OB)评论</label>
            </div>

            <div className="flex items-center gap-2">
                <input 
                    type="checkbox" 
                    className="accent-gray-700"
                    checked={settings.showAvatarInLog} 
                    onChange={e => handleChange('showAvatarInLog', e.target.checked)} 
                />
                <label>在正文中显示头像</label>
            </div>

            {/* Character Settings */}
            <div className="border-t-2 border-dashed border-gray-400 pt-2 mt-2">
                <h3 className="font-bold mb-2">角色卡设置 ({settings.characters.length})</h3>
                {settings.characters.map((char, index) => (
                    <div key={index} className="hand-drawn-box p-3 mb-3 relative bg-white">
                        <div className="font-bold mb-2 flex justify-between items-center border-b border-gray-200 pb-1">
                            <span>{char.name}</span>
                            <div className="w-4 h-4 rounded-full border border-gray-400" style={{ backgroundColor: char.color }}></div>
                        </div>
                        
                        <div className="flex flex-col gap-2">
                            <label className="text-xs font-bold text-gray-600">头像</label>
                            <input type="file" className="text-xs" accept="image/*" onChange={e => e.target.files && handleAvatarUpload(index, e.target.files[0])} />
                            {char.avatar && <img src={char.avatar} className="w-16 h-16 object-cover rounded border border-gray-300 shadow-sm" />}
                            
                            <label className="text-xs font-bold text-gray-600">角色类型</label>
                            <select 
                                className="hand-drawn-select text-xs py-1"
                                value={char.roleType}
                                onChange={e => handleCharacterChange(index, 'roleType', e.target.value)}
                            >
                                <option value="player">玩家</option>
                                <option value="host">主持人(KP/DM)</option>
                                <option value="ob">OB/观众</option>
                                <option value="dice">骰子/系统</option>
                            </select>

                            <label className="text-xs font-bold text-gray-600">职业/身份</label>
                            <input className="hand-drawn-input text-xs py-1" value={char.class || ''} onChange={e => handleCharacterChange(index, 'class', e.target.value)} />

                            <label className="text-xs font-bold text-gray-600">背景故事</label>
                            <textarea className="hand-drawn-textarea text-xs" rows={2} value={char.background || ''} onChange={e => handleCharacterChange(index, 'background', e.target.value)} />
                            
                            <div className="bg-gray-50 p-2 rounded border border-gray-200 mt-1">
                                <div className="flex justify-between items-center mb-1">
                                    <span className="font-bold text-xs">属性</span>
                                    <button className="text-xs bg-gray-600 text-white px-2 py-0.5 rounded hover:bg-gray-800 transition-colors" onClick={() => addAttribute(index)}>+</button>
                                </div>
                                {char.attributes.map((attr, attrIndex) => (
                                    <div key={attrIndex} className="flex gap-1 mb-1">
                                        <input className="hand-drawn-input text-xs p-1 w-1/3" value={attr.label} onChange={e => handleAttributeChange(index, attrIndex, 'label', e.target.value)} placeholder="属性名" />
                                        <input className="hand-drawn-input text-xs p-1 w-1/3" value={attr.value} onChange={e => handleAttributeChange(index, attrIndex, 'value', e.target.value)} placeholder="值" />
                                        <button className="text-red-500 px-1 hover:text-red-700" onClick={() => removeAttribute(index, attrIndex)}>x</button>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};
