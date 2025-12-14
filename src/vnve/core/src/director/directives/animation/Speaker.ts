import * as PIXI from "pixi.js";
import { AnimationDirective, AnimationDirectiveOptions } from "../base";
import { Show } from "./Show";
import { FadeIn } from "./FadeIn";
import { BlackMaskFilter, Filter, Sprite } from "../../../scene";
import { merge } from "lodash-es";
import gsap from "gsap";

const AUTO_MASK_FILTER_NAME = "AutoMaskFilter";
const InAnimationDirectiveClassMap = {
  Show,
  FadeIn,
};
export interface AutoShowSpeakerOptions extends AnimationDirectiveOptions {
  inEffect?: "Show" | "FadeIn";
}

export interface AutoMaskOtherSpeakersOptions {
  alpha?: number;
}

export interface SpeakerDirectiveOptions extends AnimationDirectiveOptions {
  /**
   * 发言角色展示名称
   */
  name: string;
  /**
   * 发言角色立绘的targetName
   */
  speakerTargetName?: string;
  /**
   * 对话框的targetName，用于骰子角色特殊样式
   */
  dialogTargetName?: string;
  autoShowSpeaker?: Omit<AutoShowSpeakerOptions, "targetName">;
  autoMaskOtherSpeakers?: AutoMaskOtherSpeakersOptions;
  isDice?: boolean;
}

export class Speaker extends AnimationDirective<PIXI.Text> {
  protected declare options: SpeakerDirectiveOptions;
  protected speakerTarget?: PIXI.DisplayObject | null;

  constructor(options: SpeakerDirectiveOptions, stage: PIXI.Container) {
    super(options, stage);
    this.options = merge(
      {
        autoShowSpeaker: {
          inEffect: "Show",
        },
        autoMaskOtherSpeakers: {
          alpha: 0.5,
        },
      },
      options,
    );
    const { speakerTargetName } = this.options;

    if (speakerTargetName) {
      this.speakerTarget = this.stage.getChildByName(speakerTargetName);
    }
  }

