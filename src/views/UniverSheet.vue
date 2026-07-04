<template>
  <div class="sheet-container">
    <div class="sheet-header">
      <h1>UniverJS 表格</h1>
      <p class="subtitle">Vue 2 + UniverJS 0.25.0 在线电子表格</p>
    </div>
    <div ref="univerContainer" class="univer-wrapper"></div>
  </div>
</template>

<script>
import { createUniver, LocaleType } from '@univerjs/presets'
import { UniverSheetsCorePreset } from '@univerjs/preset-sheets-core'
import zhCN from '@univerjs/preset-sheets-core/lib/locales/zh-CN'

export default {
  name: 'UniverSheet',
  data() {
    return {
      univerAPI: null,
      univerInstance: null
    }
  },
  mounted() {
    this.$nextTick(() => {
      this.initUniver()
    })
  },
  beforeDestroy() {
    if (this.univerInstance) {
      this.univerInstance.dispose()
    }
  },
  methods: {
    initUniver() {
      const container = this.$refs.univerContainer

      const { univerAPI, univer } = createUniver({
        locale: LocaleType.ZH_CN,
        locales: {
          [LocaleType.ZH_CN]: zhCN
        },
        presets: [
          UniverSheetsCorePreset({
            container
          })
        ]
      })

      this.univerAPI = univerAPI
      this.univerInstance = univer

      this.addSampleData()
    },
    addSampleData() {
      if (!this.univerAPI) return

      const data = [
        ['产品名称', '单价', '数量', '总价'],
        ['笔记本电脑', 5999, 10, '=B2*C2'],
        ['无线鼠标', 89, 50, '=B3*C3'],
        ['机械键盘', 399, 20, '=B4*C4'],
        ['显示器', 1599, 15, '=B5*C5'],
        ['耳机', 299, 30, '=B6*C6'],
        ['', '', '', ''],
        ['合计', '', '', '=SUM(D2:D6)']
      ]

      const cellData = {}
      for (let r = 0; r < data.length; r++) {
        cellData[r] = {}
        for (let c = 0; c < data[r].length; c++) {
          const val = data[r][c]
          if (val !== '' && val != null) {
            cellData[r][c] = { v: val }
          }
        }
      }

      const rowData = {}
      for (let r = 0; r < data.length; r++) {
        rowData[r] = { h: 30 }
      }

      const columnData = {}
      for (let c = 0; c < data[0].length; c++) {
        columnData[c] = { w: 120 }
      }

      this.univerAPI.createWorkbook({
        name: '产品销售表',
        sheetOrder: ['sheet1'],
        sheets: {
          sheet1: {
            id: 'sheet1',
            name: 'Sheet1',
            rowCount: 100,
            columnCount: 26,
            cellData,
            rowData,
            columnData
          }
        }
      })
    }
  }
}
</script>

<style scoped>
.sheet-container {
  width: 100%;
  height: 100vh;
  display: flex;
  flex-direction: column;
  background-color: #f5f7fa;
}

.sheet-header {
  padding: 20px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
}

.sheet-header h1 {
  margin: 0;
  font-size: 24px;
  font-weight: 600;
}

.subtitle {
  margin: 8px 0 0 0;
  font-size: 14px;
  opacity: 0.9;
}

.univer-wrapper {
  flex: 1;
  width: calc(100% - 40px);
  height: calc(100vh - 120px);
  min-height: 500px;
  margin: 20px;
  background: white;
  border-radius: 8px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
}
</style>
