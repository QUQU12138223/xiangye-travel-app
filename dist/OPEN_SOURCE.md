# 开源参考

向野在 `travel-plan/` 下保留了 [Travel-Plan-Page](https://github.com/do-tongxue/Travel-Plan-Page) 的浏览器端核心源码、地图模板、原始 MIT 许可证和第三方数据说明，并通过 `travel-plan/xiangye-bridge.js` 将向野当前行程转换给它。

原项目的路线图是模板示意，不是道路导航；向野同时提供 OpenStreetMap 地图和逐日打开地图导航的入口。工作台的 To Do、票务状态与多人账本目前使用浏览器本地存储，不是多人云同步。航班与自驾卡片只有填写了结构化预订资料才会启用；单纯的交通文字备注不会被当作航班或租车订单。真实交通、门票和酒店不会自动预订。

景点卡片使用本地托管的 Wikimedia Commons 缩略图。原图、作者及许可见 `photo-credits.html`。目的地封面的逐张来源见 `destination-cover-credits.html` 和 `destination-cover-sources.json`。图片不属于向野原创代码的 MIT 授权范围。
