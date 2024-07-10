import { Card, Divider, Button, Space } from 'antd'
import LogicFlow from '@logicflow/core'
import { useEffect, useRef } from 'react'
import { FlowPath } from '@logicflow/extension'

import './index.less'
import '@logicflow/core/es/index.css'
import '@logicflow/extension/es/index.css'

import data from './data'
import Uml from './uml'

const config: Partial<LogicFlow.Options> = {
  stopScrollGraph: true,
  stopZoomGraph: true,
  grid: {
    type: 'dot',
    size: 20,
  },
  plugins: [FlowPath],
}

interface Snapshot {
  data: LogicFlow.GraphConfigData
  width: number
  height: number
}

export default function HighLightExtension() {
  const containerRef = useRef<HTMLDivElement | null>(null)
  const imgRef = useRef<HTMLImageElement | null>(null)

  let lf: LogicFlow
  useEffect(() => {
    lf = new LogicFlow({
      container: containerRef.current!,
      ...config,
    })

    lf.register(Uml)

    lf.render(data)
    lf.translateCenter()
  }, [])

  const downLoad = () => {
    lf.getSnapshot()
  }

  const preview = () => {
    lf.getSnapshotBlob('#FFFFFF').then(({ data, width, height }: Snapshot) => {
      // imgRef.current && imgRef.current.src = window.URL.createObjectURL(data);
      console.log(width, height, data)
    })
  }

  const logBase64 = () => {
    lf.getSnapshotBase64().then(({ data, width, height }: Snapshot) => {
      // document.getElementById('img').src = data
      console.log(width, height, data)
    })
  }

  const downloadXml = () => {
    const data = lf.getGraphData()
    console.log(lfJson2Xml(data))
    download('logicflow.xml', lfJson2Xml(data))

    function download(filename, text) {
      const element = document.createElement('a')
      element.setAttribute(
        'href',
        'data:text/plain;charset=utf-8,' + encodeURIComponent(text),
      )
      element.setAttribute('download', filename)

      element.style.display = 'none'
      document.body.appendChild(element)

      element.click()

      document.body.removeChild(element)
    }
  }

  return (
    <Card title="LogicFlow Extension - Snapshot">
      <Space>
        <Button id="download" onClick={downLoad}>
          下载快照
        </Button>
        <Button id="preview" onClick={preview}>
          预览
        </Button>
        <Button id="base64" onClick={logBase64}>
          打印base64
        </Button>
        <Button id="downloadXml" onClick={downloadXml}>
          获取xml
        </Button>
      </Space>
      <Divider />
      <div ref={containerRef} id="graph"></div>
      <img id="img" ref={imgRef} />
    </Card>
  )
}