  public execute() {
    const { name, autoShowSpeaker, autoMaskOtherSpeakers, executeTime, isDice } =
      this.options;

    // Remove existing dice icon if any
    const existingDiceIcon = this.stage.getChildByName("diceIcon");
    if (existingDiceIcon) {
      gsap.killTweensOf(existingDiceIcon);
      this.stage.removeChild(existingDiceIcon);
      existingDiceIcon.destroy();
    }

    if (this.target) {
      this.target.visible = true;
      this.target.text = name;

      if (isDice) {
        // 骰子角色特殊样式：角色名变为金色
        this.target.style.fill = 0xffd700; // 金色

        // 绘制简易二十面骰图标
        const diceIcon = new PIXI.Graphics();
        diceIcon.name = "diceIcon";
        
        // D20 参数
        const radius = 20;
        const innerRadius = 8;
        // 外圈顶点角度 (Top at -90)
        const angles = [-90, -30, 30, 90, 150, 210].map(a => a * Math.PI / 180);
        
        // 计算顶点坐标
        const outer = angles.map(a => ({x: radius * Math.cos(a), y: radius * Math.sin(a)}));
        // 内圈顶点对应外圈的 indices [1, 3, 5] (-30, 90, 210)
        const innerIndices = [1, 3, 5];
        const inner = innerIndices.map(i => ({x: innerRadius * Math.cos(angles[i]), y: innerRadius * Math.sin(angles[i])}));

        // 填充背景
        diceIcon.beginFill(0xffd700);
        diceIcon.lineStyle(2, 0xffffff, 1);
        diceIcon.moveTo(outer[0].x, outer[0].y);
        for(let i=1; i<6; i++) diceIcon.lineTo(outer[i].x, outer[i].y);
        diceIcon.closePath();
        diceIcon.endFill();

        // 绘制内部线条
        diceIcon.lineStyle(2, 0xffffff, 1);
        
        // 1. 内部三角形
        diceIcon.moveTo(inner[0].x, inner[0].y);
        diceIcon.lineTo(inner[1].x, inner[1].y);
        diceIcon.lineTo(inner[2].x, inner[2].y);
        diceIcon.closePath();

        // 2. 连接内部顶点到外部顶点
        // inner[0] -> outer[0], outer[1], outer[2]
        diceIcon.moveTo(inner[0].x, inner[0].y); diceIcon.lineTo(outer[0].x, outer[0].y);
        diceIcon.moveTo(inner[0].x, inner[0].y); diceIcon.lineTo(outer[1].x, outer[1].y);
        diceIcon.moveTo(inner[0].x, inner[0].y); diceIcon.lineTo(outer[2].x, outer[2].y);

        // inner[1] -> outer[2], outer[3], outer[4]
        diceIcon.moveTo(inner[1].x, inner[1].y); diceIcon.lineTo(outer[2].x, outer[2].y);
        diceIcon.moveTo(inner[1].x, inner[1].y); diceIcon.lineTo(outer[3].x, outer[3].y);
        diceIcon.moveTo(inner[1].x, inner[1].y); diceIcon.lineTo(outer[4].x, outer[4].y);

        // inner[2] -> outer[4], outer[5], outer[0]
        diceIcon.moveTo(inner[2].x, inner[2].y); diceIcon.lineTo(outer[4].x, outer[4].y);
        diceIcon.moveTo(inner[2].x, inner[2].y); diceIcon.lineTo(outer[5].x, outer[5].y);
        diceIcon.moveTo(inner[2].x, inner[2].y); diceIcon.lineTo(outer[0].x, outer[0].y);

        // 添加数字 "20"
        const textStyle = new PIXI.TextStyle({
          fontSize: 14,
          fill: 0xffffff,
          fontWeight: "bold",
        });
        const numberText = new PIXI.Text("20", textStyle);
        numberText.anchor.set(0.5);
        numberText.y = 1; // 微调垂直位置
        diceIcon.addChild(numberText);

        // 设置位置
        diceIcon.x = this.target.x + this.target.width + 35;
        diceIcon.y = this.target.y + this.target.height / 2;
        diceIcon.zIndex = 999;
        
        this.stage.addChild(diceIcon);

        // 骰子图标动画效果
        // 旋转入场动画
        gsap.fromTo(diceIcon,
          { rotation: -Math.PI / 4, alpha: 0, pixi: { scaleX: 0.5, scaleY: 0.5 } },
          { rotation: 0, alpha: 1, pixi: { scaleX: 1, scaleY: 1 }, duration: 0.5, ease: "back.out(1.7)" }
        );
        
        // 持续的悬浮动画
        gsap.to(diceIcon, {
          y: diceIcon.y - 5,
          duration: 1.5,
          yoyo: true,
          repeat: -1,
          ease: "sine.inOut"
        });
      } else {
        // 非骰子角色恢复默认白色
        this.target.style.fill = 0xffffff;
      }
    }

    // 如果已经展示，则无需重复执行入场动画
    if (autoShowSpeaker && this.speakerTarget && !this.speakerTarget.visible) {
      const { inEffect = "Show" } = autoShowSpeaker;
      const InDirectiveClass = InAnimationDirectiveClassMap[inEffect];

      new InDirectiveClass(
        {
          ...autoShowSpeaker,
          executeTime,
          targetName: this.speakerTarget.name!,
        },
        this.stage,
      ).execute();
    }

    // 自动对其他角色进行遮罩
    // 1. 假如Speaker存在遮罩，去除Speaker的遮罩
    // 2. 假如其他元素没有遮罩，自动加上遮罩
    if (autoMaskOtherSpeakers) {
      const { alpha = 0.5 } = autoMaskOtherSpeakers;

      if (this.speakerTarget && this.checkMaskFilter(this.speakerTarget)) {
        this.removeMaskFilter(this.speakerTarget);
      }

      this.stage.children.forEach((child) => {
        if (
          child !== this.speakerTarget &&
          (child as Sprite).assetType === "Character"
        ) {
          if (!this.checkMaskFilter(child)) {
            this.addMaskFilter(child, alpha);
          }
        }
      });
    }
  }

  private checkMaskFilter(target: PIXI.DisplayObject) {
    return target.filters?.some(
      (filter) => (filter as Filter).name === AUTO_MASK_FILTER_NAME,
    );
  }

  private removeMaskFilter(target: PIXI.DisplayObject) {
    target.filters =
      target.filters?.filter(
        (filter) => (filter as Filter).name !== AUTO_MASK_FILTER_NAME,
      ) || [];
  }

  private addMaskFilter(target: PIXI.DisplayObject, alpha: number) {
    const filter = new BlackMaskFilter();
    filter.name = AUTO_MASK_FILTER_NAME;
    filter.alpha = alpha;

    if (target.filters) {
      target.filters.push(filter);
    } else {
      target.filters = [filter];
    }
  }
}
