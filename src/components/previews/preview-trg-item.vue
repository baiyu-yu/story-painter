<template>
  <div v-if="shouldRender">
    <div :style="source.isDice ? 'margin-top: 16px; margin-bottom: 16px' : ''">
      <span :style="{ color: colorByName(source) }" v-if="source.isDice"># </span>
      <span :style="{ color: colorByName(source) }" class="_nickname">{{ nicknameSolve(source) }}</span>
      <span :style="{ color: colorByName(source) }" v-html="renderedMessage"></span>
      <div v-if="source.commandInfo" style="white-space: pre-wrap;">{{ trgCommandSolve(source) }}</div>
      <span v-if="store.trgIsAddVoiceMark && !source.isDice">{*}</span>
    </div>
  </div>
</template>

<script setup lang="ts">
import { computed } from 'vue';
import { LogItem, packNameId } from '~/logManager/types';
import { useStore } from '~/store';
import { escapeHTML, msgAtFormat, msgCommandFormat, msgImageFormat, msgIMUseridFormat, msgOffTopicFormat } from '~/utils';

const store = useStore();

const props = defineProps({
  source: {
    type: Object as () => LogItem,
    default: () => ({}),
  }
});

const colorByName = (i: LogItem) => {
  const info = store.pcMap.get(packNameId(i));
  return info?.color || '#fff';
};

const nicknameSolve = (i: LogItem) => {
  return `[${i.nickname}]:`;
};

const nameReplace = (msg: string) => {
  for (const i of store.pcList) {
    msg = msg.replaceAll(`<${i.name}>`, `${i.name}`);
  }
  return msg;
};

const normalizeTrgMessage = (i: LogItem) => {
  if (store.isHiddenLogItem(i)) return '';

  const options = { ...store.exportOptions, imageHide: true };
  let msg = msgImageFormat(escapeHTML(i.message), options, true);
  msg = msgAtFormat(msg, store.pcList, store.exportOptions);
  msg = msgOffTopicFormat(msg, store.exportOptions, i.isDice);
  msg = msgCommandFormat(msg, store.exportOptions);
  msg = msgIMUseridFormat(msg, store.exportOptions, i.isDice);
  msg = msgOffTopicFormat(msg, store.exportOptions, i.isDice);

  if (i.isDice) {
    msg = nameReplace(msg);
  }

  return msg
    .trim()
    .replaceAll('"', '')
    .replaceAll('\\', '')
    .replaceAll('<br />', '\n')
    .replaceAll('<br/>', '\n')
    .replaceAll('<br>', '\n');
};

const renderedMessage = computed(() => {
  const i = props.source as LogItem;
  const msg = normalizeTrgMessage(i);
  if (!msg) return '';

  const extra = i.isDice ? '# ' : '';
  const prefix = store.trgIsAddVoiceMark ? '{*}' : '';
  return msg.replaceAll('\n', prefix + '<br /><span class="lf">\n</span>' + extra + nicknameSolve(i));
});

const shouldRender = computed(() => {
  const i = props.source as LogItem;
  return Boolean(renderedMessage.value.trim() || i.commandInfo);
});

const readDiceNum = (expr: string, defaultVal = 100) => {
  let diceNum = defaultVal;
  const m = /[dD](\d+)/.exec(expr);
  if (m) {
    diceNum = parseInt(m[1]);
  }
  return diceNum;
};

const trgCommandSolve = (item: LogItem) => {
  if (item.commandInfo) {
    const ci = item.commandInfo;
    if (ci.rule === 'coc7') {
      switch (ci.cmd) {
        case 'ra': {
          const items = [];
          for (const i of ci.items) {
            const diceNum = readDiceNum(i.expr1);
            if (i.version == 101) {
              items.push(`(${ci.pcName}鐨?{i.expr2},${diceNum},${i.checkVal},${i.outcome })`);
            } else {
              items.push(`(${ci.pcName}鐨?{i.expr2},${diceNum},${i.attrVal},${i.checkVal})`);
            }
          }
          return `<dice>:${items.join(',')}`;
        }
        case 'st': {
          const items = [];
          for (const i of ci.items) {
            if (i.attr == 'hp') {
              const maxNow = Math.max(i.valOld, i.valNew);
              items.push(`<hitpoint>:(${ci.pcName},${maxNow},${i.valOld},${i.valNew})`);
            }
          }
          const tip = '# 璇锋敞鎰忥紝褰撳墠鐗堟湰闇€瑕佹墜鍔ㄨ皟鏁翠笅鏂规渶澶х敓鍛藉€?绗簩椤?\n';
          return tip + `${items.join('\n')}`;
        }
        case 'sc': {
          const items = [];
          for (const i of ci.items) {
            const diceNum = readDiceNum(i.exprs[0]);
            items.push(`(${ci.pcName}鐨?{i.exprs[0]},${diceNum},${i.sanOld},${i.outcome ?? i.checkVal})`);
          }
          return `<dice>:${items.join(',')}`;
        }
      }
    }
    if (ci.rule === 'dnd5e') {
      switch (ci.cmd) {
        case 'st': {
          const items = [];
          let hasHp = false;
          for (const i of ci.items || []) {
            if (i.attr == 'hp') {
              const maxNow = Math.max(i.valOld, i.valNew);
              items.push(`<hitpoint>:(${ci.pcName},${maxNow},${i.valOld},${i.valNew})`);
              hasHp = true;
            }
          }
          let tip = '';
          if (hasHp) {
            tip = '# 璇锋敞鎰忥紝褰撳墠鐗堟湰闇€瑕佹墜鍔ㄨ皟鏁翠笅鏂规渶澶х敓鍛藉€?绗簩椤?\n';
          }
          return tip + `${items.join('\n')}`;
        }
        case 'rc': {
          const items = [];
          let tip = '';
          for (const i of ci.items) {
            const diceNum = readDiceNum(i.expr, 20);
            items.push(`(${ci.pcName}鐨?{i.reason}妫€瀹?${diceNum},NA,${i.result})`);
            tip = '# 璇锋敞鎰忥紝DND鐨勬渶澶ч潰鏁板彲鑳戒负 D20+鍚勭鍔犲€硷紝闇€瑕佹墜鍔ㄤ簩娆¤皟鏁碶n';
          }
          return tip + `<dice>:${items.join(',')}`;
        }
      }
    }

    switch (ci.cmd) {
      case 'roll': {
        const items = [];
        for (const i of ci.items) {
          const diceNum = readDiceNum(i.expr);
          items.push(`(${ci.pcName}鐨?{i.expr},${diceNum},NA,${i.result})`);
        }
        return `<dice>:${items.join(',')}`;
      }
    }
    return ci;
  }
};
</script>
