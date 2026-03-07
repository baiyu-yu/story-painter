import React from 'react';
import { Page, Text, View, Document, StyleSheet, Image, Font } from '@react-pdf/renderer';
import { LogItem, PDFSettings, Character } from '../types';
import { getThemeStyle, ThemeKey } from './templates/styles';
import { msgAtFormat, msgCommandFormat, msgIMUseridFormat, msgOffTopicFormat, msgImageFormat, escapeHTML } from '../../utils';

export const PDFDocument = ({ data, settings }: { data: LogItem[], settings: PDFSettings }) => {
    const theme = getThemeStyle(settings.theme);
    const t = theme as any;
    
    const getRadius = (val: any, defaultVal: number = 0) => {
        const v = typeof val === 'number' ? val : defaultVal;
        return v <= 0 ? 0.1 : v;
    };

    const styles = StyleSheet.create({
        page: {
            padding: 0,
            backgroundColor: theme.pageBackground,
            fontFamily: t.bodyFontFamily || theme.fontFamily,
            color: theme.textColor,
            fontSize: 12
        },
        borderContainer: {
            ...(t.showPageBorder ? {
                borderWidth: theme.borderWidth,
                borderStyle: (theme as any).borderStyle || 'solid',
                borderColor: theme.borderColor,
            } : {}),
            height: '100%',
            padding: t.pagePadding || 24,
            margin: '1.2cm',
            display: 'flex',
            flexDirection: 'column',
            flex: 1,
            position: 'relative'
        },
        charPageContainer: {
            ...(t.showPageBorder ? {
                borderWidth: theme.borderWidth,
                borderStyle: (theme as any).borderStyle || 'solid',
                borderColor: theme.borderColor,
            } : {}),
            padding: t.pagePadding || 24,
            margin: '1.2cm',
            display: 'flex',
            flexDirection: 'column',
            flexGrow: 1,
            position: 'relative'
        },
        fixedBg: {
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            opacity: 0.08,
            objectFit: 'cover'
        },
        coverTitle: {
            fontSize: 40,
            textAlign: t.headerAlign || 'center',
            color: theme.primaryColor,
            fontWeight: 'bold',
            fontFamily: t.headingFontFamily || theme.fontFamily,
        },
        coverSubtitle: {
            textAlign: t.headerAlign || 'center',
            fontSize: 20,
            marginTop: 12,
            color: theme.secondaryColor
        },
        coverIntro: {
            marginTop: 40,
            fontSize: 14,
            textAlign: 'center',
            lineHeight: 1.5
        },
        sectionTitle: {
            fontSize: 24,
            color: theme.primaryColor,
            marginBottom: 16,
            ...(t.layoutType !== 'modern' ? {
                borderBottomWidth: 1,
                borderBottomStyle: 'solid' as const,
                borderBottomColor: theme.primaryColor
            } : {}),
            paddingBottom: 5,
            textAlign: t.headerAlign || 'left',
            backgroundColor: t.layoutType === 'modern' ? `${theme.primaryColor}1A` : 'transparent', // 10% opacity hex
            padding: t.layoutType === 'modern' ? 8 : 0,
        },
        charCard: {
            marginBottom: 20,
            padding: 16,
            borderWidth: 1,
            borderStyle: t.charCard?.borderStyle || 'dashed',
            borderColor: theme.secondaryColor,
            backgroundColor: t.charCard?.bg || 'transparent',
            borderRadius: getRadius(t.charCard?.borderRadius, 0)
        },
        charName: {
            fontSize: 20,
            fontWeight: 'bold',
            color: theme.primaryColor
        },
        charAttr: {
            flexDirection: 'row',
            flexWrap: 'wrap',
            marginTop: 10
        },
        attrItem: {
            width: '33%',
            fontSize: 10,
            marginBottom: 5
        },
        logContainer: {
            flexDirection: 'column',
        },
        logTwoCol: {
            flexDirection: 'column'
        },
        logRow: {
            flexDirection: 'row',
            marginBottom: 12
        },
        logColumnMain: {
            width: settings.showOb ? '75%' : '100%',
            paddingRight: 12
        },
        logColumnOb: {
            width: '25%',
            paddingLeft: 8,
            ...(t.layoutType !== 'clean' ? {
                borderLeftWidth: 1,
                borderLeftStyle: 'solid' as const,
                borderLeftColor: '#ccc'
            } : {}),
            alignItems: 'flex-end'
        },
        logBlock: {
            width: '100%',
            borderWidth: 1,
            borderStyle: 'solid',
            borderColor: '#ddd',
            borderRadius: 4,
            padding: 8,
            marginBottom: 12,
            flexDirection: 'row',
            alignItems: 'flex-start',
            minHeight: 48
        },
        logName: {
            fontWeight: 'bold',
            marginBottom: 2,
            fontSize: 11
        },
        logMessage: {
            lineHeight: 1.4
        },
        logContent: {
            flex: 1
        },
        logObBlock: {
            backgroundColor: '#f7f7f7'
        },
        avatar: {
            width: 30,
            height: 30,
            borderRadius: 15,
            marginRight: 10,
            objectFit: 'cover'
        },
        avatarPlaceholder: {
            width: 30,
            height: 30,
            borderRadius: 15,
            marginRight: 10,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: '#ccc'
        },
        avatarPlaceholderText: {
            fontSize: 10,
            color: '#fff',
            fontWeight: 'bold'
        },
        diceLog: {
            color: '#666',
            fontSize: 10,
            backgroundColor: t.layoutType === 'immersive' ? '#333' : '#f0f0f0',
            padding: 5,
            borderRadius: 4
        },
        // Decorations
        cornerTL: {
            position: 'absolute',
            top: -10,
            left: -10,
            width: 40,
            height: 40,
            borderTopWidth: 3,
            borderTopStyle: 'solid' as const,
            borderTopColor: t.decorationColor,
            borderLeftWidth: 3,
            borderLeftStyle: 'solid' as const,
            borderLeftColor: t.decorationColor,
        },
        cornerTR: {
            position: 'absolute',
            top: -10,
            right: -10,
            width: 40,
            height: 40,
            borderTopWidth: 3,
            borderTopStyle: 'solid' as const,
            borderTopColor: t.decorationColor,
            borderRightWidth: 3,
            borderRightStyle: 'solid' as const,
            borderRightColor: t.decorationColor,
        },
        cornerBL: {
            position: 'absolute',
            bottom: -10,
            left: -10,
            width: 40,
            height: 40,
            borderBottomWidth: 3,
            borderBottomStyle: 'solid' as const,
            borderBottomColor: t.decorationColor,
            borderLeftWidth: 3,
            borderLeftStyle: 'solid' as const,
            borderLeftColor: t.decorationColor,
        },
        cornerBR: {
            position: 'absolute',
            bottom: -10,
            right: -10,
            width: 40,
            height: 40,
            borderBottomWidth: 3,
            borderBottomStyle: 'solid' as const,
            borderBottomColor: t.decorationColor,
            borderRightWidth: 3,
            borderRightStyle: 'solid' as const,
            borderRightColor: t.decorationColor,
        },
        sidebarStrip: {
            position: 'absolute',
            top: 0,
            right: 0,
            bottom: 0,
            width: 10,
            backgroundColor: t.decorationColor,
            opacity: 0.5
        },
        watermark: {
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%) rotate(-45deg)',
            fontSize: 100,
            color: t.decorationColor,
            opacity: 0.05,
            zIndex: -1
        }
    });

    const RenderDecorations = ({ fixed = false }: { fixed?: boolean }) => {
        if (t.decorationType === 'corner-ornaments') {
            return (
                <>
                    <View style={styles.cornerTL} fixed={fixed} />
                    <View style={styles.cornerTR} fixed={fixed} />
                    <View style={styles.cornerBL} fixed={fixed} />
                    <View style={styles.cornerBR} fixed={fixed} />
                </>
            );
        }
        if (t.decorationType === 'sidebar-strip') {
            return <View style={styles.sidebarStrip} fixed={fixed} />;
        }
        if (t.decorationType === 'watermark-pattern') {
            // Since we can't easily tile a pattern without an image, we'll use a large text or shape
            return (
                <Text style={styles.watermark} fixed={fixed}>{t.watermarkText || 'Story'}</Text>
            );
        }
        if (t.decorationType === 'top-bottom-border') {
            return (
                <>
                    <View style={{ position: 'absolute', top: 0, left: 40, right: 40, height: 4, backgroundColor: t.decorationColor }} fixed={fixed} />
                    <View style={{ position: 'absolute', bottom: 0, left: 40, right: 40, height: 4, backgroundColor: t.decorationColor }} fixed={fixed} />
                </>
            );
        }
        return null;
    };

    // Helper to get character
    const getCharacter = (name: string) => {
        return settings.characters.find(c => c.name === name);
    };

    // Helper to get character color
    // const getCharColor = (name: string) => {
    //     const char = getCharacter(name);
    //     return char ? char.color : theme.primaryColor;
    // };

    const RenderCharacterCard = ({ char }: { char: Character }) => {
        
        const renderExtendedInfo = (customStyle?: any, titleStyle?: any) => (
             <>
                {(char.background) && (
                    <View wrap={false} style={{ marginTop: 15, marginBottom: 5 }}>
                         <Text style={titleStyle || { fontSize: 14, fontWeight: 'bold', color: theme.primaryColor }}>
                            {settings.theme === 'ancient' ? '生平' : 'Background'}
                         </Text>
                    </View>
                )}
                {(char.background) && (
                     <Text style={customStyle || { fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{char.background}</Text>
                )}

                {(char.abilities) && (
                    <View wrap={false} style={{ marginTop: 15, marginBottom: 5 }}>
                         <Text style={titleStyle || { fontSize: 14, fontWeight: 'bold', color: theme.primaryColor }}>
                            {settings.theme === 'ancient' ? '能力' : 'Abilities'}
                         </Text>
                    </View>
                )}
                {(char.abilities) && (
                     <Text style={customStyle || { fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{char.abilities}</Text>
                )}

                {(char.equipment) && (
                    <View wrap={false} style={{ marginTop: 15, marginBottom: 5 }}>
                        <Text style={titleStyle || { fontSize: 14, fontWeight: 'bold', color: theme.primaryColor }}>
                            {settings.theme === 'ancient' ? '装备' : 'Equipment'}
                        </Text>
                    </View>
                )}
                {(char.equipment) && (
                     <Text style={customStyle || { fontSize: 12, lineHeight: 1.5, marginBottom: 10 }}>{char.equipment}</Text>
                )}
            </>
        );

        // 1. DND (Classic Parchment)
        if (settings.theme === 'dnd') {
            return (
                <View style={styles.charCard}>
                    <Text style={{ fontSize: 24, fontFamily: t.headingFontFamily, color: theme.primaryColor, borderBottomWidth: 2, borderBottomColor: theme.secondaryColor, marginBottom: 15, paddingBottom: 5 }}>
                        {char.name}
                    </Text>
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        {char.avatar ? (
                            <Image src={char.avatar} style={{ width: 100, height: 100, borderRadius: 10, marginRight: 20, objectFit: 'cover', border: `2px solid ${theme.secondaryColor}` }} />
                        ) : (
                            <View style={{ width: 100, height: 100, borderRadius: 10, marginRight: 20, backgroundColor: char.color, alignItems: 'center', justifyContent: 'center', border: `2px solid ${theme.secondaryColor}` }}>
                                <Text style={{ fontSize: 40, color: '#fff' }}>{char.name.charAt(0)}</Text>
                            </View>
                        )}
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 12, marginBottom: 5 }}>Class & Level: <Text style={{ fontWeight: 'bold' }}>{char.class || 'Unknown'}</Text></Text>
                            {/* Removed summary background to avoid duplication */}
                        </View>
                    </View>
                    <View style={{ backgroundColor: '#fdf6e3', padding: 10, borderWidth: 1, borderColor: '#ccc', marginBottom: 10 }}>
                        <Text style={{ fontSize: 14, fontWeight: 'bold', marginBottom: 5, color: theme.primaryColor }}>Stats</Text>
                        <View style={styles.charAttr}>
                            {char.attributes.map((attr, i) => (
                                <Text key={i} style={styles.attrItem}>{attr.label}: {attr.value}</Text>
                            ))}
                        </View>
                    </View>
                    {renderExtendedInfo()}
                </View>
            );
        }

        // 2. COC (Investigator File)
        if (settings.theme === 'coc') {
            return (
                <View style={styles.charCard}>
                     <View style={{ position: 'absolute', top: 0, right: 0, padding: 5, backgroundColor: '#333', transform: 'rotate(5deg)' }}>
                        <Text style={{ color: '#fff', fontSize: 10 }}>CONFIDENTIAL</Text>
                    </View>
                    <Text style={styles.sectionTitle}>INVESTIGATOR PROFILE</Text>
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                         <View style={{ width: 100, marginRight: 20 }}>
                            {char.avatar ? (
                                <Image src={char.avatar} style={{ width: 100, height: 120, objectFit: 'cover', borderWidth: 4, borderColor: '#fff', transform: 'rotate(-2deg)' }} />
                            ) : (
                                <View style={{ width: 100, height: 120, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center', transform: 'rotate(-2deg)' }}>
                                    <Text style={{ fontSize: 40, color: '#fff' }}>?</Text>
                                </View>
                            )}
                             <View style={{ position: 'absolute', bottom: -10, left: 20, width: 60, height: 20, backgroundColor: 'rgba(255,0,0,0.5)' }} />
                        </View>
                        <View style={{ flex: 1, borderLeftWidth: 1, borderLeftColor: '#ccc', paddingLeft: 20 }}>
                            <Text style={{ fontSize: 24, fontFamily: t.headingFontFamily, color: theme.textColor, marginBottom: 5 }}>{char.name}</Text>
                            <Text style={{ fontSize: 12, color: theme.primaryColor, marginBottom: 15 }}>Occupation: {char.class || 'Unknown'}</Text>
                            <View style={{ borderTopWidth: 1, borderTopColor: '#444', paddingTop: 10 }}>
                                <View style={styles.charAttr}>
                                    {char.attributes.map((attr, i) => (
                                        <Text key={i} style={styles.attrItem}>{attr.label}: {attr.value}</Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                    {renderExtendedInfo({ color: theme.textColor, fontSize: 12, lineHeight: 1.4 }, { fontSize: 14, fontFamily: t.headingFontFamily, color: theme.primaryColor })}
                </View>
            );
        }

        // 3. Cyberpunk (Digital ID)
        if (settings.theme === 'cyberpunk') {
             return (
                <View style={styles.charCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20, borderBottomWidth: 2, borderBottomColor: theme.primaryColor, paddingBottom: 10 }}>
                        <Text style={{ fontSize: 24, fontFamily: t.headingFontFamily, color: theme.primaryColor, marginRight: 10 }}>{char.name}</Text>
                        <Text style={{ fontSize: 12, color: theme.secondaryColor, backgroundColor: '#111', padding: 4 }}>{char.class || 'NETRUNNER'}</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                         <View style={{ width: 100, height: 100, marginRight: 20, borderWidth: 2, borderColor: theme.primaryColor, borderStyle: 'dashed' }}>
                            {char.avatar ? (
                                <Image src={char.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <View style={{ flex: 1, backgroundColor: '#000', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: theme.primaryColor }}>NO IMG</Text>
                                </View>
                            )}
                         </View>
                         <View style={{ flex: 1, backgroundColor: 'rgba(0, 243, 255, 0.05)', padding: 10 }}>
                             <Text style={{ color: theme.primaryColor, fontSize: 12, marginBottom: 5 }}>// STATS_DUMP</Text>
                             <View style={styles.charAttr}>
                                {char.attributes.map((attr, i) => (
                                    <Text key={i} style={{ ...styles.attrItem, color: '#eee' }}>{attr.label}: <Text style={{ color: theme.secondaryColor }}>{attr.value}</Text></Text>
                                ))}
                            </View>
                         </View>
                    </View>
                    <View style={{ borderTopWidth: 1, borderTopColor: theme.secondaryColor, paddingTop: 10 }}>
                        {renderExtendedInfo({ color: theme.textColor, fontFamily: 'ArkPixel' }, { color: theme.primaryColor, fontFamily: 'ArkPixel' })}
                    </View>
                </View>
            );
        }

        // 4. Japanese (Horizontal Scroll)
        if (settings.theme === 'japanese') {
            return (
                <View style={styles.charCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'flex-start', marginBottom: 20 }}>
                        <View style={{ width: 120, height: 120, borderRadius: 60, overflow: 'hidden', borderWidth: 4, borderColor: '#fff5f8', marginRight: 30 }}>
                             {char.avatar ? (
                                <Image src={char.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <View style={{ flex: 1, backgroundColor: char.color, alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 40, color: '#fff' }}>{char.name.charAt(0)}</Text>
                                </View>
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ fontSize: 28, fontFamily: t.headingFontFamily, color: theme.primaryColor, marginBottom: 10 }}>{char.name}</Text>
                            <Text style={{ fontSize: 14, color: '#888', marginBottom: 20 }}>{char.class || '旅人'}</Text>
                            <View style={{ backgroundColor: '#fff', padding: 15, borderRadius: 10 }}>
                                 <View style={styles.charAttr}>
                                    {char.attributes.map((attr, i) => (
                                        <Text key={i} style={styles.attrItem}>{attr.label}: {attr.value}</Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                    {renderExtendedInfo(undefined, { fontSize: 16, fontFamily: t.headingFontFamily, color: theme.primaryColor })}
                </View>
            );
        }

        // 5. Ancient (Scroll/Ink)
        if (settings.theme === 'ancient') {
             return (
                <View style={styles.charCard}>
                    <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderBottomColor: theme.secondaryColor, paddingBottom: 15, marginBottom: 15 }}>
                         <View style={{ width: 100, height: 120, borderWidth: 1, borderColor: '#5d4037', padding: 2, marginRight: 20 }}>
                             {char.avatar ? (
                                <Image src={char.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <View style={{ flex: 1, backgroundColor: '#f5e3a6', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ fontSize: 40, color: theme.textColor }}>{char.name.charAt(0)}</Text>
                                </View>
                            )}
                         </View>
                         <View style={{ flex: 1, justifyContent: 'center' }}>
                             <Text style={{ fontSize: 32, fontFamily: t.headingFontFamily, color: theme.primaryColor, marginBottom: 10 }}>{char.name}</Text>
                             <Text style={{ fontSize: 16, fontFamily: t.bodyFontFamily, color: theme.secondaryColor }}>
                                <Text style={{ fontFamily: t.headingFontFamily }}>身份：</Text>{char.class || '侠客'}
                             </Text>
                         </View>
                    </View>
                    <View style={{ padding: 10, marginBottom: 10 }}>
                        <View style={styles.charAttr}>
                            {char.attributes.map((attr, i) => (
                                <Text key={i} style={{ ...styles.attrItem, fontFamily: t.bodyFontFamily, fontSize: 14 }}>
                                    <Text style={{ fontFamily: t.headingFontFamily }}>{attr.label}:</Text> {attr.value}
                                </Text>
                            ))}
                        </View>
                    </View>
                    {renderExtendedInfo(
                        { fontFamily: t.bodyFontFamily, fontSize: 14, color: theme.textColor, lineHeight: 1.6 },
                        { fontFamily: t.headingFontFamily, fontSize: 18, color: theme.primaryColor }
                    )}
                </View>
            );
        }

        // 6. Minimalist (Clean Card)
        if (settings.theme === 'minimalist') {
             return (
                <View style={styles.charCard}>
                    <View style={{ flexDirection: 'row', alignItems: 'center', marginBottom: 20 }}>
                        {char.avatar && <Image src={char.avatar} style={{ width: 60, height: 60, borderRadius: 30, marginRight: 20, objectFit: 'cover' }} />}
                        <View>
                            <Text style={{ fontSize: 24, fontWeight: 'bold', color: '#000' }}>{char.name}</Text>
                            <Text style={{ fontSize: 12, color: '#888', textTransform: 'uppercase' }}>{char.class}</Text>
                        </View>
                    </View>
                    <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 20, marginBottom: 20 }}>
                        <View style={styles.charAttr}>
                            {char.attributes.map((attr, i) => (
                                <Text key={i} style={{ ...styles.attrItem, color: '#444' }}>{attr.label} <Text style={{ fontWeight: 'bold' }}>{attr.value}</Text></Text>
                            ))}
                        </View>
                    </View>
                    {renderExtendedInfo()}
                </View>
            );
        }
        
        // 7. Terminal (User Profile)
        if (settings.theme === 'terminal') {
             return (
                <View style={styles.charCard}>
                    <Text style={{ color: theme.primaryColor, marginBottom: 10 }}>&gt; USER_PROFILE --target "{char.name}"</Text>
                    <View style={{ flexDirection: 'row', border: `1px solid ${theme.primaryColor}`, padding: 10, marginBottom: 20 }}>
                        <View style={{ width: 80, height: 80, backgroundColor: '#000', border: `1px solid ${theme.primaryColor}`, marginRight: 20, alignItems: 'center', justifyContent: 'center' }}>
                             {char.avatar ? (
                                <Image src={char.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.8 }} />
                            ) : (
                                <Text style={{ color: theme.primaryColor }}>NO_DATA</Text>
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <Text style={{ color: theme.primaryColor, fontSize: 18, marginBottom: 5 }}>NAME: {char.name}</Text>
                            <Text style={{ color: theme.secondaryColor, fontSize: 12, marginBottom: 10 }}>CLASS: {char.class || 'UNKNOWN'}</Text>
                            <View style={{ flexDirection: 'row', flexWrap: 'wrap' }}>
                                {char.attributes.map((attr, i) => (
                                    <Text key={i} style={{ color: '#eee', fontSize: 10, width: '50%' }}>[{attr.label}] ..... {attr.value}</Text>
                                ))}
                            </View>
                        </View>
                    </View>
                    {renderExtendedInfo({ color: theme.secondaryColor, fontFamily: 'Noto Sans Mono CJK SC' }, { color: theme.primaryColor, fontFamily: 'Noto Sans Mono CJK SC' })}
                </View>
            );
        }

        // 8. Script (Cast List)
        if (settings.theme === 'script') {
            return (
                <View style={styles.charCard}>
                    <Text style={{ textAlign: 'center', fontSize: 20, fontWeight: 'bold', marginBottom: 10, textDecoration: 'underline' }}>{char.name}</Text>
                    <Text style={{ textAlign: 'center', fontSize: 12, marginBottom: 20 }}>({char.class})</Text>
                    
                    <View style={{ alignItems: 'center', marginBottom: 20 }}>
                         {char.avatar && <Image src={char.avatar} style={{ width: 100, height: 100, borderRadius: 50, objectFit: 'cover' }} />}
                    </View>

                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'center', marginBottom: 20, borderTopWidth: 1, borderTopColor: '#ccc', borderBottomWidth: 1, borderBottomColor: '#ccc', paddingVertical: 10 }}>
                         {char.attributes.map((attr, i) => (
                            <Text key={i} style={{ fontSize: 10, marginHorizontal: 5 }}>{attr.label}: {attr.value}</Text>
                        ))}
                    </View>

                    {renderExtendedInfo({ textAlign: 'center', lineHeight: 1.5 }, { textAlign: 'center', fontWeight: 'bold', textDecoration: 'underline' })}
                </View>
            );
        }

        // 9. Office (Personnel Record)
        if (settings.theme === 'office') {
             return (
                <View style={styles.charCard}>
                    <View style={{ backgroundColor: '#f0f0f0', padding: 10, borderBottomWidth: 1, borderBottomColor: '#ccc', marginBottom: 15 }}>
                        <Text style={{ fontSize: 12, fontWeight: 'bold', color: '#555' }}>PERSONNEL RECORD</Text>
                    </View>
                    <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                        <View style={{ width: 100, marginRight: 20 }}>
                             {char.avatar ? (
                                <Image src={char.avatar} style={{ width: 100, height: 120, objectFit: 'cover', borderWidth: 1, borderColor: '#ccc' }} />
                            ) : (
                                <View style={{ width: 100, height: 120, backgroundColor: '#eee', borderWidth: 1, borderColor: '#ccc', alignItems: 'center', justifyContent: 'center' }}>
                                    <Text style={{ color: '#aaa' }}>PHOTO</Text>
                                </View>
                            )}
                        </View>
                        <View style={{ flex: 1 }}>
                            <View style={{ flexDirection: 'row', marginBottom: 10 }}>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, color: '#888' }}>NAME</Text>
                                    <Text style={{ fontSize: 16, fontWeight: 'bold' }}>{char.name}</Text>
                                </View>
                                <View style={{ flex: 1 }}>
                                    <Text style={{ fontSize: 10, color: '#888' }}>POSITION</Text>
                                    <Text style={{ fontSize: 14 }}>{char.class || 'N/A'}</Text>
                                </View>
                            </View>
                            <View style={{ borderTopWidth: 1, borderTopColor: '#eee', paddingTop: 10 }}>
                                <Text style={{ fontSize: 10, color: '#888', marginBottom: 5 }}>ATTRIBUTES</Text>
                                <View style={styles.charAttr}>
                                    {char.attributes.map((attr, i) => (
                                        <Text key={i} style={styles.attrItem}>{attr.label}: {attr.value}</Text>
                                    ))}
                                </View>
                            </View>
                        </View>
                    </View>
                    {renderExtendedInfo()}
                </View>
            );
        }

        // 10. Magazine (Feature)
        if (settings.theme === 'magazine') {
             return (
                <View style={styles.charCard}>
                    <View style={{ flexDirection: 'row', height: 150, marginBottom: 20 }}>
                        <View style={{ flex: 1, paddingRight: 20, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 36, fontWeight: 'bold', color: theme.primaryColor, lineHeight: 0.9 }}>{char.name}</Text>
                            <Text style={{ fontSize: 18, color: theme.secondaryColor, marginTop: 5 }}>{char.class}</Text>
                        </View>
                        <View style={{ width: 150 }}>
                             {char.avatar ? (
                                <Image src={char.avatar} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <View style={{ width: '100%', height: '100%', backgroundColor: theme.primaryColor }} />
                            )}
                        </View>
                    </View>
                    <View style={{ flexDirection: 'row', flexWrap: 'wrap', borderTopWidth: 4, borderTopColor: theme.secondaryColor, paddingTop: 15, marginBottom: 20 }}>
                         {char.attributes.map((attr, i) => (
                            <View key={i} style={{ width: '50%', marginBottom: 10, paddingRight: 10 }}>
                                <Text style={{ fontSize: 10, fontWeight: 'bold', color: '#888' }}>{attr.label.toUpperCase()}</Text>
                                <Text style={{ fontSize: 14 }}>{attr.value}</Text>
                            </View>
                        ))}
                    </View>
                    {renderExtendedInfo()}
                </View>
            );
        }

        // Default Fallback
        return (
            <View style={styles.charCard}>
                <Text style={styles.sectionTitle}>角色档案</Text>
                <View style={{ flexDirection: 'row', marginBottom: 20 }}>
                    {char.avatar ? (
                        <Image src={char.avatar} style={{ width: 100, height: 100, borderRadius: 10, marginRight: 20, objectFit: 'cover' }} />
                    ) : (
                        <View style={{ width: 100, height: 100, borderRadius: 10, marginRight: 20, backgroundColor: char.color, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 40, color: '#fff' }}>{char.name.charAt(0)}</Text>
                        </View>
                    )}
                    <View>
                        <Text style={styles.charName}>{char.name}</Text>
                        <Text style={{ fontSize: 12, marginTop: 5 }}>职业/身份: {char.class || '未知'}</Text>
                    </View>
                </View>

                <Text style={{ fontSize: 14, fontWeight: 'bold', marginTop: 10, marginBottom: 5 }}>属性</Text>
                <View style={styles.charAttr}>
                    {char.attributes.map((attr, i) => (
                        <Text key={i} style={styles.attrItem}>{attr.label}: {attr.value}</Text>
                    ))}
                </View>

                {renderExtendedInfo()}
            </View>
        );
    };

    // Helper to get character color
    const getCharColor = (name: string) => {
        const char = getCharacter(name);
        return char ? char.color : theme.primaryColor;
    };

    const VerticalText = ({ text, style }: { text: string, style?: any }) => {
        if (!text) return null;
        return (
            <View style={{ flexDirection: 'row', flexWrap: 'wrap', width: 40, ...style }}>
                {text.split('').map((char, i) => (
                    <Text key={i} style={{ fontSize: 32, lineHeight: 1, marginBottom: 5, textAlign: 'center', width: '100%' }}>{char}</Text>
                ))}
            </View>
        );
    };

    const RenderCover = () => {
        // Common elements
        const bg = t.backgroundImage ? <Image src={t.backgroundImage} style={styles.fixedBg} fixed /> : null;
        
        // 1. DND (Classic)
        if (settings.theme === 'dnd') {
            return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                        <RenderDecorations />
                        <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', border: `2px solid ${theme.primaryColor}`, margin: 40, padding: 20 }}>
                            <Text style={{ fontSize: 60, fontFamily: t.headingFontFamily, color: theme.primaryColor, marginBottom: 20, textAlign: 'center', width: '100%' }}>{settings.title}</Text>
                            <View style={{ width: 100, height: 2, backgroundColor: theme.secondaryColor, marginBottom: 20 }} />
                            <Text style={{ fontSize: 24, fontFamily: t.bodyFontFamily, color: theme.secondaryColor }}>{settings.moduleName}</Text>
                            <Text style={{ fontSize: 14, marginTop: 40, color: theme.textColor }}>ADVENTURE LOG</Text>
                        </View>
                    </View>
                </Page>
            );
        }

        // 2. COC (Top Secret File)
        if (settings.theme === 'coc') {
             return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                        <RenderDecorations />
                        <View style={{ position: 'absolute', top: 60, right: 60, transform: 'rotate(-15deg)', borderWidth: 4, borderColor: '#d00', padding: 10 }}>
                            <Text style={{ color: '#d00', fontSize: 24, fontWeight: 'bold' }}>TOP SECRET</Text>
                        </View>
                        <View style={{ flex: 1, padding: 60, justifyContent: 'center' }}>
                            <Text style={{ fontSize: 16, color: theme.secondaryColor, marginBottom: 10 }}>CASE FILE NO. {Math.floor(Math.random() * 10000)}</Text>
                            <View style={{ borderBottomWidth: 2, borderBottomColor: theme.primaryColor, marginBottom: 40 }} />
                            <Text style={{ fontSize: 48, fontFamily: t.headingFontFamily, color: theme.textColor, marginBottom: 20 }}>{settings.title}</Text>
                            <Text style={{ fontSize: 24, color: theme.primaryColor }}>MODULE: {settings.moduleName}</Text>
                            <View style={{ marginTop: 100, padding: 20, backgroundColor: '#222' }}>
                                <Text style={{ color: '#fff', fontSize: 12 }}>AUTHORIZED EYES ONLY</Text>
                            </View>
                        </View>
                    </View>
                </Page>
            );
        }

        // 3. Cyberpunk (Glitch/Neon)
        if (settings.theme === 'cyberpunk') {
             return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                        <RenderDecorations />
                        <View style={{ flex: 1, justifyContent: 'center', alignItems: 'flex-end', paddingRight: 40 }}>
                            <Text style={{ fontSize: 72, fontFamily: t.headingFontFamily, color: theme.secondaryColor, position: 'absolute', top: 250, right: 38, opacity: 0.7 }}>{settings.title}</Text>
                            <Text style={{ fontSize: 72, fontFamily: t.headingFontFamily, color: theme.primaryColor, marginBottom: 10 }}>{settings.title}</Text>
                            <View style={{ backgroundColor: theme.primaryColor, padding: 5, marginBottom: 20 }}>
                                <Text style={{ color: '#000', fontSize: 24, fontFamily: t.headingFontFamily }}>{settings.moduleName}</Text>
                            </View>
                            <Text style={{ fontSize: 14, color: theme.textColor, letterSpacing: 4 }}>// SYSTEM.LOG.EXPORT</Text>
                        </View>
                    </View>
                </Page>
            );
        }

        // 4. Japanese (Vertical Elegant)
        if (settings.theme === 'japanese') {
            return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                        <RenderDecorations />
                        <View style={{ flex: 1, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                            <View style={{ borderRightWidth: 1, borderRightColor: theme.primaryColor, height: '80%', marginRight: 40 }} />
                            <View style={{ alignItems: 'center' }}>
                                <VerticalText text={settings.title} style={{ color: theme.primaryColor, marginBottom: 0 }} />
                            </View>
                             <View style={{ alignItems: 'center', marginLeft: 30, paddingTop: 100 }}>
                                <VerticalText text={settings.moduleName} style={{ fontSize: 24, color: theme.secondaryColor }} />
                            </View>
                        </View>
                        <Text style={{ position: 'absolute', bottom: 40, left: 0, right: 0, textAlign: 'center', color: theme.secondaryColor, fontSize: 12 }}>~ 物語 ~</Text>
                    </View>
                </Page>
            );
        }

        // 5. Ancient (Calligraphy Vertical)
        if (settings.theme === 'ancient') {
             return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                        <RenderDecorations />
                        <View style={{ flex: 1, flexDirection: 'row-reverse', padding: 60, alignItems: 'flex-start' }}>
                             <View style={{ borderLeftWidth: 2, borderLeftColor: theme.primaryColor, height: '100%', marginLeft: 30, paddingLeft: 10 }}>
                                 <VerticalText text={settings.title} style={{ fontSize: 40, color: theme.textColor, width: 60, fontFamily: t.headingFontFamily }} />
                             </View>
                             <View style={{ marginTop: 60 }}>
                                <VerticalText text={settings.moduleName} style={{ fontSize: 24, color: theme.secondaryColor, width: 40, fontFamily: t.headingFontFamily }} />
                             </View>
                             <View style={{ position: 'absolute', bottom: 60, left: 60, borderWidth: 2, borderColor: '#d00', padding: 5 }}>
                                <Text style={{ color: '#d00', fontSize: 16, fontFamily: t.headingFontFamily }}>卷宗</Text>
                             </View>
                        </View>
                    </View>
                </Page>
            );
        }

        // 6. Minimalist (Clean Big Bold)
        if (settings.theme === 'minimalist') {
             return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                        <View style={{ flex: 1, padding: 40, justifyContent: 'flex-end' }}>
                            <Text style={{ fontSize: 80, fontFamily: t.headingFontFamily, color: theme.primaryColor, lineHeight: 0.9 }}>{settings.title}</Text>
                            <Text style={{ fontSize: 30, color: theme.secondaryColor, marginTop: 20, fontWeight: 'light' }}>{settings.moduleName}</Text>
                        </View>
                    </View>
                </Page>
            );
        }

        // 7. Terminal (Code/Console)
        if (settings.theme === 'terminal') {
             return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                        <RenderDecorations />
                        <View style={{ flex: 1, padding: 40, justifyContent: 'center', fontFamily: 'Noto Sans Mono CJK SC' }}>
                            <Text style={{ color: theme.primaryColor, fontSize: 14, marginBottom: 10 }}>&gt; INITIALIZING STORY PROTOCOL...</Text>
                            <Text style={{ color: theme.primaryColor, fontSize: 14, marginBottom: 40 }}>&gt; LOADING ASSETS...</Text>
                            <View style={{ border: `1px dashed ${theme.primaryColor}`, padding: 20 }}>
                                <Text style={{ fontSize: 40, color: theme.primaryColor, textAlign: 'center' }}>{settings.title}</Text>
                            </View>
                            <Text style={{ color: theme.secondaryColor, fontSize: 20, textAlign: 'center', marginTop: 20 }}>{`[ ${settings.moduleName} ]`}</Text>
                            <Text style={{ position: 'absolute', bottom: 40, left: 40, color: theme.primaryColor, fontSize: 12 }}>_CURSOR_BLINK_</Text>
                        </View>
                    </View>
                </Page>
            );
        }

        // 8. Script (Typewriter Center)
        if (settings.theme === 'script') {
             return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                         <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                            <Text style={{ fontSize: 48, fontFamily: 'Noto Sans Mono CJK SC', textDecoration: 'underline', marginBottom: 30 }}>{settings.title}</Text>
                            <Text style={{ fontSize: 20, fontFamily: 'Noto Sans Mono CJK SC', color: '#444' }}>Written by Story Painter</Text>
                            <Text style={{ fontSize: 24, fontFamily: 'Noto Sans Mono CJK SC', marginTop: 60 }}>"{settings.moduleName}"</Text>
                        </View>
                    </View>
                </Page>
            );
        }

        // 9. Office (Report)
        if (settings.theme === 'office') {
             return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                        <View style={{ flex: 1, padding: 50 }}>
                            <View style={{ borderBottomWidth: 4, borderBottomColor: theme.primaryColor, marginBottom: 40 }} />
                            <Text style={{ fontSize: 50, fontFamily: t.headingFontFamily, color: theme.primaryColor, fontWeight: 'bold' }}>{settings.title}</Text>
                            <Text style={{ fontSize: 28, color: theme.secondaryColor, marginTop: 10 }}>{settings.moduleName}</Text>
                            <View style={{ position: 'absolute', bottom: 50, left: 50 }}>
                                <Text style={{ fontSize: 12, color: '#888' }}>CONFIDENTIAL REPORT</Text>
                                <Text style={{ fontSize: 12, color: '#888' }}>{new Date().toLocaleDateString()}</Text>
                            </View>
                        </View>
                    </View>
                </Page>
            );
        }

        // 10. Magazine (Bold Block)
        if (settings.theme === 'magazine') {
             return (
                <Page size={settings.pageSize} style={styles.page}>
                    {bg}
                    <View style={styles.borderContainer} wrap={false}>
                        <RenderDecorations />
                        <View style={{ flex: 1 }}>
                            <View style={{ backgroundColor: theme.primaryColor, height: 200, justifyContent: 'center', padding: 20, marginTop: 100 }}>
                                <Text style={{ fontSize: 60, color: '#fff', textAlign: 'center', fontWeight: 'bold' }}>{settings.title}</Text>
                            </View>
                            <Text style={{ fontSize: 30, color: theme.secondaryColor, textAlign: 'center', marginTop: 30, fontWeight: 'bold', textTransform: 'uppercase' }}>{settings.moduleName}</Text>
                        </View>
                    </View>
                </Page>
            );
        }

        // Default fallback
        return (
            <Page size={settings.pageSize} style={styles.page}>
                {bg}
                <View style={styles.borderContainer} wrap={false}>
                    <RenderDecorations />
                    <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center' }}>
                        <Text style={styles.coverTitle}>{settings.title}</Text>
                        <Text style={styles.coverSubtitle}>{settings.moduleName}</Text>
                        <View style={{ marginTop: 24, alignItems: 'center' }}>
                            <View style={{ width: 56, height: 56, borderRadius: 28, backgroundColor: theme.primaryColor, opacity: 0.18 }} />
                        </View>
                    </View>
                </View>
            </Page>
        );
    };

    const sceneBreaks = React.useMemo(() => {
        const text = settings.sceneBreaks || '';
        const breaks: { title: string, content: string, index: number }[] = [];
        if (!text) return breaks;

        const lines = text.split('\n');
        let currentBreak: any = null;

        lines.forEach(line => {
            const trimmed = line.trim();
            if (trimmed.startsWith('#')) {
                if (currentBreak) breaks.push(currentBreak);
                const title = trimmed.replace(/^#+\s*/, '');
                currentBreak = { title, content: '', index: 0 };
            } else if (trimmed.startsWith('@Index:')) {
                 if (currentBreak) {
                     const idx = parseInt(trimmed.split(':')[1].trim());
                     if (!isNaN(idx)) currentBreak.index = idx;
                 }
            } else if (trimmed.startsWith('@Log:')) {
                 // Future support
            } else {
                if (currentBreak) {
                    currentBreak.content += line + '\n';
                }
            }
        });
        if (currentBreak) breaks.push(currentBreak);
        return breaks.sort((a, b) => a.index - b.index);
    }, [settings.sceneBreaks]);

    const RenderTOC = () => {
        if (sceneBreaks.length === 0) return null;
        
        return (
            <Page size={settings.pageSize} style={styles.page}>
                 {!!t.backgroundImage && (
                    <Image src={t.backgroundImage} style={styles.fixedBg} fixed />
                )}
                <View style={styles.borderContainer}>
                    <RenderDecorations />
                    <Text style={styles.sectionTitle}>目录</Text>
                    <View style={{ marginTop: 20 }}>
                        {sceneBreaks.map((sb, i) => (
                            <View key={i} style={{ flexDirection: 'row', marginBottom: 15, borderBottomWidth: 1, borderBottomColor: '#eee', paddingBottom: 5 }}>
                                <Text style={{ flex: 1, fontSize: 16, fontFamily: t.headingFontFamily, color: theme.primaryColor }}>{sb.title}</Text>
                            </View>
                        ))}
                    </View>
                </View>
            </Page>
        );
    };

    const RenderInterlude = ({ title, content }: { title: string, content: string }) => (
        <Page size={settings.pageSize} style={styles.page}>
             {!!t.backgroundImage && (
                <Image src={t.backgroundImage} style={styles.fixedBg} fixed />
            )}
            <View style={styles.borderContainer}>
                <RenderDecorations />
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 40 }}>
                     <Text style={{ fontSize: 32, fontFamily: t.headingFontFamily, color: theme.primaryColor, marginBottom: 20, textAlign: 'center' }}>
                        {title}
                     </Text>
                     <View style={{ width: 60, height: 4, backgroundColor: theme.secondaryColor, marginBottom: 30 }} />
                     <Text style={{ fontSize: 14, lineHeight: 1.8, textAlign: 'center' }}>
                        {content}
                     </Text>
                </View>
            </View>
        </Page>
    );

    const estimateMaxCharsPerLine = (isObItem: boolean) => {
        // Base characters for full width (A4)
        // Reduced to 36 for extra safety as requested ("leave a little gap")
        // A4 ~36 chars, B5 ~32 chars
        const fullWidthChars = settings.pageSize === 'A4' ? 36 : 32;
        
        if (!settings.showOb) {
            return fullWidthChars;
        }

        if (isObItem) {
            // OB column is 25% width with padding. 
            // Calculated approx 8 chars max for A4 to be safe.
            return settings.pageSize === 'A4' ? 5 : 4;
        } else {
            // Main column is 75% width with padding.
            // Calculated approx 26 chars.
            return settings.pageSize === 'A4' ? 25 : 22;
        }
    };

    const injectBreaks = (text: string, maxChars: number) => {
        if (!text) return '';
        const lines = text.split(/\r\n|\r|\n/);
        return lines.map(line => {
            if (line.length <= maxChars) return line;
            const chunks = [];
            let remaining = line;
            while (remaining.length > 0) {
                chunks.push(remaining.slice(0, maxChars));
                remaining = remaining.slice(maxChars);
            }
            return chunks.join('\n');
        }).join('\n');
    };

    const fitMessage = (message: string, isObItem: boolean) => {
        const maxChars = estimateMaxCharsPerLine(isObItem);
        const baseFont = 12;
        // Limit max visual lines per block to ensure it fits on a page.
        // A4 page capacity ~630pt. Line height ~17pt. Max lines ~37.
        // Use 25 to be safer and avoid VIEW wrapping issues
        const maxLinesPerBlock = 25; 
        
        // Step 1: Force hard wraps to ensure horizontal safety and deterministic height
        const safeMessage = injectBreaks(message, maxChars);
        const safeLines = safeMessage.split('\n');

        // Step 2: Group lines into page-compatible chunks
        const chunks: string[] = [];
        let currentChunkLines: string[] = [];
        
        for (const line of safeLines) {
            // Check if adding this line would exceed the limit
            if (currentChunkLines.length >= maxLinesPerBlock) {
                chunks.push(currentChunkLines.join('\n'));
                currentChunkLines = [];
            }
            currentChunkLines.push(line);
        }
        
        if (currentChunkLines.length > 0) {
            chunks.push(currentChunkLines.join('\n'));
        }

        return { fontSize: baseFont, chunks };
    };

    const estimateRowHeight = (chunk: string, fontSize: number, isDice: boolean) => {
        if (!chunk) return 0; // Guard against empty chunks
        // chunk already has hard breaks injected, so we can just count newlines
        const lineCount = chunk.split('\n').length;
        
        const unit = isDice ? 10 : fontSize;
        const content = lineCount * unit * 1.4;
        
        // base height should match minHeight in styles (48)
        const base = 48;
        // padding inside block (8+8=16) + border(2) = 18. Let's use 20 to be safe.
        const padding = 20;
        // +12 is for marginBottom
        return Math.max(base, content + padding) + 12;
    };

    // Pre-calculate page capacity
    const pageCapacity = React.useMemo(() => {
        return settings.pageSize === 'A4' ? 600 : 550; // Slightly reduced for safety
    }, [settings.pageSize]);

    const defaultExportOptions = {
        commandHide: false,
        imageHide: true,
        offTopicHide: false,
        timeHide: true,
        userIdHide: true,
        yearHide: true,
        textIndentAll: false,
        textIndentFirst: true,
        expandForward: false,
        filterCqForward: false,
        filterCqImage: false,
        filterCqAt: false,
        filterCqReply: false,
        filterCqJson: false,
    } as any;

    // Memoize formatMessage to avoid re-running on every render if inputs haven't changed
    // However, formatMessage depends on settings and log content.
    // We can just keep it as a function but optimize inside.
    const formatMessage = (log: LogItem) => {
        const options = (typeof window !== 'undefined' && (window as any).pdfExportOptions) || defaultExportOptions;
        const withImage = { ...options, imageHide: true };
        // Remove escapeHTML to fix double escaping issue in PDF
        let msg = msgImageFormat(String(log.message || ''), withImage, false);
        msg = msgAtFormat(msg, (settings.characters as any) || [], options);
        msg = msgOffTopicFormat(msg, options, !!log.isDice);
        msg = msgCommandFormat(msg, options);
        msg = msgIMUseridFormat(msg, options, !!log.isDice);
        msg = msgOffTopicFormat(msg, options, !!log.isDice);
        return msg.replaceAll('<br />', '\n').replaceAll('<br/>', '\n').replaceAll('<br>', '\n');
    };

    const renderAvatar = (name: string) => {
        if (!settings.showAvatarInLog) return null;
        
        const char = getCharacter(name);
        const color = char ? char.color : theme.primaryColor;
        const initial = name ? name.substring(0, 1).toUpperCase() : '?';

        if (char && char.avatar) {
            return <Image src={char.avatar} style={styles.avatar} />;
        }

        return (
            <View style={[styles.avatarPlaceholder, { backgroundColor: color }]}>
                <Text style={styles.avatarPlaceholderText}>{initial}</Text>
            </View>
        );
    };

    return (
        <Document>
            {/* Cover */}
            <RenderCover />

            {/* TOC */}
            <RenderTOC />

            {/* Module Background (Intro) */}
            <Page size={settings.pageSize} style={styles.page}>
                { t.backgroundImage && (
                    <Image src={t.backgroundImage} style={styles.fixedBg} fixed />
                ) }
                <View style={styles.borderContainer} wrap={false}>
                    <RenderDecorations />
                    <View style={{ height: 6, backgroundColor: t.introAccent || theme.primaryColor, borderRadius: 3, marginBottom: 12 }} />
                    <Text style={styles.sectionTitle}>简介</Text>
                    <Text style={{ lineHeight: 1.6, fontSize: 13 }}>
                        {settings.intro}
                    </Text>
                </View>
            </Page>

            {/* Character Pages - Only for Players */}
            {settings.characters.filter(c => c.roleType === 'player').map((char, index) => (
                <Page key={`char-${index}`} size={settings.pageSize} style={styles.page} wrap>
                     <View style={styles.charPageContainer}>
                        <RenderDecorations fixed />
                        <RenderCharacterCard char={char} />
                     </View>
                </Page>
            ))}

            {/* Log Pages & Interludes */}
            {(() => {
                // Use useMemo for heavy calculations if possible, but inside Render this might be tricky.
                // Since this is a render function called by PDFViewer, it runs every time.
                // We should try to optimize the loops.
                
                const allRows: any[] = [];
                // Pre-process all logs at once
                for (let i = 0; i < data.length; i++) {
                    const log = data[i];
                    // Skip invalid logs early
                    if (!log.message || !log.message.trim()) continue;

                    const char = getCharacter(log.nickname);
                    const roleType = char ? char.roleType : undefined;
                    const isOb = !!(log.isOther || roleType === 'ob');
                    
                    if (!char && !isOb) continue;
                    
                    const isDice = !!(log.isDice || roleType === 'dice');
                    const processed = formatMessage(log);
                    
                    if (!processed || !processed.trim()) continue;
                    
                    const fit = fitMessage(processed, isOb);
                    
                    for (let idx = 0; idx < fit.chunks.length; idx++) {
                        allRows.push({ 
                            type: 'row', 
                            logIndex: i, 
                            data: { 
                                key: `r-${i}-${idx}`, 
                                isOb, 
                                isDice, 
                                chunk: fit.chunks[idx], 
                                fontSize: fit.fontSize, 
                                name: log.nickname 
                            } 
                        });
                    }
                }

                const finalPages: any[] = [];
                let currentPageRows: any[] = [];
                let currentUsedHeight = 0;
                let currentBreakPtr = 0;
                
                const pushCurrentPage = () => {
                    if (currentPageRows.length > 0) {
                        finalPages.push({ type: 'log-page', rows: currentPageRows });
                        currentPageRows = [];
                        currentUsedHeight = 0;
                    }
                };

                let lastLogIndex = -1;
                
                for (let i = 0; i < allRows.length; i++) {
                    const row = allRows[i];
                    const idx = row.logIndex;
                    
                    if (idx !== lastLogIndex) {
                        while (currentBreakPtr < sceneBreaks.length && sceneBreaks[currentBreakPtr].index <= idx) {
                            pushCurrentPage();
                            finalPages.push({ type: 'interlude-page', data: sceneBreaks[currentBreakPtr] });
                            currentBreakPtr++;
                        }
                        lastLogIndex = idx;
                    }
                    
                    const h = estimateRowHeight(row.data.chunk, row.data.fontSize, row.data.isDice);
                    // Strict page break check to avoid VIEW wrapping error
                    if (currentUsedHeight + h > pageCapacity) {
                        pushCurrentPage();
                    }
                    currentPageRows.push(row.data);
                    currentUsedHeight += h;
                }
                
                pushCurrentPage();
                
                 while (currentBreakPtr < sceneBreaks.length) {
                    finalPages.push({ type: 'interlude-page', data: sceneBreaks[currentBreakPtr] });
                    currentBreakPtr++;
                }
                
                return finalPages.map((page, pageIndex) => {
                    if (page.type === 'interlude-page') {
                        return <RenderInterlude key={`p-${pageIndex}`} title={page.data.title} content={page.data.content} />;
                    }
                    
                    const pageRows = page.rows;
                    if (!pageRows || pageRows.length === 0) return null;

                    return (
                        <Page key={`log-page-${pageIndex}`} size={settings.pageSize} style={styles.page} wrap={false}>
                        <View style={styles.borderContainer}>
                            <RenderDecorations />
                            <Text style={styles.sectionTitle}>冒险记录</Text>
                            <View style={styles.logTwoCol}>
                                {pageRows.map((r: any) => {
                                    if (!r.chunk) return null; // Skip empty chunks to avoid Invalid string child error

                                    const themeBlockLeft = {
                                        backgroundColor: (theme as any).messageBlock?.bg,
                                        borderWidth: 1,
                                        borderStyle: 'solid' as const,
                                        borderColor: (theme as any).messageBlock?.border || '#ddd',
                                        borderRadius: getRadius((theme as any).messageBlock?.borderRadius, 4)
                                    };
                                    const themeBlockRight = {
                                        backgroundColor: (theme as any).messageObBlock?.bg || '#f7f7f7',
                                        borderWidth: 1,
                                        borderStyle: 'solid' as const,
                                        borderColor: (theme as any).messageObBlock?.border || '#ddd',
                                        borderRadius: getRadius((theme as any).messageObBlock?.borderRadius, 4)
                                    };
                                    return (
                                        <View key={r.key} style={styles.logRow} wrap={false}>
                                            <View style={styles.logColumnMain}>
                                                {!r.isOb && (
                                                    <View style={[styles.logBlock, themeBlockLeft]}>
                                                        {!r.isDice && renderAvatar(r.name)}
                                                        <View style={styles.logContent}>
                                                            <Text style={{ ...styles.logName, color: getCharColor(r.name) }}>{r.name || 'Unknown'}</Text>
                                                            {r.isDice ? (
                                                                <View style={styles.diceLog}>
                                                                    <Text>{r.chunk}</Text>
                                                                </View>
                                                            ) : (
                                                                <Text style={{ ...styles.logMessage, fontSize: r.fontSize }}>{r.chunk}</Text>
                                                            )}
                                                        </View>
                                                    </View>
                                                )}
                                            </View>
                                            {settings.showOb && (
                                                <View style={styles.logColumnOb}>
                                                    {r.isOb && (
                                                        <View style={[styles.logBlock, styles.logObBlock, themeBlockRight]}>
                                                            {!r.isDice && renderAvatar(r.name)}
                                                            <View style={styles.logContent}>
                                                                <Text style={{ ...styles.logName, color: getCharColor(r.name) }}>{r.name || 'Unknown'}</Text>
                                                                {r.isDice ? (
                                                                    <View style={styles.diceLog}>
                                                                        <Text>{r.chunk}</Text>
                                                                    </View>
                                                                ) : (
                                                                    <Text style={{ ...styles.logMessage, fontSize: r.fontSize, textAlign: 'right' }}>{r.chunk}</Text>
                                                                )}
                                                            </View>
                                                        </View>
                                                    )}
                                                </View>
                                            )}
                                        </View>
                                    );
                                })}
                            </View>
                        </View>
                    </Page>
                    );
                });
            })()}
        </Document>
    );
};
