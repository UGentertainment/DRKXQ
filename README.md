# 冬日狂想曲 Web 移植版

本目录是 RPG Maker MV 游戏的静态网页部署包，目标地址：

`https://ugentertainment.github.io/DRKXQ/`

## 本地测试

必须通过 HTTP 访问，不能直接双击 `index.html`：

```powershell
python -m http.server 8792 --bind 127.0.0.1
```

然后打开 `http://127.0.0.1:8792/`。

## 生成文件

更换根目录汉化文件后，重新生成浏览器翻译表：

```powershell
node tools/build-translation-map.js "汉化目录/翻译文件.json"
```

增加、删除或改名图片和音频后，重新生成大小写清单：

```powershell
node tools/generate-asset-case-map.js
```

## 网页兼容层

- `drkxq:rmmv:v1:*`：独立的 KV 存档命名空间。
- 根目录 DLL 汉化已改为浏览器文本层汉化，不依赖 `winmm.dll`。
- 手机触摸位置会同步到桌面指针坐标，技能树在手机端带可见返回按钮。
- 兼容 iframe 的 gamepad 权限限制、跨域画布取色及 Linux 资源大小写。
- 男主对话立绘由透明位图替换，原资源保留以维持事件和点击区域。
- 页面始终按 iframe 或全屏尺寸缩放。
- 调试、录屏和截图插件在网页版中关闭。

GitHub Pages 由 `.github/workflows/pages.yml` 的自定义工作流发布。
